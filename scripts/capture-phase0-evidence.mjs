import { chromium } from "playwright";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const ARTIFACT_DIR = "C:\\Users\\rrgtet47\\.gemini\\antigravity\\brain\\01d7557e-5ed3-4310-ab07-6dce7dcb2629";
const OUT_DIR = path.resolve(process.cwd(), "test-results/phase0-evidence");

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function waitForServer(url, timeout = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 200 || res.status === 304) {
        return true;
      }
    } catch {
      // ignore
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Server at ${url} did not respond within ${timeout}ms`);
}

async function run() {
  console.log("Starting Next.js production server on port 3000...");
  const server = spawn("pnpm", ["--filter", "@warkop-yareh/web", "start", "-p", "3000"], {
    shell: true,
    stdio: "inherit",
  });

  try {
    await waitForServer("http://localhost:3000");
    console.log("Next.js server is ready!");

    const browser = await chromium.launch({ headless: true });

    // 1. HOMEPAGE 1440px
    console.log("Capturing Homepage at 1440px...");
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto("http://localhost:3000", { waitUntil: "networkidle" });

    // Dark
    await page.evaluate(() => {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    });
    await page.waitForTimeout(600);
    const hp1440Dark = path.join(OUT_DIR, "homepage-1440-dark.png");
    await page.screenshot({ path: hp1440Dark, fullPage: false });
    console.log(`Saved: ${hp1440Dark}`);

    // Light
    await page.evaluate(() => {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      document.documentElement.setAttribute("data-theme", "light");
    });
    await page.waitForTimeout(600);
    const hp1440Light = path.join(OUT_DIR, "homepage-1440-light.png");
    await page.screenshot({ path: hp1440Light, fullPage: false });
    console.log(`Saved: ${hp1440Light}`);

    // 2. HOMEPAGE 375px
    console.log("Capturing Homepage at 375px...");
    await page.setViewportSize({ width: 375, height: 812 });

    // Dark
    await page.evaluate(() => {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    });
    await page.waitForTimeout(600);
    const hp375Dark = path.join(OUT_DIR, "homepage-375-dark.png");
    await page.screenshot({ path: hp375Dark, fullPage: false });
    console.log(`Saved: ${hp375Dark}`);

    // Light
    await page.evaluate(() => {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      document.documentElement.setAttribute("data-theme", "light");
    });
    await page.waitForTimeout(600);
    const hp375Light = path.join(OUT_DIR, "homepage-375-light.png");
    await page.screenshot({ path: hp375Light, fullPage: false });
    console.log(`Saved: ${hp375Light}`);

    // 3. PRIMITIVES HARNESS (/test-ds)
    console.log("Capturing UI Primitives at /test-ds...");
    await page.setViewportSize({ width: 1200, height: 900 });
    await page.goto("http://localhost:3000/test-ds", { waitUntil: "networkidle" });
    await page.evaluate(() => {
      document.querySelectorAll('nav, div').forEach((el) => {
        if (getComputedStyle(el).position === 'fixed' && (getComputedStyle(el).bottom === '0px' || parseInt(getComputedStyle(el).bottom) < 50)) {
          el.style.display = 'none';
        }
      });
    });

    const components = ["button", "card", "input", "badge"];

    // Dark mode components
    await page.evaluate(() => {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    });
    await page.waitForTimeout(600);

    for (const comp of components) {
      const el = page.locator(`#component-${comp}`);
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(100);
      const filePath = path.join(OUT_DIR, `component-${comp}-dark.png`);
      await el.screenshot({ path: filePath });
      console.log(`Saved: ${filePath}`);
    }

    // Toggle theme to Light
    const toggleBtn = page.locator("#theme-toggle");
    if (await toggleBtn.count() > 0) {
      await toggleBtn.click();
    }
    await page.evaluate(() => {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      document.documentElement.setAttribute("data-theme", "light");
    });
    await page.waitForTimeout(600);

    // Light mode components
    for (const comp of components) {
      const el = page.locator(`#component-${comp}`);
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(100);
      const filePath = path.join(OUT_DIR, `component-${comp}-light.png`);
      await el.screenshot({ path: filePath });
      console.log(`Saved: ${filePath}`);
    }

    await browser.close();
    console.log("All screenshots captured successfully!");

    // Copy screenshots to ARTIFACT_DIR for embedding in walkthrough
    if (fs.existsSync(ARTIFACT_DIR)) {
      const files = fs.readdirSync(OUT_DIR);
      for (const file of files) {
        if (file.endsWith(".png")) {
          fs.copyFileSync(path.join(OUT_DIR, file), path.join(ARTIFACT_DIR, file));
        }
      }
      console.log(`Copied evidence screenshots to artifact directory: ${ARTIFACT_DIR}`);
    }
  } finally {
    console.log("Stopping Next.js server...");
    if (server.pid) {
      spawn("taskkill", ["/pid", server.pid.toString(), "/f", "/t"]);
    }
  }
}

run().catch((err) => {
  console.error("Screenshot capture failed:", err);
  process.exit(1);
});
