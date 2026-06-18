---
title: "Admin - Comment Management API"
description: "Backend API cho Admin để xem và xóa bình luận"
status: completed
priority: medium
category: backend
assignee: Antigravity
dependencies: []
---

## Overview
Tạo API cho Admin để quản lý bình luận: xem danh sách bình luận và xóa bình luận vi phạm.

## Requirements

### API Endpoints

1. `GET /api/admin/comments` - Lấy danh sách bình luận
   - Filter: theo post, theo author, theo date range
   - Search: content
   - Sort: mới nhất trước
   - Pagination: 20 items/page
   - Include: id, content, author, post (id + title), parent_id, created_at

2. `GET /api/admin/comments/{id}` - Xem chi tiết bình luận
   - Include: content, author, post, replies, created_at

3. `DELETE /api/admin/comments/{id}` - Xóa bình luận
   - Soft delete comment
   - Cascade delete: Khi xóa parent comment, tất cả replies cũng bị soft delete
   - Response: success message

4. `POST /api/admin/comments/{id}/force-delete` - Xóa cứng bình luận
   - Hard delete comment và tất cả replies của nó
   - Validation: chỉ xóa soft-deleted comments
   - Response: success message

5. `POST /api/admin/comments/{id}/restore` - Khôi phục bình luận đã xóa
   - Restore soft-deleted comment
   - Response: success message

6. `GET /api/admin/comments/trashed` - Danh sách bình luận đã xóa
   - Pagination: 20 items/page
   - Include: deleted_at, deleted_by

### Authorization
- Chỉ Admin (`role = admin`) mới được truy cập
- Middleware: `role:admin`

### Business Rules
- BR-COMMENT-001: Comment bị xóa vẫn còn trong DB
- BR-COMMENT-002: Khi xóa parent comment, tất cả replies cũng bị xóa theo (cascade soft delete)
- BR-COMMENT-003: Hard delete xóa cả replies

## Acceptance Criteria
- [x] API trả về đúng danh sách comments với filter
- [x] API xóa comment soft delete đúng
- [x] Khi xóa parent, tất cả replies cũng bị soft delete theo
- [x] Hard delete xóa cả replies
- [x] Chỉ Admin mới truy cập được các API này
- [x] Unit test coverage ≥ 80%

## Technical Notes
- Dùng CommentService để xử lý logic
- Sử dụng SoftDeletes trait
- Cân nhắc cascade delete cho replies trong hard delete

## Related BRs
- PROPOSED_BR:admin-comment-management
