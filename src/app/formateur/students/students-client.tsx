"use client";

import * as React from "react";
import {
  Users,
  Envelope,
  Phone,
  CalendarBlank,
  CheckCircle,
} from "@phosphor-icons/react/dist/ssr";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { CourseProgress } from "@/components/course/course-progress";
import type { FormateurStudentItem } from "@/lib/formateur";

interface StudentsClientProps {
  initialStudents: FormateurStudentItem[];
  coursesFilterList: { id: string; title: string }[];
}

export function FormateurStudentsClient({
  initialStudents,
  coursesFilterList,
}: StudentsClientProps) {
  const [selectedCourseId, setSelectedCourseId] = React.useState<string>("ALL");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  const filteredStudents = React.useMemo(() => {
    return initialStudents.filter((item) => {
      // Course filter
      if (selectedCourseId !== "ALL" && item.course.id !== selectedCourseId) {
        return false;
      }
      // Search filter
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.student.full_name.toLowerCase().includes(q);
        const matchesEmail = item.student.email.toLowerCase().includes(q);
        const matchesCourse = item.course.title.toLowerCase().includes(q);
        return matchesName || matchesEmail || matchesCourse;
      }
      return true;
    });
  }, [initialStudents, selectedCourseId, searchQuery]);

  return (
    <div className="space-y-6 text-right">
      {/* Filter and Search Bar */}
      <Card variant="default" className="p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex-1 relative">
            <Input
              placeholder="ابحث باسم الطالب، البريد الإلكتروني، أو عنوان الدورة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="w-full sm:w-64">
            <Select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="text-xs"
            >
              <option value="ALL">جميع دوراتي التدريبية</option>
              {coursesFilterList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold text-muted-foreground">
          عدد الطلاب المطابقين: {filteredStudents.length}
        </span>
      </div>

      {/* Students List */}
      {filteredStudents.length === 0 ? (
        <Card variant="default" className="text-center py-16 px-4 border-dashed border-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
            <Users className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">
            لا يوجد طلاب مطابقين
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            {initialStudents.length === 0
              ? "لم يتم تسجيل أي طالب بعد في دوراتك التدريبية. بمجرد اعتماد اشتراكات الطلاب ستظهر بياناتهم ومستوى تقدمهم هنا."
              : "لم يتم العثور على نتائج تطابق معايير البحث الحالية."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredStudents.map((item) => {
            const formattedDate = new Date(item.enrolled_at).toLocaleDateString(
              "ar-DZ",
              {
                year: "numeric",
                month: "short",
                day: "numeric",
              }
            );

            return (
              <Card
                key={item.enrollment_id}
                variant="default"
                className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 hover:border-primary/40 transition-colors"
              >
                {/* Student Info */}
                <div className="flex items-start sm:items-center gap-4 flex-1">
                  <Avatar
                    src={item.student.avatar_url || undefined}
                    alt={item.student.full_name}
                    fallback={item.student.full_name}
                    size="lg"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-foreground">
                        {item.student.full_name}
                      </h3>
                      {item.progress.progressPercentage === 100 && (
                        <Badge variant="success" size="sm" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          <span>أتم الدورة</span>
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Envelope className="h-3.5 w-3.5 text-muted-foreground/80" />
                      <span>{item.student.email}</span>
                    </p>
                    {item.student.phone && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground/80" />
                        <span dir="ltr">{item.student.phone}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Course & Progress */}
                <div className="w-full md:w-80 space-y-2 border-t md:border-t-0 border-border/50 pt-3 md:pt-0">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground truncate max-w-[200px]" title={item.course.title}>
                      {item.course.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <CalendarBlank className="h-3 w-3" />
                      <span>{formattedDate}</span>
                    </span>
                  </div>

                  <CourseProgress
                    completedLessons={item.progress.completedLessons}
                    totalLessons={item.progress.totalLessons}
                    progressPercentage={item.progress.progressPercentage}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
