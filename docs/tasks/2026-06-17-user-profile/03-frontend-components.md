---
task_id: "03"
title: "Frontend UI Components for User Profile"
description: "Tạo các components như ProfileHeader, AvatarUpload, ProfileInfo, ProfileEditForm, UserPostList."
type: IMPLEMENTATION
phase: 3
status: completed
estimated_effort: L
complexity: medium
risk: medium
depends_on: ["02"]
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
- **Applicable Skills**: `bks-fe-implement-feature`

---

# Task 03: Frontend UI Components for User Profile

## Description
Xây dựng các thành phần UI để hiển thị profile cá nhân, chỉnh sửa và upload hình ảnh qua ImgBB, cũng như hiển thị danh sách các bài viết gần đây. Đảm bảo i18n cho các nhãn.

## Requirements

### 1. Avatar Component (MODIFY)
- Cập nhật logic: Nếu không có `avatar_url`, sử dụng API của DiceBear với seed là `id` của user: `https://api.dicebear.com/7.x/initials/svg?seed={userId}`

### 2. Avatar Upload Component (NEW)
- Upload ảnh trực tiếp lên ImgBB bằng API Key của ImgBB (có thể lưu ở `.env.local`).
- Khi user chọn file -> upload lên ImgBB -> lấy `url` từ response -> gán vào state/form.

### 3. Profile Info Component (NEW)
- Component hiển thị text tĩnh (`dob`, `hometown`, `gender.label`, `bio`).

### 4. Profile Edit Form (NEW)
- Form sử dụng React Hook Form + Zod.
- Fields: name (required), dob, hometown, gender (select/radio), bio (textarea max 1000).
- Input: gọi hàm mutation onSubmit.

### 5. User Post List (NEW)
- Component render giao diện danh sách post sử dụng component hiển thị có sẵn, truyền data pagination từ API.

## Status
- [x] Cập nhật Avatar component với DiceBear logic
- [x] Tạo chức năng upload ảnh ImgBB
- [x] Tạo ProfileInfo và ProfileEditForm
- [x] Tạo UserPostList
- [x] Run `pnpm lint`

## Acceptance Criteria
1. Component hiển thị đầy đủ, không lỗi giao diện. Form validate chuẩn Zod. Upload ảnh thành công và hiển thị ảnh ngay lập tức.
