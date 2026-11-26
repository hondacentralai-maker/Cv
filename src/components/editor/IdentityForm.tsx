import React, { useRef, useState } from 'react';
import {
  AVAILABILITY_OPTIONS,
  PRESET_LIST,
  TIMEZONE_OPTIONS,
  WORK_MODE_OPTIONS,
} from '../../data/presets';
import { getActiveWritingAssist } from '../../data/writingAssist';
import { compressAvatarFile } from '../../lib/imageCompress';
import { isSafeLinkOrEmpty, sanitizeAvatarSrc, sanitizeUrl } from '../../lib/sanitize';
import type {
  AvailabilityId,
  PresetId,
  ProfileData,
  WorkModePreference,
} from '../../types/portfolio';
import { useToast } from '../layout/ToastProvider';

interface IdentityFormProps {
  profile: ProfileData;
  presetId: PresetId;
  onChange: (nextProfile: ProfileData) => void;
}

export const IdentityForm: React.FC<IdentityFormProps> = ({
  profile,
  presetId,
  onChange,
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [wizYears, setWizYears] = useState('');
  const [wizFocus, setWizFocus] = useState('');
  const [wizGoal, setWizGoal] = useState('');
  const [compressingAvatar, setCompressingAvatar] = useState(false);
  const [avatarBytes, setAvatarBytes] = useState<number | null>(null);
  const [linkWarning, setLinkWarning] = useState<string | null>(null);

  const assist = getActiveWritingAssist(presetId);
  const presetLabel = PRESET_LIST.find((x) => x.id === presetId)?.label ?? PRESET_LIST[0]!.label;

  const updateField = <K extends keyof ProfileData>(key: K, value: ProfileData[K]) => {
    onChange({ ...profile, [key]: value });
  };

  const handlePrimaryLinkChange = (raw: string) => {
    updateField('primaryPortfolioLink', raw);
    if (raw.trim() && !isSafeLinkOrEmpty(raw)) {
      setLinkWarning('يرجى إدخال رابط يبدأ بـ https:// أو http:// أو mailto:');
    } else {
      setLinkWarning(null);
    }
  };

  const handlePrimaryLinkBlur = () => {
    const trimmed = profile.primaryPortfolioLink.trim();
    if (!trimmed) {
      setLinkWarning(null);
      return;
    }
    const safe = sanitizeUrl(trimmed);
    if (!safe) {
      setLinkWarning('رابط غير آمن أو غير صالح — تم تجاهله في التصدير والمعاينة.');
    } else {
      setLinkWarning(null);
      if (safe !== profile.primaryPortfolioLink) {
        updateField('primaryPortfolioLink', safe);
      }
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompressingAvatar(true);
    try {
      const result = await compressAvatarFile(file);
      updateField('avatarDataUrl', result.dataUrl);
      setAvatarBytes(result.sizeBytes);
      showToast(
        `تم ضغط الصورة محلياً (${Math.round(result.sizeBytes / 1024)}KB — ${result.width}×${result.height}) وحفظها في جهازك`
      );
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'تعذّر معالجة الصورة المختارة',
        'rose'
      );
    } finally {
      setCompressingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = () => {
    updateField('avatarDataUrl', '');
    setAvatarBytes(null);
    showToast('تمت إزالة الصورة والعودة إلى الأحرف الأولى');
  };

  const handleGenerateGuidedBio = () => {
    const yrs = wizYears.trim();
    const focus = wizFocus.trim();
    const goal = wizGoal.trim();
    const role = (profile.jobTitle || presetLabel).split('—')[0]?.trim() ?? presetLabel;

    const isFresh = /خريج|حديث|متدرب|طالب/.test(yrs) || presetId === 'freshgrad';
    const expSentence = yrs
      ? isFresh
        ? `${yrs} في مجال ${focus || role}`
        : `${role} بخبرة ${yrs} في مجال ${focus || role}`
      : `${role} متخصص في ${focus || presetLabel}`;

    const valueSentence = goal
      ? `أركز على ${goal} وتحويل التحديات اليومية إلى نتائج ملموسة وقابلة للقياس.`
      : 'أحرص على تقديم عمل عالي الجودة والالتزام بالمعايير المهنية وتحقيق نتائج ملموسة لفريق العمل والعملاء.';

    const generated = `${expSentence}. ${valueSentence} أتطلع دائماً للمساهمة في مشاريع طموحة تترك أثراً حقيقياً ومستداماً.`;
    updateField('bio', generated);
    showToast('تم توليد نبذتك المهنية المخصصة بنجاح');
  };

  const safeAvatarPreview = sanitizeAvatarSrc(profile.avatarDataUrl);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-ink">الهوية والبيانات الأساسية</h3>
        <p className="text-xs text-muted mt-0.5">
          أي تعديل هنا ينعكس فوراً في البورتفوليو والسيرة الذاتية ATS
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700" htmlFor="inp-fullName">
            الاسم الكامل
          </label>
          <input
            id="inp-fullName"
            type="text"
            autoComplete="name"
            value={profile.fullName}
            onChange={(e) => updateField('fullName', e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-line bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
            placeholder="مثال: طارق العتيبي"
          />
        </div>

        <div className="space-y-1">
          <label
            className="block text-xs font-semibold text-slate-700"
            htmlFor="inp-primaryPortfolioLink"
          >
            الرابط المهني الرئيسي (يظهر في ترويسة ATS)
          </label>
          <input
            id="inp-primaryPortfolioLink"
            type="url"
            dir="ltr"
            spellCheck={false}
            autoCapitalize="none"
            value={profile.primaryPortfolioLink}
            onChange={(e) => handlePrimaryLinkChange(e.target.value)}
            onBlur={handlePrimaryLinkBlur}
            aria-invalid={linkWarning ? 'true' : 'false'}
            className="w-full px-3 py-2 rounded-xl border border-line bg-white text-xs text-left focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
            placeholder="https://linkedin.com/in/username"
          />
          {linkWarning && (
            <p className="text-[11px] text-rose-700 font-medium">{linkWarning}</p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-semibold text-slate-700" htmlFor="inp-jobTitle">
          المسمى الوظيفي / التخصص
        </label>
        <input
          id="inp-jobTitle"
          type="text"
          value={profile.jobTitle}
          onChange={(e) => updateField('jobTitle', e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-line bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
          placeholder="مثال: مهندس برمجيات أول"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700" htmlFor="inp-city">
            المدينة والدولة
          </label>
          <input
            id="inp-city"
            type="text"
            value={profile.city}
            onChange={(e) => updateField('city', e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-line bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700" htmlFor="inp-email">
            البريد الإلكتروني
          </label>
          <input
            id="inp-email"
            type="email"
            dir="ltr"
            autoComplete="email"
            spellCheck={false}
            autoCapitalize="none"
            value={profile.email}
            onChange={(e) => updateField('email', e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-line bg-white text-sm text-left focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
          />
        </div>
      </div>

      {/* Availability Status */}
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-slate-700" htmlFor="inp-availability">
          شارة التوفر للعمل (في البورتفوليو)
        </label>
        <select
          id="inp-availability"
          value={profile.availability}
          onChange={(e) => updateField('availability', e.target.value as AvailabilityId)}
          className="w-full px-3 py-2 rounded-xl border border-line bg-white text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
        >
          {AVAILABILITY_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* GitHub Recruiter & ATS Readiness Details (RenderCV / JSON Resume inspired) */}
      <details className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 group">
        <summary className="cursor-pointer text-xs font-bold text-ink select-none flex items-center justify-between gap-2">
          <span>تفاصيل التوظيف السريعة والـ ATS (اختياري — يُظهرها في السيرة)</span>
          <span className="text-slate-500 group-open:rotate-180 transition-transform">▾</span>
        </summary>
        <div className="mt-3 space-y-3 pt-3 border-t border-slate-200/70">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="inp-workMode" className="block text-[11px] font-semibold text-slate-700">
                نظام العمل المفضل
              </label>
              <select
                id="inp-workMode"
                value={profile.workModePreference}
                onChange={(e) =>
                  updateField('workModePreference', e.target.value as WorkModePreference)
                }
                className="w-full px-2.5 py-2 rounded-xl border border-line bg-white text-xs"
              >
                {WORK_MODE_OPTIONS.map((wm) => (
                  <option key={wm.id} value={wm.id}>
                    {wm.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="inp-noticePeriod" className="block text-[11px] font-semibold text-slate-700">
                فترة الإشعار / الجاهزية للانضمام
              </label>
              <input
                id="inp-noticePeriod"
                type="text"
                value={profile.noticePeriod}
                onChange={(e) => updateField('noticePeriod', e.target.value)}
                placeholder="مثال: متاح فوراً / شهر واحد"
                className="w-full px-3 py-2 rounded-xl border border-line bg-white text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="inp-workAuth" className="block text-[11px] font-semibold text-slate-700">
                تصريح العمل / الوضع النظامي
              </label>
              <input
                id="inp-workAuth"
                type="text"
                value={profile.workAuthorization}
                onChange={(e) => updateField('workAuthorization', e.target.value)}
                placeholder="مثال: إقامة قابلة للنقل / مواطن"
                className="w-full px-3 py-2 rounded-xl border border-line bg-white text-xs"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="inp-timezone" className="block text-[11px] font-semibold text-slate-700">
                المنطقة الزمنية (للعمل عن بُعد والكارت)
              </label>
              <select
                id="inp-timezone"
                value={profile.timezone}
                onChange={(e) => updateField('timezone', e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-line bg-white text-xs"
              >
                {TIMEZONE_OPTIONS.map((tz) => (
                  <option key={tz.id} value={tz.id}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </details>

      {/* Local Compressed Avatar Upload & Optional URL */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="block text-xs font-bold text-ink">الصورة الشخصية (تُحفظ محلياً فقط)</span>
            <span className="text-[11px] text-muted">
              تُضغط تلقائياً في متصفحك إلى WebP (حد أقصى 320×320 و120KB)
            </span>
          </div>
          {safeAvatarPreview && (
            <img
              src={safeAvatarPreview}
              alt={profile.fullName || 'الصورة الشخصية'}
              className="w-11 h-11 rounded-xl object-cover border border-line shrink-0"
            />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            id="inp-avatar-file"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleAvatarUpload}
            className="hidden"
          />
          <button
            type="button"
            disabled={compressingAvatar}
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-95 disabled:opacity-60"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {compressingAvatar ? 'جاري الضغط...' : 'رفع صورة من الجهاز'}
          </button>

          {profile.avatarDataUrl && (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
            >
              حذف الصورة (العودة للأحرف)
            </button>
          )}

          {avatarBytes !== null && (
            <span className="text-[11px] font-semibold text-emerald-700">
              الحجم المضغوط: {Math.round(avatarBytes / 1024)}KB
            </span>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-[11px] font-medium text-slate-600" htmlFor="inp-avatarUrl">
            أو لصق رابط صورة خارجي (اختياري)
          </label>
          <input
            id="inp-avatarUrl"
            type="url"
            dir="ltr"
            spellCheck={false}
            value={profile.avatarDataUrl.startsWith('data:') ? '' : profile.avatarDataUrl}
            onChange={(e) => updateField('avatarDataUrl', e.target.value)}
            placeholder="https://example.com/photo.jpg"
            className="w-full px-3 py-1.5 rounded-lg border border-line bg-white text-xs text-left focus:outline-none focus:border-teal-600"
          />
          {profile.avatarDataUrl &&
            !profile.avatarDataUrl.startsWith('data:') &&
            !sanitizeAvatarSrc(profile.avatarDataUrl) && (
              <p className="text-[11px] text-rose-700 font-medium">
                رابط الصورة يجب أن يبدأ بـ https:// أو http://
              </p>
            )}
        </div>
      </div>

      {/* Phone & Privacy Toggle */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700" htmlFor="inp-phone">
          رقم الجوال
        </label>
        <input
          id="inp-phone"
          type="tel"
          dir="ltr"
          autoComplete="tel"
          value={profile.phone}
          onChange={(e) => updateField('phone', e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-line bg-white text-sm text-left focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
        />

        <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100/70 transition-colors">
          <input
            id="inp-hidePhone"
            type="checkbox"
            checked={profile.hidePhoneInPortfolio}
            onChange={(e) => {
              updateField('hidePhoneInPortfolio', e.target.checked);
              showToast(
                e.target.checked
                  ? 'تم إخفاء رقم الجوال من البورتفوليو وملف HTML (سيبقى في السيرة الذاتية ATS)'
                  : 'تم إظهار رقم الجوال في البورتفوليو وملف HTML'
              );
            }}
            className="mt-0.5 w-4 h-4 rounded accent-teal-700 cursor-pointer"
          />
          <span className="text-xs text-slate-700 leading-relaxed">
            <strong className="font-semibold text-ink block">
              إخفاء الجوال في البورتفوليو العام وملف HTML وإظهاره في السيرة الذاتية ATS فقط
            </strong>
            ميزة خصوصية لحماية رقمك مع إبقائه متاحاً لجهات التوظيف في ورقة ATS PDF.
          </span>
        </label>
      </div>

      {/* Bio + Smart Bio Assistant + Guided 3-Field Generator */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-700" htmlFor="inp-bio">
            النبذة التعريفية / الملخص المهني
          </label>
          <span className="text-[11px] text-slate-400">{profile.bio.length} حرف</span>
        </div>
        <textarea
          id="inp-bio"
          rows={4}
          value={profile.bio}
          onChange={(e) => updateField('bio', e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-line bg-white text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
        />

        <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-200/80 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
              </svg>
              <span>لا تعرف ماذا تكتب؟ اختر نبذة جاهزة لمجال ({presetLabel})</span>
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {assist.bioTemplates.map((tpl) => (
              <button
                key={tpl.title}
                type="button"
                onClick={() => {
                  updateField('bio', tpl.text);
                  showToast(`تم إدراج قالب النبذة «${tpl.title}» — يمكنك تخصيص الأرقام الآن`);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-teal-700 hover:text-white text-teal-900 border border-teal-200 text-[11px] font-semibold transition-colors"
              >
                + {tpl.title}
              </button>
            ))}
          </div>

          <p className="text-[11px] text-teal-800/90 leading-snug">
            بعد اختيار القالب، استبدل الكلمات بين الأقواس المربعة{' '}
            <code className="px-1 py-0.5 bg-white rounded text-[10px]">[مثل العدد أو التخصص]</code>{' '}
            ببياناتك الحقيقية.
          </p>

          <details className="pt-2 border-t border-teal-200/70 group">
            <summary className="cursor-pointer text-[11px] font-bold text-teal-900 select-none flex items-center justify-between">
              <span>✨ أو أنشئ نبذة مخصصة لك تلقائياً (أجب عن 3 حقول فقط)</span>
              <span className="text-teal-700 group-open:rotate-180 transition-transform">▾</span>
            </summary>
            <div className="mt-2.5 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={wizYears}
                  onChange={(e) => setWizYears(e.target.value)}
                  placeholder="الخبرة (مثال: 3 سنوات / خريج حديث)"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-teal-200 bg-white text-xs focus:outline-none focus:border-teal-600"
                />
                <input
                  type="text"
                  value={wizFocus}
                  onChange={(e) => setWizFocus(e.target.value)}
                  placeholder="أهم تخصص أو مهارة (مثال: تحليل البيانات)"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-teal-200 bg-white text-xs focus:outline-none focus:border-teal-600"
                />
              </div>
              <input
                type="text"
                value={wizGoal}
                onChange={(e) => setWizGoal(e.target.value)}
                placeholder="أبرز إنجاز أو قيمة تقدمها (مثال: رفع المبيعات وتنظيم التقارير)"
                className="w-full px-2.5 py-1.5 rounded-lg border border-teal-200 bg-white text-xs focus:outline-none focus:border-teal-600"
              />
              <button
                type="button"
                onClick={handleGenerateGuidedBio}
                className="w-full py-2 rounded-lg text-xs font-bold text-white hover:opacity-95 transition-opacity"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                توليد النبذة وإدراجها الآن
              </button>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};
