---
task_id: "01"
title: "Database Infrastructure for User Profile"
description: "Thêm các cột mới vào bảng users và cấu hình Enum, Models"
type: IMPLEMENTATION
phase: 1
status: completed
estimated_effort: S
complexity: low
risk: low
depends_on: []
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
- **Applicable Workflows**: `/execute-database-task`
- **Applicable Skills**: `bks-be-database-standard`

---

# Task 01: Database Infrastructure for User Profile

## Description
Task này thực hiện thay đổi schema bảng `users` để hỗ trợ lưu trữ thông tin profile (avatar, ngày sinh, quê quán, giới tính, bio), tạo Enum `Gender` và cấu hình lại model `User`.

## Current State (Already Exists)
- **Tables**: `users`
- **Models**: `App\Models\User`

## Requirements

### 1. Migrations (NEW)
- **File path**: `database/migrations/xxxx_xx_xx_xxxxxx_add_profile_fields_to_users_table.php`
- **Logic flow**:
  1. Thêm cột `avatar_url` (string, nullable)
  2. Thêm cột `dob` (date, nullable)
  3. Thêm cột `hometown` (string, nullable)
  4. Thêm cột `gender` (enum: 'male', 'female', 'other', nullable)
  5. Thêm cột `bio` (text hoặc string(1000), nullable)
  6. Function `down()` phải drop các cột này.

### 2. Enums (NEW)
- **File path**: `app/Enums/Gender.php`
- **Logic flow**:
  - Tạo Backed Enum (String) `Gender`: `MALE = 'male'`, `FEMALE = 'female'`, `OTHER = 'other'`.
  - Tạo hàm `label()` sử dụng `trans('enums.gender.male')`, ...

### 3. Models (MODIFY)
- **File path**: `app/Models/User.php`
- **Logic flow**:
  1. Thêm các cột vào `$fillable`.
  2. Thêm cast cho `dob` => `date`, `gender` => `\App\Enums\Gender::class`.
  3. Cập nhật PHPDoc.

## Status
- [x] Tạo Enum `Gender`
- [x] Tạo file migration `add_profile_fields_to_users_table`
- [x] Cập nhật model `User`
- [x] Run `php artisan migrate:rollback` và `php artisan migrate` để test DB.
- [x] Run `php artisan code:format`
- [x] Run `php artisan test`

## Acceptance Criteria
1. Bảng `users` có đủ các cột như yêu cầu và rollback hoạt động tốt.
2. Enum Gender gọi hàm `label()` trả về đúng localization text.
3. Chạy được code formatting và không làm fail test.
