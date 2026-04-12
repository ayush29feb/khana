import { useState } from 'react';

interface Ingredient {
  servingsUsed: number;
  proteinContributed: number;
  catalogItem: { name: string; brand: string };
}

interface MealCardProps {
  name: string;
  loggedAt: string;
  proteinG: number;
  carbsG: number;
  fatG: number;
  calories: number | null;
  isEstimate: boolean;
  notes: string | null;
  ingredients: readonly Ingredient[];
  compact?: boolean;
}

export default function MealCard({
  name, loggedAt, proteinG, carbsG, fatG, calories, isEstimate, notes, ingredients, compact = false,
}: MealCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const time = new Date(loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (compact) {
    return (
      <div style={{ borderBottom: '1px solid var(--border-light)' }}>
        <div
          onClick={() => ingredients.length > 0 && setExpanded(e => !e)}
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '7px 0', gap: 8,
            cursor: ingredients.length > 0 ? 'pointer' : 'default',
          }}
        >
          <div style={{ minWidth: 0, flex: 1, display: 'flex', alignItems: 'center', gap: 5 }}>
            {ingredients.length > 0 && (
              <span style={{ fontSize: 9, color: 'var(--text-3)', flexShrink: 0 }}>
                {expanded ? '▾' : '▸'}
              </span>
            )}
            <span style={{ fontWeight: 500, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
            {isEstimate && <span className="badge badge-est" style={{ flexShrink: 0 }}>est</span>}
            <span style={{ fontSize: 11, color: 'var(--text-3)', flexShrink: 0 }}>{time}</span>
          </div>
          <div style={{ fontSize: 12, flexShrink: 0, display: 'flex', gap: 6, fontVariantNumeric: 'tabular-nums' }}>
            <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{proteinG.toFixed(0)}P</span>
            <span style={{ color: 'var(--amber)' }}>{carbsG.toFixed(0)}C</span>
            <span style={{ color: 'var(--orange)' }}>{fatG.toFixed(0)}F</span>
            {calories != null && <span style={{ color: 'var(--text-3)' }}>{calories.toFixed(0)}</span>}
          </div>
        </div>
        {expanded && ingredients.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, marginBottom: 6 }}>
            <thead>
              <tr style={{ color: 'var(--text-3)' }}>
                <th style={{ textAlign: 'left', fontWeight: 600, padding: '2px 0', paddingLeft: 14 }}>Ingredient</th>
                <th style={{ textAlign: 'right', fontWeight: 600, padding: '2px 4px' }}>Srv</th>
                <th style={{ textAlign: 'right', fontWeight: 600, padding: '2px 4px' }}>P</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((ing, i) => (
                <tr key={i} style={{ color: 'var(--text-2)' }}>
                  <td style={{ padding: '2px 0', paddingLeft: 14 }}>{ing.catalogItem.name}</td>
                  <td style={{ textAlign: 'right', padding: '2px 4px', fontVariantNumeric: 'tabular-nums' }}>{ing.servingsUsed.toFixed(1)}</td>
                  <td style={{ textAlign: 'right', padding: '2px 4px', color: 'var(--accent)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{ing.proteinContributed.toFixed(1)}g</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }

  return (
    <div className="card" style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>

        {/* Left: name + meta */}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>{name}</span>
            {isEstimate && <span className="badge badge-est">est</span>}
            {notes && (
              <button
                className={`info-btn${showNotes ? ' active' : ''}`}
                onClick={() => setShowNotes(v => !v)}
                title={notes}
              >i</button>
            )}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{time}</div>
          {showNotes && notes && (
            <div style={{
              fontSize: 13, color: 'var(--text-2)', marginTop: 6,
              padding: '6px 10px', background: 'var(--bg)',
              borderRadius: 'var(--radius-sm)', fontStyle: 'italic',
            }}>{notes}</div>
          )}
        </div>

        {/* Right: macros */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent)' }}>{proteinG.toFixed(1)}g P</div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>
            {carbsG.toFixed(0)}C · {fatG.toFixed(0)}F
          </div>
          {calories != null && (
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{calories.toFixed(0)} kcal</div>
          )}
        </div>
      </div>

      {ingredients.length > 0 && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              marginTop: 10, fontSize: 12, fontWeight: 500,
              background: 'none', border: 'none',
              color: 'var(--accent)', cursor: 'pointer', padding: 0,
            }}
          >
            {expanded ? '▾ Hide ingredients' : '▸ Show ingredients'}
          </button>
          {expanded && (
            <ul style={{ marginTop: 8, paddingLeft: 16, fontSize: 13, color: 'var(--text-2)', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {ingredients.map((ing, i) => (
                <li key={i}>
                  <span style={{ fontWeight: 500 }}>{ing.catalogItem.name}</span>
                  {' × '}{ing.servingsUsed.toFixed(1)} srv
                  <span style={{ color: 'var(--text-3)' }}> — {ing.proteinContributed.toFixed(1)}g P</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
