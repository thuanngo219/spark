# Decision Log

File này ghi lại lịch sử quyết định sản phẩm/kỹ thuật. Quyết định mới thay phần tương ứng của quyết định cũ; không đọc từng dòng lịch sử như yêu cầu hiện hành độc lập. Bản bàn giao chỉ gồm quy tắc còn hiệu lực nằm ở [handoff Spark v3](handoff/spark-v3.md). Chủ dự án xác nhận giao diện production “Ổn rồi” ngày 2026-10-29 sau D-207; đây là ghi nhận nghiệm thu, không tạo thêm quyết định sản phẩm.

Các thay thế cần chú ý: D-123 bỏ danh sách của D-119 và thay toolbar 20% ở D-122 bằng 5%; D-126 bỏ label Tên ở D-125; D-129 ẩn nút lưu/hủy Tên trên mobile; D-130 bỏ gradient D-077 và chuyển dải màu xuống dưới header; D-131 chốt blur 8px thay 12px desktop của D-130, cùng control sort 36px; D-132 giữ editor khi focus metadata. D-120 thay chiều cao editor 350px/160px cũ bằng khung desktop tối đa và mobile 40dvh.

Thông số mobile hiện hành: D-203 chốt copy/nút quay lại và nền X; D-204 label 10px; D-205 nút gọn hơn và focus form; D-206 nhãn–nội dung 8px; D-207 thay riêng khoảng cách hàng nhãn–toolbar từ 10px xuống 2px. Không dùng giá trị spacing cũ của D-205/D-206 để ghi đè D-207.

## Đã chốt từ brief ban đầu

| ID | Quyết định | Lý do |
|---|---|---|
| D-001 | MVP là to-do app cá nhân, mobile-first. | Khớp nhu cầu kiểm soát công việc hằng ngày. |
| D-002 | Task chỉ có checkbox, tên, due date và project tùy chọn. | Giữ sản phẩm đơn giản. |
| D-003 | “Sắp tới” là ba ngày kế tiếp và không gồm hôm nay. | Tránh trùng nội dung với view Hôm nay. |
| D-004 | Hôm nay bao gồm task quá hạn. | Không để công việc trễ bị khuất. |
| D-005 | Due date là date-only trong MVP. | Người dùng chưa yêu cầu giờ hoặc reminder. |
| D-006 | Mặc định timezone `Asia/Ho_Chi_Minh`, tuần bắt đầu Thứ Hai. | Phù hợp bối cảnh sử dụng hiện tại. |
| D-007 | PWA là con đường đầu tiên để có biểu tượng trên iPhone. | Một codebase, không cần quy trình App Store. |
| D-008 | Option B — Quiet Focus là đề xuất mặc định, chưa xem là phê duyệt cuối. | Cân bằng calm, cá tính và mobile usability. |
| D-009 | Kiến trúc đề xuất là Next.js + Supabase + Vercel. | Hỗ trợ web/PWA, auth, sync và deploy gọn. |
| D-010 | Chọn Option C — Compact Canvas làm hướng giao diện chính; thay thế đề xuất D-008. | Chủ dự án ưu tiên sự gọn gàng và mật độ thông tin. |
| D-011 | Cấu trúc màu chính dùng navy–turquoise–violet với content surface sáng, lấy cảm hứng từ ảnh tham chiếu do chủ dự án cung cấp ngày 2026-08-19. | Tạo bản sắc màu rõ nhưng vẫn giữ danh sách dễ đọc. |
| D-012 | Task row chỉ hiển thị dot màu project cỡ lớn, không hiển thị tên project. | Màu đã đủ để nhận diện trong ngữ cảnh cá nhân và giúp danh sách gọn hơn. |
| D-013 | Navigation desktop dùng sidebar đầy đủ và cho phép thu gọn thành compact rail; không dùng top navigation. | Sidebar rõ ràng hơn khi quản lý filter/project, compact rail vẫn giải phóng không gian khi cần. |
| D-014 | Filter dùng shortcut `G T`, `G U`, `G D`; `[` toggle sidebar và `?` mở trợ giúp. | Chuỗi hai phím tránh xung đột với shortcut trình duyệt và vẫn dễ khám phá qua trợ giúp trong app. |
| D-015 | Tên chính thức của app là **Spark**; thay thế tên tạm Daily. | Gợi cảm giác ý tưởng mới lóe lên và các hành động nhỏ hỗ trợ người dùng hoàn thành ước mơ. |
| D-016 | Brand palette dùng ba màu gốc navy–turquoise–violet và có thể thêm tối đa hai màu chromatic hài hòa; tổng không quá năm màu. Trắng, xám và đen là neutral, không tính vào giới hạn. | Cho phép nhận diện đa dạng hơn nhưng tránh tương phản gắt và quá tải màu sắc. |
| D-017 | MVP hỗ trợ hai loại item: task và note. Note hiển thị bằng bullet point, không có checkbox/completed state; cả hai có thể có due date và project. | Cho phép lưu điều cần nhớ mà không ép mọi nội dung thành công việc phải hoàn thành. |
| D-018 | Task và note đều có hai cờ độc lập: Quan Trọng (star) và Urgent (điện xẹt), kèm smart filter riêng. | Giúp người dùng tập trung theo mức độ ý nghĩa và tính khẩn cấp mà không cần priority nhiều cấp. |
| D-019 | Website chính thức dùng domain **spark.thuanngo.com**. | Cố định URL đích cho metadata, PWA manifest và cấu hình deploy. |
| D-020 | Bản web MVP mở public, không yêu cầu đăng nhập; dữ liệu giai đoạn đầu lưu cục bộ trên từng trình duyệt. | Cho phép mở ra là dùng ngay. Cloud sync và cơ chế nhận diện người dùng sẽ chỉ được bổ sung khi có yêu cầu mới. |
| D-021 | D-020 được điều chỉnh: website vẫn mở public và có demo cục bộ, nhưng dữ liệu cá nhân đồng bộ qua Supabase sau khi xác thực nhẹ bằng email magic link. | Đồng bộ trên mọi browser cần một danh tính ổn định; magic link + RLS đáp ứng yêu cầu này mà không đặt màn hình login chặn việc xem website. |
| D-022 | Chốt hai màu mở rộng là Muted Coral `#D9776A` và Deep Purple `#65458A`; palette chromatic đầy đủ gồm navy `#111742`, turquoise `#44D4CD`, violet `#8951C7`, Muted Coral và Deep Purple. | Muted Coral thêm một accent ấm vừa phải; Deep Purple tối hơn violet nhưng không gần navy, giúp phân tầng màu mà không tăng tương phản quá gắt. Quyết định này chốt lựa chọn mở ở Q-005. |
| D-023 | Logo chính thức là lockup lowercase bold `spark` với icon check-burst tách riêng. Wordmark và dấu tick cùng Deep Purple `#65458A`; ba tia lần lượt dùng turquoise `#44D4CD`, Muted Coral `#D9776A` và violet `#8951C7`. | Giữ khả năng đọc mạnh của wordmark đã chọn, thống nhất tick với chữ và đưa ba accent chính vào icon mà không biến burst thành star. |
| D-024 | Trong logo chính thức, hoán đổi vị trí Muted Coral và turquoise so với bản D-023: tia ngang dùng Muted Coral `#D9776A`, tia chéo dùng turquoise `#44D4CD`, tia dọc giữ violet `#8951C7`; wordmark/tick giữ Deep Purple `#65458A`. | Bố cục màu mới đặt accent ấm ở trục ngang thấp và màu mát ở tia chéo, theo lựa chọn trực tiếp của chủ dự án. |
| D-025 | D-021 được điều chỉnh về trải nghiệm xác thực: Spark gửi mã OTP qua email và cho nhập mã ngay trong ứng dụng, thay cho việc yêu cầu mở magic link. Website vẫn mở public; chỉ dữ liệu đồng bộ mới cần xác thực. | OTP tránh trường hợp magic link bị mở hoặc tiêu thụ ở browser khác trên mobile, đồng thời vẫn giữ Supabase Auth và RLS để dữ liệu riêng tư. |
| D-026 | Làm phẳng Compact Canvas: rail thu gọn khoảng 56px, navigation desktop 32–34px, item list khoảng 35px không có divider; đổi Tập trung thành Cần lưu ý, cho collapse Cần lưu ý/Dự án và thêm `projects.is_starred` để đưa project lên Cần lưu ý. | Giảm lớp card và mật độ chrome, tăng diện tích nội dung, đồng thời cho phép ưu tiên project mà không thêm hệ priority mới cho item. |
| D-027 | Chốt brand foundation trong `brand-guideline.md`: purpose là làm quản lý việc cần làm hiệu quả và vui vẻ hơn; tính cách đơn giản, nhanh, hiệu quả, vui tính, cá nhân hóa; tagline `to-do fun and easy`; Inter cho UI/body, Raleway cho display; icon outline bo tròn; hình ảnh có yếu tố con người và gradient tiết chế trong palette. Guideline áp dụng cho website, web app và presentation. | Lưu câu trả lời trực tiếp của chủ dự án thành nguồn tham chiếu chung cho thiết kế, nội dung và các phiên làm việc sau. |
| D-028 | Tinh chỉnh hình học logo chính thức: tick còn khoảng 68% độ dày ban đầu; ba tia được chuẩn hóa thành capsule đồng kích thước 140×60 đơn vị và mỏng khoảng 82.5% so với tia ngang ban đầu. Giữ nguyên wordmark, bố cục và vị trí màu. | Tạo độ thoáng cho brand mark, giảm cảm giác nặng của tick và làm ba tia nhất quán hơn theo yêu cầu trực tiếp của chủ dự án. |
| D-029 | Triển khai logo primary và app mark check-burst vào web app. Sidebar expanded dùng logo màu trên neutral plate; compact rail dùng app mark. Favicon, Apple touch icon và PWA icons dùng hình học/màu brand mới; maskable icon đặt mark trong safe zone trên nền navy. | Đồng bộ nhận diện giữa giao diện, tab trình duyệt và icon cài đặt; loại bỏ concept icon gradient cũ khỏi các asset đang được ứng dụng sử dụng. |
| D-030 | Thêm negative colorway toàn trắng, nền trong suốt cho logo và app mark. Sidebar navy dùng negative lockup trực tiếp; compact rail dùng negative mark. Quyết định này thay phần “logo màu trên neutral plate” của D-029; primary logo màu vẫn dùng trên nền sáng. | Tăng độ tương phản và làm nhận diện hòa vào dark chrome tốt hơn, đồng thời có asset chính thức thay vì tạo màu trắng bằng CSS filter. |
| D-031 | Project dùng palette nhận diện riêng gồm 8 màu: Turquoise `#44D4CD`, Violet `#8951C7`, Muted Coral `#D9776A`, Deep Purple `#65458A`, Soft Amber `#D6A84F`, Cornflower `#5C78D6`, Sage `#6FA889` và Dusty Rose `#C56F8C`. Bốn màu dẫn xuất chỉ được dùng cho project dot/bộ chọn màu; đây là ngoại lệ có kiểm soát đối với giới hạn brand palette ở D-016/D-022. | Tăng khả năng phân biệt nhiều dự án mà vẫn giữ các màu mới dịu, có quan hệ với palette hiện tại và không làm loãng nhận diện chung. |
| D-032 | CTA và utility button dùng Turquoise `#44D4CD`, hover Navy `#111742`; navigation, destructive và control semantic giữ màu riêng. Focus bỏ glow/ring turquoise và dùng nền tối hơn khoảng 12%. Project star trong editor là icon-only và đứng trước dãy màu. | Đồng bộ affordance hành động trên toàn app, giảm hiệu ứng phát sáng và giữ editor dự án gọn hơn. |
| D-033 | Quick-add mở dùng cấu trúc field giống project editor: label rõ, nền neutral nhẹ, control cao 44–46px, khoảng cách 10–16px; Hủy và Thêm cùng dùng turquoise và hover navy. | Giảm cảm giác control bị ép sát, tăng tính nhất quán giữa luồng thêm công việc và tạo dự án mà vẫn giữ form gọn trong danh sách. |
| D-034 | Thay shortcut filter ở D-014 bằng `S T` → Hôm nay, `S S` → Sắp tới và `S D` → Theo ngày. | Dùng chữ cái đầu của “Spark” làm prefix và giữ ba đích điều hướng dễ nhớ bằng tiếng Việt. |
| D-035 | Trong view Hôm nay, item đến hạn hôm nay không lặp nhãn “Hôm nay”; item note không hiện chip “Ghi chú” trong listing và dùng dash xám. Disabled primary button giữ nền turquoise, chỉ giảm tương phản chữ; Hủy trong quick-add trở lại secondary text button. | Giảm metadata lặp, làm note trung tính hơn và thống nhất phân cấp action giữa quick-add với project editor. Quyết định này điều chỉnh phần màu hai action ở D-033. |
| D-036 | Spark mở mặc định ở view Hôm nay với sidebar compact; lựa chọn sidebar sau thao tác đầu tiên vẫn được ghi nhớ. Search và Help trong page header chuyển sang secondary icon button giống Hủy: transparent/xám, hover neutral nhẹ. | Ưu tiên diện tích danh sách ngay khi mở app và giảm độ nổi của hai hành động phụ trên header. |
| D-037 | Project view hiển thị nút edit ngay bên phải tên dự án; nút mở Project Editor hiện có để thay đổi tên, màu nhận diện và trạng thái Cần lưu ý. | Giúp chỉnh trạng thái dự án ngay trong ngữ cảnh đang xem, không buộc người dùng mở rộng sidebar rồi tìm menu dự án. |
| D-038 | `brand-guideline.md` là source of truth cho neutral UI tokens, typography scale, button variants và interaction states. CSS dùng token tương ứng thay cho lặp hex ở các control cốt lõi. | Giữ màu, font, kích thước và hover/focus/disabled nhất quán giữa các phiên chỉnh giao diện. |
| D-039 | Đổi nhãn UI Urgent thành Ưu tiên nhưng giữ `is_urgent` trong data model. Mở rộng shortcut: `S I` → Quan Trọng, `S U` → Ưu tiên, `S 1–9` → project theo thứ tự compact sidebar; compact icon/dot có tooltip tức thời. | Dùng tiếng Việt nhất quán, tăng tốc điều hướng smart filter/project và giúp compact rail vẫn dễ khám phá. |
| D-040 | Thêm view Tất cả ngay dưới Theo ngày; item đang hoạt động được chia thành Quá hạn, Hôm nay, Sắp tới (ba ngày kế tiếp), Sau đó và Chưa có ngày. Completed task tiếp tục nằm trong disclosure riêng. | Cho phép quét toàn bộ task và note theo thời gian mà vẫn giữ trạng thái hoàn thành tách biệt và danh sách dễ đọc. |
| D-041 | Gán shortcut `S A` cho view Tất cả và hiển thị mapping trong pending hint cùng bảng trợ giúp. | Giữ quy ước prefix `S` nhất quán và giúp view tổng hợp mới truy cập nhanh bằng bàn phím. |
| D-042 | Thêm presentation filter Ẩn/Hiện ghi chú dùng chung cho mọi view; lựa chọn được giữ khi chuyển view trong phiên nhưng không thay đổi dữ liệu note. | Cho phép chuyển sang chế độ chỉ tập trung task mà không mất ghi chú hoặc tạo hành vi khác nhau giữa các view. |
| D-043 | Chuyển filter Ẩn/Hiện ghi chú thành secondary icon button ở bên trái Search; trạng thái ẩn dùng note icon có nét gạch chéo. Mobile giữ icon này cạnh headline trong khi Search/Help vẫn ẩn. | Giảm thêm một hàng control trên canvas, đồng bộ view actions và vẫn giữ khả năng lọc trên mobile. |
| D-044 | Chuyển toàn bộ UI font size từ px sang rem và đặt root type scale `112.5%` desktop, `120%` mobile. Icon, control geometry, sidebar width và row height tiếp tục dùng px. | Tăng khoảng 10–15% độ đọc trên desktop và 20% trên iPhone mà không phóng to toàn bộ giao diện hoặc phá mật độ Compact Canvas. |
| D-045 | Giảm mật độ danh sách mobile từ row `48px` + gap `5px` xuống row tối thiểu `44px` + gap `2px`; desktop không đổi. | Bù lại cảm giác thoáng sau khi tăng font mobile, đồng thời giữ đúng touch target tối thiểu 44px. |
| D-046 | Đổi browser title, Open Graph title và tên đầy đủ PWA thành `Spark — Make todo easy & fun`; short name vẫn là `Spark`. | Đồng bộ tiêu đề website với thông điệp tiếng Anh mới mà không thay tagline hoặc logo lockup. |
| D-047 | Chỉ trên mobile, chuyển danh sách sang canvas tràn viền và row tối thiểu `52px`; title tối đa hai dòng, star/zap thường trực được thay bằng icon trạng thái nhỏ và khay swipe 44px. Tap mở editor, swipe phải toggle Quan Trọng, swipe trái mở Quan Trọng/Ưu tiên/Xóa, swipe từ mép trái mở sidebar; không dùng touch-and-hold. Desktop không đổi. | Tăng vùng hiển thị từ khoảng 5–6 lên ít nhất khoảng 8 từ khi title đủ dài, giữ thao tác một tay nhanh nhưng tránh xóa nhầm và vẫn có nút hamburger/Undo làm fallback. Quyết định này điều chỉnh riêng phần mobile của D-045 và inventory item row trước đó. |
| D-048 | Cloud sync dùng mutation queue lưu bền theo từng user, ghi tuần tự với exponential backoff; snapshot remote luôn được overlay các mutation chưa xác nhận. App đối soát lại khi Realtime subscribe/reconnect, browser online, tab trở lại foreground/focus và theo safety poll 60 giây. Cache demo và cache cloud được tách theo user; UI phân biệt synced/syncing/reconnecting/offline/error. | Ngăn mất optimistic update khi request hoặc WebSocket chập chờn, tự phục hồi sau thời gian iOS treo PWA và không để snapshot cũ ghi đè thay đổi đang chờ. |
| D-049 | Marker task/note và project dot căn theo dòng chữ đầu thay vì giữa toàn row. Trên mobile, nút Ẩn/Hiện ghi chú thay badge Public ở góc phải header và không lặp cạnh headline. Quick-add mở thành overlay: dialog giữa màn hình desktop, bottom sheet mobile. Dòng thống kê dùng dấu `|`; disclosure Đã hoàn thành dùng kiểu uppercase như label sidebar. | Giữ hàng nhiều dòng dễ quét, đưa filter ghi chú vào vị trí mobile dễ chạm, giảm chrome lặp và tách rõ luồng nhập nhanh khỏi danh sách mà không biến thành form dài. Quyết định này điều chỉnh vị trí mobile ở D-043 và cách hiển thị quick-add ở D-033. |
| D-050 | Mọi danh sách hỗn hợp luôn hiển thị toàn bộ task trước, note sau trên cả desktop và mobile. Trong từng loại, giữ thứ tự due date tăng dần rồi created time; trong view Tất cả vẫn ưu tiên nhóm thời gian trước, sau đó mới áp dụng task-before-note trong từng nhóm. | Task là nội dung hành động chính, nên cần được quét trước; note vẫn hiện đầy đủ nhưng nằm thành cụm bên dưới để giảm nhiễu. Đây chỉ là presentation order, không sửa dữ liệu hoặc `position`. |
| D-051 | CTA “Thêm công việc” đổi thành floating icon-only button `+` cỡ 32px trong control 48px, neo góc dưới phải ở desktop/mobile. Quick-add overlay cũng neo góc dưới phải; danh sách chừa khoảng cuối để CTA không che nội dung. | Giữ hành động thêm luôn trong tầm tay, giảm độ nặng của label lặp và tạo affordance quen thuộc mà vẫn giữ màu/hover Primary đã chốt. Accessible label và tooltip tiếp tục dùng đầy đủ “Thêm công việc”. |
| D-052 | Riêng desktop listing, due-date metadata và artwork star/điện xẹt căn giữa theo cùng trục với dòng title; mobile giữ nguyên layout metadata/swipe. Hit target icon vẫn 31px, chỉ hiệu chỉnh vị trí quang học 4px. | Sửa lệch do row chuyển sang top alignment ở D-049 nhưng action button desktop cao hơn line box; giữ alignment marker dòng đầu mà không ảnh hưởng gesture mobile. |
| D-053 | Khi mở quick-add trên mobile, Spark chủ động focus title input, theo dõi `visualViewport` khi bàn phím xuất hiện và đưa field vào giữa vùng nhìn thấy. Overlay giữ vị trí góc dưới phải khi chưa có bàn phím; desktop không đổi. | Tránh trường hợp iOS giữ fixed overlay theo layout viewport khiến field đầu bị bàn phím che và người dùng phải kéo thủ công. |
| D-054 | Snapshot cloud rỗng là trạng thái có thẩm quyền và không được tự động gieo lại từ cache cloud hoặc dữ liệu demo. Chỉ mutation thật đang chờ của chính user mới được overlay và gửi tiếp. | Cho phép reset database có chủ đích mà không bị browser cũ phục hồi dữ liệu; đồng thời vẫn bảo toàn thay đổi người dùng đã tạo khi offline theo D-048. |
| D-055 | Thêm shortcut `N` để mở quick-add ở chế độ task mới; ẩn Search cho đến khi tính năng được triển khai; mọi overlay chỉ dim nền bằng Navy đậm, không blur; favicon website dùng mark negative trắng trên rounded-square Navy. | Giảm ma sát khi thêm task, không hiển thị affordance chưa hoạt động, giữ bối cảnh phía sau overlay rõ nét và tăng tương phản nhận diện ở tab trình duyệt. Quyết định favicon là ngoại lệ có kiểm soát cho app mark standard ở D-029. |
| D-056 | Đồng bộ favicon, Chrome/PWA icon và Apple Touch Icon thành check-burst negative trắng trên Navy. Standard icon dùng rounded-square; maskable và Apple dùng Navy full-bleed, không có vòng tròn neutral bên trong. Asset raster dùng tên file mới theo colorway để tránh cache icon cũ. | Tạo một nhận diện nhất quán trên tab, Chrome install surface và iPhone Home Screen; thay thế phạm vi app icon nhiều màu/nền sáng ở D-029 và mở rộng quyết định favicon-only ở D-055. |
| D-057 | Mobile bỏ app header riêng và dùng canvas tràn viền với view header sticky giữ nguyên kích thước, dải màu project/view 20px full-width và dock icon-only 58px overlay cuối màn hình. Dock gồm sidebar, Hôm nay, Sắp tới, nút thêm 72px, Theo ngày, Tất cả và Ẩn/Hiện ghi chú; sync status nổi bên phải trên dock với màu semantic và nhãn. | Tăng không gian nội dung, giữ điều hướng một chạm trong tầm ngón cái và vẫn truyền đạt trạng thái bằng cả màu lẫn text. Điều chỉnh phần mobile của D-043, D-049 và D-051; desktop floating add không đổi. |
| D-058 | Mobile item chỉ dùng swipe phải để lộ ba action Quan Trọng/Ưu tiên/Xóa; swipe trái trên item không có action. Swipe từ mép trái sang phải mở sidebar với transition transform; tap vẫn mở editor và không dùng touch-and-hold. Sidebar mobile giữ full negative logo + nút X nhưng bỏ nhóm view chính đã nằm trong dock. | Loại bỏ xung đột hướng gesture, giữ hành động nguy hiểm sau nút bấm rõ ràng và dành sidebar cho smart filter/project. Quyết định này thay thế mapping swipe mobile ở D-047. |
| D-059 | Bỏ chuỗi phím bắt đầu bằng `S`: `T/S/D/A/I/U` mở Hôm nay/Sắp tới/Theo ngày/Tất cả/Quan Trọng/Ưu tiên, `1–9` mở project, cùng `N`, `[`, `?` và `Escape`. Bảng trợ giúp desktop/mobile dùng hai nhóm ngắn, gộp project thành một dòng và đóng được bằng X hoặc Escape. | Giảm số lần nhấn và chiều cao bảng trợ giúp; thay thế D-014, phần shortcut của D-039 và pending-key behavior cũ. |
| D-060 | Desktop view header dùng cùng hierarchy với mobile: sticky, dải project/view 20px và padding nội dung 26px; các thành phần desktop khác giữ nguyên. App mark trong favicon, Chrome/PWA và Apple Touch Icon được scale còn 80% treatment trước, căn giữa trên Navy. | Tạo tính nhất quán đa thiết bị nhưng không làm thay đổi desktop navigation/listing, đồng thời tăng khoảng thở quanh launcher icon. Bổ sung D-056. |
| D-061 | Đổi item gesture mobile thành swipe trái để lộ Quan Trọng/Ưu tiên/Xóa; swipe phải không có action, còn edge-swipe từ mép trái sang phải vẫn mở sidebar. Dock dành 10px mỗi bên quanh nút `+`, active icon dùng nền Navy/icon trắng. Bảng phím tắt không liệt kê tên project và eyebrow “Dự án” dùng màu xám. | Làm hướng gesture item khớp thói quen lộ action, tăng phân cách quanh CTA chính và làm trạng thái điều hướng đang chọn rõ hơn. Quyết định này thay thế hướng item swipe ở D-058. |
| D-062 | Nút Ẩn/Hiện ghi chú trong mobile dock không dùng active background vì đây là page state, không phải navigation destination. Nền luôn trong suốt; trạng thái ẩn dùng icon gạch chéo màu Turquoise, trạng thái hiện dùng icon neutral. | Tránh làm page state bị hiểu nhầm là vị trí điều hướng đang chọn, đồng thời vẫn truyền đạt trạng thái bằng cả hình dạng và màu. Điều chỉnh phạm vi active dock ở D-061; màu Turquoise thay cho Coral theo lựa chọn cuối. |
| D-063 | Hạ mobile dock trên iPhone xuống khoảng 40px: bottom offset đổi từ `safe-area + 30px` thành `max(10px, safe-area - 10px)`. Sync pill, toast và list bottom padding cùng dịch xuống tương ứng. | Đưa dock gần mép màn hình hơn theo quan sát trên iPhone thật nhưng vẫn tránh home indicator và giữ khoảng chừa nội dung nhất quán. |
| D-064 | View Hôm nay luôn gồm note đang hoạt động chưa có due date; note vẫn tuân theo bộ lọc Ẩn/Hiện ghi chú và nằm sau task theo presentation order hiện tại. | Biến Hôm nay thành nơi gom cả việc cần làm lẫn điều cần nhớ chưa được lên lịch, theo phê duyệt B-002. |
| D-065 | Note dùng `items.archived_at`, không dùng `completed_at`; có thể lưu trữ/khôi phục từ marker, editor hoặc swipe action. Note đã lưu trữ rời active list và xuất hiện cùng task hoàn thành trong disclosure trạng thái cuối view. | Giữ đúng semantics note không có completion nhưng vẫn cho dọn danh sách và lấy lại nội dung, theo phê duyệt B-006. |
| D-066 | Toast Hoàn tác chừa floating `+` trên desktop và luôn nằm phía trên mobile dock/safe area. Dòng sync ở cuối canvas bị bỏ vì trạng thái đã có ở view header/sidebar trên desktop và pill trên mobile. | Không che navigation/action chính và loại bỏ thông báo trạng thái trùng lặp theo ảnh chủ dự án gửi, đồng thời hoàn tất B-009. |
| D-067 | Bỏ icon Help khỏi page header desktop nhưng giữ mục Phím tắt trong sidebar và phím `?`. | Giảm chrome lặp mà không làm mất khả năng khám phá hoặc dùng keyboard, theo phê duyệt B-010. |
| D-068 | Thay filter Ẩn/Hiện note bằng switcher icon-only phương án A gồm Tất cả/Task/Note. Desktop giữ nút sidebar hiện tại và đặt switcher ở vị trí control note cũ. Mobile chuyển panel icon trần vào trước title, đặt switcher bên trái sync pill, rút dock còn năm segment `2 + CTA + 2` với active background tràn viền. Khi cuộn, mobile header còn khoảng 62% chiều cao, title còn 80%, ẩn eyebrow/thống kê, nền 80% opacity và dải màu còn 50%. | Tạo một bộ lọc đối xứng cho cả task/note, giải phóng dock và giữ nhiều nội dung hơn khi cuộn mà vẫn bảo toàn nhận diện view. Quyết định này thay thế hành vi D-042/D-043/D-049/D-057/D-062 trong phạm vi filter, mobile drawer, dock và compact header. |
| D-069 | Tinh chỉnh D-068: mobile panel icon nằm bên trong title row; compact header chỉ ẩn eyebrow/ngày và vẫn giữ dòng thống kê; active dock background Navy rộng tối đa 64px thay vì tràn toàn segment. | Giữ cụm title liền mạch, bảo toàn thông tin đếm khi cuộn và giảm cảm giác active state quá nặng trên dock. |
| D-070 | Mobile dock chia đều năm cột để tâm icon cách nhau nhất quán; artwork nút `+` 72px tiếp tục nổi độc lập trên cột giữa. Compact header dùng nền canvas 80% opacity kết hợp `backdrop-filter: blur(14px)` và prefix WebKit. | Cân bằng khoảng thở giữa icon với mép dock và CTA giữa, đồng thời tạo cảm giác nội dung lướt dưới một lớp kính mờ rõ ràng trên Safari/iPhone. |
| D-071 | Sidebar toggle dùng cặp panel-chevron: trái khi sidebar mở để collapse, phải khi compact/mobile để mở sidebar. Bổ sung `-` → chỉ note, `+` → chỉ task, `|` → tất cả nội dung. Compact mobile header giảm nền canvas từ 80% xuống 60% opacity nhưng giữ blur 14px. | Làm trạng thái sidebar dễ hiểu từ hình học icon, cho đổi content filter trực tiếp bằng bàn phím và tăng cảm giác nội dung đi dưới lớp kính khi cuộn. Quyết định này điều chỉnh phần opacity của D-070. |
| D-072 | Shortcut `+` và `|` nhận cả ký tự có Shift lẫn phím vật lý không Shift: `=`/`Equal` → chỉ task, `\`/`Backslash` → tất cả; `NumpadAdd` và `IntlBackslash` cũng được hỗ trợ. | Tránh phụ thuộc vào modifier và layout bàn phím, nên thao tác filter ổn định hơn trên desktop. Bổ sung cách triển khai cho D-071, không đổi nhãn shortcut hiển thị. |
| D-073 | Filter nội dung chỉ dùng đúng ba phím đơn: `-` → chỉ note, `=` → chỉ task, `\` → tất cả. Loại `+` và `|` khỏi shortcut. Switcher desktop/mobile dùng thứ tự Tất cả → Note → Task. | Tránh yêu cầu Shift, làm mỗi filter tương ứng với một keypress trực tiếp và đưa note cạnh trạng thái tổng hợp theo lựa chọn mới. Quyết định này thay thế phần shortcut filter nội dung và thứ tự switcher của D-071/D-072. |
| D-074 | Task và note dùng title một dòng tối đa 100 ký tự; riêng task có description plain text tùy chọn tối đa 2.000 ký tự. Task có description hiện icon hội thoại 15px ngay sau text title. Quick-add giữ checkbox Ghi chú; button Thêm Nội dung bị disabled khi checkbox bật và xóa draft description. | Thêm ngữ cảnh chi tiết cho task mà không biến note thành rich text hoặc làm quick-add dài mặc định; icon inline giữ quan hệ trực tiếp với title và giới hạn title giúp row ổn định trên mobile. |
| D-075 | Copy hiển thị đổi từ “Mô tả” sang “Nội dung”. Tap item mở detail sheet ở trạng thái đọc: task có Tên và Nội dung, note chỉ có Nội dung; icon edit cạnh text mở editor inline riêng cho từng trường. Hàng metadata compact xếp icon-only Quan Trọng/Ưu tiên trước Ngày và Dự án, lưu ngay khi thay đổi. Quick-add vẫn có Nội dung, ngày và dự án; chọn Ghi chú chỉ disable Nội dung bổ sung. | Giảm cảm giác form khi xem item, cho đọc nhanh trước khi sửa và giữ các thuộc tính thường dùng trong một cụm nhỏ mà không làm mất khả năng cập nhật trực tiếp. |
| D-076 | Icon drawer/sidebar toggle dùng Navy ở trạng thái thường và `#287a79` khi hover/focus trên cả desktop lẫn mobile. | Giữ trạng thái nghỉ nhất quán với hệ navigation, đồng thời dùng teal đậm làm phản hồi tương tác rõ nhưng không quá sáng. |
| D-077 | Canvas Spark dùng nền `#F7F8FA` với radial glow Turquoise opacity 16% ở góc trên trái và Violet opacity 14% ở góc dưới phải, cố định theo viewport. Sidebar Navy, surface, item và overlay giữ nguyên hệ tương phản hiện tại. | Mang chiều sâu mềm từ wireframe đã duyệt vào sản phẩm mà vẫn giữ Compact Canvas sáng, sạch và không biến background thành mảng gradient nổi bật cạnh tranh với nội dung. |
| D-078 | Detail sheet neo edit action ở mép phải của từng khối đọc. URL HTTP(S)/`www.` trong Nội dung task/note được linkify an toàn và mở tab mới. Listing sort động theo cả Quan Trọng + Ưu tiên → Ưu tiên → Quan Trọng → bình thường, sau đó mới task/note, due date và created time; không persist rank. | Giữ action thẳng hàng bất kể độ dài text, biến reference thành thao tác trực tiếp mà vẫn giữ dữ liệu plain text, và đưa item cần chú ý lên trước. Quy tắc sort này điều chỉnh presentation order ở D-050. |
| D-079 | Mobile item row dùng nền transparent ở trạng thái nghỉ để radial glow Spark hiển thị liền mạch. Khi row đang kéo hoặc đã mở khay swipe, nền canvas 96% được bật tạm để che action phía sau; desktop không đổi. | Loại mảng `#F7F8FA` lặp lại gây rối trên nền mới mà vẫn giữ thao tác swipe rõ và không để màu action xuyên qua row. |
| D-080 | 2026-08-26: Bổ sung archive/restore/delete dự án. Archive chỉ ẩn khỏi navigation chính và bộ chọn dự án mới, giữ task/note và cờ gắn sao; sheet Dự án đã lưu trữ cho xem/sửa/khôi phục. Delete có xác nhận không hoàn tác, chỉ xóa dự án và bỏ liên kết của mọi item, không xóa item. | Hoàn thiện vòng đời dự án theo yêu cầu chủ dự án, ưu tiên bảo toàn nội dung. Dùng `archived_at`, FK `ON DELETE SET NULL` và RLS hiện có, không cần schema mới. |
| D-081 | 2026-08-26: Hôm nay/Sắp tới/Theo ngày/Tất cả ẩn mọi task/note thuộc dự án đã lưu trữ, gồm disclosure trạng thái và số đếm. Project view/smart filter giữ nguyên; khôi phục dự án đưa item trở lại. Hôm nay chỉ hiện task có ngày `completedAt` là hôm nay theo Asia/Ho_Chi_Minh, độc lập due date; note đã lưu trữ giữ quy tắc cũ. | Theo yêu cầu chủ dự án, giảm nội dung không còn cần xử lý trong master view và giữ lịch sử hoàn thành Hôm nay gọn theo ngày thực hiện. Điều chỉnh D-080, chỉ lọc hiển thị, không sửa hoặc xóa dữ liệu. |
| D-082 | 2026-08-26: Một lần tap vùng nội dung task/note trên mobile luôn mở chi tiết, kể cả khi khay swipe của item đang mở; đóng khay trong cùng thao tác. Không bật trạng thái kéo ở pointer-down. Chặn click phát sinh từ vuốt/cuộn/cancel đến gesture mới, nhưng không chặn keyboard activation. | Loại bước tap chỉ để đóng khay và tránh click sau vuốt mở nhầm nội dung. Giữ checkbox/marker và nút khay riêng biệt, không đổi dữ liệu hoặc gesture sidebar. Làm rõ hành vi tap của D-075 và trạng thái row ở D-079. |
| D-083 | 2026-08-26: Trên mobile, khi bất kỳ khay swipe nào đang mở, tap vùng nội dung của cùng item hoặc item khác chỉ đóng khay. Khi không có khay mở, một tap mở chi tiết. Desktop vẫn mở bằng một click. | Chủ dự án làm rõ quy tắc sau D-082: ưu tiên đóng khay trước, không mở chi tiết cùng thao tác. Giữ click guard chống click sau vuốt/cuộn; không xóa trạng thái khay ở pointer-down/up của tap thường để mọi nhóm item dùng đúng trạng thái chung. Thay thế phần tap khi có khay của D-082. |
| D-084 | 2026-08-27: Task và note cùng có Tên 1–100 ký tự và Nội dung chi tiết tùy chọn tối đa 2.000 ký tự. Detail desktop rộng 780px, chỉ giữ nút X; Xóa chuyển vào metadata, tách destructive và luôn xác nhận. Sidebar desktop expanded cho kéo-thả thứ tự project, persist bằng `position`; mobile/compact không drag. | Đồng nhất mô hình đọc/sửa giữa task và note, tăng không gian đọc và tránh thao tác xóa nhầm. Dùng trường `description` và `position` sẵn có; migration thay constraint cũ chỉ cho task có description. Điều chỉnh D-074/D-075. |
| D-085 | 2026-08-27: Khi kéo project trên desktop sidebar, row nguồn giảm opacity; row đích hiện đường Turquoise kèm chấm tròn ở cạnh trên/dưới theo nửa con trỏ đang hover. Drop chèn chính xác trước/sau row đích; chỉ nhận drop trong cùng nhóm gắn sao hoặc không gắn sao. | Cho biết trước vị trí chèn bằng tín hiệu hình học và màu thương hiệu, đồng thời bảo đảm indicator khớp kết quả sau drop. |
| D-086 | 2026-08-27: Detail mobile đặt Lưu trữ và Xóa thành cặp icon-only 44px căn phải ở hàng riêng sau Dự án, có divider nhẹ; desktop tiếp tục hiển thị icon kèm label. Xóa giữ Coral và luôn xác nhận. | Tránh label Lưu trữ xuống dòng và nút Xóa kéo giãn lệch grid, đồng thời giữ vùng chạm mobile và phân biệt destructive action. |
| D-087 | 2026-08-27: Project editor giữ bảy preset (bỏ Dusty Rose khỏi preset) và dùng lựa chọn màu thứ tám là swatch đa sắc mở native color picker. Màu custom lưu trực tiếp vào `projects.color`, chỉ dùng cho nhận diện project; mobile dùng một hàng cuộn ngang với touch target 44px. | Dành đúng một vị trí trong tám lựa chọn màu cho custom swatch mà vẫn giữ phần lớn palette mặc định; điều chỉnh D-031 trong phạm vi preset hiển thị. |
| D-088 | 2026-08-27: Tạo project mới trên mobile tự focus Tên dự án, fit overlay theo `visualViewport` và đưa field vào vùng nhìn thấy khi bàn phím iOS mở. Edit project giữ focus thông thường. | Cho nhập tên ngay mà không bị bàn phím che layout, đồng nhất cơ chế keyboard avoidance đã dùng cho quick-add. |
| D-089 | 2026-08-27: Detail sheet dùng chung cho task/note trên desktop đổi từ 780px sang chiều rộng responsive `clamp(940px, 80vw, 1200px)`; vẫn giới hạn theo viewport và giữ layout mobile hiện tại. | Tăng không gian đọc Nội dung dài và giữ edit action/metadata thoáng hơn, đồng thời tránh overflow trên màn hình hẹp. Điều chỉnh phần chiều rộng detail trong D-084. |
| D-090 | 2026-08-28: D-089 được đính chính: dải rộng `940–1200px` áp dụng cho canvas liệt kê task/note, không áp dụng cho detail sheet. Canvas dùng `clamp(940px, 80vw, 1200px)` và co theo vùng content; detail desktop trở lại `780px` theo D-084, mobile giữ full-width. | Phản ánh đúng bề mặt người dùng muốn mở rộng: danh sách cần tận dụng màn hình rộng, còn chi tiết giữ khung đọc tập trung và nhất quán. D-090 thay thế phần quyết định chiều rộng trong D-089. |
| D-091 | 2026-08-28: Mobile dock và navigation selection dùng radius dạng pill `999px`; active destination cao 52px trong dock 58px. Email OTP dùng đúng mã 6 chữ số của Supabase `{{ .Token }}`; input lọc ký tự không phải số, cắt ở 6 và chỉ verify khi khớp chính xác 6 số. | Tạo cảm giác dock tròn hai đầu và trạng thái chọn đồng bộ hình học; loại bỏ lệch trước đây khi input nhận tới 8 số hoặc submit theo điều kiện “ít nhất 6”. |
| D-092 | 2026-08-28: Textarea Nội dung dành cho note trên desktop dùng chiều cao tối thiểu `300px` trong edit detail và `160px` trong quick-add; task và mobile giữ chiều cao hiện tại. | Tạo không gian viết phù hợp hơn cho note mà không làm form task dài hoặc gây khó dùng khi bàn phím mobile mở. |
| D-093 | 2026-08-28: Textarea Nội dung của task và note dùng cùng chiều cao desktop: tối thiểu `300px` khi edit và `160px` khi tạo mới; mobile giữ compact. | Đồng bộ nhịp form giữa hai loại item và thay thế phần giới hạn chỉ áp dụng cho note trong D-092. |
| D-094 | 2026-08-28: Trong edit Tên/Nội dung task hoặc note, action ✓ và × chuyển lên hàng nhãn, căn phải; field dùng trọn chiều rộng bên dưới. Textarea edit desktop đổi từ `300px` xuống `176px`, quick-add giữ `160px`, mobile giữ compact. | Tăng chiều rộng hữu ích của vùng nhập, giữ action dễ thấy mà không che nội dung và cân bằng chiều cao detail sheet. Điều chỉnh D-093. |
| D-095 | 2026-08-28: Action ✓ và × trên hàng nhãn Tên/Nội dung dùng control `28px` và icon `16px` ở desktop; mobile giữ control `44px` với icon `18px`. | Cân tỷ lệ action với chiều cao hàng nhãn mà vẫn bảo toàn vùng chạm tối thiểu trên mobile. Bổ sung D-094. |
| D-096 | 2026-08-28: Textarea Nội dung task/note dùng chiều cao cố định ban đầu: desktop edit `300px`, desktop quick-add `160px`; mobile edit và quick-add đều `160px`. | Chốt lại không gian viết theo từng bối cảnh và thay thế quy tắc chiều cao edit `176px`/mobile compact trong D-094. |
| D-097 | 2026-08-28: Spark chuyển snapshot và mutation queue từ `localStorage` sang IndexedDB, tự migrate cache cũ và giữ `localStorage` làm fallback khi IndexedDB không khả dụng. Production đăng ký service worker để cache app shell/tài nguyên cùng origin; Cache Storage không lưu response Supabase hoặc dữ liệu người dùng. Snapshot + queue được ghi atomically trước khi mutation cloud chạy. | Cho phép cold-start và CRUD offline bền vững hơn, tránh block main thread và giảm nguy cơ UI đã nhận thao tác nhưng queue chưa được lưu; đồng thời tách rõ cache mã ứng dụng khỏi dữ liệu cá nhân. Bổ sung D-048 và hoàn thành phần offline của Phase 2. |
| D-098 | 2026-08-30: Cloud pull và mutation flush dùng single-flight theo user; một nhóm optimistic mutation chỉ bắt đầu gửi sau khi transaction snapshot + queue mới nhất hoàn tất. Service worker chỉ fetch resource còn thiếu khi nhận danh sách asset đã tải; `cache: reload` chỉ dùng cho app-shell install. Supabase client được lazy-load sau khi local UI khởi động. | Loại cửa sổ flush song song, giảm ghi IndexedDB và request/cache trùng, đồng thời đưa Supabase SDK ra khỏi critical client bundle mà không đổi nguyên tắc offline-first của D-048/D-097. |
| D-099 | 2026-08-31: Shortcut sidebar đổi sang `⌘/Ctrl + \`; filter nội dung đổi thành `[` chỉ note, `]` chỉ task và giữ `\` để hiện tất cả. Các shortcut có modifier khác không kích hoạt hành động một phím. | Giữ cặp filter note/task liền nhau trên bàn phím, đồng thời dành shortcut có modifier rõ ràng hơn cho thay đổi layout sidebar. Thay thế mapping tương ứng trong D-071/D-073. |
| D-100 | 2026-08-31: View Hôm nay chỉ hiện task/note quá hạn, task/note có ngày hôm nay và task chưa có ngày; note chưa có ngày bị ẩn. Hai nhóm Quá hạn/Hôm nay đóng mở độc lập, mặc định mở và dùng disclosure cùng hệ với Đã hoàn thành. | Tập trung Hôm nay vào nội dung cần xử lý, vẫn giữ task chưa lên lịch trong tầm nhìn và cho thu gọn từng nhóm dài. Thay thế D-064 và quy tắc note/task không ngày trước đó. |
| D-101 | 2026-08-31: Disclosure trạng thái của Hôm nay chọn task theo ngày `completedAt` và note theo ngày `archivedAt` trong `Asia/Ho_Chi_Minh`; due date không quyết định item có xuất hiện trong disclosure này. | Khi xem Hôm nay, lịch sử trạng thái phản ánh đúng những gì người dùng vừa hoàn thành hoặc lưu trữ trong ngày. Thay thế phần quy tắc note cũ trong D-081. |
| D-102 | 2026-09-02: Project dot trước task/note có thể click/tap để animate mở thành pill overlay hiển thị tên dự án uppercase; chỉ một pill mở tại một thời điểm và không làm đổi grid/layout. Tính năng mặc định bật, có switch trong bảng Phím tắt & hiển thị và lưu preference bằng `localStorage` theo từng browser. | Giúp nhận biết dự án ngay trong list mà vẫn giữ Compact Canvas gọn, không lặp tên thường trực và không biến đây thành dữ liệu đồng bộ giữa thiết bị. |
| D-103 | 2026-09-02: Chạm bất kỳ project dot sẽ mở/thu gọn đồng loạt mọi project dot trong view. Pill uppercase dùng regular weight, tham gia một cột chung theo pill dài nhất nhưng nền từng pill chỉ ôm tên dự án của nó; dot được neo cùng vị trí, không overlay hoặc shadow. Trạng thái mở được giữ khi đổi view và lưu theo browser. | Cho quét tên dự án đồng loạt, giữ cột title thẳng hàng mà không kéo nền pill ngắn, loại chuyển động giật do pill phủ lên title và thay thế cơ chế chỉ mở một item của D-102. |
| D-104 | 2026-09-02: Project pill chỉ mở trên desktop; tên dự án đã mở luôn hiển thị đầy đủ trên một dòng, không ellipsis hoặc xuống dòng. Mobile luôn dùng dot tĩnh và không triển khai thao tác mở pill. | Trạng thái mở có mục đích đọc trọn tên dự án trên desktop; mobile ưu tiên không gian cho nội dung và giữ nguyên nhịp layout compact. Bổ sung D-103. |
| D-105 | 2026-09-02: Supabase project production đổi display name từ `Spark` thành `WorkSpace`, giữ nguyên project ref `ukoowtpqztknbrgpyqdx`. WorkSpace là container hạ tầng dùng chung có thể chứa nhiều schema cho nhiều ứng dụng; Spark vẫn dùng `public.projects` và `public.items`, không đổi hoặc di chuyển schema/bảng trong thay đổi này. | Phân biệt tên sản phẩm Spark với tên hạ tầng Supabase dùng chung mà không làm thay đổi URL, API keys, Auth, database, dữ liệu hoặc cấu hình runtime hiện tại. |
| D-106 | 2026-09-02: Mọi request OTP của Spark truyền `options.emailRedirectTo` từ `NEXT_PUBLIC_SPARK_AUTH_REDIRECT_ORIGIN`; local dùng `http://localhost:3000`, còn Vercel Production/Preview dùng chính xác `https://spark.thuanngo.com`. Shared Send Email Hook nhận diện Spark từ redirect context này; Spark không giữ Resend key, SMTP hoặc hook riêng. | Bảo đảm email xác thực mang đúng thương hiệu Spark trong project WorkSpace dùng chung, đồng thời chặn cấu hình nhầm origin ideaPOD/The Atelier và giữ secret tập trung ngoài mã nguồn. |
| D-107 | 2026-09-03: Task/note có `start_date` và `due_date` độc lập, đều nullable; item mới mặc định start là ngày tạo. Dữ liệu cũ backfill start từ `created_at` theo `Asia/Ho_Chi_Minh`, fallback `2026-09-03`. Hôm nay chia Quá hạn, Hôm nay & Đang thực hiện, Chưa có ngày; Sắp tới/Theo ngày khớp một trong hai trường ngày. Mỗi khu sort riêng theo Mức chú ý/Tên/Loại/start/due, disclosure trạng thái thêm ngày trạng thái; preference lưu theo browser và null luôn cuối. Mức chú ý xếp cả hai cờ → Quan Trọng → Ưu tiên → bình thường. | Cho thấy vòng đời công việc mà vẫn cho phép người dùng xóa từng ngày, đưa dữ liệu cũ vào Hôm nay để chỉnh lại có chủ đích và hỗ trợ quét/sort từng khu mà không thay đổi dữ liệu. Thay thế quy tắc ngày/sort tương ứng ở D-003/D-004/D-005/D-017/D-040/D-050/D-064/D-078/D-100. |
| D-108 | 2026-09-03: Metadata ngày dùng icon play cho Ngày bắt đầu và flag cho Ngày đến hạn ở listing, quick-add và detail editor. Dropdown sort dùng custom chevron-down; nút chiều sort dùng hai icon mũi tên + dãy line tăng/giảm theo mẫu A–Z/Z–A, không xoay chevron chung. | Khôi phục đúng ký hiệu đã duyệt trong moodboard, phân biệt hai mốc ngày bằng hình dạng và làm affordance sort rõ nghĩa hơn trên desktop/mobile. |
| D-109 | 2026-09-04: Tách khu Hôm nay & Đang thực hiện thành Hôm nay và Đang thực hiện trong mọi view có phân khu thời gian. Dropdown sort dùng nhãn uppercase; nút A–Z/Z–A là nút tròn trắng có shadow nhẹ. Ngày trong listing hiển thị Hôm qua/Hôm nay/Ngày mai trong khung ba ngày, ngoài khung dùng `dd.mm` cùng năm hoặc `dd.mm.yy` khác năm. | Làm rõ trạng thái bắt đầu hôm nay so với công việc đã diễn ra, tăng khả năng quét control sort và giữ metadata ngày gọn nhưng vẫn ưu tiên ngữ cảnh gần. Điều chỉnh phần phân nhóm/hiển thị của D-107/D-108. |
| D-110 | 2026-09-04: Select sort đổi thành pill trắng và dùng cùng shadow nhẹ với nút chiều sort hình tròn; mức shadow chung giảm so với D-109. | Đồng bộ hai control trong cùng cụm, tăng tương phản vừa đủ mà không làm header nhóm nặng hoặc tạo nhiều lớp nổi. Điều chỉnh style sort của D-109. |
| D-111 | 2026-09-04: Bỏ shadow khỏi select và nút chiều sort. Hover chỉ đổi màu border/icon/text, không dịch chuyển nút. | Giữ cụm sort phẳng, ổn định và đúng tinh thần Compact Canvas sau khi đánh giá trực tiếp trên production. Thay thế phần shadow/hover của D-109 và D-110. |
| D-112 | 2026-09-05: Trong mọi view/khu, `sort` mặc định/khớp hiển thị theo thứ tự Task trước Note trước tiên. `Mức Chú Ý` giữ thứ tự: `Quan trọng+Ưu tiên` → `Quan trọng` → `Ưu tiên` → `Bình thường`, sau đó mới sort theo thứ tự của trường chọn; các trường tùy chọn trong dropdown là `Mức Chú Ý`, `Ngày đến hạn`, `Ngày bắt đầu`, `Tên` (đã bỏ `Loại`), `Ngày trạng thái` chỉ dành cho khu Đã hoàn thành & lưu trữ. Nếu khóa sort chính trùng nhau thì tie-break theo Tên rồi `Due date` (null ở cuối). | Chuẩn hóa trình bày dữ liệu cho mọi view và giảm rối khi đổi khu/khu vực, đồng thời chốt lại hành vi ưu tiên loại item trong danh sách. Dòng này thay thế một phần quy tắc presentation liên quan D-078, D-107, D-109 về cách sắp xếp trong Spark. |

| D-113 | 2026-09-06: Thống nhất khoảng cách giữa mọi khu ở 12px, bỏ khoảng cách riêng trước Đã hoàn thành/lưu trữ. View Tất cả cho đóng/mở độc lập sáu khu thời gian, mặc định mở, giữ trong phiên và không dùng chung state với Hôm nay. Select sort đủ rộng theo font cho nhãn NGÀY TRẠNG THÁI. | Khắc phục nhịp header lệch khi thu gọn và nhãn sort bị cắt; tái sử dụng component/style hiện có. |
| D-114 | 2026-09-06: Trong shared Send Email Hook, riêng OTP Spark đưa mã vào đầu tiêu đề thư và hiển thị mã 36px một dòng trong ô neutral; sender vẫn là Spark. Giữ mapping, auth flow và template app khác. | Mã phải dễ đọc cả trong danh sách email và nội dung thư; cập nhật tại nguồn hook dùng chung, không tạo thêm Resend/SMTP/hook. |

| D-115 | 2026-09-06: Comparator luôn xét loại task → note trước mọi khóa sort trong từng khu. Mức chú ý giữ rank cả hai cờ → Quan Trọng → Ưu tiên → bình thường, sau đó due date theo chiều chọn rồi tên; đảo chiều không đảo rank. Các field ngày/tên khác chỉ đảo khóa chính; hòa khóa xét tên A–Z → due date tăng dần → ngày tạo → ID. Ngày trống cuối trong từng loại/rank ở cả hai chiều. Test filter/group/sort tách trách nhiệm. | Chủ dự án duyệt phương án sửa sau khi audit bốn test lệch thứ tự và phát hiện comparator chưa bảo đảm task-before-note. Làm rõ/thay thế phần thứ tự và chiều sort ở D-112; không đổi schema, dữ liệu hoặc thứ tự các khu. |
| D-116 | 2026-09-12: Trên desktop, textarea Nội dung trong quick-add dùng weight regular; detail sheet rộng `819px` (tăng 5% từ `780px`), giữ header, khối Tên và metadata/control cố định, chỉ cuộn vùng Nội dung; textarea edit cao `350px`. Mobile giữ layout, style và chiều cao `160px` hiện tại. | Tăng khả năng đọc/viết nội dung dài mà không làm mất ngữ cảnh item hoặc control khi cuộn. Điều chỉnh phần kích thước desktop ở D-090/D-096. |

| D-117 | 2026-09-14: Detail desktop rộng 880px. Nội dung task/note tối đa 4.000 Unicode code points, gồm xuống dòng; hỗ trợ đậm, nghiêng, gạch chân ở quick-add/detail bằng toolbar và ⌘/Ctrl+B/I/U. Nút Sửa Nội dung chuyển lên cùng hàng nhãn, nằm ngoài vùng cuộn. Giữ vùng nhập desktop edit 350px, quick-add/mobile 160px. | Theo yêu cầu chủ dự án. Thay phần chiều rộng D-116, giới hạn và plain-text-only D-084; không mở thêm định dạng nâng cao. Văn bản thuần tiếp tục lưu ở description, định dạng lưu JSON text runs ở description_format; không render HTML tùy ý. |
| D-118 | 2026-09-14: Quick-add để Ngày bắt đầu trống, ngoại trừ task mới trong view Hôm nay mặc định bằng hôm nay. Note trong Hôm nay cũng để trống. Đổi task/note chỉ đổi mặc định khi chưa chỉnh ngày; ngày chọn/xóa thủ công được giữ. Ngày đến hạn không đổi quy tắc. | Thay mặc định ngày bắt đầu của D-107 theo yêu cầu chủ dự án; giữ dữ liệu lịch sử và backfill legacy hiện có. |


## Bổ sung 2026-09-14: D-119–D-121

- D-119: Bật danh sách bullet/number một cấp, giữ B/I/U và giới hạn 4.000 ký tự. Khoảng cách 6px sau mỗi danh sách. Mở rộng text runs bằng list/listStart/softBreak để giữ plain text tương thích dữ liệu cũ; render React an toàn. Thay phần giới hạn định dạng của D-117.
- D-120: Quick-add focus dùng màu control-hover; edit Nội dung giữ nền field. Nút Sửa tên trên hàng nhãn; input Tên chỉ border nhẹ, không glow/shadow. Khung desktop khi sửa Nội dung dùng chiều cao tối đa của khung đọc dài; mobile edit 40dvh, quick-add 160px. Header desktop blur 18px, nền 80%, có WebKit prefix.
- D-121: Lưu draft hợp lệ khi chuyển trường Tên/Nội dung/metadata. Chặn khoảng ngày ngược ở UI, mutation, cloud và CHECK database; không sửa dữ liệu cũ. Cập nhật Next.js 16.3.5 và các dependency có cảnh báo; yêu cầu audit sạch trước phát hành.

## D-122 — Toolbar và header (2026-09-14)

Chỉ nền toolbar formatting đậm hơn 20%: pha nền field với 20% đen, không thay nền vùng nhập. Header desktop giảm blur xuống 8px cho cả backdrop-filter và -webkit-backdrop-filter; giữ cấu hình mobile riêng. Thay phần blur desktop của D-120.

## D-123 — Giảm nền toolbar và bỏ danh sách (2026-09-14)

Chỉ nền toolbar đậm hơn 5% thay 20% của D-122. Gỡ bullet/number khỏi toolbar, schema Tiptap, phím tắt và renderer; chỉ còn B/I/U. Nội dung danh sách cũ vẫn giữ văn bản, xuống dòng và B/I/U; bỏ qua metadata danh sách, không sửa/xóa dữ liệu cloud hàng loạt. Dán danh sách chuyển thành đoạn văn. Giữ desktop blur 8px và WebKit. Quyết định này thay phần danh sách của D-119.

## D-124 — Chiều cao dải màu header (2026-09-14)

`view-project-band` cao 10px trên desktop và mobile, cả header thường lẫn compact. Dùng một rule gốc, bỏ override compact trùng lặp.

## D-125 — Thu gọn chi tiết và chỉnh sửa (2026-09-16)

Trên mobile, Dự án và các nút Lưu trữ/Xóa nằm cùng hàng thứ hai của metadata; giữ vùng chạm 44px. Hàng nhãn Tên/Nội dung cao 28px ở cả chế độ đọc/sửa trên desktop và mobile; khoảng cách bên dưới lần lượt 4px/8px. Nút mobile dùng margin dọc âm để giữ vùng chạm 44px mà không tăng chiều cao hàng; không chồng vùng chạm lên field. Điều chỉnh bố cục metadata mobile hiện có và hàng nhãn D-120 theo yêu cầu chủ dự án.

## D-126 — Khoảng cách Nội dung và bỏ nhãn Tên (2026-09-16)

Giảm 20% khoảng cách hai phía đường phân cách: margin-top của khối Nội dung từ 20px còn 16px, padding-top từ 18px còn 14.4px. Bỏ nhãn Tên; nút sửa nằm cùng hàng với text, khi sửa thì input và ✓/× cùng hàng. Áp dụng desktop/mobile, giữ vùng chạm mobile 44px và hàng nhãn Nội dung 28px. Thay phần hàng nhãn Tên của D-125.

## D-127 — Nhận diện task/note trước tên chi tiết (2026-09-16)

Trước tên trong chi tiết/inline edit hiển thị checkbox cho task, dấu gạch ngang cho note. Checkbox phản ánh completedAt, có thể bật/tắt hoàn thành và lưu draft hợp lệ trước khi đổi trạng thái. Note chỉ có marker tĩnh. Tên trong chi tiết không gạch ngang khi hoàn thành; listing giữ hành vi hiện có. Dùng lại màu, hình checkbox và note-mark của listing; vùng chạm mobile 44px.

## D-128 — Bỏ nền hover của marker chi tiết (2026-09-16)

Checkbox task và dấu gạch ngang note trong chi tiết/inline edit giữ nền trong suốt khi hover. Checkbox đã hoàn thành vẫn giữ màu checked; các nút sửa/lưu/hủy giữ hiệu ứng hiện có. Điều chỉnh hover của marker D-127 theo yêu cầu chủ dự án.

## D-129 — Căn marker và sửa tên gọn trên mobile (2026-09-16)

Marker chi tiết có chiều rộng đúng artwork (checkbox 19px, dấu note 12px), sát lề nội dung và cách tên 10px. Checkbox dùng vùng bấm mở rộng 44px qua pseudo-element, không chiếm chiều rộng hàng. Input Tên cao 28px, giảm padding và dùng cùng cỡ/weight chữ với tên đọc. Mobile ẩn ✓/× của Tên và tự lưu tên hợp lệ khi blur; giữ ô input đến khi chuyển trường/đóng để không thay DOM trước click kế tiếp. Enter lưu, Escape hủy draft chưa lưu, tên rỗng báo lỗi và không ghi đè dữ liệu. Desktop giữ ✓/×. Thay bố cục sửa tên của D-126/D-127, giữ nền hover marker trong suốt.

## D-130 — Dải màu dưới header và nền phẳng (2026-10-05)

Dải project/view 10px chuyển từ mép trên xuống chân header, bên dưới tiêu đề và thống kê, trên desktop/mobile và trạng thái compact. Bỏ đường shadow 1px giống border; dùng bóng Navy rất nhẹ dưới dải màu, rõ ở giữa và tan dần về hai mép, không bắt pointer. Desktop blur 12px, mobile blur 8px cả thường/compact, có WebKit prefix. Chuyển 10px padding từ trên xuống dưới để giữ nhịp chiều cao. Nền app dùng canvas phẳng #F7F8FA, bỏ hai radial gradient màu. Thay vị trí của D-124 và cấu hình blur D-122/D-123 theo yêu cầu chủ dự án.

## D-131 — Blur 8px và control sắp xếp 36px (2026-10-05)

Header desktop giảm blur 12px xuống 8px, cùng mobile, giữ WebKit. Select sắp xếp và nút đổi chiều cao 36px trên desktop/mobile; nút đổi chiều rộng 36px để giữ hình tròn. Bỏ override mobile 44px của hai control này theo yêu cầu cụ thể của chủ dự án; các control khác giữ nguyên. Thay phần blur desktop D-130, giữ dải màu dưới header, bóng mềm và nền app phẳng.

## D-132 — Giữ nút chi tiết ổn định khi lưu draft (2026-10-05)

Khi focus vào Quan Trọng, Ưu tiên, ngày, Dự án, lưu trữ hoặc xóa, lưu draft Tên/Nội dung hợp lệ nhưng giữ editor và kích thước khung hiện tại. Không kết thúc edit trong focus handler vì khung desktop co lại giữa pointerdown và click, làm cú click rơi ra backdrop. Nút Lưu và chuyển sang trường khác vẫn kết thúc edit như trước; Hủy bỏ phần chưa lưu kể từ lần tự lưu gần nhất. Áp dụng desktop/mobile, giữ validation tên/ngày và các thao tác metadata.

## D-133 — App icon do chủ dự án cung cấp (2026-10-05)

Dùng nguyên SVG `spark-app-icon-editable 2.svg` của chủ dự án, lưu canonical tại `assets/logo/spark-app-icon-v2.svg`: tick/vòng tròn/vạch trắng trên gradient xanh–Navy. Thay artwork icon cài đặt và favicon cũ; không thay logo/wordmark/mark sidebar hoặc nền canvas app. Apple 180px dùng bản vuông full-bleed; Chrome/PWA any 192/512px và favicon bo góc 116/512. Maskable 512px giữ nền full-bleed, scale riêng artwork 90% để nằm trong vòng tròn safe zone bán kính 40%. Favicon gồm SVG/PNG 16/32/48/ICO. Version URL `v2`, cập nhật manifest, metadata và SW precache; script sinh/kiểm tra icon lấy source trong repo. Đây là ngoại lệ được duyệt cho quy tắc app mark check-burst/nền phẳng trước đây, không đổi nhận diện logo chính. Kiểm tra hình học, gradient, alpha, safe zone, nguồn nguyên bản và asset live trước khi bàn giao.

## D-134 — Đồng bộ biểu tượng mới cho logo và toàn bộ app (2026-10-05)

Chủ dự án yêu cầu mở rộng biểu tượng D-133 sang mọi vị trí, gồm logo chính. Thay check-burst bằng badge tick/vòng tròn trắng trên gradient xanh–Navy; giữ outlines/kerning wordmark `spark`. Logo primary chữ Deep Purple, negative chữ trắng, cùng badge ở bên trái. Sidebar mở rộng/menu mobile dùng logo negative v2; rail dùng badge v2. Bộ SVG/PNG chính và toàn bộ alias public logo/mark/icon cũ cùng cập nhật; app/SW dùng URL v2. Generator tách riêng canonical wordmark và dùng cùng source icon người dùng, không font substitution. Thay phần “giữ logo/sidebar cũ” của D-133 và quy tắc mark/ba tia/negative toàn trắng trước đây. Gradient chỉ trong badge, canvas app vẫn phẳng. Không thay concept lịch sử hoặc icon chức năng task/note.

## D-135 — Logo ổn định, nút tròn và editor tối giản (2026-10-05)

Dùng cùng logo negative SVG cho desktop full/compact và drawer mobile. Badge hiển thị 36×36px, cùng vị trí x=10px/tâm x=28px thẳng cột icon điều hướng; chỉ ẩn wordmark bằng crop ngang khi compact. Khung logo cao 58px chứa trọn ảnh 57.6px, không cắt phần dưới hoặc co khi sidebar dài. Nút icon có bề mặt tròn, nút chứa chữ/navigation bo hai đầu; giữ đủ chỗ đọc và hit area. Checkbox task checked dùng neutral #8B8F9E, tick trắng, cả list/chi tiết desktop/mobile. Sửa Tên cao 28px, chỉ border-bottom 1px, nền trong suốt, không outline/shadow; giữ mobile blur-save/validation. Editor Nội dung chung quick-add/chi tiết không border/nền; chỉ toolbar có border #DDE0E8, radius 12px và nền field pha 5% đen. Nút lưu/hủy Nội dung hiển thị 28×28px/icon 16px trên desktop/mobile, mobile mở rộng vùng chạm 44px và khoảng cách để không chồng nhau. Nút đóng sheet vẫn 44×44px ở cả hai. D-135 thay style tương ứng của D-120/D-129/D-134; không đổi dữ liệu hoặc formatting.

## D-136 — Dải màu 5px và header padding 20px (2026-10-05)

Giảm `.view-project-band` từ 10px còn 5px. `.view-header` padding 20px cả bốn phía trên desktop/mobile, gồm mobile compact khi cuộn; mobile cộng safe-area top vào 20px để tránh notch. Bỏ min-height/padding riêng của header mobile thường/compact để chiều cao theo nội dung và padding mới. Giữ hành vi thu chữ/ẩn eyebrow khi cuộn, blur 8px/WebKit và shadow nhẹ. Thay kích thước/spacing header tương ứng ở D-124/D-130/D-131.

## D-137 — Eyebrow xám và dải màu bo tròn (2026-10-05)

View Tất cả hiển thị “Mọi ngày. Mọi việc.” phía trên tiêu đề. Eyebrow ở Hôm nay/Sắp tới/Theo ngày/Tất cả dùng cùng neutral `--muted` (#73788D) như view dự án; giữ typography uppercase hiện hành và hành vi ẩn eyebrow khi header mobile compact. Dải màu dưới header cao 5px, border-radius 5px bằng chiều cao, áp dụng desktop/mobile. Giữ padding 20px và safe area theo D-136.

## D-138 — Dark mode với lựa chọn theo thiết bị, preview trước production (2026-10-05)

Chủ dự án đồng ý triển khai bản xem trước dark mode: Theo hệ thống / Sáng / Tối trong “Phím tắt & hiển thị”, mặc định theo hệ thống. Ghi nhớ riêng browser/device qua `spark:theme:v1`, cập nhật khi OS đổi nếu đang Theo hệ thống và đồng bộ lựa chọn giữa các tab cùng origin. Không đưa preference vào dữ liệu task/note hoặc cloud; nếu storage bị chặn, vẫn đổi được trong phiên hiện tại.

Nền tối #121622, surface #1B2030, input/toolbar #242B3D; chữ chính #E9ECF5, chữ phụ #A0A8BC, divider #343C50. Giữ Navy sidebar #111742, CTA Turquoise, checked xám, màu project/logo/icon hiện hành. Các màu chữ trạng thái dùng sắc sáng hơn trên nền tối. Header giữ blur 8px/WebKit, padding 20px, band 5px/radius 5px; Tên underline-only và Nội dung trong suốt, toolbar có nền/border. Light giữ các neutral fallback hiện hành; các selector dùng token chung thay vì chồng CSS override.

Bootstrap tĩnh trong head áp dụng theme trước hydration/paint, đồng thời đặt color-scheme cho control native và theme-color cho browser chrome. HTML vẫn static/cache offline được; không thêm dependency hoặc migration. Bản dark mode nằm trên nhánh `codex/spark-dark-mode` để chủ dự án duyệt màu trước khi phát hành production. D-138 bổ sung theme tối cho các quyết định màu sáng trước đây, không thay kích thước/hành vi editor.

## D-139 — Hover nút lưu và nhãn chọn theme (2026-10-05)

Theo phản hồi preview dark mode: nút Lưu Nội dung và Lưu tên trong chi tiết dùng nền Turquoise #44D4CD, icon Navy #111742 khi hover; trạng thái nghỉ giữ nguyên. Nút Hủy ở Tên/Nội dung hover nền neutral nhẹ (ink 8%), icon ink. Áp dụng cho cả theme sáng/tối và control được hiển thị trên desktop/mobile (mobile vẫn ẩn nút lưu tên theo D-129). Ba lựa chọn theme hiển thị uppercase “THEO HỆ THỐNG / SÁNG / TỐI”, không đổi giá trị preference hay hành vi. Danh sách option/optgroup của select dùng surface và ink theo theme; native picker nhận color-scheme tương ứng, gồm Dự án và sắp xếp. Tiếp tục phát hành preview để duyệt.

## D-140 — Giảm độ sáng tiêu đề và dải màu trong dark mode (2026-10-05)

Chủ dự án muốn tiêu đề Hôm nay/Sắp tới/tên dự án và dải màu dịu hơn. Dùng opacity 75% cho h1 của view-header và view-project-band trong theme tối, nhất quán ở mọi view, desktop/mobile và header compact. Theme sáng giữ 100%. Token --view-accent-opacity áp dụng tại selector gốc; không giảm opacity toàn header để giữ thống kê, control và blur hiện hành. Màu project trong dữ liệu không đổi. Phát hành preview để duyệt.

## D-141 — Tăng vòng tròn nút thu/mở sidebar (2026-10-05)

Nút sidebar-toggle tăng từ 32×32px lên 42×42px (+10px đường kính), icon giữ 20×20px. Margin phải từ -26px thành -31px để tâm vòng tròn vẫn nằm tại biên sidebar ở cả full và compact rail. Dark mode nền xám #242B3D, hover/focus nền #30394E; light giữ nền canvas, hover dùng control-hover. Transition màu 160ms. Footer dùng cột minmax(0, 1fr) để nội dung không làm grid track tràn khỏi chiều rộng sidebar. Chỉ áp dụng nút thu/mở sidebar desktop; drawer mobile giữ control hiện hành. Phát hành preview để duyệt.

## D-142 — Nền nút sidebar cùng canvas (2026-10-05)

Theo phản hồi chủ dự án, trạng thái nghỉ của nút thu/mở sidebar dùng cùng nền chính (canvas) ở cả hai theme: dark #121622, light #F7F8FA. Thay nền dark #242B3D của D-141. Giữ đường kính 42px/icon 20px và tâm trên biên. Theo phản hồi tiếp theo, hover/focus chỉ đổi màu icon sang link-hover, giữ nền canvas; thay cả nền hover D-141. Bỏ token nền nút riêng vì không còn khác canvas. Tiếp tục preview trước production.

## D-143 — Duyệt phát hành dark mode lên production (2026-10-05)

Chủ dự án yêu cầu “deploy production”, chốt bản dark mode và toàn bộ tinh chỉnh D-138–D-142 tại code commit 9c0dc8f. Đưa nhánh codex/spark-dark-mode vào main và dùng Git integration hiện hành để Vercel tạo production build. Chế độ mặc định Theo hệ thống; preference lưu riêng mỗi origin/browser nên lựa chọn ở preview không chuyển sang domain production. Không migration hoặc thay đổi auth/sync. Kiểm tra bản live bằng browser profile demo riêng, không tác động dữ liệu tài khoản thật.

## D-144 — Header thu gọn trên desktop và mobile (2026-10-06)

Header desktop/mobile thu gọn khi cuộn quá 28px; trạng thái compact chỉ giữ h1 ở 50% cỡ chữ thường và dải màu 5px/radius 5px. Ẩn eyebrow, thống kê, nút mở sidebar mobile, nút sửa dự án và control trong header; cuộn về đầu khôi phục đầy đủ. H1 dùng letter-spacing -0.025em ở cả hai trạng thái. Giữ padding 20px/safe-area, blur 8px/WebKit và opacity dark 75% cho h1/dải màu. Chủ dự án đính chính -0.25em thành -0.025em sau khi trao đổi. Thay phần compact chỉ có mobile/title 80%/giữ thống kê của D-069 và các mô tả tương ứng; không thay màu hoặc dữ liệu.

## D-145 — Khởi động sạch và chuyển động header/loading (2026-10-06)

Theo yêu cầu và xác nhận của chủ dự án: chỉ bỏ dữ liệu mẫu, giữ toàn bộ dữ liệu thật. Dừng tạo seed runtime; local mới rỗng. Dọn seed local nguyên bản bằng nhận diện bảo thủ; seed đã sửa/không rõ và cloud không bị xóa. Chờ xác định phiên đăng nhập trước khi đưa dữ liệu vào app, giữ cache/queue tách theo user.

Splash Navy #111742 với logo negative icon + wordmark spark, tiến trình theo các bước thực tế; không tăng giả theo thời gian. 100% sau dữ liệu sẵn sàng và queue được xử lý. Logo/thanh tiến trình fade 500ms, tiếp theo nền thu về trái 500ms để lộ app. Lúc chờ app inert, phím tắt không kích hoạt nội dung bên dưới. Ngoại tuyến có cache cho phép sử dụng; lỗi/timeout có Thử lại và dùng bản lưu, không báo sync thành công. Reduced motion bỏ chờ chuyển động.

Thay phần D-144 ẩn control: desktop compact giữ sync + bộ lọc All/Note/Task; mobile giữ cụm nổi hiện hành. Title/eyebrow/thống kê chuyển nhẹ 220ms, h1 50%, tracking -0.025em. Bù không gian ở cuối canvas để tránh nhảy scroll khi header đổi chiều cao. Phản hồi cùng ngày: H1 compact căn giữa theo chiều dọc với cụm sync/bộ lọc, giữ control ổn định trong lúc title co lại.

## D-146 — Bỏ Violet, thống nhất màu cờ và Quint easing (2026-10-06)

Chủ dự án xác nhận chỉ bỏ Violet #8951C7, giữ Deep Purple #65458A. Brand còn Navy, Turquoise, Coral, Deep Purple; dự án còn sáu preset. Nhãn Violet/#BA99DF chuyển neutral muted. Dự án Violet đổi Amber #D6A84F; chỉ đổi color, giữ nội dung/quan hệ/thứ tự và dữ liệu thật. Read/write local/cloud chuẩn hóa; cloud PATCH có điều kiện user/id/màu cũ, không migration schema hoặc quyền. Logo primary Deep Purple giữ nguyên. Các ghi chép Violet trong release/decision cũ chỉ là lịch sử.

Quan Trọng dùng Amber #D6A84F, Ưu tiên dùng Coral #D9776A ở mọi vị trí (danh sách, chi tiết, sidebar, swipe), cả sáng/tối. Bỏ các biến thể ink trước đây; nền/border vẫn có độ trong suốt phù hợp. Mọi transition/animation dùng ease-out Quint, CSS token `--ease: cubic-bezier(.22, 1, .36, 1)`; giữ thời lượng và reduced motion. Thay các phần màu/motion tương ứng trong D-022/D-138 và guideline cũ.

## D-147 — Phím tắt giao diện (2026-10-06)

Theo yêu cầu chủ dự án: `<` chọn Sáng, `>` chọn Tối, `M`/`m` chọn Theo hệ thống. Chạy ngoài vùng nhập (input/textarea/select/contenteditable), không chạy khi đang khởi động, IME composing hoặc có Ctrl/Command/Alt. Shift được phép vì cần cho ký tự `<`, `>` và chữ hoa. Không xử lý key repeat cho đổi theme. Các phím gọi cùng `spark:theme-select` như bộ chọn hiện hành, giữ persistence/cross-tab/system preference và hoạt động trong dialog khi không nhập. Bổ sung vào bảng Phím tắt & hiển thị.

## D-148 — Rà soát và gọn CSS (2026-10-06)

Theo yêu cầu tối ưu CSS: bỏ 5 `!important` (OTP và reduced motion), gộp 3 media block reduced motion thành một cơ chế token kế thừa. Thời lượng/màu/Quint/layout bình thường giữ nguyên. Duration cực ngắn thay vì bỏ animation hoàn toàn để loading vẫn nhận animationend và mở app. Không tăng specificity, thêm dependency hoặc dùng force style.

Gộp style dùng chung của dialog và swipe; bỏ khai báo luôn bị thay thế ở quick-add, màu nút lặp và giá trị mobile giống base. Đối chiếu selector với JSX, giữ state động `drop-before/drop-after`, responsive và giá trị inline phụ thuộc dữ liệu. Sau rà soát: 551→543 rule, 2059→2022 declaration, important 5→0. Không tuyên bố mọi state chưa dùng trong một lần render là mã chết; các nhánh điều kiện vẫn cần giữ.

## D-149 — Reveal loading về phải (2026-10-06)

Thay phần hướng/tốc độ reveal của D-145: nền Navy thu về bên phải, thời lượng tăng 20% từ 500ms lên 600ms. Logo/progress vẫn fade 500ms trước khi reveal bắt đầu. Giữ ease-out Quint, reduced motion và chờ dữ liệu sẵn sàng trước animation; không đổi đồng bộ hoặc dữ liệu.

## D-150 — Nền trượt của bộ lọc nội dung (2026-10-06)

Bộ lọc Tất cả / Note / Task dùng một nền tròn di chuyển từ lựa chọn hiện tại sang lựa chọn mới trong 280ms, ease-out Quint. Áp dụng desktop/mobile và hai theme, cả click lẫn phím tắt. Giữ kích thước, màu và hành vi lọc hiện tại; reduced motion dùng token chung. Nền dùng pseudo-element không chặn thao tác, thay nền riêng từng nút; không thêm dependency hoặc rule ép cascade.

## D-151 — Sidebar 400ms easeInOutQuint (2026-10-06)

Theo yêu cầu chủ dự án: tăng transition thu/mở sidebar desktop từ 220ms và animation trượt mở mobile từ 240ms lên 400ms. Dùng easeInOutQuint `cubic-bezier(.83, 0, .17, 1)` riêng cho hai chuyển động này, thay ease-out Quint trong phạm vi sidebar của D-146. Giữ reduced motion qua token chung; không đổi kích thước, thao tác hoặc animation khác.

## D-152 — Sidebar 240ms easeOutQuint (2026-10-06)

Thay D-151 theo phản hồi chủ dự án: thu/mở sidebar desktop và trượt mở sidebar mobile cùng dùng 240ms, easeOutQuint qua token `--ease` hiện hành. Bỏ token easeInOutQuint không còn dùng. Giữ reduced motion, kích thước và hành vi sidebar.

## D-153 — Giữ trục trái khi thu sidebar (2026-10-06)

Chủ dự án duyệt giữ nguyên vị trí ngang icon khi sidebar mở/thu gọn, ẩn chữ và số đếm. Dùng chung căn trái ở hai trạng thái: tâm icon điều hướng, dot dự án 12px, trợ giúp, đồng bộ và nút thu/mở ở x=28px, cùng trục badge logo. Nút thu/mở chuyển từ biên sidebar về trục này, thay phần vị trí của D-141/D-142. Bỏ các rule compact căn giữa; giữ animation 240ms easeOutQuint, màu, tooltip và thao tác.

## D-154 — Khôi phục nút thu/mở tại biên sidebar (2026-10-06)

Sửa phần vị trí nút thu/mở của D-153 theo phản hồi chủ dự án: tâm nút trở lại biên phải sidebar ở cả full/compact, di chuyển cùng biên khi sidebar đổi độ rộng. Giữ nút 42px/icon 20px, nền canvas và hover chỉ đổi màu icon. Icon điều hướng, dot dự án, trợ giúp và đồng bộ vẫn giữ trục x=28px; animation sidebar vẫn 240ms easeOutQuint.

## D-155 — Control sắp xếp 30px (2026-10-07)

Theo ảnh và yêu cầu chủ dự án, selector sắp xếp và nút đổi chiều cùng `height: 30px; min-height: 30px` trên desktop/mobile. Nút đổi chiều rộng 30px để giữ hình tròn, giữ icon và chiều rộng selector. Thay kích thước 36px của D-131; các control khác không đổi. Sửa rule gốc, không thêm override.

## D-156 — Kéo chọn chữ không đóng màn chi tiết (2026-10-15)

Sửa lỗi kéo chọn Nội dung đang sửa rồi thả ngoài khung làm đóng chi tiết task/note: chỉ đóng bằng nền ngoài khi con trỏ chính nhấn và thả trực tiếp trên nền trong cùng lượt pointer. Bắt đầu trong khung, kết thúc trong khung hoặc pointer bị hủy không được tính là bấm nền để đóng. Không chặn chọn chữ, giữ draft/editor; nút Đóng và thao tác bấm nền bình thường vẫn hoạt động. Không đổi quy tắc lưu/hủy nội dung hoặc dữ liệu cloud.

## D-157 — Chi tiết toàn màn hình mobile (2026-10-26)

Task/note mở chi tiết toàn màn hình ở breakpoint mobile dưới 700px, nền trắng theo yêu cầu kể cả khi app ở dark mode; dùng màu chữ/control sáng trong phạm vi màn chi tiết. Bỏ viền bo, bóng và khoảng hở nhìn xuống danh sách. Giữ bố cục tiêu đề/Tên/Nội dung/metadata; header và metadata ở hai đầu, nội dung đọc/sửa giãn hết phần còn lại thay giới hạn 40dvh của D-120. Nội dung dài cuộn trong vùng giữa; chừa safe-area và khớp visual viewport khi bàn phím mở. Khóa cuộn danh sách trong lúc xem chi tiết, khôi phục khi đóng. Nút Đóng, lưu/hủy và dữ liệu giữ hành vi hiện tại; desktop vẫn popup tối đa 880px và dùng theme của app. D-156 tiếp tục bảo vệ thao tác kéo chọn chữ trên desktop.

## D-158 — Nền chi tiết mobile theo theme (2026-10-26)

Thay phần màu nền của D-157: bỏ ép palette sáng trên toàn màn chi tiết. Nền chung dùng canvas, khối Nội dung đọc/sửa dùng surface (trắng khi sáng, tối khi tối), có padding 12px để chữ không sát mép vùng tương phản. Header, Tên, metadata, chữ và control theo theme hiện hành. Giữ toàn màn hình, safe-area, xử lý bàn phím và bố cục desktop.

## D-159 — Nội dung dùng chung nền chi tiết (2026-10-26)

Thay phần nền riêng của D-158 theo xác nhận của chủ dự án: bỏ surface và padding 12px vừa thêm cho khối Nội dung mobile. Khối đọc/sửa trong suốt trên nền chung canvas theo theme, không tạo vùng trắng riêng. Giữ toolbar hiện có, bố cục toàn màn hình, safe-area và xử lý bàn phím.

## D-160 — Dock mobile sát mép và có nhãn (2026-10-26)

Thay dock pill/icon-only: thanh liền khối nền surface theo theme, sát mép trái/phải/dưới, không bo góc, không blur hoặc bóng nổi. Giữ vùng dock cao 58px, cộng safe-area dưới; các nút có vùng bấm tối thiểu 44px. Hôm nay/Sắp tới/Theo ngày/Tất cả có icon 24px trên và nhãn 11px dưới. Active giữ nền selected tròn 32px sau icon và nhấn chữ. Nút + 52px không có nhãn, nằm gọn trong thanh. Cụm lọc/sync cách dock 20px; giữ năm cột bằng nhau, chức năng và desktop. Thay các mô tả dock 72px/pill/icon-only trước đây.

## D-161 — Header mobile gọn hơn (2026-10-26)

Theo ảnh tên dự án xuống dòng chiếm nhiều chỗ: eyebrow mobile bỏ bold (400), padding header dọc 12px/ngang 14px cộng safe-area; gap giữa menu/tên/sửa giảm 8px→4px. H1 mobile giảm 2.3125rem→1.625rem (44.4px→31.2px), giữ tracking -0.025em, compact bằng 50% và motion 220ms Quint. Giữ vùng bấm 44px cho menu/sửa và cho tên dài xuống dòng nếu cần. Chỉ đổi mobile, desktop giữ nguyên. Thay phần padding 20px và cỡ tiêu đề mobile ở quyết định cũ.

## D-162 — Header và active dock mobile (2026-10-26)

Thay kích thước mobile trong D-160/D-161: eyebrow bằng thống kê (0.75rem, weight 400); h1 30px thường/16px compact, padding 15px cộng safe-area; dải màu 5px thường/2.5px compact. Dock active bỏ nền, icon dùng heading (Navy #111742 sáng, sắc sáng #E9ECF5 tối để đủ contrast) và nhãn bold. Nút + tăng vòng tròn 52→64px, glyph 31→36px, nhô nhẹ phía trên dock; giữ dock 58px và safe-area. Giữ gap title 4px, vùng bấm 44px, motion Quint và desktop.

## D-163 — Editor tập trung và typography mobile (2026-10-26)

Theo ảnh iPhone khi bàn phím mở, header/Tên/metadata chiếm gần hết vùng nhập: sửa Nội dung mobile chuyển sang focus mode, ẩn ba khu này cùng lỗi ngày (vẫn giữ state), chỉ hiện hàng Nội dung/Lưu/Hủy, B/I/U và editor giãn hết visual viewport. Lưu hoặc Hủy hiện lại chi tiết đầy đủ; không tự lưu draft khi Hủy. Giữ nền theo theme, safe-area, giới hạn 4.000 và font editor mobile 16px. Desktop/quick-add không đổi. Eyebrow view-header mobile chuyển 0.75rem→0.65rem, tracking 0; h1 compact chuyển 16→21px; h1 thường 30px/padding 15px/band compact 2.5px giữ nguyên.

## D-164 — Khóa cuộn nền của chi tiết mobile (2026-10-26)

Sửa D-157/D-163: overflow hidden của body và backdrop co theo keyboard vẫn để lộ danh sách. Backdrop nay luôn phủ layout viewport, sheet theo visual viewport; khóa body fixed giữ tọa độ cuộn, root overflow/overscroll, đặt background main/sidebar/dock/control inert. Giữ trạng thái header theo tọa độ đã lưu; cleanup khôi phục style/inert/scroll khi đóng hoặc vượt breakpoint. Không đóng bằng backdrop trên mobile; vuốt, tap vùng ngoài sheet bị co không được đóng editor. Desktop giữ hành vi hiện tại. Không chặn touchmove toàn cục để giữ chọn chữ và cuộn native trong editor.

## D-165 — Khoảng trống đáy editor khi mở bàn phím (2026-10-26)

Trong focus mode sửa Nội dung mobile, bỏ padding đáy 12px và safe-area dưới khi visual viewport co hơn 120px so với innerHeight ở scale xấp xỉ 1. Giữ padding trong vùng nhập để caret không sát mép; đóng bàn phím khôi phục 12px + safe-area ngay cả khi editor còn focus. Ngưỡng là heuristic để tránh nhầm thay đổi chrome trình duyệt; pinch zoom không kích hoạt. Giữ safe-area trên/hai bên, full backdrop và khóa nền D-164; desktop/quick-add không đổi. Thanh ↑/↓/Done của iOS giữ nguyên do trình duyệt quản lý. Cần kiểm tra iPhone thật để xác nhận phần khoảng hở còn lại do hệ thống.

## D-166 — Focus trực tiếp và chống cuộn vượt biên Nội dung mobile (2026-10-26)

Bấm Sửa Nội dung mount editor và đặt caret cuối tài liệu ngay trong click/tap, focus đồng bộ để iOS có thể mở keyboard theo user gesture; không dùng autofocus qua timeout. Chỉ cuộn editor tới cuối, không cuộn trang. Editor chỉ mount sau tương tác người dùng, không render Tiptap trên server. Trong focus mode mobile, touchmove một ngón theo chiều dọc bị chặn khi nội dung không đủ cuộn hoặc vuốt ra ngoài đầu/cuối vùng nhập; vuốt vào vùng có thể cuộn vẫn native. Listener chỉ trên backdrop chi tiết, cleanup khi đóng/đổi breakpoint; không chặn tap, pinch, vuốt ngang, nhấn giữ hoặc kéo vùng chọn. Lưu/Hủy và định dạng B/I/U không đổi. Bổ sung D-164/D-165; không thay thanh bàn phím iOS.

## Cần chủ dự án xác nhận

### Q-002 — Đồng bộ (đã chốt bởi D-021)

Có cần iPhone và desktop dùng chung dữ liệu ngay ở MVP không?

- Nếu có: dùng Supabase Auth + database từ đầu.
- Nếu không: có thể prototype local-first, nhưng dữ liệu không tự đi theo thiết bị.

### Q-003 — Đăng nhập (đã chốt bởi D-021)

Nếu dùng cloud sync, ưu tiên email magic link hay đăng nhập Apple/Google? Đề xuất ban đầu: email magic link vì đơn giản.

### Q-004 — Ngôn ngữ (đã làm rõ bởi D-027)

UI mặc định vẫn là tiếng Việt. Giọng văn gần gũi, vui vẻ và có thể xen tiếng Anh tự nhiên; chưa đặt yêu cầu xây dựng giao diện song ngữ hoàn chỉnh.

### Q-005 — Hai màu mở rộng (đã chốt bởi D-022)

Chọn Muted Coral `#D9776A` và Deep Purple `#65458A`; không dùng Soft Amber `#D6A84F` trong palette đã chốt. Vai trò semantic cụ thể của hai màu trong UI sẽ được xác nhận khi hoàn thiện token/state, không tự động đồng nhất với cờ Quan Trọng/Ưu tiên (tên cũ: Urgent).

## Cách thêm quyết định

Thêm dòng D-xxx với ngày, quyết định, bối cảnh và ảnh hưởng. Không xóa quyết định cũ; nếu thay đổi, tạo quyết định mới ghi rõ quyết định nào bị thay thế.

## D-167 — Chi tiết mobile trượt ngang và vuốt mép để đóng (2026-10-27)

Dưới 700px, chi tiết task/note trượt từ phải vào màn hình; nút Đóng và vuốt từ dải 24px sát mép trái sang phải cho màn trượt ra phải. Mở/đóng và trả về khi vuốt chưa đủ dùng 240ms easeOutQuint (`cubic-bezier(.22,1,.36,1)`). Trong lúc kéo, màn theo ngón tay; thả sau ít nhất 25% bề rộng (tối thiểu 72px) sẽ đóng. Vuốt ngắn hoặc touchcancel trả về. Không nhận thao tác bắt đầu ở giữa màn, cuộn dọc, pinch, nhấn giữ/chọn chữ hoặc trên button/select/link.

Dùng CSS cho mở và Web Animations API của trình duyệt cho đóng/trả về, không thêm thư viện. Giữ khóa cuộn/inert nền đến khi đóng hoàn tất; swipe có cùng hành vi dữ liệu với nút × (không tự lưu bản nháp Nội dung). Giữ desktop và focus/keyboard D-166; reduced motion bỏ dịch chuyển. Cần xác nhận thao tác mép trên iPhone thật vì Safari có thể ưu tiên gesture điều hướng hệ thống.

## D-168 — Màu vùng trạng thái iOS và khoảng cách phía trên (2026-10-27)

Chủ dự án dùng iPhone 17, iOS 27.0.1, mở Spark từ Home Screen. Bỏ meta `apple-mobile-web-app-status-bar-style`; không dùng `black-translucent`. Next nhận `appleWebApp: true` và title qua `other` để tránh tự sinh style `default`; giữ manifest standalone và viewport-fit cover. Bootstrap trước paint đặt nền html/body, color-scheme và theme-color theo theme đã lưu: sáng #F7F8FA, tối #121622. Manifest dùng #F7F8FA làm fallback tĩnh.

Khi sidebar mobile mở (bằng nút hoặc vuốt), nền trình duyệt chuyển Navy #111742 và scheme tối cho đồng hồ/icon hệ thống; đóng menu hoặc sang desktop khôi phục theme hiện hành. Không đổi preference đã lưu. Padding trên header mobile giảm 15→8px và sidebar 19→8px, vẫn cộng safe-area do thiết bị cung cấp; không sửa khoảng cách ngang/dưới, kích thước tiêu đề hoặc vùng chạm. Không trừ chiều cao status bar bằng số đo màn hình hoặc UA heuristic.

iOS tự quyết định màu chữ/icon và diện tích status bar, web không thể vẽ tùy ý dưới vùng này. Hướng xử lý theo [WebKit 317153, comment 2](https://www2.webkit.org/show_bug.cgi?id=317153#c2); [301994](https://www2.webkit.org/show_bug.cgi?id=301994) vẫn ghi nhận vấn đề vùng hệ thống/cache màu ở một số bản iOS. Kiểm tra DOM/Chrome chỉ xác nhận màu app cung cấp, không thay kiểm tra status bar thực tế trên iPhone.

## D-169 — Cập nhật theme khi app trở về từ nền (2026-10-27)

Bổ sung D-168 sau phản hồi iPhone giữ màu status bar sáng khi iOS đã chuyển tối trong lúc Spark nằm nền. Bootstrap kiểm tra lại hệ thống bằng truy vấn media mới khi trang trở lại visible, nhận pageshow hoặc window focus; cập nhật cùng lúc data-theme, nền html/body, color-scheme và theme-color. Kiểm tra ngay và thêm một lần ở frame kế tiếp, gộp các sự kiện cùng lượt; không polling hoặc reload. Bỏ qua trang hidden và hủy frame đang chờ khi ẩn.

Chỉ chế độ Theo hệ thống đi theo OS; Sáng/Tối chọn cố định vẫn được giữ, kể cả khi localStorage không ghi được. Sidebar đang mở giữ Navy và khi đóng trả về theme mới. Giữ bản nháp, cuộn và màn đang mở. Không thay status-bar-style, safe-area hoặc CSS. Regression mô phỏng bỏ lỡ sự kiện media khi app bị treo nền; vẫn cần xác nhận status bar hệ thống trên iPhone thật.

## D-170 — Tách màu nội dung khỏi màu vùng trình duyệt (2026-10-27)

Sửa D-168/D-169: mở sidebar ở theme sáng làm nền html/body thành Navy trong khi app-shell trong suốt, khiến danh sách phía sau cũng tối. Root color-scheme dark còn truyền xuống native controls dù data-theme vẫn light. App-shell nay có nền canvas đặc và color-scheme riêng theo data-theme; sidebar luôn Navy/scheme dark. Root/body và metadata tiếp tục cung cấp màu vùng trình duyệt theo menu. Giữ lớp phủ làm mờ danh sách, không đổi độ đậm overlay, palette, layout, motion hoặc preference.

Khi menu đóng: nội dung và chrome cùng theme. Khi menu mở: nội dung/ô chọn/hộp thoại giữ theme hiện hành, chỉ sidebar/chrome Navy. Đổi theme hoặc OS theo chế độ hệ thống cập nhật nội dung ngay cả khi menu mở; đóng menu, chọn dự án hoặc sang desktop khôi phục chrome theo theme mới. Giữ đường resume D-169. Tests phải kiểm tra cả lớp nội dung và native controls, không chỉ html/body/meta.

## D-171 — Đồng bộ màu lúc reveal và blur sidebar (2026-10-27)

Chủ dự án duyệt cập nhật màu status bar ngay khi animation reveal bắt đầu, không thêm delay. StartupScreen phát spark:theme-refresh trực tiếp trong animationstart của startup-reveal; bootstrap đọc lại theme và cập nhật nền root/body, color-scheme, theme-color đồng bộ trong cùng sự kiện. Giữ bootstrap trước paint và xử lý resume D-169; không chờ animationend, không thêm timeout/requestAnimationFrame cho bước reveal. Giữ fade logo 500ms rồi reveal 600ms như cũ; reduced motion vẫn đi qua sự kiện cập nhật màu. Chỉ Theo hệ thống theo OS, theme cố định được giữ.

Thay overlay tối của sidebar bằng nền trong suốt và backdrop-filter blur(20px), kèm -webkit-backdrop-filter; sidebar không làm giảm sáng nội dung phía sau. Giữ nền menu Navy, nền app riêng theo D-170, motion sidebar 240ms easeOutQuint và tap ngoài để đóng. Các dialog khác giữ overlay hiện tại. Không animate bán kính blur. Việc iOS thực sự vẽ status bar có thể lệch thời điểm tín hiệu app gửi; không cam kết native latency bằng 0ms khi chưa đo trên thiết bị.

## D-172 — Khắc phục màu lấy mẫu tại mép trên iOS (2026-10-27)

D-171 chưa giải quyết được native status bar theo kiểm tra thực tế của chủ dự án. Trong browser regression, bản cũ vẽ Navy tại mép trên khi metadata đã là sáng. WebKit có thể lấy màu từ fixed element trên cùng thay vì theme-color: [bug 305546](https://bugs.webkit.org/show_bug.cgi?id=305546). Mã nguồn [LocalFrameView.cpp](https://github.com/WebKit/WebKit/blob/d3afea7d89fd2b062ef39b644c3f026dc4904070/Source/WebCore/page/LocalFrameView.cpp) cho thấy sampling mép trên ở 4px, loại primary background của box cao <=10px và có đường giữ màu cũ cho container phủ viewport. Đây là cơ sở cho giải pháp; chưa chứng minh chính xác engine của iOS 27.0.1 trên máy người dùng đi qua nhánh nào.

Thêm browser-top-surface được render từ server, fixed full-width trên mobile, cao max(12px, safe-area-top), background đặc từ --browser-background, z-index 1001 trên splash, không pointer event/animation/blur. Nó cùng root/body/meta dùng nguồn theme duy nhất của bootstrap; đổi preference, OS hoặc resume cập nhật ngay, menu mở dùng Navy, đóng trả theme mới. Mép trên giữ theme cả khi loading, không phải chờ Navy reveal. Không tạo timer, fake scroll, reload hoặc xóa cache/dữ liệu. Padding header/sidebar thành max(12px, 8px + safe-area) để lớp nền không che text trên máy có inset 0; trên iPhone có inset >=4px không tăng khoảng trống.

Manifest bổ sung color_scheme_dark với background/theme #121622, giữ fallback sáng #F7F8FA. WebKit đã triển khai trường này theo [bug 311727](https://bugs.webkit.org/show_bug.cgi?id=311727); đây là fallback theo OS trước JS, không thay preference riêng của app. Không đổi start_url/scope/icon/identity và không yêu cầu gỡ/cài lại PWA. Không thể hứa bản PWA đã cài sẽ nhận manifest mới tức thì.

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


## D-196 — Nhãn Nội dung quick-add và header mobile (2026-10-28)

Quick-add hiển thị nhãn “Nội dung” trên desktop và mobile, bỏ phần “(nếu cần)”; tính tùy chọn vẫn được thể hiện qua nút Thêm Nội dung. Trên mobile, dải màu dưới header cao 1px ở cả trạng thái thường và thu gọn. Header thu gọn dùng nền canvas đặc để nội dung phía sau không loang qua vùng tiêu đề. Thanh cuộn của quick-add giữ nguyên; desktop header không đổi.

## D-197 — Quick-add và chi tiết mobile (2026-10-28)

Quick-add mobile: chế độ sửa Nội dung dùng nút tick nhỏ thay Xong; toolbar cao 46px, cách hàng nhãn Nội dung 4px. Phân loại dùng màu selected khi mở, sheet trượt lên 240ms easeOutQuint, bỏ chữ Phân loại trong sheet; nút X nằm giữa và nhô một nửa qua viền trên. Khi quick-add mở, vuốt từ mép trái không mở sidebar. Desktop giữ nguyên.

Chi tiết mobile: nút Đóng nằm giữa, cách hàng metadata 10px; desktop giữ X góc phải trên. Sửa tên có nút tick và X nhỏ ở bên phải, thay quy tắc tự lưu khi blur của D-189; Enter, tick và chuyển trường vẫn lưu tên hợp lệ, X hủy bản nháp. Input tên dùng 16px để tránh iOS tự phóng trang. Khi bàn phím mở lúc sửa tên, sheet giữ chiều cao layout và metadata ở dưới bàn phím; khi sửa Nội dung, chỉ editor theo visual viewport và bỏ padding đáy lúc bàn phím mở. Không thể điều khiển thanh công cụ bàn phím do iOS cung cấp.

## D-198 — Header, metadata và thao tác sửa mobile (2026-10-28)

Thu gọn header không cộng thêm một chiều cao header vào khoảng đệm trong lúc chuyển trạng thái; dải màu dưới header cao 3px trên desktop và mobile. Dấu có Nội dung nằm ở hàng ngày, trước Quan Trọng/Ưu tiên. Nút Đóng chi tiết có nền Navy, chữ trắng, nhãn nhỏ và hover; vị trí giữ như D-197. Chữ tên lúc sửa có cùng cỡ với lúc đọc; tick/X sát nhau và bên phải. Toolbar Nội dung mobile cao 44px, cách hàng nhãn 6px; tick/X của phần này và phần tên dùng cùng kích thước/khoảng cách.

Quick-add mobile: hàng Hủy/Thêm có chữ nhỏ, nền tương phản hơn; Thêm nền Navy, chữ trắng, hover sáng hơn. Hủy dùng mũi tên quay lại, Thêm dùng dấu +; giữ nhãn chữ. Phân loại có nút X nền Navy/chữ trắng. Sửa Nội dung dùng tick lưu và X hủy bên phải; hủy trả lại đúng nội dung/định dạng trước lần sửa, Escape cũng hủy. Desktop giữ hành vi và bố cục quick-add.

## D-199 — Nút quick-add, lớp phủ Đóng và cách viết nhãn (2026-10-28)

Trong quick-add mobile, tick/X của Nội Dung chỉ tồn tại khi đang nhập; rời editor bằng lưu hoặc hủy thì hai nút biến mất. Nút Đóng trong chi tiết mobile nằm phủ trên vùng Nội Dung, cách metadata 10px, không có nền ở lớp phủ; văn bản cuộn được bên dưới nút, vẫn có khoảng đáy để đọc dòng cuối. Nút giữ nền Navy/chữ trắng theo D-198. Nhãn hiển thị dùng cách viết hoa từng từ: Tên Công Việc, Tên Ghi Chú, Nội Dung, Ngày Bắt Đầu, Ngày Đến Hạn, Phân Loại. Câu thông báo và nội dung người dùng nhập giữ cách viết tự nhiên.

## D-200 — Dải màu header 4px và xác nhận bàn giao (2026-10-28)

Dải màu dưới view-header cao 4px trên desktop và mobile, ở cả trạng thái thường và thu gọn. Một rule gốc điều khiển chiều cao; D-200 thay các số đo 1/2,5/3/5px trước đây. Chủ dự án xác nhận trải nghiệm iPhone và thiết kế đồng bộ của bản mới nhất đã ổn, và B-005 đã thực hiện; đây là xác nhận của chủ dự án, không phải kết quả tái kiểm độc lập trong phiên này. Repo Git riêng `masan-cos-showcase/` được giữ nguyên nhưng loại khỏi lint Spark. Chuyển động header và chỉ dấu focus bàn phím tiếp tục được đánh giá trước khi đổi hành vi.

## D-201 — Focus bàn phím và đánh giá chuyển động header (2026-10-28)

Control và liên kết có viền focus 2px theo token `--focus` khi điều hướng bằng bàn phím (`:focus-visible`); sidebar Navy dùng turquoise để thấy rõ viền, dock mobile giữ viền trong vùng màn hình và đặt viền quanh nút + tròn. Khi sửa Tên/Nội Dung, giữ bề mặt nhập không outline theo quyết định cũ. Bỏ hiệu ứng làm tối mọi button khi focus. Thử View Transitions API cho header trên Chrome ở 390px: thời gian layout giảm nhưng cả năm lượt đều có một frame khoảng 33ms, trong khi chuyển động hiện hành không có frame trên 20ms trong cùng phép đo. Vì vậy giữ animation header hiện hành; chưa suy kết quả Chrome thành hiệu năng iPhone vật lý.

## D-202 — Tách cấu trúc mã nguồn và CSS (2026-10-28)

Giữ một `SparkApp.tsx` điều phối view và thao tác; chuyển vòng đời dữ liệu/đồng bộ sang `useSparkData.ts`, các phần giao diện sang module trong `src/components/spark/`. Tách CSS theo foundation, sidebar, canvas, danh sách, quick-add, chi tiết, tiện ích, trạng thái chung và responsive; `globals.css` giữ thứ tự import để không đổi cascade. Bỏ token CSS không còn được dùng. Khi thêm/sửa dữ liệu local, ghi bản snapshot chờ vào localStorage ngay trước giao dịch IndexedDB để reload nhanh vẫn khôi phục được dữ liệu mới; xóa bản chờ sau khi IndexedDB hoàn tất. Chi tiết toàn màn hình tiếp tục khóa cuộn danh sách ở cả desktop và mobile. Không thay đổi data model hoặc UI; `masan-cos-showcase/` tiếp tục nằm ngoài phạm vi Spark và được giữ nguyên.


## D-203 — Nhãn và nút điều hướng mobile (2026-10-29)

Chỉ mobile dưới 700px: nút Đóng trong chi tiết đổi thành mũi tên trái và “QUAY LẠI”. Nút X hủy sửa Nội Dung trong chi tiết và quick-add có nền xám nhẹ theo token `--control-hover` của theme. Quick-add viết hoa nhãn TÊN CÔNG VIỆC/TÊN GHI CHÚ, GHI CHÚ, NỘI DUNG, PHÂN LOẠI, NGÀY BẮT ĐẦU, NGÀY ĐẾN HẠN và HỦY/THÊM; nhãn NỘI DUNG trong editor tập trung cũng viết hoa. Giữ hành vi, dữ liệu, vùng chạm và giao diện desktop.


## D-204 — Nhãn mobile thống nhất 10px (2026-10-29)

Dưới 700px, nhãn trường, nút chữ, điều hướng/sidebar/dock, tên nhóm danh sách, sort, metadata danh sách, trạng thái, nhãn phím tắt và tùy chọn hiển thị dùng chung `--ui-label-size: 10px`. Kích thước tính bằng CSS px, không nhân root scale 120%. Giữ nguyên heading trang/dialog, tên và nội dung task/note, văn bản giải thích, giá trị trong ô nhập/ngày/dự án, icon và vùng chạm. Desktop giữ cỡ chữ hiện hành qua fallback tại selector gốc; không thêm override chồng lớp.


## D-205 — Nút chữ gọn và focus form mobile (2026-10-29)

Mobile: giảm bề mặt nút chữ/pill khoảng 4px, gồm quick-add, Quay Lại, trạng thái đồng bộ và các nút hành động form; vùng chạm mở rộng bằng pseudo-element để giữ tối thiểu 44px. Giữ dock, nút icon và sort 30px hiện hành. Khoảng cách nhãn–nội dung 7→10px, heading nhóm 8→12px; editor Nội Dung tập trung 6→10px. Bỏ outline ngoài của input/select/textarea trên mobile; form dùng viền 1px đổi sang màu đậm hơn theo theme khi focus, không đổi nền. Sửa Tên/Nội Dung dạng inline giữ nền trong suốt, không outline. Giữ focus bàn phím của nút/link, desktop và dữ liệu.


## D-206 — Khoảng cách nhãn mobile 8px (2026-10-29)

Mobile: thống nhất khoảng cách nhãn đến nội dung tiếp theo là 8px, gồm form, nội dung đọc, nhóm phím tắt và gợi ý tùy chọn. Riêng khi sửa Nội Dung trong quick-add hoặc chi tiết, khoảng cách từ hàng nhãn đến thanh formatting là 10px bằng token `--editor-toolbar-gap`, theo phạm vi 8–12px được yêu cầu. Thay giá trị khoảng cách D-205; giữ desktop, cỡ chữ, nút và focus hiện hành.


## D-207 — Thanh formatting cách hàng nhãn 2px (2026-10-29)

Mobile: đổi `--editor-toolbar-gap` từ 10px thành 2px cho cả editor Nội Dung trong quick-add và chi tiết. Thay phần khoảng cách toolbar của D-206; khoảng cách nhãn–nội dung thông thường vẫn 8px, desktop giữ nguyên.


## D-208 — Khôi phục cỡ chữ mục menu (2026-10-29)

Chữ các mục menu/sidebar (`.nav-text`), gồm điều hướng, smart filter, tên dự án, Đã lưu trữ và Phím tắt, dùng lại `0.8125rem`: 15.6px trên mobile với root 120%, 14.625px trên desktop với root 112.5%. Tách khỏi token label 10px của D-204. Nhãn nhóm, số đếm, dock và các label khác giữ hiện hành; không đổi vùng chạm hoặc hành vi.

## D-209 — Nhúng Inter dùng chung mọi thiết bị (2026-10-30)

Theo yêu cầu chủ dự án, nhúng Inter 4.1 variable thường và nghiêng từ release v4.1 của rsms/inter, kèm SIL Open Font License. Root layout dùng next/font/local, preload và display swap; body dùng biến --font-inter với fallback do Next tạo. Font được phục vụ cùng origin, không gọi dịch vụ font bên ngoài lúc mở app. Giữ nguyên root scale, size, weight, line-height và màu/state nút; việc chuẩn hóa các thông số này đang trao đổi, chưa chốt. File nguồn và provenance ở src/app/fonts/.

## D-210 — Typography chung, một Navy và hai biến thể action (2026-10-30)

Chủ dự án duyệt chuẩn hóa và deploy production. Root 100% cả desktop/mobile; menu/list/nội dung 16px, tên chi tiết 18px, heading dialog 24px, support/giá trị metadata control 14px; label desktop 12px, mobile giữ 10px. Heading view desktop clamp(38px, 5vw, 56px), mobile 30px/compact21px. Weight chỉ 400/600/700; line-height 1.2 heading, 1.4 UI, 1.6 đoạn dài. Token tập trung foundation.css, mobile chỉ đổi label; thay root scale D-044, các fallback size cũ và menu rem của D-208. Nhúng Inter D-209 đi cùng bản phát hành này.

Gộp Navy 950/800 về Navy 900 #111742, cả link/tooltip/toast/swipe archive; giữ dark neutral, semantic, project và artwork logo. Action Turquoise/chữ Navy hover Navy/chữ trắng; action Navy/chữ trắng hover Turquoise/chữ Navy ở cả theme, gồm THÊM mobile/QUAY LẠI/đóng Phân Loại/tick Lưu. Disabled không đổi màu khi hover; selected B/I/U/ngày/theme/filter giữ riêng, không đảo trạng thái. Giữ khoảng cách 8px/2px, hình học control/vùng chạm và phạm vi dữ liệu hiện hành.

D-210 kiểm tra ảnh ở 390px phát hiện native date bị cắt khi dùng Inter. Metadata chi tiết mobile giữ hai hàng: cờ và dự án/hành động ở hàng đầu, hai ngày chia đều hàng thứ hai. Giữ font giá trị14px, touch target44px, không thêm chiều cao hàng hay đổi logic ngày; desktop giữ thứ tự bố cục cũ.

## D-211 — Thang chữ 15px và label 10px/700/uppercase (2026-10-30)

Chủ dự án chốt bảng mới: menu/sidebar, tên task/note trong list, Nội dung đọc/sửa dùng15px ở cả desktop/mobile; quick-add tên giữ16px. Heading view38–56px desktop/30px mobile, compact19–28px/21px, dialog24px, tên chi tiết18px, support và metadata control14px giữ nguyên. Label trường/nút/nhóm/số đếm/metadata list/sort/dock10px, uppercase và700 ở cả hai thiết bị. Chuyển mọi600 sang700; UI chỉ400/700. Tách --text-input khỏi --text-body để ô tên không bị giảm theo nội dung. Casing chỉ là CSS hiển thị cho nhãn, không tác động text người dùng nhập. Root100%, line-height1.2/1.4/1.6 và màu/hover D-210 giữ nguyên.

## D-212 — Menu 14px/400 trên mọi thiết bị (2026-10-30)

Chủ dự án cập nhật menu/sidebar về14px, weight400 ở cả desktop/mobile; mục đang chọn cũng400, giữ tín hiệu màu/nền. Dùng token --text-support hiện có và sửa selector gốc. Tên task/note trong danh sách15px/400, Nội dung15px/400 (đậm700), dock10px/700/uppercase giữ đúng D-211. Không đổi các thành phần khác.


## D-213 — Hover chuyển màu trên desktop (2026-10-30)

Nút trên desktop từ 700px, thiết bị có hover và con trỏ fine: chuyển background-color, color và border-color trong 220ms với easing Quint hiện hành. Bổ sung transition nền tảng cho các nút trước đây đổi màu tức thời; các nút có transition riêng dùng chung token thời lượng màu. Không dùng transition: all. Transform giữ thời lượng riêng 160ms; selected/disabled và palette giữ nguyên. Mobile/touch giữ thời lượng cũ, không thêm transition nút toàn cục. Reduced motion vẫn hạ thời lượng xuống .01ms.

Rà soát: header 220ms, sidebar layout 240ms, dialog desktop 200ms, fade overlay/utility 160ms; drawer/chi tiết/Phân loại mobile 240ms, swipe hồi vị 190ms và không transition khi đang kéo. Switch 180ms, filter indicator 280ms; startup fade 500ms rồi reveal 600ms, pulse đồng bộ 1.2s. Không thay các animation này trong D-213.

## D-214 — Khoảng cách danh sách/loading và nhãn dự án (2026-10-30)

Gap giữa item là 3px trên desktop/mobile. Caption loading cách thanh progress 17px (tăng 5px). Pill tên dự án desktop lấy chiều rộng theo nội dung, padding cân hai bên, căn giữa chữ; tên dài xuống dòng trong cột tối đa 35% thay vì bị cắt. Chừa 6px sau chip trước vùng nội dung task/note. Giữ marker dự án mobile hiện hành và thao tác bật/tắt nhãn đồng loạt.

D-214 cũng giới hạn tooltip sidebar compact theo viewport, cho tên dài xuống dòng để tránh tràn ngang.

## D-215 — Focus form và toolbar chi tiết desktop (2026-10-30)

Desktop dùng focus form như mobile: bỏ outline ngoài input/select/textarea, giữ nền field và đổi viền đậm hơn (heading 40% + field-border). Giữ khả năng focus/nhập và focus-visible cho button/link; editor inline giữ không outline. Toolbar Nội dung trong chi tiết desktop nằm trong luồng dưới hàng nhãn, cách hàng nhãn 8px, rộng toàn vùng nội dung, cao 44px, nút B/I/U 32px; bộ đếm căn phải. Mẫu ảnh được hiểu theo tỷ lệ ảnh 2x (toolbar khoảng 88px ảnh tương ứng 44px CSS). Giữ palette và trạng thái selected hiện hành; mobile và quick-add không đổi layout.


## D-216 — Cỡ chữ px và khoảng cách (2026-10-30)

Gap item 2px cả desktop/mobile. Toolbar Nội dung chi tiết desktop cách phần text bên dưới 15px. Giá trị ngày/dự án trong chi tiết và quick-add 12px/700, line-height 1.4. Token font chuyển từ rem sang px: body15, input16, support14, metadata12, title18, dialog24; heading desktop clamp(38px, 5vw, 56px) giữ responsive hiện hành. Không còn cỡ chữ rem trong CSS app; line-height vẫn theo hệ số. Chưa phát hành.

## D-217 — Khoảng đệm menu dự án chi tiết desktop (2026-10-30)

Thay native menu dự án trong chi tiết desktop bằng listbox của app: dòng tối thiểu 44px, padding 10px 14px, gap 4px, khung padding 8px; tên dài xuống dòng. Hỗ trợ chọn bằng chuột/Enter/Space, phím mũi tên/Home/End, Escape và đóng khi click ngoài. Mobile giữ native select. Tự deploy production sau kiểm tra.


## D-218 — Typography desktop/mobile (2026-10-30)

Desktop: list/Nội dung 14px; menu và support 14px; metadata ngày/dự án 12px. Mobile: list/Nội dung/menu/support 15px; metadata ngày/dự án 13px (gồm native project select). Giữ title chi tiết18, input quick-add16, dialog24, heading view desktop38–56/mobile30, compact desktop19–28/mobile21. Label10px/700/uppercase, dock10px. Weight và line-height hiện hành giữ nguyên. Cỡ chữ px; tự deploy production sau kiểm tra.


D-219 (2026-10-30): yêu cầu chặn pinch zoom bằng viewport maximumScale1/userScalablefalse và touch-action pan-x pan-y mobile. Quick-add dùng chung nhận diện vuốt mép trái với chi tiết: vuốt đủ ngưỡng hủy toàn bộ nháp như HỦY, vuốt ngắn/đứng/nội vùng không hủy. Trình duyệt/hệ điều hành có thể ưu tiên thiết lập accessibility zoom; cần xác nhận iPhone thật.


D-220 (2026-10-30): Nội dung đọc/chỉnh sửa dùng token riêng --text-content:15px cả desktop/mobile, weight400/đậm700, line-height1.6. Tên task/note desktop giữ14px theo D-218. Deploy production sau kiểm tra.


D-221 (2026-10-31): Sidebar bỏ nút ... sửa dự án, giữ sao; hover/selected phủ cả hàng dự án và sao. Sửa dự án qua nút trên header dự án. Bỏ câu “Lưu trữ để thu gọn sidebar. Task và note vẫn được giữ nguyên.” Màn tạo/sửa/xác nhận xóa dự án mobile toàn màn hình, khóa cuộn và inert nền bằng lockDetailScroll; form cuộn riêng, theo visualViewport khi bàn phím mở.


D-222 (2026-10-31): Bốn action sửa dự án Lưu trữ/Xóa/Hủy/Lưu thay đổi chung một hàng grid4, mỗi nút icon trên/nhãn dưới, cùng padding/height64/radius12 cả desktop/mobile. Bỏ thanh action sticky riêng mobile. Sidebar thêm padding phải8px cho sao, bỏ hàng tiêu đề Cần lưu ý, luôn hiện các filter và dự án gắn sao bên trong.


D-223 (2026-10-31): Sao/Lưu trữ/Xóa một hàng pill, Hủy/Lưu hàng pill dưới cách24px, padding trên20px/viền phân cách. Sao chuyển khỏi hàng màu. Mobile backdrop luôn phủ toàn layout viewport; chỉ form theo visualViewport khi bàn phím mở, tránh lộ nền. Khóa cuộn isolate toàn bộ nhánh nền và chặn overscroll ngoài form.


D-224 (2026-10-31): Hàng pill Yêu thích/Lưu trữ/Xóa sát phần màu nhận diện, bỏ margin-top20px của action group. Đổi Sao thành Yêu thích. Hủy dùng nền control-hover xám nhẹ; bỏ border-top hàng Hủy/Lưu, giữ margin-top24px và padding-top20px hiện hành.
