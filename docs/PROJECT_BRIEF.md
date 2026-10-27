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
- Tên task, bắt buộc, một dòng, tối đa 100 ký tự.
- Nội dung chi tiết, tùy chọn, tối đa 4.000 ký tự, hỗ trợ đậm/nghiêng/gạch chân; task và note đều có trường này.
- URL bắt đầu bằng `http://`, `https://` hoặc `www.` trong Nội dung được hiển thị thành liên kết và mở ở tab mới; dữ liệu gốc vẫn là plain text.
- Ngày bắt đầu và ngày đến hạn, đều tùy chọn và chỉ lưu **ngày** chứ không lưu giờ trong MVP. Chỉ task mới trong Hôm nay mặc định ngày bắt đầu là hôm nay; các trường hợp khác để trống nhưng người dùng có thể xóa.
- Project, tùy chọn.

Hành động:

- Tạo nhanh bằng một ô nhập cố định trong danh sách.
- Sửa tên trực tiếp hoặc trong một popover/sheet gọn.
- Chọn/đổi/xóa ngày bắt đầu và ngày đến hạn.
- Chọn/đổi/bỏ project.
- Check/uncheck hoàn thành.
- Xóa task có khả năng hoàn tác trong vài giây.

### Note

Note là một item ghi chú ngắn, không phải task:

- Listing dùng dấu gạch ngang có thể bấm để lưu trữ; trong chi tiết là dấu gạch ngang tĩnh, không có checkbox.
- Có Tên ngắn trên một dòng, tối đa 100 ký tự; Nội dung chi tiết tùy chọn tối đa 4.000 ký tự như task.
- URL trong Nội dung note được hiển thị thành liên kết và mở ở tab mới; dữ liệu gốc vẫn là plain text.
- Có ngày bắt đầu, ngày đến hạn và project tùy chọn giống task để có thể xuất hiện trong view thời gian/dự án.
- Không có trạng thái hoàn thành; có thể sửa, xóa, lưu trữ và khôi phục.

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
- Project Editor có Lưu trữ/Khôi phục và Xóa dự án. Mục **Dự án đã lưu trữ** trong sidebar/compact rail/mobile drawer cho phép xem lại, chỉnh sửa và khôi phục.
- Lưu trữ không thay đổi task/note hay cờ gắn sao. Task/note thuộc dự án đã lưu trữ bị ẩn khỏi Hôm nay, Sắp tới, Theo ngày và Tất cả, bao gồm disclosure trạng thái và số đếm. Vẫn có thể xem trong dự án đã lưu trữ và smart filter; khôi phục dự án đưa item trở lại các view theo quy tắc ngày/trạng thái. Dự án đã lưu trữ không được gán cho item mới, nhưng quan hệ của item cũ vẫn được giữ.
- Xóa dự án cần xác nhận, không thể hoàn tác. Chỉ xóa dự án: toàn bộ task/note (kể cả đã hoàn thành/lưu trữ) được giữ nguyên, bỏ liên kết dự án và chuyển về **Không có dự án**.
- Trên desktop, click một project dot trước task/note sẽ mở hoặc thu gọn đồng loạt mọi project dot trong view thành pill nhỏ hiển thị đầy đủ tên dự án uppercase với regular weight trên một dòng, không ellipsis hoặc xuống dòng. Khi mở, pill chỉ ôm tên dự án nhưng nằm trong một cột chung theo pill dài nhất để mọi title vẫn thẳng hàng; dot giữ nguyên trục khi co giãn. Pill tham gia layout, không overlay hoặc dùng shadow; trạng thái mở và tùy chọn bật/tắt được giữ khi đổi view và lưu riêng theo browser. Trên mobile luôn chỉ hiển thị dot tĩnh và không có thao tác mở pill.

### Master filters

| Bộ lọc | Quy tắc |
|---|---|
| **Hôm nay** | Item quá hạn có ngày đến hạn trước hôm nay; khu **Hôm nay** có ngày bắt đầu hoặc ngày đến hạn đúng hôm nay; khu **Đang thực hiện** có ngày bắt đầu trước hôm nay và chưa đến hạn; task trống cả hai ngày nằm ở **Chưa có ngày**. Note trống cả hai ngày không xuất hiện. |
| **Sắp tới** | Item có ít nhất một trong hai ngày bắt đầu/ngày đến hạn từ ngày mai đến hết ngày thứ ba tính từ hôm nay. Ví dụ hôm nay 10/8 thì gồm 11/8, 12/8 và 13/8. |
| **Theo ngày** | Chọn một ngày cụ thể để xem item có ngày bắt đầu hoặc ngày đến hạn trùng ngày đó; có nút quay về hôm nay. |
| **Tất cả** | Toàn bộ task chưa hoàn thành và note đang hoạt động, chia theo thứ tự Quá hạn, Hôm nay, Đang thực hiện, Sắp tới (ba ngày kế tiếp), Sau đó và Chưa có ngày. |
| **Project** | Task/note đang hoạt động thuộc project đã chọn; mỗi row nêu rõ ngày bắt đầu và ngày đến hạn, kể cả trạng thái chưa có ngày. |

Note trống cả ngày bắt đầu lẫn ngày đến hạn không xuất hiện trong Hôm nay. Note đã lưu trữ rời mọi danh sách đang hoạt động nhưng vẫn có thể xem và khôi phục trong disclosure cuối view phù hợp; riêng Hôm nay chọn note theo ngày lưu trữ thay vì các trường ngày kế hoạch.

Mọi view có switcher icon-only ba chế độ theo thứ tự **Tất cả / Chỉ note / Chỉ task**. Đây là presentation filter: chỉ thay đổi danh sách và số liệu đang nhìn, không sửa hoặc xóa dữ liệu; lựa chọn tiếp tục áp dụng khi chuyển view trong phiên hiện tại.

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
- Cả ngày bắt đầu và ngày đến hạn đều nullable. Chỉ task mới trong Hôm nay mặc định ngày bắt đầu là hôm nay; các trường hợp khác để trống; dữ liệu cũ được backfill từ `created_at` theo `Asia/Ho_Chi_Minh`, hoặc `2026-09-03` nếu timestamp không dùng được.
- Task trống cả hai ngày xuất hiện trong khu Chưa có ngày của Hôm nay/Tất cả và project tương ứng; note trống cả hai ngày không xuất hiện trong Hôm nay.
- Trong listing, hôm qua/hôm nay/ngày mai hiển thị bằng nhãn tương đối; ngày khác trong năm hiện tại dùng `dd.mm`, khác năm dùng `dd.mm.yy`.

### Task đã hoàn thành và note đã lưu trữ

- Task vừa check biến đổi trạng thái ngay, sau đó thu gọn khỏi danh sách đang xem.
- Note có thể lưu trữ bằng marker, editor hoặc action swipe trên mobile; thao tác khôi phục đưa note trở lại danh sách đang hoạt động.
- Có disclosure thu gọn ở cuối mỗi view để xem/uncheck task đã hoàn thành và khôi phục note đã lưu trữ; nhãn thay đổi theo loại item đang có.
- Desktop giữ floating `+` 48px ở góc dưới phải. Mobile đưa `+` 64px vào chính giữa dock 58px sát ba mép màn hình, nhô nhẹ phía trên dock; cả hai cùng mở quick-add dạng overlay gọn. Checkbox Ghi chú giữ nguyên; task và note đều có nút **Thêm Nội dung** để mở field tùy chọn. Quick-add luôn giữ chọn ngày và dự án cho cả hai loại.
- Trên mobile, mở quick-add phải focus ngay title input và giữ field này trong vùng nhìn thấy khi bàn phím ảo xuất hiện; người dùng không cần kéo form để bắt đầu nhập.
- Trên mobile, bỏ app header riêng. Nút mở sidebar là panel icon-only đứng trước tên view trong sticky header; switcher item nằm bên trái sync pill trong hàng control nổi ngay trên dock.
- Completed task không được tính trong số lượng task mở.
- Riêng Hôm nay, disclosure chỉ hiển thị task hoàn thành hôm nay và note được lưu trữ hôm nay theo `Asia/Ho_Chi_Minh`, không dựa vào due date (kể cả không ngày hoặc đến hạn trong tương lai). Item chuyển trạng thái ngày khác vẫn xem được ở các view phù hợp khác.
- Mỗi khu có header row và sort độc lập theo Mức chú ý, Ngày đến hạn, Ngày bắt đầu hoặc Tên; khu đã hoàn thành/lưu trữ có thêm Ngày trạng thái. Luôn xếp toàn bộ task trước note trong từng khu, ở cả hai chiều. Lựa chọn sort lưu theo browser/view/khu; không ghi thêm `position` vào dữ liệu.
- Mức chú ý giữ cố định cả hai cờ → chỉ Quan Trọng → chỉ Ưu tiên → bình thường; trong mỗi mức xét ngày đến hạn rồi tên. Đảo chiều chỉ đảo ngày đến hạn trong cùng mức, không đảo mức chú ý. Các lựa chọn khác chỉ đảo khóa chính; hòa khóa xét tên A–Z rồi ngày đến hạn tăng dần. Ngày trống cuối trong từng loại (và từng mức khi sort Mức chú ý), ở cả hai chiều. Nếu vẫn hòa thì xét ngày tạo rồi ID tăng dần để thứ tự ổn định.

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

Desktop mở mặc định ở view Hôm nay với sidebar thu gọn thành compact rail; người dùng có thể mở sidebar bằng nút panel luôn nhìn thấy hoặc phím `⌘/Ctrl + \`. Lựa chọn sau đó được ghi nhớ trên thiết bị. Eyebrow Tất cả ghi “Mọi ngày. Mọi việc.”; Hôm nay/Sắp tới/Theo ngày/Tất cả dùng xám như Dự án (D-137). Desktop header dùng padding 20px cả bốn phía, sticky và có dải màu project/view cao 5px, radius 5px ở dưới cùng, sau tiêu đề và thống kê. Nền app canvas phẳng; header blur 8px/WebKit, không border dưới, bóng nhẹ tan ở hai mép.

Mobile dùng canvas tràn viền và view header sticky. Panel icon-only nằm trước tên view khi header đầy đủ. D-144/D-145: Header desktop/mobile thu gọn khi cuộn quá 28px, chuyển động 220ms; compact giữ h1 ở 50% cỡ chữ thường và dải màu 5px/radius 5px. Desktop giữ cụm sync/bộ lọc trong header, mobile giữ cụm nổi trên dock. Ẩn eyebrow, thống kê, nút mở sidebar mobile và nút sửa dự án; cuộn về đầu khôi phục đầy đủ. H1 dùng letter-spacing -0.025em ở cả hai trạng thái. Padding desktop 20px; mobile 15px cả bốn phía cộng safe-area theo D-161; giữ blur 8px/WebKit và opacity dark 75% cho h1/dải màu. Dock cao 58px cộng safe-area, sát mép trái/phải/dưới, nền surface đặc theo theme, chia đều năm cột Hôm nay/Sắp tới/Thêm/Theo ngày/Tất cả. Bốn đích có icon 24px trên và nhãn 11px dưới; active dùng icon Navy ở light/heading sáng ở dark, nhãn bold, không có nền riêng. Nút + 64px/dấu + 36px không có nhãn và nhô nhẹ phía trên dock (D-162). Sheet điều hướng mở bằng panel icon trong header hoặc swipe từ mép trái sang phải, giữ full negative logo + nút đóng và không lặp các view chính đã có trong dock. Tap item mở editor; swipe trái lộ Quan Trọng/Ưu tiên/Xóa với task và Quan Trọng/Ưu tiên/Lưu trữ với note, swipe phải trên item không có hành động và không dùng touch-and-hold.

Hai nhóm **Cần lưu ý** và **Dự án** có thể thu gọn độc lập. Cần lưu ý gồm smart filter Quan Trọng/Ưu tiên và các project được gắn sao; trạng thái nhóm được ghi nhớ trên thiết bị.

### Keyboard shortcuts

Phím tắt filter dùng một phím trực tiếp khi focus không nằm trong editor:

| Phím | Hành động |
|---|---|
| `N` | Mở quick-add ở chế độ task mới. |
| `T` | Mở **Hôm nay**. |
| `S` | Mở **Sắp tới**. |
| `D` | Mở **Theo ngày**. |
| `A` | Mở **Tất cả**. |
| `I` | Mở **Quan Trọng**. |
| `U` | Mở **Ưu tiên**. |
| `[` | Chỉ hiển thị note. |
| `]` | Chỉ hiển thị task. |
| `\` | Hiển thị tất cả task và note. |
| `1–9` | Mở dự án tương ứng theo thứ tự đang hiển thị trong sidebar. |
| `⌘/Ctrl + \` | Thu gọn/mở rộng sidebar. |
| `?` | Mở bảng trợ giúp phím tắt. |
| `<` | Chọn giao diện Sáng. |
| `>` | Chọn giao diện Tối. |
| `M` / `m` | Chọn giao diện Theo hệ thống. |
| `Escape` | Đóng overlay hoặc bảng trợ giúp. |

Quy tắc:

- Không kích hoạt shortcut khi focus nằm trong input, textarea, select hoặc vùng `contenteditable`.
- Ba shortcut filter nội dung chỉ nhận đúng phím đơn `[`, `]` và `\`; ký tự có Shift `{`, `}` và `|` không kích hoạt filter.
- Bảng trợ giúp dùng hai nhóm Điều hướng/Tập trung, gộp dự án thành một dòng `1–9` không liệt kê tên dự án, có nút đóng rõ ràng và đóng được bằng `Escape` trên cả desktop/mobile.
- Shortcut phải được hiển thị trong tooltip/menu trợ giúp, không yêu cầu người dùng ghi nhớ để sử dụng app.

## 7. Luồng chính

### Thêm task nhanh

1. Người dùng chọn một view.
2. Chọn “Thêm task” hoặc “Thêm note”.
3. Nhập tên.
4. Hệ thống gán ngữ cảnh mặc định:
   - Ngày bắt đầu để trống ở mọi view; riêng task mới trong Hôm nay mặc định bằng hôm nay. Chuyển sang note bỏ ngày mặc định; ngày đã chọn/xóa thủ công được giữ.
   - Trong Hôm nay: ngày đến hạn = hôm nay.
   - Trong một ngày cụ thể: ngày đến hạn = ngày đang xem.
   - Trong Project: project = project đang xem, ngày đến hạn để trống.
   - Trong Sắp tới: yêu cầu ít nhất ngày bắt đầu hoặc ngày đến hạn thuộc một trong ba ngày kế tiếp.
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
- Task lặp lại, priority nhiều cấp, tag, định dạng nâng cao ngoài đậm/nghiêng/gạch chân, file đính kèm, subtask.
- Kéo thả phức tạp, collaboration, team workspace.
- AI, natural-language parsing, calendar integration.
- Native App Store app và native iOS widget.

Các mục này có thể vào backlog sau khi MVP được dùng thật ít nhất hai tuần.

## 10. Chỉ số thành công ban đầu

Vì đây là sản phẩm cá nhân, ưu tiên tín hiệu hành vi đơn giản:

- Dùng app ít nhất 5 ngày/tuần sau hai tuần đầu.
- Median time từ mở app đến tạo xong task dưới 10 giây.
- Không có task bị mất khi refresh, offline, đóng/mở lại PWA hoặc đăng nhập lại; sau lần mở production online đầu tiên, app cold-start được khi không có mạng.
- Chủ dự án có thể tìm mọi task đến hạn trong tối đa hai thao tác.

## 11. Acceptance criteria

- Lưu trữ/khôi phục/xóa dự án hoạt động trên desktop và mobile, lưu qua reload và hàng đợi cloud/offline. Xóa không làm mất task/note; cancel/Escape trong xác nhận không xóa gì.
- Refresh hoặc mở lại app không làm mất task.
- Sau lần mở production online đầu tiên, PWA mở được khi offline; CRUD local sống qua reload và tự đồng bộ khi mạng trở lại.
- Bốn master view ẩn mọi item thuộc dự án đã lưu trữ và loại khỏi số đếm; khôi phục dự án làm các item xuất hiện lại theo filter, không sửa dữ liệu item.
- Hôm nay không hiện task đã hoàn thành ngày khác; kiểm tra ranh giới nửa đêm theo múi giờ Việt Nam, không lấy ngày UTC hay due date.
- Task quá hạn xuất hiện trong Hôm nay và có nhãn ngày dễ hiểu.
- Note trống cả hai ngày không xuất hiện trong Hôm nay; task trống cả hai ngày nằm trong Chưa có ngày. Bốn nhóm Quá hạn/Hôm nay/Đang thực hiện/Chưa có ngày đóng mở độc lập và mặc định mở.
- Sắp tới chỉ gồm item có ngày bắt đầu hoặc ngày đến hạn trong ba ngày kế tiếp, không gồm hôm nay.
- Ngày chuyển đúng tại nửa đêm ở múi giờ cấu hình.
- Một task chỉ thuộc tối đa một project trong MVP.
- Note dùng dấu gạch ngang, không có checkbox hoặc completed state; marker trong chi tiết là tĩnh.
- Task/note có thể bật đồng thời Quan Trọng và Ưu tiên; smart filters bao gồm đúng item phù hợp.
- Mỗi khu sort độc lập và lưu theo browser; task luôn trước note kể cả note có cả hai cờ hoặc đến hạn sớm hơn. Mức chú ý giữ cả hai cờ → Quan Trọng → Ưu tiên → bình thường và chỉ đảo ngày đến hạn trong từng mức. Ngày trống cuối trong từng loại/từng mức ở cả hai chiều; hòa khóa tuân theo quy tắc trên, không sửa dữ liệu đầu vào.
- Tất cả cho đóng/mở độc lập cả sáu khu thời gian, mặc định mở và giữ trạng thái trong phiên khi chuyển view; không ảnh hưởng trạng thái khu Hôm nay. Khoảng cách giữa các khu thống nhất 12px, kể cả khu đã hoàn thành/lưu trữ. Nhãn sort NGÀY TRẠNG THÁI phải hiển thị đầy đủ trên desktop/mobile.
- Email OTP của Spark hiển thị mã 36px, một dòng trong ô nền nhạt; tiêu đề thư bắt đầu bằng mã rồi đến “Mã đăng nhập Spark”. Chỉ template Spark trong shared hook thay đổi, không đổi thương hiệu/template của ứng dụng khác.
- Detail sheet giữ edit button ở mép phải của từng khối đọc; URL trong Nội dung task/note là liên kết mở tab mới và không cho phép protocol ngoài HTTP(S). Trên desktop, header, Tên và cụm metadata/control không dịch chuyển khi xem item dài; bánh xe chuột chỉ cuộn vùng Nội dung.
- Canvas liệt kê task/note trên desktop rộng responsive trong dải `940–1200px` khi vùng nội dung đủ chỗ; màn hình hẹp và mobile co vừa vùng hiển thị, không phát sinh horizontal scroll. Detail sheet desktop giữ chiều rộng `880px`.
- Khung sửa Nội dung desktop dùng chiều cao tối đa như khung đọc nội dung dài: `min(86dvh, 820px)`, vùng nhập giãn theo phần còn lại. Quick-add giữ `160px`; mobile đọc/sửa giãn phần còn lại của màn hình theo D-157. Tên không có nhãn, nút sửa nằm cùng hàng text; khi sửa trên desktop, input và ✓/× cùng hàng; mobile ẩn ✓/× của Tên và tự lưu hợp lệ khi blur. Nội dung giữ ✓/× trên hàng nhãn để editor dùng trọn chiều rộng; control desktop là `28px` với icon `16px`, mobile giữ touch target `44px`. Hàng nhãn Nội dung cao 28px ở cả trạng thái đọc/sửa; mobile đặt Dự án và Lưu trữ/Xóa cùng một hàng, không tràn ngang ở 320px.
- Dock mobile bo tròn hai đầu; active navigation dùng pill đồng tâm và vẫn giữ vùng chạm tối thiểu 44px.
- Email đồng bộ gửi OTP 6 chữ số; input chỉ nhận tối đa 6 số và nút xác nhận chỉ bật khi có đúng 6 số.
- Switcher Tất cả/Note/Task hoạt động nhất quán ở mọi view và không làm thay đổi dữ liệu item.
- Toast Hoàn tác nằm ngoài vùng navigation/dock trên desktop và mobile.
- Layout hoạt động từ 320px đến desktop; không có horizontal scroll ngoài thành phần lịch chủ đích.
- Tất cả thao tác chính dùng được bằng touch và keyboard.
- Sidebar desktop chuyển đổi được giữa full và compact; lựa chọn được giữ sau khi reload.
- Cần lưu ý/Dự án có thể thu gọn; project gắn sao xuất hiện trong Cần lưu ý và trạng thái này được lưu cùng dữ liệu project.
- Các shortcut `N`, `T`, `S`, `D`, `A`, `I`, `U`, `[`, `]`, `\`, `⌘/Ctrl + \`, `1–9` và `?` hoạt động đúng, không kích hoạt khi đang nhập task.
- Compact sidebar hiển thị tooltip tên hạng mục/project ngay khi hover hoặc focus vào icon/dot.
- App cài được lên Home Screen với tên/icon riêng và mở ở chế độ standalone khi nền tảng hỗ trợ.

### Nghiệm thu editor và giao diện hiện hành (D-117–D-132)

- Nội dung tối đa 4.000 ký tự (Unicode code points, bao gồm xuống dòng), hỗ trợ B/I/U và ⌘/Ctrl+B/I/U cho task/note trong quick-add/detail. Định dạng giữ qua lưu, reload, offline và cloud sync.
- Nút Sửa Nội dung nằm ngang nhãn Nội dung và không di chuyển khi cuộn vùng nội dung dài; desktop detail rộng 880px.
- Quick-add chỉ mặc định Ngày bắt đầu hôm nay cho task trong Hôm nay. Note và mọi view khác để trống; vẫn cho chọn/xóa ngày thủ công. Ngày đến hạn giữ quy tắc hiện có.

- D-135 thay style D-120: Quick-add Tên focus dùng control-hover; Nội dung quick-add/chi tiết không border/nền. Chỉ toolbar giữ border và nền pha 5% đen (D-123), không bullet/numbering. Input sửa Tên chỉ gạch dưới, nền trong suốt, không outline/shadow. Nút icon tròn, nút chữ bo hai đầu; checked task màu xám. Badge logo full/compact giữ cùng size/vị trí, không cắt chân. Lưu/hủy Nội dung hiển thị 28px ở desktop/mobile, mobile hit area 44px.
- D-121: Draft hợp lệ tự lưu khi chuyển trường; tên rỗng không lưu. Ngày không hợp lệ hoặc ngày đến hạn trước ngày bắt đầu không được lưu, giữ draft kèm báo lỗi.
- D-125/D-126: Nhãn Nội dung cao 28px, gap dưới nhãn 4px desktop/8px mobile; khoảng cách hai phía divider còn 16px/14.4px. Không có label Tên.
- D-128: Hover checkbox/dấu note trong chi tiết không đổi nền; trạng thái checked giữ nguyên.
- D-130/D-131: Dải màu 5px ở chân header, không border dưới, bóng nhẹ rõ giữa và tan ở hai mép; body canvas phẳng, header blur 8px và WebKit trên desktop/mobile.

- D-127: Trước tên trong chi tiết và inline edit có checkbox cho task (checked theo completedAt, cho bật/tắt) hoặc dấu gạch ngang tĩnh cho note. Lưu draft hợp lệ trước khi đổi trạng thái; tên task hoàn thành trong chi tiết không gạch ngang. Mobile giữ vùng chạm 44px.

- D-129: Checkbox/dấu note sát lề nội dung, cách tên 10px; input Tên cao 28px. Mobile bỏ ✓/× của Tên, tự lưu khi rời ô (tên rỗng báo lỗi), Enter lưu/Escape hủy draft chưa lưu; desktop giữ ✓/×. Checkbox vẫn có vùng bấm 44px.

- D-155 thay kích thước D-131: Ô chọn sắp xếp và nút đổi chiều có height/min-height 30px trên desktop/mobile; nút đổi chiều rộng 30px để giữ hình tròn. Header blur 8px ở cả hai kích thước, có WebKit.

- D-132: Focus vào metadata trong chi tiết tự lưu draft hợp lệ nhưng giữ editor/kích thước khung, để click không mất đích hoặc đóng nhầm khung. Lưu/chuyển trường vẫn kết thúc edit; Hủy chỉ bỏ thay đổi chưa tự lưu. Regression kiểm tra click thực, lưu qua reload, ngày, project, lưu trữ/khôi phục và xác nhận xóa ở 1280px/390px.

## Giao diện sáng/tối — D-138–D-143

- Trong “Phím tắt & hiển thị”, chọn Theo hệ thống (mặc định), Sáng hoặc Tối. Lưu riêng thiết bị, đổi đồng thời giữa các tab cùng origin; chỉ bám OS khi Theo hệ thống.
- Áp dụng ngay lúc mở app, kể cả mở offline sau khi app shell đã cache; không chớp nền sáng do chờ React hydrate. Nếu không lưu preference được, vẫn đổi trong phiên hiện tại.
- Theme phủ danh sách, quick-add, chi tiết/editor, lịch, dự án, đồng bộ và control mobile. Giữ layout, B/I/U, màu project và asset nhận diện. Màu theo brand guideline D-138.
- Chủ dự án đã duyệt phát hành production ngày 05/10/2026 sau các vòng preview D-138–D-142. Header tối dùng opacity 75% cho tiêu đề/dải màu; nút sidebar 42px/icon 20px, nền canvas và hover chỉ đổi icon.

## Cập nhật D-145–D-146 (2026-10-06)

- Header thu gọn/mở lại trong 220ms; h1 giữ tỷ lệ 50% và tracking -0.025em. Cụm sync và All/Note/Task vẫn hiện trên desktop; mobile giữ cụm nổi trên dock. Eyebrow/thống kê ẩn khi compact. Dải màu 5px, blur 8px giữ nguyên; padding desktop 20px, mobile 15px cả bốn phía cộng safe-area theo D-161.
- Khởi động bằng lớp Navy #111742, logo negative gồm icon + chữ spark ở giữa và tiến trình theo giai đoạn. Chờ xác định phiên, cache đúng user, tải projects/items và xử lý queue; không render dữ liệu mẫu trong lúc chờ. Khi sẵn sàng, logo/thanh tiến trình fade 500ms rồi nền thu về phải trong 600ms (D-149).
- Local mới bắt đầu rỗng. Chỉ dọn bộ seed local cũ khi nhận diện đầy đủ và chưa sửa; giữ dữ liệu thật, bộ seed đã sửa/không rõ và toàn bộ dữ liệu cloud. Khi offline có cache thì mở bản lưu; lỗi đồng bộ có Thử lại và lựa chọn dùng dữ liệu đã lưu. Phần trăm là tiến trình từng bước, không phải phần trăm byte tải về.
- Chỉ bỏ Violet #8951C7 (và sắc nhãn #BA99DF), giữ Deep Purple #65458A. Dự án Violet chuyển Amber #D6A84F khi đọc local/cloud; cloud chỉ cập nhật trường color với điều kiện user/id/màu cũ. Queue ghi project cũng chuẩn hóa màu để không đưa Violet trở lại. Không đổi tên, quan hệ, thứ tự hay nội dung dự án.
- Quan Trọng Amber #D6A84F, Ưu tiên Coral #D9776A thống nhất toàn app ở cả hai theme. Preset dự án còn sáu màu; custom picker giữ nguyên. Mọi animation/transition dùng ease-out Quint `cubic-bezier(.22, 1, .36, 1)` và tôn trọng reduced motion.

D-147: phím tắt giao diện không chạy trong input/textarea/select/contenteditable, lúc IME đang ghép chữ hoặc khi giữ Ctrl/Command/Alt; Shift vẫn dùng được để tạo `<`, `>` và `M`. Dùng chung preference/theme event hiện hành, lưu local và cập nhật giữa các tab.

- D-156: Trong chi tiết task/note, kéo chọn chữ vượt biên không đóng sheet hoặc mất bản nháp. Chỉ bấm nền ngoài khi nhấn và thả đều trực tiếp trên nền mới đóng; nút Đóng giữ nguyên.

### D-157 — Chi tiết mobile toàn màn hình (2026-10-26)

Ở màn hình dưới 700px, chi tiết task/note phủ toàn bộ vùng nhìn thấy, nền chung theo canvas của theme; khối Nội dung trong suốt, không có nền riêng hoặc padding bổ sung theo D-159. Chữ/control theo theme hiện hành. Không bo khung, không bóng hoặc lộ nền danh sách. Khi đọc, header và metadata giữ ở hai đầu, nội dung giãn phần còn lại và cuộn riêng. Khi sửa Nội dung trên mobile, D-163 ẩn header/Tên/metadata, chỉ giữ Lưu/Hủy, toolbar và vùng nhập. Có safe-area, khóa cuộn nền và theo visual viewport khi mở bàn phím. Khi ít chiều cao, phần giữa có thể cuộn để truy cập đủ tên/nội dung. Desktop giữ popup và theme hiện tại; quick-add không đổi.

### D-161 — Header mobile gọn hơn (2026-10-26)

Eyebrow mobile dùng weight 400. Header padding 15px cả bốn phía cộng safe-area; gap hàng menu/tên/sửa 4px. H1 còn 30px, tracking -0.025em; compact mobile 16px, dải màu còn 2.5px (D-162). Nút mở menu và sửa dự án giữ vùng bấm 44px, giảm khoảng trống hai đầu bằng margin ngoài. Desktop giữ typography và spacing hiện hành.

### D-162 — Kích thước header và active dock mobile (2026-10-26)

Eyebrow 0.75rem bằng dòng thống kê, weight 400. Tiêu đề 30px, compact 16px; padding 15px cộng safe-area. Dải màu thường 5px, compact 2.5px. Dock active không có nền riêng: icon dùng heading (#111742 sáng, #E9ECF5 tối) và nhãn bold; bảo đảm contrast ≥4.5:1 trên nền dock. Nút + tròn 64px, glyph 36px, nhô nhẹ lên khỏi dock 58px và chừa home indicator. Desktop giữ nguyên.

### D-163 — Sửa Nội dung tập trung trên mobile (2026-10-26)

Eyebrow view-header mobile 0.65rem/weight 400/letter-spacing 0; tiêu đề compact 21px (thay 16px), các kích thước khác của D-162 giữ nguyên. Khi sửa Nội dung task/note, tạm ẩn header Chi tiết, Tên và metadata, giữ hàng Nội dung với Lưu/Hủy, toolbar B/I/U và vùng nhập giãn theo visual viewport. Padding chừa safe-area; chỉ vùng nhập cuộn. Font nhập 16px để tránh iOS tự zoom ở cỡ chữ nhỏ. Lưu/Hủy quay lại chi tiết đầy đủ; Hủy bỏ draft, Lưu giữ format và dữ liệu. Desktop, quick-add và giới hạn 4.000 ký tự không đổi.

### D-164 — Khóa nền khi sửa trên mobile (2026-10-26)

Trong chi tiết task/note mobile, backdrop phủ toàn layout viewport; chỉ sheet theo visual viewport khi bàn phím mở. Khóa trang bằng body fixed tại vị trí cuộn đã lưu, khóa overflow/overscroll của root và đặt danh sách/sidebar/dock/control nền inert. Vuốt trong editor chỉ cuộn editor; chạm nền ngoài phần sheet do bàn phím co không đóng chi tiết. Đóng chi tiết hoặc chuyển sang desktop khôi phục style, tương tác và vị trí cuộn; header dùng vị trí đã lưu để không đổi trạng thái khi body bị khóa. Desktop giữ click nền để đóng.

## D-165 — Khoảng trống đáy editor khi mở bàn phím (2026-10-26)

Trong focus mode sửa Nội dung mobile, bỏ padding đáy 12px và safe-area dưới khi visual viewport co hơn 120px so với innerHeight ở scale xấp xỉ 1. Giữ padding trong vùng nhập để caret không sát mép; đóng bàn phím khôi phục 12px + safe-area ngay cả khi editor còn focus. Ngưỡng là heuristic để tránh nhầm thay đổi chrome trình duyệt; pinch zoom không kích hoạt. Giữ safe-area trên/hai bên, full backdrop và khóa nền D-164; desktop/quick-add không đổi. Thanh ↑/↓/Done của iOS giữ nguyên do trình duyệt quản lý. Cần kiểm tra iPhone thật để xác nhận phần khoảng hở còn lại do hệ thống.

## D-166 — Focus trực tiếp và chống cuộn vượt biên Nội dung mobile (2026-10-26)

Bấm Sửa Nội dung mount editor và đặt caret cuối tài liệu ngay trong click/tap, focus đồng bộ để iOS có thể mở keyboard theo user gesture; không dùng autofocus qua timeout. Chỉ cuộn editor tới cuối, không cuộn trang. Editor chỉ mount sau tương tác người dùng, không render Tiptap trên server. Trong focus mode mobile, touchmove một ngón theo chiều dọc bị chặn khi nội dung không đủ cuộn hoặc vuốt ra ngoài đầu/cuối vùng nhập; vuốt vào vùng có thể cuộn vẫn native. Listener chỉ trên backdrop chi tiết, cleanup khi đóng/đổi breakpoint; không chặn tap, pinch, vuốt ngang, nhấn giữ hoặc kéo vùng chọn. Lưu/Hủy và định dạng B/I/U không đổi. Bổ sung D-164/D-165; không thay thanh bàn phím iOS.

## D-167 — Chi tiết mobile trượt ngang và vuốt mép để đóng (2026-10-27)

Dưới 700px, chi tiết task/note trượt từ phải vào màn hình; nút Đóng và vuốt từ dải 24px sát mép trái sang phải cho màn trượt ra phải. Mở/đóng và trả về khi vuốt chưa đủ dùng 240ms easeOutQuint (`cubic-bezier(.22,1,.36,1)`). Trong lúc kéo, màn theo ngón tay; thả sau ít nhất 25% bề rộng (tối thiểu 72px) sẽ đóng. Vuốt ngắn hoặc touchcancel trả về. Không nhận thao tác bắt đầu ở giữa màn, cuộn dọc, pinch, nhấn giữ/chọn chữ hoặc trên button/select/link.

Dùng CSS cho mở và Web Animations API của trình duyệt cho đóng/trả về, không thêm thư viện. Giữ khóa cuộn/inert nền đến khi đóng hoàn tất; swipe có cùng hành vi dữ liệu với nút × (không tự lưu bản nháp Nội dung). Giữ desktop và focus/keyboard D-166; reduced motion bỏ dịch chuyển. Cần xác nhận thao tác mép trên iPhone thật vì Safari có thể ưu tiên gesture điều hướng hệ thống.

## D-168 — Màu vùng trạng thái iOS và khoảng cách phía trên (2026-10-27)

Chủ dự án dùng iPhone 17, iOS 27.0.1, mở Spark từ Home Screen. Bỏ meta `apple-mobile-web-app-status-bar-style`; không dùng `black-translucent`. Next nhận `appleWebApp: true` và title qua `other` để tránh tự sinh style `default`; giữ manifest standalone và viewport-fit cover. Bootstrap trước paint đặt nền html/body, color-scheme và theme-color theo theme đã lưu: sáng #F7F8FA, tối #121622. Manifest dùng #F7F8FA làm fallback tĩnh.

Khi sidebar mobile mở (bằng nút hoặc vuốt), nền trình duyệt chuyển Navy #111742 và scheme tối cho đồng hồ/icon hệ thống; đóng menu hoặc sang desktop khôi phục theme hiện hành. Không đổi preference đã lưu. Padding trên header mobile giảm 15→8px và sidebar 19→8px, vẫn cộng safe-area do thiết bị cung cấp; không sửa khoảng cách ngang/dưới, kích thước tiêu đề hoặc vùng chạm. Không trừ chiều cao status bar bằng số đo màn hình hoặc UA heuristic.

iOS tự quyết định màu chữ/icon và diện tích status bar, web không thể vẽ tùy ý dưới vùng này. Hướng xử lý theo [WebKit 317153, comment 2](https://www2.webkit.org/show_bug.cgi?id=317153#c2); [301994](https://www2.webkit.org/show_bug.cgi?id=301994) vẫn ghi nhận vấn đề vùng hệ thống/cache màu ở một số bản iOS. Kiểm tra DOM/Chrome chỉ xác nhận màu app cung cấp, không thay kiểm tra status bar thực tế trên iPhone.

## D-169 — Cập nhật theme khi app trở về từ nền (2026-10-27)

Bổ sung D-168 sau phản hồi iPhone giữ màu status bar sáng khi iOS đã chuyển tối trong lúc Spark nằm nền. Bootstrap kiểm tra lại hệ thống bằng truy vấn media mới khi trang trở lại visible, nhận pageshow hoặc window focus; cập nhật cùng lúc data-theme, nền html/body, color-scheme và theme-color. Kiểm tra ngay và thêm một lần ở frame kế tiếp, gộp các sự kiện cùng lượt; không polling hoặc reload. Bỏ qua trang hidden và hủy frame đang chờ khi ẩn.

Chỉ chế độ Theo hệ thống đi theo OS; Sáng/Tối chọn cố định vẫn được giữ, kể cả khi localStorage không ghi được. Sidebar đang mở giữ Navy và khi đóng trả về theme mới. Giữ bản nháp, cuộn và màn đang mở. Không thay status-bar-style, safe-area hoặc CSS. Regression mô phỏng bỏ lỡ sự kiện media khi app bị treo nền; vẫn cần xác nhận status bar hệ thống trên iPhone thật.

## D-170 — Tách màu nội dung khỏi màu vùng trình duyệt (2026-10-27)

Sửa D-168/D-169: mở sidebar ở theme sáng làm nền html/body thành Navy trong khi app-shell trong suốt, khiến danh sách phía sau cũng tối. Root color-scheme dark còn truyền xuống native controls dù data-theme vẫn light. App-shell nay có nền canvas đặc và color-scheme riêng theo data-theme; sidebar luôn Navy/scheme dark. Root/body và metadata tiếp tục cung cấp màu vùng trình duyệt theo menu. Giữ lớp phủ làm mờ danh sách, không đổi độ đậm overlay, palette, layout, motion hoặc preference.

Khi menu đóng: nội dung và chrome cùng theme. Khi menu mở: nội dung/ô chọn/hộp thoại giữ theme hiện hành, chỉ sidebar/chrome Navy. Đổi theme hoặc OS theo chế độ hệ thống cập nhật nội dung ngay cả khi menu mở; đóng menu, chọn dự án hoặc sang desktop khôi phục chrome theo theme mới. Giữ đường resume D-169. Tests phải kiểm tra cả lớp nội dung và native controls, không chỉ html/body/meta.

## D-171 — Đồng bộ màu lúc reveal và blur sidebar (2026-10-27)

Chủ dự án duyệt cập nhật màu status bar ngay khi animation reveal bắt đầu, không thêm delay. StartupScreen phát spark:theme-refresh trực tiếp trong animationstart của startup-reveal; bootstrap đọc lại theme và cập nhật nền root/body, color-scheme, theme-color đồng bộ trong cùng sự kiện. Giữ bootstrap trước paint và xử lý resume D-169; không chờ animationend, không thêm timeout/requestAnimationFrame cho bước reveal. Giữ fade logo 500ms rồi reveal 600ms như cũ; reduced motion vẫn đi qua sự kiện cập nhật màu. Chỉ Theo hệ thống theo OS, theme cố định được giữ.

Thay overlay tối của sidebar bằng nền trong suốt và backdrop-filter blur(20px), kèm -webkit-backdrop-filter; sidebar không làm giảm sáng nội dung phía sau. Giữ nền menu Navy, nền app riêng theo D-170, motion sidebar 240ms easeOutQuint và tap ngoài để đóng. Các dialog khác giữ overlay hiện tại. Không animate bán kính blur. Việc iOS thực sự vẽ status bar có thể lệch thời điểm tín hiệu app gửi; không cam kết native latency bằng 0ms khi chưa đo trên thiết bị.

## D-172 — Khắc phục màu lấy mẫu tại mép trên iOS (2026-10-27)

D-171 chưa giải quyết được native status bar theo kiểm tra thực tế của chủ dự án. Trong browser regression, bản cũ vẽ Navy tại mép trên khi metadata đã là sáng. WebKit có thể lấy màu từ fixed element trên cùng thay vì theme-color: [bug 305546](https://bugs.webkit.org/show_bug.cgi?id=305546). Mã nguồn [LocalFrameView.cpp](https://github.com/WebKit/WebKit/blob/d3afea7d89fd2b062ef39b644c3f026dc4904070/Source/WebCore/page/LocalFrameView.cpp) cho thấy sampling mép trên ở 4px, loại primary background của box cao <=10px và có đường giữ màu cũ cho container phủ viewport. Đây là cơ sở cho giải pháp; chưa chứng minh chính xác engine của iOS 27.0.1 trên máy người dùng đi qua nhánh nào.

Thêm browser-top-surface được render từ server, fixed full-width trên mobile, cao max(12px, safe-area-top), background đặc từ --browser-background, z-index 1001 trên splash, không pointer event/animation/blur. Nó cùng root/body/meta dùng nguồn theme duy nhất của bootstrap; đổi preference, OS hoặc resume cập nhật ngay, menu mở dùng Navy, đóng trả theme mới. Mép trên giữ theme cả khi loading, không phải chờ Navy reveal. Không tạo timer, fake scroll, reload hoặc xóa cache/dữ liệu. Padding header/sidebar thành max(12px, 8px + safe-area) để lớp nền không che text trên máy có inset 0; trên iPhone có inset >=4px không tăng khoảng trống.

Manifest bổ sung color_scheme_dark với background/theme #121622, giữ fallback sáng #F7F8FA. WebKit đã triển khai trường này theo [bug 311727](https://bugs.webkit.org/show_bug.cgi?id=311727); đây là fallback theo OS trước JS, không thay preference riêng của app. Không đổi start_url/scope/icon/identity và không yêu cầu gỡ/cài lại PWA. Không thể hứa bản PWA đã cài sẽ nhận manifest mới tức thì.

### D-173 — Giảm blur phía sau sidebar (2026-10-27)

Theo yêu cầu mới, sidebar dùng backdrop-filter blur(10px) và -webkit-backdrop-filter blur(10px), thay 20px của D-171. Giữ nền phủ trong suốt, không làm tối nội dung. Không đổi blur header hoặc overlay dialog.

## D-174 — Bố cục loading (2026-10-27)

Theo yêu cầu mới nhất: logo còn 80% kích thước cũ (tối đa 256px, co tương ứng trên màn hẹp), căn giữa theo cả hai trục màn hình. Thanh tiến trình 3px sát mép trên, toàn chiều ngang; nhãn trạng thái và phần trăm căn giữa bên dưới, chừa safe-area để chữ không bị che. Nút thử lại/dùng cache căn giữa bên dưới nhãn.

Giữ fade 500ms và reveal 600ms Quint, reduced motion, trạng thái lỗi/offline và đồng bộ theme lúc reveal. Mobile mở đúng 3px đầu của browser-top-surface bằng clip-path chỉ trong lúc loading để hiện progress; vùng lấy mẫu y=4/5 của D-172 vẫn giữ màu theme. Không đổi màu status bar hoặc chiều cao safe-area.

## D-175 — Loading liền Navy, đổi màu mép trên tại reveal (2026-10-27)

Sửa dải sáng dưới progress của D-174: khi startup chưa reveal, browser-top-surface dùng Navy #111742, liền nền loading ở cả theme sáng/tối. Ngay trong animationstart của startup-reveal, StartupScreen đánh dấu data-revealing rồi phát theme-refresh đồng bộ: lớp nền đặc trở về --browser-background theo theme hiện hành, không chờ hết animation và không thêm delay. Khi startup unmount, selector tự hết hiệu lực. Giữ lớp fixed để WebKit lấy mẫu, phần hở 3px cho progress, logo ở giữa, safe-area, metadata và đường cập nhật theme/resume. D-175 thay quy tắc mép trên dùng màu theme xuyên suốt loading của D-172.

Regression kiểm tra pixel Navy trong loading, màu theme sau loading và computed màu lớp fixed ngay trong sự kiện reveal (system/fixed, sáng/tối, reduced motion). Browser kiểm tra được màu trang cung cấp; native status bar iOS vẫn cần xác nhận trên thiết bị thật.

## D-176 — Tách nền loading khỏi vùng status bar (2026-10-27)

Sau kiểm tra thực tế iPhone, D-175 vẫn để status bar giữ Navy một lúc sau loading. Không tiếp tục đổi màu vùng lấy mẫu từ Navy về theme. browser-top-surface luôn dùng --browser-background theo theme ngay từ đầu, không clip-path và không override màu khi startup. Nền Navy và progress cùng bắt đầu ngay dưới vùng này: top=max(12px, safe-area-top) trên mobile, top=0 desktop. Dải màu theme nằm phía trên thanh tiến trình và nối với status bar; phía dưới thanh luôn liền Navy. Chủ dự án đã cho phép dời thanh về mép trên phần nền Navy.

Dùng một token --browser-top-height cho vùng màu, nền loading và thanh tiến trình. Caption cách thanh 12px, không cộng safe-area lần thứ hai. Logo vẫn nhỏ hơn 20% và ở tâm toàn màn hình. Giữ refresh tại reveal, resume/fixed/system theme, timing Quint và reduced motion. Bỏ marker data-revealing và hai selector startup đổi màu/clip vì không còn cần. D-176 thay phần màu loading của D-175.

Không khẳng định độ trễ native iOS bằng 0ms từ kiểm tra Chrome: thay đổi này tránh cho trang cung cấp Navy ở vùng lấy mẫu trong suốt startup; vẫn cần xác nhận trên iPhone thật.

## D-177 — Sidebar blur 5px (2026-10-27)

Theo yêu cầu mới, giảm blur phía sau sidebar từ 10px xuống 5px cho cả backdrop-filter và -webkit-backdrop-filter. Giữ nền phủ trong suốt. Thay giá trị D-173; không đổi blur header, overlay dialog hoặc trạng thái màu.

## D-178 — Sidebar blur 2px (2026-10-27)

Giảm blur phía sau sidebar từ 5px xuống 2px theo yêu cầu mới, áp dụng cho backdrop-filter và -webkit-backdrop-filter. Giữ nền phủ trong suốt. Thay giá trị D-177; các hiệu ứng khác giữ nguyên.

## D-179 — Sidebar trong suốt và màn hình tiện ích toàn màn hình (2026-10-27)

Bỏ hoàn toàn backdrop-filter/-webkit-backdrop-filter phía sau sidebar; lớp phủ vẫn trong suốt và chạm ngoài vẫn đóng menu. Thay blur 2px của D-178. Phím tắt & hiển thị và Đồng bộ hiển thị toàn viewport trên mobile lẫn desktop, nền canvas theo sáng/tối, không bo góc/đổ bóng hoặc lộ danh sách quanh box. Nội dung đọc được giới hạn 640px, căn giữa trên desktop; header/nút đóng sticky, safe-area trên/dưới và cuộn nội bộ.

Hai màn hình dùng chung cơ chế focus trap/Escape/khôi phục focus hiện có (đổi tên useProjectDialog thành useDialogControls), không tự mở bàn phím khi vừa vào Đồng bộ. Tái sử dụng scroll lock để khóa nền, điều chỉnh viewport theo visualViewport khi bàn phím mở, gỡ listener/khôi phục cuộn khi đóng. Phím điều hướng nền tạm dừng khi tiện ích đang mở; shortcut theme vẫn hoạt động ngoài input. Không đổi luồng gửi/xác nhận OTP hoặc dữ liệu/auth.

Khi tiện ích phủ lên sidebar, chrome dùng theme của tiện ích; đóng tiện ích trả chrome về Navy nếu sidebar vẫn mở. Sidebar giữ trạng thái mở để quay lại. Bỏ các rule box/mobile max-height cũ của shortcut/sync thay vì chồng override. Các dialog khác giữ bố cục cũ.

## D-180 — Bố cục Phím tắt, Đồng bộ và sidebar mobile (2026-10-27)

Sidebar mobile bỏ nút X; chạm ngoài menu, chọn mục điều hướng hoặc Escape vẫn đóng menu. Phím tắt chia bốn nhóm Điều hướng, Lọc nội dung, Thao tác và Giao diện theo lưới hai cột; tên thao tác bên trái, phím bên phải. Ghi chú về bàn phím nằm ngay dưới danh sách phím tắt, trước hàng Giao diện. Hàng Giao diện dùng nhãn trái và ba icon bên phải: màn hình (Theo hệ thống), mặt trời (Sáng), mặt trăng (Tối). Bỏ dòng mô tả phụ và chữ trên lựa chọn; giữ tên truy cập, tooltip và điều khiển radio bằng bàn phím. Icon 18px trong vòng tròn 32px; vùng bấm desktop 36px, mobile 44px.

Phím tắt và Đồng bộ giữ headline ở đầu màn hình, nội dung căn giữa phần còn lại khi đủ chỗ. Khi thiếu chiều cao, chỉ phần nội dung cuộn; header vẫn nhìn thấy. Desktop đặt nút X tại góc trên bên phải viewport, cách mép 20px hoặc safe-area lớn hơn; mobile giữ X cùng hàng tiêu đề. Giữ nền sáng/tối, focus trap, khóa cuộn nền và xử lý bàn phím của D-179.

## D-181 — Rút gọn màn hình Đồng bộ (2026-10-27)

Bỏ hai khối giải thích 01/02 khỏi bước kết nối Đồng bộ trên mobile và desktop. Bước này chỉ giữ ô email và nút gửi mã kết nối; bỏ đường phân cách dư trước form. Trên desktop, headline nằm ngay trên form và cả cụm được căn giữa màn hình, nút X giữ ở góc trên bên phải. Mobile giữ headline ở đầu màn hình và form căn giữa phần còn lại. Giữ nguyên luồng OTP, trạng thái đã kết nối, theme và khóa cuộn nền; màn Phím tắt không đổi.

## D-182 — Tiêu đề Phím tắt desktop sát nội dung (2026-10-27)

Desktop dùng chung bố cục cho Phím tắt và Đồng bộ: tiêu đề nằm ngay trên nội dung, cả cụm căn giữa khi đủ chiều cao; màn hình thấp cuộn toàn cụm để không cắt phần đầu. Nút X giữ tại góc trên bên phải viewport. Mobile giữ tiêu đề ở đầu và nội dung căn giữa phần còn lại. Chủ dự án xác nhận sự cố loading trên điện thoại do Wi-Fi và yêu cầu dừng điều tra; không thay đổi đăng nhập, loading hoặc cache.

## D-183 — Chi tiết desktop toàn màn hình (2026-10-27)

Chi tiết task/note trên desktop phủ toàn viewport bằng nền canvas sáng/tối, bỏ box, bo góc và shadow. Bỏ nhãn TASK/GHI CHÚ và heading “Chi tiết task/ghi chú” ở cả desktop/mobile; dialog dùng tên thật của mục làm nhãn truy cập. Cột tên + Nội dung dùng cùng độ rộng canvas danh sách theo viewport và trạng thái sidebar (token --canvas-width). Cụm ngắn căn giữa phần màn hình còn lại; cụm dài giới hạn chiều cao và cuộn riêng phần Nội dung, giữ nút sửa dễ truy cập. Khi sửa Nội dung, editor tận dụng chiều cao khả dụng. Metadata và Xóa neo sát đáy, căn theo cùng cột; nút X luôn ở góc trên bên phải, cách mép 20px. Khóa cuộn và tương tác danh sách nền cả desktop, khôi phục khi đóng. Mobile giữ bố cục và focus mode hiện hành; wrapper mới dùng display:contents trên mobile.

## D-184 — Neo chi tiết desktop và căn giữa quick-add (2026-10-27)

Desktop: hàng tên task/note bắt đầu ở y=80px; cột chi tiết luôn dùng cùng chiều cao khả dụng ở cả trạng thái đọc/sửa, thay cách căn giữa nội dung ngắn của D-183. Khi sửa Nội dung, toolbar B/I/U chuyển vào cùng hàng với label Nội dung; padding vùng nhập bằng vùng đọc để không đẩy chữ hoặc tên mục. Giữ metadata ở đáy và X ở góc phải. Mobile giữ focus mode sửa nội dung hiện hành. Quick-add căn giữa ngang/dọc trên cả desktop và mobile, giới hạn chiều cao form trong vùng nhìn thấy và cho form cuộn khi mở bàn phím hoặc có nhiều nội dung.

## D-185 — Tinh chỉnh editor desktop (2026-10-27)

Ô sửa tên desktop bỏ gạch dưới, giữ màu heading như khi đọc. Nội dung đang sửa dùng cùng màu text-secondary với nội dung đang xem, nền vẫn trong suốt. Toolbar B/I/U cao 34px (tăng 6px), nút 30px, giữ cùng hàng với label Nội dung và căn giữa theo hàng; không dịch tên hoặc điểm bắt đầu nội dung. Giữ màu toolbar và bố cục chi tiết mobile hiện hành. Quick-add: vùng nhập Nội dung cao 300px khi mở Thêm Nội dung trên cả desktop/mobile; form vẫn căn giữa, giới hạn theo viewport và cuộn được khi bàn phím mở.

## D-186 — Toolbar desktop 30px (2026-10-27)

Toolbar định dạng trong chi tiết desktop cao 30px, nút 26px; bắt đầu cách mép phải nhãn Nội dung khoảng 200px. Giữ cùng hàng, màu hiện hành và vị trí tên/nội dung. Nếu cột quá hẹp, khoảng cách tự giảm để còn đủ chỗ cho toolbar và nút lưu/hủy. Mobile và quick-add giữ nguyên.
