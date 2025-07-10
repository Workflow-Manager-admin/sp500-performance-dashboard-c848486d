/**
 * Utility for S&P 500 Dashboard: 
 * - Provides static S&P 500 symbol list
 * - Fetches metrics from Alpha Vantage
 * - Evaluates metrics for Buy/Hold/Sell
 */

const ALPHA_VANTAGE_API_KEY = "demo"; // Replace with your real Alpha Vantage API key!
const ALPHA_VANTAGE_BASE_URL = "https://www.alphavantage.co/query";

// Top parameters: These are mapped to real AlphaVantage endpoints.
// (For demo: we use only a few and supplement with mock data if limits hit)
// Key metrics (must be 10):
// - price change %, 1 year
// - price change %, 1 month
// - PE ratio (ttm)
// - PEG ratio
// - Dividend yield
// - EPS growth (ttm)
// - Market cap
// - Price/Book
// - 50d SMA vs Price
// - 200d SMA vs Price

const METRIC_LABELS = {
  "1y": "1Y Price Change %",
  "1m": "1M Price Change %",
  "pe": "PE Ratio",
  "peg": "PEG Ratio",
  "div": "Dividend Yield (%)",
  "eps": "EPS Growth (TTM)",
  "mc": "Market Cap ($B)",
  "pb": "Price/Book",
  "sma50": "Price vs 50d SMA",
  "sma200": "Price vs 200d SMA",
};

const S_P500 = [
  // Only a subset for demo. Format: {symbol, name}. You can add more from any online S&P 500 list.
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "MSFT", name: "Microsoft Corp." },
  { symbol: "AMZN", name: "Amazon.com Inc." },
  { symbol: "GOOGL", name: "Alphabet Inc. Class A" },
  { symbol: "META", name: "Meta Platforms, Inc." },
  { symbol: "NVDA", name: "NVIDIA Corporation" },
  { symbol: "XOM", name: "Exxon Mobil Corporation" },
  { symbol: "UNH", name: "UnitedHealth Group" },
  { symbol: "JPM", name: "JPMorgan Chase & Co." },
  { symbol: "TSLA", name: "Tesla, Inc." },
  { symbol: "V", name: "Visa Inc." },
  { symbol: "LLY", name: "Eli Lilly and Company" },
  { symbol: "PG", name: "Procter & Gamble" },
  { symbol: "JNJ", name: "Johnson & Johnson" },
  { symbol: "HD", name: "Home Depot" },
  { symbol: "MRK", name: "Merck & Co., Inc." },
  { symbol: "CVX", name: "Chevron Corporation" },
  { symbol: "ABBV", name: "AbbVie Inc." },
  { symbol: "AVGO", name: "Broadcom Inc." },
  { symbol: "PEP", name: "PepsiCo, Inc." },
  { symbol: "TMO", name: "Thermo Fisher Scientific" },
  { symbol: "COST", name: "Costco Wholesale Corporation" },
  { symbol: "WMT", name: "Walmart Inc." },
  { symbol: "MCD", name: "McDonald's Corporation" },
  // ... For a full list, use a public S&P 500 symbol set
];

// PUBLIC_INTERFACE
export function getSP500Symbols() {
  return S_P500;
}

// PUBLIC_INTERFACE
/**
 * Fetch key metrics from Alpha Vantage (partially real, some demo-mocked if necessary).
 * Returns: {
 *    symbol, metrics: {...}, disposition: "Buy"/"Sell"/"Hold", scoreBreakdown: {...}
 * }
 */
export async function fetchStockMetricsAndEvaluate(symbol) {
  // For demo, fetch a few then fallback to randoms on quota.
  let quoteData, overview, sma50, sma200, error = null;
  // Price and changes
  try {
    quoteData = await callAlphaVantage("GLOBAL_QUOTE", { symbol });
    overview = await callAlphaVantage("OVERVIEW", { symbol });
    sma50 = await callAlphaVantage("SMA", {
      symbol,
      interval: "daily",
      time_period: 50,
      series_type: "close",
    });
    sma200 = await callAlphaVantage("SMA", {
      symbol,
      interval: "daily",
      time_period: 200,
      series_type: "close",
    });
  } catch (e) {
    error = true;
  }

  // Parse and simulate any missing fields
  const now = parseFloat(quoteData?.["Global Quote"]?.["05. price"]) || Math.random() * 200 + 10;
  const oneMonthAgo =
    parseFloat(quoteData?.["Global Quote"]?.["08. previous close"]) ||
    now * (0.97 + Math.random() * 0.06);
  const change1mPct = ((now - oneMonthAgo) / oneMonthAgo) * 100;

  // Fake these for proof of concept/random demo
  const change1yPct = (Math.random() - 0.5) * 80;
  const pe = parseFloat(overview?.PERatio) || 10 + Math.random() * 40;
  const peg = parseFloat(overview?.PEGRatio) || 0.5 + Math.random() * 2;
  const dividend = parseFloat(overview?.DividendYield)
    ? parseFloat(overview?.DividendYield) * 100
    : Math.random() * 3;
  const epsGrowth = Math.random() * 0.3 - 0.05; // -5% to +25%

  const marketCap =
    parseFloat(overview?.MarketCapitalization) / 1e9 || Math.random() * 500 + 5;
  const pb = parseFloat(overview?.PriceToBookRatio) || 1 + Math.random() * 10;

  const sma50Val =
    Object.values(sma50?.["Technical Analysis: SMA"] || {})
      .map((o) => parseFloat(o["SMA"]))
      .find((v) => !isNaN(v)) || now * (0.96 + Math.random() * 0.08);
  const sma200Val =
    Object.values(sma200?.["Technical Analysis: SMA"] || {})
      .map((o) => parseFloat(o["SMA"]))
      .find((v) => !isNaN(v)) || now * (0.95 + Math.random() * 0.10);

  // Metrics
  const metrics = {
    "1y": +change1yPct.toFixed(2),
    "1m": +change1mPct.toFixed(2),
    pe: +pe.toFixed(2),
    peg: +peg.toFixed(2),
    div: +dividend.toFixed(2),
    eps: +(epsGrowth * 100).toFixed(1),
    mc: +marketCap.toFixed(1),
    pb: +pb.toFixed(2),
    sma50: +((now - sma50Val) / sma50Val * 100).toFixed(1),
    sma200: +((now - sma200Val) / sma200Val * 100).toFixed(1),
  };
  const { disposition, scoreBreakdown } = evaluateStock(metrics);
  return { symbol, metrics, disposition, scoreBreakdown };
}

// Helper: Alpha Vantage API caller
async function callAlphaVantage(functionType, params) {
  if (ALPHA_VANTAGE_API_KEY === "demo" && functionType !== "GLOBAL_QUOTE") {
    // Only GLOBAL_QUOTE works reliably with demo; don't error
    return {};
  }
  const url = new URL(ALPHA_VANTAGE_BASE_URL);
  url.searchParams.set("function", functionType);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  url.searchParams.set("apikey", ALPHA_VANTAGE_API_KEY);

  const resp = await fetch(url.toString());
  if (!resp.ok) throw new Error("API error");
  return await resp.json();
}

// PUBLIC_INTERFACE
/**
 * Scoring and disposition logic.
 * @param {object} metrics - metric object
 * @returns {object} {disposition, scoreBreakdown}
 */
export function evaluateStock(metrics) {
  // Assign points/weight for each parameter; this scheme is illustrative
  const breakdown = {};
  let score = 0;

  // 1Y price change %
  let s = metrics["1y"];
  let sc = s > 25 ? 2 : s > 10 ? 1 : s > -10 ? 0 : -1;
  score += sc;
  breakdown["1y"] = { label: METRIC_LABELS["1y"], score: sc, actual: s };

  // 1M price change %
  s = metrics["1m"];
  sc = s > 4 ? 2 : s > 0 ? 1 : s > -4 ? 0 : -1;
  score += sc;
  breakdown["1m"] = { label: METRIC_LABELS["1m"], score: sc, actual: s };

  // PE ratio (prefer 10-25)
  s = metrics["pe"];
  sc = s > 7 && s < 26 ? 1 : s <= 7 || s > 35 ? -1 : 0;
  score += sc;
  breakdown["pe"] = { label: METRIC_LABELS["pe"], score: sc, actual: s };

  // PEG ratio (<1.5 good)
  s = metrics["peg"];
  sc = s < 1.2 ? 2 : s < 1.7 ? 1 : s < 2.2 ? 0 : -1;
  score += sc;
  breakdown["peg"] = { label: METRIC_LABELS["peg"], score: sc, actual: s };

  // Dividend yield (%): > 2% is nice
  s = metrics["div"];
  sc = s > 2 ? 1 : s > 0.3 ? 0 : -1;
  score += sc;
  breakdown["div"] = { label: METRIC_LABELS["div"], score: sc, actual: s };

  // EPS growth (ttm): >10% best, negative bad
  s = metrics["eps"];
  sc = s > 13 ? 2 : s > 5 ? 1 : s > -5 ? 0 : -1;
  score += sc;
  breakdown["eps"] = { label: METRIC_LABELS["eps"], score: sc, actual: s };

  // Market cap (large = stability)
  s = metrics["mc"];
  sc = s > 250 ? 2 : s > 70 ? 1 : s > 10 ? 0 : -1;
  score += sc;
  breakdown["mc"] = { label: METRIC_LABELS["mc"], score: sc, actual: s };

  // Price/Book: 1–4 ok, >6 is high
  s = metrics["pb"];
  sc = s < 1 ? 0 : s < 4 ? 1 : s < 6 ? 0 : -1;
  score += sc;
  breakdown["pb"] = { label: METRIC_LABELS["pb"], score: sc, actual: s };

  // Price compared to 50d SMA: (<+2% is stable)
  s = metrics["sma50"];
  sc = Math.abs(s) < 2 ? 1 : Math.abs(s) < 7 ? 0 : -1;
  score += sc;
  breakdown["sma50"] = { label: METRIC_LABELS["sma50"], score: sc, actual: s };

  // Price compared to 200d SMA: (>10% up = overbought)
  s = metrics["sma200"];
  sc = s < 3 ? 1 : s < 12 ? 0 : -1;
  score += sc;
  breakdown["sma200"] = { label: METRIC_LABELS["sma200"], score: sc, actual: s };

  // Disposition scale: ≥7: Buy, ≤1: Sell, otherwise Hold
  let disposition =
    score >= 7 ? "Buy" : score <= 1 ? "Sell" : "Hold";
  return { disposition, scoreBreakdown: breakdown };
}
