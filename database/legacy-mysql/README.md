# MySQL cũ — chỉ lưu tham chiếu

Server đã chuyển sang MongoDB. Các file trong thư mục này không còn được gọi từ npm scripts và không còn dependency `mysql2`.

Không chạy các script cũ với `backend/.env` hiện tại. Chúng được viết cho cấu trúc và cấu hình MySQL trước khi chuyển đổi. Bản sao cấu hình/dữ liệu cũ nằm trong `.local/`, không được commit.

Cấu trúc dữ liệu đang dùng: `../schema.md`, `../indexes.json`, `../seed.json`.
