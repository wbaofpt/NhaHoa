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
import {
  client,
  db,
  users,
  products,
  orders,
  sessions,
  inquiries,
  subscribers,
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
} from "./validation.js";
const app = express();
app.use(helmet());
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());
const origins = new Set([
  process.env.FRONTEND_ORIGIN || "http://127.0.0.1:5173",
  ...(process.env.NODE_ENV === "production" ? [] : ["http://localhost:5173"]),
]);
app.use("/api", (req, res, next) => {
  if (
    !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
    req.headers.origin &&
    !origins.has(req.headers.origin)
  )
    return res.status(403).json({ error: "Nguồn yêu cầu không được phép." });
  next();
});
app.use(
  "/api",
  rateLimit({
    windowMs: 60000,
    limit: 180,
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
type PublicUser = Pick<User, "id" | "name" | "email" | "role">;
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
        if (user) req.user = publicUser(user);
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
async function createSession(res: Response, user: PublicUser) {
  const token = randomBytes(32).toString("hex");
  await sessions.insertOne({
    token_hash: hash(token),
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
app.post("/api/auth/register", authLimiter, async (req, res) => {
  const input = registration.parse(req.body);
  const user: User = {
    id: await nextId("users"),
    name: input.name,
    email: input.email,
    password_hash: await bcrypt.hash(input.password, 12),
    role: "customer",
    created_at: new Date(),
  };
  await users.insertOne(user);
  await createSession(res, user);
  res.status(201).json(publicUser(user));
});
app.post("/api/auth/login", authLimiter, async (req, res) => {
  const input = credentials.parse(req.body);
  const user = await users.findOne({ email: input.email });
  if (!user || !(await bcrypt.compare(input.password, user.password_hash)))
    return res.status(401).json({ error: "Email hoặc mật khẩu chưa đúng." });
  await createSession(res, user);
  res.json(publicUser(user));
});
app.get("/api/auth/me", (req, res) => res.json(req.user || null));
app.post("/api/auth/logout", async (req, res) => {
  if (typeof req.cookies.session === "string")
    await sessions.deleteOne({ token_hash: hash(req.cookies.session) });
  res.clearCookie("session", { path: "/" });
  res.json({ ok: true });
});
app.post("/api/orders", async (req, res) => {
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
        user_id: req.user?.id || null,
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
app.post("/api/orders/track", authLimiter, async (req, res) => {
  const input = z
    .object({ id: z.string().regex(/^NH[A-F0-9]{10}$/), email })
    .parse(req.body);
  const order = await orders.findOne(input);
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
app.post("/api/contact", async (req, res) => {
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
app.post("/api/subscribe", async (req, res) => {
  const input = z.object({ email }).parse(req.body);
  await subscribers.updateOne(
    input,
    { $setOnInsert: { ...input, created_at: new Date() } },
    { upsert: true },
  );
  res.json({ ok: true });
});
app.use("/api/admin", required, admin);
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
app.get("/api/admin/orders", async (_req, res) =>
  res.json(
    await orders.find({}, publicFields).sort({ created_at: -1 }).toArray(),
  ),
);
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
  if (error instanceof ZodError)
    return res
      .status(400)
      .json({
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
  res
    .status(503)
    .json({ error: "Dịch vụ tạm thời chưa sẵn sàng. Vui lòng thử lại sau." });
});
try {
  await client.connect();
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
