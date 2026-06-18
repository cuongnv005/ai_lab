'use client'

import React from 'react'
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
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/shared/lib/utils'
import { useAuthStore } from '@/features/auth'

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
  const pathname = usePathname()
  const { user } = useAuthStore()
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
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo / Brand */}
        <div className="flex h-14 items-center justify-between border-b border-border px-6">
          <Link href="/admin/dashboard" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight leading-none">{t('sidebar.brandTitle')}</p>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">{t('sidebar.brandSubtitle')}</p>
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
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
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
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 select-none',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-primary' : '')} />
                <span>{t(`sidebar.${item.id}`)}</span>
              </Link>
            )
          })}
        </nav>

        {/* User Footer */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase() ?? 'A'}
            </div>
            <div className="flex-1 truncate">
              <p className="text-xs font-semibold truncate">{user?.name ?? 'Admin'}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email ?? ''}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
