# Implementation Guide

## 1. Kiến trúc đề xuất

### Stack

- **Frontend/full-stack:** Next.js App Router + TypeScript.
- **Styling:** Tailwind CSS hoặc CSS Modules + CSS variables. Dùng design tokens, không hard-code màu lặp lại trong component.
- **Backend đồng bộ:** Supabase Postgres + Supabase Auth.
- **Deploy:** Vercel.
- **PWA:** Web App Manifest, icon set, standalone display và service worker cache app shell để cold-start offline.
- **Local database:** IndexedDB giữ snapshot theo scope và mutation queue theo user; tự migrate dữ liệu `localStorage` cũ, có fallback nếu IndexedDB không khả dụng.
- **Testing:** Vitest cho date/filter logic; Playwright cho luồng chính và responsive.

Lý do chọn cấu hình này: một codebase chạy desktop lẫn iPhone, deploy qua HTTPS nhanh, hỗ trợ đăng nhập và đồng bộ dữ liệu mà không cần tự vận hành server.

### Supabase production

Hosted Supabase project có display name **WorkSpace** và project ref ổn định `ukoowtpqztknbrgpyqdx`. Đây là container hạ tầng dùng chung, có thể chứa schema riêng cho nhiều ứng dụng. Spark hiện vẫn dùng hai bảng `public.projects` và `public.items`; lần đổi tên project này không đổi project ref, URL, API keys, schema, bảng, Auth hay dữ liệu. Nếu tách Spark sang schema riêng trong tương lai, phải thực hiện bằng migration và cập nhật Data API/client như một thay đổi độc lập.

Migration history của WorkSpace là project-wide nên có version do nhiều app sở hữu. Trước mỗi thay đổi Spark phải chạy `migration list`; không dùng `db push --include-all` và không repair version của app khác chỉ để làm history khớp. Nếu repo Spark thiếu migration đã áp dụng bởi app khác, chạy chính file Spark đã review bằng `db query --file` trong transaction, xác minh schema/data, rồi ghi nhận **chỉ version Spark vừa áp dụng** bằng `migration repair --status applied`.

### Hai chế độ dữ liệu

**Khuyến nghị cho MVP: cloud sync ngay từ đầu.** Đăng nhập passwordless bằng mã OTP gửi qua email, dữ liệu lưu ở Supabase và được bảo vệ theo user. Người dùng nhập mã ngay trong Spark để tránh magic link bị mở ở browser khác trên mobile. Cách này cho phép iPhone và desktop thấy cùng một danh sách.

Email template của hosted Supabase phải dùng `{{ .Token }}` để gửi OTP 6 chữ số thay vì `{{ .ConfirmationURL }}`. Client chỉ giữ ký tự số, giới hạn đúng 6 ký tự và không gọi `verifyOtp` khi mã chưa khớp `^[0-9]{6}$`.

Mọi request `signInWithOtp` của Spark phải truyền `options.emailRedirectTo` lấy từ `NEXT_PUBLIC_SPARK_AUTH_REDIRECT_ORIGIN`. Local development dùng `http://localhost:3000`; Vercel Production và Preview dùng origin chính xác `https://spark.thuanngo.com`. Shared Send Email Hook nhận diện thương hiệu qua `email_data.redirect_to` (và có thể fallback sang `site_url`), nên không dùng origin của ideaPOD hoặc The Atelier và không cấu hình Resend/SMTP/hook riêng trong Spark.

Template email thực tế do `workspace-send-auth-email` quản lý; nguồn dùng chung hiện nằm tại repo `IdeaPod/web/supabase/functions/_shared/auth-email.ts`, không sao chép hook sang Spark. Nhánh OTP `brand.id === "spark"` đặt mã đầu subject và render mã 36px, một dòng trên nền neutral. Chỉnh template phải giữ nguyên mapping, chữ ký webhook, các nhánh auth khác và template của app khác; chạy regression test shared trước khi cập nhật function. Không lưu OTP thật, email người dùng hoặc secret trong tài liệu/log.

Nếu muốn làm prototype cực nhanh, có thể dùng IndexedDB/local storage trước. Nhược điểm là dữ liệu gắn với từng trình duyệt và không tự đồng bộ giữa thiết bị; phải có migration path trước khi đưa vào dùng thật.

## 2. Data model tối thiểu

### `projects`

| Trường | Kiểu | Ghi chú |
|---|---|---|
| `id` | uuid | primary key |
| `user_id` | uuid | owner, tham chiếu auth user |
| `name` | text | 1–80 ký tự |
| `color` | text | token/hex đã kiểm tra |
| `is_starred` | boolean | đưa project vào nhóm Cần lưu ý |
| `position` | integer | thứ tự thủ công, chuẩn bị cho tương lai |
| `archived_at` | timestamptz nullable | soft archive |
| `created_at` | timestamptz | audit |
| `updated_at` | timestamptz | audit/sync |

### `items`

| Trường | Kiểu | Ghi chú |
|---|---|---|
| `id` | uuid | primary key |
| `user_id` | uuid | owner |
| `project_id` | uuid nullable | một item tối đa một project |
| `type` | enum/text | `task` hoặc `note` |
| `title` | text | task/note 1–100 ký tự, hiển thị một dòng |
| `description` | text nullable | task/note, văn bản 1–4.000 ký tự khi có giá trị; copy UI là “Nội dung” |
| `description_format` | jsonb nullable | mảng text run `{text, bold?, italic?, underline?, softBreak?}`; chỉ dùng nếu ghép text khớp `description`; không chứa HTML |
| `start_date` | date nullable | ngày bắt đầu, date-only; chỉ task mới trong Hôm nay mặc định hôm nay; các trường hợp khác để trống, vẫn chỉnh/xóa được |
| `due_date` | date nullable | ngày đến hạn, date-only |
| `completed_at` | timestamptz nullable | chỉ dùng cho task; note luôn null |
| `archived_at` | timestamptz nullable | chỉ dùng cho note; task luôn null |
| `is_important` | boolean | mặc định false |
| `is_urgent` | boolean | mặc định false |
| `position` | integer | ổn định thứ tự |
| `created_at` | timestamptz | audit |
| `updated_at` | timestamptz | audit/sync |

Ràng buộc: `type = 'note'` thì `completed_at` phải null; `type = 'task'` thì `archived_at` phải null. Cả hai loại dùng title 1–100 ký tự và description nullable tối đa 4.000 ký tự. Migration 20260914091948 thêm và validate `items_date_range`: start/due được null, khi cả hai có giá trị thì start <= due. Đã kiểm tra remote không có khoảng ngày ngược; không chỉnh dữ liệu cũ. UI giữ ngày sai dưới dạng nháp kèm lỗi, chỉ lưu đồng thời hai mốc khi hợp lệ; lớp mutation và cloud cũng kiểm tra range. Chỉ mục nên có: `(user_id, type, completed_at, due_date)`, `(user_id, start_date)`, `(user_id, project_id, completed_at)`, `(user_id, archived_at)`, `(user_id, is_important)` và `(user_id, is_urgent)`.

### Bảo mật

- Bật Row Level Security trên mọi bảng public.
- Policy `select/insert/update/delete` chỉ cho phép khi `auth.uid() = user_id`.
- Không đưa service-role key xuống client.
- Validate title/description/date/project ownership ở boundary ghi dữ liệu.

## 3. Date logic

Tạo một module thuần, ví dụ `src/lib/task-filters.ts`, không rải logic ngày trong component.

- `today`: `overdue` khi `due_date < localToday`; `today` khi `due_date === localToday` hoặc `start_date === localToday`; `ongoing` khi `start_date < localToday` và `due_date` trống hoặc sau hôm nay; `undated` chỉ nhận task có cả hai ngày null. Note trống cả hai ngày bị ẩn.
- `upcoming`: `start_date` hoặc `due_date` nằm từ localTomorrow đến `localToday + 3 calendar days`.
- `byDate`: `start_date === selectedDate || due_date === selectedDate`.
- `all`: lấy mọi item còn hiện hành rồi chia `overdue`, `today`, `ongoing`, `upcoming` (ba ngày kế tiếp), `later` và `undated`; completed task và archived note nằm trong disclosure trạng thái riêng.
- `filterItems` và `inactiveForView` nhận thêm metadata projects để loại item của project có `archivedAt` khỏi bốn master view trước khi sort/group/display filter và tính số đếm sidebar/header. Project view và smart filter không bị ảnh hưởng; không sửa item.
- Trong `inactiveForView` của Hôm nay, task được chọn theo ngày `completedAt` và note theo ngày `archivedAt` trong `Asia/Ho_Chi_Minh`, không theo ngày kế hoạch; timestamp không hợp lệ không được hiển thị.
- Riêng view Hôm nay, header Quá hạn, Hôm nay, Đang thực hiện và Chưa có ngày là disclosure độc lập, mặc định mở, dùng cùng icon/kiểu tương tác với disclosure trạng thái cuối danh sách.
- View Tất cả dùng lại `ItemGroup` disclosure cho sáu khu thời gian, state riêng theo `TimeGroup` trong phiên, mặc định mở và độc lập với Hôm nay. `.item-group ~ .item-group` là nguồn spacing 12px duy nhất, tính cả khi quick-add nằm giữa khu active và inactive; không giữ ngoại lệ margin cho khu hoàn thành. Select sort dùng chiều rộng theo `ch` cộng padding để nhãn uppercase không bị cắt khi font scale thay đổi.
- Trạng thái `itemDisplayMode: 'all' | 'task' | 'note'` là presentation filter dùng chung cho mọi view; áp dụng sau master/smart/project filter, trước khi chia nhóm và tính số quá hạn hiển thị. Không ghi thay đổi xuống item.
- Mỗi khu sort presentation độc lập theo `attention`, `dueDate`, `startDate`, `title`; disclosure inactive có thêm `statusDate`. `sortItemsForDisplay` so sánh loại trước (task → note), sau đó khóa chọn. Với `attention`, rank cố định cả hai cờ → Quan Trọng → Ưu tiên → bình thường; `direction` chỉ áp dụng cho due date trong cùng rank. Các field khác đảo riêng khóa chính. Hòa khóa xét title A–Z → due date tăng dần → createdAt → ID; null cuối trong từng loại/rank ở cả hai chiều. Preference lưu bằng `localStorage` theo view/khu; không ghi lại `position` hoặc mutate mảng/item đầu vào.
- Listing format ngày bằng nhãn Hôm qua/Hôm nay/Ngày mai trong khung ba ngày tương đối; ngoài khung dùng `dd.mm` nếu cùng năm với local today hoặc `dd.mm.yy` nếu khác năm.
- Dữ liệu cũ thiếu `start_date` được backfill từ `created_at` theo `Asia/Ho_Chi_Minh`, fallback cố định `2026-09-03`; runtime chỉ backfill field bị thiếu (`undefined`) và giữ explicit null do người dùng xóa.
- Luôn truyền timezone vào hàm tạo `localToday` để test được.
- Test đặc biệt: cuối tháng, cuối năm, năm nhuận và thời điểm quanh nửa đêm.

## 4. Cấu trúc mã nguồn gợi ý

```text
src/
├── app/
│   ├── (auth)/
│   ├── (app)/
│   │   ├── today/
│   │   ├── upcoming/
│   │   ├── calendar/
│   │   ├── all/
│   │   ├── important/
│   │   ├── urgent/
│   │   └── projects/[projectId]/
│   ├── manifest.ts
│   └── layout.tsx
├── components/
│   ├── app-shell/
│   ├── items/
│   ├── projects/
│   └── ui/
├── lib/
│   ├── task-filters.ts
│   ├── dates.ts
│   ├── supabase/
│   └── validation.ts
└── styles/
    └── tokens.css
```

## 5. Trạng thái và mutation

- Dùng optimistic update cho check/uncheck task, create, rename và toggle Quan Trọng/Ưu tiên (`is_urgent`).
- Mỗi mutation cloud được lưu vào queue theo user trước khi gửi, ghi tuần tự và retry với exponential backoff tối đa 30 giây. Flush dùng single-flight theo user và chỉ bắt đầu sau transaction snapshot + queue mới nhất; không xóa mutation khỏi queue trước khi server xác nhận.
- Nếu server trả lỗi hoặc thiết bị offline, giữ optimistic state và mutation queue trên thiết bị, hiển thị trạng thái rõ; tự gửi lại khi có mạng thay vì rollback làm mất nội dung.
- Khi nhận snapshot remote, overlay toàn bộ mutation chưa xác nhận trước khi cập nhật UI để snapshot cũ không ghi đè thay đổi local.
- Snapshot remote rỗng là trạng thái có thẩm quyền; không tự upload cache cloud hoặc dữ liệu demo chỉ vì server đang rỗng. Chỉ mutation thật đang chờ của user được phép overlay và gửi tiếp.
- Reconcile lại sau khi Realtime subscribe/reconnect, browser phát sự kiện `online`, tab/PWA trở lại foreground hoặc focus; chạy safety pull mỗi 60 giây khi tab đang visible. Các trigger pull trùng nhau dùng chung request đang chạy và snapshot không đổi không cập nhật lại state/IndexedDB.
- Cache demo tách khỏi cache cloud và cache cloud được namespace theo user ID. Snapshot cùng queue hiện tại phải được ghi trong một transaction IndexedDB trước khi bắt đầu gửi mutation; preferences nhỏ không liên quan dữ liệu vẫn có thể dùng `localStorage`.
- Xóa dùng soft/undo ở UI; chỉ hard delete sau khi hết thời gian undo hoặc triển khai trường `deleted_at` nếu cần an toàn hơn.
- Không dùng global state library ở MVP nếu server cache + component state đã đủ.
- Giữ unsaved quick-add text khi app chuyển offline ngắn.
- Quick-add overlay phải có `role="dialog"`, `aria-modal="true"`, đóng được bằng Hủy, click backdrop và phím Escape; khi đóng trả focus về nút “Thêm công việc”. Backdrop của mọi overlay chỉ dùng lớp Navy dim đủ đậm, không dùng blur.
- Quick-add giữ checkbox Ghi chú. Secondary button **Thêm Nội dung** mở textarea tùy chọn tối đa 4.000 ký tự cho cả task và note; chuyển loại không xóa draft. Ngày bắt đầu mặc định trống, chỉ task mới trong Hôm nay mặc định hôm nay; ngày bắt đầu, ngày đến hạn và dự án đều chỉnh/xóa được cho cả hai loại item.
- Tap item mở detail sheet ở trạng thái đọc. Tên/Nội dung chỉ chuyển sang input/textarea khi bấm edit icon kế text; metadata compact lưu từng thay đổi ngay mà không cần submit cả form.
- Canvas liệt kê task/note ở desktop dùng `width: clamp(940px, 80vw, 1200px)` cùng `max-width: 100%` để co theo vùng content khi viewport hẹp; mobile override về `width: 100%`. Detail sheet desktop dùng `width: min(880px, calc(100vw - 48px))`. Nút Sửa Nội dung nằm trên hàng nhãn cố định, ngoài vùng cuộn ở cả chế độ đọc/sửa. Sheet là flex column giới hạn chiều cao; header, khối Tên và `.detail-metadata` không cuộn, còn read row/inline editor trong `.detail-description` là vùng cuộn độc lập.
- Khung desktop đang sửa Nội dung cao `min(86dvh, 820px)`, bằng giới hạn khung đọc dài; flex phân bổ vùng nhập còn lại và chỉ editor cuộn. Quick-add giữ 160px; mobile đọc/sửa giãn phần còn lại của màn hình theo D-157. D-135: Nội dung quick-add/chi tiết trong suốt và không border; chỉ toolbar có border/nền field pha 5% đen. Quick-add Tên giữ control-hover; input sửa Tên chỉ có gạch dưới, không nền/outline/shadow. Tên không có nhãn; nút sửa cùng hàng với text, khi sửa trên desktop, input và ✓/× nằm trong `.detail-title-row`; mobile ẩn ✓/× của Tên và tự lưu hợp lệ khi blur. Nội dung giữ action ✓/× cạnh nhãn, editor dùng toàn chiều rộng bên dưới. Lưu/hủy Nội dung hiển thị `28px`/icon `16px` ở cả hai; mobile mở hit area `44px` bằng pseudo-element, gap 16px tránh chồng. Nút đóng sheet giữ 44px/tròn.
- Vùng nội dung item kiểm tra `openSwipeItemId` chung: trên mobile, nếu bất kỳ khay nào mở thì `onClick` chỉ đóng khay; nếu không có khay mở thì một click mở chi tiết. Quy tắc áp dụng khi chạm cùng item hoặc item khác, kể cả khác nhóm. Pointer-down/up của tap thường không được xóa trạng thái khay trước `onClick`. Desktop vẫn mở bằng một click. Chỉ bật style kéo sau khi xác định gesture ngang, không đổi nền/transform ở pointer-down của tap thường. Click phát sinh từ vuốt/cuộn/cancel bị chặn đến pointer-down mới, không reset bằng timer; activation bàn phím/assistive technology (`detail === 0`) vẫn hoạt động. Checkbox/marker và action khay không mở chi tiết.
- Hàng nhãn Nội dung cao 28px ở cả chế độ đọc/sửa: desktop cách field 4px, mobile cách 8px. Nút mobile vẫn có vùng chạm 44px, dùng margin dọc -8px để không làm hàng nhãn cao thêm; vùng chạm kết thúc trước field bên dưới. Khoảng cách trước đường phân cách là 16px, padding sau đường phân cách là 14.4px, giảm 20% từ 20px/18px.
- Metadata detail mobile dùng grid bốn cột: Quan Trọng, Ưu tiên, Ngày bắt đầu và Ngày đến hạn ở hàng đầu; Dự án và cụm Lưu trữ/Xóa icon-only 44px cùng hàng thứ hai trong `.detail-project-actions`. Ô Dự án co giãn theo phần còn lại; các nút không co. Wrapper dùng `display: contents` trên desktop để giữ bố cục metadata hiện có. Label vẫn tồn tại qua `aria-label`/tooltip; Xóa tiếp tục qua confirm dialog.
- Project dot trong item row là control tùy chọn trên desktop: click một dot đổi chung `projectLabelsExpanded` cho mọi item trong view. Pill uppercase dùng regular weight, tham gia grid, không overlay hoặc dùng shadow. Grid track dùng chung `--project-chip-width` từ pill dài nhất đang render để title thẳng hàng; từng pill dùng `--project-pill-width` riêng để nền chỉ ôm tên của nó, còn dot được neo cố định khi animate `width`. Tên pill đã mở luôn ở một dòng và không dùng ellipsis. Trên mobile, button pill được ẩn và thay bằng dot tĩnh nên không có thao tác mở pill hoặc thay đổi grid. Trạng thái mở và toggle trong bảng Phím tắt & hiển thị lưu bằng `localStorage` theo browser và tiếp tục áp dụng khi đổi view desktop; khi tắt tính năng, dot desktop trở lại marker không tương tác và trạng thái mở được reset.
- Editor Nội dung dùng Tiptap với paragraph/text/hardBreak và ba mark bold/italic/underline, undo/redo, ⌘/Ctrl+B/I/U; tắt các định dạng khác. Xuống dòng mềm giữ hardBreak; không lưu HTML. Metadata danh sách cũ bị bỏ qua, giữ nguyên text và B/I/U. Đếm 4.000 Unicode code points gồm xuống dòng, không tính metadata định dạng; từ chối nhập/dán vượt giới hạn và giữ draft. `description` giữ văn bản thuần, `description_format` giữ các text run; trim văn bản và định dạng cùng nhau. Cache cũ không có format đọc như plain text; format sai cấu trúc hoặc không khớp text bị bỏ qua.
- Linkify Nội dung bằng parser text thuần và React node, không dùng `dangerouslySetInnerHTML`. Render đậm/nghiêng/gạch chân bằng React, giữ URL liền mạch kể cả khi format đổi giữa URL. Chỉ nhận `http://`, `https://` và `www.`; link dùng `target="_blank"` cùng `rel="noopener noreferrer"`, còn giá trị lưu trong database vẫn là plain text.
- Sort Mức chú ý áp rank cố định bên trong mỗi loại task/note như mục Date logic; cập nhật cờ làm list tự sort lại từ state, không persist rank. Test filter kiểm tra đúng tập item và không trùng, test grouping kiểm tra khu, còn test sort kiểm tra thứ tự, hai chiều, null và tie-break độc lập.
- Desktop floating trigger dùng artwork `+` 32px trong hit target 48px ở góc dưới phải. Mobile dùng dock `position: fixed; inset: auto 0 0` cao 58px cộng safe-area, nền surface đặc theo theme, bốn đích icon trên/nhãn dưới và nút `+` 64px không nhãn ở giữa, dấu + 36px; list phải chừa bottom space cộng safe-area để dock không che item cuối.
- Trên mobile, sau user gesture mở quick-add phải focus title input; dùng `window.visualViewport` resize/scroll để fit backdrop vào vùng còn thấy khi bàn phím mở và gọi `scrollIntoView` cho field. Cleanup listener/timer khi đóng; desktop giữ layout overlay hiện tại.

### Header thu gọn — D-144

- Header desktop/mobile thu gọn khi cuộn quá 28px; trạng thái compact chỉ giữ h1 ở 50% cỡ chữ thường và dải màu 5px/radius 5px. Ẩn eyebrow, thống kê, nút mở sidebar mobile, nút sửa dự án và control trong header; cuộn về đầu khôi phục đầy đủ. H1 dùng letter-spacing -0.025em ở cả hai trạng thái. Padding desktop 20px; mobile 15px cả bốn phía cộng safe-area theo D-161; giữ blur 8px/WebKit và opacity dark 75% cho h1/dải màu.
- State `headerCompact` dùng chung desktop/mobile, cập nhật qua scroll listener passive và requestAnimationFrame. CSS dùng `--view-title-size` theo breakpoint và nhân 0.5 khi `.is-compact`, không giữ selector mobile compact riêng. Bù phần chiều cao header đã thu vào padding cuối canvas qua useLayoutEffect/ResizeObserver, không để khoảng trắng dưới header; document không ngắn lại khi thu gọn, kể cả danh sách chỉ vừa vượt viewport. Canvas tắt scroll anchoring để trình duyệt không tự bù vị trí rồi đảo trạng thái ở ngưỡng cuộn.

### Sidebar và keyboard shortcuts

- Sidebar có hai trạng thái: `expanded` và `compact`; lưu lựa chọn cục bộ để giữ sau reload.
- Sidebar toggle dùng icon panel-chevron theo trạng thái: chevron trái khi expanded để collapse, chevron phải khi compact để mở lại; mobile header dùng trạng thái mở sidebar.
- Rail compact rộng khoảng `56px`; hai nhóm Cần lưu ý và Dự án có trạng thái mở/đóng riêng được lưu cục bộ.
- Mobile sidebar giữ full negative logo và nút đóng, nhưng ẩn nhóm view Hôm nay/Sắp tới/Theo ngày/Tất cả đã chuyển xuống dock. Drawer mở bằng panel icon-only trong sticky header hoặc drag từ mép trái sang phải và dùng transition `transform` ngắn để có motion liên tục.
- Project có thể gắn sao; `is_starred` được đồng bộ cloud và project được hiển thị trong Cần lưu ý.
- Project editor giữ sáu màu preset và dùng lựa chọn thứ bảy là native `input[type=color]` trong nút đa sắc cho màu tùy ý. Giá trị custom tiếp tục lưu vào `projects.color`; so sánh preset không phân biệt hoa/thường. Mobile render swatch strip cuộn ngang để giữ touch target 44px.
- Tạo project mới trên mobile focus `nameInputRef` ngay sau user gesture, theo dõi `window.visualViewport` resize/scroll để fit backdrop và `scrollIntoView` field khi bàn phím iOS mở. Cleanup listener, timer, body overflow và inline viewport styles khi đóng; edit project giữ focus mặc định.
- Sidebar desktop expanded cho kéo-thả project để đổi thứ tự. Trong lúc kéo, row nguồn giảm opacity; nửa trên/nửa dưới của row đích lần lượt chọn chèn trước/sau và hiển thị drop indicator Turquoise đúng cạnh tương ứng. Thứ tự mới được chuẩn hóa thành `position` liên tiếp, cập nhật optimistic và xếp vào durable mutation queue; mobile/compact rail không bật drag.
- Project archive/restore dùng mutation `upsert-project` với `archivedAt`. Sidebar/shortcut/quick-add chỉ dùng active projects; ItemGroup và item editor vẫn resolve cả archived project để không mất màu/tên liên kết cũ.
- Project delete dùng mutation `delete-project`, request lọc cả `id` và `user_id`, dựa vào FK `items.project_id ON DELETE SET NULL` hiện có. Optimistic overlay xóa project và null liên kết item, không sửa nội dung/trạng thái item. Delete được xếp sau các pending create/update để giữ dependency khi offline; item edit mới có tham chiếu project đang chờ xóa được bỏ liên kết. Xóa có bước xác nhận rõ ràng, không có undo; không ảnh hưởng cơ chế undo xóa item.
- Ở compact state, filter dùng icon + count; project dùng dot màu lớn. Tất cả icon-only controls phải có accessible label và tooltip.
- Dùng một keyboard shortcut handler tập trung, không gắn listener rải rác trong component.
- Hỗ trợ `N` → quick-add, `T` → Today, `S` → Upcoming, `D` → By date, `A` → Tất cả, `I` → Quan Trọng, `U` → Ưu tiên và `1–9` → chín project đầu; `[` → chỉ note, `]` → chỉ task, `\` → tất cả nội dung; `⌘/Ctrl + \` toggle sidebar và `?` mở trợ giúp. Resolver so khớp đúng `event.key`; `{`, `}` và `|` không phải shortcut.
- Compact sidebar dùng tooltip tức thời cho navigation icon, project dot và footer action; tooltip project kèm shortcut `1–9` khi có.
- Bỏ qua shortcut khi event phát sinh trong `input`, `textarea`, `select` hoặc phần tử `contenteditable`; `Escape` đóng overlay/trợ giúp.
- Bảng trợ giúp dùng layout hai cột, gộp project vào một dòng và có cả nút X lẫn `Escape` để đóng.
- Test: từng mapping điều hướng đúng, Escape đóng, không chạy khi nhập task và sidebar preference được restore.

## 6. PWA và iPhone

Để app có cảm giác native-like:

- Có manifest với `name`, `short_name`, `start_url`, `display: "standalone"`, `background_color`, `theme_color` và icon 192/512px.
- App icon D-133 lấy source `assets/logo/spark-app-icon-v2.svg`; chạy `npm run icons:generate` rồi `npm run icons:verify`. Apple 180px vuông full-bleed; Chrome/PWA any 192/512px bo góc; maskable 512px scale artwork 90% trong safe circle; favicon SVG/PNG 16/32/48/ICO. Metadata/manifest/SW dùng tên v2. D-134: logo chính/sidebar/rail cũng dùng badge mới; source wordmark tách riêng, SVG/PNG và alias public được sinh bởi `scripts/generate-brand-assets.mjs`. D-135: sidebar full/rail/drawer cùng dùng `/brand/spark-logo-negative-v2.svg` ở scale .075; ảnh 153.6×57.6px dịch trái 9.975px để badge 36px ở x=10px. Wrapper cao 58px, compact chỉ crop ngang còn 36px. SW vẫn precache cả logo và mark độc lập.
- Dùng filename mới khi đổi colorway icon để tránh cache cũ; sau deploy cần kiểm tra trực tiếp SVG/PNG, manifest và metadata production.
- Deploy qua HTTPS; đây là yêu cầu quan trọng cho khả năng cài PWA.
- Service worker chỉ đăng ký ở production. Navigation dùng network-first với fallback app shell; Next static asset dùng cache-first; font/ảnh/CSS/script cùng origin dùng stale-while-revalidate.
- Cache Storage không cache request Supabase, auth/session hoặc snapshot task/note. Dữ liệu người dùng nằm trong IndexedDB và Supabase.
- Sau lần mở production online đầu tiên, app phải cold-start và CRUD được khi offline; thay đổi tự gửi lại khi mạng trở lại.
- Chi tiết schema, migration, lifecycle và test matrix nằm trong `docs/OFFLINE_SYNC.md`.

### Đưa app lên mạng

Khi test dev server từ iPhone cùng Wi-Fi, chạy Next.js với `--hostname 0.0.0.0` và khai báo IP LAN hiện tại trong `allowedDevOrigins`; không mở wildcard origin rộng hơn phạm vi mạng thử nghiệm.

1. Tạo repository Git và project Supabase.
2. Cấu hình environment variables cục bộ, không commit secret.
3. Kết nối repository với Vercel hoặc chạy Vercel CLI từ project root.
4. Cấu hình cùng environment variables trên Vercel; đặt `NEXT_PUBLIC_SPARK_AUTH_REDIRECT_ORIGIN=https://spark.thuanngo.com` cho Production và Preview.
5. Deploy preview, test đầy đủ, sau đó promote/deploy production.
6. Có thể dùng domain riêng; nếu chưa, URL `*.vercel.app` đã đủ để sử dụng.

### Thêm vào Home Screen trên iPhone

1. Mở URL production bằng Safari trên iPhone.
2. Chạm nút **Share/Chia sẻ**.
3. Chọn **Add to Home Screen/Thêm vào Màn hình chính**. Nếu không thấy, vào **Edit Actions/Sửa tác vụ** để thêm mục này.
4. Bật **Open as Web App/Mở dưới dạng ứng dụng web** nếu được hiển thị.
5. Đổi tên ngắn nếu muốn và nhấn **Add/Thêm**.

Biểu tượng Spark sẽ xuất hiện cạnh các app khác và mở trực tiếp vào web app. Muốn cập nhật phiên bản, chỉ cần deploy web; không cần phát hành qua App Store.

Nếu iOS vẫn giữ artwork cũ sau khi icon production đã đổi, xóa Spark khỏi Home Screen rồi thêm lại để hệ điều hành lấy Apple Touch Icon mới. Chrome/PWA đã cài cũng có thể cần gỡ và cài lại nếu launcher cache icon cũ.

## 7. Kế hoạch triển khai

### Phase 0 — Chốt UX

- Chọn một trong ba UI direction.
- Dựng design tokens và màn hình tĩnh responsive.
- Duyệt các state: có dữ liệu, trống, task quá hạn, completed, loading, error.

### Phase 1 — Functional MVP

- Scaffold project, auth và database migrations.
- CRUD projects/items; hỗ trợ task/note và smart filters Quan Trọng/Ưu tiên.
- Hôm nay, Sắp tới, Theo ngày và Project view.
- Optimistic mutation + undo.
- Unit và end-to-end tests.

### Phase 2 — Ship as PWA

- Manifest, icons, metadata và standalone behavior.
- Service worker app shell, IndexedDB migration và durable offline mutation queue.
- Deploy Vercel, kiểm thử trên iPhone thật.
- Sửa safe-area, virtual keyboard, touch targets và viewport issues.

### Phase 3 — Học từ sử dụng thật

- Dùng hai tuần, ghi lại friction.
- Chỉ sau đó đánh giá reminder, recurring tasks, quick capture/Shortcuts và conflict resolution đa thiết bị.

## 8. Checklist trước khi production

- [ ] Filter logic và timezone tests pass.
- [ ] RLS đã bật và test user A không đọc/sửa dữ liệu user B.
- [ ] Không có secret trong client bundle hoặc repository.
- [ ] Empty/loading/error/offline states có nội dung.
- [ ] Test iPhone viewport, safe-area và bàn phím ảo.
- [ ] Manifest/icon hợp lệ, site chạy HTTPS.
- [ ] Add to Home Screen mở đúng route và không hiện browser chrome khi standalone.
- [ ] Lighthouse/accessibility smoke check không có lỗi nghiêm trọng.

## 9. Tài liệu tham khảo chính thức

- [Next.js guide: Progressive Web Apps](https://nextjs.org/docs/app/guides/progressive-web-apps)
- [MDN: Making PWAs installable](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable)
- [Apple: Turn a website into an app in Safari on iPhone](https://support.apple.com/en-mide/guide/iphone/iphea86e5236/ios)
- [Vercel: Next.js on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs)
- [Supabase: Auth with Next.js](https://supabase.com/docs/guides/auth/quickstarts/nextjs)
- [Supabase: Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)

## 10. Quy tắc editor và header hiện hành (D-117–D-132)

- Khi chuyển từ Tên sang Nội dung hoặc ngược lại, tự lưu trường đang sửa trước khi chuyển; chuyển sang metadata cũng lưu draft đang sửa. Tên rỗng chặn chuyển và báo lỗi. Hủy chỉ bỏ phần draft chưa lưu kể từ lần tự lưu gần nhất. Nút Sửa tên nằm cùng hàng với text của tên, không có nhãn Tên.
- D-130/D-131: Header desktop nền canvas 80%, blur 8px với prefix WebKit; mobile blur 8px ở cả thường/compact. D-137: eyebrow chung dùng --muted, Tất cả thêm “Mọi ngày. Mọi việc.”; dải màu 5px/radius 5px nằm dưới header, padding desktop 20px; mobile 15px cả bốn phía cộng safe-area theo D-161, không min-height cố định; bỏ đường shadow 1px, dùng pseudo-element bóng nhẹ không bắt pointer và tan ở hai mép. Body nền canvas phẳng. Cột tiêu đề co được và h1 wrap từ dài để không tràn ngang khi bóng nằm ngoài header. Next.js/eslint-config-next khóa 16.3.5; kết quả npm audit 0 vulnerabilities là bằng chứng sau cập nhật dependency trong release trước, không phải xác nhận liên tục.

- D-123 (thay D-122): Chỉ nền toolbar formatting pha 5% đen trên nền field; D-135 bỏ border/nền vùng nhập và chỉ giữ ở toolbar. Blur/vị trí dải màu hiện theo D-130/D-131: desktop/mobile 8px và dải màu dưới header.

- D-123: Gỡ bullet/number ở toolbar, schema editor, phím tắt và renderer. Nội dung cũ giữ văn bản/xuống dòng/B/I/U, không migration hoặc sửa hàng loạt dữ liệu cloud. Dán HTML danh sách được chuyển thành đoạn văn.

- D-127: Trước tên trong chi tiết và inline edit có checkbox cho task (checked theo completedAt, cho bật/tắt) hoặc dấu gạch ngang tĩnh cho note. Lưu draft hợp lệ trước khi đổi trạng thái; tên task hoàn thành trong chi tiết không gạch ngang. Mobile giữ vùng chạm 44px.

- D-128: Hover checkbox/dấu note trong chi tiết không đổi nền. Marker dùng `.detail-title-marker` tách khỏi action có nền hover; nền checked của ô checkbox không đổi.

- D-129: Marker chi tiết không có đệm ngang, gap đến Tên 10px; pseudo-element của checkbox mở vùng bấm thành 44px, không đè input. Input Tên cao 28px. Mobile ẩn action lưu/hủy của Tên, blur lưu hợp lệ nhưng không tháo input trước click tiếp theo; chuyển trường/Enter vẫn thoát edit. Tên rỗng không lưu. Desktop giữ action rõ ràng.

- D-155 thay kích thước D-131: Ô chọn sắp xếp và nút đổi chiều có height/min-height 30px trên desktop/mobile; nút đổi chiều rộng 30px để giữ hình tròn. Header blur 8px ở cả hai kích thước, có WebKit.

- D-132: Focus vào metadata trong chi tiết tự lưu draft hợp lệ nhưng giữ editor/kích thước khung, để click không mất đích hoặc đóng nhầm khung. Lưu/chuyển trường vẫn kết thúc edit; Hủy chỉ bỏ thay đổi chưa tự lưu. Regression kiểm tra click thực, lưu qua reload, ngày, project, lưu trữ/khôi phục và xác nhận xóa ở 1280px/390px.

## 11. Theme — D-138

- `src/lib/theme.ts`: bootstrap JavaScript tĩnh, key versioned `spark:theme:v1`; kiểm tra preference, bắt lỗi storage, matchMedia và storage event. Chỉ nội suy hằng key do app sở hữu, không nội suy dữ liệu người dùng.
- `src/app/layout.tsx`: chạy bootstrap trong head trước paint. Root html suppressHydrationWarning cho dataset/style do bootstrap đặt. Theme-color do bootstrap sở hữu, không khai báo thêm trong Next viewport metadata để tránh React sinh meta trùng khi hydrate.
- `src/components/ThemePreference.tsx`: radio native truy cập bàn phím; useSyncExternalStore phản ánh preference. ThemeSync reapply trước paint sau React Strict Mode remount, không đặt state trong effect.
- `src/app/globals.css`: token light và dark ở đầu file; component dùng cùng selector. Neutral fallback giữ shade light, dark thống nhất theo vai trò. Brand Navy/CTA tách khỏi heading/selected/link semantic.
- Preference ở localStorage theo origin, không đổi schema hoặc sync dữ liệu. SW cache HTML chứa bootstrap như phần app shell; không thêm request hoặc thư viện.
- `tests/browser/theme.spec.ts`: hệ thống/override/reload/cross-tab/keyboard, storage lỗi, trước hydration, tương phản chữ, quick-add/editor 1280/390px, control 320px và cold-start offline. Không coi viewport giả lập là kiểm tra iPhone vật lý.

## Cập nhật D-145–D-146 (2026-10-06)

- Header thu gọn/mở lại trong 220ms; h1 giữ tỷ lệ 50% và tracking -0.025em. Cụm sync và All/Note/Task vẫn hiện trên desktop; mobile giữ cụm nổi trên dock. Eyebrow/thống kê ẩn khi compact. Dải màu 5px, blur 8px giữ nguyên; padding desktop 20px, mobile 15px cả bốn phía cộng safe-area theo D-161.
- Khởi động bằng lớp Navy #111742, logo negative gồm icon + chữ spark ở giữa và tiến trình theo giai đoạn. Chờ xác định phiên, cache đúng user, tải projects/items và xử lý queue; không render dữ liệu mẫu trong lúc chờ. Khi sẵn sàng, logo/thanh tiến trình fade 500ms rồi nền thu về phải trong 600ms (D-149).
- Local mới bắt đầu rỗng. Chỉ dọn bộ seed local cũ khi nhận diện đầy đủ và chưa sửa; giữ dữ liệu thật, bộ seed đã sửa/không rõ và toàn bộ dữ liệu cloud. Khi offline có cache thì mở bản lưu; lỗi đồng bộ có Thử lại và lựa chọn dùng dữ liệu đã lưu. Phần trăm là tiến trình từng bước, không phải phần trăm byte tải về.
- Chỉ bỏ Violet #8951C7 (và sắc nhãn #BA99DF), giữ Deep Purple #65458A. Dự án Violet chuyển Amber #D6A84F khi đọc local/cloud; cloud chỉ cập nhật trường color với điều kiện user/id/màu cũ. Queue ghi project cũng chuẩn hóa màu để không đưa Violet trở lại. Không đổi tên, quan hệ, thứ tự hay nội dung dự án.
- Quan Trọng Amber #D6A84F, Ưu tiên Coral #D9776A thống nhất toàn app ở cả hai theme. Preset dự án còn sáu màu; custom picker giữ nguyên. Mọi animation/transition dùng ease-out Quint `cubic-bezier(.22, 1, .36, 1)` và tôn trọng reduced motion.

## Keyboard theme và CSS — D-147/D-148

- Shortcut parser hỗ trợ `<`/`>`/`M` (`m`); App dispatch cùng `spark:theme-select` như radio. Guard vùng nhập/IME/modifier trước khi dispatch, theme shortcut được dùng trong dialog khi focus ngoài input; chỉ xử lý lần keydown đầu.
- CSS hiện không có `!important`. Token `--motion-duration`, `--motion-delay`, `--motion-iterations` chỉ khai báo trong media reduced motion; rule thường dùng fallback thời lượng gốc. Animationend của StartupScreen vẫn phải chạy. Khi thêm motion mới, dùng cùng token/fallback, không thêm blanket override.
- Dialog share surface/radius/padding/motion; mobile share radius/padding/max-height/overflow. Các rule riêng chỉ giữ khác biệt thực sự (width, chi tiết padding 0). Dữ liệu động (project color, swipe offset, pill width, progress) tiếp tục dùng inline value/custom property.
- Rà bằng parser CSS và source JSX: không còn selector trùng trong cùng ngữ cảnh media; giữ class được tạo động. 37 declaration dư đã bỏ, rule giảm 551→543; gzip stylesheet nguồn 12014→11973 byte là đo cùng công cụ, không phải cam kết cải thiện tốc độ tải.

### D-157 — Chi tiết mobile toàn màn hình (2026-10-26)

Ở màn hình dưới 700px, chi tiết task/note phủ toàn bộ vùng nhìn thấy, nền chung theo canvas của theme; khối Nội dung trong suốt, không có nền riêng hoặc padding bổ sung theo D-159. Chữ/control theo theme hiện hành. Không bo khung, không bóng hoặc lộ nền danh sách. Khi đọc, header và metadata giữ ở hai đầu, nội dung giãn phần còn lại và cuộn riêng. Khi sửa Nội dung trên mobile, D-163 ẩn header/Tên/metadata, chỉ giữ Lưu/Hủy, toolbar và vùng nhập. Có safe-area, khóa cuộn nền và theo visual viewport khi mở bàn phím. Khi ít chiều cao, phần giữa có thể cuộn để truy cập đủ tên/nội dung. Desktop giữ popup và theme hiện tại; quick-add không đổi.

### D-161 — Header mobile gọn hơn (2026-10-26)

Eyebrow mobile dùng weight 400. Header padding 15px cả bốn phía cộng safe-area; gap hàng menu/tên/sửa 4px. H1 còn 30px, tracking -0.025em; compact mobile 16px, dải màu còn 2.5px (D-162). Nút mở menu và sửa dự án giữ vùng bấm 44px, giảm khoảng trống hai đầu bằng margin ngoài. Desktop giữ typography và spacing hiện hành.

### D-162 — Kích thước header và active dock mobile (2026-10-26)

Eyebrow 0.75rem bằng dòng thống kê, weight 400. Tiêu đề 30px, compact 16px; padding 15px cộng safe-area. Dải màu thường 5px, compact 2.5px. Dock active không có nền riêng: icon dùng heading (#111742 sáng, #E9ECF5 tối) và nhãn bold; bảo đảm contrast ≥4.5:1 trên nền dock. Nút + tròn 64px, glyph 36px, nhô nhẹ lên khỏi dock 58px và chừa home indicator. Desktop giữ nguyên.

### D-163 — Sửa Nội dung tập trung trên mobile (2026-10-26)

Eyebrow view-header mobile 0.65rem/weight 400/letter-spacing 0; tiêu đề compact 21px (thay 16px), các kích thước khác của D-162 giữ nguyên. Khi sửa Nội dung task/note, tạm ẩn header Chi tiết, Tên và metadata, giữ hàng Nội dung với Lưu/Hủy, toolbar B/I/U và vùng nhập giãn theo visual viewport. Padding chừa safe-area; chỉ vùng nhập cuộn. Font nhập 16px để tránh iOS tự zoom ở cỡ chữ nhỏ. Lưu/Hủy quay lại chi tiết đầy đủ; Hủy bỏ draft, Lưu giữ format và dữ liệu. Desktop, quick-add và giới hạn 4.000 ký tự không đổi.

### D-164 — Khóa nền khi sửa trên mobile (2026-10-26)

Trong chi tiết task/note mobile, backdrop phủ toàn layout viewport; chỉ sheet theo visual viewport khi bàn phím mở. Khóa trang bằng body fixed tại vị trí cuộn đã lưu, khóa overflow/overscroll của root và đặt danh sách/sidebar/dock/control nền inert. Vuốt trong editor chỉ cuộn editor; chạm nền ngoài phần sheet do bàn phím co không đóng chi tiết. Đóng chi tiết hoặc chuyển sang desktop khôi phục style, tương tác và vị trí cuộn; header dùng vị trí đã lưu để không đổi trạng thái khi body bị khóa. Desktop giữ click nền để đóng.

## D-165 — Khoảng trống đáy editor khi mở bàn phím (2026-10-26)

Trong focus mode sửa Nội dung mobile, bỏ padding đáy 12px và safe-area dưới khi visual viewport co hơn 120px so với innerHeight ở scale xấp xỉ 1. Giữ padding trong vùng nhập để caret không sát mép; đóng bàn phím khôi phục 12px + safe-area ngay cả khi editor còn focus. Ngưỡng là heuristic để tránh nhầm thay đổi chrome trình duyệt; pinch zoom không kích hoạt. Giữ safe-area trên/hai bên, full backdrop và khóa nền D-164; desktop/quick-add không đổi. Thanh ↑/↓/Done của iOS giữ nguyên do trình duyệt quản lý. Cần kiểm tra iPhone thật để xác nhận phần khoảng hở còn lại do hệ thống.

## D-166 — Focus trực tiếp và chống cuộn vượt biên Nội dung mobile (2026-10-26)

Bấm Sửa Nội dung mount editor và đặt caret cuối tài liệu ngay trong click/tap, focus đồng bộ để iOS có thể mở keyboard theo user gesture; không dùng autofocus qua timeout. Chỉ cuộn editor tới cuối, không cuộn trang. Editor chỉ mount sau tương tác người dùng, không render Tiptap trên server. Trong focus mode mobile, touchmove một ngón theo chiều dọc bị chặn khi nội dung không đủ cuộn hoặc vuốt ra ngoài đầu/cuối vùng nhập; vuốt vào vùng có thể cuộn vẫn native. Listener chỉ trên backdrop chi tiết, cleanup khi đóng/đổi breakpoint; không chặn tap, pinch, vuốt ngang, nhấn giữ hoặc kéo vùng chọn. Lưu/Hủy và định dạng B/I/U không đổi. Bổ sung D-164/D-165; không thay thanh bàn phím iOS.

### Motion chi tiết mobile — D-167

`detail-motion.ts` quản lý touch gesture và exit/return với Web Animations API; `globals.css` giữ entry và nguồn duration/easing. `ItemEditor` giữ controller trong ref, cleanup listener/animation khi unmount và khôi phục khóa nền sau exit. Gesture chỉ nhận touch từ mép trái, xác nhận hướng ngang trước khi preventDefault; bỏ qua selection/control và reduced motion. Desktop không đổi. Regression: `tests/browser/mobile-detail-motion.spec.ts`.

### Browser chrome mobile — D-168

`themeBootstrap` sở hữu duy nhất theme-color/color-scheme meta và nền html/body trước paint. `useSidebarChrome` phát sự kiện từ state menu; bootstrap xử lý breakpoint để không giữ Navy trên desktop và không đổi preference. Cleanup trả về nền app. Next `appleWebApp: true` không tạo status-bar-style; object form tự thêm `default` nên title chuyển sang `metadata.other`. Manifest màu tĩnh #F7F8FA chỉ là fallback; dark/theme tùy chỉnh do bootstrap quyết định. CSS chỉ giảm padding trên hai selector gốc, giữ safe-area. Test `mobile-status-chrome.spec.ts` kiểm tra Chrome/DOM, không mô phỏng được system status bar iOS.

### Khôi phục theme sau khi nằm nền — D-169

Bootstrap theo dõi `visibilitychange`, `pageshow` và window `focus`; chỉ xử lý khi visible. Mỗi lần apply dùng truy vấn `matchMedia` mới để không phụ thuộc object/sự kiện trước khi bị suspend. Resume apply ngay rồi kiểm tra lại bằng một requestAnimationFrame; các sự kiện trùng hủy frame cũ và hidden hủy lượt chờ. Giữ preference trong bộ nhớ (kể cả khi ghi storage thất bại), không reload hoặc đổi state React. Regression `theme-resume.spec.ts` mô phỏng media không phát change, cả ba đường resume, draft đang nhập, sidebar, explicit override, storage bị chặn và media cập nhật sau sự kiện lifecycle. Nguồn API: [visibilitychange](https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event), [pageshow](https://developer.mozilla.org/en-US/docs/Web/API/Window/pageshow_event). Native status bar vẫn cần thử trên thiết bị.

### Phân lớp màu — D-170

`themeBootstrap` quản lý root/body và metadata dành cho vùng trình duyệt. CSS `--canvas` và `--app-color-scheme` theo data-theme quản lý app-shell; shell phải có nền đặc để root Navy không lộ qua danh sách. Tất cả dialog hiện là con của app-shell và kế thừa scheme này. Sidebar có scheme dark riêng trên nền Navy. Nếu thêm portal bên ngoài shell, phải đặt scheme của app cho portal thay vì kế thừa root. Không dùng màu chrome làm nền content.

| Theme hiện hành | Sidebar mobile | Nội dung / native controls | Root/body và chrome |
| --- | --- | --- | --- |
| Sáng | Đóng hoặc desktop | #F7F8FA / light | #F7F8FA / light |
| Sáng | Mở | #F7F8FA / light | #111742 / dark |
| Tối | Đóng hoặc desktop | #121622 / dark | #121622 / dark |
| Tối | Mở | #121622 / dark | #111742 / dark |

Preference cố định thắng OS; Theo hệ thống dùng media hiện hành. Test `theme-surfaces.spec.ts` kiểm tra bảng trạng thái, radio đổi theme phía trên menu, OS/cross-tab, đóng nhiều cách và breakpoint 699/700; hai test status/resume cũng xác nhận nền app và scheme của controls. Native iOS chrome không được mô phỏng bởi Chrome.

### Đồng bộ reveal và lớp phủ sidebar — D-171

StartupScreen xử lý onAnimationStart, lọc animationName startup-reveal rồi phát spark:theme-refresh trực tiếp. Handler bootstrap apply đồng bộ và đọc media mới; không có timer riêng. Bootstrap trước paint và các listener resume vẫn là nguồn theme duy nhất. Hai selector backdrop dùng chung layout nhưng tách hiệu ứng: dialog-backdrop giữ var(--overlay), mobile-nav-backdrop transparent + blur(20px), gồm khai báo WebKit. Không thay transition/duration hiện hành.

Regression startup-theme.spec.ts ghi nhận theme trước animation, mô phỏng media đổi im lặng khi loading sẵn sàng, rồi xác nhận màu và đúng một lượt refresh trong cùng sự kiện animationstart (capture ở document, đọc ở window sau React delegation). Bao phủ system/fixed, sáng/tối và reduced motion. Status/surfaces tests xác nhận sidebar trong suốt, blur 20px và dialog vẫn có lớp phủ riêng. Chrome không dùng tiền tố -webkit-backdrop-filter; kiểm tra computed prefix chỉ khi CSS.supports trả true. Chưa thay thế kiểm tra Safari/iOS vật lý.

### D-172 — Khắc phục màu lấy mẫu tại mép trên iOS (2026-10-27)

D-171 chưa giải quyết được native status bar theo kiểm tra thực tế của chủ dự án. Trong browser regression, bản cũ vẽ Navy tại mép trên khi metadata đã là sáng. WebKit có thể lấy màu từ fixed element trên cùng thay vì theme-color: [bug 305546](https://bugs.webkit.org/show_bug.cgi?id=305546). Mã nguồn [LocalFrameView.cpp](https://github.com/WebKit/WebKit/blob/d3afea7d89fd2b062ef39b644c3f026dc4904070/Source/WebCore/page/LocalFrameView.cpp) cho thấy sampling mép trên ở 4px, loại primary background của box cao <=10px và có đường giữ màu cũ cho container phủ viewport. Đây là cơ sở cho giải pháp; chưa chứng minh chính xác engine của iOS 27.0.1 trên máy người dùng đi qua nhánh nào.

Thêm browser-top-surface được render từ server, fixed full-width trên mobile, cao max(12px, safe-area-top), background đặc từ --browser-background, z-index 1001 trên splash, không pointer event/animation/blur. Nó cùng root/body/meta dùng nguồn theme duy nhất của bootstrap; đổi preference, OS hoặc resume cập nhật ngay, menu mở dùng Navy, đóng trả theme mới. Mép trên giữ theme cả khi loading, không phải chờ Navy reveal. Không tạo timer, fake scroll, reload hoặc xóa cache/dữ liệu. Padding header/sidebar thành max(12px, 8px + safe-area) để lớp nền không che text trên máy có inset 0; trên iPhone có inset >=4px không tăng khoảng trống.

Manifest bổ sung color_scheme_dark với background/theme #121622, giữ fallback sáng #F7F8FA. WebKit đã triển khai trường này theo [bug 311727](https://bugs.webkit.org/show_bug.cgi?id=311727); đây là fallback theo OS trước JS, không thay preference riêng của app. Không đổi start_url/scope/icon/identity và không yêu cầu gỡ/cài lại PWA. Không thể hứa bản PWA đã cài sẽ nhận manifest mới tức thì.

Regression status-edge.spec.ts chụp pixel ở y=4/5 trên loading thật đang pause, sau reveal, OS/fixed theme và sidebar; kiểm tra dark manifest. Đây là kiểm tra paint của trang, chưa đo được native status bar. Không coi metadata đúng là đủ bằng chứng. Giữ tests resume/startup-theme để kiểm tra thời điểm cập nhật.

### D-173 — Giảm blur phía sau sidebar (2026-10-27)

Theo yêu cầu mới, sidebar dùng backdrop-filter blur(10px) và -webkit-backdrop-filter blur(10px), thay 20px của D-171. Giữ nền phủ trong suốt, không làm tối nội dung. Không đổi blur header hoặc overlay dialog.

## D-174 — Bố cục loading (2026-10-27)

Theo yêu cầu mới nhất: logo còn 80% kích thước cũ (tối đa 256px, co tương ứng trên màn hẹp), căn giữa theo cả hai trục màn hình. Thanh tiến trình 3px sát mép trên, toàn chiều ngang; nhãn trạng thái và phần trăm căn giữa bên dưới, chừa safe-area để chữ không bị che. Nút thử lại/dùng cache căn giữa bên dưới nhãn.

Giữ fade 500ms và reveal 600ms Quint, reduced motion, trạng thái lỗi/offline và đồng bộ theme lúc reveal. Mobile mở đúng 3px đầu của browser-top-surface bằng clip-path chỉ trong lúc loading để hiện progress; vùng lấy mẫu y=4/5 của D-172 vẫn giữ màu theme. Không đổi màu status bar hoặc chiều cao safe-area.

## D-175 — Loading liền Navy, đổi màu mép trên tại reveal (2026-10-27)

Sửa dải sáng dưới progress của D-174: khi startup chưa reveal, browser-top-surface dùng Navy #111742, liền nền loading ở cả theme sáng/tối. Ngay trong animationstart của startup-reveal, StartupScreen đánh dấu data-revealing rồi phát theme-refresh đồng bộ: lớp nền đặc trở về --browser-background theo theme hiện hành, không chờ hết animation và không thêm delay. Khi startup unmount, selector tự hết hiệu lực. Giữ lớp fixed để WebKit lấy mẫu, phần hở 3px cho progress, logo ở giữa, safe-area, metadata và đường cập nhật theme/resume. D-175 thay quy tắc mép trên dùng màu theme xuyên suốt loading của D-172.

Regression kiểm tra pixel Navy trong loading, màu theme sau loading và computed màu lớp fixed ngay trong sự kiện reveal (system/fixed, sáng/tối, reduced motion). Browser kiểm tra được màu trang cung cấp; native status bar iOS vẫn cần xác nhận trên thiết bị thật.

## D-176 — Tách nền loading khỏi vùng status bar (2026-10-27)

Sau kiểm tra thực tế iPhone, D-175 vẫn để status bar giữ Navy một lúc sau loading. Không tiếp tục đổi màu vùng lấy mẫu từ Navy về theme. browser-top-surface luôn dùng --browser-background theo theme ngay từ đầu, không clip-path và không override màu khi startup. Nền Navy và progress cùng bắt đầu ngay dưới vùng này: top=max(12px, safe-area-top) trên mobile, top=0 desktop. Dải màu theme nằm phía trên thanh tiến trình và nối với status bar; phía dưới thanh luôn liền Navy. Chủ dự án đã cho phép dời thanh về mép trên phần nền Navy.

Dùng một token --browser-top-height cho vùng màu, nền loading và thanh tiến trình. Caption cách thanh 12px, không cộng safe-area lần thứ hai. Logo vẫn nhỏ hơn 20% và ở tâm toàn màn hình. Giữ refresh tại reveal, resume/fixed/system theme, timing Quint và reduced motion. Bỏ marker data-revealing và hai selector startup đổi màu/clip vì không còn cần. D-176 thay phần màu loading của D-175.

Không khẳng định độ trễ native iOS bằng 0ms từ kiểm tra Chrome: thay đổi này tránh cho trang cung cấp Navy ở vùng lấy mẫu trong suốt startup; vẫn cần xác nhận trên iPhone thật.

## D-177 — Sidebar blur 5px (2026-10-27)

Theo yêu cầu mới, giảm blur phía sau sidebar từ 10px xuống 5px cho cả backdrop-filter và -webkit-backdrop-filter. Giữ nền phủ trong suốt. Thay giá trị D-173; không đổi blur header, overlay dialog hoặc trạng thái màu.

## D-178 — Sidebar blur 2px (2026-10-27)

Giảm blur phía sau sidebar từ 5px xuống 2px theo yêu cầu mới, áp dụng cho backdrop-filter và -webkit-backdrop-filter. Giữ nền phủ trong suốt. Thay giá trị D-177; các hiệu ứng khác giữ nguyên.

## D-179 — Sidebar trong suốt và màn hình tiện ích toàn màn hình (2026-10-27)

Bỏ hoàn toàn backdrop-filter/-webkit-backdrop-filter phía sau sidebar; lớp phủ vẫn trong suốt và chạm ngoài vẫn đóng menu. Thay blur 2px của D-178. Phím tắt & hiển thị và Đồng bộ hiển thị toàn viewport trên mobile lẫn desktop, nền canvas theo sáng/tối, không bo góc/đổ bóng hoặc lộ danh sách quanh box. Nội dung đọc được giới hạn 640px, căn giữa trên desktop; header/nút đóng sticky, safe-area trên/dưới và cuộn nội bộ.

Hai màn hình dùng chung cơ chế focus trap/Escape/khôi phục focus hiện có (đổi tên useProjectDialog thành useDialogControls), không tự mở bàn phím khi vừa vào Đồng bộ. Tái sử dụng scroll lock để khóa nền, điều chỉnh viewport theo visualViewport khi bàn phím mở, gỡ listener/khôi phục cuộn khi đóng. Phím điều hướng nền tạm dừng khi tiện ích đang mở; shortcut theme vẫn hoạt động ngoài input. Không đổi luồng gửi/xác nhận OTP hoặc dữ liệu/auth.

Khi tiện ích phủ lên sidebar, chrome dùng theme của tiện ích; đóng tiện ích trả chrome về Navy nếu sidebar vẫn mở. Sidebar giữ trạng thái mở để quay lại. Bỏ các rule box/mobile max-height cũ của shortcut/sync thay vì chồng override. Các dialog khác giữ bố cục cũ.

## D-180 — Bố cục Phím tắt, Đồng bộ và sidebar mobile (2026-10-27)

Sidebar mobile bỏ nút X; chạm ngoài menu, chọn mục điều hướng hoặc Escape vẫn đóng menu. Phím tắt chia bốn nhóm Điều hướng, Lọc nội dung, Thao tác và Giao diện theo lưới hai cột; tên thao tác bên trái, phím bên phải. Ghi chú về bàn phím nằm ngay dưới danh sách phím tắt, trước hàng Giao diện. Hàng Giao diện dùng nhãn trái và ba icon bên phải: màn hình (Theo hệ thống), mặt trời (Sáng), mặt trăng (Tối). Bỏ dòng mô tả phụ và chữ trên lựa chọn; giữ tên truy cập, tooltip và điều khiển radio bằng bàn phím. Icon 18px trong vòng tròn 32px; vùng bấm desktop 36px, mobile 44px.

Phím tắt và Đồng bộ giữ headline ở đầu màn hình, nội dung căn giữa phần còn lại khi đủ chỗ. Khi thiếu chiều cao, chỉ phần nội dung cuộn; header vẫn nhìn thấy. Desktop đặt nút X tại góc trên bên phải viewport, cách mép 20px hoặc safe-area lớn hơn; mobile giữ X cùng hàng tiêu đề. Giữ nền sáng/tối, focus trap, khóa cuộn nền và xử lý bàn phím của D-179.

`.utility-content` dùng flex column toàn chiều cao; `.utility-body` là vùng cuộn có min-height:0, `.utility-body-inner` dùng margin-block:auto để căn giữa mà không cắt nội dung dài. Nút X desktop định vị absolute trong `.utility-screen`, độc lập chiều rộng đọc 640px. Không đổi luồng OTP hoặc dữ liệu.

## D-181 — Rút gọn màn hình Đồng bộ (2026-10-27)

Bỏ hai khối giải thích 01/02 khỏi bước kết nối Đồng bộ trên mobile và desktop. Bước này chỉ giữ ô email và nút gửi mã kết nối; bỏ đường phân cách dư trước form. Trên desktop, headline nằm ngay trên form và cả cụm được căn giữa màn hình, nút X giữ ở góc trên bên phải. Mobile giữ headline ở đầu màn hình và form căn giữa phần còn lại. Giữ nguyên luồng OTP, trạng thái đã kết nối, theme và khóa cuộn nền; màn Phím tắt không đổi.

## D-182 — Tiêu đề Phím tắt desktop sát nội dung (2026-10-27)

Desktop dùng chung bố cục cho Phím tắt và Đồng bộ: tiêu đề nằm ngay trên nội dung, cả cụm căn giữa khi đủ chiều cao; màn hình thấp cuộn toàn cụm để không cắt phần đầu. Nút X giữ tại góc trên bên phải viewport. Mobile giữ tiêu đề ở đầu và nội dung căn giữa phần còn lại. Chủ dự án xác nhận sự cố loading trên điện thoại do Wi-Fi và yêu cầu dừng điều tra; không thay đổi đăng nhập, loading hoặc cache.

## D-183 — Chi tiết desktop toàn màn hình (2026-10-27)

Chi tiết task/note trên desktop phủ toàn viewport bằng nền canvas sáng/tối, bỏ box, bo góc và shadow. Bỏ nhãn TASK/GHI CHÚ và heading “Chi tiết task/ghi chú” ở cả desktop/mobile; dialog dùng tên thật của mục làm nhãn truy cập. Cột tên + Nội dung dùng cùng độ rộng canvas danh sách theo viewport và trạng thái sidebar (token --canvas-width). Cụm ngắn căn giữa phần màn hình còn lại; cụm dài giới hạn chiều cao và cuộn riêng phần Nội dung, giữ nút sửa dễ truy cập. Khi sửa Nội dung, editor tận dụng chiều cao khả dụng. Metadata và Xóa neo sát đáy, căn theo cùng cột; nút X luôn ở góc trên bên phải, cách mép 20px. Khóa cuộn và tương tác danh sách nền cả desktop, khôi phục khi đóng. Mobile giữ bố cục và focus mode hiện hành; wrapper mới dùng display:contents trên mobile.

## D-184 — Neo chi tiết desktop và căn giữa quick-add (2026-10-27)

Desktop: hàng tên task/note bắt đầu ở y=80px; cột chi tiết luôn dùng cùng chiều cao khả dụng ở cả trạng thái đọc/sửa, thay cách căn giữa nội dung ngắn của D-183. Khi sửa Nội dung, toolbar B/I/U chuyển vào cùng hàng với label Nội dung; padding vùng nhập bằng vùng đọc để không đẩy chữ hoặc tên mục. Giữ metadata ở đáy và X ở góc phải. Mobile giữ focus mode sửa nội dung hiện hành. Quick-add căn giữa ngang/dọc trên cả desktop và mobile, giới hạn chiều cao form trong vùng nhìn thấy và cho form cuộn khi mở bàn phím hoặc có nhiều nội dung.

## D-185 — Tinh chỉnh editor desktop (2026-10-27)

Ô sửa tên desktop bỏ gạch dưới, giữ màu heading như khi đọc. Nội dung đang sửa dùng cùng màu text-secondary với nội dung đang xem, nền vẫn trong suốt. Toolbar B/I/U cao 34px (tăng 6px), nút 30px, giữ cùng hàng với label Nội dung và căn giữa theo hàng; không dịch tên hoặc điểm bắt đầu nội dung. Giữ màu toolbar và bố cục chi tiết mobile hiện hành. Quick-add: vùng nhập Nội dung cao 300px khi mở Thêm Nội dung trên cả desktop/mobile; form vẫn căn giữa, giới hạn theo viewport và cuộn được khi bàn phím mở.

## D-186 — Toolbar desktop 30px (2026-10-27)

Toolbar định dạng trong chi tiết desktop cao 30px, nút 26px; bắt đầu cách mép phải nhãn Nội dung khoảng 200px. Giữ cùng hàng, màu hiện hành và vị trí tên/nội dung. Nếu cột quá hẹp, khoảng cách tự giảm để còn đủ chỗ cho toolbar và nút lưu/hủy. Mobile và quick-add giữ nguyên.

## D-187 — Căn giữa toolbar desktop (2026-10-27)

Toolbar định dạng được căn giữa theo chiều ngang trong cột chi tiết desktop, giữ chiều rộng responsive của D-186 và chiều cao 30px. Thay khoảng cách cố định với nhãn Nội dung bằng căn giữa; giữ hàng hiện hành, màu sắc, vị trí tên/nội dung, mobile và quick-add.

## D-188 — Quick-add mobile tập trung và đồng bộ tiện ích (2026-10-28)

Desktop: toolbar Nội dung giữ cao 30px, chiều rộng và căn giữa ngang; căn giữa dọc theo nhãn Nội dung và nút lưu/hủy, chừa 14px bên dưới trước vùng chữ. Cùng khoảng cách ở trạng thái đọc/sửa để không làm dịch tên hoặc nội dung.

Đồng bộ trên desktop/mobile: eyebrow “ĐỒNG BỘ TỪ CLOUD”; heading “Dữ liệu luôn bên bạn, trên mọi thiết bị.”; nhãn tài khoản “Tài khoản”. Badge tick màu trắng trên vòng tròn Navy. Ngắt kết nối là nút nền Coral nhạt, có icon thoát; giữ luồng đăng nhập/đăng xuất hiện hành. Nhãn Điều hướng, Lọc nội dung, Thao tác, Giao diện của Phím tắt dùng cùng token heading như Mở tên dự án khi chạm.

Quick-add mobile phủ toàn màn hình theo theme: header và nút đóng ở trên, tên/loại/nội dung trong vùng cuộn; metadata gọn với hai ngày cùng hàng, dự án toàn hàng và hành động ở dưới. Thêm Nội dung mở chế độ tập trung, ẩn các phần khác, chỉ còn nhãn/Xong, toolbar và vùng nhập tận dụng chiều cao còn lại. Cursor vào cuối và mở bàn phím trong thao tác chạm. Xong hoặc Escape quay về form, giữ nguyên nháp và định dạng; chọn Sửa Nội dung mở lại. Chỉ Thêm mới tạo task/note. Giữ giới hạn 4000 ký tự, B/I/U và các quy tắc ngày. Khóa cuộn nền, cập nhật theo visualViewport, bỏ khoảng safe-area dưới dư khi keyboard mở. Quick-add desktop giữ bố cục căn giữa và vùng nhập 300px.

Chi tiết mobile: tên bắt đầu cách mép trên 16px cộng safe-area, checkbox/dấu gạch ngang căn với dòng đầu tên. Nút đóng nằm góc trên phải, có khoảng riêng trong hàng tên để không đè nút sửa. Giữ chế độ sửa Nội dung riêng và thao tác vuốt đóng.

## D-189 — Tinh gọn mobile và cách ly quick-add (2026-10-28)

Chỉ đổi mobile (<700px); giữ giao diện desktop của D-188. Phím tắt và Đồng bộ: nội dung tiếp ngay sau headline, cách 16px, bỏ căn giữa dọc. Nút X cố định 44×44px, không co ngang khi headline dài.

Sửa tên trong chi tiết dùng ô tự giãn nhiều dòng theo độ dài, không gạch dưới; giữ giới hạn 100 ký tự và dữ liệu tên một dòng, Enter hoặc đổi focus để lưu, Escape hủy. Không thêm nút lưu/hủy vào hàng tên mobile.

Quick-add: lớp nền canvas đặc luôn che toàn màn hình kể cả khi bàn phím làm co/dịch vùng nhìn; chỉ form bên trong bám visualViewport. Khóa cuộn trang và các nhánh nền quanh quick-add, chặn kéo quá biên khi nội dung ngắn; khôi phục vị trí cuộn và tương tác khi đóng. Metadata giữ hai ngày cùng hàng; hàng dưới gồm selector dự án (ẩn label nhìn thấy, giữ nhãn truy cập), Hủy và Thêm. Giữ chế độ nhập Nội dung tập trung và bản nháp.

## D-190 — Phân loại trong quick-add mobile (2026-10-28)

Mobile: hàng dưới tên gồm Ghi chú, Nội dung và Phân loại. Ngày bắt đầu, ngày đến hạn và dự án mặc định ẩn; Phân loại mở nhóm chọn ở đáy form, có nút X để ẩn. Ẩn/mở lại giữ nguyên các lựa chọn; Escape chỉ ẩn Phân loại trước khi đóng quick-add. Mở Nội dung chuyển sang chế độ nhập tập trung và ẩn Phân loại.

Hủy (icon X) và Thêm (icon +) căn giữa theo chiều ngang ở đáy; khi mở Phân loại vẫn nằm bên dưới nhóm chọn. Giữ lớp phủ đặc, khóa cuộn nền, giới hạn theo bàn phím/visualViewport; phần Phân loại cuộn riêng khi thiếu chiều cao. Không đổi quy tắc ngày, project mặc định, dữ liệu/nháp hoặc giao diện desktop.

## D-191 — Quick-add mobile: Hủy rõ hơn, Phân loại nổi (2026-10-28)

Bỏ nút X ở góc trên quick-add mobile; Hủy là nút có viền và nền surface, cùng vùng bấm tối thiểu 44px như Thêm. Ba nút Ghi chú, Nội dung, Phân loại chia đều hàng, cách nhau 10px ở 320px trở lên. Khi mở Phân loại, phần chọn xuất hiện như một sheet neo mép dưới, phủ lên Hủy/Thêm; nút X trong sheet hoặc Escape chỉ ẩn Phân loại, giữ mọi lựa chọn. Đóng sheet đưa Hủy/Thêm trở lại. Desktop giữ bố cục hiện hành; không đổi dữ liệu và quy tắc ngày.

## D-192 — Màu và chữ quick-add mobile (2026-10-28)

Ba pill Ghi chú, Nội dung, Phân loại dùng cùng cỡ chữ 12px và weight 600. Nền dùng token surface: trắng trong giao diện sáng, surface tối trong giao diện tối để giữ tương phản chữ; khi hover/chạm vẫn giữ nền pill. Sheet Phân loại dùng token well để tách rõ với canvas bên dưới ở cả hai theme; bỏ bo góc, giữ viền trên và bóng nhẹ. Chỉ thay style mobile, giữ kích thước/vùng bấm và tương tác D-191.

## D-193 — Xem trước Nội dung quick-add mobile (2026-10-28)

Sau khi nhập Nội dung và bấm Xong, bản nháp hiển thị thành chữ thường trên nền trong suốt, không có padding hoặc giới hạn chiều cao 112px. Toàn bộ văn bản xuống dòng trong vùng form và cuộn cùng quick-add; icon sửa vẫn mở lại editor, giữ dữ liệu và định dạng khi lưu mục. Không thay đổi editor tập trung hoặc giao diện desktop.

## D-194 — Đóng quick-add sau khi thêm; Phân loại mobile không bóng (2026-10-28)

Sau khi lưu task/note thành công, quick-add đóng trên desktop và mobile, đưa người dùng về đúng view đã mở trước đó; nút Hủy vẫn đóng mà không lưu. Trên mobile, sheet Phân loại giữ nền tương phản và viền trên 1px, bỏ shadow. Điều chỉnh phần bóng của D-192.


## D-195 — Quick-add mobile: nội dung cuộn riêng, hành động trên nền mờ (2026-10-28)

Tên và hàng Ghi chú/Nội dung/Phân loại đứng yên ở đầu quick-add khi xem trước Nội dung dài. Chỉ vùng Nội dung cuộn; dòng cuối luôn kéo lên được phía trên Hủy/Thêm. Hàng Hủy/Thêm neo đáy trên nền canvas bán trong suốt, blur 12px và viền trên nhẹ. Khi mở Phân loại hoặc sửa Nội dung tập trung, giữ hành vi overlay và bàn phím hiện hành. Desktop không đổi.
