import { test, expect, type APIRequestContext } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { today } from "../frontend/src/types";

async function member(request: APIRequestContext) {
  const email = `test-member-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
  expect(
    (
      await request.post("/api/auth/register", {
        data: {
          name: "Khách kiểm thử API",
          email,
          password: "A flower account password!",
        },
      })
    ).status(),
  ).toBe(201);
  return email;
}

test("profile requires membership, persists and prefills checkout without allowing role changes", async ({
  page,
}) => {
  expect(
    (await page.request.patch("/api/auth/profile", { data: {} })).status(),
  ).toBe(401);
  await page.goto("/tai-khoan/thong-tin");
  await expect(page).toHaveURL(/dang-nhap\?next=/);
  const email = await member(page.request);
  const profile = {
    name: "Khách kiểm thử API",
    phone: "0901234567",
    address: "123 Nguyễn Huệ, TP. Hồ Chí Minh",
  };
  for (const extra of [
    { role: "admin" },
    { email: "another@example.com" },
    { id: 1 },
    { phone: "invalid" },
  ]) {
    expect(
      (
        await page.request.patch("/api/auth/profile", {
          data: { ...profile, ...extra },
        })
      ).status(),
    ).toBe(400);
  }
  await page.goto("/tai-khoan/thong-tin");
  await page
    .getByLabel("Số điện thoại (không bắt buộc)", { exact: true })
    .fill(profile.phone);
  await page
    .getByLabel("Địa chỉ thường dùng (không bắt buộc)", { exact: true })
    .fill(profile.address);
  await page.getByRole("button", { name: "Lưu thông tin" }).click();
  await expect(page.locator("main").getByRole("status")).toContainText("Đã lưu thông tin");
  await page.reload();
  await expect(
    page.getByLabel("Số điện thoại (không bắt buộc)", { exact: true }),
  ).toHaveValue(profile.phone);
  await expect(page.getByLabel("Email đăng nhập", { exact: true })).toHaveValue(
    email,
  );
  const me = await (await page.request.get("/api/auth/me")).json();
  expect(me).toMatchObject({ ...profile, email, role: "customer" });
  expect(me.password_hash).toBeUndefined();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(
    audit.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact || ""),
    ),
  ).toEqual([]);
  await page.screenshot({ path: ".local/profile-mobile.png", fullPage: true });
  await page.goto("/hoa");
  await page.locator(".quick-add").first().click();
  await page.goto("/thanh-toan");
  await expect(page.locator('input[autocomplete="tel"]')).toHaveValue(
    profile.phone,
  );
  await expect(
    page.locator(
      'input[autocomplete="street-address"],textarea[autocomplete="street-address"]',
    ),
  ).toHaveValue(profile.address);
});

test("order detail is private, shows snapshots and carries its code to support", async ({
  page,
  playwright,
}) => {
  const email = await member(page.request);
  const other = await playwright.request.newContext({
    baseURL: process.env.E2E_BASE_URL,
    extraHTTPHeaders: { "X-NhaHoa-Request": "web" },
  });
  try {
    const product = (
      await (await page.request.get("/api/products")).json()
    ).find((p: { stock: number }) => p.stock > 0);
    const response = await page.request.post("/api/orders", {
      data: {
        recipient: "Khách kiểm thử API",
        phone: "0901234567",
        email,
        address: "123 Nguyễn Huệ, TP. Hồ Chí Minh",
        delivery_date: today(),
        message: "Một lời chúc\nMột ngày thật đẹp",
        payment_method: "cod",
        items: [{ product_id: product.id, quantity: 1 }],
      },
    });
    expect(response.status()).toBe(201);
    const { id } = await response.json();
    expect((await other.get("/api/orders/" + id)).status()).toBe(401);
    await member(other);
    expect((await other.get("/api/orders/" + id)).status()).toBe(404);
    const own = await (await page.request.get("/api/orders/" + id)).json();
    expect(own.items[0].name).toBe(product.name);
    expect(own.address).toBe("123 Nguyễn Huệ, TP. Hồ Chí Minh");
    expect(own.user_id).toBeUndefined();
    expect(own._id).toBeUndefined();
    await page.request.patch("/api/auth/profile", {
      data: {
        name: "Khách kiểm thử API",
        phone: "0902222222",
        address: "456 Lê Lợi, TP. Hồ Chí Minh",
      },
    });
    await page.goto("/tai-khoan");
    await page.getByRole("link", { name: "Chi tiết", exact: true }).click();
    await expect(page).toHaveURL(new RegExp("/tai-khoan/don-hang/" + id));
    await expect(page.locator("main h1")).toContainText(id);
    await expect(page.locator(".recipient-details")).toContainText(
      "123 Nguyễn Huệ",
    );
    await expect(page.locator(".order-message")).toContainText(
      "Một ngày thật đẹp",
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 390, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    const audit = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(
      audit.violations.filter((v) =>
        ["serious", "critical"].includes(v.impact || ""),
      ),
    ).toEqual([]);
    await page.screenshot({
      path: ".local/order-detail-mobile.png",
      fullPage: true,
    });
    await page.getByRole("link", { name: "Liên hệ về đơn này" }).click();
    await expect(page.getByLabel("Điều bạn muốn nhắn gửi")).toHaveValue(
      new RegExp(id),
    );
    await page.goto("/tai-khoan/don-hang/NH0000000000");
    await expect(page.getByRole("alert")).toContainText(
      "Không tìm thấy đơn hoa",
    );
  } finally {
    await other.dispose();
  }
});
