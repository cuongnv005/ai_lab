'use client'

import { useState, useCallback } from 'react'
import { toast } from '@/shared/lib/toast'
import { useTranslations } from 'next-intl'
import type { ResponseData } from '@/shared/types/common'
import type { AdminPendingPost, AdminApprovalFilters, AdminPaginatedResponse } from '../types'
import { adminApprovalRepository } from '../services/admin-approval.repository'
import { adminPostsRepository } from '../services/admin-posts.repository'

export function useAdminApproval() {
  const t = useTranslations('Admin')
  const [data, setData] = useState<AdminPendingPost[]>([])
  const [pagination, setPagination] = useState({ page: 1, lastPage: 1, total: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<'pending' | 'published' | 'rejected'>('pending')
  const [filters, setFilters] = useState<AdminApprovalFilters>({ page: 1, per_page: 10 })

  const fetchList = useCallback(
    async (
      f: AdminApprovalFilters = filters,
      tab: 'pending' | 'published' | 'rejected' = activeTab,
    ) => {
      setIsLoading(true)
      try {
        let res: AdminPaginatedResponse<AdminPendingPost>
        if (tab === 'pending') {
          res = await adminApprovalRepository.listPending(f)
        } else if (tab === 'rejected') {
          res = await adminApprovalRepository.listRejected(f)
        } else {
          // tab === 'published'
          const postsRes = await adminPostsRepository.list({
            page: f.page,
            per_page: f.per_page,
            search: f.search,
            category_id: f.category_id,
            status: 'approved',
          })
          res = {
            data: postsRes.data,
            current_page: postsRes.current_page,
            per_page: postsRes.per_page,
            total: postsRes.total,
            last_page: postsRes.last_page,
          }
        }
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
    [filters, activeTab],
  )

  const approve = useCallback(
    async (id: number): Promise<boolean> => {
      setIsSubmitting(true)
      try {
        const res = await adminApprovalRepository.approve(id)
        toast.success(res.message)
        await fetchList(filters, activeTab)
        return true
      } catch (err: any) {
        toast.error(err.response?.data?.message || err.message || t('approval.errorApprove'))
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [fetchList, filters, activeTab, t],
  )

  const reject = useCallback(
    async (id: number, reason: string): Promise<boolean> => {
      setIsSubmitting(true)
      try {
        const res = await adminApprovalRepository.reject(id, reason)
        toast.success(res.message)
        await fetchList(filters, activeTab)
        return true
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status
        if (status !== 422) {
          toast.error((err as any).response?.data?.message || (err as any).message || t('approval.errorReject'))
          throw err
        }
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [fetchList, filters, activeTab, t],
  )

  return {
    data,
    pagination,
    isLoading,
    isSubmitting,
    filters,
    setFilters,
    activeTab,
    setActiveTab,
    fetchList,
    approve,
    reject,
  }
}
