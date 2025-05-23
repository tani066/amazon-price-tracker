const axios = require('axios');

async function scrapeAmazon(url) {
  try {
    const response = await axios.post(
      `https://chrome.browserless.io/content?token=${process.env.BROWSERLESS_TOKEN}`,
      {
        url,
        elements: [
          { selector: '#productTitle', type: 'text' },
          { selector: '#landingImage, #imgTagWrapperId img', type: 'src' },
          {
            selector: [
              '#priceblock_ourprice',
              '#priceblock_dealprice',
              '#priceblock_saleprice',
              '#price_inside_buybox',
              'span.a-price > span.a-offscreen',
            ],
            type: 'text',
          },
        ],
        options: {
          waitForSelector: '#productTitle',
          waitTimeout: 15000,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data = response.data?.data || [];

    const title = data[0]?.result || 'No title';
    const image = data[1]?.result || '';
    const priceRaw = data[2]?.result || '';

    const price = parseFloat(priceRaw.replace(/[^\d.]/g, ''));
    if (!price) throw new Error('Price not found or invalid');

    return { title, image, price };
  } catch (err) {
    console.error('Browserless scraping error:', err.response?.data || err.message);
    throw new Error('Failed to scrape product from Amazon.');
  }
}

module.exports = scrapeAmazon;
