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

### Hai chế độ dữ liệu

**Khuyến nghị cho MVP: cloud sync ngay từ đầu.** Đăng nhập passwordless bằng mã OTP gửi qua email, dữ liệu lưu ở Supabase và được bảo vệ theo user. Người dùng nhập mã ngay trong Spark để tránh magic link bị mở ở browser khác trên mobile. Cách này cho phép iPhone và desktop thấy cùng một danh sách.

Email template của hosted Supabase phải dùng `{{ .Token }}` để gửi OTP 6 chữ số thay vì `{{ .ConfirmationURL }}`. Client chỉ giữ ký tự số, giới hạn đúng 6 ký tự và không gọi `verifyOtp` khi mã chưa khớp `^[0-9]{6}$`.

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
| `description` | text nullable | task/note, plain text 1–2.000 ký tự khi có giá trị; copy UI là “Nội dung” |
| `due_date` | date nullable | date-only |
| `completed_at` | timestamptz nullable | chỉ dùng cho task; note luôn null |
| `archived_at` | timestamptz nullable | chỉ dùng cho note; task luôn null |
| `is_important` | boolean | mặc định false |
| `is_urgent` | boolean | mặc định false |
| `position` | integer | ổn định thứ tự |
| `created_at` | timestamptz | audit |
| `updated_at` | timestamptz | audit/sync |

Ràng buộc: `type = 'note'` thì `completed_at` phải null; `type = 'task'` thì `archived_at` phải null. Cả hai loại dùng title 1–100 ký tự và description nullable tối đa 2.000 ký tự. Constraint mới dùng `NOT VALID` để không làm migration thất bại vì dữ liệu cũ. Chỉ mục nên có: `(user_id, type, completed_at, due_date)`, `(user_id, project_id, completed_at)`, `(user_id, archived_at)`, `(user_id, is_important)` và `(user_id, is_urgent)`.

### Bảo mật

- Bật Row Level Security trên mọi bảng public.
- Policy `select/insert/update/delete` chỉ cho phép khi `auth.uid() = user_id`.
- Không đưa service-role key xuống client.
- Validate title/description/date/project ownership ở boundary ghi dữ liệu.

## 3. Date logic

Tạo một module thuần, ví dụ `src/lib/task-filters.ts`, không rải logic ngày trong component.

- `today`: task chưa hoàn thành có `due_date <= localToday` hoặc chưa có ngày; note chưa lưu trữ chỉ xuất hiện khi có `due_date <= localToday`. Chia thành `overdue` và `dueToday`, trong đó task không ngày nằm cùng nhóm Hôm nay; note không ngày bị ẩn.
- `upcoming`: `localTomorrow <= due_date <= localToday + 3 calendar days`.
- `byDate`: `due_date === selectedDate`.
- `all`: lấy mọi item còn hiện hành rồi chia `overdue`, `today`, `upcoming` (ba ngày kế tiếp), `later` và `undated`; completed task và archived note nằm trong disclosure trạng thái riêng.
- `filterItems` và `inactiveForView` nhận thêm metadata projects để loại item của project có `archivedAt` khỏi bốn master view trước khi sort/group/display filter và tính số đếm sidebar/header. Project view và smart filter không bị ảnh hưởng; không sửa item.
- Trong `inactiveForView` của Hôm nay, task được chọn theo `getLocalDateKey(new Date(completedAt)) === localToday` (Asia/Ho_Chi_Minh), không theo due date; timestamp không hợp lệ không được hiển thị. Các view khác và archived note giữ quy tắc due date hiện tại.
- Riêng view Hôm nay, header nhóm Quá hạn và Hôm nay là disclosure độc lập, mặc định mở, dùng cùng icon/kiểu tương tác với disclosure trạng thái cuối danh sách.
- Trạng thái `itemDisplayMode: 'all' | 'task' | 'note'` là presentation filter dùng chung cho mọi view; áp dụng sau master/smart/project filter, trước khi chia nhóm và tính số quá hạn hiển thị. Không ghi thay đổi xuống item.
- Presentation sort dùng `task` trước `note`; sau đó sort `due_date` tăng dần và `created_at`. Riêng view `all`, chia nhóm thời gian trước rồi áp dụng comparator này trong từng nhóm. Không ghi lại `position` chỉ để phản ánh thứ tự hiển thị.
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
- Quick-add giữ checkbox Ghi chú. Secondary button **Thêm Nội dung** mở textarea tùy chọn tối đa 2.000 ký tự cho cả task và note; chuyển loại không xóa draft. Chọn ngày và dự án vẫn hoạt động cho cả hai loại item.
- Tap item mở detail sheet ở trạng thái đọc. Tên/Nội dung chỉ chuyển sang input/textarea khi bấm edit icon kế text; metadata compact lưu từng thay đổi ngay mà không cần submit cả form.
- Canvas liệt kê task/note ở desktop dùng `width: clamp(940px, 80vw, 1200px)` cùng `max-width: 100%` để co theo vùng content khi viewport hẹp; mobile override về `width: 100%`. Detail sheet desktop giữ `width: min(780px, calc(100vw - 48px))`.
- Textarea Nội dung của task và note dùng chung kích thước: desktop edit đặt `height/min-height: 300px`, desktop quick-add đặt `160px`; media mobile override cả `.detail-inline-editor textarea` và `.quick-description-field textarea` về `160px`. Trong edit Tên/Nội dung, đặt action ✓ và × trong `.detail-field-heading` cạnh nhãn, còn `.detail-inline-editor` dùng toàn chiều rộng bên dưới. Action control là `28px`/icon `16px` trên desktop; mobile giữ touch target `44px`/icon `18px`.
- Vùng nội dung item kiểm tra `openSwipeItemId` chung: trên mobile, nếu bất kỳ khay nào mở thì `onClick` chỉ đóng khay; nếu không có khay mở thì một click mở chi tiết. Quy tắc áp dụng khi chạm cùng item hoặc item khác, kể cả khác nhóm. Pointer-down/up của tap thường không được xóa trạng thái khay trước `onClick`. Desktop vẫn mở bằng một click. Chỉ bật style kéo sau khi xác định gesture ngang, không đổi nền/transform ở pointer-down của tap thường. Click phát sinh từ vuốt/cuộn/cancel bị chặn đến pointer-down mới, không reset bằng timer; activation bàn phím/assistive technology (`detail === 0`) vẫn hoạt động. Checkbox/marker và action khay không mở chi tiết.
- Read row trong detail sheet dùng text column co giãn và edit action `flex: 0 0 auto` ở mép phải; khối Nội dung nhiều dòng căn action theo mép trên.
- Metadata detail mobile dùng grid ba cột: Quan Trọng, Ưu tiên, Ngày ở hàng đầu; Dự án full-width; cụm Lưu trữ/Xóa icon-only 44px căn phải ở hàng cuối. Label vẫn tồn tại qua `aria-label`/tooltip; Xóa tiếp tục qua confirm dialog.
- Linkify Nội dung bằng parser text thuần và React node, không dùng `dangerouslySetInnerHTML`. Chỉ nhận `http://`, `https://` và `www.`; link dùng `target="_blank"` cùng `rel="noopener noreferrer"`, còn giá trị lưu trong database vẫn là plain text.
- Comparator hiển thị áp thứ hạng động `is_important && is_urgent` → `is_urgent` → `is_important` → bình thường, sau đó mới task/note, due date và created time. Không persist rank; cập nhật cờ phải làm list tự sort lại từ state hiện tại.
- Desktop floating trigger dùng artwork `+` 32px trong hit target 48px ở góc dưới phải. Mobile dùng dock `position: fixed` cao 58px và nút `+` 72px ở giữa; list phải chừa bottom space cộng safe-area để dock không che item cuối.
- Trên mobile, sau user gesture mở quick-add phải focus title input; dùng `window.visualViewport` resize/scroll để fit backdrop vào vùng còn thấy khi bàn phím mở và gọi `scrollIntoView` cho field. Cleanup listener/timer khi đóng; desktop giữ layout overlay hiện tại.

### Sidebar và keyboard shortcuts

- Sidebar có hai trạng thái: `expanded` và `compact`; lưu lựa chọn cục bộ để giữ sau reload.
- Sidebar toggle dùng icon panel-chevron theo trạng thái: chevron trái khi expanded để collapse, chevron phải khi compact để mở lại; mobile header dùng trạng thái mở sidebar.
- Rail compact rộng khoảng `56px`; hai nhóm Cần lưu ý và Dự án có trạng thái mở/đóng riêng được lưu cục bộ.
- Mobile sidebar giữ full negative logo và nút đóng, nhưng ẩn nhóm view Hôm nay/Sắp tới/Theo ngày/Tất cả đã chuyển xuống dock. Drawer mở bằng panel icon-only trong sticky header hoặc drag từ mép trái sang phải và dùng transition `transform` ngắn để có motion liên tục.
- Project có thể gắn sao; `is_starred` được đồng bộ cloud và project được hiển thị trong Cần lưu ý.
- Project editor giữ bảy màu preset và dùng lựa chọn thứ tám là native `input[type=color]` trong nút đa sắc cho màu tùy ý. Giá trị custom tiếp tục lưu vào `projects.color`; so sánh preset không phân biệt hoa/thường. Mobile render swatch strip cuộn ngang để giữ touch target 44px.
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
- Favicon, PWA icon và Apple Touch Icon dùng mark negative trắng trên Navy. Standard PWA icon dùng rounded-square; maskable/Apple dùng Navy full-bleed, giữ artwork trong safe zone và scale mark còn 80% treatment trước để tăng khoảng thở.
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
4. Cấu hình cùng environment variables trên Vercel.
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
