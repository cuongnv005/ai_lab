<?php

namespace App\Http\Resources\Report;

use App\Helpers\DateHelper;
use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Report
 */
class ReportResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (int) $this->id,
            'reason' => (string) $this->reason,
            'status' => (int) $this->status->value,
            'status_label' => (string) $this->status->label(),
            'created_at' => DateHelper::formatDateTime($this->created_at),
            'updated_at' => DateHelper::formatDateTime($this->updated_at),
            'resolved_at' => $this->resolved_at ? DateHelper::formatDateTime($this->resolved_at) : null,
            'reporter' => $this->whenLoaded('user', function () {
                return [
                    'id' => (int) $this->user->id,
                    'name' => (string) $this->user->name,
                    'email' => (string) $this->user->email,
                ];
            }),
            'resolver' => $this->whenLoaded('resolver', function () {
                if (!$this->resolver) {
                    return null;
                }

                return [
                    'id' => (int) $this->resolver->id,
                    'name' => (string) $this->resolver->name,
                ];
            }),
            'reportable_type' => str_contains($this->reportable_type, 'Post') ? 'post' : (str_contains($this->reportable_type, 'Comment') ? 'comment' : strtolower(class_basename($this->reportable_type))),
            'reportable_id' => (int) $this->reportable_id,
            'reportable' => $this->whenLoaded('reportable', function () {
                $reportable = $this->reportable;
                $resolvedType = str_contains($this->reportable_type, 'Post') ? 'post' : (str_contains($this->reportable_type, 'Comment') ? 'comment' : strtolower(class_basename($this->reportable_type)));

                if (!$reportable) {
                    return [
                        'type' => $resolvedType,
                        'id' => (int) $this->reportable_id,
                        'title' => 'Nội dung đã bị xóa',
                        'content' => 'Nội dung đã bị xóa',
                        'author' => null,
                    ];
                }

                if ($reportable instanceof Post) {
                    return [
                        'type' => 'post',
                        'id' => (int) $reportable->id,
                        'title' => (string) $reportable->title,
                        'author' => [
                            'id' => (int) $reportable->user->id,
                            'name' => (string) $reportable->user->name,
                        ],
                    ];
                }

                if ($reportable instanceof Comment) {
                    return [
                        'type' => 'comment',
                        'id' => (int) $reportable->id,
                        'content' => (string) $reportable->content,
                        'author' => [
                            'id' => (int) $reportable->user->id,
                            'name' => (string) $reportable->user->name,
                        ],
                    ];
                }

                return null;
            }),
        ];
    }
}
