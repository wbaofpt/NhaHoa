import { registrationCode } from "./registration";
import { test, expect, type APIRequestContext } from "@playwright/test";
const headers = { "X-NhaHoa-Request": "web" };
const baseURL = process.env.E2E_BASE_URL;
async function register(context: APIRequestContext) {
  const email = `test-security-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
  const password = "A memorable garden password!";
  expect(
    (
      await context.post("/api/auth/register", {
        data: { ...(await registrationCode()), name: "Khách kiểm thử API", email, password },
      })
    ).status(),
  ).toBe(201);
  return { email, password };
}
test("writes reject CSRF, anonymous access and invalid passwords", async ({
  request,
}) => {
  expect(
    (
      await request.post("/api/contact", {
        headers: { "X-NhaHoa-Request": "" },
        data: {},
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await request.post("/api/contact", {
        headers: { Origin: "https://untrusted.example" },
        data: {},
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await request.post("/api/contact", {
        headers: { "Sec-Fetch-Site": "cross-site" },
        data: {},
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await request.post("/api/contact", {
        headers: { "Content-Type": "text/plain" },
        data: "hello",
      })
    ).status(),
  ).toBe(415);
  expect((await request.post("/api/orders", { data: {} })).status()).toBe(401);
  expect((await request.get("/api/favorites")).status()).toBe(401);
  expect((await request.post("/api/orders/track", { data: {} })).status()).toBe(
    401,
  );
  for (const password of ["shortpass", "é".repeat(40)])
    expect(
      (
        await request.post("/api/auth/register", {
          data: {
            name: "Khách kiểm thử API",
            email: "test-invalid@example.com",
            password,
          },
        })
      ).status(),
    ).toBe(400);
  expect((await request.get("/api/auth/me")).headers()["cache-control"]).toBe(
    "no-store",
  );
});
test("favorites and orders are isolated, password change revokes other sessions", async ({
  playwright,
}) => {
  const a = await playwright.request.newContext({
    baseURL,
    extraHTTPHeaders: headers,
  });
  const b = await playwright.request.newContext({
    baseURL,
    extraHTTPHeaders: headers,
  });
  const otherSession = await playwright.request.newContext({
    baseURL,
    extraHTTPHeaders: headers,
  });
  try {
    const userA = await register(a);
    await register(b);
    expect(
      (await otherSession.post("/api/auth/login", { data: userA })).status(),
    ).toBe(200);
    expect((await a.put("/api/favorites/1", { data: {} })).status()).toBe(200);
    expect(await (await a.get("/api/favorites")).json()).toEqual([1]);
    expect(await (await b.get("/api/favorites")).json()).toEqual([]);
    const date = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    const created = await a.post("/api/orders", {
      data: {
        recipient: "Khách kiểm thử API",
        phone: "0901234567",
        email: userA.email,
        address: "123 Nguyễn Huệ, TP. Hồ Chí Minh",
        delivery_date: date,
        message: "Đơn kiểm thử",
        payment_method: "cod",
        items: [{ product_id: 1, quantity: 1 }],
      },
    });
    expect(created.status()).toBe(201);
    const order = await created.json();
    expect(
      (
        await b.post("/api/orders/track", {
          data: { id: order.id, email: userA.email },
        })
      ).status(),
    ).toBe(404);
    expect(await (await b.get("/api/orders")).json()).toEqual([]);
    expect(
      (
        await a.post("/api/auth/password", {
          data: {
            currentPassword: "Not the real password",
            newPassword: "Another garden password!",
          },
        })
      ).status(),
    ).toBe(400);
    expect(
      (
        await a.post("/api/auth/password", {
          data: {
            currentPassword: userA.password,
            newPassword: "Another garden password!",
          },
        })
      ).status(),
    ).toBe(200);
    expect(await (await a.get("/api/auth/me")).json()).toBeNull();
    expect(await (await otherSession.get("/api/auth/me")).json()).toBeNull();
    expect((await a.post("/api/auth/login", { data: userA })).status()).toBe(
      401,
    );
    expect(
      (
        await a.post("/api/auth/login", {
          data: { email: userA.email, password: "Another garden password!" },
        })
      ).status(),
    ).toBe(200);
    expect(
      (
        await otherSession.post("/api/auth/login", {
          data: { email: userA.email, password: "Another garden password!" },
        })
      ).status(),
    ).toBe(200);
    expect((await a.post("/api/auth/logout-all", { data: {} })).status()).toBe(
      200,
    );
    expect(await (await otherSession.get("/api/auth/me")).json()).toBeNull();
  } finally {
    await a.dispose();
    await b.dispose();
    await otherSession.dispose();
  }
});
test("protected pages return to sign-in and reduced motion reveals content", async ({
  page,
}) => {
  for (const path of [
    "/thanh-toan",
    "/yeu-thich",
    "/tai-khoan",
    "/tra-cuu",
    "/tai-khoan/bao-mat",
  ]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/dang-nhap\?next=/);
    await expect(page.locator("h1")).toContainText("Thật vui");
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".product-card")).toHaveCount(4);
  expect(
    await page
      .locator(".petal-scene")
      .evaluate((e) => getComputedStyle(e).display),
  ).toBe("none");
  expect(
    await page
      .locator(".product-card")
      .first()
      .evaluate((e) => getComputedStyle(e).opacity),
  ).toBe("1");
});
test('account security form changes password and signs out',async({page})=>{
 const account=await register(page.request);
 await page.goto('/tai-khoan/bao-mat');
 await expect(page.getByRole('heading',{name:'Đổi mật khẩu',exact:true})).toBeVisible();
 await page.screenshot({path:'.local/account-security.png',fullPage:true});
 await page.getByLabel('Mật khẩu hiện tại',{exact:true}).fill(account.password);
 await page.getByLabel('Mật khẩu mới',{exact:true}).fill('My new garden password!');
 await page.getByLabel('Nhập lại mật khẩu mới',{exact:true}).fill('My new garden password!');
 await page.getByRole('button',{name:'Cập nhật mật khẩu'}).click();
 await expect(page).toHaveURL(/\/dang-nhap/);
 expect(await (await page.request.get('/api/auth/me')).json()).toBeNull();
});
test('scroll reveals content and decorative motion finishes',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('/');
 const story=page.locator('.story-copy');await expect(story).toHaveClass(/reveal-ready/);await story.scrollIntoViewIfNeeded();await expect(story).toHaveCSS('opacity','1');
 await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:'.local/home-enhanced.png',fullPage:true});
});
