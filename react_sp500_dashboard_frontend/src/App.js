import React, { useState, useEffect } from 'react';
import './App.css';
import { SP500_SYMBOLS } from './sp500';
import { fetchSP500Quotes } from './api';
import { evaluateStocks, METRICS_LIST } from './evaluate';
import StockCard from './StockCard'; // No longer used after removing grid
import DetailsModal from './DetailsModal';
import LoadingIndicator from './LoadingIndicator';
import BarChart from './BarChart';

// Color palette for theme
const COLORS = {
  primary: '#1a237e',
  secondary: '#374151',
  accent: '#8884d8'
};

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');
  const [stocksRaw, setStocksRaw] = useState([]);
  const [evaluatedStocks, setEvaluatedStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [selectedStock, setSelectedStock] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Fetch and evaluate stocks on mount
  useEffect(() => {
    async function loadStocks() {
      setLoading(true);
      setProgress(0);
      try {
        // Use a smaller subset for demo if needed or can enable full set
        const symbols = SP500_SYMBOLS.slice(0, 8); // Demo: Only first 8
        const stocks = await fetchSP500Quotes(symbols, setProgress);
        setStocksRaw(stocks);
        setEvaluatedStocks(evaluateStocks(stocks));
      } catch (e) {
        setStocksRaw([]);
        setEvaluatedStocks([]);
      }
      setLoading(false);
    }
    loadStocks();
  }, []);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // Helper: Show short metric value, or "-"
  const showValue = v =>
    typeof v === "number" && !isNaN(v)
      ? parseFloat(v).toLocaleString(undefined, { maximumFractionDigits: 4 })
      : (v && !isNaN(Number(v)) ? Number(v).toLocaleString(undefined, { maximumFractionDigits: 4 }) : "-");

  // Helper: For "Last Updated" column, try fields like "LatestQuarter" or fallback to "-".
  const showLastUpdated = (stock) => {
    // Alpha Vantage "OVERVIEW" includes "LatestQuarter" e.g. "2024-03-31" or "2023-12-31"
    // If not available, fallback to fetchedAt (not present), so fallback to "-"
    if (stock && stock.raw && stock.raw.LatestQuarter)
      return stock.raw.LatestQuarter;
    // Optionally show "updated" timestamp if backend/app provides one in future
    return "-";
  };

  return (
    <div className="App" style={{ minHeight: '100vh', background: "#f9faff" }}>
      <header className="App-header" style={{
        minHeight: 110,
        background: "#fff",
        boxShadow: "0 1px 8px 0 rgba(60,60,110,0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        position: "sticky",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 40
      }}>
        <div style={{ fontWeight: 700, fontSize: "2rem", color: COLORS.primary, letterSpacing: ".03em" }}>
          S&P 500 Dashboard
        </div>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </header>
      <main style={{
        margin: "0 auto", maxWidth: 1300, padding: "38px 2vw 68px 2vw"
      }}>
        {loading
          ? <LoadingIndicator progress={progress} />
          : (
            evaluatedStocks.length === 0
              ? <div style={{
                  color: COLORS.primary,
                  fontWeight: 600,
                  fontSize: 22,
                  textAlign: "center",
                  marginTop: 24
                }}>No stock data available.</div>
              :
              <div>
                <div className="dashboard-table-container" style={{
                  background: "#fff",
                  borderRadius: 18,
                  boxShadow: "0 1.5px 12px 0 rgba(60,60,110,0.06)",
                  padding: "18px 0 8px 0",
                  overflowX: "auto",
                  border: "1px solid #e3e3ee",
                  marginBottom: 8
                }}>
                  <table className="dashboard-table" style={{
                    width: "100%",
                    borderCollapse: "separate",
                    borderSpacing: 0,
                    minWidth: 1400
                  }}>
                    <thead>
                      <tr>
                        <th style={{
                          textAlign: "left", color: COLORS.primary, fontWeight: 800,
                          padding: "7px 18px", fontSize: 17, letterSpacing: ".01em", background: "transparent", border: 0
                        }}>Symbol</th>
                        {METRICS_LIST.map(metric => (
                          <th key={metric.key} style={{
                            textAlign: "left",
                            fontWeight: 700,
                            color: COLORS.secondary,
                            fontSize: 15,
                            padding: "7px 9px",
                            background: "transparent",
                            border: 0,
                            whiteSpace: "nowrap"
                          }}>{metric.name}</th>
                        ))}
                        <th style={{
                          textAlign: "left",
                          fontWeight: 700,
                          color: COLORS.secondary,
                          fontSize: 15,
                          padding: "7px 9px",
                          background: "transparent",
                          border: 0
                        }}>Score</th>
                        <th style={{
                          textAlign: "left",
                          fontWeight: 700,
                          color: COLORS.secondary,
                          fontSize: 15,
                          padding: "7px 9px",
                          background: "transparent",
                          border: 0
                        }}>Disposition</th>
                        <th style={{
                          textAlign: "left",
                          fontWeight: 700,
                          color: COLORS.secondary,
                          fontSize: 15,
                          padding: "7px 9px",
                          background: "transparent",
                          border: 0
                        }}>Last Updated</th>
                        <th style={{ padding: 0, background: 'transparent', border: 0 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {evaluatedStocks.map(stock => (
                        <tr key={stock.symbol}
                          style={{
                            background: "#fcfcff",
                            borderBottom: "1px solid #f1f2fe",
                            transition: "background 0.18s",
                            borderRadius: 14
                          }}
                          onClick={() => setSelectedStock(stock)}
                        >
                          <td style={{
                            fontWeight: 700, color: COLORS.primary, fontSize: 17,
                            padding: "8px 18px 8px 18px", cursor: "pointer"
                          }}>
                            {stock.symbol}
                          </td>
                          {METRICS_LIST.map(metric => (
                            <td key={metric.key} style={{
                              fontFamily: "monospace",
                              color: COLORS.accent,
                              fontWeight: 600,
                              fontSize: 15,
                              padding: "8px 9px"
                            }}>
                              {showValue(stock.metrics.find(m => m.key === metric.key)?.raw)}
                            </td>
                          ))}
                          <td style={{
                            minWidth: 120,
                            padding: "8px 10px 8px 9px"
                          }}>
                            <BarChart score={stock.score} color={COLORS.accent} height={18} />
                          </td>
                          <td style={{
                            minWidth: 88,
                            padding: "8px 10px",
                            fontWeight: 700,
                            fontSize: 16,
                            color: ({
                              Buy: COLORS.primary,
                              Sell: "#e74c3c",
                              Hold: COLORS.secondary
                            })[stock.disposition] || "#888"
                          }}>
                            {stock.disposition}
                          </td>
                          <td style={{
                            minWidth: 104,
                            padding: "8px 10px",
                            fontWeight: 600,
                            fontSize: 15,
                            color: COLORS.secondary
                          }}>
                            {showLastUpdated(stock)}
                          </td>
                          <td style={{ minWidth: 75, padding: "6px 8px" }}>
                            <button
                              className="btn-accent"
                              style={{
                                background: COLORS.accent,
                                color: "#fff",
                                border: "none",
                                borderRadius: 8,
                                fontWeight: 600,
                                fontSize: 15,
                                padding: "7px 18px",
                                letterSpacing: ".03em",
                                cursor: "pointer",
                                transition: "background 0.15s"
                              }}
                              onClick={e => {
                                e.stopPropagation();
                                setSelectedStock(stock);
                              }}
                              aria-label={`View details for ${stock.symbol}`}
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{
                  marginTop: 17,
                  color: "#888",
                  fontSize: 13,
                  textAlign: "center"
                }}>
                  Data powered by Alpha Vantage. For best experience, provide your Alpha Vantage API key in <code>.env</code>.
                </div>
              </div>
          )
        }
        <DetailsModal
          open={!!selectedStock}
          stock={selectedStock}
          onClose={() => setSelectedStock(null)}
          metricsList={METRICS_LIST}
          colors={COLORS}
        />
      </main>
    </div>
  );
}

export default App;
