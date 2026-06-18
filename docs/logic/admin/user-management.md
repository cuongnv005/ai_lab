---
title: "Admin User Management API"
description: "Logic nghiệp vụ quản lý thành viên cho Admin: liệt kê, xem chi tiết, đổi vai trò, cấm hoạt động và xóa tài khoản."
version: "1.0.0"
date: "2026-06-11"
status: "approved"
---

## 🎯 Tổng quan (Overview)
API cung cấp cho Admin (`role = admin`) quyền hạn đầy đủ để quản lý tài khoản thành viên trong hệ thống bao gồm: đổi vai trò (role), cấm tài khoản (ban/unban) và xóa tài khoản (soft delete cascade).

## 🚀 Luồng xử lý (Flows)

### 1. Đổi vai trò (Change Role)
- **Endpoint**: `PUT /api/admin/users/{id}/role`
- **Luồng logic**:
  1. Xác thực người dùng hiện tại là Admin.
  2. Tìm kiếm thông tin user cần thay đổi theo ID.
  3. Xác thực Business Rules:
     - Không được tự sửa role của chính mình.
     - Role đích gán cho user không được có cấp bậc cao hơn role cao nhất của người sửa (Admin được phép gán tối đa Admin).
  4. Thực hiện cập nhật role qua Spatie Laravel Permission.
  5. Ghi log activity và lưu vết thay đổi.

### 2. Cấm và gỡ cấm (Ban & Unban User)
- **Endpoint**: 
  - Ban: `POST /api/admin/users/{id}/ban`
  - Unban: `POST /api/admin/users/{id}/unban`
- **Luồng logic (Ban)**:
  1. Yêu cầu lý do cấm (`reason`, độ dài tối thiểu 10 ký tự) và thời hạn cấm tùy chọn (`duration` theo số ngày).
  2. Cập nhật `status` của user thành `UserStatus::BANNED`.
  3. Cập nhật `ban_reason` và `banned_until` (tính từ thời điểm hiện tại thêm `duration` ngày).
  4. Ghi log activity.
- **Luồng logic (Unban)**:
  1. Thay đổi trạng thái user thành `UserStatus::ACTIVE`.
  2. Reset các trường `ban_reason` và `banned_until` về `null`.
  3. Ghi log activity.

### 3. Xóa tài khoản (Soft Delete Cascade)
- **Endpoint**: `DELETE /api/admin/users/{id}`
- **Luồng logic**:
  1. Xác thực Business Rules:
     - Không được tự xóa tài khoản của chính mình.
     - Không được xóa tài khoản admin khác để bảo vệ an toàn hệ thống.
  2. Bắt đầu DB Transaction:
     - Thực hiện soft delete user bằng cách gán `deleted_at`.
     - Thực hiện soft delete toàn bộ posts liên quan của user đó.
     - Thực hiện soft delete toàn bộ comments liên quan của user đó.
  3. Ghi log activity.

## 🛡️ Business Rules (Luật nghiệp vụ)

| ID | Tên | Chi tiết |
|---|---|---|
| BR-USER-001 | user-role-hierarchy | Quản trị viên (Admin) > Kiểm duyệt viên (Moderator) > Thành viên (Member). |
| BR-USER-002 | user-self-protection | Thành viên không thể tự cấm, thay đổi role hoặc tự xóa tài khoản của chính mình thông qua API quản trị này. |
| BR-USER-003 | user-ban-restriction | User bị ban không thể đăng nhập. Trường hợp ban có thời hạn, khi đã hết hạn thì hệ thống sẽ tự động unban và cho phép đăng nhập lại tại thời điểm login tiếp theo. |
| BR-USER-004 | user-admin-protection | Không admin nào được phép xóa tài khoản của một admin khác để tránh việc chiếm đoạt hay lạm quyền. |
