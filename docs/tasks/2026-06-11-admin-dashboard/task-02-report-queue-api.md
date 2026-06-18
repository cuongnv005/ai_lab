---
title: "Admin - Report Queue API"
description: "Backend API cho Admin để xử lý báo cáo vi phạm từ Member/Mod"
status: done
priority: high
category: backend
assignee: null
dependencies: []
---

## Overview
Tạo API cho Admin để quản lý hàng đợi báo cáo vi phạm. Member/Mod có thể báo cáo bài viết/bình luận vi phạm, Admin cần xử lý.

## Requirements

### API Endpoints
1. `GET /api/admin/reports` - Lấy danh sách báo cáo
   - Filter: status (pending/resolved/dismissed), type (post/comment)
   - Sort: mới nhất trước
   - Pagination: 20 items/page
   - Include: reporter, reported content preview, reason

2. `GET /api/admin/reports/{id}` - Xem chi tiết báo cáo
   - Include: full reported content, author của content bị báo cáo

3. `POST /api/admin/reports/{id}/resolve` - Xóa nội dung vi phạm
   - Soft delete post/comment bị báo cáo
   - Update report status: RESOLVED
   - Set resolved_by, resolved_at
   - Response: success message

4. `POST /api/admin/reports/{id}/dismiss` - Bác bỏ báo cáo
   - Update report status: DISMISSED  
   - Set resolved_by, resolved_at
   - Response: success message

### Authorization
- Chỉ Admin (`role = admin`) mới được truy cập
- Middleware: `role:admin`

### Business Rules
- PROPOSED_BR:report-auth-required (từ requirement)
- PROPOSED_BR:report-rate-limit (từ requirement)

## Acceptance Criteria
- [ ] API trả về đúng danh sách báo cáo với filter
- [ ] API resolve xóa nội dung và cập nhật report
- [ ] API dismiss chỉ cập nhật report status
- [ ] Chỉ Admin mới truy cập được các API này
- [ ] Unit test coverage ≥ 80%

## Technical Notes
- Dùng ReportService đã có
- Morph relationship cho reportable (Post/Comment)
- Soft delete cho content bị xóa
