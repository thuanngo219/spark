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

Mobile bỏ app header riêng; view header sticky đặt panel icon-only trước title khi header đầy đủ. D-144/D-145: Header desktop/mobile thu gọn khi cuộn quá 28px, chuyển động 220ms; compact giữ h1 ở 50% cỡ chữ thường và dải màu 5px/radius 5px. Desktop giữ cụm sync/bộ lọc trong header, mobile giữ cụm nổi trên dock. Ẩn eyebrow, thống kê, nút mở sidebar mobile và nút sửa dự án; cuộn về đầu khôi phục đầy đủ. H1 dùng letter-spacing -0.025em ở cả hai trạng thái. Padding desktop 20px; mobile 15px cả bốn phía cộng safe-area theo D-161; giữ blur 8px/WebKit và opacity dark 75% cho h1/dải màu. Nền app phẳng trên mọi kích thước. Dock 58px cộng safe-area sát ba mép màn hình, nền surface theo theme. Năm cột Hôm nay/Sắp tới/Thêm/Theo ngày/Tất cả; bốn đích có icon trên/nhãn dưới, active dùng màu heading theo theme, nhãn bold, không có nền riêng. Nút + 64px/dấu + 36px nhô nhẹ phía trên thanh, không có nhãn (D-162).

Gesture chỉ áp dụng dưới breakpoint mobile: khi không có khay swipe nào mở, một lần tap vùng nội dung task/note mở chi tiết. Nếu bất kỳ khay nào đang mở, tap nội dung cùng item hoặc item khác chỉ đóng khay, chưa mở chi tiết. Swipe trái mở khay Quan Trọng, Ưu tiên và action cuối theo loại item — Xóa với task, Lưu trữ/Khôi phục với note; swipe phải trên item không có hành động; swipe từ mép trái sang phải mở navigation sheet với motion transform. Vuốt/cuộn không tự mở chi tiết; checkbox/marker và action trong khay giữ hành vi riêng. Xóa vẫn dùng toast Hoàn tác và không kích hoạt ngay khi thả full-swipe. Toast nằm trên hàng switcher/sync và dock/safe area, không che navigation; desktop né floating `+`. Không dùng touch-and-hold. Panel icon trong header là fallback khi browser ưu tiên gesture hệ thống.

## Shared component inventory

- App shell / sidebar / mobile navigation sheet.
- View header và open-task count.
- Quick-add composer giữ checkbox Ghi chú hiện tại. Cả task và note có secondary button **Thêm Nội dung** để mở field “Nội dung (nếu cần)”. Textarea Nội dung khi tạo mới cao `160px` trên cả desktop và mobile; riêng desktop dùng font weight regular cho chữ nhập. Ngày bắt đầu, ngày đến hạn và dự án luôn khả dụng cho cả hai loại; ngày bắt đầu mặc định trống, chỉ task tạo trong Hôm nay mặc định hôm nay. Các overlay dùng lớp nền Navy dim đủ đậm để giữ bối cảnh nhìn thấy rõ, không blur nội dung phía sau.
- Quick-add đóng dùng floating icon-only button `+` 32px trong control turquoise 48px ở desktop; mobile dùng nút turquoise 64px/dấu + 36px nhô nhẹ trên dock 58px sát mép màn hình (D-160). Cả hai giữ accessible label “Thêm công việc”. Khi mở, overlay surface trắng neo cùng góc; trên mobile surface dùng gần trọn chiều rộng như bottom sheet. Field có label, nền nhẹ, bo góc và spacing đồng bộ project editor. Hủy là secondary text button; Thêm là primary turquoise.
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

- D-155 thay kích thước D-131: Ô chọn sắp xếp và nút đổi chiều có height/min-height 30px trên desktop/mobile; nút đổi chiều rộng 30px để giữ hình tròn. Header blur 8px ở cả hai kích thước, có WebKit.

## Cập nhật D-145–D-146 (2026-10-06)

- Header thu gọn/mở lại trong 220ms; h1 giữ tỷ lệ 50% và tracking -0.025em. Cụm sync và All/Note/Task vẫn hiện trên desktop; mobile giữ cụm nổi trên dock. Eyebrow/thống kê ẩn khi compact. Dải màu 5px, blur 8px giữ nguyên; padding desktop 20px, mobile 15px cả bốn phía cộng safe-area theo D-161.
- Khởi động bằng lớp Navy #111742, logo negative gồm icon + chữ spark ở giữa và tiến trình theo giai đoạn. Chờ xác định phiên, cache đúng user, tải projects/items và xử lý queue; không render dữ liệu mẫu trong lúc chờ. Khi sẵn sàng, logo/thanh tiến trình fade 500ms rồi nền thu về phải trong 600ms (D-149).
- Local mới bắt đầu rỗng. Chỉ dọn bộ seed local cũ khi nhận diện đầy đủ và chưa sửa; giữ dữ liệu thật, bộ seed đã sửa/không rõ và toàn bộ dữ liệu cloud. Khi offline có cache thì mở bản lưu; lỗi đồng bộ có Thử lại và lựa chọn dùng dữ liệu đã lưu. Phần trăm là tiến trình từng bước, không phải phần trăm byte tải về.
- Chỉ bỏ Violet #8951C7 (và sắc nhãn #BA99DF), giữ Deep Purple #65458A. Dự án Violet chuyển Amber #D6A84F khi đọc local/cloud; cloud chỉ cập nhật trường color với điều kiện user/id/màu cũ. Queue ghi project cũng chuẩn hóa màu để không đưa Violet trở lại. Không đổi tên, quan hệ, thứ tự hay nội dung dự án.
- Quan Trọng Amber #D6A84F, Ưu tiên Coral #D9776A thống nhất toàn app ở cả hai theme. Preset dự án còn sáu màu; custom picker giữ nguyên. Mọi animation/transition dùng ease-out Quint `cubic-bezier(.22, 1, .36, 1)` và tôn trọng reduced motion.

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

### D-168 — Status bar và khoảng trống mobile (2026-10-27)

Nền chrome cùng canvas sáng #F7F8FA/tối #121622; khi mở sidebar mobile dùng Navy #111742, đóng khôi phục đúng theme, không đổi preference. Padding trên header/sidebar là 8px cộng safe-area; các cạnh khác giữ nguyên. Bỏ meta status-bar-style cũ, để iOS chọn cách hiển thị theo nền và color-scheme. Không hứa thu nhỏ/ẩn vùng đồng hồ hoặc Dynamic Island do hệ thống quản lý.

### D-170 — Nền nội dung khi mở sidebar (2026-10-27)

App-shell luôn có nền canvas đặc và scheme theo theme hiện hành; menu mở không làm nền danh sách hoặc native controls chuyển tối. Sidebar/chrome vẫn Navy; giữ overlay làm mờ như cũ. Đổi theme, resume và đóng menu không thay palette đã duyệt. Bổ sung D-168.

### D-171 — Reveal và blur menu (2026-10-27)

Sidebar dùng blur 20px với nền phủ trong suốt, bỏ lớp phủ tối; không đổi overlay của dialog. Giữ Navy/sidebar, palette và motion Quint. Màu chrome được cập nhật lại ngay tại animationstart của reveal, không thêm delay; thời lượng logo/reveal giữ nguyên và tiếp tục đọc theme lúc mở mới/resume.

### D-172 — Nền đặc tại mép trên mobile (2026-10-27)

Sau phản hồi iPhone vẫn giữ Navy và không đổi màu theo theme, bổ sung một lớp nền cố định, không tương tác và không animation tại mép trên mobile. Lớp này dùng màu chrome hiện hành ngay từ lúc tải, nằm trên splash/blur: sáng #F7F8FA, tối #121622, mở menu #111742. Màn loading vẫn Navy bên dưới; vùng mép trên không chờ reveal. Không thêm màu mới. Chiều cao max(12px, safe-area-top); padding trên header/sidebar tối thiểu 12px, còn trên máy có safe-area vẫn giữ 8px + safe-area. Desktop không hiển thị lớp này. Native iOS cần xác nhận lại trên thiết bị.

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
