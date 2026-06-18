---
title: "Admin - Post CRUD API"
description: "Backend API cho Admin để quản lý bài viết: thêm, sửa, xóa bài viết trực tiếp"
status: completed
priority: high
category: backend
assignee: Antigravity
dependencies: []
---

## Overview
Tạo API cho Admin để quản lý bài viết trực tiếp: tạo bài viết mới (bỏ qua approval), chỉnh sửa bất kỳ bài viết nào, và xóa bài viết.

## Requirements

### API Endpoints

1. `GET /api/admin/posts` - Lấy danh sách tất cả bài viết
   - Filter: theo status (all/pending/published/rejected), theo category, theo author
   - Search: title, content
   - Sort: created_at desc (mặc định)
   - Pagination: 20 items/page
   - Include: id, title, author, category, status, created_at, views_count

2. `POST /api/admin/posts` - Tạo bài viết mới (Admin post)
   - Body: `title`, `content`, `category_id`, `tags[]`
   - Không cần approval - publish ngay lập tức (status = PUBLISHED)
   - Validation: giống như user tạo post
   - Response: success message + created post

3. `PUT /api/admin/posts/{id}` - Cập nhật bài viết
   - Body: `title`, `content`, `category_id`, `tags[]`, `status` (optional)
   - Admin có thể edit bất kỳ bài viết nào (không phải chỉ của mình)
   - Response: success message + updated post

4. `DELETE /api/admin/posts/{id}` - Xóa bài viết
   - Soft delete post
   - Validation: nếu post đã có comments/likes nhiều, cảnh báo trước
   - Response: success message

5. `POST /api/admin/posts/{id}/force-delete` - Xóa cứng bài viết
   - Hard delete: xóa hoàn toàn khỏi DB
   - Validation: chỉ xóa soft-deleted posts
   - Response: success message

6. `POST /api/admin/posts/{id}/restore` - Khôi phục bài viết đã xóa
   - Restore soft-deleted post
   - Response: success message

7. `GET /api/admin/posts/trashed` - Danh sách bài viết đã xóa
   - Pagination: 20 items/page
   - Include: deleted_at, deleted_by

### Authorization
- Chỉ Admin (`role = admin`) mới được truy cập
- Middleware: `role:admin`

### Business Rules
- BR-POST-002: Admin tạo post → auto PUBLISHED
- BR-POST-003: Admin có thể edit bất kỳ post nào
- BR-POST-004: Post bị xóa vẫn còn trong DB (soft delete)
- BR-POST-005: Chỉ xóa cứng sau khi đã soft delete

## Acceptance Criteria
- [x] API trả về đúng danh sách tất cả posts
- [x] Admin tạo post → status = PUBLISHED ngay
- [x] Admin edit được bất kỳ post nào
- [x] Soft delete và restore hoạt động đúng
- [x] Hard delete chỉ xóa soft-deleted posts
- [x] Chỉ Admin mới truy cập được các API này
- [x] Unit test coverage ≥ 80%

## Technical Notes
- Dùng PostService để xử lệ logic (reuse từ user endpoints)
- FormRequest cho validation
- Policy cho authorization (PostPolicy with admin bypass)
- Sử dụng SoftDeletes trait của Laravel

## Related BRs
- BR-POST-001: Post Creation (từ requirement chính)
- PROPOSED_BR:admin-post-management
