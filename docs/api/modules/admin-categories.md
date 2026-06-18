# Admin Category Management API

Quản lý toàn bộ chuyên mục (Categories) thảo luận diễn đàn dành cho Admin.

> [!IMPORTANT]
> **Tất cả các API này yêu cầu Bearer Token** và người dùng phải có vai trò `admin` (được bảo vệ qua middleware `role:admin`).

---

## 1. Lấy danh sách chuyên mục (List Categories)

Lấy danh sách tất cả chuyên mục sắp xếp theo thứ tự hiển thị.

| Đặc điểm | Chi tiết |
|---|---|
| **Endpoint** | `GET /api/admin/categories` |
| **Auth** | ✓ Yêu cầu Bearer Token (Admin) |

### Response `200` (Thành công)
```json
{
  "success": true,
  "status_code": 200,
  "message": "",
  "errors": null,
  "data": [
    {
      "id": 1,
      "name": "General Discussions",
      "slug": "general-discussions",
      "description": "Chuyên mục thảo luận chung",
      "sort_order": 1,
      "posts_count": 12,
      "created_at": "2026-06-11 12:00:00",
      "updated_at": "2026-06-11 12:00:00"
    }
  ]
}
```

---

## 2. Xem chi tiết chuyên mục (Show Category)

Lấy thông tin chuyên mục và phân trang danh sách các bài viết bên trong.

| Đặc điểm | Chi tiết |
|---|---|
| **Endpoint** | `GET /api/admin/categories/{id}` |
| **Auth** | ✓ Yêu cầu Bearer Token (Admin) |

### Response `200` (Thành công)
```json
{
  "success": true,
  "status_code": 200,
  "message": "",
  "errors": null,
  "data": {
    "category": {
      "id": 1,
      "name": "General Discussions",
      "slug": "general-discussions",
      "description": "Chuyên mục thảo luận chung"
    },
    "posts": [
      {
        "id": 5,
        "title": "Welcome to Beki Forum",
        "views_count": 150,
        "status": 2
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

## 3. Tạo chuyên mục mới (Create Category)

| Đặc điểm | Chi tiết |
|---|---|
| **Endpoint** | `POST /api/admin/categories` |
| **Auth** | ✓ Yêu cầu Bearer Token (Admin) |

### Request Body
```json
{
  "name": "AI Technology",
  "slug": "ai-technology",
  "description": "Các bài viết thảo luận về trí tuệ nhân tạo"
}
```

### Response `201` (Tạo thành công)
```json
{
  "success": true,
  "status_code": 201,
  "message": "Category created successfully.",
  "errors": null,
  "data": {
    "id": 2,
    "name": "AI Technology",
    "slug": "ai-technology",
    "sort_order": 2
  }
}
```

---

## 4. Cập nhật chuyên mục (Update Category)

| Đặc điểm | Chi tiết |
|---|---|
| **Endpoint** | `PUT /api/admin/categories/{id}` |
| **Auth** | ✓ Yêu cầu Bearer Token (Admin) |

### Request Body
```json
{
  "name": "AI & Deep Learning",
  "slug": "ai-deep-learning"
}
```

### Response `200` (Thành công)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Category updated successfully.",
  "errors": null,
  "data": {
    "id": 2,
    "name": "AI & Deep Learning",
    "slug": "ai-deep-learning"
  }
}
```

---

## 5. Xóa chuyên mục (Delete Category)

Chuyên mục chỉ có thể xóa được nếu trống (không có bài viết nào).

| Đặc điểm | Chi tiết |
|---|---|
| **Endpoint** | `DELETE /api/admin/categories/{id}` |
| **Auth** | ✓ Yêu cầu Bearer Token (Admin) |

### Response `200` (Thành công)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Category deleted successfully.",
  "errors": null,
  "data": null
}
```

### Response `422` (Không cho phép xóa)
```json
{
  "message": "Cannot delete category containing posts. Please move posts first.",
  "errors": {
    "category": [
      "Cannot delete category containing posts. Please move posts first."
    ],
    "posts": [
      {
        "id": 1,
        "title": "Welcome to Beki Forum"
      }
    ]
  }
}
```

---

## 6. Di chuyển bài viết sang chuyên mục khác (Move Posts)

| Đặc điểm | Chi tiết |
|---|---|
| **Endpoint** | `POST /api/admin/categories/{id}/move-posts` |
| **Auth** | ✓ Yêu cầu Bearer Token (Admin) |

### Request Body
```json
{
  "target_category_id": 2
}
```

### Response `200` (Thành công)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Successfully moved 12 posts to the target category.",
  "errors": null,
  "data": {
    "moved_count": 12
  }
}
```

---

## 7. Sắp xếp thứ tự chuyên mục (Reorder Categories)

Cập nhật lại trường `sort_order` cho danh sách chuyên mục.

| Đặc điểm | Chi tiết |
|---|---|
| **Endpoint** | `POST /api/admin/categories/reorder` |
| **Auth** | ✓ Yêu cầu Bearer Token (Admin) |

### Request Body
```json
{
  "ids": [2, 1, 3]
}
```

### Response `200` (Thành công)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Categories reordered successfully.",
  "errors": null,
  "data": null
}
```
