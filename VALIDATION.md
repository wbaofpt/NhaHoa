# Kiểm tra Nhà Hoa

## Kết quả mới nhất — 12/09/2026

- Form admin sản phẩm hỗ trợ chọn ảnh JPEG/PNG/WebP từ máy, xem trước và lưu data URL tối đa 1,5MB; backend từ chối loại ảnh khác và giới hạn badge 40 ký tự. Unit test xác nhận data URL an toàn và badge quá dài bị từ chối. Build và 7/7 unit test đạt; kiểm thử admin UI đạt.
- Thanh bên `Admin.tsx` đã được đồng bộ để hiển thị tất cả route admin: 4 mục lõi, 4 mục dữ liệu và 4 mục vận hành. Kiểm thử đăng nhập/chỉnh sửa admin đạt sau thay đổi.

- Điều kiện màn chào đã được sửa: chỉ lần đầu mở tab ở trang chủ, không lặp khi đổi trang/quay lại/reload; mở trực tiếp cửa hàng khi API đang chờ cũng không phủ màn hình. Build thành công và 3 kiểm thử motion đạt. Các ghi nhận màn phủ trên mọi điều hướng bên dưới là lịch sử, không còn là hành vi hiện tại.
- Admin được tổ chức trong `frontend/src/pages/admin/`: trang chính quản lý sản phẩm/đơn/lời nhắn và các trang riêng cho tồn kho, khách hàng, người nhận tin, báo cáo. Build và kiểm thử giao diện admin đạt.
- Bổ sung trang vận hành: lịch giao hoa, cảnh báo tồn kho dưới 5 bó, nhật ký hoạt động và cài đặt vận hành chỉ đọc. Các route bổ sung được bọc `AdminAccess`, redirect người chưa đăng nhập và chặn customer.

- Điều chỉnh tiếp: chuyển cảnh 950ms, màn hoa mờ dần 900ms; loader dùng portal phủ toàn viewport. Kiểm tra kích thước phủ màn hình, inert được bật/tắt đúng, reduced motion, điều hướng nhanh, accessibility và ba luồng cửa hàng/mobile/thanh toán: 6 kiểm thử liên quan đạt sau khi cho phép animation bị hủy bình thường trong bước chụp ảnh. Build thành công, đã xem ảnh loader toàn màn hình.

- Bổ sung chuyển cảnh và BloomLoader: build thành công, toàn bộ 17 E2E test đạt. Kiểm tra điều hướng nhanh/Back, giữ focus khi tìm kiếm, loader với API bị giữ chờ, kết thúc loading và reduced motion. Đã xem ảnh `.local/bloom-loading.png`.

- `npm run build` thành công; `npm test` đạt 6/6; `npm run test:e2e` đạt 15/15 trong một lượt chạy toàn bộ.
- Hồ sơ cá nhân: yêu cầu đăng nhập, lưu điện thoại/địa chỉ vào MongoDB, giữ dữ liệu sau tải lại, điền sẵn thanh toán. API từ chối thay email/ID/quyền và số điện thoại sai định dạng.
- Chi tiết đơn: khách chưa đăng nhập nhận 401, tài khoản khác nhận 404; chủ đơn xem được sản phẩm, liên hệ, địa chỉ, lời thiệp và tổng tiền. Thay hồ sơ không thay địa chỉ trong đơn cũ. Liên hệ từ đơn điền sẵn mã để hỗ trợ.
- Hai trang tài khoản mới được kiểm tra ở 390px và bằng axe WCAG A/AA, không có lỗi serious/critical. Đã xem `.local/profile-mobile.png` và `.local/order-detail-mobile.png`.
- API local trả trạng thái `ok`, database `mongodb`; website local truy cập được tại cổng 5173.

Ngày kiểm tra trước: 11/09/2026, Windows, MongoDB Atlas. E2E sử dụng database riêng `nha_hoa_test`.

- `npm run build`: thành công cho backend TypeScript và frontend React/Vite.
- `npm test`: 6/6 đạt, gồm phí giao, giới hạn mật khẩu/bcrypt, số lượng, ngày giao, giá do server xác định và trạng thái đơn.
- `npm run test:e2e`: 11/11 đạt trong lượt chạy toàn bộ.
  - Accessibility: axe không phát hiện lỗi serious/critical trên trang chủ, cửa hàng, đăng nhập và liên hệ trong chế độ reduced motion.
  - API: đăng nhập, phân quyền quản trị, tính giá, tồn kho, hủy đơn/hoàn kho và hai yêu cầu cạnh tranh sản phẩm còn một đơn vị.
  - Bảo mật: từ chối nguồn ghi khác origin, thiếu header bảo vệ, sai content type và khách chưa đăng nhập; kiểm tra no-store và mật khẩu yếu.
  - Tài khoản: tách yêu thích/đơn hàng giữa người dùng, kiểm tra mật khẩu hiện tại, thu hồi phiên sau đổi mật khẩu hoặc đăng xuất mọi thiết bị.
  - Giao diện: trang bảo mật đổi mật khẩu thành công; các trang riêng chuyển tới đăng nhập; đăng ký từ thanh toán quay lại đúng trang và giữ giỏ.
  - Cửa hàng: tìm kiếm, yêu thích đồng bộ tài khoản, giỏ hàng sau reload, đặt COD, tra cứu đơn thuộc tài khoản và chỉnh sửa sản phẩm quản trị.
  - Responsive: menu và 13 đường dẫn không tràn ngang tại chiều rộng 390px.
  - Hiệu ứng: nội dung hiện khi cuộn; reduced motion giữ nội dung hiển thị và ẩn cánh hoa trang trí.
- Đã xem ảnh trang chủ và trang bảo mật: `.local/home-enhanced.png`, `.local/account-security.png`.
- Runner dọn dữ liệu có nhãn kiểm thử và hoàn lại tồn kho trên database test.

Giới hạn: chưa kiểm tra thiết bị iOS/Android vật lý hoặc kiểm thử xâm nhập độc lập; chưa triển khai tên miền công khai. Chưa tích hợp thanh toán online, SMTP, xác minh email, MFA hoặc khôi phục mật khẩu qua email. Rate limit lưu trong bộ nhớ một tiến trình. Catalog và ảnh là dữ liệu minh họa.

## Bổ sung trang và nội dung — 11/09/2026

- Thêm 15 đường dẫn nội dung: 5 bộ sưu tập chi tiết, trang dịch vụ và 3 dịch vụ chi tiết, hướng dẫn đặt hàng, chăm sóc hoa, sơ đồ trang và 3 bài viết. Làm lại trang 404; bổ sung nội dung FAQ, chính sách và điều hướng.
- Build TypeScript/React thành công.
- 11 kiểm thử hiện có đạt trong lượt kiểm tra hồi quy. Hai kiểm thử nội dung mới đạt sau khi sửa kiểu chữ đánh số hướng dẫn và nhãn bộ lọc chủ đề.
- Kiểm tra 15 trang mới tại chiều rộng 390px: có một H1, tiêu đề trang phù hợp, ảnh tải được, không tràn ngang; không ghi nhận lỗi JavaScript.
- Axe không phát hiện lỗi serious/critical trên dịch vụ, hướng dẫn, chăm sóc hoa và sơ đồ trang với reduced motion.
- Kiểm tra đường đi bộ sưu tập → sản phẩm, dịch vụ → biểu mẫu có chủ đề, tìm/lọc bài viết, tìm FAQ và điều hướng từ 404.
- Đã xem trực tiếp `.local/services-desktop.png` và `.local/guide-mobile.png`.
