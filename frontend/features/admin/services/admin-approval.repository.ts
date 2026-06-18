import type { AxiosResponse } from 'axios'
import { HttpService } from '@/infra/api/http-service'
import type { ResponseData } from '@/shared/types/common'
import type { AdminPendingPost, AdminApprovalFilters, AdminPaginatedResponse } from '../types'

class AdminApprovalRepository {
  private validateResponse(res: AxiosResponse<ResponseData<unknown>>) {
    const data = res.data
    const statusCode =
      ((data as unknown as Record<string, unknown>)?.status_code as number | undefined) ||
      res.status
    const isError = statusCode === 422 || data?.success === false

    if (isError || statusCode === 401) {
      const error = new Error(data?.message || 'Request failed') as Error & {
        response?: { data?: unknown; status?: number }
      }
      error.response = { data, status: statusCode }
      throw error
    }
  }

  async listPending(
    filters: AdminApprovalFilters = {},
  ): Promise<AdminPaginatedResponse<AdminPendingPost>> {
    const params: Record<string, string> = {}
    if (filters.page) params.page = String(filters.page)
    if (filters.per_page) params.per_page = String(filters.per_page)
    if (filters.category_id) params.category_id = String(filters.category_id)
    if (filters.search) params.search = filters.search
    params.orders = JSON.stringify([{ key: 'created_at', dir: 'desc' }])

    const res = await HttpService.get<
      Record<string, string>,
      AxiosResponse<ResponseData<AdminPaginatedResponse<AdminPendingPost>>>
    >('/api/admin/posts/pending', params)

    return res.data.data
  }

  async approve(id: number): Promise<ResponseData<unknown>> {
    const res = await HttpService.post<undefined, AxiosResponse<ResponseData<unknown>>>(
      `/api/admin/posts/${id}/approve`,
    )
    this.validateResponse(res)
    return res.data
  }

  async reject(id: number, reason: string): Promise<ResponseData<unknown>> {
    const res = await HttpService.post<{ reason: string }, AxiosResponse<ResponseData<unknown>>>(
      `/api/admin/posts/${id}/reject`,
      { reason },
    )
    this.validateResponse(res)
    return res.data
  }

  async listRejected(
    filters: AdminApprovalFilters = {},
  ): Promise<AdminPaginatedResponse<AdminPendingPost>> {
    const params: Record<string, string> = {}
    if (filters.page) params.page = String(filters.page)
    if (filters.per_page) params.per_page = String(filters.per_page)
    params.orders = JSON.stringify([{ key: 'created_at', dir: 'desc' }])

    const res = await HttpService.get<
      Record<string, string>,
      AxiosResponse<ResponseData<AdminPaginatedResponse<AdminPendingPost>>>
    >('/api/admin/posts/rejected', params)

    return res.data.data
  }
}

export const adminApprovalRepository = new AdminApprovalRepository()
