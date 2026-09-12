import { test, expect } from "@playwright/test";

test("navigation motion finishes, handles interruption and preserves search focus", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await page.getByRole("navigation").getByRole("link", { name: "Cửa hàng hoa", exact: true }).click();
  await expect(page.locator("main h1")).toContainText("Một bó hoa");
  await page.getByRole("navigation").getByRole("link", { name: "Dịch vụ", exact: true }).click();
  await page.goBack();
  await expect(page).toHaveURL(/\/hoa$/);
  await expect.poll(() => page.locator("main").evaluate(el => el.getAnimations().length)).toBe(0);
  await expect(page.locator("main")).toHaveCSS("opacity", "1");
  const search = page.getByRole("textbox", { name: "Tìm hoa", exact: true });
  await search.fill("nang tho");
  await expect(search).toBeFocused();
  expect(await page.locator("main").evaluate(el => el.getAnimations().length)).toBe(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("navigation").getByRole("link", { name: "Dịch vụ", exact: true }).click();
  await expect(page.locator("main")).toBeFocused();
  expect(await page.locator("main").evaluate(el => el.getAnimations().length)).toBe(0);
  expect(errors).toEqual([]);
});

test("real catalog loading shows a bloom, respects reduced motion and clears when ready", async ({ page }) => {
  let release!: () => void;
  const ready = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/api/products", async route => { await ready; await route.continue(); });
  try {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/hoa");
    const loader = page.locator(".bloom-loader");
    await expect(loader).toBeVisible();
    await expect(loader).toHaveAttribute("role", "status");
    expect(await loader.evaluate(el => el.getAnimations({ subtree: true }).length)).toBeGreaterThan(0);
    await page.screenshot({ path: ".local/bloom-loading.png", fullPage: true });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect.poll(() => loader.evaluate(el => el.getAnimations({ subtree: true }).length)).toBe(0);
    await expect(loader).toBeVisible();
    release();
    await expect(loader).toHaveCount(0);
    await expect(page.locator(".product-card").first()).toBeVisible();
  } finally { release(); }
});
