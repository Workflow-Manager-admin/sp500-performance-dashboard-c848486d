import React from "react";

// PUBLIC_INTERFACE
/**
 * Animated loading indicator for dashboard.
 */
export default function LoadingIndicator({progress}) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "320px"
    }}>
      <svg width="48" height="48" viewBox="0 0 44 44" stroke="#1a237e" style={{marginBottom: 12}}>
        <g fill="none" fillRule="evenodd" strokeWidth="5">
          <circle cx="22" cy="22" r="19" stroke="#e3e4fc" />
          <path d="M41 22c0-10.493-8.507-19-19-19" stroke="#1a237e">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 22 22"
              to="360 22 22"
              dur="0.9s"
              repeatCount="indefinite"
            />
          </path>
        </g>
      </svg>
      <div style={{
        color: "#1a237e",
        fontWeight: 600,
        fontSize: 18,
        marginBottom: 6
      }}>Loading Stock Data…</div>
      {progress !== undefined && <div style={{color:"#8884d8", marginTop:4,fontWeight:500}}>Progress: {(progress*100).toFixed(0)}%</div>}
      <div style={{ fontSize: 14, color: '#888', marginTop: 8 }}>
        This may take a minute due to API rate limiting.<br/>
        Tip: Try with a subset of stocks or upgrade API limits for faster load.
      </div>
    </div>
  )
}
