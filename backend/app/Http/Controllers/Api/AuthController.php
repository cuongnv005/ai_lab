<?php

namespace App\Http\Controllers\Api;

use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Helpers\ResponseHelper;
use Illuminate\Http\JsonResponse;
use App\Exceptions\InputException;
use App\Factories\ApiFactory;
use App\DTOs\Api\Auth\LoginData;
use App\DTOs\Api\Auth\RegisterData;
use App\DTOs\Api\Auth\ChangePasswordData;
use App\Http\Resources\Auth\MeResource;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Controllers\Traits\HasRateLimiter;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Enums\UserStatus;

class AuthController extends BaseController
{
    use HasRateLimiter;

    public const MAX_ATTEMPTS_LOGIN = 5;
    public const DECAY_SECONDS = 60;

    /**
     * AuthController constructor.
     */
    public function __construct()
    {
        $this->middleware($this->authMiddleware())->except(['login', 'register', 'logout', 'forgotPassword', 'verifyOtp', 'resetPassword']);
    }

    /**
     * Register
     * @unauthenticated
     *
     * @param RegisterRequest $request
     * @return JsonResponse
     * @throws InputException
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $dto = RegisterData::from($request->validated());
        $user = ApiFactory::getAuthService()
            ->withGuard($this->getGuard())
            ->register($dto);

        $user->load('roles');

        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->sendSuccessResponse([
            'user' => new MeResource($user),
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], trans('auth.register_success'));
    }

    /**
     * Login
     * @unauthenticated
     *
     * @param LoginRequest $request
     * @return JsonResponse
     * @throws InputException
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $ip = $request->ip();
        $dto = LoginData::from($request->validated());
        $key = Str::lower($dto->email . '|user_login|' . $ip);

        // Increment attempts atomically and get the new count.
        // This prevents race conditions where multiple requests could
        // bypass the limit check before incrementing.
        $attempts = $this->incrementAndGetAttempts($key, self::DECAY_SECONDS);

        if ($attempts > self::MAX_ATTEMPTS_LOGIN) {
            return $this->sendLockoutResponse($key);
        }

        $user = ApiFactory::getAuthService()
            ->withGuard($this->getGuard())
            ->attemptLogin($dto);
        if ($user) {
            $this->clearLoginAttempts($key);

            // Prevent session fixation now that the user is authenticated.
            if ($request->hasSession()) {
                $request->session()->regenerate();
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            return $this->sendSuccessResponse([
                'user' => new MeResource($user),
                'access_token' => $token,
                'token_type' => 'Bearer',
            ]);
        }

        // Check if this was the final allowed attempt
        if ($attempts >= self::MAX_ATTEMPTS_LOGIN) {
            return $this->sendLockoutResponse($key);
        }

        return $this->sendFailedLoginResponse();
    }

    /**
     * Send Failed Login Response
     *
     * @return JsonResponse
     */
    protected function sendFailedLoginResponse(): JsonResponse
    {
        return ResponseHelper::sendResponse(ResponseHelper::STATUS_CODE_UNAUTHORIZED, trans('auth.failed'), null);
    }

    /**
     * Current login user
     *
     * @return JsonResponse
     */
    public function me(): JsonResponse
    {
        $currentUser = $this->guard()->user();

        if (! $currentUser) {
            return $this->sendErrorResponse(trans('response.unauthenticated'), null, null, ResponseHelper::STATUS_CODE_UNAUTHORIZED);
        }

        if ($currentUser->status === UserStatus::INACTIVE) {
            $this->guard()->logout();
            return $this->sendErrorResponse(trans('auth.deactivated'), null, null, ResponseHelper::STATUS_CODE_UNAUTHORIZED);
        }

        if ($currentUser->status === UserStatus::BANNED) {
            if ($currentUser->banned_until && $currentUser->banned_until->isPast()) {
                $currentUser->status = UserStatus::ACTIVE;
                $currentUser->ban_reason = null;
                $currentUser->banned_until = null;
                $currentUser->save();
            } else {
                $this->guard()->logout();
                return $this->sendErrorResponse(trans('auth.banned'), null, null, ResponseHelper::STATUS_CODE_UNAUTHORIZED);
            }
        }

        return $this->sendSuccessResponse(new MeResource($currentUser));
    }



    /**
     * Change password
     *
     * @param ChangePasswordRequest $request
     * @return JsonResponse
     * @throws InputException
     */
    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $currentUser = $this->guard()->user();

        if (! $currentUser) {
            return $this->sendErrorResponse(trans('response.unauthenticated'), null, null, ResponseHelper::STATUS_CODE_UNAUTHORIZED);
        }

        $dto = ChangePasswordData::from($request->validated());
        $data = ApiFactory::getAuthService()
            ->withGuard($this->getGuard())
            ->withUser($currentUser)
            ->changePassword($dto);

        return $this->sendSuccessResponse($data, trans('auth.logout_success'));
    }

    /**
     * Send OTP for Forgot Password
     * @unauthenticated
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $email = $request->input('email');
        $otp = rand(100000, 999999);

        // Cache the OTP for 10 minutes
        \Illuminate\Support\Facades\Cache::put('password_reset_otp_' . Str::lower($email), $otp, now()->addMinutes(10));

        try {
            $bodyHeader = trans('auth.otp_email_body_header');
            $bodyText = trans('auth.otp_email_body_text');
            $bodyFooter = trans('auth.otp_email_body_footer');
            $subject = trans('auth.otp_email_subject');

            \Illuminate\Support\Facades\Mail::html(
                "<div style='font-family: sans-serif; padding: 20px;'>
                    <h2>{$bodyHeader}</h2>
                    <p>{$bodyText}</p>
                    <div style='font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #4f46e5; margin: 15px 0;'>
                        {$otp}
                    </div>
                    <p>{$bodyFooter}</p>
                </div>",
                function ($message) use ($email, $subject) {
                    $message->to($email)
                        ->subject($subject);
                },
            );
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Gửi mail OTP thất bại: ' . $e->getMessage());
            return ResponseHelper::sendResponse(
                ResponseHelper::STATUS_CODE_BAD_REQUEST,
                trans('auth.otp_send_fail', ['error' => $e->getMessage()]),
                null,
            );
        }

        return $this->sendSuccessResponse([
            'email' => $email,
            'demo_otp' => $otp,
        ], trans('response.otp_sent_success'));
    }

    /**
     * Verify OTP
     * @unauthenticated
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string',
        ]);

        $email = $request->input('email');
        $otp = $request->input('otp');
        $cachedOtp = \Illuminate\Support\Facades\Cache::get('password_reset_otp_' . Str::lower($email));

        if (!$cachedOtp || (string)$cachedOtp !== (string)$otp) {
            return ResponseHelper::sendResponse(
                ResponseHelper::STATUS_CODE_BAD_REQUEST,
                trans('auth.otp_invalid'),
                null,
            );
        }

        return $this->sendSuccessResponse(null, trans('auth.otp_valid'));
    }

    /**
     * Reset Password using OTP
     * @unauthenticated
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string',
            'password' => 'required|string|min:8',
            'password_confirmation' => 'required|same:password',
        ]);

        $email = $request->input('email');
        $otp = $request->input('otp');
        $cachedOtp = \Illuminate\Support\Facades\Cache::get('password_reset_otp_' . Str::lower($email));

        if (!$cachedOtp || (string)$cachedOtp !== (string)$otp) {
            return ResponseHelper::sendResponse(
                ResponseHelper::STATUS_CODE_BAD_REQUEST,
                trans('auth.otp_invalid'),
                null,
            );
        }

        $user = \App\Models\User::where('email', Str::lower($email))->first();

        if (!$user) {
            return ResponseHelper::sendResponse(
                ResponseHelper::STATUS_CODE_BAD_REQUEST,
                trans('auth.email_not_found'),
                null,
            );
        }

        $user->update([
            'password' => \Illuminate\Support\Facades\Hash::make($request->input('password')),
        ]);

        // Revoke existing access tokens
        $user->tokens()->delete();

        // Clear OTP from Cache
        \Illuminate\Support\Facades\Cache::forget('password_reset_otp_' . Str::lower($email));

        return $this->sendSuccessResponse(null, trans('response.reset_password_success'));
    }

    /**
     * Logout
     *
     * @return JsonResponse
     */
    public function logout(Request $request): JsonResponse
    {
        $currentUser = $this->guard()->user();

        // Always log out of the SPA session and rotate/invalidate the CSRF/session tokens.
        // This ensures the browser receives Set-Cookie headers to clear the session cookies
        // even if the token itself is invalid or missing.
        Auth::guard('web')->logout();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        if (! $currentUser) {
            return $this->sendErrorResponse(trans('response.unauthenticated'), null, null, ResponseHelper::STATUS_CODE_UNAUTHORIZED);
        }

        // Revoke the token that was used to authenticate the current request
        if ($currentUser->currentAccessToken()) {
            $currentUser->currentAccessToken()->delete();
        }

        return $this->sendSuccessResponse(null, trans('auth.logout_success'));
    }
}
