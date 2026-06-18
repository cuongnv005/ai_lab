# Admin Post CRUD API

Quản lý toàn bộ bài viết trong hệ thống dành cho Admin.

> [!IMPORTANT]
> **Tất cả các API này yêu cầu Bearer Token** và người dùng phải có vai trò `admin` (được bảo vệ qua middleware `role:admin`).

---

## 1. Lấy danh sách bài viết (List Posts)

Lấy danh sách tất cả bài viết kèm theo bộ lọc, phân trang và tìm kiếm.

| Đặc điểm | Chi tiết |
|---|---|
| **Endpoint** | `GET /api/admin/posts` |
| **Auth** | ✓ Yêu cầu Bearer Token (Admin) |

### Query Parameters
| Tham số | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `search` | string | ✗ | Tìm kiếm bài viết theo tiêu đề hoặc nội dung |
| `page` | integer | ✗ | Số trang muốn lấy (mặc định: `1`) |
| `per_page` | integer | ✗ | Số lượng bản ghi trên một trang (mặc định: `20`) |
| `filters` | array | ✗ | Lọc dữ liệu nâng cao (định dạng JSON array) |
| `filters.*.key` | string | ✗ | Cột lọc: `status`, `category_id`, `author` (user_id) |
| `filters.*.data` | mixed | ✗ | Giá trị lọc tương ứng |

### Response `200` (Thành công)
```json
{
  "success": true,
  "status_code": 200,
  "message": "",
  "errors": null,
  "data": {
    "data": [
      {
        "id": 1,
        "title": "Laravel 13 Guide",
        "slug": "laravel-13-guide",
        "summary": "Mô tả ngắn gọn về bài viết",
        "content": "Nội dung đầy đủ của bài viết...",
        "status": 2,
        "status_label": "Published",
        "views_count": 105,
        "reject_reason": null,
        "created_at": "2026-06-11 14:00:00",
        "updated_at": "2026-06-11 14:00:00",
        "deleted_at": null,
        "deleted_by": null
      }
    ],
    "pagination": {
      "current_page": 1,
      "last_page": 1,
      "per_page": 20,
      "total": 1
    }
  }
}
```

---

## 2. Tạo bài viết Admin (Create Post)

Tạo một bài viết mới và tự động xuất bản (không cần qua hàng chờ duyệt).

| Đặc điểm | Chi tiết |
|---|---|
| **Endpoint** | `POST /api/admin/posts` |
| **Auth** | ✓ Yêu cầu Bearer Token (Admin) |

### Request Body
```json
{
  "title": "Tiêu đề bài viết Admin",
  "content": "[preview]Tóm tắt bài viết[/preview]Nội dung chi tiết bài viết...",
  "category_id": 1,
  "tags": ["admin", "guide"]
}
```

### Response `201` (Tạo thành công)
```json
{
  "success": true,
  "status_code": 201,
  "message": "Post created successfully.",
  "errors": null,
  "data": {
    "id": 2,
    "title": "Tiêu đề bài viết Admin",
    "status": 2,
    "status_label": "Published",
    "created_at": "2026-06-11 15:15:00"
  }
}
```

---

## 3. Cập nhật bài viết (Update Post)

Chỉnh sửa thông tin và trạng thái của bài viết bất kỳ.

| Đặc điểm | Chi tiết |
|---|---|
| **Endpoint** | `PUT /api/admin/posts/{id}` |
| **Auth** | ✓ Yêu cầu Bearer Token (Admin) |

### Request Body
```json
{
  "title": "Tiêu đề mới cập nhật",
  "status": 2
}
```

### Response `200` (Thành công)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Post updated successfully.",
  "errors": null,
  "data": {
    "id": 1,
    "title": "Tiêu đề mới cập nhật",
    "status": 2,
    "status_label": "Published"
  }
}
```

---

## 4. Xóa bài viết (Soft Delete)

Xóa mềm bài viết. Nếu bài viết có nhiều tương tác (comment/like), yêu cầu tham số xác nhận.

| Đặc điểm | Chi tiết |
|---|---|
| **Endpoint** | `DELETE /api/admin/posts/{id}` |
| **Auth** | ✓ Yêu cầu Bearer Token (Admin) |

### Request Body / Query Parameters
| Tham số | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `confirm` | boolean | ✗ | Xác nhận đồng ý xóa nếu bài viết có likes/comments. |

### Response `200` (Thành công)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Post deleted successfully.",
  "errors": null,
  "data": null
}
```

### Response `422` (Yêu cầu xác nhận)
```json
{
  "message": "The confirm field is required when the post has engagement.",
  "errors": {
    "confirm": [
      "This post has 5 likes and 10 comments. Please confirm that you want to delete it."
    ]
  }
}
```

---

## 5. Danh sách bài viết đã xóa (Trashed Posts)

Lấy danh sách các bài viết đã xóa mềm.

| Đặc điểm | Chi tiết |
|---|---|
| **Endpoint** | `GET /api/admin/posts/trashed` |
| **Auth** | ✓ Yêu cầu Bearer Token (Admin) |

### Response `200` (Thành công)
```json
{
  "success": true,
  "status_code": 200,
  "message": "",
  "errors": null,
  "data": {
    "data": [
      {
        "id": 1,
        "title": "Laravel 13 Guide",
        "deleted_at": "2026-06-11 15:00:00",
        "deleted_by": {
          "id": 1,
          "name": "Admin User"
        }
      }
    ],
    "pagination": {
      "current_page": 1,
      "last_page": 1,
      "per_page": 20,
      "total": 1
    }
  }
}
```

---

## 6. Khôi phục bài viết (Restore Post)

Khôi phục bài viết đã xóa mềm về trạng thái bình thường.

| Đặc điểm | Chi tiết |
|---|---|
| **Endpoint** | `POST /api/admin/posts/{id}/restore` |
| **Auth** | ✓ Yêu cầu Bearer Token (Admin) |

### Response `200` (Thành công)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Post restored successfully.",
  "errors": null,
  "data": {
    "id": 1,
    "title": "Laravel 13 Guide",
    "deleted_at": null
  }
}
```

---

## 7. Xóa cứng bài viết (Force Delete)

Xóa hoàn toàn bài viết khỏi cơ sở dữ liệu. Chỉ áp dụng cho bài viết đã xóa mềm.

| Đặc điểm | Chi tiết |
|---|---|
| **Endpoint** | `POST /api/admin/posts/{id}/force-delete` |
| **Auth** | ✓ Yêu cầu Bearer Token (Admin) |

### Response `200` (Thành công)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Post permanently deleted successfully.",
  "errors": null,
  "data": null
}
```
