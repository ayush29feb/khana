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
}

export default function MealCard({
  name, loggedAt, proteinG, carbsG, fatG, calories, isEstimate, notes, ingredients,
}: MealCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const date = new Date(loggedAt);

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <strong>{name}</strong>
            {isEstimate && <span style={{ fontSize: 11, color: '#f59e0b', background: '#fef9c3', padding: '1px 5px', borderRadius: 4 }}>est</span>}
            {notes && (
              <span
                title={notes}
                onClick={() => setShowNotes(v => !v)}
                style={{
                  fontSize: 11, fontWeight: 'bold', color: showNotes ? '#fff' : '#6b7280',
                  background: showNotes ? '#6b7280' : '#f3f4f6',
                  borderRadius: '50%', width: 16, height: 16,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', userSelect: 'none', flexShrink: 0,
                }}
              >
                i
              </span>
            )}
          </span>
          <div style={{ fontSize: 12, color: '#777', marginTop: 2 }}>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          {showNotes && notes && (
            <div style={{ fontSize: 12, color: '#555', marginTop: 4, fontStyle: 'italic' }}>{notes}</div>
          )}
        </div>
        <div style={{ textAlign: 'right', fontSize: 13 }}>
          <div>P: <strong>{proteinG.toFixed(1)}g</strong></div>
          <div>C: {carbsG.toFixed(1)}g · F: {fatG.toFixed(1)}g</div>
          {calories != null && <div style={{ color: '#777' }}>{calories.toFixed(0)} kcal</div>}
        </div>
      </div>
      {ingredients.length > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{ marginTop: 8, fontSize: 12, background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: 0 }}
        >
          {expanded ? '▾ Hide ingredients' : '▸ Show ingredients'}
        </button>
      )}
      {expanded && (
        <ul style={{ marginTop: 6, paddingLeft: 16, fontSize: 13 }}>
          {ingredients.map((ing, i) => (
            <li key={i}>
              {ing.catalogItem.name} × {ing.servingsUsed.toFixed(1)} serving — {ing.proteinContributed.toFixed(1)}g protein
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
