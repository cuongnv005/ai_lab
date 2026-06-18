'use client'

import { useState, useCallback } from 'react'
import { toast } from '@/shared/lib/toast'
import { useTranslations } from 'next-intl'
import type { ResponseData } from '@/shared/types/common'
import type { AdminReport, AdminReportFilters, AdminPaginatedResponse } from '../types'
import { adminReportsRepository } from '../services/admin-reports.repository'

export function useAdminReports() {
  const t = useTranslations('Admin')
  const [data, setData] = useState<AdminReport[]>([])
  const [pagination, setPagination] = useState({ page: 1, lastPage: 1, total: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filters, setFilters] = useState<AdminReportFilters>({ page: 1, per_page: 10 })

  const fetchList = useCallback(
    async (f: AdminReportFilters = filters) => {
      setIsLoading(true)
      try {
        const res: AdminPaginatedResponse<AdminReport> = await adminReportsRepository.list(f)
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

  const resolve = useCallback(
    async (id: number): Promise<boolean> => {
      setIsSubmitting(true)
      try {
        const res = await adminReportsRepository.resolve(id)
        toast.success(res.message)
        await fetchList()
        return true
      } catch (err: any) {
        toast.error(err.response?.data?.message || err.message || t('reports.toastResolveError'))
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [fetchList, t],
  )

  const dismiss = useCallback(
    async (id: number): Promise<boolean> => {
      setIsSubmitting(true)
      try {
        const res = await adminReportsRepository.dismiss(id)
        toast.success(res.message)
        await fetchList()
        return true
      } catch (err: any) {
        toast.error(err.response?.data?.message || err.message || t('reports.toastDismissError'))
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
    resolve,
    dismiss,
  }
}
