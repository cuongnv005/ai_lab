<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Authentication Language Lines
    |--------------------------------------------------------------------------
    |
    | The following language lines are used during authentication for various
    | messages that we need to display to the user. You are free to modify
    | these language lines according to your application's requirements.
    |
    */

    'failed' => 'These credentials do not match our records.',
    'password' => 'The provided password is incorrect.',
    'throttle' => 'Too many login attempts. Please try again in :seconds seconds.',
    'logout_success' => 'Logout successful.',
    'register_success' => 'Registration successful.',
    'register_fail' => 'Registration failed. Please try again.',
    'throttle_user' => 'Your account is temporarily locked due to too many failed login attempts. Please try again in :seconds seconds.',

    // Auth status & OTP
    'deactivated' => 'Your account has been deactivated.',
    'banned' => 'Your account has been locked.',
    'otp_invalid' => 'The OTP is incorrect or has expired.',
    'otp_valid' => 'The OTP is correct.',
    'email_not_found' => 'No account found with this email.',
    'otp_email_subject' => 'Password recovery OTP code - Beki App',
    'otp_email_body_header' => 'Password Recovery',
    'otp_email_body_text' => 'Your OTP verification code is:',
    'otp_email_body_footer' => 'This code will expire in 10 minutes. Please do not share this code with anyone.',
    'otp_send_fail' => 'Unable to send OTP email: :error',
];
