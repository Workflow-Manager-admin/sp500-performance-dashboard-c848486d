import React from "react";
import BarChart from "./BarChart";

// PUBLIC_INTERFACE
/**
 * Card for a single stock. Shows symbol, disposition, score bar, and details button.
 */
export default function StockCard({ stock, accent = "#8884d8", onDetails }) {
  const dispositionColor = {
    Buy: '#1a237e',
    Sell: '#e74c3c',
    Hold: '#374151'
  }[stock.disposition] || "#888";

  return (
    <div style={{
      border: "1px solid #eee",
      background: "#fff",
      borderRadius: 16,
      boxShadow: "0 2px 12px 0 rgba(60,60,110,0.07)",
      padding: 20,
      minWidth: 240,
      minHeight: 186,
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      justifyContent: "space-between",
      transition: "transform 0.18s cubic-bezier(.4,1.2,.3,0.9)",
      position: "relative"
    }}>
      <div>
        <div style={{
          fontWeight: 700, fontSize: 24, color: "#1a237e", marginBottom: 4, letterSpacing: '0.03em'
        }}>{stock.symbol}</div>
        <div style={{
          background: dispositionColor,
          color: "#fff",
          borderRadius: 6,
          padding: '3px 12px',
          fontWeight: 500,
          fontSize: 16,
          display: "inline-block",
          marginBottom: 8
        }}>{stock.disposition}</div>
        <BarChart score={stock.score} color={accent} height={18} />
      </div>
      <button
        style={{
          marginTop: 16,
          background: accent,
          color: "#fff",
          border: "none",
          borderRadius: 8,
          fontWeight: 600,
          fontSize: 15,
          padding: "10px 24px",
          letterSpacing: ".05em",
          cursor: "pointer",
          alignSelf: "center",
          transition: "background 0.15s"
        }}
        onClick={() => onDetails(stock)}
        aria-label={`View detailed metrics for ${stock.symbol}`}
      >Details</button>
    </div>
  );
}
