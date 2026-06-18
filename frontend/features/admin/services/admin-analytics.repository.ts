import { BaseRepository } from '@/infra/api/base-repository'
import { HttpService } from '@/infra/api/http-service'
import type { IHttpAdapter } from '@/infra/api/http-adapter'
import type {
  AdminStats,
  AdminChartDataPoint,
  AdminTopPost,
  AdminTopUser,
  AdminActivity,
  AdminPeriod,
  AdminChartType,
} from '../types'

export class AdminAnalyticsRepository extends BaseRepository {
  constructor(http: IHttpAdapter = HttpService) {
    super(http)
  }

  async getStats(period: AdminPeriod = '30days'): Promise<AdminStats> {
    const res = await this.get<{ success: boolean; data: AdminStats }>(
      '/api/admin/dashboard/stats',
      { period },
    )
    return res.data
  }

  async getChartData(period: AdminPeriod, type: AdminChartType): Promise<AdminChartDataPoint[]> {
    const res = await this.get<{ success: boolean; data: AdminChartDataPoint[] }>(
      '/api/admin/dashboard/chart',
      { period, type },
    )
    return res.data ?? []
  }

  async getTopPosts(period: AdminPeriod = '30days', limit = 5): Promise<AdminTopPost[]> {
    const res = await this.get<{ success: boolean; data: AdminTopPost[] }>(
      '/api/admin/dashboard/top-posts',
      { period, limit },
    )
    return res.data ?? []
  }

  async getTopUsers(period: AdminPeriod = '30days', limit = 5): Promise<AdminTopUser[]> {
    const res = await this.get<{ success: boolean; data: AdminTopUser[] }>(
      '/api/admin/dashboard/top-users',
      { period, limit },
    )
    return res.data ?? []
  }

  async getRecentActivities(limit = 10): Promise<AdminActivity[]> {
    const res = await this.get<{ success: boolean; data: AdminActivity[] }>(
      '/api/admin/dashboard/recent-activity',
      { limit },
    )
    return res.data ?? []
  }
}

export const adminAnalyticsRepository = new AdminAnalyticsRepository()
