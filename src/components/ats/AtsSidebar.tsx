import React from 'react';
import { evaluateAtsReadiness } from '../../lib/atsEngine';
import type { PortfolioData } from '../../types/portfolio';

interface AtsSidebarProps {
  data: PortfolioData;
  onExportPdf: () => void;
  onCopyPlainText: () => void;
  onOpenAuditTab: () => void;
}

export const AtsSidebar: React.FC<AtsSidebarProps> = ({
  data,
  onExportPdf,
  onCopyPlainText,
  onOpenAuditTab,
}) => {
  const { score, checks } = evaluateAtsReadiness(data);
  const circumference = 2 * Math.PI * 26;
  const offset = circumference - (score / 100) * circumference;
  const strokeColor = score >= 80 ? '#0F766E' : score >= 60 ? '#D97706' : '#E11D48';

  const scoreLabel =
    score === 100
      ? 'ممتاز — جاهزة تماماً لأنظمة الفرز الآلي'
      : score >= 80
      ? 'جيد جداً — تحقق معظم معايير ATS'
      : 'تحتاج لبعض التحسينات البسيطة';

  return (
    <aside className="no-print lg:col-span-4 space-y-4 lg:sticky lg:top-20">
      {/* Export Action Card */}
      <div className="bg-white border border-line rounded-2xl p-5 shadow-sm space-y-3.5">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
            توليد تلقائي من بيانات البورتفوليو
          </span>
          <h2 className="text-base font-bold text-ink">السيرة الذاتية المتوافقة مع ATS</h2>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            تنسيق أحادي العمود بنص حقيقي قابل للنسخ والقراءة الآلية بواسطة أنظمة فرز المتقدمين في
            الشركات.
          </p>
        </div>

        <button
          type="button"
          onClick={onExportPdf}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white shadow-sm hover:opacity-95 transition-opacity"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          <span>تصدير PDF متوافق مع ATS (نص قابل للقراءة)</span>
        </button>

        <button
          type="button"
          onClick={onCopyPlainText}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-line transition-colors"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          <span>نسخ النص الخام للسيرة الذاتية</span>
        </button>

        {/* Privacy Status Indicator */}
        <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 text-xs text-slate-600 flex items-start gap-2">
          {data.profile.hidePhoneInPortfolio ? (
            <>
              <svg
                className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>
                رقم الجوال <strong>مخفي في البورتفوليو وملف HTML</strong> ويظهر هنا في السيرة
                الذاتية المخصصة لجهات التوظيف فقط.
              </span>
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4 text-slate-500 shrink-0 mt-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>
                رقم الجوال ظاهر حالياً في البورتفوليو والسيرة الذاتية. يمكنك إخفاؤه من البورتفوليو
                عبر قسم «الهوية والبيانات».
              </span>
            </>
          )}
        </div>
      </div>

      {/* Dynamic ATS Readiness Score Card */}
      <div className="bg-white border border-line rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-ink">مؤشر جاهزية ATS</h3>
            <p className="text-xs text-muted mt-0.5">{scoreLabel}</p>
          </div>
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64" aria-hidden="true">
              <circle cx="32" cy="32" r="26" fill="none" stroke="#E2E8F0" strokeWidth="6" />
              <circle
                cx="32"
                cy="32"
                r="26"
                fill="none"
                stroke={strokeColor}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="transition-all duration-500"
              />
            </svg>
            <span className="absolute text-sm font-bold text-ink">{score}%</span>
          </div>
        </div>

        <ul className="space-y-2.5 pt-2 border-t border-slate-100">
          {checks.map((c, idx) => (
            <li
              key={idx}
              className={`flex items-start gap-2.5 text-xs ${
                c.passed ? 'text-slate-700' : 'text-slate-500'
              }`}
            >
              <span
                className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                  c.passed
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {c.passed ? (
                  <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                )}
              </span>
              <span className="leading-snug">{c.label}</span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={onOpenAuditTab}
          className="w-full py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-ink transition-colors"
        >
          التقرير التفصيلي وفاحص مطابقة الوظائف ←
        </button>
      </div>
    </aside>
  );
};
