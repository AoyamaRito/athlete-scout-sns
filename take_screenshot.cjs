const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  // Set smartphone viewport (iPhone 12/13/14)
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  
  // 1. Capture Student Login Page
  console.log('Navigating to Student Login Page...');
  await page.goto('https://feat-yume-clearify.athlete-scout-sns.pages.dev/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500)); // wait for transitions
  
  const loginPath = path.join(__dirname, 'mobile-student-login.png');
  await page.screenshot({ path: loginPath });
  console.log(`Mobile Student Login screenshot saved to: ${loginPath}`);
  
  // 2. Capture Corporate LP Page
  console.log('Navigating to Corporate LP...');
  await page.goto('https://feat-yume-clearify.athlete-scout-sns.pages.dev/corporate-lp.html', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  
  const lpPath = path.join(__dirname, 'mobile-corporate-lp.png');
  await page.screenshot({ path: lpPath });
  console.log(`Mobile Corporate LP screenshot saved to: ${lpPath}`);
  
  await browser.close();
  console.log('Verification completed successfully!');
})();
