export type Product = {
  id: number;
  slug: string;
  name: string;
  category: string;
  occasion: string;
  price: number;
  old_price: number | null;
  image: string;
  description: string;
  flowers: string;
  badge: string | null;
  stock: number;
  active: boolean | number;
};
export type User = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "customer";
};
export type CartItem = { product: Product; quantity: number };
export type Order = {
  id: string;
  status: string;
  recipient: string;
  email: string;
  phone: string;
  address: string;
  delivery_date: string;
  message: string;
  subtotal: number;
  shipping: number;
  total: number;
  created_at: string;
  items?: { name: string; image: string; price: number; quantity: number }[];
};
export const money = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value,
  );
export const statuses: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  preparing: "Đang chuẩn bị hoa",
  shipping: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};
export const categories = [
  "Tất cả",
  "Bó hoa",
  "Giỏ hoa",
  "Bình hoa",
  "Hoa cưới",
];
export const occasions = [
  "Sinh nhật",
  "Tình yêu",
  "Chúc mừng",
  "Cảm ơn",
  "Ngày cưới",
];
export function today() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch("/api" + path, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-NhaHoa-Request": "web",
      ...options?.headers,
    },
  });
  const data = await response.json();
  if (
    response.status === 401 &&
    !["/auth/login", "/auth/register", "/auth/me"].includes(path)
  )
    window.dispatchEvent(new Event("nh-session-expired"));
  if (!response.ok)
    throw new Error(data.error || "Có lỗi xảy ra, vui lòng thử lại.");
  return data as T;
}
export const post = (body: unknown): RequestInit => ({
  method: "POST",
  body: JSON.stringify(body),
});
