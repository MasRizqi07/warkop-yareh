import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const ARTIFACT_DIR = "C:\\Users\\rrgtet47\\.gemini\\antigravity\\brain\\01d7557e-5ed3-4310-ab07-6dce7dcb2629";
const OUT_DIR = path.resolve(process.cwd(), "test-results/phase2-evidence");

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function run() {
  console.log("🚀 Connecting to browser for Phase 2 Menu & Ordering Experience verification...");
  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });

    // 1. DESKTOP 1440px - /menu DARK MODE
    console.log("📸 Capturing /menu Desktop 1440px Dark Mode...");
    await page.goto("http://localhost:3000/menu", { waitUntil: "networkidle" });
    await page.evaluate(() => {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    });
    await page.waitForTimeout(600);
    const darkMenuDesktopPath = path.join(OUT_DIR, "web-menu-dark-1440.png");
    await page.screenshot({ path: darkMenuDesktopPath, fullPage: false });
    fs.copyFileSync(darkMenuDesktopPath, path.join(ARTIFACT_DIR, "web-menu-dark-1440.png"));
    console.log("✓ /menu Dark Desktop captured");

    // 2. DESKTOP 1440px - /menu LIGHT MODE
    console.log("📸 Capturing /menu Desktop 1440px Light Mode...");
    await page.evaluate(() => {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      document.documentElement.setAttribute("data-theme", "light");
    });
    await page.waitForTimeout(600);
    const lightMenuDesktopPath = path.join(OUT_DIR, "web-menu-light-1440.png");
    await page.screenshot({ path: lightMenuDesktopPath, fullPage: false });
    fs.copyFileSync(lightMenuDesktopPath, path.join(ARTIFACT_DIR, "web-menu-light-1440.png"));
    console.log("✓ /menu Light Desktop captured");

    // 3. MOBILE 375px - /menu DARK & LIGHT MODES
    console.log("📸 Capturing /menu Mobile 375px...");
    const mobilePage = await browser.newPage({ viewport: { width: 375, height: 812 } });
    await mobilePage.goto("http://localhost:3000/menu", { waitUntil: "networkidle" });

    // Dark Mobile
    await mobilePage.evaluate(() => {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    });
    await mobilePage.waitForTimeout(600);
    const darkMenuMobilePath = path.join(OUT_DIR, "web-menu-dark-375.png");
    await mobilePage.screenshot({ path: darkMenuMobilePath, fullPage: false });
    fs.copyFileSync(darkMenuMobilePath, path.join(ARTIFACT_DIR, "web-menu-dark-375.png"));

    // Light Mobile
    await mobilePage.evaluate(() => {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      document.documentElement.setAttribute("data-theme", "light");
    });
    await mobilePage.waitForTimeout(600);
    const lightMenuMobilePath = path.join(OUT_DIR, "web-menu-light-375.png");
    await mobilePage.screenshot({ path: lightMenuMobilePath, fullPage: false });
    fs.copyFileSync(lightMenuMobilePath, path.join(ARTIFACT_DIR, "web-menu-light-375.png"));
    await mobilePage.close();
    console.log("✓ /menu Mobile Dark & Light captured");

    // 4. TEST PRODUCT CUSTOMIZER MODAL
    console.log("✨ Testing Product Customizer Modal on Cold Brew Aren Brulee...");
    // Back to dark mode on desktop page
    await page.evaluate(() => {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    });

    // Find and click the first "Customize" button
    const customizeButtons = await page.$$('button:has-text("Customize")');
    if (customizeButtons.length > 0) {
      await customizeButtons[0].scrollIntoViewIfNeeded();
      await customizeButtons[0].click();
      console.log("✓ Clicked Customize button on first specialty drink");
    } else {
      throw new Error("Could not find Customize button on menu page");
    }

    // Wait for modal to appear
    await page.waitForSelector('#customizer-modal-title', { timeout: 5000 });
    await page.waitForTimeout(600);

    // Select Oatly milk if available
    const oatMilkOption = await page.$('text=Oatly® Barista Edition Oat Milk');
    if (oatMilkOption) {
      await oatMilkOption.click();
      console.log("✓ Selected Oatly Barista Milk (+Rp 8.000)");
      await page.waitForTimeout(300);
    }

    // Capture Customizer Modal
    const modalPath = path.join(OUT_DIR, "web-menu-customizer-modal.png");
    await page.screenshot({ path: modalPath, fullPage: false });
    fs.copyFileSync(modalPath, path.join(ARTIFACT_DIR, "web-menu-customizer-modal.png"));
    console.log("✓ Customizer Modal captured");

    // 5. ADD TO CART & CAPTURE CART DRAWER
    console.log("🛒 Adding customized item to cart...");
    const addToCartButton = await page.$('button:has-text("Add Customized Item")');
    if (addToCartButton) {
      await addToCartButton.click();
      console.log("✓ Clicked 'Add Customized Item'");
    }

    // Wait for CartDrawer slide-in
    await page.waitForSelector('text=Keranjang Pesanan', { timeout: 5000 });
    await page.waitForTimeout(600);

    const cartDrawerPath = path.join(OUT_DIR, "web-cart-drawer.png");
    await page.screenshot({ path: cartDrawerPath, fullPage: false });
    fs.copyFileSync(cartDrawerPath, path.join(ARTIFACT_DIR, "web-cart-drawer.png"));
    console.log("✓ Cart Drawer captured");

    // 6. NAVIGATE TO FULL /cart PAGE - DESKTOP DARK
    console.log("📋 Navigating to /cart Desktop Dark Mode via 'Detail Keranjang'...");
    const detailKeranjangBtn = await page.$('button:has-text("Detail Keranjang")');
    if (detailKeranjangBtn) {
      await detailKeranjangBtn.click();
      await page.waitForURL("**/cart", { timeout: 5000 });
      console.log("✓ Clicked 'Detail Keranjang' in drawer and navigated to /cart");
    } else {
      await page.goto("http://localhost:3000/cart", { waitUntil: "networkidle" });
    }

    await page.evaluate(() => {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    });
    await page.waitForTimeout(600);

    // Test split bill slider (set to 3 people)
    const rangeInput = await page.$('input[type="range"]');
    if (rangeInput) {
      await page.evaluate((el) => {
        el.value = "3";
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      }, rangeInput);
      console.log("✓ Adjusted Split-bill calculator slider to 3 orang");
      await page.waitForTimeout(300);
    }

    const darkCartDesktopPath = path.join(OUT_DIR, "web-cart-dark-1440.png");
    await page.screenshot({ path: darkCartDesktopPath, fullPage: true });
    fs.copyFileSync(darkCartDesktopPath, path.join(ARTIFACT_DIR, "web-cart-dark-1440.png"));
    console.log("✓ /cart Dark Desktop captured");

    // 7. /cart PAGE - DESKTOP LIGHT
    console.log("📋 Capturing /cart Desktop Light Mode...");
    await page.evaluate(() => {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      document.documentElement.setAttribute("data-theme", "light");
    });
    await page.waitForTimeout(600);
    const lightCartDesktopPath = path.join(OUT_DIR, "web-cart-light-1440.png");
    await page.screenshot({ path: lightCartDesktopPath, fullPage: true });
    fs.copyFileSync(lightCartDesktopPath, path.join(ARTIFACT_DIR, "web-cart-light-1440.png"));
    console.log("✓ /cart Light Desktop captured");

    // 8. /cart PAGE - MOBILE 375px
    console.log("📋 Capturing /cart Mobile 375px...");
    const cartMobilePage = await browser.newPage({ viewport: { width: 375, height: 812 } });
    await cartMobilePage.goto("http://localhost:3000/cart", { waitUntil: "networkidle" });
    await cartMobilePage.evaluate(() => {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    });
    await cartMobilePage.waitForTimeout(600);
    const darkCartMobilePath = path.join(OUT_DIR, "web-cart-dark-375.png");
    await cartMobilePage.screenshot({ path: darkCartMobilePath, fullPage: true });
    fs.copyFileSync(darkCartMobilePath, path.join(ARTIFACT_DIR, "web-cart-dark-375.png"));
    await cartMobilePage.close();
    console.log("✓ /cart Mobile Dark captured");

    console.log("\n🎉 ALL PHASE 2 EVIDENCE CAPTURED SUCCESSFULLY!");
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error("❌ Phase 2 evidence capture failed:", err);
  process.exit(1);
});
