import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function searchOtherPlatforms(title) {
  const query = title.split(' ').join('+');

  const results = [];

  // Flipkart
  try {
    const flipkartRes = await axios.get(`https://www.flipkart.com/search?q=${query}`);
    const $ = cheerio.load(flipkartRes.data);
    const item = $('._1AtVbE').first();
    const flipkartTitle = item.find('._4rR01T').text();
    const flipkartPrice = item.find('._30jeq3').text().replace(/[₹,]/g, '');
    const flipkartLink = 'https://www.flipkart.com' + item.find('a').attr('href');

    results.push({
      platform: 'Flipkart',
      title: flipkartTitle,
      price: flipkartPrice,
      url: flipkartLink,
    });
  } catch (err) {
    console.log('Flipkart scrape error:', err.message);
  }

  // Add similar blocks for Croma, Reliance Digital, Tata Cliq etc.

  return results;
}
