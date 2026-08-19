# AGENTS.md — Spark To-do List

## Bắt đầu mỗi phiên

Đọc theo thứ tự:

1. `README.md`
2. `docs/PROJECT_BRIEF.md`
3. `docs/UI_OPTIONS.md`
4. `docs/DECISIONS.md`
5. `docs/IMPLEMENTATION_GUIDE.md` nếu công việc liên quan kỹ thuật hoặc deploy

## Nguyên tắc sản phẩm

- Đây là công cụ cá nhân, không phải phần mềm quản trị nhóm.
- Một item trong MVP là `task` hoặc `note`; cả hai có tên, due date/project tùy chọn và cờ Quan Trọng/Urgent. Chỉ task có checkbox/trạng thái hoàn thành; note hiển thị bằng bullet point.
- Giữ thao tác thêm task nhanh; không mở form/modal dài khi chưa cần.
- Ưu tiên mobile-first, bàn phím trên desktop và vùng chạm tối thiểu 44px trên mobile.
- Không thêm priority ngoài hai cờ Quan Trọng/Urgent, tag, rich-text note, subtask, reminder, recurring task, AI hoặc collaboration nếu chưa được chủ dự án duyệt.
- Không sao chép asset, logo hoặc pixel-level UI của Superlist/Things. Chỉ sử dụng mood và nguyên tắc thiết kế làm tham khảo.
- Ngôn ngữ giao diện mặc định: tiếng Việt. Date logic mặc định: múi giờ `Asia/Ho_Chi_Minh`, tuần bắt đầu từ Thứ Hai.
- UI direction đã chốt: Compact Canvas với sidebar đầy đủ có thể thu gọn thành compact rail; không thay bằng top navigation nếu chưa được duyệt lại.
- Phím tắt filter phải hoạt động ngoài input/editor và không chặn thao tác nhập văn bản.

## Cách làm việc giữa các phiên

- Trước khi code, đối chiếu acceptance criteria trong product brief.
- Khi đưa ra quyết định ảnh hưởng đến scope, data model hoặc UX, cập nhật `docs/DECISIONS.md`.
- Khi thay đổi hành vi đã mô tả, cập nhật tài liệu cùng commit/thay đổi mã nguồn.
- Bảo toàn thay đổi đang có; không ghi đè phần chưa rõ nguồn gốc.
- Kiểm tra ít nhất: lint, typecheck, test logic ngày và responsive ở 390px trước khi bàn giao.
- Trong phần bàn giao, ghi rõ: đã làm gì, đã kiểm tra gì, còn thiếu gì và file nào thay đổi.

## Definition of done cho MVP

- Tạo, sửa, chọn ngày/project và xóa task/note hoạt động; task có thể hoàn thành, note không có checkbox.
- Quan Trọng và Urgent có thể bật độc lập trên task/note; các smart filter trả đúng nội dung.
- Các filter Hôm nay, Sắp tới và Theo ngày trả đúng dữ liệu theo quy tắc đã chốt.
- Sidebar có thể thu gọn/mở rộng, ghi nhớ lựa chọn; bộ phím tắt filter và bảng trợ giúp hoạt động bằng keyboard.
- Dữ liệu của người dùng được bảo vệ bằng xác thực và Row Level Security nếu dùng backend đồng bộ.
- App responsive, dùng tốt trên iPhone, có manifest/icon và chạy qua HTTPS.
- Empty, loading, error và offline/degraded states không làm mất dữ liệu nhập.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
