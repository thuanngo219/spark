# Spark v3 — bàn giao hiện hành

Phím chuyển Danh mục hiện hành là F rồi 1–9 trong vòng 2 giây. Phím khác, đổi focus hoặc mở hộp thoại sẽ hủy chuỗi đang chờ.

Cập nhật 2026-11-25. Chỉ giữ quy tắc đang có hiệu lực. Lịch sử thay đổi tra Git và docs/DECISIONS.md; không dùng thông số cũ trong các mục lịch sử làm trạng thái hiện tại.

CTA chính chỉ dùng nền Navy #111742, chữ/icon trắng trên desktop và mobile; hover Turquoise #44D4CD, chữ/icon Navy. Áp dụng cho Thêm/Lưu/Tiếp tục sửa, nút thêm nổi/dock, primary icon, Hôm nay trong bộ chọn ngày và Hoàn tác trong toast. Disabled giữ Navy, giảm tương phản chữ trắng, không đổi màu hover. Hành động phụ (Hủy, Lưu trữ/Khôi phục, sửa/điều hướng phụ) dùng nền xám nhẹ #F1F2F5, hover #E4E6EC; dark mode dùng #30394E → #3B455B. Giữ semantic/selected và thao tác bỏ/xóa theo màu riêng. Desktop giữ chuyển màu 220ms và reduced motion.

## Production và kiểm chứng

- D-254: lint, typecheck, 176 test logic, build và 25 ca trình duyệt local đạt: CTA chính/phụ, hover 220ms, disabled, reduced motion, sáng/tối, quick-add và Danh mục ở 320/390/1280px, cùng xác nhận giữ/bỏ nháp. Kiểm tra dùng Chrome; native iPhone cần chủ dự án kiểm tra trực tiếp.

- Domain https://spark.thuanngo.com; Vercel project spark (`prj_mpTXdTL5cUsrpbT40lw7fmBt8NZM`), team Thuan Ngo (`team_CDEqBJfEqWiriY02pfrXzqMX`), nhánh main.
- Bản ứng dụng hiện hành: D-254 (2026-11-25), bảo vệ thay đổi chưa lưu. Đối chiếu SHA và alias của bản phát hành trên Vercel với commit triển khai, không dùng SHA cũ của D-239 làm trạng thái hiện tại.
- D-238: 9 ca kiểm tra production cho phím tắt, chuyển mục và bảng trợ giúp đều đạt. D-239: lint, typecheck, 176 test logic, build và 5 ca trình duyệt local đạt, gồm bộ chọn ở 390px. Ba ca kiểm tra production cho Tất cả, Chỉ ghi chú và Chỉ task đều đạt.
- Chủ dự án xác nhận bản sửa lỗi giật khi chuyển mục đã ổn ngày 2026-11-13.
- Chủ dự án xác nhận bản cập nhật nhãn và bộ chọn đã ổn ngày 2026-11-09.
- Chủ dự án xác nhận khoảng trống bàn phím trên iPhone đã ổn (16px mở/50px đóng), và xác nhận UI mới nhất “Ổn rồi” ngày2026-10-31. Đây là phản hồi thực tế của chủ dự án; agent chưa tự kiểm tra native iPhone. Pinch/system edge gesture cần xác nhận riêng trên máy thật.
- B-005 rà copy hoàn tất. Đợt kiểm tra độ tin cậy dữ liệu điện thoại/máy tính đã hoàn tất theo xác nhận chủ dự án ngày2026-10-31; [kết quả chi tiết](../DATA_RELIABILITY_CHECK.md). Không có bước nghiệm thu đang chờ.

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
| Ngày/danh mục chi tiết và quick-add; menu danh mục | 12px | 13px | 700 | 1.4 |
| Label/nút/nhóm/số đếm/metadata list/sort | 10px | 10px | 700, ALL CAPS | 1.4 |
| Nhãn dock | — | 10px | 700, ALL CAPS | 1.4 |

## Giao diện hiện hành

- Khi quick-add hoặc trình sửa tên/Nội dung có thay đổi chưa lưu, Hủy/X, đóng/quay lại, bấm nền desktop hoặc vuốt mép trái mobile phải hỏi xác nhận trước khi bỏ nháp. Từ chối thoát giữ nguyên chữ, định dạng và khả năng thao tác; đồng ý mới hủy. Quick-add theo dõi cả loại task/note, ngày và Danh mục. Escape trong editor chỉ hủy phần đang sửa sau xác nhận, không đóng tiếp màn chi tiết trong cùng lần nhấn. Không hỏi khi chưa thay đổi hoặc đã lưu thành công. Thay đổi metadata chi tiết vẫn tự lưu theo hành vi hiện hành.
- Dùng hộp thoại của Spark cho mọi thao tác bỏ nháp trong app, với hai nút “Tiếp tục sửa” và “Bỏ thay đổi”. Mặc định focus “Tiếp tục sửa”; Escape giữ bản nháp. Hộp thoại chặn thao tác nền và giữ focus bên trong, dùng màu/chữ theo theme. Khi vuốt mở xác nhận, màn phía sau trở về vị trí ban đầu và vẫn thao tác được nếu chọn tiếp tục. Không dùng window.confirm trong luồng này. Riêng tải lại/đóng tab vẫn dùng beforeunload và cảnh báo do trình duyệt kiểm soát.

Hộp thoại dùng tiêu đề “Nội dung chưa lưu?” và câu “Bạn có thay đổi chưa được lưu. Bạn có thật sự muốn thoát?”. Hai nút giữ nhãn “Tiếp tục sửa” và “Bỏ thay đổi”, thêm icon edit/log-out 17px trước chữ, cách 6px. Nút tiếp tục dùng CTA chính Navy/chữ trắng, hover Turquoise/chữ Navy; nút bỏ thay đổi dùng hover Coral/chữ trắng cùng nút thao tác nguy hiểm của hệ thống. Desktop giữ chuyển màu 220ms và focus bàn phím hiện hành. “Tiếp tục sửa” trong hộp thoại Nội dung chưa lưu dùng CTA chính: nền Navy/chữ trắng, hover Turquoise/chữ Navy; giữ icon edit, mặc định focus và hành vi giữ nháp. Lưu trữ/Khôi phục trong chỉnh sửa Danh mục và chi tiết ghi chú dùng hành động phụ nền xám nhẹ, hover xám đậm hơn/chữ chính. Giữ Yêu thích là nút trạng thái riêng.

- Chi tiết task/note có E để sửa nội dung, Shift + E để sửa tên. Desktop dùng nút hai mép hoặc ←/→ để đi theo thứ tự danh sách đã lọc lúc mở chi tiết. Dừng ở đầu/cuối và tạm ngưng chuyển mục khi sửa. Khung chi tiết và lớp khóa cuộn được giữ khi chuyển mục, nên hiệu ứng mở màn chỉ chạy lúc mở chi tiết. Nội dung mục mới bắt đầu từ đầu vùng cuộn.

- Font Inter 4.1 thường/nghiêng nhúng cùng origin; cỡ chữ px, weight400/700. Desktop/mobile: list14/15px, menu14/15px, support14/15px, metadata ngày/danh mục12/13px; Nội dung15px, tên chi tiết18px, tên quick-add16px, dialog24px cả hai. Label10px/700/uppercase. Heading desktop38–56px/mobile30px, compact19–28px/21px; line-height1.2/1.4/1.6 theo vai trò.
- Khoảng cách giữa các mục là 2px trên desktop và 0px trên mobile; nhãn–nội dung8px. Toolbar chi tiết desktop cao44px, dưới hàng nhãn8px, cách text15px; editor mobile giữ hàng nhãn–toolbar2px. Caption loading cách progress17px.
- Trên mobile, mục không có ngày bắt đầu và ngày đến hạn hiển thị các biểu tượng ở mép phải dòng tên và cao tối thiểu 38px. Mục có ít nhất một ngày giữ hàng thông tin bên dưới.
- Sidebar chỉ có sao ở hàng danh mục, không nút ... hoặc tiêu đề Cần lưu ý. Hover/selected phủ toàn hàng; sao có đệm phải8px. Desktop Tất cả/Quan Trọng liền nhau như item thường; icon giữ tọa độ khi expand/compact. Divider trước Đã lưu trữ mảnh1px, cách hàng danh mục trên10px.
- Nhãn danh mục trong danh sách desktop hiển thị đầy đủ một dòng, căn trái, chung chiều rộng theo tên dài nhất đang render, đo font thực sau fonts.ready; gap10px đến nội dung. Không cap35%/ellipsis; tên quá dài có thể cần cuộn ngang. Khi thu gọn dot căn giữa dọc item.
- Sửa danh mục: Yêu thích/Lưu trữ/Xóa một hàng pill, cách vòng màu10px. Hủy/Lưu hàng dưới; Hủy nền xám nhẹ, không nút X ở header. Có divider cách hai nút25px. Mobile toàn màn hình: đáy nút cách mép dưới50px khi bàn phím đóng,16px khi mở. Backdrop kín layout viewport; form theo visualViewport, khóa cuộn/inert nền và chặn overscroll ngoài form.
- Giao diện desktop và mobile dùng nhãn “Danh mục”, gồm bộ chọn, màn tạo/chỉnh sửa, lưu trữ, trợ giúp và nhãn hỗ trợ tiếp cận.
- Bộ chọn Danh mục trong chi tiết dùng menu mặc định của trình duyệt trên desktop và mobile, cùng cách hiển thị với quick-add.
- Focus input/select/textarea cả desktop/mobile chỉ đậm viền, không outline ngoài/đổi nền. Nút/link giữ focus bàn phím. Hover màu desktop220ms Quint; selected/disabled và semantic color giữ riêng; reduced motion có hỗ trợ.
- Mobile quick-add vuốt mép trái đủ ngưỡng sẽ yêu cầu xác nhận nếu có nháp, giống HỦY. Cấu hình pinch: maximumScale1/userScalablefalse và touch-action pan-x pan-y; trình duyệt có thể ưu tiên zoom trợ năng. Chi tiết vẫn vuốt mép trái để đóng.

Giữ các quy tắc mobile đã duyệt: GHI CHÚ, ← QUAY LẠI; touch44px mặc định, sort30px ngoại lệ; metadata chi tiết hai hàng, hai ngày chia đều; quick-add giữ tên và hàng nút cố định, Nội dung cuộn riêng, Phân loại phủ action. Theme sáng/tối/system, splash Navy/logo âm bản, header sticky blur8px/dải màu4px và phím tắt ngoài editor tiếp tục như mã hiện hành. Palette một Navy#111742, Turquoise#44D4CD, Amber#D6A84F, Coral#D9776A; artwork logo giữ nguyên.

## Phạm vi và nghiệm thu hiện tại

- Chủ dự án xác nhận đồng bộ/update dữ liệu tốt, chấp nhận hoàn tất đợt kiểm tra, gồm xác nhận khả năng bảo toàn hai phiên bản. Kết quả cụ thể và xác nhận chung các bước cuối được phân biệt trong [báo cáo kiểm tra](../DATA_RELIABILITY_CHECK.md).
- Không còn yêu cầu triển khai hoặc điểm cần trao đổi đang mở. Không tự triển khai cơ chế version/conflict, sao lưu/khôi phục hoặc đổi data model.
- Search không thuộc phạm vi hiện tại và không phải backlog/tính năng hoãn. Chỉ xem xét nếu chủ dự án yêu cầu mới.

## Phạm vi sản phẩm đang chạy

- Công cụ cá nhân, tiếng Việt, giao diện Compact Canvas. Task có checkbox và trạng thái hoàn thành; note dùng dấu gạch ngang, không có trạng thái hoàn thành. Cả hai có Tên, Nội Dung tùy chọn, ngày bắt đầu/đến hạn, danh mục, Quan Trọng và Ưu tiên độc lập.
- Checkbox task hiển thị 16 × 16px trong danh sách và chi tiết trên desktop lẫn mobile. Vùng chạm mobile tối thiểu 44px, riêng hàng không có ngày rộng 44px và cao 38px.
- Tên tối đa 100 ký tự. Nội Dung tối đa 4.000 Unicode code points, chỉ hỗ trợ đậm, nghiêng, gạch chân và phím tắt ⌘/Ctrl+B/I/U. Dữ liệu lưu là văn bản thuần cùng text runs `description_format`, không lưu HTML. Bullet/numbered list đã được gỡ.
- Ngày là date-only theo `Asia/Ho_Chi_Minh`, tuần bắt đầu Thứ Hai. Quick-add không tự đặt ngày bắt đầu, trừ task mới được tạo trong view Hôm nay. Ngày sai hoặc khoảng ngày ngược không được lưu. Hôm nay, Sắp tới, Theo ngày và Tất cả dùng quy tắc lọc/nhóm/sort trong Product Brief; filter Ẩn/Hiện note chỉ thay đổi hiển thị.
- Danh mục có sáu màu preset, màu tùy chọn, sao, thứ tự thủ công, lưu trữ/khôi phục/xóa. Violet đã được bỏ và project cũ dùng Violet được chuyển sang Amber; Deep Purple vẫn được giữ. Quan Trọng dùng Amber, Ưu tiên dùng Coral nhất quán ở danh sách và chi tiết.

## Dữ liệu, bảo mật và giới hạn

- Web public; chế độ local bắt đầu rỗng và lưu trên thiết bị. Cloud dùng Supabase Auth OTP email; project hạ tầng dùng chung `WorkSpace`, ref `ukoowtpqztknbrgpyqdx`, hai bảng `public.projects`/`public.items` có Row Level Security theo `user_id`.
- `src/lib/offline-storage.ts` giữ snapshot và mutation queue trong IndexedDB theo scope/user, fallback `localStorage` nếu cần. Với local data, bản snapshot chờ được ghi đồng bộ trước giao dịch IndexedDB để reload sát thao tác không mất dữ liệu. Service worker chỉ cache app shell/tài nguyên cùng origin, không cache phản hồi Supabase hay session.
- Cloud mutation ghi local trước, gửi tuần tự, retry và reconcile khi có mạng, Realtime hoặc app trở lại foreground. Không seed dữ liệu mẫu vào local/cloud khi khởi động; chỉ dọn bộ seed local cũ nếu nhận diện chắc chắn. Snapshot cloud rỗng không kéo dữ liệu demo lên cloud.
- Kết quả thực tế: chủ dự án xác nhận đợt kiểm tra hai thiết bị hoàn tất, gồm cold-start offline, đồng bộ hai chiều, hàng đợi, xóa và bảo toàn hai phiên bản. Agent không tự thao tác trên thiết bị/tài khoản thật. Giữ ghi chú kiến trúc: full-row upsert có thể last-write-wins; phản hồi nghiệm thu không bổ sung tính năng version history/merge vào mã. Không có lỗi mới được báo trong đợt kiểm tra.
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
