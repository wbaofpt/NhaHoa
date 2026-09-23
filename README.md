# Nhà Hoa

Website bán hoa tiếng Việt sử dụng **React + TypeScript**, **Express + TypeScript** và **MongoDB Atlas**. Giao diện kem/xanh lá trầm/hồng đất, logo SVG riêng, responsive và hỗ trợ reduced motion.

## Hình ảnh giao diện

Ảnh chụp trực tiếp từ các màn hình chính của ứng dụng ở độ rộng desktop.

<table>
  <tr>
    <td align="center"><img src="docs/screenshots/home.png" alt="Trang chủ Nhà Hoa" width="420"><br><sub>Trang chủ</sub></td>
    <td align="center"><img src="docs/screenshots/shop.png" alt="Cửa hàng hoa" width="420"><br><sub>Cửa hàng hoa</sub></td>
  </tr>
  <tr>
    <td align="center"><img src="docs/screenshots/collections.png" alt="Bộ sưu tập hoa" width="420"><br><sub>Bộ sưu tập</sub></td>
    <td align="center"><img src="docs/screenshots/services.png" alt="Dịch vụ Nhà Hoa" width="420"><br><sub>Dịch vụ</sub></td>
  </tr>
  <tr>
    <td align="center"><img src="docs/screenshots/login.png" alt="Đăng nhập Nhà Hoa" width="420"><br><sub>Đăng nhập</sub></td>
    <td></td>
  </tr>
</table>

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

Trong `/quan-tri/products`, quản trị viên có thể chọn ảnh JPEG/PNG/WebP từ máy (tối đa 1,5MB); ảnh được gửi dưới dạng data URL hợp lệ và lưu cùng sản phẩm trong MongoDB. Form hiển thị ảnh xem trước và cho phép nhập hoặc xóa badge tối đa 40 ký tự. Không nhận SVG, HTML hay loại file khác.

## Cấu trúc

```text
frontend/
  src/pages/          Trang cửa hàng, mua hàng, tài khoản, nội dung và quản trị
  src/pages/admin/    Admin, tồn kho, khách hàng, người nhận tin và báo cáo
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
| `/quan-tri` | Tổng quan quản trị và điều hướng toàn bộ khu vực admin |
| `/quan-tri/products`, `/quan-tri/orders`, `/quan-tri/inquiries` | Quản lý sản phẩm, trạng thái đơn và lời nhắn |
| `/quan-tri/inventory`, `/quan-tri/customers`, `/quan-tri/subscribers`, `/quan-tri/reports` | Tồn kho, khách hàng, người nhận tin và báo cáo |
| `/quan-tri/order-calendar`, `/quan-tri/alerts`, `/quan-tri/activity`, `/quan-tri/settings` | Lịch giao, cảnh báo tồn kho, nhật ký hoạt động và cài đặt vận hành |
| `/tai-khoan/bao-mat` | Đổi mật khẩu, đăng xuất mọi thiết bị |
| `/bo-suu-tap/:slug` | 5 trang dịp tặng, cách chọn và sản phẩm từ MongoDB |
| `/dich-vu`, `/dich-vu/:slug` | Hoa theo yêu cầu, hoa cưới, hoa doanh nghiệp; liên kết tư vấn có sẵn chủ đề |
| `/huong-dan-dat-hang` | 6 bước đặt COD, phí giao, lưu mã đơn và hỗ trợ thay đổi |
| `/cham-soc-hoa` | Chăm bó hoa, giỏ, bình và hoa cầm tay |
| `/so-do-trang` | Điều hướng đến các trang cửa hàng, nội dung, tài khoản và hỗ trợ |
| `/tai-khoan/thong-tin` | Lưu tên, điện thoại và địa chỉ thường dùng; tự điền khi thanh toán |
| `/tai-khoan/don-hang/:id` | Chi tiết đơn thuộc tài khoản: tiến độ, sản phẩm, tiền, địa chỉ và lời thiệp |

Góc chuyện hoa có 6 bài với tìm kiếm không dấu và lọc chủ đề. FAQ có 13 câu trả lời, hỗ trợ tìm kiếm. Trang 404 có đường về cửa hàng và sơ đồ trang. Nội dung bộ sưu tập, dịch vụ và bài mới nằm trong `frontend/src/editorial.ts`; các trang tư vấn nằm trong `frontend/src/pages/Explore.tsx`. Dịch vụ thiết kế riêng tiếp nhận qua biểu mẫu liên hệ và cần xác nhận riêng, không tự tạo đơn mua hàng.

Hồ sơ cá nhân lưu trong collection `users`, cập nhật qua `PATCH /api/auth/profile` có xác thực và chỉ nhận tên, điện thoại, địa chỉ. Không cho thay email, ID hoặc quyền qua API này. `GET /api/orders/:id` kiểm tra chủ sở hữu và không trả `_id`/`user_id`. Sửa hồ sơ không thay đổi thông tin đã chốt trong đơn cũ. Liên hệ từ chi tiết đơn điền sẵn mã đơn vào lời nhắn.

Khách có thể xem/tìm hoa, thêm vào giỏ, đọc bài và gửi liên hệ. Đặt hàng, yêu thích, tài khoản, tra cứu đơn và bảo mật tài khoản yêu cầu đăng nhập. Đăng nhập xong quay về trang đang cần dùng, giữ nguyên giỏ. API kiểm tra chủ sở hữu đơn; biết mã và email không cho phép xem đơn của tài khoản khác. Quản trị viên vẫn có quyền xử lý đơn.

## Hiệu ứng và bảo mật bổ sung

- `PageMotion.tsx` tạo chuyển cảnh nội dung 950ms khi đổi đường dẫn, không phủ màn hình. Hiệu ứng cũ được hủy khi điều hướng tiếp; thay bộ lọc/query không chạy lại chuyển cảnh hoặc tạo lại biểu mẫu.
- `HomeWelcome` chỉ hiển thị màn chào toàn màn hình khi lần đầu mở tab tại `/` và catalog đang tải. `sessionStorage` ghi nhận lần vào web để không lặp lại khi điều hướng, quay lại trang chủ hoặc reload trong cùng tab. Mở thẳng trang khác không có màn chào. Nếu trình duyệt chặn storage, trạng thái vẫn giữ trong lần chạy ứng dụng hiện tại.
- Các lần tải catalog, phiên đăng nhập hoặc trang lazy còn lại chỉ hiển thị thông báo tại chỗ và skeleton. Chỉ màn chào ban đầu mới khóa cuộn và đặt nội dung sau nó thành inert; trạng thái được khôi phục khi tải xong. Reduced motion tắt CSS animation và chuyển cảnh WAAPI.

- Các khối nội dung hiện dần khi vào màn hình bằng IntersectionObserver; cánh hoa banner chạy một lượt, phản hồi yêu thích/nút/menu bằng transform/opacity. Reduced motion giữ nội dung hiển thị, tắt hiệu ứng không thiết yếu.
- Collection `favorites` dùng unique index `user_id + product_id`; yêu thích đồng bộ theo tài khoản, không chia sẻ giữa người dùng cùng trình duyệt.
- Tất cả API ghi yêu cầu JSON và header `X-NhaHoa-Request: web`, từ chối origin lạ và Fetch Metadata `cross-site`. Không bật CORS cho bên thứ ba. Đây là biện pháp CSRF cho API cùng origin, không phải thông tin đăng nhập.
- Mật khẩu tối thiểu 8 ký tự, tối đa 72 byte UTF-8 theo giới hạn bcrypt. Đổi mật khẩu cần mật khẩu hiện tại và thu hồi mọi phiên.
- Giới hạn theo IP cho API, đăng nhập, đặt đơn, liên hệ; đăng nhập còn có giới hạn lần thất bại theo email. Rate limit hiện lưu trong bộ nhớ một tiến trình; khi chạy nhiều replica cần shared store.
- API nhạy cảm gửi `Cache-Control: no-store`; cookie HttpOnly/SameSite và Secure trong production; không ghi URI/mật khẩu vào log lỗi database.
- Helmet đặt security headers. Vite dev có CSP và chặn iframe; production backend có thể phục vụ `frontend/dist` trực tiếp dưới CSP. Nếu dùng CDN/reverse proxy phục vụ HTML, cần cấu hình CSP/security headers ở lớp đó. Chỉ dev cho phép inline script để Vite chạy HMR.

Tham khảo: [OWASP CSRF prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html), [OWASP password storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html). Hệ thống có xác minh email khi đăng ký và khôi phục mật khẩu qua mã gửi email.

## Dữ liệu và transaction

MongoDB lưu các collection `products`, `users`, `orders`, `sessions`, `favorites`, `inquiries`, `subscribers`, `counters`. Chi tiết mua hàng được nhúng trong `orders.items` và giữ giá/tên/ảnh tại thời điểm đặt.

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

## Phạm vi triển khai

Hiện hỗ trợ COD, xác minh email và khôi phục mật khẩu qua email. Chưa tích hợp cổng thanh toán online hoặc hãng vận chuyển. Catalog và ảnh là dữ liệu minh họa, cần thay bằng sản phẩm cửa hàng thật.

Build `frontend/dist`, cấu hình web server SPA fallback và proxy `/api` tới backend. Chạy backend bằng `npm run start -w backend`. Dùng HTTPS, `NODE_ENV=production`, `FRONTEND_ORIGIN` và `frontend/.env` với `VITE_SITE_URL` đúng tên miền; Secure cookie được bật trong production. Preview mặc định noindex. SEO/social preview từng trang đầy đủ cần prerender/SSR khi triển khai công khai.

## Thiết kế và tham khảo

Áp dụng các skill `karpathy-guidelines`, `ui-skills-root`, `ui-ux-pro-max`, `fixing-accessibility`, `fixing-metadata`, `fixing-motion-performance`. Font Playfair Display / Be Vietnam Pro, icon Lucide, ảnh Unsplash lưu local, logo SVG riêng. Nguồn ảnh trong `database/ASSETS.md` và `prepare_catalog.py`.

Tài liệu: [MongoDB Node.js transactions](https://www.mongodb.com/docs/drivers/node/current/crud/transactions/), [compound operations](https://www.mongodb.com/docs/drivers/node/current/crud/compound-operations/), [Vite](https://vite.dev/guide/).
