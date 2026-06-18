'use client'

import React, { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Eye, Search, Filter } from 'lucide-react'
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
  DialogFooter,
  DialogDescription,
} from '@bks/ds-system-sdk/components/ui/dialog'
import { Button } from '@bks/ds-system-sdk/components/ui/button'
import { Badge } from '@bks/ds-system-sdk/components/ui/badge'
import { Spinner } from '@bks/ds-system-sdk/components/ui/spinner'
import { Textarea } from '@bks/ds-system-sdk/components/ui/textarea'
import { Input } from '@bks/ds-system-sdk/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@bks/ds-system-sdk/components/ui/tabs'
import { useAdminApproval } from '@/features/admin/hooks/use-admin-approval'
import type { AdminPendingPost } from '@/features/admin/types'
import { formatDateTime } from '@/shared/lib/format-datetime'
import { renderBBCode } from '@/shared/lib/bbcode'
import { useTranslations } from 'next-intl'

export default function ApprovalQueuePage() {
  const t = useTranslations('Admin')
  const commonT = useTranslations('Common')
  const { data, pagination, isLoading, isSubmitting, filters, setFilters, activeTab, setActiveTab, fetchList, approve, reject } =
    useAdminApproval()

  const [rejectTarget, setRejectTarget] = useState<AdminPendingPost | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectError, setRejectError] = useState('')
  const [viewTarget, setViewTarget] = useState<AdminPendingPost | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchList({ page: 1, per_page: 10 })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    const next = { ...filters, search, page: 1 }
    setFilters(next)
    fetchList(next, activeTab)
  }

  const handleTabChange = (value: 'pending' | 'published' | 'rejected') => {
    setActiveTab(value)
    const next = { ...filters, page: 1 }
    setFilters(next)
    fetchList(next, value)
  }

  const handleApprove = async (id: number) => {
    await approve(id)
  }

  const handleRejectSubmit = async () => {
    if (rejectReason.trim().length < 10) {
      setRejectError(t('approval.rejectMinLength'))
      return
    }
    if (!rejectTarget) return
    const ok = await reject(rejectTarget.id, rejectReason.trim())
    if (ok) {
      setRejectTarget(null)
      setRejectReason('')
      setRejectError('')
    }
  }

  const handlePageChange = (page: number) => {
    const next = { ...filters, page }
    setFilters(next)
    fetchList(next, activeTab)
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black tracking-tight">{t('approval.title')}</h1>
        <p className="text-xs text-muted-foreground">{t('approval.subtitle')}</p>
      </div>

      <Tabs value={activeTab} onValueChange={(val) => handleTabChange(val as 'pending' | 'published' | 'rejected')}>
        <TabsList>
          <TabsTrigger value="pending">{t('approval.tabs.pending')}</TabsTrigger>
          <TabsTrigger value="published">{t('approval.tabs.published')}</TabsTrigger>
          <TabsTrigger value="rejected">{t('approval.tabs.rejected')}</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder={t('approval.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-9 text-xs h-9"
          />
        </div>
        <Button variant="outline" size="sm" onClick={handleSearch}>
          <Filter className="h-3.5 w-3.5" />
          {t('approval.filter')}
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden min-h-[570px] flex flex-col">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Spinner className="h-7 w-7" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center gap-2">
            <CheckCircle className="h-10 w-10 text-emerald-500/60" />
            <p className="text-sm font-medium text-muted-foreground">
              {activeTab === 'pending'
                ? t('approval.noPending')
                : activeTab === 'published'
                ? t('approval.noPublished')
                : t('approval.noRejected')}
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">{t('approval.table.title')}</TableHead>
                <TableHead className="text-xs w-36">{t('approval.table.author')}</TableHead>
                <TableHead className="text-xs w-32">{t('approval.table.category')}</TableHead>
                <TableHead className="text-xs w-36">{t('approval.table.createdAt')}</TableHead>
                {activeTab === 'rejected' && (
                  <TableHead className="text-xs w-48">{t('approval.table.rejectReason')}</TableHead>
                )}
                <TableHead className="text-xs w-32 text-right">
                  {activeTab === 'pending' ? t('approval.table.actions') : t('approval.table.view')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="py-3">
                    <p className="text-xs font-medium truncate max-w-xs md:max-w-md lg:max-w-lg xl:max-w-2xl" title={post.title}>{post.title}</p>
                  </TableCell>
                  <TableCell className="py-3 text-xs text-muted-foreground">
                    {post.user?.name ?? '—'}
                  </TableCell>
                  <TableCell className="py-3">
                    {post.category ? (
                      <Badge variant="secondary" className="text-[10px]">
                        {post.category.name}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="py-3 text-[10px] text-muted-foreground">
                    {formatDateTime(post.created_at)}
                  </TableCell>
                  {activeTab === 'rejected' && (
                    <TableCell className="py-3 text-xs text-rose-500 max-w-48 xl:max-w-sm truncate" title={post.reject_reason || ''}>
                      {post.reject_reason || '—'}
                    </TableCell>
                  )}
                  <TableCell className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewTarget(post)}
                        title={t('approval.preview')}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      {activeTab === 'pending' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleApprove(post.id)}
                            disabled={isSubmitting}
                            title={t('approval.approve')}
                          >
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setRejectTarget(post)
                              setRejectReason('')
                              setRejectError('')
                            }}
                            disabled={isSubmitting}
                            title={t('approval.reject')}
                          >
                            <XCircle className="h-3.5 w-3.5 text-rose-500" />
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
          <span>{t('approval.totalPosts', { total: pagination.total })}</span>
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

      {/* Preview Dialog */}
      <Dialog open={!!viewTarget} onOpenChange={(open) => !open && setViewTarget(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[75vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-sm pr-6">{viewTarget?.title}</DialogTitle>
            <DialogDescription className="text-xs">
              Bởi {viewTarget?.user?.name} · {viewTarget?.category?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 text-sm leading-relaxed text-foreground/80 pr-1">
            {renderBBCode(viewTarget?.content || '')}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setViewTarget(null)}>
              {commonT('close')}
            </Button>
            {activeTab === 'pending' && (
              <Button
                size="sm"
                onClick={async () => {
                  if (viewTarget) {
                    await handleApprove(viewTarget.id)
                    setViewTarget(null)
                  }
                }}
                disabled={isSubmitting}
              >
                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                {t('approval.approve')}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
        {rejectTarget && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-sm">{t('approval.rejectTitle')}</DialogTitle>
              <DialogDescription className="text-xs">
                {t('approval.rejectDesc', { title: rejectTarget.title })}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Textarea
                id="reject-reason"
                placeholder={t('approval.rejectPlaceholder')}
                value={rejectReason}
                onChange={(e) => {
                  setRejectReason(e.target.value)
                  setRejectError('')
                }}
                className="text-xs min-h-24 resize-none"
              />
              {rejectError && <p className="text-xs text-destructive">{rejectError}</p>}
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setRejectTarget(null)}>
                {commonT('cancel')}
              </Button>
              <Button
                variant="default"
                tone="destructive"
                size="sm"
                onClick={handleRejectSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? <Spinner className="h-3 w-3 mr-1" /> : null}
                {t('approval.reject')}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
