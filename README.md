# Spark — Personal Tasks & Notes

Web app quản lý task và note cá nhân hằng ngày, ưu tiên tốc độ, sự yên tĩnh và cảm giác “mở ra là dùng được”. Sản phẩm lấy cảm hứng về mood từ Superlist và Things, nhưng không sao chép giao diện hoặc tính năng độc quyền.

## Trạng thái hiện tại

Ứng dụng MVP được triển khai bằng Next.js App Router + TypeScript. Website mở public; chế độ demo lưu cục bộ, còn dữ liệu cá nhân đồng bộ qua Supabase sau khi xác thực bằng mã OTP gửi qua email. Bản production hỗ trợ cold-start offline sau lần mở online đầu tiên; snapshot và mutation queue lưu trong IndexedDB rồi tự đồng bộ khi có mạng.

Hướng UI đã chọn: **Option C — Compact Canvas**, dùng palette navy–turquoise–violet–Muted Coral–Deep Purple và sidebar đầy đủ có thể thu gọn thành compact rail.

Logo chính thức là lockup check-burst với wordmark `spark` lowercase bold; wordmark và dấu tick dùng Deep Purple `#65458A`, ba tia dùng turquoise `#44D4CD`, Muted Coral `#D9776A` và violet `#8951C7`.

Domain đích: **https://spark.thuanngo.com**.

Vercel owner: team **Thuan Ngo** tại [vercel.com/thuanngo](https://vercel.com/thuanngo). Liên kết local trong `.vercel/repo.json` dùng team ID ổn định nên không phụ thuộc vào việc đổi tên hoặc URL slug của team.

Supabase production nằm trong project hạ tầng dùng chung **WorkSpace**, giữ nguyên project ref `ukoowtpqztknbrgpyqdx`. Spark hiện tiếp tục dùng `public.projects` và `public.items`; việc đổi display name của Supabase project không thay đổi URL, API keys, schema, bảng hoặc dữ liệu của ứng dụng.

## Chạy local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Để bật cloud sync ở môi trường mới, tạo Supabase project, chạy lần lượt toàn bộ migration trong `supabase/migrations/`, điền project URL và publishable key vào `.env.local`, rồi thêm `http://localhost:3000` và `https://spark.thuanngo.com` vào Auth redirect URLs. Không đưa service-role key xuống client.

## Tài liệu nguồn

- [Brand guideline](brand-guideline.md): nền tảng thương hiệu, logo, màu sắc, typography, voice, iconography và cách áp dụng.
- [Product brief](docs/PROJECT_BRIEF.md): mục tiêu, phạm vi MVP, hành vi và tiêu chí nghiệm thu.
- [UI directions](docs/UI_OPTIONS.md): ba phương án giao diện và quyết định đề xuất.
- [Implementation guide](docs/IMPLEMENTATION_GUIDE.md): kiến trúc, dữ liệu, lộ trình triển khai, publish và cài lên iPhone.
- [Offline và đồng bộ](docs/OFFLINE_SYNC.md): app-shell cache, IndexedDB, migration, mutation lifecycle và checklist kiểm thử.
- [Decision log](docs/DECISIONS.md): quyết định đã chốt và các câu hỏi còn mở.
- [Product backlog](docs/BACKLOG.md): ý tưởng đang cân nhắc, chưa phải hành vi hoặc phạm vi đã chốt.
- [AGENTS.md](AGENTS.md): quy tắc bàn giao cho các phiên Codex tiếp theo.
- [Logo concepts](assets/logo-concepts/README.md): năm hướng nhận diện ban đầu cho Spark.
- [Official logo](assets/logo/README.md): logo chính thức, palette và quy tắc sử dụng hiện tại.

## Bước tiếp theo đề xuất

1. Build và chạy bản production qua HTTPS, sau đó kiểm thử cold-start offline trên iPhone thật.
2. Chạy toàn bộ Supabase migration, xác nhận RLS và sync giữa hai thiết bị.
3. Sau giai đoạn dùng thật, bổ sung version/conflict detection trước khi mở rộng phạm vi người dùng.
