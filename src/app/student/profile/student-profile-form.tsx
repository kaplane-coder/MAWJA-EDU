"use client";

import * as React from "react";
import {
  User,
  UploadSimple,
  Trash,
  Sparkle,
  CheckCircle,
  Percent,
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
import { ALGERIA_WILAYAS, POPULAR_INTERESTS } from "@/lib/wilayas";
import {
  updateStudentProfileAction,
  uploadAvatarAction,
  removeAvatarAction,
} from "@/actions/profile";
import type { Database } from "@/types/database.types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

interface StudentProfileFormProps {
  initialProfile: ProfileRow;
}

export function StudentProfileForm({ initialProfile }: StudentProfileFormProps) {
  const [profile, setProfile] = React.useState(initialProfile);
  const [fullName, setFullName] = React.useState(initialProfile.full_name || "");
  const [username, setUsername] = React.useState(initialProfile.username || "");
  const [phone, setPhone] = React.useState(initialProfile.phone || "");
  const [bio, setBio] = React.useState(initialProfile.bio || "");
  const [wilaya, setWilaya] = React.useState(initialProfile.wilaya || "");
  const [city, setCity] = React.useState(initialProfile.city || "");
  const [interests, setInterests] = React.useState<string[]>(
    initialProfile.interests || []
  );
  const [preferredLanguage, setPreferredLanguage] = React.useState<
    "ar" | "fr" | "en"
  >((initialProfile.preferred_language as "ar" | "fr" | "en") || "ar");

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

  // Calculate profile completion percentage
  const completionPercentage = React.useMemo(() => {
    let score = 0;
    const totalFields = 7;
    if (fullName) score++;
    if (username) score++;
    if (profile.avatar_url) score++;
    if (bio) score++;
    if (phone) score++;
    if (wilaya) score++;
    if (interests.length > 0) score++;
    return Math.round((score / totalFields) * 100);
  }, [fullName, username, profile.avatar_url, bio, phone, wilaya, interests]);

  const handleInterestToggle = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

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
      setMessage({ type: "success", text: "تمت إزالة الصورة الشخصية بنجاح" });
    }
    setIsUploadingAvatar(false);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    setFieldErrors({});

    const res = await updateStudentProfileAction({
      full_name: fullName,
      username: username || null,
      phone: phone || null,
      bio: bio || null,
      wilaya: wilaya || null,
      city: city || null,
      interests: interests,
      preferred_language: preferredLanguage,
    });

    if (!res.success) {
      setMessage({ type: "error", text: res.error || "تعذر حفظ التعديلات" });
      if (res.fieldErrors) {
        setFieldErrors(res.fieldErrors);
      }
    } else {
      setMessage({
        type: "success",
        text: res.message || "تم حفظ التعديلات بنجاح!",
      });
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-8 text-right">
      {/* Top Banner & Profile Completion Gauge */}
      <Card variant="default" className="border-border/80 overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 sm:p-8">
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
                    {fullName || "طالب موجة"}
                  </h2>
                  <Badge variant="secondary" size="sm">
                    طالب
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{profile.email}</p>
                {username && (
                  <p className="text-xs font-mono text-primary">@{username}</p>
                )}
              </div>
            </div>

            {/* Profile Completion Meter */}
            <div className="w-full sm:w-64 space-y-2 rounded-xl border border-border/80 bg-surface/80 p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-muted-foreground">اكتمال الملف الشخصي</span>
                <span className="text-primary flex items-center gap-0.5">
                  <span>{completionPercentage}</span>
                  <Percent className="h-3 w-3" />
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                {completionPercentage === 100
                  ? "ملفك الشخصي مكتمل ومثالي!"
                  : "أكمل باقي البيانات لتحسين تجربتك التعليمية"}
              </p>
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

      {/* Profile Edit Form */}
      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Avatar Management Card */}
        <Card variant="default">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <UploadSimple className="h-4 w-4 text-primary" />
              <span>الصورة الشخصية (Avatar)</span>
            </CardTitle>
            <CardDescription className="text-xs">
              تظهر صورتك في لوحة التحكم، المجتمع، والمناقشات التعليمية (JPG, PNG, WEBP بحد أقصى 5 ميغابايت)
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

        {/* Basic Information */}
        <Card variant="default">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <span>البيانات الأساسية</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="الاسم الكامل"
                placeholder="مثال: يونس بلحاج"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                error={fieldErrors.full_name?.[0]}
                required
              />

              <Input
                label="اسم المستخدم (Username)"
                placeholder="مثال: younes_dev"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                error={fieldErrors.username?.[0]}
                helperText="يستخدم في رابط ملفك العام"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="email"
                label="البريد الإلكتروني"
                value={profile.email}
                disabled
                helperText="البريد الإلكتروني مرتبط بحساب المصادقة ولا يمكن تغييره هنا"
              />

              <Input
                type="tel"
                label="رقم الهاتف"
                placeholder="05 / 06 / 07 XX XX XX XX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={fieldErrors.phone?.[0]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="الولاية"
                value={wilaya}
                onChange={(e) => setWilaya(e.target.value)}
              >
                <option value="">-- اختر ولاية الإقامة --</option>
                {ALGERIA_WILAYAS.map((w) => (
                  <option key={w.code} value={w.name}>
                    {w.name}
                  </option>
                ))}
              </Select>

              <Input
                label="البلدية / المدينة"
                placeholder="مثال: باب الزوار، وهران، ..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <Textarea
              label="نبذة عنك (Bio)"
              placeholder="اكتب نبذة موجزة عن اهتماماتك التقنية، أهدافك التعليمية، ومجالات شغفك..."
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              error={fieldErrors.bio?.[0]}
            />
          </CardContent>
        </Card>

        {/* Learning Interests & Preferences */}
        <Card variant="default">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Sparkle className="h-4 w-4 text-primary" />
              <span>الاهتمامات وتفضيلات التعلم</span>
            </CardTitle>
            <CardDescription className="text-xs">
              حدد المجالات التي تود التركيز عليها لتخصيص ترشيحات الدورات المناسبة لك
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-foreground mb-2.5">
                المجالات والتقنيات المفضلة:
              </p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_INTERESTS.map((interest) => {
                  const isSelected = interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => handleInterestToggle(interest)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-xs ring-2 ring-primary/30"
                          : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {isSelected && <CheckCircle className="h-3 w-3" />}
                      <span>{interest}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="max-w-xs pt-2">
              <Select
                label="لغة واجهة المنصة المفضلة"
                value={preferredLanguage}
                onChange={(e) =>
                  setPreferredLanguage(e.target.value as "ar" | "fr" | "en")
                }
              >
                <option value="ar">العربية (الافتراضية)</option>
                <option value="fr">Français</option>
                <option value="en">English</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSaving}
            className="font-bold min-w-[160px]"
          >
            <span>حفظ تعديلات الملف</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
