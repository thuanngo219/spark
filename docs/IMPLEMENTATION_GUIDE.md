# Implementation Guide

## 1. Kiến trúc đề xuất

### Stack

- **Frontend/full-stack:** Next.js App Router + TypeScript.
- **Styling:** Tailwind CSS hoặc CSS Modules + CSS variables. Dùng design tokens, không hard-code màu lặp lại trong component.
- **Backend đồng bộ:** Supabase Postgres + Supabase Auth.
- **Deploy:** Vercel.
- **PWA:** Web App Manifest, icon set, standalone display; service worker/offline cache triển khai theo phase.
- **Testing:** Vitest cho date/filter logic; Playwright cho luồng chính và responsive.

Lý do chọn cấu hình này: một codebase chạy desktop lẫn iPhone, deploy qua HTTPS nhanh, hỗ trợ đăng nhập và đồng bộ dữ liệu mà không cần tự vận hành server.

### Hai chế độ dữ liệu

**Khuyến nghị cho MVP: cloud sync ngay từ đầu.** Đăng nhập passwordless bằng mã OTP gửi qua email, dữ liệu lưu ở Supabase và được bảo vệ theo user. Người dùng nhập mã ngay trong Spark để tránh magic link bị mở ở browser khác trên mobile. Cách này cho phép iPhone và desktop thấy cùng một danh sách.

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
| `title` | text | task 1–200, note 1–500 ký tự |
| `due_date` | date nullable | date-only |
| `completed_at` | timestamptz nullable | chỉ dùng cho task; note luôn null |
| `is_important` | boolean | mặc định false |
| `is_urgent` | boolean | mặc định false |
| `position` | integer | ổn định thứ tự |
| `created_at` | timestamptz | audit |
| `updated_at` | timestamptz | audit/sync |

Ràng buộc: `type = 'note'` thì `completed_at` phải null. Chỉ mục nên có: `(user_id, type, completed_at, due_date)`, `(user_id, project_id, completed_at)`, `(user_id, is_important)` và `(user_id, is_urgent)`.

### Bảo mật

- Bật Row Level Security trên mọi bảng public.
- Policy `select/insert/update/delete` chỉ cho phép khi `auth.uid() = user_id`.
- Không đưa service-role key xuống client.
- Validate title/date/project ownership ở boundary ghi dữ liệu.

## 3. Date logic

Tạo một module thuần, ví dụ `src/lib/task-filters.ts`, không rải logic ngày trong component.

- `today`: `due_date <= localToday` và item còn hiện hành; với task yêu cầu chưa hoàn thành, note không kiểm tra completed state; chia `overdue` và `dueToday`.
- `upcoming`: `localTomorrow <= due_date <= localToday + 3 calendar days`.
- `byDate`: `due_date === selectedDate`.
- `all`: lấy mọi item còn hiện hành rồi chia `overdue`, `today`, `upcoming` (ba ngày kế tiếp), `later` và `undated`; completed task vẫn ở disclosure riêng.
- Trạng thái `hideNotes` là presentation filter dùng chung cho mọi view; áp dụng sau master/smart/project filter, trước khi chia nhóm và tính số quá hạn hiển thị. Không ghi thay đổi xuống item.
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
- Mỗi mutation cloud được lưu vào queue theo user trước khi gửi, ghi tuần tự và retry với exponential backoff tối đa 30 giây. Không xóa mutation khỏi queue trước khi server xác nhận.
- Nếu server trả lỗi hoặc thiết bị offline, giữ optimistic state và mutation queue trên thiết bị, hiển thị trạng thái rõ; tự gửi lại khi có mạng thay vì rollback làm mất nội dung.
- Khi nhận snapshot remote, overlay toàn bộ mutation chưa xác nhận trước khi cập nhật UI để snapshot cũ không ghi đè thay đổi local.
- Reconcile lại sau khi Realtime subscribe/reconnect, browser phát sự kiện `online`, tab/PWA trở lại foreground hoặc focus; chạy safety pull mỗi 60 giây khi tab đang visible.
- Cache demo tách khỏi cache cloud và cache cloud được namespace theo user ID.
- Xóa dùng soft/undo ở UI; chỉ hard delete sau khi hết thời gian undo hoặc triển khai trường `deleted_at` nếu cần an toàn hơn.
- Không dùng global state library ở MVP nếu server cache + component state đã đủ.
- Giữ unsaved quick-add text khi app chuyển offline ngắn.
- Quick-add overlay phải có `role="dialog"`, `aria-modal="true"`, đóng được bằng Hủy, click backdrop và phím Escape; khi đóng trả focus về nút “Thêm công việc”.
- Floating trigger dùng artwork `+` 32px trong hit target 48px, `position: fixed` ở góc dưới phải có safe-area mobile; list phải chừa bottom space để trigger không che item cuối.

### Sidebar và keyboard shortcuts

- Sidebar có hai trạng thái: `expanded` và `compact`; lưu lựa chọn cục bộ để giữ sau reload.
- Rail compact rộng khoảng `56px`; hai nhóm Cần lưu ý và Dự án có trạng thái mở/đóng riêng được lưu cục bộ.
- Project có thể gắn sao; `is_starred` được đồng bộ cloud và project được hiển thị trong Cần lưu ý.
- Ở compact state, filter dùng icon + count; project dùng dot màu lớn. Tất cả icon-only controls phải có accessible label và tooltip.
- Dùng một keyboard shortcut handler tập trung, không gắn listener rải rác trong component.
- Hỗ trợ chuỗi `S T` → Today, `S S` → Upcoming, `S D` → By date, `S A` → Tất cả, `S I` → Quan Trọng, `S U` → Ưu tiên và `S 1–9` → chín project đầu theo thứ tự compact sidebar; `[` toggle sidebar và `?` mở trợ giúp.
- Compact sidebar dùng tooltip tức thời cho navigation icon, project dot và footer action; tooltip project kèm shortcut `S 1–9` khi có.
- Bỏ qua shortcut khi event phát sinh trong `input`, `textarea`, `select` hoặc phần tử `contenteditable`; `Escape` hủy pending sequence.
- Hiển thị pending-key hint sau `S` và tự reset sau khoảng 1.000ms.
- Test: từng mapping điều hướng đúng, sequence hết hạn, Escape hủy, không chạy khi nhập task và sidebar preference được restore.

## 6. PWA và iPhone

Để app có cảm giác native-like:

- Có manifest với `name`, `short_name`, `start_url`, `display: "standalone"`, `background_color`, `theme_color` và icon 192/512px.
- Thêm Apple touch icon và màu theme phù hợp.
- Deploy qua HTTPS; đây là yêu cầu quan trọng cho khả năng cài PWA.
- Phase 1 có thể chưa offline hoàn toàn nhưng không được mất nội dung người dùng đang gõ.
- Phase 2 thêm service worker/cache app shell và hàng đợi mutation nếu nhu cầu offline thực sự xuất hiện.

### Đưa app lên mạng

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
- Deploy Vercel, kiểm thử trên iPhone thật.
- Sửa safe-area, virtual keyboard, touch targets và viewport issues.

### Phase 3 — Học từ sử dụng thật

- Dùng hai tuần, ghi lại friction.
- Chỉ sau đó đánh giá reminder, recurring tasks, quick capture/Shortcuts và offline sync.

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
