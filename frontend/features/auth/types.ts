import type { IIdentity } from '@/shared/types/identity'

export interface User extends IIdentity {
  id: string
  name: string
  email: string
  role: string
  roles: string[]
  permissions: string[]
  avatar?: string | null
  avatar_url?: string | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface ChangePasswordCredentials {
  oldPassword: string
  newPassword: string
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
  password_confirmation: string
}

/** Sanctum SPA mode: auth is cookie-based, so responses carry only the user. */
export interface LoginResponse {
  user: User
}

export interface AuthResponse {
  user: User
}

export interface ResetPasswordCredentials {
  email: string
  otp: string
  password: string
  password_confirmation: string
}
