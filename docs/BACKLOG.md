# Product Backlog — Spark

File này lưu các ý tưởng chủ dự án muốn cân nhắc cho những phiên phát triển tiếp theo. Nội dung ở đây **chưa phải quyết định đã chốt, acceptance criteria hoặc hành vi hiện tại**. Khi một ý tưởng được duyệt để triển khai, cần làm rõ UX/data impact và ghi quyết định tương ứng vào `docs/DECISIONS.md`.

## Ý tưởng đã ghi nhận ngày 2026-08-21

| ID | Ý tưởng | Phạm vi cần làm rõ trước khi triển khai |
|---|---|---|
| B-005 | Cập nhật lại toàn bộ copy trong app. | Audit toàn bộ navigation, action, empty/loading/error/offline/auth/sync/undo, tooltip và trợ giúp phím tắt theo voice trong `brand-guideline.md`; giữ thuật ngữ tiếng Việt nhất quán. |
| B-007 | Phát triển subtask hoặc note nằm bên trong một task. | Cần chọn mô hình con là subtask, note con hay hỗ trợ cả hai; chốt độ sâu, completion, thứ tự, cách đếm và việc kế thừa due date/project từ task cha. Đây là thay đổi data model và UX lớn, chưa thuộc MVP hiện tại. |

## Ý tưởng đã ghi nhận ngày 2026-08-22

| ID | Ý tưởng | Phạm vi cần làm rõ trước khi triển khai |
|---|---|---|
| B-008 | Cho phép sort task/note theo tên hoặc due date. | Cần chốt tăng/giảm, phạm vi áp dụng theo view/nhóm, cách xử lý item không có ngày và quan hệ với quy tắc task-before-note hiện tại. Lựa chọn sort chỉ thay đổi cách hiển thị, không ghi lại `position` của item. |
