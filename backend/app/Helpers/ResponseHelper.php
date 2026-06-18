<?php

namespace App\Helpers;

use Illuminate\Http\JsonResponse;

class ResponseHelper
{
    public const STATUS_CODE_SUCCESS = 200;
    public const STATUS_CODE_UNAUTHORIZED = 401;
    public const STATUS_CODE_FORBIDDEN = 403;
    public const STATUS_CODE_BAD_REQUEST = 400;
    public const STATUS_CODE_NOTFOUND = 404;
    public const STATUS_CODE_VALIDATE_ERROR = 422;
    public const STATUS_CODE_SERVER_ERROR = 500;

    /**
     * Send Response
     *
     * @param int $code
     * @param string $message
     * @param mixed|null $data
     * @param array|null $errors
     * @return JsonResponse
     */
    public static function sendResponse(int $code, string $message, mixed $data = null, ?array $errors = null): JsonResponse
    {
        $success = $code >= 200 && $code < 300;

        $meta = null;
        if ($data instanceof \Illuminate\Http\Resources\Json\AnonymousResourceCollection) {
            if ($data->resource instanceof \Illuminate\Pagination\AbstractPaginator) {
                $paginator = $data->resource;
                $meta = [
                    'current_page' => $paginator->currentPage(),
                    'last_page' => $paginator->lastPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                ];
            }
        }

        $responseBody = [
            'success' => $success,
            'status_code' => $code,
            'message' => $message,
            'errors' => $errors,
            'data' => $data,
        ];

        if ($meta !== null) {
            $responseBody['meta'] = $meta;
        }

        return response()->json($responseBody, $code);
    }

    /**
     * Send Json Response
     *
     * @param $data
     * @return JsonResponse
     */
    public static function sendJsonResponse($data): JsonResponse
    {
        return response()->json($data);
    }
}
