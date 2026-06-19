"use client";

import { useTransition, useState, useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { setLocale } from "@/i18n/locale-actions";
import { locales, localeLabels } from "@/shared/config/i18n";
import { Globe, ChevronDown, Check } from "lucide-react";

export function LocaleSwitcher() {
  const active = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  function change(locale: string) {
    if (locale === active || isPending) return;
    setIsOpen(false);
    startTransition(async () => {
      // Persist the locale in a cookie, then re-render server content with it.
      await setLocale(locale);
      router.refresh();
    });
  }

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center gap-1.5 h-9 px-3 rounded-full border border-[#E2E8F0] dark:border-[#2d2d30] bg-muted/40 text-xs font-semibold uppercase hover:bg-muted/80 transition-all cursor-pointer text-on-surface"
      >
        <Globe className="w-3.5 h-3.5 text-muted-foreground" />
        <span>{active}</span>
        <ChevronDown className="w-3 h-3 text-muted-foreground transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-36 rounded-xl border border-[#E2E8F0] dark:border-[#2d2d30] bg-card p-1 shadow-lg z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          {locales.map((locale) => (
            <button
              key={locale}
              type="button"
              onClick={() => change(locale)}
              disabled={isPending}
              className={`flex items-center justify-between w-full px-3 py-2 text-xs font-semibold rounded-lg hover:bg-muted/80 transition-colors text-left cursor-pointer ${
                active === locale ? "text-primary bg-primary/5 font-bold" : "text-muted-foreground hover:text-on-surface"
              }`}
            >
              <span>{localeLabels[locale]}</span>
              {active === locale && <Check className="w-3.5 h-3.5 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
