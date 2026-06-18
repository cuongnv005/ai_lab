import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

import HttpModule from './module'
import { IHttpAdapter } from './http-adapter'
import { ZodSchema } from 'zod'

const DEFAULT_API_URL = ''
function getApiBaseUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL
  // If we are on the server and the URL is relative or empty, try to use APP_URL
  if (typeof window === 'undefined' && (!apiUrl || apiUrl.startsWith('/'))) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    return apiUrl ? `${appUrl}${apiUrl}` : appUrl
  }
  return apiUrl
}

/**
 * Deep HTTP Client that encapsulates Axios, Token Refresh, and Retry logic.
 */

class AxiosHttpClient implements IHttpAdapter<AxiosInstance> {
  public readonly client: AxiosInstance
  private readonly module: HttpModule

  public constructor(baseUrl: string = getApiBaseUrl()) {
    this.module = new HttpModule(baseUrl)
    this.client = this.module.getInstance()
  }

  public setHeaders(headers: AxiosRequestConfig['headers']): void {
    if (!headers) return
    Object.assign(this.client.defaults.headers, headers)
  }

  public deleteHeader(name: string): void {
    const headers = this.client.defaults.headers as Record<string, unknown> & {
      common?: Record<string, unknown>
    }
    delete headers[name]
    if (headers.common) delete headers.common[name]
  }

  public async get<TParams = unknown, TResponse = AxiosResponse>(
    url: string,
    params?: TParams
  ): Promise<TResponse> {
    return this.client.get(url, { params })
  }

  public async post<TData = unknown, TResponse = AxiosResponse>(
    url: string,
    data?: TData,
    axiosOptions?: AxiosRequestConfig
  ): Promise<TResponse> {
    return this.client.post(url, data, axiosOptions)
  }

  public async put<TData = unknown, TResponse = AxiosResponse>(
    url: string,
    data?: TData
  ): Promise<TResponse> {
    return this.client.put(url, data)
  }

  public async patch<TData = unknown, TResponse = AxiosResponse>(
    url: string,
    data?: TData
  ): Promise<TResponse> {
    return this.client.patch(url, data)
  }

  public async delete<TData = unknown, TResponse = AxiosResponse>(
    url: string,
    data?: TData
  ): Promise<TResponse> {
    return this.client.delete(url, { data })
  }

  // ─── Validated methods (with Zod) ────────────────────────────────────────────

  public async getValidated<T>(
    url: string,
    schema: ZodSchema<T>,
    params?: unknown
  ): Promise<T> {
    const response = await this.client.get(url, { params })
    const validated = schema.parse((response as AxiosResponse).data.data)
    return validated
  }

  public async postValidated<T>(
    url: string,
    data: unknown,
    schema: ZodSchema<T>,
    options?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.post(url, data, options)
    const validated = schema.parse((response as AxiosResponse).data.data)
    return validated
  }

  public async putValidated<T>(
    url: string,
    data: unknown,
    schema: ZodSchema<T>
  ): Promise<T> {
    const response = await this.client.put(url, data)
    const validated = schema.parse((response as AxiosResponse).data.data)
    return validated
  }

  public async patchValidated<T>(
    url: string,
    data: unknown,
    schema: ZodSchema<T>
  ): Promise<T> {
    const response = await this.client.patch(url, data)
    const validated = schema.parse((response as AxiosResponse).data.data)
    return validated
  }

  public async deleteValidated<T>(
    url: string,
    schema: ZodSchema<T>,
    data?: unknown
  ): Promise<T> {
    const response = await this.client.delete(url, { data })
    const validated = schema.parse((response as AxiosResponse).data.data)
    return validated
  }
}

export const HttpService = new AxiosHttpClient()
