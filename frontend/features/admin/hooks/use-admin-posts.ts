'use client'

import { useState, useCallback } from 'react'
import { toast } from '@/shared/lib/toast'
import { useTranslations } from 'next-intl'
import type { ResponseData } from '@/shared/types/common'
import type {
  AdminPost,
  AdminPostFilters,
  AdminPaginatedResponse,
  AdminPostCreateInput,
  AdminPostUpdateInput,
} from '../types'
import { adminPostsRepository } from '../services/admin-posts.repository'

export function useAdminPosts() {
  const t = useTranslations('Admin')
  const [data, setData] = useState<AdminPost[]>([])
  const [pagination, setPagination] = useState({ page: 1, lastPage: 1, total: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filters, setFilters] = useState<AdminPostFilters>({ page: 1, per_page: 10 })

  const fetchList = useCallback(
    async (f: AdminPostFilters = filters) => {
      setIsLoading(true)
      try {
        const res: AdminPaginatedResponse<AdminPost> = await adminPostsRepository.list(f)
        setData(res.data)
        const pageInfo = (res.pagination || res) as any
        setPagination({
          page: pageInfo.current_page || 1,
          lastPage: pageInfo.last_page || pageInfo.total_page || 1,
          total: pageInfo.total || 0,
        })
      } catch {
        // bubble
      } finally {
        setIsLoading(false)
      }
    },
    [filters],
  )

  const create = useCallback(
    async (input: AdminPostCreateInput): Promise<boolean> => {
      setIsSubmitting(true)
      try {
        const res = await adminPostsRepository.create(input)
        toast.success(res.message)
        await fetchList()
        return true
      } catch (err: any) {
        toast.error(err.response?.data?.message || err.message || t('posts.toastCreateError'))
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [fetchList, t],
  )

  const update = useCallback(
    async (id: number, input: AdminPostUpdateInput): Promise<boolean> => {
      setIsSubmitting(true)
      try {
        const res = await adminPostsRepository.update(id, input)
        toast.success(res.message)
        await fetchList()
        return true
      } catch (err: any) {
        toast.error(err.response?.data?.message || err.message || t('posts.toastUpdateError'))
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [fetchList, t],
  )

  const remove = useCallback(
    async (id: number, confirm?: boolean): Promise<{ success: boolean; warning?: string }> => {
      setIsSubmitting(true)
      try {
        const res = await adminPostsRepository.delete(id, confirm)
        toast.success(res.message)
        await fetchList()
        return { success: true }
      } catch (err: any) {
        const errors = err.response?.data?.errors
        if (errors && errors.confirm) {
          return { success: false, warning: errors.confirm[0] }
        }
        toast.error(err.response?.data?.message || err.message || t('posts.toastDeleteError'))
        return { success: false }
      } finally {
        setIsSubmitting(false)
      }
    },
    [fetchList, t],
  )

  const restore = useCallback(
    async (id: number): Promise<boolean> => {
      setIsSubmitting(true)
      try {
        const res = await adminPostsRepository.restore(id)
        toast.success(res.message)
        await fetchList()
        return true
      } catch (err: any) {
        toast.error(err.response?.data?.message || err.message || t('posts.toastRestoreError'))
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [fetchList, t],
  )

  const forceDelete = useCallback(
    async (id: number): Promise<boolean> => {
      setIsSubmitting(true)
      try {
        const res = await adminPostsRepository.forceDelete(id)
        toast.success(res.message)
        await fetchList()
        return true
      } catch (err: any) {
        toast.error(err.response?.data?.message || err.message || t('posts.toastForceDeleteError'))
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [fetchList, t],
  )

  return {
    data,
    pagination,
    isLoading,
    isSubmitting,
    filters,
    setFilters,
    fetchList,
    create,
    update,
    delete: remove,
    restore,
    forceDelete,
  }
}
