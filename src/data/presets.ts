import {
  DEFAULT_BUSINESS_CARD_CONFIG,
  type AvailabilityId,
  type PortfolioData,
  type PresetId,
  type ProfileData,
  type TemplateId,
} from '../types/portfolio';

export interface AccentOption {
  hex: string;
  soft: string;
  name: string;
}

export const ACCENT_OPTIONS: AccentOption[] = [
  { hex: '#0F766E', soft: '#F0FDFA', name: 'زمردي تنفيذي' },
  { hex: '#1E40AF', soft: '#EFF6FF', name: 'أزرق رسمي' },
  { hex: '#4338CA', soft: '#EEF2FF', name: 'نيلي إبداعي' },
  { hex: '#9A3412', soft: '#FFF7ED', name: 'برونزي معماري' },
  { hex: '#1E293B', soft: '#F1F5F9', name: 'رمادي داكن' },
  { hex: '#18181B', soft: '#F4F4F5', name: 'أسود سويسري أحادي' },
  { hex: '#6D28D9', soft: '#F5F3FF', name: 'بنفسجي SaaS حديث' },
  { hex: '#BE123C', soft: '#FFF1F2', name: 'ياقوتي تحريري' },
  { hex: '#047857', soft: '#ECFDF5', name: 'أخضر تقني داكن' },
];

export interface LayoutPresetOption {
  id: TemplateId;
  name: string;
  desc: string;
  inspiration?: string;
}

export const LAYOUT_PRESETS: LayoutPresetOption[] = [
  {
    id: 'executive',
    name: 'تنفيذي كلاسيكي',
    desc: 'هيكل منظم ووقور للأعمال',
    inspiration: 'قياسي',
  },
  {
    id: 'creative',
    name: 'إبداعي شبكي',
    desc: 'واجهة بصرية وشبكة مشاريع',
    inspiration: 'قياسي',
  },
  {
    id: 'minimal',
    name: 'مبسط عصري',
    desc: 'تركيز تحريري هادئ ومساحات بيضاء',
    inspiration: 'قياسي',
  },
  {
    id: 'bento',
    name: 'بنتو جريد (Bento)',
    desc: 'بطاقات معيارية متجاورة على طراز لوحات المنتجات الحديثة',
    inspiration: 'GitHub Bento UI',
  },
  {
    id: 'obsidian',
    name: 'داكن تقني (Obsidian)',
    desc: 'ثيم داكن باحترافية المطورين مع لمسات Terminal وخطوط بارزة',
    inspiration: 'GitHub Dark Dev',
  },
  {
    id: 'swiss_editorial',
    name: 'سويسري تحريري (Swiss)',
    desc: 'شبكة معمارية بحدود دقيقة وتباين طباعي عالي التنظيم',
    inspiration: 'Swiss & Reactive',
  },
  {
    id: 'sidebar_pro',
    name: 'عمود جانبي (Sidebar Pro)',
    desc: 'عمود جانبي للهوية والمهارات مع مسار واسع للخبرات والأعمال',
    inspiration: 'GitProfile Split',
  },
];

export type EditorSectionId =
  | 'identity'
  | 'design'
  | 'projects'
  | 'experience'
  | 'skills'
  | 'proof';

export const EDITOR_SECTIONS: { id: EditorSectionId; label: string }[] = [
  { id: 'identity', label: 'الهوية والبيانات' },
  { id: 'design', label: 'القالب والأقسام' },
  { id: 'projects', label: 'المشاريع' },
  { id: 'experience', label: 'الخبرات والتعليم' },
  { id: 'skills', label: 'المهارات والروابط' },
  { id: 'proof', label: 'التوصيات واللغات' },
];

export interface AvailabilityOption {
  id: AvailabilityId;
  label: string;
  badge: string;
  dot: string;
  pillClass: string;
}

export const AVAILABILITY_OPTIONS: AvailabilityOption[] = [
  {
    id: 'open_both',
    label: 'متاح لفرص العمل والمشاريع الحرة',
    badge: 'متاح للعمل والمشاريع',
    dot: 'bg-emerald-500',
    pillClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  {
    id: 'open_fulltime',
    label: 'متاح لفرصة وظيفية بدوام كامل',
    badge: 'متاح لفرصة وظيفية',
    dot: 'bg-emerald-500',
    pillClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  {
    id: 'open_freelance',
    label: 'متاح لمشاريع العمل الحر والاستشارات',
    badge: 'متاح لمشاريع حرة',
    dot: 'bg-sky-500',
    pillClass: 'bg-sky-50 text-sky-800 border-sky-200',
  },
  {
    id: 'not_available',
    label: 'إخفاء شارة التوفر حالياً',
    badge: '',
    dot: '',
    pillClass: '',
  },
];

export const LANGUAGE_LEVELS = [
  'اللغة الأم',
  'متقدم / طليق',
  'جيد جداً (مهني)',
  'متوسط',
  'مبتدئ',
];

export const PRESET_LIST: { id: PresetId; label: string }[] = [
  { id: 'dev', label: 'مطور برمجيات' },
  { id: 'designer', label: 'مصمم جرافيك و UX' },
  { id: 'architect', label: 'مهندس معماري' },
  { id: 'marketer', label: 'مستشار تسويق' },
  { id: 'accountant', label: 'محاسب ومحلل مالي' },
  { id: 'hr', label: 'أخصائي موارد بشرية' },
  { id: 'teacher', label: 'معلم / مدرب تعليمي' },
  { id: 'freshgrad', label: 'خريج حديث (بلا خبرة)' },
];

export function getAccentMeta(hex: string): AccentOption {
  return ACCENT_OPTIONS.find((a) => a.hex === hex) ?? ACCENT_OPTIONS[0]!;
}

export function getAvailabilityMeta(id: AvailabilityId): AvailabilityOption {
  return AVAILABILITY_OPTIONS.find((a) => a.id === id) ?? AVAILABILITY_OPTIONS[0]!;
}

export function getInitials(name: string): string {
  const parts = String(name || 'بصمة')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return 'ب';
  if (parts.length === 1) return parts[0]!.slice(0, 2);
  return `${parts[0]![0] ?? ''} ${parts[parts.length - 1]![0] ?? ''}`.trim();
}

export function isDemoIdentity(profile: ProfileData): boolean {
  const email = profile.email.trim().toLowerCase();
  return !email || email.endsWith('@basma-demo.sa');
}

const DEFAULT_LANGUAGES = [
  { id: 'lg1', name: 'العربية', level: 'اللغة الأم' },
  { id: 'lg2', name: 'الإنجليزية', level: 'جيد جداً (مهني)' },
];

const ALL_BLOCKS = {
  projects: true,
  experience: true,
  skills: true,
  education: true,
  testimonials: true,
  languages: true,
  links: true,
};

type PresetBaseData = Omit<PortfolioData, 'card'>;

const PRESETS_DATA: Record<PresetId, PresetBaseData> = {
  dev: {
    presetId: 'dev',
    profile: {
      fullName: 'طارق العتيبي',
      jobTitle: 'مهندس برمجيات أول — تطبيقات الويب السحابية',
      city: 'الرياض، المملكة العربية السعودية',
      email: 'tariq.dev@basma-demo.sa',
      phone: '+966 55 412 8901',
      hidePhoneInPortfolio: true,
      bio: 'مهندس برمجيات بخبرة تتجاوز 6 سنوات في بناء المنصات السحابية والأنظمة المالية عالية الاعتمادية. أركز على كتابة شيفرة نظيفة، تحسين الأداء بنسبة ملموسة، وتحويل المتطلبات التجارية المعقدة إلى منتجات رقمية قابلة للتوسع.',
      availability: 'open_both',
      avatarDataUrl: '',
      primaryPortfolioLink: 'https://linkedin.com/in/tariq-alotaibi',
    },
    design: {
      template: 'executive',
      accent: '#0F766E',
      blocks: { ...ALL_BLOCKS },
    },
    projects: [
      {
        id: 'p1',
        title: 'منصة فاتورة بلس السحابية',
        category: 'تطبيق SaaS مالي',
        description:
          'نظام فوترة إلكترونية متكامل للمنشآت الصغيرة والمتوسطة متوافق مع متطلبات المرحلة الثانية من الربط والتكامل.',
        impact: 'تقليص زمن إصدار الفواتير بنسبة 68% لخدمة أكثر من 1,200 منشأة نشطة',
        url: 'https://fatura-plus.example.sa',
      },
      {
        id: 'p2',
        title: 'محرك تحليلات لحظي للمتاجر الإلكترونية',
        category: 'هندسة بيانات وواجهات',
        description:
          'لوحة تحكم تفاعلية تعالج أحداث المبيعات والمخزون لحظياً مع تنبيهات ذكية لانخفاض المخزون.',
        impact: 'تحسين سرعة تحميل التقارير من 9 ثوانٍ إلى 420 مللي ثانية',
        url: 'https://commerce-pulse.example.sa',
      },
      {
        id: 'p3',
        title: 'مكتبة مكونات عربية مفتوحة المصدر (RTL UI)',
        category: 'مصدر مفتوح',
        description:
          'مجموعة مكونات واجهة مستخدم مصممة خصيصاً لدعم الاتجاه من اليمين لليسار ومعايير الوصول.',
        impact: 'تجاوزت 1,800 تحميل شهرياً واعتمادها في 24 مشروعاً عربياً',
        url: 'https://github.com/tariq-rtl-ui',
      },
    ],
    experience: [
      {
        id: 'e1',
        role: 'مهندس برمجيات أول (Senior Full-Stack Engineer)',
        company: 'شركة مدار للتقنية المالية',
        period: '2023 – حتى الآن',
        achievements:
          'قيادة إعادة هيكلة بوابة الدفع الداخلية مما رفع استقرار النظام إلى 99.96%\nخفض تكاليف البنية السحابية بنسبة 34% عبر تحسين استعلامات قواعد البيانات والتخزين المؤقت\nتوجيه 4 مطورين جدد وتأسيس معايير مراجعة الشيفرة البرمجية',
      },
      {
        id: 'e2',
        role: 'مطور واجهات ومنصات ويب',
        company: 'مختبر أفق الرقمي',
        period: '2020 – 2023',
        achievements:
          'تطوير 8 منصات ويب خدمية لعملاء في القطاعين الحكومي والخاص بمتوسط تقييم رضا 4.9/5\nتقليل حجم الحزمة البرمجية بنسبة 42% مما حسّن نتائج الأداء على الجوال',
      },
    ],
    education: [
      {
        id: 'ed1',
        degree: 'بكالوريوس علوم الحاسب الآلي (مرتبة الشرف)',
        institution: 'جامعة الملك سعود — الرياض',
        year: '2020',
      },
      {
        id: 'ed2',
        degree: 'شهادة AWS Certified Solutions Architect',
        institution: 'Amazon Web Services',
        year: '2024',
      },
    ],
    skills: [
      'TypeScript',
      'React & Next.js',
      'Node.js',
      'PostgreSQL',
      'تصميم الأنظمة',
      'Docker & AWS',
      'واجهات REST & GraphQL',
      'الأمن السيبراني للتطبيقات',
    ],
    links: [
      { id: 'l1', label: 'حساب LinkedIn المهني', url: 'https://linkedin.com/in/tariq-alotaibi' },
      { id: 'l2', label: 'معرض الأكواد GitHub', url: 'https://github.com/tariq-alotaibi' },
      { id: 'l3', label: 'تواصل مباشر عبر واتساب للأعمال', url: 'https://wa.me/966554128901' },
    ],
    testimonials: [
      {
        id: 't1',
        name: 'م. فهد السالم',
        role: 'مدير التقنية — شركة مدار المالية',
        quote:
          'طارق يتميز بقدرة نادرة على فهم الأثر التجاري قبل كتابة الكود؛ ساهمت إعادة هيكلته لبوابة الدفع في رفع الاستقرار وخفض التكاليف بشكل ملموس.',
        verified: true,
      },
      {
        id: 't2',
        name: 'سلطان القحطاني',
        role: 'مؤسس متجر نبض الإلكتروني',
        quote:
          'التزام تام بالمواعيد ووضوح عالٍ في التواصل، وحوّل لوحة تقاريرنا من بطيئة جداً إلى لحظية في أقل من شهر.',
        verified: true,
      },
    ],
    languages: structuredClone(DEFAULT_LANGUAGES),
  },

  designer: {
    presetId: 'designer',
    profile: {
      fullName: 'سارة المنصور',
      jobTitle: 'مصممة هويات بصرية وتجربة مستخدم (Brand & UI)',
      city: 'جدة، المملكة العربية السعودية',
      email: 'sara.design@basma-demo.sa',
      phone: '+966 50 781 3340',
      hidePhoneInPortfolio: true,
      bio: 'مصممة بصرية شغوفة بصناعة هويات عربية معاصرة وتجارب رقمية واضحة ترفع من قيمة العلامات التجارية. عملت مع أكثر من 35 شركة ناشئة ومتجراً إلكترونياً في الخليج لترجمة رؤيتهم إلى حضور بصري لا يُنسى.',
      availability: 'open_both',
      avatarDataUrl: '',
      primaryPortfolioLink: 'https://behance.net/sara-mansour',
    },
    design: {
      template: 'creative',
      accent: '#4338CA',
      blocks: { ...ALL_BLOCKS, education: false },
    },
    projects: [
      {
        id: 'p1',
        title: 'إعادة تصميم الهوية البصرية لمحمصة أثر',
        category: 'هوية بصرية وتغليف',
        description:
          'تطوير شعار عربي هندسي ونظام تغليف متكامل يعكس الطابع الحرفي السعودي المعاصر.',
        impact: 'ارتفاع معدل تفاعل المتجر ومبيعات الصناديق الموسمية بنسبة 45% خلال الربع الأول',
        url: 'https://behance.net/sara-athar',
      },
      {
        id: 'p2',
        title: 'نظام تصميم لتطبيق «خطوة» الصحي',
        category: 'تجربة مستخدم UI/UX',
        description:
          'بناء مكتبة مكونات متكاملة في Figma تضم 120 شاشة متجاوبة مع اختبارات قابلية استخدام.',
        impact: 'زيادة معدل إتمام التسجيل للمستخدمين الجدد بنسبة 31%',
        url: 'https://behance.net/sara-khatwa',
      },
      {
        id: 'p3',
        title: 'دليل هوية مؤتمر التصميم العربي 2026',
        category: 'توجيه فني ومطبوعات',
        description:
          'صياغة اللغة البصرية للمؤتمر من الإعلانات الرقمية وحتى اللوحات الإرشادية والمسرح.',
        impact: 'اعتماد الهوية في حملة وصلت لأكثر من 280,000 مهتم بالتصميم',
        url: 'https://behance.net/sara-conf',
      },
    ],
    experience: [
      {
        id: 'e1',
        role: 'قائدة فريق التصميم الإبداعي',
        company: 'استوديو نسيج للتصميم',
        period: '2022 – حتى الآن',
        achievements:
          'الإشراف على تسليم 22 مشروع هوية بصرية وتطبيق جوال لشركات تقنية وغذائية\nتقليص دورة تعديلات العملاء بنسبة 40% عبر بناء نماذج تفاعلية مبكرة',
      },
      {
        id: 'e2',
        role: 'مصممة جرافيك وواجهات مستخدم',
        company: 'وكالة إيقاع الرقمية',
        period: '2019 – 2022',
        achievements: 'تصميم حملات إطلاق لأكثر من 15 علامة تجارية محلية بمعدل نمو تفاعل 3.2x',
      },
    ],
    education: [
      {
        id: 'ed1',
        degree: 'بكالوريوس التصميم الجرافيكي والوسائط الرقمية',
        institution: 'جامعة عفت — جدة',
        year: '2019',
      },
    ],
    skills: [
      'بناء الهوية البصرية',
      'Figma',
      'Adobe Illustrator',
      'تجربة المستخدم UX',
      'أنظمة التصميم',
      'التايبوغرافي العربي',
      'تصميم التغليف',
    ],
    links: [
      { id: 'l1', label: 'معرض الأعمال على Behance', url: 'https://behance.net/sara-mansour' },
      { id: 'l2', label: 'حساب LinkedIn', url: 'https://linkedin.com/in/sara-mansour' },
      { id: 'l3', label: 'طلب عرض سعر عبر واتساب', url: 'https://wa.me/966507813340' },
    ],
    testimonials: [
      {
        id: 't1',
        name: 'أ. تركي العبدالله',
        role: 'مؤسس محمصة أثر',
        quote:
          'الهوية البصرية التي صممتها سارة نقلت علامتنا التجارية لمستوى مختلف تماماً، ولاحظنا أثرها المباشر في تفاعل العملاء والمبيعات.',
        verified: true,
      },
    ],
    languages: structuredClone(DEFAULT_LANGUAGES),
  },

  architect: {
    presetId: 'architect',
    profile: {
      fullName: 'م. خالد الشمراني',
      jobTitle: 'مهندس معماري أول — تصميم مستدام وإدارة مشاريع',
      city: 'الخبر، المملكة العربية السعودية',
      email: 'khaled.arch@basma-demo.sa',
      phone: '+966 54 902 1187',
      hidePhoneInPortfolio: false,
      bio: 'مهندس معماري معتمد لدى الهيئة السعودية للمهندسين بخبرة 8 سنوات في تصميم المشاريع السكنية والتجارية المتوافقة مع كود البناء السعودي ومبادئ العمارة السلمانية والاستدامة البيئية.',
      availability: 'open_both',
      avatarDataUrl: '',
      primaryPortfolioLink: 'https://linkedin.com/in/khaled-arch',
    },
    design: {
      template: 'minimal',
      accent: '#9A3412',
      blocks: { ...ALL_BLOCKS },
    },
    projects: [
      {
        id: 'p1',
        title: 'مجمع الواحة السكني المستدام',
        category: 'تصميم معماري سكني',
        description:
          'تطوير 18 فيلا سكنية معاصرة توظف التهوية الطبيعية والكاسرات الشمسية لتقليل الأحمال الحرارية.',
        impact: 'خفض استهلاك طاقة التبريد بنسبة 32% واجتياز فحص كود البناء من المرة الأولى',
        url: 'https://arch-khaled.example.sa/waha',
      },
      {
        id: 'p2',
        title: 'تأهيل المقر الإداري لشركة روافد',
        category: 'عمارة داخلية وتنفيذ',
        description:
          'إعادة توزيع المساحات المكتبية بمساحة 2,400 متر مربع لتعزيز الإضاءة الطبيعية والإنتاجية.',
        impact: 'إنجاز التنفيذ قبل الجدول الزمني بـ 14 يوماً وبوفر 11% من الميزانية المرصودة',
        url: 'https://arch-khaled.example.sa/rawafed',
      },
    ],
    experience: [
      {
        id: 'e1',
        role: 'مهندس معماري أول ومدير تصميم',
        company: 'مكتب أركان للاستشارات الهندسية',
        period: '2021 – حتى الآن',
        achievements:
          'قيادة التصميم المعماري لـ 14 مشروعاً سكنياً وتجارياً بقيمة إنشائية تتجاوز 95 مليون ريال\nاعتماد منهجية BIM في المكتب مما خفض تعارضات المخططات التنفيذية بنسبة 58%',
      },
      {
        id: 'e2',
        role: 'مهندس معماري مشارك',
        company: 'دار العمران الهندسية',
        period: '2018 – 2021',
        achievements:
          'إعداد المخططات التنفيذية ومراجعة التراخيص لأكثر من 25 مشروعاً بالمنطقة الشرقية',
      },
    ],
    education: [
      {
        id: 'ed1',
        degree: 'بكالوريوس العمارة والتخطيط العمراني',
        institution: 'جامعة الإمام عبدالرحمن بن فيصل',
        year: '2018',
      },
      {
        id: 'ed2',
        degree: 'شهادة محترف إدارة المشاريع (PMP)',
        institution: 'Project Management Institute',
        year: '2023',
      },
    ],
    skills: [
      'Revit BIM',
      'AutoCAD',
      'التصميم المستدام',
      'كود البناء السعودي',
      'إدارة المشاريع PMP',
      'Lumion & 3ds Max',
      'حصر الكميات والمواصفات',
    ],
    links: [
      { id: 'l1', label: 'حساب LinkedIn الهندسي', url: 'https://linkedin.com/in/khaled-arch' },
      { id: 'l2', label: 'استشارة هندسية عبر واتساب', url: 'https://wa.me/966549021187' },
    ],
    testimonials: [
      {
        id: 't1',
        name: 'أ. ماجد الخالدي',
        role: 'مدير التطوير العقاري — روافد',
        quote:
          'دقة عالية في المخططات التنفيذية ومتابعة ميدانية احترافية وفّرت علينا الوقت والتكلفة أثناء التنفيذ.',
        verified: true,
      },
    ],
    languages: structuredClone(DEFAULT_LANGUAGES),
  },

  marketer: {
    presetId: 'marketer',
    profile: {
      fullName: 'نورة الدوسري',
      jobTitle: 'مستشارة استراتيجيات النمو والتسويق الرقمي',
      city: 'الرياض، المملكة العربية السعودية',
      email: 'noura.growth@basma-demo.sa',
      phone: '+966 56 309 4412',
      hidePhoneInPortfolio: true,
      bio: 'مستشارة نمو وتسويق أداء أساعد المتاجر الإلكترونية وشركات التقنية على مضاعفة الإيرادات وتقليل تكلفة الاستحواذ عبر حملات مدفوعة قائمة على البيانات وتحسين رحلة العميل.',
      availability: 'open_both',
      avatarDataUrl: '',
      primaryPortfolioLink: 'https://linkedin.com/in/noura-growth',
    },
    design: {
      template: 'executive',
      accent: '#1E40AF',
      blocks: { ...ALL_BLOCKS },
    },
    projects: [
      {
        id: 'p1',
        title: 'استراتيجية الإطلاق والتوسع لتطبيق تقنية مالية',
        category: 'تسويق نمو واستحواذ',
        description: 'إدارة القنوات الإعلانية المدفوعة وبناء قمع تحويل متكامل لرفع التحميلات والتفعيل.',
        impact: 'تحقيق عائد على الإنفاق الإعلاني 4.6x واستقطاب 45,000 مستخدم نشط خلال 90 يوماً',
        url: 'https://noura-cases.example.sa/fintech',
      },
      {
        id: 'p2',
        title: 'تحسين معدل التحويل لمتجر أزياء سعودي',
        category: 'تحسين التحويل CRO',
        description:
          'إعادة هيكلة صفحات المنتجات وإطلاق حملات استعادة السلال المتروكة عبر البريد وواتساب.',
        impact: 'رفع معدل التحويل من 1.4% إلى 2.9% وزيادة متوسط قيمة السلة بنسبة 22%',
        url: 'https://noura-cases.example.sa/fashion-cro',
      },
    ],
    experience: [
      {
        id: 'e1',
        role: 'مديرة النمو والتسويق الرقمي',
        company: 'شركة وثبة للتجارة الإلكترونية',
        period: '2022 – حتى الآن',
        achievements:
          'إدارة ميزانيات إعلانية تتجاوز 2.4 مليون ريال سنوياً بعائد صافٍ يفوق المستهدف بنسبة 28%\nخفض تكلفة الاستحواذ على العميل (CAC) بنسبة 36% عبر تحسين الاستهداف والمحتوى',
      },
      {
        id: 'e2',
        role: 'أخصائية إعلانات أداء وتحليل بيانات',
        company: 'مجموعة مدى التسويقية',
        period: '2020 – 2022',
        achievements:
          'إدارة حسابات 12 عميلاً في قطاعات التجزئة والضيافة وتحقيق نمو مبيعات متوسطه 64%',
      },
    ],
    education: [
      {
        id: 'ed1',
        degree: 'بكالوريوس التسويق وإدارة الأعمال',
        institution: 'جامعة الأميرة نورة بنت عبدالرحمن',
        year: '2020',
      },
      {
        id: 'ed2',
        degree: 'شهادة Google Analytics & Performance Marketing',
        institution: 'Google Digital Academy',
        year: '2023',
      },
    ],
    skills: [
      'استراتيجيات النمو',
      'إعلانات الأداء المدفوعة',
      'تحليل البيانات GA4',
      'تحسين معدل التحويل CRO',
      'تحسين محركات البحث SEO',
      'التسويق بالمحتوى',
      'بناء القمع التسويقي',
    ],
    links: [
      { id: 'l1', label: 'الملف المهني على LinkedIn', url: 'https://linkedin.com/in/noura-growth' },
      { id: 'l2', label: 'حساب منصة X للمقالات التسويقية', url: 'https://x.com/noura_growth' },
      { id: 'l3', label: 'حجز جلسة استشارية عبر واتساب', url: 'https://wa.me/966563094412' },
    ],
    testimonials: [
      {
        id: 't1',
        name: 'أ. لطيفة السديري',
        role: 'المديرة التنفيذية — متجر أزياء نجد',
        quote:
          'نورة تعتمد على الأرقام والاختبار الحقيقي لا التخمين؛ تضاعف معدل التحويل في متجرنا خلال 90 يوماً فقط.',
        verified: true,
      },
    ],
    languages: structuredClone(DEFAULT_LANGUAGES),
  },

  accountant: {
    presetId: 'accountant',
    profile: {
      fullName: 'عبدالله الغامدي',
      jobTitle: 'محاسب مالي أول ومحلل تقارير مالية (IFRS)',
      city: 'الرياض، المملكة العربية السعودية',
      email: 'abdullah.fin@basma-demo.sa',
      phone: '+966 55 881 2045',
      hidePhoneInPortfolio: true,
      bio: 'محاسب مالي بخبرة 5 سنوات في إعداد القوائم المالية وفق معايير المحاسبة الدولية (IFRS)، وإدارة الإقرارات الزكوية والضريبية، وبناء نماذج التحليل المالي والموازنات. أساهم في ضبط المصروفات ورفع دقة التقارير لتمكين الإدارة من اتخاذ قرارات دقيقة.',
      availability: 'open_both',
      avatarDataUrl: '',
      primaryPortfolioLink: 'https://linkedin.com/in/abdullah-finance',
    },
    design: {
      template: 'executive',
      accent: '#1E293B',
      blocks: { ...ALL_BLOCKS },
    },
    projects: [
      {
        id: 'p1',
        title: 'أتمتة نظام الإقفال المالي الشهري ولوحة التدفقات',
        category: 'تحول رقمي مالي',
        description:
          'ربط بيانات المبيعات والمشتريات بنموذج تحليلي موحد في Excel وERP لمتابعة التدفق النقدي والانحرافات تلقائياً.',
        impact: 'تقليص مدة الإقفال المالي الشهري من 11 يوماً إلى 4 أيام بدقة مطابقة 99.9%',
        url: 'https://linkedin.com/in/abdullah-finance',
      },
      {
        id: 'p2',
        title: 'هيكلة الامتثال لضريبة القيمة المضافة والزكاة',
        category: 'امتثال وضرائب',
        description:
          'إعداد دليل إجراءات داخلية لمراجعة الفواتير الإلكترونية والإقرارات الربع سنوية قبل رفعها لهيئة الزكاة والضريبة.',
        impact: 'تحقيق التزام بنسبة 100% لمدة 12 ربعاً متتالياً دون أي غرامات أو ملاحظات',
        url: 'https://linkedin.com/in/abdullah-finance',
      },
    ],
    experience: [
      {
        id: 'e1',
        role: 'محاسب مالي أول',
        company: 'شركة ركائز للتجارة والتوريد',
        period: '2023 – حتى الآن',
        achievements:
          'إعداد القوائم المالية الشهرية والسنوية وتقارير الأرباح والخسائر لمجموعة تضم 3 فروع\nمراجعة عقود الموردين والمصروفات التشغيلية وتحقيق وفر سنوي بنسبة 14% (أكثر من 210 آلاف ريال)\nاجتياز المراجعة القانونية الخارجية لعامين متتاليين دون أي تحفظات',
      },
      {
        id: 'e2',
        role: 'محاسب عام',
        company: 'مؤسسة نماء للخدمات اللوجستية',
        period: '2021 – 2023',
        achievements:
          'إدارة التسويات البنكية اليومية وحسابات الذمم المدينة مما سرّع التحصيل بنسبة 26%\nإعداد ورفع إقرارات ضريبة القيمة المضافة بدقة 100% وفي المواعيد النظامية',
      },
    ],
    education: [
      {
        id: 'ed1',
        degree: 'بكالوريوس المحاسبة (معدل 4.6/5)',
        institution: 'جامعة الملك عبدالعزيز',
        year: '2021',
      },
      {
        id: 'ed2',
        degree: 'عضوية الهيئة السعودية للمراجعين والمحاسبين (SOCPA)',
        institution: 'الهيئة السعودية للمراجعين والمحاسبين',
        year: '2024',
      },
    ],
    skills: [
      'إعداد القوائم المالية',
      'معايير المحاسبة الدولية IFRS',
      'ضريبة القيمة المضافة والزكاة',
      'التحليل المالي والموازنات',
      'Excel المتقدم والنماذج المالية',
      'نظام قيود وSAP ERP',
      'المراجعة الداخلية',
      'إدارة التدفقات النقدية',
    ],
    links: [
      { id: 'l1', label: 'الملف المهني على LinkedIn', url: 'https://linkedin.com/in/abdullah-finance' },
      { id: 'l2', label: 'تواصل مهني عبر واتساب', url: 'https://wa.me/966558812045' },
    ],
    testimonials: [
      {
        id: 't1',
        name: 'أ. ناصر التميمي',
        role: 'المدير العام — شركة ركائز',
        quote:
          'بفضل التنظيم المالي والتقارير الشهرية التي أسسها عبدالله، أصبحت قراراتنا التوسعية مبنية على رؤية نقدية دقيقة وواضحة.',
        verified: true,
      },
    ],
    languages: structuredClone(DEFAULT_LANGUAGES),
  },

  hr: {
    presetId: 'hr',
    profile: {
      fullName: 'ريم الحربي',
      jobTitle: 'أخصائية موارد بشرية واستقطاب كفاءات',
      city: 'الرياض، المملكة العربية السعودية',
      email: 'reem.hr@basma-demo.sa',
      phone: '+966 53 614 7790',
      hidePhoneInPortfolio: true,
      bio: 'أخصائية موارد بشرية بخبرة 5 سنوات في استقطاب المواهب، تطوير تجربة الموظف، وإدارة العمليات التنظيمية وفق نظام العمل السعودي ومنصات قوى ومدد. أساعد المنشآت على بناء فرق متماسكة وتقليل الدوران الوظيفي عبر سياسات واضحة وعادلة.',
      availability: 'open_both',
      avatarDataUrl: '',
      primaryPortfolioLink: 'https://linkedin.com/in/reem-hr',
    },
    design: {
      template: 'minimal',
      accent: '#0F766E',
      blocks: { ...ALL_BLOCKS },
    },
    projects: [
      {
        id: 'p1',
        title: 'إعادة تصميم رحلة التهيئة للموظفين الجدد (Onboarding)',
        category: 'تجربة الموظف',
        description:
          'إطلاق دليل تفاعلي وخطة متابعة لأول 90 يوماً لكل موظف جديد لرفع سرعة اندماجه في الفريق.',
        impact: 'خفض معدل الاستقالات خلال فترة التجربة بنسبة 42% ورفع رضا الجدد إلى 92%',
        url: 'https://linkedin.com/in/reem-hr',
      },
      {
        id: 'p2',
        title: 'بناء إطار الأوصاف الوظيفية ومؤشرات الأداء (KPIs)',
        category: 'تطوير تنظيمي',
        description:
          'توحيد المسميات والمهام لـ 28 وظيفة داخل الشركة وربطها بنظام تقييم أداء ربع سنوي شفاف.',
        impact: 'رفع التزام الإدارات بمراجعات الأداء إلى 96% وتحسين وضوح المسار الوظيفي',
        url: 'https://linkedin.com/in/reem-hr',
      },
    ],
    experience: [
      {
        id: 'e1',
        role: 'أخصائية أولى موارد بشرية واستقطاب',
        company: 'شركة مسار للحلول التقنية',
        period: '2023 – حتى الآن',
        achievements:
          'قيادة عمليات التوظيف لإغلاق 52 شاغراً تقنياً وإدارياً وتقليص مدة التوظيف من 44 يوماً إلى 23 يوماً\nإدارة الامتثال الكامل لمنصات قوى ومدد والتأمينات الاجتماعية لـ 180 موظفاً دون أي مخالفات',
      },
      {
        id: 'e2',
        role: 'منسقة شؤون موظفين ورواتب',
        company: 'مجموعة توازن التجارية',
        period: '2021 – 2023',
        achievements:
          'إعداد مسيرات الرواتب الشهرية ونظام حماية الأجور بدقة 100%\nتنظيم 14 ورشة تدريبية داخلية رفعت مؤشر رضا الموظفين من 74% إلى 88%',
      },
    ],
    education: [
      {
        id: 'ed1',
        degree: 'بكالوريوس إدارة الموارد البشرية',
        institution: 'جامعة الإمام محمد بن سعود الإسلامية',
        year: '2021',
      },
      {
        id: 'ed2',
        degree: 'شهادة SHRM-CP المعتمدة في الموارد البشرية',
        institution: 'SHRM',
        year: '2024',
      },
    ],
    skills: [
      'استقطاب المواهب والتوظيف',
      'نظام العمل السعودي',
      'منصة قوى ومدد',
      'إدارة الأداء ومؤشرات KPIs',
      'مسيرات الرواتب وحماية الأجور',
      'تجربة الموظف',
      'التدريب والتطوير',
      'أنظمة الموارد البشرية جسر',
    ],
    links: [
      { id: 'l1', label: 'حساب LinkedIn المهني', url: 'https://linkedin.com/in/reem-hr' },
      { id: 'l2', label: 'تواصل عبر واتساب', url: 'https://wa.me/966536147790' },
    ],
    testimonials: [
      {
        id: 't1',
        name: 'م. راكان البقمي',
        role: 'مدير الهندسة — شركة مسار',
        quote:
          'سرعة استجابة ريم وجودة المرشحين الذين تستقطبهم ساعدتنا على بناء فريقنا التقني في نصف المدة المعتادة.',
        verified: true,
      },
    ],
    languages: structuredClone(DEFAULT_LANGUAGES),
  },

  teacher: {
    presetId: 'teacher',
    profile: {
      fullName: 'أ. محمد الزهراني',
      jobTitle: 'معلم رياضيات ومدرب مهارات كمية وتعلم نشط',
      city: 'الدمام، المملكة العربية السعودية',
      email: 'm.zahrani.edu@basma-demo.sa',
      phone: '+966 50 442 6198',
      hidePhoneInPortfolio: true,
      bio: 'معلم ومطور محتوى تعليمي بخبرة 7 سنوات في تدريس الرياضيات والقدرات الكمية باستخدام استراتيجيات التعلم النشط والأدوات التفاعلية. أؤمن بأن تبسيط المعلومة وبناء ثقة الطالب هما مفتاح التفوق الدراسي المستدام.',
      availability: 'open_both',
      avatarDataUrl: '',
      primaryPortfolioLink: 'https://linkedin.com/in/mohammed-edu',
    },
    design: {
      template: 'executive',
      accent: '#1E40AF',
      blocks: { ...ALL_BLOCKS },
    },
    projects: [
      {
        id: 'p1',
        title: 'حقيبة «تأسيس القدرات الكمية» التفاعلية',
        category: 'تصميم محتوى تعليمي',
        description:
          'بنك أسئلة مصنف مع شروحات مرئية مبسطة واختبارات محاكاة إلكترونية لطلاب المرحلة الثانوية.',
        impact: 'استفاد منها أكثر من 650 طالباً بمتوسط تحسن 19 درجة في الاختبارات التجريبية',
        url: 'https://linkedin.com/in/mohammed-edu',
      },
      {
        id: 'p2',
        title: 'مبادرة «معمل الرياضيات الرقمي» داخل المدرسة',
        category: 'تعلم نشط وتقنية',
        description: 'توظيف ألعاب تعليمية وتطبيقات تفاعلية لتحويل الحصص النظرية إلى تجارب عملية شيقة.',
        impact: 'رفع متوسط درجات الطلاب في الفصول المطبّقة بنسبة 24% خلال فصلين دراسيين',
        url: 'https://linkedin.com/in/mohammed-edu',
      },
    ],
    experience: [
      {
        id: 'e1',
        role: 'معلم أول رياضيات ومشرف نشاط علمي',
        company: 'مدارس الرواد الأهلية — الدمام',
        period: '2022 – حتى الآن',
        achievements:
          'تدريس أكثر من 180 طالباً سنوياً وتحقيق نسبة نجاح 99% بمتوسط تقدير ممتاز\nتأهيل 6 طلاب للمشاركة في أولمبياد الرياضيات الوطني وتحقيق ميداليتين على مستوى المنطقة',
      },
      {
        id: 'e2',
        role: 'مدرب معتمد — مهارات التفكير والقدرات',
        company: 'مركز إثراء للتدريب التربوي',
        period: '2019 – 2022',
        achievements: 'تقديم أكثر من 240 ساعة تدريبية حضورية وعن بُعد بمتوسط تقييم رضا 4.9/5',
      },
    ],
    education: [
      {
        id: 'ed1',
        degree: 'بكالوريوس الرياضيات التربوية',
        institution: 'جامعة الإمام عبدالرحمن بن فيصل',
        year: '2019',
      },
      {
        id: 'ed2',
        degree: 'شهادة تدريب المدربين المعتمدة (TOT)',
        institution: 'المؤسسة العامة للتدريب التقني والمهني',
        year: '2022',
      },
    ],
    skills: [
      'التعلم النشط',
      'تصميم الحقائب التعليمية',
      'إدارة الصف الدراسي',
      'التعليم الإلكتروني LMS',
      'بناء الاختبارات والقياس',
      'التوجيه الطلابي',
      'العرض والإلقاء التربوي',
      'أدوات Google التعليمية',
    ],
    links: [
      { id: 'l1', label: 'حساب LinkedIn التربوي', url: 'https://linkedin.com/in/mohammed-edu' },
      { id: 'l2', label: 'التنسيق للدورات عبر واتساب', url: 'https://wa.me/966504426198' },
    ],
    testimonials: [
      {
        id: 't1',
        name: 'أ. بندر الشهري',
        role: 'قائد مدارس الرواد الأهلية',
        quote:
          'الأستاذ محمد نموذج للمعلم المبدع؛ استطاع بأسلوبه التفاعلي تحويل مادة الرياضيات إلى الحصة المفضلة لدى الطلاب.',
        verified: true,
      },
    ],
    languages: structuredClone(DEFAULT_LANGUAGES),
  },

  freshgrad: {
    presetId: 'freshgrad',
    profile: {
      fullName: 'فيصل السبيعي',
      jobTitle: 'خريج حديث — نظم المعلومات الإدارية وتحليل الأعمال',
      city: 'الرياض، المملكة العربية السعودية',
      email: 'faisal.grad@basma-demo.sa',
      phone: '+966 59 204 8813',
      hidePhoneInPortfolio: true,
      bio: 'خريج حديث في تخصص نظم المعلومات الإدارية بمعدل 4.72/5 (مرتبة الشرف الثانية)، أمتلك أساساً عملياً في تحليل البيانات وبناء لوحات التقارير عبر Excel وPower BI. أتممت تدريباً تعاونياً ومشروع تخرج تطبيقي، وأتطلع للمساهمة بفاعلية في بيئة عمل احترافية.',
      availability: 'open_fulltime',
      avatarDataUrl: '',
      primaryPortfolioLink: 'https://linkedin.com/in/faisal-grad',
    },
    design: {
      template: 'creative',
      accent: '#0F766E',
      blocks: { ...ALL_BLOCKS },
    },
    projects: [
      {
        id: 'p1',
        title: 'مشروع التخرج: لوحة ذكاء أعمال لتحليل مبيعات التجزئة',
        category: 'مشروع تخرج (تقدير A+)',
        description:
          'جمع وتنظيف 15,000 سجل مبيعات وبناء لوحة تفاعلية في Power BI لاكتشاف المنتجات الأكثر ربحية وأوقات الذروة.',
        impact: 'حصل المشروع على تقدير ممتاز (A+) وتم اختياره ضمن أفضل 3 مشاريع بالقسم',
        url: 'https://linkedin.com/in/faisal-grad',
      },
      {
        id: 'p2',
        title: 'تنظيم مبادرة «خطوة نحو سوق العمل» الطلابية',
        category: 'عمل تطوعي وقيادة',
        description:
          'المساهمة في تنسيق 6 ورش عمل مهنية لطلاب السنة الأخيرة وإدارة تسجيل الحضور واستبيانات التقييم.',
        impact: 'استفاد من المبادرة أكثر من 320 طالباً بنسبة رضا بلغت 94%',
        url: 'https://linkedin.com/in/faisal-grad',
      },
    ],
    experience: [
      {
        id: 'e1',
        role: 'متدرب تحليل أعمال وتقارير (تدريب تعاوني)',
        company: 'شركة آفاق للخدمات الرقمية',
        period: 'يونيو 2026 – أكتوبر 2026 (16 أسبوعاً)',
        achievements:
          'المساهمة في أتمتة التقارير الأسبوعية لخدمة العملاء باستخدام Excel مما وفّر 6 ساعات عمل أسبوعياً\nتصنيف ومراجعة أكثر من 1,200 سجل بيانات ورفع دقة البيانات إلى 98%\nالحصول على تقييم ممتاز (98/100) وتوصية مهنية من مشرف التدريب',
      },
      {
        id: 'e2',
        role: 'عضو لجنة التنظيم والتقارير (عمل تطوعي)',
        company: 'النادي التقني الطلابي — جامعة الملك سعود',
        period: '2024 – 2026',
        achievements:
          'تنظيم 6 ورش عمل مهنية لطلاب السنة الأخيرة بحضور أكثر من 320 طالباً\nإعداد استبيانات قياس الأثر وتحليل نتائج التقييم بعد كل فعالية',
      },
    ],
    education: [
      {
        id: 'ed1',
        degree: 'بكالوريوس نظم المعلومات الإدارية (معدل 4.72/5)',
        institution: 'جامعة الملك سعود — الرياض',
        year: '2026',
      },
      {
        id: 'ed2',
        degree: 'شهادة تحليل البيانات باستخدام Power BI وExcel',
        institution: 'أكاديمية طويق / Microsoft',
        year: '2026',
      },
    ],
    skills: [
      'Microsoft Excel المتقدم',
      'Power BI',
      'تحليل البيانات والتقارير',
      'مهارات التواصل والعرض',
      'العمل ضمن فريق',
      'حل المشكلات',
      'إدارة الوقت',
      'اللغة الإنجليزية المهنية',
    ],
    links: [
      { id: 'l1', label: 'حساب LinkedIn المهني', url: 'https://linkedin.com/in/faisal-grad' },
      { id: 'l2', label: 'تواصل مباشر عبر واتساب', url: 'https://wa.me/966592048813' },
    ],
    testimonials: [
      {
        id: 't1',
        name: 'أ. بدر العنزي',
        role: 'مشرف التدريب التعاوني — شركة آفاق',
        quote:
          'أظهر فيصل سرعة تعلم لافتة وانضباطاً مهنياً عالياً، وساهم بفاعلية في تطوير تقاريرنا الأسبوعية بدقة تفوق التوقعات.',
        verified: true,
      },
    ],
    languages: structuredClone(DEFAULT_LANGUAGES),
  },
};

export function buildPresetData(presetKey: PresetId = 'dev'): PortfolioData {
  const base = structuredClone(PRESETS_DATA[presetKey] ?? PRESETS_DATA.dev);
  return {
    ...base,
    card: {
      ...DEFAULT_BUSINESS_CARD_CONFIG,
      accentColor: base.design.accent,
    },
  };
}

/**
 * Returns a new array with the item at `index` shifted by `direction` (-1 or 1).
 */
export function moveArrayItem<T>(arr: readonly T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (index < 0 || index >= arr.length || target < 0 || target >= arr.length) {
    return [...arr];
  }
  const next = [...arr];
  const currentItem = next[index]!;
  next[index] = next[target]!;
  next[target] = currentItem;
  return next;
}
