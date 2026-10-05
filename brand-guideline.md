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

Brand palette của Spark có đúng năm màu chromatic. Trắng, đen và các sắc xám là neutral, không tính vào giới hạn này. Palette nhận diện dự án bên dưới là một ngoại lệ có kiểm soát dành riêng cho project dot và bộ chọn màu, không phải màu thương hiệu bổ sung.

| Token gợi ý | Màu | Vai trò thương hiệu |
|---|---|---|
| `brand-navy` | `#111742` | Nền/chrome tối, text đậm và cấu trúc chính. |
| `brand-turquoise` | `#44D4CD` | Tương tác mát và notification/info; checkbox hoàn thành dùng neutral theo D-135. |
| `brand-violet` | `#8951C7` | Accent hỗ trợ, illustration và gradient. |
| `brand-coral` | `#D9776A` | Accent ấm, warning và điểm nhấn cần chú ý. |
| `brand-deep-purple` | `#65458A` | Màu neo nhận diện, logo, heading hoặc chi tiết chủ đạo. |

### Cách phối màu

- Mỗi bố cục thường chỉ dùng 2–3 màu chromatic; không cần đưa cả năm màu vào một màn hình.
- Dùng neutral cho phần lớn surface và nội dung; màu thương hiệu dẫn hướng, không phủ kín mọi thành phần.
- Navy và Deep Purple là màu neo. Turquoise, Violet và Muted Coral là accent.
- Turquoise và Muted Coral tạo cặp lạnh–ấm; tránh đặt cả hai ở độ phủ lớn ngang nhau.
- Không thêm màu chromatic mới nếu chưa cập nhật guideline và decision log; ngoại lệ hiện tại chỉ gồm palette nhận diện dự án đã định nghĩa dưới đây.

### Project identity palette

Project có bảy màu preset để các dot vẫn phân biệt được khi danh sách dài. Bốn màu lấy trực tiếp từ brand palette và ba màu dẫn xuất được giảm độ gắt để hòa với Compact Canvas; lựa chọn thứ tám trong editor là swatch đa sắc mở màu custom.

| Tên | Màu | Nguồn |
|---|---|---|
| Turquoise | `#44D4CD` | Brand |
| Violet | `#8951C7` | Brand |
| Muted Coral | `#D9776A` | Brand |
| Deep Purple | `#65458A` | Brand |
| Soft Amber | `#D6A84F` | Dẫn xuất ấm |
| Cornflower | `#5C78D6` | Dẫn xuất mát |
| Sage | `#6FA889` | Dẫn xuất xanh dịu |

- Chỉ dùng ba màu dẫn xuất cho project dot, bộ chọn màu dự án và chú giải trực tiếp của project.
- Người dùng có thể chọn màu tùy ý cho project qua color picker. Màu custom chỉ dùng cho project dot, swatch đang chọn và chú giải trực tiếp của project; không trở thành token thương hiệu hoặc màu control toàn cục.
- Không dùng các màu dẫn xuất làm CTA, focus, trạng thái hệ thống, logo hoặc mảng nền thương hiệu.
- Navy không dùng làm project dot vì thiếu tương phản trên sidebar navy.

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

- Vùng chạm mobile mặc định là `44×44px`, kể cả khi artwork icon nhỏ hơn. Ngoại lệ đã duyệt D-131: selector sắp xếp cao 36px và nút đổi chiều 36×36px trên desktop/mobile.
- Desktop floating quick-add là ngoại lệ Primary icon `48×48px`, dấu `+` 32px, neo góc dưới phải. Mobile dùng nút Primary icon 72px ở giữa dock 58px, cho phép trồi khỏi dock; cả hai luôn có accessible label/tooltip “Thêm công việc”.
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
- Trên nền trắng, Navy (`17.14:1`), Deep Purple (`7.58:1`) và Violet (`5.17:1`) đạt tỷ lệ cho body text; Muted Coral (`3.09:1`) và Turquoise (`1.82:1`) không dùng làm chữ nhỏ trực tiếp trên trắng.
- Trên Navy, trắng (`17.14:1`), Turquoise (`9.42:1`) và Muted Coral (`5.55:1`) có độ tương phản tốt; không mặc định dùng Deep Purple hoặc Violet làm chữ nhỏ.
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
- Mobile view header sticky thu gọn khi cuộn, giữ thống kê và có dải project/view 5px full-width dưới cùng; desktop dùng cùng hierarchy với padding 20px cả bốn phía. Mobile bottom dock icon-only cao 58px và overlay trên canvas.
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
- Active state ưu tiên nền neutral nhẹ, thay đổi weight hoặc một accent nhỏ; riêng current destination trong mobile dock dùng nền Navy và icon trắng để tạo trạng thái đảo màu rõ ràng. Không tô nhiều màu cho toàn bộ sidebar.
- Dùng màu chủ đạo neutral/Navy. Chỉ thêm Turquoise, Violet hoặc Muted Coral khi màu có ý nghĩa hoặc giúp dẫn mắt.
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
- Cặp gợi ý: Turquoise → Violet cho cảm giác mát và năng động; Muted Coral → Deep Purple cho cảm giác ấm và có chiều sâu.
- Gradient không được làm giảm độ tương phản của chữ hoặc biến toàn bộ web app thành bề mặt trang trí.

## 8. Layout and motion

- D-136: Header padding 20px cả bốn phía desktop/mobile (mobile cộng safe-area top), cả thường/compact; chiều cao theo nội dung. Dải màu 5px dưới tiêu đề và thống kê. Không dùng border dưới; bóng Navy rất nhẹ ở chân header rõ hơn giữa và tan ở hai mép. Backdrop blur 8px desktop/mobile (cả thường/compact), có WebKit prefix.

- Bố cục đơn giản, rõ thứ bậc, có khoảng thở nhưng không làm giảm mật độ hữu ích của Compact Canvas.
- Canvas liệt kê task/note trên desktop rộng responsive từ `940px` đến tối đa `1200px`; khi vùng nội dung không đủ chỗ thì co theo chiều rộng khả dụng, không tạo cuộn ngang. Mobile tiếp tục dùng trọn chiều rộng màn hình. Detail sheet desktop rộng `880px`; header, Tên và cụm metadata/control giữ cố định, chỉ vùng Nội dung cuộn khi nội dung dài. Nhãn Nội dung và nút sửa nằm cùng hàng cố định bên ngoài vùng cuộn. Toolbar B/I/U dùng control neutral, trạng thái chọn Navy/trắng và vùng chạm 44px trên mobile.
- Khung desktop khi sửa Nội dung cao `min(86dvh, 820px)`, editor giãn theo phần còn lại; mobile edit dùng vùng nhập `40dvh`. Quick-add cao `160px`, chữ nhập regular trên desktop. Toolbar giữ border và pha 5% đen trên nền field; wrapper/vùng nhập không border hoặc nền. Không có bullet/numbering.
- Tên không có label; nút sửa ngang text. Input Tên cao 28px, chỉ gạch dưới 1px, nền trong suốt, không outline/glow/shadow. Desktop có ✓/× cùng hàng; mobile ẩn hai nút này và tự lưu tên hợp lệ khi blur. Nhãn Nội dung cao 28px, cách field 4px desktop/8px mobile; nút lưu/hủy Nội dung hiển thị 28px/icon 16px ở cả desktop/mobile, mobile có vùng chạm 44px. Nút Sửa mobile vẫn có control 44px.
- Khối Nội dung cách đường phân cách 16px phía trước và 14.4px phía sau, giảm 20%. Checkbox/dấu note trong chi tiết không có padding ngang, cách tên 10px, hover không đổi nền; tên task hoàn thành không gạch ngang.
- Metadata mobile có Dự án và Lưu trữ/Xóa cùng hàng thứ hai. Focus vào metadata tự lưu draft nhưng giữ editor/kích thước khung để click không mất đích (D-132).
- Dùng bo góc nhất quán và surface trung tính; tránh card lồng card hoặc shadow nặng.
- Website có thể biểu cảm hơn web app. Web app ưu tiên tốc độ, khả năng quét và vùng chạm tối thiểu 44px trên mobile.
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

- D-131: Ô chọn sắp xếp và nút đổi chiều cao 36px trên desktop/mobile; nút đổi chiều rộng 36px. Header blur 8px ở cả hai kích thước, có WebKit.
