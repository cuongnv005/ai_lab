import { useMutation } from '@tanstack/react-query';
import { reportRepository } from '../services/http-report.repository';
import type { ReportInput } from '../types/report';

export const useReport = () => {
  const reportMutation = useMutation({
    mutationFn: (input: ReportInput) => reportRepository.submit(input),
  });

  return {
    submitReport: reportMutation.mutateAsync,
    isSubmitting: reportMutation.isPending,
    error: reportMutation.error,
    isSuccess: reportMutation.isSuccess,
  };
};
