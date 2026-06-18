import React from "react";
import { ShieldCheck, FileText, Scale, Users, AlertTriangle, HelpCircle } from "lucide-react";
import { Metadata } from "next";

import { useTranslations } from "next-intl";

export const metadata: Metadata = {
  title: "Điều khoản sử dụng | AI_Lab",
  description: "Điều khoản và điều kiện sử dụng dịch vụ của cộng đồng chia sẻ AI_Lab.",
};

export default function TermsPage() {
  const t = useTranslations("TermsPage");
  
  const sections = [
    {
      icon: <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      title: t("sections.1.title"),
      content: t("sections.1.content"),
    },
    {
      icon: <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      title: t("sections.2.title"),
      content: t("sections.2.content"),
    },
    {
      icon: <Scale className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      title: t("sections.3.title"),
      content: t("sections.3.content"),
    },
    {
      icon: <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      title: t("sections.4.title"),
      content: t("sections.4.content"),
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      title: t("sections.5.title"),
      content: t("sections.5.content"),
    },
    {
      icon: <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      title: t("sections.6.title"),
      content: t("sections.6.content"),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-300">
          {t("title")}
        </h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          {t("updated")}
        </p>
        <div className="h-1 w-20 bg-blue-600 dark:bg-blue-400 mx-auto rounded-full" />
      </div>

      {/* Main Content */}
      <div className="grid gap-6">
        {sections.map((section, idx) => (
          <div
            key={idx}
            className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-md dark:hover:shadow-blue-950/20"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none transition-all duration-300 group-hover:scale-125 group-hover:bg-blue-500/10" />
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/50 text-primary transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-400 dark:group-hover:text-black">
                {section.icon}
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
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
      <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center space-y-4">
        <h3 className="font-bold text-lg text-foreground">{t("contactTitle")}</h3>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          {t("contactDesc")}
          <a
            href="mailto:support@ailab.vn"
            className="font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            support@ailab.vn
          </a>
          .
        </p>
      </div>
    </div>
  );
}
