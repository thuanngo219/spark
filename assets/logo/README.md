# Spark official logo

Logo chính thức của Spark là lockup ngang gồm icon check-burst tách riêng và wordmark lowercase bold `spark`.

![Spark official logo](spark-logo-primary.png)

## Màu trong logo

- Wordmark và dấu tick: Deep Purple `#65458A`.
- Tia ngang phía dưới bên trái: Muted Coral `#D9776A`.
- Tia chéo phía trên bên trái: turquoise `#44D4CD`.
- Tia dọc phía trên: violet `#8951C7`.

Navy `#111742` vẫn là màu nền/chrome chính của sản phẩm nhưng không xuất hiện trong primary logo lockup này.

## Brand palette đầy đủ

| Màu | Mã | Vai trò hiện tại |
|---|---|---|
| Navy | `#111742` | Nền/chrome chính và text đậm trong UI. |
| Turquoise | `#44D4CD` | Tương tác, completion và accent mát. |
| Violet | `#8951C7` | Accent hỗ trợ. |
| Muted Coral | `#D9776A` | Accent ấm, tiết chế. |
| Deep Purple | `#65458A` | Màu nhận diện của wordmark/tick; tối hơn violet nhưng tách biệt với navy. |

Trắng, xám và đen là neutral, không tính vào năm màu chromatic.

## Asset

- `spark-logo-primary.png`: PNG RGBA 2048×768, nền trong suốt.
- `spark-logo-primary.svg`: SVG path 2048×768, nền trong suốt; không nhúng bitmap.
- `spark-logo-negative.png`: PNG RGBA 2048×768, toàn bộ logo trắng trên nền trong suốt.
- `spark-logo-negative.svg`: SVG colorway trắng cho background tối.
- App icon đã được triển khai ở 32, 180, 192 và 512px; bước production tiếp theo là kiểm tra thêm favicon 16px và bản monochrome tối.
- Không thay icon check-burst thành star; ba tia luôn là ba rounded bar tách rời.
- Tick dùng stroke 57 đơn vị trong viewBox 2048×768, tương đương khoảng 68% độ dày của bản logo ban đầu.
- Ba tia là ba capsule cùng kích thước 140×60 đơn vị, mỏng khoảng 82.5% so với tia ngang ban đầu; chỉ khác hướng xoay và màu.

## Web app assets

- `public/brand/spark-logo.svg` và `.png`: bản logo primary được phục vụ trực tiếp trong web app.
- `public/brand/spark-logo-negative.svg` và `.png`: bản negative dùng trên sidebar/background tối.
- `public/spark-mark.svg`: app mark standard trên nền neutral sáng.
- `public/spark-mark-maskable.svg`: app mark maskable với safe zone trên nền navy.
- `public/spark-mark-negative.svg`: app mark trắng nền trong suốt cho compact rail.
- `public/icons/spark-32.png`, `spark-192.png`, `spark-512.png`: favicon/PWA raster sizes.
- `public/icons/spark-apple-180.png`: Apple touch icon nền opaque.
- `public/icons/spark-maskable-512.png`: PWA maskable icon.

## Prompt/edit intent

Giữ nguyên bold lowercase wordmark `spark`, kerning và icon-left horizontal layout từ ảnh được chủ dự án chọn. Dùng check-burst đã tinh chỉnh với tick thanh và ba tia đồng kích thước; wordmark/tick cùng Deep Purple, tia ngang dùng Muted Coral, tia chéo dùng turquoise và tia dọc dùng violet. Không gradient, glow, shadow, mockup, 3D hoặc watermark.
