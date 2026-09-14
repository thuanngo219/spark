# Spark v2 — bàn giao

> Cập nhật: 2026-09-14. Repo `/Users/dna.thuan/Codex/Projects/To-Do List`, branch `main`.
> Production: https://spark.thuanngo.com
> Phiên bản Git: xem `git log -1`; không dùng commit `3b184d5` trong handoff cũ làm phiên bản mới nhất.

## Bối cảnh và nguồn chuẩn

Spark là công cụ task/note cá nhân, tiếng Việt, desktop và iPhone. UI Compact Canvas, sidebar full/compact rail; mobile dock/drawer, vùng chạm 44px. Không thêm tính năng nhóm, reminder, recurring, AI hay định dạng nâng cao ngoài phạm vi đã duyệt.

Đọc `AGENTS.md`, `README.md`, `brand-guideline.md`, `docs/PROJECT_BRIEF.md`, `docs/UI_OPTIONS.md`, `docs/DECISIONS.md`, `docs/IMPLEMENTATION_GUIDE.md`; đọc `docs/OFFLINE_SYNC.md` khi liên quan dữ liệu. Repo không có `docs/architecture.md`; kiến trúc nằm trong implementation guide. Quyết định mới hơn thay thế phần tương ứng của quyết định cũ.

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

## Thay đổi mới đã duyệt: D-117 và D-118

1. Detail desktop rộng **880px**, chỉ vùng Nội dung cuộn. Nút Sửa Nội dung cùng hàng nhãn và đứng ngoài vùng cuộn. Mobile nội dung đọc dài có vùng cuộn riêng để nhãn/nút sửa vẫn hiện.
2. Nội dung tối đa **4.000 Unicode code points**, tính cả xuống dòng, không tính metadata định dạng. Cả task/note, quick-add/detail đều hỗ trợ **bold, italic, underline** bằng toolbar và **⌘/Ctrl+B/I/U**. Có undo/redo; vượt giới hạn bị từ chối và thông báo, không cắt âm thầm draft.
3. Tiptap bật paragraph/text/hardBreak, ba mark trên và undo/redo; tắt định dạng nâng cao. Nội dung gốc vẫn là `description`; `descriptionFormat`/`description_format` lưu text runs JSON; softBreak giữ xuống dòng mềm; metadata list/listStart cũ bị bỏ qua nhưng không mất text hoặc marks. Chỉ render định dạng khi ghép text khớp description; bỏ mark lạ, không render HTML tùy ý. URL vẫn linkify an toàn kể cả có format giữa URL.
4. Nội dung cũ không có định dạng vẫn đọc/sửa bình thường. Snapshot equality, cloud mapping, queue và local persistence giữ formatting-only update. Editor đóng gói cùng client app shell để lần đầu mở editor vẫn dùng được offline.
5. Khung desktop đang edit Nội dung cao min(86dvh, 820px), bằng giới hạn khung đọc nội dung dài; editor flex chiếm phần còn lại. Quick-add 160px; mobile edit 40dvh. Toolbar đứng ngoài vùng cuộn, các nút mobile 44px.
6. Quick-add mặc định start trống, **chỉ task mới trong Hôm nay** mặc định hôm nay. Note cũng để trống. Ngày chọn/xóa thủ công được giữ khi đổi task/note; due date giữ quy tắc cũ. Legacy backfill startDate thiếu vẫn giữ nguyên; explicit null không bị backfill.

## Database

- Đã xác minh remote có migration `20260903131416_add_item_start_date` và cột `start_date`; không áp dụng lại.
- Migration mới `20260914084232_item_basic_content_formatting.sql` đã áp dụng bằng Supabase MCP vào WorkSpace. File tạo ban đầu qua CLI, sau đó đồng bộ tên version với migration history trả về từ remote.
- Thêm `description_format jsonb nullable`, giới hạn JSON dạng array và 512 KB; `items_description_length` chuyển sang 1–4000 ký tự và được VALIDATE thành công.
- Trước migration: không có nội dung vi phạm giới hạn mới. Không sửa/xóa dữ liệu hiện có, không thay policy hay schema app khác.
- Kiểm tra bằng bảng TEMP sao chép constraints: 4.000 emoji + formatting được chấp nhận; 4.001 ký tự bị từ chối. Transaction kiểm thử rollback, không lưu fixture vào bảng người dùng.

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

## Kiểm tra và phát hành

Lệnh kiểm tra:

```bash
npm run lint
npm run typecheck
npm test
npm run build
# Chạy dev/production local trước, mặc định test URL là http://localhost:3014
npm run test:browser
# Cold-start offline cần production build đang chạy, ví dụ port 3015
SPARK_TEST_URL=http://localhost:3015 SPARK_TEST_OFFLINE=1 npm run test:browser
```

Vitest hiện có 162 tests. Browser suite kiểm tra Command B/I/U, undo/redo, lưu/reload/cancel, 4.000/4.001 ký tự, fixed edit header, quick-add defaults, mobile 390px và cold-start offline. Kết quả release cuối cùng ghi trong `docs/handoff/release-2026-09-14.md`.

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

## Bổ sung D-119–D-121 (2026-09-14)

- Nút Sửa tên cùng hàng nhãn, input Tên viền nhẹ không glow/shadow; edit Nội dung giữ nền field, quick-add focus dùng control-hover. Header desktop blur 8px/WebKit, nền canvas 80%.
- Tự lưu draft khi chuyển giữa Tên/Nội dung hoặc sang metadata; Hủy vẫn bỏ draft hiện tại.
- Ngày sai được giữ ở UI kèm báo chưa lưu. Hai ngày được lưu cùng nhau khi hợp lệ; mutation/cloud cũng kiểm tra. Migration `20260914091948_enforce_item_date_range.sql` đã thêm và validate CHECK, dữ liệu remote trước migration không có khoảng ngày ngược.
- Next.js và eslint-config-next 16.3.5; sharp/js-yaml đã cập nhật qua lockfile, npm audit không còn lỗ hổng.
- Regression mới kiểm tra danh sách, đổi trường tự lưu, ngày sai/đúng qua reload, màu focus, chiều cao editor và toolbar 320/390px.

- D-122: Chỉ nền toolbar formatting pha 20% đen trên nền field; nền vùng nhập giữ nguyên. Desktop blur 8px với WebKit; mobile giữ blur 18px/14px theo trạng thái.

## D-123 — Cập nhật mới nhất (2026-09-14)

Toolbar chỉ đậm hơn 5% (field 95% + đen 5%), thay D-122. Gỡ hoàn toàn định dạng bullet/number ở toolbar/schema/phím tắt/renderer, thay phần danh sách của D-119. Nội dung danh sách đã lưu hiển thị như đoạn văn, giữ chữ/xuống dòng/B/I/U; không sửa hàng loạt cloud. Regression kiểm tra dán danh sách, nội dung cũ và toolbar chỉ có 3 nút. Desktop header vẫn blur 8px/WebKit.
