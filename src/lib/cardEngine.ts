import {
  getAccentMeta,
  getAvailabilityMeta,
  getInitials,
  getTimezoneBadge,
} from '../data/presets';
import {
  DEFAULT_BUSINESS_CARD_CONFIG,
  type BusinessCardConfig,
  type CardCornerStyle,
  type CardFontScale,
  type CardOrientation,
  type CardPattern,
  type CardPurposeId,
  type CardTemplateId,
  type PortfolioData,
  type PresetId,
} from '../types/portfolio';
import { sanitizeAvatarSrc, sanitizeUrl } from './sanitize';

export interface CardTemplateOption {
  id: CardTemplateId;
  name: string;
  desc: string;
  category: 'clean' | 'dark' | 'modern';
  inspiration: string;
  recommendedBg: string;
  recommendedText: string;
  recommendedAccent?: string;
  defaultPattern: CardPattern;
}

export const CARD_TEMPLATES: CardTemplateOption[] = [
  {
    id: 'modern_split',
    name: 'عصري متوازن',
    desc: 'شريط هوية جانبي وأولوية بصرية واضحة للاسم والتواصل',
    category: 'modern',
    inspiration: 'قياسي',
    recommendedBg: '#0F172A',
    recommendedText: '#FFFFFF',
    defaultPattern: 'dots',
  },
  {
    id: 'bento_tile',
    name: 'بنتو معياري (Bento)',
    desc: 'مربعات معيارية منظمة مستوحاة من لوحات المنتجات على GitHub',
    category: 'modern',
    inspiration: 'GitHub Bento',
    recommendedBg: '#F5F5F7',
    recommendedText: '#0F172A',
    defaultPattern: 'none',
  },
  {
    id: 'glass_aurora',
    name: 'زجاجي متدرج (Glass Aurora)',
    desc: 'خلفية شفق متوهجة مع طبقة زجاجية شفافة وتأثير Frosted Glass',
    category: 'modern',
    inspiration: 'GitHub Glass UI',
    recommendedBg: '#1E1B4B',
    recommendedText: '#F8FAFC',
    recommendedAccent: '#C084FC',
    defaultPattern: 'none',
  },
  {
    id: 'terminal_dev',
    name: 'الطرفية التقنية (Terminal)',
    desc: 'واجهة مطورين أصلية بنمط GitHub Dark مع شريط نافذة ومسار كود',
    category: 'dark',
    inspiration: 'GitHub Dev CLI',
    recommendedBg: '#0D1117',
    recommendedText: '#F0F6FC',
    recommendedAccent: '#2EA043',
    defaultPattern: 'grid',
  },
  {
    id: 'executive_dark',
    name: 'تنفيذي داكن فاخر',
    desc: 'لمسة رسمية عميقة بإطار مميز وخط فاصل أنيق',
    category: 'dark',
    inspiration: 'Executive Dark',
    recommendedBg: '#0B1120',
    recommendedText: '#F8FAFC',
    defaultPattern: 'circuit',
  },
  {
    id: 'minimal_swiss',
    name: 'سويسري أبيض للطباعة',
    desc: 'خلفية ورقية نقية عالية التباين واقتصادية في حبر الطباعة',
    category: 'clean',
    inspiration: 'Swiss Grid',
    recommendedBg: '#FFFFFF',
    recommendedText: '#0F172A',
    defaultPattern: 'grid',
  },
  {
    id: 'editorial_stripe',
    name: 'مطبعي تحريري (Editorial)',
    desc: 'تصميم طباعي مستوحى من قوالب Reactive Resume بعلامات قص هندسية',
    category: 'clean',
    inspiration: 'Reactive Print',
    recommendedBg: '#FAF8F5',
    recommendedText: '#18181B',
    recommendedAccent: '#BE123C',
    defaultPattern: 'topography',
  },
  {
    id: 'creative_mesh',
    name: 'إبداعي هندسي',
    desc: 'تدرج لوني مستوحى من هويتك مع شكل زخرفي ناعم',
    category: 'modern',
    inspiration: 'Gradient Mesh',
    recommendedBg: '#134E4A',
    recommendedText: '#FFFFFF',
    defaultPattern: 'waves',
  },
];

export interface CardPurposePreset {
  id: CardPurposeId;
  label: string;
  desc: string;
  patch: Partial<BusinessCardConfig>;
}

export const CARD_PURPOSE_PRESETS: CardPurposePreset[] = [
  {
    id: 'networking',
    label: 'تواصل مهني وتوظيف',
    desc: 'مناسب للمعارض واللقاءات المهنية مع QR لحفظ جهة الاتصال ومهاراتك بالخلف',
    patch: {
      purpose: 'networking',
      template: 'modern_split',
      orientation: 'landscape',
      bgColor: '#0F172A',
      textColor: '#FFFFFF',
      pattern: 'dots',
      qrTarget: 'vcard',
      qrPlacement: 'back',
      qrCaption: 'امسح لحفظ جهة الاتصال',
      showPhone: true,
      showEmail: true,
      showCity: true,
      showWebsite: true,
      showAvailabilityBadge: true,
      showSkillsOnBack: true,
      doubleSided: true,
    },
  },
  {
    id: 'client',
    label: 'كسب عملاء وعمل حر',
    desc: 'يركّز على جملتك التسويقية وحالة التوفر مع QR مباشر لرسالة واتساب',
    patch: {
      purpose: 'client',
      template: 'creative_mesh',
      orientation: 'landscape',
      bgColor: '#134E4A',
      textColor: '#FFFFFF',
      pattern: 'waves',
      qrTarget: 'whatsapp',
      qrPlacement: 'front',
      qrCaption: 'امسح للتواصل عبر واتساب',
      showPhone: true,
      showEmail: true,
      showCity: true,
      showWebsite: true,
      showAvailabilityBadge: true,
      showSkillsOnBack: true,
      doubleSided: true,
    },
  },
  {
    id: 'executive',
    label: 'تنفيذي رسمي للطباعة',
    desc: 'تصميم سويسري أبيض نقي للورق المقوى بدون فوضى أو حبر زائد',
    patch: {
      purpose: 'executive',
      template: 'minimal_swiss',
      orientation: 'landscape',
      bgColor: '#FFFFFF',
      textColor: '#0F172A',
      pattern: 'none',
      qrTarget: 'vcard',
      qrPlacement: 'back',
      qrCaption: 'بطاقة تواصل رقمية vCard',
      showPhone: true,
      showEmail: true,
      showCity: true,
      showWebsite: true,
      showAvailabilityBadge: false,
      showSkillsOnBack: false,
      doubleSided: true,
    },
  },
  {
    id: 'qr_first',
    label: 'مسح سريع عمودي (QR)',
    desc: 'كارت عمودي يضع رمز QR في المقدمة للمسح السريع في المؤتمرات',
    patch: {
      purpose: 'qr_first',
      template: 'executive_dark',
      orientation: 'portrait',
      bgColor: '#0B1120',
      textColor: '#F8FAFC',
      pattern: 'circuit',
      qrTarget: 'vcard',
      qrPlacement: 'both',
      qrCaption: 'وجّه الكاميرا لحفظ بياناتي',
      showPhone: true,
      showEmail: true,
      showCity: false,
      showWebsite: true,
      showAvailabilityBadge: true,
      showSkillsOnBack: true,
      doubleSided: true,
    },
  },
];

export interface CardPaletteOption {
  id: string;
  name: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
  useBrandAccent: boolean;
}

export const CARD_PALETTES: CardPaletteOption[] = [
  {
    id: 'brand_obsidian',
    name: 'ليلي + لون هويتك',
    bgColor: '#0F172A',
    textColor: '#FFFFFF',
    accentColor: '#0F766E',
    useBrandAccent: true,
  },
  {
    id: 'swiss_paper',
    name: 'أبيض سويسري للطباعة',
    bgColor: '#FFFFFF',
    textColor: '#0F172A',
    accentColor: '#0F766E',
    useBrandAccent: true,
  },
  {
    id: 'warm_cream',
    name: 'ورق عاجي دافئ',
    bgColor: '#FAF8F5',
    textColor: '#1C1917',
    accentColor: '#9A3412',
    useBrandAccent: false,
  },
  {
    id: 'emerald_deep',
    name: 'زمردي عميق',
    bgColor: '#064E3B',
    textColor: '#FFFFFF',
    accentColor: '#34D399',
    useBrandAccent: false,
  },
  {
    id: 'royal_navy',
    name: 'كحلي تنفيذي',
    bgColor: '#172554',
    textColor: '#FFFFFF',
    accentColor: '#60A5FA',
    useBrandAccent: false,
  },
  {
    id: 'obsidian_gold',
    name: 'أسود ولمسة ذهبية',
    bgColor: '#111827',
    textColor: '#F9FAFB',
    accentColor: '#F59E0B',
    useBrandAccent: false,
  },
  {
    id: 'github_dark',
    name: 'GitHub Dark التقني',
    bgColor: '#0D1117',
    textColor: '#F0F6FC',
    accentColor: '#2EA043',
    useBrandAccent: false,
  },
  {
    id: 'vercel_mono',
    name: 'أحادي داكن + أزرق',
    bgColor: '#09090B',
    textColor: '#FAFAFA',
    accentColor: '#3B82F6',
    useBrandAccent: false,
  },
  {
    id: 'aurora_violet',
    name: 'شفق بنفسجي (Aurora)',
    bgColor: '#1E1B4B',
    textColor: '#F8FAFC',
    accentColor: '#C084FC',
    useBrandAccent: false,
  },
  {
    id: 'swiss_editorial_red',
    name: 'ورق سويسري + ياقوتي',
    bgColor: '#FAF8F5',
    textColor: '#18181B',
    accentColor: '#BE123C',
    useBrandAccent: false,
  },
];

export const CARD_PATTERNS: { id: CardPattern; label: string }[] = [
  { id: 'none', label: 'نقي بدون نقش' },
  { id: 'dots', label: 'نقاط هادئة' },
  { id: 'grid', label: 'شبكة هندسية' },
  { id: 'waves', label: 'أقواس انسيابية' },
  { id: 'circuit', label: 'خطوط تقنية' },
  { id: 'diagonal', label: 'خطوط قطرية معمارية' },
  { id: 'topography', label: 'خطوط كونتور ناعمة' },
];

export const CARD_CORNER_OPTIONS: { id: CardCornerStyle; label: string; radiusPx: number }[] = [
  { id: 'sharp', label: 'حواف حادة', radiusPx: 4 },
  { id: 'soft', label: 'ناعمة (موصى به)', radiusPx: 14 },
  { id: 'rounded', label: 'عصرية مستديرة', radiusPx: 22 },
];

export const CARD_FONT_SCALE_OPTIONS: { id: CardFontScale; label: string }[] = [
  { id: 'compact', label: 'مضغوط (للمعلومات الكثيرة)' },
  { id: 'balanced', label: 'متوازن (افتراضي)' },
  { id: 'bold', label: 'بارز (لاسم وعنوان أكبر)' },
];

export const CARD_ORIENTATION_OPTIONS: { id: CardOrientation; label: string; dimsLabel: string }[] = [
  { id: 'landscape', label: 'أفقي قياسي', dimsLabel: '85 × 55 مم' },
  { id: 'portrait', label: 'عمودي عصري', dimsLabel: '55 × 85 مم' },
];

const PRESET_DEFAULT_TAGLINES: Record<PresetId, string> = {
  dev: 'حلول برمجية سحابية وأنظمة ويب عالية الاعتمادية',
  designer: 'تصميم تجارب مستخدم وهوية بصرية ترفع التفاعل',
  architect: 'تصميم معماري مستدام يجمع بين الجمال والوظيفة',
  marketer: 'استراتيجيات نمو وتسويق رقمي مبنية على الأرقام',
  accountant: 'حوكمة مالية وتحليل تقارير يدعم قرارات النمو',
  hr: 'بناء فرق عمل عالية الأداء واستقطاب الكفاءات',
  teacher: 'تصميم محتوى تعليمي تفاعلي وتجارب تعلم حديثة',
  freshgrad: 'شغف بالتعلم السريع وتنفيذ المشاريع بدقة واحتراف',
};

function parseHexRgb(hex: string): [number, number, number] {
  const clean = /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex.slice(1) : '0F172A';
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function toLinearChannel(channel255: number): number {
  const s = channel255 / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/**
 * Computes WCAG 2.1 relative luminance in range [0, 1].
 */
export function calculateRelativeLuminance(hex: string): number {
  const [r, g, b] = parseHexRgb(hex);
  return (
    0.2126 * toLinearChannel(r) +
    0.7152 * toLinearChannel(g) +
    0.0722 * toLinearChannel(b)
  );
}

/**
 * Computes WCAG 2.1 contrast ratio between two #RRGGBB hex colors.
 */
export function calculateContrastRatio(fgHex: string, bgHex: string): number {
  const l1 = calculateRelativeLuminance(fgHex);
  const l2 = calculateRelativeLuminance(bgHex);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Math.round(((lighter + 0.05) / (darker + 0.05)) * 10) / 10;
}

export function isLightHexColor(hex: string): boolean {
  return calculateRelativeLuminance(hex) > 0.35;
}

export function suggestAccessibleTextColor(bgHex: string): '#FFFFFF' | '#0F172A' {
  const whiteRatio = calculateContrastRatio('#FFFFFF', bgHex);
  const darkRatio = calculateContrastRatio('#0F172A', bgHex);
  return darkRatio >= whiteRatio ? '#0F172A' : '#FFFFFF';
}

export function hexWithAlpha(hex: string, alpha: number): string {
  const [r, g, b] = parseHexRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
}

export function suggestSmartTagline(data: PortfolioData): string {
  const cleanBio = data.profile.bio
    .replace(/\[[^\]]+\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (cleanBio) {
    const firstSentence = (cleanBio.split(/[.!؟\n]/)[0] ?? '').trim();
    if (firstSentence.length >= 16 && firstSentence.length <= 68) {
      return firstSentence;
    }
    if (firstSentence.length > 68) {
      const words = firstSentence.split(/\s+/);
      let acc = '';
      for (const w of words) {
        const next = acc ? `${acc} ${w}` : w;
        if (next.length > 62) break;
        acc = next;
      }
      if (acc.length >= 16) return acc;
    }
  }

  return PRESET_DEFAULT_TAGLINES[data.presetId] ?? PRESET_DEFAULT_TAGLINES.dev;
}

function normalizePhoneDigitsForWhatsApp(rawPhone: string): string {
  const ascii = rawPhone
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[^\d]/g, '');
  if (!ascii) return '';
  return ascii.startsWith('00') ? ascii.slice(2) : ascii;
}

function cleanVCardField(val: string): string {
  return val.replace(/[\r\n]+/g, ' ').replace(/([,;\\])/g, '\\$1').trim();
}

export interface ResolvedBusinessCardModel {
  config: BusinessCardConfig;
  fullName: string;
  jobTitle: string;
  companyOrBrand: string;
  tagline: string;
  email: string;
  phone: string;
  city: string;
  website: string;
  bookingUrl: string;
  timezoneBadge: string;
  quickResponseTag: string;
  availabilityBadge: string;
  avatarSrc: string;
  initials: string;
  effectiveBg: string;
  effectiveAccent: string;
  effectiveText: string;
  secondaryText: string;
  mutedText: string;
  borderColor: string;
  surfaceTint: string;
  isLightBg: boolean;
  contrastRatio: number;
  contrastStatus: 'aaa' | 'aa' | 'low';
  vcardPayload: string;
  qrPayload: string;
  qrLabel: string;
  qrTargetResolved: 'vcard' | 'whatsapp' | 'booking' | 'link';
  qrFallbackNotice: string | null;
  skillsTop4: string[];
  backNote: string;
}

export function resolveBusinessCardModel(data: PortfolioData): ResolvedBusinessCardModel {
  const config: BusinessCardConfig = {
    ...DEFAULT_BUSINESS_CARD_CONFIG,
    ...(data.card ?? {}),
  };

  const p = data.profile;
  const sync = config.syncFromProfile;

  const fullName = (sync ? p.fullName : config.customFullName).trim();
  const jobTitle = (sync ? p.jobTitle : config.customJobTitle).trim();
  const rawEmail = (sync ? p.email : config.customEmail).trim();
  const rawPhone = (sync ? p.phone : config.customPhone).trim();
  const rawCity = (sync ? p.city : config.customCity).trim();
  const rawWebsite = sanitizeUrl(sync ? p.primaryPortfolioLink : config.customWebsite);

  const email = config.showEmail ? rawEmail : '';
  const phone = config.showPhone ? rawPhone : '';
  const city = config.showCity ? rawCity : '';
  const website = config.showWebsite ? rawWebsite : '';
  const rawBookingUrl = sanitizeUrl(config.bookingUrl);
  const bookingUrl = config.showBookingOnCard ? rawBookingUrl : '';
  const timezoneBadge =
    config.showTimezone && p.timezone.trim() ? getTimezoneBadge(p.timezone.trim()) : '';
  const quickResponseTag = config.quickResponseTag.trim();

  const companyOrBrand = config.companyOrBrand.trim();
  const tagline = config.tagline.trim();

  const availMeta = getAvailabilityMeta(p.availability);
  const availabilityBadge =
    config.showAvailabilityBadge && availMeta.badge ? availMeta.badge : '';

  let avatarSrc = '';
  if (config.avatarMode === 'profile') {
    avatarSrc = sanitizeAvatarSrc(p.avatarDataUrl);
  } else if (config.avatarMode === 'custom_logo') {
    avatarSrc = sanitizeAvatarSrc(config.customLogoDataUrl);
  }
  const initials = getInitials(fullName || p.fullName || 'بصمة');

  const effectiveBg = config.bgColor;
  const effectiveAccent = config.useBrandAccent
    ? getAccentMeta(data.design.accent).hex
    : config.accentColor;
  const effectiveText = config.textColor;
  const isLightBg = isLightHexColor(effectiveBg);
  const secondaryText = hexWithAlpha(effectiveText, isLightBg ? 0.78 : 0.84);
  const mutedText = hexWithAlpha(effectiveText, isLightBg ? 0.62 : 0.68);
  const borderColor = hexWithAlpha(effectiveText, isLightBg ? 0.14 : 0.18);
  const surfaceTint = hexWithAlpha(effectiveAccent, isLightBg ? 0.1 : 0.22);

  const contrastRatio = calculateContrastRatio(effectiveText, effectiveBg);
  const contrastStatus: 'aaa' | 'aa' | 'low' =
    contrastRatio >= 7 ? 'aaa' : contrastRatio >= 4.5 ? 'aa' : 'low';

  // Standards-compliant vCard 3.0 (RFC 2426) or 4.0 (RFC 6350/9554)
  const displayName = fullName || 'Basma Contact';
  const nameParts = displayName.split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] ?? displayName;
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
  const isV4 = config.vcardVersion === '4.0';

  const vcardLines = [
    'BEGIN:VCARD',
    `VERSION:${isV4 ? '4.0' : '3.0'}`,
    `FN:${cleanVCardField(displayName)}`,
    `N:${cleanVCardField(lastName)};${cleanVCardField(firstName)};;;`,
  ];
  if (jobTitle) vcardLines.push(`TITLE:${cleanVCardField(jobTitle)}`);
  if (companyOrBrand) vcardLines.push(`ORG:${cleanVCardField(companyOrBrand)}`);
  if (email) vcardLines.push(`EMAIL;TYPE=${isV4 ? 'work' : 'INTERNET'}:${email}`);
  if (phone) vcardLines.push(`TEL;TYPE=${isV4 ? 'cell' : 'CELL'}:${phone}`);
  if (city) vcardLines.push(`ADR;TYPE=${isV4 ? 'work' : 'WORK'}:;;${cleanVCardField(city)};;;;`);
  if (website) vcardLines.push(isV4 ? `URL;TYPE=work:${website}` : `URL:${website}`);
  if (bookingUrl) {
    vcardLines.push(isV4 ? `URL;TYPE=booking:${bookingUrl}` : `URL:${bookingUrl}`);
  }
  if (isV4 && p.timezone.trim()) {
    vcardLines.push(`TZ:${cleanVCardField(p.timezone.trim())}`);
  }
  if (tagline) vcardLines.push(`NOTE:${cleanVCardField(tagline.slice(0, 90))}`);
  vcardLines.push('END:VCARD');
  const vcardPayload = vcardLines.join('\r\n');

  let qrTargetResolved: 'vcard' | 'whatsapp' | 'booking' | 'link' = config.qrTarget;
  let qrPayload = vcardPayload;
  let qrFallbackNotice: string | null = null;

  if (config.qrTarget === 'whatsapp') {
    const waDigits = normalizePhoneDigitsForWhatsApp(rawPhone);
    if (waDigits.length >= 8) {
      const msg = config.whatsappPrefill.trim();
      qrPayload = msg
        ? `https://wa.me/${waDigits}?text=${encodeURIComponent(msg.slice(0, 140))}`
        : `https://wa.me/${waDigits}`;
    } else {
      qrTargetResolved = 'vcard';
      qrFallbackNotice = 'أضف رقم جوال لتفعيل رابط واتساب في QR (يستخدم vCard حالياً)';
    }
  } else if (config.qrTarget === 'booking') {
    if (rawBookingUrl) {
      qrPayload = rawBookingUrl;
    } else {
      qrTargetResolved = 'vcard';
      qrFallbackNotice = 'أضف رابط حجز موعد (مثل Cal.com أو Calendly) لتوجيه QR إليه';
    }
  } else if (config.qrTarget === 'link') {
    const fallbackLink = rawWebsite || sanitizeUrl(data.links[0]?.url);
    if (fallbackLink) {
      qrPayload = fallbackLink;
    } else {
      qrTargetResolved = 'vcard';
      qrFallbackNotice = 'أضف رابطاً مهنياً في الهوية أو الحقول لتوجيه QR إليه';
    }
  }

  const qrLabel =
    config.qrCaption.trim() ||
    (qrTargetResolved === 'whatsapp'
      ? 'امسح للتواصل عبر واتساب'
      : qrTargetResolved === 'booking'
      ? 'امسح لحجز اجتماع سريع'
      : qrTargetResolved === 'link'
      ? 'امسح لزيارة ملفي المهني'
      : 'امسح لحفظ جهة الاتصال');

  const skillsTop4 = config.showSkillsOnBack
    ? data.skills
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 4)
    : [];

  return {
    config,
    fullName,
    jobTitle,
    companyOrBrand,
    tagline,
    email,
    phone,
    city,
    website,
    bookingUrl,
    timezoneBadge,
    quickResponseTag,
    availabilityBadge,
    avatarSrc,
    initials,
    effectiveBg,
    effectiveAccent,
    effectiveText,
    secondaryText,
    mutedText,
    borderColor,
    surfaceTint,
    isLightBg,
    contrastRatio,
    contrastStatus,
    vcardPayload,
    qrPayload,
    qrLabel,
    qrTargetResolved,
    qrFallbackNotice,
    skillsTop4,
    backNote: config.backNote.trim(),
  };
}

export interface CardHealthCheck {
  id: string;
  status: 'good' | 'warn' | 'bad';
  title: string;
  detail: string;
  fixType?: 'fix_contrast' | 'generate_tagline' | 'enable_vcard_qr';
  fixLabel?: string;
}

export interface CardHealthReport {
  score: number;
  checks: CardHealthCheck[];
  contrastRatio: number;
  qrLength: number;
  qrDensityLabel: string;
}

export function evaluateBusinessCardHealth(data: PortfolioData): CardHealthReport {
  const model = resolveBusinessCardModel(data);
  const checks: CardHealthCheck[] = [];
  let score = 0;

  // 1. Identity readiness (25 pts)
  if (model.fullName && model.jobTitle) {
    score += 25;
    checks.push({
      id: 'identity',
      status: 'good',
      title: 'الهوية الرئيسية مكتملة',
      detail: 'الاسم والمسمى الوظيفي ظاهران بوضوح في واجهة الكارت.',
    });
  } else {
    score += model.fullName || model.jobTitle ? 12 : 0;
    checks.push({
      id: 'identity',
      status: 'bad',
      title: 'أكمل الاسم والمسمى الوظيفي',
      detail: 'الكارت الشخصي يحتاج إلى الاسم والمسمى الوظيفي كأول عنصر يقرأه المستلم.',
    });
  }

  // 2. WCAG 2.1 Color Contrast (25 pts)
  if (model.contrastRatio >= 4.5) {
    score += 25;
    checks.push({
      id: 'contrast',
      status: 'good',
      title: `تباين لوني ممتاز (${model.contrastRatio}:1)`,
      detail: 'النصوص واضحة للقراءة على الشاشة وبعد الطباعة الورقية (متوافق مع WCAG AA).',
    });
  } else {
    score += model.contrastRatio >= 3 ? 10 : 0;
    checks.push({
      id: 'contrast',
      status: 'bad',
      title: `تباين الألوان منخفض (${model.contrastRatio}:1)`,
      detail: 'النص قد يبدو باهتاً عند الطباعة — يُنصح بنسبة 4.5:1 على الأقل.',
      fixType: 'fix_contrast',
      fixLabel: 'تصحيح لون النص تلقائياً',
    });
  }

  // 3. Contact reachability (20 pts)
  const channelsCount = [model.phone, model.email, model.website].filter(Boolean).length;
  if (channelsCount >= 2) {
    score += 20;
    checks.push({
      id: 'contacts',
      status: 'good',
      title: `قنوات تواصل متوازنة (${channelsCount} قنوات)`,
      detail: 'تغطي وسائل التواصل السريعة والرسمية دون ازدحام.',
    });
  } else if (channelsCount === 1) {
    score += 12;
    checks.push({
      id: 'contacts',
      status: 'warn',
      title: 'قناة تواصل واحدة فقط مفعّلة',
      detail: 'يفضّل إظهار وسيلتي تواصل على الأقل (مثل الجوال والبريد الإلكتروني).',
    });
  } else {
    checks.push({
      id: 'contacts',
      status: 'bad',
      title: 'لا توجد وسائل تواصل ظاهرة',
      detail: 'فعّل البريد أو الجوال أو الرابط المهني حتى يتمكن المستلم من الوصول إليك.',
    });
  }

  // 4. QR Scannability & Target Validity (20 pts)
  const qrLen = model.qrPayload.length;
  const qrDensityLabel =
    qrLen <= 180 ? 'سريع المسح جداً' : qrLen <= 280 ? 'متوازن' : 'مزدحم نسبياً';

  if (model.qrFallbackNotice) {
    score += 8;
    checks.push({
      id: 'qr_target',
      status: 'warn',
      title: 'تنبيه توجيه رمز QR',
      detail: model.qrFallbackNotice,
      fixType: 'enable_vcard_qr',
      fixLabel: 'التبديل إلى vCard 3.0',
    });
  } else if (qrLen <= 280) {
    score += 20;
    checks.push({
      id: 'qr_target',
      status: 'good',
      title: `رمز QR واضح وسريع المسح (${qrDensityLabel})`,
      detail: `طول البيانات ${qrLen} حرفاً — مثالي للمسح الفوري حتى بمقاس 2×2 سم مطبوع.`,
    });
  } else {
    score += 14;
    checks.push({
      id: 'qr_target',
      status: 'warn',
      title: 'بيانات رمز QR طويلة نسبياً',
      detail: 'اختصار الجملة التعريفية سيجعل مربعات QR أكبر وأسرع قراءة بالكاميرا.',
    });
  }

  // 5. Physical Card Readability / Density on 85x55mm (10 pts)
  const overflowRisk = model.jobTitle.length > 54 || model.tagline.length > 75;
  if (!overflowRisk && model.tagline) {
    score += 10;
    checks.push({
      id: 'density',
      status: 'good',
      title: 'التنسيق مناسب لمقاس 85×55 مم',
      detail: 'طول العنوان والجملة التعريفية متناسق مع أبعاد كارت الجيب القياسي.',
    });
  } else if (!model.tagline) {
    score += 6;
    checks.push({
      id: 'density',
      status: 'warn',
      title: 'أضف جملة تعريفية قصيرة للكارت',
      detail: 'جملة من سطر واحد توضّح قيمتك المضافة تعزّز تذكّر الكارت بعد اللقاء.',
      fixType: 'generate_tagline',
      fixLabel: 'توليد جملة ذكية',
    });
  } else {
    score += 5;
    checks.push({
      id: 'density',
      status: 'warn',
      title: 'النصوص قد تلتف على أكثر من سطر',
      detail: 'يفضّل اختصار المسمى إلى <= 50 حرفاً والجملة التعريفية إلى <= 70 حرفاً في الكروت المطبوعة.',
    });
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    checks,
    contrastRatio: model.contrastRatio,
    qrLength: qrLen,
    qrDensityLabel,
  };
}
