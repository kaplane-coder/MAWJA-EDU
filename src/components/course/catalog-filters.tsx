"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { MagnifyingGlass, SlidersHorizontal, X } from "@phosphor-icons/react/dist/ssr";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const categories = [
  { id: "all", label: "جميع المجالات" },
  { id: "web-development", label: "تطوير الويب" },
  { id: "mobile-apps", label: "تطبيقات الهواتف" },
  { id: "ui-ux-design", label: "تصميم واجهات UI/UX" },
  { id: "ai-data-science", label: "الذكاء الاصطناعي وعلوم البيانات" },
  { id: "devops-cloud", label: "DevOps والحوسبة السحابية" },
  { id: "cybersecurity", label: "الأمن السيبراني" },
];

const levels = [
  { id: "all", label: "جميع المستويات" },
  { id: "BEGINNER", label: "مبتدئ" },
  { id: "INTERMEDIATE", label: "متوسط" },
  { id: "ADVANCED", label: "متقدم" },
  { id: "ALL_LEVELS", label: "شامل" },
];

export function CatalogFilters() {
  const router = useRouter();
  const pathname = usePathname() || "";
  const searchParams = useSearchParams();

  const currentQ = searchParams.get("q") || "";
  const currentCategory = searchParams.get("category") || "all";
  const currentLevel = searchParams.get("level") || "all";
  const currentSort = searchParams.get("sort") || "newest";

  const [searchTerm, setSearchTerm] = React.useState(currentQ);

  const updateQuery = React.useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "" || value === "all") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  // Debounced search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== currentQ) {
        updateQuery({ q: searchTerm || null, page: "1" });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm, currentQ, updateQuery]);

  const hasActiveFilters =
    Boolean(currentQ) || currentCategory !== "all" || currentLevel !== "all" || currentSort !== "newest";

  const clearAllFilters = () => {
    setSearchTerm("");
    router.push(pathname);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-surface p-5 shadow-xs text-right">
      {/* MagnifyingGlass and Sort row */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative w-full flex-1">
          <Input
            placeholder="ابحث بالعنوان أو الكلمات المفتاحية..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
          <MagnifyingGlass className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex w-full md:w-auto items-center gap-2">
          <Select
            value={currentSort}
            onChange={(e) => updateQuery({ sort: e.target.value, page: "1" })}
            className="w-full md:w-48 text-xs font-semibold"
          >
            <option value="newest">الأحدث إضافة</option>
            <option value="price-asc">الأقل سعراً</option>
            <option value="price-desc">الأعلى سعراً</option>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="whitespace-nowrap text-xs gap-1"
            >
              <X className="h-3.5 w-3.5" />
              <span>إعادة ضبط</span>
            </Button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
        <span className="flex items-center gap-1 font-bold text-muted-foreground whitespace-nowrap pl-2">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>المجال:</span>
        </span>
        {categories.map((cat) => {
          const isActive = currentCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => updateQuery({ category: cat.id, page: "1" })}
              className={`rounded-lg px-3 py-1.5 font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground font-bold shadow-xs"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Level Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="font-bold text-muted-foreground whitespace-nowrap pl-2">
          المستوى:
        </span>
        {levels.map((lvl) => {
          const isActive = currentLevel === lvl.id;
          return (
            <button
              key={lvl.id}
              onClick={() => updateQuery({ level: lvl.id, page: "1" })}
              className={`rounded-lg px-3 py-1 font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-foreground text-background font-bold"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {lvl.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
