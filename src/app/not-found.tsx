import Link from "next/link";
import { House, ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
      <div className="mb-6">
        <Logo size="xl" />
      </div>
      <p className="font-mono text-sm font-bold text-primary">404 ERROR</p>
      <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
        الصفحة غير موجودة
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground leading-relaxed">
        عذراً، الرابط الذي تحاول الوصول إليه غير موجود أو ربما تم نقله إلى مسار آخر.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/">
          <Button variant="primary" size="lg" className="gap-2">
            <House className="h-4 w-4" />
            <span>العودة للرئيسية</span>
          </Button>
        </Link>
        <Link href="/courses">
          <Button variant="outline" size="lg" className="gap-2">
            <span>تصفح الدورات</span>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
