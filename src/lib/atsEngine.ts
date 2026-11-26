import type { EditorSectionId } from '../data/presets';
import { getActiveWritingAssist } from '../data/writingAssist';
import type { PortfolioData, PresetId } from '../types/portfolio';
import { sanitizeUrl } from './sanitize';

export interface AtsCheckItem {
  label: string;
  passed: boolean;
  points: number;
}

export interface AtsReadinessResult {
  score: number;
  checks: AtsCheckItem[];
}

export interface QualityAuditDimension {
  id: string;
  title: string;
  score: number;
  maxScore: number;
  status: 'good' | 'warn' | 'weak';
  summary: string;
}

export interface QualityQuickAction {
  id: string;
  title: string;
  description: string;
  impactPoints: number;
  targetSection: EditorSectionId;
}

export interface CvQualityAuditReport {
  overallScore: number;
  wordCount: number;
  wordCountStatus: 'short' | 'ideal' | 'dense';
  quantifiedItems: number;
  totalMeasureableItems: number;
  quantifiedPercent: number;
  actionVerbBullets: number;
  totalBullets: number;
  actionVerbPercent: number;
  hasUnreplacedPlaceholders: boolean;
  dimensions: QualityAuditDimension[];
  quickActions: QualityQuickAction[];
}

export interface JobDescriptionMatchResult {
  matchPercent: number;
  totalExtracted: number;
  matched: string[];
  missing: string[];
}

const ACTION_VERBS_AR = [
  'قيادة', 'تطوير', 'تصميم', 'بناء', 'تأسيس', 'إدارة', 'خفض', 'رفع', 'تحسين', 'تقليص',
  'إطلاق', 'توجيه', 'أتمتة', 'مراجعة', 'إعداد', 'تنظيم', 'تحليل', 'زيادة', 'تقديم', 'تدريس',
  'تأهيل', 'استقطاب', 'هيكلة', 'توحيد', 'ضبط', 'تسليم', 'تنفيذ', 'تطبيق', 'إنجاز', 'تمكين',
  'قدت', 'طورت', 'صممت', 'بنيت', 'أسست', 'أدرت', 'خفضت', 'رفعت', 'حسنت', 'قلصت',
  'أطلقت', 'أتمت', 'حققت', 'أعددت', 'نظمت', 'حللت', 'ساهمت', 'توليت',
];

const ACTION_VERBS_EN = [
  'led', 'built', 'designed', 'developed', 'architected', 'reduced', 'increased', 'improved',
  'launched', 'managed', 'automated', 'delivered', 'optimized', 'established', 'created',
  'streamlined', 'analyzed', 'implemented', 'mentored', 'spearheaded', 'achieved', 'scaled',
];

const CURATED_ATS_KEYWORDS = [
  'React', 'TypeScript', 'JavaScript', 'Next.js', 'Node.js', 'Python', 'SQL', 'PostgreSQL',
  'Docker', 'AWS', 'Git', 'API', 'REST', 'GraphQL', 'CI/CD', 'Tailwind', 'Vite',
  'Figma', 'Photoshop', 'Illustrator', 'UI/UX', 'UX', 'UI', 'Design System', 'Revit',
  'BIM', 'AutoCAD', 'PMP', 'Lumion', 'SEO', 'Google Ads', 'GA4', 'CRO', 'ROAS',
  'Meta', 'TikTok', 'Excel', 'Power BI', 'IFRS', 'ERP', 'SAP', 'SOCPA', 'VAT',
  'HRIS', 'KPIs', 'SHRM', 'LMS', 'TOT', 'Agile', 'Scrum',
  'إدارة المشاريع', 'تحليل البيانات', 'العمل الجماعي', 'التواصل', 'حل المشكلات',
  'القوائم المالية', 'ضريبة القيمة المضافة', 'الزكاة', 'نظام العمل السعودي', 'قوى',
  'مدد', 'استقطاب المواهب', 'التعلم النشط', 'كود البناء السعودي', 'الهوية البصرية',
  'تجربة المستخدم', 'التسويق الرقمي', 'كتابة المحتوى', 'تحسين محركات البحث',
  'خدمة العملاء', 'إعداد التقارير', 'اللغة الإنجليزية', 'أتمتة', 'تطوير',
];

const STOP_WORDS = new Set([
  'على', 'إلى', 'من', 'في', 'مع', 'عن', 'أن', 'أو', 'هذا', 'هذه', 'التي', 'الذي',
  'العمل', 'خبرة', 'وظيفة', 'مطلوب', 'لدينا', 'خلال', 'ضمن', 'عبر', 'بشكل', 'حيث',
  'with', 'and', 'the', 'for', 'our', 'are', 'you', 'will', 'have', 'years',
  'experience', 'that', 'this', 'from', 'your', 'into', 'team', 'work', 'role',
]);

/**
 * Generates plain single-column ATS text representation of the user's CV.
 */
export function buildPlainTextAts(data: PortfolioData): string {
  const p = data.profile;
  const safePrimaryLink = sanitizeUrl(p.primaryPortfolioLink);
  const lines: string[] = [];

  lines.push(p.fullName.trim());
  lines.push(p.jobTitle.trim());
  lines.push([p.city, p.email, p.phone, safePrimaryLink].filter((v) => v && v.trim()).join(' | '));
  lines.push('');

  if (p.bio.trim()) {
    lines.push('الملخص المهني');
    lines.push(p.bio.trim());
    lines.push('');
  }

  if (data.experience.length > 0) {
    lines.push('الخبرات العملية');
    data.experience.forEach((e) => {
      lines.push(`${e.role} — ${e.company} (${e.period})`);
      e.achievements
        .split('\n')
        .map((x) => x.trim())
        .filter(Boolean)
        .forEach((b) => lines.push(`- ${b}`));
    });
    lines.push('');
  }

  if (data.projects.length > 0) {
    lines.push('أبرز المشاريع');
    data.projects.forEach((pr) => {
      lines.push(`${pr.title} (${pr.category}): ${pr.description}`);
      if (pr.impact.trim()) lines.push(`الأثر المحقق: ${pr.impact.trim()}`);
    });
    lines.push('');
  }

  if (data.skills.length > 0) {
    lines.push('المهارات التقنية والمهنية');
    lines.push(data.skills.join('، '));
    lines.push('');
  }

  if (data.education.length > 0) {
    lines.push('التعليم والشهادات');
    data.education.forEach((ed) => lines.push(`${ed.degree} — ${ed.institution} (${ed.year})`));
    lines.push('');
  }

  if (data.languages.length > 0) {
    lines.push('اللغات');
    lines.push(data.languages.map((lg) => `${lg.name} (${lg.level})`).join('، '));
  }

  return lines.join('\n').trim();
}

/**
 * Evaluates standard 5-point ATS Readiness score used in header & Tab 2 sidebar.
 */
export function evaluateAtsReadiness(data: PortfolioData): AtsReadinessResult {
  const p = data.profile;
  const contactComplete = Boolean(
    p.fullName.trim() && p.jobTitle.trim() && p.email.trim() && p.phone.trim() && p.city.trim()
  );
  const bioLen = p.bio.trim().length;
  const bioBalanced = bioLen >= 60 && bioLen <= 420;

  const combinedAchievements = [
    ...data.experience.map((e) => e.achievements),
    ...data.projects.map((pr) => pr.impact),
  ].join(' ');
  const hasNumericImpact = /[0-9٠-٩]+/.test(combinedAchievements);
  const enoughSkills = data.skills.length >= 5;

  const checks: AtsCheckItem[] = [
    {
      label: 'اكتمال بيانات التواصل الأساسية (الاسم، المسمى، البريد، الجوال، المدينة)',
      passed: contactComplete,
      points: 20,
    },
    {
      label: `وجود ملخص مهني متوازن (${bioLen} حرفاً — المثالي 60 إلى 420)`,
      passed: bioBalanced,
      points: 20,
    },
    {
      label: 'ذكر إنجازات رقمية قابلة للقياس في الخبرات أو المشاريع',
      passed: hasNumericImpact,
      points: 20,
    },
    {
      label: `تضمين 5 مهارات مهنية على الأقل (الحالي: ${data.skills.length})`,
      passed: enoughSkills,
      points: 20,
    },
    {
      label: 'خلو التصميم من الجداول والصور وأشرطة المهارات المعقدة',
      passed: true,
      points: 20,
    },
  ];

  const score = checks.reduce((sum, item) => sum + (item.passed ? item.points : 0), 0);
  return { score, checks };
}

function startsWithStrongActionVerb(bullet: string): boolean {
  const trimmed = bullet.trim().replace(/^[-•*]\s*/, '');
  if (!trimmed) return false;
  const lower = trimmed.toLowerCase();
  return (
    ACTION_VERBS_AR.some((v) => trimmed.startsWith(v)) ||
    ACTION_VERBS_EN.some((v) => lower.startsWith(`${v} `))
  );
}

/**
 * Evaluates deep CV Quality Audit for Tab 3 using 100% real deterministic rules.
 */
export function evaluateCvQualityAudit(data: PortfolioData): CvQualityAuditReport {
  const p = data.profile;
  const plainText = buildPlainTextAts(data);
  const words = plainText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const wordCountStatus: 'short' | 'ideal' | 'dense' =
    wordCount < 140 ? 'short' : wordCount <= 680 ? 'ideal' : 'dense';

  // Detect unreplaced template placeholders like [عدد] or [المبلغ]
  const allText = [
    p.bio,
    ...data.experience.map((e) => e.achievements),
    ...data.projects.map((pr) => `${pr.description} ${pr.impact}`),
  ].join(' ');
  const hasUnreplacedPlaceholders = /\[[^\]\n]{2,30}\]/.test(allText);

  // Quantified results across experiences & projects
  const expBullets = data.experience.flatMap((e) =>
    e.achievements
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
  );
  const projectImpacts = data.projects.map((pr) => pr.impact.trim()).filter(Boolean);
  const measurablePool = [...expBullets, ...projectImpacts];
  const quantifiedItems = measurablePool.filter((item) => /[0-9٠-٩]+/.test(item)).length;
  const totalMeasureableItems = measurablePool.length;
  const quantifiedPercent =
    totalMeasureableItems > 0 ? Math.round((quantifiedItems / totalMeasureableItems) * 100) : 0;

  // Leadership/action verbs check
  const totalBullets = expBullets.length;
  const actionVerbBullets = expBullets.filter((b) => startsWithStrongActionVerb(b)).length;
  const actionVerbPercent =
    totalBullets > 0 ? Math.round((actionVerbBullets / totalBullets) * 100) : 0;

  // Dimension 1: Contact & Identity (20 pts)
  const identityFields = [p.fullName, p.jobTitle, p.city, p.email, p.phone];
  const filledIdentity = identityFields.filter((f) => f.trim().length > 0).length;
  const hasPrimaryLink = Boolean(sanitizeUrl(p.primaryPortfolioLink));
  const identityScore = Math.round((filledIdentity / 5) * 16 + (hasPrimaryLink ? 4 : 0));

  // Dimension 2: Summary Quality & No Placeholders (15 pts)
  const bioLen = p.bio.trim().length;
  let bioScore = 0;
  if (bioLen >= 60 && bioLen <= 420) bioScore += 12;
  else if (bioLen >= 30) bioScore += 6;
  if (!hasUnreplacedPlaceholders && bioLen > 0) bioScore += 3;

  // Dimension 3: Quantified Achievements (25 pts)
  const quantScore =
    totalMeasureableItems === 0
      ? 0
      : Math.min(25, Math.round((quantifiedItems / Math.max(2, totalMeasureableItems)) * 25));

  // Dimension 4: Action Verbs & Bullet Clarity (15 pts)
  const verbScore =
    totalBullets === 0 ? 0 : Math.min(15, Math.round((actionVerbBullets / totalBullets) * 15));

  // Dimension 5: Skills & Length Balance (15 pts)
  const skillsPts = Math.min(10, Math.round((data.skills.length / 6) * 10));
  const lengthPts = wordCountStatus === 'ideal' ? 5 : wordCount >= 90 ? 3 : 1;
  const skillsLengthScore = skillsPts + lengthPts;

  // Dimension 6: Portfolio Proof (Projects, Testimonials, Languages) (10 pts)
  const proofScore =
    (data.projects.length >= 2 ? 4 : data.projects.length === 1 ? 2 : 0) +
    (data.testimonials.length >= 1 ? 3 : 0) +
    (data.languages.length >= 1 ? 3 : 0);

  const overallScore = Math.min(
    100,
    identityScore + bioScore + quantScore + verbScore + skillsLengthScore + proofScore
  );

  const statusFor = (score: number, max: number): 'good' | 'warn' | 'weak' => {
    const ratio = score / max;
    if (ratio >= 0.8) return 'good';
    if (ratio >= 0.5) return 'warn';
    return 'weak';
  };

  const dimensions: QualityAuditDimension[] = [
    {
      id: 'identity',
      title: 'اكتمال الهوية والرابط المهني',
      score: identityScore,
      maxScore: 20,
      status: statusFor(identityScore, 20),
      summary: hasPrimaryLink
        ? `${filledIdentity}/5 بيانات أساسية مكتملة + رابط مهني نشط`
        : `${filledIdentity}/5 بيانات أساسية مكتملة — أضف رابط LinkedIn أو GitHub في ترويسة السيرة`,
    },
    {
      id: 'bio',
      title: 'توازن الملخص المهني',
      score: bioScore,
      maxScore: 15,
      status: statusFor(bioScore, 15),
      summary: hasUnreplacedPlaceholders
        ? 'توجد أقواس [ ] غير مستبدلة من قوالب المساعد الكتابي'
        : `الطول الحالي ${bioLen} حرفاً (النطاق المثالي 60–420 حرفاً)`,
    },
    {
      id: 'quantified',
      title: 'النتائج والأرقام القابلة للقياس',
      score: quantScore,
      maxScore: 25,
      status: statusFor(quantScore, 25),
      summary:
        totalMeasureableItems > 0
          ? `${quantifiedItems} من ${totalMeasureableItems} نقطة تحتوي على أرقام أو نسب (${quantifiedPercent}%)`
          : 'أضف نقاط خبرة ومشاريع مدعومة بأرقام ونسب مئوية',
    },
    {
      id: 'verbs',
      title: 'أفعال قيادية وإنجازية قوية',
      score: verbScore,
      maxScore: 15,
      status: statusFor(verbScore, 15),
      summary:
        totalBullets > 0
          ? `${actionVerbBullets} من ${totalBullets} نقطة خبرة تبدأ بفعل إنجاز قوي (${actionVerbPercent}%)`
          : 'أضف نقاط إنجاز واضحة في قسم الخبرات العملية',
    },
    {
      id: 'skills_length',
      title: 'تنوع المهارات وتوازن طول A4',
      score: skillsLengthScore,
      maxScore: 15,
      status: statusFor(skillsLengthScore, 15),
      summary: `${data.skills.length} مهارة مضافة • ${wordCount} كلمة إجمالاً (${
        wordCountStatus === 'ideal'
          ? 'مثالي لصفحة–صفحتين A4'
          : wordCountStatus === 'short'
          ? 'قصيرة نسبياً — أضف تفاصيل أكثر'
          : 'مكثفة — حاول الاختصار'
      })`,
    },
    {
      id: 'proof',
      title: 'الأعمال والتوصيات واللغات',
      score: proofScore,
      maxScore: 10,
      status: statusFor(proofScore, 10),
      summary: `${data.projects.length} مشاريع • ${data.testimonials.length} توصيات • ${data.languages.length} لغات`,
    },
  ];

  const quickActions: QualityQuickAction[] = [];

  if (hasUnreplacedPlaceholders) {
    quickActions.push({
      id: 'fix-placeholders',
      title: 'استبدال الأقواس الإرشادية [ ] ببياناتك الحقيقية',
      description: 'عُثر على أقواس مربعة من قوالب الكتابة لم تُعدّل بعد داخل النبذة أو الإنجازات.',
      impactPoints: 5,
      targetSection: 'identity',
    });
  }
  if (!hasPrimaryLink || filledIdentity < 5) {
    quickActions.push({
      id: 'fix-identity',
      title: 'استكمال بيانات التواصل والرابط المهني (LinkedIn / GitHub)',
      description: 'إضافة رابطك المهني وجميع حقول التواصل يرفع مصداقية ترويسة ATS.',
      impactPoints: 20 - identityScore,
      targetSection: 'identity',
    });
  }
  if (bioLen < 60 || bioLen > 420) {
    quickActions.push({
      id: 'fix-bio',
      title: 'ضبط طول الملخص المهني بين 60 و420 حرفاً',
      description: 'استخدم مولّد النبذة من 3 حقول لصياغة ملخص مركز وجاهز للفرز الآلي.',
      impactPoints: Math.max(3, 15 - bioScore),
      targetSection: 'identity',
    });
  }
  if (quantifiedPercent < 70 || totalMeasureableItems < 2) {
    quickActions.push({
      id: 'fix-quantified',
      title: 'دعم الخبرات والمشاريع بأرقام ونسب مئوية',
      description: 'استخدم بنك عبارات الإنجازات لإضافة نسب تحسّن أو وفر مالي أو أعداد عملاء.',
      impactPoints: Math.max(5, 25 - quantScore),
      targetSection: 'experience',
    });
  }
  if (actionVerbPercent < 70 && totalBullets > 0) {
    quickActions.push({
      id: 'fix-verbs',
      title: 'بدء نقاط الخبرة بأفعال قيادية قوية (قيادة، تطوير، خفض...)',
      description: 'تجنب الجمل الوصفية الضعيفة وابدأ كل سطر بالفعل والنتيجة.',
      impactPoints: Math.max(3, 15 - verbScore),
      targetSection: 'experience',
    });
  }
  if (data.skills.length < 6) {
    quickActions.push({
      id: 'fix-skills',
      title: `إضافة مهارات تخصصية إضافية (الحالي ${data.skills.length}، الموصى به 6+)`,
      description: 'أضف المهارات المقترحة لمجالك لرفع تغطية الكلمات المفتاحية في ATS.',
      impactPoints: Math.max(2, 10 - skillsPts),
      targetSection: 'skills',
    });
  }
  if (data.projects.length < 2) {
    quickActions.push({
      id: 'fix-projects',
      title: 'توثيق مشروعين على الأقل بأثر واضح',
      description: 'المشاريع العملية تعوض قلة الخبرة وتثبت الكفاءة التطبيقية.',
      impactPoints: 4,
      targetSection: 'projects',
    });
  }
  if (data.testimonials.length === 0 || data.languages.length === 0) {
    quickActions.push({
      id: 'fix-proof',
      title: 'إضافة توصية مهنية أو اللغات ومستوى الإتقان',
      description: 'تظهر اللغات في السيرة الذاتية ATS بينما تعزز التوصيات ثقة البورتفوليو.',
      impactPoints: 10 - proofScore,
      targetSection: 'proof',
    });
  }

  return {
    overallScore,
    wordCount,
    wordCountStatus,
    quantifiedItems,
    totalMeasureableItems,
    quantifiedPercent,
    actionVerbBullets,
    totalBullets,
    actionVerbPercent,
    hasUnreplacedPlaceholders,
    dimensions,
    quickActions,
  };
}

/**
 * Matches a pasted Arabic/English Job Description against the full CV text.
 */
export function analyzeJobDescription(
  jdRaw: string,
  data: PortfolioData
): JobDescriptionMatchResult {
  const trimmed = jdRaw.trim();
  const cvFullText = buildPlainTextAts(data).toLowerCase();
  const assist = getActiveWritingAssist(data.presetId);

  const knownTerms = Array.from(
    new Set([...assist.suggestedSkills, ...CURATED_ATS_KEYWORDS])
  );

  const jdLower = trimmed.toLowerCase();
  const extracted: string[] = [];

  knownTerms.forEach((term) => {
    const clean = term.toLowerCase();
    if (clean.length >= 2 && jdLower.includes(clean)) {
      if (!extracted.some((ex) => ex.toLowerCase() === clean)) {
        extracted.push(term);
      }
    }
  });

  if (extracted.length < 5) {
    const tokens = trimmed
      .replace(/[^\u0600-\u06FFa-zA-Z0-9+#.]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !STOP_WORDS.has(w.toLowerCase()));

    Array.from(new Set(tokens))
      .slice(0, 12)
      .forEach((tk) => {
        if (!extracted.some((ex) => ex.toLowerCase() === tk.toLowerCase())) {
          extracted.push(tk);
        }
      });
  }

  const matched: string[] = [];
  const missing: string[] = [];

  extracted.forEach((kw) => {
    if (cvFullText.includes(kw.toLowerCase())) {
      matched.push(kw);
    } else {
      missing.push(kw);
    }
  });

  const total = Math.max(1, extracted.length);
  const matchPercent = extracted.length === 0 ? 0 : Math.round((matched.length / total) * 100);

  return {
    matchPercent,
    totalExtracted: extracted.length,
    matched,
    missing,
  };
}

export function buildSampleJobDescription(presetId: PresetId): string {
  const assist = getActiveWritingAssist(presetId);
  const sampleSkills = assist.suggestedSkills.slice(0, 7).join('، ');
  return `مطلوب للعمل فوراً متخصص يمتلك خبرة عملية في: ${sampleSkills}، بالإضافة إلى مهارات التواصل، العمل الجماعي، حل المشكلات، وإعداد التقارير واللغة الإنجليزية.`;
}
