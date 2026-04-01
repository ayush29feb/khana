interface MacroBarProps {
  label: string;
  actual: number;
  target?: number | null;
  unit?: string;
}

export default function MacroBar({ label, actual, target, unit = 'g' }: MacroBarProps) {
  const pct = target ? Math.min(100, (actual / target) * 100) : null;
  const color = pct == null ? '#888' : pct >= 100 ? '#22c55e' : pct >= 70 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
        <span>{label}</span>
        <span>
          {actual.toFixed(1)}{unit}
          {target != null && ` / ${target.toFixed(0)}${unit}`}
        </span>
      </div>
      {pct != null && (
        <div style={{ height: 8, background: '#e5e7eb', borderRadius: 4, marginTop: 3 }}>
          <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.3s' }} />
        </div>
      )}
    </div>
  );
}
