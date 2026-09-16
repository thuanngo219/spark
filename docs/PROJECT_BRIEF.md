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

- Hiển thị bằng bullet point thay cho checkbox.
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
- Desktop giữ floating `+` 48px ở góc dưới phải. Mobile đưa `+` 72px vào chính giữa dock 58px, cho artwork trồi khỏi dock để dễ nhận biết; cả hai cùng mở quick-add dạng overlay gọn. Checkbox Ghi chú giữ nguyên; task và note đều có nút **Thêm Nội dung** để mở field tùy chọn. Quick-add luôn giữ chọn ngày và dự án cho cả hai loại.
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

Desktop mở mặc định ở view Hôm nay với sidebar thu gọn thành compact rail; người dùng có thể mở sidebar bằng nút panel luôn nhìn thấy hoặc phím `⌘/Ctrl + \`. Lựa chọn sau đó được ghi nhớ trên thiết bị. Desktop header dùng padding nội dung 26px, sticky và có dải màu project/view cao 10px ở trên cùng.

Mobile dùng canvas tràn viền và view header sticky. Panel icon-only nằm trong cùng title row, ngay trước tên view. Khi cuộn quá ngưỡng ngắn, header thu từ khoảng 149px xuống 92px, bỏ ngày/eyebrow nhưng giữ dòng thống kê, title còn 80% cỡ ban đầu, nền canvas còn 60% opacity kết hợp blur 14px và dải màu project/view giữ chiều cao 10px; panel icon giữ nguyên kích thước. Dock icon-only cao 58px overlay ở cuối màn hình, bo dạng pill tròn hai đầu và chỉ gồm Hôm nay, Sắp tới, thêm task, Theo ngày và Tất cả theo năm cột bằng nhau; active navigation là pill Navy cao 52px, rộng tối đa 64px. Trên iPhone có home indicator, dock nằm tại `safe-area - 10px` (tối thiểu 10px). Sheet điều hướng mở bằng panel icon trong header hoặc swipe từ mép trái sang phải, giữ full negative logo + nút đóng và không lặp các view chính đã có trong dock. Tap item mở editor; swipe trái lộ Quan Trọng/Ưu tiên/Xóa với task và Quan Trọng/Ưu tiên/Lưu trữ với note, swipe phải trên item không có hành động và không dùng touch-and-hold.

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
- Note hiển thị bằng bullet point, không có checkbox hoặc completed state.
- Task/note có thể bật đồng thời Quan Trọng và Ưu tiên; smart filters bao gồm đúng item phù hợp.
- Mỗi khu sort độc lập và lưu theo browser; task luôn trước note kể cả note có cả hai cờ hoặc đến hạn sớm hơn. Mức chú ý giữ cả hai cờ → Quan Trọng → Ưu tiên → bình thường và chỉ đảo ngày đến hạn trong từng mức. Ngày trống cuối trong từng loại/từng mức ở cả hai chiều; hòa khóa tuân theo quy tắc trên, không sửa dữ liệu đầu vào.
- Tất cả cho đóng/mở độc lập cả sáu khu thời gian, mặc định mở và giữ trạng thái trong phiên khi chuyển view; không ảnh hưởng trạng thái khu Hôm nay. Khoảng cách giữa các khu thống nhất 12px, kể cả khu đã hoàn thành/lưu trữ. Nhãn sort NGÀY TRẠNG THÁI phải hiển thị đầy đủ trên desktop/mobile.
- Email OTP của Spark hiển thị mã 36px, một dòng trong ô nền nhạt; tiêu đề thư bắt đầu bằng mã rồi đến “Mã đăng nhập Spark”. Chỉ template Spark trong shared hook thay đổi, không đổi thương hiệu/template của ứng dụng khác.
- Detail sheet giữ edit button ở mép phải của từng khối đọc; URL trong Nội dung task/note là liên kết mở tab mới và không cho phép protocol ngoài HTTP(S). Trên desktop, header, Tên và cụm metadata/control không dịch chuyển khi xem item dài; bánh xe chuột chỉ cuộn vùng Nội dung.
- Canvas liệt kê task/note trên desktop rộng responsive trong dải `940–1200px` khi vùng nội dung đủ chỗ; màn hình hẹp và mobile co vừa vùng hiển thị, không phát sinh horizontal scroll. Detail sheet desktop giữ chiều rộng `880px`.
- Khung sửa Nội dung desktop dùng chiều cao tối đa như khung đọc nội dung dài: `min(86dvh, 820px)`, vùng nhập giãn theo phần còn lại. Quick-add giữ `160px`; mobile edit dùng vùng nhập `40dvh`. Tên không có nhãn, nút sửa nằm cùng hàng text; khi sửa, input và ✓/× cùng hàng. Nội dung giữ ✓/× trên hàng nhãn để editor dùng trọn chiều rộng; control desktop là `28px` với icon `16px`, mobile giữ touch target `44px`. Hàng nhãn Nội dung cao 28px ở cả trạng thái đọc/sửa; mobile đặt Dự án và Lưu trữ/Xóa cùng một hàng, không tràn ngang ở 320px.
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

### Bổ sung nghiệm thu D-117–D-118

- Nội dung tối đa 4.000 ký tự (Unicode code points, bao gồm xuống dòng), hỗ trợ B/I/U và ⌘/Ctrl+B/I/U cho task/note trong quick-add/detail. Định dạng giữ qua lưu, reload, offline và cloud sync.
- Nút Sửa Nội dung nằm ngang nhãn Nội dung và không di chuyển khi cuộn vùng nội dung dài; desktop detail rộng 880px.
- Quick-add chỉ mặc định Ngày bắt đầu hôm nay cho task trong Hôm nay. Note và mọi view khác để trống; vẫn cho chọn/xóa ngày thủ công. Ngày đến hạn giữ quy tắc hiện có.

- D-127: Trước tên trong chi tiết và inline edit có checkbox cho task (checked theo completedAt, cho bật/tắt) hoặc dấu gạch ngang tĩnh cho note. Lưu draft hợp lệ trước khi đổi trạng thái; tên task hoàn thành trong chi tiết không gạch ngang. Mobile giữ vùng chạm 44px.
