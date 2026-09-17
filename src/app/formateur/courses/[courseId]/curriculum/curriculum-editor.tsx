"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash,
  PlayCircle,
  FileText,
  Question,
  Paperclip,
  PaperPlaneRight,
} from "@phosphor-icons/react/dist/ssr";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  createSectionAction,
  deleteSectionAction,
  createLessonAction,
  deleteLessonAction,
} from "@/actions/curriculum";
import { submitCourseForReviewAction } from "@/actions/courses";
import type { CourseSectionItem, CourseLessonItem } from "@/lib/courses";
import type { CourseStatus } from "@/types/database.types";

interface CurriculumEditorProps {
  course: {
    id: string;
    title: string;
    status: CourseStatus;
    sections?: CourseSectionItem[];
  };
}

export function CurriculumEditor({ course }: CurriculumEditorProps) {
  const router = useRouter();

  // Section addition state
  const [isAddingSection, setIsAddingSection] = React.useState(false);
  const [newSectionTitle, setNewSectionTitle] = React.useState("");
  const [isSubmittingSection, setIsSubmittingSection] = React.useState(false);

  // Lesson addition state (per sectionId)
  const [addingLessonSectionId, setAddingLessonSectionId] = React.useState<string | null>(null);
  const [newLessonTitle, setNewLessonTitle] = React.useState("");
  const [newLessonType, setNewLessonType] = React.useState<"VIDEO" | "ARTICLE" | "QUIZ" | "ATTACHMENT">("VIDEO");
  const [newLessonVideoPath, setNewLessonVideoPath] = React.useState("");
  const [newLessonArticleContent, setNewLessonArticleContent] = React.useState("");
  const [newLessonDurationMinutes, setNewLessonDurationMinutes] = React.useState<number>(10);
  const [newLessonIsFreePreview, setNewLessonIsFreePreview] = React.useState(false);
  const [isSubmittingLesson, setIsSubmittingLesson] = React.useState(false);

  // Course review submission state
  const [isSubmittingReview, setIsSubmittingReview] = React.useState(false);
  const [feedbackMessage, setFeedbackMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const sections: CourseSectionItem[] = course.sections || [];
  const totalLessons = sections.reduce(
    (acc: number, sec: CourseSectionItem) => acc + (sec.lessons ? sec.lessons.length : 0),
    0
  );

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionTitle.trim()) return;

    setIsSubmittingSection(true);
    setFeedbackMessage(null);

    const result = await createSectionAction(course.id, {
      title: newSectionTitle,
      order_index: sections.length,
    });

    setIsSubmittingSection(false);

    if (result.success) {
      setNewSectionTitle("");
      setIsAddingSection(false);
      router.refresh();
    } else {
      setFeedbackMessage({
        type: "error",
        text: result.error || "فشل إنشاء الفصل التدريبي",
      });
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الفصل وجميع دروسه؟")) return;
    setFeedbackMessage(null);

    const result = await deleteSectionAction(sectionId);
    if (result.success) {
      router.refresh();
    } else {
      setFeedbackMessage({
        type: "error",
        text: result.error || "فشل حذف الفصل",
      });
    }
  };

  const handleAddLesson = async (sectionId: string, sectionLessonsCount: number) => {
    if (!newLessonTitle.trim()) return;

    setIsSubmittingLesson(true);
    setFeedbackMessage(null);

    const result = await createLessonAction(sectionId, {
      title: newLessonTitle,
      content_type: newLessonType,
      video_path: newLessonVideoPath || null,
      article_content: newLessonArticleContent || null,
      duration_seconds: (Number(newLessonDurationMinutes) || 0) * 60,
      is_free_preview: newLessonIsFreePreview,
      order_index: sectionLessonsCount,
    });

    setIsSubmittingLesson(false);

    if (result.success) {
      setNewLessonTitle("");
      setNewLessonVideoPath("");
      setNewLessonArticleContent("");
      setNewLessonDurationMinutes(10);
      setNewLessonIsFreePreview(false);
      setAddingLessonSectionId(null);
      router.refresh();
    } else {
      setFeedbackMessage({
        type: "error",
        text: result.error || "فشل إضافة الدرس",
      });
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الدرس؟")) return;
    setFeedbackMessage(null);

    const result = await deleteLessonAction(lessonId);
    if (result.success) {
      router.refresh();
    } else {
      setFeedbackMessage({
        type: "error",
        text: result.error || "فشل حذف الدرس",
      });
    }
  };

  const handleSubmitForReview = async () => {
    setIsSubmittingReview(true);
    setFeedbackMessage(null);

    const result = await submitCourseForReviewAction(course.id);
    setIsSubmittingReview(false);

    if (result.success) {
      setFeedbackMessage({
        type: "success",
        text: result.message || "تم إرسال الدورة للمراجعة بنجاح!",
      });
      router.refresh();
    } else {
      setFeedbackMessage({
        type: "error",
        text: result.error || "فشل إرسال الدورة للمراجعة",
      });
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case "VIDEO":
        return <PlayCircle className="h-4 w-4 text-primary" />;
      case "ARTICLE":
        return <FileText className="h-4 w-4 text-primary" />;
      case "QUIZ":
        return <Question className="h-4 w-4 text-primary" />;
      case "ATTACHMENT":
        return <Paperclip className="h-4 w-4 text-primary" />;
      default:
        return <PlayCircle className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <div className="space-y-8 text-right">
      {/* Notifications */}
      {feedbackMessage && (
        <Alert
          variant={feedbackMessage.type === "success" ? "success" : "error"}
          title={feedbackMessage.type === "success" ? "نجاح" : "تنبيه"}
        >
          {feedbackMessage.text}
        </Alert>
      )}

      {/* Submission Review Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-6 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground">
              حالة نشر المنهج:
            </span>
            <Badge
              variant={
                course.status === "PUBLISHED"
                  ? "success"
                  : course.status === "PENDING_REVIEW"
                  ? "warning"
                  : "secondary"
              }
            >
              {course.status === "DRAFT"
                ? "مسودة"
                : course.status === "PENDING_REVIEW"
                ? "قيد المراجعة"
                : course.status === "PUBLISHED"
                ? "منشورة"
                : course.status}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            إجمالي المحتوى الحالي: {sections.length} فصول تدريبية • {totalLessons} درساً
          </p>
        </div>

        {course.status === "DRAFT" && (
          <Button
            variant="primary"
            className="gap-2 font-bold shadow-xs shrink-0"
            onClick={handleSubmitForReview}
            isLoading={isSubmittingReview}
            disabled={sections.length === 0 || totalLessons === 0}
          >
            <PaperPlaneRight className="h-4 w-4" />
            <span>إرسال الدورة للمراجعة والاعتماد</span>
          </Button>
        )}
      </div>

      {/* Sections List */}
      <div className="space-y-6">
        {sections.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-12 text-center space-y-3">
            <h3 className="text-base font-bold text-foreground">
              لم تقم بإضافة أي فصول بعد
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              ابدأ بهيكلة دورتك التدريبية عن طريق إضافة الفصل الأول وتقسيم
              الدروس والمواضيع.
            </p>
          </div>
        ) : (
          sections.map((section: CourseSectionItem, sIdx: number) => {
            const isAddingLesson = addingLessonSectionId === section.id;
            const sectionLessons: CourseLessonItem[] = section.lessons || [];

            return (
              <div
                key={section.id}
                className="rounded-2xl border border-border bg-surface overflow-hidden shadow-xs"
              >
                {/* Section Header */}
                <div className="bg-muted/40 p-4 px-6 flex items-center justify-between border-b border-border/80">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      {sIdx + 1}
                    </span>
                    <h3 className="text-base font-bold text-foreground">
                      {section.title}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      ({sectionLessons.length} دروس)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setAddingLessonSectionId(
                          isAddingLesson ? null : section.id
                        )
                      }
                      className="gap-1 text-xs font-semibold"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>إضافة درس</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSection(section.id)}
                      className="text-error hover:bg-error/10 hover:text-error"
                      title="حذف الفصل"
                    >
                      <Trash className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Lessons inside Section */}
                <div className="divide-y divide-border/60">
                  {sectionLessons.length === 0 && !isAddingLesson && (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                      لا توجد دروس في هذا الفصل بعد. انقر على &quot;إضافة درس&quot; للبدء.
                    </div>
                  )}

                  {sectionLessons.map((lesson: CourseLessonItem, lIdx: number) => (
                    <div
                      key={lesson.id}
                      className="p-3.5 px-6 flex items-center justify-between text-xs hover:bg-muted/20 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground text-[11px] font-mono w-4">
                          {lIdx + 1}.
                        </span>
                        {getLessonIcon(lesson.content_type)}
                        <span className="font-semibold text-foreground">
                          {lesson.title}
                        </span>
                        {lesson.is_free_preview && (
                          <Badge variant="outline" size="sm" className="text-[10px]">
                            معاينة مجانية
                          </Badge>
                        )}
                        <Badge variant="secondary" size="sm" className="text-[10px]">
                          {lesson.content_type}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4">
                        {lesson.duration_seconds > 0 && (
                          <span className="text-muted-foreground">
                            {Math.ceil(lesson.duration_seconds / 60)} دقيقة
                          </span>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteLesson(lesson.id)}
                          className="text-error hover:bg-error/10 hover:text-error h-7 w-7 p-0"
                          title="حذف الدرس"
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Add Lesson Form Inline */}
                  {isAddingLesson && (
                    <div className="p-5 bg-muted/20 border-t border-border/80 space-y-4">
                      <h4 className="text-xs font-bold text-primary">
                        إضافة درس جديد إلى: {section.title}
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Input
                          label="عنوان الدرس"
                          placeholder="مثال: مقدمة في React Server Components"
                          value={newLessonTitle}
                          onChange={(e) => setNewLessonTitle(e.target.value)}
                          className="sm:col-span-2"
                          required
                        />

                        <Select
                          label="نوع المحتوى"
                          value={newLessonType}
                          onChange={(e) => setNewLessonType(e.target.value as "VIDEO" | "ARTICLE" | "QUIZ" | "ATTACHMENT")}
                        >
                          <option value="VIDEO">فيديو (Video)</option>
                          <option value="ARTICLE">مقال نصي (Article)</option>
                          <option value="QUIZ">اختبار تفاعلي (Quiz)</option>
                          <option value="ATTACHMENT">ملف مرفق (Attachment)</option>
                        </Select>
                      </div>

                      {newLessonType === "VIDEO" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Input
                            label="مسار الفيديو (Storage Path / URL)"
                            placeholder="videos/lesson-01.mp4"
                            value={newLessonVideoPath}
                            onChange={(e) => setNewLessonVideoPath(e.target.value)}
                          />

                          <Input
                            type="number"
                            label="المدة المقدرة (بالدقائق)"
                            value={newLessonDurationMinutes.toString()}
                            onChange={(e) =>
                              setNewLessonDurationMinutes(Number(e.target.value) || 0)
                            }
                            min={0}
                          />
                        </div>
                      )}

                      {newLessonType === "ARTICLE" && (
                        <Textarea
                          label="محتوى المقال التعليمي"
                          rows={4}
                          placeholder="اكتب الشرح النظري والأمثلة التوضيحية للدرس..."
                          value={newLessonArticleContent}
                          onChange={(e) => setNewLessonArticleContent(e.target.value)}
                        />
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id={`free-preview-${section.id}`}
                          checked={newLessonIsFreePreview}
                          onChange={(e) => setNewLessonIsFreePreview(e.target.checked)}
                          className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                        />
                        <label
                          htmlFor={`free-preview-${section.id}`}
                          className="text-xs text-foreground cursor-pointer select-none font-medium"
                        >
                          إتاحة هذا الدرس كمعاينة مجانية لجميع الزوار قبل التسجيل
                        </label>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setAddingLessonSectionId(null)}
                        >
                          إلغاء
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() =>
                            handleAddLesson(section.id, sectionLessons.length)
                          }
                          isLoading={isSubmittingLesson}
                          className="font-bold"
                        >
                          حفظ الدرس
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add New Section Button / Inline Form */}
      {isAddingSection ? (
        <Card variant="elevated" className="border-primary/40 bg-surface">
          <CardHeader>
            <CardTitle className="text-base font-bold">
              إضافة فصل تدريبي جديد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddSection} className="space-y-4">
              <Input
                label="عنوان الفصل"
                placeholder="مثال: الفصل الأول: أساسيات معمارية التطبيقات"
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                required
              />

              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setIsAddingSection(false)}
                >
                  إلغاء
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  isLoading={isSubmittingSection}
                  className="font-bold"
                >
                  إضافة الفصل
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Button
          variant="outline"
          onClick={() => setIsAddingSection(true)}
          className="w-full py-6 border-dashed gap-2 font-bold text-sm text-primary hover:border-primary"
        >
          <Plus className="h-4 w-4" />
          <span>إضافة فصل جديد إلى المنهج</span>
        </Button>
      )}
    </div>
  );
}
