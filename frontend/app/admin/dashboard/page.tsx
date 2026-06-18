'use client'

import React, { useEffect, useState } from 'react'
import {
  Users,
  FileText,
  ClipboardList,
  Flag,
  MessageSquare,
  Eye,
  EyeOff,
  TrendingUp,
  Activity,
} from 'lucide-react'
import { Spinner } from '@bks/ds-system-sdk/components/ui/spinner'
import { Button } from '@bks/ds-system-sdk/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@bks/ds-system-sdk/components/ui/dialog'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@bks/ds-system-sdk/components/ui/chart'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { useAdminAnalytics } from '@/features/admin/hooks/use-admin-analytics'
import type { AdminPeriod, AdminTopPost } from '@/features/admin/types'
import { formatDate } from '@/shared/lib/format-date'
import { adminPostsRepository } from '@/features/admin/services/admin-posts.repository'
import { toast } from '@/shared/lib/toast'
import { useTranslations } from 'next-intl'

const PERIODS: { value: AdminPeriod; key: string }[] = [
  { value: 'today', key: 'today' },
  { value: '7days', key: '7days' },
  { value: '30days', key: '30days' },
  { value: 'year', key: 'year' },
]

interface StatCardProps {
  label: string
  value: number | null
  icon: React.ComponentType<{ className?: string }>
  colorClass: string
}

function StatCard({ label, value, icon: Icon, colorClass }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-xs">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${colorClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-2xl font-black tabular-nums">
          {value === null ? '—' : value.toLocaleString()}
        </p>
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const t = useTranslations('Admin')
  const commonT = useTranslations('Common')
  const {
    stats,
    chartData,
    topPosts,
    topUsers,
    isLoading,
    period,
    setPeriod,
    fetchStats,
    fetchChart,
    chartType,
    setChartType,
  } = useAdminAnalytics()

  const [hideTarget, setHideTarget] = useState<AdminTopPost | null>(null)
  const [isHiding, setIsHiding] = useState(false)

  const handleHideConfirm = async () => {
    if (!hideTarget) return
    setIsHiding(true)
    try {
      await adminPostsRepository.delete(hideTarget.id, true)
      toast.success(t('dashboard.topPosts.hideSuccess'))
      setHideTarget(null)
      await fetchStats(period)
    } catch (err) {
      const apiError = err as { response?: { data?: { message?: string } }; message?: string }
      toast.error(apiError.response?.data?.message || apiError.message || t('dashboard.topPosts.hideError'))
    } finally {
      setIsHiding(false)
    }
  }

  useEffect(() => {
    fetchStats(period)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handlePeriodChange = async (p: AdminPeriod) => {
    setPeriod(p)
    await fetchStats(p)
  }

  const chartConfig = {
    value: { label: chartType.charAt(0).toUpperCase() + chartType.slice(1), color: 'hsl(var(--primary))' },
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-xs text-muted-foreground">{t('dashboard.subtitle')}</p>
        </div>

        {/* Period selector */}
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => handlePeriodChange(p.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                period === p.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {t(`dashboard.periods.${p.key}`)}
            </button>
          ))}
        </div>
      </div>

      {isLoading && !stats ? (
        <div className="flex h-48 items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      ) : (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label={t('dashboard.stats.totalUsers')}
              value={stats?.total_users ?? null}
              icon={Users}
              colorClass="bg-blue-500/10 text-blue-500"
            />
            <StatCard
              label={t('dashboard.stats.totalPosts')}
              value={stats?.total_posts ?? null}
              icon={FileText}
              colorClass="bg-emerald-500/10 text-emerald-500"
            />
            <StatCard
              label={t('dashboard.stats.pendingPosts')}
              value={stats?.pending_posts ?? null}
              icon={ClipboardList}
              colorClass="bg-amber-500/10 text-amber-500"
            />
            <StatCard
              label={t('dashboard.stats.totalViews')}
              value={stats?.total_views ?? null}
              icon={Eye}
              colorClass="bg-violet-500/10 text-violet-500"
            />
            <StatCard
              label={t('dashboard.stats.newPosts')}
              value={stats?.new_posts ?? null}
              icon={TrendingUp}
              colorClass="bg-rose-500/10 text-rose-500"
            />
            <StatCard
              label={t('dashboard.stats.newUsers')}
              value={stats?.new_users ?? null}
              icon={Users}
              colorClass="bg-cyan-500/10 text-cyan-500"
            />
            <StatCard
              label={t('dashboard.stats.newComments')}
              value={stats?.new_comments ?? null}
              icon={MessageSquare}
              colorClass="bg-orange-500/10 text-orange-500"
            />
            <StatCard
              label={t('dashboard.stats.totalComments')}
              value={stats?.total_comments ?? null}
              icon={Activity}
              colorClass="bg-pink-500/10 text-pink-500"
            />
          </div>

          {/* Chart */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-sm font-bold">{t('dashboard.chart.title')}</h2>
              <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-1">
                {(['posts', 'users', 'views', 'comments'] as const).map((type) => {
                  return (
                    <button
                      key={type}
                      onClick={async () => {
                        setChartType(type)
                        await fetchChart(period, type)
                      }}
                      className={`rounded px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                        chartType === type
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {t(`dashboard.chart.types.${type}`)}
                    </button>
                  )
                })}
              </div>
            </div>

            {chartData.length === 0 ? (
              <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                {t('dashboard.chart.noData')}
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="h-56 w-full">
                <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v: string) => {
                      const d = new Date(v)
                      return isNaN(d.getTime()) ? v : `${d.getDate()}/${d.getMonth() + 1}`
                    }}
                  />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} width={32} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </div>

          {/* Top lists */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Top Posts */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-xs min-w-0">
              <h2 className="text-sm font-bold mb-3">{t('dashboard.topPosts.title')}</h2>
              {topPosts.length === 0 ? (
                <p className="text-xs text-muted-foreground">{t('dashboard.topPosts.noData')}</p>
              ) : (
                <div className="space-y-2">
                  {topPosts.map((post, i) => (
                    <div key={post.id} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{post.title}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {typeof post.author === 'string' ? post.author : post.author?.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-0.5 mr-2">
                          <Eye className="h-3 w-3" />
                          {post.views_count}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setHideTarget(post)}
                          title={t('dashboard.topPosts.hideConfirmTitle')}
                        >
                          <EyeOff className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Users */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-xs min-w-0">
              <h2 className="text-sm font-bold mb-3">{t('dashboard.topUsers.title')}</h2>
              {topUsers.length === 0 ? (
                <p className="text-xs text-muted-foreground">{t('dashboard.topUsers.noData')}</p>
              ) : (
                <div className="space-y-2">
                  {topUsers.map((u, i) => (
                    <div key={u.id} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-[10px] font-bold">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{u.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {t('dashboard.topUsers.statsCount', { posts: u.posts_count, comments: u.comments_count })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Hide Confirm Dialog */}
      <Dialog open={!!hideTarget} onOpenChange={(open) => !open && setHideTarget(null)}>
        {hideTarget && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-sm">{t('dashboard.topPosts.hideConfirmTitle')}</DialogTitle>
              <DialogDescription className="text-xs">
                {t('dashboard.topPosts.hideConfirmDesc', { title: hideTarget.title })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setHideTarget(null)}>
                {commonT('cancel')}
              </Button>
              <Button
                variant="default"
                tone="destructive"
                size="sm"
                onClick={handleHideConfirm}
                disabled={isHiding}
              >
                {isHiding && <Spinner className="h-3 w-3 mr-1" />}
                {t('dashboard.topPosts.hideConfirmTitle')}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
