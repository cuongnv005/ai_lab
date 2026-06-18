---
title: "Admin - Dashboard UI"
description: "Frontend UI cho Admin Dashboard: Approval Queue, Report Queue, Statistics"
status: completed
priority: medium
category: frontend
assignee: null
dependencies: ['task-01-approval-queue-api', 'task-02-report-queue-api', 'task-04-user-management-api', 'task-05-analytics-api', 'task-06-post-crud-api', 'task-07-comment-management-api', 'task-08-category-management-api']
---

## Overview
Xây dựng giao diện Admin Dashboard cho phép Admin quản lý bài viết và báo cáo vi phạm.

## Requirements

### Pages
1. `/admin/dashboard` - Trang tổng quan
   - Statistics cards: Tổng users, Tổng posts, Bài chờ duyệt, Báo cáo chờ xử lý
   - Biểu đồ đơn giản (posts theo tháng)

2. `/admin/approval-queue` - Hàng đợi phê duyệt
   - Table danh sách bài PENDING
   - Columns: Tiêu đề, Tác giả, Danh mục, Ngày tạo, Actions
   - Actions: Xem chi tiết, Phê duyệt, Từ chối (có modal nhập lý do)
   - Filter: Theo danh mục

3. `/admin/reports` - Hàng đợi báo cáo
   - Table danh sách báo cáo
   - Columns: Loại, Nội dung bị báo cáo, Người báo cáo, Lý do, Ngày tạo, Actions
   - Actions: Xem chi tiết, Xóa nội dung, Bác bỏ
   - Filter: Theo status, loại (post/comment)

4. `/admin/users` - Quản lý thành viên
   - Table danh sách users
   - Actions: Cấm tài khoản, đổi role

5. `/admin/posts` - Quản lý bài viết
   - Table danh sách posts
   - Actions: Sửa, Xóa

6. `/admin/comments` - Quản lý bình luận
   - Table danh sách comments
   - Actions: Xóa

7. `/admin/categories` - Quản lý danh mục
   - Table danh sách categories
   - Actions: Thêm, Sửa, Xóa

### UI Components
- Layout admin với sidebar navigation
- Data tables với pagination
- Modal xác nhận cho approve/reject/resolve/dismiss
- Toast notifications cho feedback

### Authorization
- Route guard: Chỉ cho phép `role = admin` truy cập
- Redirect về trang chủ nếu không phải admin

## Acceptance Criteria
- [ ] Layout admin với sidebar
- [ ] Trang Approval Queue hiển thị đúng danh sách
- [ ] Có thể phê duyệt/từ chối bài viết
- [ ] Trang Reports hiển thị đúng danh sách báo cáo
- [ ] Có thể xử lý (resolve/dismiss) báo cáo
- [ ] Trang Users, Posts, Comments, Categories hoạt động đầy đủ
- [ ] Responsive cho mobile
- [ ] Playwright E2E tests

## Technical Notes
- Dùng shadcn/ui Table, Dialog, Button
- React Query cho data fetching
- Role-based routing guard
- Implement sau khi tất cả Backend API tasks hoàn thành
