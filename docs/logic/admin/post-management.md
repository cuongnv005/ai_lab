---
title: "Admin Post Management API"
description: "Logic nghiệp vụ quản lý bài viết cho Admin: tạo bài viết trực tiếp, cập nhật, xóa mềm kèm cảnh báo tương tác, xóa cứng và khôi phục bài viết."
version: "1.0.0"
date: "2026-06-11"
status: "approved"
---

## 🎯 Tổng quan (Overview)
API cung cấp cho Admin (`role = admin`) quyền hạn đầy đủ để quản lý trực tiếp toàn bộ bài viết trong hệ thống, bao gồm tự do xuất bản bài viết không qua kiểm duyệt, chỉnh sửa/xóa bài viết của người khác, khôi phục hoặc xóa vĩnh viễn dữ liệu.

## 🚀 Luồng xử lý (Flows)

### 1. Lấy danh sách bài viết (List Posts)
- **Endpoint**: `GET /api/admin/posts`
- **Luồng logic**:
  1. Hỗ trợ tìm kiếm theo tiêu đề (`title`) hoặc nội dung (`content`).
  2. Lọc theo trạng thái bài viết (`status`), chuyên mục (`category_id`), tác giả (`author`/`user_id`).
  3. Mặc định sắp xếp theo `created_at` giảm dần.
  4. Phân trang cố định 20 bản ghi trên mỗi trang.

### 2. Tạo bài viết Admin (Create Post)
- **Endpoint**: `POST /api/admin/posts`
- **Luồng logic**:
  1. Admin gửi các thông tin bài viết bao gồm `title`, `content`, `category_id`, và `tags` tùy chọn.
  2. Hệ thống phân tích văn bản hiển thị BBCode và trích xuất tóm tắt.
  3. Áp dụng luật tự động duyệt bài: Trạng thái ban đầu luôn được thiết lập là `PUBLISHED` (2) thay vì `PENDING` (1).
  4. Tạo bài viết, liên kết tags, ghi nhận log activity của hệ thống.

### 3. Cập nhật bài viết (Update Post)
- **Endpoint**: `PUT /api/admin/posts/{id}`
- **Luồng logic**:
  1. Cho phép cập nhật tất cả thông tin bao gồm thay đổi trạng thái (`status`) sang bất kỳ giá trị nào.
  2. Có thể chỉnh sửa cả bài viết đã bị xóa mềm (nếu truy cập qua id hợp lệ có kèm soft delete).
  3. Sync tags và cập nhật bản ghi trong DB Transaction. Ghi log activity.

### 4. Xóa bài viết (Soft Delete with Warning)
- **Endpoint**: `DELETE /api/admin/posts/{id}`
- **Luồng logic**:
  1. Đếm số lượng bình luận (`comments`) và lượt thích (`likes`) của bài viết.
  2. Nếu có tương tác (`comments_count + likes_count > 0`) và request không gửi tham số xác nhận `confirm = true`, hệ thống ném lỗi ValidationException (422) yêu cầu xác nhận.
  3. Nếu không có tương tác hoặc đã xác nhận `confirm = true`, thực hiện xóa mềm bài viết (`deleted_at` được cập nhật).

### 5. Xóa cứng bài viết (Force Delete)
- **Endpoint**: `POST /api/admin/posts/{id}/force-delete`
- **Luồng logic**:
  1. Chỉ cho phép thực hiện đối với các bài viết đã bị xóa mềm trước đó. Nếu bài viết chưa bị xóa mềm, ném lỗi 422.
  2. Ghi nhận log thủ công hành động `force-deleted`.
  3. Xóa vĩnh viễn bài viết và toàn bộ quan hệ phụ thuộc khỏi database.

### 6. Khôi phục bài viết (Restore Post)
- **Endpoint**: `POST /api/admin/posts/{id}/restore`
- **Luồng logic**:
  1. Tìm bài viết trong danh sách đã xóa mềm.
  2. Khôi phục bài viết bằng cách gán `deleted_at = null`.
  3. Ghi log activity khôi phục của Admin.

---

## 🛡️ Business Rules (Luật nghiệp vụ)

| ID | Tên | Chi tiết |
|---|---|---|
| BR-POST-002 | admin-bypass-approval | Bài viết do Admin/Moderator tạo sẽ tự động được chuyển sang trạng thái `PUBLISHED` mà không cần đi qua hàng đợi duyệt bài. |
| BR-POST-003 | admin-edit-any-post | Admin có quyền cập nhật tiêu đề, nội dung, chuyên mục, thẻ tags và trạng thái (`status`) của bất kỳ bài viết nào trong hệ thống. |
| BR-POST-004 | admin-post-delete-warning | Khi thực hiện xóa một bài viết đã có tương tác (được thích hoặc bình luận), API yêu cầu Admin phải xác nhận rõ ràng bằng tham số `confirm=true` để tránh vô tình xóa nhầm dữ liệu quan trọng. |
| BR-POST-005 | admin-hard-delete-restriction | Hành động xóa cứng (force delete) chỉ được thực hiện trên những bài viết đã ở trạng thái xóa mềm (soft deleted) để tránh phá hủy trực tiếp dữ liệu đang hoạt động. |
