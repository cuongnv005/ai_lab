import { create } from 'zustand'
import type { User } from '@/features/auth/types'

interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
  fieldErrors: Record<string, string[]> | null

  // Derived permission helpers (computed from user)
  roles: string[]
  permissions: string[]

  // Setters
  setUser: (user: User | null) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null, fieldErrors?: Record<string, string[]> | null) => void

  /** Full reset — called on logout */
  reset: () => void
}

const initialState = {
  user: null,
  isLoading: true, // Start loading until auth state is determined
  error: null,
  fieldErrors: null,
  roles: [],
  permissions: [],
}

export const useAuthStore = create<AuthState>((set) => ({
  ...initialState,

  setUser: (user) =>
    set({
      user,
      isLoading: false,
      error: null,
      fieldErrors: null,
      // Sync roles & permissions directly from user object
      roles: user?.roles ?? [],
      permissions: user?.permissions ?? [],
    }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error, fieldErrors = null) => set({ error, fieldErrors, isLoading: false }),

  reset: () => set(initialState),
}))
