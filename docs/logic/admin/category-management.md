---
title: "Admin Category Management API"
description: "Logic nghiệp vụ quản lý chuyên mục diễn đàn cho Admin: tạo chuyên mục, cập nhật, xóa có điều kiện, chuyển bài viết và sắp xếp thứ tự."
version: "1.0.0"
date: "2026-06-11"
status: "approved"
---

## 🎯 Tổng quan (Overview)
API cung cấp cho Admin (`role = admin`) quyền hạn đầy đủ để quản lý cấu trúc các chuyên mục thảo luận trong diễn đàn, bao gồm việc tạo mới, cập nhật thông tin, sắp xếp thứ tự hiển thị của các danh mục, và di chuyển nội dung bài viết trước khi thực hiện xóa chuyên mục.

## 🚀 Luồng xử lý (Flows)

### 1. Lấy danh sách chuyên mục (List Categories)
- **Endpoint**: `GET /api/admin/categories`
- **Luồng logic**:
  1. Lấy toàn bộ danh sách các chuyên mục.
  2. Tự động tính số lượng bài viết (`posts_count`) thuộc mỗi chuyên mục.
  3. Sắp xếp theo thứ tự hiển thị `sort_order` tăng dần (các chuyên mục có `sort_order` nhỏ hơn sẽ hiển thị trước).
  4. Trả về toàn bộ danh sách không phân trang (do số lượng chuyên mục trong hệ thống ít).

### 2. Xem chi tiết chuyên mục (Show Category)
- **Endpoint**: `GET /api/admin/categories/{id}`
- **Luồng logic**:
  1. Lấy thông tin cơ bản của chuyên mục theo ID.
  2. Lấy danh sách các bài viết thuộc chuyên mục đó (có phân trang 20 bài viết/trang).

### 3. Tạo chuyên mục mới (Create Category)
- **Endpoint**: `POST /api/admin/categories`
- **Luồng logic**:
  1. Kiểm tra tính hợp lệ của dữ liệu:
     - `name`: Tối thiểu 3 ký tự, không trùng lặp.
     - `slug`: Tối thiểu 3 ký tự, định dạng lowercase alphanumeric kèm dấu gạch ngang (regex `^[a-z0-9-]+$`), không trùng lặp. Admin tự nhập trực tiếp slug.
  2. Gán giá trị `sort_order` mặc định bằng `max(sort_order) + 1` để đưa chuyên mục mới xuống cuối danh sách.
  3. Tạo bản ghi mới và ghi nhận log activity.

### 4. Cập nhật chuyên mục (Update Category)
- **Endpoint**: `PUT /api/admin/categories/{id}`
- **Luồng logic**:
  1. Validate trùng lặp đối với `name` và `slug` (ngoại trừ chính nó).
  2. Thực hiện cập nhật các trường được truyền lên. Ghi log activity.

### 5. Xóa chuyên mục (Delete Category)
- **Endpoint**: `DELETE /api/admin/categories/{id}`
- **Luồng logic**:
  1. Kiểm tra xem chuyên mục có chứa bài viết nào không (bao gồm cả các bài viết đã bị xóa mềm).
  2. Nếu chuyên mục có chứa bài viết, chặn hành động xóa và trả về lỗi `ValidationException` (422) kèm theo danh sách tối đa 5 bài viết mẫu cần di chuyển.
  3. Nếu chuyên mục trống, thực hiện xóa chuyên mục và ghi log activity.

### 6. Chuyển bài viết sang chuyên mục khác (Move Posts)
- **Endpoint**: `POST /api/admin/categories/{id}/move-posts`
- **Luồng logic**:
  1. Kiểm tra ID chuyên mục đích (`target_category_id`) có tồn tại và khác chuyên mục hiện tại không.
  2. Trong DB Transaction, cập nhật toàn bộ bài viết (bao gồm cả bài viết đã bị xóa mềm) từ chuyên mục nguồn sang chuyên mục đích.
  3. Trả về số lượng bài viết đã chuyển thành công. Ghi log activity.

### 7. Sắp xếp thứ tự chuyên mục (Reorder Categories)
- **Endpoint**: `POST /api/admin/categories/reorder`
- **Luồng logic**:
  1. Nhận mảng danh sách ID của các chuyên mục theo thứ tự sắp xếp mong muốn.
  2. Trong DB Transaction, lặp qua mảng và cập nhật lại trường `sort_order` tương ứng bằng vị trí index của nó trong mảng (+ 1). Ghi log activity.

---

## 🛡️ Business Rules (Luật nghiệp vụ)

| ID | Tên | Chi tiết |
|---|---|---|
| BR-CATEGORY-001 | Category Slug Unique | Slug của chuyên mục là duy nhất trong hệ thống và phải tuân thủ đúng định dạng chữ thường không dấu, số và dấu gạch ngang (không chứa ký tự đặc biệt hay khoảng trắng). |
| BR-CATEGORY-002 | Category Delete Restriction | Không được phép xóa một chuyên mục đang chứa bài viết (kể cả bài viết bị xóa mềm) để đảm bảo tính toàn vẹn của dữ liệu liên kết. Admin phải sử dụng tính năng di chuyển bài viết sang chuyên mục khác trước khi thực hiện xóa. |
