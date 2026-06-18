import type { AxiosResponse } from 'axios'
import { HttpService } from '@/infra/api/http-service'
import type { ResponseData } from '@/shared/types/common'
import type {
  AdminUser,
  AdminUserFilters,
  AdminPaginatedResponse,
  BanUserInput,
  ChangeRoleInput,
} from '../types'
import { USER_STATUS_API_MAP } from '@/shared/constants/status'

class AdminUsersRepository {
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

  async list(filters: AdminUserFilters = {}): Promise<AdminPaginatedResponse<AdminUser>> {
    const params: Record<string, string> = {}
    if (filters.page) params.page = String(filters.page)
    if (filters.per_page) params.per_page = String(filters.per_page)
    if (filters.search) params.search = filters.search

    const filterArray: Array<{ key: string; data: string }> = []
    if (filters.role) {
      filterArray.push({ key: 'role', data: filters.role })
    }
    if (filters.status) {
      // Backend uses integers for user status: active = 1, banned = 2
      const mappedStatus = USER_STATUS_API_MAP[filters.status] || filters.status
      filterArray.push({ key: 'status', data: mappedStatus })
    }

    if (filterArray.length > 0) {
      params.filters = JSON.stringify(filterArray)
    }
    params.orders = JSON.stringify([{ key: 'created_at', dir: 'desc' }])

    const res = await HttpService.get<
      Record<string, string>,
      AxiosResponse<ResponseData<AdminPaginatedResponse<AdminUser>>>
    >('/api/admin/users', params)

    return res.data.data
  }

  async getById(id: number): Promise<AdminUser> {
    const res = await HttpService.get<undefined, AxiosResponse<ResponseData<AdminUser>>>(
      `/api/admin/users/${id}`,
    )
    return res.data.data
  }

  async changeRole(id: number, input: ChangeRoleInput): Promise<ResponseData<AdminUser>> {
    const res = await HttpService.put<ChangeRoleInput, AxiosResponse<ResponseData<AdminUser>>>(
      `/api/admin/users/${id}/role`,
      input,
    )
    this.validateResponse(res)
    return res.data
  }

  async ban(id: number, input: BanUserInput): Promise<ResponseData<unknown>> {
    const res = await HttpService.post<BanUserInput, AxiosResponse<ResponseData<unknown>>>(
      `/api/admin/users/${id}/ban`,
      input,
    )
    this.validateResponse(res)
    return res.data
  }

  async unban(id: number): Promise<ResponseData<unknown>> {
    const res = await HttpService.post<undefined, AxiosResponse<ResponseData<unknown>>>(
      `/api/admin/users/${id}/unban`,
    )
    this.validateResponse(res)
    return res.data
  }

  async delete(id: number): Promise<ResponseData<unknown>> {
    const res = await HttpService.delete<undefined, AxiosResponse<ResponseData<unknown>>>(
      `/api/admin/users/${id}`,
    )
    this.validateResponse(res)
    return res.data
  }
}

export const adminUsersRepository = new AdminUsersRepository()
