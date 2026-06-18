---
title: "Admin - Dashboard Analytics API"
description: "Backend API cho Admin để xem thống kê tổng quan hệ thống: lượt xem, bài viết, user mới, bình luận"
status: completed
priority: high
category: backend
assignee: null
dependencies: []
---

## Overview
Tạo API cho Admin Dashboard để hiển thị các chỉ số thống kê quan trọng của hệ thống trong khoảng thời gian tùy chọn (hôm nay, 7 ngày, 30 ngày, năm nay).

## Requirements

### API Endpoints

1. `GET /api/admin/dashboard/stats` - Thống kê tổng quan
   - Query params: `period` (today, 7days, 30days, year)
   - Response:
     ```json
     {
       "data": {
         "total_views": 12345,
         "new_posts": 42,
         "new_users": 15,
         "new_comments": 128,
         "pending_posts": 8,
         "total_users": 156,
         "total_posts": 523,
         "total_comments": 1847
       }
     }
     ```

2. `GET /api/admin/dashboard/chart` - Dữ liệu biểu đồ
   - Query params: `period` (7days, 30days, year), `type` (views, posts, users, comments)
   - Response: Array of {date, value} cho vẽ biểu đồ

3. `GET /api/admin/dashboard/top-posts` - Bài viết nổi bật
   - Query params: `period` (7days, 30days), `limit` (default 5)
   - Sort: theo views_count giảm dần
   - Include: title, author, views_count, likes_count, comments_count

4. `GET /api/admin/dashboard/top-users` - Thành viên tích cực
   - Query params: `period` (7days, 30days), `limit` (default 5)
   - Sort: theo số bài viết + bình luận
   - Include: name, posts_count, comments_count

5. `GET /api/admin/dashboard/recent-activity` - Hoạt động gần đây
   - Query params: `limit` (default 10)
   - Include: new posts, new users, new comments, reports (có type và timestamp)

### Authorization
- Chỉ Admin (`role = admin`) mới được truy cập
- Middleware: `role:admin`

### Business Rules
- BR-ANALYTICS-001: Dashboard Cache
- BR-ANALYTICS-002: Analytics Privacy

## Acceptance Criteria
- [x] API trả về đúng số liệu theo period
- [x] API chart trả về đúng format cho biểu đồ
- [x] Có cache để tối ưu performance
- [x] Chỉ Admin mới truy cập được các API này
- [x] Unit test coverage ≥ 80%

## Technical Notes
- Dùng AnalyticsService để xử lý logic
- Sử dụng cache (Redis hoặc file) cho dữ liệu thống kê
- Có thể tạo materialized view hoặc summary table nếu data lớn

## Related BRs
- BR-ANALYTICS-001: Dashboard Cache
- BR-ANALYTICS-002: Analytics Privacy
