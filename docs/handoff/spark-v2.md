# Spark v2 — bàn giao hiện hành

## D-178 — Sidebar blur 2px (2026-10-27)

Giảm blur phía sau sidebar từ 5px xuống 2px theo yêu cầu mới, áp dụng cho backdrop-filter và -webkit-backdrop-filter. Giữ nền phủ trong suốt. Thay giá trị D-177; các hiệu ứng khác giữ nguyên.

Kiểm tra: lint/typecheck/build, 175 test logic và 4/4 browser case mobile-status-chrome đạt ở sáng/tối, mobile 390px và breakpoint desktop. File: globals.css, mobile-status-chrome.spec.ts và tài liệu dự án.

## D-177 — Sidebar blur 5px (2026-10-27)

Theo yêu cầu mới, giảm blur phía sau sidebar từ 10px xuống 5px cho cả backdrop-filter và -webkit-backdrop-filter. Giữ nền phủ trong suốt. Thay giá trị D-173; không đổi blur header, overlay dialog hoặc trạng thái màu.

Kiểm tra: lint/typecheck/build, 175 test logic và 4/4 browser case mobile-status-chrome đạt (390px sáng/tối, mở/đóng sidebar và breakpoint desktop). File: globals.css, mobile-status-chrome.spec.ts và tài liệu dự án.

## D-176 — Tách nền loading khỏi vùng status bar (2026-10-27)

Sau kiểm tra thực tế iPhone, D-175 vẫn để status bar giữ Navy một lúc sau loading. Không tiếp tục đổi màu vùng lấy mẫu từ Navy về theme. browser-top-surface luôn dùng --browser-background theo theme ngay từ đầu, không clip-path và không override màu khi startup. Nền Navy và progress cùng bắt đầu ngay dưới vùng này: top=max(12px, safe-area-top) trên mobile, top=0 desktop. Dải màu theme nằm phía trên thanh tiến trình và nối với status bar; phía dưới thanh luôn liền Navy. Chủ dự án đã cho phép dời thanh về mép trên phần nền Navy.

Dùng một token --browser-top-height cho vùng màu, nền loading và thanh tiến trình. Caption cách thanh 12px, không cộng safe-area lần thứ hai. Logo vẫn nhỏ hơn 20% và ở tâm toàn màn hình. Giữ refresh tại reveal, resume/fixed/system theme, timing Quint và reduced motion. Bỏ marker data-revealing và hai selector startup đổi màu/clip vì không còn cần. D-176 thay phần màu loading của D-175.

Không khẳng định độ trễ native iOS bằng 0ms từ kiểm tra Chrome: thay đổi này tránh cho trang cung cấp Navy ở vùng lấy mẫu trong suốt startup; vẫn cần xác nhận trên iPhone thật.

Kiểm tra D-176: regression bản cũ cho thấy Navy ở vùng cần giữ theme. Bản sửa đạt lint/typecheck/build, 175 test logic và 26/26 browser case (loading, lỗi/retry/offline, reveal, resume). Pixel vùng trên đúng sáng/tối cả khi OS đổi trong loading; progress và Navy cùng dịch đến 59px khi giả lập safe-area 59px. Đã đo và xem ảnh 320/390/1280px; logo giữ đúng tâm/kích thước, dưới progress không có dải sáng. File runtime: globals.css, StartupScreen.tsx; regression startup/status-edge; tài liệu brand/brief/UI/implementation/decisions/handoff.

## D-175 — Loading liền Navy, đổi màu mép trên tại reveal (2026-10-27)

Sửa dải sáng dưới progress của D-174: khi startup chưa reveal, browser-top-surface dùng Navy #111742, liền nền loading ở cả theme sáng/tối. Ngay trong animationstart của startup-reveal, StartupScreen đánh dấu data-revealing rồi phát theme-refresh đồng bộ: lớp nền đặc trở về --browser-background theo theme hiện hành, không chờ hết animation và không thêm delay. Khi startup unmount, selector tự hết hiệu lực. Giữ lớp fixed để WebKit lấy mẫu, phần hở 3px cho progress, logo ở giữa, safe-area, metadata và đường cập nhật theme/resume. D-175 thay quy tắc mép trên dùng màu theme xuyên suốt loading của D-172.

Regression kiểm tra pixel Navy trong loading, màu theme sau loading và computed màu lớp fixed ngay trong sự kiện reveal (system/fixed, sáng/tối, reduced motion). Browser kiểm tra được màu trang cung cấp; native status bar iOS vẫn cần xác nhận trên thiết bị thật.

Kiểm tra D-175: regression trước sửa nhận màu sáng thay vì Navy; sau sửa lint/typecheck/build, 175 test logic và 16/16 browser case đạt. Đã xem ảnh loading 390px, không còn dải sáng. File: globals.css, StartupScreen.tsx, startup-theme/status-edge tests và tài liệu brand/brief/UI/implementation/decisions/handoff.

## D-174 — Bố cục loading (2026-10-27)

Theo yêu cầu mới nhất: logo còn 80% kích thước cũ (tối đa 256px, co tương ứng trên màn hẹp), căn giữa theo cả hai trục màn hình. Thanh tiến trình 3px sát mép trên, toàn chiều ngang; nhãn trạng thái và phần trăm căn giữa bên dưới, chừa safe-area để chữ không bị che. Nút thử lại/dùng cache căn giữa bên dưới nhãn.

Giữ fade 500ms và reveal 600ms Quint, reduced motion, trạng thái lỗi/offline và đồng bộ theme lúc reveal. Mobile mở đúng 3px đầu của browser-top-surface bằng clip-path chỉ trong lúc loading để hiện progress; vùng lấy mẫu y=4/5 của D-172 vẫn giữ màu theme. Không đổi màu status bar hoặc chiều cao safe-area.

Kiểm tra D-174: lint/typecheck/build, 175 test logic và 20/20 browser case startup/status đều đạt. Đo ở 320/390/1280px: logo lần lượt rộng 204.8/256/256px, tâm khớp tâm viewport; bar x=0/y=0/rộng bằng viewport, cao 3px, pixel turquoise hiển thị ở mép trên; caption căn giữa. Đã xem screenshot mobile. File runtime: StartupScreen.tsx và globals.css; tài liệu brand/brief/UI/implementation/decision/handoff cùng cập nhật.

### D-173 — Giảm blur phía sau sidebar (2026-10-27)

Theo yêu cầu mới, sidebar dùng backdrop-filter blur(10px) và -webkit-backdrop-filter blur(10px), thay 20px của D-171. Giữ nền phủ trong suốt, không làm tối nội dung. Không đổi blur header hoặc overlay dialog.

## D-172 — Nền đặc tại mép trên mobile (2026-10-27)

Sau phản hồi iPhone vẫn giữ Navy và không đổi màu theo theme, bổ sung một lớp nền cố định, không tương tác và không animation tại mép trên mobile. Lớp này dùng màu chrome hiện hành ngay từ lúc tải, nằm trên splash/blur: sáng #F7F8FA, tối #121622, mở menu #111742. Màn loading vẫn Navy bên dưới; vùng mép trên không chờ reveal. Không thêm màu mới. Chiều cao max(12px, safe-area-top); padding trên header/sidebar tối thiểu 12px, còn trên máy có safe-area vẫn giữ 8px + safe-area. Desktop không hiển thị lớp này. Native iOS cần xác nhận lại trên thiết bị.

Bản cũ thất bại regression pixel: expected sáng [247,248,250], actual Navy [17,23,66]. File: layout.tsx, globals.css, manifest.ts, status-edge/mobile-status-chrome tests và tài liệu dự án. Bản sửa đạt lint/typecheck/build, 175 test logic và 30/30 browser test: pixel sáng/tối khi loading và đổi theme/menu, resume bỏ lỡ OS event, reduced motion, safe-area 59px và responsive 320/390/699/700/1280px. Đã xem ảnh loading và app; native status bar iPhone vẫn cần kiểm tra lại trên thiết bị. Không chạy Impeccable.

## D-171 — Theme tại reveal và sidebar blur (2026-10-27)

StartupScreen phát theme-refresh đồng bộ trong animationstart của startup-reveal; không thêm timer/frame hoặc chờ animationend. Bootstrap trước paint và đường resume D-169 tiếp tục đọc đúng preference/OS. Giữ fade logo 500ms + reveal 600ms, motion Quint và reduced motion. Sidebar chuyển lớp phủ sang transparent + blur(20px), gồm khai báo WebKit; các dialog giữ overlay cũ. Không đổi màu nội dung riêng của D-170.

Đã kiểm tra 40 case browser khác nhau: startup mới/rỗng, chờ dữ liệu và queue qua mock, lỗi/retry/offline, chuyển theme/cross-tab, cold paint, resume, sidebar và native controls. Tám case mới ghi nhận refresh trong cùng animationstart ở sáng/tối, system/fixed, normal/reduced motion. Hai regression mới xác nhận bản cũ chưa có refresh tại reveal và còn overlay tối. Lượt đầu có 10 failure do phép đo test: listener đọc trước React delegation và đòi prefix WebKit trên Chrome; đã chỉnh đọc ở window sau delegation, chỉ kiểm tra computed prefix nếu hỗ trợ. Chạy lại cả 12 case startup-theme/status đạt, 28 case còn lại đã đạt trong lượt trước. Lint/typecheck/build và 175 test logic đạt. Đã xem ảnh sidebar blur hai theme ở 390px; ma trận màu bao phủ thêm 320/699/700px và theme desktop 1280px. Không chạy Impeccable.

File: StartupScreen.tsx, globals.css, startup-theme/mobile-status-chrome/theme-surfaces tests; brand/brief/UI/implementation/decisions/handoff. Đây là xác nhận tín hiệu web gửi và DOM/Chrome; chưa đo thời điểm native status bar vẽ trên iPhone/iOS 27.0.1 nên không cam kết độ trễ hệ thống bằng 0ms.

## D-170 — Giữ màu nội dung khi mở menu (2026-10-27)

Nguyên nhân: D-168 đổi root/body sang Navy cho chrome nhưng app-shell trong suốt; nền danh sách vì vậy lộ Navy, còn native controls kế thừa scheme dark. Sửa selector app-shell gốc: nền canvas đặc và scheme theo data-theme qua token riêng; sidebar luôn scheme dark. Giữ root/body/meta phục vụ chrome, giữ lớp phủ, palette, layout và motion. Toàn bộ dialog hiện nằm trong shell nên cũng giữ đúng theme. D-169 tiếp tục cập nhật khi resume.

Regression đã thất bại trên bản cũ ở theme sáng (app-shell transparent), sau sửa đạt. Đã kiểm tra 29 case trình duyệt khác nhau: theme/status/resume/offline/header và ma trận màu tại 320/390/699/700/1280px, mở bằng nút/vuốt, đóng bằng nút/vùng ngoài/chọn dự án, radio/OS/cross-tab, hộp thoại trên menu, dropdown và mở/đóng lặp lại. Lượt đầu 27/29 đạt; hai case mới kiểm tra màu dock khi dock đã ẩn ở desktop nên sửa điều kiện assertion và chạy lại cả ba case ma trận đạt. Không phải lỗi app còn tồn tại. Lint/typecheck/build và 175 test logic đạt. Đã xem ảnh menu ở hai theme và đối chiếu ảnh lỗi trước sửa. Chưa kiểm chứng native status bar iOS trên thiết bị thật; không chạy Impeccable.

File: globals.css, theme.ts (comment phân lớp), test mobile-status-chrome/theme-resume/theme-surfaces; brand/brief/UI/implementation/decisions/handoff. Bảng màu từng trạng thái nằm trong Implementation guide D-170; test mới phải kiểm tra nền nội dung/native controls cùng với chrome.

## D-169 — Theme khi mở lại app từ nền (2026-10-27)

Sửa thiếu đường cập nhật sau khi hệ thống đổi sáng/tối lúc Spark nằm nền: bootstrap đọc truy vấn media mới trên visibilitychange (visible), pageshow và focus, apply ngay và kiểm tra lại một frame; hủy/gộp frame trùng, không polling/reload. Giữ theme chọn cố định và lựa chọn trong phiên khi storage bị chặn; sidebar vẫn Navy, đóng trả về theme hiện hành. Không sửa CSS hoặc metadata cấu hình của D-168.

Regression mới tái hiện trên bản cũ: sau resume vẫn data-theme light thay vì dark. Sau sửa, 6 case mới đạt tại 390px: ba đường resume cả sáng→tối/tối→sáng, bản nháp đang nhập, sidebar, explicit light/dark khi storage lỗi, trang hidden và media cập nhật sau sự kiện. Tổng 19/19 browser test theme/status/offline đạt; lint/typecheck/build và 175 test logic đạt. Chưa xác minh native status bar trên iPhone/iOS 27.0.1; Chrome chỉ kiểm tra tín hiệu màu do app cung cấp. Không chạy Impeccable.

File: `src/lib/theme.ts`, `tests/browser/theme-resume.spec.ts`, brief/implementation/decisions/handoff. Giữ nguyên các thư mục untracked không thuộc thay đổi này.

## D-168 — Màu vùng trạng thái iOS và khoảng cách phía trên (2026-10-27)

Chủ dự án dùng iPhone 17, iOS 27.0.1, mở Spark từ Home Screen. Bỏ meta `apple-mobile-web-app-status-bar-style`; không dùng `black-translucent`. Next nhận `appleWebApp: true` và title qua `other` để tránh tự sinh style `default`; giữ manifest standalone và viewport-fit cover. Bootstrap trước paint đặt nền html/body, color-scheme và theme-color theo theme đã lưu: sáng #F7F8FA, tối #121622. Manifest dùng #F7F8FA làm fallback tĩnh.

Khi sidebar mobile mở (bằng nút hoặc vuốt), nền trình duyệt chuyển Navy #111742 và scheme tối cho đồng hồ/icon hệ thống; đóng menu hoặc sang desktop khôi phục theme hiện hành. Không đổi preference đã lưu. Padding trên header mobile giảm 15→8px và sidebar 19→8px, vẫn cộng safe-area do thiết bị cung cấp; không sửa khoảng cách ngang/dưới, kích thước tiêu đề hoặc vùng chạm. Không trừ chiều cao status bar bằng số đo màn hình hoặc UA heuristic.

iOS tự quyết định màu chữ/icon và diện tích status bar, web không thể vẽ tùy ý dưới vùng này. Hướng xử lý theo [WebKit 317153, comment 2](https://www2.webkit.org/show_bug.cgi?id=317153#c2); [301994](https://www2.webkit.org/show_bug.cgi?id=301994) vẫn ghi nhận vấn đề vùng hệ thống/cache màu ở một số bản iOS. Kiểm tra DOM/Chrome chỉ xác nhận màu app cung cấp, không thay kiểm tra status bar thực tế trên iPhone.

Kiểm tra D-168: lint/typecheck/build, 175 test logic đạt; 4/4 case màu mới đạt (390px, hai theme đối lập OS, trước CSS/hydration, metadata không trùng, safe-area 59px, mở menu bằng nút/vuốt, chọn dự án, chuyển breakpoint và khôi phục preference). 7 case header 320/390/1280px và 7 case detail motion đạt. Theme/offline kiểm tra được cache dark, đổi theme, keyboard và contrast. Cập nhật test theme cũ để lưu Nội dung trước khi bấm metadata mobile đã ẩn theo D-163. Test nhập `<M>` trong quick-add có một lần chỉ nhận `<`; chạy lại nguyên case ba lượt đều đạt, không đổi code nhập liệu hoặc coi đây là lỗi đã xử lý. Đã xem ảnh header/sidebar sau khi animation kết thúc. Chưa kiểm tra system status bar thật trên iOS 27.0.1.

File: layout.tsx, manifest.ts, theme.ts, ThemePreference.tsx, SparkApp.tsx, globals.css; test mobile-status-chrome/header/theme; brand/brief/UI/implementation/decisions/handoff. Ghi cùng đợt cấu hình hook Impeccable đã tắt theo yêu cầu trước và quy tắc chỉ dùng khi được yêu cầu trong AGENTS.md. Không chạy Impeccable.

## D-167 — Chi tiết mobile trượt ngang và vuốt mép để đóng (2026-10-27)

Dưới 700px, chi tiết task/note trượt từ phải vào màn hình; nút Đóng và vuốt từ dải 24px sát mép trái sang phải cho màn trượt ra phải. Mở/đóng và trả về khi vuốt chưa đủ dùng 240ms easeOutQuint (`cubic-bezier(.22,1,.36,1)`). Trong lúc kéo, màn theo ngón tay; thả sau ít nhất 25% bề rộng (tối thiểu 72px) sẽ đóng. Vuốt ngắn hoặc touchcancel trả về. Không nhận thao tác bắt đầu ở giữa màn, cuộn dọc, pinch, nhấn giữ/chọn chữ hoặc trên button/select/link.

Dùng CSS cho mở và Web Animations API của trình duyệt cho đóng/trả về, không thêm thư viện. Giữ khóa cuộn/inert nền đến khi đóng hoàn tất; swipe có cùng hành vi dữ liệu với nút × (không tự lưu bản nháp Nội dung). Giữ desktop và focus/keyboard D-166; reduced motion bỏ dịch chuyển. Cần xác nhận thao tác mép trên iPhone thật vì Safari có thể ưu tiên gesture điều hướng hệ thống.

Kiểm tra: lint/typecheck/build và 175 test logic đạt. 7/7 browser case mới đạt: entry/exit đúng chiều và 240ms Quint, vuốt đủ/thiếu/cancel, cuộn dọc/vuốt giữa màn, reduced motion và desktop. Kiểm tra thêm mobile 320/390px hai theme, focus/keyboard, khóa cuộn và B/I/U. Lượt tổng: 35 đạt, 1 offline case bỏ qua, 1 case desktop note save/reload thất bại không ổn định (nội dung trống sau reload, đã từng ghi nhận D-166); không sửa persistence trong thay đổi này, chạy lại task/note ba lượt = 6/6 đạt. Đây vẫn là điểm cần theo dõi, không coi là đã sửa. Đã xem ảnh mobile; chưa thử iPhone/Safari vật lý.

Impeccable: motion mới chỉ animate transform; không thêm suppression. Giữ ignore Inter đã có theo D-027. Năm cảnh báo layout-transition cũ vẫn giữ như kết quả đo D-166. File thay đổi: SparkApp.tsx, globals.css, detail-motion.ts, mobile-detail-motion.spec.ts, hai test đợi entry trên backdrop và brief/implementation/decisions/handoff.

## D-166 — Focus trực tiếp và chống cuộn vượt biên Nội dung mobile (2026-10-26)

Bấm Sửa Nội dung mount editor và đặt caret cuối tài liệu ngay trong click/tap, focus đồng bộ để iOS có thể mở keyboard theo user gesture; không dùng autofocus qua timeout. Chỉ cuộn editor tới cuối, không cuộn trang. Editor chỉ mount sau tương tác người dùng, không render Tiptap trên server. Trong focus mode mobile, touchmove một ngón theo chiều dọc bị chặn khi nội dung không đủ cuộn hoặc vuốt ra ngoài đầu/cuối vùng nhập; vuốt vào vùng có thể cuộn vẫn native. Listener chỉ trên backdrop chi tiết, cleanup khi đóng/đổi breakpoint; không chặn tap, pinch, vuốt ngang, nhấn giữ hoặc kéo vùng chọn. Lưu/Hủy và định dạng B/I/U không đổi. Bổ sung D-164/D-165; không thay thanh bàn phím iOS.

Đo năm cảnh báo animation: xem [báo cáo hiệu năng](../performance/2026-10-26-motion.md). Không thay motion đã duyệt. Thay đổi ContentEditor.tsx, SparkApp.tsx, detail-scroll-lock.ts, regression mobile-editor-input.spec.ts và tài liệu. Lint/typecheck/build và 175 test logic đạt. Browser kiểm tra B/I/U, lưu/hủy/reload, ngày/metadata, chi tiết task/note 320/390px sáng/tối, cuộn nền, khoảng trống bàn phím và focus/selection. Test desktop kéo chọn note từng thất bại khi reload sát sau Save; bổ sung xác nhận UI đã hiển thị bản lưu trước khi đóng/reload và chạy lại 3 lần đạt. Không đổi cơ chế persistence. Test touch có sự kiện tổng hợp kiểm tra preventDefault và CDP touch swipe kiểm tra vị trí; không thay thế kiểm chứng rubber-band/keyboard thật trên iPhone. Chưa kiểm tra iPhone/Safari vật lý.

## D-165 — Khoảng trống đáy editor khi mở bàn phím (2026-10-26)

Trong focus mode sửa Nội dung mobile, bỏ padding đáy 12px và safe-area dưới khi visual viewport co hơn 120px so với innerHeight ở scale xấp xỉ 1. Giữ padding trong vùng nhập để caret không sát mép; đóng bàn phím khôi phục 12px + safe-area ngay cả khi editor còn focus. Ngưỡng là heuristic để tránh nhầm thay đổi chrome trình duyệt; pinch zoom không kích hoạt. Giữ safe-area trên/hai bên, full backdrop và khóa nền D-164; desktop/quick-add không đổi. Thanh ↑/↓/Done của iOS giữ nguyên do trình duyệt quản lý. Cần kiểm tra iPhone thật để xác nhận phần khoảng hở còn lại do hệ thống.

Thay đổi: SparkApp.tsx, globals.css, mobile-keyboard-gap.spec.ts và các tài liệu brand/brief/UI/implementation/decisions/handoff. Regression mới thất bại trên bản cũ (padding đáy vẫn 46px khi keyboard mở), sau sửa đạt ở sáng/tối: padding về 0, editor chạm đáy sheet, đóng bàn phím khôi phục 46px với safe-area 34px dù vẫn focus. Pinch zoom và viewport giảm 80px giữ inset; draft/lưu/cuộn còn nguyên. Tổng 15 browser case đạt, gồm 320/390px task/note, khóa nền và desktop selection/metadata. Lint (loại thư mục ngoài Spark), typecheck/build và 175 test logic đạt; đã xem ảnh hai theme. Chưa kiểm tra iPhone/Safari vật lý.

## Khóa cuộn nền editor mobile — D-164 (2026-10-26)

Backdrop phủ layout viewport, chỉ sheet co theo keyboard. Body fixed giữ tọa độ danh sách; root khóa overflow/overscroll, main/sidebar/dock/control nền inert. Header giữ trạng thái theo tọa độ lưu; đóng hoặc chuyển desktop khôi phục vị trí/style/inert. Mobile không đóng bằng chạm backdrop; editor vẫn cuộn native và chọn chữ. File: detail-scroll-lock.ts, SparkApp.tsx, globals.css, mobile-scroll-lock.spec.ts và brand/brief/UI/implementation/decisions/handoff. Regression tái hiện trên bản cũ: elementFromPoint ngoài visual viewport vẫn chạm danh sách/dock. Sau sửa: 17 test header/mobile và 6 test xác nhận cuối đạt, gồm CDP touch swipe trong editor/đầu/cuối/toolbar/nền, tap nền không đóng, khôi phục scrollY=400, đổi mobile↔desktop, lưu tên/metadata và desktop selection. Lint/typecheck/build, 175 test logic đạt; đã xem ảnh cả hai theme. Chưa kiểm tra Safari/iPhone vật lý.

## Editor mobile tập trung — D-163 (2026-10-26)

Khi sửa Nội dung, ẩn header Chi tiết/Tên/metadata, giữ Lưu/Hủy/B/I/U và editor 16px giãn theo visual viewport. Lưu/Hủy trả về chi tiết; desktop và quick-add giữ nguyên. Eyebrow mobile 0.65rem/400/tracking 0; compact h1 21px. File: globals.css, SparkApp.tsx, header.spec.ts, mobile-detail.spec.ts, content.spec.ts và brand/brief/UI/implementation/decisions/handoff. Lint/typecheck/build, 175 test logic và 31/31 browser test đạt, gồm offline/format/lưu/hủy/metadata/desktop/header. Mobile sáng/tối 320/390px, viewport 420px còn vùng nhập >240px; thêm safe-area 59px trên/34px dưới vẫn >150px, caret trong editor sau di chuyển bàn phím. Đã xem ảnh; đây là mô phỏng Chrome, chưa xác minh Safari/iPhone vật lý.

## Header và dock mobile — D-162 (2026-10-26)

Eyebrow bằng thống kê (0.75rem/400), h1 30px/compact 16px, padding 15px cộng safe-area; band 5px/compact 2.5px. Dock active không nền, icon heading theo theme và nhãn bold. Nút + 64px/glyph 36px nhô nhẹ khỏi dock 58px. File: globals.css, SparkNavigation.tsx, header.spec.ts, mobile-dock.spec.ts và brand/brief/UI/implementation/decisions/handoff. Lint/typecheck/build, 175 test logic và 13/13 browser test đạt: mobile 320/390/600px, desktop 1280px, sáng/tối, compact 16px/band 2.5px, safe-area, active không nền/contrast ≥4.5:1 và quick-add. Đã xem ảnh; chưa kiểm tra Safari/iPhone vật lý.

## Header mobile gọn hơn — D-161 (2026-10-26)

Eyebrow weight 400, padding dọc 12px/ngang 14px cộng safe-area, gap hàng title 4px, h1 31.2px thay 44.4px. Giữ vùng bấm menu/sửa 44px và header compact 50%. File: globals.css, header.spec.ts và brand/brief/UI/implementation/decisions/handoff. Lint/typecheck/build, 175 test logic, 7/7 browser test header và 6/6 dock đạt. DNA / sparkOne nằm một dòng ở 390px; tên dài ở 320px xuống dòng không tràn, menu/sửa giữ 44px, cuộn thu/mở không giật; desktop 1280px sáng/tối đạt. Đã xem ảnh; chưa kiểm tra iPhone/Safari vật lý.

## Dock mobile sát mép — D-160 (2026-10-26)

Dock thành thanh liền khối sát ba mép, nền surface theo sáng/tối; cao 58px cộng safe-area. Bốn đích có icon trên/nhãn dưới, nút + 52px không nhãn nằm gọn trong thanh; cụm lọc/sync cách 20px. Thay đổi SparkNavigation.tsx, globals.css, mobile-dock.spec.ts và tài liệu brand/brief/UI/implementation/decisions/handoff. Lint/typecheck/build, 175 test logic, 6/6 browser case tại 320/390/600px sáng/tối đạt; kiểm tra bổ sung safe-area 34px dưới và 20px hai bên đạt. Đã kiểm tra icon/nhãn, chuyển view, quick-add, không che mục cuối, desktop ẩn dock; đã xem ảnh. Chưa thử Safari/iPhone vật lý.

## Nội dung dùng chung nền chi tiết — D-159 (2026-10-26)

Bỏ nền riêng và padding 12px của Nội dung từ D-158. Nội dung trong suốt trên nền chung theo theme; giữ toolbar và toàn màn hình mobile. Thay đổi globals.css, mobile-detail.spec.ts và tài liệu brand/brief/UI/implementation/decisions/handoff. Lint/typecheck/build, 175 test logic và 8/8 browser test mobile 320/390px sáng/tối đạt; đã xem ảnh cả hai theme. Chưa kiểm tra Safari/iPhone vật lý.

## Nền chi tiết mobile theo theme — D-158 (2026-10-26)

Bỏ ép nền trắng/palette sáng của D-157. Mobile dùng canvas theo theme; khối Nội dung dùng surface trắng/tối tương ứng, padding 12px. Giữ toàn màn hình và mọi hành vi. Thay đổi globals.css, mobile-detail.spec.ts và tài liệu brand/brief/UI/implementation/decisions/handoff. Lint/typecheck/build, 175 test logic và 8/8 browser test mobile 320/390px sáng/tối đạt; đã xem ảnh cả hai theme. Chưa kiểm tra iPhone/Safari vật lý.

## Chi tiết mobile toàn màn hình — D-157 (2026-10-26)

Chi tiết task/note dưới 700px chuyển thành trang nền trắng tràn màn hình (cả hai theme), không lộ danh sách bên dưới. Giữ bố cục hiện tại; đọc/sửa Nội dung giãn hết chiều cao còn lại, header/metadata không cuộn theo nội dung. Safe-area và visual viewport cho bàn phím; khóa cuộn nền khi mở, khôi phục khi đóng. Desktop và quick-add giữ bố cục cũ. D-157 thay giới hạn mobile 40dvh và popup mobile cũ. File: globals.css, SparkApp.tsx, content.spec.ts/mobile-detail.spec.ts, brand/brief/UI/implementation/decisions/handoff.

Kiểm tra: lint/typecheck/build, 175 test logic và 24/24 browser test chi tiết đạt. Chrome 320/390px sáng/tối, task/note, nội dung dài, lưu/reload, cuộn, metadata và offline; mô phỏng visual viewport khi bàn phím mở và màn ngang 600×390. Đã xem ảnh mobile/desktop; chưa kiểm tra Safari/iPhone vật lý.

## Kéo chọn chữ vượt khung chi tiết — D-156 (2026-10-15)

Đã tái hiện bằng chuột thật: kéo từ editor ra nền rồi thả tạo click trên backdrop và đóng sheet. ItemEditor kiểm tra cả pointerdown/pointerup, loại pointercancel và giữ click trên nền thật/nút Đóng. Không chặn selection hoặc thay đổi lưu/hủy draft. Áp dụng chung task/note. File: SparkApp.tsx, tests/browser/content.spec.ts, brief/decisions/handoff. Regression mới thất bại trên bản cũ vì sheet bị đóng, sau sửa đạt cả task/note tại 1280/390px: giữ selection/draft khi kéo trong→ngoài và ngoài→trong, lưu/reload giữ nội dung, click nền thật và nút Đóng hoạt động. Lint/typecheck/build, 175 test logic và 18/18 browser test editor local (có offline) đạt. Chưa kiểm tra Safari/iPhone vật lý.

## Control sắp xếp 30px — D-155 (2026-10-07)

Selector sắp xếp và nút đổi chiều có height/min-height 30px ở desktop/mobile; nút đổi chiều rộng 30px giữ hình tròn. Giữ chiều rộng selector, icon và hành vi sort. Thay đổi: globals.css, AGENTS, brand-guideline, brief/UI/implementation/decisions/handoff. Lint/typecheck/build và 175 test logic đạt. Chrome 1280/390px sáng/tối xác minh height/min-height 30px, nút tròn 30px, selector/đổi chiều đảo đúng thứ tự, không tràn ngang. Chưa kiểm tra Safari/iPhone vật lý.

## Nút thu/mở tại biên — D-154 (2026-10-06)

Sửa vị trí nút thu/mở trong D-153: tâm nút bám biên phải sidebar full/compact. Các icon còn lại giữ trục x=28px; giữ 240ms easeOutQuint. Thay đổi: globals.css, brand-guideline, decisions/handoff. Lint/typecheck/build và 175 test logic đạt; Chrome sáng/tối xác minh từng frame: tâm nút collapse khớp biên phải, các icon khác giữ x=28px; thao tác và mobile 390px đạt. Chưa kiểm tra Safari/iPhone vật lý.

## Trục trái sidebar — D-153 (2026-10-06)

Sidebar full/compact giữ tâm các icon ở x=28px, cùng trục badge logo. Dot dự án 12px ở cả hai trạng thái; đồng bộ và nút thu/mở cũng nằm trên trục trái. Bỏ rule compact căn giữa, giữ 240ms easeOutQuint và các thao tác. Thay đổi: globals.css, brand-guideline, decisions/handoff. Lint/typecheck/build, 175 test logic và 2/2 browser test icon/logo đạt. Chrome sáng/tối kiểm tra từng frame khi thu/mở: tâm icon/dot/footer giữ x=28px, kích thước không đổi; chọn dự án/trợ giúp và mobile 390px đạt. Đã xem ảnh sidebar full/compact; chưa kiểm tra Safari/iPhone vật lý.

## Sidebar 240ms — D-152 (2026-10-06)

Thay D-151: sidebar desktop/mobile dùng 240ms, easeOutQuint qua token chung; bỏ token easeInOutQuint dư. Giữ reduced motion và hành vi. Thay đổi: globals.css, brand-guideline, decisions/handoff. Lint/typecheck/build và 175 test logic đạt; Chrome 1280/390px xác minh 240ms/easeOutQuint, thao tác sidebar, reduced motion và không tràn ngang. Chưa kiểm tra Safari/iPhone vật lý.

## Sidebar 400ms — D-151 (2026-10-06)

Thu/mở sidebar desktop và trượt mở sidebar mobile dùng 400ms, easeInOutQuint `cubic-bezier(.83, 0, .17, 1)`. Giữ reduced motion, size và các animation khác. Thay đổi: globals.css, brand-guideline, decisions/handoff. Lint/typecheck/build và 175 test logic đạt; Chrome 1280/390px xác minh duration 400ms/easing, thu–mở, reduced motion và không tràn ngang. Chưa kiểm tra Safari/iPhone vật lý.

## Nền trượt bộ lọc — D-150 (2026-10-06)

Tất cả/Note/Task có một nền tròn trượt giữa các nút trong 280ms với Quint, cả desktop/mobile, sáng/tối và phím tắt. Giữ size/màu/tính năng lọc; reduced motion theo token chung. Thay đổi: SparkNavigation.tsx, globals.css, decisions/handoff. Lint/typecheck/build và 175 test logic đạt. Chrome kiểm tra 1280/390px ở cả sáng/tối: nền có vị trí trung gian khi trượt, khớp từng nút khi kết thúc, phím tắt và reduced motion hoạt động, không tràn ngang; đã xem ảnh mobile dark. Chưa kiểm tra Safari/iPhone vật lý.

## Reveal loading — D-149 (2026-10-06)

Nền Navy thu về phải trong 600ms, sau khi logo/progress fade 500ms; thay hướng trái và duration 500ms của D-145. Giữ Quint và reduced motion. Chỉnh rule gốc trong globals.css, cập nhật kiểm tra trình tự/duration/transform-origin ở startup.spec.ts và tài liệu brand/brief/UI/implementation/decisions. Kiểm tra local: lint/typecheck/build đạt, 175 test logic và 10/10 test browser startup đạt, gồm desktop 1280px/mobile 390px, trình tự fade–reveal, hướng phải, duration 600ms, reduced motion và lỗi/offline. Chưa kiểm tra Safari/iPhone vật lý.

## Phím tắt theme và CSS — D-147/D-148 (2026-10-06)

`<` Sáng, `>` Tối, `M`/`m` Theo hệ thống; không can thiệp input/textarea/select/contenteditable, IME hoặc Ctrl/Command/Alt. Dùng chung preference lưu thiết bị/cross-tab và đã thêm hướng dẫn trong bảng phím tắt.

CSS bỏ toàn bộ 5 important, gộp reduced motion bằng token, gộp dialog/swipe và bỏ 37 declaration dư. Giữ layout/màu/Quint/animationend loading và state động. Thay đổi: globals.css, SparkApp, keyboard-shortcuts, unit/browser tests, brand/brief/implementation/decisions/handoff. Lint/typecheck/build và 175 test logic đạt. Toàn bộ 46 browser test local đạt (2.6 phút), gồm theme shortcut, persistence, bỏ qua nhập văn bản/IME/modifier, reduced motion/OTP, startup, responsive 1280/390/320px, editor/icon/màu và offline. Đã phát hành commit `7288cfb089ab0b04d53a52527411e91351e3eaba`, deployment `dpl_AbxHPv4DRA9iEyy6WUgBfJ9ZCse2` READY với alias `spark.thuanngo.com`. 16/16 test theme/header trên production đạt (1 phút), gồm shortcut mới, OTP/reduced motion, offline và responsive. Runtime error/fatal trong 15 phút không có bản ghi khớp. Kiểm tra Chrome profile riêng, chưa thử Safari/iPhone vật lý. Commit handoff tiếp theo chỉ ghi kết quả, không đổi runtime.

## Loading, header và palette — D-145/D-146 (2026-10-06)

Yêu cầu mới thay phần tương ứng của D-144: animation header 220ms, giữ sync/All–Note–Task khi compact trên desktop; mobile giữ cụm nổi. Phản hồi bổ sung: H1 compact căn giữa chiều dọc với control bên phải. Splash Navy #111742 + logo negative icon/wordmark, tiến trình theo giai đoạn; dữ liệu sẵn sàng thì fade 500ms, sau đó nền thu trái 500ms. Reduced motion được tôn trọng; toàn bộ transition/animation dùng ease-out Quint.

Đã xác nhận chỉ dọn dữ liệu mẫu, giữ dữ liệu thật. Không tạo seed runtime; chỉ dọn bộ seed local nguyên vẹn, giữ mọi entry đã sửa/không rõ và project có item thật. Cloud/cache đúng user không hiển thị trước khi khởi động xong. Lỗi có retry/cache fallback; offline có cache vẫn mở được. Không xóa cloud, không đổi schema/RLS.

Chỉ bỏ Violet #8951C7 và nhãn Violet nhạt; giữ Deep Purple #65458A trong logo/dự án. Dự án Violet đổi Amber khi app đọc dữ liệu; cloud chỉ PATCH color có điều kiện user/id/màu cũ, queue upsert cũng chuẩn hóa. Quan Trọng Amber #D6A84F, Ưu tiên Coral #D9776A thống nhất danh sách/chi tiết/sidebar/swipe ở cả hai theme.

Thay đổi chính: SparkApp/globals.css, StartupScreen, startup/project-colors/data-ids/cloud-data, fixture/regression browser và tài liệu brand/brief/UI/implementation/offline/decisions. Asset logo không thay. Kiểm tra local: lint `src/tests` không warning/error, typecheck/build đạt, 171 test logic đạt; 44 kịch bản browser đã kiểm tra theo nhóm, gồm offline, error/retry, queue và đăng xuất giữ snapshot riêng. Đã xem splash 390px, kiểm tra header 1280/390/320px hai theme. Bản D-145/D-146 commit `4f3ff0d0728e28cdf1fe1400ab57095ff82c429c`, deployment `dpl_6yJU45DsSPVTREQcEtgkmKJVA6sT` READY trên `spark.thuanngo.com`: 44/44 browser test live đạt (3.2 phút), có offline thật cho app shell; cloud dùng transport giả lập trong profile test, không tác động tài khoản thật. Runtime error/fatal trong cửa sổ 15 phút không có bản ghi khớp. Phản hồi căn giữa H1 sau release đã qua build/typecheck/lint và 7/7 test header local, gồm so sánh tâm H1/control. Đã phát hành commit `bfb0a4b1b4c93f8356bd32d22250de54ef7a1ce8`, deployment `dpl_GW7cxHrUPMn6BDBPhtBz4wqfRUoZ` READY, alias production đúng domain; 7/7 test header live đạt (30 giây), tâm H1/control khớp ở desktop và scroll ổn định 1280/390/320px hai theme. Commit handoff tiếp theo chỉ ghi kết quả, không đổi runtime. Chưa kiểm tra Safari/iPhone vật lý hoặc phiên cloud thật.

## Header thu gọn — D-144 (2026-10-06)

Header desktop/mobile thu gọn khi cuộn quá 28px; trạng thái compact chỉ giữ h1 ở 50% cỡ chữ thường và dải màu 5px/radius 5px. Ẩn eyebrow, thống kê, nút mở sidebar mobile, nút sửa dự án và control trong header; cuộn về đầu khôi phục đầy đủ. H1 dùng letter-spacing -0.025em ở cả hai trạng thái. Giữ padding 20px/safe-area, blur 8px/WebKit và opacity dark 75% cho h1/dải màu.

Kiểm tra local: build/typecheck đạt; lint phần mã nguồn Spark và test header không có warning/error (lint toàn workspace có warning ở thư mục Masan ngoài phạm vi). 162 test logic đạt; 7/7 browser test header đạt ở 1280/390/320px sáng/tối, có danh sách ngắn và tên dự án dài. Hồi quy editor/icon/theme: 21 đạt, 2 offline test bỏ qua ở localhost theo điều kiện test. Chưa kiểm tra Safari/iPhone vật lý. Đã phát hành production: code commit `a2e82fb3e76b6f48b5ea96022f368b0f1367fdd9`, deployment `dpl_98JT3weKsQbvDhEvn23zqeLAUVae` READY, alias `spark.thuanngo.com`, build khoảng 28 giây. Trên domain live: 28 browser test đạt (58.4 giây); hai test offline chạy riêng với SPARK_TEST_OFFLINE=1 đạt (4.1 giây), tổng 30/30. Truy vấn runtime error/fatal của deployment trong cửa sổ 15 phút không có bản ghi khớp. Test chỉ dùng demo riêng; chưa kiểm tra Safari/iPhone vật lý hoặc phiên cloud thật. Commit handoff sau đó chỉ ghi kết quả, không đổi runtime. Thay đổi ở `SparkApp.tsx`, `globals.css`, regression `tests/browser/header.spec.ts` và tài liệu brand/brief/UI/implementation/decisions/handoff. Bảng màu chỉ được kiểm kê, chưa thay đổi token màu.

## Dark mode — đã phát hành production (D-138–D-143, 2026-10-05)

Đã phát hành qua main/Git integration tới https://spark.thuanngo.com sau yêu cầu deploy production của chủ dự án. Mốc xác minh: commit `22d0e66`, deployment `dpl_9aii13SzVwp1StjXBjg7PAdhVsDT` READY, production alias đúng domain. Build Vercel khoảng 26 giây. Commit tài liệu ghi nhận kết quả này không đổi runtime.

Kiểm tra trực tiếp domain production: 23/23 browser test đạt (59.7 giây), gồm editor B/I/U, giới hạn nội dung, draft/metadata click, icon, cả hai theme, preference/reload/cross-tab/storage bị chặn, responsive 320/390px và cold-start offline. Smoke riêng xác minh header dark opacity 75%, sidebar 42px/icon 20px, nền canvas và hover chỉ đổi icon ở full/compact. Profile kiểm tra riêng chỉ dùng demo local, không tác động dữ liệu tài khoản thật. Runtime error/fatal log của deployment trong 15 phút sau phát hành không có bản ghi khớp. Chưa kiểm tra Safari/iPhone vật lý hoặc phiên cloud thật.

Mặc định Theo hệ thống; preference của preview không chuyển sang production vì khác origin.

Phản hồi D-142: nền nghỉ nút sidebar dùng canvas ở cả hai theme (dark #121622), thay nền xám #242B3D trong D-141; hover chỉ đổi màu icon, nền giữ canvas. Giữ kích thước/icon/tâm. Đã kiểm tra canvas không đổi khi hover, icon đổi màu, click full/compact và responsive 390px ở cả hai theme; lint/typecheck/build và 162 test logic đạt.

Phản hồi D-141: nút thu/mở sidebar desktop 42×42px, icon giữ 20×20px, tâm giữ trên biên sidebar full/compact; dark nền xám #242B3D, hover/focus #30394E. Footer dùng cột minmax(0, 1fr) để tránh tràn grid track làm lệch tâm. Đã kiểm tra kích thước 42px/icon 20px, tâm trên biên, click thu/mở và màu hover ở cả hai theme; mobile 390px không tràn ngang. Lint/typecheck/build và 162 test logic đạt.

Phản hồi D-140: tiêu đề view/tên dự án và dải màu dưới header dùng opacity 75% trong dark mode, desktop/mobile/compact; theme sáng giữ 100%. Kiểm tra lint/typecheck/build, 162 test logic và smoke browser các view/dự án ở 1280/390px đạt; không tràn ngang. Chỉ h1/dải màu giảm opacity, không áp lên toàn header.

Phản hồi D-139: đã chỉnh hover nút lưu Tên/Nội dung thành nền Turquoise, icon Navy và nhãn chọn theme hiển thị uppercase. Nút Hủy hover nền neutral nhẹ (ink 8%), icon ink. Dropdown option/optgroup dùng nền/chữ theo theme, giữ color-scheme cho native picker. CSS sửa tại selector gốc; không đổi thao tác lưu hoặc preference.

Kiểm tra D-139: lint/typecheck/build và 162 test logic đạt; smoke test Chrome xác minh hover Lưu/Hủy ở Tên/Nội dung trong cả hai theme, option của dropdown dùng đúng nền/chữ/color-scheme và đổi Dự án được; nhãn uppercase không tràn ngang ở 390px. Popup native do trình duyệt/OS vẽ, chưa kiểm tra Safari/iPhone thật.

Preview ban đầu D-138 (trước D-139), code commit `e6d1728`, Vercel `dpl_B8sDFUj9xcQoFZwTrmtFZ6YzTJpT` READY; URL cố định `https://spark-o9r9k2bzb-thuanngo.vercel.app`, alias nhánh `https://spark-git-codex-spark-dark-mode-thuanngo.vercel.app`. Smoke test trên URL Vercel qua share link: Hôm nay tải đúng, chọn Tối và reload vẫn giữ, quick-add/Nội dung mobile hoạt động, không tràn ngang 390px, không có pageerror. Preview có Vercel Authentication; liên kết share tạm thời gửi riêng trong chat, không ghi token vào repo.

Nhánh `codex/spark-dark-mode` triển khai Theo hệ thống / Sáng / Tối tại Phím tắt & hiển thị, mặc định Theo hệ thống. Preference theo thiết bị/origin, không đồng bộ cloud. Áp dụng trước paint, đổi theo OS/cross-tab, sử dụng được khi offline hoặc storage preference bị chặn. Bảng màu trong brand guideline D-138; logo/project color, checked xám, header 8px/20px/5px và editor tối giản giữ nguyên.

Kiểm tra local: lint/typecheck/build đạt; 162 test logic đạt; 14 browser regression nội dung đạt, 2 regression icon và 7 test theme đạt sau sửa lỗi meta theme-color trùng. Kiểm tra 1280/390px, theme selector 320px, B/I/U, draft/metadata click, màu chữ chính/phụ đạt contrast tối thiểu 4.5:1 trên surface đã đo, lưu preference/reload/cross-tab, storage bị chặn và cold-start offline. Đã xem ảnh Hôm nay, quick-add và editor; chưa kiểm tra Safari/iPhone vật lý.

D-143 thay trạng thái chờ duyệt preview. Baseline production trước release dark mode là `6fd45b2`; các release bên dưới là lịch sử. Chưa xác minh trên iPhone vật lý. Không sửa database/auth/sync và không đưa `output/`, `outputs/` không rõ nguồn gốc vào commit.


> Rà soát: 2026-10-05. Repo `/Users/dna.thuan/Codex/Projects/To-Do List`, branch `main`.
> Production: https://spark.thuanngo.com
> Đây là bản tổng hợp yêu cầu đang áp dụng; lịch sử thay đổi nằm trong `docs/DECISIONS.md`.

## Phạm vi rà soát và cách tiếp tục

Đã đối chiếu toàn bộ yêu cầu trực tiếp có trong chat này từ 14/09 đến 05/10/2026 với D-117–D-137, tài liệu và mã nguồn hiện có. Bao gồm sửa lỗi click chi tiết, kết quả kiểm thử/phát hành và các giới hạn chưa kiểm tra. Không khẳng định đã kiểm kê mọi chat khác hoặc lưu bản gốc các screenshot trong thư mục tạm; thông số và hành vi trong các ảnh của chat này đã được ghi thành yêu cầu bên dưới.

Đọc `AGENTS.md`, `README.md`, `brand-guideline.md`, `docs/PROJECT_BRIEF.md`, `docs/UI_OPTIONS.md`, `docs/DECISIONS.md`, `docs/IMPLEMENTATION_GUIDE.md` và handoff này trước khi code. Khi liên quan dữ liệu, đọc thêm `docs/OFFLINE_SYNC.md`. Repo không có `docs/architecture.md`; kiến trúc nằm trong implementation guide. Tên file quyết định chuẩn là `docs/DECISIONS.md`.

Spark là công cụ task/note cá nhân, tiếng Việt, Compact Canvas, sidebar full/compact rail; mobile dock/drawer. Không thêm collaboration, reminder, recurring, AI hoặc định dạng nâng cao chưa được duyệt. Vùng chạm mobile mặc định 44px; ngoại lệ đã duyệt là hai control sắp xếp cao 30px (D-155).

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
| Chiều cao editor | Desktop sửa Nội dung: khung `min(86dvh, 820px)`, bằng giới hạn khung đọc dài, editor giãn theo phần còn lại. Mobile đọc/sửa giãn phần còn lại của màn hình (D-157); quick-add `160px`. | D-120 |
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
| Control sort | Selector height/min-height 30px; nút đổi chiều 30×30px ở desktop/mobile. Chỉ hai control sắp xếp trong ảnh. | D-155 |
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
