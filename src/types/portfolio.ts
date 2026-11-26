import { z } from 'zod';
import { sanitizeAvatarSrc, sanitizeUrl } from '../lib/sanitize';

export const PresetIdSchema = z.enum([
  'dev',
  'designer',
  'architect',
  'marketer',
  'accountant',
  'hr',
  'teacher',
  'freshgrad',
]);
export type PresetId = z.infer<typeof PresetIdSchema>;

export const TemplateIdSchema = z.enum([
  'executive',
  'creative',
  'minimal',
  'bento',
  'obsidian',
  'swiss_editorial',
  'sidebar_pro',
]);
export type TemplateId = z.infer<typeof TemplateIdSchema>;

export const AvailabilityIdSchema = z.enum([
  'open_both',
  'open_fulltime',
  'open_freelance',
  'not_available',
]);
export type AvailabilityId = z.infer<typeof AvailabilityIdSchema>;

export const BlocksSchema = z.object({
  projects: z.boolean().default(true),
  experience: z.boolean().default(true),
  skills: z.boolean().default(true),
  education: z.boolean().default(true),
  testimonials: z.boolean().default(true),
  languages: z.boolean().default(true),
  links: z.boolean().default(true),
});
export type BlocksConfig = z.infer<typeof BlocksSchema>;

export const ProfileSchema = z.object({
  fullName: z.string().default(''),
  jobTitle: z.string().default(''),
  city: z.string().default(''),
  email: z.string().default(''),
  phone: z.string().default(''),
  hidePhoneInPortfolio: z.boolean().default(true),
  bio: z.string().default(''),
  availability: AvailabilityIdSchema.default('open_both'),
  avatarDataUrl: z.string().default(''),
  primaryPortfolioLink: z.string().default(''),
});
export type ProfileData = z.infer<typeof ProfileSchema>;

export const DesignSchema = z.object({
  template: TemplateIdSchema.default('executive'),
  accent: z.string().default('#0F766E'),
  blocks: BlocksSchema.default({
    projects: true,
    experience: true,
    skills: true,
    education: true,
    testimonials: true,
    languages: true,
    links: true,
  }),
});
export type DesignConfig = z.infer<typeof DesignSchema>;

export const ProjectItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().default(''),
  category: z.string().default('مشروع مهني'),
  description: z.string().default(''),
  impact: z.string().default(''),
  url: z.string().default(''),
});
export type ProjectItem = z.infer<typeof ProjectItemSchema>;

export const ExperienceItemSchema = z.object({
  id: z.string().min(1),
  role: z.string().default(''),
  company: z.string().default(''),
  period: z.string().default(''),
  achievements: z.string().default(''),
});
export type ExperienceItem = z.infer<typeof ExperienceItemSchema>;

export const EducationItemSchema = z.object({
  id: z.string().min(1),
  degree: z.string().default(''),
  institution: z.string().default(''),
  year: z.string().default(''),
});
export type EducationItem = z.infer<typeof EducationItemSchema>;

export const LinkItemSchema = z.object({
  id: z.string().min(1),
  label: z.string().default(''),
  url: z.string().default(''),
});
export type LinkItem = z.infer<typeof LinkItemSchema>;

export const TestimonialItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().default(''),
  role: z.string().default(''),
  quote: z.string().default(''),
  verified: z.boolean().default(true),
});
export type TestimonialItem = z.infer<typeof TestimonialItemSchema>;

export const LanguageItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().default(''),
  level: z.string().default('جيد جداً (مهني)'),
});
export type LanguageItem = z.infer<typeof LanguageItemSchema>;

export const CardTemplateIdSchema = z.enum([
  'modern_split',
  'executive_dark',
  'minimal_swiss',
  'creative_mesh',
  'bento_tile',
  'glass_aurora',
  'terminal_dev',
  'editorial_stripe',
]);
export type CardTemplateId = z.infer<typeof CardTemplateIdSchema>;

export const CardPurposeIdSchema = z.enum([
  'networking',
  'client',
  'executive',
  'qr_first',
]);
export type CardPurposeId = z.infer<typeof CardPurposeIdSchema>;

export const CardOrientationSchema = z.enum(['landscape', 'portrait']);
export type CardOrientation = z.infer<typeof CardOrientationSchema>;

export const CardPatternSchema = z.enum([
  'none',
  'dots',
  'grid',
  'waves',
  'circuit',
  'diagonal',
  'topography',
]);
export type CardPattern = z.infer<typeof CardPatternSchema>;

export const CardCornerStyleSchema = z.enum(['sharp', 'soft', 'rounded']);
export type CardCornerStyle = z.infer<typeof CardCornerStyleSchema>;

export const CardFontScaleSchema = z.enum(['compact', 'balanced', 'bold']);
export type CardFontScale = z.infer<typeof CardFontScaleSchema>;

export const CardAvatarModeSchema = z.enum([
  'profile',
  'initials',
  'custom_logo',
  'none',
]);
export type CardAvatarMode = z.infer<typeof CardAvatarModeSchema>;

export const CardQrTargetSchema = z.enum(['vcard', 'whatsapp', 'link']);
export type CardQrTarget = z.infer<typeof CardQrTargetSchema>;

export const CardQrPlacementSchema = z.enum(['back', 'front', 'both']);
export type CardQrPlacement = z.infer<typeof CardQrPlacementSchema>;

const HEX_COLOR_RE = /^#[0-9A-Fa-f]{6}$/;

export const DEFAULT_BUSINESS_CARD_CONFIG = {
  template: 'modern_split' as const,
  purpose: 'networking' as const,
  orientation: 'landscape' as const,
  pattern: 'dots' as const,
  cornerStyle: 'soft' as const,
  fontScale: 'balanced' as const,
  useBrandAccent: true,
  bgColor: '#0F172A',
  accentColor: '#0F766E',
  textColor: '#FFFFFF',
  syncFromProfile: true,
  customFullName: '',
  customJobTitle: '',
  companyOrBrand: '',
  tagline: '',
  customEmail: '',
  customPhone: '',
  customCity: '',
  customWebsite: '',
  avatarMode: 'profile' as const,
  customLogoDataUrl: '',
  qrTarget: 'vcard' as const,
  qrPlacement: 'back' as const,
  qrCaption: 'امسح لحفظ جهة الاتصال',
  whatsappPrefill: 'السلام عليكم، وصلت إليك عبر كارت بصمة الشخصي.',
  showPhone: true,
  showEmail: true,
  showCity: true,
  showWebsite: true,
  showAvailabilityBadge: true,
  showSkillsOnBack: true,
  backNote: '',
  doubleSided: true,
};

export const BusinessCardConfigSchema = z.object({
  template: CardTemplateIdSchema.default(DEFAULT_BUSINESS_CARD_CONFIG.template),
  purpose: CardPurposeIdSchema.default(DEFAULT_BUSINESS_CARD_CONFIG.purpose),
  orientation: CardOrientationSchema.default(DEFAULT_BUSINESS_CARD_CONFIG.orientation),
  pattern: CardPatternSchema.default(DEFAULT_BUSINESS_CARD_CONFIG.pattern),
  cornerStyle: CardCornerStyleSchema.default(DEFAULT_BUSINESS_CARD_CONFIG.cornerStyle),
  fontScale: CardFontScaleSchema.default(DEFAULT_BUSINESS_CARD_CONFIG.fontScale),
  useBrandAccent: z.boolean().default(DEFAULT_BUSINESS_CARD_CONFIG.useBrandAccent),
  bgColor: z
    .string()
    .regex(HEX_COLOR_RE)
    .catch(DEFAULT_BUSINESS_CARD_CONFIG.bgColor)
    .default(DEFAULT_BUSINESS_CARD_CONFIG.bgColor),
  accentColor: z
    .string()
    .regex(HEX_COLOR_RE)
    .catch(DEFAULT_BUSINESS_CARD_CONFIG.accentColor)
    .default(DEFAULT_BUSINESS_CARD_CONFIG.accentColor),
  textColor: z
    .string()
    .regex(HEX_COLOR_RE)
    .catch(DEFAULT_BUSINESS_CARD_CONFIG.textColor)
    .default(DEFAULT_BUSINESS_CARD_CONFIG.textColor),
  syncFromProfile: z.boolean().default(DEFAULT_BUSINESS_CARD_CONFIG.syncFromProfile),
  customFullName: z.string().default(''),
  customJobTitle: z.string().default(''),
  companyOrBrand: z.string().default(''),
  tagline: z.string().default(''),
  customEmail: z.string().default(''),
  customPhone: z.string().default(''),
  customCity: z.string().default(''),
  customWebsite: z.string().default(''),
  avatarMode: CardAvatarModeSchema.default(DEFAULT_BUSINESS_CARD_CONFIG.avatarMode),
  customLogoDataUrl: z.string().default(''),
  qrTarget: CardQrTargetSchema.default(DEFAULT_BUSINESS_CARD_CONFIG.qrTarget),
  qrPlacement: CardQrPlacementSchema.default(DEFAULT_BUSINESS_CARD_CONFIG.qrPlacement),
  qrCaption: z.string().default(DEFAULT_BUSINESS_CARD_CONFIG.qrCaption),
  whatsappPrefill: z.string().default(DEFAULT_BUSINESS_CARD_CONFIG.whatsappPrefill),
  showPhone: z.boolean().default(true),
  showEmail: z.boolean().default(true),
  showCity: z.boolean().default(true),
  showWebsite: z.boolean().default(true),
  showAvailabilityBadge: z.boolean().default(true),
  showSkillsOnBack: z.boolean().default(true),
  backNote: z.string().default(''),
  doubleSided: z.boolean().default(true),
});
export type BusinessCardConfig = z.infer<typeof BusinessCardConfigSchema>;

export const PortfolioDataSchema = z.object({
  presetId: PresetIdSchema.default('dev'),
  profile: ProfileSchema,
  design: DesignSchema,
  card: BusinessCardConfigSchema.default(DEFAULT_BUSINESS_CARD_CONFIG),
  projects: z.array(ProjectItemSchema).default([]),
  experience: z.array(ExperienceItemSchema).default([]),
  education: z.array(EducationItemSchema).default([]),
  skills: z.array(z.string()).default([]),
  links: z.array(LinkItemSchema).default([]),
  testimonials: z.array(TestimonialItemSchema).default([]),
  languages: z.array(LanguageItemSchema).default([]),
});
export type PortfolioData = z.infer<typeof PortfolioDataSchema>;

export const MAX_PROFILE_VERSIONS = 3;

export const ProfileVersionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(60),
  updatedAt: z.string(),
  data: PortfolioDataSchema,
});
export type ProfileVersion = z.infer<typeof ProfileVersionSchema>;

export const VaultStateSchema = z.object({
  version: z.literal(2).default(2),
  activeVersionId: z.string().min(1),
  versions: z.array(ProfileVersionSchema).min(1).max(MAX_PROFILE_VERSIONS),
});
export type VaultState = z.infer<typeof VaultStateSchema>;

export const JsonBackupEnvelopeSchema = z.object({
  schemaVersion: z.number().optional(),
  exportedAt: z.string().optional(),
  versionName: z.string().optional(),
  portfolio: PortfolioDataSchema,
});

function sanitizeParsedPortfolio(data: PortfolioData): PortfolioData {
  const safeCardLogo = sanitizeAvatarSrc(data.card?.customLogoDataUrl);
  const safeCardWebsite = sanitizeUrl(data.card?.customWebsite);
  return {
    ...data,
    profile: {
      ...data.profile,
      avatarDataUrl: sanitizeAvatarSrc(data.profile.avatarDataUrl),
      primaryPortfolioLink: sanitizeUrl(data.profile.primaryPortfolioLink),
    },
    card: {
      ...DEFAULT_BUSINESS_CARD_CONFIG,
      ...data.card,
      customLogoDataUrl: safeCardLogo,
      customWebsite: safeCardWebsite,
    },
    projects: data.projects.map((p) => ({
      ...p,
      url: sanitizeUrl(p.url),
    })),
    links: data.links
      .map((l) => ({
        ...l,
        url: sanitizeUrl(l.url),
      }))
      .filter((l) => l.url !== ''),
  };
}

/**
 * Normalizes legacy or current portfolio JSON payloads using strict Zod validation,
 * migrating legacy avatarUrl fields and sanitizing all embedded links.
 */
export function parsePortfolioPayload(raw: unknown): PortfolioData {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('بنية ملف البيانات غير صالحة.');
  }

  const candidate = structuredClone(raw) as Record<string, unknown>;

  // Support v2 backup envelope { portfolio: ... }
  const inner =
    candidate.portfolio && typeof candidate.portfolio === 'object'
      ? (candidate.portfolio as Record<string, unknown>)
      : candidate;

  if (!inner.profile || typeof inner.profile !== 'object' || !inner.design || typeof inner.design !== 'object') {
    throw new Error('الملف يفتقر إلى بيانات الهوية أو القالب الأساسية.');
  }

  const profileObj = { ...(inner.profile as Record<string, unknown>) };
  // Migrate legacy avatarUrl -> avatarDataUrl if needed
  if (!profileObj.avatarDataUrl && typeof profileObj.avatarUrl === 'string') {
    profileObj.avatarDataUrl = profileObj.avatarUrl;
  }
  // Drop legacy public-link / publish fields
  delete profileObj.avatarUrl;
  delete profileObj.username;
  delete profileObj.published;

  const normalizedInput = {
    ...inner,
    profile: profileObj,
  };

  const result = PortfolioDataSchema.safeParse(normalizedInput);
  if (!result.success) {
    throw new Error('تنسيق الحقول داخل الملف لا يتوافق مع عقد بيانات بصمة.');
  }

  return sanitizeParsedPortfolio(result.data);
}

/**
 * Parses an imported JSON string into either a full VaultState or a single PortfolioData
 * with optional versionName.
 */
export function parseImportedJsonBackup(jsonText: string): {
  kind: 'vault' | 'portfolio';
  vault?: VaultState;
  portfolio?: PortfolioData;
  versionName?: string;
} {
  let raw: unknown;
  try {
    raw = JSON.parse(jsonText);
  } catch {
    throw new Error('تعذّر قراءة ملف JSON — تأكد من سلامة صيغة الملف.');
  }

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('محتوى ملف JSON غير صالح.');
  }

  const obj = raw as Record<string, unknown>;

  // Check if full vault backup
  if (Array.isArray(obj.versions) && typeof obj.activeVersionId === 'string') {
    const parsedVault = VaultStateSchema.safeParse(obj);
    if (parsedVault.success) {
      return {
        kind: 'vault',
        vault: {
          ...parsedVault.data,
          versions: parsedVault.data.versions.map((v) => ({
            ...v,
            data: sanitizeParsedPortfolio(v.data),
          })),
        },
      };
    }
  }

  // Check v2 envelope or flat legacy/current portfolio JSON
  const portfolio = parsePortfolioPayload(obj);
  const versionName =
    typeof obj.versionName === 'string' && obj.versionName.trim()
      ? obj.versionName.trim().slice(0, 60)
      : undefined;

  return {
    kind: 'portfolio',
    portfolio,
    versionName,
  };
}
