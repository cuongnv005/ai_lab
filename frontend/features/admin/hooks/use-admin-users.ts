'use client'

import { useState, useCallback } from 'react'
import { toast } from '@/shared/lib/toast'
import { useTranslations } from 'next-intl'
import type { ResponseData } from '@/shared/types/common'
import type {
  AdminUser,
  AdminUserFilters,
  AdminPaginatedResponse,
  BanUserInput,
  ChangeRoleInput,
} from '../types'
import { adminUsersRepository } from '../services/admin-users.repository'

export function useAdminUsers() {
  const t = useTranslations('Admin')
  const [data, setData] = useState<AdminUser[]>([])
  const [pagination, setPagination] = useState({ page: 1, lastPage: 1, total: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filters, setFilters] = useState<AdminUserFilters>({ page: 1, per_page: 10 })

  const fetchList = useCallback(
    async (f: AdminUserFilters = filters) => {
      setIsLoading(true)
      try {
        const res: AdminPaginatedResponse<AdminUser> = await adminUsersRepository.list(f)
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

  const changeRole = useCallback(
    async (id: number, input: ChangeRoleInput): Promise<boolean> => {
      setIsSubmitting(true)
      try {
        const res = await adminUsersRepository.changeRole(id, input)
        toast.success(res.message)
        await fetchList()
        return true
      } catch (err: any) {
        toast.error(err.response?.data?.message || err.message || t('users.toastChangeRoleError'))
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [fetchList, t],
  )

  const ban = useCallback(
    async (id: number, input: BanUserInput): Promise<boolean> => {
      setIsSubmitting(true)
      try {
        const res = await adminUsersRepository.ban(id, input)
        toast.success(res.message)
        await fetchList()
        return true
      } catch (err: any) {
        toast.error(err.response?.data?.message || err.message || t('users.toastBanError'))
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [fetchList, t],
  )

  const unban = useCallback(
    async (id: number): Promise<boolean> => {
      setIsSubmitting(true)
      try {
        const res = await adminUsersRepository.unban(id)
        toast.success(res.message)
        await fetchList()
        return true
      } catch (err: any) {
        toast.error(err.response?.data?.message || err.message || t('users.toastUnbanError'))
        return false
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
        const res = await adminUsersRepository.delete(id)
        toast.success(res.message)
        await fetchList()
        return true
      } catch (err: any) {
        toast.error(err.response?.data?.message || err.message || t('users.toastDeleteError'))
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
    changeRole,
    ban,
    unban,
    delete: remove,
  }
}
