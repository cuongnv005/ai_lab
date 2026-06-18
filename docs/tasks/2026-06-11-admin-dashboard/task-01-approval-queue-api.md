---
title: "Admin - Approval Queue API"
description: "Backend API cho Admin để duyệt/từ chối bài viết của Member lên trang chủ"
status: completed
priority: high
category: backend
assignee: null
dependencies: []
---

## Overview
Tạo API cho Admin để quản lý hàng đợi phê duyệt bài viết. Member đăng bài sẽ ở trạng thái PENDING, Admin cần duyệt để lên trang chủ.

## Requirements

### API Endpoints
1. `GET /api/admin/posts/pending` - Lấy danh sách bài viết chờ duyệt
   - Filter: theo category, theo ngày tạo
   - Pagination: 20 items/page
   - Include: author info, category, created_at

2. `POST /api/admin/posts/{id}/approve` - Phê duyệt bài viết
   - Change status: PENDING → PUBLISHED
   - Response: success message + updated post

3. `POST /api/admin/posts/{id}/reject` - Từ chối bài viết
   - Body: `reason` (required, min 10 chars)
   - Change status: PENDING → REJECTED
   - Save reject_reason to post
   - Response: success message

4. `GET /api/admin/posts/rejected` - Lấy danh sách bài bị từ chối
   - Filter: có thể lọc theo thời gian

### Authorization
- Chỉ Admin (`role = admin`) mới được truy cập
- Middleware: `role:admin`

### Business Rules
- PROPOSED_BR:post-homepage-eligibility (từ requirement)
- PROPOSED_BR:post-rejection-flow (từ requirement)

## Acceptance Criteria
- [ ] API trả về đúng danh sách bài PENDING
- [ ] API approve chuyển status thành PUBLISHED
- [ ] API reject chuyển status thành REJECTED và lưu lý do
- [ ] Validation: reason tối thiểu 10 ký tự khi reject
- [ ] Chỉ Admin mới truy cập được các API này
- [ ] Unit test coverage ≥ 80%

## Technical Notes
- Dùng PostService để xử lý logic
- FormRequest cho validation
- Policy cho authorization
