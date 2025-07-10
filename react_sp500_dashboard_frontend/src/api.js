const ALPHA_VANTAGE_API_KEY = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY || ''; // Place your key in an .env file
const BASE_URL = 'https://www.alphavantage.co/query';

// PUBLIC_INTERFACE
/**
 * Fetches quote data for a single symbol from Alpha Vantage.
 * @param {string} symbol - Stock symbol
 * @returns {Promise<Object>} - Stock quote data
 */
export async function fetchQuote(symbol) {
  const url = `${BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Network error fetching data');
  return await res.json();
}

// PUBLIC_INTERFACE
/**
 * Fetches batch quote data for a list of symbols.
 * AlphaVantage free tier is limited: we fetch sequentially (or use Multi-Symbol API if available).
 * Throttle/pause between requests to comply with API limits.
 * @param {string[]} symbols
 * @param {Function} progressCb - Callback(progress[0..1])
 * @returns {Promise<Object[]>}
 */
export async function fetchSP500Quotes(symbols, progressCb = null) {
  const results = [];
  for (let i = 0; i < symbols.length; ++i) {
    try {
      const quote = await fetchQuote(symbols[i]);
      results.push({ symbol: symbols[i], ...quote });
    } catch {
      results.push({ symbol: symbols[i], error: true });
    }
    if (progressCb) progressCb((i + 1) / symbols.length);
    // Alpha Vantage free: 5 requests/minute, 500/min for premium. Use 15s per query for free, or fetch few stocks for demo.
    await new Promise((r) => setTimeout(r, 15000));
  }
  return results;
}
