import { test, expect } from "@playwright/test";

test.describe("marketing smoke", () => {
  test("home page renders brand", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("BioHub").first()).toBeVisible();
  });

  test("pricing page loads", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("features page loads", async ({ page }) => {
    await page.goto("/features");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("sign-in page loads", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("public routes", () => {
  test("unknown username returns 404", async ({ page }) => {
    const res = await page.goto("/this-user-does-not-exist-zz9");
    expect(res?.status()).toBe(404);
  });

  test("dashboard redirects unauthenticated users", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/sign-in/);
  });
});
