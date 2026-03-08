"use client";

export function AshokChakra({ size = 120, opacity = 0.88, style = {}, className = "" }) {
  const c = size / 2;
  const R = size * 0.455; // outer ring
  const r = size * 0.34;  // inner ring
  const h = size * 0.068; // hub
  const N = 24;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      className={className} style={{ opacity, ...style }}>
      <circle cx={c} cy={c} r={R} fill="none" stroke="#0047AB" strokeWidth={size * 0.018} />
      <circle cx={c} cy={c} r={r} fill="none" stroke="#0047AB" strokeWidth={size * 0.012} />
      <circle cx={c} cy={c} r={h} fill="#0047AB" />
      {Array.from({ length: N }).map((_, i) => {
        const a = (i * 360 / N) * Math.PI / 180;
        return (
          <line key={i}
            x1={c + h * Math.cos(a)} y1={c + h * Math.sin(a)}
            x2={c + r * Math.cos(a)} y2={c + r * Math.sin(a)}
            stroke="#0047AB"
            strokeWidth={size * (i % 2 === 0 ? 0.014 : 0.009)}
            opacity={i % 2 === 0 ? 1 : 0.5}
          />
        );
      })}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * 30) * Math.PI / 180;
        return <circle key={i} cx={c + (R - size * 0.02) * Math.cos(a)} cy={c + (R - size * 0.02) * Math.sin(a)} r={size * 0.022} fill="#0047AB" />;
      })}
    </svg>
  );
}

// Adding this ensures your import doesn't fail
export default AshokChakra;