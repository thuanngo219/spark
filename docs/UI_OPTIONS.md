# UI Directions — 3 phương án

Ba phương án cùng dùng một information architecture và data model. Khác biệt chủ yếu nằm ở mật độ, màu sắc và cách điều hướng. Đây là hướng tham khảo nguyên bản, không phải bản sao của Superlist hoặc Things.

## Option A — Warm Paper

**Mood:** trang giấy ấm, nhẹ và tĩnh; gần tinh thần “clean piece of paper” của Things.

- Nền ivory `#F7F5F0`, surface trắng ấm, chữ charcoal `#242321`.
- Màu nhấn xanh cornflower `#4C7DFF`; project dùng chấm màu nhỏ.
- Font đề xuất: Inter hoặc Geist; heading medium, body regular.
- Sidebar desktop mảnh 224px; mobile dùng sheet trượt từ cạnh trái.
- Task row gần như không có card: checkbox, title, ngày; đường phân cách cực nhẹ.
- Calendar dùng strip 7 ngày ngang, ngày chọn là pill xanh nhạt.

```text
┌──────────────┬───────────────────────────────────┐
│ DAILY        │ Hôm nay                    12 Tám │
│ ○ Hôm nay  4 │                                   │
│ ○ Sắp tới  7 │ Quá hạn                           │
│ ○ Theo ngày  │ ○ Gửi báo giá          Hôm qua   │
│              │                                   │
│ PROJECTS     │ Hôm nay                           │
│ ● Công việc  │ ○ Duyệt nội dung       Website   │
│ ● Cá nhân    │ ○ Đặt lịch khám                   │
│ + Dự án      │                                   │
│              │ ＋ Thêm công việc                 │
└──────────────┴───────────────────────────────────┘
```

**Ưu điểm:** bền, dễ đọc lâu, phù hợp một app dùng hằng ngày.  
**Rủi ro:** nếu spacing và typography không tinh chỉnh kỹ sẽ hơi giống ứng dụng ghi chú thông thường.

## Option B — Quiet Focus (đề xuất)

**Mood:** tối giản, sắc nét và có một chút vui; cân bằng giữa tính thanh lịch của Things và năng lượng của Superlist.

- Nền mist `#F3F5F7`, content surface `#FFFFFF`, chữ ink `#17191C`.
- Màu nhấn coral `#FF5B4D`; chỉ dùng cho CTA, focus và trạng thái quan trọng.
- Sidebar dạng floating rail với góc bo 18px; content tối đa 760px để tránh danh sách quá rộng.
- Task row là surface phẳng, hover/touch state rõ; checkbox có animation fill ngắn.
- Header lớn vừa đủ, bên dưới là summary nhẹ: “4 việc · 1 quá hạn”.
- Mobile có nút thêm hình tròn cố định ở vùng ngón cái; sheet chỉnh task mở từ đáy.

```text
┌─────────────┐  ┌─────────────────────────────────┐
│  ◉ Spark    │  │ Hôm nay                         │
│             │  │ 4 việc · 1 quá hạn              │
│ ▣ Hôm nay   │  │                                 │
│ ◷ Sắp tới   │  │ ○ Gửi báo giá           Quá hạn│
│ ◫ Theo ngày │  │ ○ Chốt nội dung       ● Launch │
│             │  │ ○ Đi siêu thị          ● Cá nhân│
│ Projects  + │  │                                 │
│ ● Launch    │  │       + Thêm công việc          │
│ ● Cá nhân   │  └─────────────────────────────────┘
└─────────────┘
```

**Ưu điểm:** có bản sắc riêng nhưng vẫn calm, responsive tốt, phù hợp cả desktop và iPhone.  
**Rủi ro:** cần tiết chế coral và shadow để không trở nên “marketing-like”.

## Option C — Compact Canvas

**Mood:** nhanh và hơi thiên power-user; danh sách là trung tâm, chrome tối thiểu.

- Content surface sáng, chữ navy đậm; chrome chính navy, accent turquoise theo ảnh tham chiếu đã duyệt.
- Desktop dùng sidebar đầy đủ và cho phép thu gọn thành compact rail khi cần.
- Project được nhận diện bằng dot màu lớn trong task row; tên project chỉ hiện trong navigation/editor.
- Mật độ cao hơn: row 48–52px, thích hợp danh sách dài.
- Mobile giữ cùng cấu trúc, các chip cuộn ngang; thao tác thêm nằm ngay cuối danh sách.

```text
┌───────────────────────────────────────────────────┐
│ Spark    [Hôm nay] [Sắp tới] [Theo ngày]      ＋ │
│ Projects:  ● Work   ● Personal   +                │
├───────────────────────────────────────────────────┤
│ HÔM NAY · 4                                         │
│ ○ Gửi báo giá                         Quá hạn      │
│ ○ Review homepage                     ● Work       │
│ ○ Mua cà phê                          ● Personal   │
│ ＋ Thêm công việc                                    │
└───────────────────────────────────────────────────┘
```

**Ưu điểm:** nhanh, tận dụng không gian tốt, ít điều hướng ẩn.  
**Rủi ro:** project nhiều sẽ làm hàng chip chật; cảm giác ít “thư thái” hơn hai phương án còn lại.

## So sánh nhanh

| Tiêu chí | A — Warm Paper | B — Quiet Focus | C — Compact Canvas |
|---|---:|---:|---:|
| Calm / thư thái | 5/5 | 4/5 | 3/5 |
| Bản sắc thị giác | 3/5 | 5/5 | 3/5 |
| Dùng trên iPhone | 4/5 | 5/5 | 4/5 |
| Danh sách dài | 3/5 | 4/5 | 5/5 |
| Độ khó triển khai | Thấp | Trung bình | Thấp |

## Hướng đã chọn

Chủ dự án đã chọn **Option C — Compact Canvas** vì sự gọn gàng. Visual direction dùng navy `#111742` làm nền/chrome chính, turquoise `#44D4CD` làm màu tương tác, Muted Coral `#D9776A` làm accent ấm và Deep Purple `#65458A` làm màu nhận diện tách biệt với navy; content surface giữ sáng và sạch. Canvas hiện dùng nền phẳng #F7F8FA, không radial glow hoặc gradient màu (D-130). Tổng palette chromatic là bốn màu; trắng, xám và đen được xem là neutral và không tính vào giới hạn này.

Màu trạng thái Quan Trọng/star dùng tint Amber và Ưu tiên/điện xẹt dùng Muted Coral ở icon/highlight nhỏ; đây là màu semantic hiện có, không phải đề xuất mở rộng brand palette bốn màu đã chốt.

Trong task list, project mặc định được biểu diễn bằng **dot màu cỡ lớn**. Trên desktop, click bất kỳ dot nào sẽ animate mở hoặc thu gọn đồng loạt mọi project dot trong view thành pill compact hiển thị đầy đủ tên project uppercase với regular weight trên một dòng, không ellipsis hoặc xuống dòng. Khi mở, nền mỗi pill chỉ ôm tên project; các pill nằm trong một cột chung theo pill dài nhất để title thẳng hàng và dot giữ cùng một trục. Pill tham gia layout, không overlay hoặc dùng shadow; trạng thái mở được giữ khi đổi view và lưu theo browser. Người dùng có thể tắt/mở hành vi này trong bảng Phím tắt & hiển thị. Mobile luôn chỉ hiển thị dot tĩnh, không có thao tác mở pill. Tên project vẫn xuất hiện trong navigation, màn hình project và task editor để bảo đảm người dùng có thể hiểu/chỉnh quan hệ này.

Navigation desktop đã chốt là **sidebar đầy đủ theo cấu trúc Option A**, giữ danh sách theo Compact Canvas. Người dùng có thể thu gọn sidebar thành icon rail bằng nút chevron hiển thị rõ hoặc phím `⌘/Ctrl + \`, rồi mở lại khi cần. Top navigation không dùng trong phiên bản hiện tại.

Mật độ đã được tinh chỉnh: rail thu gọn rộng khoảng `56px`, navigation desktop cao `32–34px`, item list khoảng `35px` với khoảng cách thoáng giữa các hàng và không dùng đường phân cách. Content dùng một canvas phẳng, hạn chế card trắng/xám lồng nhau. Nút thu gọn là rounded-square có icon panel; compact rail dùng logo negative màu trắng trên nền navy.

Nhóm **Tập trung** được đổi tên thành **Cần lưu ý**. Cần lưu ý và Dự án có thể thu gọn độc lập; project được gắn sao sẽ được đẩy lên Cần lưu ý.

Project editor đặt nút star icon-only ở đầu hàng chọn màu, sau đó là sáu preset: Turquoise, Muted Coral, Deep Purple, Soft Amber, Cornflower và Sage. Lựa chọn màu thứ bảy là swatch đa sắc mở color picker hệ thống; màu custom selected hiển thị ở tâm nút. Mobile giữ dải swatch trên một hàng cuộn ngang với touch target 44px. Màu custom và ba màu dẫn xuất chỉ dùng cho nhận diện project, không mở rộng palette CTA hay trạng thái hệ thống.

Khi mở Tạo dự án mới trên mobile, ô Tên dự án được focus ngay. Overlay bám theo `visualViewport` và tự đưa field vào giữa vùng nhìn thấy khi bàn phím iOS mở; desktop và form chỉnh sửa dự án giữ hành vi focus thông thường.

Trong project view, nút edit nằm ngay bên phải tên dự án và mở Project Editor hiện có để đổi tên, màu nhận diện hoặc trạng thái Cần lưu ý.

Project Editor có nhóm action riêng **Lưu trữ dự án / Xóa dự án** dưới palette và phía trên hàng Lưu/Hủy. Dự án đã lưu trữ đổi action thành **Khôi phục dự án**. Xóa mở bước xác nhận ngắn, nói rõ tên dự án, số task/note được giữ lại và việc không thể hoàn tác; mặc định focus nút Giữ lại. Mục **Đã lưu trữ** (icon archive, accessible label Dự án đã lưu trữ) nằm cuối nhóm dự án trên sidebar/rail/mobile drawer; mở sheet để xem hoặc sửa dự án. Các dialog hỗ trợ Escape, focus trap, trả focus và action 44px trên mobile.

CTA và utility button chính dùng nền turquoise, hover chuyển navy. Search được ẩn cho đến khi tính năng tìm kiếm được triển khai. Help không lặp trong page header desktop; vẫn mở được bằng mục Phím tắt trong sidebar hoặc phím `?`. Các control có ý nghĩa semantic như Xóa, Quan Trọng, Ưu tiên, navigation và swatch màu giữ hệ màu riêng. Focus không glow/shadow: quick-add dùng nền control-hover, vùng nhập Nội dung chi tiết giữ nền field, input Tên chỉ đổi border nhẹ (D-120).

Ứng dụng mở mặc định ở Hôm nay với sidebar compact; khi người dùng đổi trạng thái sidebar, lựa chọn mới tiếp tục được ghi nhớ.

Quick-add task có thể mở trực tiếp bằng phím `N`. Filter view dùng phím trực tiếp `T`, `S`, `D`, `A`, `I`, `U`; filter nội dung dùng đúng ba phím đơn `[` để chỉ note, `]` để chỉ task và `\` để hiện tất cả. `{`, `}` và `|` không kích hoạt filter; `1–9` mở project theo thứ tự compact sidebar. Phím `⌘/Ctrl + \` chuyển trạng thái sidebar và `?` mở bảng trợ giúp. Bảng trợ giúp gộp project thành một dòng, đóng bằng X/Escape; compact sidebar hiện tooltip tức thời khi hover/focus icon hoặc project dot.

Navigation chính có **Tất cả** ngay dưới **Theo ngày**. View này giữ canvas phẳng và chia item đang hoạt động thành Quá hạn, Hôm nay, Đang thực hiện, Sắp tới, Sau đó và Chưa có ngày để quét theo thời gian mà không cần đổi filter. Các khu đóng/mở độc lập, mặc định mở; trạng thái giữ khi chuyển view trong phiên và độc lập với Hôm nay. Mọi khu, kể cả Đã hoàn thành/lưu trữ, dùng cùng khoảng cách 12px với khu trước. Select sort đủ rộng cho nhãn uppercase dài nhất, bao gồm NGÀY TRẠNG THÁI; chiều rộng tính theo cỡ chữ và khoảng chừa chevron trên desktop/mobile.

Hôm nay/Sắp tới/Theo ngày/Tất cả không hiển thị task/note của dự án đã lưu trữ, kể cả disclosure trạng thái; số đếm được tính cùng quy tắc. Riêng disclosure Hôm nay chỉ giữ task hoàn thành và note lưu trữ trong ngày hiện tại theo múi giờ Việt Nam, không theo due date. Nội dung cũ vẫn xem được từ dự án đã lưu trữ/các view phù hợp khác, không bị xóa.

View Hôm nay chia Quá hạn, Hôm nay, Đang thực hiện và Chưa có ngày. Hôm nay nhận item có ngày bắt đầu hoặc ngày đến hạn đúng hôm nay; Đang thực hiện nhận item đã bắt đầu trước hôm nay và chưa đến hạn; nhóm cuối chỉ nhận task trống cả hai ngày, còn note trống cả hai ngày bị ẩn. Bốn header là disclosure độc lập, mặc định mở, dùng cùng chevron và nhịp typography với Đã hoàn thành.

Mọi view dùng switcher icon-only kiểu segmented theo thứ tự **Tất cả / Chỉ note / Chỉ task**. Desktop đặt switcher đúng vị trí control Ẩn/Hiện note cũ và giữ nguyên nút sidebar hiện tại. Mobile đặt switcher bên trái sync pill trong hàng control nổi ngay trên dock; lựa chọn chỉ tác động presentation và được giữ khi chuyển view trong phiên.

Typography web app dùng base size bằng `rem`, scale root `112.5%` trên desktop và `120%` trên mobile. Cách này tăng độ đọc của navigation, item, metadata và editor nhưng giữ nguyên kích thước icon, sidebar, touch target và row geometry.

Danh sách mobile dùng canvas tràn viền, row tối thiểu `52px` và gap `2px` giữa item; row ở trạng thái nghỉ dùng nền transparent để nền canvas phẳng của Spark liền mạch, chỉ phủ lại canvas khi đang kéo hoặc mở khay swipe. Title task/note luôn là một dòng và ellipsis khi thiếu chỗ. Item có Nội dung chi tiết hiển thị icon hội thoại 15px ngay sau text, không neo ở mép phải. Marker giữ vùng chạm tối thiểu 44px, project dot được thu gọn, còn desktop tiếp tục dùng row khoảng `35px` và gap `6px`.

Mobile bỏ app header riêng; view header sticky đặt panel icon-only trước title khi header đầy đủ. D-144/D-145: Header desktop/mobile thu gọn khi cuộn quá 28px, chuyển động 220ms; compact giữ h1 ở 50% cỡ chữ thường và dải màu 5px/radius 5px. Desktop giữ cụm sync/bộ lọc trong header, mobile giữ cụm nổi trên dock. Ẩn eyebrow, thống kê, nút mở sidebar mobile và nút sửa dự án; cuộn về đầu khôi phục đầy đủ. H1 dùng letter-spacing -0.025em ở cả hai trạng thái. Giữ padding 20px/safe-area, blur 8px/WebKit và opacity dark 75% cho h1/dải màu. Nền app phẳng trên mọi kích thước. Dock icon-only 58px dùng năm segment bằng nhau cho Hôm nay/Sắp tới/Thêm/Theo ngày/Tất cả; nút thêm 72px nằm giữa và trồi khỏi thanh, còn active navigation dùng nền Navy rộng tối đa 64px.

Gesture chỉ áp dụng dưới breakpoint mobile: khi không có khay swipe nào mở, một lần tap vùng nội dung task/note mở chi tiết. Nếu bất kỳ khay nào đang mở, tap nội dung cùng item hoặc item khác chỉ đóng khay, chưa mở chi tiết. Swipe trái mở khay Quan Trọng, Ưu tiên và action cuối theo loại item — Xóa với task, Lưu trữ/Khôi phục với note; swipe phải trên item không có hành động; swipe từ mép trái sang phải mở navigation sheet với motion transform. Vuốt/cuộn không tự mở chi tiết; checkbox/marker và action trong khay giữ hành vi riêng. Xóa vẫn dùng toast Hoàn tác và không kích hoạt ngay khi thả full-swipe. Toast nằm trên hàng switcher/sync và dock/safe area, không che navigation; desktop né floating `+`. Không dùng touch-and-hold. Panel icon trong header là fallback khi browser ưu tiên gesture hệ thống.

## Shared component inventory

- App shell / sidebar / mobile navigation sheet.
- View header và open-task count.
- Quick-add composer giữ checkbox Ghi chú hiện tại. Cả task và note có secondary button **Thêm Nội dung** để mở field “Nội dung (nếu cần)”. Textarea Nội dung khi tạo mới cao `160px` trên cả desktop và mobile; riêng desktop dùng font weight regular cho chữ nhập. Ngày bắt đầu, ngày đến hạn và dự án luôn khả dụng cho cả hai loại; ngày bắt đầu mặc định trống, chỉ task tạo trong Hôm nay mặc định hôm nay. Các overlay dùng lớp nền Navy dim đủ đậm để giữ bối cảnh nhìn thấy rõ, không blur nội dung phía sau.
- Quick-add đóng dùng floating icon-only button `+` 32px trong control turquoise 48px ở desktop; mobile dùng nút turquoise 72px giữa dock 58px. Cả hai giữ accessible label “Thêm công việc”. Khi mở, overlay surface trắng neo cùng góc; trên mobile surface dùng gần trọn chiều rộng như bottom sheet. Field có label, nền nhẹ, bo góc và spacing đồng bộ project editor. Hủy là secondary text button; Thêm là primary turquoise.
- Item row: task dùng checkbox; note đang hoạt động dùng rounded dash mark xám có thể bấm để lưu trữ, note đã lưu trữ dùng icon archive để khôi phục. Item có Nội dung hiển thị icon hội thoại ngay sau Tên; tap row mở detail sheet. Marker và project dot căn theo dòng title. Canvas desktop rộng responsive `940–1200px` (`80vw` trong dải này), co theo vùng khả dụng; đây là chiều rộng listing, không phải detail.
- Detail desktop rộng `880px`, header chỉ có nút đóng; header, Tên và metadata đứng ngoài vùng cuộn Nội dung. Khi sửa Nội dung, khung cao `min(86dvh, 820px)`, editor giãn theo phần còn lại; mobile edit `40dvh`, quick-add `160px`. Chỉ B/I/U và ⌘/Ctrl+B/I/U, tối đa 4.000 ký tự. Toolbar đậm hơn field 5%; nền nhập giữ nguyên khi focus, quick-add focus dùng control-hover.
- Tên không có label; nút sửa cùng hàng text, input cao 28px với border nhẹ, không glow/shadow. Desktop có ✓/× cùng hàng; mobile ẩn ✓/× và tự lưu khi blur, giữ input đến khi chuyển trường/Enter. Nhãn Nội dung cao 28px với nút sửa/lưu/hủy cạnh nhãn, ngoài vùng cuộn; control desktop 28px/icon 16px, mobile vùng chạm 44px/icon 18px. Khoảng cách trước/sau divider giảm 20% còn 16px/14.4px.
- Chi tiết có checkbox task hoặc dấu note tĩnh trước tên, không padding ngang, gap 10px; hover không đổi nền. Checkbox phản ánh trạng thái hoàn thành, tên không gạch ngang. Mobile metadata: Quan Trọng/Ưu tiên/hai ngày ở hàng đầu, Dự án và Lưu trữ/Xóa icon-only 44px cùng hàng thứ hai. Xóa luôn qua xác nhận. Focus metadata lưu draft hợp lệ nhưng giữ nguyên editor/kích thước khung để click thực hiện được (D-132).
- URL trong Nội dung là liên kết an toàn mở tab mới. Desktop sidebar expanded cho drag project để đổi `position`; row nguồn giảm opacity, drop target có đường Turquoise và chấm tròn đánh dấu cạnh chèn. Mobile không drag.
- Mỗi nhóm thời gian có header sort riêng theo Mức chú ý/Ngày đến hạn/Ngày bắt đầu/Tên; disclosure trạng thái có thêm Ngày trạng thái. Nội dung dropdown viết uppercase; select là pill trắng với chevron-down riêng, nút chiều sort là hình tròn trắng. Hai control không dùng shadow; hover chỉ đổi màu và không dịch chuyển. Nút chiều sort dùng icon mũi tên kèm các dòng tăng/giảm theo A–Z/Z–A. Chiều sort và lựa chọn lưu theo browser/view/nhóm. Task luôn trước note trong mỗi khu. Mức chú ý giữ cố định cả hai cờ → Quan Trọng → Ưu tiên → bình thường; nút chiều chỉ đảo ngày đến hạn trong mỗi mức. Các lựa chọn khác chỉ đảo khóa chính; hòa khóa xét tên A–Z rồi due date tăng dần, sau cùng ngày tạo và ID. Ngày trống cuối trong mỗi loại/mức ở cả hai chiều; sort không đổi thứ tự khu. Metadata ngày dùng play cho bắt đầu và flag cho đến hạn trên cả desktop/mobile; nhãn ngày là Hôm qua/Hôm nay/Ngày mai trong khung ba ngày, ngoài khung dùng `dd.mm` cùng năm hoặc `dd.mm.yy` khác năm.
- Disclosure trạng thái dùng nhãn **Đã hoàn thành**, **Đã lưu trữ** hoặc **Đã hoàn thành & lưu trữ** theo nội dung; giữ uppercase, weight và letter-spacing cùng hệ section label của sidebar.
- Item detail sheet/popover với edit inline.
- Smart filters Quan Trọng và Ưu tiên.
- Project row và project editor.
- Date strip/date picker.
- Completed disclosure.
- Toast có Undo và luôn chừa navigation/dock.
- Empty, skeleton, error và offline banner.

Editor Nội dung hiện hỗ trợ B/I/U và ⌘/Ctrl+B/I/U, tối đa 4.000 ký tự. Nút sửa cùng hàng nhãn Nội dung, ngoài vùng cuộn. Toolbar và bộ đếm nằm trên vùng nhập; toolbar mobile có vùng chạm 44px.

- D-131: Ô chọn sắp xếp và nút đổi chiều cao 36px trên desktop/mobile; nút đổi chiều rộng 36px. Header blur 8px ở cả hai kích thước, có WebKit.

## Cập nhật D-145–D-146 (2026-10-06)

- Header thu gọn/mở lại trong 220ms; h1 giữ tỷ lệ 50% và tracking -0.025em. Cụm sync và All/Note/Task vẫn hiện trên desktop; mobile giữ cụm nổi trên dock. Eyebrow/thống kê ẩn khi compact. Dải màu 5px, padding 20px, blur 8px giữ nguyên.
- Khởi động bằng lớp Navy #111742, logo negative gồm icon + chữ spark ở giữa và tiến trình theo giai đoạn. Chờ xác định phiên, cache đúng user, tải projects/items và xử lý queue; không render dữ liệu mẫu trong lúc chờ. Khi sẵn sàng, logo/thanh tiến trình fade 500ms rồi nền thu về phải trong 600ms (D-149).
- Local mới bắt đầu rỗng. Chỉ dọn bộ seed local cũ khi nhận diện đầy đủ và chưa sửa; giữ dữ liệu thật, bộ seed đã sửa/không rõ và toàn bộ dữ liệu cloud. Khi offline có cache thì mở bản lưu; lỗi đồng bộ có Thử lại và lựa chọn dùng dữ liệu đã lưu. Phần trăm là tiến trình từng bước, không phải phần trăm byte tải về.
- Chỉ bỏ Violet #8951C7 (và sắc nhãn #BA99DF), giữ Deep Purple #65458A. Dự án Violet chuyển Amber #D6A84F khi đọc local/cloud; cloud chỉ cập nhật trường color với điều kiện user/id/màu cũ. Queue ghi project cũng chuẩn hóa màu để không đưa Violet trở lại. Không đổi tên, quan hệ, thứ tự hay nội dung dự án.
- Quan Trọng Amber #D6A84F, Ưu tiên Coral #D9776A thống nhất toàn app ở cả hai theme. Preset dự án còn sáu màu; custom picker giữ nguyên. Mọi animation/transition dùng ease-out Quint `cubic-bezier(.22, 1, .36, 1)` và tôn trọng reduced motion.
