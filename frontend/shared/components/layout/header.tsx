"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, LogOut, LayoutDashboard, FileText, Menu, X, Loader2, User } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { ThemeToggle } from './theme-toggle';
import { LocaleSwitcher } from './locale-switcher';
import { useTranslations } from 'next-intl';

export const Header: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const t = useTranslations("Header");
  const commonT = useTranslations("Common");
  const searchParamValue = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(searchParamValue);
  const [prevSearchParam, setPrevSearchParam] = useState(searchParamValue);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mounted, setMounted] = useState(false);

  if (searchParamValue !== prevSearchParam) {
    setPrevSearchParam(searchParamValue);
    setSearchQuery(searchParamValue);
  }

  useEffect(() => {
    let active = true;
    requestAnimationFrame(() => {
      if (active) setMounted(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    window.location.href = '/login';
  };

  const isAdmin = user?.roles?.includes('admin');
  const isModerator = user?.roles?.includes('moderator');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/60">
      {/* Main Navbar */}
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Left: Logo & Nav Links */}
        <div className="flex items-center gap-8 h-full">
          <Link href="/" className="flex items-center space-x-2 font-black text-lg tracking-wider text-primary font-mono group">
            <span className="bg-blue-600 text-white dark:bg-blue-500 px-1.5 py-0.5 rounded text-xs font-black group-hover:bg-blue-700 transition-colors">AI</span>
            <span>LAB</span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-light group-hover:text-blue-500 transition-colors">{"//_NET"}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium h-full">
            <Link 
              href="/" 
              className={`transition-all hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5 h-full relative px-1 ${
                pathname === '/' ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-muted-foreground'
              }`}
            >
              {t("home", { defaultValue: "Trang chủ" })}
              {pathname === '/' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 dark:bg-blue-500 rounded-full" />
              )}
            </Link>
            <Link 
              href="/forum" 
              className={`transition-all hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5 h-full relative px-1 ${
                pathname.startsWith('/forum') ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-muted-foreground'
              }`}
            >
              {t("forum", { defaultValue: "Diễn đàn thảo luận" })}
              {pathname.startsWith('/forum') && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 dark:bg-blue-500 rounded-full" />
              )}
            </Link>
          </nav>
        </div>

        {/* Center/Right Search Bar (Zaira Style) */}
        <div className="hidden lg:flex flex-1 max-w-sm mx-8">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder={t("searchPlaceholder", { defaultValue: "Tìm kiếm bài viết..." })}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 rounded-full border bg-muted/50 px-4 pr-10 text-sm focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary">
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <LocaleSwitcher />
          </div>
          <ThemeToggle />

          {/* User Section */}
          {isLoading ? (
            <div className="hidden sm:flex items-center gap-2">
              <div className="h-8 w-20 bg-muted/50 rounded-full animate-pulse" />
              <div className="h-8 w-24 bg-muted/50 rounded-full animate-pulse" />
            </div>
          ) : isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-full p-1 hover:bg-muted/80 transition-colors"
              >
                <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-muted">
                  <img
                    src={user?.avatar_url || user?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.id || 'U'}`}
                    alt="Avatar"
                    className="object-cover w-full h-full"
                  />
                </div>
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border bg-card p-2 shadow-lg z-40 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-3 py-2 border-b">
                      <p className="text-sm font-semibold truncate">{user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>

                    <div className="py-1">
                        <Link
                          href={`/users/${user?.id}`}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-muted/80 transition-colors"
                        >
                          <User className="w-4 h-4" />
                          <span>{t("myProfile", { defaultValue: "Hồ sơ của tôi" })}</span>
                        </Link>
                        <Link
                          href="/dashboard/posts"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-muted/80 transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                          <span>{t("myPosts", { defaultValue: "Bài viết của tôi" })}</span>
                        </Link>
 
                      {(isAdmin || isModerator) && (
                        <Link
                          href={isAdmin ? "/admin/dashboard" : "/admin/approval-queue"}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-muted/80 transition-colors text-primary font-medium"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          <span>{t("dashboard")}</span>
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t("logout", { defaultValue: "Đăng xuất" })}</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {t("login", { defaultValue: "Đăng nhập" })}
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-semibold transition-colors shadow-xs"
              >
                {t("register", { defaultValue: "Đăng ký" })}
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggler */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-muted-foreground hover:text-primary md:hidden"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="border-t bg-background p-4 md:hidden animate-in slide-in-from-top duration-250">
          <nav className="flex flex-col gap-4">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium hover:text-blue-600"
            >
              {t("home", { defaultValue: "Trang chủ" })}
            </Link>
            <Link
              href="/forum"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium hover:text-blue-600"
            >
              {t("forum", { defaultValue: "Diễn đàn thảo luận" })}
            </Link>

            <form onSubmit={handleSearchSubmit} className="relative w-full mt-2">
              <input
                type="text"
                placeholder={t("searchPlaceholder", { defaultValue: "Tìm kiếm bài viết..." })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 rounded-full border bg-muted/50 px-4 pr-10 text-sm"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Search className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center justify-between border-t pt-4 mt-2">
              <span className="text-xs text-muted-foreground">{commonT("switchLanguage", { defaultValue: "Ngôn ngữ" })}</span>
              <LocaleSwitcher />
            </div>

            {!isLoading && !isAuthenticated && (
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-semibold rounded-lg border"
                >
                  {t("login", { defaultValue: "Đăng nhập" })}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white"
                >
                  {t("register", { defaultValue: "Đăng ký" })}
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
      {isLoggingOut && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-card border shadow-2xl max-w-xs w-full mx-4 text-center">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-base">{t("loggingOut", { defaultValue: "Đang đăng xuất" })}</h3>
              <p className="text-sm text-muted-foreground">{t("pleaseWait", { defaultValue: "Vui lòng chờ trong giây lát..." })}</p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
};
