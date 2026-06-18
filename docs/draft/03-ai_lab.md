## 1. Tổng Quan Dự Án (Overview)
- Tên dự án: AI_Lab
- Ý tưởng: Một diễn đàn/mạng xã hội ngách (Mini-Medium) dành cho cộng đồng người dùng AI tại Việt Nam. Nơi thành viên chia sẻ thủ thuật, hướng dẫn sử dụng (Tutorials) và các đoạn mã lệnh (Prompts) thực tế.
- Công nghệ sử dụng: Laravel 13 (Backend API & Admin) + Next.js 16 (Frontend User) + TailwindCSS.

## 2. Đối Tượng Sử Dụng Hệ Thống (User Personas)
- Guest: Đọc bài viết hướng dẫn, tìm kiếm prompt, xem thảo luận (Không cần đăng nhập).
- Member (Thành viên): Đăng nhập để đăng bài viết hướng dẫn mới, quản lý trạng thái bài viết cá nhân, tham gia bình luận hỏi đáp.
- Moderator: Những người dùng uy tín (hoặc đội ngũ biên tập viên). Bài viết do Mod đăng sẽ tự động chuyển sang trạng thái xuất bản công khai mà không cần Admin phê duyệt.
- Admin: Kiểm duyệt bài viết của Member, có quyền nâng cấp/hạ cấp tài khoản của user lên thành Mod, quản trị toàn bộ hệ thống.

## 3. Chức Năng
- Trang chủ (Homepage): Hiển thị danh sách bài viết hướng dẫn đã được xuất bản theo dạng lưới (Grid). Đây là trang chính mà **Guest** và mọi user vào sẽ thấy ngay lập tức. Postcard từng bài viết sẽ hiển thị ảnh đầu tiên của bài viết, tiêu đề, sumary, số lượt xem, thời gian. 
- Trang chi tiết bài viết (Post Detail): Hiển thị nội dung bài viết hướng dẫn. Hỗ trợ định dạng Rich Text/Markdown để hiển thị các khối mã `Code Block` chứa Prompt rõ ràng. hỗ trợ định dạng bbcode để hiển thị , có nút sao chép nhanh, nút like bài viết, nút chia sẻ bài viết. Có tag bài viết, thời gian đăng. Chỉ người dùng đã đăng nhập mới có thể bình luận, chỉ người dùng tạo ra bài viết hoặc admin, mod mới có thể sửa, xóa.
- Hệ thống bình luận (Comments) đa cấp phía dưới bài viết. Hiển thị avatar của người bình luận, tên người bình luận, nội dung bình luận, thời gian bình luận, số lượt thích bình luận. Có nút trả lời bình luận, nút thích bình luận, nút xóa bình luận (chỉ chủ bình luận mới có nút xóa). Có phân trang, mỗi trang 10 bình luận.
- Không gian cá nhân (User Dashboard):
  * Form Đăng bài mới:
    Nếu là *Member*: Hệ thống thông báo bài viết sẽ được chuyển vào hàng đợi kiểm duyệt.
    Nếu là *Mod / Admin*: Hệ thống thông báo bài viết sẽ được xuất bản ngay lập tức.
    Có ô nhập tiêu đề bài viết, bên dưới là texteditor nội dung bài viết (sử dụng thư viện sceditor).
    trong texteditor có hỗ trợ markdown và bbcode để hiển thị các khối mã Code Block chứa Prompt rõ ràng. hỗ trợ định dạng bbcode để hiển thị (bbcode bao gồm các thẻ đặc biệt như [preview][/preview] để lấy được đoạn văn đầu tiên làm tóm tắt, [similar][/similar] để hiển thị danh sách bài viết tương tự theo tag)
    Có nhập danh sách tag của bài viết, có nút đăng bài, xem trước bài viết (biến bbcode thành html để xem trước), tự động lưu nháp sau 30s. lưu nháp trong bảng lưu nháp. 
  * Quản lý bài viết cá nhân: Bảng danh sách bài đã đăng kèm nhãn trạng thái trực quan:
        *   `Pending` (Chờ duyệt - Màu vàng)
        *   `Published` (Đã đăng công khai - Màu xanh)
        *   `Rejected` (Bị từ chối - Màu đỏ, hiển thị kèm lý do từ Admin).
      Có số lượt bình luận, số lượt thích, nút sửa bài, nút xóa bài. Có phân trang, mỗi trang 10 bài. Có bộ lọc tìm kiếm.
- Trang diễn đàn: hiện thị danh sách các Category (do AI tạo ra), trong mỗi Category có danh sách các topic/threads do thành viên tạo ra (bài viết chưa được xuất bản). Hiện thị theo thời gian tạo mới nhất. trang topic/threads là trang chi tiết bài viết. 
-header sẽ gồm logo ở bên trái, ở giữa là các link bao gồm trang chủ, thảo luận và bên phải là tìm kiếm, đăng nhập/đăng ký hoặc avatar nếu đã đăng nhập chế độ darkmode, lightmode. nếu là user đã đăng nhập thì có thêm nút bài viết của tôi. còn nếu là admin thì có thêm nút dashboard. 
- footer là thông tin liên hệ, link mạng xã hội, giới thiệu, điều khoản sử dụng, chính sách bảo mật. 


### 3.2. Phân Hệ Quản Trị Chuyên Sâu (Admin Dashboard - Laravel 13)
- Quản lý Thành viên (User Management): Admin có quyền sửa thông tin người dùng, đổi role của một tài khoản từ `member` lên `mod` (để cấp đặc quyền đăng bài thẳng lên trang chủ) hoặc hạ cấp ngược lại.

- Hàng đợi kiểm duyệt (Approval Queue): Màn hình tập trung hiển thị các bài viết đang ở trạng thái `Pending` (Chỉ hiển thị bài của nhóm `member`).
- Tính năng Duyệt bài (Approve): Admin bấm nút duyệt, hệ thống chuyển `status` sang `published`.
- Tính năng Từ chối (Reject): Admin bấm nút từ chối, hệ thống yêu cầu nhập lý do, chuyển `status` sang `rejected` và lưu lại lý do để hiển thị cho User.
- Xem thông kê lượt xem, lượt bài viết, lượt user mới, lượt bình luận.
- Thêm, sửa, xóa bài viết. 
- Xem, xóa bình luận. 
- Hệ thống Xử lý Báo cáo Vi phạm: 
  * Phía Frontend: Thêm nút "Báo cáo vi phạm" ở mỗi bài viết và bình luận cho Guest/Member bấm.
  * Phía Admin: Một màn hình Hàng đợi Báo cáo (Report Queue). Admin sẽ thấy: Ai báo cáo? Bài viết/Bình luận nào bị báo cáo? Lý do là gì? Admin có nút xử lý nhanh: Xóa nội dung bị báo cáo hoặc Bác bỏ báo cáo (nếu báo cáo sai).
  