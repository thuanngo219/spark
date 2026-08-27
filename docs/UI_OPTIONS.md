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

- Content surface sáng, chữ navy đậm; chrome chính navy, accent turquoise và màu hỗ trợ violet theo ảnh tham chiếu đã duyệt.
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

Chủ dự án đã chọn **Option C — Compact Canvas** vì sự gọn gàng. Visual direction dùng navy `#111742` làm nền/chrome chính, turquoise `#44D4CD` làm màu tương tác, violet `#8951C7` làm màu hỗ trợ, Muted Coral `#D9776A` làm accent ấm và Deep Purple `#65458A` làm màu nhận diện trầm hơn violet nhưng tách biệt rõ với navy; content surface giữ sáng và sạch. Canvas sáng có hai radial glow nhẹ: Turquoise 16% ở góc trên trái và Violet 14% ở góc dưới phải, cố định theo viewport để tạo chiều sâu mà không ảnh hưởng độ đọc. Tổng palette chromatic là năm màu; trắng, xám và đen được xem là neutral và không tính vào giới hạn này.

Palette mở rộng đang đề xuất: **Soft Amber `#D6A84F`** dành cho Quan Trọng/star và **Muted Coral `#D9776A`** dành cho Ưu tiên/điện xẹt. Hai màu chỉ dùng ở icon, trạng thái và highlight nhỏ; không dùng làm mảng nền lớn.

Trong task list, project chỉ được biểu diễn bằng **dot màu cỡ lớn**, không lặp lại tên project. Tên project vẫn xuất hiện trong navigation, màn hình project và task editor để bảo đảm người dùng có thể hiểu/chỉnh quan hệ này.

Navigation desktop đã chốt là **sidebar đầy đủ theo cấu trúc Option A**, giữ danh sách theo Compact Canvas. Người dùng có thể thu gọn sidebar thành icon rail bằng nút chevron hiển thị rõ hoặc phím `[`, rồi mở lại khi cần. Top navigation không dùng trong phiên bản hiện tại.

Mật độ đã được tinh chỉnh: rail thu gọn rộng khoảng `56px`, navigation desktop cao `32–34px`, item list khoảng `35px` với khoảng cách thoáng giữa các hàng và không dùng đường phân cách. Content dùng một canvas phẳng, hạn chế card trắng/xám lồng nhau. Nút thu gọn là rounded-square có icon panel; compact rail dùng logo negative màu trắng trên nền navy.

Nhóm **Tập trung** được đổi tên thành **Cần lưu ý**. Cần lưu ý và Dự án có thể thu gọn độc lập; project được gắn sao sẽ được đẩy lên Cần lưu ý.

Project editor đặt nút star icon-only ở đầu hàng chọn màu, sau đó là palette tám màu nhận diện: Turquoise, Violet, Muted Coral, Deep Purple, Soft Amber, Cornflower, Sage và Dusty Rose. Bốn màu dẫn xuất chỉ dùng cho nhận diện project, không mở rộng palette CTA hay trạng thái hệ thống.

Trong project view, nút edit nằm ngay bên phải tên dự án và mở Project Editor hiện có để đổi tên, màu nhận diện hoặc trạng thái Cần lưu ý.

Project Editor có nhóm action riêng **Lưu trữ dự án / Xóa dự án** dưới palette và phía trên hàng Lưu/Hủy. Dự án đã lưu trữ đổi action thành **Khôi phục dự án**. Xóa mở bước xác nhận ngắn, nói rõ tên dự án, số task/note được giữ lại và việc không thể hoàn tác; mặc định focus nút Giữ lại. Mục **Đã lưu trữ** (icon archive, accessible label Dự án đã lưu trữ) nằm cuối nhóm dự án trên sidebar/rail/mobile drawer; mở sheet để xem hoặc sửa dự án. Các dialog hỗ trợ Escape, focus trap, trả focus và action 44px trên mobile.

CTA và utility button chính dùng nền turquoise, hover chuyển navy. Search được ẩn cho đến khi tính năng tìm kiếm được triển khai. Help không lặp trong page header desktop; vẫn mở được bằng mục Phím tắt trong sidebar hoặc phím `?`. Các control có ý nghĩa semantic như Xóa, Quan Trọng, Ưu tiên, navigation và swatch màu giữ hệ màu riêng. Focus state không dùng glow; nền field/control tối hơn khoảng 12%.

Ứng dụng mở mặc định ở Hôm nay với sidebar compact; khi người dùng đổi trạng thái sidebar, lựa chọn mới tiếp tục được ghi nhớ.

Quick-add task có thể mở trực tiếp bằng phím `N`. Filter view dùng phím trực tiếp `T`, `S`, `D`, `A`, `I`, `U`; filter nội dung dùng đúng ba phím đơn `-` để chỉ note, `=` để chỉ task và `\` để hiện tất cả. `+` và `|` không kích hoạt filter; `1–9` mở project theo thứ tự compact sidebar. Phím `[` chuyển trạng thái sidebar và `?` mở bảng trợ giúp. Bảng trợ giúp gộp project thành một dòng, đóng bằng X/Escape; compact sidebar hiện tooltip tức thời khi hover/focus icon hoặc project dot.

Navigation chính có **Tất cả** ngay dưới **Theo ngày**. View này giữ canvas phẳng và chia item đang hoạt động thành Quá hạn, Hôm nay, Sắp tới, Sau đó và Chưa có ngày để quét theo thời gian mà không cần đổi filter.

Hôm nay/Sắp tới/Theo ngày/Tất cả không hiển thị task/note của dự án đã lưu trữ, kể cả disclosure trạng thái; số đếm được tính cùng quy tắc. Riêng disclosure Hôm nay chỉ giữ task hoàn thành trong ngày hiện tại theo múi giờ Việt Nam, không theo due date. Nội dung cũ vẫn xem được từ dự án đã lưu trữ/các view phù hợp khác, không bị xóa.

Mọi view dùng switcher icon-only kiểu segmented theo thứ tự **Tất cả / Chỉ note / Chỉ task**. Desktop đặt switcher đúng vị trí control Ẩn/Hiện note cũ và giữ nguyên nút sidebar hiện tại. Mobile đặt switcher bên trái sync pill trong hàng control nổi ngay trên dock; lựa chọn chỉ tác động presentation và được giữ khi chuyển view trong phiên.

Typography web app dùng base size bằng `rem`, scale root `112.5%` trên desktop và `120%` trên mobile. Cách này tăng độ đọc của navigation, item, metadata và editor nhưng giữ nguyên kích thước icon, sidebar, touch target và row geometry.

Danh sách mobile dùng canvas tràn viền, row tối thiểu `52px` và gap `2px` giữa item; row ở trạng thái nghỉ dùng nền transparent để radial glow của Spark liền mạch, chỉ phủ lại canvas khi đang kéo hoặc mở khay swipe. Title task/note luôn là một dòng và ellipsis khi thiếu chỗ. Item có Nội dung chi tiết hiển thị icon hội thoại 15px ngay sau text, không neo ở mép phải. Marker giữ vùng chạm tối thiểu 44px, project dot được thu gọn, còn desktop tiếp tục dùng row khoảng `35px` và gap `6px`.

Mobile bỏ app header riêng; view header sticky đặt panel icon-only trong cùng title row, ngay trước title. Khi scroll, header còn khoảng 62% chiều cao, title còn 80%, bỏ eyebrow nhưng giữ dòng thống kê, nền canvas 60% opacity kết hợp blur 14px và dải màu giảm từ 20px xuống 10px. Dock icon-only 58px dùng năm segment bằng nhau cho Hôm nay/Sắp tới/Thêm/Theo ngày/Tất cả; nút thêm 72px nằm giữa và trồi khỏi thanh, còn active navigation dùng nền Navy rộng tối đa 64px.

Gesture chỉ áp dụng dưới breakpoint mobile: khi không có khay swipe nào mở, một lần tap vùng nội dung task/note mở chi tiết. Nếu bất kỳ khay nào đang mở, tap nội dung cùng item hoặc item khác chỉ đóng khay, chưa mở chi tiết. Swipe trái mở khay Quan Trọng, Ưu tiên và action cuối theo loại item — Xóa với task, Lưu trữ/Khôi phục với note; swipe phải trên item không có hành động; swipe từ mép trái sang phải mở navigation sheet với motion transform. Vuốt/cuộn không tự mở chi tiết; checkbox/marker và action trong khay giữ hành vi riêng. Xóa vẫn dùng toast Hoàn tác và không kích hoạt ngay khi thả full-swipe. Toast nằm trên hàng switcher/sync và dock/safe area, không che navigation; desktop né floating `+`. Không dùng touch-and-hold. Panel icon trong header là fallback khi browser ưu tiên gesture hệ thống.

## Shared component inventory

- App shell / sidebar / mobile navigation sheet.
- View header và open-task count.
- Quick-add composer giữ checkbox Ghi chú hiện tại. Cả task và note có secondary button **Thêm Nội dung** để mở field “Nội dung (nếu cần)”. Ngày và dự án luôn khả dụng cho cả hai loại. Các overlay dùng lớp nền Navy dim đủ đậm để giữ bối cảnh nhìn thấy rõ, không blur nội dung phía sau.
- Quick-add đóng dùng floating icon-only button `+` 32px trong control turquoise 48px ở desktop; mobile dùng nút turquoise 72px giữa dock 58px. Cả hai giữ accessible label “Thêm công việc”. Khi mở, overlay surface trắng neo cùng góc; trên mobile surface dùng gần trọn chiều rộng như bottom sheet. Field có label, nền nhẹ, bo góc và spacing đồng bộ project editor. Hủy là secondary text button; Thêm là primary turquoise.
- Item row: task dùng checkbox; note đang hoạt động dùng rounded dash mark xám có thể bấm để lưu trữ, note đã lưu trữ dùng icon archive để khôi phục. Cả hai loại có description thì hiển thị icon hội thoại nhỏ ngay sau Tên; icon chỉ báo trạng thái và tap row mở detail sheet. Detail sheet desktop rộng 780px, chỉ giữ nút X ở header, và ưu tiên trạng thái đọc với edit icon neo ở mép phải từng khối Tên/Nội dung. URL trong Nội dung dùng link gạch chân, mở tab mới. Metadata ngày/dự án/Quan Trọng/Ưu tiên được gom gọn; Lưu trữ và Xóa nằm cùng vùng nhưng Xóa được tách bằng divider, màu destructive và luôn mở xác nhận trước khi thực hiện. Marker và project dot căn theo dòng title thay vì giữa toàn row. Desktop sidebar expanded cho drag project để đổi `position`; row nguồn giảm opacity và drop target hiện đường Turquoise kèm chấm tròn ở cạnh trên/dưới đúng vị trí chèn. Mobile không drag.
- Thứ tự listing trong từng nhóm thời gian là cả Quan Trọng + Ưu tiên trước, kế đến Ưu tiên, Quan Trọng và bình thường. Trong từng mức vẫn giữ task trước note, rồi due date và created time; việc tắt cờ tự đưa item về thứ tự thông thường.
- Disclosure trạng thái dùng nhãn **Đã hoàn thành**, **Đã lưu trữ** hoặc **Đã hoàn thành & lưu trữ** theo nội dung; giữ uppercase, weight và letter-spacing cùng hệ section label của sidebar.
- Item detail sheet/popover với edit inline.
- Smart filters Quan Trọng và Ưu tiên.
- Project row và project editor.
- Date strip/date picker.
- Completed disclosure.
- Toast có Undo và luôn chừa navigation/dock.
- Empty, skeleton, error và offline banner.
