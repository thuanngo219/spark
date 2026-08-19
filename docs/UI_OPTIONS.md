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

Chủ dự án đã chọn **Option C — Compact Canvas** vì sự gọn gàng. Visual direction dùng navy `#111742` làm nền/chrome chính, turquoise `#44D4CD` làm màu tương tác, violet `#8951C7` làm màu hỗ trợ, Muted Coral `#D9776A` làm accent ấm và Deep Purple `#65458A` làm màu nhận diện trầm hơn violet nhưng tách biệt rõ với navy; content surface giữ sáng và sạch. Tổng palette chromatic là năm màu; trắng, xám và đen được xem là neutral và không tính vào giới hạn này.

Palette mở rộng đang đề xuất: **Soft Amber `#D6A84F`** dành cho Quan Trọng/star và **Muted Coral `#D9776A`** dành cho Urgent/điện xẹt. Hai màu chỉ dùng ở icon, trạng thái và highlight nhỏ; không dùng làm mảng nền lớn.

Trong task list, project chỉ được biểu diễn bằng **dot màu cỡ lớn**, không lặp lại tên project. Tên project vẫn xuất hiện trong navigation, màn hình project và task editor để bảo đảm người dùng có thể hiểu/chỉnh quan hệ này.

Navigation desktop đã chốt là **sidebar đầy đủ theo cấu trúc Option A**, giữ danh sách theo Compact Canvas. Người dùng có thể thu gọn sidebar thành icon rail bằng nút chevron hiển thị rõ hoặc phím `[`, rồi mở lại khi cần. Top navigation không dùng trong phiên bản hiện tại.

Filter có thể truy cập bằng chuỗi phím `G T`, `G U`, `G D`; phím `[` chuyển trạng thái sidebar và `?` mở bảng trợ giúp.

## Shared component inventory

- App shell / sidebar / mobile navigation sheet.
- View header và open-task count.
- Quick-add composer có lựa chọn Task/Note.
- Item row: task dùng checkbox, note dùng bullet point; cả hai có title, project dot lớn, star/điện xẹt và due label; không hiện tên project trong danh sách.
- Item edit sheet/popover.
- Smart filters Quan Trọng và Urgent.
- Project row và project editor.
- Date strip/date picker.
- Completed disclosure.
- Toast có Undo.
- Empty, skeleton, error và offline banner.
