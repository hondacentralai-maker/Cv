import React, { useEffect, useId, useRef, useState } from 'react';
import { getAccentMeta } from '../../data/presets';
import {
  CARD_CORNER_OPTIONS,
  CARD_FONT_SCALE_OPTIONS,
  CARD_ORIENTATION_OPTIONS,
  CARD_PALETTES,
  CARD_PATTERNS,
  CARD_PURPOSE_PRESETS,
  CARD_TEMPLATES,
  evaluateBusinessCardHealth,
  resolveBusinessCardModel,
  suggestAccessibleTextColor,
  suggestSmartTagline,
} from '../../lib/cardEngine';
import {
  downloadCardPng,
  downloadCardQrPng,
  downloadCardVcf,
  downloadStandaloneInteractiveCardHtml,
} from '../../lib/cardExport';
import { generateQrDataUrl } from '../../lib/exportUtils';
import { compressAvatarFile } from '../../lib/imageCompress';
import { isSafeLinkOrEmpty, sanitizeUrl } from '../../lib/sanitize';
import type {
  BusinessCardConfig,
  CardAvatarMode,
  PortfolioData,
} from '../../types/portfolio';
import { useToast } from '../layout/ToastProvider';
import { BusinessCardVisual } from './BusinessCardVisual';

type StudioTabId = 'content' | 'style' | 'qr' | 'export';
type CardViewMode = 'both' | 'front' | 'back';

interface BusinessCardStudioTabProps {
  data: PortfolioData;
  versionName: string;
  onChangeCard: (updater: (prev: BusinessCardConfig) => BusinessCardConfig) => void;
  onPrintCard: (layout: 'single' | 'sheet') => void;
}

const STUDIO_TABS: { id: StudioTabId; label: string }[] = [
  { id: 'content', label: 'المحتوى والهوية' },
  { id: 'style', label: 'القالب والألوان' },
  { id: 'qr', label: 'QR والخصوصية' },
  { id: 'export', label: 'الطباعة والتصدير' },
];

export const BusinessCardStudioTab: React.FC<BusinessCardStudioTabProps> = ({
  data,
  versionName,
  onChangeCard,
  onPrintCard,
}) => {
  const { showToast } = useToast();
  const baseId = useId();
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [studioTab, setStudioTab] = useState<StudioTabId>('content');
  const [viewMode, setViewMode] = useState<CardViewMode>('both');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [exportingPng, setExportingPng] = useState<string | null>(null);
  const [compressingLogo, setCompressingLogo] = useState(false);
  const [websiteWarning, setWebsiteWarning] = useState<string | null>(null);

  const model = resolveBusinessCardModel(data);
  const health = evaluateBusinessCardHealth(data);
  const card = model.config;
  const globalAccent = getAccentMeta(data.design.accent);

  useEffect(() => {
    let cancelled = false;
    generateQrDataUrl(model.qrPayload, 280)
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl('');
      });
    return () => {
      cancelled = true;
    };
  }, [model.qrPayload]);

  const updateCardField = <K extends keyof BusinessCardConfig>(
    key: K,
    value: BusinessCardConfig[K]
  ) => {
    onChangeCard((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyPurpose = (purposeId: BusinessCardConfig['purpose']) => {
    const preset = CARD_PURPOSE_PRESETS.find((p) => p.id === purposeId);
    if (!preset) return;
    onChangeCard((prev) => ({
      ...prev,
      ...preset.patch,
      tagline: prev.tagline.trim() ? prev.tagline : suggestSmartTagline(data),
    }));
    showToast(`تم تهيئة الكارت لوضع «${preset.label}» بذكاء`);
  };

  const handleToggleSyncFromProfile = (checked: boolean) => {
    if (!checked && card.syncFromProfile) {
      // Seed custom fields with current profile values so user edits smoothly from existing text
      onChangeCard((prev) => ({
        ...prev,
        syncFromProfile: false,
        customFullName: prev.customFullName || data.profile.fullName,
        customJobTitle: prev.customJobTitle || data.profile.jobTitle,
        customPhone: prev.customPhone || data.profile.phone,
        customEmail: prev.customEmail || data.profile.email,
        customCity: prev.customCity || data.profile.city,
        customWebsite: prev.customWebsite || data.profile.primaryPortfolioLink,
      }));
      return;
    }
    updateCardField('syncFromProfile', checked);
  };

  const handleGenerateSmartTagline = () => {
    const suggested = suggestSmartTagline(data);
    updateCardField('tagline', suggested);
    showToast('تم اقتراح جملة تعريفية ذكية من سيرتك ومجالك');
  };

  const handleFixContrast = () => {
    const fixedText = suggestAccessibleTextColor(model.effectiveBg);
    updateCardField('textColor', fixedText);
    showToast('تم ضبط لون النص لتحقيق أفضل تباين قرائي');
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompressingLogo(true);
    try {
      const res = await compressAvatarFile(file);
      onChangeCard((prev) => ({
        ...prev,
        customLogoDataUrl: res.dataUrl,
        avatarMode: 'custom_logo',
      }));
      showToast(
        `تم ضغط الشعار محلياً (${Math.round(res.sizeBytes / 1024)}KB) وحفظه داخل الكارت`
      );
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'تعذّر معالجة صورة الشعار',
        'rose'
      );
    } finally {
      setCompressingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const handleCustomWebsiteChange = (raw: string) => {
    updateCardField('customWebsite', raw);
    if (raw.trim() && !isSafeLinkOrEmpty(raw)) {
      setWebsiteWarning('يرجى إدخال رابط يبدأ بـ https:// أو http://');
    } else {
      setWebsiteWarning(null);
    }
  };

  const handleCustomWebsiteBlur = () => {
    const trimmed = card.customWebsite.trim();
    if (!trimmed) {
      setWebsiteWarning(null);
      return;
    }
    const safe = sanitizeUrl(trimmed);
    if (!safe) {
      setWebsiteWarning('رابط غير صالح — تم تجاهله في QR والتصدير');
    } else {
      setWebsiteWarning(null);
      if (safe !== card.customWebsite) {
        updateCardField('customWebsite', safe);
      }
    }
  };

  const handleExportPng = async (mode: 'front' | 'back' | 'both') => {
    setExportingPng(mode);
    try {
      await downloadCardPng(data, mode);
      showToast('تم تصدير الكارت كصورة PNG عالية الدقة (300 DPI)');
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'تعذّر تصدير الصورة حالياً',
        'rose'
      );
    } finally {
      setExportingPng(null);
    }
  };

  const handleExportInteractiveHtml = async () => {
    try {
      await downloadStandaloneInteractiveCardHtml(data);
      showToast('تم تحميل الكارت التفاعلي المستقل (HTML)');
    } catch {
      showToast('تعذّر تصدير الكارت التفاعلي', 'rose');
    }
  };

  const healthColor =
    health.score >= 85 ? '#0F766E' : health.score >= 60 ? '#D97706' : '#E11D48';

  return (
    <section className="no-print max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-5">
      {/* Studio Top Bar + Purpose Selector */}
      <div className="bg-white border border-line rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-ink">
                استوديو تصميم الكارت الشخصي الذكي
              </h2>
              <span
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border"
                style={{
                  color: healthColor,
                  borderColor: `${healthColor}40`,
                  backgroundColor: `${healthColor}10`,
                }}
              >
                <span>جاهزية الكارت:</span>
                <span>{health.score}%</span>
              </span>
            </div>
            <p className="text-xs text-muted mt-1">
              يرتبط تلقائياً ببيانات نسخة «{versionName}» مع ذكاء تباين الألوان وQR حقيقي أوفلاين وطباعة بمقاس 85×55 مم
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onPrintCard('single')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-xs hover:opacity-95 transition-opacity"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              <span>طباعة كارت للقص (85×55 مم)</span>
            </button>
            <button
              type="button"
              onClick={() => handleExportPng('both')}
              disabled={exportingPng !== null}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-60"
            >
              <span>{exportingPng === 'both' ? 'جاري التصدير...' : 'تحميل PNG عالي الدقة'}</span>
            </button>
          </div>
        </div>

        {/* Purpose Smart Presets (Choice Cards following card guidance) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-ink">
              تهيئة ذكية حسب هدف الكارت:
            </span>
            <span className="text-[11px] text-muted hidden sm:inline">
              يضبط القالب وهدف رمز QR والحقول تلقائياً دون مسح شعارك
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {CARD_PURPOSE_PRESETS.map((preset) => {
              const selected = card.purpose === preset.id;
              return (
                <label
                  key={preset.id}
                  className="basma-choice-card rounded-xl p-3 bg-white cursor-pointer flex items-start justify-between gap-2 transition-shadow hover:shadow-xs"
                >
                  <input
                    type="radio"
                    name={`${baseId}-purpose`}
                    value={preset.id}
                    checked={selected}
                    onChange={() => handleApplyPurpose(preset.id)}
                    className="visually-hidden"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-ink">{preset.label}</div>
                    <p className="text-[11px] text-muted mt-0.5 leading-snug">{preset.desc}</p>
                  </div>
                  <span
                    className="choice-check w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold"
                    style={
                      selected
                        ? { backgroundColor: 'var(--accent)', color: '#FFFFFF' }
                        : { backgroundColor: '#F1F5F9', color: '#94A3B8' }
                    }
                    aria-hidden="true"
                  >
                    {selected ? '✓' : ''}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main 12-Col Studio Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Controls Panel (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-line rounded-2xl shadow-sm overflow-hidden">
          {/* Single-row Accessible Tablist */}
          <div className="border-b border-line bg-slate-50/80 px-2 pt-2">
            <div
              role="tablist"
              aria-label="أقسام استوديو الكارت الشخصي"
              className="flex items-center gap-1 overflow-x-auto no-scrollbar"
            >
              {STUDIO_TABS.map((t) => {
                const active = studioTab === t.id;
                return (
                  <button
                    key={t.id}
                    id={`${baseId}-tab-${t.id}`}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setStudioTab(t.id)}
                    className="basma-tab-btn shrink-0 px-3 py-2.5 text-xs font-semibold text-slate-600 hover:text-ink transition-colors whitespace-nowrap"
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            role="tabpanel"
            aria-labelledby={`${baseId}-tab-${studioTab}`}
            className="p-4 sm:p-5 max-h-[calc(100vh-240px)] overflow-y-auto space-y-5"
          >
            {/* PANEL 1: CONTENT & IDENTITY */}
            {studioTab === 'content' && (
              <div className="space-y-4">
                {/* Sync Switch */}
                <label className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-line cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-ink">
                      مزامنة ذكية من بيانات البورتفوليو
                    </div>
                    <div className="text-[11px] text-muted mt-0.5">
                      {card.syncFromProfile
                        ? 'مفعّل — يحدّث الاسم والمسمى وبيانات التواصل تلقائياً من المحرر'
                        : 'مخصص — يمكنك كتابة بيانات خاصة بالكارت فقط دون تغيير سيرتك'}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={card.syncFromProfile}
                    onChange={(e) => handleToggleSyncFromProfile(e.target.checked)}
                    className="w-4 h-4 rounded accent-teal-700 cursor-pointer shrink-0"
                  />
                </label>

                {!card.syncFromProfile && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-amber-50/40 border border-amber-200/80">
                    <div className="space-y-1">
                      <label htmlFor={`${baseId}-cname`} className="block text-[11px] font-bold text-slate-700">
                        الاسم على الكارت
                      </label>
                      <input
                        id={`${baseId}-cname`}
                        type="text"
                        value={card.customFullName}
                        onChange={(e) => updateCardField('customFullName', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-line bg-white text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor={`${baseId}-cjob`} className="block text-[11px] font-bold text-slate-700">
                        المسمى الوظيفي بالكارت
                      </label>
                      <input
                        id={`${baseId}-cjob`}
                        type="text"
                        value={card.customJobTitle}
                        onChange={(e) => updateCardField('customJobTitle', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-line bg-white text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor={`${baseId}-cphone`} className="block text-[11px] font-bold text-slate-700">
                        رقم الجوال بالكارت
                      </label>
                      <input
                        id={`${baseId}-cphone`}
                        type="tel"
                        dir="ltr"
                        value={card.customPhone}
                        onChange={(e) => updateCardField('customPhone', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-line bg-white text-xs text-left"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor={`${baseId}-cemail`} className="block text-[11px] font-bold text-slate-700">
                        البريد بالكارت
                      </label>
                      <input
                        id={`${baseId}-cemail`}
                        type="email"
                        dir="ltr"
                        value={card.customEmail}
                        onChange={(e) => updateCardField('customEmail', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-line bg-white text-xs text-left"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor={`${baseId}-ccity`} className="block text-[11px] font-bold text-slate-700">
                        المدينة
                      </label>
                      <input
                        id={`${baseId}-ccity`}
                        type="text"
                        value={card.customCity}
                        onChange={(e) => updateCardField('customCity', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-line bg-white text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor={`${baseId}-cweb`} className="block text-[11px] font-bold text-slate-700">
                        الرابط / الموقع
                      </label>
                      <input
                        id={`${baseId}-cweb`}
                        type="url"
                        dir="ltr"
                        value={card.customWebsite}
                        onChange={(e) => handleCustomWebsiteChange(e.target.value)}
                        onBlur={handleCustomWebsiteBlur}
                        className="w-full px-3 py-2 rounded-xl border border-line bg-white text-xs text-left"
                        placeholder="https://..."
                      />
                      {websiteWarning && (
                        <p className="text-[10px] text-rose-700 font-medium">{websiteWarning}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Card-Specific Branding Fields */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label htmlFor={`${baseId}-brand`} className="block text-xs font-bold text-slate-700">
                      اسم الشركة / المكتب / العلامة الشخصية (اختياري)
                    </label>
                    <input
                      id={`${baseId}-brand`}
                      type="text"
                      maxLength={48}
                      value={card.companyOrBrand}
                      onChange={(e) => updateCardField('companyOrBrand', e.target.value)}
                      placeholder="مثال: استوديو أفق الرقمي"
                      className="w-full px-3 py-2 rounded-xl border border-line bg-white text-xs focus:outline-none focus:border-teal-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <label htmlFor={`${baseId}-tagline`} className="text-xs font-bold text-slate-700">
                        الجملة التعريفية على الكارت (Tagline)
                      </label>
                      <button
                        type="button"
                        onClick={handleGenerateSmartTagline}
                        className="text-[11px] font-bold hover:underline"
                        style={{ color: 'var(--accent)' }}
                      >
                        ✨ توليد جملة ذكية من سيرتك
                      </button>
                    </div>
                    <input
                      id={`${baseId}-tagline`}
                      type="text"
                      maxLength={85}
                      value={card.tagline}
                      onChange={(e) => updateCardField('tagline', e.target.value)}
                      placeholder="جملة قصيرة تلخّص قيمتك في سطر واحد..."
                      className="w-full px-3 py-2 rounded-xl border border-line bg-white text-xs focus:outline-none focus:border-teal-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor={`${baseId}-backnote`} className="block text-xs font-bold text-slate-700">
                      رسالة الوجه الخلفي (اختياري)
                    </label>
                    <input
                      id={`${baseId}-backnote`}
                      type="text"
                      maxLength={95}
                      value={card.backNote}
                      onChange={(e) => updateCardField('backNote', e.target.value)}
                      placeholder="اتركه فارغاً لاستخدام الجملة التعريفية تلقائياً"
                      className="w-full px-3 py-2 rounded-xl border border-line bg-white text-xs focus:outline-none focus:border-teal-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label htmlFor={`${baseId}-booking`} className="block text-xs font-bold text-slate-700">
                        رابط حجز اجتماع (Cal.com / Calendly)
                      </label>
                      <input
                        id={`${baseId}-booking`}
                        type="url"
                        dir="ltr"
                        value={card.bookingUrl}
                        onChange={(e) => updateCardField('bookingUrl', e.target.value)}
                        onBlur={() => {
                          const s = sanitizeUrl(card.bookingUrl);
                          if (s && s !== card.bookingUrl) updateCardField('bookingUrl', s);
                        }}
                        placeholder="https://cal.com/username"
                        className="w-full px-3 py-2 rounded-xl border border-line bg-white text-xs text-left focus:outline-none focus:border-teal-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor={`${baseId}-resp`} className="block text-xs font-bold text-slate-700">
                        وسم تواصل بالخلف (اختياري)
                      </label>
                      <input
                        id={`${baseId}-resp`}
                        type="text"
                        maxLength={32}
                        value={card.quickResponseTag}
                        onChange={(e) => updateCardField('quickResponseTag', e.target.value)}
                        placeholder="مثال: يرد خلال ساعتين"
                        className="w-full px-3 py-2 rounded-xl border border-line bg-white text-xs focus:outline-none focus:border-teal-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Avatar / Custom Logo Controls */}
                <div className="space-y-2.5 pt-2 border-t border-slate-100">
                  <span className="block text-xs font-bold text-ink">
                    الصورة أو الشعار على الوجه الأمامي
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        { id: 'profile', label: 'صورة البورتفوليو' },
                        { id: 'initials', label: 'الأحرف الأولى (مونوجرام)' },
                        { id: 'custom_logo', label: 'شعار خاص للكارت' },
                        { id: 'none', label: 'بدون صورة/شعار' },
                      ] as { id: CardAvatarMode; label: string }[]
                    ).map((opt) => (
                      <label
                        key={opt.id}
                        className="basma-choice-card rounded-xl px-3 py-2 bg-white cursor-pointer flex items-center justify-between gap-2 text-xs font-semibold text-slate-700"
                      >
                        <input
                          type="radio"
                          name={`${baseId}-avatar-mode`}
                          value={opt.id}
                          checked={card.avatarMode === opt.id}
                          onChange={() => updateCardField('avatarMode', opt.id)}
                          className="visually-hidden"
                        />
                        <span className="truncate">{opt.label}</span>
                        <span
                          className="text-[11px] font-bold"
                          style={{
                            color: card.avatarMode === opt.id ? 'var(--accent)' : 'transparent',
                          }}
                          aria-hidden="true"
                        >
                          ✓
                        </span>
                      </label>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={compressingLogo}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                      {compressingLogo
                        ? 'جاري الضغط محلياً...'
                        : card.customLogoDataUrl
                        ? 'تغيير الشعار المخصص'
                        : 'رفع شعار للكارت (ضغط محلي WebP)'}
                    </button>
                    {card.customLogoDataUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          onChangeCard((prev) => ({
                            ...prev,
                            customLogoDataUrl: '',
                            avatarMode: 'profile',
                          }))
                        }
                        className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100"
                      >
                        حذف الشعار
                      </button>
                    )}
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PANEL 2: TEMPLATE & COLORS */}
            {studioTab === 'style' && (
              <div className="space-y-5">
                {/* Visual Template Radio Choice Cards */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-ink">
                      قالب الكارت الهندسي ({CARD_TEMPLATES.length} تصاميم احترافية)
                    </span>
                    <span className="text-[10.5px] text-muted">تتضمن تصاميم GitHub مفتوحة المصدر</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {CARD_TEMPLATES.map((tpl) => {
                      const active = card.template === tpl.id;
                      return (
                        <label
                          key={tpl.id}
                          className="basma-choice-card rounded-xl p-3 bg-white cursor-pointer flex items-start justify-between gap-2"
                        >
                          <input
                            type="radio"
                            name={`${baseId}-template`}
                            value={tpl.id}
                            checked={active}
                            onChange={() =>
                              onChangeCard((prev) => ({
                                ...prev,
                                template: tpl.id,
                                bgColor: tpl.recommendedBg,
                                textColor: tpl.recommendedText,
                                ...(tpl.recommendedAccent
                                  ? { useBrandAccent: false, accentColor: tpl.recommendedAccent }
                                  : {}),
                                pattern: tpl.defaultPattern,
                              }))
                            }
                            className="visually-hidden"
                          />
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-xs font-bold text-ink">{tpl.name}</span>
                              {tpl.inspiration !== 'قياسي' && (
                                <span className="px-1.5 py-0.5 rounded-md text-[9.5px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                  {tpl.inspiration}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-muted mt-0.5 leading-snug">{tpl.desc}</p>
                          </div>
                          <span
                            className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                            style={
                              active
                                ? { backgroundColor: 'var(--accent)', color: '#FFFFFF' }
                                : { backgroundColor: '#F1F5F9', color: 'transparent' }
                            }
                            aria-hidden="true"
                          >
                            ✓
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Orientation & Double-sided */}
                <div className="grid grid-cols-2 gap-2.5">
                  {CARD_ORIENTATION_OPTIONS.map((ori) => {
                    const active = card.orientation === ori.id;
                    return (
                      <label
                        key={ori.id}
                        className="basma-choice-card rounded-xl p-3 bg-white cursor-pointer flex items-center justify-between gap-2"
                      >
                        <input
                          type="radio"
                          name={`${baseId}-orientation`}
                          value={ori.id}
                          checked={active}
                          onChange={() => updateCardField('orientation', ori.id)}
                          className="visually-hidden"
                        />
                        <div>
                          <div className="text-xs font-bold text-ink">{ori.label}</div>
                          <div className="text-[10px] text-muted">{ori.dimsLabel}</div>
                        </div>
                        <span
                          className="text-xs font-bold"
                          style={{ color: active ? 'var(--accent)' : '#CBD5E1' }}
                          aria-hidden="true"
                        >
                          {ori.id === 'landscape' ? '▭' : '▯'}
                        </span>
                      </label>
                    );
                  })}
                </div>

                {/* Curated High-Contrast Color Palettes */}
                <div className="space-y-2">
                  <span className="block text-xs font-bold text-ink">باليتات ألوان متناسقة</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {CARD_PALETTES.map((pal) => {
                      const active =
                        card.bgColor.toUpperCase() === pal.bgColor &&
                        card.textColor.toUpperCase() === pal.textColor &&
                        card.useBrandAccent === pal.useBrandAccent;
                      return (
                        <button
                          key={pal.id}
                          type="button"
                          onClick={() =>
                            onChangeCard((prev) => ({
                              ...prev,
                              bgColor: pal.bgColor,
                              textColor: pal.textColor,
                              accentColor: pal.accentColor,
                              useBrandAccent: pal.useBrandAccent,
                            }))
                          }
                          className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border text-right text-[11px] font-semibold transition-all ${
                            active
                              ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                              : 'border-line bg-white hover:bg-slate-50'
                          }`}
                        >
                          <span
                            className="w-5 h-5 rounded-md border border-slate-300 shrink-0 flex items-center justify-center text-[9px] font-bold"
                            style={{ backgroundColor: pal.bgColor, color: pal.textColor }}
                            aria-hidden="true"
                          >
                            أ
                          </span>
                          <span className="truncate">{pal.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Color Pickers + Real-time WCAG Contrast Checker */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-line space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-ink">تخصيص الألوان يدوياً</span>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold">
                      <span
                        className={`px-2 py-0.5 rounded-full border ${
                          model.contrastStatus === 'low'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {model.contrastStatus === 'low' ? '⚠' : '✓'} تباين {model.contrastRatio}:1
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    <label className="space-y-1 text-[11px] font-semibold text-slate-700 block">
                      <span>الخلفية</span>
                      <div className="flex items-center gap-1.5 bg-white border border-line rounded-lg px-2 py-1">
                        <input
                          type="color"
                          value={card.bgColor}
                          onChange={(e) => updateCardField('bgColor', e.target.value)}
                          className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
                        />
                        <span dir="ltr" className="text-[10px] text-slate-500">
                          {card.bgColor}
                        </span>
                      </div>
                    </label>

                    <label className="space-y-1 text-[11px] font-semibold text-slate-700 block">
                      <span>لون النص</span>
                      <div className="flex items-center gap-1.5 bg-white border border-line rounded-lg px-2 py-1">
                        <input
                          type="color"
                          value={card.textColor}
                          onChange={(e) => updateCardField('textColor', e.target.value)}
                          className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
                        />
                        <span dir="ltr" className="text-[10px] text-slate-500">
                          {card.textColor}
                        </span>
                      </div>
                    </label>

                    <label className="space-y-1 text-[11px] font-semibold text-slate-700 block">
                      <span>التمييز</span>
                      <div className="flex items-center gap-1.5 bg-white border border-line rounded-lg px-2 py-1">
                        <input
                          type="color"
                          value={card.useBrandAccent ? globalAccent.hex : card.accentColor}
                          onChange={(e) =>
                            onChangeCard((prev) => ({
                              ...prev,
                              useBrandAccent: false,
                              accentColor: e.target.value,
                            }))
                          }
                          className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
                        />
                        <span dir="ltr" className="text-[10px] text-slate-500">
                          {card.useBrandAccent ? globalAccent.hex : card.accentColor}
                        </span>
                      </div>
                    </label>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <label className="inline-flex items-center gap-2 text-[11px] font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={card.useBrandAccent}
                        onChange={(e) => updateCardField('useBrandAccent', e.target.checked)}
                        className="w-3.5 h-3.5 rounded accent-teal-700"
                      />
                      <span>مزامنة لون التمييز مع هوية البورتفوليو ({globalAccent.name})</span>
                    </label>

                    {model.contrastStatus === 'low' && (
                      <button
                        type="button"
                        onClick={handleFixContrast}
                        className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-bold hover:bg-rose-700"
                      >
                        تصحيح لون النص
                      </button>
                    )}
                  </div>
                </div>

                {/* Pattern, Corner Radius & Font Scale */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label htmlFor={`${baseId}-pattern`} className="block text-[11px] font-bold text-slate-700">
                      خلفية هندسية
                    </label>
                    <select
                      id={`${baseId}-pattern`}
                      value={card.pattern}
                      onChange={(e) =>
                        updateCardField('pattern', e.target.value as BusinessCardConfig['pattern'])
                      }
                      className="w-full px-2.5 py-2 rounded-xl border border-line bg-white text-xs"
                    >
                      {CARD_PATTERNS.map((pt) => (
                        <option key={pt.id} value={pt.id}>
                          {pt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor={`${baseId}-corner`} className="block text-[11px] font-bold text-slate-700">
                      حواف الكارت
                    </label>
                    <select
                      id={`${baseId}-corner`}
                      value={card.cornerStyle}
                      onChange={(e) =>
                        updateCardField(
                          'cornerStyle',
                          e.target.value as BusinessCardConfig['cornerStyle']
                        )
                      }
                      className="w-full px-2.5 py-2 rounded-xl border border-line bg-white text-xs"
                    >
                      {CARD_CORNER_OPTIONS.map((co) => (
                        <option key={co.id} value={co.id}>
                          {co.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor={`${baseId}-scale`} className="block text-[11px] font-bold text-slate-700">
                      حجم الخط
                    </label>
                    <select
                      id={`${baseId}-scale`}
                      value={card.fontScale}
                      onChange={(e) =>
                        updateCardField(
                          'fontScale',
                          e.target.value as BusinessCardConfig['fontScale']
                        )
                      }
                      className="w-full px-2.5 py-2 rounded-xl border border-line bg-white text-xs"
                    >
                      {CARD_FONT_SCALE_OPTIONS.map((fs) => (
                        <option key={fs.id} value={fs.id}>
                          {fs.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* PANEL 3: QR & PRIVACY */}
            {studioTab === 'qr' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="block text-xs font-bold text-ink">ماذا يفعل رمز QR عند مسحه بالكاميرا؟</span>
                  <div className="space-y-2">
                    {[
                      {
                        id: 'vcard' as const,
                        title: `حفظ جهة اتصال فوري (vCard ${card.vcardVersion})`,
                        desc: 'يفتح شاشة «إضافة جهة اتصال» مباشرة دون إنترنت شاملاً بياناتك الظاهرة.',
                      },
                      {
                        id: 'whatsapp' as const,
                        title: 'فتح محادثة واتساب مباشرة',
                        desc: 'يوجه العميل أو مسؤول التوظيف إلى واتساب برسالة ترحيبية مخصصة.',
                      },
                      {
                        id: 'booking' as const,
                        title: 'رابط حجز اجتماع مباشر (Cal.com / Calendly)',
                        desc: 'يتيح لمن يمسح الكارت حجز مكالمة أو مقابلة معك مباشرة.',
                      },
                      {
                        id: 'link' as const,
                        title: 'زيارة رابطك المهني (LinkedIn / GitHub)',
                        desc: 'يفتح رابط ملفك المهني الرئيسي المحدد في بيانات الهوية.',
                      },
                    ].map((opt) => {
                      const active = card.qrTarget === opt.id;
                      return (
                        <label
                          key={opt.id}
                          className="basma-choice-card rounded-xl p-3 bg-white cursor-pointer flex items-start justify-between gap-2"
                        >
                          <input
                            type="radio"
                            name={`${baseId}-qr-target`}
                            value={opt.id}
                            checked={active}
                            onChange={() =>
                              onChangeCard((prev) => ({
                                ...prev,
                                qrTarget: opt.id,
                                qrCaption:
                                  opt.id === 'whatsapp'
                                    ? 'امسح للتواصل عبر واتساب'
                                    : opt.id === 'booking'
                                    ? 'امسح لحجز اجتماع سريع'
                                    : opt.id === 'link'
                                    ? 'امسح لزيارة ملفي المهني'
                                    : 'امسح لحفظ جهة الاتصال',
                              }))
                            }
                            className="visually-hidden"
                          />
                          <div>
                            <div className="text-xs font-bold text-ink">{opt.title}</div>
                            <p className="text-[11px] text-muted mt-0.5">{opt.desc}</p>
                          </div>
                          <span
                            className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                            style={
                              active
                                ? { backgroundColor: 'var(--accent)', color: '#FFFFFF' }
                                : { backgroundColor: '#F1F5F9', color: 'transparent' }
                            }
                            aria-hidden="true"
                          >
                            ✓
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {model.qrFallbackNotice && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] font-semibold text-amber-900">
                    ⚠ {model.qrFallbackNotice}
                  </div>
                )}

                {card.qrTarget === 'whatsapp' && (
                  <div className="space-y-1">
                    <label htmlFor={`${baseId}-waprefill`} className="block text-xs font-bold text-slate-700">
                      الرسالة التلقائية عند فتح واتساب
                    </label>
                    <input
                      id={`${baseId}-waprefill`}
                      type="text"
                      maxLength={140}
                      value={card.whatsappPrefill}
                      onChange={(e) => updateCardField('whatsappPrefill', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-line bg-white text-xs"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor={`${baseId}-qrpos`} className="block text-xs font-bold text-slate-700">
                      موضع رمز QR
                    </label>
                    <select
                      id={`${baseId}-qrpos`}
                      value={card.qrPlacement}
                      onChange={(e) =>
                        updateCardField(
                          'qrPlacement',
                          e.target.value as BusinessCardConfig['qrPlacement']
                        )
                      }
                      className="w-full px-2.5 py-2 rounded-xl border border-line bg-white text-xs"
                    >
                      <option value="back">على الوجه الخلفي فقط</option>
                      <option value="front">على الوجه الأمامي فقط</option>
                      <option value="both">على الوجهين معاً</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor={`${baseId}-qrcap`} className="block text-xs font-bold text-slate-700">
                      النص أسفل رمز QR
                    </label>
                    <input
                      id={`${baseId}-qrcap`}
                      type="text"
                      maxLength={36}
                      value={card.qrCaption}
                      onChange={(e) => updateCardField('qrCaption', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-line bg-white text-xs"
                    />
                    <label htmlFor={`${baseId}-vcardver`} className="block text-xs font-bold text-slate-700 pt-2">
                      إصدار صيغة ملف جهة الاتصال (.vcf)
                    </label>
                    <select
                      id={`${baseId}-vcardver`}
                      value={card.vcardVersion}
                      onChange={(e) =>
                        updateCardField(
                          'vcardVersion',
                          e.target.value as BusinessCardConfig['vcardVersion']
                        )
                      }
                      className="w-full px-2.5 py-2 rounded-xl border border-line bg-white text-xs"
                    >
                      <option value="3.0">vCard 3.0 — توافق شامل مع كل هواتف iOS وAndroid (موصى به)</option>
                      <option value="4.0">vCard 4.0 (RFC 6350) — مع المنطقة الزمنية والروابط المصنفة</option>
                    </select>
                  </div>
                </div>

                {/* Granular Field Visibility & Privacy Switches */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="block text-xs font-bold text-ink">
                    التحكم في الخصوصية وظهور الحقول على الكارت
                  </span>
                  {[
                    {
                      key: 'showPhone' as const,
                      label: 'إظهار رقم الجوال على الكارت وفي vCard',
                    },
                    { key: 'showEmail' as const, label: 'إظهار البريد الإلكتروني' },
                    { key: 'showCity' as const, label: 'إظهار المدينة / المقر' },
                    { key: 'showWebsite' as const, label: 'إظهار الرابط المهني الرئيسي' },
                    { key: 'showBookingOnCard' as const, label: 'إظهار رابط حجز الاجتماع (Cal / Calendly)' },
                    { key: 'showTimezone' as const, label: 'إظهار شارة المنطقة الزمنية بالخلف' },
                    { key: 'showAvailabilityBadge' as const, label: 'إظهار شارة التوفر الوظيفي' },
                    { key: 'showSkillsOnBack' as const, label: 'إظهار أبرز 4 مهارات على الوجه الخلفي' },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-line bg-white hover:bg-slate-50 cursor-pointer"
                    >
                      <span className="text-xs font-medium text-slate-700">{item.label}</span>
                      <input
                        type="checkbox"
                        checked={Boolean(card[item.key])}
                        onChange={(e) => updateCardField(item.key, e.target.checked)}
                        className="w-4 h-4 rounded accent-teal-700 cursor-pointer shrink-0"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* PANEL 4: PRINT & EXPORT */}
            {studioTab === 'export' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 leading-relaxed">
                  <strong>تصدير محلي 100%:</strong> يتم توليد الصور عالية الدقة (300 DPI) وملفات الطباعة محلياً على جهازك دون إرسال بياناتك لأي خادم.
                </div>

                <div className="space-y-2">
                  <span className="block text-xs font-bold text-ink">صور جاهزة للطباعة أو المشاركة (PNG 300 DPI)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleExportPng('front')}
                      disabled={exportingPng !== null}
                      className="px-3 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs hover:opacity-95 disabled:opacity-60"
                      style={{ backgroundColor: 'var(--accent)' }}
                    >
                      {exportingPng === 'front' ? 'جاري التحميل...' : 'تحميل الوجه الأمامي PNG'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportPng('back')}
                      disabled={exportingPng !== null}
                      className="px-3 py-2.5 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 disabled:opacity-60"
                    >
                      {exportingPng === 'back' ? 'جاري التحميل...' : 'تحميل الوجه الخلفي PNG'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportPng('both')}
                      disabled={exportingPng !== null}
                      className="sm:col-span-2 px-3 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-60"
                    >
                      {exportingPng === 'both'
                        ? 'جاري التجهيز...'
                        : 'تحميل الوجهين معاً في صورة واحدة PNG'}
                    </button>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="block text-xs font-bold text-ink">
                    طباعة ورقية بمقاس المطبعة الرسمي (85 × 55 مم)
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      type="button"
                      onClick={() => onPrintCard('single')}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold text-ink bg-white border border-slate-300 hover:bg-slate-50 text-right flex items-center justify-between"
                    >
                      <span>طباعة بطاقة واحدة (الأمام + الخلف مع علامات القص)</span>
                      <span className="text-[10px] text-muted">A4 / PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onPrintCard('sheet')}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold text-ink bg-white border border-slate-300 hover:bg-slate-50 text-right flex items-center justify-between"
                    >
                      <span>طباعة ورقة مطبعة كاملة (8 كروت أمام + 8 خلف)</span>
                      <span className="text-[10px] text-muted">صفحتا A4</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="block text-xs font-bold text-ink">تصدير رقمي بدون اتصال</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleExportInteractiveHtml}
                      className="sm:col-span-2 px-3 py-2.5 rounded-xl text-xs font-bold text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200"
                    >
                      تحميل كارت رقمي تفاعلي يقلب الوجهين (HTML أوفلاين)
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await downloadCardQrPng(data);
                          showToast('تم تحميل رمز QR المخصص للكارت كصورة PNG');
                        } catch {
                          showToast('تعذّر توليد صورة رمز QR', 'rose');
                        }
                      }}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
                    >
                      رمز QR منفصل PNG
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        downloadCardVcf(data);
                        showToast('تم تحميل ملف جهة الاتصال (.vcf) بنجاح');
                      }}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
                    >
                      ملف جهة الاتصال (.vcf)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Live Studio Canvas & Smart Card Advisor (7 cols) */}
        <div className="lg:col-span-7 lg:sticky lg:top-20 space-y-5">
          {/* Preview Canvas Box */}
          <div className="bg-slate-200/70 border border-slate-300/70 rounded-2xl p-4 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1 bg-white/90 p-1 rounded-xl border border-line">
                {(
                  [
                    { id: 'both', label: 'الوجهان معاً' },
                    { id: 'front', label: 'الوجه الأمامي' },
                    { id: 'back', label: 'الوجه الخلفي' },
                  ] as { id: CardViewMode; label: string }[]
                ).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setViewMode(m.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      viewMode === m.id
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-ink'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <span className="text-[11px] font-semibold text-slate-600 bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200">
                {card.orientation === 'portrait' ? '55 × 85 مم (عمودي)' : '85 × 55 مم (قياسي)'} •
                كثافة QR: {health.qrDensityLabel}
              </span>
            </div>

            {/* Rendered Cards */}
            <div
              className={`grid gap-5 items-center justify-items-center py-2 ${
                viewMode === 'both' && card.orientation === 'portrait'
                  ? 'grid-cols-1 sm:grid-cols-2'
                  : 'grid-cols-1'
              }`}
            >
              {(viewMode === 'front' || viewMode === 'both') && (
                <div
                  className={`w-full space-y-1.5 ${
                    card.orientation === 'portrait' ? 'max-w-[300px]' : 'max-w-[490px]'
                  }`}
                >
                  <div className="text-[11px] font-bold text-slate-600 px-1">الوجه الأمامي</div>
                  <BusinessCardVisual data={data} side="front" qrDataUrl={qrDataUrl} />
                </div>
              )}

              {(viewMode === 'back' || viewMode === 'both') && (
                <div
                  className={`w-full space-y-1.5 ${
                    card.orientation === 'portrait' ? 'max-w-[300px]' : 'max-w-[490px]'
                  }`}
                >
                  <div className="text-[11px] font-bold text-slate-600 px-1">الوجه الخلفي</div>
                  <BusinessCardVisual data={data} side="back" qrDataUrl={qrDataUrl} />
                </div>
              )}
            </div>
          </div>

          {/* Smart Card Quality Advisor */}
          <div className="bg-white border border-line rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-ink">المساعد الذكي لجودة الكارت</h3>
                <p className="text-[11px] text-muted mt-0.5">
                  فحص تلقائي للتباين اللوني ووضوح رمز QR وملاءمة النصوص للمقاس المطبوع
                </p>
              </div>
              <span className="text-sm font-bold" style={{ color: healthColor }}>
                {health.score}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {health.checks.map((chk) => {
                const icon = chk.status === 'good' ? '✓' : chk.status === 'warn' ? '!' : '✕';
                const badgeCls =
                  chk.status === 'good'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : chk.status === 'warn'
                    ? 'bg-amber-50 border-amber-200 text-amber-950'
                    : 'bg-rose-50 border-rose-200 text-rose-950';
                return (
                  <div
                    key={chk.id}
                    className={`p-3 rounded-xl border text-right space-y-1.5 ${badgeCls}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        <span aria-hidden="true">{icon}</span>
                        <span>{chk.title}</span>
                      </span>
                    </div>
                    <p className="text-[11px] opacity-90 leading-relaxed">{chk.detail}</p>
                    {chk.fixType && chk.fixLabel && (
                      <button
                        type="button"
                        onClick={() => {
                          if (chk.fixType === 'fix_contrast') handleFixContrast();
                          else if (chk.fixType === 'generate_tagline') handleGenerateSmartTagline();
                          else if (chk.fixType === 'enable_vcard_qr') {
                            updateCardField('qrTarget', 'vcard');
                          }
                        }}
                        className="mt-1 px-2.5 py-1 rounded-lg bg-white/90 hover:bg-white text-ink border border-slate-300 text-[11px] font-bold transition-colors"
                      >
                        {chk.fixLabel} ←
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

interface CardPrintSheetProps {
  data: PortfolioData;
  layout: 'single' | 'sheet';
  activeForPrint: boolean;
}

export const CardPrintSheet: React.FC<CardPrintSheetProps> = ({
  data,
  layout,
  activeForPrint,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const model = resolveBusinessCardModel(data);
  const isPortrait = model.config.orientation === 'portrait';

  useEffect(() => {
    let cancelled = false;
    generateQrDataUrl(model.qrPayload, 320)
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl('');
      });
    return () => {
      cancelled = true;
    };
  }, [model.qrPayload]);

  if (!activeForPrint) return null;

  const cardsPerPage = isPortrait ? 6 : 8;

  return (
    <section
      id="card-print-sheet"
      className="hidden print:block bg-white text-black"
      aria-label="صفحة طباعة الكارت الشخصي"
    >
      {layout === 'single' ? (
        <div className="space-y-6 p-2">
          <div className="text-xs font-bold text-slate-700 border-b border-slate-300 pb-2">
            بصمة | طباعة الكارت الشخصي — {model.fullName || 'بطاقة تواصل'} ({isPortrait ? '55×85 مم' : '85×55 مم'})
          </div>
          <div className="flex flex-wrap gap-8 items-start justify-center pt-4">
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-slate-500 text-center">الوجه الأمامي</div>
              <div className="p-2 border border-dashed border-slate-400 inline-block">
                <BusinessCardVisual data={data} side="front" qrDataUrl={qrDataUrl} printPhysical />
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-slate-500 text-center">الوجه الخلفي</div>
              <div className="p-2 border border-dashed border-slate-400 inline-block">
                <BusinessCardVisual data={data} side="back" qrDataUrl={qrDataUrl} printPhysical />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Page 1: Front Cards */}
          <div className="grid grid-cols-2 gap-3 justify-items-center pt-2">
            {Array.from({ length: cardsPerPage }).map((_, idx) => (
              <div key={`front-${idx}`} className="p-1 border border-dashed border-slate-300">
                <BusinessCardVisual data={data} side="front" qrDataUrl={qrDataUrl} printPhysical />
              </div>
            ))}
          </div>

          {/* Page 2: Back Cards */}
          <div
            className="grid grid-cols-2 gap-3 justify-items-center pt-2"
            style={{ pageBreakBefore: 'always', breakBefore: 'page' }}
          >
            {Array.from({ length: cardsPerPage }).map((_, idx) => (
              <div key={`back-${idx}`} className="p-1 border border-dashed border-slate-300">
                <BusinessCardVisual data={data} side="back" qrDataUrl={qrDataUrl} printPhysical />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

