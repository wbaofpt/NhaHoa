import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { parse } from "dotenv";
const env = parse(readFileSync("backend/.env"));
test("authentication, access control, server pricing, stock and cancellation", async ({
  request,
  playwright,
}) => {
  expect(await (await request.get("/api/health")).json()).toEqual({
    status: "ok",
    database: "mongodb",
  });
  expect((await request.get("/api/admin/products")).status()).toBe(401);
  const email = `test-${Date.now()}@example.com`;
  const register = await request.post("/api/auth/register", {
    data: { name: "Khách kiểm thử API", email, password: "TestPassword123!" },
  });
  expect(register.status()).toBe(201);
  const me = await (await request.get("/api/auth/me")).json();
  expect(me.role).toBe("customer");
  expect(me.password_hash).toBeUndefined();
  expect((await request.get("/api/admin/orders")).status()).toBe(403);
  const admin = await playwright.request.newContext({
    extraHTTPHeaders: { "X-NhaHoa-Request": "web" },
    baseURL: process.env.E2E_BASE_URL || "http://127.0.0.1:5174",
  });
  expect(
    (
      await admin.post("/api/auth/login", {
        data: { email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD },
      })
    ).ok(),
  ).toBeTruthy();
  const product = (await (await request.get("/api/products")).json())[0];
  const delivery_date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const payload = {
    recipient: "Khách kiểm thử API",
    phone: "0901234567",
    email,
    address: "123 Nguyễn Huệ, TP. Hồ Chí Minh",
    delivery_date,
    message: "Đơn kiểm thử tự động",
    payment_method: "cod",
    total: 1,
    items: [{ product_id: product.id, quantity: 1, price: 1 }],
  };
  expect(
    (
      await request.post("/api/orders", {
        data: { ...payload, items: [{ product_id: product.id, quantity: 0 }] },
      })
    ).status(),
  ).toBe(400);
  const created = await request.post("/api/orders", { data: payload });
  expect(created.status()).toBe(201);
  const order = await created.json();
  expect(order.total).toBe(
    product.price + (product.price >= 800000 ? 0 : 35000),
  );
  const after = (await (await request.get("/api/products")).json()).find(
    (p: { id: number }) => p.id === product.id,
  );
  expect(after.stock).toBe(product.stock - 1);
  expect(
    (
      await request.post("/api/orders/track", {
        data: { id: order.id, email: "wrong@example.com" },
      })
    ).status(),
  ).toBe(404);
  expect(
    (
      await admin.patch("/api/admin/orders/" + order.id, {
        data: { status: "delivered" },
      })
    ).status(),
  ).toBe(409);
  expect(
    (
      await admin.patch("/api/admin/orders/" + order.id, {
        data: { status: "cancelled" },
      })
    ).ok(),
  ).toBeTruthy();
  expect(
    (
      await admin.patch("/api/admin/orders/" + order.id, {
        data: { status: "cancelled" },
      })
    ).status(),
  ).toBe(409);
  const restored = (await (await request.get("/api/products")).json()).find(
    (p: { id: number }) => p.id === product.id,
  );
  expect(restored.stock).toBe(product.stock);
  const temporary = {
    slug: "e2e-stock-" + Date.now(),
    name: "Hoa kiểm thử tồn kho",
    category: "Bó hoa",
    occasion: "Sinh nhật",
    price: 100000,
    image: "/images/rose.jpg",
    description: "Sản phẩm chỉ dành cho kiểm thử tự động.",
    flowers: "Hoa kiểm thử",
    stock: 1,
    active: true,
  };
  const newProduct = await admin.post("/api/admin/products", {
    data: temporary,
  });
  expect(newProduct.status()).toBe(201);
  const { id: temporaryId } = await newProduct.json();
  const results = await Promise.all([
    request.post("/api/orders", {
      data: { ...payload, items: [{ product_id: temporaryId, quantity: 1 }] },
    }),
    request.post("/api/orders", {
      data: { ...payload, items: [{ product_id: temporaryId, quantity: 1 }] },
    }),
  ]);
  expect(results.map((r) => r.status()).sort()).toEqual([201, 409]);
  for (const result of results) {
    if (result.status() === 201) {
      const { id } = await result.json();
      expect(
        (
          await admin.patch("/api/admin/orders/" + id, {
            data: { status: "cancelled" },
          })
        ).ok(),
      ).toBeTruthy();
    }
  }
  expect(
    (
      await admin.put("/api/admin/products/" + temporaryId, {
        data: { ...temporary, active: false },
      })
    ).ok(),
  ).toBeTruthy();
  expect((await request.get("/api/products/" + temporary.slug)).status()).toBe(
    404,
  );
  expect(
    (
      await request.post("/api/contact", {
        data: {
          name: "Khách kiểm thử API",
          email,
          message: "Lời nhắn kiểm thử tự động",
        },
      })
    ).status(),
  ).toBe(201);
  expect(
    (await request.post("/api/auth/logout", { data: {} })).ok(),
  ).toBeTruthy();
  expect(await (await request.get("/api/auth/me")).json()).toBeNull();
  await admin.dispose();
});
