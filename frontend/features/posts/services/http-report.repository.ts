import { BaseRepository } from '@/infra/api/base-repository';
import { HttpService } from '@/infra/api/http-service';
import type { IHttpAdapter } from '@/infra/api/http-adapter';
import type { ResponseData } from '@/shared/types/common';
import type { ReportInput } from '../types/report';

export class HttpReportRepository extends BaseRepository {
  constructor(http: IHttpAdapter = HttpService) {
    super(http);
  }

  async submit(input: ReportInput): Promise<void> {
    await this.post<ResponseData<null>>('/api/reports', input);
  }
}

export const reportRepository = new HttpReportRepository();
