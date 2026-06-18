---
title: "Admin Comment Management API"
description: "Logic nghiệp vụ quản lý bình luận cho Admin: xem danh sách, xem chi tiết, xóa mềm cascade, xóa cứng và khôi phục bình luận."
version: "1.0.0"
date: "2026-06-11"
status: "approved"
---

## 🎯 Tổng quan (Overview)
API cung cấp cho Admin (`role = admin`) quyền hạn đầy đủ để quản lý và kiểm duyệt các bình luận trên hệ thống, bao gồm xử lý xóa bình luận vi phạm và khôi phục khi cần thiết.

## 🚀 Luồng xử lý (Flows)

### 1. Lấy danh sách bình luận (List Comments)
- **Endpoint**: `GET /api/admin/comments`
- **Luồng logic**:
  1. Hỗ trợ tìm kiếm theo nội dung bình luận (`content`).
  2. Lọc theo bài viết (`post_id`), tác giả (`author`/`user_id`), và khoảng thời gian (`from_date`, `to_date`).
  3. Mặc định sắp xếp theo thời gian mới nhất (`created_at desc`).
  4. Phân trang cố định 20 bản ghi trên mỗi trang.

### 2. Xem chi tiết bình luận (Show Comment)
- **Endpoint**: `GET /api/admin/comments/{id}`
- **Luồng logic**:
  1. Lấy thông tin bình luận (kể cả bình luận đã bị xóa mềm).
  2. Tải kèm các thông tin liên quan: Tác giả (`user`), bài viết (`post`), danh sách câu trả lời (`replies`), lượt thích (`likes`).

### 3. Xóa bình luận (Soft Delete Cascade)
- **Endpoint**: `DELETE /api/admin/comments/{id}`
- **Luồng logic**:
  1. Tìm bình luận theo ID.
  2. Trong DB Transaction:
     - Soft delete tất cả các câu trả lời con (`replies`) có liên kết (`parent_id = id`).
     - Soft delete bình luận cha.

### 4. Xóa cứng bình luận (Force Delete)
- **Endpoint**: `POST /api/admin/comments/{id}/force-delete`
- **Luồng logic**:
  1. Chỉ cho phép đối với bình luận đã bị xóa mềm. Nếu bình luận chưa bị xóa mềm, trả về lỗi 422.
  2. Ghi nhận log thủ công hành động `force-deleted`.
  3. Trong DB Transaction:
     - Xóa vĩnh viễn (force delete) tất cả replies đã bị xóa mềm của bình luận đó.
     - Xóa vĩnh viễn bình luận cha khỏi database.

### 5. Khôi phục bình luận (Restore Comment)
- **Endpoint**: `POST /api/admin/comments/{id}/restore`
- **Luồng logic**:
  1. Tìm bình luận trong danh sách đã xóa mềm.
  2. Trong DB Transaction:
     - Khôi phục bình luận cha.
     - Ghi nhận log khôi phục.
     - Khôi phục tất cả câu trả lời con (`replies`) đã bị xóa mềm trước đó.

---

## 🛡️ Business Rules (Luật nghiệp vụ)

| ID | Tên | Chi tiết |
|---|---|---|
| BR-COMMENT-001 | comment-soft-delete | Bình luận bị xóa bởi Admin sẽ được lưu giữ lại trong DB dưới dạng xóa mềm (soft delete). |
| BR-COMMENT-002 | comment-cascade-delete | Khi xóa một bình luận cha, tất cả các bình luận phản hồi (replies) trực thuộc bình luận đó cũng sẽ tự động bị xóa mềm (cascade soft delete) hoặc xóa cứng theo. |
| BR-COMMENT-003 | comment-hard-delete | Chỉ cho phép xóa cứng (force delete) những bình luận đã nằm trong thùng rác (xóa mềm). Khi xóa cứng, toàn bộ replies con cũng sẽ bị xóa vĩnh viễn khỏi DB. |
