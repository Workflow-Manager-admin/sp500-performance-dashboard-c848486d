import React, { useState, useEffect } from 'react';
import './App.css';
import { SP500_SYMBOLS } from './sp500';
import { fetchSP500Quotes } from './api';
import { evaluateStocks, METRICS_LIST } from './evaluate';
import StockCard from './StockCard';
import DetailsModal from './DetailsModal';
import LoadingIndicator from './LoadingIndicator';

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
        // fallback in error case
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
        margin: "0 auto", maxWidth: 1300, padding: "38px 18px 68px 18px"
      }}>
        {loading
          ? <LoadingIndicator progress={progress} />
          : (
            evaluatedStocks.length === 0
              ? <div style={{color: COLORS.primary, fontWeight: 600, fontSize: 22, textAlign: "center", marginTop: 24}}>No stock data available.</div>
              : <div>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gridGap: 24
                  }}>
                    {evaluatedStocks.map(stock => (
                      <StockCard
                        key={stock.symbol}
                        stock={stock}
                        accent={COLORS.accent}
                        onDetails={setSelectedStock}
                      />
                    ))}
                  </div>
                  <div style={{marginTop: 30, color: "#888", fontSize: 13, textAlign: "center"}}>
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
