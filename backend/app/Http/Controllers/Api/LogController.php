<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Log\StoreLogRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class LogController extends BaseController
{
    /**
     * Ingest a batch of client (frontend) log entries.
     *
     * Acts like a self-hosted Sentry transport: the browser pushes batched
     * events here and they are written, enriched with request metadata, to the
     * dedicated `frontend` log channel (kept separate from the app log).
     * @unauthenticated
     *
     * @param StoreLogRequest $request
     * @return JsonResponse
     */
    public function store(StoreLogRequest $request): JsonResponse
    {
        $meta = [
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'user_id' => Auth::guard($this->getGuard())->id(),
        ];

        foreach ($request->input('logs', []) as $entry) {
            $context = [
                'source' => 'frontend',
                'client_time' => $entry['timestamp'] ?? null,
                'client' => $entry['context'] ?? [],
            ] + $meta;

            Log::channel('frontend')->log($entry['level'], $entry['message'], $context);
        }

        return $this->sendSuccessResponse(null);
    }
}
