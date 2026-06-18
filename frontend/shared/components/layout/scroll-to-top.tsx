"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@bks/ds-system-sdk";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollElement, setScrollElement] = useState<HTMLElement | Window | null>(null);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement | Document;
      
      let currentScroll = 0;
      let el: HTMLElement | Window | null = null;

      if (target === document || target === document.documentElement || target === document.body) {
        currentScroll = window.scrollY || document.documentElement.scrollTop;
        el = window;
      } else if (target instanceof HTMLElement) {
        currentScroll = target.scrollTop;
        el = target;
      }

      if (currentScroll > 100) {
        setIsVisible(true);
        if (el) setScrollElement(el);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { capture: true, passive: true });
    return () => window.removeEventListener("scroll", handleScroll, { capture: true });
  }, []);

  const scrollToTop = () => {
    if (scrollElement) {
      if (scrollElement === window) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        (scrollElement as HTMLElement).scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Button
      variant="default"
      size="icon"
      className="fixed bottom-6 right-6 z-[999] rounded-full shadow-lg transition-all duration-300 hover:scale-110 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-500"
      onClick={scrollToTop}
      aria-label="Scroll to top"
    >
      <ArrowUp className="h-5 w-5" />
    </Button>
  );
}
