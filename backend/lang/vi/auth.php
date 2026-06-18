<?php

declare(strict_types=1);

return [
    'failed' => 'Thông tin tài khoản không tìm thấy trong hệ thống.',
    'password' => 'Mật khẩu không đúng.',
    'throttle' => 'Vượt quá số lần đăng nhập cho phép. Vui lòng thử lại sau :seconds giây.',
    'logout_success' => 'Đăng xuất thành công.',
    'register_success' => 'Đăng ký thành công.',
    'register_fail' => 'Đăng ký thất bại. Vui lòng thử lại.',
    'throttle_user' => 'Tài khoản của bạn đã bị khóa tạm thời do nhập sai nhiều lần. Vui lòng thử lại sau :seconds giây.',

    // Auth status & OTP
    'deactivated' => 'Tài khoản của bạn đã bị hủy kích hoạt.',
    'banned' => 'Tài khoản của bạn đã bị khóa.',
    'otp_invalid' => 'Mã OTP không chính xác hoặc đã hết hạn.',
    'otp_valid' => 'Mã OTP chính xác.',
    'email_not_found' => 'Không tìm thấy tài khoản với email này.',
    'otp_email_subject' => 'Mã OTP khôi phục mật khẩu - Beki App',
    'otp_email_body_header' => 'Khôi phục mật khẩu',
    'otp_email_body_text' => 'Mã OTP xác thực của bạn là:',
    'otp_email_body_footer' => 'Mã này sẽ hết hạn trong vòng 10 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.',
    'otp_send_fail' => 'Không thể gửi email OTP: :error',
];
