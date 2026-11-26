import React, { useEffect, useId, useRef, useState } from 'react';
import { getAccentMeta } from '../../data/presets';
import {
  buildShareIntroMessage,
  buildVCardString,
  copyTextToClipboard,
  downloadJsonBackup,
  downloadQrPng,
  downloadStandaloneHtml,
  downloadVCardFile,
  generateQrDataUrl,
} from '../../lib/exportUtils';
import { sanitizeUrl } from '../../lib/sanitize';
import { parseImportedJsonBackup, type PortfolioData, type VaultState } from '../../types/portfolio';
import { useToast } from '../layout/ToastProvider';

export interface ImportedBackupPayload {
  kind: 'vault' | 'portfolio';
  vault?: VaultState;
  portfolio?: PortfolioData;
  versionName?: string;
}

interface BusinessCardExportPanelProps {
  data: PortfolioData;
  versionName: string;
  onImportBackup: (imported: ImportedBackupPayload) => void;
  onAfterAction?: () => void;
}

export const BusinessCardExportPanel: React.FC<BusinessCardExportPanelProps> = ({
  data,
  versionName,
  onImportBackup,
  onAfterAction,
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [includePhone, setIncludePhone] = useState<boolean>(!data.profile.hidePhoneInPortfolio);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    setIncludePhone(!data.profile.hidePhoneInPortfolio);
  }, [data.profile.hidePhoneInPortfolio]);

  useEffect(() => {
    let cancelled = false;
    const vcard = buildVCardString(data, includePhone);
    generateQrDataUrl(vcard, 220)
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl('');
      });
    return () => {
      cancelled = true;
    };
  }, [data, includePhone]);

  const p = data.profile;
  const accentMeta = getAccentMeta(data.design.accent);
  const safePrimaryLink = sanitizeUrl(p.primaryPortfolioLink);
  const introMessage = buildShareIntroMessage(data);

  const handleCopyIntro = async () => {
    const ok = await copyTextToClipboard(introMessage);
    showToast(
      ok
        ? 'تم نسخ الرسالة التعريفية الجاهزة للإرسال'
        : 'تعذّر النسخ التلقائي — يمكنك النسخ يدوياً',
      ok ? 'default' : 'amber'
    );
  };

  const handleDownloadQrPng = async () => {
    try {
      await downloadQrPng(data, includePhone);
      showToast('تم تحميل رمز QR (vCard 3.0) كصورة PNG');
    } catch {
      showToast('تعذّر توليد صورة رمز QR', 'rose');
    }
  };

  const handleDownloadVcf = () => {
    downloadVCardFile(data, includePhone);
    showToast('تم تحميل ملف جهة الاتصال (.vcf) بنجاح');
  };

  const handleDownloadHtml = () => {
    downloadStandaloneHtml(data);
    showToast('تم تحميل البورتفوليو كملف HTML مستقل (يعمل أوفلاين بالكامل)');
  };

  const handleDownloadJson = () => {
    downloadJsonBackup(data, versionName);
    showToast('تم حفظ النسخة الاحتياطية (JSON) على جهازك');
  };

  const handleJsonImportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = parseImportedJsonBackup(String(reader.result ?? ''));
        onImportBackup(parsed);
        showToast('تمت استعادة بياناتك والتحقق منها بنجاح');
        onAfterAction?.();
      } catch (err) {
        showToast(
          err instanceof Error ? err.message : 'ملف النسخة الاحتياطية غير صالح',
          'rose'
        );
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      {/* Digital Business Card with Real Scannable vCard 3.0 QR */}
      <div
        className="rounded-2xl p-4 sm:p-5 text-white relative overflow-hidden shadow-md"
        style={{
          background: `linear-gradient(135deg, ${accentMeta.hex} 0%, #0F172A 100%)`,
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/15 border border-white/20">
              بطاقة أعمال رقمية — vCard 3.0 QR
            </span>
            <h4 className="text-lg font-bold truncate">{p.fullName || 'الاسم الكامل'}</h4>
            <p className="text-xs text-white/85 truncate">{p.jobTitle}</p>
            <div className="pt-2 space-y-0.5 text-[11px] text-white/85">
              {p.city && <div>{p.city}</div>}
              {p.email && <div dir="ltr" className="text-right truncate">{p.email}</div>}
              {includePhone && p.phone && <div dir="ltr" className="text-right">{p.phone}</div>}
              {safePrimaryLink && (
                <div dir="ltr" className="text-right truncate opacity-90">
                  {safePrimaryLink}
                </div>
              )}
            </div>
          </div>

          <div className="w-28 h-28 rounded-xl bg-white p-1.5 shrink-0 flex items-center justify-center shadow-sm self-center sm:self-auto">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`رمز QR لجهة اتصال ${p.fullName}`}
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-[10px] text-slate-400">جاري توليد QR...</span>
            )}
          </div>
        </div>
      </div>

      {/* Include/Exclude Phone Toggle for QR & vCard */}
      {p.phone && (
        <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-line cursor-pointer">
          <input
            type="checkbox"
            checked={includePhone}
            onChange={(e) => setIncludePhone(e.target.checked)}
            className="w-4 h-4 rounded accent-teal-700 cursor-pointer"
          />
          <span className="text-xs text-slate-700">
            تضمين رقم الجوال (<span dir="ltr">{p.phone}</span>) داخل رمز QR وملف جهة الاتصال (.vcf)
          </span>
        </label>
      )}

      {/* Ready Intro Message */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-ink">
            رسالة تعريفية جاهزة للإرسال (واتساب / LinkedIn / بريد)
          </span>
          <button
            type="button"
            onClick={handleCopyIntro}
            className="text-[11px] font-bold hover:underline"
            style={{ color: 'var(--accent)' }}
          >
            نسخ الرسالة
          </button>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-line text-xs text-slate-700 leading-relaxed whitespace-pre-line">
          {introMessage}
        </div>
      </div>

      {/* Offline Export & Backup Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        <button
          type="button"
          onClick={handleDownloadQrPng}
          className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs hover:opacity-95 transition-opacity"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          <span>تحميل رمز QR كصورة PNG</span>
        </button>

        <button
          type="button"
          onClick={handleDownloadVcf}
          className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <span>تحميل ملف جهة اتصال (.vcf)</span>
        </button>

        <button
          type="button"
          onClick={handleDownloadHtml}
          className="sm:col-span-2 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>تحميل البورتفوليو كملف HTML مستقل (أوفلاين بالكامل)</span>
        </button>

        <button
          type="button"
          onClick={handleDownloadJson}
          className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <span>حفظ نسخة احتياطية (JSON)</span>
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <span>استعادة نسخة (JSON)</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleJsonImportChange}
          className="hidden"
        />
      </div>
    </div>
  );
};

interface ExportBusinessCardModalProps {
  open: boolean;
  data: PortfolioData;
  versionName: string;
  onImportBackup: (imported: ImportedBackupPayload) => void;
  onClose: () => void;
}

export const ExportBusinessCardModal: React.FC<ExportBusinessCardModalProps> = ({
  open,
  data,
  versionName,
  onImportBackup,
  onClose,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Fallback light-dismiss for browsers without closedby="any"
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || 'closedBy' in HTMLDialogElement.prototype) return;

    let pressedOutside = false;
    const isOutside = (e: PointerEvent) => {
      const r = dialog.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };

    const onDown = (e: PointerEvent) => {
      pressedOutside = isOutside(e);
    };
    const onUp = (e: PointerEvent) => {
      if (pressedOutside && isOutside(e)) {
        dialog.close();
      }
      pressedOutside = false;
    };

    dialog.addEventListener('pointerdown', onDown);
    dialog.addEventListener('pointerup', onUp);
    return () => {
      dialog.removeEventListener('pointerdown', onDown);
      dialog.removeEventListener('pointerup', onUp);
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      {...({ closedby: 'any' } as Record<string, string>)}
      onClose={() => {
        if (dialogRef.current) dialogRef.current.returnValue = '';
        onClose();
      }}
      className="no-print w-full max-w-lg rounded-2xl"
    >
      <div className="bg-white border border-line rounded-2xl w-full p-5 sm:p-6 shadow-xl space-y-5 animate-fade-up text-right">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
          <div>
            <h1 id={titleId} className="text-base font-bold text-ink">
              البطاقة الرقمية والتصدير المستقل
            </h1>
            <p className="text-xs text-muted mt-0.5">
              امسح رمز QR لحفظ بطاقة التواصل، أو صدّر ملف HTML ونسخة JSON محلياً
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            aria-label="إغلاق"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <BusinessCardExportPanel
          data={data}
          versionName={versionName}
          onImportBackup={onImportBackup}
          onAfterAction={onClose}
        />
      </div>
    </dialog>
  );
};
