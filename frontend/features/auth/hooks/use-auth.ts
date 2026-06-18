import { useAuthStore } from '@/features/auth/stores/auth.store'
import { authService } from '@/features/auth/services/auth.service'
import type { LoginCredentials, ChangePasswordCredentials, RegisterCredentials } from '@/features/auth/types'

/**
 * useAuth — primary hook for all auth operations.
 *
 * Reads from Zustand store (reactive), delegates actions to AuthService (singleton).
 * This keeps components decoupled from the service layer.
 */
export const useAuth = () => {
  const { user, isLoading, error, fieldErrors, roles, permissions } = useAuthStore()

  const registerUser = async (credentials: RegisterCredentials) => {
    return await authService.register(credentials)
  }

  const login = async (credentials: LoginCredentials) => {
    return await authService.login(credentials)
  }

  const logout = async () => {
    await authService.logout()
  }

  const fetchMe = async () => {
    return await authService.fetchMe()
  }

  const changePassword = async (credentials: ChangePasswordCredentials) => {
    return await authService.changePassword(credentials)
  }

  return {
    user,
    isLoading,
    error,
    fieldErrors,
    roles,
    permissions,
    isAuthenticated: !!user,
    register: registerUser,
    login,
    logout,
    fetchMe,
    changePassword,
  }
}
