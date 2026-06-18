# Admin Comment Management API

Quản lý toàn bộ bình luận trong hệ thống dành cho Admin.

> [!IMPORTANT]
> **Tất cả các API này yêu cầu Bearer Token** và người dùng phải có vai trò `admin` (được bảo vệ qua middleware `role:admin`).

---

## 1. Lấy danh sách bình luận (List Comments)

Lấy danh sách tất cả bình luận kèm theo bộ lọc, phân trang và tìm kiếm.

| Đặc điểm | Chi tiết |
|---|---|
| **Endpoint** | `GET /api/admin/comments` |
| **Auth** | ✓ Yêu cầu Bearer Token (Admin) |

### Query Parameters
| Tham số | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `search` | string | ✗ | Tìm kiếm bình luận theo nội dung (`content`) |
| `page` | integer | ✗ | Số trang muốn lấy (mặc định: `1`) |
| `per_page` | integer | ✗ | Số lượng bản ghi trên một trang (mặc định: `20`) |
| `from_date` | string | ✗ | Định dạng `YYYY-MM-DD`. Lọc các bình luận tạo từ ngày này. |
| `to_date` | string | ✗ | Định dạng `YYYY-MM-DD`. Lọc các bình luận tạo đến ngày này. |
| `filters` | array | ✗ | Lọc dữ liệu nâng cao (định dạng JSON array) |
| `filters.*.key` | string | ✗ | Cột lọc: `post_id`, `author` (user_id) |
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
        "post_id": 1,
        "user_id": 2,
        "parent_id": null,
        "content": "Nội dung bình luận mẫu",
        "likes_count": 0,
        "is_liked": false,
        "created_at": "2026-06-11 15:00:00",
        "updated_at": "2026-06-11 15:00:00",
        "user": {
          "id": 2,
          "name": "Member User",
          "email": "member@example.com"
        },
        "post": {
          "id": 1,
          "title": "Laravel 13 Guide"
        },
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

## 2. Xem chi tiết bình luận (Show Comment)

| Đặc điểm | Chi tiết |
|---|---|
| **Endpoint** | `GET /api/admin/comments/{id}` |
| **Auth** | ✓ Yêu cầu Bearer Token (Admin) |

### Response `200` (Thành công)
```json
{
  "success": true,
  "status_code": 200,
  "message": "",
  "errors": null,
  "data": {
    "id": 1,
    "post_id": 1,
    "user_id": 2,
    "content": "Nội dung bình luận mẫu",
    "replies": [
      {
        "id": 2,
        "parent_id": 1,
        "content": "Nội dung phản hồi"
      }
    ]
  }
}
```

---

## 3. Xóa bình luận (Soft Delete Cascade)

Xóa mềm bình luận cha và tự động xóa mềm toàn bộ phản hồi con.

| Đặc điểm | Chi tiết |
|---|---|
| **Endpoint** | `DELETE /api/admin/comments/{id}` |
| **Auth** | ✓ Yêu cầu Bearer Token (Admin) |

### Response `200` (Thành công)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Comment deleted successfully.",
  "errors": null,
  "data": null
}
```

---

## 4. Danh sách bình luận đã xóa (Trashed Comments)

Lấy danh sách các bình luận đã xóa mềm.

| Đặc điểm | Chi tiết |
|---|---|
| **Endpoint** | `GET /api/admin/comments/trashed` |
| **Auth** | ✓ Yêu cầu Bearer Token (Admin) |

---

## 5. Khôi phục bình luận (Restore Comment)

Khôi phục bình luận cha và các phản hồi con đã bị xóa mềm tương ứng.

| Đặc điểm | Chi tiết |
|---|---|
| **Endpoint** | `POST /api/admin/comments/{id}/restore` |
| **Auth** | ✓ Yêu cầu Bearer Token (Admin) |

---

## 6. Xóa cứng bình luận (Force Delete)

Xóa vĩnh viễn bình luận cha và phản hồi con ra khỏi DB. Chỉ áp dụng cho bình luận đã xóa mềm.

| Đặc điểm | Chi tiết |
|---|---|
| **Endpoint** | `POST /api/admin/comments/{id}/force-delete` |
| **Auth** | ✓ Yêu cầu Bearer Token (Admin) |
