'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/features/auth'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { mapBackendErrors } from '@/shared/utils/map-backend-errors'
import { toast } from 'sonner'
import {
  Button,
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
  Input,
} from '@bks/ds-system-sdk'
import Image from 'next/image'

export default function RegisterPage() {
  const router = useRouter()
  const t = useTranslations('Register')
  const tBranding = useTranslations('Branding')

  const { register: registerUserApi, isLoading, error, fieldErrors, user } = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [isFormSubmitting, setIsFormSubmitting] = useState(false)

  const registerSchema = z.object({
    name: z.string().min(1, t('errors.nameRequired')),
    email: z
      .string()
      .min(1, t('errors.emailRequired'))
      .email(t('errors.emailInvalid')),
    password: z
      .string()
      .min(1, t('errors.passwordRequired'))
      .min(8, t('errors.passwordMinLength')),
    password_confirmation: z
      .string()
      .min(1, t('errors.confirmPasswordRequired')),
  }).refine((data) => data.password === data.password_confirmation, {
    message: t('errors.passwordMismatch'),
    path: ['password_confirmation'],
  })

  type RegisterFormValues = z.infer<typeof registerSchema>

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
    },
  })

  useEffect(() => {
    if (user) {
      router.replace('/')
    }
  }, [user, router])

  useEffect(() => {
    if (fieldErrors) {
      mapBackendErrors(fieldErrors, setError)
    }
  }, [fieldErrors, setError])

  const onSubmit = async (values: RegisterFormValues) => {
    if (isFormSubmitting || useAuthStore.getState().isLoading) return
    setIsFormSubmitting(true)
    setLocalError(null)

    try {
      const user = await registerUserApi(values)

      if (user) {
        router.push('/')
      } else {
        const currentStoreError = useAuthStore.getState().error
        if (currentStoreError) {
          setLocalError(currentStoreError)
        }
      }
    } catch {
      toast.error(t('errors.generic'))
    } finally {
      setIsFormSubmitting(false)
    }
  }

  const displayError = localError ?? error

  return (
    <div className="flex min-h-screen bg-background">
      {/* Decorative Atmosphere / Branding Side */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-muted items-center justify-center">
        {/* Luxury Atmospheric Mesh */}
        <div 
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage: `
              radial-gradient(circle at 15% 50%, hsl(var(--primary) / 0.15), transparent 50%),
              radial-gradient(circle at 85% 30%, hsl(var(--primary) / 0.12), transparent 50%),
              radial-gradient(circle at 50% 80%, hsl(var(--info) / 0.08), transparent 50%)
            `,
            backgroundSize: '100% 100%',
            backgroundAttachment: 'fixed'
          }} 
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="relative z-10 max-w-lg p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-background/80 border border-border backdrop-blur-xl shadow-2xl mb-8">
            <Image
              src="/Gemini_icon.png"
              alt="Gemini Icon"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          <h2 className="typo-display text-foreground font-medium tracking-tight mb-4 text-balance">
            {tBranding('systemName')}
          </h2>
          <p className="typo-body text-muted-foreground font-light text-balance">
            {tBranding('systemDescription')}
          </p>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 relative bg-background">
        <div className="w-full max-w-sm space-y-10">
          <div className="space-y-3">
            <h1 className="typo-heading-1 text-foreground tracking-tight">{t('title')}</h1>
            <p className="typo-body text-muted-foreground">{t('subtitle')}</p>
          </div>

          <form id="register-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            {/* Full Name */}
            <Field className="gap-1">
              <FieldLabel className="text-muted-foreground" htmlFor="register-name">
                {t('nameLabel')}
              </FieldLabel>
              <FieldContent>
                <Input
                  id="register-name"
                  type="text"
                  required
                  placeholder={t('namePlaceholder')}
                  {...register('name')}
                />
                {errors.name && (
                  <FieldError>{errors.name.message}</FieldError>
                )}
              </FieldContent>
            </Field>

            {/* Email */}
            <Field className="gap-1">
              <FieldLabel className="text-muted-foreground" htmlFor="register-email">
                {t('emailLabel')}
              </FieldLabel>
              <FieldContent>
                <Input
                  id="register-email"
                  type="email"
                  autoComplete="username"
                  required
                  placeholder={t('emailPlaceholder')}
                  {...register('email')}
                />
                {errors.email && (
                  <FieldError>{errors.email.message}</FieldError>
                )}
              </FieldContent>
            </Field>

            {/* Password */}
            <Field className="gap-1">
              <FieldLabel className="text-muted-foreground" htmlFor="register-password">
                {t('passwordLabel')}
              </FieldLabel>
              <FieldContent>
                <div className="relative">
                  <Input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    placeholder="••••••••"
                    className="pr-10"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      setShowPassword((v) => !v)
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <FieldError>{errors.password.message}</FieldError>
                )}
              </FieldContent>
            </Field>

            {/* Confirm Password */}
            <Field className="gap-1">
              <FieldLabel className="text-muted-foreground" htmlFor="register-confirm-password">
                {t('confirmPasswordLabel')}
              </FieldLabel>
              <FieldContent>
                <div className="relative">
                  <Input
                    id="register-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    placeholder="••••••••"
                    className="pr-10"
                    {...register('password_confirmation')}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      setShowConfirmPassword((v) => !v)
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password_confirmation && (
                  <FieldError>{errors.password_confirmation.message}</FieldError>
                )}
                {displayError && (
                  <FieldError id="register-error-message">{displayError}</FieldError>
                )}
              </FieldContent>
            </Field>
            <Button
              id="register-submit-btn"
              type="submit"
              loading={isFormSubmitting}
              variant="default"
              className="w-full mt-2"
            >
              {t('submit')}
            </Button>
          </form>

          <p className="text-center typo-caption text-muted-foreground mt-8">
            {t('haveAccount')}{' '}
            <Link href="/login" className="text-primary font-medium hover:underline">
              {t('login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
