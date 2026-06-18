# Admin Dashboard Tasks

Group tasks cho hệ thống Admin Dashboard - Quản lý bài viết và báo cáo vi phạm.

## 📋 Task List

| # | Task | Priority | Status | File |
|---|------|----------|--------|------|
| 1 | Approval Queue API | High | Done | [task-01-approval-queue-api.md](task-01-approval-queue-api.md) |
| 2 | Report Queue API | High | Done | [task-02-report-queue-api.md](task-02-report-queue-api.md) |
| 3 | User Management API | High | Done | [task-04-user-management-api.md](task-04-user-management-api.md) |
| 4 | Analytics API | High | Done | [task-05-analytics-api.md](task-05-analytics-api.md) |
| 5 | Post CRUD API | High | Pending | [task-06-post-crud-api.md](task-06-post-crud-api.md) |
| 6 | Comment Management API | Medium | Pending | [task-07-comment-management-api.md](task-07-comment-management-api.md) |
| 7 | Category Management API | Medium | Pending | [task-08-category-management-api.md](task-08-category-management-api.md) |
| 8 | Admin Dashboard UI | Medium | Pending (Last) | [task-09-admin-dashboard-ui.md](task-09-admin-dashboard-ui.md) |

## 📁 Structure

```
2026-06-11-admin-dashboard/
├── index.md                           # This file
├── task-01-approval-queue-api.md       # Backend: API duyệt bài (Done)
├── task-02-report-queue-api.md        # Backend: API báo cáo (Done)
├── task-04-user-management-api.md      # Backend: API quản lý thành viên (Done)
├── task-05-analytics-api.md           # Backend: API thống kê (Done)
├── task-06-post-crud-api.md            # Backend: API CRUD bài viết
├── task-07-comment-management-api.md  # Backend: API quản lý bình luận
├── task-08-category-management-api.md # Backend: API quản lý danh mục
└── task-09-admin-dashboard-ui.md      # Frontend: UI Dashboard (Last)
```

## 🎯 Overview

Admin Dashboard cho phép:
- **Quản lý Approval Queue**: Duyệt/từ chối bài viết của Member lên trang chủ
- **Quản lý Report Queue**: Xử lý báo cáo vi phạm từ Member/Mod
- **Quản lý Thành viên**: Cấm tài khoản, đổi role (member/mod/admin)
- **Quản lý Bài viết**: Thêm, sửa, xóa bài viết trực tiếp
- **Quản lý Bình luận**: Xem, xóa bình luận vi phạm
- **Quản lý Danh mục**: Thêm, sửa, xóa categories diễn đàn
- **Dashboard thống kê**: Lượt xem, bài viết, user mới, bình luận

## 📝 Notes

- Từ requirement: [03-ai_lab.md](../../requirements/03-ai_lab.md) - Section 5.1, Flow 2, Flow 4
- Các API sử dụng middleware `role:admin`
- Frontend tích hợp vào Laravel Admin (không phải Next.js)
