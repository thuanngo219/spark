# Spark logo variations — exploration round 2

Sáu preview này tiếp tục hai hướng từ vòng concept đầu, chưa phải logo production và chưa được tích hợp vào app. Tất cả là PNG RGBA nền trong suốt, đã được đưa về fill phẳng để làm nền tảng dựng lại SVG sau khi chọn hướng.

> Trạng thái: vòng exploration đã kết thúc. Logo chính thức và palette mới được ghi tại [`../logo/README.md`](../logo/README.md); các file trong thư mục này được giữ làm lịch sử thiết kế.

## Palette

- Navy `#111742`: wordmark chính và chi tiết tối.
- Turquoise `#44D4CD`: dấu tick / chữ `a` mang tín hiệu hoàn thành.
- Violet `#8951C7`: accent hoặc chữ `a` ở biến thể 2B.
- Không dùng thêm màu chromatic mới trong vòng này. Trắng, xám và đen chỉ được xem là neutral khi dựng colorway nền sáng/tối về sau.
- Mỗi variation dùng 2–3 màu; tổng palette chromatic vẫn là 3 màu, dưới giới hạn 5 màu.

## Hướng 1 — Check burst tách riêng

### 1A — Rounded horizontal

File: `spark-1a-rounded-horizontal.png`

Rounded geometric sans, icon check-burst ở trái và wordmark nằm ngang cân bằng. Đây là phương án an toàn nhất khi cần đọc nhanh ở kích thước nhỏ; đổi lại cá tính typography vừa phải.

Prompt intent: wordmark lowercase `spark` với rounded geometric sans; icon riêng gồm một dấu tick và ba tia rời; lockup ngang; flat solid navy–turquoise–violet; không star, glow, gradient, mockup hay 3D.

### 1B — Display stacked/offset

File: `spark-1b-display-stacked.png`

Wordmark display rộng, góc cạnh hơn; icon nằm phía trên và lệch trái có chủ đích. Silhouette mạnh và giàu năng lượng nhất hướng 1, nhưng chiều cao lockup lớn hơn nên kém linh hoạt trong header thấp.

Prompt intent: lowercase `spark` với custom geometric display lettering, không sao chép font proprietary; check-burst tách riêng đặt trên nửa trái wordmark; flat solid palette; không star, glow, gradient, mockup hay 3D.

### 1C — Humanist terminal

File: `spark-1c-humanist-terminal.png`

Humanist/geometric sans thoáng hơn; icon nhỏ đặt sau `k` và tương tác nhẹ với điểm kết thúc wordmark. Cảm giác nhanh, tinh gọn và ít giống lockup to-do truyền thống; đổi lại icon terminal có thể cần bản rút gọn riêng ở kích thước rất nhỏ.

Prompt intent: lowercase `spark` với humanist-geometric sans hiện đại, icon check-burst riêng ở cuối wordmark gần vai trên của `k`; flat solid palette; không star, glow, gradient, mockup hay 3D.

Ứng viên mạnh nhất hướng 1: **1C**, vì tạo được nhịp riêng cho wordmark mà vẫn giữ check-burst tách biệt và đọc rõ. **1A** là lựa chọn an toàn hơn nếu ưu tiên khả năng triển khai đa kích thước.

## Hướng 2 — Check tích hợp trong chữ `a`

Không variation nào trong hướng này chứa star, sparkle, burst, tia lóe hoặc icon tách rời.

### 2A — Outline `a` + positive check

File: `spark-2a-outline-a-check.png`

Chữ `a` dạng outline bo tròn như checkbox, dấu tick turquoise dương nằm bên trong. Ý nghĩa hoàn thành rõ nhất và vẫn đọc đúng `spark`; đổi lại cấu trúc `a` khá nhiều chi tiết khi thu rất nhỏ.

Prompt intent: rounded lowercase wordmark `spark`; chữ `a` outline/checkbox bo tròn, tick dương nằm trong counter; không star/sparkle/burst; flat solid palette và alpha thật.

### 2B — Solid `a` + negative-space check

File: `spark-2b-solid-a-negative-check.png`

Chữ `a` violet đặc với dấu tick được khoét thành negative space; wordmark bold/display tạo silhouette mạnh. Dấu tick sống tốt trên nhiều màu nền vì là khoảng rỗng; đổi lại cần tinh chỉnh counter khi dựng SVG để `a` không bị đọc như một icon đứng giữa chữ.

Prompt intent: bold lowercase `spark`; `a` violet đặc, lỗ duy nhất bên trong là dấu tick alpha âm bản; navy cho `s-p-r-k`; không check dương, star, sparkle, burst hay icon rời.

### 2C — Minimal check counter

File: `spark-2c-minimal-a-counter-check.png`

Wordmark mảnh và hẹp hơn; chữ `a` turquoise vẫn giữ silhouette chữ, counter được tối giản thành tick âm bản nhỏ. Đây là phương án tinh tế nhất và khác rõ 2B; đổi lại tín hiệu “completed” yếu hơn ở kích thước favicon.

Prompt intent: medium-weight humanist-geometric lowercase `spark`; `a` turquoise với counter nhỏ dạng check âm bản, không counter tròn và không check dương; không star/sparkle/burst hay icon rời.

Ứng viên mạnh nhất hướng 2: **2B**, vì negative-space check rõ, silhouette gọn và có tiềm năng chuyển sang icon/app mark tốt nhất. **2C** phù hợp hơn nếu muốn nhận diện yên tĩnh, ít literal.

## Quy tắc nền sáng/tối và bước production

- Trên neutral sáng: dùng wordmark navy và accent turquoise/violet như preview.
- Trên neutral tối: dùng colorway inverse với wordmark trắng; giữ turquoise/violet nếu đạt tương phản. Trắng là neutral nên không làm tăng số màu chromatic.
- Sau khi chọn một concept: dựng SVG thủ công, cân kerning và optical alignment; tạo primary/inverse/monochrome colorways; kiểm tra 16/32px, app icon 192/512px và tương phản trên neutral sáng/tối.
- Bản monochrome chưa được xem là final ở phase này; sẽ kiểm tra sau khi chủ dự án chọn concept, đúng phạm vi đã thống nhất.

## Nguồn và quy trình

- Reference hướng 1: concept check-burst với icon tách riêng.
- Reference hướng 2: concept check tích hợp chữ `a`; star trong reference bị loại bỏ hoàn toàn.
- Tạo variation bằng built-in image generation, sau đó cleanup kỹ thuật alpha/palette để tất cả output là RGBA thật và chỉ chứa ba màu chromatic đã chốt.
