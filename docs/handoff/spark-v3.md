# Spark v3 — bàn giao hiện hành

Cập nhật: 2026-10-29. Đây là điểm bắt đầu cho phiên phát triển v3. Handoff chỉ ghi trạng thái và quy tắc còn hiệu lực; lịch sử quyết định nằm trong Git và `docs/DECISIONS.md`. Hành vi sản phẩm chi tiết nằm trong `docs/PROJECT_BRIEF.md`, quy tắc thương hiệu trong `brand-guideline.md` và dữ liệu offline trong `docs/OFFLINE_SYNC.md`.

## Trạng thái bàn giao

- Production: `https://spark.thuanngo.com`, Vercel project `spark` của team Thuan Ngo. Trước commit tài liệu của lượt bàn giao này, đã xác minh trực tiếp alias trỏ tới deployment **READY** `dpl_AQhdPdsQ4VPXutwgjAYKehMS4Xu1`, commit mã `b91643c96fb001c8422115300e47900b5f78b437`. Đây là bản đã phát hành toàn bộ D-203–D-207. Push tài liệu có thể tạo deployment mới với cùng mã ứng dụng; luôn kiểm tra SHA và alias khi tiếp tục.
- Chủ dự án xác nhận “Ổn rồi” ngày 2026-10-29 sau lượt chỉnh toolbar 2px và yêu cầu cập nhật handoff. Chủ dự án dùng Spark trên cả điện thoại và máy tính, cần kiểm tra UI qua production trên điện thoại. Xác nhận này không thay cho kiểm thử độc lập offline, đồng bộ hoặc iPhone vật lý.
- Kiểm tra trước phát hành `b91643c`: lint, typecheck, **176 unit test**, production build và **7 browser case ở 390px** đều đạt; các case bao gồm task/note, light/dark, quick-add và editor chi tiết, đo toolbar cách hàng nhãn **2px**.
- Sau phát hành: **4 smoke scenario production** ở 390px/1280px × light/dark đạt. Đã kiểm tra nhãn mobile 10px, khoảng cách form 8px, toolbar 2px ở hai editor, các nút quick-add 40px với vùng chạm 44px, checkbox nhận click, focus form không outline ngoài/không đổi nền và desktop giữ nguyên. Đây là kiểm tra trình duyệt mô phỏng viewport; chưa phải phép kiểm trên iPhone vật lý.
- B-005 (rà toàn bộ copy) đã hoàn tất theo xác nhận của chủ dự án. Các thay đổi mobile đã được chấp thuận; không còn hạng mục code đã duyệt đang chờ trong lượt bàn giao này.

## Phạm vi tiếp tục đã thống nhất

- Tạm hoãn tìm kiếm; chưa triển khai và không tự đưa lại vào scope.
- Kiểm tra độ tin cậy dữ liệu trên điện thoại/máy tính để lần tới. Chưa triển khai cơ chế version/conflict, sao lưu/khôi phục hoặc thay đổi data model trong đợt UI này.
- Các phép kiểm còn thiếu ở phần Dữ liệu bên dưới là bước cần làm trước khi sửa sâu đồng bộ. Chốt phạm vi thay đổi sau khi có kết quả; các đề xuất trước đây không phải yêu cầu đã được duyệt triển khai.

## Phạm vi sản phẩm đang chạy

- Công cụ cá nhân, tiếng Việt, giao diện Compact Canvas. Task có checkbox và trạng thái hoàn thành; note dùng dấu gạch ngang, không có trạng thái hoàn thành. Cả hai có Tên, Nội Dung tùy chọn, ngày bắt đầu/đến hạn, dự án, Quan Trọng và Ưu tiên độc lập.
- Tên tối đa 100 ký tự. Nội Dung tối đa 4.000 Unicode code points, chỉ hỗ trợ đậm, nghiêng, gạch chân và phím tắt ⌘/Ctrl+B/I/U. Dữ liệu lưu là văn bản thuần cùng text runs `description_format`, không lưu HTML. Bullet/numbered list đã được gỡ.
- Ngày là date-only theo `Asia/Ho_Chi_Minh`, tuần bắt đầu Thứ Hai. Quick-add không tự đặt ngày bắt đầu, trừ task mới được tạo trong view Hôm nay. Ngày sai hoặc khoảng ngày ngược không được lưu. Hôm nay, Sắp tới, Theo ngày và Tất cả dùng quy tắc lọc/nhóm/sort trong Product Brief; filter Ẩn/Hiện note chỉ thay đổi hiển thị.
- Dự án có sáu màu preset, màu tùy chọn, sao, thứ tự thủ công, lưu trữ/khôi phục/xóa. Violet đã được bỏ và project cũ dùng Violet được chuyển sang Amber; Deep Purple vẫn được giữ. Quan Trọng dùng Amber, Ưu tiên dùng Coral nhất quán ở danh sách và chi tiết.

## Giao diện hiện hành

- Desktop có sidebar mở rộng/compact rail; mobile có drawer và dock năm vị trí. Mobile quick-add và chi tiết là màn hình toàn phần. Desktop chi tiết cũng toàn màn hình, cột nội dung cùng chiều rộng canvas danh sách; quick-add ở giữa màn hình. Các màn Phím tắt và Đồng bộ toàn màn hình.
- Mobile quick-add giữ Tên và hàng GHI CHÚ/NỘI DUNG/PHÂN LOẠI đứng yên; chỉ phần xem trước Nội Dung dài cuộn. Phân Loại mở sheet từ dưới, chứa ngày bắt đầu, ngày đến hạn và dự án, phủ Hủy/Thêm. Sửa Nội Dung mở editor tập trung, khóa cuộn nền và xử lý bàn phím bằng `visualViewport`. Sau khi Thêm thành công, đóng quick-add và trở về view trước đó.
- Chi tiết mobile cho vuốt từ mép trái để đóng. Nút Navy “← QUAY LẠI” nằm trên vùng Nội Dung, cách metadata 10px; Nội Dung vẫn cuộn bên dưới. Sửa Tên/Nội Dung có tick lưu và X hủy. Metadata neo dưới màn hình; khi sửa và bàn phím hiện, phần dưới có thể nằm sau bàn phím để dành diện tích nhập.
- Header sticky thu gọn khi cuộn, giữ h1 và dải màu 4px ở cả desktop/mobile; mobile h1 thường 30px, thu gọn 21px. Letter spacing −0.025em. Header blur 8px; nền app phẳng. Nút/link giữ viền focus bàn phím 2px theo theme; mobile input/select/textarea không có outline ngoài, form đổi viền 1px đậm hơn khi focus và không đổi nền. Bề mặt sửa Tên/Nội Dung inline không có outline. Header dùng animation CSS hiện hành. Chưa có phép đo hiệu năng trên iPhone vật lý.
- Mobile dưới 700px dùng label **10px** thực, không nhân root scale 120%: nhãn trường/nút, điều hướng, nhóm danh sách/sort, metadata danh sách, trạng thái và nhãn tiện ích. Heading, tên/nội dung task/note và giá trị ô nhập giữ cỡ chữ hiện hành; desktop giữ fallback cũ.
- Khoảng cách nhãn–nội dung **8px**. Khi sửa Nội Dung, khoảng cách từ **mép dưới hàng nhãn** đến thanh formatting là **2px** trong cả quick-add và chi tiết; toolbar vẫn cao 44px. Không đo từ đáy nét chữ của label.
- Nút chữ/pill giảm phần hiển thị khoảng 4px: các pill quick-add, HỦY/THÊM, QUAY LẠI và trạng thái đồng bộ cao 40px; vùng chạm vẫn tối thiểu 44px qua pseudo-element. Giữ dock, nút icon và ngoại lệ sort 30px. Nút X hủy sửa Nội Dung ở hai editor dùng nền xám nhẹ theo theme.
- Mobile quick-add viết hoa TÊN CÔNG VIỆC/TÊN GHI CHÚ, GHI CHÚ, NỘI DUNG, PHÂN LOẠI, NGÀY BẮT ĐẦU, NGÀY ĐẾN HẠN, HỦY và THÊM. GHI CHÚ là nhãn chính xác.
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
| CSS | `src/app/globals.css` import chín file trong `src/app/styles/` theo thứ tự cascade; token mobile ở `responsive.css` |
| Test giao diện | `tests/browser/`; test logic cạnh module trong `src/lib/` |

## Quy trình tiếp tục

1. Đọc theo thứ tự trong `AGENTS.md`, sau đó đối chiếu quyết định mới với Product Brief và code. Khi phần ghi lịch sử trong tài liệu khác handoff này, kiểm tra quyết định mới nhất và mã đang chạy trước khi sửa.
2. Chạy `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`; kiểm tra responsive tối thiểu ở 390px. Dùng `SPARK_TEST_URL` để chạy Playwright trên bản build local hoặc domain production khi cần. Không chạy Impeccable hoặc bật hook của nó nếu chủ dự án không yêu cầu rõ.
3. Git `main` được Vercel deploy tự động khi push. Sau push, xác minh deployment **READY**, commit SHA và alias `spark.thuanngo.com` trước khi báo đã phát hành. Không suy trạng thái production từ local build hoặc commit. Không đưa secret, `.env*`, `.vercel`, `.next`, test artifacts hay file ngoài Spark vào commit.
4. Với nút mobile nhỏ hơn 44px, kiểm tra cả click bên ngoài bề mặt và click trực tiếp checkbox. Giữ `isolation: isolate` trên nút/pill và `z-index: -1` của pseudo-element mở rộng vùng chạm để không che checkbox.
5. `masan-cos-showcase/` là repo riêng; `output/` và `outputs/` là dữ liệu ngoài Spark. Giữ nguyên và loại khỏi rà soát/commit Spark. Không xóa các thư mục này.

## Tài liệu cần đọc khi làm v3

- `README.md`: cách chạy, liên kết tài liệu và môi trường hiện tại.
- `brand-guideline.md`: màu, logo, typography, tone và icon; `assets/logo/README.md` cho asset chính thức.
- `docs/PROJECT_BRIEF.md`: acceptance criteria và quy tắc sản phẩm.
- `docs/UI_OPTIONS.md`: hướng Compact Canvas và lịch sử tinh chỉnh UI.
- `docs/DECISIONS.md`: quyết định có thứ tự; mục sau thay phần tương ứng của mục trước.
- `docs/IMPLEMENTATION_GUIDE.md` và `docs/OFFLINE_SYNC.md`: kiến trúc, dữ liệu, offline, kiểm tra và deploy.
