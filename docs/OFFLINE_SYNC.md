# Offline và đồng bộ dữ liệu

Tài liệu này mô tả hành vi offline-first hiện tại của Spark. Supabase vẫn là nguồn dữ liệu cloud có thẩm quyền; IndexedDB là nguồn dữ liệu tức thời trên từng browser đã đăng nhập.

## Mục tiêu

- Sau ít nhất một lần mở bản production khi có mạng, Spark có thể cold-start, đọc và sửa dữ liệu khi thiết bị offline.
- Mọi thay đổi được ghi local trước khi gửi cloud; lỗi mạng không rollback nội dung người dùng vừa nhập.
- Cache demo tách khỏi cache từng user. Snapshot cloud rỗng không tự được gieo lại từ demo hoặc cache cũ.
- Khi mạng trở lại, mutation được gửi tuần tự và chỉ xóa khỏi queue sau khi Supabase xác nhận.

## Kiến trúc

```text
UI optimistic
    │
    ├── IndexedDB: snapshot theo scope + mutation queue theo user
    │
    └── Sync worker trong tab
          ├── gửi tuần tự tới Supabase
          ├── retry exponential backoff tối đa 30 giây
          └── pull + overlay mutation chưa xác nhận

Service worker
    └── Cache Storage: HTML app shell, Next.js static assets, font và icon
```

Cache Storage không lưu response Supabase, session hoặc dữ liệu task/note. Dữ liệu người dùng chỉ nằm trong IndexedDB của origin Spark và Supabase.

## IndexedDB và migration

Database `spark-offline`, version 1, có hai object store:

- `snapshots`: key `scope`, trong đó scope là `demo` hoặc Supabase user ID.
- `mutation-queues`: key `userId`, chứa queue chưa được server xác nhận.

Khi browser có dữ liệu cũ trong các key `spark:data:v1`, `spark:data:v2:*` hoặc `spark:sync-pending:v1:*`, lần đọc đầu tiên sẽ copy dữ liệu hợp lệ sang IndexedDB. Sau khi ghi IndexedDB thành công, key tương ứng trong `localStorage` được xóa. Nếu IndexedDB bị chặn hoặc không khả dụng, Spark tiếp tục dùng `localStorage` làm fallback thay vì làm mất thao tác.

Preferences nhỏ như trạng thái sidebar vẫn dùng `localStorage`; chúng không tham gia transaction dữ liệu.

## Vòng đời một mutation

1. UI cập nhật ngay trong memory.
2. Snapshot mới và toàn bộ queue hiện tại được ghi đúng một lần trong cùng transaction IndexedDB. Nếu nhiều thao tác đến sát nhau, Spark chờ transaction mới nhất hoàn tất trước khi bắt đầu gửi.
3. Nếu offline, mutation dừng ở queue và UI hiển thị Ngoại tuyến.
4. Nếu online, Spark gửi mutation đầu queue tới Supabase.
5. Sau khi server xác nhận, mutation được xóa khỏi IndexedDB.
6. Spark pull snapshot mới, overlay mọi mutation còn chờ rồi cập nhật UI.

App gọi reconcile khi Realtime kết nối lại, browser phát `online`, tab được focus/visible và qua safety pull mỗi 60 giây. Pull và flush được single-flight theo user; các trigger trùng nhau dùng chung request đang chạy. Snapshot giống hệt dữ liệu hiện tại không ghi lại IndexedDB hoặc render lại danh sách. Không phụ thuộc Background Sync vì khả năng hỗ trợ trên browser, đặc biệt iOS, không đồng đều.

## Service worker và cache strategy

- Service worker chỉ đăng ký ở production và được phục vụ với `Cache-Control: no-cache`.
- Navigation dùng network-first, fallback về document đã cache.
- `/_next/static/*` dùng cache-first vì tên file có content hash.
- Font, ảnh, CSS và script cùng origin dùng stale-while-revalidate.
- Sau khi đăng ký, client gửi danh sách resource đã tải trong thời gian idle; service worker chỉ fetch URL chưa có trong Cache Storage, không tải lại asset content-hash đã cache.
- Khi thay đổi logic service worker hoặc app shell cố định, tăng version trong `CACHE_NAME` để dọn cache cũ khi activate.

## Bảo mật và giới hạn

- Browser storage không phải kho mã hóa. Người có quyền truy cập browser profile hoặc thiết bị đã mở khóa có thể đọc cache local.
- RLS của Supabase vẫn bắt buộc và service-role key không được đưa xuống client.
- Bản hiện tại dùng full-row upsert. Nếu cùng một item được sửa offline trên hai thiết bị, mutation đến server sau có thể ghi đè thay đổi trước. Trước khi mở rộng cho nhiều người dùng, cần bổ sung `version/base_version`, conflict UI và tombstone `deleted_at`.
- Browser hoặc người dùng có thể xóa site data. Supabase là bản phục hồi sau lần đăng nhập và kết nối tiếp theo.

## Kiểm thử bắt buộc

1. Mở bản production online một lần, bật Airplane Mode, đóng và mở lại PWA.
2. Offline: tạo, sửa, hoàn thành, lưu trữ và xóa task/note/project; reload vẫn giữ dữ liệu.
3. Bật mạng: queue về 0, trạng thái chuyển Đã sync và dữ liệu xuất hiện trên thiết bị thứ hai.
4. Tắt mạng giữa lúc mutation đang gửi; mutation không mất và được retry khi focus/online.
5. Nâng cấp từ browser đang có cache `localStorage`; dữ liệu và queue xuất hiện sau migration.
6. Đăng nhập hai tài khoản lần lượt; cache của user A không xuất hiện trong UI của user B.
7. Kiểm tra responsive ở 390px và iPhone Home Screen, gồm cả cold-start offline.
