import { test, expect } from "@playwright/test";
import { registrationCode } from "./registration";

test("login accepts email and both Vietnamese phone formats and rejects wrong passwords", async ({ page }) => {
  const verification = await registrationCode();
  const email = `test-login-${Date.now()}@example.com`;
  const password = "A memorable garden password!";
  const response = await page.request.post("/api/auth/register", {
    data: { name: "Khách kiểm thử API", email, password, ...verification },
  });
  expect(response.status()).toBe(201);
  const owner = (await response.json()).id;
  await page.request.post("/api/auth/logout", { data: {} });
  for (const identifier of [email.toUpperCase(), verification.phone, "0" + verification.phone.slice(3)]) {
    await page.goto("/dang-nhap?next=/gio-hang");
    await page.getByLabel("Email hoặc số điện thoại", { exact: true }).fill(identifier);
    await page.getByLabel("Mật khẩu", { exact: true }).fill(password);
    const loginResponse = page.waitForResponse((response) => response.url().endsWith("/api/auth/login"));
    await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
    expect((await loginResponse).status()).toBe(200);
    await expect(page).toHaveURL(/\/gio-hang$/);
    expect((await (await page.request.get("/api/auth/me")).json()).id).toBe(owner);
    await page.request.post("/api/auth/logout", { data: {} });
  }
  expect((await page.request.post("/api/auth/login", { data: { identifier: verification.phone, password: "wrong-password" } })).status()).toBe(401);
  expect((await page.request.post("/api/auth/login", { data: { email, password } })).status()).toBe(200);
});

test("registration requires a matching one-time SMS code", async ({ request }) => {
  const verification = await registrationCode();
  const data = { name: "Khách kiểm thử API", email: `test-otp-${Date.now()}@example.com`, password: "A memorable garden password!", ...verification };
  expect((await request.post("/api/auth/register", { data: { ...data, phoneCode: undefined } })).status()).toBe(400);
  expect((await request.post("/api/auth/register", { data: { ...data, phoneCode: "000000" } })).status()).toBe(400);
  expect((await request.post("/api/auth/register", { data })).status()).toBe(201);
  expect((await request.post("/api/auth/register", { data: { ...data, email: `test-replay-${Date.now()}@example.com` } })).status()).toBe(400);
});

