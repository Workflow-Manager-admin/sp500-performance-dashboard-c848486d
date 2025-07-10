/**
 * EVALUATE STOCK
 * Computes a set of 10 performance scores and an aggregate, classifies disposition
 */
const METRICS_LIST = [
  { key: "PERatio",              name: "P/E Ratio",                  higherBetter: false },
  { key: "DividendYield",        name: "Dividend Yield",             higherBetter: true  },
  { key: "ProfitMargin",         name: "Profit Margin",              higherBetter: true  },
  { key: "ReturnOnEquityTTM",    name: "Return on Equity",           higherBetter: true  },
  { key: "EPS",                  name: "Earnings Per Share",         higherBetter: true  },
  { key: "MarketCapitalization", name: "Market Cap",                 higherBetter: true  },
  { key: "RevenueTTM",           name: "Revenue TTM",                higherBetter: true  },
  { key: "AnalystTargetPrice",   name: "Analyst Target Price",       higherBetter: true  },
  { key: "TrailingPE",           name: "Trailing P/E",               higherBetter: false },
  { key: "ForwardPE",            name: "Forward P/E",                higherBetter: false }
];

// Helper: Normalizes value in [min, max]
function normalize(val, min, max, higherBetter) {
  if (val === undefined || val === null || isNaN(val)) return 0.5;
  if (min === max) return 1.0;
  let frac = (parseFloat(val) - min) / (max - min);
  if (!higherBetter) frac = 1 - frac;
  return Math.max(0, Math.min(1, frac));
}

// PUBLIC_INTERFACE
/**
 * For all fetched stocks, computes raw/normalized values for metrics.
 * Returns a new array with: {symbol, disposition, score, metrics: [{key,name,raw,score}], ...}
 */
export function evaluateStocks(rawStocks) {
  const parsedStockData = rawStocks.map(s => {
    const out = {};
    METRICS_LIST.forEach(metric =>
      out[metric.key] = parseFloat(s[metric.key] || s[metric.key.toLowerCase()] || 0)
    );
    return { symbol: s.symbol, ...out, raw: s };
  });

  const metricExtremes = {};
  METRICS_LIST.forEach(metric => {
    let values = parsedStockData.map(s => s[metric.key]).filter(v => !isNaN(v));
    metricExtremes[metric.key] = {
      min: Math.min(...values),
      max: Math.max(...values)
    };
  });

  // Compute normalized score per metric and overall
  return parsedStockData.map(stock => {
    let perf = METRICS_LIST.map(metric => {
      const n = normalize(stock[metric.key], metricExtremes[metric.key].min, metricExtremes[metric.key].max, metric.higherBetter);
      return {
        key: metric.key,
        name: metric.name,
        raw: stock[metric.key],
        score: n
      };
    });
    const aggregate = perf.map(x => x.score).reduce((a, b) => a + b, 0) / METRICS_LIST.length;

    // Disposition logic
    let disposition;
    if (aggregate > 0.7) disposition = "Buy";
    else if (aggregate < 0.35) disposition = "Sell";
    else disposition = "Hold";
    return {
      symbol: stock.symbol,
      disposition,
      score: aggregate,
      metrics: perf,
      raw: stock.raw
    };
  });
}

export { METRICS_LIST };
