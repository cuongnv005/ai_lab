---
task_id: "02"
title: "API Endpoints for User Profile"
description: "Tạo các endpoint để get profile, update profile và get danh sách bài viết."
type: IMPLEMENTATION
phase: 2
status: completed
estimated_effort: M
complexity: medium
risk: low
depends_on: ["01"]
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
- **Applicable Workflows**: `/execute-api-task`
- **Applicable Skills**: `bks-be-api-standard`

---

# Task 02: API Endpoints for User Profile

## Description
Xây dựng 3 endpoints để lấy thông tin người dùng, danh sách bài viết của người đó và cập nhật thông tin profile cá nhân.

## Requirements

### 1. Controllers (NEW)
- **File path**: `app/Http/Controllers/Api/UserProfileController.php`
- **Methods**:
  - `show(int $id)`: Trả về public profile.
  - `update(UpdateUserProfileRequest $request)`: Lấy user hiện tại, validate, gọi service cập nhật.
  - `posts(int $id)`: Gọi service lấy danh sách bài viết có phân trang.

### 2. FormRequests (NEW)
- **File path**: `app/Http/Requests/Api/UserProfile/UpdateUserProfileRequest.php`
- **Validation**:
| Field | Presence | Type | Boundaries | Format |
|-------|----------|------|------------|--------|
| `name` | `required` | `string` | `max:255` | — |
| `avatar_url` | `nullable` | `string` | `url` | — |
| `dob` | `nullable` | `date` | `before:today` | `Y-m-d` |
| `hometown` | `nullable` | `string` | `max:255` | — |
| `gender` | `nullable` | `enum` | `Rule::enum(Gender::class)` | — |
| `bio` | `nullable` | `string` | `max:1000` | — |

### 3. Services (NEW/MODIFY)
- **File path**: `app/Services/Api/User/UserProfileService.php` (tạo mới)
- **Logic flow**:
  1. `getProfile(int $id)`
  2. `updateProfile(User $user, UpdateProfileData $dto)`
  3. Đăng ký vào `ApiFactory`.
- **File path**: `app/Services/Api/Post/PostService.php` (sửa lại nếu cần, hoặc viết trong `UserProfileService`)
  - Viết hàm lấy paginate post của user ID: `getPostsByUserId(int $userId)`. Trả về LengthAwarePaginator.

### 4. DTOs (NEW)
- **File path**: `app/DTOs/Api/User/UpdateProfileData.php`

### 5. Resources (NEW)
- **File path**: `app/Http/Resources/Api/UserProfileResource.php`
  - Chỉ trả các field: `id`, `name`, `avatar_url`, `dob`, `hometown`, `gender` (value & label), `bio`, `created_at`, `roles` (chỉ name roles).
- **File path**: Dùng `PostResource` hoặc `PostListResource` hiện có cho response danh sách post.

### 6. Routes (MODIFY)
- **File path**: `routes/api.php`
- Thêm routes public: `GET /users/{id}` và `GET /users/{id}/posts`
- Thêm route auth sanctum: `PUT /users/profile`

## API Endpoints Summary

| Method | URI | Description | Auth |
|--------|-----|-------------|------|
| `GET` | `/api/users/{id}` | Lấy thông tin public profile | Guest |
| `GET` | `/api/users/{id}/posts` | Lấy danh sách post phân trang | Guest |
| `PUT` | `/api/users/profile` | Sửa thông tin cá nhân | Sanctum |

## Status
- [x] Tạo DTO
- [x] Tạo FormRequest
- [x] Tạo Resource
- [x] Tạo UserProfileService và đăng ký ApiFactory
- [x] Viết hàm lấy posts của user trong PostService
- [x] Tạo Controller
- [x] Cập nhật Routes
- [x] Run `php artisan code:format`
- [x] Run `php artisan test`

## Acceptance Criteria
1. Gọi API `GET /api/users/{id}` thành công trả đúng resource format (không có trường email).
2. Gọi API `PUT /api/users/profile` thành công với user tự cập nhật cho mình. Update được DB. Role và Email không bị đổi.
3. Form validation chặn các case invalid (ví dụ bio > 1000 ký tự).
