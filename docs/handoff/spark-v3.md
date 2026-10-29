# Spark v3 — bàn giao hiện hành

Cập nhật: 2026-10-28. Đây là điểm bắt đầu cho phiên phát triển v3. Handoff chỉ ghi trạng thái và quy tắc còn hiệu lực; lịch sử quyết định nằm trong Git và `docs/DECISIONS.md`. Hành vi sản phẩm chi tiết nằm trong `docs/PROJECT_BRIEF.md`, quy tắc thương hiệu trong `brand-guideline.md` và dữ liệu offline trong `docs/OFFLINE_SYNC.md`.

## Trạng thái bàn giao

- Production: `https://spark.thuanngo.com`, Vercel project `spark` của team Thuan Ngo. Bản mã được kiểm tra cho handoff là commit `eb842ef`; deployment từ commit tài liệu tiếp theo `09f2053bd29497b29c133045ef8e0ffa5c7172a1` đã **READY** với alias production trước khi lập handoff. Khi đọc lại tài liệu, luôn kiểm tra deployment mới nhất vì push tài liệu cũng có thể tạo deployment khác.
- Chủ dự án xác nhận ngày 2026-10-28 rằng bản mới nhất hoạt động tốt trên iPhone. Đây là xác nhận sử dụng thực tế từ chủ dự án; không suy thành kết quả kiểm thử độc lập cho từng thao tác, cold-start offline hoặc đồng bộ hai thiết bị.
- Lượt kiểm tra của bản refactor: lint, typecheck, 176 unit test và production build đạt; 125 browser case đạt, 2 case bỏ qua theo cấu hình. Trên production đã chạy 4 smoke case cho commit mã và 2 smoke case sau commit tài liệu. Lượt handoff này chạy lại lint, typecheck, 176 unit test và một browser case header ở 390px trên production; tất cả đạt.
- B-005 (rà toàn bộ copy) được chủ dự án xác nhận hoàn tất. Không còn backlog sản phẩm đã duyệt đang chờ trong `docs/BACKLOG.md` tại thời điểm bàn giao.

## Phạm vi sản phẩm đang chạy

- Công cụ cá nhân, tiếng Việt, giao diện Compact Canvas. Task có checkbox và trạng thái hoàn thành; note dùng dấu gạch ngang, không có trạng thái hoàn thành. Cả hai có Tên, Nội Dung tùy chọn, ngày bắt đầu/đến hạn, dự án, Quan Trọng và Ưu tiên độc lập.
- Tên tối đa 100 ký tự. Nội Dung tối đa 4.000 Unicode code points, chỉ hỗ trợ đậm, nghiêng, gạch chân và phím tắt ⌘/Ctrl+B/I/U. Dữ liệu lưu là văn bản thuần cùng text runs `description_format`, không lưu HTML. Bullet/numbered list đã được gỡ.
- Ngày là date-only theo `Asia/Ho_Chi_Minh`, tuần bắt đầu Thứ Hai. Quick-add không tự đặt ngày bắt đầu, trừ task mới được tạo trong view Hôm nay. Ngày sai hoặc khoảng ngày ngược không được lưu. Hôm nay, Sắp tới, Theo ngày và Tất cả dùng quy tắc lọc/nhóm/sort trong Product Brief; filter Ẩn/Hiện note chỉ thay đổi hiển thị.
- Dự án có sáu màu preset, màu tùy chọn, sao, thứ tự thủ công, lưu trữ/khôi phục/xóa. Violet đã được bỏ và project cũ dùng Violet được chuyển sang Amber; Deep Purple vẫn được giữ. Quan Trọng dùng Amber, Ưu tiên dùng Coral nhất quán ở danh sách và chi tiết.

## Giao diện hiện hành

- Desktop có sidebar mở rộng/compact rail; mobile có drawer và dock năm vị trí. Mobile quick-add và chi tiết là màn hình toàn phần. Desktop chi tiết cũng toàn màn hình, cột nội dung cùng chiều rộng canvas danh sách; quick-add ở giữa màn hình. Các màn Phím tắt và Đồng bộ toàn màn hình.
- Mobile quick-add giữ Tên và hàng Ghi chú/Nội Dung/Phân Loại đứng yên; chỉ phần xem trước Nội Dung dài cuộn. Phân Loại mở sheet từ dưới, chứa ngày bắt đầu, ngày đến hạn và dự án, phủ Hủy/Thêm. Sửa Nội Dung mở editor tập trung, khóa cuộn nền và xử lý bàn phím bằng `visualViewport`. Sau khi Thêm thành công, đóng quick-add và trở về view trước đó.
- Chi tiết mobile cho vuốt từ mép trái để đóng. Nút Đóng Navy có chữ, nằm trên vùng Nội Dung; Nội Dung vẫn cuộn bên dưới. Sửa Tên/Nội Dung có tick lưu và X hủy. Metadata neo dưới màn hình; khi sửa và bàn phím hiện, phần dưới có thể nằm sau bàn phím để dành diện tích nhập.
- Header sticky thu gọn khi cuộn, giữ h1 và dải màu 4px ở cả desktop/mobile; mobile h1 thường 30px, thu gọn 21px. Letter spacing −0.025em. Header blur 8px; nền app phẳng. Focus bàn phím có viền 2px theo theme; bề mặt nhập Tên/Nội Dung không có outline. Header dùng animation CSS hiện hành. Chưa có phép đo hiệu năng trên iPhone vật lý.
- Light/dark/system theme được ghi nhớ theo thiết bị. Vùng iOS status bar lấy màu theo theme khi mở lại/reveal; splash Navy có logo âm bản ở giữa, progress trên mép trên và reveal sang phải. Sidebar mobile dùng lớp phủ trong suốt, không blur. Giữ reduced-motion behavior.
- Phím tắt điều hướng/filter chỉ hoạt động ngoài input và editor. Bảng Phím tắt trong app là nguồn tham khảo thao tác; handler tập trung ở `src/lib/keyboard-shortcuts.ts`.

## Dữ liệu, bảo mật và giới hạn

- Web public; chế độ local bắt đầu rỗng và lưu trên thiết bị. Cloud dùng Supabase Auth OTP email; project hạ tầng dùng chung `WorkSpace`, ref `ukoowtpqztknbrgpyqdx`, hai bảng `public.projects`/`public.items` có Row Level Security theo `user_id`.
- `src/lib/offline-storage.ts` giữ snapshot và mutation queue trong IndexedDB theo scope/user, fallback `localStorage` nếu cần. Với local data, bản snapshot chờ được ghi đồng bộ trước giao dịch IndexedDB để reload sát thao tác không mất dữ liệu. Service worker chỉ cache app shell/tài nguyên cùng origin, không cache phản hồi Supabase hay session.
- Cloud mutation ghi local trước, gửi tuần tự, retry và reconcile khi có mạng, Realtime hoặc app trở lại foreground. Không seed dữ liệu mẫu vào local/cloud khi khởi động; chỉ dọn bộ seed local cũ nếu nhận diện chắc chắn. Snapshot cloud rỗng không kéo dữ liệu demo lên cloud.
- Giới hạn còn tồn tại: full-row upsert có thể last-write-wins nếu hai thiết bị sửa offline cùng một item. Chưa tái kiểm độc lập trong lượt bàn giao này: cold-start offline trên iPhone, sync giữa hai thiết bị thật và cách ly tài khoản A/B với session thật. Đây là các phép kiểm cần chạy trước khi thay đổi sâu phần đồng bộ; không ghi chúng là lỗi đã phát hiện.
- WorkSpace dùng chung nhiều app. Trước migration Spark phải xem `migration list`; không dùng `db push --include-all`, không repair history hoặc sửa shared auth hook của app khác để giải quyết việc riêng Spark.

## Bản đồ mã nguồn

| Khu vực | File chính |
|---|---|
| Điều phối view và hành động | `src/components/SparkApp.tsx` |
| Khởi động, auth, cache, cloud sync | `src/components/spark/useSparkData.ts` |
| Sidebar, danh sách, quick-add, chi tiết, dialog | `src/components/spark/SparkSidebar.tsx`, `SparkItemList.tsx`, `SparkQuickAdd.tsx`, `SparkItemEditor.tsx`, `SparkDialogs.tsx` |
| Editor, format và link an toàn | `src/components/ContentEditor.tsx`, `FormattedContent.tsx`, `src/lib/content-format.ts`, `linkify.ts` |
| Date/filter/sort và phím tắt | `src/lib/dates.ts`, `task-filters.ts`, `keyboard-shortcuts.ts` |
| Offline và cloud | `src/lib/offline-storage.ts`, `cloud-data.ts`, `cloud-sync.ts`, `supabase.ts` |
| CSS | `src/app/globals.css` import chín file trong `src/app/styles/` theo thứ tự cascade |
| Test giao diện | `tests/browser/`; test logic cạnh module trong `src/lib/` |

## Quy trình tiếp tục

1. Đọc theo thứ tự trong `AGENTS.md`, sau đó đối chiếu quyết định mới với Product Brief và code. Khi phần ghi lịch sử trong tài liệu khác handoff này, kiểm tra quyết định mới nhất và mã đang chạy trước khi sửa.
2. Chạy `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`; kiểm tra responsive tối thiểu ở 390px. Dùng `SPARK_TEST_URL` để chạy Playwright trên bản build local hoặc domain production khi cần. Không chạy Impeccable hoặc bật hook của nó nếu chủ dự án không yêu cầu rõ.
3. Git `main` được Vercel deploy tự động khi push. Sau push, xác minh deployment **READY**, commit SHA và alias `spark.thuanngo.com` trước khi báo đã phát hành. Không suy trạng thái production từ local build hoặc commit. Không đưa secret, `.env*`, `.vercel`, `.next`, test artifacts hay file ngoài Spark vào commit.
4. `masan-cos-showcase/` là repo riêng; `output/` và `outputs/` là dữ liệu ngoài Spark. Giữ nguyên và loại khỏi rà soát/commit Spark. Không xóa các thư mục này.

## Tài liệu cần đọc khi làm v3

- `README.md`: cách chạy, liên kết tài liệu và môi trường hiện tại.
- `brand-guideline.md`: màu, logo, typography, tone và icon; `assets/logo/README.md` cho asset chính thức.
- `docs/PROJECT_BRIEF.md`: acceptance criteria và quy tắc sản phẩm.
- `docs/UI_OPTIONS.md`: hướng Compact Canvas và lịch sử tinh chỉnh UI.
- `docs/DECISIONS.md`: quyết định có thứ tự; mục sau thay phần tương ứng của mục trước.
- `docs/IMPLEMENTATION_GUIDE.md` và `docs/OFFLINE_SYNC.md`: kiến trúc, dữ liệu, offline, kiểm tra và deploy.

## Cập nhật D-203 — đã phát hành

- D-203 (2026-10-29): mobile đổi nút Đóng thành ← QUAY LẠI; nền xám nhẹ cho X hủy sửa Nội Dung; viết hoa các nhãn/nút quick-add bao gồm GHI CHÚ. Desktop và hành vi giữ nguyên.
- Kiểm tra local D-203: lint, typecheck, 176 unit test, production build đạt; 10 browser case chi tiết/khóa cuộn đạt. Kiểm tra trực quan mobile 390px và desktop 1280px ở cả hai theme; chưa kiểm tra iPhone vật lý.
- Bản chuẩn bị phát hành đã sửa nhãn thành GHI CHÚ theo xác nhận của chủ dự án; lint, typecheck, 176 unit test và build chạy lại đều đạt.

D-203 đã phát hành commit `0646ecb`, deployment `dpl_2VYqXpxZ7FuteoDrDzuwKRoj8dtJ` READY, alias `spark.thuanngo.com`; bốn smoke case production 390/1280px light/dark đạt.

## D-204 — đã kiểm tra local, được duyệt phát hành

Nhãn mobile thống nhất 10px bằng token `--ui-label-size`; xem D-204 trong decision log để biết phạm vi. Giữ nguyên desktop, nội dung và vùng chạm.

Kiểm tra D-204: lint, typecheck, 176 unit test và build đạt. Năm browser case header/quick-add ở 390px đạt. Đã đo computed font-size 10px cho các nhãn hiển thị qua quick-add, phân loại, chi tiết, sidebar, phím tắt và đồng bộ ở 320/390px, light/dark; đối chiếu desktop 1280px giữ cỡ chữ cũ. Chưa kiểm tra iPhone vật lý hoặc phát hành D-204.

Chủ dự án đã yêu cầu phát hành D-204. Sau push cần xác minh deployment READY, commit và alias production, rồi kiểm tra font-size trên domain chính.
