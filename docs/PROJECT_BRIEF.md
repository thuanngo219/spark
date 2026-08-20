# Product Brief — Spark

## 1. Tóm tắt

**Spark** là web app quản lý task và note cá nhân giúp người dùng biết hôm nay cần làm gì, lưu nhanh điều cần nhớ, thấy những việc sắp đến trong ba ngày và xem nội dung theo ngày hoặc dự án. Tên gọi gợi cảm giác một ý tưởng mới lóe lên và những bước nhỏ giúp người dùng hoàn thành ước mơ. Trải nghiệm phải nhanh, thanh lịch, ít nhiễu và dễ mở từ màn hình chính iPhone như một ứng dụng.

## 2. Vấn đề cần giải quyết

Các công cụ quản lý công việc thường trở nên nặng vì có quá nhiều trường, chế độ xem và quy trình. Spark chỉ giữ lại những tín hiệu cần thiết cho việc lên kế hoạch mỗi ngày:

- Việc gì cần làm?
- Điều gì cần ghi nhớ nhưng không phải một task?
- Đã hoàn thành chưa?
- Khi nào đến hạn?
- Thuộc dự án nào?

## 3. Người dùng mục tiêu

- Một người dùng chính: chủ dự án.
- Dùng thường xuyên trên iPhone, đôi khi trên desktop.
- Muốn nhập và kiểm tra công việc nhanh, không cần cộng tác nhóm trong MVP.

## 4. Mục tiêu sản phẩm

- Người dùng có thể thêm một task trong khoảng 5 giây.
- Màn hình Hôm nay trả lời ngay “tôi cần làm gì bây giờ?”.
- Việc quá hạn không bị biến mất.
- Điều hướng giữa thời gian và dự án rõ ràng nhưng không chiếm nhiều không gian.
- Có thể truy cập từ biểu tượng trên Home Screen của iPhone.

## 5. Phạm vi MVP

### Task

Mỗi task có:

- Checkbox hoàn thành.
- Tên task, bắt buộc, tối đa 200 ký tự.
- Due date, tùy chọn, chỉ lưu **ngày** chứ không lưu giờ trong MVP.
- Project, tùy chọn.

Hành động:

- Tạo nhanh bằng một ô nhập cố định trong danh sách.
- Sửa tên trực tiếp hoặc trong một popover/sheet gọn.
- Chọn/đổi/xóa due date.
- Chọn/đổi/bỏ project.
- Check/uncheck hoàn thành.
- Xóa task có khả năng hoàn tác trong vài giây.

### Note

Note là một item ghi chú ngắn, không phải task:

- Hiển thị bằng bullet point thay cho checkbox.
- Có tên/nội dung ngắn, tối đa 500 ký tự trong MVP.
- Có due date và project tùy chọn giống task để có thể xuất hiện trong view thời gian/dự án.
- Không có trạng thái hoàn thành; có thể sửa, xóa hoặc lưu trữ.

### Quan Trọng và Ưu tiên

- Cả task và note đều có thể bật **Quan Trọng** bằng icon star.
- Cả task và note đều có thể bật **Ưu tiên** bằng icon điện xẹt; data model giữ tên `is_urgent` để tương thích.
- Hai cờ độc lập; một item có thể đồng thời Quan Trọng và Ưu tiên.
- Đây là hai tín hiệu duy nhất trong MVP, không mở rộng thành hệ priority nhiều cấp.

### Projects

- Tạo project bằng tên và một màu nhận diện.
- Đổi tên/màu và lưu trữ project.
- Có thể gắn sao project để đưa project lên nhóm **Cần lưu ý** trong sidebar.
- Mở project để xem các task chưa hoàn thành của project đó.
- Task trong project đã lưu trữ vẫn tồn tại; project không còn xuất hiện ở danh sách điều hướng chính.

### Master filters

| Bộ lọc | Quy tắc |
|---|---|
| **Hôm nay** | Task chưa hoàn thành có due date hôm nay **hoặc đã quá hạn**. Task quá hạn nằm trong nhóm riêng ở đầu danh sách. |
| **Sắp tới** | Task chưa hoàn thành có due date từ ngày mai đến hết ngày thứ ba tính từ hôm nay. Ví dụ hôm nay 10/8 thì gồm 11/8, 12/8 và 13/8. |
| **Theo ngày** | Chọn một ngày cụ thể để xem task chưa hoàn thành đến hạn ngày đó; có nút quay về hôm nay. |
| **Tất cả** | Toàn bộ task chưa hoàn thành và note, chia theo thứ tự Quá hạn, Hôm nay, Sắp tới (ba ngày kế tiếp), Sau đó và Chưa có ngày. |
| **Project** | Task chưa hoàn thành thuộc project đã chọn, sắp xếp theo due date; task chưa có ngày nằm cuối. |

Đối với note, các view thời gian dùng due date tương tự task; note không bị loại bởi trạng thái hoàn thành vì note không có checkbox.

Mọi view có một bộ lọc hiển thị chung để ẩn/hiện note. Khi ẩn, note chỉ bị loại khỏi danh sách đang nhìn và số liệu quá hạn hiển thị; dữ liệu note không bị sửa hoặc xóa, và lựa chọn tiếp tục áp dụng khi chuyển view trong phiên hiện tại.

### Smart filters

| Bộ lọc | Quy tắc |
|---|---|
| **Quan Trọng** | Task chưa hoàn thành và note có `is_important = true`. |
| **Ưu tiên** | Task chưa hoàn thành và note có `is_urgent = true`. |

Item có cả hai cờ xuất hiện trong cả hai smart filter.

Quy ước ngày:

- Múi giờ mặc định: `Asia/Ho_Chi_Minh`.
- Tuần bắt đầu từ Thứ Hai.
- So sánh theo calendar date trong múi giờ người dùng, không dùng khoảng 24 giờ trượt.
- Task không có due date không xuất hiện trong Hôm nay, Sắp tới hoặc Theo ngày; task vẫn xuất hiện ở nhóm Chưa có ngày trong Tất cả và trong project tương ứng.

### Completed tasks

- Task vừa check biến đổi trạng thái ngay, sau đó thu gọn khỏi danh sách đang xem.
- Có khu vực “Đã hoàn thành” thu gọn ở cuối mỗi view để xem và uncheck.
- Nút thêm là floating `+` 48px ở góc dưới phải và mở quick-add dạng overlay gọn neo cùng góc trên desktop/mobile. Overlay vẫn chỉ giữ các trường thiết yếu để không làm chậm thao tác nhập.
- Trên mobile, mở quick-add phải focus ngay title input và giữ field này trong vùng nhìn thấy khi bàn phím ảo xuất hiện; người dùng không cần kéo form để bắt đầu nhập.
- Trên mobile, góc phải app header là nút Ẩn/Hiện ghi chú; trạng thái đồng bộ tiếp tục có trong navigation/footer.
- Completed task không được tính trong số lượng task mở.
- Trong mọi listing hỗn hợp, task hiển thị trước note trên cả desktop và mobile; view Tất cả vẫn chia theo nhóm thời gian rồi mới áp dụng thứ tự này trong từng nhóm.

## 6. Information architecture

```text
Spark
├── Hôm nay
├── Sắp tới
├── Theo ngày
│   └── Date picker / calendar strip
├── Tất cả
├── Smart filters
│   ├── Quan Trọng
│   └── Ưu tiên
└── Projects
    ├── Project A
    ├── Project B
    └── + Tạo project
```

Desktop mở mặc định ở view Hôm nay với sidebar thu gọn thành compact rail; người dùng có thể mở sidebar bằng nút panel luôn nhìn thấy hoặc phím `[`. Lựa chọn sau đó được ghi nhớ trên thiết bị. Mobile dùng header + sheet điều hướng; sheet mở bằng nút menu hoặc swipe từ mép trái sang phải, và các view chính vẫn truy cập tối đa trong hai thao tác.

Hai nhóm **Cần lưu ý** và **Dự án** có thể thu gọn độc lập. Cần lưu ý gồm smart filter Quan Trọng/Ưu tiên và các project được gắn sao; trạng thái nhóm được ghi nhớ trên thiết bị.

### Keyboard shortcuts

Phím tắt filter dùng chuỗi hai phím để tránh xung đột với trình duyệt:

| Phím | Hành động |
|---|---|
| `N` | Mở quick-add ở chế độ task mới. |
| `S`, sau đó `T` | Mở **Hôm nay**. |
| `S`, sau đó `S` | Mở **Sắp tới**. |
| `S`, sau đó `D` | Mở **Theo ngày**. |
| `S`, sau đó `A` | Mở **Tất cả**. |
| `S`, sau đó `I` | Mở **Quan Trọng**. |
| `S`, sau đó `U` | Mở **Ưu tiên**. |
| `S`, sau đó `1–9` | Mở dự án tương ứng theo thứ tự đang hiển thị trong sidebar. |
| `[` | Thu gọn/mở rộng sidebar. |
| `?` | Mở bảng trợ giúp phím tắt. |
| `Escape` | Hủy chuỗi phím đang chờ hoặc đóng bảng trợ giúp. |

Quy tắc:

- Không kích hoạt shortcut khi focus nằm trong input, textarea, select hoặc vùng `contenteditable`.
- Sau khi nhấn `S`, UI hiển thị một gợi ý nhỏ về các phím tiếp theo; trạng thái chờ tự hủy sau khoảng một giây.
- Shortcut phải được hiển thị trong tooltip/menu trợ giúp, không yêu cầu người dùng ghi nhớ để sử dụng app.

## 7. Luồng chính

### Thêm task nhanh

1. Người dùng chọn một view.
2. Chọn “Thêm task” hoặc “Thêm note”.
3. Nhập tên.
4. Hệ thống gán ngữ cảnh mặc định:
   - Trong Hôm nay: due date = hôm nay.
   - Trong một ngày cụ thể: due date = ngày đang xem.
   - Trong Project: project = project đang xem, due date để trống.
   - Trong Sắp tới: không tự đoán ngày; yêu cầu chọn một trong ba ngày.
5. Enter/Lưu tạo item; input vẫn sẵn sàng để nhập tiếp.

### Hoàn thành task

1. Người dùng chạm checkbox.
2. UI phản hồi ngay bằng animation ngắn và accessible announcement.
3. Task rời danh sách mở sau một khoảng trễ ngắn; có thể uncheck trong khu vực hoàn thành.

## 8. Nguyên tắc trải nghiệm

- **Calm by default:** khoảng trắng rộng, một màu nhấn chính, ít đường viền.
- **Fast capture:** ô nhập luôn gần ngón tay/con trỏ.
- **Progressive disclosure:** chỉ hiện project/date controls khi cần.
- **Purposeful motion:** animation 150–220ms, dùng để xác nhận trạng thái chứ không trang trí.
- **Accessible:** WCAG AA cho tương phản, focus rõ, hỗ trợ keyboard và reduced motion.
- **Không tạo cảm giác tội lỗi:** quá hạn được thông báo rõ nhưng không dùng màu đỏ dày đặc.

## 9. Ngoài phạm vi MVP

- Nhắc việc/push notification.
- Giờ đến hạn.
- Task lặp lại, priority nhiều cấp, tag, rich-text/long-form notes, file đính kèm, subtask.
- Kéo thả phức tạp, collaboration, team workspace.
- AI, natural-language parsing, calendar integration.
- Native App Store app và native iOS widget.

Các mục này có thể vào backlog sau khi MVP được dùng thật ít nhất hai tuần.

## 10. Chỉ số thành công ban đầu

Vì đây là sản phẩm cá nhân, ưu tiên tín hiệu hành vi đơn giản:

- Dùng app ít nhất 5 ngày/tuần sau hai tuần đầu.
- Median time từ mở app đến tạo xong task dưới 10 giây.
- Không có task bị mất khi refresh, offline ngắn hoặc đăng nhập lại.
- Chủ dự án có thể tìm mọi task đến hạn trong tối đa hai thao tác.

## 11. Acceptance criteria

- Refresh hoặc mở lại app không làm mất task.
- Task quá hạn xuất hiện trong Hôm nay và có nhãn ngày dễ hiểu.
- Sắp tới chỉ gồm ba ngày kế tiếp, không gồm hôm nay.
- Ngày chuyển đúng tại nửa đêm ở múi giờ cấu hình.
- Một task chỉ thuộc tối đa một project trong MVP.
- Note hiển thị bằng bullet point, không có checkbox hoặc completed state.
- Task/note có thể bật đồng thời Quan Trọng và Ưu tiên; smart filters bao gồm đúng item phù hợp.
- Bộ lọc ẩn ghi chú hoạt động nhất quán ở mọi view và không làm thay đổi dữ liệu note.
- Layout hoạt động từ 320px đến desktop; không có horizontal scroll ngoài thành phần lịch chủ đích.
- Tất cả thao tác chính dùng được bằng touch và keyboard.
- Sidebar desktop chuyển đổi được giữa full và compact; lựa chọn được giữ sau khi reload.
- Cần lưu ý/Dự án có thể thu gọn; project gắn sao xuất hiện trong Cần lưu ý và trạng thái này được lưu cùng dữ liệu project.
- Các shortcut `N`, `S T`, `S S`, `S D`, `S A`, `S I`, `S U`, `S 1–9`, `[` và `?` hoạt động đúng, không kích hoạt khi đang nhập task.
- Compact sidebar hiển thị tooltip tên hạng mục/project ngay khi hover hoặc focus vào icon/dot.
- App cài được lên Home Screen với tên/icon riêng và mở ở chế độ standalone khi nền tảng hỗ trợ.
