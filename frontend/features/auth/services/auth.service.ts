import { useAuthStore } from '@/features/auth/stores/auth.store'
import { handleApiError } from '@/infra/api/error-handler'
import { AuthRepository } from './auth.repository.impl'
import { toast } from 'sonner'
import type { IAuthRepository } from './auth.repository'
import type { LoginCredentials, User, ChangePasswordCredentials, RegisterCredentials, ResetPasswordCredentials } from '@/features/auth/types'

/**
 * AuthService — orchestrates auth business logic.
 *
 * Sanctum SPA mode: authentication is carried by an HttpOnly session cookie set
 * by the backend, so there is no client-side token to store or attach. Auth
 * state is derived from the session via GET /api/auth/me.
 *
 * Responsibilities:
 *  1. Coordinate repository ↔ Zustand authStore
 *  2. Expose clean public API to hooks (login, logout, fetchMe)
 *
 * There is no token refresh: an expired session yields a 401, which the API
 * error handler turns into a redirect to the login page.
 */
export class AuthService {
  constructor(private readonly repository: IAuthRepository) {}

  /** Register: create a new user account and update the store. */
  async register(credentials: RegisterCredentials): Promise<User | null> {
    const store = useAuthStore.getState()
    store.setLoading(true)
    store.setError(null, null)

    try {
      const { user, message } = await this.repository.register(credentials)
      store.setUser(user)
      toast.success(message || 'Registration successful!')
      return user
    } catch (error: unknown) {
      const responseData = (error as { response?: { data?: Record<string, unknown> } })?.response?.data
      const responseStatus = (error as { response?: { status?: number } })?.response?.status
      const backendMsg = responseData?.message as string | undefined
      const isValidationError = responseStatus === 422 || responseData?.status_code === 422
      
      let fieldErrors = responseData?.errors as Record<string, string[]> | null || null
      // 422 validation response maps errors directly inside 'data' field when 'errors' is null
      if (!fieldErrors && isValidationError && responseData?.data) {
        fieldErrors = responseData.data as Record<string, string[]>
      }

      const msg = backendMsg || (error instanceof Error ? error.message : 'Registration failed')

      if (isValidationError) {
        store.setError(msg, fieldErrors)
      } else {
        toast.error(msg)
        store.setError(null, null)
      }
      return null
    } finally {
      store.setLoading(false)
    }
  }

  /** Login: authenticate the session via the API and update the store. */
  async login(credentials: LoginCredentials): Promise<User | null> {
    const store = useAuthStore.getState()
    store.setLoading(true)
    store.setError(null, null)

    try {
      const { user } = await this.repository.login(credentials)

      store.setUser(user)
      return user
    } catch (error: unknown) {
      const responseData = (error as { response?: { data?: Record<string, unknown> } })?.response?.data
      const responseStatus = (error as { response?: { status?: number } })?.response?.status
      const backendMsg = responseData?.message as string | undefined
      const isValidationError = responseStatus === 422 || responseData?.status_code === 422
      
      let fieldErrors = responseData?.errors as Record<string, string[]> | null || null
      // 422 validation response maps errors directly inside 'data' field when 'errors' is null
      if (!fieldErrors && isValidationError && responseData?.data) {
        fieldErrors = responseData.data as Record<string, string[]>
      }

      const msg = backendMsg || (error instanceof Error ? error.message : 'Login failed')

      if (isValidationError) {
        store.setError(msg, fieldErrors)
      } else {
        toast.error(msg)
        store.setError(null, null)
      }
      return null
    } finally {
      store.setLoading(false)
    }
  }

  /** Logout: invalidate the session via the API and reset the store. */
  async logout(): Promise<void> {
    try {
      await this.repository.logout()
    } catch {
      // Fire-and-forget; clear local state regardless
    } finally {
      useAuthStore.getState().reset()
    }
  }

  /**
   * Fetch the current user from the session (GET /api/auth/me).
   * Returns null (without error) when there is no valid session.
   */
  async fetchMe(): Promise<User | null> {
    const store = useAuthStore.getState()
    store.setLoading(true)

    try {
      const user = await this.repository.getMe()
      store.setUser(user)
      return user
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response?.status
      const url = (error as { response?: { config?: { url?: string } } })?.response?.config?.url || ''

      if (status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token')
          document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax'
        }
        store.setUser(null)
        store.setError(null, null)
        return null
      }

      if (url.includes("/api/auth/me")) {
        store.setUser(null)
        return null;
      }

      // Avoid redirect loop: if the user is already on the login page, do nothing.
      if (typeof window !== 'undefined' && window.location.pathname === "/login") {
        store.setUser(null)
        return null;
      }

      store.setError(error instanceof Error ? error.message : 'Failed to fetch user')
      store.setUser(null)
      return null
    } finally {
      store.setLoading(false)
    }
  }

  /**
   * Change password: call API, handle errors.
   * Throws on 422 so the caller (dialog) can map field errors directly into RHF setError.
   * Only non-422 errors are swallowed here (toast shown, returns false).
   */
  async changePassword(credentials: ChangePasswordCredentials): Promise<boolean> {
    const store = useAuthStore.getState()
    store.setLoading(true)

    try {
      const { success, message } = await this.repository.changePassword(credentials)
      if (success) {
        toast.success(message || 'Password changed successfully.')
      }
      return success
    } catch (error: unknown) {
      const responseData = (error as { response?: { data?: Record<string, unknown> } })?.response?.data
      const responseStatus = (error as { response?: { status?: number } })?.response?.status
      const isValidationError = responseStatus === 422 || responseData?.status_code === 422

      if (isValidationError) {
        // Re-throw so dialog can call mapBackendErrors(errors, setError) directly
        throw error
      }

      if (responseStatus === 401) {
        this.logout()
        handleApiError(error)
        return false
      }

      // Log only genuine unexpected errors
      console.error('changePassword error caught in AuthService:', error);

      const backendMsg = responseData?.message as string | undefined
      const msg = backendMsg || (error instanceof Error ? error.message : 'Change password failed')
      toast.error(msg)
      return false
    } finally {
      store.setLoading(false)
    }
  }

  /** Forgot password: call API to send OTP. */
  async forgotPassword(email: string): Promise<boolean> {
    const store = useAuthStore.getState()
    store.setLoading(true)

    try {
      const { success, message } = await this.repository.forgotPassword(email)
      if (success) {
        toast.success(message || 'OTP code sent successfully!')
      }
      return success
    } catch (error: unknown) {
      const responseData = (error as { response?: { data?: Record<string, unknown> } })?.response?.data
      const responseStatus = (error as { response?: { status?: number } })?.response?.status
      const isValidationError = responseStatus === 422 || responseData?.status_code === 422

      if (isValidationError) {
        throw error
      }

      // Handled validation error

      const backendMsg = responseData?.message as string | undefined
      const msg = backendMsg || (error instanceof Error ? error.message : 'Send OTP failed')
      toast.error(msg)
      return false
    } finally {
      store.setLoading(false)
    }
  }

  /** Verify OTP: call API to check if OTP is valid. */
  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const store = useAuthStore.getState()
    store.setLoading(true)

    try {
      const { success } = await this.repository.verifyOtp(email, otp)
      return success
    } catch (error: unknown) {
      const responseData = (error as { response?: { data?: Record<string, unknown> } })?.response?.data
      const responseStatus = (error as { response?: { status?: number } })?.response?.status
      const isValidationError = responseStatus === 422 || responseData?.status_code === 422

      if (isValidationError) {
        throw error
      }

      // Handled validation error

      const backendMsg = responseData?.message as string | undefined
      const msg = backendMsg || (error instanceof Error ? error.message : 'Verify OTP failed')
      toast.error(msg)
      return false
    } finally {
      store.setLoading(false)
    }
  }

  /** Reset Password: call API to change password with OTP. */
  async resetPassword(data: ResetPasswordCredentials): Promise<boolean> {
    const store = useAuthStore.getState()
    store.setLoading(true)

    try {
      const { success, message } = await this.repository.resetPassword(data)
      if (success) {
        toast.success(message || 'Password reset successfully!')
      }
      return success
    } catch (error: unknown) {
      const responseData = (error as { response?: { data?: Record<string, unknown> } })?.response?.data
      const responseStatus = (error as { response?: { status?: number } })?.response?.status
      const isValidationError = responseStatus === 422 || responseData?.status_code === 422

      if (isValidationError) {
        throw error
      }

      // Handled validation error

      const backendMsg = responseData?.message as string | undefined
      const msg = backendMsg || (error instanceof Error ? error.message : 'Reset password failed')
      toast.error(msg)
      return false
    } finally {
      store.setLoading(false)
    }
  }
}

/** Client-side singleton — import `authService` in hooks and client components. */
export const authService = new AuthService(new AuthRepository())
