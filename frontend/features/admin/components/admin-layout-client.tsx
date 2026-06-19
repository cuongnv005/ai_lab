'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Home, AlertTriangle } from 'lucide-react'
import { AdminSidebar } from '@/features/admin/components/admin-sidebar'
import { useAuthStore } from '@/features/auth'
import { ThemeToggle } from '@/shared/components/layout/theme-toggle'
import { LocaleSwitcher } from '@/shared/components/layout/locale-switcher'
import { Spinner } from '@bks/ds-system-sdk/components/ui/spinner'
import { useTranslations } from 'next-intl'

interface AdminLayoutClientProps {
  children: React.ReactNode
}

export function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  const t = useTranslations('Admin')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { user, isLoading } = useAuthStore()
  const pathname = usePathname()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  const isAdmin = user?.roles?.includes('admin')
  const isModerator = user?.roles?.includes('moderator')

  // Authorization guard — admin or moderator role allowed
  if (!user || (!isAdmin && !isModerator)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="flex max-w-md w-full flex-col items-center text-center bg-card rounded-2xl border border-[#E2E8F0] dark:border-[#2d2d30] p-8 shadow-sm shadow-black/5">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 mb-5">
            <AlertTriangle className="h-7 w-7 text-destructive" />
          </div>
          <h1 className="text-xl font-bold text-on-surface mb-2">{t('layout.accessDenied')}</h1>
          <p className="text-sm text-on-surface-variant/80 dark:text-muted-foreground mb-6">
            {t('layout.noPermission')}
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold px-5 py-2.5 text-sm transition-all shadow-sm cursor-pointer w-full"
          >
            <Home className="h-4 w-4" />
            {t('layout.backToHome')}
          </Link>
        </div>
      </div>
    )
  }

  // Moderator restricted paths
  const isRestrictedPath = pathname.startsWith('/admin/users') || 
                           pathname.startsWith('/admin/categories') || 
                           pathname.startsWith('/admin/dashboard') || 
                           pathname === '/admin' || 
                           pathname === '/admin/'
  if (isModerator && !isAdmin && isRestrictedPath) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="flex max-w-md w-full flex-col items-center text-center bg-card rounded-2xl border border-[#E2E8F0] dark:border-[#2d2d30] p-8 shadow-sm shadow-black/5">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 mb-5">
            <AlertTriangle className="h-7 w-7 text-destructive" />
          </div>
          <h1 className="text-xl font-bold text-on-surface mb-2">{t('layout.accessDenied')}</h1>
          <p className="text-sm text-on-surface-variant/80 dark:text-muted-foreground mb-6">
            {t('layout.noPermissionPage')}
          </p>
          <Link
            href="/admin/approval-queue"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold px-5 py-2.5 text-sm transition-all shadow-sm cursor-pointer w-full"
          >
            <Home className="h-4 w-4" />
            {t('layout.goToApprovalQueue')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="flex min-h-screen bg-background text-foreground admin-layout"
      style={{
        '--primary': '#0047ab',
        '--color-primary': '#0047ab',
      } as React.CSSProperties}
    >
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="flex h-16 items-center border-b border-[#E2E8F0] dark:border-[#2d2d30] bg-[#FAF9FF] dark:bg-zinc-950 px-6 gap-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden text-muted-foreground hover:text-foreground transition-colors p-1.5 hover:bg-surface-container-low rounded-lg"
            data-testid="admin-sidebar-toggle"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <LocaleSwitcher />
            <ThemeToggle />
            <Link
              href="/"
              data-testid="admin-back-to-site"
              className="flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-on-surface transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-container-low border border-transparent hover:border-outline-variant/30"
            >
              <Home className="h-3.5 w-3.5" />
              <span className="hidden sm:inline font-semibold">{t('layout.backToSite')}</span>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-[#FAF9FF] dark:bg-zinc-950">
          {children}
        </main>
      </div>
    </div>
  )
}
