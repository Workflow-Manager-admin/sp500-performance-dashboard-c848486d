import React from "react";

// PUBLIC_INTERFACE
/**
 * Shows detailed metrics for a stock in a modal overlay.
 */
export default function DetailsModal({ stock, open, onClose, metricsList, colors }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(55,65,81,0.13)",
      backdropFilter: "blur(2px)",
      zIndex: 1499,
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 8px 48px 0 rgba(60,60,110,0.28)",
        width: "95vw", maxWidth: 490,
        padding: "32px 24px 12px 24px",
        position: "relative",
        minHeight: 260
      }}>
        <button style={{
          position: "absolute", right: 18, top: 14, background: "none",
          border: "none", fontSize: 26, color: "#374151", cursor: "pointer"
        }} onClick={onClose} aria-label="Close details">×</button>
        <h3 style={{ color: colors.primary, fontWeight: 700, marginBottom: 8, fontSize: 28, letterSpacing: ".01em" }}>
          {stock.symbol} Metrics
        </h3>
        <div style={{ marginBottom: 8, color: "#374151", fontWeight: 500 }}>
          Disposition: <span style={{
            fontWeight: 700, color: {
              Buy: colors.primary, Sell: "#e74c3c", Hold: colors.secondary
            }[stock.disposition]
          }}>{stock.disposition}</span>
        </div>
        <div>
          {metricsList.map(metric =>
            <div key={metric.key} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #f1f1f1" }}>
              <span style={{ color: "#444", fontWeight: 500 }}>{metric.name}</span>
              <span style={{
                color: "#8884d8", fontWeight: 700, fontFamily: "monospace", minWidth: 62, textAlign: "right"
              }}>
                {(typeof stock.metrics.find(m => m.key === metric.key)?.raw === "number" ||
                  !isNaN(stock.metrics.find(m => m.key === metric.key)?.raw)) ?
                  parseFloat(stock.metrics.find(m => m.key === metric.key)?.raw).toLocaleString(undefined, { maximumFractionDigits: 4 })
                  : "-"
                }
              </span>
            </div>)}
        </div>
      </div>
    </div>
  );
}
