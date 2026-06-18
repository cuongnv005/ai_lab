---
title: User Profile Feature
description: Tính năng xem và chỉnh sửa thông tin cá nhân (Profile) của User, bao gồm upload avatar qua imgbb và hiển thị danh sách bài viết gần nhất.
status: pending_implementation
date: 2026-06-17
version: 1.0
---

# User Profile

## 1. OVERVIEW

Hệ thống cần bổ sung trang User Profile.
- **Quyền truy cập:**
  - Bất kỳ ai (kể cả Guest) cũng có thể xem profile của một User (thông tin public và danh sách bài viết).
  - User chỉ được phép chỉnh sửa profile của chính mình.
- **Hiển thị Avatar:**
  - Avatar hình tròn.
  - Nếu User chưa có avatar, sử dụng API của DiceBear (e.g. `initials`) để render avatar mặc định dựa trên ID của user đó.
  - Upload avatar: Khi User tải ảnh lên, frontend sẽ gọi API của **ImgBB** để lấy link ảnh, sau đó lưu link này vào cơ sở dữ liệu.
- **Thông tin Profile bao gồm:**
  - Avatar (Link URL)
  - Họ và tên (Editable)
  - Ngày tháng năm sinh (Editable)
  - Quê quán (Editable)
  - Giới tính (Editable)
  - Giới thiệu bản thân (Bio - Editable, max 1000 ký tự)
  - Role (Admin, Mod, Member - Read-only)
  - Ngày tham gia (Read-only, từ `created_at`)
- **Danh sách bài viết:**
  - Hiển thị bên dưới thông tin cá nhân.
  - Danh sách 10 bài viết gần nhất của User.
  - Dạng danh sách ngắn gọn: Title, Context/Trích dẫn ngắn, ID, Thời gian đăng.
  - Có phân trang (Pagination 10 items/page).

---

## 2. DATA MODEL UPDATES

### Table: `users`
Cần tạo migration bổ sung các cột sau vào bảng `users`:
| Column | Type | Nullable | Description |
|---|---|---|---|
| `avatar_url` | string | YES | Link ảnh lấy từ ImgBB |
| `dob` | date | YES | Ngày tháng năm sinh |
| `hometown` | string | YES | Quê quán |
| `gender` | enum('male', 'female', 'other') | YES | Giới tính |
| `bio` | text/string(1000) | YES | Giới thiệu bản thân |

---

## 3. API ENDPOINTS

### 3.1. `GET /api/users/{id}`
- **Guard:** Public (Không yêu cầu auth để xem)
- **Response:** Thông tin User (`id`, `name`, `avatar_url`, `dob`, `hometown`, `gender`, `bio`, `created_at`, roles). Chú ý không trả về các thông tin nhạy cảm của người khác.

### 3.2. `GET /api/users/{id}/posts`
- **Guard:** Public
- **Query:** `page`
- **Response:** Danh sách bài viết của user (Pagination 10). Các field: `id`, `title`, `content` (trích dẫn), `created_at`.

### 3.3. `PUT /api/users/profile`
- **Guard:** Auth (Sanctum)
- **Request Body:**
  - `name`: string, required
  - `avatar_url`: string, url, nullable
  - `dob`: date, nullable
  - `hometown`: string, nullable
  - `gender`: in:male,female,other, nullable
  - `bio`: string, max:1000, nullable
- **Logic:** Cập nhật thông tin của user đang đăng nhập (`$request->user()`).

---

## 4. FRONTEND REQUIREMENTS

- **Routes:**
  - `/users/[id]` - Trang xem profile của user khác.
  - `/profile` - Trang profile cá nhân của mình (nếu đang login).
- **UI Components:**
  - ProfileHeader: Hiển thị Avatar (Fallback DiceBear), Name, Role, Joined Date.
  - ProfileInfo: Hiển thị DOB, Hometown, Gender, Bio.
  - ProfileEditForm: Mở ra khi ấn nút "Sửa thông tin". Chứa các Input, Select (Gender), Textarea (Bio).
  - AvatarUpload: Xử lý chọn ảnh, call ImgBB API, set URL vào form.
  - UserPostList: Fetch data từ `/api/users/{id}/posts` hiển thị dạng danh sách kèm phân trang.

---

## 5. BUSINESS RULES
- Role không được phép thay đổi qua API cập nhật profile.
- Guest không được chỉnh sửa profile.
- Ảnh upload trực tiếp từ Frontend lên ImgBB để giảm tải backend, backend chỉ lưu URL.
