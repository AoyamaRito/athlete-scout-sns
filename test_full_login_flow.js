import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  console.log('Launching browser to test full registration & QR login flow...');
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Listen to console and page errors
  page.on('console', msg => {
    console.log(`PAGE LOG: [${msg.type()}] ${msg.text()}`);
  });
  page.on('pageerror', err => {
    console.log(`PAGE CRITICAL EXCEPTION: ${err.message}`);
  });
  page.on('dialog', async dialog => {
    console.log(`PAGE DIALOG ALERT: [${dialog.type()}] ${dialog.message()}`);
    await dialog.dismiss();
  });

  // 1. Go to page
  console.log('Navigating to live Student Portal...');
  await page.goto('https://2f74f44c.athlete-scout-sns.pages.dev/', { waitUntil: 'networkidle' });

  // 2. Click Register
  console.log('Clicking "新しく学生アカウントを作る"...');
  await page.click('text=新しく学生アカウントを作る');
  await page.waitForTimeout(2000);

  // 3. Extract QR Image Base64 Data URL
  console.log('Extracting generated QR image...');
  const qrImgSrc = await page.$eval('#qrcode img', img => img.src);
  console.log('QR Image Base64 extracted.');

  // 4. Download/Save QR Image using the actual page download action if possible, or save base64 directly
  // Wait, let's trigger the download button in the page to see if it downloads
  console.log('Clicking "鍵画像をダウンロード (PNG)"...');
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('text=鍵画像をダウンロード (PNG)')
  ]);
  const qrPath = path.join(__dirname, 'test-downloaded-key.png');
  await download.saveAs(qrPath);
  console.log(`Saved downloaded QR key to: ${qrPath}`);

  // 5. Reload to go back to clean logout state
  console.log('Reloading page to return to Login screen...');
  await page.goto('https://2f74f44c.athlete-scout-sns.pages.dev/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 6. Upload the downloaded QR PNG file to log in!
  console.log('Uploading the PNG file to QR input...');
  const fileInput = await page.$('#qr-input');
  await fileInput.setInputFiles(qrPath);

  // Wait for 3 seconds to see if it processes and transitions
  console.log('Waiting for authentication processing...');
  await page.waitForTimeout(3000);

  // 7. Verify if we have successfully transitioned to My Page (e.g. check if "プロフィール設定" header exists!)
  const headingText = await page.$eval('.mypage-header h2', h2 => h2.innerText).catch(() => null);
  if (headingText) {
    console.log(`SUCCESS: Transitioned to My Page! Active tab title: "${headingText}"`);
  } else {
    console.log('FAILURE: Still stuck on Login screen or crashed.');
  }

  // Clean up
  try {
    fs.unlinkSync(qrPath);
  } catch (e) {}

  await browser.close();
  console.log('Verification script completed.');
})();
