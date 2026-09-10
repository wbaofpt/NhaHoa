# Nhà Hoa

Website bán hoa tiếng Việt sử dụng **React + TypeScript**, **Express + TypeScript** và **MongoDB Atlas**. Giao diện kem/xanh lá trầm/hồng đất, logo SVG riêng, responsive và hỗ trợ reduced motion.

## Chạy dự án

```powershell
npm install
npm run db:setup
npm run dev
```

- Website: http://127.0.0.1:5173
- API: http://127.0.0.1:4000/api/health — trả về `{"status":"ok","database":"mongodb"}`.
- MongoDB database: `nha_hoa`, kết nối bằng `MONGODB_URI` trong `backend/.env`.
- Tài khoản quản trị: `ADMIN_EMAIL` và `ADMIN_PASSWORD` trong `backend/.env`. Đăng nhập rồi vào `/quan-tri`.
- Không cần khởi động MySQL. Các chức năng của server hiện đọc/ghi MongoDB.

URI Atlas đã được cấu hình từ file credentials do người dùng cung cấp; file nguồn không bị sửa. `.env`, bản sao cũ và dữ liệu riêng không được đưa vào Git.

## Cấu hình trên máy khác

Yêu cầu Node.js 22.12+ hoặc 24 và MongoDB Atlas (hoặc MongoDB replica set hỗ trợ transaction).

Sao chép `backend/.env.example` thành `backend/.env`, điền:

```dotenv
PORT=4000
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@YOUR_CLUSTER.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=nha_hoa
FRONTEND_ORIGIN=http://127.0.0.1:5173
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace-with-a-strong-password
NODE_ENV=development
```

Thay username, password và cluster bằng thông tin thật; ký tự đặc biệt trong URI phải URL-encode. Database User cần quyền đọc/ghi/tạo index trên database ứng dụng. Atlas Network Access phải cho phép IP máy chạy server. Không đưa URI vào frontend.

`npm run db:setup` tạo indexes, nạp 12 mẫu hoa và tạo admin nếu chưa có. Lệnh không ghi đè sản phẩm hoặc tài khoản đã tồn tại. Thay `ADMIN_PASSWORD` trong `.env` không tự đổi mật khẩu tài khoản cũ.

## Cấu trúc

```text
frontend/
  src/pages/          Trang cửa hàng, mua hàng, tài khoản, nội dung và quản trị
  src/components.tsx  Thành phần giao diện chung
  src/store.tsx       Giỏ hoa, yêu thích và tài khoản
  public/             Logo, ảnh local
backend/
  src/db.ts           MongoClient, typed collections, counters, transaction
  src/server.ts       API, cookie session, phân quyền, luồng đơn hàng
  src/setup.ts        Tạo indexes, seed và admin
  src/validation.ts   Kiểm tra đầu vào và tính phí
database/
  schema.md           Mô tả collection và quy tắc lưu dữ liệu
  indexes.json        Unique indexes, query indexes và TTL session
  seed.json           Catalog mẫu MongoDB
  prepare_catalog.py  Tải ảnh và tạo seed JSON
  configure-atlas.cjs Công cụ nhập cấu hình từ file credentials local
  legacy-mysql/      Tài liệu/script MySQL cũ, chỉ giữ làm tham chiếu
tests/
  run-e2e.mjs         Khởi chạy môi trường MongoDB test riêng
```

## Chức năng

| Đường dẫn | Chức năng |
|---|---|
| `/` | Trang chủ, hoa nổi bật, dịp tặng, câu chuyện thương hiệu |
| `/hoa`, `/hoa/:slug` | Tìm có/không dấu, lọc loại/dịp/giá, sắp xếp, chi tiết, tồn kho |
| `/bo-suu-tap`, `/yeu-thich` | Bộ sưu tập và hoa yêu thích |
| `/gio-hang`, `/thanh-toan`, `/dat-hang-thanh-cong` | Giỏ hoa lưu tại trình duyệt, đặt COD, ngày giao, thiệp |
| `/dang-nhap`, `/dang-ky`, `/tai-khoan`, `/tra-cuu` | Tài khoản và theo dõi đơn |
| `/ve-nha-hoa`, `/chuyen-nha-hoa`, `/chuyen-nha-hoa/:slug` | Giới thiệu và bài viết |
| `/lien-he`, `/cau-hoi`, `/chinh-sach/:slug` | Lời nhắn, giải đáp, chính sách |
| `/quan-tri` | Sản phẩm, tồn kho, đơn và lời nhắn khách hàng |

## Dữ liệu và transaction

MongoDB lưu các collection `products`, `users`, `orders`, `sessions`, `inquiries`, `subscribers`, `counters`. Chi tiết mua hàng được nhúng trong `orders.items` và giữ giá/tên/ảnh tại thời điểm đặt.

ID số của sản phẩm/tài khoản được giữ để tương thích với React và giỏ hoa đã lưu. Mã đơn giữ dạng `NH…`. Ngày giao vẫn là chuỗi `YYYY-MM-DD`; các timestamp khác dùng BSON Date và trả về ISO qua API.

Giá do server đọc từ MongoDB, không tin giá/tổng tiền khách gửi. Phí giao 35.000đ, miễn phí từ 800.000đ. Đặt đơn và trừ kho trong cùng transaction; điều kiện `stock >= quantity` ngăn bán quá kho. Hủy đơn trước khi giao hoàn kho một lần trong transaction.

Mật khẩu bcrypt; token phiên được băm; cookie HttpOnly/SameSite; index TTL dọn phiên hết hạn. API vẫn kiểm tra thời hạn phiên trực tiếp, không phụ thuộc thời điểm TTL chạy. API có kiểm tra origin và rate limit.

## Kiểm thử

```powershell
npm run build
npm test
npx playwright install chromium
npm run test:e2e
```

E2E tự tạo indexes/seed trên **`nha_hoa_test`**, ưu tiên API cổng **4001**, frontend **5174** (tự chọn cổng trống khác nếu đang dùng), chạy test rồi tắt hai server thử nghiệm. Không dùng database `nha_hoa` để tạo/xóa đơn kiểm thử. Tài khoản Atlas cần quyền trên database test này. Không cần bật `npm run dev` trước E2E.

Runner kiểm tra đăng nhập, phân quyền, tìm hoa, giỏ hàng, COD, tra cứu, quản trị, accessibility và hai khách mua cùng một sản phẩm còn một bó. Dữ liệu có nhãn kiểm thử được dọn và hoàn lại kho sau khi chạy.

## Chuyển từ MySQL

Trước khi chuyển, instance cũ có 12 sản phẩm và 1 admin, không có đơn hàng hoặc lời nhắn. Catalog cùng ID, giá và tồn kho đã được nạp vào Atlas; admin dùng lại thông tin đăng nhập đã có. Người dùng cần đăng nhập lại vì phiên MySQL không được chuyển.

Bản sao chỉ lưu local: `.local/mysql-export.json` và `.local/backend-mysql.env`. Dữ liệu MySQL cũ ở `.local/mysql-data` được giữ nguyên. Các file SQL và công cụ cũ nằm trong `database/legacy-mysql/`, không thuộc luồng chạy hoặc kiểm thử hiện tại. Dependency `mysql2` đã được gỡ.

## Phạm vi triển khai

Hiện hỗ trợ **COD**; chưa tích hợp cổng thanh toán online, SMTP, khôi phục mật khẩu qua email hay hãng vận chuyển. Liên hệ/đăng ký nhận tin lưu MongoDB, chưa gửi email tự động. Catalog và ảnh là dữ liệu minh họa, cần thay bằng sản phẩm cửa hàng thật.

Build `frontend/dist`, cấu hình web server SPA fallback và proxy `/api` tới backend. Chạy backend bằng `npm run start -w backend`. Dùng HTTPS, `NODE_ENV=production`, `FRONTEND_ORIGIN` và `frontend/.env` với `VITE_SITE_URL` đúng tên miền; Secure cookie được bật trong production. Preview mặc định noindex. SEO/social preview từng trang đầy đủ cần prerender/SSR khi triển khai công khai.

## Thiết kế và tham khảo

Áp dụng các skill `karpathy-guidelines`, `ui-skills-root`, `ui-ux-pro-max`, `fixing-accessibility`, `fixing-metadata`, `fixing-motion-performance`. Font Playfair Display / Be Vietnam Pro, icon Lucide, ảnh Unsplash lưu local, logo SVG riêng. Nguồn ảnh trong `database/ASSETS.md` và `prepare_catalog.py`.

Tài liệu: [MongoDB Node.js transactions](https://www.mongodb.com/docs/drivers/node/current/crud/transactions/), [compound operations](https://www.mongodb.com/docs/drivers/node/current/crud/compound-operations/), [Vite](https://vite.dev/guide/).
