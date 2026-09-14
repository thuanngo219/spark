# Editor refinements — 2026-09-14

## Phạm vi

- Quick-add focus dùng màu control-hover. Nội dung trong detail giữ nền field khi nhập.
- Nút Sửa tên cạnh nhãn; viền nhập Tên nhẹ, không glow/shadow.
- Bullet/number list một cấp, hỗ trợ marks và xuống dòng mềm; khoảng cách 6px sau mỗi danh sách. Metadata text runs giữ tương thích nội dung cũ, không render HTML.
- Khung desktop edit Nội dung cao min(86dvh, 820px); editor lấp vùng còn lại. Quick-add 160px, mobile edit 40dvh.
- Header desktop blur 18px, WebKit prefix, nền canvas 80%; mobile dùng rule riêng.
- Chuyển trường tự lưu draft hợp lệ. Hủy bỏ draft hiện tại. Tên rỗng chặn chuyển.
- Ngày ngược không được lưu: UI báo lỗi và giữ draft, chỉ lưu cả hai ngày khi hợp lệ; có guard mutation/cloud và CHECK database.
- Next.js/eslint-config-next 16.3.5, sharp 0.35.4, js-yaml 4.3.2. npm audit: 0 vulnerabilities.

## Kiểm tra trước phát hành

- Lint, typecheck, 162 Vitest tests, production build Next.js 16.3.5: đạt.
- 7 Playwright tests trên production build local: đạt. Bao gồm B/I/U, undo/redo, danh sách qua reload, tự lưu khi đổi trường, ngày sai/đúng, 4.000/4.001 ký tự, 880px, màu focus, mobile 320/390px và offline cold-start.
- Đã xem ảnh desktop và mobile; icon danh sách dùng SVG để không xuống dòng trong nút desktop 32px.
- git diff --check: đạt.
- Migration `20260914091948_enforce_item_date_range.sql` đã áp dụng trên WorkSpace; items_date_range đã VALIDATE. Trước migration không có dữ liệu ngày ngược. Test TEMP table sao chép CHECK từ production: ngày ngược bị từ chối; null, cùng ngày và tăng dần được chấp nhận. Transaction rollback, không ghi fixture vào dữ liệu người dùng.

## Phát hành và giới hạn

Phát hành bằng Git integration của Vercel khi push main; URL https://spark.thuanngo.com. Xác minh READY, commit/alias và kiểm thử live sau push được báo trong phản hồi bàn giao.

Không có thay đổi policy/auth/shared schema ứng dụng khác. iPhone thật, IME và đồng bộ đồng thời hai tài khoản/thiết bị chưa được kiểm thử. output/ và outputs/ là artifact ngoài Spark, giữ nguyên ngoài commit.
