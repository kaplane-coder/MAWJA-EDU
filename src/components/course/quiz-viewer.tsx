"use client";

import * as React from "react";
import { Question, CheckCircle, XCircle, ArrowCounterClockwise, Certificate } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { markLessonCompleteAction } from "@/actions/learning";
import { cn } from "@/lib/utils";

interface QuizViewerProps {
  lessonId: string;
  title: string;
  articleContent?: string | null; // Can hold quiz JSON or description
  completed?: boolean;
  onComplete?: () => void;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const DEFAULT_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "ما هو الهدف الأساسي من تطبيق مبادئ الإنتاج الموجهة في منصة MAWJA؟",
    options: [
      "بناء مشاريع برمجية وتصميمية تحاكي معايير الشركات العالمية الحقيقية",
      "حفظ المفاهيم الأكاديمية دون تطبيق عملي",
      "الاعتماد الكامل على النماذج الجاهزة دون فهم المعمارية",
    ],
    correctIndex: 0,
    explanation: "تركز منصة موجة على تقديم خبرات عملية تطبيقية مباشرة تلبي متطلبات سوق العمل التقني الحديث.",
  },
  {
    id: 2,
    question: "كيف يتم ضمان أمان البيانات وعزل الصلاحيات في مستوى قاعدة البيانات؟",
    options: [
      "عبر التحقق في الواجهة الأمامية فقط",
      "من خلال تفعيل سياسات Row Level Security (RLS) واستخدام الدوال الموثوقة",
      "بتعطيل التحقق على الخادم",
    ],
    correctIndex: 1,
    explanation: "تعتمد المعمارية الحديثة على سياسات RLS في PostgreSQL لمنع أي وصول أو تلاعب بالبيانات خارج نطاق الصلاحيات.",
  },
];

export function QuizViewer({
  lessonId,
  title,
  completed = false,
  onComplete,
}: QuizViewerProps) {
  const [selectedAnswers, setSelectedAnswers] = React.useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [isCompleted, setIsCompleted] = React.useState(completed);
  const [isLoading, setIsLoading] = React.useState(false);

  const questions = DEFAULT_QUESTIONS;

  const handleSelect = (questionId: number, optionIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correct++;
      }
    });
    return correct;
  };

  const handleSubmit = async () => {
    setIsSubmitted(true);
    const score = calculateScore();
    const isPassing = score >= Math.ceil(questions.length * 0.5);

    if (isPassing && !isCompleted) {
      setIsLoading(true);
      const res = await markLessonCompleteAction({ lesson_id: lessonId });
      setIsLoading(false);
      if (res.success) {
        setIsCompleted(true);
        if (onComplete) onComplete();
      }
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
  };

  const score = calculateScore();
  const isPassing = score >= Math.ceil(questions.length * 0.5);

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 sm:p-10 shadow-xs space-y-8 text-right max-w-3xl mx-auto">
      {/* Quiz Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-primary font-bold mb-1">
            <Question className="h-4 w-4" />
            <span>اختبار تقييم الفهم</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">{title}</h2>
        </div>

        {isSubmitted && (
          <div
            className={cn(
              "rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-1.5",
              isPassing ? "bg-success/10 text-success" : "bg-error/10 text-error"
            )}
          >
            <Certificate className="h-4 w-4" />
            <span>
              النتيجة: {score} / {questions.length}
            </span>
          </div>
        )}
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((q, qIdx) => {
          const selected = selectedAnswers[q.id];
          const isCorrect = selected === q.correctIndex;

          return (
            <div
              key={q.id}
              className="rounded-2xl border border-border/80 bg-muted/10 p-5 space-y-3"
            >
              <h3 className="text-sm font-bold text-foreground">
                {qIdx + 1}. {q.question}
              </h3>

              <div className="space-y-2">
                {q.options.map((opt, oIdx) => {
                  const isOptionSelected = selected === oIdx;
                  let optionClass = "border-border hover:border-border/80";

                  if (isSubmitted) {
                    if (oIdx === q.correctIndex) {
                      optionClass = "border-success bg-success/10 text-success font-bold";
                    } else if (isOptionSelected && !isCorrect) {
                      optionClass = "border-error bg-error/10 text-error";
                    }
                  } else if (isOptionSelected) {
                    optionClass = "border-primary bg-primary/5 text-primary font-bold";
                  }

                  return (
                    <label
                      key={oIdx}
                      onClick={() => handleSelect(q.id, oIdx)}
                      className={cn(
                        "flex items-center justify-between p-3.5 rounded-xl border cursor-pointer text-xs transition-all",
                        optionClass
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          checked={isOptionSelected}
                          onChange={() => handleSelect(q.id, oIdx)}
                          disabled={isSubmitted}
                          className="text-primary focus:ring-primary h-4 w-4"
                        />
                        <span>{opt}</span>
                      </div>

                      {isSubmitted && oIdx === q.correctIndex && (
                        <CheckCircle className="h-4 w-4 text-success shrink-0" />
                      )}
                      {isSubmitted && isOptionSelected && !isCorrect && (
                        <XCircle className="h-4 w-4 text-error shrink-0" />
                      )}
                    </label>
                  );
                })}
              </div>

              {isSubmitted && (
                <div className="rounded-xl bg-muted/40 p-3 text-[11px] text-muted-foreground leading-relaxed">
                  <strong>توضيح:</strong> {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="border-t border-border/60 pt-6 flex flex-wrap items-center justify-between gap-4">
        {isSubmitted ? (
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-1.5 font-semibold text-xs"
            >
              <ArrowCounterClockwise className="h-3.5 w-3.5" />
              <span>إعادة المحاولة</span>
            </Button>

            {isPassing && (
              <span className="text-xs text-success font-bold flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                <span>تم اجتياز الاختبار وتأكيد إتمام الدرس بنجاح!</span>
              </span>
            )}
          </div>
        ) : (
          <Button
            variant="primary"
            size="md"
            onClick={handleSubmit}
            disabled={Object.keys(selectedAnswers).length < questions.length}
            isLoading={isLoading}
            className="w-full sm:w-auto font-bold"
          >
            تأكيد الإجابات واحتساب النتيجة
          </Button>
        )}
      </div>
    </div>
  );
}
