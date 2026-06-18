'use client'

import { useState, useCallback } from 'react'
import { toast } from '@/shared/lib/toast'
import { useTranslations } from 'next-intl'
import type { ResponseData } from '@/shared/types/common'
import type {
  AdminCategory,
  AdminCategoryCreateInput,
  AdminCategoryUpdateInput,
  AdminCategoryReorderInput,
} from '../types'
import { adminCategoriesRepository } from '../services/admin-categories.repository'

export function useAdminCategories() {
  const t = useTranslations('Admin')
  const [data, setData] = useState<AdminCategory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchList = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await adminCategoriesRepository.list()
      setData(res)
    } catch {
      // bubble
    } finally {
      setIsLoading(false)
    }
  }, [])

  const create = useCallback(
    async (input: AdminCategoryCreateInput): Promise<{ success: boolean; errors?: Record<string, string[]> }> => {
      setIsSubmitting(true)
      try {
        const res = await adminCategoriesRepository.create(input)
        toast.success(res.message)
        await fetchList()
        return { success: true }
      } catch (err: any) {
        const errors = err.response?.data?.errors
        if (errors) {
          return { success: false, errors }
        }
        toast.error(err.response?.data?.message || err.message || t('categories.form.createError'))
        return { success: false }
      } finally {
        setIsSubmitting(false)
      }
    },
    [fetchList, t],
  )

  const update = useCallback(
    async (id: number, input: AdminCategoryUpdateInput): Promise<{ success: boolean; errors?: Record<string, string[]> }> => {
      setIsSubmitting(true)
      try {
        const res = await adminCategoriesRepository.update(id, input)
        toast.success(res.message)
        await fetchList()
        return { success: true }
      } catch (err: any) {
        const errors = err.response?.data?.errors
        if (errors) {
          return { success: false, errors }
        }
        toast.error(err.response?.data?.message || err.message || t('categories.form.updateError'))
        return { success: false }
      } finally {
        setIsSubmitting(false)
      }
    },
    [fetchList, t],
  )

  const remove = useCallback(
    async (id: number): Promise<boolean> => {
      setIsSubmitting(true)
      try {
        const res = await adminCategoriesRepository.delete(id)
        toast.success(res.message)
        await fetchList()
        return true
      } catch (err: any) {
        toast.error(err.response?.data?.message || err.message || t('categories.delete.error'))
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [fetchList, t],
  )

  const reorder = useCallback(
    async (input: AdminCategoryReorderInput): Promise<boolean> => {
      try {
        const res = await adminCategoriesRepository.reorder(input)
        toast.success(res.message)
        await fetchList()
        return true
      } catch (err: any) {
        toast.error(err.response?.data?.message || err.message || t('categories.reorderError'))
        return false
      }
    },
    [fetchList, t],
  )

  const movePosts = useCallback(
    async (id: number, targetCategoryId: number): Promise<boolean> => {
      setIsSubmitting(true)
      try {
        const res = await adminCategoriesRepository.movePosts(id, targetCategoryId)
        toast.success(res.message)
        return true
      } catch (err: any) {
        toast.error(err.response?.data?.message || err.message || t('categories.moveError'))
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [t],
  )

  return {
    data,
    isLoading,
    isSubmitting,
    fetchList,
    create,
    update,
    delete: remove,
    reorder,
    movePosts,
  }
}
