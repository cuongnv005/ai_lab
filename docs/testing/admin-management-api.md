# Báo cáo Test: Admin Post, Comment, and Category Management APIs

## 1. Thông tin chung
- **Ngày test**: 2026-06-11
- **Môi trường**: Local / Testing

## 2. Chi tiết kết quả chạy test

### `tests/Feature/Api/Admin/PostManagementTest.php`

#### Test Case 1: `test_non_admin_cannot_access_post_management`
- **Nội dung test**: Đảm bảo người dùng không phải admin (thành viên thông thường, khách) bị cấm truy cập (mã lỗi 403) vào các API quản lý bài viết của Admin.
- **Kết quả**: `pass`

#### Test Case 2: `test_admin_can_list_posts_with_filters_and_search`
- **Nội dung test**: Đảm bảo Admin có thể tìm kiếm bài viết theo từ khóa và lọc nâng cao theo trạng thái, tác giả.
- **Kết quả**: `fail` (Đã khắc phục thành `pass`)
- **Nguyên nhân**: Bảng `posts` không có cột `posts.slug` trong database, nhưng mảng select fields của `AdminPostTableService` vẫn truy vấn cột này dẫn đến lỗi SQL 1054.
- **Các bước giải quyết**:
  1. Loại bỏ cột `'posts.slug'` khỏi danh sách select raw của `AdminPostTableService.php`.
  2. Chạy lại test suite bằng lệnh `docker compose exec -u www-data app php artisan test --filter=PostManagementTest` và xác minh test case này đã pass.

#### Test Case 3: `test_admin_can_create_post_without_approval`
- **Nội dung test**: Đảm bảo bài viết do Admin tạo được xuất bản trực tiếp với trạng thái `PUBLISHED` mà không cần đi qua hàng đợi phê duyệt.
- **Kết quả**: `pass`

#### Test Case 4: `test_admin_can_update_any_post_and_change_status`
- **Nội dung test**: Đảm bảo Admin có thể chỉnh sửa tiêu đề và thay đổi trạng thái của bất kỳ bài viết nào (kể cả bài viết của thành viên khác).
- **Kết quả**: `pass`

#### Test Case 5: `test_admin_cannot_delete_post_with_engagement_without_confirm`
- **Nội dung test**: Đảm bảo Admin không thể xóa bài viết đã có tương tác (bình luận hoặc lượt thích) nếu không truyền tham số xác nhận `confirm = true`.
- **Kết quả**: `pass`

#### Test Case 6: `test_admin_can_delete_post_with_confirm`
- **Nội dung test**: Đảm bảo Admin có thể xóa mềm bài viết có tương tác khi đã truyền xác nhận `confirm = true`.
- **Kết quả**: `pass`

#### Test Case 7: `test_admin_can_list_trashed_posts`
- **Nội dung test**: Đảm bảo Admin lấy được danh sách bài viết đã bị xóa mềm, thông tin `deleted_by` được lấy chính xác từ log activity.
- **Kết quả**: `fail` (Đã khắc phục thành `pass`)
- **Nguyên nhân**: Lỗi kiểu dữ liệu trong `PostResource.php` khi gọi `Activity::forSubject($this)` vì `$this` trong resource wrapper là instance của `PostResource` chứ không phải Eloquent model `Post`.
- **Các bước giải quyết**:
  1. Đổi `$this` thành `$this->resource` để truyền đúng Eloquent Model vào method `forSubject`.
  2. Chạy lại test suite và xác minh kết quả pass hoàn toàn.

#### Test Case 8: `test_admin_can_restore_trashed_post`
- **Nội dung test**: Đảm bảo Admin có thể khôi phục thành công một bài viết đã bị xóa mềm.
- **Kết quả**: `pass`

#### Test Case 9: `test_admin_cannot_force_delete_non_trashed_post`
- **Nội dung test**: Đảm bảo Admin không được phép xóa cứng bài viết đang hoạt động bình thường (chưa bị xóa mềm).
- **Kết quả**: `pass`

#### Test Case 10: `test_admin_can_force_delete_trashed_post`
- **Nội dung test**: Đảm bảo Admin có thể xóa vĩnh viễn (xóa cứng) bài viết đã bị xóa mềm trước đó khỏi cơ sở dữ liệu.
- **Kết quả**: `pass`

---

### `tests/Feature/Api/Admin/CommentManagementTest.php`

#### Test Case 1: `test_non_admin_cannot_access_comment_management`
- **Nội dung test**: Đảm bảo người dùng thông thường bị từ chối truy cập (403) khi gọi các API quản lý bình luận của Admin.
- **Kết quả**: `pass`

#### Test Case 2: `test_admin_can_list_comments_with_filters_and_search`
- **Nội dung test**: Đảm bảo Admin lấy được danh sách bình luận kèm tìm kiếm nội dung và lọc theo bài viết, tác giả.
- **Kết quả**: `pass`

#### Test Case 3: `test_admin_can_view_comment_details`
- **Nội dung test**: Đảm bảo Admin xem được chi tiết bình luận kèm theo các phản hồi liên quan.
- **Kết quả**: `pass`

#### Test Case 4: `test_admin_can_soft_delete_comment_and_cascade_replies`
- **Nội dung test**: Đảm bảo khi Admin xóa mềm một bình luận cha, tất cả các bình luận phản hồi (replies con) cũng bị tự động xóa mềm đồng thời (cascade soft delete).
- **Kết quả**: `pass`

#### Test Case 5: `test_admin_can_list_trashed_comments`
- **Nội dung test**: Đảm bảo Admin lấy được danh sách các bình luận đã bị xóa mềm.
- **Kết quả**: `pass`

#### Test Case 6: `test_admin_can_restore_trashed_comment_and_replies`
- **Nội dung test**: Đảm bảo Admin khôi phục bình luận cha thành công đồng thời tự động khôi phục các phản hồi con đã bị xóa mềm trước đó.
- **Kết quả**: `pass`

#### Test Case 7: `test_admin_cannot_force_delete_non_trashed_comment`
- **Nội dung test**: Đảm bảo Admin không thể xóa cứng bình luận đang hoạt động.
- **Kết quả**: `pass`

#### Test Case 8: `test_admin_can_force_delete_trashed_comment_and_replies`
- **Nội dung test**: Đảm bảo Admin có thể xóa cứng vĩnh viễn bình luận đã xóa mềm và tự động xóa cứng các replies của nó khỏi database.
- **Kết quả**: `pass`

---

### `tests/Feature/Api/Admin/CategoryManagementTest.php`

#### Test Case 1: `test_non_admin_cannot_access_category_management`
- **Nội dung test**: Đảm bảo người dùng thông thường bị từ chối truy cập (403) vào API quản lý chuyên mục của Admin.
- **Kết quả**: `pass`

#### Test Case 2: `test_admin_can_list_categories_ordered_by_sort_order`
- **Nội dung test**: Đảm bảo Admin lấy được danh sách toàn bộ chuyên mục được sắp xếp theo thứ tự hiển thị `sort_order` tăng dần.
- **Kết quả**: `pass`

#### Test Case 3: `test_admin_can_view_category_details`
- **Nội dung test**: Đảm bảo Admin xem được chi tiết chuyên mục kèm phân trang danh sách các bài viết bên trong.
- **Kết quả**: `pass`

#### Test Case 4: `test_admin_can_create_category_with_custom_slug`
- **Nội dung test**: Đảm bảo Admin tạo mới chuyên mục thành công với slug tùy chọn do Admin tự nhập.
- **Kết quả**: `pass`

#### Test Case 5: `test_admin_create_category_fails_validation`
- **Nội dung test**: Đảm bảo các validation rule (slug định dạng regex lowercase alphanumeric + hyphen, trùng lặp name/slug) hoạt động chính xác.
- **Kết quả**: `pass`

#### Test Case 6: `test_admin_can_update_category`
- **Nội dung test**: Đảm bảo Admin cập nhật chuyên mục thành công và kiểm tra trùng lặp name/slug loại trừ chính nó.
- **Kết quả**: `pass`

#### Test Case 7: `test_admin_cannot_delete_category_with_posts`
- **Nội dung test**: Đảm bảo Admin bị chặn không cho phép xóa chuyên mục đang có chứa bài viết để tránh lỗi tham chiếu DB (Trả về mã lỗi 422 kèm danh sách bài viết mẫu).
- **Kết quả**: `pass`

#### Test Case 8: `test_admin_can_move_posts_to_another_category`
- **Nội dung test**: Đảm bảo Admin có thể di chuyển toàn bộ bài viết từ chuyên mục này sang chuyên mục khác thành công.
- **Kết quả**: `pass`

#### Test Case 9: `test_admin_can_delete_empty_category`
- **Nội dung test**: Đảm bảo Admin xóa thành công chuyên mục trống (không chứa bài viết).
- **Kết quả**: `pass`

#### Test Case 10: `test_admin_can_reorder_categories`
- **Nội dung test**: Đảm bảo Admin có thể cập nhật sắp xếp thứ tự hiển thị (`sort_order`) của các chuyên mục dựa trên mảng ID truyền lên.
- **Kết quả**: `pass`
