interface MacroBarProps {
  label: string;
  actual: number;
  target?: number | null;
  unit?: string;
}

export default function MacroBar({ label, actual, target, unit = 'g' }: MacroBarProps) {
  const pct = target ? Math.min(100, (actual / target) * 100) : null;
  const color = pct == null ? 'var(--text-3)'
    : pct >= 100 ? 'var(--accent)'
    : pct >= 70  ? 'var(--amber)'
    : 'var(--red)';
  const trackColor = pct == null ? 'var(--border)' : color + '22';

  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
        <span style={{ color: 'var(--text-2)', fontWeight: 500 }}>{label}</span>
        <span style={{ fontWeight: 600, color }}>
          {actual.toFixed(1)}{unit}
          {target != null && <span style={{ fontWeight: 400, color: 'var(--text-3)' }}> / {target.toFixed(0)}{unit}</span>}
        </span>
      </div>
      {pct != null && (
        <div style={{ height: 5, background: 'var(--border)', borderRadius: 99 }}>
          <div style={{
            width: `${pct}%`, height: '100%',
            background: color, borderRadius: 99,
            transition: 'width 0.4s ease',
          }} />
        </div>
      )}
    </div>
  );
}
