# Báo cáo Test: Report System & Queue API

## 1. Thông tin chung
- **Ngày test**: 2026-06-05
- **Môi trường**: Local / Testing

## 2. Chi tiết kết quả chạy test

### tests/Feature/Api/ReportTest.php

#### Test Case 1: `test_guest_cannot_submit_report`
- **Nội dung test**: Đảm bảo khách viếng thăm chưa đăng nhập hệ thống không thể gửi báo cáo vi phạm và nhận về mã trạng thái lỗi 401 Unauthorized.
- **Kết quả**: `pass`

#### Test Case 2: `test_member_can_submit_report_on_post`
- **Nội dung test**: Đảm bảo thành viên thông thường đã đăng nhập có thể gửi báo cáo vi phạm đối với bài viết, lưu chính xác bản ghi vào database với trạng thái PENDING (1).
- **Kết quả**: `pass`

#### Test Case 3: `test_member_can_submit_report_on_comment`
- **Nội dung test**: Đảm bảo thành viên thông thường đã đăng nhập có thể gửi báo cáo vi phạm đối với bình luận, lưu chính xác bản ghi vào database với trạng thái PENDING (1).
- **Kết quả**: `pass`

#### Test Case 4: `test_user_cannot_exceed_hourly_rate_limit`
- **Nội dung test**: Đảm bảo người dùng bị giới hạn tần suất gửi báo cáo không quá 5 lần trong vòng 60 phút. Khi gửi lần thứ 6 sẽ nhận về lỗi validation 422 và thông điệp lỗi tương ứng.
- **Kết quả**: `pass`

#### Test Case 5: `test_non_admin_cannot_access_admin_endpoints`
- **Nội dung test**: Đảm bảo người dùng thông thường và điều hành viên (Member/Moderator) không thể truy cập các endpoint quản lý báo cáo của Admin, nhận lỗi 403 Forbidden.
- **Kết quả**: `pass`

#### Test Case 6: `test_admin_can_list_pending_reports`
- **Nội dung test**: Đảm bảo quản trị viên (Admin) có thể xem danh sách toàn bộ các báo cáo vi phạm đang ở trạng thái chờ xử lý (PENDING) với cấu trúc phân trang.
- **Kết quả**: `pass`

#### Test Case 7: `test_admin_can_resolve_report`
- **Nội dung test**: Đảm bảo quản trị viên có thể giải quyết báo cáo, cập nhật trạng thái báo cáo thành RESOLVED (2) đồng thời thực hiện soft-delete nội dung bị báo cáo.
- **Kết quả**: `pass`

#### Test Case 8: `test_admin_can_dismiss_report`
- **Nội dung test**: Đảm bảo quản trị viên có thể bỏ qua báo cáo, cập nhật trạng thái báo cáo thành DISMISSED (3) và giữ nguyên nội dung bị báo cáo (không xóa).
- **Kết quả**: `pass`
