import type { AxiosResponse } from 'axios'
import { HttpService } from '@/infra/api/http-service'
import type { ResponseData } from '@/shared/types/common'
import type {
  AdminCategory,
  AdminCategoryCreateInput,
  AdminCategoryUpdateInput,
  AdminCategoryReorderInput,
} from '../types'

class AdminCategoriesRepository {
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

  async list(): Promise<AdminCategory[]> {
    const res = await HttpService.get<undefined, AxiosResponse<ResponseData<AdminCategory[]>>>(
      '/api/admin/categories',
    )
    return res.data.data ?? []
  }

  async getById(id: number): Promise<AdminCategory> {
    const res = await HttpService.get<undefined, AxiosResponse<ResponseData<AdminCategory>>>(
      `/api/admin/categories/${id}`,
    )
    return res.data.data
  }

  async create(input: AdminCategoryCreateInput): Promise<ResponseData<AdminCategory>> {
    const res = await HttpService.post<
      AdminCategoryCreateInput,
      AxiosResponse<ResponseData<AdminCategory>>
    >('/api/admin/categories', input)
    this.validateResponse(res)
    return res.data
  }

  async update(id: number, input: AdminCategoryUpdateInput): Promise<ResponseData<AdminCategory>> {
    const res = await HttpService.put<
      AdminCategoryUpdateInput,
      AxiosResponse<ResponseData<AdminCategory>>
    >(`/api/admin/categories/${id}`, input)
    this.validateResponse(res)
    return res.data
  }

  async delete(id: number): Promise<ResponseData<unknown>> {
    const res = await HttpService.delete<undefined, AxiosResponse<ResponseData<unknown>>>(
      `/api/admin/categories/${id}`,
    )
    this.validateResponse(res)
    return res.data
  }

  async reorder(input: AdminCategoryReorderInput): Promise<ResponseData<unknown>> {
    const res = await HttpService.post<
      AdminCategoryReorderInput,
      AxiosResponse<ResponseData<unknown>>
    >('/api/admin/categories/reorder', input)
    this.validateResponse(res)
    return res.data
  }

  async movePosts(id: number, targetCategoryId: number): Promise<ResponseData<unknown>> {
    const res = await HttpService.post<
      { target_category_id: number },
      AxiosResponse<ResponseData<unknown>>
    >(`/api/admin/categories/${id}/move-posts`, { target_category_id: targetCategoryId })
    this.validateResponse(res)
    return res.data
  }
}

export const adminCategoriesRepository = new AdminCategoriesRepository()
