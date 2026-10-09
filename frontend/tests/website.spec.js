import { test, expect } from "@playwright/test";

async function login(page, role = "company") {
  await page.goto(role === "company" ? "/company-login" : "/login");
  await page.getByLabel(role === "company" ? "Work email" : "Email", { exact: true }).fill(`${role}@example.test`);
  await page.getByLabel("Password", { exact: true }).fill("test-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(role === "company" ? "/company-dashboard" : "/dev-dashboard"));
}

test.beforeEach(async ({ request }) => {
  const response = await request.post("http://127.0.0.1:5001/__test/reset");
  expect(response.ok()).toBeTruthy();
});

test("minimal public pages and navigation work on desktop and mobile", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Your next chapter");
  await page.screenshot({ path: "test-results/home-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("link", { name: "For developers" }).click();
  await expect(page.getByRole("heading", { name: "Developer sign in" })).toBeVisible();
  await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 390);
  await page.screenshot({ path: "test-results/login-mobile.png", fullPage: true });
  expect(errors).toEqual([]);
});

test("company and developer exchange messages, receipts, and hiring stages", async ({ page, browser }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await login(page);
  await page.getByRole("link", { name: "Find talent", exact: true }).click();
  const sam = page.locator(".hire-card").filter({ hasText: "Sam Taylor" });
  await sam.getByRole("button", { name: "View profile", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("Frontend engineer");
  await page.getByRole("button", { name: "Close profile" }).click();
  await sam.getByRole("button", { name: "Contact", exact: true }).click();
  await expect(page).toHaveURL(/company-chat\?chat=/);
  await expect(page.locator(".chat-main-header")).toContainText("Sam Taylor");
  await page.getByRole("textbox", { name: "Message", exact: true }).fill("Hello Sam, let's talk about the role.");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.locator(".chat-bubble-sent")).toContainText("Hello Sam");

  const devContext = await browser.newContext();
  const dev = await devContext.newPage();
  dev.on("pageerror", (error) => errors.push(error.message));
  await login(dev, "developer");
  await dev.getByRole("link", { name: "Messages", exact: true }).click();
  await expect(dev.locator(".chat-bubble-received")).toContainText("Hello Sam");
  await expect(page.locator(".chat-bubble-sent [aria-label='Read']")).toBeVisible();
  await dev.getByRole("textbox", { name: "Message", exact: true }).fill("Hi!\nI'm interested in learning more.");
  await dev.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(dev.locator(".chat-bubble-sent")).toContainText("I'm interested");
  await expect(page.locator(".chat-bubble-received")).toContainText("I'm interested");
  await page.getByLabel("Hiring stage", { exact: true }).selectOption("Technical Interview");
  await expect(dev.locator(".chat-status")).toContainText("Technical Interview");
  await page.screenshot({ path: "test-results/chat-desktop.png", fullPage: true });
  await dev.reload();
  await expect(dev.locator(".chat-bubble-sent")).toContainText("I'm interested");
  await devContext.close();
  expect(errors).toEqual([]);
});

test("drafts and delayed sends stay attached to their original conversation", async ({ page }) => {
  await login(page);
  await page.goto("/hire");
  await page.locator(".hire-card").filter({ hasText: "Sam Taylor" }).getByRole("button", { name: "Contact", exact: true }).click();
  await page.goto("/hire");
  await page.locator(".hire-card").filter({ hasText: "Amina Khan" }).getByRole("button", { name: "Contact", exact: true }).click();
  await page.getByRole("textbox", { name: "Message", exact: true }).fill("Amina's draft");
  await page.locator(".chat-list-item").filter({ hasText: "Sam Taylor" }).click();
  await expect(page.getByRole("textbox", { name: "Message", exact: true })).toHaveValue("");
  await page.getByRole("textbox", { name: "Message", exact: true }).fill("Sam's message");
  await page.route("**/api/chats/*/messages", async (route) => {
    const response = await route.fetch();
    await new Promise((resolve) => setTimeout(resolve, 700));
    await route.fulfill({ response });
  });
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await page.locator(".chat-list-item").filter({ hasText: "Amina Khan" }).click();
  await expect(page.getByRole("textbox", { name: "Message", exact: true })).toHaveValue("Amina's draft");
  await expect(page.getByRole("button", { name: "Send message", exact: true })).toBeEnabled();
  await expect(page.locator(".chat-messages")).not.toContainText("Sam's message");
  await page.locator(".chat-list-item").filter({ hasText: "Sam Taylor" }).click();
  await expect(page.locator(".chat-bubble-sent")).toContainText("Sam's message");
  await expect(page.getByRole("textbox", { name: "Message", exact: true })).toHaveValue("");
});

test("a lost send response can be retried without duplicate delivery", async ({ page }) => {
  await login(page);
  await page.goto("/hire");
  await page.locator(".hire-card").filter({ hasText: "Sam Taylor" }).getByRole("button", { name: "Contact", exact: true }).click();
  await page.route("**/api/chats/*/messages", async (route) => { await route.fetch(); await route.abort("failed"); }, { times: 1 });
  await page.getByRole("textbox", { name: "Message", exact: true }).fill("Delivered just once");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Unable to connect");
  await expect(page.getByRole("textbox", { name: "Message", exact: true })).toHaveValue("Delivered just once");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Message", exact: true })).toHaveValue("");
  await expect(page.locator(".chat-bubble-sent")).toHaveCount(1);
  await page.reload();
  await expect(page.locator(".chat-bubble-sent")).toHaveCount(1);
});

test("mobile conversations fit the viewport and return to the inbox", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await page.goto("/hire");
  await page.locator(".hire-card").filter({ hasText: "Sam Taylor" }).getByRole("button", { name: "Contact", exact: true }).click();
  await expect(page.locator(".chat-main")).toBeVisible();
  await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 390);
  await page.getByRole("textbox", { name: "Message", exact: true }).fill("Hello from mobile");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.locator(".chat-bubble-sent")).toContainText("Hello from mobile");
  await page.screenshot({ path: "test-results/chat-mobile.png", fullPage: true });
  await page.getByRole("button", { name: "Back to conversations", exact: true }).click();
  await expect(page.locator(".chat-sidebar")).toBeVisible();
  await page.locator(".chat-list-item").filter({ hasText: "Sam Taylor" }).click();
  await expect(page.locator(".chat-main")).toBeVisible();
});

test("profile pages, admin, and logout render without browser errors", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await login(page);
  for (const path of ["/company-profile", "/company-dashboard", "/hire"]) {
    await page.goto(path);
    await expect(page.locator("main h1")).toBeVisible();
    await page.screenshot({ path: `test-results/${path.slice(1)}.png`, fullPage: true });
  }
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL("/");
  await page.goto("/company-dashboard");
  await expect(page).toHaveURL("/");
  await login(page, "developer");
  for (const path of ["/dev-profile", "/dev-dashboard"]) {
    await page.goto(path);
    await expect(page.locator("main h1")).toBeVisible();
    await page.screenshot({ path: `test-results/${path.slice(1)}.png`, fullPage: true });
  }
  await page.goto("/dev-profile");
  await page.getByRole("button", { name: "Edit profile", exact: true }).click();
  await page.locator('input[name="fullName"]').fill("Unsaved edit");
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.locator(".profile-name")).toHaveText("Sam Taylor");
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Admin sign in" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("admin review unlocks a waiting developer's workspace automatically", async ({ page, browser }) => {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill("pending@example.test");
  await page.getByLabel("Password", { exact: true }).fill("test-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/waiting-review/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Your profile is under review");
  await page.screenshot({ path: "test-results/waiting-review.png", fullPage: true });
  const context = await browser.newContext();
  const admin = await context.newPage();
  await admin.goto("http://127.0.0.1:5173/admin");
  await admin.getByLabel("Password", { exact: true }).fill("test-admin-password");
  await admin.getByRole("button", { name: "Open admin", exact: true }).click();
  await expect(admin.getByRole("heading", { name: "Identity verification" })).toBeVisible();
  const card = admin.locator(".admin-account-card").filter({ hasText: "Pending Developer" });
  await expect(card).toBeVisible();
  await admin.screenshot({ path: "test-results/admin.png", fullPage: true });
  await card.getByRole("button", { name: "Verify", exact: true }).click();
  await expect(page).toHaveURL(/dev-dashboard/, { timeout: 15000 });
  await expect(page.getByRole("heading", { name: "Your company pipeline" })).toBeVisible();
  await context.close();
});
