/**
 * Mini horizontal bar chart for visualization of stock's 10 parameter scores.
 * Green=pos, Gray=neutral, Red=neg
 */
function MiniBar({ scores, theme }) {
  // scores: array of ints
  const colors = {
    pos: "#22c55e",     // green
    neu: "#e2e8f0",     // light gray
    neg: "#ef4444",     // red
  };
  return (
    <div className="mini-bar">
      {scores.map((s, i) => (
        <span
          key={i}
          className="mini-bar-segment"
          style={{
            background: s > 0 ? colors.pos : s < 0 ? colors.neg : colors.neu,
            opacity: Math.abs(s) === 2 ? 1 : 0.7,
          }}
          title={`Score: ${s}`}
        />
      ))}
    </div>
  );
}
export default MiniBar;
