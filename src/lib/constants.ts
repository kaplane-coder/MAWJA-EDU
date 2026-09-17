import { Course, CourseCategory, Formateur } from "@/types";

export const APP_CONFIG = {
  name: "MAWJA",
  nameArabic: "مَوْجَة",
  tagline: "المنصة الجزائرية لتعلّم مهارات المستقبل",
  description:
    "موجة هي منصة التعليم الرقمي الرائدة في الجزائر، تقدم دورات تدريبية عملية في البرمجة، التصميم، والذكاء الاصطناعي على أيدي نخبة من الخبراء.",
  currency: "د.ج",
  supportEmail: "contact@mawja.edu.dz",
};

export const NAV_LINKS = [
  { label: "الرئيسية", href: "/" },
  { label: "الدورات التدريبية", href: "/courses" },
  { label: "دوراتي", href: "/student/my-courses" },
  { label: "طلباتي", href: "/student/orders" },
];

export const MOCK_CATEGORIES: CourseCategory[] = [
  {
    id: "cat-1",
    slug: "software-development",
    name: "تطوير البرمجيات",
    description: "بناء تطبيقات الويب والموبايل والأنظمة الحديثة",
    iconName: "Code2",
    courseCount: 14,
  },
  {
    id: "cat-2",
    slug: "ui-ux-design",
    name: "تصميم واجهات وتجربة المستخدم",
    description: "إتقان Figma وتصميم المنتجات الرقمية العالمية",
    iconName: "Palette",
    courseCount: 9,
  },
  {
    id: "cat-3",
    slug: "ai-data-science",
    name: "الذكاء الاصطناعي والبيانات",
    description: "تطبيقات التعلم الآلي وهندسة الأوامر وتحليل البيانات",
    iconName: "BrainCircuit",
    courseCount: 8,
  },
  {
    id: "cat-4",
    slug: "business-freelancing",
    name: "ريادة الأعمال والعمل الحر",
    description: "إطلاق المنتجات، إدارة المشاريع والعمل مع عملاء دوليين",
    iconName: "Briefcase",
    courseCount: 11,
  },
];

export const MOCK_FORMATEURS: Formateur[] = [
  {
    id: "formateur-1",
    fullName: "أمين بوعبد الله",
    headline: "Lead Full-Stack Engineer | خبير Next.js & Cloud",
    bio: "مهندس برمجيات ذو خبرة 9+ سنوات في شركات ناشئة عالمية، ساهم في بناء منصات تخدم ملايين المستخدمين.",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
    totalStudents: 1420,
    totalCourses: 3,
    rating: 4.9,
  },
  {
    id: "formateur-2",
    fullName: "سارة مداني",
    headline: "Senior Product Designer & Design Systems Lead",
    bio: "متخصصة في تصميم الأنظمة المعقدة والتجارب الرقمية، ساعدت أكثر من 20 شركة في بناء هوياتها الرقمية.",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80",
    totalStudents: 980,
    totalCourses: 2,
    rating: 4.85,
  },
  {
    id: "formateur-3",
    fullName: "كريم ياحي",
    headline: "DevOps & Cloud Architect | AWS Certified",
    bio: "استشاري بنية تحتية سحابية وأمن بيانات، يركز على ترحيل وتأمين التطبيقات الموجهة للإنتاج.",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80",
    totalStudents: 750,
    totalCourses: 2,
    rating: 4.95,
  },
];

export const MOCK_COURSES: Course[] = [
  {
    id: "course-1",
    slug: "nextjs-fullstack-production-masterclass",
    title: "بناء تطبيقات Full-Stack موجهة للإنتاج باستخدام Next.js 15 و Supabase",
    shortDescription:
      "دورة شاملة تأخذك من الصفر حتى بناء منصة متكاملة وإطلاقها حية على السحابة مع أمان RLS و Server Actions.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
    price: 18500,
    originalPrice: 26000,
    level: "INTERMEDIATE",
    status: "PUBLISHED",
    category: "تطوير البرمجيات",
    categorySlug: "software-development",
    formateur: MOCK_FORMATEURS[0],
    rating: 4.9,
    ratingCount: 128,
    studentsCount: 640,
    durationMinutes: 980,
    lessonsCount: 42,
    badge: "BESTSELLER",
    updatedAt: "2026-03-01",
  },
  {
    id: "course-2",
    slug: "design-systems-figma-mastery",
    title: "هندسة أنظمة التصميم الاحترافية (Design Systems) في Figma و React",
    shortDescription:
      "تعلم بناء Design Tokens، مكونات متوافقة مع إمكانية الوصول، وتوثيق الأنظمة للفرق الهندسية الكبرى.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80",
    price: 14000,
    originalPrice: 19500,
    level: "ALL_LEVELS",
    status: "PUBLISHED",
    category: "تصميم واجهات وتجربة المستخدم",
    categorySlug: "ui-ux-design",
    formateur: MOCK_FORMATEURS[1],
    rating: 4.85,
    ratingCount: 86,
    studentsCount: 410,
    durationMinutes: 720,
    lessonsCount: 30,
    badge: "EXCLUSIVE",
    updatedAt: "2026-03-01",
  },
  {
    id: "course-3",
    slug: "docker-kubernetes-devops-bootcamp",
    title: "معسكر الـ DevOps الشامل: Docker، Kubernetes وخطوط إنتاج CI/CD",
    shortDescription:
      "أتقن تشغيل، تأمين، ونشر الحاويات البرمجية وإدارة البنى التحتية السحابية باحترافية عملية تامة.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=800&q=80",
    price: 22000,
    originalPrice: 30000,
    level: "ADVANCED",
    status: "PUBLISHED",
    category: "تطوير البرمجيات",
    categorySlug: "software-development",
    formateur: MOCK_FORMATEURS[2],
    rating: 4.95,
    ratingCount: 74,
    studentsCount: 320,
    durationMinutes: 1100,
    lessonsCount: 48,
    badge: "NEW",
    updatedAt: "2026-03-01",
  },
  {
    id: "course-4",
    slug: "ai-prompt-engineering-and-agents",
    title: "تطوير وكلاء الذكاء الاصطناعي (AI Agents) وهندسة النماذج اللغوية الكبيرة",
    shortDescription:
      "بناء حلول برمجية ذكية تتكامل مع LLMs وتنفذ مهام الأتمتة المعقدة للشركات.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80",
    price: 19000,
    originalPrice: 24000,
    level: "INTERMEDIATE",
    status: "PUBLISHED",
    category: "الذكاء الاصطناعي والبيانات",
    categorySlug: "ai-data-science",
    formateur: MOCK_FORMATEURS[0],
    rating: 4.92,
    ratingCount: 65,
    studentsCount: 290,
    durationMinutes: 840,
    lessonsCount: 36,
    badge: "TRENDING",
    updatedAt: "2026-03-01",
  },
];

export const PLATFORM_STATS = [
  { value: "+3,500", label: "طالب نشط في الجزائر" },
  { value: "+25", label: "دورة تدريبية موجهة للإنتاج" },
  { value: "4.9/5", label: "متوسط تقييم الدورات" },
  { value: "%100", label: "مشاريع عملية تطبيقية" },
];

export const WHY_MAWJA = [
  {
    title: "محتوى موجه لسوق العمل الحقيقي",
    description:
      "دوراتنا مبنية على مشاريع فعلية تواجهها الشركات التقنية الحديثة، وليست مجرد أمثلة مبسطة أو أكاديمية جافة.",
    icon: "Target",
  },
  {
    title: "خبراء ممارسون وليسوا مجرد ملقنين",
    description:
      "تتعلم مباشرة من مهندسين ومصممين يمارسون هذه المهارات يومياً في بيئات إنتاجية حقيقية.",
    icon: "Award",
  },
  {
    title: "مشاريع برمجية وتطبيقية كاملة",
    description:
      "تطبيق مباشر على مشاريع حقيقية مع إمكانية الوصول إلى الكود المصدري الكامل لاستخدامه في أعمالك.",
    icon: "Code2",
  },
  {
    title: "وصول غير محدود ومجتمع تقني متفاعل",
    description:
      "احصل على وصول دائم لجميع تحديثات الدورة وشارك في مجتمع المطورين لمناقشة التحديات والحلول.",
    icon: "Users",
  },
];
