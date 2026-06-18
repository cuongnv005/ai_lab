import { z } from 'zod'

export const BackendUserSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string().nullable().optional(),
  full_name: z.string().nullable().optional(),
  username: z.string().nullable().optional(),
  email: z.string(),
  avatar: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
  status: z.number().nullable().optional(),
  roles: z.array(z.string()).nullable().optional(),
  permissions: z.array(z.string()).nullable().optional(),
})

export const BackendLoginResponseSchema = z.object({
  status_code: z.number().optional(),
  success: z.boolean().optional(),
  message: z.string().nullable().optional(),
  errors: z.record(z.string(), z.array(z.string())).nullable().optional(),
  data: z.object({
    user: BackendUserSchema,
    access_token: z.string(),
    token_type: z.string(),
  }).nullable().optional(),
})

export const BackendRegisterResponseSchema = z.object({
  status_code: z.number().optional(),
  success: z.boolean().optional(),
  message: z.string().nullable().optional(),
  errors: z.record(z.string(), z.array(z.string())).nullable().optional(),
  data: z.object({
    user: BackendUserSchema,
    access_token: z.string(),
    token_type: z.string(),
  }).nullable().optional(),
})

export const BackendLogoutResponseSchema = z.object({
  status_code: z.number().optional(),
  success: z.boolean().optional(),
  message: z.string().nullable().optional(),
  errors: z.record(z.string(), z.array(z.string())).nullable().optional(),
  data: z.null().optional().nullable(),
})

export const BackendChangePasswordResponseSchema = z.object({
  status_code: z.number().optional(),
  success: z.boolean().optional(),
  message: z.string().nullable().optional(),
  errors: z.record(z.string(), z.array(z.string())).nullable().optional(),
  data: z.unknown().optional().nullable(),
})

export const BackendMeResponseSchema = z.object({
  status_code: z.number().optional(),
  success: z.boolean().optional(),
  message: z.string().nullable().optional(),
  errors: z.record(z.string(), z.array(z.string())).nullable().optional(),
  data: BackendUserSchema.nullable().optional(),
})

export const BackendForgotPasswordResponseSchema = z.object({
  status_code: z.number().optional(),
  success: z.boolean().optional(),
  message: z.string().nullable().optional(),
  errors: z.record(z.string(), z.array(z.string())).nullable().optional(),
  data: z.unknown().optional().nullable(),
})

