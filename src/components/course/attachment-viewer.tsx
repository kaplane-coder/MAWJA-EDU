"use client";

import * as React from "react";
import { DownloadSimple, FileCode, CheckCircle, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { markLessonCompleteAction } from "@/actions/learning";

interface AttachmentViewerProps {
  lessonId: string;
  title: string;
  attachmentUrl?: string | null;
  completed?: boolean;
  onComplete?: () => void;
}

export function AttachmentViewer({
  lessonId,
  title,
  attachmentUrl,
  completed = false,
  onComplete,
}: AttachmentViewerProps) {
  const [isCompleted, setIsCompleted] = React.useState(completed);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    setIsCompleted(completed);
  }, [completed]);

  const handleMarkComplete = async () => {
    setIsLoading(true);
    const result = await markLessonCompleteAction({ lesson_id: lessonId });
    setIsLoading(false);
    if (result.success) {
      setIsCompleted(true);
      if (onComplete) onComplete();
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-8 sm:p-12 shadow-xs space-y-8 text-right max-w-3xl mx-auto">
      <div className="flex items-center gap-3 border-b border-border/60 pb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <FileCode className="h-6 w-6" />
        </div>
        <div>
          <span className="text-xs text-muted-foreground font-medium">ملحقات ومواد الدورة</span>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">{title}</h2>
        </div>
      </div>

      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 space-y-4 text-xs">
        <div className="flex items-center gap-2 font-bold text-foreground text-sm">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span>ملف تدريبي محمي — للمشتركين فقط</span>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          يتضمن هذا الملحق الكود المصدري، المخططات، أو الملفات المساعدة المرافقة
          للشرح التطبيقي في هذا القسم.
        </p>

        {attachmentUrl ? (
          <div className="pt-2">
            <a href={attachmentUrl} target="_blank" rel="noopener noreferrer" download>
              <Button variant="primary" size="md" className="font-bold gap-2">
                <DownloadSimple className="h-4 w-4" />
                <span>تحميل الملحق المرفق</span>
              </Button>
            </a>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            سيتم إرفاق رابط تحميل الملف النهائي فور اعتماده من المدرب.
          </p>
        )}
      </div>

      <div className="border-t border-border/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          بعد تحميل ومراجعة الملحقات، حدد الدرس كمكتمل.
        </p>

        <Button
          variant={isCompleted ? "outline" : "primary"}
          size="md"
          onClick={handleMarkComplete}
          isLoading={isLoading}
          disabled={isCompleted}
          className="w-full sm:w-auto font-bold gap-2"
        >
          <CheckCircle className="h-4 w-4 text-success" />
          <span>{isCompleted ? "تم إتمام الدرس" : "تحديد الدرس كمكتمل"}</span>
        </Button>
      </div>
    </div>
  );
}
