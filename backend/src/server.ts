import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import { randomBytes, createHash } from "node:crypto";
import { ZodError, z } from "zod";
import { protectWrites } from "./security.js";
import { fileURLToPath } from "node:url";
import {
  client,
  db,
  users,
  products,
  orders,
  sessions,
  inquiries,
  subscribers,
  favorites,
  nextId,
  transaction,
  publicFields,
  safeDatabaseError,
  type User,
  type OrderItem,
} from "./db.js";
import {
  checkoutInput,
  credentials,
  registration,
  productInput,
  email,
  totals,
  transitions,
  newPassword,
  registrationPhone,
} from "./validation.js";
import { consumePhoneCode, requestPhoneCode, PhoneVerificationError, type PhoneCode } from "./phone-verification.js";
const phoneCodes = db.collection<PhoneCode>("phone_verification_codes");
import { code as createVerificationCode, digest as digestVerificationCode, sendEmailCode } from "./verification.js";
const emailCodes = new Map<string, { hash: string; expires: number; sentAt: number }>();
const app = express();
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "img-src": ["'self'", "data:", "https:"],
        "style-src": [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
        ],
        "font-src": ["'self'", "https://fonts.gstatic.com"],
        "frame-ancestors": ["'none'"],
      },
    },
  }),
);
app.use(express.json({ limit: "12mb" }));
app.use(cookieParser());
const origins = new Set([
  process.env.FRONTEND_ORIGIN || "http://127.0.0.1:5173",
  ...(process.env.NODE_ENV === "production" ? [] : ["http://localhost:5173"]),
]);
app.use("/api", protectWrites(origins));
app.use(
  "/api",
  rateLimit({
    windowMs: 60000,
    // Browser suites share one IP and load many pages; retain real limits outside isolated tests.
    limit:
      process.env.NODE_ENV === "test" && db.databaseName.endsWith("_test")
        ? 1000
        : 180,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Quá nhiều yêu cầu. Vui lòng thử lại sau một phút." },
  }),
);
const authLimiter = rateLimit({
  windowMs: 15 * 60000,
  limit: 30,
  message: { error: "Vui lòng thử đăng nhập lại sau 15 phút." },
});
const accountLimiter = rateLimit({
  windowMs: 15 * 60000,
  limit: 10,
  skipSuccessfulRequests: true,
  keyGenerator: (req) =>
    "account:" +
    hash(
      typeof req.body?.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "invalid",
    ),
  message: {
    error: "Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút.",
  },
});
const messageLimiter = rateLimit({
  windowMs: 15 * 60000,
  limit: 10,
  message: { error: "Bạn đã gửi nhiều yêu cầu. Vui lòng thử lại sau 15 phút." },
});
const orderLimiter = rateLimit({
  windowMs: 15 * 60000,
  limit: 20,
  message: { error: "Vui lòng chờ trước khi tạo thêm đơn hoa." },
});
const passwordLimiter = rateLimit({
  windowMs: 15 * 60000,
  limit: 5,
  message: { error: "Vui lòng thử thay đổi bảo mật sau 15 phút." },
});
const dummyPasswordHash = bcrypt.hashSync(randomBytes(24).toString("hex"), 12);
type PublicUser = Pick<
  User,
  "id" | "name" | "email" | "role" | "phone" | "address" | "banned"
>;
declare global {
  namespace Express {
    interface Request {
      user?: PublicUser;
    }
  }
}
const hash = (token: string) =>
  createHash("sha256").update(token).digest("hex");
const publicUser = (user: User): PublicUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  banned: Boolean(user.banned),
  phone: user.phone || "",
  address: user.address || "",
});
app.use("/api", async (req, _res, next) => {
  try {
    if (typeof req.cookies.session === "string") {
      const record = await sessions.findOne({
        token_hash: hash(req.cookies.session),
        expires_at: { $gt: new Date() },
      });
      if (record) {
        const user = await users.findOne({ id: record.user_id });
        if (
          user && !user.banned &&
          (record.session_version || 0) === (user.session_version || 0)
        )
          req.user = publicUser(user);
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});
const required = (req: Request, res: Response, next: NextFunction) =>
  req.user ? next() : res.status(401).json({ error: "Vui lòng đăng nhập." });
const admin = (req: Request, res: Response, next: NextFunction) =>
  req.user?.role === "admin"
    ? next()
    : res.status(403).json({ error: "Bạn không có quyền quản trị." });
async function createSession(res: Response, user: User, previous?: unknown) {
  if (typeof previous === "string")
    await sessions.deleteOne({ token_hash: hash(previous) });
  const token = randomBytes(32).toString("hex");
  await sessions.insertOne({
    token_hash: hash(token),
    session_version: user.session_version || 0,
    user_id: user.id,
    expires_at: new Date(Date.now() + 604800000),
  });
  res.cookie("session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 604800000,
    path: "/",
  });
}
class Conflict extends Error {}
app.get("/api/health", async (_req, res) => {
  await db.command({ ping: 1 });
  res.json({ status: "ok", database: "mongodb" });
});
app.get("/api/products", async (_req, res) =>
  res.json(
    await products
      .find({ active: true }, publicFields)
      .sort({ id: 1 })
      .toArray(),
  ),
);
app.get("/api/products/:slug", async (req, res) => {
  const product = await products.findOne(
    { slug: String(req.params.slug), active: true },
    publicFields,
  );
  product
    ? res.json(product)
    : res.status(404).json({ error: "Không tìm thấy mẫu hoa." });
});
app.post("/api/auth/send-email-code", authLimiter, async (req, res) => {
  const address = email.parse(req.body?.email);
  const previous = emailCodes.get(address);
  if (previous && Date.now() - previous.sentAt < 60000) return res.status(429).json({ error: "Vui lòng chờ một phút trước khi gửi lại mã." });
  const value = createVerificationCode();
  await sendEmailCode(address, value);
  emailCodes.set(address, { hash: digestVerificationCode(value), expires: Date.now() + 600000, sentAt: Date.now() });
  res.json({ ok: true });
});
app.post("/api/auth/send-phone-code", authLimiter, async (req, res) => {
  const phone = registrationPhone.parse(req.body?.phone);
  await requestPhoneCode(phoneCodes, phone);
  res.json({ ok: true });
});
app.post("/api/auth/register", authLimiter, async (req, res) => {
  const input = registration.parse(req.body);
  if (await users.findOne({ email: input.email }))
    throw new Conflict("Email đã tồn tại.");
  await consumePhoneCode(phoneCodes, input.phone, input.phoneCode);
  const user: User = {
    id: await nextId("users"),
    name: input.name,
    email: input.email,
    phone: input.phone,
    password_hash: await bcrypt.hash(input.password, 12),
    role: "customer",
    created_at: new Date(),
  };
  await users.insertOne(user);
  await createSession(res, user, req.cookies.session);
  res.status(201).json(publicUser(user));
});
app.post("/api/auth/login", authLimiter, accountLimiter, async (req, res) => {
  const input = credentials.parse(req.body);
  const user = await users.findOne({ email: input.email });
  const matches = await bcrypt.compare(
    input.password,
    user?.password_hash || dummyPasswordHash,
  );
  if (!user || !matches)
    return res.status(401).json({ error: "Email hoặc mật khẩu chưa đúng." });
  if (user.banned)
    return res.status(403).json({ error: "Tài khoản đang bị khóa. Vui lòng liên hệ Nhà Hoa." });
  await createSession(res, user, req.cookies.session);
  res.json(publicUser(user));
});
app.get("/api/auth/me", (req, res) => res.json(req.user || null));
app.patch("/api/auth/profile", required, async (req, res) => {
  const input = z
    .object({
      name: registration.shape.name,
      phone: z.union([checkoutInput.shape.phone, z.literal("")]),
      address: z.union([checkoutInput.shape.address, z.literal("")]),
    })
    .strict()
    .parse(req.body);
  const user = await users.findOneAndUpdate(
    { id: req.user!.id },
    { $set: input },
    { returnDocument: "after" },
  );
  if (!user) return res.status(401).json({ error: "Vui lòng đăng nhập lại." });
  res.json(publicUser(user));
});
app.get("/api/orders/:id", required, async (req, res) => {
  const id = z
    .string()
    .regex(/^NH[a-f0-9]{10}$/i)
    .parse(req.params.id);
  const order = await orders.findOne(
    { id: id.toUpperCase(), user_id: req.user!.id },
    { projection: { _id: 0, user_id: 0 } },
  );
  if (!order)
    return res
      .status(404)
      .json({ error: "Không tìm thấy đơn hoa trong tài khoản của bạn." });
  res.json(order);
});
app.post("/api/auth/logout", async (req, res) => {
  if (typeof req.cookies.session === "string")
    await sessions.deleteOne({ token_hash: hash(req.cookies.session) });
  res.clearCookie("session", { path: "/" });
  res.json({ ok: true });
});
app.post(
  "/api/auth/logout-all",
  required,
  passwordLimiter,
  async (req, res) => {
    await transaction(async (session) => {
      await users.updateOne(
        { id: req.user!.id },
        { $inc: { session_version: 1 } },
        { session },
      );
      await sessions.deleteMany({ user_id: req.user!.id }, { session });
    });
    res.clearCookie("session", { path: "/" });
    res.json({ ok: true });
  },
);
app.post("/api/auth/password", required, passwordLimiter, async (req, res) => {
  const input = z
    .object({ currentPassword: credentials.shape.password, newPassword })
    .parse(req.body);
  const user = await users.findOne({ id: req.user!.id });
  if (
    !user ||
    !(await bcrypt.compare(input.currentPassword, user.password_hash))
  )
    return res.status(400).json({ error: "Mật khẩu hiện tại chưa đúng." });
  if (input.currentPassword === input.newPassword)
    return res
      .status(400)
      .json({ error: "Vui lòng chọn mật khẩu mới khác mật khẩu hiện tại." });
  const password_hash = await bcrypt.hash(input.newPassword, 12);
  await transaction(async (session) => {
    const result = await users.updateOne(
      { id: user.id, password_hash: user.password_hash },
      { $set: { password_hash }, $inc: { session_version: 1 } },
      { session },
    );
    if (!result.matchedCount)
      throw new Conflict("Mật khẩu vừa được thay đổi. Vui lòng đăng nhập lại.");
    await sessions.deleteMany({ user_id: user.id }, { session });
  });
  res.clearCookie("session", { path: "/" });
  res.json({ ok: true });
});
app.get("/api/favorites", required, async (req, res) =>
  res.json(
    (
      await favorites
        .find({ user_id: req.user!.id })
        .sort({ created_at: 1 })
        .toArray()
    ).map((f) => f.product_id),
  ),
);
app.put("/api/favorites/:id", required, async (req, res) => {
  const product_id = z.coerce.number().int().positive().parse(req.params.id);
  if (!(await products.findOne({ id: product_id, active: true })))
    return res.status(404).json({ error: "Không tìm thấy mẫu hoa." });
  await favorites.updateOne(
    { user_id: req.user!.id, product_id },
    {
      $setOnInsert: {
        user_id: req.user!.id,
        product_id,
        created_at: new Date(),
      },
    },
    { upsert: true },
  );
  res.json({ ok: true });
});
app.delete("/api/favorites/:id", required, async (req, res) => {
  const product_id = z.coerce.number().int().positive().parse(req.params.id);
  await favorites.deleteOne({ user_id: req.user!.id, product_id });
  res.json({ ok: true });
});
app.post("/api/orders", required, orderLimiter, async (req, res) => {
  const input = checkoutInput.parse(req.body);
  const result = await transaction(async (session) => {
    const items: OrderItem[] = [];
    for (const item of [...input.items].sort(
      (a, b) => a.product_id - b.product_id,
    )) {
      // Atomic condition plus transaction prevents overselling and partially saved orders.
      const product = await products.findOneAndUpdate(
        { id: item.product_id, active: true, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { session, returnDocument: "before" },
      );
      if (!product)
        throw new Conflict(
          "Mẫu hoa không còn đủ số lượng. Vui lòng cập nhật giỏ hàng.",
        );
      items.push({
        ...item,
        price: product.price,
        name: product.name,
        image: product.image,
      });
    }
    const id = "NH" + randomBytes(5).toString("hex").toUpperCase();
    const amount = totals(items);
    await orders.insertOne(
      {
        ...input,
        id,
        user_id: req.user!.id,
        items,
        ...amount,
        status: "pending",
        created_at: new Date(),
      },
      { session },
    );
    return { id, ...amount };
  });
  res.status(201).json(result);
});
app.get("/api/orders", required, async (req, res) =>
  res.json(
    await orders
      .find({ user_id: req.user!.id }, publicFields)
      .sort({ created_at: -1 })
      .toArray(),
  ),
);
app.post("/api/orders/track", required, authLimiter, async (req, res) => {
  const input = z
    .object({ id: z.string().regex(/^NH[A-F0-9]{10}$/), email })
    .parse(req.body);
  const order = await orders.findOne({
    ...input,
    ...(req.user!.role === "admin" ? {} : { user_id: req.user!.id }),
  });
  if (!order)
    return res
      .status(404)
      .json({ error: "Không tìm thấy đơn hàng khớp mã và email." });
  res.json({
    id: order.id,
    status: order.status,
    delivery_date: order.delivery_date,
    total: order.total,
    created_at: order.created_at,
    items: order.items.map(({ name, image, price, quantity }) => ({
      name,
      image,
      price,
      quantity,
    })),
  });
});
app.post("/api/contact", messageLimiter, async (req, res) => {
  const input = z
    .object({
      name: z.string().trim().min(2).max(100),
      email,
      message: z.string().trim().min(10).max(3000),
    })
    .parse(req.body);
  await inquiries.insertOne({
    ...input,
    id: await nextId("inquiries"),
    created_at: new Date(),
  });
  res.status(201).json({ ok: true });
});
app.post("/api/subscribe", messageLimiter, async (req, res) => {
  const input = z.object({ email }).parse(req.body);
  await subscribers.updateOne(
    input,
    { $setOnInsert: { ...input, created_at: new Date() } },
    { upsert: true },
  );
  res.json({ ok: true });
});
app.use("/api/admin", required, admin);
app.get("/api/admin/customers", async (_req, res) => {
  res.json(
    await users
      .find(
        {},
        {
          projection: {
            _id: 0,
            id: 1,
            name: 1,
            email: 1,
            phone: 1,
            address: 1,
            role: 1,
            banned: 1,
            created_at: 1,
          },
        },
      )
      .sort({ created_at: -1 })
      .toArray(),
  );
});
app.patch("/api/admin/customers/:id", async (req, res) => {
  const id = z.coerce.number().int().positive().parse(req.params.id);
  const input = z.object({
    banned: z.boolean().optional(),
    name: z.string().trim().min(2).max(120).optional(),
    email: z.string().trim().email().max(160).optional(),
    phone: z.string().trim().max(30).optional(),
    address: z.string().trim().max(240).optional(),
  }).strict().refine((value) => Object.keys(value).length > 0).parse(req.body);
  const target = await users.findOne({ id });
  if (!target) return res.status(404).json({ error: "Kh\u00f4ng t\u00ecm th\u1ea5y ng\u01b0\u1eddi d\u00f9ng." });
  if (target.role === "admin" && input.banned !== undefined) return res.status(403).json({ error: "Kh\u00f4ng th\u1ec3 kh\u00f3a t\u00e0i kho\u1ea3n qu\u1ea3n tr\u1ecb vi\u00ean." });
  if (input.email && input.email !== target.email && await users.findOne({ email: input.email })) return res.status(409).json({ error: "Email ?\u00e3 ???c s? d?ng." });
  const { banned, ...profile } = input;
  const update: Record<string, unknown> = { ...profile };
  if (banned !== undefined) update.banned = banned;
  await users.updateOne({ id }, { $set: update, ...(banned ? { $inc: { session_version: 1 } } : {}) });
  if (banned) await sessions.deleteMany({ user_id: id });
  res.json({ ok: true, ...input });
});
app.get("/api/admin/subscribers", async (_req, res) => {
  res.json(
    await subscribers.find({}, publicFields).sort({ created_at: -1 }).toArray(),
  );
});
app.delete("/api/admin/subscribers", async (req, res) => {
  const input = z.object({ email }).strict().parse(req.body);
  await subscribers.deleteOne({ email: input.email });
  res.json({ ok: true });
});
app.patch("/api/admin/inventory/:id", async (req, res) => {
  const id = z.coerce.number().int().positive().parse(req.params.id);
  const { delta } = z
    .object({
      delta: z
        .number()
        .int()
        .min(-10000)
        .max(10000)
        .refine((value) => value !== 0),
    })
    .strict()
    .parse(req.body);
  const result = await products.findOneAndUpdate(
    {
      id,
      stock: {
        $gte: Math.max(0, -delta),
        $lte: Math.min(10000, 10000 - delta),
      },
    },
    { $inc: { stock: delta } },
    { returnDocument: "after", projection: { _id: 0 } },
  );
  if (!result)
    return res
      .status(409)
      .json({
        error:
          "Không thể điều chỉnh tồn kho. Hãy tải lại và kiểm tra số lượng (0–10.000).",
      });
  res.json(result);
});
app.patch("/api/admin/inquiries/:id", async (req, res) => {
  const id = z.coerce.number().int().positive().parse(req.params.id);
  const { resolved } = z
    .object({ resolved: z.boolean() })
    .strict()
    .parse(req.body);
  const result = await inquiries.updateOne({ id }, { $set: { resolved } });
  if (!result.matchedCount)
    return res.status(404).json({ error: "Không tìm thấy lời nhắn." });
  res.json({ ok: true });
});
app.get("/api/admin/products", async (_req, res) =>
  res.json(await products.find({}, publicFields).sort({ id: -1 }).toArray()),
);
app.post("/api/admin/products", async (req, res) => {
  const input = productInput.parse(req.body);
  const id = await nextId("products");
  await products.insertOne({ ...input, id, created_at: new Date() });
  res.status(201).json({ id });
});
app.put("/api/admin/products/:id", async (req, res) => {
  const input = productInput.parse(req.body);
  const id = z.coerce.number().int().positive().parse(req.params.id);
  const result = await products.updateOne({ id }, { $set: input });
  if (!result.matchedCount)
    return res.status(404).json({ error: "Không tìm thấy sản phẩm." });
  res.json({ ok: true });
});
app.delete("/api/admin/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "ID không hợp lệ" });
  const result = await products.deleteOne({ id });
  if (!result.deletedCount) return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
  res.json({ ok: true });
});
app.get("/api/admin/orders", async (_req, res) =>
  res.json(
    await orders.find({}, publicFields).sort({ created_at: -1 }).toArray(),
  ),
);
app.delete("/api/admin/orders/:id", async (req, res) => {
  const id = String(req.params.id);
  const result = await orders.deleteOne({ id });
  if (!result.deletedCount) return res.status(404).json({ error: "Kh?ng t?m th?y ??n h?ng." });
  res.json({ ok: true });
});
app.get("/api/admin/inquiries", async (_req, res) =>
  res.json(
    await inquiries.find({}, publicFields).sort({ created_at: -1 }).toArray(),
  ),
);
app.patch("/api/admin/orders/:id", async (req, res) => {
  const { status } = z
    .object({
      status: z.enum([
        "confirmed",
        "preparing",
        "shipping",
        "delivered",
        "cancelled",
      ]),
    })
    .parse(req.body);
  await transaction(async (session) => {
    const order = await orders.findOne(
      { id: String(req.params.id) },
      { session },
    );
    if (!order || !transitions[order.status]?.includes(status))
      throw new Conflict("Không thể chuyển trạng thái này.");
    await orders.updateOne(
      { id: order.id, status: order.status },
      { $set: { status } },
      { session },
    );
    if (status === "cancelled")
      for (const item of [...order.items].sort(
        (a, b) => a.product_id - b.product_id,
      ))
        await products.updateOne(
          { id: item.product_id },
          { $inc: { stock: item.quantity } },
          { session },
        );
  });
  res.json({ ok: true });
});
app.use("/api", (_req, res) =>
  res.status(404).json({ error: "API không tồn tại." }),
);
app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof PhoneVerificationError)
    return res.status(error.status).json({ error: error.message });
  if (error instanceof ZodError)
    return res.status(400).json({
      error: "Vui lòng kiểm tra thông tin đã nhập.",
      fields: error.flatten().fieldErrors,
    });
  if (error instanceof Conflict)
    return res.status(409).json({ error: error.message });
  if ((error as { code?: number }).code === 11000)
    return res
      .status(409)
      .json({ error: "Email hoặc mã sản phẩm đã tồn tại." });
  if ((error as { status?: number }).status === 400)
    return res.status(400).json({ error: "Dữ liệu yêu cầu không hợp lệ." });
  console.error("MongoDB request failed", safeDatabaseError(error));
  if ((error as { status?: number }).status === 413)
    return res.status(413).json({ error: "Dữ liệu gửi lên quá lớn." });
  res
    .status(503)
    .json({ error: "Dịch vụ tạm thời chưa sẵn sàng. Vui lòng thử lại sau." });
});
if (process.env.NODE_ENV === "production") {
  const frontendDir = fileURLToPath(
    new URL("../../frontend/dist/", import.meta.url),
  );
  app.use(express.static(frontendDir));
  app.get("/{*path}", (_req, res) => res.sendFile(frontendDir + "index.html"));
}
try {
  await client.connect();
  await phoneCodes.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await db.command({ ping: 1 });
  const server = app.listen(Number(process.env.PORT || 4000), "127.0.0.1", () =>
    console.log(
      "Nhà Hoa API (MongoDB): http://127.0.0.1:" + (process.env.PORT || 4000),
    ),
  );
  for (const signal of ["SIGINT", "SIGTERM"] as const)
    process.once(signal, () => {
      server.close(() => {
        void client.close().then(() => process.exit(0));
      });
    });
} catch (error) {
  console.error(
    "Không kết nối được MongoDB. Kiểm tra URI và Atlas Network Access.",
    safeDatabaseError(error),
  );
  await client.close();
  process.exitCode = 1;
}
