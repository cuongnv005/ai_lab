'use client'

import { useState, useCallback } from 'react'
import type { AdminPeriod, AdminChartType, AdminStats, AdminChartDataPoint, AdminTopPost, AdminTopUser, AdminActivity } from '../types'
import { adminAnalyticsRepository } from '../services/admin-analytics.repository'

export function useAdminAnalytics() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [chartData, setChartData] = useState<AdminChartDataPoint[]>([])
  const [topPosts, setTopPosts] = useState<AdminTopPost[]>([])
  const [topUsers, setTopUsers] = useState<AdminTopUser[]>([])
  const [recentActivities, setRecentActivities] = useState<AdminActivity[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [period, setPeriod] = useState<AdminPeriod>('30days')
  const [chartType, setChartType] = useState<AdminChartType>('posts')

  const fetchStats = useCallback(async (p: AdminPeriod = period) => {
    setIsLoading(true)
    try {
      const [statsData, chartDataResult, topPostsData, topUsersData, activitiesData] =
        await Promise.all([
          adminAnalyticsRepository.getStats(p),
          adminAnalyticsRepository.getChartData(p, chartType),
          adminAnalyticsRepository.getTopPosts(p),
          adminAnalyticsRepository.getTopUsers(p),
          adminAnalyticsRepository.getRecentActivities(),
        ])
      setStats(statsData)
      setChartData(chartDataResult)
      setTopPosts(topPostsData)
      setTopUsers(topUsersData)
      setRecentActivities(activitiesData)
    } catch {
      // errors bubble to ErrorBoundary
    } finally {
      setIsLoading(false)
    }
  }, [period, chartType])

  const fetchChart = useCallback(async (p: AdminPeriod, type: AdminChartType) => {
    try {
      const data = await adminAnalyticsRepository.getChartData(p, type)
      setChartData(data)
    } catch {
      // errors bubble to ErrorBoundary
    }
  }, [])

  return {
    stats,
    chartData,
    topPosts,
    topUsers,
    recentActivities,
    isLoading,
    period,
    chartType,
    setPeriod,
    setChartType,
    fetchStats,
    fetchChart,
  }
}
