'use client';

import React from 'react';
import type { ReportType } from '@/features/posts/types/report';
import { REPORT_REASONS } from '@/features/posts/types/report';
import { useReport } from '@/features/posts/hooks/use-report';
import { Flag, Loader2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@bks/ds-system-sdk/components/ui/dialog';
import { Button } from '@bks/ds-system-sdk/components/ui/button';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportableType: ReportType;
  reportableId: number;
  onSuccess?: () => void;
}

export function ReportModal({ open, onOpenChange, reportableType, reportableId, onSuccess }: ReportModalProps) {
  const { submitReport, isSubmitting } = useReport();
  const t = useTranslations("PostDetail.report");
  const [selectedReason, setSelectedReason] = React.useState('');
  const [description, setDescription] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedReason) {
      toast.error(t('errorReason'));
      return;
    }

    const reason = selectedReason === 'other' 
      ? description 
      : t(`reasons.${selectedReason}`) || selectedReason;

    if (selectedReason === 'other') {
      if (reason.length < 10) {
        toast.error(t('errorLength'));
        return;
      }

      if (reason.length > 1000) {
        toast.error(t('errorMaxLength', { defaultValue: 'Nội dung chi tiết không được vượt quá 1000 ký tự' }));
        return;
      }
    }

    try {
      await submitReport({
        reportable_type: reportableType,
        reportable_id: reportableId,
        reason,
      });
      toast.success(t('success'));
      onOpenChange(false);
      setSelectedReason('');
      setDescription('');
      onSuccess?.();
    } catch (error) {
      // Bỏ qua hiển thị toast trùng lặp vì đã có Global API Error Handler xử lý và hiển thị thông điệp lỗi cụ thể của API
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border text-foreground max-w-md w-[90%] md:w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-amber-400" />
            {t('title')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{t('reasonLabel')}</p>
            <div className="space-y-2">
              {REPORT_REASONS.map((reason) => (
                <label
                  key={reason.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedReason === reason.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reason.value}
                    checked={selectedReason === reason.value}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="text-blue-500"
                  />
                  <span className="text-sm">{t(`reasons.${reason.value}`)}</span>
                </label>
              ))}
            </div>
          </div>

          {selectedReason === 'other' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm text-muted-foreground">{t('detailLabel')}</label>
                <span className="text-[10px] text-muted-foreground">{description.length}/1000</span>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('detailPlaceholder')}
                maxLength={1000}
                className="w-full min-h-[100px] p-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="text-xs text-muted-foreground">{t('detailMin')}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-border text-foreground hover:bg-muted"
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !selectedReason}
              className="flex-1 bg-amber-600 hover:bg-amber-500 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('submitting')}
                </>
              ) : (
                t('submit')
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
