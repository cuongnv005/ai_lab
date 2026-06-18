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
} from '@bks/ds-system-sdk'
import { authService } from '@/features/auth/services/auth.service'

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
    <div className="flex min-h-screen bg-background">
      {/* Decorative Side — Recovery/Security Theme */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-muted items-center justify-center">
        {/* Warm Security Glow */}
        <div 
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 40%, hsl(var(--primary) / 0.12), transparent 50%),
              radial-gradient(circle at 80% 60%, hsl(var(--primary) / 0.08), transparent 50%),
              radial-gradient(circle at 50% 20%, hsl(var(--info) / 0.06), transparent 50%)
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
            <h1 className="typo-heading-1 text-foreground tracking-tight">{title}</h1>
            <p className="typo-body text-muted-foreground">
              {subtitle}
            </p>
          </div>

          {step === 'success' ? (
            // Success State
            <div className="space-y-6">
              <div className="rounded-2xl bg-success border border-success p-6 text-center space-y-4">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-success-foreground/20">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-7 h-7 text-success-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <p className="typo-label-lg text-success-foreground font-medium">
                    {t('successLabel', { defaultValue: 'Đặt lại mật khẩu thành công!' })}
                  </p>
                  <p className="typo-body-sm text-success-foreground/80">
                    {t('successDesc', { defaultValue: 'Mật khẩu của bạn đã được cập nhật thành công. Vui lòng đăng nhập lại.' })}
                  </p>
                </div>
              </div>

              <Link href="/login" className="block w-full">
                <Button type="button" variant="default" className="w-full">
                  {t('backToLogin')}
                </Button>
              </Link>
            </div>
          ) : step === 'email' ? (
            // Form Step 1: Email
            <form id="forgot-password-form" onSubmit={handleEmailSubmit} className="space-y-6">
              <Field className="gap-1">
                <FieldLabel className="text-muted-foreground" htmlFor="forgot-email">
                  {t('emailLabel')}
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder={t('emailPlaceholder')}
                    disabled={isLoading}
                    aria-invalid={Boolean(error) || undefined}
                  />
                  {error && <FieldError id="forgot-error-message">{error}</FieldError>}
                </FieldContent>
              </Field>

              <Button
                id="forgot-submit-btn"
                type="submit"
                loading={isLoading}
                variant="default"
                className="w-full"
                disabled={!email || isLoading}
              >
                {t('submit')}
              </Button>

              <p className="text-center typo-caption text-muted-foreground">
                <Link href="/login" className="text-primary font-medium hover:underline inline-flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  {t('backToLogin')}
                </Link>
              </p>
            </form>
          ) : step === 'otp' ? (
            // Form Step 2: OTP
            <form id="verify-otp-form" onSubmit={handleOtpSubmit} className="space-y-6">
              <Field className="gap-1">
                <FieldLabel className="text-muted-foreground" htmlFor="otp-code">
                  {t('otpLabel')}
                </FieldLabel>
                <FieldContent>
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
                    aria-invalid={Boolean(error) || undefined}
                  />
                  {error && <FieldError id="otp-error-message">{error}</FieldError>}
                </FieldContent>
              </Field>

              <Button
                id="otp-submit-btn"
                type="submit"
                loading={isLoading}
                variant="default"
                className="w-full"
                disabled={otp.length < 6 || isLoading}
              >
                {t('verifyOtpSubmit')}
              </Button>

              <div className="flex justify-between items-center text-center typo-caption">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-muted-foreground hover:underline"
                  disabled={isLoading}
                >
                  {t('back', { defaultValue: 'Quay lại' })}
                </button>
                <button
                  type="button"
                  onClick={handleEmailSubmit}
                  className="text-primary font-medium hover:underline"
                  disabled={isLoading}
                >
                  {t('resendCode')}
                </button>
              </div>
            </form>
          ) : (
            // Form Step 3: New Password
            <form id="reset-password-form" onSubmit={handlePasswordSubmit} className="space-y-6">
              <Field className="gap-1">
                <FieldLabel className="text-muted-foreground" htmlFor="new-password">
                  {t('passwordLabel')}
                </FieldLabel>
                <FieldContent>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder={t('passwordPlaceholder')}
                      className="pr-10"
                      disabled={isLoading}
                      aria-invalid={Boolean(error) || undefined}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setShowPassword((v) => !v)
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
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
                </FieldContent>
              </Field>

              <Field className="gap-1">
                <FieldLabel className="text-muted-foreground" htmlFor="confirm-password">
                  {t('confirmPasswordLabel')}
                </FieldLabel>
                <FieldContent>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder={t('passwordPlaceholder')}
                      className="pr-10"
                      disabled={isLoading}
                      aria-invalid={Boolean(error) || undefined}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setShowConfirmPassword((v) => !v)
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
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
                  {error && <FieldError id="password-error-message">{error}</FieldError>}
                </FieldContent>
              </Field>

              <Button
                id="reset-submit-btn"
                type="submit"
                loading={isLoading}
                variant="default"
                className="w-full"
                disabled={!password || !confirmPassword || isLoading}
              >
                {t('resetPasswordSubmit')}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
