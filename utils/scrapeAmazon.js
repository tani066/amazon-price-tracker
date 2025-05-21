const playwright = require('playwright');

async function scrapeAmazon(url) {
  const browser = await playwright.chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('#productTitle', { timeout: 10000 });

    const title = await page.$eval('#productTitle', el => el.textContent.trim());
    const image = await page.$eval('#landingImage', el => el.src);

    // Wait a moment to allow price to load (sometimes dynamic)
    await page.waitForTimeout(2000);

    const priceSelectors = [
      '#priceblock_ourprice',
      '#priceblock_dealprice',
      '#priceblock_saleprice',
      '#price_inside_buybox',
      'span.a-price > span.a-offscreen',
    ];

    let price = null;
    for (const selector of priceSelectors) {
      try {
        price = await page.$eval(selector, el => el.textContent.replace(/[^\d.]/g, ''));
        if (price) break;
      } catch {
        continue;
      }
    }

    // Fallback: try meta tag
    if (!price) {
      try {
        price = await page.$eval('meta[name="price"]', el => el.getAttribute('content'));
      } catch {}
    }

    if (!price) throw new Error('Price not found on Amazon product page.');

    await browser.close();

    return { title, price, image };
  } catch (error) {
    await browser.close();
    console.error('Error scraping Amazon:', error.message);
    throw error;
  }
}

module.exports = scrapeAmazon;
