"use client";

import * as React from "react";
import {
  Certificate,
  UploadSimple,
  Trash,
  Globe,
  ShieldCheck,
} from "@phosphor-icons/react/dist/ssr";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { ALGERIA_WILAYAS } from "@/lib/wilayas";
import {
  updateFormateurProfileAction,
  uploadAvatarAction,
  removeAvatarAction,
} from "@/actions/profile";
import type { Database } from "@/types/database.types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type FormateurProfileRow =
  Database["public"]["Tables"]["formateur_profiles"]["Row"];

interface FormateurProfileFormProps {
  profile: ProfileRow;
  formateurProfile: FormateurProfileRow | null;
  stats: {
    totalCourses: number;
    publishedCourses: number;
    totalStudents: number;
    isVerified: boolean;
  };
}

export function FormateurProfileForm({
  profile: initialProfile,
  formateurProfile,
  stats,
}: FormateurProfileFormProps) {
  const [profile, setProfile] = React.useState(initialProfile);
  const [fullName, setFullName] = React.useState(initialProfile.full_name || "");
  const [phone, setPhone] = React.useState(initialProfile.phone || "");
  const [headline, setHeadline] = React.useState(
    initialProfile.headline || formateurProfile?.headline || ""
  );
  const [specialization, setSpecialization] = React.useState(
    initialProfile.specialization || "تطوير الويب وهندسة البرمجيات"
  );
  const [experienceYears, setExperienceYears] = React.useState<number>(
    initialProfile.experience_years || 3
  );
  const [bio, setBio] = React.useState(
    initialProfile.bio || formateurProfile?.bio || ""
  );
  const [wilaya, setWilaya] = React.useState(initialProfile.wilaya || "");
  const [city, setCity] = React.useState(initialProfile.city || "");

  const initialSocial = (initialProfile.social_links as Record<
    string,
    string
  >) ||
    (formateurProfile?.social_links as Record<string, string>) || {};

  const [twitter, setTwitter] = React.useState(initialSocial.twitter || "");
  const [linkedin, setLinkedin] = React.useState(initialSocial.linkedin || "");
  const [github, setGithub] = React.useState(initialSocial.github || "");
  const [youtube, setYoutube] = React.useState(initialSocial.youtube || "");
  const [website, setWebsite] = React.useState(initialSocial.website || "");

  const [isSaving, setIsSaving] = React.useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false);
  const [message, setMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<
    Record<string, string[]>
  >({});

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAvatarFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("avatar_file", file);

    const res = await uploadAvatarAction(formData);
    if (!res.success) {
      setMessage({ type: "error", text: res.error || "فشل رفع الصورة" });
    } else if (res.data?.avatarUrl) {
      setProfile((prev) => ({ ...prev, avatar_url: res.data!.avatarUrl }));
      setMessage({ type: "success", text: "تم تحديث الصورة الشخصية بنجاح!" });
    }
    setIsUploadingAvatar(false);
  };

  const handleRemoveAvatar = async () => {
    setIsUploadingAvatar(true);
    setMessage(null);

    const res = await removeAvatarAction();
    if (!res.success) {
      setMessage({ type: "error", text: res.error || "فشل إزالة الصورة" });
    } else {
      setProfile((prev) => ({ ...prev, avatar_url: null }));
      setMessage({ type: "success", text: "تمت إزالة الصورة بنجاح" });
    }
    setIsUploadingAvatar(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    setFieldErrors({});

    const res = await updateFormateurProfileAction({
      full_name: fullName,
      phone,
      headline,
      bio,
      specialization,
      experience_years: experienceYears,
      wilaya: wilaya || null,
      city: city || null,
      social_links: {
        twitter: twitter || undefined,
        linkedin: linkedin || undefined,
        github: github || undefined,
        youtube: youtube || undefined,
        website: website || undefined,
      },
    });

    if (!res.success) {
      setMessage({ type: "error", text: res.error || "فشل حفظ الملف المهني" });
      if (res.fieldErrors) {
        setFieldErrors(res.fieldErrors);
      }
    } else {
      setMessage({
        type: "success",
        text: res.message || "تم حفظ الملف المهني بنجاح!",
      });
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-8 text-right">
      {/* Top Banner with Stats & Verification */}
      <Card variant="default" className="border-border/80 overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-surface to-transparent p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Avatar
                src={profile.avatar_url || undefined}
                alt={fullName}
                fallback={fullName}
                size="lg"
                className="ring-4 ring-primary/20"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-foreground">
                    {fullName || "مدرب معتمد"}
                  </h2>
                  {stats.isVerified ? (
                    <Badge variant="success" size="sm" className="gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      <span>مدرب موثق</span>
                    </Badge>
                  ) : (
                    <Badge variant="warning" size="sm">
                      قيد المراجعة والتوثيق
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{profile.email}</p>
                {headline && (
                  <p className="text-xs font-semibold text-primary">{headline}</p>
                )}
              </div>
            </div>

            {/* Public Instructor Stats */}
            <div className="flex items-center gap-4 rounded-xl border border-border/80 bg-surface/80 p-4 shadow-xs">
              <div className="text-center px-3 border-l border-border/60">
                <p className="text-lg font-bold text-foreground">
                  {stats.publishedCourses}
                </p>
                <p className="text-[10px] text-muted-foreground">دورات منشورة</p>
              </div>
              <div className="text-center px-3">
                <p className="text-lg font-bold text-primary">
                  {stats.totalStudents}
                </p>
                <p className="text-[10px] text-muted-foreground">طالب مسجل</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {message && (
        <Alert
          variant={message.type === "success" ? "default" : "error"}
          title={message.type === "success" ? "تم بنجاح" : "تنبيه"}
        >
          {message.text}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar UploadSimple */}
        <Card variant="default">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <UploadSimple className="h-4 w-4 text-primary" />
              <span>الصورة المهنية للمدرب</span>
            </CardTitle>
            <CardDescription className="text-xs">
              تظهر صورتك في صفحات الدورات وبطاقات المنهج التعليمي
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <Avatar
                src={profile.avatar_url || undefined}
                alt={fullName}
                fallback={fullName}
                size="lg"
              />
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarFileChange}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  isLoading={isUploadingAvatar}
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-1.5 text-xs font-semibold"
                >
                  <UploadSimple className="h-3.5 w-3.5" />
                  <span>تغيير الصورة</span>
                </Button>

                {profile.avatar_url && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveAvatar}
                    className="gap-1.5 text-xs text-error hover:bg-error/10"
                  >
                    <Trash className="h-3.5 w-3.5" />
                    <span>إزالة</span>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Details */}
        <Card variant="default">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Certificate className="h-4 w-4 text-primary" />
              <span>المعلومات المهنية والتخصص</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="الاسم الكامل"
                placeholder="مثال: د. أمين قندوز"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                error={fieldErrors.full_name?.[0]}
                required
              />

              <Input
                type="tel"
                label="رقم الهاتف"
                placeholder="05 / 06 / 07 XX XX XX XX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={fieldErrors.phone?.[0]}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="المسمى المهني / اللقب الوظيفي"
                placeholder="مثال: Senior Full-Stack Engineer & Tech Lead"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                error={fieldErrors.headline?.[0]}
                required
              />

              <div className="grid grid-cols-2 gap-2">
                <Select
                  label="مجال التخصص"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                >
                  <option value="تطوير الويب وهندسة البرمجيات">تطوير الويب</option>
                  <option value="تطبيقات الهواتف الذكية">تطبيقات الهواتف</option>
                  <option value="تصميم واجهات وتجربة المستخدم">UI/UX</option>
                  <option value="الذكاء الاصطناعي وعلوم البيانات">الذكاء الاصطناعي</option>
                  <option value="الحوسبة السحابية و DevOps">DevOps & Cloud</option>
                </Select>

                <Input
                  type="number"
                  label="سنوات الخبرة"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  error={fieldErrors.experience_years?.[0]}
                  min={0}
                  max={50}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="الولاية"
                value={wilaya}
                onChange={(e) => setWilaya(e.target.value)}
              >
                <option value="">-- اختر الولاية --</option>
                {ALGERIA_WILAYAS.map((w) => (
                  <option key={w.code} value={w.name}>
                    {w.name}
                  </option>
                ))}
              </Select>

              <Input
                label="المدينة"
                placeholder="مثال: الجزائر العاصمة"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <Textarea
              label="النبذة المهنية والسيرة الذاتية (Bio)"
              placeholder="اكتب نبذة عن مسارك المهني، التقنيات التي تتقنها، المشاريع الرائدة التي عملت عليها، ورؤيتك التدريبية..."
              rows={5}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              error={fieldErrors.bio?.[0]}
              required
            />
          </CardContent>
        </Card>

        {/* Social and Professional Links */}
        <Card variant="default">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              <span>الروابط والشبكات المهنية</span>
            </CardTitle>
            <CardDescription className="text-xs">
              تساعد الروابط الطلاب على استكشاف مشاريعك وسجلك المهني
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="رابط لينكدإن (LinkedIn)"
                placeholder="https://linkedin.com/in/username"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                error={fieldErrors["social_links.linkedin"]?.[0]}
              />

              <Input
                label="رابط غيتهاب (GitHub)"
                placeholder="https://github.com/username"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                error={fieldErrors["social_links.github"]?.[0]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="رابط تويتر / X"
                placeholder="https://x.com/username"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                error={fieldErrors["social_links.twitter"]?.[0]}
              />

              <Input
                label="قناة يوتيوب (YouTube)"
                placeholder="https://youtube.com/@channel"
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
                error={fieldErrors["social_links.youtube"]?.[0]}
              />

              <Input
                label="الموقع الشخصي / البورتفوليو"
                placeholder="https://yourwebsite.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                error={fieldErrors["social_links.website"]?.[0]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSaving}
            className="font-bold min-w-[160px]"
          >
            <span>حفظ تعديلات الملف المهني</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
