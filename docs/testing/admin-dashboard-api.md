# Báo cáo Test: Admin Dashboard APIs (Task-01 đến Task-05)

## 1. Thông tin chung
- **Ngày test**: 2026-06-11
- **Môi trường**: Local Docker Environment (PHPUnit, SQLite in-memory)
- **Tập tin test**:
  1. `tests/Feature/Api/Admin/AnalyticsTest.php`
  2. `tests/Feature/Api/Admin/PostApprovalTest.php`
  3. `tests/Feature/Api/Admin/UserManagementTest.php`
  4. `tests/Feature/Api/ReportTest.php`

---

## 2. Chi tiết kết quả chạy test

### 1. `tests/Feature/Api/Admin/AnalyticsTest.php` (Thống kê & Biểu đồ)

#### Test Case 1: `test_non_admin_cannot_access_analytics`
- **Nội dung test**: Đảm bảo thành viên thường không thể truy cập API thống kê (trả về 403).
- **Kết quả**: `pass`

#### Test Case 2: `test_admin_can_get_dashboard_stats`
- **Nội dung test**: Kiểm tra Admin lấy stats thành công và dữ liệu được ghi vào cache.
- **Kết quả**: `pass`

#### Test Case 3: `test_admin_can_get_chart_data`
- **Nội dung test**: Kiểm tra lấy dữ liệu vẽ biểu đồ đúng định dạng ngày tháng.
- **Kết quả**: `pass`

#### Test Case 4: `test_admin_can_get_top_posts`
- **Nội dung test**: Kiểm tra danh sách bài viết nổi bật trả về đầy đủ các trường views/likes/comments và author.
- **Kết quả**: `pass`

#### Test Case 5: `test_admin_can_get_top_users`
- **Nội dung test**: Kiểm tra danh sách thành viên tích cực được sắp xếp đúng theo số bài viết + bình luận.
- **Kết quả**: `pass`

#### Test Case 6: `test_admin_can_get_recent_activities`
- **Nội dung test**: Kiểm tra API trả về danh sách lịch sử tương tác mới nhất.
- **Kết quả**: `pass`

---

### 2. `tests/Feature/Api/Admin/PostApprovalTest.php` (Duyệt bài viết)

#### Test Case 7: `test_admin_can_list_pending_posts`
- **Nội dung test**: Lấy danh sách bài viết đang chờ duyệt.
- **Kết quả**: `pass`

#### Test Case 8: `test_pending_posts_list_includes_author_and_category`
- **Nội dung test**: Kiểm tra thông tin tác giả và danh mục có đính kèm đầy đủ.
- **Kết quả**: `pass`

#### Test Case 9: `test_pending_posts_list_can_filter_by_category`
- **Nội dung test**: Kiểm tra lọc bài viết chờ duyệt theo category.
- **Kết quả**: `pass`

#### Test Case 10: `test_admin_can_approve_pending_post`
- **Nội dung test**: Kiểm tra admin duyệt bài thành công, bài viết chuyển sang PUBLISHED.
- **Kết quả**: `pass`

#### Test Case 11: `test_approve_returns_error_for_non_pending_post`
- **Nội dung test**: Không thể duyệt bài viết không ở trạng thái PENDING.
- **Kết quả**: `pass`

#### Test Case 12: `test_admin_can_reject_pending_post_with_reason`
- **Nội dung test**: Kiểm tra từ chối duyệt bài kèm lý do.
- **Kết quả**: `pass`

#### Test Case 13: `test_reject_requires_reason_with_minimum_10_characters`
- **Nội dung test**: Validation lý do từ chối phải từ 10 ký tự trở lên.
- **Kết quả**: `pass`

#### Test Case 14: `test_reject_requires_reason_field`
- **Nội dung test**: Validation bắt buộc truyền lý do từ chối.
- **Kết quả**: `pass`

#### Test Case 15: `test_member_cannot_access_approval_endpoints`
- **Nội dung test**: Member thường không có quyền truy cập endpoint duyệt bài.
- **Kết quả**: `pass`

#### Test Case 16: `test_moderator_cannot_access_approval_endpoints`
- **Nội dung test**: Moderator không được phép duyệt bài viết (chỉ Admin).
- **Kết quả**: `pass`

#### Test Case 17: `test_admin_can_list_rejected_posts`
- **Nội dung test**: Lấy danh sách các bài viết bị từ chối duyệt.
- **Kết quả**: `pass`

#### Test Case 18: `test_rejected_posts_list_can_filter_by_date_range`
- **Nội dung test**: Lọc danh sách bài bị từ chối theo khoảng ngày.
- **Kết quả**: `pass`

#### Test Case 19: `test_pending_posts_paginated_with_20_per_page_by_default`
- **Nội dung test**: Kiểm tra pagination mặc định 20 bài viết mỗi trang.
- **Kết quả**: `pass`

#### Test Case 20: `test_guest_cannot_access_approval_endpoints`
- **Nội dung test**: Guest chưa login bị chặn truy cập.
- **Kết quả**: `pass`

---

### 3. `tests/Feature/Api/Admin/UserManagementTest.php` (Quản lý Thành viên)

#### Test Case 21: `test_non_admin_cannot_access_user_management`
- **Nội dung test**: Lớp bảo mật route chặn Member/Mod truy cập.
- **Kết quả**: `pass`

#### Test Case 22: `test_admin_can_list_users`
- **Nội dung test**: Admin lấy danh sách user và kiểm tra cấu trúc JSON trả về.
- **Kết quả**: `pass`

#### Test Case 23: `test_admin_can_filter_users_by_role_and_status`
- **Nội dung test**: Bộ lọc filter theo Spatie roles và theo status cấm hoạt động.
- **Kết quả**: `pass`

#### Test Case 24: `test_admin_can_show_user_details`
- **Nội dung test**: Xem chi tiết thành viên kèm đếm posts.
- **Kết quả**: `pass`

#### Test Case 25: `test_admin_cannot_change_own_role`
- **Nội dung test**: Rào cản validation tự đổi vai trò của bản thân.
- **Kết quả**: `pass`

#### Test Case 26: `test_admin_can_change_other_user_role`
- **Nội dung test**: Đổi vai trò của người khác thành công.
- **Kết quả**: `pass`

#### Test Case 27: `test_moderator_cannot_assign_higher_role`
- **Nội dung test**: Rào cản phân cấp vai trò gán quyền.
- **Kết quả**: `pass`

#### Test Case 28: `test_admin_can_ban_and_unban_user`
- **Nội dung test**: Cấm tài khoản kèm lý do + thời hạn cấm, sau đó unban thành công.
- **Kết quả**: `pass`

#### Test Case 29: `test_banned_user_cannot_login`
- **Nội dung test**: Tài khoản bị cấm không được phép đăng nhập.
- **Kết quả**: `pass`

#### Test Case 30: `test_admin_cannot_delete_self_or_other_admin`
- **Nội dung test**: Bảo vệ admin không tự xóa chính mình và không xóa admin khác.
- **Kết quả**: `pass`

#### Test Case 31: `test_admin_can_delete_user_and_cascade_soft_delete`
- **Nội dung test**: Soft delete user và tự động soft delete các posts, comments liên quan trong transaction.
- **Kết quả**: `pass`

---

### 4. `tests/Feature/Api/ReportTest.php` (Quản lý Báo cáo vi phạm)

#### Test Case 32: `test_guest_cannot_submit_report`
- **Nội dung test**: Đảm bảo khách chưa đăng nhập không thể gửi báo cáo.
- **Kết quả**: `pass`

#### Test Case 33: `test_member_can_submit_report_on_post`
- **Nội dung test**: Thành viên gửi báo cáo vi phạm bài viết.
- **Kết quả**: `fail` (Đã khắc phục thành `pass`)
- **Nguyên nhân**: API Resource trả về cấu trúc lồng `data.reportable.type = 'post'` nhưng assertion cũ kiểm tra ở root `data.reportable_type`. Ngoài ra, tại endpoint tạo report, Model vừa được tạo chưa kịp eager load quan hệ `reportable` nên trả về null.
- **Các bước giải quyết**:
  1. Cập nhật `ReportController@submit` gọi thêm `$report->load('reportable');` trước khi trả response.
  2. Cập nhật assertion kiểm tra đúng trường `data.reportable.type`.

#### Test Case 34: `test_member_can_submit_report_on_comment`
- **Nội dung test**: Thành viên gửi báo cáo vi phạm bình luận.
- **Kết quả**: `fail` (Đã khắc phục thành `pass`)
- **Nguyên nhân**: Trùng nguyên nhân của Test Case 33 (eager load quan hệ `reportable` và cấu trúc JSON).
- **Các bước giải quyết**:
  1. Đồng bộ sửa lỗi từ Test Case 33.
  2. Cập nhật assertion kiểm tra đúng trường `data.reportable.type`.

#### Test Case 35: `test_user_cannot_exceed_hourly_rate_limit`
- **Nội dung test**: Giới hạn tối đa 5 reports mỗi giờ cho mỗi user.
- **Kết quả**: `pass`

#### Test Case 36: `test_non_admin_cannot_access_admin_endpoints`
- **Nội dung test**: Chặn Member/Mod truy cập các api admin reports.
- **Kết quả**: `pass`

#### Test Case 37: `test_admin_can_list_pending_reports`
- **Nội dung test**: Admin lấy danh sách báo cáo chờ xử lý.
- **Kết quả**: `fail` (Đã khắc phục thành `pass`)
- **Nguyên nhân**: Response của Admin Controller trả về dạng bọc cấu trúc phân trang `{ data: { data: [...], pagination: {...} } }`, nhưng assertion cũ kiểm tra cấu trúc trực tiếp ở root `data`.
- **Các bước giải quyết**:
  1. Cập nhật cấu trúc `assertJsonStructure` khớp với định dạng phân trang thực tế (lồng trong `data.data`).

#### Test Case 38: `test_admin_can_resolve_report`
- **Nội dung test**: Admin duyệt xóa nội dung bị báo cáo.
- **Kết quả**: `fail` (Đã khắc phục thành `pass`)
- **Nguyên nhân**:
  1. Test gọi `putJson` trong khi route chỉ định method `post` (trả về lỗi 405).
  2. `Admin/ReportController` không truyền User đang thao tác cho `ReportService`, dẫn đến Service bị lỗi Null Pointer khi đọc ID user để cập nhật người xử lý.
  3. Assertion cũ dùng `assertDatabaseMissing` trên bảng `posts`, nhưng hệ thống đã cập nhật Soft Delete cho posts nên bản ghi vẫn tồn tại trong database.
- **Các bước giải quyết**:
  1. Sửa cuộc gọi test thành `postJson`.
  2. Cập nhật `Admin/ReportController@resolve` truyền `$request->user()` thông qua method `withUser()`.
  3. Thay đổi assertion thành `assertSoftDeleted('posts')`.

#### Test Case 39: `test_admin_can_dismiss_report`
- **Nội dung test**: Admin bác bỏ báo cáo vi phạm.
- **Kết quả**: `fail` (Đã khắc phục thành `pass`)
- **Nguyên nhân**: Gọi sai method `putJson` (route chỉ định `post`) và Controller thiếu truyền user context cho Service.
- **Các bước giải quyết**:
  1. Thay thế cuộc gọi thành `postJson`.
  2. Cập nhật `Admin/ReportController@dismiss` truyền `$request->user()`.
