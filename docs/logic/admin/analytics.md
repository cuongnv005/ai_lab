---
title: "Admin Dashboard Analytics API"
description: "Logic nghiệp vụ cung cấp các số liệu thống kê, biểu đồ và hoạt động gần đây của toàn hệ thống cho Admin."
version: "1.0.0"
date: "2026-06-11"
status: "approved"
---

## 🎯 Tổng quan (Overview)
API Thống kê dành cho Admin Dashboard cung cấp cái nhìn tổng quan về tương tác hệ thống bao gồm: số lượng user mới, post mới, comment mới, tổng số view và các báo cáo chờ duyệt. Đồng thời, API này hỗ trợ lấy dữ liệu vẽ biểu đồ và tóm tắt hoạt động thực tế gần đây trên hệ thống.

## 🚀 Luồng xử lý (Flows)

### 1. Số liệu thống kê tổng quan (Stats)
- **Endpoint**: `GET /api/admin/dashboard/stats`
- **Logic**:
  1. Xác định khoảng thời gian (`period`): `today`, `7days`, `30days`, hoặc `year` (mặc định: `30days`).
  2. Gom nhóm đếm:
     - Số user mới đăng ký trong khoảng thời gian.
     - Số bài đăng mới được tạo trong khoảng thời gian.
     - Số bình luận mới được viết trong khoảng thời gian.
     - Tổng views tích lũy của các bài viết được tạo trong khoảng thời gian.
  3. Lấy chỉ số tổng thể không phụ thuộc thời gian:
     - Tổng user, tổng posts, tổng comments hiện có.
     - Số lượng posts có `status = PostStatus::PENDING` (đang chờ duyệt).
  4. Áp dụng **Cache 5 phút** để tránh truy vấn liên tục giảm tải DB.

### 2. Dữ liệu biểu đồ (Chart Data)
- **Endpoint**: `GET /api/admin/dashboard/chart`
- **Logic**:
  1. Yêu cầu tham số `period` (`7days`, `30days`, `year`) và `type` (`views`, `posts`, `comments`, `users`).
  2. Gom nhóm trong database theo ngày (cho 7/30 ngày) hoặc theo tháng (cho year), sử dụng cú pháp SQL phù hợp với SQLite (ở môi trường test) và MySQL (ở môi trường production).
  3. Loop Carbon để sinh đầy đủ các ngày/tháng trong khoảng thời gian và điền giá trị mặc định là `0` nếu ngày/tháng đó không có tương tác trên database.
  4. Áp dụng **Cache 5 phút**.

### 3. Hoạt động gần đây (Recent Activities)
- **Endpoint**: `GET /api/admin/dashboard/recent-activity`
- **Logic**:
  1. Truy vấn các hoạt động từ 4 nguồn chính:
     - Users mới đăng ký (type: `user_registered`).
     - Posts mới được tạo (type: `post_created`).
     - Comments mới được viết (type: `comment_created`).
     - Reports mới được submit (type: `report_submitted`).
  2. Mỗi nguồn lấy tối đa `$limit` phần tử gần nhất.
  3. Gộp tất cả các hoạt động, thực hiện sắp xếp theo thời gian (`created_at` giảm dần).
  4. Cắt danh sách kết quả lấy đúng số lượng `$limit` yêu cầu (mặc định: 10).

## 🛡️ Business Rules (Luật nghiệp vụ)

| ID | Tên | Chi tiết |
|---|---|---|
| BR-ANALYTICS-001 | dashboard-cache | Kết quả thống kê tổng quan (stats) và biểu đồ (chart) được cache 5 phút để bảo vệ database khỏi các truy vấn nặng. |
| BR-ANALYTICS-002 | analytics-privacy | Dữ liệu chart và stats trả về dạng tổng hợp số lượng, tuyệt đối không đính kèm thông tin cá nhân của người dùng. |
