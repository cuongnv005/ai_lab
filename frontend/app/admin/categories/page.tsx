'use client'

import React, { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, FolderOpen } from 'lucide-react'
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
import { useAdminCategories } from '@/features/admin/hooks/use-admin-categories'
import { toast } from '@/shared/lib/toast'
import type { AdminCategory, AdminCategoryCreateInput, AdminCategoryUpdateInput } from '@/features/admin/types'
import { useTranslations } from 'next-intl'

// ─── Category Form Component ────────────────────────────────────────────────

interface CategoryFormData {
  name: string
  slug: string
  description: string
}

interface CategoryFormErrors {
  name?: string
  slug?: string
}

interface CategoryFormProps {
  defaultValues?: Partial<CategoryFormData>
  mode: 'create' | 'edit'
  isSubmitting: boolean
  onSubmit: (data: CategoryFormData) => Promise<{ success: boolean; errors?: CategoryFormErrors }>
  onCancel: () => void
}

function CategoryForm({ defaultValues, mode, isSubmitting, onSubmit, onCancel }: CategoryFormProps) {
  const t = useTranslations('Admin')
  const actionT = useTranslations('action')
  const [form, setForm] = useState<CategoryFormData>(() => ({
    name: defaultValues?.name ?? '',
    slug: defaultValues?.slug ?? '',
    description: defaultValues?.description ?? '',
  }))
  const [errors, setErrors] = useState<CategoryFormErrors>({})

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')

  const handleNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      // Auto-fill slug only on create and when slug hasn't been manually edited
      ...(mode === 'create' && prev.slug === slugify(prev.name) ? { slug: slugify(name) } : {}),
    }))
    if (errors.name) setErrors((e) => ({ ...e, name: undefined }))
  }

  const validate = (): boolean => {
    const next: CategoryFormErrors = {}
    if (!form.name.trim()) next.name = t('categories.form.nameRequired')
    if (!form.slug.trim()) next.slug = t('categories.form.slugRequired')
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    const res = await onSubmit(form)
    if (!res.success && res.errors) {
      setErrors(res.errors)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div className="space-y-1">
        <label htmlFor="cat-name" className="text-xs font-medium">
          {t('categories.form.nameLabel')} <span className="text-destructive">*</span>
        </label>
        <Input
          id="cat-name"
          placeholder={`${t('categories.form.nameLabel')}...`}
          value={form.name}
          onChange={(e) => handleNameChange(e.target.value)}
          className={`text-xs h-9 ${errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}`}
          aria-invalid={!!errors.name}
        />
        {errors.name && <p className="text-[11px] text-destructive">{errors.name}</p>}
      </div>

      {/* Slug */}
      <div className="space-y-1">
        <label htmlFor="cat-slug" className="text-xs font-medium">
          {t('categories.form.slugLabel')} <span className="text-destructive">*</span>
        </label>
        <Input
          id="cat-slug"
          placeholder="ten-danh-muc"
          value={form.slug}
          onChange={(e) => {
            setForm((p) => ({ ...p, slug: e.target.value }))
            if (errors.slug) setErrors((er) => ({ ...er, slug: undefined }))
          }}
          className={`text-xs h-9 font-mono ${errors.slug ? 'border-destructive focus-visible:ring-destructive' : ''}`}
          aria-invalid={!!errors.slug}
          spellCheck={false}
        />
        {errors.slug && <p className="text-[11px] text-destructive">{errors.slug}</p>}
      </div>

      {/* Description */}
      <div className="space-y-1">
        <label htmlFor="cat-description" className="text-xs font-medium">
          {t('categories.form.descriptionLabel')}
        </label>
        <Textarea
          id="cat-description"
          placeholder={t('categories.form.descriptionPlaceholder')}
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          className="text-xs min-h-20 resize-none"
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          {actionT('cancel')}
        </Button>
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting && <Spinner className="h-3 w-3 mr-1" />}
          {mode === 'create' ? actionT('create') : actionT('save')}
        </Button>
      </DialogFooter>
    </form>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminCategoriesPage() {
  const t = useTranslations('Admin')
  const actionT = useTranslations('action')
  const { data, isLoading, isSubmitting, fetchList, create, update, delete: deleteCategory, movePosts } =
    useAdminCategories()

  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<AdminCategory | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminCategory | null>(null)
  const [targetCategoryId, setTargetCategoryId] = useState<string>('')

  useEffect(() => {
    fetchList()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async (data: { name: string; slug: string; description: string }): Promise<{ success: boolean; errors?: CategoryFormErrors }> => {
    const input: AdminCategoryCreateInput = {
      name: data.name.trim(),
      slug: data.slug.trim(),
      description: data.description.trim() || undefined,
    }
    const res = await create(input)
    if (res.success) {
      setCreateOpen(false)
      return { success: true }
    }
    return {
      success: false,
      errors: {
        name: res.errors?.name?.[0],
        slug: res.errors?.slug?.[0],
      },
    }
  }

  const handleUpdate = async (data: { name: string; slug: string; description: string }): Promise<{ success: boolean; errors?: CategoryFormErrors }> => {
    if (!editTarget) return { success: false }
    const input: AdminCategoryUpdateInput = {
      name: data.name.trim(),
      slug: data.slug.trim(),
      description: data.description.trim() || undefined,
    }
    const res = await update(editTarget.id, input)
    if (res.success) {
      setEditTarget(null)
      return { success: true }
    }
    return {
      success: false,
      errors: {
        name: res.errors?.name?.[0],
        slug: res.errors?.slug?.[0],
      },
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    if ((deleteTarget.posts_count ?? 0) > 0) {
      if (!targetCategoryId) {
        toast.error(t('categories.delete.moveError'))
        return
      }
      const moved = await movePosts(deleteTarget.id, Number(targetCategoryId))
      if (!moved) return
    }
    const ok = await deleteCategory(deleteTarget.id)
    if (ok) {
      setDeleteTarget(null)
      setTargetCategoryId('')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black tracking-tight">{t('categories.title')}</h1>
          <p className="text-xs text-muted-foreground">{t('categories.subtitle')}</p>
        </div>
        <Button
          size="sm"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          {t('categories.addCategory')}
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Spinner className="h-7 w-7" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col h-48 items-center justify-center gap-2 text-center">
            <FolderOpen className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">{t('categories.noCategories')}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              {t('categories.createFirst')}
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">{t('categories.table.name')}</TableHead>
                <TableHead className="text-xs w-48">{t('categories.table.slug')}</TableHead>
                <TableHead className="text-xs">{t('categories.table.description')}</TableHead>
                <TableHead className="text-xs w-20 text-right">{t('categories.table.posts')}</TableHead>
                <TableHead className="text-xs w-28 text-right">{t('categories.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="py-3">
                    <p className="text-xs font-medium">{category.name}</p>
                  </TableCell>
                  <TableCell className="py-3 text-xs text-muted-foreground font-mono">
                    {category.slug}
                  </TableCell>
                  <TableCell className="py-3 text-xs text-muted-foreground">
                    <p className="truncate max-w-xs">{category.description ?? '—'}</p>
                  </TableCell>
                  <TableCell className="py-3 text-xs text-right text-muted-foreground">
                    {category.posts_count ?? 0}
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditTarget(category)}
                        title={actionT('edit')}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(category)}
                        disabled={isSubmitting}
                        title={actionT('delete')}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={(open) => !open && setCreateOpen(false)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-sm">{t('categories.form.createTitle')}</DialogTitle>
            <DialogDescription className="text-xs">
              {t('categories.form.createDesc')}
            </DialogDescription>
          </DialogHeader>
          {createOpen && (
            <CategoryForm
              mode="create"
              isSubmitting={isSubmitting}
              onSubmit={handleCreate}
              onCancel={() => setCreateOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-sm">{t('categories.form.editTitle')}</DialogTitle>
            <DialogDescription className="text-xs">
              {t('categories.form.editDesc', { name: editTarget?.name ?? '' })}
            </DialogDescription>
          </DialogHeader>
          {editTarget && (
            <CategoryForm
              mode="edit"
              defaultValues={{
                name: editTarget.name,
                slug: editTarget.slug,
                description: editTarget.description ?? '',
              }}
              isSubmitting={isSubmitting}
              onSubmit={handleUpdate}
              onCancel={() => setEditTarget(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null)
            setTargetCategoryId('')
          }
        }}
      >
        {deleteTarget && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-sm">{t('categories.delete.title')}</DialogTitle>
              <DialogDescription className="text-xs">
                {t('categories.delete.confirm', { name: deleteTarget.name })}
                {(deleteTarget.posts_count ?? 0) > 0 && (
                  <span className="text-rose-500 block mt-2 font-medium">
                    {t('categories.delete.warnHasPosts', { count: deleteTarget.posts_count ?? 0 })}
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>

            {(deleteTarget.posts_count ?? 0) > 0 && (
              <div className="space-y-2 py-3 border-t border-b border-border my-2">
                <label className="text-xs font-semibold text-foreground/80 block">
                  {t('categories.form.moveTitle')}
                </label>
                <Select
                  value={targetCategoryId}
                  onValueChange={(val) => setTargetCategoryId(Array.isArray(val) ? val[0] || '' : val || '')}
                >
                  <SelectTrigger className="w-full text-xs h-9">
                    <SelectValue placeholder={t('categories.delete.movePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {data
                      .filter((c) => c.id !== deleteTarget.id)
                      .map((c) => (
                        <SelectItem key={c.id} value={String(c.id)} className="text-xs">
                          {c.name} ({c.posts_count ?? 0} {t('categories.table.posts')})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDeleteTarget(null)
                  setTargetCategoryId('')
                }}
              >
                {actionT('cancel')}
              </Button>
              <Button
                variant="default"
                tone="destructive"
                size="sm"
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting && <Spinner className="h-3 w-3 mr-1" />}
                {(deleteTarget.posts_count ?? 0) > 0 ? t('categories.delete.moveAndDelete', { defaultValue: 'Di chuyển và Xóa' }) : actionT('delete')}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
