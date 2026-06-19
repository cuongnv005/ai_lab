'use client'

/**
 * forgot-password/page.tsx — Forgot Password (OTP Flow)
 *
 * Step 1: Enter email → send OTP
 * Step 2: Verify OTP + set new password (to be added)
 */

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
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
import { authService } from '@/features/auth/services/auth.service'
import { Mail, Lock, Eye, EyeOff, CheckCircle2, ArrowLeft, Hash } from 'lucide-react'

// ─── Component ───────────────────────────────────────────────────────────────

export default function ForgotPasswordPage() {
  const t = useTranslations('ForgotPassword')
  const tBranding = useTranslations('Branding')

  const [step, setStep] = useState<'email' | 'otp' | 'new-password' | 'success'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const success = await authService.forgotPassword(email)
      if (success) {
        setStep('otp')
      } else {
        setError(t('errors.sendFailed'))
      }
    } catch (err: unknown) {
      const responseData = (err as { response?: { data?: Record<string, unknown> } })?.response?.data
      const backendMsg = responseData?.message as string | undefined
      setError(backendMsg || t('errors.sendFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const success = await authService.verifyOtp(email, otp)
      if (success) {
        setStep('new-password')
      } else {
        setError(t('errors.otpInvalid'))
      }
    } catch (err: unknown) {
      const responseData = (err as { response?: { data?: Record<string, unknown> } })?.response?.data
      const backendMsg = responseData?.message as string | undefined
      setError(backendMsg || t('errors.otpInvalid'))
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError(t('errors.passwordMismatch'))
      return
    }

    if (password.length < 8) {
      setError(t('errors.passwordMinLength'))
      return
    }

    setIsLoading(true)

    try {
      const success = await authService.resetPassword({
        email,
        otp,
        password,
        password_confirmation: confirmPassword,
      })
      if (success) {
        setStep('success')
      } else {
        setError(t('errors.resetFailed'))
      }
    } catch (err: unknown) {
      const responseData = (err as { response?: { data?: Record<string, unknown> } })?.response?.data
      const backendMsg = responseData?.message as string | undefined
      setError(backendMsg || t('errors.resetFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  const getHeaderInfo = () => {
    switch (step) {
      case 'email':
        return { title: t('title'), subtitle: t('subtitle') }
      case 'otp':
        return { title: t('otpTitle'), subtitle: t('otpSubtitle', { email }) }
      case 'new-password':
        return { title: t('newPasswordTitle'), subtitle: t('newPasswordSubtitle') }
      case 'success':
        return { title: t('successTitle'), subtitle: t('successMessage', { email }) }
    }
  }

  const { title, subtitle } = getHeaderInfo()

  return (
    <div className="flex min-h-screen bg-background font-sans">
      {/* Decorative Side — Recovery/Security Theme */}
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
              {title}
            </CardTitle>
            <CardDescription className="text-muted-foreground font-light text-left typo-body">
              {subtitle}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            {step === 'success' ? (
              // Success State
              <div className="space-y-6">
                <div className="rounded-2xl bg-blue-50 border border-blue-100 p-6 text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100/50">
                    <CheckCircle2 className="w-7 h-7 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <p className="typo-label-lg text-foreground font-semibold">
                      {t('successLabel', { defaultValue: 'Đặt lại mật khẩu thành công!' })}
                    </p>
                    <p className="typo-body-sm text-muted-foreground">
                      {t('successDesc', { defaultValue: 'Mật khẩu của bạn đã được cập nhật thành công. Vui lòng đăng nhập lại.' })}
                    </p>
                  </div>
                </div>

                <Link href="/login" className="block w-full">
                  <Button
                    type="button"
                    variant="default"
                    className="w-full h-10 bg-primary text-white hover:bg-primary/95 transition-all duration-200 font-medium tracking-wide shadow-sm hover:shadow cursor-pointer"
                  >
                    {t('backToLogin')}
                  </Button>
                </Link>
              </div>
            ) : step === 'email' ? (
              // Form Step 1: Email
              <form id="forgot-password-form" onSubmit={handleEmailSubmit} className="space-y-5">
                <Field className="gap-1.5">
                  <FieldLabel className="text-muted-foreground typo-label-md animate-fade-in" htmlFor="forgot-email">
                    {t('emailLabel')}
                  </FieldLabel>
                  <FieldContent>
                    <div className="relative group/input">
                      <Input
                        id="forgot-email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder={t('emailPlaceholder')}
                        disabled={isLoading}
                        className="pl-10 h-10 transition-all duration-200 border-outline focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                        aria-invalid={Boolean(error) || undefined}
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition-colors group-focus-within/input:text-primary pointer-events-none">
                        <Mail size={16} strokeWidth={1.75} />
                      </div>
                    </div>
                    {error && <FieldError id="forgot-error-message">{error}</FieldError>}
                  </FieldContent>
                </Field>

                <Button
                  id="forgot-submit-btn"
                  type="submit"
                  loading={isLoading}
                  variant="default"
                  className="w-full h-10 mt-6 bg-primary text-white hover:bg-primary/95 transition-all duration-200 font-medium tracking-wide shadow-sm hover:shadow active:scale-[0.98] cursor-pointer"
                  disabled={!email || isLoading}
                >
                  {t('submit')}
                </Button>
              </form>
            ) : step === 'otp' ? (
              // Form Step 2: OTP
              <form id="verify-otp-form" onSubmit={handleOtpSubmit} className="space-y-5">
                <Field className="gap-1.5">
                  <FieldLabel className="text-muted-foreground typo-label-md animate-fade-in" htmlFor="otp-code">
                    {t('otpLabel')}
                  </FieldLabel>
                  <FieldContent>
                    <div className="relative group/input">
                      <Input
                        id="otp-code"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                        placeholder={t('otpPlaceholder')}
                        disabled={isLoading}
                        className="pl-10 h-10 transition-all duration-200 border-outline focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                        aria-invalid={Boolean(error) || undefined}
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition-colors group-focus-within/input:text-primary pointer-events-none">
                        <Hash size={16} strokeWidth={1.75} />
                      </div>
                    </div>
                    {error && <FieldError id="otp-error-message">{error}</FieldError>}
                  </FieldContent>
                </Field>

                <Button
                  id="otp-submit-btn"
                  type="submit"
                  loading={isLoading}
                  variant="default"
                  className="w-full h-10 mt-6 bg-primary text-white hover:bg-primary/95 transition-all duration-200 font-medium tracking-wide shadow-sm hover:shadow active:scale-[0.98] cursor-pointer"
                  disabled={otp.length < 6 || isLoading}
                >
                  {t('verifyOtpSubmit')}
                </Button>
              </form>
            ) : (
              // Form Step 3: New Password
              <form id="reset-password-form" onSubmit={handlePasswordSubmit} className="space-y-5">
                <Field className="gap-1.5">
                  <FieldLabel className="text-muted-foreground typo-label-md animate-fade-in" htmlFor="new-password">
                    {t('passwordLabel')}
                  </FieldLabel>
                  <FieldContent>
                    <div className="relative group/input">
                      <Input
                        id="new-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder={t('passwordPlaceholder')}
                        className="pl-10 pr-10 h-10 transition-all duration-200 border-outline focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                        disabled={isLoading}
                        aria-invalid={Boolean(error) || undefined}
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition-colors group-focus-within/input:text-primary pointer-events-none">
                        <Lock size={16} strokeWidth={1.75} />
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setShowPassword((v) => !v)
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
                  </FieldContent>
                </Field>

                <Field className="gap-1.5">
                  <FieldLabel className="text-muted-foreground typo-label-md animate-fade-in" htmlFor="confirm-password">
                    {t('confirmPasswordLabel')}
                  </FieldLabel>
                  <FieldContent>
                    <div className="relative group/input">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder={t('passwordPlaceholder')}
                        className="pl-10 pr-10 h-10 transition-all duration-200 border-outline focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                        disabled={isLoading}
                        aria-invalid={Boolean(error) || undefined}
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition-colors group-focus-within/input:text-primary pointer-events-none">
                        <Lock size={16} strokeWidth={1.75} />
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setShowConfirmPassword((v) => !v)
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground/80 transition-colors cursor-pointer p-0.5 rounded focus:outline-none focus:ring-1 focus:ring-primary/30"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={16} strokeWidth={1.75} />
                        ) : (
                          <Eye size={16} strokeWidth={1.75} />
                        )}
                      </button>
                    </div>
                    {error && <FieldError id="password-error-message">{error}</FieldError>}
                  </FieldContent>
                </Field>

                <Button
                  id="reset-submit-btn"
                  type="submit"
                  loading={isLoading}
                  variant="default"
                  className="w-full h-10 mt-6 bg-primary text-white hover:bg-primary/95 transition-all duration-200 font-medium tracking-wide shadow-sm hover:shadow active:scale-[0.98] cursor-pointer"
                  disabled={!password || !confirmPassword || isLoading}
                >
                  {t('resetPasswordSubmit')}
                </Button>
              </form>
            )}
          </CardContent>

          {/* Bottom link panel */}
          {step === 'email' && (
            <div className="pt-2 text-center border-t border-border/40">
              <p className="typo-caption text-muted-foreground">
                <Link href="/login" className="text-primary font-medium hover:text-primary-hover hover:underline transition-colors inline-flex items-center gap-1.5">
                  <ArrowLeft size={14} />
                  {t('backToLogin')}
                </Link>
              </p>
            </div>
          )}

          {step === 'otp' && (
            <div className="pt-2 flex justify-between items-center text-center typo-caption border-t border-border/40">
              <button
                type="button"
                onClick={() => setStep('email')}
                className="text-muted-foreground hover:text-foreground transition-colors hover:underline cursor-pointer"
                disabled={isLoading}
              >
                {t('back', { defaultValue: 'Quay lại' })}
              </button>
              <button
                type="button"
                onClick={handleEmailSubmit}
                className="text-primary font-medium hover:text-primary-hover transition-colors hover:underline cursor-pointer"
                disabled={isLoading}
              >
                {t('resendCode')}
              </button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
