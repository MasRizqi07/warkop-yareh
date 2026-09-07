import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const ARTIFACT_DIR = "C:\\Users\\rrgtet47\\.gemini\\antigravity\\brain\\01d7557e-5ed3-4310-ab07-6dce7dcb2629";
const OUT_DIR = path.resolve(process.cwd(), "test-results/phase1-evidence");

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function run() {
  console.log("Connecting to browser for Phase 1 verification...");
  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    // 1. TEST REDIRECTION /reservations -> /booking
    console.log("Testing redirect from /reservations to /booking...");
    await page.goto("http://localhost:3000/reservations", { waitUntil: "networkidle" });
    const currentUrl = page.url();
    console.log(`Initial URL: http://localhost:3000/reservations -> Landed at: ${currentUrl}`);
    if (!currentUrl.includes("/booking")) {
      throw new Error(`Expected redirect to /booking, but got ${currentUrl}`);
    }
    console.log("✓ Redirect /reservations -> /booking SUCCESS!");

    // 2. DESKTOP 1440px - DARK MODE
    console.log("Capturing /booking Desktop 1440px Dark Mode...");
    await page.evaluate(() => {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    });
    await page.waitForTimeout(500);
    const darkDesktopPath = path.join(OUT_DIR, "web-booking-dark-1440.png");
    await page.screenshot({ path: darkDesktopPath, fullPage: true });
    fs.copyFileSync(darkDesktopPath, path.join(ARTIFACT_DIR, "web-booking-dark-1440.png"));

    // 3. DESKTOP 1440px - LIGHT MODE
    console.log("Capturing /booking Desktop 1440px Light Mode...");
    await page.evaluate(() => {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    });
    await page.waitForTimeout(500);
    const lightDesktopPath = path.join(OUT_DIR, "web-booking-light-1440.png");
    await page.screenshot({ path: lightDesktopPath, fullPage: true });
    fs.copyFileSync(lightDesktopPath, path.join(ARTIFACT_DIR, "web-booking-light-1440.png"));

    // 4. MOBILE 375px - DARK & LIGHT MODES
    console.log("Capturing /booking Mobile 375px...");
    const mobilePage = await browser.newPage({ viewport: { width: 375, height: 812 } });
    await mobilePage.goto("http://localhost:3000/booking", { waitUntil: "networkidle" });

    // Dark mobile
    await mobilePage.evaluate(() => {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    });
    await mobilePage.waitForTimeout(500);
    const darkMobilePath = path.join(OUT_DIR, "web-booking-dark-375.png");
    await mobilePage.screenshot({ path: darkMobilePath, fullPage: true });
    fs.copyFileSync(darkMobilePath, path.join(ARTIFACT_DIR, "web-booking-dark-375.png"));

    // Light mobile
    await mobilePage.evaluate(() => {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    });
    await mobilePage.waitForTimeout(500);
    const lightMobilePath = path.join(OUT_DIR, "web-booking-light-375.png");
    await mobilePage.screenshot({ path: lightMobilePath, fullPage: true });
    fs.copyFileSync(lightMobilePath, path.join(ARTIFACT_DIR, "web-booking-light-375.png"));
    await mobilePage.close();

    // 5. INTERACTION & CONFIRMATION MODAL TEST
    console.log("Testing interactive booking flow and modal...");
    // Return page to dark mode
    await page.evaluate(() => {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    });

    // Select Shift (e.g. Peak Producer)
    const shiftButtons = await page.$$("section:nth-of-type(2) .cursor-pointer");
    if (shiftButtons.length > 1) {
      await shiftButtons[1].click();
      console.log("✓ Shift selected");
    }

    // Toggle amenity checkbox
    const amenityCheckboxes = await page.$$('input[type="checkbox"]');
    if (amenityCheckboxes.length > 0) {
      await amenityCheckboxes[0].click();
      console.log("✓ Amenity checked: Unlimited Cold Brew");
    }

    // Fill patron name
    const nameInput = await page.$('input[placeholder="Nama Pemesan"]');
    if (nameInput) {
      await nameInput.fill("Prasetyo Utomo");
      console.log("✓ Patron name filled");
    }

    // Fill patron phone
    const phoneInput = await page.$('input[placeholder="08xxxxxxxxxx"]');
    if (phoneInput) {
      await phoneInput.fill("081299887766");
      console.log("✓ Patron phone filled");
    }

    // Click Confirm Reservation button
    const confirmBtn = await page.getByRole("button", { name: "Confirm Reservation" });
    await confirmBtn.click();
    console.log("✓ Clicked Confirm Reservation button");

    // Wait for modal to show up
    await page.waitForSelector("text=Reservasi Berhasil Dikonfirmasi!", { timeout: 5000 });
    console.log("✓ Confirmation Modal appeared successfully!");

    // Capture screenshot with modal open
    const modalPath = path.join(OUT_DIR, "web-booking-modal.png");
    await page.screenshot({ path: modalPath });
    fs.copyFileSync(modalPath, path.join(ARTIFACT_DIR, "web-booking-modal.png"));

    // 6. TABLE DINE-IN PAGE (/table/T-04)
    console.log("Capturing /table/T-04 Dine-In Page...");
    await page.goto("http://localhost:3000/table/T-04", { waitUntil: "networkidle" });
    await page.evaluate(() => {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    });
    await page.waitForTimeout(500);
    const tablePagePath = path.join(OUT_DIR, "web-table-dine-in-1440.png");
    await page.screenshot({ path: tablePagePath, fullPage: true });
    fs.copyFileSync(tablePagePath, path.join(ARTIFACT_DIR, "web-table-dine-in-1440.png"));

    console.log("\n========================================");
    console.log("PHASE 1 BROWSER EVIDENCE CAPTURE COMPLETE!");
    console.log("========================================");
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error("Phase 1 evidence capture failed:", err);
  process.exit(1);
});

