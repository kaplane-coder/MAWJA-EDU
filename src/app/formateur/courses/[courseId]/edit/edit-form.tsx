"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { updateCourseAction } from "@/actions/courses";
import { courseCategories } from "@/lib/validations/course";
import type { CourseLevel, CourseStatus } from "@/types/database.types";

interface EditCourseFormProps {
  course: {
    id: string;
    title: string;
    slug: string;
    category?: string | null;
    level: CourseLevel;
    price: number;
    short_description?: string | null;
    description?: string | null;
    thumbnail_path?: string | null;
    preview_video_path?: string | null;
    status: CourseStatus;
  };
}

export function EditCourseForm({ course }: EditCourseFormProps) {
  const router = useRouter();

  const [title, setTitle] = React.useState(course.title || "");
  const [slug, setSlug] = React.useState(course.slug || "");
  const [category, setCategory] = React.useState<string>(
    course.category || courseCategories[0]
  );
  const [level, setLevel] = React.useState<CourseLevel>(course.level || "BEGINNER");
  const [price, setPrice] = React.useState<number>(course.price || 0);
  const [shortDescription, setShortDescription] = React.useState(
    course.short_description || ""
  );
  const [description, setDescription] = React.useState(course.description || "");
  const [thumbnailPath, setThumbnailPath] = React.useState(
    course.thumbnail_path || ""
  );
  const [previewVideoPath, setPreviewVideoPath] = React.useState(
    course.preview_video_path || ""
  );

  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setFieldErrors({});

    try {
      const result = await updateCourseAction(course.id, {
        title,
        slug,
        short_description: shortDescription,
        description,
        category,
        level,
        price,
        thumbnail_path: thumbnailPath || null,
        preview_video_path: previewVideoPath || null,
      });

      if (!result.success) {
        setErrorMessage(result.error || "فشل تحديث الدورة");
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        setIsLoading(false);
        return;
      }

      setSuccessMessage(result.message || "تم حفظ التعديلات بنجاح!");
      setIsLoading(false);
      router.refresh();
    } catch {
      setErrorMessage("حدث خطأ غير متوقع أثناء تحديث الدورة");
      setIsLoading(false);
    }
  };

  return (
    <Card variant="elevated" className="border-border/80">
      <CardHeader>
        <CardTitle className="text-xl font-bold">البيانات الأساسية</CardTitle>
        <CardDescription>
          قم بتحديث عنوان الدورة، الوصف، أو السعر حسب الحاجة.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {errorMessage && (
          <Alert variant="error" className="mb-6" title="تعذر حفظ التعديلات">
            {errorMessage}
          </Alert>
        )}

        {successMessage && (
          <Alert variant="success" className="mb-6" title="تم التحديث">
            {successMessage}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-right">
          {/* Title & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="عنوان الدورة"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={fieldErrors.title?.[0]}
              required
            />

            <Input
              label="الاسم اللطيف (Slug)"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              error={fieldErrors.slug?.[0]}
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
              value={price.toString()}
              onChange={(e) => setPrice(Number(e.target.value) || 0)}
              error={fieldErrors.price?.[0]}
              min={0}
              required
            />
          </div>

          {/* Short Description */}
          <Textarea
            label="الوصف المختصر"
            rows={2}
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            error={fieldErrors.short_description?.[0]}
            required
          />

          {/* Detailed Description */}
          <Textarea
            label="الوصف التفصيلي"
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={fieldErrors.description?.[0]}
            required
          />

          {/* Media URLs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="رابط صورة الغلاف (Thumbnail)"
              value={thumbnailPath}
              onChange={(e) => setThumbnailPath(e.target.value)}
              error={fieldErrors.thumbnail_path?.[0]}
            />

            <Input
              label="رابط الفيديو التعريفي (Preview Video)"
              value={previewVideoPath}
              onChange={(e) => setPreviewVideoPath(e.target.value)}
              error={fieldErrors.preview_video_path?.[0]}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
            <Link href="/formateur/courses">
              <Button variant="outline" type="button">
                العودة
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              className="font-bold gap-2"
              isLoading={isLoading}
            >
              <span>حفظ التعديلات</span>
              <CheckCircle className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
