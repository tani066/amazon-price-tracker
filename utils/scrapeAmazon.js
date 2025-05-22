const axios = require('axios');

async function scrapeAmazon(url) {
  try {
    const response = await axios.post(
      'https://chrome.browserless.io/content?token=' + process.env.BROWSERLESS_TOKEN,
      {
        code: `
          const puppeteer = require('puppeteer-core');

          (async () => {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto('${url}', { waitUntil: 'domcontentloaded', timeout: 30000 });
            await page.waitForSelector('#productTitle', { timeout: 10000 });

            const title = await page.$eval('#productTitle', el => el.textContent.trim());
            const image = await page.$eval('#landingImage', el => el.src);

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
                price = await page.$eval(selector, el => el.textContent.replace(/[^\\d.]/g, ''));
                if (price) break;
              } catch (e) {}
            }

            await browser.close();
            return { title, price, image };
          })();
        `,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (err) {
    console.error('Browserless scraping error:', err.message);
    throw new Error('Failed to scrape product from Amazon.');
  }
}

module.exports = scrapeAmazon;
