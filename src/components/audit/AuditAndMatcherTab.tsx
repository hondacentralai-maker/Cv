import React, { useState } from 'react';
import type { EditorSectionId } from '../../data/presets';
import {
  analyzeJobDescription,
  buildSampleJobDescription,
  evaluateCvQualityAudit,
  type JobDescriptionMatchResult,
} from '../../lib/atsEngine';
import type { PortfolioData } from '../../types/portfolio';
import { useToast } from '../layout/ToastProvider';
import {
  BusinessCardExportPanel,
  type ImportedBackupPayload,
} from '../share/ExportBusinessCardModal';

interface AuditAndMatcherTabProps {
  data: PortfolioData;
  versionName: string;
  onAddSkill: (skill: string) => void;
  onJumpToEditorSection: (section: EditorSectionId) => void;
  onOpenAtsTab: () => void;
  onOpenCardStudio: () => void;
  onImportBackup: (imported: ImportedBackupPayload) => void;
}

export const AuditAndMatcherTab: React.FC<AuditAndMatcherTabProps> = ({
  data,
  versionName,
  onAddSkill,
  onJumpToEditorSection,
  onOpenAtsTab,
  onOpenCardStudio,
  onImportBackup,
}) => {
  const { showToast } = useToast();
  const [jdText, setJdText] = useState('');
  const [jdResult, setJdResult] = useState<JobDescriptionMatchResult | null>(null);

  const audit = evaluateCvQualityAudit(data);

  const runAnalysis = (textOverride?: string) => {
    const targetText = (textOverride ?? jdText).trim();
    if (!targetText) {
      showToast('الرجاء لصق وصف وظيفي أولاً لبدء الفحص', 'amber');
      return;
    }
    setJdResult(analyzeJobDescription(targetText, data));
  };

  const handleUseSampleJd = () => {
    const sample = buildSampleJobDescription(data.presetId);
    setJdText(sample);
    runAnalysis(sample);
  };

  const handleAddMissingSkill = (skill: string) => {
    onAddSkill(skill);
    if (jdText.trim()) {
      const updatedPortfolio: PortfolioData = {
        ...data,
        skills: data.skills.includes(skill) ? data.skills : [...data.skills, skill],
      };
      setJdResult(analyzeJobDescription(jdText, updatedPortfolio));
    }
    showToast(`تمت إضافة «${skill}» إلى مهاراتك ورفع نسبة التطابق`);
  };

  const overallColor =
    audit.overallScore >= 80
      ? '#0F766E'
      : audit.overallScore >= 60
      ? '#D97706'
      : '#E11D48';

  const jdBarColor =
    jdResult && jdResult.matchPercent >= 75
      ? '#0F766E'
      : jdResult && jdResult.matchPercent >= 45
      ? '#D97706'
      : '#E11D48';

  return (
    <section className="no-print max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-ink">مركز التدقيق والمطابقة والتصدير</h2>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            تحليل جودة سيرتك الذاتية بالأرقام الفعلية + فاحص مطابقة إعلانات الوظائف + بطاقة QR وتصدير أوفلاين
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenAtsTab}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm hover:opacity-95 transition-opacity self-start sm:self-auto"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          <span>معاينة وطباعة السيرة الذاتية ATS</span>
        </button>
      </div>

      {/* 4 Real Measurable KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-line rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between gap-2">
          <span className="text-xs font-semibold text-muted">تقييم جودة السيرة الذاتية</span>
          <div className="text-2xl font-bold" style={{ color: overallColor }}>
            {audit.overallScore}%
          </div>
          <span className="text-[11px] text-slate-600">
            {audit.overallScore >= 85
              ? 'ممتازة ومنافسة للفرز الآلي والبشري'
              : audit.overallScore >= 65
              ? 'جيدة — طبّق الخطوات السريعة بالأسفل'
              : 'تحتاج لتحسينات جوهرية قبل التقديم'}
          </span>
        </div>

        <div className="bg-white border border-line rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between gap-2">
          <span className="text-xs font-semibold text-muted">الإنجازات المدعومة بأرقام</span>
          <div className="text-2xl font-bold text-ink">{audit.quantifiedPercent}%</div>
          <span className="text-[11px] text-slate-600">
            {audit.quantifiedItems} من أصل {audit.totalMeasureableItems} نقطة خبرة ومشروع
          </span>
        </div>

        <div className="bg-white border border-line rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between gap-2">
          <span className="text-xs font-semibold text-muted">قوة الأفعال القيادية</span>
          <div className="text-2xl font-bold text-ink">{audit.actionVerbPercent}%</div>
          <span className="text-[11px] text-slate-600">
            {audit.actionVerbBullets} من أصل {audit.totalBullets} نقطة خبرة تبدأ بفعل إنجاز
          </span>
        </div>

        <div className="bg-white border border-line rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between gap-2">
          <span className="text-xs font-semibold text-muted">طول السيرة الذاتية (A4)</span>
          <div className="text-2xl font-bold text-ink">{audit.wordCount} كلمة</div>
          <span className="text-[11px] text-slate-600">
            {audit.wordCountStatus === 'ideal'
              ? 'مثالي لصفحة إلى صفحتين A4 ✓'
              : audit.wordCountStatus === 'short'
              ? 'قصيرة نسبياً — أضف تفاصيل وإنجازات'
              : 'طويلة — يُفضل الاختصار لصفحتين'}
          </span>
        </div>
      </div>

      {/* Section 1 & 2: CV Quality Audit Breakdown + Quick Fixes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Audit Dimensions */}
        <div className="lg:col-span-7 bg-white border border-line rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-ink">تقرير جودة السيرة الذاتية الذكي</h3>
              <p className="text-xs text-muted mt-0.5">
                تحليل فوري لمحتوى سيرتك الحالية في النسخة «{versionName}»
              </p>
            </div>
            {audit.hasUnreplacedPlaceholders && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                توجد أقواس [ ] غير مستبدلة
              </span>
            )}
          </div>

          <div className="space-y-3">
            {audit.dimensions.map((dim) => {
              const pct = Math.round((dim.score / dim.maxScore) * 100);
              const barCls =
                dim.status === 'good'
                  ? 'bg-emerald-600'
                  : dim.status === 'warn'
                  ? 'bg-amber-500'
                  : 'bg-rose-500';
              return (
                <div
                  key={dim.id}
                  className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-ink">{dim.title}</span>
                    <span className="font-bold text-slate-700">
                      {dim.score} / {dim.maxScore}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200/80 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barCls}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-600">{dim.summary}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions to Reach 100% */}
        <div className="lg:col-span-5 bg-white border border-line rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-ink">خطوات سريعة لرفع تقييمك إلى 100%</h3>
            <p className="text-xs text-muted mt-0.5">
              اضغط على أي خطوة للانتقال مباشرةً إلى القسم المطلوب في المحرر
            </p>
          </div>

          {audit.quickActions.length === 0 ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 leading-relaxed">
              ممتاز! سيرتك الذاتية مكتملة التوازن والأثر الرقمي وجاهزة للتقديم الفوري.
            </div>
          ) : (
            <div className="space-y-2.5">
              {audit.quickActions.map((act) => (
                <div
                  key={act.id}
                  className="p-3.5 rounded-xl border border-line bg-slate-50/60 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-bold text-ink">{act.title}</span>
                      <span className="px-1.5 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-bold">
                        +{act.impactPoints} نقطة
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{act.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onJumpToEditorSection(act.targetSection)}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-white shrink-0 hover:opacity-95"
                    style={{ backgroundColor: 'var(--accent)' }}
                  >
                    تعديل ←
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section 2 & 3: JD ATS Matcher + Offline Business Card & Export Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Job Description Matcher */}
        <div className="lg:col-span-6 bg-white border border-line rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-ink flex items-center gap-2">
              <svg
                className="w-4 h-4 text-teal-700 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span>فاحص مطابقة وصف الوظيفة (Job Description ATS Matcher)</span>
            </h3>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              الصق نص إعلان الوظيفة (عربي أو إنجليزي) لاكتشاف نسبة التطابق والكلمات المفتاحية
              الناقصة وإضافتها بضغطة واحدة.
            </p>
          </div>

          <textarea
            rows={5}
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="الصق متطلبات الوظيفة هنا (بالعربية أو الإنجليزية)..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
          />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => runAnalysis()}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white hover:opacity-95 transition-opacity"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              فحص التطابق مع سيرتي
            </button>
            <button
              type="button"
              onClick={handleUseSampleJd}
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              مثال جاهز
            </button>
          </div>

          {jdResult && (
            <div className="space-y-3 pt-3 border-t border-slate-100 animate-fade-up">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-ink">نسبة التطابق مع وصف الوظيفة</span>
                  <span className="font-bold" style={{ color: jdBarColor }}>
                    {jdResult.matchPercent}% ({jdResult.matched.length}/{jdResult.totalExtracted})
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${jdResult.matchPercent}%`,
                      backgroundColor: jdBarColor,
                    }}
                  />
                </div>
              </div>

              {jdResult.matched.length > 0 && (
                <div className="space-y-1.5">
                  <span className="block text-[11px] font-bold text-emerald-800">
                    ✓ كلمات موجودة في سيرتك ({jdResult.matched.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {jdResult.matched.map((m) => (
                      <span
                        key={m}
                        className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-medium"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {jdResult.missing.length > 0 ? (
                <div className="space-y-1.5">
                  <span className="block text-[11px] font-bold text-amber-800">
                    ! كلمات مطلوبة وناقصة (اضغط لإضافتها لمهاراتك):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {jdResult.missing.map((ms) => (
                      <button
                        key={ms}
                        type="button"
                        onClick={() => handleAddMissingSkill(ms)}
                        className="px-2 py-1 rounded-md bg-amber-50 hover:bg-teal-700 hover:text-white text-amber-900 border border-amber-200 text-[11px] font-semibold transition-colors"
                      >
                        + {ms}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
                  ممتاز! سيرتك تغطي جميع الكلمات المفتاحية المستخرجة من وصف الوظيفة.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Export & Offline Card Hub */}
        <div className="lg:col-span-6 bg-white border border-line rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-ink">مركز البطاقة الرقمية والتصدير المستقل</h3>
            <p className="text-xs text-muted mt-0.5">
              رمز QR حقيقي بصيغة vCard 3.0 قابل للمسح بدون إنترنت، وتصدير HTML/JSON/VCF
            </p>
          </div>

          <BusinessCardExportPanel
            data={data}
            versionName={versionName}
            onImportBackup={onImportBackup}
            onOpenCardStudio={onOpenCardStudio}
          />
        </div>
      </div>
    </section>
  );
};
