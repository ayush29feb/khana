interface MacroDonutProps {
  protein: number;
  carbs: number;
  fat: number;
  size?: number;
}

function arc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const toRad = (deg: number) => (deg - 90) * (Math.PI / 180);
  const x1 = cx + r * Math.cos(toRad(startAngle));
  const y1 = cy + r * Math.sin(toRad(startAngle));
  const x2 = cx + r * Math.cos(toRad(endAngle));
  const y2 = cy + r * Math.sin(toRad(endAngle));
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

export default function MacroDonut({ protein, carbs, fat, size = 80 }: MacroDonutProps) {
  const proteinCal = protein * 4;
  const carbsCal   = carbs * 4;
  const fatCal     = fat * 9;
  const total = proteinCal + carbsCal + fatCal;

  const cx = size / 2, cy = size / 2;
  const r = size * 0.38, stroke = size * 0.13;

  if (total === 0) {
    return (
      <svg width={size} height={size} style={{ flexShrink: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
      </svg>
    );
  }

  const segments = [
    { cal: proteinCal, color: 'var(--accent)' },
    { cal: carbsCal,   color: 'var(--amber)' },
    { cal: fatCal,     color: '#f97316' },
  ];

  let cursor = 0;
  const paths = segments.map(({ cal, color }) => {
    const sweep = (cal / total) * 360;
    const start = cursor;
    const end   = cursor + sweep;
    cursor = end;
    if (sweep < 1) return null;
    // full circle special case
    if (sweep >= 359.9) {
      return <circle key={color} cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={stroke} />;
    }
    return (
      <path
        key={color}
        d={arc(cx, cy, r, start, end)}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="butt"
      />
    );
  });

  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
      {paths}
    </svg>
  );
}
