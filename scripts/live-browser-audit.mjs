import { chromium } from "playwright";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const ARTIFACT_DIR = "C:\\Users\\rrgtet47\\.gemini\\antigravity\\brain\\01d7557e-5ed3-4310-ab07-6dce7dcb2629";
const OUT_DIR = path.resolve(process.cwd(), "test-results/live-browser");

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function waitForUrl(url, timeout = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url);
      if (res.status < 500) return true;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Timeout waiting for ${url}`);
}

async function run() {
  console.log("==================================================");
  console.log("STARTING LIVE BROWSER & SERVER AUDIT");
  console.log("==================================================");

  console.log("1. Spawning Web Server on http://localhost:3000...");
  const webProcess = spawn("pnpm", ["--filter", "@warkop-yareh/web", "start", "-p", "3000"], {
    shell: true,
    stdio: "inherit",
  });

  console.log("2. Spawning Admin Server on http://localhost:3001...");
  const adminProcess = spawn("pnpm", ["--filter", "@warkop-yareh/admin", "start", "-p", "3001"], {
    shell: true,
    stdio: "inherit",
  });

  try {
    console.log("3. Waiting for servers to become ready...");
    await waitForUrl("http://localhost:3000");
    console.log("-> Web Server is READY (http://localhost:3000)");

    await waitForUrl("http://localhost:3001");
    console.log("-> Admin Server is READY (http://localhost:3001)");

    console.log("4. Launching Chromium via Playwright...");
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();

    const testRoutes = [
      { name: "web-homepage", url: "http://localhost:3000/" },
      { name: "web-test-ds", url: "http://localhost:3000/test-ds" },
      { name: "web-menu", url: "http://localhost:3000/menu" },
      { name: "web-booking", url: "http://localhost:3000/booking" },
      { name: "web-community", url: "http://localhost:3000/community" },
      { name: "admin-dashboard", url: "http://localhost:3001/" },
      { name: "admin-pos", url: "http://localhost:3001/pos" },
    ];

    const auditResults = [];

    for (const route of testRoutes) {
      console.log(`\nTesting route: ${route.url} (${route.name})...`);
      const consoleErrors = [];
      const pageErrors = [];

      const onConsole = (msg) => {
        if (msg.type() === "error") {
          // Ignore react-query connection or deliberate mock errors if any
          consoleErrors.push(msg.text());
        }
      };
      const onPageError = (err) => {
        pageErrors.push(err.message || String(err));
      };

      page.on("console", onConsole);
      page.on("pageerror", onPageError);

      try {
        const res = await page.goto(route.url, { waitUntil: "networkidle", timeout: 15000 });
        await page.waitForTimeout(600);

        const status = res ? res.status() : 0;
        const title = await page.title();

        const shotPath = path.join(OUT_DIR, `${route.name}.png`);
        await page.screenshot({ path: shotPath, fullPage: false });

        auditResults.push({
          route: route.url,
          name: route.name,
          status,
          title,
          consoleErrors,
          pageErrors,
          screenshot: shotPath,
        });

        console.log(`  -> Status: ${status} | Title: "${title}"`);
        console.log(`  -> Console Errors: ${consoleErrors.length} | Page Errors: ${pageErrors.length}`);
        if (consoleErrors.length > 0) {
          consoleErrors.forEach((e) => console.log(`     [CONSOLE ERROR]: ${e}`));
        }
        if (pageErrors.length > 0) {
          pageErrors.forEach((e) => console.log(`     [PAGE ERROR]: ${e}`));
        }
      } catch (err) {
        console.error(`  -> Failed navigating to ${route.url}:`, err.message);
        auditResults.push({
          route: route.url,
          name: route.name,
          status: "FAILED",
          title: "ERROR",
          consoleErrors,
          pageErrors: [err.message],
        });
      } finally {
        page.off("console", onConsole);
        page.off("pageerror", onPageError);
      }
    }

    await browser.close();

    console.log("\n==================================================");
    console.log("AUDIT SUMMARY RESULTS");
    console.log("==================================================");
    console.table(
      auditResults.map((r) => ({
        Route: r.name,
        Status: r.status,
        "Console Err": r.consoleErrors.length,
        "Page Err": r.pageErrors.length,
      }))
    );

    // Copy screenshots to brain artifact dir
    if (fs.existsSync(ARTIFACT_DIR)) {
      const files = fs.readdirSync(OUT_DIR);
      for (const file of files) {
        if (file.endsWith(".png")) {
          fs.copyFileSync(path.join(OUT_DIR, file), path.join(ARTIFACT_DIR, file));
        }
      }
      console.log(`Copied screenshots to artifact directory for presentation.`);
    }

    const hasAnyError = auditResults.some(
      (r) => r.pageErrors.length > 0 || r.consoleErrors.some((e) => !e.includes("favicon"))
    );

    if (hasAnyError) {
      console.log("\nRESULT: WARNINGS / ISSUES DETECTED");
    } else {
      console.log("\nRESULT: ALL ROUTES HEALTHY — 0 ERRORS DETECTED!");
    }
  } finally {
    console.log("\nCleaning up server processes...");
    if (webProcess.pid) spawn("taskkill", ["/pid", webProcess.pid.toString(), "/f", "/t"]);
    if (adminProcess.pid) spawn("taskkill", ["/pid", adminProcess.pid.toString(), "/f", "/t"]);
  }
}

run().catch((err) => {
  console.error("Audit fatal error:", err);
  process.exit(1);
});
