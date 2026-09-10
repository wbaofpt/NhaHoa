import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { parse } from "dotenv";
const env = parse(readFileSync("backend/.env"));
test("admin can sign in and edit a flower through the interface", async ({
  page,
}) => {
  await page.goto("/dang-nhap?next=/quan-tri");
  await page.getByLabel("Email", { exact: true }).fill(env.ADMIN_EMAIL);
  await page.getByLabel("Mật khẩu", { exact: true }).fill(env.ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(page).toHaveURL(/\/quan-tri$/);
  await expect(
    page.getByRole("heading", { name: "Hoạt động cửa hàng" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Sản phẩm", exact: true }).click();
  await page.getByRole("button", { name: "Sửa Nàng thơ", exact: true }).click();
  await expect(page.getByLabel("Tên hoa", { exact: true })).toHaveValue(
    "Nàng thơ",
  );
  await page.getByRole("button", { name: "Lưu mẫu hoa", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Đã lưu mẫu hoa." }),
  ).toBeVisible();
  await page.evaluate(() => window.scrollTo({top:0,behavior:'instant'}));
  await page.screenshot({ path: ".local/admin.png", fullPage: true });
});
