import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AtsSheet } from '../components/ats/AtsSheet';
import { AtsSidebar } from '../components/ats/AtsSidebar';
import { AuditAndMatcherTab } from '../components/audit/AuditAndMatcherTab';
import { EditorSidebar } from '../components/editor/EditorSidebar';
import { PresetBar } from '../components/editor/PresetBar';
import { ConfirmModal } from '../components/layout/ConfirmModal';
import { TopNav, type WorkspaceTabId } from '../components/layout/TopNav';
import { useToast } from '../components/layout/ToastProvider';
import { PortfolioPreviewCanvas } from '../components/preview/PortfolioPreviewCanvas';
import {
  ExportBusinessCardModal,
  type ImportedBackupPayload,
} from '../components/share/ExportBusinessCardModal';
import { useAuth } from '../contexts/AuthContext';
import {
  buildPresetData,
  getAccentMeta,
  isDemoIdentity,
  PRESET_LIST,
  type EditorSectionId,
} from '../data/presets';
import {
  buildPlainTextAts,
  evaluateAtsReadiness,
  evaluateCvQualityAudit,
} from '../lib/atsEngine';
import { formatPhoneDisplay } from '../lib/supabase';
import {
  copyTextToClipboard,
  downloadJsonBackup,
  downloadStandaloneHtml,
} from '../lib/exportUtils';
import {
  clearVault,
  createDefaultVault,
  getActiveVersion,
  loadVault,
  markGuestDirty,
  migrateGuestVaultToUser,
  saveVault,
  updateActiveVersionData,
  VaultStorageError,
  type StorageBackend,
} from '../lib/localVault';
import {
  MAX_PROFILE_VERSIONS,
  type PortfolioData,
  type PresetId,
  type VaultState,
} from '../types/portfolio';

export const WorkspacePage: React.FC = () => {
  const { user, isGuest, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [vault, setVault] = useState<VaultState | null>(null);
  const [storageBackend, setStorageBackend] = useState<StorageBackend>('indexeddb');
  const [vaultReady, setVaultReady] = useState(false);
  const [saving, setSaving] = useState(false);

  const [activeTab, setActiveTab] = useState<WorkspaceTabId>('editor');
  const [activeEditorSection, setActiveEditorSection] =
    useState<EditorSectionId>('identity');
  const [mobileViewMode, setMobileViewMode] = useState<'editor' | 'preview'>('editor');

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);

  const saveTimerRef = useRef<number | null>(null);
  const pendingVaultRef = useRef<VaultState | null>(null);
  const currentUserId = user?.id ?? null;

  // Load isolated vault for active user (or guest), migrating guest draft on sign-in
  useEffect(() => {
    if (authLoading) return;
    if (!user && !isGuest) return;

    let cancelled = false;
    setVaultReady(false);

    (async () => {
      try {
        if (currentUserId) {
          const migration = await migrateGuestVaultToUser(currentUserId);
          if (!cancelled && migration.migrated) {
            showToast(
              migration.mode === 'moved'
                ? 'تم نقل مسودتك المحلية من وضع الضيف إلى حسابك تلقائياً'
                : 'تمت إضافة مسودة الضيف كنسخة إضافية داخل حسابك'
            );
          }
        }

        const loaded = await loadVault(currentUserId);
        if (cancelled) return;

        let nextVault = loaded.vault;

        // Auto-fill registered user's name and phone if user hasn't set custom identity yet
        if (user) {
          const activeVer = getActiveVersion(nextVault);
          if (isDemoIdentity(activeVer.data.profile)) {
            const authPhone = formatPhoneDisplay(
              user.phone || (user.user_metadata?.phone as string | undefined)
            );
            const metaName =
              (typeof user.user_metadata?.full_name === 'string' &&
                user.user_metadata.full_name.trim()) ||
              (typeof user.user_metadata?.name === 'string' &&
                user.user_metadata.name.trim()) ||
              '';

            if (authPhone || metaName) {
              const updatedData: PortfolioData = {
                ...activeVer.data,
                profile: {
                  ...activeVer.data.profile,
                  fullName: metaName || activeVer.data.profile.fullName,
                  phone: authPhone || activeVer.data.profile.phone,
                },
              };
              nextVault = updateActiveVersionData(nextVault, updatedData);
              await saveVault(currentUserId, nextVault);
            }
          }
        }

        if (!cancelled) {
          setVault(nextVault);
          setStorageBackend(loaded.backend);
          setVaultReady(true);
        }
      } catch (err) {
        if (!cancelled) {
          setVault(createDefaultVault('dev'));
          setVaultReady(true);
          showToast(
            err instanceof Error
              ? err.message
              : 'تعذّر قراءة البيانات المحلية — تم تحميل القالب الافتراضي',
            'amber'
          );
        }
      }
    })();

    return () => {
      cancelled = true;
      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
        if (pendingVaultRef.current) {
          void saveVault(currentUserId, pendingVaultRef.current);
          pendingVaultRef.current = null;
        }
      }
    };
  }, [authLoading, currentUserId, isGuest, user, showToast]);

  const activeVersion = useMemo(
    () => (vault ? getActiveVersion(vault) : null),
    [vault]
  );
  const activeData = activeVersion?.data ?? null;

  // Apply accent CSS variables dynamically
  useEffect(() => {
    if (!activeData) return;
    const meta = getAccentMeta(activeData.design.accent);
    document.documentElement.style.setProperty('--accent', meta.hex);
    document.documentElement.style.setProperty('--accent-soft', meta.soft);
  }, [activeData]);

  // Debounced auto-save (300ms) isolated to current userId (or guest)
  const schedulePersist = useCallback(
    (nextVault: VaultState) => {
      if (!currentUserId) {
        markGuestDirty();
      }
      pendingVaultRef.current = nextVault;
      setSaving(true);
      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current);
      }
      saveTimerRef.current = window.setTimeout(async () => {
        saveTimerRef.current = null;
        pendingVaultRef.current = null;
        try {
          const usedBackend = await saveVault(currentUserId, nextVault);
          setStorageBackend(usedBackend);
        } catch (err) {
          if (err instanceof VaultStorageError && err.code === 'QUOTA_EXCEEDED') {
            showToast(err.message, 'rose');
          } else {
            showToast(
              err instanceof Error ? err.message : 'تعذّر حفظ التعديلات محلياً',
              'amber'
            );
          }
        } finally {
          setSaving(false);
        }
      }, 300);
    },
    [currentUserId, showToast]
  );

  const commitVault = useCallback(
    (nextVault: VaultState) => {
      setVault(nextVault);
      schedulePersist(nextVault);
    },
    [schedulePersist]
  );

  const handleUpdateActiveData = useCallback(
    (updater: (prev: PortfolioData) => PortfolioData) => {
      setVault((prevVault) => {
        if (!prevVault) return prevVault;
        const currentVer = getActiveVersion(prevVault);
        const nextData = updater(currentVer.data);
        const nextVault = updateActiveVersionData(prevVault, nextData);
        schedulePersist(nextVault);
        return nextVault;
      });
    },
    [schedulePersist]
  );

  const handleSelectPreset = (presetId: PresetId) => {
    const presetLabel = PRESET_LIST.find((p) => p.id === presetId)?.label ?? '';
    handleUpdateActiveData(() => buildPresetData(presetId));
    showToast(`تم تحميل قالب «${presetLabel}» — يمكنك تعديل كل عنصر بحرية`);
  };

  const handleSelectVersion = (versionId: string) => {
    if (!vault || vault.activeVersionId === versionId) return;
    const target = vault.versions.find((v) => v.id === versionId);
    if (!target) return;
    commitVault({ ...vault, activeVersionId: versionId });
    showToast(`تم التبديل إلى «${target.name}»`);
  };

  const handleCreateVersion = (name: string) => {
    if (!vault || vault.versions.length >= MAX_PROFILE_VERSIONS) return;
    const currentVer = getActiveVersion(vault);
    const newId = `v_${Date.now()}`;
    const nextVault: VaultState = {
      ...vault,
      activeVersionId: newId,
      versions: [
        ...vault.versions,
        {
          id: newId,
          name,
          updatedAt: new Date().toISOString(),
          data: structuredClone(currentVer.data),
        },
      ],
    };
    commitVault(nextVault);
    showToast(`تم إنشاء نسخة «${name}» وحفظها محلياً`);
  };

  const handleRenameVersion = (id: string, name: string) => {
    if (!vault) return;
    const nextVault: VaultState = {
      ...vault,
      versions: vault.versions.map((v) =>
        v.id === id ? { ...v, name, updatedAt: new Date().toISOString() } : v
      ),
    };
    commitVault(nextVault);
    showToast(`تم تغيير اسم النسخة إلى «${name}»`);
  };

  const handleDeleteVersion = (id: string) => {
    if (!vault || vault.versions.length <= 1) return;
    const remaining = vault.versions.filter((v) => v.id !== id);
    const nextActiveId =
      vault.activeVersionId === id ? remaining[0]!.id : vault.activeVersionId;
    commitVault({
      ...vault,
      activeVersionId: nextActiveId,
      versions: remaining,
    });
    showToast('تم حذف النسخة المحلية');
  };

  const handleExportPdf = () => {
    if (activeTab !== 'ats') {
      setActiveTab('ats');
    }
    window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        window.print();
      }, 80);
    });
  };

  const handleCopyPlainTextAts = async () => {
    if (!activeData) return;
    const ok = await copyTextToClipboard(buildPlainTextAts(activeData));
    showToast(
      ok
        ? 'تم نسخ النص الخام للسيرة الذاتية ATS بنجاح'
        : 'تعذّر النسخ التلقائي — يمكنك النسخ يدوياً',
      ok ? 'default' : 'amber'
    );
  };

  const handleImportBackup = (imported: ImportedBackupPayload) => {
    if (!vault) return;
    if (imported.kind === 'vault' && imported.vault) {
      commitVault(imported.vault);
      return;
    }
    if (imported.kind === 'portfolio' && imported.portfolio) {
      const nextVault = updateActiveVersionData(vault, imported.portfolio);
      commitVault(
        imported.versionName
          ? {
              ...nextVault,
              versions: nextVault.versions.map((v) =>
                v.id === nextVault.activeVersionId
                  ? { ...v, name: imported.versionName! }
                  : v
              ),
            }
          : nextVault
      );
    }
  };

  const handleConfirmReset = async () => {
    if (!vault) return;
    if (vault.versions.length <= 1) {
      await clearVault(currentUserId);
      const fresh = createDefaultVault('dev');
      commitVault(fresh);
    } else {
      handleUpdateActiveData(() => buildPresetData('dev'));
    }
    setActiveEditorSection('identity');
    setResetModalOpen(false);
    showToast('تمت إعادة ضبط البيانات التجريبية بنجاح');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface text-sm font-semibold text-muted">
        جاري تهيئة مساحة العمل...
      </div>
    );
  }

  if (!user && !isGuest) {
    return <Navigate to="/auth" replace />;
  }

  if (!vaultReady || !vault || !activeVersion || !activeData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface text-sm font-semibold text-muted">
        جاري تحميل بياناتك المحلية بأمان...
      </div>
    );
  }

  const atsScore = evaluateAtsReadiness(activeData).score;
  const auditScore = evaluateCvQualityAudit(activeData).overallScore;

  return (
    <div className="min-h-screen flex flex-col bg-surface text-ink print:bg-white print:min-h-0">
      <TopNav
        activeTab={activeTab}
        onSwitchTab={setActiveTab}
        atsScore={atsScore}
        auditScore={auditScore}
        versions={vault.versions}
        activeVersionId={vault.activeVersionId}
        onSelectVersion={handleSelectVersion}
        onCreateVersion={handleCreateVersion}
        onRenameVersion={handleRenameVersion}
        onDeleteVersion={handleDeleteVersion}
        saving={saving}
        storageBackend={storageBackend}
        onExportJson={() => downloadJsonBackup(activeData, activeVersion.name)}
        onOpenShareModal={() => setShareModalOpen(true)}
        onOpenResetModal={() => setResetModalOpen(true)}
      />

      <main className="flex-1 w-full">
        {/* TAB 1: EDITOR & LIVE PREVIEW */}
        {activeTab === 'editor' && (
          <section className="no-print max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-5">
            <PresetBar
              activePresetId={activeData.presetId}
              onSelectPreset={handleSelectPreset}
            />

            {/* Mobile Split View Switcher (< lg) */}
            <div className="lg:hidden flex items-center bg-white border border-line rounded-xl p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setMobileViewMode('editor')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  mobileViewMode === 'editor'
                    ? 'bg-slate-900 text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                لوحة التحرير
              </button>
              <button
                type="button"
                onClick={() => setMobileViewMode('preview')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  mobileViewMode === 'preview'
                    ? 'bg-slate-900 text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                المعاينة الحية للبورتفوليو
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div
                className={`lg:col-span-5 ${
                  mobileViewMode === 'editor' ? 'block' : 'hidden lg:block'
                }`}
              >
                <EditorSidebar
                  data={activeData}
                  activeSection={activeEditorSection}
                  onSelectSection={setActiveEditorSection}
                  onUpdateData={handleUpdateActiveData}
                />
              </div>

              <div
                className={`lg:col-span-7 lg:sticky lg:top-20 ${
                  mobileViewMode === 'preview' ? 'block' : 'hidden lg:block'
                }`}
              >
                <PortfolioPreviewCanvas
                  data={activeData}
                  versionName={activeVersion.name}
                  onOpenAtsTab={() => setActiveTab('ats')}
                  onExportStandaloneHtml={() => {
                    downloadStandaloneHtml(activeData);
                    showToast('تم تحميل ملف البورتفوليو المستقل (HTML) بنجاح');
                  }}
                />
              </div>
            </div>
          </section>
        )}

        {/* TAB 2: ATS CV & PRINT (kept mounted with print:block so Ctrl+P works from any tab) */}
        <section
          id="tab-ats"
          className={`${
            activeTab === 'ats' ? 'block' : 'hidden print:block'
          } max-w-7xl mx-auto px-4 sm:px-6 py-6`}
        >
          <div id="ats-layout-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <AtsSidebar
              data={activeData}
              onExportPdf={handleExportPdf}
              onCopyPlainText={handleCopyPlainTextAts}
              onOpenAuditTab={() => setActiveTab('audit')}
            />

            <div id="ats-print-wrapper" className="lg:col-span-8">
              <div className="no-print flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-semibold text-muted">
                  معاينة ورقة A4 — تصميم أحادي العمود متوافق مع أنظمة الفرز الآلي
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('editor')}
                  className="text-xs font-semibold hover:underline"
                  style={{ color: 'var(--accent)' }}
                >
                  تعديل البيانات في المحرر ←
                </button>
              </div>
              <AtsSheet data={activeData} />
            </div>
          </div>
        </section>

        {/* TAB 3: AUDIT, JD MATCHER & EXPORT HUB */}
        {activeTab === 'audit' && (
          <AuditAndMatcherTab
            data={activeData}
            versionName={activeVersion.name}
            onAddSkill={(skill) =>
              handleUpdateActiveData((prev) =>
                prev.skills.includes(skill)
                  ? prev
                  : { ...prev, skills: [...prev.skills, skill] }
              )
            }
            onJumpToEditorSection={(section) => {
              setActiveEditorSection(section);
              setActiveTab('editor');
              setMobileViewMode('editor');
            }}
            onOpenAtsTab={() => setActiveTab('ats')}
            onImportBackup={handleImportBackup}
          />
        )}
      </main>

      <ExportBusinessCardModal
        open={shareModalOpen}
        data={activeData}
        versionName={activeVersion.name}
        onImportBackup={handleImportBackup}
        onClose={() => setShareModalOpen(false)}
      />

      <ConfirmModal
        open={resetModalOpen}
        title="إعادة ضبط البيانات التجريبية؟"
        description="سيتم استعادة النموذج الافتراضي ومسح التعديلات المحفوظة محلياً للنسخة الحالية."
        confirmLabel="تأكيد إعادة الضبط"
        cancelLabel="إلغاء"
        onConfirm={handleConfirmReset}
        onClose={() => setResetModalOpen(false)}
      />
    </div>
  );
};
