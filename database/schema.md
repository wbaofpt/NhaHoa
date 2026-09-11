# MongoDB — Nhà Hoa

Database ứng dụng: `nha_hoa`. Database kiểm thử riêng: `nha_hoa_test`.
Backend dùng MongoDB Node.js driver chính thức; cần Atlas hoặc replica set để chạy transaction.

| Collection | Nội dung / ràng buộc |
|---|---|
| `products` | `id` số và `slug` duy nhất; tên, loại, dịp tặng, giá VND nguyên, ảnh, mô tả, thành phần, tồn kho, `active` boolean |
| `users` | `id`, email duy nhất; tên, mật khẩu bcrypt, role `customer/admin`, `created_at` kiểu Date |
| `orders` | Mã `NH…` duy nhất; người nhận, liên hệ, địa chỉ, ngày giao `YYYY-MM-DD`, thiệp, tổng tiền, trạng thái, `items` nhúng |
| `sessions` | Hash token, `user_id`, `expires_at` kiểu Date; TTL tự dọn phiên hết hạn |
| `inquiries` | Lời nhắn, tên, email, thời gian gửi |
| `subscribers` | Email đăng ký duy nhất và thời gian |
| `counters` | Bộ đếm nguyên tử cho `products/users/inquiries`, giữ tương thích ID phía React |
| `favorites` | `user_id`, `product_id`, ngày lưu; cặp user/product duy nhất |

`users.session_version` và `sessions.session_version` kiểm tra phiên thuộc thế hệ hiện tại. Đổi mật khẩu/đăng xuất mọi thiết bị tăng version trong transaction và xóa các phiên hiện có. Phiên tạo từ dữ liệu đăng nhập cũ cũng bị từ chối.

Mỗi phần tử `orders.items` lưu `product_id`, `name`, `image`, `price`, `quantity` tại lúc mua. Lịch sử không đổi khi chỉnh sửa sản phẩm.

Đặt hàng chạy trong `withTransaction`: giảm kho bằng điều kiện `stock >= quantity`, đọc giá từ sản phẩm, rồi ghi đơn. Bất kỳ lỗi nào đều rollback. Hủy đơn cập nhật trạng thái và hoàn kho trong cùng transaction; driver tự retry write conflict. Các thao tác trong transaction chạy tuần tự.

`indexes.json` định nghĩa index unique, query và TTL. `npm run db:setup` tạo index, nạp `seed.json` bằng `$setOnInsert`, đồng bộ counters và tạo admin nếu chưa có. Không ghi đè tài khoản/sản phẩm đã tồn tại.

Đầu vào API được kiểm tra bằng Zod ở `backend/src/validation.ts`; chỉ dùng bộ lọc MongoDB do server tạo, không nhận toán tử MongoDB từ JSON khách gửi.

Tham khảo: [MongoDB transactions](https://www.mongodb.com/docs/drivers/node/current/crud/transactions/), [compound operations](https://www.mongodb.com/docs/drivers/node/current/crud/compound-operations/).
