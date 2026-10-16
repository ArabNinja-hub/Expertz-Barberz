// Optional browser regression suite. Uses external Playwright + axe-core test tooling.
// CLIENT_REVIEW_URL may point at a running dev or production preview server.
const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { default: AxeBuilder } = require("@axe-core/playwright");
(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROMIUM_PATH
      ? {
          executablePath: process.env.CHROMIUM_PATH,
          args: ["--no-sandbox", "--disable-dev-shm-usage"],
        }
      : {}),
  });
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const base = process.env.CLIENT_REVIEW_URL || "http://localhost:5173";
    async function audit(label) {
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      assert.deepEqual(
        result.violations.map((v) => ({
          id: v.id,
          targets: v.nodes.map((n) => n.target),
        })),
        [],
        label,
      );
    }
    for (const [width, height] of [
      [1440, 900],
      [1024, 900],
      [768, 1024],
      [390, 844],
      [320, 640],
      [844, 390],
    ]) {
      await page.setViewportSize({ width, height });
      await page.goto(base);
      await page.evaluate(() => document.fonts.ready);
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `overflow at ${width}`,
      );
      await page.locator("#contact").scrollIntoViewIfNeeded();
      await page.waitForFunction(() =>
        [...document.querySelectorAll("main img")].every(
          (i) => i.complete && i.naturalWidth > 0,
        ),
      );
      await page.evaluate(() => scrollTo(0, 0));
      await audit(`page ${width}x${height}`);
      if (width <= 1000) {
        await page.locator(".menu-toggle").click();
        await page.locator('#mobile-nav a[href="#services"]').click();
        assert.equal(
          await page.locator(".menu-toggle").getAttribute("aria-expanded"),
          "false",
        );
        assert.equal(new URL(page.url()).hash, "#services");
        await page.locator(".menu-toggle").click();
        await page.locator("#mobile-nav [data-book]").click();
        assert.ok(await page.locator("#booking-dialog").isVisible());
        await page.keyboard.press("Escape");
        await page.waitForFunction(
          () => !document.querySelector("#booking-dialog").open,
        );
        assert.ok(
          await page
            .locator(".menu-toggle")
            .evaluate((el) => el === document.activeElement),
          "restore mobile focus",
        );
        await page.locator(".menu-toggle").click();
        await page.keyboard.press("Escape");
        assert.ok(await page.locator("#mobile-nav").isHidden());
      }
      await page.locator(".hero-actions [data-book]").click();
      await audit(`enquiry ${width}x${height}`);
      // Native modal navigation cannot focus background page controls.
      // Chromium may temporarily report body when focus moves to browser chrome.
      for (let i = 0; i < 8; i++) {
        await page.keyboard.press("Tab");
        assert.ok(
          await page.evaluate(
            () =>
              document.activeElement === document.body ||
              document
                .querySelector("#booking-dialog")
                .contains(document.activeElement),
          ),
        );
      }
      await page.locator("#booking-dialog [data-close]").click();
      console.log(
        `PASS responsive layout, loaded images, accessibility, menu and enquiry at ${width}x${height}`,
      );
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    for (const button of await page.locator("[data-book]").all()) {
      if (!(await button.isVisible())) continue;
      await button.click();
      assert.ok(await page.locator("#booking-dialog").isVisible());
      assert.ok(await page.locator("#whatsapp-link").isHidden());
      assert.equal(
        await page.locator("#whatsapp-link").getAttribute("href"),
        null,
      );
      assert.ok(
        (await page.locator("#whatsapp-status").textContent()).includes(
          "Nothing will be sent",
        ),
      );
      await page.locator("#booking-dialog [data-close]").click();
    }
    await page.locator(".service-link").first().click();
    assert.equal(
      await page.locator("#service").inputValue(),
      "Haircuts & Styling",
    );
    for (const value of [
      "Haircuts & Styling",
      "Fades & Line-ups",
      "Beard Grooming",
      "A general enquiry",
    ]) {
      await page.locator("#service").selectOption(value);
      assert.ok(
        (await page.locator("#enquiry").inputValue()).includes(
          "availability and pricing",
        ),
      );
    }
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.locator("#enquiry").fill("My custom enquiry & style question.");
    await page.locator("#copy-message").click();
    await page.waitForFunction(() =>
      document.querySelector("#copy-status").textContent.includes("copied"),
    );
    assert.equal(
      await page.evaluate(() => navigator.clipboard.readText()),
      "My custom enquiry & style question.",
    );
    await page.locator("#enquiry").fill("An edited enquiry");
    assert.equal(await page.locator("#copy-status").textContent(), "");
    await page.locator("#enquiry").fill("  ");
    assert.ok(await page.locator("#copy-message").isDisabled());
    await page.locator("#enquiry").fill("A draft to copy manually");
    await page.evaluate(() =>
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: () => Promise.reject(new Error("Permission denied")),
        },
      }),
    );
    await page.locator("#copy-message").click();
    await page.waitForFunction(() =>
      document
        .querySelector("#copy-status")
        .textContent.includes("selected message"),
    );
    assert.equal(
      await page
        .locator("#enquiry")
        .evaluate((el) => el.selectionEnd - el.selectionStart),
      "A draft to copy manually".length,
    );
    await page.keyboard.press("Escape");
    for (const item of await page.locator(".gallery-item").all()) {
      await item.click();
      assert.equal(
        (await page.locator("#photo-title").textContent()).trim(),
        (await item.locator(".gallery-title").textContent()).trim(),
      );
      await page.waitForFunction(
        () =>
          document.querySelector("#expanded-photo").complete &&
          document.querySelector("#expanded-photo").naturalWidth > 0,
      );
      await audit("gallery dialog");
      await page.locator("#photo-dialog [data-close]").click();
      assert.ok(await item.evaluate((el) => el === document.activeElement));
    }
    await page.locator("#demo-details").click();
    await audit("demo dialog");
    await page.mouse.click(5, 5);
    assert.ok(await page.locator("#demo-dialog").isHidden());
    for (const anchor of await page.locator('a[href^="#"]').all()) {
      const href = await anchor.getAttribute("href");
      assert.ok(await page.locator(href).count());
      if (
        (await anchor.isVisible()) &&
        !(await anchor.evaluate((el) => el.classList.contains("skip-link")))
      ) {
        await anchor.click();
        assert.equal(new URL(page.url()).hash, href);
      }
    }
    await page.emulateMedia({ reducedMotion: "reduce" });
    assert.equal(
      await page.evaluate(
        () => getComputedStyle(document.documentElement).scrollBehavior,
      ),
      "auto",
    );
    assert.deepEqual(errors, []);
    console.log(
      "PASS all CTAs, service messages, real clipboard/fallback, empty draft guard, gallery names and focus, dialogs, links, reduced motion and runtime checks",
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
