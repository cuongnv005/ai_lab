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
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center p-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <div>
          <h1 className="text-xl font-bold">{t('layout.accessDenied')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('layout.noPermission')}
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Home className="h-4 w-4" />
          {t('layout.backToHome')}
        </Link>
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
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center p-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <div>
          <h1 className="text-xl font-bold">{t('layout.accessDenied')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('layout.noPermissionPage')}
          </p>
        </div>
        <Link
          href="/admin/approval-queue"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Home className="h-4 w-4" />
          {t('layout.goToApprovalQueue')}
        </Link>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="flex h-14 items-center border-b border-border bg-card px-4 gap-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
            data-testid="admin-sidebar-toggle"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <LocaleSwitcher />
            <ThemeToggle />
            <Link
              href="/"
              data-testid="admin-back-to-site"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted"
            >
              <Home className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t('layout.backToSite')}</span>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-white dark:bg-zinc-950">
          {children}
        </main>
      </div>
    </div>
  )
}
