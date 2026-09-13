import { registrationCode } from "./registration";
import { test, expect } from "@playwright/test";
async function registerMember(page: import("@playwright/test").Page) {
  const email = `test-ui-${Date.now()}@example.com`;
  const response = await page.request.post("/api/auth/register", {
    data: { ...(await registrationCode()), name: "Khách kiểm thử API", email, password: "TestPassword123!" },
  });
  expect(response.status()).toBe(201);
  return email;
}
test("home, product search, favorites and cart persist", async ({ page }) => {
  await registerMember(page);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Gửi hoa",
  );
  await expect(page.locator(".product-card")).toHaveCount(4);
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.allSettled(document.getAnimations().map((a) => a.finished));
  });
  await page.screenshot({ path: ".local/home-desktop.png", fullPage: true });
  await page.goto("/hoa");
  await expect(page.locator(".product-card")).toHaveCount(12);
  await page
    .getByRole("textbox", { name: "Tìm hoa", exact: true })
    .fill("nang tho");
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Yêu thích Nàng thơ" }).click();
  await expect(
    page.getByRole("button", { name: "Yêu thích Nàng thơ" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.goto("/yeu-thich");
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page.getByRole("heading", { name: "Nàng thơ" }).click();
  await page
    .locator(".detail-actions")
    .getByRole("button", { name: "Thêm vào giỏ hoa", exact: true })
    .click();
  await page.goto("/gio-hang");
  await expect(page.locator(".cart-item")).toHaveCount(1);
  await page.reload();
  await expect(page.locator(".cart-item")).toHaveCount(1);
  await page.getByRole("button", { name: "Tăng số lượng" }).click();
  await expect(page.getByLabel("Số lượng", { exact: true })).toHaveText("2");
  await expect(
    page.getByText("Giỏ hoa của bạn đã được miễn phí giao hàng."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Xóa Nàng thơ" }).click();
  await expect(
    page.getByRole("heading", { name: "Giỏ hoa đang chờ bạn" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("mobile menu and public pages have no horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Mở menu" }).click();
  await page
    .getByRole("navigation", { name: "Điều hướng chính" })
    .getByRole("link", { name: "Cửa hàng hoa" })
    .click();
  await expect(page).toHaveURL(/\/hoa$/);
  for (const path of [
    "/",
    "/hoa",
    "/hoa/nang-tho",
    "/bo-suu-tap",
    "/ve-nha-hoa",
    "/chuyen-nha-hoa",
    "/chuyen-nha-hoa/giu-hoa-tuoi-lau",
    "/lien-he",
    "/cau-hoi",
    "/chinh-sach/bao-mat",
    "/dang-nhap",
    "/dang-ky",
    "/tra-cuu",
  ]) {
    await page.goto(path);
    await expect(page.locator("h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      path,
    ).toBeTruthy();
  }
  await page.goto("/");
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.allSettled(document.getAnimations().map((a) => a.finished));
  });
  await page.screenshot({ path: ".local/home-mobile.png", fullPage: true });
});
test("checkout requires login, preserves cart and tracks a member order", async ({
  page,
}) => {
  await page.goto("/hoa/som-mai");
  await page
    .locator(".detail-actions")
    .getByRole("button", { name: "Thêm vào giỏ hoa", exact: true })
    .click();
  await expect(page).toHaveURL(/dang-nhap\?next=/);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("nh-cart") || "[]"))).toEqual([]);
  await page.getByRole("link", { name: "Đăng ký ngay", exact: true }).click();
  await page.getByLabel("Tên của bạn").fill("Khách kiểm thử API");
  await page
    .getByLabel("Email", { exact: true })
    .fill(`test-ui-${Date.now()}@example.com`);
  await page.getByLabel("Mật khẩu", { exact: true }).fill("TestPassword123!");
  const verification = await registrationCode();
  await page.route("**/api/auth/send-phone-code", (route) => route.fulfill({ json: { ok: true } }));
  await page.getByLabel("Số điện thoại", { exact: true }).fill(verification.phone);
  await page.getByRole("button", { name: "Gửi mã xác minh SMS" }).click();
  await page.getByLabel("Mã xác minh SMS", { exact: true }).fill(verification.phoneCode);
  await page
    .getByRole("button", { name: "Tạo tài khoản", exact: true })
    .click();
  await expect(page).toHaveURL(/\/hoa\/som-mai$/);
  await page.locator(".detail-actions").getByRole("button", { name: "Thêm vào giỏ hoa", exact: true }).click();
  await page.goto("/gio-hang");
  await expect(page.locator(".cart-item")).toHaveCount(1);
  await page.reload();
  await expect(page.locator(".cart-item")).toHaveCount(1);
  await page.goto("/thanh-toan");
  await page.getByLabel("Tên người nhận").fill("Khách kiểm thử tự động");
  await page.getByLabel("Số điện thoại").fill("0901234567");
  await page.getByLabel("Email nhận thông tin đơn").fill("e2e@example.com");
  await page
    .getByLabel("Địa chỉ giao hoa")
    .fill("123 Nguyễn Huệ, Bến Nghé, TP. Hồ Chí Minh");
  await page
    .getByLabel("Nội dung thiệp")
    .fill("Đơn kiểm thử — vui lòng không thực hiện.");
  await page.getByRole("button", { name: "Đặt hoa & gửi yêu thương" }).click();
  await expect(page).toHaveURL(/dat-hang-thanh-cong\?ma=NH/);
  const id = await page.locator(".order-code strong").innerText();
  await page
    .getByRole("link", { name: "Theo dõi đơn hoa", exact: true })
    .click();
  await page.getByLabel("Email đặt hàng").fill("e2e@example.com");
  await page
    .getByRole("button", { name: "Tra cứu đơn hoa", exact: true })
    .click();
  await expect(page.locator(".tracking-result")).toContainText(id);
  await expect(page.locator(".tracking-result")).toContainText("455.000");
});
