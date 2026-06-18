"use client";

import React, { useRef, useState } from "react";
import { PageContentTransition } from "./page-content-transition";
import { Menu as MenuIcon, X } from "lucide-react";
import { SidebarMenu } from "../menu/sidebar-menu";
import { Breadcrumb } from "../menu/breadcrumb";
import { LocaleSwitcher } from "./locale-switcher";
import { ThemeToggle } from "./theme-toggle";
import { menuConfig } from "@/shared/config/menu";
import { cn } from "@/shared/lib/utils";
import { useTranslations } from "next-intl";
import { 
  Button, 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@bks/ds-system-sdk";
import { ChangePasswordDialog } from "@/features/auth";
import { useAuth } from "@/features/auth";

interface AppShellProps {
  children: React.ReactNode;
  initialCollapsed?: boolean;
}

export const AppShell: React.FC<AppShellProps> = ({ children, initialCollapsed = false }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  const toggleSidebarCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      document.cookie = `sidebar-collapsed=${next}; path=/; max-age=31536000; SameSite=Lax`;
      return next;
    });
  };

  const t = useTranslations("Common");
  const tAuth = useTranslations("ChangePassword");
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
    setIsLogoutOpen(false);
    window.location.href = "/login";
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
          !isSidebarOpen && "-translate-x-full",
          isCollapsed && "lg:w-20"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-6">
          {!isCollapsed && <span className="text-xl font-bold tracking-tight">{t("logo")}</span>}
          <button
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <SidebarMenu items={menuConfig} isCollapsed={isCollapsed} />
        </div>

        <div className="border-t p-4">
           {/* User Profile / Logout Trigger */}
           {!isCollapsed && (
             <button 
               onClick={() => setIsLogoutOpen(true)}
               className="flex w-full items-center space-x-3 rounded-lg bg-secondary/50 p-2 text-left transition-colors hover:bg-secondary/70"
             >
                <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-muted">
                  <img
                    src={user?.avatar_url || user?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.id || 'U'}`}
                    alt="Avatar"
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex-1 truncate text-xs">
                   <p className="font-semibold">{user?.name || t("userName")}</p>
                   <p className="opacity-60">{user?.email || t("userEmail")}</p>
                </div>
             </button>
           )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center border-b bg-card px-4 lg:px-8">
          <button
            className="mr-4 text-muted-foreground hover:text-foreground lg:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <MenuIcon className="h-6 w-6" />
          </button>

          <div className="flex-1 overflow-hidden">
            <Breadcrumb />
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
             <Button
               variant="outline"
               size="sm"
               onClick={() => setIsChangePasswordOpen(true)}
             >
                {tAuth("trigger")}
             </Button>
             <ThemeToggle />
             <LocaleSwitcher />
             {/* Header Actions */}
             <button 
               id="sidebar-toggle"
               onClick={toggleSidebarCollapse}
               className="hidden lg:block text-muted-foreground hover:text-foreground"
             >
                <MenuIcon className="h-5 w-5" />
             </button>
          </div>
        </header>

        {/* Content */}
        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto bg-muted/20 p-4 lg:p-8"
        >
          <div className="mx-auto max-w-7xl">
            <PageContentTransition scrollContainerRef={mainRef}>
              {children}
            </PageContentTransition>
          </div>
        </main>
      </div>

      <ChangePasswordDialog
        open={isChangePasswordOpen}
        onOpenChange={setIsChangePasswordOpen}
      />

      <AlertDialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận đăng xuất</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn đăng xuất khỏi hệ thống? Các phiên làm việc hiện tại sẽ bị kết thúc.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoggingOut}>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              tone="destructive" 
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
