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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@bks/ds-system-sdk'
import Image from 'next/image'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const t = useTranslations('Login')
  const tBranding = useTranslations('Branding')
  
  const { login, isLoading, error, fieldErrors, user } = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [isFormSubmitting, setIsFormSubmitting] = useState(false)

  const loginSchema = z.object({
    email: z.string().min(1, t('errors.emailRequired')),
    password: z
      .string()
      .min(1, t('errors.passwordRequired'))
      .min(6, t('errors.passwordMinLength')),
  })

  type LoginFormValues = z.infer<typeof loginSchema>

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
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

  const onSubmit = async (values: LoginFormValues) => {
    if (isFormSubmitting || useAuthStore.getState().isLoading) return
    setIsFormSubmitting(true)
    setLocalError(null)

    try {
      const user = await login(values)

      if (user) {
        // Redirect to callback URL or dashboard on success
        const searchParams = new URLSearchParams(window.location.search)
        const callbackUrl = searchParams.get('callbackUrl')
        
        if (callbackUrl) {
          router.push(callbackUrl)
        } else {
          router.push('/')
        }
      } else {
        const currentStoreError = useAuthStore.getState().error
        if (currentStoreError) {
          setLocalError(currentStoreError)
        }
      }
    } catch {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsFormSubmitting(false)
    }
  }

  const displayError = localError ?? error

  return (
    <div className="flex min-h-screen bg-background font-sans">
      {/* Decorative Atmosphere / Branding Side */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gradient-to-br from-[#001946] via-[#00327d] to-[#0047ab] items-center justify-center p-12">
        {/* Luxury Atmospheric Mesh & Geometric SVG Grid */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Neon Radial Orbs */}
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-400/20 blur-[120px]" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-indigo-500/20 blur-[120px]" />
          <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-blue-300/10 blur-[100px]" />
          
          {/* Subtle Geometric Tech Grid */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
              <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <rect width="100%" height="100%" fill="url(#dots)" opacity="0.5" />
          </svg>
        </div>

        {/* Glassmorphic Brand Container */}
        <div className="relative z-10 max-w-lg w-full bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-10 text-center shadow-2xl flex flex-col items-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/90 shadow-lg mb-8 transition-transform duration-500 hover:scale-105 hover:rotate-3">
            <Image
              src="/Gemini_icon.png"
              alt="Gemini Icon"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          <h2 className="typo-display text-white font-bold tracking-tight mb-4 text-balance">
            {tBranding('systemName')}
          </h2>
          <p className="typo-body text-blue-100/80 font-light text-balance max-w-md leading-relaxed">
            {tBranding('systemDescription')}
          </p>
          
          {/* Micro-interactive badge */}
          <div className="mt-12 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/5 text-xs text-blue-200 font-medium tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse" />
            Powered by BKS AI Lab
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12 relative bg-background">
        {/* Decorative elements behind the card for visual depth */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-info/5 rounded-full blur-3xl pointer-events-none" />

        <Card className="w-full max-w-md glass-card shadow-xl rounded-2xl p-6 sm:p-10 flex flex-col gap-6 relative z-10 transition-all duration-300 hover:shadow-2xl ring-0">
          <CardHeader className="p-0 gap-2 border-0">
            <div className="lg:hidden inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 mb-2">
              <Image
                src="/Gemini_icon.png"
                alt="Gemini Icon"
                width={28}
                height={28}
                className="object-contain"
              />
            </div>
            <CardTitle className="text-foreground font-bold tracking-tight text-left typo-heading-1">
              {t('title')}
            </CardTitle>
            <CardDescription className="text-muted-foreground font-light text-left typo-body">
              {t('subtitle')}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <form id="login-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              <Field className="gap-1.5">
                <FieldLabel className="text-muted-foreground typo-label-md animate-fade-in" htmlFor="login-email">
                  {t('emailLabel')}
                </FieldLabel>
                <FieldContent>
                  <div className="relative group/input">
                    <Input
                      id="login-email"
                      type="text"
                      autoComplete="username"
                      required
                      placeholder={t('emailPlaceholder')}
                      className="pl-10 h-10 transition-all duration-200 border-outline focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                      {...register('email')}
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition-colors group-focus-within/input:text-primary pointer-events-none">
                      <Mail size={16} strokeWidth={1.75} />
                    </div>
                  </div>
                  {errors.email && (
                    <FieldError>{errors.email.message}</FieldError>
                  )}
                </FieldContent>
              </Field>

              <Field className="gap-1.5">
                <div className="flex items-center justify-between">
                  <FieldLabel className="text-muted-foreground typo-label-md" htmlFor="login-password">
                    {t('passwordLabel')}
                  </FieldLabel>
                  <Link
                    href="/forgot-password"
                    className="typo-caption text-primary hover:text-primary-hover hover:underline transition-colors"
                  >
                    {t('forgotPassword')}
                  </Link>
                </div>
                <FieldContent>
                  <div className="relative group/input">
                    <Input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      placeholder={t('passwordPlaceholder')}
                      className="pl-10 pr-10 h-10 transition-all duration-200 border-outline focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                      {...register('password')}
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition-colors group-focus-within/input:text-primary pointer-events-none">
                      <Lock size={16} strokeWidth={1.75} />
                    </div>
                    <button
                      type="button"
                      id="toggle-password-visibility"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowPassword((v) => !v);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground/80 transition-colors cursor-pointer p-0.5 rounded focus:outline-none focus:ring-1 focus:ring-primary/30"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff size={16} strokeWidth={1.75} />
                      ) : (
                        <Eye size={16} strokeWidth={1.75} />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <FieldError>{errors.password.message}</FieldError>
                  )}
                  {displayError && (
                    <FieldError id="login-error-message">{displayError}</FieldError>
                  )}
                </FieldContent>
              </Field>

              <Button
                id="login-submit-btn"
                type="submit"
                loading={isFormSubmitting}
                variant="default"
                className="w-full h-10 mt-6 bg-primary text-white hover:bg-primary/95 transition-all duration-200 font-medium tracking-wide shadow-sm hover:shadow active:scale-[0.98] cursor-pointer"
              >
                {t('submit')}
              </Button>
            </form>
          </CardContent>

          <div className="pt-2 text-center border-t border-border/40">
            <p className="typo-caption text-muted-foreground">
              {t('noAccount')}{' '}
              <Link href="/register" className="text-primary font-medium hover:text-primary-hover hover:underline transition-colors">
                {t('signUp')}
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
