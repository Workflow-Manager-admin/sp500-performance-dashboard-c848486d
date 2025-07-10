import React from "react";

// Minimalistic horizontal bar chart
// Props: scores: array of {name, score}, width, height, accent color
// Shows a single bar where filled% = value

// PUBLIC_INTERFACE
/**
 * Renders a simple horizontal bar for the score in [0,1].
 */
export default function BarChart({ score, color = "#8884d8", height = 14, label = undefined }) {
  return (
    <div style={{ width: "100%", height: height + 8, background: "#f0f0f4", borderRadius: 8, marginTop: 4, marginBottom: 4, border: "1px solid #e3e3ee" }}>
      <div style={{
        width: `${(score * 100).toFixed(1)}%`,
        height,
        background: color,
        borderRadius: 8,
        textAlign: "right",
        transition: 'width 0.7s cubic-bezier(.4,2,.2,1)'
      }}>
      </div>
      {label && (
        <span style={{ position: "absolute", fontWeight: 500, left: 8, fontSize: 12, color: "#1a237e" }}>
          {label}
        </span>
      )}
    </div>
  );
}
