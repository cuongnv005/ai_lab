import React from "react";
import { Eye, ShieldCheck, Database, Key, Bell, Globe } from "lucide-react";
import { Metadata } from "next";

import { useTranslations } from "next-intl";

export const metadata: Metadata = {
  title: "Chính sách bảo mật | AI_Lab",
  description: "Chính sách bảo mật thông tin và quản lý dữ liệu cá nhân tại cộng đồng AI_Lab.",
};

export default function PrivacyPage() {
  const t = useTranslations("PrivacyPage");

  const sections = [
    {
      icon: <Database className="w-5 h-5" />,
      title: t("sections.1.title"),
      content: t("sections.1.content"),
    },
    {
      icon: <Eye className="w-5 h-5" />,
      title: t("sections.2.title"),
      content: t("sections.2.content"),
    },
    {
      icon: <ShieldCheck className="w-5 h-5" />,
      title: t("sections.3.title"),
      content: t("sections.3.content"),
    },
    {
      icon: <Key className="w-5 h-5" />,
      title: t("sections.4.title"),
      content: t("sections.4.content"),
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: t("sections.5.title"),
      content: t("sections.5.content"),
    },
    {
      icon: <Bell className="w-5 h-5" />,
      title: t("sections.6.title"),
      content: t("sections.6.content"),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary">
          {t("title")}
        </h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          {t("updated")}
        </p>
        <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
      </div>

      {/* Main Content */}
      <div className="grid gap-6">
        {sections.map((section, idx) => (
          <div
            key={idx}
            className="group relative overflow-hidden rounded-2xl border border-[#E2E8F0] dark:border-[#2d2d30] bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md dark:hover:shadow-primary/10"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full pointer-events-none transition-all duration-300 group-hover:scale-125 group-hover:bg-primary/10" />
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white dark:group-hover:bg-primary-container dark:group-hover:text-on-primary-container">
                {section.icon}
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors duration-300">
                  {section.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {section.content}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Contact Information */}
      <div className="rounded-2xl border border-dashed border-[#E2E8F0] dark:border-[#2d2d30] bg-muted/30 p-8 text-center space-y-4">
        <h3 className="font-bold text-lg text-foreground">{t("contactTitle")}</h3>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          {t("contactDesc")}
          <a
            href="mailto:privacy@ailab.vn"
            className="font-medium text-primary hover:underline ml-1"
          >
            privacy@ailab.vn
          </a>
          .
        </p>
      </div>
    </div>
  );
}
