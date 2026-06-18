---
task_id: "04"
title: "Frontend Pages and API Integration"
description: "Tạo trang routing và tích hợp React Query (Tanstack Query) kết nối API backend."
type: IMPLEMENTATION
phase: 3
status: completed
estimated_effort: M
complexity: medium
risk: low
depends_on: ["03"]
rule_refs: []
date: "2026-06-17"
changelog:
  - version: 1.0
    date: "2026-06-17"
    summary: Initial task specification.
---

# Context
- **Requirement**: [04-user-profile.md](../../requirements/04-user-profile.md)
- **Parent Task**: [2026-06-17-user-profile-implementation-tasks.md](../2026-06-17-user-profile-implementation-tasks.md)
- **Applicable Workflows**: `/fe-implementation`
- **Applicable Skills**: `bks-fe-api-integration`

---

# Task 04: Frontend Pages and API Integration

## Description
Tạo trang xem profile user khác và trang thiết lập profile của bản thân. Tích hợp hook fetch data và gửi request update.

## Requirements

### 1. API Repository (NEW)
- **File path**: `frontend/features/users/services/user.repository.ts`
- Tạo các hàm fetch profile, fetch user posts, update profile bằng axios instance.

### 2. Hooks (NEW)
- Tạo các hooks dựa trên TanStack Query: `useUserProfile(id)`, `useUserPosts(id, page)`, `useUpdateUserProfile()`.

### 3. Pages (NEW)
- **File path**: `frontend/app/[locale]/(public)/users/[id]/page.tsx`
  - Sử dụng layout cơ bản. Lấy tham số `id`. Gọi hook `useUserProfile` và hiển thị Profile Header, Profile Info, User Post List.
- **File path**: Có thể tích hợp edit vào trang profile cá nhân hoặc trang view, nếu `session.user.id === id`, cho phép hiện nút "Edit". Nhấn vào thì mở modal chứa ProfileEditForm.

## Status
- [x] Viết repository api
- [x] Viết hooks query / mutation
- [x] Tạo page routing `users/[id]/page.tsx`
- [x] Tích hợp logic auth view vs owner view (hiển thị nút edit)
- [x] Xử lý modal/tab cho ProfileEditForm
- [x] Run `pnpm lint`
- [x] Run `pnpm test` (nếu có)

## Acceptance Criteria
1. Truy cập `/users/1` hiển thị thành công. Nút Edit chỉ hiện nếu user login có id = 1.
2. Edit gửi API cập nhật, khi thành công query tự động invalidate.
