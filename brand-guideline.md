# Spark Brand Guideline

Tài liệu này là nguồn tham chiếu chính cho cách Spark xuất hiện và giao tiếp trên website, web app và presentation. Khi một thiết kế hoặc nội dung mới mâu thuẫn với tài liệu này, ưu tiên guideline này và ghi quyết định mới vào `docs/DECISIONS.md`.

## 1. Brand foundation

### Purpose

Spark được tạo ra để giúp việc quản lý những việc cần làm trở nên hiệu quả và vui vẻ hơn.

### Positioning

Spark không cố khác biệt bằng số lượng tính năng. Đây trước hết là công cụ riêng của Thuận, được tùy chỉnh và cá nhân hóa theo nhu cầu, thói quen và mong muốn của Thuận. Nếu mở rộng, Spark hướng đến những người bạn của Thuận đang cần một cách quản lý công việc cá nhân hiệu quả và dễ chịu.

### Brand promise

Mở Spark ra, hiểu ngay việc cần làm và bắt đầu nhanh — không có cảm giác bị một hệ thống quản trị phức tạp kiểm soát.

### Tagline

> to-do fun and easy

- Giữ nguyên câu chữ và ưu tiên lowercase.
- Tagline là thành phần truyền thông, không tự động ghép vào logo primary.
- Có thể dùng độc lập ở hero, opening slide hoặc closing slide khi ngữ cảnh đã nhận diện rõ Spark.

### Website title

- Browser title, Open Graph title và tên đầy đủ trong PWA manifest: **Spark — Make todo easy & fun**.
- Tên ngắn của ứng dụng tiếp tục là **Spark**.
- Website title là metadata sản phẩm; không thay thế tagline truyền thông và không tự động ghép vào logo.

### Personality

1. **Đơn giản:** ưu tiên một ý rõ ràng hơn nhiều lớp giải thích.
2. **Nhanh:** thao tác và thông điệp đi thẳng vào việc cần làm.
3. **Hiệu quả:** mỗi thành phần phải giúp người dùng hiểu hoặc hành động.
4. **Vui tính:** tạo cảm giác nhẹ nhàng bằng ngôn ngữ và chi tiết có duyên.
5. **Cá nhân hóa:** Spark thích nghi với Thuận và từng người dùng, không ép mọi người vào một quy trình cứng.

## 2. Voice and tone

### Giọng nói cốt lõi

Spark nói như một người bạn gần gũi, nhanh trí và hữu ích. Nội dung ưu tiên tiếng Việt tự nhiên; có thể xen tiếng Anh quen thuộc khi câu chữ ngắn gọn hoặc vui hơn. Không cần dịch máy móc mọi thuật ngữ và chưa đặt yêu cầu giao diện song ngữ hoàn chỉnh.

### Nguyên tắc viết

- Nói ngắn, trực tiếp và thân thiện; ưu tiên động từ rõ hành động.
- Có thể vui tính, nhưng câu đùa không được che mất trạng thái hoặc bước tiếp theo.
- Không trách móc, gây tội lỗi hoặc tạo áp lực khi người dùng trễ việc.
- Không phô trương năng suất, không dùng giọng quản trị doanh nghiệp.
- Dùng dấu chấm than và emoji tiết chế; không biến mọi thông báo thành lời cổ vũ quá mức.
- Trong tình huống lỗi, nói điều gì vừa xảy ra và người dùng có thể làm gì tiếp theo.

### Mẫu microcopy

| Tình huống | Nên dùng | Tránh dùng |
|---|---|---|
| Danh sách trống | “Trống rồi. Thêm một việc nhỏ nhé?” | “Bạn chưa tạo bất kỳ nhiệm vụ nào.” |
| Hoàn thành | “Xong một việc. Nice!” | “Năng suất của bạn đã tăng!” |
| Không lưu được | “Chưa lưu được. Thử lại nhé?” | “Error 500: Request failed.” |
| Việc quá hạn | “Việc này qua ngày rồi.” | “Bạn đã không hoàn thành đúng hạn.” |
| Xóa | “Xóa mục này?” | “Bạn có chắc chắn muốn thực hiện thao tác xóa vĩnh viễn không?” |

Microcopy là ví dụ về giọng điệu, không phải chuỗi bắt buộc phải triển khai nguyên văn.

## 3. Logo

Logo chính thức hiện hành theo D-134 (05/10/2026): biểu tượng tick/vòng tròn/vạch trắng trên badge gradient xanh–Navy do chủ dự án cung cấp, đặt bên trái wordmark lowercase bold `spark`. Dùng asset trong `assets/logo/`, không gõ lại wordmark bằng font hệ thống.

### Cấu trúc và màu chính thức

- Biểu tượng lấy nguyên hình học từ `spark-app-icon-v2.svg`; nền gradient #2B3BA8 → #111742, góc bo 116/512. Không kéo méo, tự đổi nét hoặc thêm hiệu ứng.
- Primary: wordmark Deep Purple #65458A. Negative: wordmark trắng #FFFFFF; biểu tượng vẫn giữ nguyên badge màu ở cả hai bản.
- Đường vector và kerning của chữ `spark` giữ từ logo đã duyệt. `spark-wordmark.svg` lưu riêng outlines để tái tạo, không có mark cũ.
- Lockup có viewBox 2048×768, badge 480×480 tại (133,152); phần ngoài badge/wordmark trong suốt. Giữ tỷ lệ toàn logo; tối thiểu 120 CSS px. Kích thước nhỏ hơn dùng badge độc lập.
- Primary dùng trên nền sáng; negative dùng trên Navy/nền tối đủ tương phản. Không áp CSS filter cho logo; gọi đúng asset.
- Quy tắc tick/ba tia check-burst, ba màu tia và logo negative toàn trắng trước D-134 chỉ là lịch sử. D-134 cho phép gradient bên trong badge logo, không áp gradient lên wordmark hoặc canvas app.

- D-135: sidebar dùng cùng logo negative cho full/compact/mobile, badge luôn 36px và cùng cột tâm x=28px với icon điều hướng. Crop ngang để ẩn wordmark ở compact; khung cao 58px chứa đủ ảnh, không cắt chân logo.

### App icon hiện hành — D-133/D-134 (2026-10-05)

- Chủ dự án cung cấp SVG mới: tick trắng trong vòng tròn đứt đoạn và hai vạch trắng, nền radial gradient từ `#2B3BA8` đến Navy `#111742`. Source nguyên bản lưu tại `assets/logo/spark-app-icon-v2.svg` (512×512).
- D-134 mở rộng biểu tượng mới cho cả logo chính, sidebar desktop/mobile và compact rail; thay toàn bộ mark check-burst trong bộ asset phục vụ app. Wordmark giữ outlines cũ; nền canvas app vẫn phẳng theo D-130.
- Apple Touch Icon 180px dùng source vuông full-bleed. Chrome/PWA `purpose: any` 192/512px và favicon dùng source với góc bo radius 116/512, phần ngoài góc trong suốt; không đổi hình học/nền gradient bên trong.
- PWA maskable 512px giữ nền gradient full-bleed, chỉ scale artwork trắng 90% quanh tâm để nằm trong safe zone bán kính 40% canvas. [Quy tắc safe zone W3C](https://www.w3.org/TR/appmanifest/#icon-masks).
- Favicon có SVG, PNG 16/32/48px và ICO chứa cả ba kích thước. Tên file `v2` tránh dùng lại URL icon đã cache.
- Source `assets/logo/spark-app-icon-editable.svg` là bản check-burst cũ đã xuất cho chủ dự án; chỉ là tham chiếu lịch sử, không dùng để build icon mới.

Asset hiện tại:

- `assets/logo/spark-logo-primary.svg` và `.png`: logo primary cho website/app/presentation.
- `assets/logo/spark-logo-negative.svg` và `.png`: badge màu + wordmark trắng trên nền tối; compact rail dùng cùng full logo và crop ngang theo D-135; `public/spark-mark-v2.svg` là badge độc lập.
- `public/icons/spark-app-v2.svg`: bản SVG vuông nguyên mẫu; `public/spark-favicon-v2.svg`: SVG bo góc; `public/icons/spark-maskable-v2.svg`: source maskable đã scale artwork.
- `public/spark-favicon-v2.ico`, `public/icons/spark-favicon-v2-{16,32,48}.png`: favicon.
- `public/icons/spark-pwa-v2-{192,512}.png`: icon Chrome/PWA thông thường.
- `public/icons/spark-maskable-v2-512.png`: maskable; `public/icons/spark-apple-v2-180.png`: Apple Touch Icon.
- Các URL icon/logo cũ trong public được cập nhật bằng nội dung mới để tương thích. App và service worker dùng URL v2. Asset concept và SVG xuất cũ chỉ là lịch sử; không dùng ở runtime.

## 4. Color system

Brand palette của Spark có bốn màu chromatic. Trắng, đen và các sắc xám là neutral, không tính vào giới hạn này. Palette nhận diện dự án bên dưới là một ngoại lệ có kiểm soát dành riêng cho project dot và bộ chọn màu, không phải màu thương hiệu bổ sung.

| Token gợi ý | Màu | Vai trò thương hiệu |
|---|---|---|
| `brand-navy` | `#111742` | Nền/chrome tối, text đậm và cấu trúc chính. |
| `brand-turquoise` | `#44D4CD` | Tương tác mát và notification/info; checkbox hoàn thành dùng neutral theo D-135. |
| `brand-coral` | `#D9776A` | Accent ấm, warning và điểm nhấn cần chú ý. |
| `brand-deep-purple` | `#65458A` | Màu neo nhận diện, logo, heading hoặc chi tiết chủ đạo. |

### Cách phối màu

- Mỗi bố cục thường chỉ dùng 2–3 màu chromatic; không cần đưa cả bốn màu vào một màn hình.
- Dùng neutral cho phần lớn surface và nội dung; màu thương hiệu dẫn hướng, không phủ kín mọi thành phần.
- Navy và Deep Purple là màu neo. Turquoise và Muted Coral là accent.
- Turquoise và Muted Coral tạo cặp lạnh–ấm; tránh đặt cả hai ở độ phủ lớn ngang nhau.
- Không thêm màu chromatic mới nếu chưa cập nhật guideline và decision log; ngoại lệ hiện tại chỉ gồm palette nhận diện dự án đã định nghĩa dưới đây.

D-146: bỏ Violet #8951C7 khỏi thương hiệu/UI và đổi dự án dùng preset Violet sang Amber #D6A84F; giữ Deep Purple. Giá trị Violet chỉ còn trong mã migration/test hoặc tài liệu lịch sử.

### Project identity palette

Project có sáu màu preset để các dot vẫn phân biệt được khi danh sách dài. Ba màu lấy trực tiếp từ brand palette và ba màu dẫn xuất được giảm độ gắt để hòa với Compact Canvas; lựa chọn thứ bảy trong editor là swatch đa sắc mở màu custom.

| Tên | Màu | Nguồn |
|---|---|---|
| Turquoise | `#44D4CD` | Brand |
| Muted Coral | `#D9776A` | Brand |
| Deep Purple | `#65458A` | Brand |
| Soft Amber | `#D6A84F` | Dẫn xuất ấm |
| Cornflower | `#5C78D6` | Dẫn xuất mát |
| Sage | `#6FA889` | Dẫn xuất xanh dịu |

- Chỉ dùng ba màu dẫn xuất cho project dot, bộ chọn màu dự án và chú giải trực tiếp của project.
- Người dùng có thể chọn màu tùy ý cho project qua color picker. Màu custom chỉ dùng cho project dot, swatch đang chọn và chú giải trực tiếp của project; không trở thành token thương hiệu hoặc màu control toàn cục.
- Không dùng các màu dẫn xuất làm CTA, focus, trạng thái hệ thống, logo hoặc mảng nền thương hiệu.
- Navy không dùng làm project dot vì thiếu tương phản trên sidebar navy.

### Giao diện tối — D-138–D-143

D-141/D-142: vòng tròn nút thu/mở sidebar desktop 42px, icon 20px; nền cùng canvas ở cả hai theme (dark #121622), hover chỉ đổi màu icon, không đổi nền. D-154 khôi phục tâm nút trên biên phải sidebar ở full/compact.

D-147: phím `<` chọn Sáng, `>` chọn Tối, `M`/`m` chọn Theo hệ thống khi không nhập văn bản. Cùng cơ chế lưu và theo OS như bộ chọn giao diện.

D-140: tiêu đề view/tên dự án và dải màu dưới header dùng opacity 75% trong dark mode ở desktop/mobile; theme sáng vẫn 100%.

Dark mode dùng neutral xanh xám, canvas phẳng; giữ nguyên màu nhận diện và artwork logo/icon. Bảng màu và các tinh chỉnh D-139–D-142 đã được chủ dự án duyệt phát hành production theo D-143.

| Thành phần | Màu tối |
|---|---|
| Canvas | `#121622` |
| Sidebar | `#111742` |
| Quick-add / chi tiết / dialog | `#1B2030` |
| Input / toolbar / khay control | `#242B3D` |
| Chữ chính / chữ phụ | `#E9ECF5` / `#A0A8BC` |
| Đường phân cách | `#343C50` |
| Control được chọn / chữ | `#3D4B6B` / `#F4F6FB` |
| Link / focus | `#6CE0DA` |
| Chữ nhãn / Quan Trọng / Ưu tiên | `#A0A8BC` / `#D6A84F` / `#D9776A` |

D-146: Quan Trọng dùng duy nhất Amber #D6A84F, Ưu tiên dùng duy nhất Coral #D9776A ở danh sách, chi tiết, sidebar và swipe, cả hai theme; nền/border có thể dùng độ trong suốt của cùng màu. Nhãn trước đây dùng Violet chuyển sang neutral muted. Deep Purple #65458A giữ nguyên trong logo và dự án. CTA giữ Turquoise và chữ Navy, checked vẫn neutral #8B8F9E. Project giữ giá trị màu đã chọn, dot thêm viền trong trắng 20% để tách khỏi nền. Sidebar tiếp tục dùng logo negative với wordmark trắng. Native date/select theo color-scheme của theme thực tế. Header blur 8px/WebKit và bóng tối nhẹ, không thêm gradient màu nền. Các quy tắc màu sáng bên dưới tiếp tục áp dụng khi chọn Sáng. D-139: hover nút lưu Tên/Nội dung dùng nền Turquoise và icon Navy ở cả hai theme; nút Hủy hover nền neutral nhẹ (ink 8%) và icon ink; nhãn lựa chọn theme hiển thị uppercase.

### Controls và focus

Phần này là source of truth cho web app. Khi CSS/component mới khác bảng dưới đây, ưu tiên cập nhật component về đúng guideline; nếu thật sự cần ngoại lệ, phải ghi thêm vào decision log.

#### Neutral UI tokens

| Token | Giá trị | Vai trò |
|---|---|---|
| `ui-canvas` | `#F7F8FA` | Nền phẳng toàn ứng dụng và nút collapse sidebar; không phủ gradient hoặc radial glow lên app canvas (D-130). |
| `ui-surface` | `#FFFFFF` | Dialog, editor và quick-add surface. |
| `ui-field` | `#FAFBFC` | Nền input/select/textarea. |
| `ui-field-border` | `#DDE0E8` | Border field mặc định. |
| `ui-line` | `#E8EAF0` | Divider và border rất nhẹ. |
| `ui-ink` | `#171B35` | Text chính. |
| `ui-muted` | `#73788D` | Body phụ và metadata. |
| `ui-control-muted` | `#8B8F9E` | Secondary text/icon button. |
| `ui-control-hover` | `#F1F2F5` | Nền hover của secondary button. |
| `ui-note-mark` | `#AEB3BF` | Dash nhận diện note trong listing. |

#### Button variants

| Variant | Dùng cho | Default | Hover | Disabled |
|---|---|---|---|---|
| Primary | Thêm, Tạo/Lưu dự án, CTA chính | Turquoise `#44D4CD`, chữ Navy `#111742` | Navy, chữ trắng | Giữ nền Turquoise; chữ Navy ở `46%`, không giảm opacity toàn nút. |
| Primary icon | Close và utility icon cần nổi bật | Turquoise, icon Navy, `44×44px`, hình tròn | Navy, icon trắng | Như Primary. |
| Secondary text | Hủy và action phụ | Transparent, chữ `#8B8F9E`, cao `40px`, bo tròn hai đầu | Nền `#F1F2F5`, chữ `#171B35` | Giảm tương phản chữ, không thêm glow. |
| Secondary icon | Search/Help ở header, edit cạnh tên dự án | Transparent, icon `#8B8F9E`, `36–40px`, hình tròn | Nền `#F1F2F5`, icon `#171B35` | Giảm tương phản icon. |
| Destructive | Xóa item | Muted Coral/tint đi kèm icon và label | Tăng tint tiết chế | Không dùng màu làm tín hiệu duy nhất. |
| Semantic | Star, Ưu tiên, checkbox, project color | Màu theo ý nghĩa hoặc trạng thái | Chỉ đổi khi giúp nhận biết hành động | Phải giữ icon/shape/label làm tín hiệu bổ sung. |

- Vùng chạm mobile mặc định là `44×44px`, kể cả khi artwork icon nhỏ hơn. Ngoại lệ đã duyệt D-155: selector sắp xếp cao 30px và nút đổi chiều 30×30px trên desktop/mobile.
- Desktop floating quick-add là ngoại lệ Primary icon `48×48px`, dấu `+` 32px, neo góc dưới phải. Mobile dùng nút Primary icon 64px nhô nhẹ phía trên dock 58px, dấu + 36px; cả hai luôn có accessible label/tooltip “Thêm công việc”.
- D-135: nút chỉ có icon dùng hình tròn; nút có chữ/navigation bo hai đầu. Checkbox checked dùng #8B8F9E/tick trắng trên desktop và mobile.
- Nút trong cùng một action row dùng cùng chiều cao và radius; Primary và Hủy vẫn giữ phân cấp màu khác nhau.
- Navigation button, color swatch, date tile và project dot không bị ép vào màu Primary vì chúng là selection/navigation control.

#### Link trong nội dung

- URL trong Nội dung task/note giữ màu Navy `#19225F`, có underline Turquoise tiết chế để vẫn nhận ra khi không hover.
- Hover chuyển chữ và underline sang teal đậm `#287A79`; keyboard focus dùng nền `turquoise-soft`, không dùng glow.
- Link ngoài mở tab mới; underline là tín hiệu bắt buộc, không chỉ dùng màu để biểu đạt khả năng click.

#### Form và interaction states

| Trạng thái | Quy tắc |
|---|---|
| Default | Field nền `#FAFBFC`, border `#DDE0E8`, radius `12px`, cao `44–46px`. |
| Hover | Không đổi màu field Ngày/Dự án; tránh tạo cảm giác đây là CTA. |
| Focus | Không glow/shadow. Quick-add Tên dùng `ui-control-hover`; Nội dung trong suốt ở mọi trạng thái, chỉ toolbar có border/nền. Sửa Tên trong chi tiết chỉ có gạch dưới, nền trong suốt. |
| Selected | Dùng nền/tint đậm hơn khoảng `10–15%` hoặc tín hiệu semantic; không dùng outline glow. |
| Disabled | Giữ hình học và nền variant; giảm tương phản label/icon thay vì làm nhạt toàn control. |
| Error | Dùng Muted Coral kèm text/icon giải thích; không chỉ đổi border màu. |

### Semantic color

Trạng thái thông thường không phụ thuộc vào một màu riêng. Selected, disabled, completed hoặc overdue phải được hiểu qua ít nhất một tín hiệu khác như icon, nhãn, nét chữ, độ mờ, border hoặc vị trí.

- **Notification/info:** ưu tiên Turquoise `#44D4CD` trên nền/tint đủ tương phản.
- **Warning/attention:** ưu tiên Muted Coral `#D9776A` và luôn kèm icon hoặc nhãn rõ nghĩa.
- **Error/destructive:** có thể dùng Muted Coral làm tín hiệu nóng trong palette, nhưng thông điệp và icon phải nói rõ mức độ; không dùng màu làm tín hiệu duy nhất.
- **Success/completion:** checkbox task checked dùng neutral #8B8F9E và tick trắng; không dùng Turquoise cho trạng thái này.

### Accessibility

- Mọi text và control phải đạt WCAG AA trong tổ hợp màu thực tế.
- Trên nền trắng, Navy (`17.14:1`) và Deep Purple (`7.58:1`) đạt tỷ lệ cho body text; Muted Coral (`3.09:1`) và Turquoise (`1.82:1`) không dùng làm chữ nhỏ trực tiếp trên trắng.
- Trên Navy, trắng (`17.14:1`), Turquoise (`9.42:1`) và Muted Coral (`5.55:1`) có độ tương phản tốt; không mặc định dùng Deep Purple làm chữ nhỏ.
- Các tỷ lệ trên là guardrail cho màu gốc. Tint, opacity, gradient và trạng thái disabled phải được kiểm tra lại.

## 5. Typography

### Font families

- **Inter:** font chính cho web app, body text, label, form, bảng và nội dung cần đọc nhanh.
- **Raleway:** font display cho heading lớn, website marketing, title slide và con số/statement cần cá tính.
- Cả hai font phải dùng phiên bản có hỗ trợ đầy đủ dấu tiếng Việt.
- Logo luôn dùng artwork chính thức, không dựng lại bằng Raleway hoặc Inter.

### Weight và tương phản

| Ngữ cảnh | Font | Weight gợi ý |
|---|---|---|
| Display/hero | Raleway | 700–800 |
| Page/section heading | Raleway hoặc Inter | 600–700 |
| UI label/control | Inter | 500–600 |
| Body | Inter | 400–500 |
| Caption/metadata | Inter | 400–500 |

### Web app type scale

| Token/ngữ cảnh | Font | Size / line-height | Weight |
|---|---|---|---|
| `display-page` | Inter; Raleway chỉ cho brand moment | Base `34–49px`, render khoảng `38–55px` desktop và `41–59px` mobile / `1.05` | `700` |
| `title-sheet` | Inter | Base `21–24px`, render khoảng `24–27px` desktop và `25–29px` mobile / `1.15` | `700` |
| `body` | Inter | Base `13–14px`, render khoảng `15–16px` desktop và `16–17px` mobile / `1.4–1.6` | `400–500` |
| `control` | Inter | Base `12px`, render `13.5px` desktop và `14.4px` mobile / theo chiều cao control | `600–650` |
| `label` | Inter | Base `11px`, render khoảng `12.4px` desktop và `13.2px` mobile / `1.3` | `600–650` |
| `metadata` | Inter | Base `9–10px`, render khoảng `10–11px` desktop và `11–12px` mobile / `1.3` | `400–600` |

- CSS lưu type size bằng `rem` trên base 16px. Web app đặt root scale `112.5%` trên desktop và `120%` dưới 700px; nhờ vậy typography tăng đồng bộ mà không phóng to icon, rail hoặc control geometry.
- Item title mặc định dùng Inter base `13px`, render khoảng `14.6px` desktop và `15.6px` mobile, weight `400`; không tự động bold task/note.
- List density: desktop row khoảng `35px` với gap `6px`; mobile row tối thiểu `52px` với gap `2px`, canvas tràn viền và title một dòng, ellipsis khi thiếu chỗ. Marker/action mobile vẫn giữ vùng chạm tối thiểu `44px`.
- D-144/D-145: Header desktop/mobile thu gọn khi cuộn quá 28px, chuyển động 220ms; compact giữ h1 ở 50% cỡ chữ thường và dải màu 5px/radius 5px. H1 compact căn giữa chiều dọc với cụm trạng thái. Desktop giữ cụm sync/bộ lọc trong header, mobile giữ cụm nổi trên dock. Ẩn eyebrow, thống kê, nút mở sidebar mobile và nút sửa dự án; cuộn về đầu khôi phục đầy đủ. H1 dùng letter-spacing -0.025em ở cả hai trạng thái. Padding desktop 20px; mobile 15px cả bốn phía cộng safe-area theo D-161; giữ blur 8px/WebKit và opacity dark 75% cho h1/dải màu. Mobile bottom dock cao 58px cộng safe-area, sát ba mép màn hình, icon trên/nhãn dưới; riêng + không có nhãn (D-160).
- Marker task/note và project dot luôn căn theo dòng chữ đầu tiên; không căn giữa toàn bộ row khi title hoặc metadata làm row cao hơn.
- Trên desktop, due-date metadata và tâm artwork star/điện xẹt phải cùng trục giữa với dòng title; không căn theo mép trên của hit target icon.
- Danh sách hỗn hợp luôn đặt task trước note; trong từng loại giữ thứ tự thời gian. Đây là phân cấp nội dung, không dùng divider hoặc card riêng để tách hai loại.
- Heading trang dùng Navy, tracking âm nhẹ; label ngắn có thể uppercase với letter-spacing `0.10–0.13em`.
- Label nhóm/disclosure như `Cần lưu ý`, `Dự án`, `Đã hoàn thành` dùng uppercase, weight `700` và letter-spacing khoảng `0.13em`.
- Không thêm font family mới trong component. Mọi thay đổi font phải cập nhật bảng này và cách load font trước khi triển khai.

- Tạo tương phản bằng size, weight và khoảng trắng trước khi dùng thêm màu.
- Tránh dùng quá ba weight trong cùng một màn hình hoặc slide.
- Không dùng all caps cho đoạn dài; chỉ dùng cho nhãn rất ngắn khi spacing và khả năng đọc đã được kiểm tra.

## 6. Iconography

Ảnh do chủ dự án cung cấp ngày 2026-08-19 là tham chiếu về tinh thần: icon outline đơn sắc, nét bo tròn, hình học đơn giản, khoảng thở rộng và active state tiết chế. Spark không sao chép nguyên bộ icon hoặc hình dạng độc quyền từ ảnh tham chiếu.

### Quy tắc icon

- Dùng outline/monoline với đầu nét và góc bo tròn.
- Duy trì cùng optical size và stroke weight trong một bộ; ở lưới 24px, bắt đầu từ stroke khoảng 1.75–2px rồi cân chỉnh quang học.
- Hình phải nhận ra được ở 16–20px và không phụ thuộc vào chi tiết trang trí nhỏ.
- Active state ưu tiên nền neutral nhẹ, thay đổi weight hoặc một accent nhỏ; riêng current destination trong mobile dock dùng icon Navy ở light/heading sáng ở dark, nhãn bold và không có nền riêng (D-162). Không tô nhiều màu cho toàn bộ sidebar.
- Dùng màu chủ đạo neutral/Navy. Chỉ thêm Turquoise hoặc Muted Coral khi màu có ý nghĩa hoặc giúp dẫn mắt.
- Luôn có accessible label hoặc tooltip cho icon-only control.
- Các icon cùng nhóm phải thống nhất perspective, corner radius, khoảng âm và mức độ chi tiết.
- Metadata ngày dùng biểu tượng **play** cho Ngày bắt đầu và **flag** cho Ngày đến hạn trên cả desktop/mobile, quick-add và detail editor. Dropdown sort là pill trắng, dùng nhãn uppercase ngắn; control chiều sort là nút tròn trắng. Cả hai không dùng shadow; hover chỉ đổi màu border và icon/text, không dịch chuyển control. Chiều sort dùng biểu tượng mũi tên kèm các dòng độ dài tăng/giảm để diễn đạt A–Z/Z–A thay vì chevron xoay.
- Sidebar toggle dùng cùng khung panel bo tròn có divider trái: chevron hướng trái khi sidebar đang mở để biểu thị collapse, chevron hướng phải khi compact để biểu thị mở lại.

## 7. Imagery, illustration and gradients

### Hình ảnh con người

- Ưu tiên khoảnh khắc đời thường có con người đang suy nghĩ, ghi chú, hoàn thành việc hoặc tận hưởng khoảng trống sau khi xong việc.
- Cảm giác tự nhiên, cá nhân và có chút dí dỏm; tránh hình stock corporate, cảnh họp nhóm khuôn mẫu hoặc biểu đạt “hustle culture”.
- Bố cục nên có khoảng trống để đặt heading hoặc call-to-action.
- Khi có nhiều người, vẫn giữ cảm giác mỗi người đang quản lý công việc cá nhân; Spark không phải công cụ quản trị đội nhóm.

### Illustration và shape

- Ưu tiên hình học bo tròn, mảng sạch, chuyển động nhẹ và một chi tiết bất ngờ vừa đủ vui.
- Có thể lấy tick/vòng tròn của biểu tượng hiện hành làm cảm hứng về nhịp điệu, nhưng không rải star/spark motif tràn lan.
- Tránh minh họa quá trẻ con, quá bóng bẩy 3D hoặc quá nhiều chi tiết cạnh tranh với nội dung.

### Gradient

- Nền web app dùng canvas phẳng #F7F8FA trên desktop/mobile, không có gradient màu. Gradient dùng cho illustration, điểm nhấn truyền thông và badge icon/logo đã duyệt D-134; không thêm vào wordmark hoặc canvas app.
- Thường dùng tối đa hai màu brand trong một gradient, chuyển mềm và không tạo glow neon.
- Cặp gợi ý: Turquoise → Deep Purple cho cảm giác mát và năng động; Muted Coral → Deep Purple cho cảm giác ấm và có chiều sâu.
- Gradient không được làm giảm độ tương phản của chữ hoặc biến toàn bộ web app thành bề mặt trang trí.

## 8. Layout and motion

D-145: màn hình khởi động phủ Navy #111742, giữa màn hình là logo negative chính thức (icon + chữ spark) cùng thanh tiến trình và %. Sau khi dữ liệu sẵn sàng, cụm logo/progress mờ dần 500ms rồi nền thu về phải 600ms (D-149). Không lộ dữ liệu mẫu lúc chờ; lỗi/offline có lối tiếp tục rõ ràng.

- D-136: Header padding 20px cả bốn phía desktop/mobile (mobile cộng safe-area top), cả thường/compact; chiều cao theo nội dung. Dải màu 5px, radius 5px dưới tiêu đề và thống kê (D-137). Eyebrow các view ngày/Tất cả dùng xám #73788D như view dự án; Tất cả ghi “Mọi ngày. Mọi việc.”, giữ chữ uppercase như hệ thống. Không dùng border dưới; bóng Navy rất nhẹ ở chân header rõ hơn giữa và tan ở hai mép. Backdrop blur 8px desktop/mobile (cả thường/compact), có WebKit prefix.

- Bố cục đơn giản, rõ thứ bậc, có khoảng thở nhưng không làm giảm mật độ hữu ích của Compact Canvas.
- Canvas liệt kê task/note trên desktop rộng responsive từ `940px` đến tối đa `1200px`; khi vùng nội dung không đủ chỗ thì co theo chiều rộng khả dụng, không tạo cuộn ngang. Mobile tiếp tục dùng trọn chiều rộng màn hình. Detail sheet desktop rộng `880px`; header, Tên và cụm metadata/control giữ cố định, chỉ vùng Nội dung cuộn khi nội dung dài. Nhãn Nội dung và nút sửa nằm cùng hàng cố định bên ngoài vùng cuộn. Toolbar B/I/U dùng control neutral, trạng thái chọn Navy/trắng và vùng chạm 44px trên mobile.
- Khung desktop khi sửa Nội dung cao `min(86dvh, 820px)`, editor giãn theo phần còn lại; mobile đọc/sửa giãn phần còn lại của màn hình theo D-157. Quick-add cao `160px`, chữ nhập regular trên desktop. Toolbar giữ border và pha 5% đen trên nền field; wrapper/vùng nhập không border hoặc nền. Không có bullet/numbering.
- Tên không có label; nút sửa ngang text. Input Tên cao 28px, chỉ gạch dưới 1px, nền trong suốt, không outline/glow/shadow. Desktop có ✓/× cùng hàng; mobile ẩn hai nút này và tự lưu tên hợp lệ khi blur. Nhãn Nội dung cao 28px, cách field 4px desktop/8px mobile; nút lưu/hủy Nội dung hiển thị 28px/icon 16px ở cả desktop/mobile, mobile có vùng chạm 44px. Nút Sửa mobile vẫn có control 44px.
- Khối Nội dung cách đường phân cách 16px phía trước và 14.4px phía sau, giảm 20%. Checkbox/dấu note trong chi tiết không có padding ngang, cách tên 10px, hover không đổi nền; tên task hoàn thành không gạch ngang.
- Metadata mobile có Dự án và Lưu trữ/Xóa cùng hàng thứ hai. Focus vào metadata tự lưu draft nhưng giữ editor/kích thước khung để click không mất đích (D-132).
- Dùng bo góc nhất quán và surface trung tính; tránh card lồng card hoặc shadow nặng.
- Website có thể biểu cảm hơn web app. Web app ưu tiên tốc độ, khả năng quét và vùng chạm tối thiểu 44px trên mobile.
- D-146/D-148: mọi transition/animation dùng ease-out Quint qua token `--ease: cubic-bezier(.22, 1, .36, 1)`. Duration/delay dùng fallback tại rule gốc; reduced motion đặt chung `--motion-duration: .01ms`, `--motion-delay: 0ms`, `--motion-iterations: 1`. Không dùng `!important` hoặc tăng specificity để ép style; giữ animationend cần cho màn loading.
- Motion ngắn và có mục đích: xác nhận hoàn thành, chuyển trạng thái hoặc dẫn hướng. Tránh chuyển động liên tục và luôn tôn trọng `prefers-reduced-motion`.
- Sự vui tính nên đến từ timing, microcopy và chi tiết nhỏ, không từ hiệu ứng cản trở thao tác.

## 9. Application guidance

### Website

- Dùng Raleway cho thông điệp lớn, Inter cho nội dung và CTA.
- Có thể dùng hình ảnh con người, illustration và gradient trong palette để kể câu chuyện “fun and easy”.
- Logo primary xuất hiện rõ nhưng không cần lặp ở mọi section.

### Web app

- Inter là font mặc định; Raleway chỉ dùng ở moment có tính brand như welcome/empty state lớn nếu không làm giảm khả năng quét.
- Neutral chiếm phần lớn giao diện. Màu brand dùng cho điều hướng, focus, trạng thái và điểm nhấn.
- Giọng văn vui vẻ nhưng action label phải quen thuộc và rõ nghĩa.

### Presentation

- Raleway 700–800 cho title/section divider; Inter cho nội dung, bảng và chú thích.
- Mỗi slide có một trọng tâm. Dùng tối đa 2–3 màu chromatic và giữ vùng nội dung chính trên neutral.
- Slide mở/đóng có thể dùng gradient hoặc hình ảnh con người; slide dữ liệu ưu tiên độ đọc và tương phản.

## 10. Brand guardrails

### Luôn làm

- Đặt sự rõ ràng và tốc độ trước trang trí.
- Giữ cảm giác cá nhân, gần gũi và không phán xét.
- Kiểm tra tiếng Việt, responsive và accessibility trước khi phát hành.
- Dùng asset logo chính thức và palette đã chốt.

### Không làm

- Không biến Spark thành hình ảnh công cụ quản trị đội nhóm hoặc doanh nghiệp nặng nề.
- Không sao chép logo, icon set hoặc pixel-level UI của sản phẩm tham khảo.
- Không thêm màu chromatic, font hoặc motif mới chỉ để tạo khác biệt cho một màn hình.
- Không dùng màu, animation hoặc lời đùa thay cho thông tin chức năng.

## 11. Governance

- Phạm vi hiện tại: website, web app và presentation.
- Tài liệu này được cập nhật khi brand purpose, logo, palette, typography, voice hoặc visual language thay đổi.
- Thay đổi có ảnh hưởng đến nhận diện phải được ghi thêm trong `docs/DECISIONS.md`; không xóa quyết định cũ.
- Asset logo production nằm trong `assets/logo/`. File thử nghiệm và concept không được dùng như logo chính thức.
- Trước khi phát hành một ứng dụng mới, kiểm tra tối thiểu: logo đúng phiên bản, font có dấu tiếng Việt, contrast WCAG AA, semantic state không phụ thuộc màu và copy đúng giọng Spark.

- D-155 thay kích thước D-131: Ô chọn sắp xếp và nút đổi chiều có height/min-height 30px trên desktop/mobile; nút đổi chiều rộng 30px để giữ hình tròn. Header blur 8px ở cả hai kích thước, có WebKit.

D-152 thay D-151: animation thu/mở sidebar desktop và trượt mở sidebar mobile dùng 240ms, easeOutQuint qua token chung `--ease: cubic-bezier(.22, 1, .36, 1)`. Giữ reduced motion; bỏ token easeInOutQuint không còn sử dụng.

D-153: sidebar desktop full/compact dùng cùng điểm neo trái; tâm icon điều hướng, dot dự án, trợ giúp và đồng bộ nằm ở x=28px, cùng trục badge logo. Không căn giữa theo chiều rộng sidebar khi compact; chỉ ẩn chữ/số đếm. Dot dự án 12px ở cả hai trạng thái.

D-154 sửa riêng vị trí nút thu/mở trong D-153: nút bám biên phải sidebar, không nằm trong cột icon; các icon còn lại giữ trục trái khi thu/mở.

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
