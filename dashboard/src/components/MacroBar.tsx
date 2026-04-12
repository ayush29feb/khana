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

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
        <span style={{ color: 'var(--text-2)', fontWeight: 500 }}>{label}</span>
        <span style={{ fontWeight: 600, color, fontVariantNumeric: 'tabular-nums' }}>
          {actual.toFixed(1)}{unit}
          {target != null && (
            <span style={{ fontWeight: 400, color: 'var(--text-3)' }}> / {target.toFixed(0)}{unit}</span>
          )}
          {pct != null && (
            <span style={{ fontWeight: 400, color: 'var(--text-3)', marginLeft: 6 }}>
              {pct.toFixed(0)}%
            </span>
          )}
        </span>
      </div>
      {pct != null && (
        <div style={{
          height: 6, background: 'var(--card-3)',
          borderRadius: 99, overflow: 'hidden',
        }}>
          <div style={{
            width: `${pct}%`, height: '100%',
            background: color, borderRadius: 99,
            transition: 'width 0.5s cubic-bezier(0.22,1,0.36,1)',
          }} />
        </div>
      )}
    </div>
  );
}
