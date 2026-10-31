# Spark — Personal Tasks & Notes

Web app quản lý task và note cá nhân hằng ngày, ưu tiên tốc độ, sự yên tĩnh và cảm giác “mở ra là dùng được”. Sản phẩm lấy cảm hứng về mood từ Superlist và Things, nhưng không sao chép giao diện hoặc tính năng độc quyền.

## Trạng thái hiện tại

Ứng dụng MVP được triển khai bằng Next.js App Router + TypeScript. Nội dung task/note hỗ trợ tối đa 4.000 ký tự và định dạng đậm, nghiêng, gạch chân (⌘/Ctrl+B/I/U). Task/note hỗ trợ ngày bắt đầu và ngày đến hạn độc lập, các khu thời gian có thể sắp xếp riêng và ghi nhớ theo browser. Website mở public; chế độ local bắt đầu rỗng và lưu cục bộ, còn dữ liệu cá nhân đồng bộ qua Supabase sau khi xác thực bằng mã OTP gửi qua email. Bản production hỗ trợ cold-start offline sau lần mở online đầu tiên; snapshot và mutation queue lưu trong IndexedDB rồi tự đồng bộ khi có mạng.

Hướng UI đã chọn: **Option C — Compact Canvas**, dùng Navy, Turquoise, Amber, Coral và Deep Purple; sidebar đầy đủ có thể thu gọn thành compact rail. Violet đã được bỏ khỏi màu dự án và giao diện.

Logo chính thức và mọi icon app dùng biểu tượng tick/vòng tròn trắng trên badge gradient xanh–Navy do chủ dự án cung cấp. Wordmark `spark` giữ vector cũ: primary Deep Purple, negative trắng. D-134 áp dụng cho logo chính, sidebar desktop/mobile, compact rail, icon cài đặt và favicon; source/cách sinh asset ở [assets/logo/README.md](assets/logo/README.md).

Production: **https://spark.thuanngo.com**. Trạng thái đến D-234 ngày2026-10-31: typography px, nhãn dự án đầy đủ một dòng/căn trái/cùng chiều rộng, sidebar expand/compact giữ vị trí icon; form dự án mobile toàn màn hình và khoảng đáy16px khi mở bàn phím/50px khi đóng. Sau mỗi yêu cầu chỉnh sửa app, kiểm tra rồi deploy production và xác minh trực tiếp. Thông số đang có hiệu lực, bản phát hành và giới hạn kiểm chứng ở [handoff v3](docs/handoff/spark-v3.md).

Vercel owner: team **Thuan Ngo** tại [vercel.com/thuanngo](https://vercel.com/thuanngo). Liên kết local trong `.vercel/repo.json` dùng team ID ổn định nên không phụ thuộc vào việc đổi tên hoặc URL slug của team.

Supabase production nằm trong project hạ tầng dùng chung **WorkSpace**, giữ nguyên project ref `ukoowtpqztknbrgpyqdx`. Spark hiện tiếp tục dùng `public.projects` và `public.items`; việc đổi display name của Supabase project không thay đổi URL, API keys, schema, bảng hoặc dữ liệu của ứng dụng.

## Giao diện sáng/tối

Chọn THEO HỆ THỐNG / SÁNG / TỐI tại **Phím tắt & hiển thị → Giao diện**, ghi nhớ riêng thiết bị. Handoff v3 ghi trạng thái giao diện đang chạy; quyết định D-138–D-143 trong decision log là lịch sử triển khai dark mode.

## Chạy local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Để bật cloud sync ở môi trường mới, tạo Supabase project, chạy lần lượt toàn bộ migration trong `supabase/migrations/`, điền project URL, publishable key và `NEXT_PUBLIC_SPARK_AUTH_REDIRECT_ORIGIN=http://localhost:3000` vào `.env.local`, rồi thêm `http://localhost:3000` và `https://spark.thuanngo.com` vào Auth redirect URLs. Production/Preview dùng origin chính xác `https://spark.thuanngo.com`. Không đưa service-role key xuống client.

## Tài liệu nguồn

- [Brand guideline](brand-guideline.md): nền tảng thương hiệu, logo, màu sắc, typography, voice, iconography và cách áp dụng.
- [Product brief](docs/PROJECT_BRIEF.md): mục tiêu, phạm vi MVP, hành vi và tiêu chí nghiệm thu.
- [UI directions](docs/UI_OPTIONS.md): ba phương án giao diện và quyết định đề xuất.
- [Implementation guide](docs/IMPLEMENTATION_GUIDE.md): kiến trúc, dữ liệu, lộ trình triển khai, publish và cài lên iPhone.
- [Offline và đồng bộ](docs/OFFLINE_SYNC.md): app-shell cache, IndexedDB, migration, mutation lifecycle và checklist kiểm thử.
- [Decision log](docs/DECISIONS.md): lịch sử quyết định; quyết định mới thay phần tương ứng của quyết định cũ.
- [Handoff hiện hành](docs/handoff/spark-v3.md): trạng thái production, quy tắc còn hiệu lực, bản đồ mã nguồn và những phép kiểm chưa thực hiện. Đọc trước khi tiếp tục ở chat mới.
- [Product backlog](docs/BACKLOG.md): ý tưởng đang cân nhắc, chưa phải hành vi hoặc phạm vi đã chốt.
- [AGENTS.md](AGENTS.md): quy tắc bàn giao cho các phiên Codex tiếp theo.
- [Logo concepts](assets/logo-concepts/README.md): năm hướng nhận diện ban đầu cho Spark.
- [Official logo](assets/logo/README.md): logo chính thức, palette và quy tắc sử dụng hiện tại.

## Phạm vi tiếp tục v3

- Tìm kiếm đang tạm hoãn; chưa có code tìm kiếm. Kiểm tra độ tin cậy dữ liệu để lần tới, chưa chốt triển khai cơ chế xử lý xung đột hoặc sao lưu.
- Kiểm tra riêng cold-start offline trên iPhone, sync hai thiết bị và cách ly hai tài khoản thật trước khi sửa sâu luồng dữ liệu. Handoff v3 phân biệt rõ những phép kiểm này với xác nhận dùng iPhone của chủ dự án.
- Nếu mở rộng phạm vi người dùng hoặc dùng offline đồng thời trên nhiều thiết bị, thiết kế version/conflict detection cho full-row upsert hiện tại trước khi triển khai.
