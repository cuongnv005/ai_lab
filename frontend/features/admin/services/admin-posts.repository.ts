import type { AxiosResponse } from 'axios'
import { HttpService } from '@/infra/api/http-service'
import type { ResponseData } from '@/shared/types/common'
import type {
  AdminPost,
  AdminPostFilters,
  AdminPaginatedResponse,
  AdminPostCreateInput,
  AdminPostUpdateInput,
} from '../types'
import { POST_STATUS_API_MAP } from '@/shared/constants/status'

class AdminPostsRepository {
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

  async list(filters: AdminPostFilters = {}): Promise<AdminPaginatedResponse<AdminPost>> {
    const params: Record<string, string> = {}
    if (filters.page) params.page = String(filters.page)
    if (filters.per_page) params.per_page = String(filters.per_page)
    if (filters.search) params.search = filters.search

    const filterArray: Array<{ key: string; data: string }> = []
    if (filters.status && (filters.status as string) !== 'all') {
      // Backend uses integers for post status: pending = 1, published = 2, rejected = 3
      const mappedStatus = POST_STATUS_API_MAP[filters.status] || filters.status
      filterArray.push({ key: 'status', data: mappedStatus })
    }
    if (filters.category_id) {
      filterArray.push({ key: 'category_id', data: String(filters.category_id) })
    }
    if (filters.author) {
      filterArray.push({ key: 'author', data: filters.author })
    }
    if (filters.exclude_staff) {
      filterArray.push({ key: 'exclude_staff', data: filters.exclude_staff })
    }

    if (filterArray.length > 0) {
      params.filters = JSON.stringify(filterArray)
    }
    params.orders = JSON.stringify([{ key: 'created_at', dir: 'desc' }])

    const res = await HttpService.get<
      Record<string, string>,
      AxiosResponse<ResponseData<AdminPaginatedResponse<AdminPost>>>
    >('/api/admin/posts', params)

    return res.data.data
  }

  async create(input: AdminPostCreateInput): Promise<ResponseData<AdminPost>> {
    const res = await HttpService.post<AdminPostCreateInput, AxiosResponse<ResponseData<AdminPost>>>(
      '/api/admin/posts',
      input,
    )
    this.validateResponse(res)
    return res.data
  }

  async update(id: number, input: AdminPostUpdateInput): Promise<ResponseData<AdminPost>> {
    const res = await HttpService.put<AdminPostUpdateInput, AxiosResponse<ResponseData<AdminPost>>>(
      `/api/admin/posts/${id}`,
      input,
    )
    this.validateResponse(res)
    return res.data
  }

  async delete(id: number, confirm?: boolean): Promise<ResponseData<unknown>> {
    const res = await HttpService.delete<undefined, AxiosResponse<ResponseData<unknown>>>(
      `/api/admin/posts/${id}${confirm ? '?confirm=1' : ''}`,
    )
    this.validateResponse(res)
    return res.data
  }

  async forceDelete(id: number): Promise<ResponseData<unknown>> {
    const res = await HttpService.post<undefined, AxiosResponse<ResponseData<unknown>>>(
      `/api/admin/posts/${id}/force-delete`,
    )
    this.validateResponse(res)
    return res.data
  }

  async restore(id: number): Promise<ResponseData<unknown>> {
    const res = await HttpService.post<undefined, AxiosResponse<ResponseData<unknown>>>(
      `/api/admin/posts/${id}/restore`,
    )
    this.validateResponse(res)
    return res.data
  }

  async listTrashed(filters: AdminPostFilters = {}): Promise<AdminPaginatedResponse<AdminPost>> {
    const params: Record<string, string> = {}
    if (filters.page) params.page = String(filters.page)
    if (filters.per_page) params.per_page = String(filters.per_page)
    params.orders = JSON.stringify([{ key: 'created_at', dir: 'desc' }])

    const res = await HttpService.get<
      Record<string, string>,
      AxiosResponse<ResponseData<AdminPaginatedResponse<AdminPost>>>
    >('/api/admin/posts/trashed', params)

    return res.data.data
  }
}

export const adminPostsRepository = new AdminPostsRepository()
