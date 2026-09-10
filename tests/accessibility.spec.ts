import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("public navigation and forms have no serious accessibility violations", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const path of ["/", "/hoa", "/dang-nhap", "/lien-he"]) {
    await page.goto(path);
    await page.locator("h1").waitFor();
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      result.violations
        .filter((v) => v.impact === "critical" || v.impact === "serious")
        .map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => ({
            html: n.html,
            summary: n.failureSummary,
          })),
        })),
      path,
    ).toEqual([]);
  }
});
