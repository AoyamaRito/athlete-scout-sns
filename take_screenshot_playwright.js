import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  console.log('Launching Playwright Chromium browser...');
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
    isMobile: true,
    hasTouch: true
  });
  const page = await context.newPage();

  // 1. Capture Student Login Page
  console.log('Navigating to Student Login Page...');
  await page.goto('https://feat-yume-clearify.athlete-scout-sns.pages.dev/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500); // Wait for animations/rendering

  const loginPath = path.join(__dirname, 'mobile-student-login.png');
  await page.screenshot({ path: loginPath });
  console.log(`Mobile Student Login screenshot saved to: ${loginPath}`);

  // 2. Capture Corporate LP Page
  console.log('Navigating to Corporate LP...');
  await page.goto('https://feat-yume-clearify.athlete-scout-sns.pages.dev/corporate-lp.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const lpPath = path.join(__dirname, 'mobile-corporate-lp.png');
  await page.screenshot({ path: lpPath });
  console.log(`Mobile Corporate LP screenshot saved to: ${lpPath}`);

  await browser.close();
  console.log('Verification completed successfully!');
})();
