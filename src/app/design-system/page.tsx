"use client";

import * as React from "react";
import {
  Sparkle,
  Stack,
  Palette,
  TextAa,
  Square,
  Sliders,
  DownloadSimple,
  Plus,
} from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Radio } from "@/components/ui/radio";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog } from "@/components/ui/dialog";
import { Dropdown } from "@/components/ui/dropdown";
import { Tooltip } from "@/components/ui/tooltip";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { CourseCard } from "@/components/course/course-card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { MOCK_COURSES } from "@/lib/constants";

export default function DesignSystemPage() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [switchChecked, setSwitchChecked] = React.useState(true);
  const [checkboxChecked, setCheckboxChecked] = React.useState(true);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-16 text-right">
      {/* Header */}
      <div className="space-y-4 border-b border-border pb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
          <Sparkle className="h-3.5 w-3.5" />
          <span>MAWJA Design System Specification v1.0</span>
        </div>
        <h1 className="text-display font-extrabold text-foreground">
          دليل نظام التصميم (Design System Showcase)
        </h1>
        <p className="text-body-lg text-muted-foreground max-w-3xl leading-relaxed">
          المرجع البصري الموحد لجميع عناصر وواجهات منصة موجة التعليمية. يرتكز
          النظام على البساطة، التباين المحسوب، دعم RTL الأصيل، ونظام الـ Design
          Tokens المركزي الخالي من التكرار العشوائي.
        </p>
      </div>

      {/* ===================================================
          1. COLOR TOKENS
          =================================================== */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-primary">
          <Palette className="h-5 w-5" />
          <h2 className="text-h2 font-bold text-foreground">
            1. منظومة الألوان (Color Tokens)
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          لوحة ألوان مبنية على مبدأ Light-First مع دعم كامل للمظهر الداكن عبر متغيرات CSS.
        </p>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          <div className="rounded-xl border border-border bg-surface p-4 space-y-3 shadow-xs">
            <div className="h-16 w-full rounded-lg bg-primary shadow-xs" />
            <div>
              <p className="text-xs font-bold text-foreground">Primary</p>
              <p className="font-mono text-[11px] text-muted-foreground">hsl(var(--primary))</p>
              <p className="text-[10px] text-muted-foreground">#0A66C2 Ocean Blue</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4 space-y-3 shadow-xs">
            <div className="h-16 w-full rounded-lg bg-background border border-border" />
            <div>
              <p className="text-xs font-bold text-foreground">Background</p>
              <p className="font-mono text-[11px] text-muted-foreground">hsl(var(--background))</p>
              <p className="text-[10px] text-muted-foreground">#F7F9FA Canvas</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4 space-y-3 shadow-xs">
            <div className="h-16 w-full rounded-lg bg-foreground" />
            <div>
              <p className="text-xs font-bold text-foreground">Foreground</p>
              <p className="font-mono text-[11px] text-muted-foreground">hsl(var(--foreground))</p>
              <p className="text-[10px] text-muted-foreground">#0F172A Deep Slate</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4 space-y-3 shadow-xs">
            <div className="h-16 w-full rounded-lg bg-surface border border-border shadow-md" />
            <div>
              <p className="text-xs font-bold text-foreground">Surface</p>
              <p className="font-mono text-[11px] text-muted-foreground">hsl(var(--surface))</p>
              <p className="text-[10px] text-muted-foreground">#FFFFFF Containers</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4 space-y-3 shadow-xs">
            <div className="h-16 w-full rounded-lg bg-success text-success-foreground flex items-center justify-center font-bold text-xs" />
            <div>
              <p className="text-xs font-bold text-foreground">Success</p>
              <p className="font-mono text-[11px] text-muted-foreground">hsl(var(--success))</p>
              <p className="text-[10px] text-muted-foreground">#16A34A Emerald</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4 space-y-3 shadow-xs">
            <div className="h-16 w-full rounded-lg bg-warning text-warning-foreground flex items-center justify-center font-bold text-xs" />
            <div>
              <p className="text-xs font-bold text-foreground">Warning</p>
              <p className="font-mono text-[11px] text-muted-foreground">hsl(var(--warning))</p>
              <p className="text-[10px] text-muted-foreground">#F59E0B Amber</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4 space-y-3 shadow-xs">
            <div className="h-16 w-full rounded-lg bg-error text-error-foreground flex items-center justify-center font-bold text-xs" />
            <div>
              <p className="text-xs font-bold text-foreground">Error</p>
              <p className="font-mono text-[11px] text-muted-foreground">hsl(var(--error))</p>
              <p className="text-[10px] text-muted-foreground">#EF4444 Crimson</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4 space-y-3 shadow-xs">
            <div className="h-16 w-full rounded-lg bg-info text-info-foreground flex items-center justify-center font-bold text-xs" />
            <div>
              <p className="text-xs font-bold text-foreground">Info</p>
              <p className="font-mono text-[11px] text-muted-foreground">hsl(var(--info))</p>
              <p className="text-[10px] text-muted-foreground">#0EA5E9 Sky Cyan</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4 space-y-3 shadow-xs">
            <div className="h-16 w-full rounded-lg bg-muted border border-border" />
            <div>
              <p className="text-xs font-bold text-foreground">Muted</p>
              <p className="font-mono text-[11px] text-muted-foreground">hsl(var(--muted))</p>
              <p className="text-[10px] text-muted-foreground">#F1F5F9 Neutral</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4 space-y-3 shadow-xs">
            <div className="h-16 w-full rounded-lg border-2 border-border bg-surface" />
            <div>
              <p className="text-xs font-bold text-foreground">Border / Input</p>
              <p className="font-mono text-[11px] text-muted-foreground">hsl(var(--border))</p>
              <p className="text-[10px] text-muted-foreground">#E2E8F0 Subtle</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          2. TYPOGRAPHY SCALE
          =================================================== */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-primary">
          <TextAa className="h-5 w-5" />
          <h2 className="text-h2 font-bold text-foreground">
            2. سلم الخطوط والطباعة (Typography Scale)
          </h2>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-6">
          <div className="border-b border-border/60 pb-4">
            <span className="text-xs font-mono text-muted-foreground">.text-display (3.75rem / 60px)</span>
            <p className="text-display font-extrabold text-foreground mt-1">
              موجة للتعليم الرقمي
            </p>
          </div>
          <div className="border-b border-border/60 pb-4">
            <span className="text-xs font-mono text-muted-foreground">.text-h1 (2.25rem / 36px)</span>
            <h1 className="text-h1 font-bold text-foreground mt-1">
              العنوان الرئيسي للصفحات (Heading 1)
            </h1>
          </div>
          <div className="border-b border-border/60 pb-4">
            <span className="text-xs font-mono text-muted-foreground">.text-h2 (1.875rem / 30px)</span>
            <h2 className="text-h2 font-bold text-foreground mt-1">
              عنوان الأقسام الرئيسية (Heading 2)
            </h2>
          </div>
          <div className="border-b border-border/60 pb-4">
            <span className="text-xs font-mono text-muted-foreground">.text-h3 (1.5rem / 24px)</span>
            <h3 className="text-h3 font-semibold text-foreground mt-1">
              عنوان البطاقات والمجموعات (Heading 3)
            </h3>
          </div>
          <div className="border-b border-border/60 pb-4">
            <span className="text-xs font-mono text-muted-foreground">.text-body-lg (1.125rem / 18px)</span>
            <p className="text-body-lg text-foreground/90 mt-1">
              نص الفقرات التمهيدية والوصف الموسع للدورات والمسارات التدريبية.
            </p>
          </div>
          <div className="border-b border-border/60 pb-4">
            <span className="text-xs font-mono text-muted-foreground">.text-body (1rem / 16px)</span>
            <p className="text-body text-foreground/85 mt-1">
              النص القياسي لجميع المحتويات والفقرات والشروحات التوضيحية داخل المنصة.
            </p>
          </div>
          <div className="border-b border-border/60 pb-4">
            <span className="text-xs font-mono text-muted-foreground">.text-small (0.875rem / 14px)</span>
            <p className="text-small mt-1">
              النصوص المساعدة، تفاصيل الميتاداتا، وتواريخ النشر والإشعارات.
            </p>
          </div>
          <div>
            <span className="text-xs font-mono text-muted-foreground">.text-caption (0.75rem / 12px)</span>
            <p className="text-caption mt-1 uppercase">
              شريط الملاحظات والوسوم الدقيقة والحقوق الفكرية
            </p>
          </div>
        </div>
      </section>

      {/* ===================================================
          3. BUTTON SYSTEM
          =================================================== */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-primary">
          <Square className="h-5 w-5" />
          <h2 className="text-h2 font-bold text-foreground">
            3. نظام الأزرار (Button System)
          </h2>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-6">
          {/* Variants */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-foreground">أنواع الأزرار (Variants)</h4>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primary Action</Button>
              <Button variant="secondary">Secondary Action</Button>
              <Button variant="outline">Outline Action</Button>
              <Button variant="ghost">Ghost Action</Button>
              <Button variant="destructive">Destructive Action</Button>
            </div>
          </div>

          <Separator />

          {/* Sizes */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-foreground">الأحجام (Sizes)</h4>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small Button (sm)</Button>
              <Button size="md">Medium Button (md)</Button>
              <Button size="lg">Large Button (lg)</Button>
              <Button size="icon" aria-label="أيقونة">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* States */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-foreground">الحالات (States)</h4>
            <div className="flex flex-wrap items-center gap-3">
              <Button isLoading>جاري التحميل...</Button>
              <Button disabled>زر معطل (Disabled)</Button>
              <Button variant="outline" className="gap-2">
                <DownloadSimple className="h-4 w-4" />
                <span>زر مع أيقونة</span>
              </Button>
              <Button
                variant="primary"
                onClick={() =>
                  toast({
                    title: "إشعار تفاعلي",
                    description: "تم استدعاء Toast بنجاح من نظام الإشعارات!",
                    variant: "success",
                  })
                }
              >
                اختبر الـ Toast Notification
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          4. FORM CONTROLS
          =================================================== */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-primary">
          <Sliders className="h-5 w-5" />
          <h2 className="text-h2 font-bold text-foreground">
            4. حقول الإدخال والنماذج (Form Controls)
          </h2>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="الاسم الكامل"
            placeholder="أدخل اسمك الكامل"
            helperText="يستخدم الاسم لإصدار الشهادة الرسمية"
          />

          <Input
            label="البريد الإلكتروني مع خطأ"
            placeholder="name@domain"
            defaultValue="invalid-email"
            error="صيغة البريد الإلكتروني غير صحيحة"
          />

          <Select label="المستوى التعليمي">
            <option value="beginner">مبتدئ (Beginner)</option>
            <option value="intermediate">متوسط (Intermediate)</option>
            <option value="advanced">متقدم (Advanced)</option>
          </Select>

          <Textarea
            label="ملاحظات إضافية"
            placeholder="أدخل أي ملاحظات أو استفسارات إضافية..."
          />

          <div className="space-y-4 pt-2">
            <Checkbox
              id="c1"
              checked={checkboxChecked}
              onChange={(e) => setCheckboxChecked(e.target.checked)}
              label="أوافق على الشروط والأحكام"
              description="أقر بقراءة شروط الاستخدام وسياسة الخصوصية"
            />
            <Radio
              name="demo-radio"
              id="r1"
              label="مسار برمجي شامل"
              description="وصول لكافة مشاريع المسار"
              defaultChecked
            />
          </div>

          <div className="space-y-4 pt-2">
            <Switch
              id="s1"
              checked={switchChecked}
              onChange={(e) => setSwitchChecked(e.target.checked)}
              label="استقبال إشعارات المنصة"
              description="تلقي تحديثات الدروس الجديدة والإعلانات عبر البريد"
            />
          </div>
        </div>
      </section>

      {/* ===================================================
          5. BADGES & ALERTS
          =================================================== */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-primary">
          <Sparkle className="h-5 w-5" />
          <h2 className="text-h2 font-bold text-foreground">
            5. الأوسمة والتنبيهات (Badges & Alerts)
          </h2>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-6">
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-foreground">الأوسمة (Badges)</h4>
            <div className="flex flex-wrap gap-2.5">
              <Badge variant="default">Default Badge</Badge>
              <Badge variant="secondary">Secondary Badge</Badge>
              <Badge variant="success">Success Badge</Badge>
              <Badge variant="warning">Warning Badge</Badge>
              <Badge variant="error">Error Badge</Badge>
              <Badge variant="info">Info Badge</Badge>
              <Badge variant="outline">Outline Badge</Badge>
              <Badge variant="bestseller">الأكثر طلباً</Badge>
              <Badge variant="exclusive">حصري</Badge>
              <Badge variant="new">جديد</Badge>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-foreground">التنبيهات (Alerts)</h4>
            <div className="space-y-3">
              <Alert variant="default" title="تنبيه قياسي">
                هذا تنبيه قياسي لتوفير معلومات عامة للمستخدم.
              </Alert>
              <Alert variant="success" title="تم حفظ التغييرات">
                تم تحديث بيانات الملف الشخصي بنجاح.
              </Alert>
              <Alert variant="warning" title="استكمال البيانات">
                يرجى استكمال البيانات المطلوبة لتفعيل الحساب.
              </Alert>
              <Alert variant="error" title="فشل حفظ التغييرات">
                حدث خطأ أثناء حفظ التعديلات، يرجى إعادة المحاولة.
              </Alert>
              <Alert variant="info" title="تحديثات الدورة">
                تم إضافة 4 دروس تطبيقية جديدة إلى الفصل الثالث.
              </Alert>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          6. MODALS, TABS, DROPDOWNS & TOOLTIPS
          =================================================== */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-primary">
          <Stack className="h-5 w-5" />
          <h2 className="text-h2 font-bold text-foreground">
            6. المكونات التفاعلية (Dialogs, Tabs, Dropdowns & Tooltips)
          </h2>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Dialog Trigger */}
            <Button variant="primary" onClick={() => setIsDialogOpen(true)}>
              فتح نافذة منبثقة (Modal Dialog)
            </Button>

            {/* Dropdown Demo */}
            <Dropdown
              trigger={
                <Button variant="outline" className="gap-1.5">
                  <span>قائمة خيارات (Dropdown)</span>
                </Button>
              }
              items={[
                { label: "تعديل الملف الشخصي", onClick: () => {} },
                { label: "إعدادات الحساب", onClick: () => {} },
                { label: "تسجيل الخروج", destructive: true, onClick: () => {} },
              ]}
            />

            {/* Tooltip Demo */}
            <Tooltip content="معلومات توضيحية مساعدة">
              <Badge variant="outline" className="cursor-help py-1">
                مرر الفأرة هنا (Tooltip)
              </Badge>
            </Tooltip>
          </div>

          <Dialog
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            title="نافذة حوارية توضيحية"
            description="نموذج توضيحي لكيفية عمل النوافذ المنبثقة المتوافقة مع معايير إمكانية الوصول."
          >
            <div className="space-y-4 pt-2">
              <Input
                label="عنوان الحقل التجريبي"
                placeholder="أدخل نصاً هنا..."
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setIsDialogOpen(false);
                    toast({
                      title: "تم تأكيد الإجراء",
                      description: "تم استدعاء الدالة بنجاح.",
                      variant: "success",
                    });
                  }}
                >
                  تأكيد
                </Button>
              </div>
            </div>
          </Dialog>

          <Separator />

          {/* Tabs Demo */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-foreground">نظام التبويبات (Tabs)</h4>
            <Tabs defaultValue="tab1">
              <TabsList>
                <TabsTrigger value="tab1">نظرة عامة</TabsTrigger>
                <TabsTrigger value="tab2">المنهاج التفصيلي</TabsTrigger>
                <TabsTrigger value="tab3">المدرب والشهادة</TabsTrigger>
              </TabsList>
              <TabsContent value="tab1" className="rounded-lg border border-border p-4 bg-background/50 text-xs">
                محتوى نظرة عامة: دورة تدريبية متكاملة لتعلم هندسة البرمجيات والأنظمة الحديثة.
              </TabsContent>
              <TabsContent value="tab2" className="rounded-lg border border-border p-4 bg-background/50 text-xs">
                محتوى المنهاج: يحتوي البرنامج على 42 درساً مقسمة على 5 فصول رئيسية.
              </TabsContent>
              <TabsContent value="tab3" className="rounded-lg border border-border p-4 bg-background/50 text-xs">
                محتوى المدرب: إشراف وتدريس من كبار الخبراء الجزائريين في السوق العالمية.
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* ===================================================
          7. COURSE CARD SHOWCASE
          =================================================== */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-primary">
          <Sparkle className="h-5 w-5" />
          <h2 className="text-h2 font-bold text-foreground">
            7. بطاقة الدورة (Course Card Showcase)
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          تصميم بطاقة الدورة المميزة في MAWJA — تعكس أعلى معايير التصميم العالمي مع دعم العملة المحلية DZD.
        </p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_COURSES.slice(0, 3).map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>

      {/* ===================================================
          8. LOADING & EMPTY STATES
          =================================================== */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-primary">
          <Stack className="h-5 w-5" />
          <h2 className="text-h2 font-bold text-foreground">
            8. حالات التحميل والحالات الفارغة (Loading & Empty States)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-foreground">هيكل التحميل (Skeleton)</h4>
            <div className="space-y-3">
              <Skeleton className="h-32 w-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </div>

          <EmptyState
            title="لا توجد بيانات حالياً"
            description="لم تقم بالتسجيل في أي دورة بعد. ابدأ استكشاف دليل الدورات المتاحة."
            action={
              <Button size="sm" variant="primary">
                استكشاف الدورات
              </Button>
            }
          />
        </div>
      </section>
    </div>
  );
}
