'use client'

import React, { useEffect, useState } from 'react'
import { ShieldCheck, ShieldX, Eye, X } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@bks/ds-system-sdk/components/ui/select'
import { useAdminReports } from '@/features/admin/hooks/use-admin-reports'
import type { AdminReport, AdminReportFilters } from '@/features/admin/types'
import { formatDateTime } from '@/shared/lib/format-datetime'
import { cn } from '@/shared/lib/utils'
import { useTranslations } from 'next-intl'

import { REPORT_STATUS_COLORS } from '@/shared/constants/status'

export default function AdminReportsPage() {
  const t = useTranslations('Admin')
  const commonT = useTranslations('Common')
  const actionT = useTranslations('action')

  const { data, pagination, isLoading, isSubmitting, filters, setFilters, fetchList, resolve, dismiss } =
    useAdminReports()

  const [viewTarget, setViewTarget] = useState<AdminReport | null>(null)
  const [resolveTarget, setResolveTarget] = useState<AdminReport | null>(null)
  const [dismissTarget, setDismissTarget] = useState<AdminReport | null>(null)

  const handleResolveConfirm = async () => {
    if (!resolveTarget) return
    await resolve(resolveTarget.id)
    setResolveTarget(null)
  }

  const handleDismissConfirm = async () => {
    if (!dismissTarget) return
    await dismiss(dismissTarget.id)
    setDismissTarget(null)
  }

  useEffect(() => {
    fetchList({ page: 1, per_page: 10 })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = (key: keyof AdminReportFilters, value: string | string[] | undefined) => {
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

  const handleClearFilters = () => {
    const next = { ...filters, status: undefined, type: undefined, page: 1 }
    setFilters(next)
    fetchList(next)
  }

  const statusLabels: Record<number, string> = {
    1: t('reports.status.pending'),
    2: t('reports.status.resolved'),
    3: t('reports.status.dismissed'),
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black tracking-tight">{t('reports.title')}</h1>
        <p className="text-xs text-muted-foreground">{t('reports.subtitle')}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filters.status ?? 'all'}
          onValueChange={(v) => handleFilterChange('status', v)}
        >
          <SelectTrigger className="h-9 w-36 text-xs">
            <SelectValue placeholder={t('reports.table.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('reports.status.all')}</SelectItem>
            <SelectItem value="pending">{t('reports.status.pending')}</SelectItem>
            <SelectItem value="resolved">{t('reports.status.resolved')}</SelectItem>
            <SelectItem value="dismissed">{t('reports.status.dismissed')}</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.type ?? 'all'}
          onValueChange={(v) => handleFilterChange('type', v)}
        >
          <SelectTrigger className="h-9 w-36 text-xs">
            <SelectValue placeholder={t('reports.table.type')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('reports.type.all')}</SelectItem>
            <SelectItem value="post">{t('reports.type.post')}</SelectItem>
            <SelectItem value="comment">{t('reports.type.comment')}</SelectItem>
          </SelectContent>
        </Select>

        {(filters.status || filters.type) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-9 text-xs gap-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
            {t('reports.clearFilters')}
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden min-h-[570px] flex flex-col">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Spinner className="h-7 w-7" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
            <ShieldCheck className="h-10 w-10 text-emerald-500/60" />
            <p className="text-sm text-muted-foreground">{t('reports.noReports')}</p>
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">{t('reports.table.reporter')}</TableHead>
                <TableHead className="text-xs">{t('reports.table.type')}</TableHead>
                <TableHead className="text-xs">{t('reports.table.reason')}</TableHead>
                <TableHead className="text-xs">{t('reports.table.status')}</TableHead>
                <TableHead className="text-xs w-40">{t('reports.table.createdAt')}</TableHead>
                <TableHead className="text-xs w-28 text-right">{t('reports.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="py-3 text-xs">{report.reporter?.name ?? '—'}</TableCell>
                  <TableCell className="py-3">
                    <Badge variant="outline" className="text-[10px]">
                      {report.reportable_type === 'post' ? t('reports.type.post') : t('reports.type.comment')}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 text-xs text-muted-foreground max-w-xs truncate">
                    {report.reason}
                  </TableCell>
                  <TableCell className="py-3">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium',
                        REPORT_STATUS_COLORS[report.status] ?? '',
                      )}
                    >
                      {statusLabels[report.status] ?? report.status}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 text-[10px] text-muted-foreground">
                    {formatDateTime(report.created_at)}
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewTarget(report)}
                        title={t('reports.actions.view')}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      {report.status === 1 && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setResolveTarget(report)}
                            disabled={isSubmitting}
                            title={t('reports.actions.resolve')}
                          >
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDismissTarget(report)}
                            disabled={isSubmitting}
                            title={t('reports.actions.dismiss')}
                          >
                            <ShieldX className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </>
                      )}
                    </div>
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
          <span>{t('reports.totalReports', { total: pagination.total })}</span>
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

      {/* Detail Dialog */}
      <Dialog open={!!viewTarget} onOpenChange={(open) => !open && setViewTarget(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm pr-6">{t('reports.detail.title', { id: viewTarget?.id ?? 0 })}</DialogTitle>
            <DialogDescription className="text-xs">
              {t('reports.detail.subtitle', { reporter: viewTarget?.reporter?.name ?? '', date: viewTarget ? formatDateTime(viewTarget.created_at) : '' })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-xs">
            <div>
              <p className="font-semibold text-muted-foreground mb-1">
                {t('reports.detail.reportedContent', { type: viewTarget?.reportable_type === 'post' ? t('reports.type.post') : t('reports.type.comment') })}
              </p>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-foreground/80">
                  {viewTarget?.reportable?.content || viewTarget?.reportable?.title || t('reports.detail.noContent')}
                </p>
                {viewTarget?.reportable?.author && (
                  <p className="text-muted-foreground mt-1">— {viewTarget.reportable.author.name}</p>
                )}
              </div>
            </div>
            <div>
              <p className="font-semibold text-muted-foreground mb-1">{t('reports.detail.reason')}</p>
              <p>{viewTarget?.reason}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setViewTarget(null)}>
              {commonT('close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Resolve Confirm Dialog */}
      <Dialog open={!!resolveTarget} onOpenChange={(open) => !open && setResolveTarget(null)}>
        {resolveTarget && (
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-sm">{t('reports.resolveConfirm.title')}</DialogTitle>
              <DialogDescription className="text-xs">
                {t('reports.resolveConfirm.desc', { type: resolveTarget.reportable_type === 'post' ? t('reports.type.post') : t('reports.type.comment') })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setResolveTarget(null)}>
                {commonT('cancel')}
              </Button>
              <Button
                variant="default"
                tone="destructive"
                size="sm"
                onClick={handleResolveConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting && <Spinner className="h-3 w-3 mr-1" />}
                {t('reports.actions.resolve')}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Dismiss Confirm Dialog */}
      <Dialog open={!!dismissTarget} onOpenChange={(open) => !open && setDismissTarget(null)}>
        {dismissTarget && (
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-sm">{t('reports.dismissConfirm.title')}</DialogTitle>
              <DialogDescription className="text-xs">
                {t('reports.dismissConfirm.desc')}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setDismissTarget(null)}>
                {commonT('cancel')}
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleDismissConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting && <Spinner className="h-3 w-3 mr-1" />}
                {t('reports.actions.dismiss')}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
