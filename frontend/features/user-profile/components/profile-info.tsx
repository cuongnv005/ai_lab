"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/bks/ds-system-sdk";

export interface ProfileInfoProps {
  user: {
    name?: string;
    dob?: string | null;
    hometown?: string | null;
    gender?: number | null;
    gender_label?: string | null;
    bio?: string | null;
  };
}

export function ProfileInfo({ user }: ProfileInfoProps) {
  const t = useTranslations("profile");

  const renderGender = () => {
    if (user.gender === 1) return t("male", { defaultValue: "Nam" });
    if (user.gender === 2) return t("female", { defaultValue: "Nữ" });
    if (user.gender === 3) return t("other", { defaultValue: "Khác" });
    return user.gender_label || "-";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("personalInfo", { defaultValue: "Thông tin cá nhân" })}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-muted-foreground">{t("name", { defaultValue: "Họ và tên" })}</div>
            <div className="mt-1 font-medium">{user.name || "-"}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">{t("dob", { defaultValue: "Ngày sinh" })}</div>
            <div className="mt-1 font-medium">{user.dob || "-"}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">{t("hometown", { defaultValue: "Quê quán" })}</div>
            <div className="mt-1 font-medium">{user.hometown || "-"}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">{t("gender", { defaultValue: "Giới tính" })}</div>
            <div className="mt-1 font-medium">{renderGender()}</div>
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <div className="text-sm font-medium text-muted-foreground mb-2">{t("bio", { defaultValue: "Giới thiệu bản thân" })}</div>
          <div className="text-sm whitespace-pre-wrap leading-relaxed">{user.bio || t("noBio", { defaultValue: "Chưa có giới thiệu." })}</div>
        </div>
      </CardContent>
    </Card>
  );
}
