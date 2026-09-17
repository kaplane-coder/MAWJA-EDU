import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <Spinner size="lg" />
      <div className="space-y-1">
        <p className="text-sm font-bold text-foreground">جاري تحميل المحتوى...</p>
        <p className="text-xs text-muted-foreground">MAWJA Education</p>
      </div>
    </div>
  );
}
