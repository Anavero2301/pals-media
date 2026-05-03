/**
 * Starter blueprint for compliant listing collection.
 * IMPORTANT: Respect robots.txt, site Terms of Service, and local law.
 */
const axios = require('axios');
const cheerio = require('cheerio');

const TARGET_REGIONS = ['valencia', 'alicante', 'almeria', 'almería'];
const MIN_PRICE = 250000;
const MAX_PRICE = 350000;

async function scrapePage(url) {
  const { data: html } = await axios.get(url, { timeout: 15000 });
  const $ = cheerio.load(html);
  const out = [];

  $('.listing-card').each((_, el) => {
    const title = $(el).find('.listing-title').text().trim();
    const region = $(el).find('.listing-location').text().trim();
    const priceRaw = $(el).find('.listing-price').text().replace(/[^\d]/g, '');
    const price = Number(priceRaw);
    const year = Number($(el).find('.listing-year').text().replace(/[^\d]/g, ''));
    const m2 = Number($(el).find('.listing-size').text().replace(/[^\d]/g, ''));
    const link = $(el).find('a').attr('href');
    const statusText = ($(el).text() || '').toLowerCase();

    const buildStatus = statusText.includes('under construction')
      ? 'in development'
      : statusText.includes('new build')
      ? 'newly built'
      : 'unknown';

    out.push({ title, region, price, year, m2, buildStatus, link });
  });

  return out.filter((x) => {
    const inRegion = TARGET_REGIONS.some((r) => (x.region || '').toLowerCase().includes(r));
    return inRegion && x.price >= MIN_PRICE && x.price <= MAX_PRICE;
  });
}

(async () => {
  // Replace with real URLs/APIs you are authorized to crawl.
  const urls = [
    'https://example.com/new-builds/valencia',
    'https://example.com/new-builds/alicante',
    'https://example.com/new-builds/almeria'
  ];

  const all = [];
  for (const url of urls) {
    try {
      const rows = await scrapePage(url);
      all.push(...rows);
    } catch (e) {
      console.error('Failed:', url, e.message);
    }
  }

  console.log(JSON.stringify(all, null, 2));
})();
