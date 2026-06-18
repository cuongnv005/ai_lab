import type { AxiosResponse } from 'axios'
import { HttpService } from '@/infra/api/http-service'
import type { ResponseData } from '@/shared/types/common'
import type { AdminReport, AdminReportFilters, AdminPaginatedResponse } from '../types'
import { REPORT_STATUS_API_MAP } from '@/shared/constants/status'

class AdminReportsRepository {
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

  async list(filters: AdminReportFilters = {}): Promise<AdminPaginatedResponse<AdminReport>> {
    const params: Record<string, string> = {}
    if (filters.page) params.page = String(filters.page)
    if (filters.per_page) params.per_page = String(filters.per_page)
    const filterArray: Array<{ key: string; data: string }> = []
    if (filters.status && (filters.status as string) !== 'all') {
      const mappedStatus = REPORT_STATUS_API_MAP[filters.status] || filters.status
      filterArray.push({ key: 'status', data: mappedStatus })
    }
    if (filters.type && (filters.type as string) !== 'all') {
      filterArray.push({ key: 'type', data: filters.type })
    }

    if (filterArray.length > 0) {
      params.filters = JSON.stringify(filterArray)
    }
    params.orders = JSON.stringify([{ key: 'created_at', dir: 'desc' }])

    const res = await HttpService.get<
      Record<string, string>,
      AxiosResponse<ResponseData<AdminPaginatedResponse<AdminReport>>>
    >('/api/admin/reports', params)

    return res.data.data
  }

  async getById(id: number): Promise<AdminReport> {
    const res = await HttpService.get<undefined, AxiosResponse<ResponseData<AdminReport>>>(
      `/api/admin/reports/${id}`,
    )
    return res.data.data
  }

  async resolve(id: number): Promise<ResponseData<unknown>> {
    const res = await HttpService.post<undefined, AxiosResponse<ResponseData<unknown>>>(
      `/api/admin/reports/${id}/resolve`,
    )
    this.validateResponse(res)
    return res.data
  }

  async dismiss(id: number): Promise<ResponseData<unknown>> {
    const res = await HttpService.post<undefined, AxiosResponse<ResponseData<unknown>>>(
      `/api/admin/reports/${id}/dismiss`,
    )
    this.validateResponse(res)
    return res.data
  }
}

export const adminReportsRepository = new AdminReportsRepository()
