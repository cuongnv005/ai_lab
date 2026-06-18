import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export const Footer: React.FC = () => {
  const t = useTranslations("Footer");
  return (
    <footer className="w-full border-t bg-card py-10 mt-auto text-sm text-muted-foreground">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="font-bold text-lg text-primary tracking-tight">
              <span className="text-primary">AI</span>
              <span>_Lab</span>
              <span className="text-primary">.</span>
            </Link>
            <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
              {t("description", { defaultValue: "Cộng đồng chia sẻ prompts, tutorials và các hướng dẫn công nghệ AI hàng đầu tại Việt Nam. Tham gia thảo luận và phát triển kỹ năng AI của bạn." })}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-primary text-xs uppercase tracking-wider">{t("explore", { defaultValue: "Khám phá" })}</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  {t("home", { defaultValue: "Trang chủ" })}
                </Link>
              </li>
              <li>
                <Link href="/forum" className="hover:text-primary transition-colors">
                  {t("forum", { defaultValue: "Diễn đàn thảo luận" })}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-primary text-xs uppercase tracking-wider">{t("rules", { defaultValue: "Quy định" })}</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors">
                  {t("terms", { defaultValue: "Điều khoản sử dụng" })}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors">
                  {t("privacy", { defaultValue: "Chính sách bảo mật" })}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <span>&copy; {new Date().getFullYear()} AI_Lab. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Facebook</a>
            <a href="#" className="hover:underline">Twitter</a>
            <a href="#" className="hover:underline">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
