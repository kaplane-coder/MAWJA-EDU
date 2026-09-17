import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  CheckCircle,
  ShieldCheck,
  Lightning,
  PlayCircle,
  CreditCard,
  Buildings,
  Compass,
} from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { AnimatedTooltip, type TooltipItem } from "@/components/ui/animated-tooltip";
import { CourseCard, type CourseCardData } from "@/components/course/course-card";
import { HeroHeadline } from "@/components/home/hero-headline";
import { getPublishedCourses } from "@/lib/courses";
import { createPublicClient } from "@/lib/supabase/server";
import {
  MOCK_COURSES,
  MOCK_CATEGORIES,
} from "@/lib/constants";

// Cache and revalidate homepage every 5 minutes (ISR)
// This guarantees instant static CDN delivery without stream disconnection errors on Netlify
export const revalidate = 300;

export default async function HomePage() {
  // 1. Fetch real published courses from Supabase (with graceful fallback)
  let displayCourses: CourseCardData[] = MOCK_COURSES.slice(0, 6);
  let instructorTooltipItems: TooltipItem[] = [];
  let instructors: Array<{ id: string; full_name: string; avatar_url: string | null; headline: string | null; specialization: string | null }> = [];

  try {
    const { courses: dbCourses } = await getPublishedCourses({ limit: 6 });
    if (dbCourses && dbCourses.length > 0) {
      displayCourses = dbCourses;
    }
  } catch (err) {
    console.error("Courses fetch error, falling back to mock:", err);
  }

  try {
    // 2. Fetch real verified instructors from Supabase using public client
    const supabase = createPublicClient();
    const { data: instructorsData, error: instError } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, headline, specialization")
      .eq("role", "FORMATEUR")
      .limit(5);

    if (!instError && instructorsData && instructorsData.length > 0) {
      instructors = instructorsData as typeof instructors;
      instructorTooltipItems = instructors.map((inst) => ({
        id: inst.id || "inst",
        name: inst.full_name || "مدرب معتمد",
        designation: inst.headline || inst.specialization || "مدرب معتمد",
        image: inst.avatar_url,
      }));
    }
  } catch (error) {
    // Graceful fallback: use empty or mock data if Supabase is unreachable
    console.error("Homepage instructors fetch failed, using fallback:", error);
  }

  return (
    <div className="flex flex-col space-y-24 pb-24 text-right">
      {/* ===================================================
          1. HERO SECTION (White + Electric Purple Split Screen)
          =================================================== */}
      <section className="relative overflow-hidden pt-10 sm:pt-16 pb-16 bg-gradient-to-b from-primary-subtle/80 via-background to-background border-b border-border/80">
        {/* Subtle Decorative Gradient Glows (GPU Safe) */}
        <div className="pointer-events-none absolute -top-32 inset-x-0 mx-auto h-[380px] w-full max-w-3xl rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute top-1/3 -start-20 h-[280px] w-[280px] rounded-full bg-purple-400/10 blur-2xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Right Column: Hero Copy & Actions (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Main Animated Headline */}
              <HeroHeadline />

              {/* Subtitle */}
              <p className="text-body-lg text-foreground/80 max-w-2xl leading-relaxed">
                موجة تجمع الدورات التطبيقية، الخبرات البرمجية، ونخبة المدربين الجزائريين في تجربة تعليمية حديثة تفتح لك آفاق سوق العمل والعمل الحر.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link href="/register">
                  <Button variant="primary" size="lg" className="font-bold gap-2 shadow-glow">
                    <span>ابدأ رحلة التعلم</span>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/courses">
                  <Button variant="outline" size="lg" className="font-bold">
                    اكتشف الدورات
                  </Button>
                </Link>
              </div>

              {/* Quick Search Form */}
              <form
                action="/courses"
                method="GET"
                className="w-full max-w-xl flex items-center rounded-2xl border border-border bg-surface p-1.5 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all mt-4"
              >
                <input
                  type="text"
                  name="q"
                  placeholder="ابحث عن مهارة، تقنية (Next.js, Python, DevOps, UI/UX)..."
                  className="w-full bg-transparent px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <Button type="submit" variant="primary" size="md" className="font-bold shrink-0">
                  بحث
                </Button>
              </form>

              {/* Category Quick Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-muted-foreground font-semibold">الأكثر طلباً:</span>
                <Link href="/courses?category=web-dev" className="rounded-full bg-surface border border-border hover:border-primary/50 hover:bg-primary-subtle hover:text-primary px-3 py-1 text-foreground/80 transition-colors font-medium">
                  تطوير الويب
                </Link>
                <Link href="/courses?category=mobile-dev" className="rounded-full bg-surface border border-border hover:border-primary/50 hover:bg-primary-subtle hover:text-primary px-3 py-1 text-foreground/80 transition-colors font-medium">
                  تطبيقات الهاتف
                </Link>
                <Link href="/courses?category=ai-data" className="rounded-full bg-surface border border-border hover:border-primary/50 hover:bg-primary-subtle hover:text-primary px-3 py-1 text-foreground/80 transition-colors font-medium">
                  الذكاء الاصطناعي
                </Link>
                <Link href="/courses?category=ui-ux" className="rounded-full bg-surface border border-border hover:border-primary/50 hover:bg-primary-subtle hover:text-primary px-3 py-1 text-foreground/80 transition-colors font-medium">
                  تصميم الواجهات
                </Link>
              </div>

              {/* Trust highlights */}
              <div className="flex flex-wrap items-center gap-5 pt-4 text-xs text-muted-foreground border-t border-border/80">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-success shrink-0" />
                  <span className="font-medium text-foreground/80">دفع محلي عبر بريدي موب و CCP</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-success shrink-0" />
                  <span className="font-medium text-foreground/80">مشاريع سوق العمل الحقيقية</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-success shrink-0" />
                  <span className="font-medium text-foreground/80">شهادات إنجاز معتمدة</span>
                </div>
              </div>
            </div>

            {/* Left Column: Cinematic Visual (5 cols) */}
            <div className="lg:col-span-5 relative">
              <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3] min-h-[360px] sm:min-h-[420px] rounded-3xl overflow-hidden border border-primary/20 shadow-xl bg-surface-secondary">
                <Image
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2850&auto=format&fit=crop"
                  alt="Students learning on MAWJA Education"
                  fill
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-cover object-center transform transition-transform duration-700 hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/70 via-purple-900/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/25 to-transparent" />
                
                {/* Floating Social Proof inside Image */}
                {instructorTooltipItems.length > 0 && (
                  <div className="absolute bottom-4 left-4 right-4 z-10">
                    <div className="rounded-2xl border border-white/20 bg-black/60 backdrop-blur-md p-3.5 flex items-center justify-between shadow-lg">
                      <div className="flex items-center gap-3">
                        <AnimatedTooltip items={instructorTooltipItems} />
                        <div className="text-right">
                          <p className="text-xs font-bold text-white">نخبة الخبراء والمدربين</p>
                          <p className="text-[10px] text-white/80">مهندسون معتمدون في الجزائر</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          3. FEATURED COURSES (Course Discovery Grid)
          =================================================== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="default" size="sm" className="gap-1">
                <PlayCircle className="h-3.5 w-3.5" />
                <span>أحدث المسارات التدريبية</span>
              </Badge>
            </div>
            <h2 className="text-h2 font-extrabold text-foreground">
              دورات تدريبية متميزة
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              مسارات مكثفة صُممت لنقلك من الأساسيات إلى الاحتراف وبناء مشاريع حقيقية
            </p>
          </div>

          <Link href="/courses">
            <Button variant="outline" size="sm" className="gap-1.5 font-bold text-xs">
              <span>عرض كل الكتالوج</span>
              <ArrowLeft className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>

      {/* ===================================================
          4. CATEGORIES & LEARNING TRACKS
          =================================================== */}
      <section className="bg-surface-secondary/70 border-y border-border/80 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <h2 className="text-h2 font-extrabold text-foreground">
              تصفح حسب المجال التخصصي
            </h2>
            <p className="text-sm text-muted-foreground">
              اختر المجال الذي يناسب طموحاتك المهنية وابدأ مسارك التدريبي اليوم
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MOCK_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/courses?category=${cat.slug}`}
                className="group rounded-2xl border border-border bg-surface p-6 transition-all duration-200 hover:border-primary hover:shadow-md hover:-translate-y-1"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-subtle text-primary mb-4 transition-transform group-hover:scale-110">
                  <Compass className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  {cat.description}
                </p>
                <div className="flex items-center gap-1 text-xs font-bold text-primary pt-4 mt-2 border-t border-border/60">
                  <span>استكشف الدورات</span>
                  <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================
          5. TOP CERTIFIED INSTRUCTORS
          =================================================== */}
      {instructors.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="default" size="sm" className="gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>نخبة المدربين</span>
                </Badge>
              </div>
              <h2 className="text-h2 font-extrabold text-foreground">
                تعلّم مباشرة من خبراء الصناعة
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                مدربون معتمدون ذوو خبرة ميدانية في كبرى الشركات والمشاريع البرمجية
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {instructors.map((inst) => (
              <div
                key={inst.id}
                className="rounded-2xl border border-border bg-surface p-6 text-center space-y-4 hover:border-primary/50 hover:shadow-md transition-all"
              >
                <Avatar
                  src={inst.avatar_url || undefined}
                  alt={inst.full_name}
                  fallback={inst.full_name}
                  size="xl"
                  className="mx-auto ring-4 ring-primary/15 shadow-sm"
                />
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-foreground">
                    {inst.full_name}
                  </h3>
                  {inst.headline && (
                    <p className="text-xs font-semibold text-primary truncate">
                      {inst.headline}
                    </p>
                  )}
                  {inst.specialization && (
                    <p className="text-[11px] text-muted-foreground truncate">
                      {inst.specialization}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===================================================
          6. WHY MAWJA (Platform Values & Local Advantage)
          =================================================== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="rounded-3xl border border-border bg-gradient-to-r from-primary-subtle via-surface to-surface p-8 sm:p-12 shadow-sm">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 items-center">
            <div className="space-y-6">
              <Badge variant="default" size="sm" className="gap-1">
                <Lightning className="h-3.5 w-3.5" />
                <span>لماذا منصة موجة؟</span>
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground leading-tight">
                تجربة تعليمية مصممة خصيصاً للمتعلم والمطور الجزائري
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                تجمع منصة موجة بين سهولة الدفع عبر القنوات المحلية الجزائرية (بريدي موب والحساب الجاري CCP) مع جودة محتوى تطبيقية عالية وتدريب يركز على الإنتاج الفعلي.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="rounded-xl border border-border bg-surface p-4 space-y-1.5 shadow-xs">
                  <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                    <CreditCard className="h-4 w-4 text-primary" />
                    <span>دفع محلي 100%</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    لا حاجة لبطاقات دولية؛ تفعيل فوري وموثق عبر BaridiMob و CCP.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-surface p-4 space-y-1.5 shadow-xs">
                  <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                    <Buildings className="h-4 w-4 text-primary" />
                    <span>مشاريع سوق العمل</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    بناء تطبيقات وأنظمة حقيقية تؤهلك للتوظيف والعمل الحر المباشر.
                  </p>
                </div>
              </div>
            </div>

            {/* Right side CTA Box */}
            <div className="rounded-2xl border border-primary/20 bg-primary-subtle/50 p-8 sm:p-10 text-center space-y-5">
              <div className="space-y-2">
                <h3 className="text-xl font-black text-foreground">
                  جاهز لبدء رحلتك التعليمية؟
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
                  انضم إلى مجتمع المتعلمين والمهندسين في موجة واكتسب المهارات الأكثر طلباً اليوم.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link href="/courses" className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto font-bold gap-2 shadow-xs">
                    <span>تصفح كل الدورات</span>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/register" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto font-bold">
                    إنشاء حساب مجاني
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
