# Spark — Personal Tasks & Notes

Web app quản lý task và note cá nhân hằng ngày, ưu tiên tốc độ, sự yên tĩnh và cảm giác “mở ra là dùng được”. Sản phẩm lấy cảm hứng về mood từ Superlist và Things, nhưng không sao chép giao diện hoặc tính năng độc quyền.

## Trạng thái hiện tại

Ứng dụng MVP đang được triển khai bằng Next.js App Router + TypeScript. Website mở public; chế độ demo lưu cục bộ, còn dữ liệu cá nhân đồng bộ qua Supabase sau khi xác thực bằng email magic link.

Hướng UI đã chọn: **Option C — Compact Canvas**, dùng palette navy–turquoise–violet–Muted Coral–Deep Purple và sidebar đầy đủ có thể thu gọn thành compact rail.

Logo chính thức là lockup check-burst với wordmark `spark` lowercase bold; wordmark và dấu tick dùng Deep Purple `#65458A`, ba tia dùng turquoise `#44D4CD`, Muted Coral `#D9776A` và violet `#8951C7`.

Domain đích: **https://spark.thuanngo.com**.

## Chạy local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Để bật cloud sync, tạo Supabase project, chạy migration trong `supabase/migrations/202608190001_initial_schema.sql`, điền project URL và publishable key vào `.env.local`, rồi thêm `http://localhost:3000` và `https://spark.thuanngo.com` vào Auth redirect URLs. Không đưa service-role key xuống client.

## Tài liệu nguồn

- [Product brief](docs/PROJECT_BRIEF.md): mục tiêu, phạm vi MVP, hành vi và tiêu chí nghiệm thu.
- [UI directions](docs/UI_OPTIONS.md): ba phương án giao diện và quyết định đề xuất.
- [Implementation guide](docs/IMPLEMENTATION_GUIDE.md): kiến trúc, dữ liệu, lộ trình triển khai, publish và cài lên iPhone.
- [Decision log](docs/DECISIONS.md): quyết định đã chốt và các câu hỏi còn mở.
- [AGENTS.md](AGENTS.md): quy tắc bàn giao cho các phiên Codex tiếp theo.
- [Logo concepts](assets/logo-concepts/README.md): năm hướng nhận diện ban đầu cho Spark.
- [Official logo](assets/logo/README.md): logo chính thức, palette và quy tắc sử dụng hiện tại.

## Bước tiếp theo đề xuất

1. Xác nhận có cần đồng bộ dữ liệu giữa iPhone và máy tính ngay trong MVP hay không.
2. Phiên triển khai scaffold Next.js, dựng design tokens và màn hình tĩnh trước.
3. Sau khi duyệt giao diện, kết nối Supabase, kiểm thử và deploy bản PWA.
