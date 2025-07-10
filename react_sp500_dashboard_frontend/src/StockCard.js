import React from "react";
import MiniBar from "./MiniBar";

/**
 * Card UI for each S&P 500 stock in the dashboard.
 * @param {object} stock - Stock data: { symbol, name, metrics, disposition, scoreBreakdown, loading }
 * @param {function} onShowDetail - Function to show more metrics
 */
function StockCard({ stock, onShowDetail, theme }) {
  if (stock.loading) {
    return (
      <div className="stock-card loading-card">
        <div className="loading-placeholder">Loading...</div>
      </div>
    );
  }
  if (stock.error) {
    return (
      <div className="stock-card error-card">
        <div className="symbol">{stock.symbol}</div>
        <div className="company">{stock.name}</div>
        <span className="error-msg">{stock.error}</span>
      </div>
    );
  }

  return (
    <div className={`stock-card ${stock.disposition.toLowerCase()}-card`}>
      <div className="symbol">{stock.symbol}</div>
      <div className="company">{stock.name}</div>
      <div className={`disposition-label disp-${stock.disposition.toLowerCase()}`}>
        {stock.disposition}
      </div>
      <div className="mini-bar-wrap">
        <MiniBar
          scores={stock.scoreBreakdown ? Object.values(stock.scoreBreakdown).map((info) => info.score) : []}
          theme={theme}
        />
      </div>
      <button
        className="btn btn-metrics"
        onClick={onShowDetail}
        aria-label={`Show metrics for ${stock.symbol}`}
      >
        Metrics
      </button>
    </div>
  );
}

export default StockCard;
