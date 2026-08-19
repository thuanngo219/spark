# Decision Log

File này ghi lại các quyết định sản phẩm/kỹ thuật để các phiên sau không tự suy đoán lại từ đầu.

## Đã chốt từ brief ban đầu

| ID | Quyết định | Lý do |
|---|---|---|
| D-001 | MVP là to-do app cá nhân, mobile-first. | Khớp nhu cầu kiểm soát công việc hằng ngày. |
| D-002 | Task chỉ có checkbox, tên, due date và project tùy chọn. | Giữ sản phẩm đơn giản. |
| D-003 | “Sắp tới” là ba ngày kế tiếp và không gồm hôm nay. | Tránh trùng nội dung với view Hôm nay. |
| D-004 | Hôm nay bao gồm task quá hạn. | Không để công việc trễ bị khuất. |
| D-005 | Due date là date-only trong MVP. | Người dùng chưa yêu cầu giờ hoặc reminder. |
| D-006 | Mặc định timezone `Asia/Ho_Chi_Minh`, tuần bắt đầu Thứ Hai. | Phù hợp bối cảnh sử dụng hiện tại. |
| D-007 | PWA là con đường đầu tiên để có biểu tượng trên iPhone. | Một codebase, không cần quy trình App Store. |
| D-008 | Option B — Quiet Focus là đề xuất mặc định, chưa xem là phê duyệt cuối. | Cân bằng calm, cá tính và mobile usability. |
| D-009 | Kiến trúc đề xuất là Next.js + Supabase + Vercel. | Hỗ trợ web/PWA, auth, sync và deploy gọn. |
| D-010 | Chọn Option C — Compact Canvas làm hướng giao diện chính; thay thế đề xuất D-008. | Chủ dự án ưu tiên sự gọn gàng và mật độ thông tin. |
| D-011 | Cấu trúc màu chính dùng navy–turquoise–violet với content surface sáng, lấy cảm hứng từ ảnh tham chiếu do chủ dự án cung cấp ngày 2026-08-19. | Tạo bản sắc màu rõ nhưng vẫn giữ danh sách dễ đọc. |
| D-012 | Task row chỉ hiển thị dot màu project cỡ lớn, không hiển thị tên project. | Màu đã đủ để nhận diện trong ngữ cảnh cá nhân và giúp danh sách gọn hơn. |
| D-013 | Navigation desktop dùng sidebar đầy đủ và cho phép thu gọn thành compact rail; không dùng top navigation. | Sidebar rõ ràng hơn khi quản lý filter/project, compact rail vẫn giải phóng không gian khi cần. |
| D-014 | Filter dùng shortcut `G T`, `G U`, `G D`; `[` toggle sidebar và `?` mở trợ giúp. | Chuỗi hai phím tránh xung đột với shortcut trình duyệt và vẫn dễ khám phá qua trợ giúp trong app. |
| D-015 | Tên chính thức của app là **Spark**; thay thế tên tạm Daily. | Gợi cảm giác ý tưởng mới lóe lên và các hành động nhỏ hỗ trợ người dùng hoàn thành ước mơ. |
| D-016 | Brand palette dùng ba màu gốc navy–turquoise–violet và có thể thêm tối đa hai màu chromatic hài hòa; tổng không quá năm màu. Trắng, xám và đen là neutral, không tính vào giới hạn. | Cho phép nhận diện đa dạng hơn nhưng tránh tương phản gắt và quá tải màu sắc. |
| D-017 | MVP hỗ trợ hai loại item: task và note. Note hiển thị bằng bullet point, không có checkbox/completed state; cả hai có thể có due date và project. | Cho phép lưu điều cần nhớ mà không ép mọi nội dung thành công việc phải hoàn thành. |
| D-018 | Task và note đều có hai cờ độc lập: Quan Trọng (star) và Urgent (điện xẹt), kèm smart filter riêng. | Giúp người dùng tập trung theo mức độ ý nghĩa và tính khẩn cấp mà không cần priority nhiều cấp. |
| D-019 | Website chính thức dùng domain **spark.thuanngo.com**. | Cố định URL đích cho metadata, PWA manifest và cấu hình deploy. |
| D-020 | Bản web MVP mở public, không yêu cầu đăng nhập; dữ liệu giai đoạn đầu lưu cục bộ trên từng trình duyệt. | Cho phép mở ra là dùng ngay. Cloud sync và cơ chế nhận diện người dùng sẽ chỉ được bổ sung khi có yêu cầu mới. |
| D-021 | D-020 được điều chỉnh: website vẫn mở public và có demo cục bộ, nhưng dữ liệu cá nhân đồng bộ qua Supabase sau khi xác thực nhẹ bằng email magic link. | Đồng bộ trên mọi browser cần một danh tính ổn định; magic link + RLS đáp ứng yêu cầu này mà không đặt màn hình login chặn việc xem website. |
| D-022 | Chốt hai màu mở rộng là Muted Coral `#D9776A` và Deep Purple `#65458A`; palette chromatic đầy đủ gồm navy `#111742`, turquoise `#44D4CD`, violet `#8951C7`, Muted Coral và Deep Purple. | Muted Coral thêm một accent ấm vừa phải; Deep Purple tối hơn violet nhưng không gần navy, giúp phân tầng màu mà không tăng tương phản quá gắt. Quyết định này chốt lựa chọn mở ở Q-005. |
| D-023 | Logo chính thức là lockup lowercase bold `spark` với icon check-burst tách riêng. Wordmark và dấu tick cùng Deep Purple `#65458A`; ba tia lần lượt dùng turquoise `#44D4CD`, Muted Coral `#D9776A` và violet `#8951C7`. | Giữ khả năng đọc mạnh của wordmark đã chọn, thống nhất tick với chữ và đưa ba accent chính vào icon mà không biến burst thành star. |

## Cần chủ dự án xác nhận

### Q-002 — Đồng bộ (đã chốt bởi D-021)

Có cần iPhone và desktop dùng chung dữ liệu ngay ở MVP không?

- Nếu có: dùng Supabase Auth + database từ đầu.
- Nếu không: có thể prototype local-first, nhưng dữ liệu không tự đi theo thiết bị.

### Q-003 — Đăng nhập (đã chốt bởi D-021)

Nếu dùng cloud sync, ưu tiên email magic link hay đăng nhập Apple/Google? Đề xuất ban đầu: email magic link vì đơn giản.

### Q-004 — Ngôn ngữ

UI mặc định đang là tiếng Việt. Cần xác nhận có cần giao diện song ngữ hay không.

### Q-005 — Hai màu mở rộng (đã chốt bởi D-022)

Chọn Muted Coral `#D9776A` và Deep Purple `#65458A`; không dùng Soft Amber `#D6A84F` trong palette đã chốt. Vai trò semantic cụ thể của hai màu trong UI sẽ được xác nhận khi hoàn thiện token/state, không tự động đồng nhất với cờ Quan Trọng/Urgent.

## Cách thêm quyết định

Thêm dòng D-xxx với ngày, quyết định, bối cảnh và ảnh hưởng. Không xóa quyết định cũ; nếu thay đổi, tạo quyết định mới ghi rõ quyết định nào bị thay thế.
