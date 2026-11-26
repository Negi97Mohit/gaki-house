import { test, expect, type Page } from "@playwright/test";

const HOOK_ERROR_PATTERNS = [
  /rendered more hooks/i,
  /rendered fewer hooks/i,
  /invalid hook call/i,
  /rules of hooks/i,
  /order of hooks/i,
];

async function setupMockedBrowser(page: Page) {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });
  page.on("pageerror", (err) => {
    pageErrors.push(err.message || String(err));
  });

  // Mock mediaDevices before any app script runs
  await page.addInitScript(() => {
    const createDummyStream = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 320;
        canvas.height = 180;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#111827";
          ctx.fillRect(0, 0, 320, 180);
        }
        return canvas.captureStream(15);
      } catch {
        return new MediaStream();
      }
    };

    const mockDevices: MediaDeviceInfo[] = [
      {
        deviceId: "mock-cam-1",
        groupId: "mock-group",
        kind: "videoinput",
        label: "Mock Camera",
        toJSON: () => ({}),
      } as MediaDeviceInfo,
      {
        deviceId: "mock-mic-1",
        groupId: "mock-group",
        kind: "audioinput",
        label: "Mock Microphone",
        toJSON: () => ({}),
      } as MediaDeviceInfo,
    ];

    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        enumerateDevices: async () => mockDevices,
        getUserMedia: async () => createDummyStream(),
        getDisplayMedia: async () => createDummyStream(),
        addEventListener: () => {},
        removeEventListener: () => {},
      },
    });
  });

  // Mock external network requests so offline/preview runs stay clean
  await page.route("**/*", async (route) => {
    const url = route.request().url();
    const isLocal =
      url.startsWith("http://127.0.0.1") ||
      url.startsWith("http://localhost") ||
      url.includes(".netlify.app") ||
      url.startsWith("data:") ||
      url.startsWith("blob:");

    if (!isLocal) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({}),
      });
      return;
    }
    await route.continue();
  });

  return { consoleErrors, pageErrors };
}

test.describe("Studio Smoke Tests", () => {
  test("renders studio, toggles layouts and scene transitions without console or hook-order errors", async ({
    page,
  }) => {
    const { consoleErrors, pageErrors } = await setupMockedBrowser(page);

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("#root > *", { timeout: 25_000 }).catch(() => {});
    await page.waitForTimeout(1000);

    const rootHtml = await page.locator("#root").innerHTML();
    expect(
      rootHtml.length,
      `#root stayed empty. pageErrors=${pageErrors.join("; ")} consoleErrors=${consoleErrors.join("; ")}`,
    ).toBeGreaterThan(50);

    // Try opening layout/transition controls if present in the studio UI
    const transitionBtn = page
      .locator('button[title*="transition" i], button[aria-label*="transition" i]')
      .first();
    if (await transitionBtn.isVisible().catch(() => false)) {
      await transitionBtn.click();
      await page.waitForTimeout(300);
      await page.keyboard.press("Escape");
    }

    const layoutButtons = page.locator(
      'button[title*="layout" i], button[title*="split" i], button[title*="grid" i]',
    );
    const count = await layoutButtons.count();
    for (let i = 0; i < Math.min(count, 3); i++) {
      const btn = layoutButtons.nth(i);
      if (await btn.isVisible().catch(() => false)) {
        await btn.click().catch(() => {});
        await page.waitForTimeout(200);
      }
    }

    expect(pageErrors, `Uncaught page errors: ${pageErrors.join("; ")}`).toEqual([]);

    const hookErrors = consoleErrors.filter((msg) =>
      HOOK_ERROR_PATTERNS.some((re) => re.test(msg)),
    );
    expect(hookErrors, `React hook-order errors: ${hookErrors.join("; ")}`).toEqual([]);

    const nonBenignConsoleErrors = consoleErrors.filter(
      (msg) =>
        !msg.includes("net::ERR_") &&
        !msg.includes("Failed to load resource") &&
        !msg.includes("WebGL") &&
        !msg.includes("@firebase/firestore") &&
        !msg.includes("backend-core"),
    );
    expect(
      nonBenignConsoleErrors,
      `Console errors: ${nonBenignConsoleErrors.join("; ")}`,
    ).toEqual([]);
  });
});
