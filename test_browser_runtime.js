import { chromium } from 'playwright';

(async () => {
  console.log('Launching browser to check for runtime console errors...');
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Listen for console logs and errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`PAGE ERROR: ${msg.text()}`);
    } else {
      console.log(`PAGE LOG: ${msg.text()}`);
    }
  });

  page.on('pageerror', exception => {
    console.log(`CRITICAL PAGE EXCEPTION: ${exception.message}`);
  });

  console.log('Navigating to live deployed page...');
  await page.goto('https://feat-yume-clearify.athlete-scout-sns.pages.dev/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Click on registration link to trigger QR code generation
  console.log('Clicking "新しく学生アカウントを作る"...');
  try {
    await page.click('text=新しく学生アカウントを作る');
    await page.waitForTimeout(2000);
  } catch (err) {
    console.log(`Click failed: ${err.message}`);
  }

  await browser.close();
  console.log('Inspection completed.');
})();
