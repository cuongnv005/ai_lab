<?php

namespace App\Services\Api\Report;

use App\DTOs\Api\Report\CreateReportData;
use App\Enums\ReportStatus;
use App\Exceptions\InputException;
use App\Models\Comment;
use App\Models\Post;
use App\Models\Report;
use App\Services\Base\Service;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class ReportService extends Service
{
    /**
     * Submit an abuse report.
     *
     * @throws InputException
     * @throws \Throwable
     */
    public function submitReport(CreateReportData $dto): Report
    {
        // Rate limiting check: max 5 reports per 60 minutes
        $recentReportsCount = Report::where('user_id', $this->user->id)
            ->where('created_at', '>=', now()->subMinutes(60))
            ->count();

        if ($recentReportsCount >= 5) {
            throw new InputException(trans('report.error_rate_limit'), 422);
        }

        // Standardize reportable type
        $type = $dto->reportableType;
        if (strcasecmp($type, 'post') === 0 || $type === Post::class) {
            $reportableType = Post::class;
        } elseif (strcasecmp($type, 'comment') === 0 || $type === Comment::class) {
            $reportableType = Comment::class;
        } else {
            throw new InputException('Invalid reportable type.', 400);
        }

        // Verify that the reported item exists
        $reportableType::findOrFail($dto->reportableId);

        DB::beginTransaction();
        try {
            $report = Report::create([
                'user_id' => $this->user->id,
                'reportable_type' => $reportableType,
                'reportable_id' => $dto->reportableId,
                'reason' => $dto->reason,
                'status' => ReportStatus::PENDING,
            ]);

            DB::commit();
            return $report;
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * List all pending reports (Admin only).
     */
    public function listPendingReports(): LengthAwarePaginator
    {
        return Report::query()
            ->where('status', ReportStatus::PENDING)
            ->with(['user', 'reportable'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);
    }

    /**
     * Resolve a report by deleting the reported content (Admin only).
     *
     * @throws \Throwable
     */
    public function resolveReport(int $id): void
    {
        $report = Report::findOrFail($id);

        DB::beginTransaction();
        try {
            if ($report->reportable) {
                if ($report->reportable_type === \App\Models\Post::class || $report->reportable instanceof \App\Models\Post) {
                    $report->reportable->update(['status' => \App\Enums\PostStatus::DELETED->value]);
                }
                // Delete reported post/comment
                $report->reportable->delete();
            }

            $report->update([
                'status' => ReportStatus::RESOLVED,
                'resolved_by' => $this->user->id,
                'resolved_at' => now(),
            ]);

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Dismiss a report without deleting content (Admin only).
     *
     * @throws \Throwable
     */
    public function dismissReport(int $id): void
    {
        $report = Report::findOrFail($id);

        DB::beginTransaction();
        try {
            $report->update([
                'status' => ReportStatus::DISMISSED,
                'resolved_by' => $this->user->id,
                'resolved_at' => now(),
            ]);

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
