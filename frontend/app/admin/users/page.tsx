'use client'

import React, { useEffect, useState } from 'react'
import { Search, Shield, ShieldOff, Trash2, ChevronDown, Eye } from 'lucide-react'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@bks/ds-system-sdk/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@bks/ds-system-sdk/components/ui/dialog'
import { Button } from '@bks/ds-system-sdk/components/ui/button'
import { Badge } from '@bks/ds-system-sdk/components/ui/badge'
import { Spinner } from '@bks/ds-system-sdk/components/ui/spinner'
import { Input } from '@bks/ds-system-sdk/components/ui/input'
import { Textarea } from '@bks/ds-system-sdk/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@bks/ds-system-sdk/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@bks/ds-system-sdk/components/ui/dropdown-menu'
import { useAdminUsers } from '@/features/admin/hooks/use-admin-users'
import type { AdminUser, AdminUserFilters } from '@/features/admin/types'
import { formatDateTime } from '@/shared/lib/format-datetime'
import { cn } from '@/shared/lib/utils'
import { useTranslations } from 'next-intl'

function StatusBadge({ status, label }: { status: number; label: string }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold border',
        status === 1
          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
          : 'bg-rose-500/10 text-rose-500 border-rose-500/20',
      )}
    >
      {label}
    </span>
  )
}

const ROLE_BADGE_COLORS: Record<string, string> = {
  admin: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
  moderator: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  member: 'bg-muted text-muted-foreground',
}

export default function AdminUsersPage() {
  const t = useTranslations('Admin')
  const commonT = useTranslations('Common')
  const { data, pagination, isLoading, isSubmitting, filters, setFilters, fetchList, changeRole, ban, unban, delete: deleteUser } =
    useAdminUsers()

  const [banTarget, setBanTarget] = useState<AdminUser | null>(null)
  const [banReason, setBanReason] = useState('')
  const [banError, setBanError] = useState('')
  const [search, setSearch] = useState('')
  const [viewBanReasonTarget, setViewBanReasonTarget] = useState<AdminUser | null>(null)

  useEffect(() => {
    fetchList({ page: 1, per_page: 10 })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    const next = { ...filters, search, page: 1 }
    setFilters(next)
    fetchList(next)
  }

  const handleFilterChange = (key: keyof AdminUserFilters, value: string | string[] | undefined) => {
    const valStr = typeof value === 'string' ? value : ''
    const next = { ...filters, [key]: valStr === 'all' ? '' : valStr, page: 1 }
    setFilters(next)
    fetchList(next)
  }

  const handlePageChange = (page: number) => {
    const next = { ...filters, page }
    setFilters(next)
    fetchList(next)
  }

  const handleBanSubmit = async () => {
    if (banReason.trim().length < 10) {
      setBanError(t('users.ban.errorMin'))
      return
    }
    if (!banTarget) return
    const ok = await ban(banTarget.id, { reason: banReason.trim() })
    if (ok) {
      setBanTarget(null)
      setBanReason('')
      setBanError('')
    }
  }

  const roleLabels: Record<string, string> = {
    admin: t('users.role.admin'),
    moderator: t('users.role.moderator'),
    member: t('users.role.member'),
  }

  const statusLabels: Record<number, string> = {
    1: t('users.status.active'),
    2: t('users.status.banned'),
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black tracking-tight">{t('users.title')}</h1>
        <p className="text-xs text-muted-foreground">{t('users.subtitle')}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder={t('users.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-9 text-xs h-9"
          />
        </div>
        <Select value={filters.role ?? 'all'} onValueChange={(v) => handleFilterChange('role', v)}>
          <SelectTrigger className="h-9 w-36 text-xs">
            <SelectValue placeholder={t('users.table.role')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('users.role.all')}</SelectItem>
            <SelectItem value="admin">{t('users.role.admin')}</SelectItem>
            <SelectItem value="moderator">{t('users.role.moderator')}</SelectItem>
            <SelectItem value="member">{t('users.role.member')}</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.status ?? 'all'}
          onValueChange={(v) => handleFilterChange('status', v)}
        >
          <SelectTrigger className="h-9 w-36 text-xs">
            <SelectValue placeholder={t('users.table.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('users.status.all')}</SelectItem>
            <SelectItem value="active">{t('users.status.active')}</SelectItem>
            <SelectItem value="banned">{t('users.status.banned')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden min-h-[570px] flex flex-col">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Spinner className="h-7 w-7" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-muted-foreground">{t('users.noUsers', { defaultValue: 'Không tìm thấy thành viên nào.' })}</p>
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">{t('users.table.name')}</TableHead>
                <TableHead className="text-xs">{t('users.table.email')}</TableHead>
                <TableHead className="text-xs w-32">{t('users.table.role')}</TableHead>
                <TableHead className="text-xs w-28">{t('users.table.status')}</TableHead>
                <TableHead className="text-xs w-36">{t('users.table.joinedAt')}</TableHead>
                <TableHead className="text-xs w-20 text-right">{t('users.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-[10px] font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-xs text-muted-foreground">{user.email}</TableCell>
                  <TableCell className="py-3">
                    <span
                      className={cn(
                        'inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium',
                        ROLE_BADGE_COLORS[user.role] ?? '',
                      )}
                    >
                      {roleLabels[user.role] ?? user.role}
                    </span>
                  </TableCell>
                   <TableCell className="py-3">
                    <div className="flex items-center gap-1.5">
                      <StatusBadge status={user.status} label={statusLabels[user.status] ?? String(user.status)} />
                      {user.status === 2 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-muted"
                          title={t('users.actions.viewBanReason')}
                          onClick={() => setViewBanReasonTarget(user)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-[10px] text-muted-foreground">
                    {formatDateTime(user.created_at)}
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="sm" />}>
                        <ChevronDown className="h-3.5 w-3.5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {user.status === 1 && user.role !== 'admin' && (
                          <DropdownMenuItem
                            onClick={() => changeRole(user.id, { role: 'admin' })}
                            disabled={isSubmitting}
                          >
                            <Shield className="h-3.5 w-3.5 mr-2" />
                            {t('users.actions.makeAdmin')}
                          </DropdownMenuItem>
                        )}
                        {user.status === 1 && user.role !== 'moderator' && (
                          <DropdownMenuItem
                            onClick={() => changeRole(user.id, { role: 'moderator' })}
                            disabled={isSubmitting}
                          >
                            <Shield className="h-3.5 w-3.5 mr-2" />
                            {t('users.actions.makeMod')}
                          </DropdownMenuItem>
                        )}
                        {user.status === 1 && user.role !== 'member' && (
                          <DropdownMenuItem
                            onClick={() => changeRole(user.id, { role: 'member' })}
                            disabled={isSubmitting}
                          >
                            <Shield className="h-3.5 w-3.5 mr-2" />
                            {t('users.actions.makeMember')}
                          </DropdownMenuItem>
                        )}
                        {user.status === 1 && user.role !== 'admin' ? (
                          <DropdownMenuItem
                            onClick={() => {
                              setBanTarget(user)
                              setBanReason('')
                              setBanError('')
                            }}
                            disabled={isSubmitting}
                          >
                            <ShieldOff className="h-3.5 w-3.5 mr-2 text-rose-500" />
                            <span className="text-rose-500">{t('users.actions.ban')}</span>
                          </DropdownMenuItem>
                        ) : user.status === 2 ? (
                          <DropdownMenuItem onClick={() => unban(user.id)} disabled={isSubmitting}>
                            <Shield className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                            <span className="text-emerald-500">{t('users.actions.unban')}</span>
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuItem
                          onClick={() => deleteUser(user.id)}
                          disabled={isSubmitting}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2 text-destructive" />
                          <span className="text-destructive">{t('users.actions.delete')}</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.lastPage > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{t('users.totalUsers', { total: pagination.total })}</span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              {commonT('prev')}
            </Button>
            <span className="flex items-center px-3">
              {pagination.page} / {pagination.lastPage}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.lastPage}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              {commonT('next')}
            </Button>
          </div>
        </div>
      )}

      {/* Ban dialog */}
      <Dialog open={!!banTarget} onOpenChange={(open) => !open && setBanTarget(null)}>
        {banTarget && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-sm">{t('users.ban.title')}</DialogTitle>
              <DialogDescription className="text-xs">
                {t('users.ban.desc', { name: banTarget.name })}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Textarea
                id="ban-reason"
                placeholder={t('users.ban.placeholder')}
                value={banReason}
                onChange={(e) => {
                  setBanReason(e.target.value)
                  setBanError('')
                }}
                className="text-xs min-h-20 resize-none"
              />
              {banError && <p className="text-xs text-destructive">{banError}</p>}
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setBanTarget(null)}>
                {commonT('cancel')}
              </Button>
              <Button
                variant="default"
                tone="destructive"
                size="sm"
                onClick={handleBanSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting && <Spinner className="h-3 w-3 mr-1" />}
                {t('users.actions.ban')}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
      {/* View Ban Reason Dialog */}
      <Dialog open={!!viewBanReasonTarget} onOpenChange={(open) => !open && setViewBanReasonTarget(null)}>
        {viewBanReasonTarget && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-sm">{t('users.banReason.title')}</DialogTitle>
              <DialogDescription className="text-xs">
                {t('users.banReason.desc', { name: viewBanReasonTarget.name })}
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-lg bg-muted/50 border p-3 text-xs leading-relaxed text-foreground/80 break-words whitespace-pre-wrap">
              {viewBanReasonTarget.ban_reason || t('users.banReason.default')}
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setViewBanReasonTarget(null)}>
                {commonT('close')}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
