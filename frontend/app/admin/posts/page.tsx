'use client'

import React, { useEffect, useState } from 'react'
import { Search, Trash2, Eye, EyeOff, RotateCcw, FileText, Edit } from 'lucide-react'
import { useRouter } from 'next/navigation'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@bks/ds-system-sdk/components/ui/select'
import { useAdminPosts } from '@/features/admin/hooks/use-admin-posts'
import type { AdminPost, AdminPostFilters, AdminPostStatus } from '@/features/admin/types'
import { formatDateTime } from '@/shared/lib/format-datetime'
import { cn } from '@/shared/lib/utils'
import { renderBBCode } from '@/shared/lib/bbcode'
import { useTranslations } from 'next-intl'

const POST_STATUS_CLASSES: Record<number, string> = {
  1: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  2: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  3: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  4: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  5: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20',
}

export default function AdminPostsPage() {
  const t = useTranslations('Admin')
  const commonT = useTranslations('Common')
  const actionT = useTranslations('action')

  const { data, pagination, isLoading, isSubmitting, filters, setFilters, fetchList, delete: deletePost, restore: restorePost, forceDelete: forceDeletePost } =
    useAdminPosts()
  const router = useRouter()

  const [deleteTarget, setDeleteTarget] = useState<AdminPost | null>(null)
  const [hideTarget, setHideTarget] = useState<AdminPost | null>(null)
  const [hideWarning, setHideWarning] = useState<string | null>(null)
  const [restoreTarget, setRestoreTarget] = useState<AdminPost | null>(null)
  const [viewTarget, setViewTarget] = useState<AdminPost | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchList({ page: 1, per_page: 10 })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    const next: AdminPostFilters = { ...filters, search, page: 1 }
    setFilters(next)
    fetchList(next)
  }

  const handleStatusFilter = (value: string | string[] | undefined) => {
    const valStr = typeof value === 'string' ? value : ''
    const next: AdminPostFilters = {
      ...filters,
      status: valStr === 'all' || !valStr ? undefined : (valStr as AdminPostStatus),
      page: 1,
    }
    setFilters(next)
    fetchList(next)
  }

  const handlePageChange = (page: number) => {
    const next: AdminPostFilters = { ...filters, page }
    setFilters(next)
    fetchList(next)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    const success = await forceDeletePost(deleteTarget.id)
    if (success) {
      setDeleteTarget(null)
    }
  }

  const handleHideConfirm = async () => {
    if (!hideTarget) return
    const res = await deletePost(hideTarget.id, true)
    if (res.success) {
      setHideTarget(null)
      setHideWarning(null)
    }
  }

  const handleRestoreConfirm = async () => {
    if (!restoreTarget) return
    const success = await restorePost(restoreTarget.id)
    if (success) {
      setRestoreTarget(null)
    }
  }

  const statusLabels: Record<number, string> = {
    1: t('posts.status.pending'),
    2: t('posts.status.published'),
    3: t('posts.status.rejected'),
    4: t('posts.status.approved'),
    5: t('posts.status.deleted'),
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black tracking-tight">{t('posts.title')}</h1>
        <p className="text-xs text-muted-foreground">{t('posts.subtitle')}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            id="posts-search"
            placeholder={t('posts.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-9 text-xs h-9"
            spellCheck={false}
          />
        </div>
        <Select
          value={filters.status ?? 'all'}
          onValueChange={handleStatusFilter}
        >
          <SelectTrigger id="posts-status-filter" className="h-9 w-36 text-xs">
            <SelectValue placeholder={t('posts.table.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('posts.status.all')}</SelectItem>
            <SelectItem value="pending">{t('posts.status.pending')}</SelectItem>
            <SelectItem value="published">{t('posts.status.published')}</SelectItem>
            <SelectItem value="rejected">{t('posts.status.rejected')}</SelectItem>
            <SelectItem value="deleted">{t('posts.status.deleted')}</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={handleSearch}>
          {t('posts.filter')}
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden min-h-[570px] flex flex-col">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Spinner className="h-7 w-7" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-1 flex-col h-48 items-center justify-center gap-2 text-center">
            <FileText className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">{t('posts.noPosts')}</p>
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">{t('posts.table.title')}</TableHead>
                  <TableHead className="text-xs w-36">{t('posts.table.author')}</TableHead>
                  <TableHead className="text-xs w-32">{t('posts.table.category')}</TableHead>
                  <TableHead className="text-xs w-24">{t('posts.table.status')}</TableHead>
                  <TableHead className="text-xs w-16 text-right">{t('posts.table.views')}</TableHead>
                  <TableHead className="text-xs w-36">{t('posts.table.createdAt')}</TableHead>
                  <TableHead className="text-xs w-24 text-right">{t('posts.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((post) => {
                  const statusLabel = statusLabels[post.status] ?? t('posts.status.unknown')
                  const className = POST_STATUS_CLASSES[post.status] ?? 'bg-muted text-muted-foreground'
                  return (
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
                      <TableCell className="py-3">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium',
                            className,
                          )}
                        >
                          {statusLabel}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 text-xs text-right text-muted-foreground">
                        {(post.views_count ?? 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="py-3 text-[10px] text-muted-foreground">
                        {formatDateTime(post.created_at)}
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewTarget(post)}
                            title={t('posts.actions.preview')}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/dashboard/posts/${post.id}/edit`)}
                            title={t('posts.actions.edit')}
                          >
                            <Edit className="h-3.5 w-3.5 text-blue-500" />
                          </Button>
                          {post.status === 5 ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setRestoreTarget(post)}
                              disabled={isSubmitting}
                              title={t('posts.actions.show')}
                            >
                              <RotateCcw className="h-3.5 w-3.5 text-emerald-600" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setHideTarget(post)}
                              disabled={isSubmitting}
                              title={t('posts.actions.hide')}
                            >
                              <EyeOff className="h-3.5 w-3.5 text-amber-500" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(post)}
                            disabled={isSubmitting}
                            title={t('posts.actions.delete')}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.lastPage > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{t('posts.totalPosts', { total: pagination.total })}</span>
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
              Bởi {viewTarget?.user?.name ?? '—'} · {viewTarget?.category?.name ?? '—'}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 text-sm leading-relaxed text-foreground/80 pr-1 custom-scrollbar">
            {renderBBCode(viewTarget?.content || '')}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setViewTarget(null)}>
              {commonT('close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null)
          }
        }}
      >
        {deleteTarget && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-sm">{t('posts.deleteConfirm.title')}</DialogTitle>
              <DialogDescription className="text-xs">
                {t('posts.deleteConfirm.desc', { title: deleteTarget.title })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDeleteTarget(null)
                }}
              >
                {commonT('cancel')}
              </Button>
              <Button
                variant="default"
                tone="destructive"
                size="sm"
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting && <Spinner className="h-3 w-3 mr-1" />}
                {t('posts.actions.delete')}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
      
      {/* Hide Confirm Dialog */}
      <Dialog
        open={!!hideTarget}
        onOpenChange={(open) => {
          if (!open) {
            setHideTarget(null)
            setHideWarning(null)
          }
        }}
      >
        {hideTarget && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-sm">{t('posts.hideConfirm.title')}</DialogTitle>
              <DialogDescription className="text-xs">
                {hideWarning ? (
                  <span className="text-rose-500 font-semibold">{hideWarning}</span>
                ) : (
                  t('posts.hideConfirm.desc', { title: hideTarget.title })
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setHideTarget(null)
                  setHideWarning(null)
                }}
              >
                {commonT('cancel')}
              </Button>
              <Button
                variant="default"
                tone="destructive"
                size="sm"
                onClick={handleHideConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting && <Spinner className="h-3 w-3 mr-1" />}
                {hideWarning ? t('posts.actions.hide') : t('posts.actions.hide')}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Restore Confirm Dialog */}
      <Dialog
        open={!!restoreTarget}
        onOpenChange={(open) => !open && setRestoreTarget(null)}
      >
        {restoreTarget && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-sm">{t('posts.restoreConfirm.title')}</DialogTitle>
              <DialogDescription className="text-xs">
                {t('posts.restoreConfirm.desc', { title: restoreTarget.title })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRestoreTarget(null)}
              >
                {commonT('cancel')}
              </Button>
              <Button
                variant="default"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleRestoreConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting && <Spinner className="h-3 w-3 mr-1" />}
                {t('posts.actions.show')}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
