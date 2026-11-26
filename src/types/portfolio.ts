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

export const TemplateIdSchema = z.enum(['executive', 'creative', 'minimal']);
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

export const PortfolioDataSchema = z.object({
  presetId: PresetIdSchema.default('dev'),
  profile: ProfileSchema,
  design: DesignSchema,
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
  return {
    ...data,
    profile: {
      ...data.profile,
      avatarDataUrl: sanitizeAvatarSrc(data.profile.avatarDataUrl),
      primaryPortfolioLink: sanitizeUrl(data.profile.primaryPortfolioLink),
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
