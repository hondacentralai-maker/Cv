import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { StorageBackend } from '../../lib/localVault';
import { formatPhoneDisplay } from '../../lib/supabase';
import { MAX_PROFILE_VERSIONS, type ProfileVersion } from '../../types/portfolio';
import { LocalStorageBadge } from './LocalStorageBadge';

export type WorkspaceTabId = 'editor' | 'card' | 'ats' | 'audit';

interface TopNavProps {
  activeTab: WorkspaceTabId;
  onSwitchTab: (tab: WorkspaceTabId) => void;
  atsScore: number;
  auditScore: number;
  versions: ProfileVersion[];
  activeVersionId: string;
  onSelectVersion: (id: string) => void;
  onCreateVersion: (name: string) => void;
  onRenameVersion: (id: string, name: string) => void;
  onDeleteVersion: (id: string) => void;
  saving: boolean;
  storageBackend: StorageBackend;
  onExportJson: () => void;
  onOpenShareModal: () => void;
  onOpenResetModal: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onSwitchTab,
  atsScore,
  auditScore,
  versions,
  activeVersionId,
  onSelectVersion,
  onCreateVersion,
  onRenameVersion,
  onDeleteVersion,
  saving,
  storageBackend,
  onExportJson,
  onOpenShareModal,
  onOpenResetModal,
}) => {
  const { user, isGuest, signOut } = useAuth();
  const navigate = useNavigate();

  const [versionsMenuOpen, setVersionsMenuOpen] = useState(false);
  const [newVersionName, setNewVersionName] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const activeVersion = versions.find((v) => v.id === activeVersionId) ?? versions[0];

  const atsBadgeClass =
    atsScore >= 80
      ? 'bg-emerald-100 text-emerald-800'
      : atsScore >= 60
      ? 'bg-amber-100 text-amber-800'
      : 'bg-rose-100 text-rose-800';

  const auditBadgeClass =
    auditScore >= 80
      ? 'bg-emerald-100 text-emerald-800'
      : auditScore >= 60
      ? 'bg-amber-100 text-amber-800'
      : 'bg-rose-100 text-rose-800';

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newVersionName.trim();
    if (!trimmed) return;
    onCreateVersion(trimmed);
    setNewVersionName('');
  };

  const handleRenameSubmit = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    const trimmed = renameValue.trim();
    if (!trimmed) return;
    onRenameVersion(id, trimmed);
    setRenamingId(null);
    setRenameValue('');
  };

  return (
    <header className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3 py-3">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm transition-colors"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 2a9 9 0 0 0-9 9c0 3.2 1.2 6.2 3.3 8.5" />
                <path d="M12 6a5 5 0 0 0-5 5c0 2.6.9 5 2.5 7" />
                <path d="M12 10a1 1 0 0 0-1 1c0 2.5.8 4.8 2.2 6.8" />
                <path d="M16.5 19.5c1.6-2 2.5-4.7 2.5-8.5a7 7 0 0 0-7-7" />
                <path d="M15 15c.6-1.2 1-2.5 1-4a4 4 0 0 0-4-4" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-ink">بصمة</span>
                <span className="text-xs font-medium text-slate-400 tracking-wide">Basma</span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  مجاني 100%
                </span>
              </div>
              <p className="text-xs text-muted hidden xl:block">
                معرض أعمال احترافي + سيرة ذاتية ATS بخصوصية محلية
              </p>
            </div>
          </div>

          {/* Primary 3 Navigation Tabs */}
          <nav
            aria-label="التنقل الرئيسي"
            className="order-4 lg:order-2 w-full lg:w-auto flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/80"
          >
            <button
              type="button"
              onClick={() => onSwitchTab('editor')}
              aria-current={activeTab === 'editor' ? 'page' : undefined}
              className={`flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'editor'
                  ? 'bg-white text-ink shadow-sm'
                  : 'text-slate-600 hover:text-ink'
              }`}
            >
              <svg
                className="w-4 h-4 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              <span>المحرر والمعاينة</span>
            </button>

            <button
              type="button"
              onClick={() => onSwitchTab('card')}
              aria-current={activeTab === 'card' ? 'page' : undefined}
              className={`flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'card'
                  ? 'bg-white text-ink shadow-sm'
                  : 'text-slate-600 hover:text-ink'
              }`}
            >
              <svg
                className="w-4 h-4 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="6" y1="10" x2="12" y2="10" />
                <line x1="6" y1="14" x2="10" y2="14" />
                <rect x="15" y="9" width="4" height="4" rx="0.5" />
              </svg>
              <span>الكارت الشخصي</span>
            </button>

            <button
              type="button"
              onClick={() => onSwitchTab('ats')}
              aria-current={activeTab === 'ats' ? 'page' : undefined}
              className={`flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'ats'
                  ? 'bg-white text-ink shadow-sm'
                  : 'text-slate-600 hover:text-ink'
              }`}
            >
              <svg
                className="w-4 h-4 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <path d="m9 15 2 2 4-4" />
              </svg>
              <span>السيرة الذاتية (ATS)</span>
              <span
                className={`hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md text-[11px] font-bold ${atsBadgeClass}`}
              >
                {atsScore}%
              </span>
            </button>

            <button
              type="button"
              onClick={() => onSwitchTab('audit')}
              className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'audit'
                  ? 'bg-white text-ink shadow-sm'
                  : 'text-slate-600 hover:text-ink'
              }`}
            >
              <svg
                className="w-4 h-4 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span>التدقيق والمطابقة</span>
              <span
                className={`hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md text-[11px] font-bold ${auditBadgeClass}`}
              >
                {auditScore}%
              </span>
            </button>
          </nav>

          {/* Utility Actions: Local Badge, Multi-Profile Switcher, Share, Reset, Account */}
          <div className="order-2 lg:order-3 flex flex-wrap items-center gap-2">
            <LocalStorageBadge
              saving={saving}
              backend={storageBackend}
              onExportJson={onExportJson}
            />

            {/* Multi-Profile Local Versions Switcher (up to 3) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setVersionsMenuOpen((v) => !v)}
                aria-expanded={versionsMenuOpen}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-line transition-colors max-w-[170px]"
                title="التبديل بين نسخ السيرة المحفوظة محلياً (حتى 3 نسخ)"
              >
                <svg
                  className="w-3.5 h-3.5 text-slate-500 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <rect x="8" y="2" width="14" height="14" rx="2" />
                  <path d="M4 8H2v12a2 2 0 0 0 2 2h12v-2" />
                </svg>
                <span className="truncate">{activeVersion?.name ?? 'النسخة الأساسية'}</span>
                <span className="text-[10px] text-slate-400 shrink-0">
                  ({versions.length}/{MAX_PROFILE_VERSIONS})
                </span>
              </button>

              {versionsMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    aria-hidden="true"
                    onClick={() => {
                      setVersionsMenuOpen(false);
                      setRenamingId(null);
                    }}
                  />
                  <div className="absolute left-0 mt-2 w-80 z-50 bg-white border border-line rounded-2xl p-4 shadow-xl space-y-3 text-right animate-fade-up">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-ink">
                        النسخ المحلية ({versions.length}/{MAX_PROFILE_VERSIONS})
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        محلياً 0$
                      </span>
                    </div>

                    <div className="space-y-2">
                      {versions.map((ver) => {
                        const isActive = ver.id === activeVersionId;
                        if (renamingId === ver.id) {
                          return (
                            <form
                              key={ver.id}
                              onSubmit={(e) => handleRenameSubmit(e, ver.id)}
                              className="flex items-center gap-1.5 p-2 rounded-xl border border-teal-600 bg-white"
                            >
                              <input
                                type="text"
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                maxLength={60}
                                required
                                autoFocus
                                className="flex-1 px-2 py-1 text-xs border border-line rounded-lg focus:outline-none focus:border-teal-600"
                              />
                              <button
                                type="submit"
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-white"
                                style={{ backgroundColor: 'var(--accent)' }}
                              >
                                حفظ
                              </button>
                              <button
                                type="button"
                                onClick={() => setRenamingId(null)}
                                className="px-2 py-1 rounded-lg text-[11px] text-slate-500 hover:bg-slate-100"
                              >
                                إلغاء
                              </button>
                            </form>
                          );
                        }

                        return (
                          <div
                            key={ver.id}
                            className={`flex items-center justify-between gap-2 p-2.5 rounded-xl border transition-colors ${
                              isActive
                                ? 'bg-slate-50 border-slate-900'
                                : 'bg-white border-line hover:bg-slate-50'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                onSelectVersion(ver.id);
                                setVersionsMenuOpen(false);
                              }}
                              className="flex-1 text-right min-w-0"
                            >
                              <div className="text-xs font-bold text-ink truncate">
                                {ver.name}
                              </div>
                              <div className="text-[10px] text-muted truncate">
                                {ver.data.profile.jobTitle || 'بدون مسمى'}
                              </div>
                            </button>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setRenamingId(ver.id);
                                  setRenameValue(ver.name);
                                }}
                                className="p-1 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-teal-50"
                                title="تغيير اسم النسخة"
                                aria-label={`تغيير اسم ${ver.name}`}
                              >
                                <svg
                                  className="w-3.5 h-3.5"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  aria-hidden="true"
                                >
                                  <path d="M12 20h9" />
                                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                </svg>
                              </button>
                              {versions.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => onDeleteVersion(ver.id)}
                                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                  title="حذف هذه النسخة"
                                  aria-label={`حذف ${ver.name}`}
                                >
                                  <svg
                                    className="w-3.5 h-3.5"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    aria-hidden="true"
                                  >
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {versions.length < MAX_PROFILE_VERSIONS ? (
                      <form onSubmit={handleCreateSubmit} className="flex gap-1.5 pt-2 border-t border-slate-100">
                        <input
                          type="text"
                          value={newVersionName}
                          onChange={(e) => setNewVersionName(e.target.value)}
                          maxLength={60}
                          required
                          placeholder="اسم نسخة جديدة (مثلاً: مطور واجهات)"
                          className="flex-1 px-2.5 py-1.5 rounded-xl border border-line text-xs focus:outline-none focus:border-teal-600"
                        />
                        <button
                          type="submit"
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-white shrink-0"
                          style={{ backgroundColor: 'var(--accent)' }}
                        >
                          + إنشاء
                        </button>
                      </form>
                    ) : (
                      <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                        وصلت للحد الأقصى (3 نسخ محلية). احذف إحدى النسخ لإنشاء نسخة جديدة.
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={onOpenShareModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white shadow-xs hover:opacity-95 transition-opacity"
              style={{ backgroundColor: 'var(--accent)' }}
              title="بطاقة الأعمال الرقمية وتصدير البورتفوليو"
            >
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              <span className="hidden sm:inline">البطاقة والتصدير</span>
              <span className="sm:hidden">تصدير</span>
            </button>

            <button
              type="button"
              onClick={onOpenResetModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 bg-white hover:bg-slate-50 border border-line transition-colors"
              title="إعادة ضبط النسخة الحالية"
            >
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              <span className="hidden xl:inline">إعادة ضبط</span>
            </button>

            {user ? (
              <button
                type="button"
                onClick={async () => {
                  await signOut();
                  navigate('/auth');
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-line transition-colors"
                title={
                  formatPhoneDisplay(
                    user.phone || (user.user_metadata?.phone as string | undefined)
                  ) || 'الحساب المسجل'
                }
              >
                <span className="hidden md:inline max-w-[120px] truncate" dir="ltr">
                  {formatPhoneDisplay(
                    user.phone || (user.user_metadata?.phone as string | undefined)
                  ) || 'حسابي'}
                </span>
                <span className="text-rose-700 font-semibold">خروج</span>
              </button>
            ) : (
              isGuest && (
                <button
                  type="button"
                  onClick={() => navigate('/auth')}
                  className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors"
                >
                  <span>دخول / حفظ بحساب</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
