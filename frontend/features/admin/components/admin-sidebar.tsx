'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ClipboardList,
  Flag,
  Users,
  FileText,
  FolderOpen,
  Shield,
  X,
  LogOut,
  Loader2,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/shared/lib/utils'
import { useAuth } from '@/features/auth'

interface NavItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  path: string
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard, path: '/admin/dashboard' },
  { id: 'approval', label: 'Duyệt bài', icon: ClipboardList, path: '/admin/approval-queue' },
  { id: 'reports', label: 'Báo cáo vi phạm', icon: Flag, path: '/admin/reports' },
  { id: 'users', label: 'Thành viên', icon: Users, path: '/admin/users' },
  { id: 'posts', label: 'Bài viết', icon: FileText, path: '/admin/posts' },
  { id: 'categories', label: 'Danh mục', icon: FolderOpen, path: '/admin/categories' },
]

interface AdminSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const t = useTranslations('Admin')
  const tHeader = useTranslations('Header')
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isAdmin = user?.roles?.includes('admin')
  const isModerator = user?.roles?.includes('moderator')

  const items = NAV_ITEMS.filter((item) => {
    if (isModerator && !isAdmin) {
      return ['approval', 'reports', 'posts'].includes(item.id)
    }
    return true
  })

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-[#E2E8F0] dark:border-[#2d2d30] bg-[#F1F3FF] dark:bg-zinc-900 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo / Brand */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-[#E2E8F0] dark:border-[#2d2d30]">
          <Link href="/admin/dashboard" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white shadow-sm shadow-primary/10 transition-transform group-hover:scale-105 duration-200">
              <Shield className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight text-on-surface leading-none">{t('sidebar.brandTitle')}</p>
              <p className="text-[10px] text-on-surface-variant/80 dark:text-muted-foreground leading-none mt-1">{t('sidebar.brandSubtitle')}</p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.path)

            return (
              <Link
                key={item.id}
                href={item.path}
                onClick={() => onClose()}
                data-testid={`admin-nav-${item.id}`}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-150 select-none border border-transparent',
                  isActive
                    ? 'bg-primary dark:bg-primary-container text-white shadow-md shadow-primary/15 dark:shadow-none'
                    : 'text-on-surface-variant hover:bg-surface-container-low dark:hover:bg-zinc-800/40 hover:text-on-surface hover:border-outline-variant/30',
                )}
              >
                <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-white' : 'text-on-surface-variant/70')} />
                <span>{t(`sidebar.${item.id}`)}</span>
              </Link>
            )
          })}
        </nav>

        {/* User Footer */}
        <div className="border-t border-[#E2E8F0] dark:border-[#2d2d30] p-4">
          <div className="flex items-center gap-3 rounded-lg bg-surface-container-low dark:bg-zinc-800/30 border border-outline-variant/30 px-3 py-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-white text-xs font-black shadow-sm">
              {user?.name?.charAt(0).toUpperCase() ?? 'A'}
            </div>
            <div className="flex-1 truncate">
              <p className="text-xs font-bold text-on-surface truncate">{user?.name ?? 'Admin'}</p>
              <p className="text-[10px] text-on-surface-variant/80 dark:text-muted-foreground truncate mt-0.5">{user?.email ?? ''}</p>
            </div>
            <button
              onClick={async () => {
                try {
                  setIsLoggingOut(true)
                  await logout()
                  window.location.href = '/login'
                } catch (error) {
                  setIsLoggingOut(false)
                  console.error('Logout error:', error)
                }
              }}
              className="text-on-surface-variant hover:text-red-500 hover:bg-red-500/10 dark:hover:bg-red-500/20 p-2 rounded-lg transition-all duration-150 shrink-0 cursor-pointer"
              title={tHeader('logout')}
              aria-label={tHeader('logout')}
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </aside>
      {isLoggingOut && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-card border shadow-2xl max-w-xs w-full mx-4 text-center">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-base text-on-surface">{tHeader('loggingOut', { defaultValue: 'Đang đăng xuất' })}</h3>
              <p className="text-sm text-on-surface-variant/80 dark:text-muted-foreground">{tHeader('pleaseWait', { defaultValue: 'Vui lòng chờ trong giây lát...' })}</p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
