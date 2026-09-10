# Kiểm tra Nhà Hoa

Ngày kiểm tra: 11/09/2026, môi trường Windows, MySQL 8 tại `127.0.0.1:3307`.

- `npm run build`: thành công cho backend TypeScript và frontend Vite/React.
- `npm test`: 5/5 đạt — phí giao, đầu vào số lượng, ngày giao, giá do server xác định và trạng thái đơn kết thúc.
- Playwright: 6 kịch bản đạt (5 trong lượt toàn bộ và 1 kiểm tra quản trị bổ sung).
  - Accessibility: không có vi phạm serious/critical theo axe WCAG A/AA trên trang chủ, cửa hàng, đăng nhập và liên hệ; kiểm tra ở trạng thái reduced motion.
  - API: đăng ký/đăng nhập, phân quyền, giá, tồn kho, hủy đơn, hoàn kho đúng một lần, thêm/ẩn sản phẩm và hai yêu cầu cạnh tranh một sản phẩm còn một đơn vị.
  - Giao diện: tìm kiếm không dấu, yêu thích, giỏ hàng lưu sau reload và xóa sản phẩm.
  - Responsive: menu mobile và 13 trang công khai không tràn ngang ở 390px.
  - Đặt hàng: tạo đơn COD thật và tra cứu bằng mã/email.
  - Quản trị: đăng nhập bằng giao diện, mở sản phẩm, lưu chỉnh sửa thành công.
- Ảnh desktop/mobile đã xem trực tiếp; ảnh trong `.local/preview-desktop.png`, `.local/preview-mobile.png`, `.local/admin.png`.
- Dữ liệu kiểm thử đã được dọn và tồn kho được hoàn lại.

Giới hạn: chưa kiểm tra trên thiết bị iOS/Android vật lý; chưa triển khai tên miền công khai; chưa kết nối thanh toán online, SMTP hoặc đơn vị vận chuyển. Dữ liệu catalog và ảnh là minh họa để phát triển.
