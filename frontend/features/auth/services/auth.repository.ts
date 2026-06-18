import type { User, LoginCredentials, ChangePasswordCredentials, RegisterCredentials, ResetPasswordCredentials } from '../types'

/**
 * Contract for the auth repository.
 * Implementations: HttpAuthRepository (production), MockAuthRepository (tests).
 */
export interface IAuthRepository {
  /** POST /api/auth/register — registers a new user */
  register(credentials: RegisterCredentials): Promise<{ user: User; message?: string | null }>

  /** POST /api/auth/login — authenticates the SPA session (cookie-based) */
  login(credentials: LoginCredentials): Promise<{ user: User; message?: string | null }>

  /** POST /api/auth/logout  */
  logout(): Promise<void>

  /** POST /api/auth/change-password */
  changePassword(data: ChangePasswordCredentials): Promise<{ success: boolean; message?: string | null }>

  /** GET /api/auth/me — returns current user profile with roles + permissions */
  getMe(): Promise<User>

  /** POST /api/auth/forgot-password — sends an OTP/reset password email */
  forgotPassword(email: string): Promise<{ success: boolean; message?: string | null }>

  /** POST /api/auth/verify-otp — verifies the recovery OTP */
  verifyOtp(email: string, otp: string): Promise<{ success: boolean; message?: string | null }>

  /** POST /api/auth/reset-password — resets the password with OTP */
  resetPassword(data: ResetPasswordCredentials): Promise<{ success: boolean; message?: string | null }>
}
