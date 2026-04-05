import { useState } from 'react';

interface Day {
  date: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
}

const MACROS = [
  { key: 'protein' as const, label: 'Protein', short: 'P', color: 'var(--accent)' },
  { key: 'carbs'   as const, label: 'Carbs',   short: 'C', color: 'var(--amber)' },
  { key: 'fat'     as const, label: 'Fat',     short: 'F', color: '#f97316' },
];

function shortDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' });
}

export default function DailyMacroChart({ days, barHeight = 100 }: { days: readonly Day[]; barHeight?: number }) {
  const [enabled, setEnabled] = useState({ protein: true, carbs: true, fat: true });

  function toggle(key: 'protein' | 'carbs' | 'fat') {
    setEnabled(e => ({ ...e, [key]: !e[key] }));
  }

  const BAR_H = barHeight;

  const totals = days.map(d =>
    (enabled.protein ? d.protein : 0) +
    (enabled.carbs   ? d.carbs   : 0) +
    (enabled.fat     ? d.fat     : 0)
  );
  const maxTotal = Math.max(...totals, 1);

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {MACROS.map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => toggle(key)}
            style={{
              fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
              border: `1.5px solid ${color}`,
              background: enabled[key] ? color : 'transparent',
              color: enabled[key] ? '#fff' : color,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, minWidth: days.length * 44, paddingBottom: 4 }}>
          {days.map((day, i) => {
            const total = totals[i];
            const barH = total > 0 ? Math.max(4, (total / maxTotal) * BAR_H) : 0;

            return (
              <div key={day.date} style={{ flex: '1 0 36px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {total > 0 && (
                  <div style={{ fontSize: 9, color: 'var(--text-3)', marginBottom: 2, fontVariantNumeric: 'tabular-nums' }}>
                    {total.toFixed(0)}
                  </div>
                )}
                <div style={{ width: '100%', height: BAR_H, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <div style={{
                    width: '100%', height: barH,
                    display: 'flex', flexDirection: 'column-reverse',
                    borderRadius: '3px 3px 0 0', overflow: 'hidden',
                  }}>
                    {enabled.protein && day.protein > 0 && (
                      <div style={{ flex: day.protein, background: 'var(--accent)', minHeight: 1 }} />
                    )}
                    {enabled.carbs && day.carbs > 0 && (
                      <div style={{ flex: day.carbs, background: 'var(--amber)', minHeight: 1 }} />
                    )}
                    {enabled.fat && day.fat > 0 && (
                      <div style={{ flex: day.fat, background: '#f97316', minHeight: 1 }} />
                    )}
                  </div>
                </div>
                <div style={{
                  fontSize: 9, color: 'var(--text-3)', marginTop: 5, textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}>
                  {shortDate(day.date)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        {MACROS.filter(m => enabled[m.key]).map(({ key, short, color }) => (
          <span key={key} style={{ fontSize: 10, color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: color, display: 'inline-block' }} />
            {short} (g)
          </span>
        ))}
      </div>
    </div>
  );
}
