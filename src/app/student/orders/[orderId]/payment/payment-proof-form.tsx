"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { UploadSimple, CheckCircle, FileText } from "@phosphor-icons/react/dist/ssr";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { submitPaymentProofAction } from "@/actions/payments";

interface PaymentProofFormProps {
  orderId: string;
  isReSubmission?: boolean;
}

export function PaymentProofForm({
  orderId,
  isReSubmission = false,
}: PaymentProofFormProps) {
  const router = useRouter();

  const [senderName, setSenderName] = React.useState("");
  const [senderAccountRef, setSenderAccountRef] = React.useState("");
  const [transactionRef, setTransactionRef] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage("حجم الملف يتجاوز 10 ميغابايت. يرجى اختيار ملف أصغر.");
        setSelectedFile(null);
        return;
      }
      setErrorMessage(null);
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setFieldErrors({});

    if (!selectedFile) {
      setErrorMessage("يرجى إرفاق صورة أو ملف إثبات الدفع (وصل التحويل).");
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("sender_name", senderName);
    formData.append("sender_account_reference", senderAccountRef);
    formData.append("transaction_reference", transactionRef);
    formData.append("notes", notes);
    formData.append("proof_file", selectedFile);

    try {
      const result = await submitPaymentProofAction(orderId, formData);

      if (!result.success) {
        setErrorMessage(result.error || "فشل إرسال إثبات الدفع");
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        setIsLoading(false);
        return;
      }

      setSuccessMessage(result.message || "تم إرسال إثبات الدفع بنجاح!");
      setIsLoading(false);
      router.refresh();
    } catch {
      setErrorMessage("حدث خطأ غير متوقع أثناء رفع إثبات الدفع.");
      setIsLoading(false);
    }
  };

  return (
    <Card variant="elevated" className="border-border/80 text-right">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-foreground">
          {isReSubmission
            ? "إعادة رفع إثبات الدفع وتصحيح البيانات"
            : "رفع إثبات الدفع (وصل التحويل)"}
        </CardTitle>
        <CardDescription>
          أدخل بيانات التحويل وقم بإرفاق صورة واضحة للوصل ليتم تدقيقها من طرف
          الإدارة.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {errorMessage && (
          <Alert variant="error" className="mb-6" title="تعذر إرسال الإثبات">
            {errorMessage}
          </Alert>
        )}

        {successMessage && (
          <Alert variant="success" className="mb-6" title="تم بنجاح">
            {successMessage}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Sender Name & Transaction Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="اسم صاحب الحساب المرسل (أو الاسم في الوصل)"
              placeholder="مثال: محمد بلقاسم"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              error={fieldErrors.sender_name?.[0]}
              required
            />

            <Input
              label="رقم العملية / التحويل (N° de transaction)"
              placeholder="مثال: 0098451234 أو رقم الوصل"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              error={fieldErrors.transaction_reference?.[0]}
              helperText="يساعد في تسريع عملية التحقق الفوري"
            />
          </div>

          {/* Sender Account Ref & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="رقم حساب المرسل (اختياري - مثل آخر 4 أرقام من الـ RIP)"
              placeholder="مثال: 8901"
              value={senderAccountRef}
              onChange={(e) => setSenderAccountRef(e.target.value)}
              error={fieldErrors.sender_account_reference?.[0]}
            />

            <Input
              label="ملاحظات إضافية (اختياري)"
              placeholder="أي تفاصيل ترغب في إضافتها للإدارة..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              error={fieldErrors.notes?.[0]}
            />
          </div>

          {/* File Upload Zone */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              صورة أو ملف وصل التحويل (JPG, PNG, WEBP, PDF — حتى 10MB) *
            </label>
            <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/20 p-8 text-center transition-colors hover:border-primary/60 hover:bg-muted/30">
              <UploadSimple className="h-10 w-10 text-primary opacity-80 mb-2" />
              {selectedFile ? (
                <div className="space-y-1">
                  <p className="text-sm font-bold text-foreground flex items-center justify-center gap-1.5">
                    <FileText className="h-4 w-4 text-primary" />
                    <span>{selectedFile.name}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} ميغابايت
                  </p>
                  <p className="text-xs text-primary font-medium pt-1">
                    انقر لتغيير الملف المختار
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    اسحب وأفلت صورة الوصل هنا، أو انقر للتصفح
                  </p>
                  <p className="text-xs text-muted-foreground">
                    يرجى التأكد من وضوح كافة البيانات والختم وتاريخ العملية
                  </p>
                </div>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 cursor-pointer opacity-0"
                required
              />
            </div>
          </div>

          {/* Submit CTA */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full sm:w-auto font-bold gap-2 shadow-xs"
              isLoading={isLoading}
            >
              <span>{isReSubmission ? "إعادة إرسال الإثبات" : "تأكيد وإرسال إثبات الدفع"}</span>
              <CheckCircle className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
