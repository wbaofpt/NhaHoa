import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  collections,
  services,
  extraArticles,
} from "../frontend/src/editorial";

test("editorial routes have content, working images and mobile layouts", async ({
  page,
}) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  const paths = [
    "/dich-vu",
    "/huong-dan-dat-hang",
    "/cham-soc-hoa",
    "/so-do-trang",
    ...collections.map((c) => "/bo-suu-tap/" + c.slug),
    ...services.map((s) => "/dich-vu/" + s.slug),
    ...extraArticles.map((a) => "/chuyen-nha-hoa/" + a.slug),
  ];
  for (const path of paths) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(path);
    await expect(page.locator("main h1")).toHaveCount(1);
    await expect(page).not.toHaveTitle(/Trang không tồn tại/);
    await expect(page.locator("main")).not.toContainText(
      "Con đường này chưa có hoa",
    );
    await page.locator("footer").scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        page
          .locator("main img")
          .evaluateAll((images) =>
            images.every(
              (image) =>
                (image as HTMLImageElement).complete &&
                (image as HTMLImageElement).naturalWidth > 0,
            ),
          ),
      )
      .toBe(true);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
      path,
    ).toBe(true);
  }
  for (const path of [
    "/dich-vu",
    "/huong-dan-dat-hang",
    "/cham-soc-hoa",
    "/so-do-trang",
  ]) {
    await page.goto(path);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(
      result.violations.filter((v) =>
        ["serious", "critical"].includes(v.impact || ""),
      ),
      path,
    ).toEqual([]);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/dich-vu");
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: ".local/services-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/huong-dan-dat-hang");
  await page.screenshot({ path: ".local/guide-mobile.png", fullPage: true });
  expect(errors).toEqual([]);
});

test("collections, service inquiry, article filters and FAQ connect correctly", async ({
  page,
}) => {
  await page.goto("/bo-suu-tap");
  await page
    .getByRole("link")
    .filter({ has: page.getByRole("heading", { name: "Một ngày rực rỡ" }) })
    .click();
  await expect(page).toHaveURL(/\/bo-suu-tap\/sinh-nhat/);
  await expect(page.locator(".product-card").first()).toBeVisible();
  await page.goto("/dich-vu/hoa-cuoi");
  await page.getByRole("link", { name: "Nhận tư vấn dịch vụ" }).click();
  await expect(page.getByLabel("Điều bạn muốn nhắn gửi")).toHaveValue(
    /Hoa cho ngày chung đôi/,
  );
  await page.goto("/chuyen-nha-hoa");
  await page.getByLabel("Tìm câu chuyện").fill("sinh nhat");
  await expect(page.locator(".journal-card")).toHaveCount(1);
  await page.getByLabel("Tìm câu chuyện").fill("no-matching-story");
  await expect(
    page.getByRole("heading", { name: "Chưa tìm thấy câu chuyện phù hợp" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Xóa bộ lọc" }).click();
  await expect(page.locator(".journal-card")).toHaveCount(6);
  await page.getByLabel("Chủ đề", { exact: true }).selectOption("Chọn quà");
  await expect(page.locator(".journal-card")).toHaveCount(2);
  await page.goto("/cau-hoi");
  await page.getByLabel("Tìm câu trả lời").fill("quen mat khau");
  await expect(page.locator("main details")).toHaveCount(1);
  await page.locator("main summary").click();
  await expect(page.locator("main details p")).toBeVisible();
  await page.goto("/duong-dan-khong-ton-tai");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Con đường này chưa có hoa",
  );
  await page.getByRole("link", { name: "Xem tất cả các trang" }).click();
  await expect(page).toHaveURL(/\/so-do-trang$/);
});
