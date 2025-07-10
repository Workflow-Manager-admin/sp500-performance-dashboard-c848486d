import React, { useEffect, useState } from "react";
import "./App.css";
import StockCard from "./StockCard";
import LoadingSpinner from "./LoadingSpinner";
import { getSP500Symbols, fetchStockMetricsAndEvaluate } from "./stockUtils";

// Constants for color palette and dashboard
const GRID_COLUMNS = 4;

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState("light");
  const [loading, setLoading] = useState(true);
  const [stockStates, setStockStates] = useState([]); // Array of { symbol, name, metrics, disposition, scoreBreakdown, loading }
  const [showDetail, setShowDetail] = useState(false);
  const [detailStock, setDetailStock] = useState(null);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Fetch and evaluate stocks
  useEffect(() => {
    let mounted = true;
    async function loadStocks() {
      setLoading(true);
      // Get S&P 500 tickers
      const symbols = getSP500Symbols();
      // For demo/speed, let's fetch just the first 24.
      // To use all: for production, remove .slice(0, 24)
      const subset = symbols.slice(0, 24);

      // Initialize placeholder states with loading
      if (mounted) {
        setStockStates(
          subset.map((s) => ({
            symbol: s.symbol,
            name: s.name,
            loading: true,
          }))
        );
      }

      // Fetch all in parallel, update each as it completes
      await Promise.all(
        subset.map(async (stock, idx) => {
          try {
            const result = await fetchStockMetricsAndEvaluate(stock.symbol);
            if (!mounted) return;
            setStockStates((prev) => {
              const next = [...prev];
              next[idx] = {
                ...result,
                name: stock.name,
                loading: false,
              };
              return next;
            });
          } catch (e) {
            if (!mounted) return;
            setStockStates((prev) => {
              const next = [...prev];
              next[idx] = {
                symbol: stock.symbol,
                name: stock.name,
                error: "API error",
                loading: false,
              };
              return next;
            });
          }
        })
      );
      if (mounted) setLoading(false);
    }
    loadStocks();
    return () => {
      mounted = false;
    };
  }, []);

  // PUBLIC_INTERFACE
  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  // Details modal for metrics
  const openDetail = (stock) => {
    setDetailStock(stock);
    setShowDetail(true);
  };

  const closeDetail = () => setShowDetail(false);

  return (
    <div className="App">
      <header className="sp500-header">
        <span className="brand-title">S&amp;P 500 Dashboard</span>
        <span className="subtitle">Live stock dispositions: Buy / Hold / Sell</span>
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle light/dark mode">
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
      </header>
      {loading && (
        <div className="loading-container">
          <LoadingSpinner />
        </div>
      )}
      <main>
        <div className="dashboard-grid">
          {stockStates.map((stock) => (
            <StockCard
              key={stock.symbol}
              stock={stock}
              onShowDetail={() => openDetail(stock)}
              theme={theme}
            />
          ))}
        </div>
      </main>
      {showDetail && detailStock && (
        <div className="modal-overlay" onClick={closeDetail}>
          <div className="modal-panel" onClick={e => e.stopPropagation()}>
            <h2>
              {detailStock.symbol} - {detailStock.name}
              <button className="close-btn" onClick={closeDetail} title="Close">&times;</button>
            </h2>
            <div>
              <b>Disposition:</b> {detailStock.disposition}
            </div>
            <div className="metrics-list">
              <h4>Detail Metrics:</h4>
              {detailStock.scoreBreakdown ? (
                <table>
                  <thead>
                    <tr>
                      <th>Parameter</th>
                      <th>Score</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(detailStock.scoreBreakdown).map(
                      ([metric, info]) => (
                        <tr key={metric}>
                          <td>{info.label}</td>
                          <td>{info.score}</td>
                          <td>{info.actual !== undefined ? info.actual : "-"}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              ) : (
                <div>Metrics unavailable.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
