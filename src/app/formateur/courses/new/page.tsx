"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Stack } from "@phosphor-icons/react/dist/ssr";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { createCourseAction } from "@/actions/courses";
import { slugify } from "@/lib/slug";
import { courseCategories } from "@/lib/validations/course";
import type { CourseLevel } from "@/types/database.types";

export default function NewCoursePage() {
  const router = useRouter();

  const [title, setTitle] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [isSlugManual, setIsSlugManual] = React.useState(false);
  const [category, setCategory] = React.useState<string>(courseCategories[0]);
  const [level, setLevel] = React.useState<"BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL_LEVELS">("BEGINNER");
  const [price, setPrice] = React.useState<number>(5000);
  const [shortDescription, setShortDescription] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [thumbnailPath, setThumbnailPath] = React.useState("");
  const [previewVideoPath, setPreviewVideoPath] = React.useState("");

  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!isSlugManual) {
      setSlug(slugify(val));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setFieldErrors({});

    try {
      const result = await createCourseAction({
        title,
        slug: slug || slugify(title),
        short_description: shortDescription,
        description,
        category,
        level,
        price,
        thumbnail_path: thumbnailPath || null,
        preview_video_path: previewVideoPath || null,
      });

      if (!result.success) {
        setErrorMessage(result.error || "فشل إنشاء مسودة الدورة");
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        setIsLoading(false);
        return;
      }

      if (result.data?.courseId) {
        router.push(`/formateur/courses/${result.data.courseId}/curriculum`);
      } else {
        router.push("/formateur/courses");
      }
    } catch {
      setErrorMessage("حدث خطأ غير متوقع أثناء حفظ الدورة");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-right">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <Badge variant="default" className="gap-1 mb-2">
            <Stack className="h-3.5 w-3.5" />
            <span>لوحة المدرب</span>
          </Badge>
          <h1 className="text-h1 font-bold text-foreground">
            إنشاء دورة تدريبية جديدة
          </h1>
          <p className="text-sm text-muted-foreground">
            أدخل البيانات الأساسية للدورة ثم انتقل لبناء الفصول والدروس التعليمية.
          </p>
        </div>

        <Link href="/formateur/courses">
          <Button variant="outline" size="sm">
            إلغاء والعودة
          </Button>
        </Link>
      </div>

      <Card variant="elevated" className="border-border/80">
        <CardHeader>
          <CardTitle className="text-xl font-bold">البيانات الأساسية للمسودة</CardTitle>
          <CardDescription>
            يمكنك حفظ الدورة كمسودة وتعديل كافة التفاصيل والمحتوى في أي وقت لاحقاً.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {errorMessage && (
            <Alert variant="error" className="mb-6" title="تعذر حفظ الدورة">
              {errorMessage}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 text-right">
            {/* Title & Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="عنوان الدورة"
                placeholder="مثال: هندسة الواجهات المتقدمة باستخدام Next.js 15"
                value={title}
                onChange={handleTitleChange}
                error={fieldErrors.title?.[0]}
                required
              />

              <Input
                label="الاسم اللطيف في الرابط (Slug)"
                placeholder="nextjs-15-advanced"
                value={slug}
                onChange={(e) => {
                  setIsSlugManual(true);
                  setSlug(e.target.value);
                }}
                error={fieldErrors.slug?.[0]}
                helperText="يستخدم في رابط الدورة (مثال: /courses/your-slug)"
                required
              />
            </div>

            {/* Category & Level & Price */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="مجال وتصنيف الدورة"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="web-development">تطوير الويب وهندسة البرمجيات</option>
                <option value="mobile-apps">تطبيقات الهواتف الذكية</option>
                <option value="ui-ux-design">تصميم واجهات وتجربة المستخدم</option>
                <option value="ai-data-science">الذكاء الاصطناعي وعلوم البيانات</option>
                <option value="devops-cloud">DevOps والحوسبة السحابية</option>
                <option value="cybersecurity">الأمن السيبراني</option>
                <option value="business-tech">ريادة الأعمال التقنية</option>
              </Select>

              <Select
                label="المستوى التدريبي"
                value={level}
                onChange={(e) => setLevel(e.target.value as CourseLevel)}
              >
                <option value="BEGINNER">مبتدئ (Beginner)</option>
                <option value="INTERMEDIATE">متوسط (Intermediate)</option>
                <option value="ADVANCED">متقدم (Advanced)</option>
                <option value="ALL_LEVELS">جميع المستويات (All Levels)</option>
              </Select>

              <Input
                type="number"
                label="سعر الدورة (دج - DZD)"
                placeholder="5000"
                value={price.toString()}
                onChange={(e) => setPrice(Number(e.target.value) || 0)}
                error={fieldErrors.price?.[0]}
                helperText="ضع 0 إذا كانت الدورة مجانية"
                min={0}
                required
              />
            </div>

            {/* Short Description */}
            <Textarea
              label="الوصف المختصر (يظهر في بطاقة الدورة والبحث)"
              placeholder="اكتب وصفاً موجزاً وجذاباً يلخص القيمة الأساسية للدورة..."
              rows={2}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              error={fieldErrors.short_description?.[0]}
              required
            />

            {/* Detailed Description */}
            <Textarea
              label="الوصف التفصيلي للدورة والمخرجات التعليمية"
              placeholder="اشرح بالتفصيل محاور الدورة، المتطلبات المسبقة، والمهارات العملية المكتسبة..."
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={fieldErrors.description?.[0]}
              required
            />

            {/* Media URLs (Storage path or public asset URL) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="رابط صورة الغلاف (Thumbnail)"
                placeholder="https://... أو مسار الصورة"
                value={thumbnailPath}
                onChange={(e) => setThumbnailPath(e.target.value)}
                error={fieldErrors.thumbnail_path?.[0]}
              />

              <Input
                label="رابط الفيديو التعريفي (Preview Video)"
                placeholder="https://... أو مسار الفيديو"
                value={previewVideoPath}
                onChange={(e) => setPreviewVideoPath(e.target.value)}
                error={fieldErrors.preview_video_path?.[0]}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
              <Link href="/formateur/courses">
                <Button variant="outline" type="button">
                  إلغاء
                </Button>
              </Link>
              <Button
                type="submit"
                variant="primary"
                className="font-bold gap-2"
                isLoading={isLoading}
              >
                <span>حفظ المسودة والانتقال لبناء المنهج</span>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
