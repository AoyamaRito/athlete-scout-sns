import { chromium } from 'playwright';

(async () => {
  console.log('Launching browser to test copy-paste text key login flow...');
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
    await dialog.accept(); // Accept alert dialogs
  });

  // 1. Go to page
  console.log('Navigating to live Student Portal...');
  await page.goto('https://feat-yume-clearify.athlete-scout-sns.pages.dev/', { waitUntil: 'networkidle' });

  // 2. Click Register
  console.log('Clicking "新しく学生アカウントを作る"...');
  await page.click('text=新しく学生アカウントを作る');
  await page.waitForTimeout(2000);

  // 3. Extract generated text key from the register-key-text textarea
  console.log('Extracting the generated plain text recovery key...');
  const textKey = await page.$eval('#register-key-text', el => el.value);
  console.log(`Extracted key: "${textKey.slice(0, 20)}..."`);

  // 4. Reload page to go back to clean login state
  console.log('Reloading page to return to Login screen...');
  await page.goto('https://feat-yume-clearify.athlete-scout-sns.pages.dev/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 5. Fill the paste-key-input textarea with the extracted key
  console.log('Pasting the text key into login textarea...');
  await page.fill('#paste-key-input', textKey);
  await page.waitForTimeout(500);

  // 6. Click the login button
  console.log('Clicking "テキスト鍵でログイン"...');
  await page.click('text=テキスト鍵でログイン');

  // Wait for transition
  console.log('Waiting for authentication and rendering...');
  await page.waitForTimeout(3000);

  // 7. Verify transition
  const headingText = await page.$eval('.mypage-header h2', h2 => h2.innerText).catch(() => null);
  if (headingText) {
    console.log(`SUCCESS: Dynamic Text-Key Login works! Active tab title: "${headingText}"`);
  } else {
    console.log('FAILURE: Failed to log in with copy-pasted text key.');
  }

  await browser.close();
  console.log('Inspection completed.');
})();
