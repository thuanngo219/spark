# Kết quả kiểm tra độ tin cậy dữ liệu — 2026-10-31

Trạng thái: hoàn tất theo xác nhận chủ dự án trên production Spark, dùng điện thoại và máy tính. Agent hướng dẫn từng bước; người dùng trực tiếp thao tác và báo kết quả. Không phải báo cáo kiểm thử tự động hoặc kiểm toán backend.

| Tình huống | Kết quả được báo |
|---|---|
| Cùng tài khoản/email, dữ liệu ban đầu | Cùng email, đã đồng bộ, dữ liệu giống nhau |
| Tạo task máy tính → điện thoại | Gần như tức thì, đủ nội dung |
| Sửa điện thoại → máy tính | Tên/nội dung/ngày/dự án/hai cờ cập nhật đúng |
| Reload máy tính, đóng/mở điện thoại | Giữ dữ liệu, không thấy dữ liệu cũ thoáng xuất hiện |
| Sửa offline điện thoại, đóng/mở lại | Mở được offline, giữ tên/nội dung, đúng trạng thái Offline |
| Kết nối lại sau sửa offline | Tự nhận đủ thay đổi, không trùng; reload vẫn đúng |
| Tạo task và note offline | Còn sau mở lại; đồng bộ đúng loại/nội dung, không thiếu/trùng |
| Hoàn thành task và xóa note offline | Giữ trạng thái sau đồng bộ/reload; không xuất hiện lại |
| Tạo offline máy tính → điện thoại | Reload offline được, giữ đủ dữ liệu, tự đồng bộ; không trùng |
| Sửa cùng task ở hai thiết bị | Người dùng xác nhận thao tác trơn tru, không báo lỗi; sau đó xác nhận khả năng bảo toàn hai phiên bản ổn |
| Sửa offline điện thoại trong khi máy tính xóa task | Task biến mất trên cả hai; reload/mở lại không xuất hiện lại, không treo/lỗi |
| Nhiều thao tác offline liên tiếp, thay đổi vòng đời dự án, cách ly hai tài khoản | Người dùng xác nhận chung các bước còn lại đã ổn; không có log kết quả riêng từng bước |

Chốt nghiệm thu: không ghi nhận lỗi dữ liệu trong các tình huống được người dùng báo; đợt kiểm tra này kết thúc, không còn bước thử đang chờ. Không thay mã, schema hoặc cơ chế đồng bộ trong đợt kiểm tra thủ công này.

Giới hạn bằng chứng: không lưu log/thời điểm/version A/B hoặc kết quả tách riêng cho ba bước cuối. Xác nhận bảo toàn hai phiên bản là xác nhận trải nghiệm của người dùng, không chứng minh có tính năng lịch sử phiên bản hay thuật toán merge tự động. Kiến trúc upsert/queue và các giới hạn kỹ thuật tiếp tục mô tả trong [OFFLINE_SYNC.md](OFFLINE_SYNC.md). Chỉ mở lại điều tra nếu có tình huống lỗi mới hoặc yêu cầu mới; không tự bổ sung scope.
