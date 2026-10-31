# Spark v3 — bàn giao hiện hành

Cập nhật 2026-10-31. Chỉ giữ quy tắc đang có hiệu lực. Lịch sử thay đổi tra Git và docs/DECISIONS.md; không dùng thông số cũ trong các mục lịch sử làm trạng thái hiện tại.

## Production và kiểm chứng

- Domain https://spark.thuanngo.com; Vercel project spark (`prj_mpTXdTL5cUsrpbT40lw7fmBt8NZM`), team Thuan Ngo (`team_CDEqBJfEqWiriY02pfrXzqMX`), nhánh main.
- Mã ứng dụng mới nhất: `8d8aca066b24c69d63bbf87cd891d0723a30aa01` (D-234), deployment `dpl_7qoa24PWnLhGD1ge3szR91wTPWkk` READY và alias đã xác minh ngày2026-10-31. Push tài liệu có thể tạo deployment mới với cùng mã app; xác minh SHA/alias khi tiếp tục.
- Lint, typecheck,176 unit test và build đã đạt cho bản mã mới nhất. Kiểm tra production gần nhất: divider cách hàng trên10px và icon giữ tọa độ ở sidebar expand/compact đạt. Các đợt trước đã kiểm tra typography/hover sáng-tối, nhãn dự án một dòng/cùng chiều rộng/dot căn giữa, dự án fullscreen/keyboard ở320/390/700/1280px theo từng bộ test; không coi đây là một lần chạy toàn bộ regression.
- Chủ dự án xác nhận khoảng trống bàn phím trên iPhone đã ổn (16px mở/50px đóng), và xác nhận UI mới nhất “Ổn rồi” ngày2026-10-31. Đây là phản hồi thực tế của chủ dự án; agent chưa tự kiểm tra native iPhone. Pinch/system edge gesture cần xác nhận riêng trên máy thật.
- B-005 rà copy hoàn tất. Search và kiểm tra độ tin cậy dữ liệu vẫn tạm hoãn.

## Typography hiện hành

Inter4.1 WOFF2 thường/nghiêng trong src/app/fonts/, next/font/local; root100%, font-size dùng px. Native option mobile có thể chịu cách render hệ thống.

| Thành phần | Desktop | Mobile | Weight | Line-height |
|---|---:|---:|---|---|
| Tiêu đề view | 38–56px | 30px | 700 | 1.2 |
| Tiêu đề view thu gọn | 19–28px | 21px | 700 | 1.2 |
| Tiêu đề dialog / Thêm task | 24px | 24px | 700 | 1.2 |
| Tên task/note chi tiết | 18px | 18px | 700 | 1.4 |
| Ô nhập tên quick-add | 16px | 16px | 400 | 1.4 |
| Tên task/note danh sách | 14px | 15px | 400 | 1.4 |
| Nội dung đọc/chỉnh sửa | 15px | 15px | 400; đậm700 | 1.6 |
| Menu/sidebar | 14px | 15px | 400 | 1.4 |
| Giải thích/lỗi/toast | 14px | 15px | 400 | 1.4; đoạn dài1.6 |
| Ngày/dự án chi tiết và quick-add; menu dự án | 12px | 13px | 700 | 1.4 |
| Label/nút/nhóm/số đếm/metadata list/sort | 10px | 10px | 700, ALL CAPS | 1.4 |
| Nhãn dock | — | 10px | 700, ALL CAPS | 1.4 |

## Giao diện hiện hành

- Font Inter 4.1 thường/nghiêng nhúng cùng origin; cỡ chữ px, weight400/700. Desktop/mobile: list14/15px, menu14/15px, support14/15px, metadata ngày/dự án12/13px; Nội dung15px, tên chi tiết18px, tên quick-add16px, dialog24px cả hai. Label10px/700/uppercase. Heading desktop38–56px/mobile30px, compact19–28px/21px; line-height1.2/1.4/1.6 theo vai trò.
- Gap item2px; nhãn–nội dung8px. Toolbar chi tiết desktop cao44px, dưới hàng nhãn8px, cách text15px; editor mobile giữ hàng nhãn–toolbar2px. Caption loading cách progress17px.
- Sidebar chỉ có sao ở hàng dự án, không nút ... hoặc tiêu đề Cần lưu ý. Hover/selected phủ toàn hàng; sao có đệm phải8px. Desktop Tất cả/Quan Trọng liền nhau như item thường; icon giữ tọa độ khi expand/compact. Divider trước Đã lưu trữ mảnh1px, cách hàng dự án trên10px.
- Nhãn dự án trong danh sách desktop hiển thị đầy đủ một dòng, căn trái, chung chiều rộng theo tên dài nhất đang render, đo font thực sau fonts.ready; gap10px đến nội dung. Không cap35%/ellipsis; tên quá dài có thể cần cuộn ngang. Khi thu gọn dot căn giữa dọc item.
- Sửa dự án: Yêu thích/Lưu trữ/Xóa một hàng pill, cách vòng màu10px. Hủy/Lưu hàng dưới; Hủy nền xám nhẹ, không nút X ở header. Có divider cách hai nút25px. Mobile toàn màn hình: đáy nút cách mép dưới50px khi bàn phím đóng,16px khi mở. Backdrop kín layout viewport; form theo visualViewport, khóa cuộn/inert nền và chặn overscroll ngoài form.
- Menu dự án chi tiết desktop là listbox của app: dòng tối thiểu44px, padding10px14px, gap4px, hỗ trợ keyboard; mobile native select.
- Focus input/select/textarea cả desktop/mobile chỉ đậm viền, không outline ngoài/đổi nền. Nút/link giữ focus bàn phím. Hover màu desktop220ms Quint; selected/disabled và semantic color giữ riêng; reduced motion có hỗ trợ.
- Mobile quick-add vuốt mép trái đủ ngưỡng sẽ hủy nháp như HỦY. Cấu hình pinch: maximumScale1/userScalablefalse và touch-action pan-x pan-y; trình duyệt có thể ưu tiên zoom trợ năng. Chi tiết vẫn vuốt mép trái để đóng.

Giữ các quy tắc mobile đã duyệt: GHI CHÚ, ← QUAY LẠI; touch44px mặc định, sort30px ngoại lệ; metadata chi tiết hai hàng, hai ngày chia đều; quick-add giữ tên và hàng nút cố định, Nội dung cuộn riêng, Phân loại phủ action. Theme sáng/tối/system, splash Navy/logo âm bản, header sticky blur8px/dải màu4px và phím tắt ngoài editor tiếp tục như mã hiện hành. Palette một Navy#111742, Turquoise#44D4CD, Amber#D6A84F, Coral#D9776A; artwork logo giữ nguyên.

## Phạm vi tiếp tục đã thống nhất

- Tạm hoãn tìm kiếm; chưa triển khai và không tự đưa lại vào scope.
- Kiểm tra độ tin cậy dữ liệu trên điện thoại/máy tính để lần tới. Chưa triển khai cơ chế version/conflict, sao lưu/khôi phục hoặc thay đổi data model trong đợt UI này.
- Các phép kiểm còn thiếu ở phần Dữ liệu bên dưới là bước cần làm trước khi sửa sâu đồng bộ. Chốt phạm vi thay đổi sau khi có kết quả; các đề xuất trước đây không phải yêu cầu đã được duyệt triển khai.

## Phạm vi sản phẩm đang chạy

- Công cụ cá nhân, tiếng Việt, giao diện Compact Canvas. Task có checkbox và trạng thái hoàn thành; note dùng dấu gạch ngang, không có trạng thái hoàn thành. Cả hai có Tên, Nội Dung tùy chọn, ngày bắt đầu/đến hạn, dự án, Quan Trọng và Ưu tiên độc lập.
- Tên tối đa 100 ký tự. Nội Dung tối đa 4.000 Unicode code points, chỉ hỗ trợ đậm, nghiêng, gạch chân và phím tắt ⌘/Ctrl+B/I/U. Dữ liệu lưu là văn bản thuần cùng text runs `description_format`, không lưu HTML. Bullet/numbered list đã được gỡ.
- Ngày là date-only theo `Asia/Ho_Chi_Minh`, tuần bắt đầu Thứ Hai. Quick-add không tự đặt ngày bắt đầu, trừ task mới được tạo trong view Hôm nay. Ngày sai hoặc khoảng ngày ngược không được lưu. Hôm nay, Sắp tới, Theo ngày và Tất cả dùng quy tắc lọc/nhóm/sort trong Product Brief; filter Ẩn/Hiện note chỉ thay đổi hiển thị.
- Dự án có sáu màu preset, màu tùy chọn, sao, thứ tự thủ công, lưu trữ/khôi phục/xóa. Violet đã được bỏ và project cũ dùng Violet được chuyển sang Amber; Deep Purple vẫn được giữ. Quan Trọng dùng Amber, Ưu tiên dùng Coral nhất quán ở danh sách và chi tiết.

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
| CSS | `src/app/globals.css` import chín file trong `src/app/styles/` theo thứ tự cascade; token mobile ở `responsive.css` |
| Test giao diện | `tests/browser/`; test logic cạnh module trong `src/lib/` |

## Quy trình tiếp tục

1. Đọc theo thứ tự trong `AGENTS.md`, sau đó đối chiếu quyết định mới với Product Brief và code. Khi phần ghi lịch sử trong tài liệu khác handoff này, kiểm tra quyết định mới nhất và mã đang chạy trước khi sửa.
2. Chạy `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`; kiểm tra responsive tối thiểu ở 390px. Dùng `SPARK_TEST_URL` để chạy Playwright trên bản build local hoặc domain production khi cần. Không chạy Impeccable hoặc bật hook của nó nếu chủ dự án không yêu cầu rõ.
3. Sau mỗi yêu cầu chỉnh sửa app, kiểm tra rồi tự deploy production theo yêu cầu chủ dự án, không chờ lệnh riêng. Git `main` được Vercel deploy tự động khi push. Sau push, xác minh deployment **READY**, commit SHA và alias `spark.thuanngo.com` trước khi báo đã phát hành. Không suy trạng thái production từ local build hoặc commit. Không đưa secret, `.env*`, `.vercel`, `.next`, test artifacts hay file ngoài Spark vào commit.
4. Với nút mobile nhỏ hơn 44px, kiểm tra cả click bên ngoài bề mặt và click trực tiếp checkbox. Giữ `isolation: isolate` trên nút/pill và `z-index: -1` của pseudo-element mở rộng vùng chạm để không che checkbox.
5. `masan-cos-showcase/` là repo riêng; `output/` và `outputs/` là dữ liệu ngoài Spark. Giữ nguyên và loại khỏi rà soát/commit Spark. Không xóa các thư mục này.

## Tài liệu cần đọc khi làm v3

- `README.md`: cách chạy, liên kết tài liệu và môi trường hiện tại.
- `brand-guideline.md`: màu, logo, typography, tone và icon; `assets/logo/README.md` cho asset chính thức.
- `docs/PROJECT_BRIEF.md`: acceptance criteria và quy tắc sản phẩm.
- `docs/UI_OPTIONS.md`: hướng Compact Canvas và lịch sử tinh chỉnh UI.
- `docs/DECISIONS.md`: quyết định có thứ tự; mục sau thay phần tương ứng của mục trước.
- `docs/IMPLEMENTATION_GUIDE.md` và `docs/OFFLINE_SYNC.md`: kiến trúc, dữ liệu, offline, kiểm tra và deploy.
