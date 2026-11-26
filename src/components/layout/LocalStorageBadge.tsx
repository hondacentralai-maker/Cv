import React, { useState } from 'react';
import type { StorageBackend } from '../../lib/localVault';

interface LocalStorageBadgeProps {
  saving: boolean;
  backend: StorageBackend;
  onExportJson: () => void;
}

export const LocalStorageBadge: React.FC<LocalStorageBadgeProps> = ({
  saving,
  backend,
  onExportJson,
}) => {
  const [openInfo, setOpenInfo] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpenInfo((v) => !v)}
        aria-expanded={openInfo}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold bg-emerald-50/90 text-emerald-800 border border-emerald-200 hover:bg-emerald-100/80 transition-colors"
      >
        <span
          className={`w-2 h-2 rounded-full ${
            saving ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
          }`}
        />
        <span>{saving ? 'جاري الحفظ محلياً...' : 'محفوظ محلياً على جهازك ✓'}</span>
      </button>

      {openInfo && (
        <>
          <div
            className="fixed inset-0 z-40"
            aria-hidden="true"
            onClick={() => setOpenInfo(false)}
          />
          <div className="absolute left-0 mt-2 w-72 sm:w-80 z-50 bg-white border border-line rounded-2xl p-4 shadow-xl space-y-2.5 text-right animate-fade-up">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-ink">الخصوصية والتخزين المحلي</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {backend === 'indexeddb' ? 'IndexedDB' : 'localStorage (احتياطي)'}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              بياناتك لا تُرفع لأي خادم حفاظاً على خصوصيتك ومجانية المنصة — استخدم «حفظ نسخة JSON»
              لنقل بياناتك لجهاز آخر.
            </p>
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  onExportJson();
                  setOpenInfo(false);
                }}
                className="text-[11px] font-bold hover:underline"
                style={{ color: 'var(--accent)' }}
              >
                حفظ نسخة JSON الآن ←
              </button>
              <button
                type="button"
                onClick={() => setOpenInfo(false)}
                className="text-[11px] font-semibold text-slate-500 hover:text-ink"
              >
                إغلاق
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
