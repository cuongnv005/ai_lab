# BR Registry

Nguồn chuẩn duy nhất cho mã Business Rule (BR) toàn hệ thống.

---

## Quy ước mã

- `BR-GXXX` = Rule cấp hệ thống (global, áp dụng đa module).
- `BR-{MODULE}-XXX` = Rule cấp module (ví dụ: `BR-AUTH-001`, `BR-NOTIF-001`).
- `PROPOSED_BR:{slug}` = Rule mới đang đề xuất, chưa được cấp mã chính thức.

> [!IMPORTANT]
> Không dùng lại mã BR cho ngữ nghĩa khác.

---

## Registry

| Rule ID | Scope | Module | Title | Status | Source File | Notes |
|---|---|---|---|---|---|---|
| BR-G001 | global | system-auth | Pre-provisioned Login Only | active | docs/system/business-rules.md | Chỉ user tồn tại sẵn mới đăng nhập được |
| BR-G002 | global | system-log | System Activity Audit Trail | active | docs/system/business-rules.md | Tất cả domain Model phải dùng `LogsActivity` trait. Loại trừ trường nhạy cảm (`password`, `remember_token`). Xem Pattern A/B. |
| BR-USER-001 | module | admin-user | User Role Hierarchy | active | docs/logic/admin/user-management.md | Cấp bậc vai trò Admin > Moderator > Member |
| BR-USER-002 | module | admin-user | User Self Protection | active | docs/logic/admin/user-management.md | Không thể tự thay đổi vai trò hoặc tự xóa chính mình |
| BR-USER-003 | module | admin-user | User Ban Restriction | active | docs/logic/admin/user-management.md | User bị cấm thì không thể đăng nhập |
| BR-USER-004 | module | admin-user | Admin Protection | active | docs/logic/admin/user-management.md | Không được xóa tài khoản của admin khác |
| BR-ANALYTICS-001 | module | admin-analytics | Dashboard Cache | active | docs/logic/admin/analytics.md | Cache stats và chart 5 phút để bảo vệ database |
| BR-ANALYTICS-002 | module | admin-analytics | Analytics Privacy | active | docs/logic/admin/analytics.md | Dữ liệu thống kê không đính kèm thông tin cá nhân |
| BR-POST-002 | module | admin-post | Admin Bypass Approval | active | docs/logic/admin/post-management.md | Post do Admin tạo sẽ có status PUBLISHED trực tiếp |
| BR-POST-003 | module | admin-post | Admin Edit Any Post | active | docs/logic/admin/post-management.md | Admin có thể chỉnh sửa và thay đổi status bất kỳ bài viết nào |
| BR-POST-004 | module | admin-post | Admin Post Delete Warning | active | docs/logic/admin/post-management.md | Yêu cầu confirm=true nếu bài viết có likes/comments |
| BR-POST-005 | module | admin-post | Admin Hard Delete Restriction | active | docs/logic/admin/post-management.md | Chỉ xóa cứng các bài viết đã bị xóa mềm |
| BR-COMMENT-001 | module | admin-comment | Comment Soft Delete | active | docs/logic/admin/post-management.md | Comment bị xóa vẫn còn trong DB |
| BR-COMMENT-002 | module | admin-comment | Comment Cascade Delete | active | docs/logic/admin/post-management.md | Khi xóa parent comment, tất cả replies cũng bị xóa theo |
| BR-COMMENT-003 | module | admin-comment | Comment Hard Delete | active | docs/logic/admin/post-management.md | Xóa vĩnh viễn cả parent comment và replies tương ứng |
| BR-CATEGORY-001 | module | admin-category | Category Slug Unique | active | docs/logic/admin/category-management.md | Slug của category phải unique trong hệ thống |
| BR-CATEGORY-002 | module | admin-category | Category Delete Restriction | active | docs/logic/admin/category-management.md | Không cho phép xóa category đang chứa bài viết |

---

## Quy trình thêm rule mới

1. Tạo `PROPOSED_BR:{slug}` trong requirement/task/logic doc.
2. Review với owner nghiệp vụ.
3. Cấp mã chính thức trong file này.
4. Thay toàn bộ `PROPOSED_BR` tham chiếu thành `BR-*` đã cấp.
