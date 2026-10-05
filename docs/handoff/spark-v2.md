# Spark v2 — bàn giao hiện hành

## Đang chờ duyệt — dark mode preview (D-138, 2026-10-05)

Preview code commit `e6d1728`, Vercel `dpl_B8sDFUj9xcQoFZwTrmtFZ6YzTJpT` READY; URL cố định `https://spark-o9r9k2bzb-thuanngo.vercel.app`, alias nhánh `https://spark-git-codex-spark-dark-mode-thuanngo.vercel.app`. Smoke test trên URL Vercel qua share link: Hôm nay tải đúng, chọn Tối và reload vẫn giữ, quick-add/Nội dung mobile hoạt động, không tràn ngang 390px, không có pageerror. Preview có Vercel Authentication; liên kết share tạm thời gửi riêng trong chat, không ghi token vào repo.

Nhánh `codex/spark-dark-mode` triển khai Theo hệ thống / Sáng / Tối tại Phím tắt & hiển thị, mặc định Theo hệ thống. Preference theo thiết bị/origin, không đồng bộ cloud. Áp dụng trước paint, đổi theo OS/cross-tab, sử dụng được khi offline hoặc storage preference bị chặn. Bảng màu trong brand guideline D-138; logo/project color, checked xám, header 8px/20px/5px và editor tối giản giữ nguyên.

Kiểm tra local: lint/typecheck/build đạt; 162 test logic đạt; 14 browser regression nội dung đạt, 2 regression icon và 7 test theme đạt sau sửa lỗi meta theme-color trùng. Kiểm tra 1280/390px, theme selector 320px, B/I/U, draft/metadata click, màu chữ chính/phụ đạt contrast tối thiểu 4.5:1 trên surface đã đo, lưu preference/reload/cross-tab, storage bị chặn và cold-start offline. Đã xem ảnh Hôm nay, quick-add và editor; chưa kiểm tra Safari/iPhone vật lý.

Bản này cần chủ dự án duyệt màu trên desktop/mobile trước khi đưa lên production. Production hiện vẫn ở `6fd45b2`; các release bên dưới là lịch sử đã phát hành. Chưa xác minh trên iPhone vật lý. Không sửa database/auth/sync và không đưa `output/`, `outputs/` không rõ nguồn gốc vào commit.


> Rà soát: 2026-10-05. Repo `/Users/dna.thuan/Codex/Projects/To-Do List`, branch `main`.
> Production: https://spark.thuanngo.com
> Đây là bản tổng hợp yêu cầu đang áp dụng; lịch sử thay đổi nằm trong `docs/DECISIONS.md`.

## Phạm vi rà soát và cách tiếp tục

Đã đối chiếu toàn bộ yêu cầu trực tiếp có trong chat này từ 14/09 đến 05/10/2026 với D-117–D-137, tài liệu và mã nguồn hiện có. Bao gồm sửa lỗi click chi tiết, kết quả kiểm thử/phát hành và các giới hạn chưa kiểm tra. Không khẳng định đã kiểm kê mọi chat khác hoặc lưu bản gốc các screenshot trong thư mục tạm; thông số và hành vi trong các ảnh của chat này đã được ghi thành yêu cầu bên dưới.

Đọc `AGENTS.md`, `README.md`, `brand-guideline.md`, `docs/PROJECT_BRIEF.md`, `docs/UI_OPTIONS.md`, `docs/DECISIONS.md`, `docs/IMPLEMENTATION_GUIDE.md` và handoff này trước khi code. Khi liên quan dữ liệu, đọc thêm `docs/OFFLINE_SYNC.md`. Repo không có `docs/architecture.md`; kiến trúc nằm trong implementation guide. Tên file quyết định chuẩn là `docs/DECISIONS.md`.

Spark là công cụ task/note cá nhân, tiếng Việt, Compact Canvas, sidebar full/compact rail; mobile dock/drawer. Không thêm collaboration, reminder, recurring, AI hoặc định dạng nâng cao chưa được duyệt. Vùng chạm mobile mặc định 44px; ngoại lệ đã duyệt là hai control sắp xếp cao 36px (D-131).

Có thể archive chat đã hoàn tất sau khi quyết định, việc còn thiếu và kết quả phát hành được ghi vào repo. Chat mới dùng các tài liệu này làm bối cảnh. Khi người dùng yêu cầu tóm tắt rồi chờ xác nhận trước khi sửa, thực hiện đúng; khi đã có yêu cầu triển khai/deploy trong phiên thì tiếp tục trong phạm vi được phép. Không tự archive chat hay xóa tài liệu nguồn.

## Kiến trúc

- Next.js App Router + React + TypeScript; Vercel.
- PWA cache app shell/tài nguyên cùng origin; không cache response Supabase hay auth trong Cache Storage.
- IndexedDB giữ snapshot và mutation queue theo user; ghi atomically trước khi sync. localStorage là fallback và nơi lưu preference.
- Supabase project WorkSpace, ref `ukoowtpqztknbrgpyqdx`; Spark dùng `public.projects` và `public.items` với RLS. Không đổi schema, project ref hoặc repair history của app khác.
- Public demo cục bộ tách khỏi dữ liệu cloud. OTP đúng 6 số, shared email hook nhận diện Spark qua redirect origin. Production/Preview dùng `https://spark.thuanngo.com`, local auth dùng `http://localhost:3000`.
- Mutation sync tuần tự, single-flight theo user, retry/reconcile khi online/Realtime/focus/visibility. Snapshot rỗng không tự upload cache/demo.

## Phạm vi hiện hành

- Task và note cùng có Tên 1–100 ký tự, Nội dung tùy chọn, start/due date-only nullable, project, Quan Trọng và Ưu tiên (`is_urgent`). Task hoàn thành; note lưu trữ.
- Hôm nay: Quá hạn, Hôm nay, Đang thực hiện, Chưa có ngày. Note trống cả hai ngày không xuất hiện; task không ngày vẫn xuất hiện.
- Tất cả có sáu khu: Quá hạn, Hôm nay, Đang thực hiện, Sắp tới, Sau đó, Chưa có ngày; disclosure độc lập. Sắp tới khớp một trong hai mốc trong ba ngày sau hôm nay; Theo ngày khớp start hoặc due.
- Hôm nay lọc khu inactive theo ngày `completedAt`/`archivedAt`, múi giờ `Asia/Ho_Chi_Minh`. Bốn master view ẩn item thuộc project lưu trữ.
- Task luôn trước note. Mức Chú Ý giữ cả hai cờ → Quan Trọng → Ưu tiên → bình thường; đảo chiều chỉ đảo due date trong cùng rank. Các trường khác đảo khóa chính; tie-break tên A–Z → due tăng dần → createdAt → ID; null cuối. Sort preference theo browser/view/khu.
- Project pill mở đồng loạt trên desktop, tham gia cột chung, tên uppercase một dòng đầy đủ; không overlay/shadow. Mobile chỉ dot tĩnh.
- Sidebar shortcut `⌘/Ctrl+\`; `[` note, `]` task, `\` tất cả. Không kích hoạt shortcut điều hướng trong input/contenteditable.

## Yêu cầu hiện hành đã đối chiếu từ chat

| Yêu cầu / quyết định cuối | Quy tắc đang áp dụng | Nguồn quyết định |
|---|---|---|
| Chiều rộng desktop | **Detail** rộng `min(880px, calc(100vw - 48px))`; listing vẫn responsive 940–1200px theo vùng khả dụng. | D-117 |
| Nội dung và phím tắt | Task/note, quick-add/detail: tối đa 4.000 Unicode code points gồm xuống dòng; chỉ B/I/U, ⌘/Ctrl+B/I/U, undo/redo. Vượt giới hạn bị từ chối, không cắt âm thầm draft. | D-117 |
| Nút sửa Nội dung | Cùng hàng nhãn Nội dung, bên ngoài vùng cuộn, không dịch theo nội dung dài. | D-117 |
| Quick-add start | Mặc định trống, chỉ **task mới trong Hôm nay** mặc định hôm nay. Note luôn trống mặc định. Ngày đã chọn/xóa thủ công giữ khi đổi loại. Due date giữ quy tắc trong brief. | D-118 |
| Nền khi nhập | Quick-add Tên focus dùng control-hover; Nội dung quick-add/chi tiết trong suốt, không border, chỉ toolbar có border/nền. | D-135 thay D-120 |
| Chiều cao editor | Desktop sửa Nội dung: khung `min(86dvh, 820px)`, bằng giới hạn khung đọc dài, editor giãn theo phần còn lại. Mobile edit `40dvh`; quick-add `160px`. | D-120 |
| Toolbar | Chỉ nền toolbar pha field 95% + đen 5%; không làm đậm vùng nhập. Yêu cầu 20% đã bị thay. | D-123 thay D-122 |
| Bullet/numbering | Đã gỡ khỏi toolbar/schema/phím tắt/renderer. Nội dung cũ và HTML dán vào giữ chữ/xuống dòng/B/I/U; không sửa hàng loạt dữ liệu cloud. Yêu cầu spacing 6px sau danh sách đã hết hiệu lực cùng tính năng này. | D-123 thay D-119 |
| Lưu draft và ngày | Lưu draft hợp lệ khi chuyển Tên/Nội dung. Tên rỗng không lưu, chặn chuyển trường. Ngày không hợp lệ/khoảng ngày ngược không lưu, giữ draft và báo lỗi; UI/mutation/cloud/CHECK đều có bảo vệ. | D-121 |
| Bố cục metadata mobile | Quan Trọng/Ưu tiên/hai ngày ở hàng đầu; Dự án và Lưu trữ/Khôi phục/Xóa cùng hàng thứ hai. Nút vẫn 44px; xóa qua xác nhận. | D-125 |
| Nhãn và khoảng cách chi tiết | Bỏ label Tên; nút sửa ngang text. Nhãn Nội dung cao 28px, gap dưới 4px desktop/8px mobile. Khoảng cách hai phía divider giảm 20%: margin 16px và padding 14.4px. | D-125/D-126 |
| Task/note trước tên | Checkbox task phản ánh completedAt và cho bật/tắt, lưu draft hợp lệ trước thao tác; dấu gạch ngang note tĩnh. Tên task hoàn thành trong chi tiết không gạch ngang. | D-127 |
| Hover và vị trí marker | Hover không đổi nền; checked vẫn giữ màu trạng thái. Artwork checkbox 19px/dấu note 12px, không padding ngang, sát lề **nội dung**; gap tên 10px. Checkbox có vùng bấm mở rộng 44px không chiếm hàng. | D-128/D-129 |
| Sửa Tên | Input cao 28px, chỉ gạch dưới 1px, nền trong suốt, không outline/glow/shadow. Desktop giữ ✓/× cùng hàng. Mobile ẩn ✓/×, tự lưu tên hợp lệ khi blur nhưng giữ input; Enter lưu/thoát, Escape hủy phần chưa lưu. | D-135/D-129 |
| Header và dải màu | Dải 5px/radius 5px nằm dưới tiêu đề/thống kê trên desktop/mobile, thường/compact; padding header 20px, mobile cộng safe-area top; không border dưới, bóng Navy nhẹ rõ giữa và tan hai mép. | D-136/D-137 |
| Blur và nền app | Header blur **8px desktop và mobile**, có `-webkit-backdrop-filter`; desktop 12px đã bị thay. Body canvas phẳng #F7F8FA, không gradient màu. Bóng header vẫn có radial gradient trung tính để làm mờ hai mép. | D-130/D-131 |
| Control sort | Selector cao 36px; nút đổi chiều 36×36px ở desktop/mobile. Đây là hai control sắp xếp trong ảnh, không phải toàn bộ nút trong app. | D-131 |
| Lỗi click khi sửa Nội dung | Focus metadata tự lưu draft nhưng **giữ editor và kích thước khung**. Không kết thúc edit giữa pointerdown và click. Lưu/chuyển trường vẫn kết thúc edit; Hủy chỉ bỏ phần chưa lưu từ lần tự lưu gần nhất. | D-132 |
| Bảo mật | Đã xử lý nâng dependency có cảnh báo trong release editor; render bằng React, không HTML tùy ý; JSON/URL/ngày được kiểm tra. Các kiểm tra hạ tầng và tài khoản thật còn mở được liệt kê riêng, không coi là audit toàn hệ thống hoàn tất. | D-117/D-121 và release 14/09 |
| Commit/push/production | Chủ dự án đã cho phép phát hành các thay đổi Spark của chuỗi yêu cầu này. Xác minh commit/alias/READY và hành vi production trước khi bàn giao; chỉ dùng demo riêng cho test tự động. | Yêu cầu trực tiếp trong chat |

### Chi tiết lưu nội dung và database

- Tiptap bật paragraph/text/hardBreak, ba mark B/I/U và undo/redo. `description` là văn bản thuần; `descriptionFormat`/`description_format` là JSON text runs. Soft break giữ xuống dòng mềm; metadata list/listStart cũ bị bỏ qua nhưng không mất text hoặc marks.
- Chỉ render format khi ghép text khớp description; bỏ mark lạ. Linkify chỉ HTTP(S)/www, mở tab mới với noopener/noreferrer. Nội dung cũ không có format vẫn đọc/sửa bình thường. Snapshot equality, cloud mapping và queue giữ formatting-only update; editor nằm trong app shell để mở lần đầu khi offline được.
- Bằng chứng migration từ release trước: `20260903131416_add_item_start_date` đã có trên remote; `20260914084232_item_basic_content_formatting.sql` thêm JSONB nullable, array tối đa 512 KB, giới hạn description 1–4.000; `20260914091948_enforce_item_date_range.sql` thêm CHECK ngày.
- Release 14/09 đã xác minh constraints VALIDATED, dữ liệu cũ không vi phạm; test bảng TEMP nhận 4.000 emoji, từ chối 4.001 và ngày ngược, transaction rollback. Lần rà soát tài liệu 05/10 không chạy lại migration hoặc kiểm tra database live.

## File chính

- `src/components/SparkApp.tsx`: quick-add/detail và ngày mặc định.
- `src/components/ContentEditor.tsx`: Tiptap, toolbar, phím tắt, giới hạn.
- `src/components/FormattedContent.tsx`: renderer an toàn và linkify.
- `src/lib/content-format.ts`: chuẩn hóa/đếm/chuyển đổi text runs.
- `src/lib/quick-add.ts`: mặc định ngày bắt đầu.
- `src/lib/cloud-data.ts`, `src/lib/data-ids.ts`, `src/lib/types.ts`: mapping, equality và kiểu dữ liệu.
- `src/app/globals.css`: selector gốc được chỉnh; không chồng override hoặc `!important`.
- `tests/browser/content.spec.ts`, `playwright.config.ts`: regression browser; browser profile riêng, chỉ dùng demo.
- Các thay đổi ngày/sort/UI tồn tại trước phiên này được giữ và đưa vào cùng release Spark.

## Kiểm tra và phát hành gần nhất

- `9ba7635`: sửa click metadata khi đang edit Nội dung. `2416f6f`: ổn định regression bằng cách chờ autofocus Tiptap trước khi chọn/format text; không đổi thêm mã ứng dụng.
- Deployment `dpl_8oz3BbocV4mPEir3RWpWtbjexeTa`, commit `2416f6f1602c5a5a959bdb282171402876585b76`, target production, **READY**, alias `spark.thuanngo.com`; đã xác minh lại ngày 05/10/2026.
- Trước phát hành: lint, typecheck, production build, 15 Vitest files / 162 tests và 12 browser tests trên production build local đều đạt.
- Sau bản sửa app: 12/12 browser tests đạt trên domain production, gồm cold-start offline. Hai regression metadata được chạy lặp ba lần mỗi viewport 1280px/390px: 6/6 đạt. Bản cập nhật `2416f6f` chỉ thay test/tài liệu; deployment đã được xác minh READY, không ghi nhận một lượt 12-test mới sau deployment riêng này.
- Đã kiểm tra click thật, trạng thái cờ, ngày/project qua reload, draft có định dạng, lưu trữ/khôi phục và mở/hủy xác nhận xóa. Browser dùng Chrome trong profile demo riêng; không ghi fixture vào cloud người dùng.
- Lượt browser đầu có lỗi chuẩn bị test: thao tác chọn chữ diễn ra trước autofocus bất đồng bộ của Tiptap. Test hiện chờ focus và xác nhận chữ đậm trước khi thử click metadata; không bỏ assertion lưu định dạng qua reload.
- Runtime logs qua Vercel MCP cho deployment sửa lỗi `9ba7635` không trả log lỗi. CLI 48.12.0 không hỗ trợ `logs --level`; không coi lỗi CLI là kết quả audit. Danh sách drains chưa xác minh được (API 404), không kết luận không có monitoring.
- Audit dependency 0 vulnerabilities là bằng chứng của release trước, không phải kiểm tra mới trong lượt cập nhật tài liệu này. Next.js/eslint-config-next hiện khóa 16.3.5; xem lockfile và chạy audit lại ở release có thay dependency.
- Các file `release-2026-09-14*.md` là lịch sử, không phải cấu hình UI hiện hành.

Lệnh kiểm tra:

```bash
npm run lint
npm run typecheck
npm test
npm run build
# Chạy production build local trước trên port 3015
npm run start -- --port 3015
SPARK_TEST_URL=http://localhost:3015 SPARK_TEST_OFFLINE=1 npm run test:browser
# Kiểm tra production, profile demo riêng do Playwright tạo
SPARK_TEST_URL=https://spark.thuanngo.com SPARK_TEST_OFFLINE=1 npm run test:browser
```

Git integration của Vercel tự deploy khi push `main`. Dùng `git log -1` để xem commit hiện tại; commit tài liệu mới hơn không đồng nghĩa có thay đổi code app. Khi cần xác định bản đang chạy, đọc deployment và đối chiếu commit/alias, không suy từ handoff cũ.

## Phạm vi commit và lưu ý

- Chủ dự án đã yêu cầu deploy production và commit/push tất cả thay đổi Spark trong phiên này.
- `output/` và `outputs/` là wallpaper/TMS Marketing ngoài Spark, giữ nguyên trên máy và không đưa vào commit/deploy Spark. Không xóa artifact.
- Không commit secret, `.env*`, `.vercel`, `.next`, `supabase/.temp`, `tsconfig.tsbuildinfo`, `test-results` hay `playwright-report`.
- Migration history WorkSpace dùng chung nhiều app; không chạy `db push --include-all` hoặc repair version của app khác.
- Không sửa shared auth hook, gửi OTP kiểm tra lại hoặc thay cấu hình app khác trong release này.

## Các kiểm tra còn ngoài phiên này

- iPhone thật: Home Screen, bàn phím/safe area, cold-start offline và đồng bộ hai thiết bị.
- RLS user A/user B và cách ly cache giữa tài khoản thật chưa chạy mới trong phiên này.
- Full-row upsert vẫn có giới hạn last-write-wins khi hai thiết bị sửa offline cùng item.
- Supabase advisors có cảnh báo sẵn ở hạ tầng dùng chung (`rls_auto_enable`, cấu hình mật khẩu, bảng nội bộ ideaPOD); không tự sửa trong phạm vi editor Spark.
- Backlog B-005 audit toàn bộ copy vẫn chưa được duyệt triển khai.

## D-133 — Icon app mới (2026-10-05)

Chủ dự án gửi `spark-app-icon-editable 2.svg`, đã lưu nguyên bản tại `assets/logo/spark-app-icon-v2.svg`. Phạm vi ban đầu D-133 chỉ đổi icon mobile/Chrome app/favicon; D-134 bên dưới đã mở rộng sang logo và sidebar. Đây là ngoại lệ gradient cho app icon, không khôi phục gradient nền canvas.

Bộ `v2`: Apple 180px vuông; PWA any 192/512px và favicon bo góc; maskable 512px thu artwork trắng còn 90% với nền full-bleed, toàn bộ artwork nằm trong safe circle bán kính 40% canvas. Favicon SVG, PNG 16/32/48 và ICO đa kích thước. Generator/verify đã chuyển sang canonical source mới; metadata/manifest/SW dùng URL v2. D-134 cập nhật nội dung các alias public cũ để tương thích URL; bản SVG cũ đã xuất và concept chỉ giữ như lịch sử.

Cập nhật icon đã cài có thể phụ thuộc cache launcher: nếu sau reload vẫn thấy icon cũ, thử gỡ biểu tượng khỏi Home Screen rồi thêm lại. Chưa xác minh icon launcher trên iPhone/Android vật lý.

Kiểm tra trước phát hành D-133: source SVG khớp nguyên byte với file gửi; 7 PNG đạt kiểm tra kích thước, alpha, gradient/artwork, maskable safe zone; ICO có 16/32/48px. Lint, typecheck, build, 162 unit tests và 13 browser tests trên production build local đạt, gồm metadata/manifest/asset và offline cache mới; mobile viewport 390px không tràn ngang.

Phát hành D-133: commit app `a41525c6819c9c37fecbfd1267559b07482cc250`, deployment `dpl_Aov7UwHWRzwdo1GKiZ3GCJ4HFGFL` READY và alias `spark.thuanngo.com` đã xác minh ngày 05/10/2026. Trên production: 13/13 browser tests đạt; 11 asset v2 HTTP 200 và SHA-256 khớp bản local; truy vấn runtime log lỗi không trả bản ghi. Kết quả này không thay thế kiểm tra launcher trên thiết bị vật lý.

## D-134 — Logo chính và toàn bộ vị trí nhận diện (2026-10-05)

Dùng badge gradient v2 thay mark check-burst trong cả logo chính, negative logo, sidebar mở rộng/thu gọn, menu mobile và các asset public. Giữ outlines wordmark `spark`, primary Deep Purple/negative trắng; không đổi icon chức năng task/note. Source riêng `assets/logo/spark-wordmark.svg`, tạo asset bằng `npm run icons:generate`; SVG/PNG primary/negative v2 đều có alias không phiên bản cùng nội dung mới. App/SW dùng logo/mark URL v2 để tránh cache cũ. D-134 thay giới hạn phạm vi logo/sidebar ở D-133.

Vị trí runtime và danh sách source ở `assets/logo/README.md`. Regression browser kiểm tra logo sidebar desktop mở rộng, badge compact rail, logo drawer mobile 390px, cùng cache offline và metadata icon. Nền app vẫn phẳng; gradient chỉ nằm trong badge nhận diện.

Kiểm tra trước phát hành D-134: `icons:verify`, lint, typecheck, build và 162 unit tests đạt. 14/14 browser tests trên production build local đạt, gồm desktop/compact/mobile 390px và cache offline. Đã xem ảnh thực tế logo ở cả ba trạng thái; không tràn ngang trên mobile.

Phát hành D-134: commit app `9add81b01eb547433470b94dac565d8690447e65`, deployment `dpl_5yUnyDE2MMLmRQ54iQkbUuxPLDyw` READY, alias `spark.thuanngo.com` xác minh ngày 05/10/2026. Production đạt 14/14 browser tests; toàn bộ 35 asset logo/icon public (URL v2 và alias cũ) trả HTTP 200, SHA-256 khớp bản local. Truy vấn runtime log lỗi của deployment không trả bản ghi. Chưa kiểm tra launcher trên thiết bị vật lý. Commit ghi nhận kết quả này chỉ cập nhật tài liệu, không thay code/asset.

## D-135 — Chỉnh logo, nút và editor (2026-10-05)

- Logo desktop full/compact dùng một ảnh, badge 36px cùng tọa độ/cột icon điều hướng; khung 58px chứa đủ ảnh, không cắt chân chữ. Drawer mobile dùng cùng full logo.
- Nút icon tròn, nút chữ/navigation bo hai đầu. Task checked neutral #8B8F9E/tick trắng, cả list và chi tiết.
- Sửa Tên: chỉ gạch dưới, nền trong suốt; giữ chiều cao 28px và quy tắc lưu/validation hiện có.
- Nội dung quick-add/chi tiết: vùng nhập trong suốt, không border; toolbar giữ border và nền 5% đậm. Lưu/hủy Nội dung 28×28px/icon 16px trên cả desktop/mobile; mobile mở hit area 44px, không chồng nhau. Close sheet giữ 44px, hình tròn.
- File thay đổi: `src/app/globals.css`, `src/components/SparkApp.tsx`, browser regression, brand guideline, brief, implementation guide, asset README và decision/handoff. Không đổi source artwork, dữ liệu hoặc schema.

Kiểm tra D-135 trước phát hành: lint/typecheck/build và 162 unit tests đạt; 16 browser scenarios local đạt (14 ở lượt toàn bộ, 2 scenario editor mới chạy lại sau khi sửa kiểm tra chờ hiệu ứng màu checked). So sánh ảnh badge compact/full cùng hình học; đã xem screenshot desktop/mobile, kiểm tra 320/390px không tràn ngang. Không phát hiện page error trong lượt kiểm tra trực quan.

Phát hành D-135: commit app `be1640ca2ce620ef831626eebdea826e8b647497`, deployment `dpl_CeV9oefbaEdJKm7ibBGPXh9ierp4` READY với alias `spark.thuanngo.com`. Production đạt 16/16 browser tests ngày 05/10/2026, gồm responsive 320/390px, desktop, tương tác editor và cache offline. Logo full/compact giữ chính xác tọa độ/kích thước; kiểm tra pixel cho phép lệch tối đa 1/255 mỗi kênh màu do raster gradient (đã đo sai biệt 51 pixel, delta tối đa 1). Không có page error trong lượt xem UI; truy vấn runtime log lỗi không trả bản ghi. Chưa kiểm tra bàn phím/launcher trên điện thoại vật lý. Commit sau này chỉ chỉnh độ ổn định của test ảnh và ghi bằng chứng phát hành, không đổi app runtime.

## D-136 — Header gọn hơn (2026-10-05)

Dải màu 5px, view-header padding 20px desktop/mobile, cả thường và compact. Mobile cộng safe-area top; bỏ min-height cũ để chiều cao theo nội dung. Cập nhật trực tiếp các rule hiện có trong `src/app/globals.css`; đồng bộ brand guideline, brief, implementation guide và decision log.

Kiểm tra D-136 trước phát hành: lint, typecheck, 162 unit tests và build đạt. Đo trên production build local ở 1280/390/320px: padding 20px cả bốn phía, dải màu 5px; mobile thường/compact đều đạt, không tràn ngang. Đã xem ảnh mobile 390px.

## D-137 — Dòng nhỏ trên tiêu đề và dải màu (2026-10-05)

Tất cả có eyebrow “Mọi ngày. Mọi việc.”. Eyebrow Hôm nay/Sắp tới/Theo ngày/Tất cả dùng --muted #73788D giống Dự án. Giữ uppercase và ẩn khi mobile compact. Dải màu cao 5px/radius 5px trên desktop/mobile; padding 20px/safe area không đổi. Chỉnh `SparkApp.tsx`/`globals.css` và đồng bộ tài liệu.

Kiểm tra D-137 trước phát hành: lint/typecheck/build và 162 unit tests đạt. Trình duyệt ở 1280/390/320px: bốn view ngày/Tất cả và Dự án dùng cùng xám #73788D; Tất cả có đúng text mới; band height/radius đều 5px, không tràn ngang hoặc page error. Đã xem screenshot Tất cả mobile 390px.
