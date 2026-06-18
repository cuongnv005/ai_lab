---
title: "Admin - User Management API"
description: "Backend API cho Admin để quản lý thành viên: cấm tài khoản, đổi role, xem danh sách"
status: completed
priority: high
category: backend
assignee: null
dependencies: []
---

## Overview
Tạo API cho Admin để quản lý thành viên trong hệ thống. Admin có thể cấm tài khoản, thay đổi role (member → mod/admin, hoặc ngược lại), và xem danh sách thành viên.

## Requirements

### API Endpoints

1. `GET /api/admin/users` - Lấy danh sách thành viên
   - Filter: theo role, theo trạng thái (active/banned), search theo name/email
   - Sort: mới nhất trước
   - Pagination: 20 items/page
   - Include: id, name, email, role, status, created_at, posts_count

2. `GET /api/admin/users/{id}` - Xem chi tiết thành viên
   - Include: thông tin cơ bản, bài viết, bình luận, lịch sử hoạt động

3. `PUT /api/admin/users/{id}/role` - Thay đổi role của thành viên
   - Body: `role` (member/mod/admin)
   - Validation: không thể tự thay đổi role của chính mình
   - Validation: chỉ có thể gán role thấp hơn hoặc bằng role của mình
   - Response: success message + updated user

4. `POST /api/admin/users/{id}/ban` - Cấm tài khoản
   - Body: `reason` (required, min 10 chars), `duration` (optional, days - mặc định vĩnh viễn)
   - Update user status: BANNED
   - Response: success message

5. `POST /api/admin/users/{id}/unban` - Gỡ cấm tài khoản
   - Update user status: ACTIVE
   - Response: success message

6. `DELETE /api/admin/users/{id}` - Xóa tài khoản (soft delete)
   - Validation: không thể xóa tài khoản của chính mình
   - Validation: không thể xóa tài khoản admin khác
   - Soft delete user và các bài viết/bình luận của họ
   - Response: success message

### Authorization
- Chỉ Admin (`role = admin`) mới được truy cập
- Middleware: `role:admin`

### Business Rules
- PROPOSED_BR:user-role-hierarchy: Admin > Moderator > Member
- PROPOSED_BR:user-self-protection: Không thể tự thay đổi/xóa chính mình
- PROPOSED_BR:user-ban-restriction: User bị ban không thể đăng nhập

## Acceptance Criteria
- [x] API trả về đúng danh sách users với filter/sort
- [x] API change role hoạt động đúng với validation
- [x] API ban/unban cập nhật status đúng
- [x] API xóa user chỉ soft delete, không xóa cứng
- [x] Chỉ Admin mới truy cập được các API này
- [x] Unit test coverage ≥ 80%

## Technical Notes
- Dùng UserService để xử lý logic
- FormRequest cho validation
- Policy cho authorization (UserPolicy)
- Thêm enum UserStatus nếu chưa có

## Related BRs
- BR-AUTH-001: User Authentication (từ requirement chính)
- BR-USER-001: User Role Hierarchy
- BR-USER-002: User Self Protection
- BR-USER-003: User Ban Restriction
- BR-USER-004: Admin Protection
