import { cookies } from 'next/headers'
import { getLocale } from 'next-intl/server'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { ZodSchema } from 'zod'
import HttpModule from './module'
import { IHttpAdapter } from './http-adapter'

/**
 * Server-side HTTP adapter.
 *
 * Creates a fresh Axios instance per request (not a module-level singleton)
 * so there is no risk of session bleed between concurrent requests.
 *
 * Sanctum SPA mode: the incoming request cookies (including the HttpOnly
 * session cookie) are forwarded to the backend so SSR requests authenticate
 * as the current user.
 */
class ServerAxiosHttpClient implements IHttpAdapter<AxiosInstance> {
  public readonly client
  private readonly module: HttpModule

  constructor(cookieHeader: string | undefined) {
    let baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
    if (!baseUrl || baseUrl.startsWith('/')) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      baseUrl = baseUrl ? `${appUrl}${baseUrl}` : appUrl
    }

    this.module = new HttpModule(baseUrl)
    this.client = this.module.getInstance()

    if (cookieHeader) {
      Object.assign(this.client.defaults.headers, { Cookie: cookieHeader })
    }
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
    return schema.parse((response as AxiosResponse).data.data)
  }

  public async postValidated<T>(
    url: string,
    data: unknown,
    schema: ZodSchema<T>,
    options?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.post(url, data, options)
    return schema.parse((response as AxiosResponse).data.data)
  }

  public async putValidated<T>(
    url: string,
    data: unknown,
    schema: ZodSchema<T>
  ): Promise<T> {
    const response = await this.client.put(url, data)
    return schema.parse((response as AxiosResponse).data.data)
  }

  public async patchValidated<T>(
    url: string,
    data: unknown,
    schema: ZodSchema<T>
  ): Promise<T> {
    const response = await this.client.patch(url, data)
    return schema.parse((response as AxiosResponse).data.data)
  }

  public async deleteValidated<T>(
    url: string,
    schema: ZodSchema<T>,
    data?: unknown
  ): Promise<T> {
    const response = await this.client.delete(url, { data })
    return schema.parse((response as AxiosResponse).data.data)
  }
}

/**
 * Call this in Server Components / Route Handlers to get an HTTP client that
 * forwards the incoming request cookies (Sanctum SPA session) to the backend.
 *
 * @example
 * const http = await getServerHttpClient()
 */
export async function getServerHttpClient(): Promise<ServerAxiosHttpClient> {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ')
  const client = new ServerAxiosHttpClient(cookieHeader || undefined)
  
  const headers: Record<string, string> = {
    'Accept-Language': await getLocale()
  }

  const tokenCookie = cookieStore.get('auth_token')
  if (tokenCookie?.value) {
    headers['Authorization'] = `Bearer ${tokenCookie.value}`
  }

  client.setHeaders(headers)
  return client
}
