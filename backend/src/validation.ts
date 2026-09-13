import { z } from "zod";
export const email = z
  .email()
  .max(190)
  .transform((v) => v.toLowerCase().trim());
export const credentials = z.object({
  email,
  password: z
    .string()
    .min(8)
    .max(128)
    .refine(
      (v) => Buffer.byteLength(v, "utf8") <= 72,
      "Mật khẩu không được vượt quá 72 byte UTF-8.",
    ),
});
export const newPassword = z
  .string()
  .min(8, "Mật khẩu cần ít nhất 8 ký tự.")
  .max(72)
  .refine(
    (v) => Buffer.byteLength(v, "utf8") <= 72,
    "Mật khẩu không được vượt quá 72 byte UTF-8.",
  );
export const registrationPhone = z.string().trim()
  .transform((value) => value.replace(/[\s()-]/g, ""))
  .pipe(z.string().regex(/^(?:0|\+84)[35789][0-9]{8}$/, "Số điện thoại di động không hợp lệ."))
  .transform((value) => value.startsWith("0") ? `+84${value.slice(1)}` : value);
export const loginIdentifier = z.union([z.string().trim().pipe(email), registrationPhone]);
export const loginCredentials = z.preprocess((value) => {
  if (!value || typeof value !== "object") return value;
  const input = value as Record<string, unknown>;
  return { ...input, identifier: input.identifier ?? input.email };
}, z.object({ identifier: loginIdentifier, password: credentials.shape.password, notRobot: z.literal(true, { error: "Vui lòng xác nhận bạn không phải robot." }) }));
export const passwordResetRequest = z.object({ email });
export const passwordReset = z.object({ email, code: z.string().regex(/^\d{6}$/), newPassword, confirmPassword: z.string(), }).superRefine((value, ctx) => {
  if (value.newPassword !== value.confirmPassword)
    ctx.addIssue({ code: "custom", path: ["confirmPassword"], message: "Mật khẩu xác nhận chưa khớp." });
});
export const registration = credentials.extend({
  name: z.string().trim().min(2).max(100),
  password: newPassword,
  confirmPassword: z.string().min(1),
  emailCode: z.string().regex(/^\d{6}$/, "Nhập mã xác nhận email gồm 6 số."),
  notRobot: z.literal(true, { error: "Vui lòng xác nhận bạn không phải robot." }),
}).superRefine((value, ctx) => {
  if (value.password !== value.confirmPassword)
    ctx.addIssue({ code: "custom", path: ["confirmPassword"], message: "Mật khẩu xác nhận chưa khớp." });
});
export const productInput = z.object({
  name: z.string().trim().min(2).max(150),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(150),
  category: z.string().trim().min(2).max(80),
  occasion: z.enum([
    "Sinh nhật",
    "Tình yêu",
    "Chúc mừng",
    "Cảm ơn",
    "Ngày cưới",
  ]),
  price: z.number().int().min(10000).max(50000000),
  old_price: z.number().int().positive().nullable().default(null),
  image: z
    .string()
    .max(2500000)
    .refine(
      (v) =>
        /^\/images\/[a-zA-Z0-9._-]+$/.test(v) ||
        /^https:\/\//.test(v) ||
        /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(v),
      "Ảnh phải là đường dẫn /images/, HTTPS hoặc JPEG/PNG/WebP tải lên",
    ),
  images: z.array(z.string().max(2500000)).max(6).optional(),
  description: z.string().trim().min(10).max(5000),
  flowers: z.string().min(2).max(255),
  badge: z.string().max(40).nullable().default(null),
  stock: z.number().int().min(0).max(10000),
  active: z.boolean().default(true),
});
export function todayVN() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
export const checkoutInput = z.object({
  recipient: z.string().trim().min(2).max(100),
  phone: z.string().regex(/^(?:0|\+84)[0-9]{9}$/, "Số điện thoại không hợp lệ"),
  email,
  address: z.string().trim().min(10).max(500),
  delivery_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine(
      (v) =>
        !Number.isNaN(Date.parse(v)) &&
        new Date(v).toISOString().slice(0, 10) === v &&
        v >= todayVN(),
      "Ngày giao phải từ hôm nay",
    ),
  message: z.string().max(1000).default(""),
  payment_method: z.literal("cod"),
  items: z
    .array(
      z.object({
        product_id: z.number().int().positive(),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1)
    .max(50)
    .refine(
      (items) => new Set(items.map((i) => i.product_id)).size === items.length,
      "Sản phẩm bị trùng",
    ),
});
export function totals(items: { price: number; quantity: number }[]) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shipping = subtotal >= 800000 ? 0 : 35000;
  return { subtotal, shipping, total: subtotal + shipping };
}
export const transitions: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["shipping", "cancelled"],
  shipping: ["delivered"],
  delivered: [],
  cancelled: [],
};
