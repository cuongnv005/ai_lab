---
title: "Admin - Category Management API"
description: "Backend API cho Admin để quản lý danh mục diễn đàn: thêm, sửa, xóa categories"
status: completed
priority: medium
category: backend
assignee: Antigravity
dependencies: []
---

## Overview
Tạo API cho Admin để quản lý danh mục diễn đàn: tạo danh mục mới, cập nhật, xóa và sắp xếp thứ tự hiển thị.

## Requirements

### API Endpoints

1. `GET /api/admin/categories` - Lấy danh sách tất cả categories
   - Sort: theo `sort_order` asc
   - Include: id, name, slug, description, sort_order, posts_count
   - Response: full list (không pagination vì ít categories)

2. `GET /api/admin/categories/{id}` - Xem chi tiết category
   - Include: thông tin cơ bản, danh sách bài viết (có pagination)

3. `POST /api/admin/categories` - Tạo category mới
   - Body: `name` (required, unique), `slug` (required, unique - Admin tự nhập), `description` (optional)
   - Validation: name tối thiểu 3 ký tự, không trùng
   - Validation: slug tối thiểu 3 ký tự, không trùng (regex: ^[a-z0-9-]+$)
   - Response: success message + created category

4. `PUT /api/admin/categories/{id}` - Cập nhật category
   - Body: `name`, `slug`, `description`
   - Validation: name unique (trừ chính nó)
   - Validation: slug unique (trừ chính nó)
   - Response: success message + updated category

5. `DELETE /api/admin/categories/{id}` - Xóa category
   - Validation: không thể xóa category đang có bài viết
   - Nếu có bài viết: trả về lỗi với danh sách bài viết cần chuyển
   - Response: success message nếu xóa được

6. `POST /api/admin/categories/{id}/move-posts` - Chuyển bài viết sang category khác
   - Body: `target_category_id`
   - Dùng trước khi xóa category có bài viết
   - Response: success message + số lượng posts đã chuyển

### Authorization
- Chỉ Admin (`role = admin`) mới được truy cập
- Middleware: `role:admin`

### Business Rules
- BR-CATEGORY-001: Slug phải unique trong hệ thống
- BR-CATEGORY-002: Không xóa category có posts

## Acceptance Criteria
- [x] API trả về đúng danh sách categories
- [x] API tạo category với slug do Admin nhập (không auto-generate)
- [x] Validation slug: lowercase, alphanumeric + hyphen, unique
- [x] API update không cho phép trùng name và slug
- [x] Không xóa category đang có bài viết
- [x] API reorder cập nhật sort_order đúng
- [x] Chỉ Admin mới truy cập được các API này
- [x] Unit test coverage ≥ 80%

## Technical Notes
- Dùng CategoryService để xử lý logic
- Validation slug: regex ^[a-z0-9-]+$ và unique trong bảng categories
- Cân nhắc thêm `deleted_at` nếu cần soft delete categories

## Related BRs
- PROPOSED_BR:admin-category-management
