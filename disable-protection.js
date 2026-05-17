const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Opening Vercel dashboard...');
  await page.goto('https://vercel.com/dashboard');

  // Wait for user to login manually if needed
  console.log('Please login to Vercel if prompted. Press Enter in terminal when done...');

  // Wait for navigation to dashboard
  await page.waitForURL('**/dashboard**', { timeout: 120000 });

  console.log('Navigating to nexuserp project...');
  await page.goto('https://vercel.com/gensqq/nexuserp/settings');

  // Wait for settings page to load
  await page.waitForLoadState('networkidle');

  console.log('Looking for Deployment Protection settings...');

  // Try to find and click on Deployment Protection in sidebar
  const protectionLink = await page.locator('text=Deployment Protection').first();
  if (await protectionLink.isVisible()) {
    await protectionLink.click();
    await page.waitForLoadState('networkidle');
  }

  console.log('Please disable Vercel Authentication in the browser window.');
  console.log('After disabling, press Enter in terminal to close...');

  // Keep browser open for manual interaction
  await new Promise(resolve => {
    process.stdin.once('data', resolve);
  });

  await browser.close();
  console.log('Done!');
})();
