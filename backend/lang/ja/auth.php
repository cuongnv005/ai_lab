<?php

declare(strict_types=1);

return [
    'failed' => '認証に失敗しました。',
    'password' => 'パスワードが正しくありません。',
    'throttle' => 'ログインの試行回数が多すぎます。:seconds 秒後にお試しください。',
    'logout_success' => 'ログアウトに成功しました。',
    'register_success' => '会員登録に成功しました。',
    'register_fail' => '会員登録に失敗しました。もう一度お試しください。',
    'throttle_user' => 'ログイン試行回数が多すぎるため、アカウントが一時的にロックされました。:seconds 秒後にお試しください。',

    // Auth status & OTP
    'deactivated' => 'アカウントが無効化されました。',
    'banned' => 'アカウントがロックされました。',
    'otp_invalid' => 'OTPコードが正しくないか、期限切れです。',
    'otp_valid' => 'OTPコードが正しいです。',
    'email_not_found' => 'このメールアドレスのユーザーが見つかりません。',
    'otp_email_subject' => 'パスワード再設定のOTPコード - Beki App',
    'otp_email_body_header' => 'パスワードの再設定',
    'otp_email_body_text' => 'あなたのOTP認証コードは以下です：',
    'otp_email_body_footer' => 'このコードの有効期限は10分間です。このコードを誰にも共有しないでください。',
    'otp_send_fail' => 'OTPメールを送信できませんでした：:error',
];
