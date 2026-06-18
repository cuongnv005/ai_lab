import { BaseRepository } from '@/infra/api/base-repository'
import { HttpService } from '@/infra/api/http-service'
import type { IHttpAdapter } from '@/infra/api/http-adapter'
import type { User, LoginCredentials, ChangePasswordCredentials, RegisterCredentials, ResetPasswordCredentials } from '@/features/auth/types'
import type { IAuthRepository } from './auth.repository'
import {
  BackendLoginResponseSchema,
  BackendRegisterResponseSchema,
  BackendLogoutResponseSchema,
  BackendChangePasswordResponseSchema,
  BackendMeResponseSchema,
  BackendForgotPasswordResponseSchema,
} from '../schemas/auth.schema'

/** Shape of the user object returned by the backend (MeResource). */
interface BackendAuthUser {
  id: string | number
  name?: string | null
  email: string
  status?: number | null
  roles?: string[] | null
  permissions?: string[] | null
  avatar_url?: string | null
}

/** Map a backend user payload to the frontend `User` model. */
function mapBackendUser(user: BackendAuthUser): User {
  return {
    id: String(user.id),
    name: user.name || '',
    email: user.email,
    avatar: user.avatar_url || '',
    role: user.roles?.[0] || 'admin',
    roles: user.roles || ['admin'],
    permissions: user.permissions || [],
  }
}

/**
 * Auth repository — works for client and server via IHttpAdapter injection.
 *
 * - Client side: use the `authRepository` singleton (backed by HttpService).
 * - Server Components: use `createServerAuthRepository()` from `auth.server.ts`.
 */
export class AuthRepository extends BaseRepository implements IAuthRepository {
  constructor(http: IHttpAdapter = HttpService) {
    super(http)
  }

  /**
   * Prime the CSRF cookie (Sanctum SPA). Must run before any state-changing
   * request so axios can attach the X-XSRF-TOKEN header.
   */
  async ensureCsrfToken(): Promise<void> {
    await this.http.get('/sanctum/csrf-cookie')
  }

  async register(credentials: RegisterCredentials): Promise<{ user: User; message?: string | null }> {
    await this.ensureCsrfToken()
    interface BackendRegisterResponse {
      success: boolean
      message: string | null
      errors: Record<string, string[]> | null
      data: {
        user: BackendAuthUser
        access_token: string
        token_type: string
      } | null
    }

    const responseRaw = await this.post<unknown, RegisterCredentials>('/api/auth/register', credentials)
    const response = BackendRegisterResponseSchema.parse(responseRaw) as unknown as BackendRegisterResponse

    if (!response?.data?.user) {
      const error = new Error(response?.message || 'Registration failed: Invalid response format') as Error & { response?: { data?: unknown } }
      error.response = { data: response }
      throw error
    }

    const token = response.data.access_token
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
      document.cookie = `auth_token=${token}; path=/; max-age=31536000; SameSite=Lax; Secure`
    }

    return { user: mapBackendUser(response.data.user), message: response.message }
  }

  async login(credentials: LoginCredentials): Promise<{ user: User; message?: string | null }> {
    await this.ensureCsrfToken()
    interface BackendLoginResponse {
      success: boolean
      message: string | null
      errors: Record<string, string[]> | null
      data: {
        user: BackendAuthUser
        access_token: string
        token_type: string
      } | null
    }

    const responseRaw = await this.post<unknown, LoginCredentials>('/api/auth/login', credentials)
    const response = BackendLoginResponseSchema.parse(responseRaw) as unknown as BackendLoginResponse

    if (!response?.data?.user) {
      const error = new Error(response?.message || 'Login failed: Invalid response format') as Error & { response?: { data?: unknown } }
      error.response = { data: response }
      throw error
    }

    const token = response.data.access_token
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
      document.cookie = `auth_token=${token}; path=/; max-age=31536000; SameSite=Lax; Secure`
    }

    return { user: mapBackendUser(response.data.user), message: response.message }
  }

  async logout(): Promise<void> {
    try {
      const responseRaw = await this.post<unknown>('/api/auth/logout')
      BackendLogoutResponseSchema.parse(responseRaw)
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
        document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure'
        document.cookie = 'XSRF-TOKEN=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure'
        document.cookie = 'laravel_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure'
      }
    }
  }

  async changePassword(data: ChangePasswordCredentials): Promise<{ success: boolean; message?: string | null }> {
    interface BackendChangePasswordResponse {
      status_code?: number
      success?: boolean
      message?: string
      errors?: Record<string, string[]> | null
      data?: unknown
    }
    const formData = new FormData()
    formData.append('current_password', data.oldPassword)
    formData.append('password', data.newPassword)
    formData.append('password_confirmation', data.newPassword)

    const responseRaw = await this.post<unknown, FormData>(
      '/api/auth/change-password',
      formData
    )
    const response = BackendChangePasswordResponseSchema.parse(responseRaw) as unknown as BackendChangePasswordResponse

    const isValidationError = response?.status_code === 422 || response?.success === false
    if (isValidationError || response?.status_code === 401) {
      const error = new Error(response?.message || 'Validation failed') as Error & {
        response?: { data?: unknown; status?: number }
      }
      error.response = {
        data: response,
        status: response?.status_code || (response?.success === false ? 422 : 999), // default 999 for non-success cases without status code
      }
      if (response?.success === false && !response?.status_code) {
        error.response.status = 422;
      }
      throw error
    }

    return {
      success: !!(response.success || response.status_code === 200 || response.data === true),
      message: response.message
    }
  }

  async getMe(): Promise<User> {
    interface BackendMeResponse {
      success: boolean
      message: string | null
      errors: Record<string, string[]> | null
      data: BackendAuthUser | null
    }
    const responseRaw = await this.get<unknown>('/api/auth/me')
    const response = BackendMeResponseSchema.parse(responseRaw) as unknown as BackendMeResponse

    if (!response?.data) {
      throw new Error('Failed to fetch user profile')
    }

    return mapBackendUser(response.data)
  }

  async forgotPassword(email: string): Promise<{ success: boolean; message?: string | null }> {
    interface BackendForgotPasswordResponse {
      status_code?: number
      success?: boolean
      message?: string
      errors?: Record<string, string[]> | null
      data?: unknown
    }

    const responseRaw = await this.post<unknown, { email: string }>('/api/auth/forgot-password', { email })
    const response = BackendForgotPasswordResponseSchema.parse(responseRaw) as unknown as BackendForgotPasswordResponse

    const isValidationError = response?.status_code === 422 || response?.success === false
    if (isValidationError) {
      const error = new Error(response?.message || 'Validation failed') as Error & {
        response?: { data?: unknown; status?: number }
      }
      error.response = {
        data: response,
        status: response?.status_code || 422,
      }
      throw error
    }

    return {
      success: !!(response.success || response.status_code === 200 || response.data === true),
      message: response.message
    }
  }

  async verifyOtp(email: string, otp: string): Promise<{ success: boolean; message?: string | null }> {
    interface BackendVerifyOtpResponse {
      status_code?: number
      success?: boolean
      message?: string
      errors?: Record<string, string[]> | null
      data?: unknown
    }

    const responseRaw = await this.post<unknown, { email: string; otp: string }>('/api/auth/verify-otp', { email, otp })
    const response = BackendForgotPasswordResponseSchema.parse(responseRaw) as unknown as BackendVerifyOtpResponse

    const isValidationError = response?.status_code === 422 || response?.success === false
    if (isValidationError) {
      const error = new Error(response?.message || 'Validation failed') as Error & {
        response?: { data?: unknown; status?: number }
      }
      error.response = {
        data: response,
        status: response?.status_code || 422,
      }
      throw error
    }

    return {
      success: !!(response.success || response.status_code === 200 || response.data === true),
      message: response.message
    }
  }

  async resetPassword(data: ResetPasswordCredentials): Promise<{ success: boolean; message?: string | null }> {
    interface BackendResetPasswordResponse {
      status_code?: number
      success?: boolean
      message?: string
      errors?: Record<string, string[]> | null
      data?: unknown
    }

    const responseRaw = await this.post<unknown, ResetPasswordCredentials>('/api/auth/reset-password', data)
    const response = BackendForgotPasswordResponseSchema.parse(responseRaw) as unknown as BackendResetPasswordResponse

    const isValidationError = response?.status_code === 422 || response?.success === false
    if (isValidationError) {
      const error = new Error(response?.message || 'Validation failed') as Error & {
        response?: { data?: unknown; status?: number }
      }
      error.response = {
        data: response,
        status: response?.status_code || 422,
      }
      throw error
    }

    return {
      success: !!(response.success || response.status_code === 200 || response.data === true),
      message: response.message
    }
  }
}

/** Client-side singleton — safe to import in hooks and Client Components. */
export const authRepository: IAuthRepository = new AuthRepository()
