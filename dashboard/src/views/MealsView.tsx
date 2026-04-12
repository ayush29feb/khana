import { graphql, useLazyLoadQuery } from 'react-relay';
import { Suspense, useMemo, useState } from 'react';
import MacroDonut from '../components/MacroDonut.js';
import { useDateRange } from '../DateRangeContext.js';
import type { MealsViewQuery } from './__generated__/MealsViewQuery.graphql.js';

const query = graphql`
  query MealsViewQuery($dateFrom: String, $dateTo: String) {
    meals(first: 200, dateFrom: $dateFrom, dateTo: $dateTo) {
      edges {
        node {
          id
          name
          loggedAt
          proteinG
          carbsG
          fatG
          calories
          isEstimate
          notes
          photoUrl
          ingredients {
            servingsUsed
            proteinContributed
            catalogItem { name brand carbsPerServing fatPerServing caloriesPerServing }
          }
        }
      }
    }
  }
`;

type Meal = {
  id: string;
  name: string;
  loggedAt: string;
  proteinG: number;
  carbsG: number;
  fatG: number;
  calories: number | null | undefined;
  isEstimate: boolean;
  notes: string | null | undefined;
  photoUrl: string | null | undefined;
  ingredients: readonly {
    servingsUsed: number;
    proteinContributed: number;
    catalogItem: { name: string; brand: string; carbsPerServing: number; fatPerServing: number; caloriesPerServing: number | null | undefined };
  }[];
};

function formatDayLabel(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}

function CompactMealRow({ meal }: { meal: Meal }) {
  const [expanded, setExpanded] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(meal.photoUrl ?? null);
  const time = new Date(meal.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const canExpand = true; // always expandable to show photo upload
  const showBottom = expanded && !photoUrl;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    const numericId = atob(meal.id).split(':')[1];
    const res = await fetch(`/upload/meal/${numericId}`, { method: 'POST', body: form });
    if (res.ok) {
      const { url } = await res.json();
      setPhotoUrl(url);
    }
    e.target.value = '';
  }

  return (
    <>
      <tr
        onClick={() => canExpand && setExpanded(e => !e)}
        style={{ cursor: canExpand ? 'pointer' : 'default', borderBottom: showBottom ? 'none' : '1px solid var(--border-light)' }}
      >
        <td style={{ padding: '6px 8px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>
              {meal.name}
            </span>
            {photoUrl && <span style={{ fontSize: 11, flexShrink: 0, lineHeight: 1 }}>📷</span>}
          </div>
          <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{time}{meal.isEstimate ? ' · est' : ''}</span>
        </td>
        <td style={{ textAlign: 'right', fontSize: 12, fontWeight: 700, color: 'var(--accent)', padding: '6px 4px', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{meal.proteinG.toFixed(0)}g</td>
        <td style={{ textAlign: 'right', fontSize: 12, color: 'var(--amber)',  padding: '6px 4px', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{meal.carbsG.toFixed(0)}g</td>
        <td style={{ textAlign: 'right', fontSize: 12, color: 'var(--orange)',       padding: '6px 4px', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{meal.fatG.toFixed(0)}g</td>
        <td style={{ textAlign: 'right', fontSize: 12, color: 'var(--text-3)', padding: '6px 8px', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{meal.calories ? meal.calories.toFixed(0) : '—'}</td>
      </tr>
      {expanded && meal.ingredients.map((ing, i) => {
        const carbs = (ing.catalogItem.carbsPerServing * ing.servingsUsed);
        const fat   = (ing.catalogItem.fatPerServing   * ing.servingsUsed);
        const cals  = ing.catalogItem.caloriesPerServing != null ? ing.catalogItem.caloriesPerServing * ing.servingsUsed : null;
        const isLast = i === meal.ingredients.length - 1;
        return (
          <tr key={i} style={{ background: 'var(--bg)', borderBottom: isLast && !meal.photoUrl ? '1px solid var(--border-light)' : 'none' }}>
            <td style={{ padding: '4px 8px 4px 18px', fontSize: 11, color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              ↳ {ing.catalogItem.name} ×{ing.servingsUsed.toFixed(1)}
            </td>
            <td style={{ textAlign: 'right', fontSize: 11, color: 'var(--accent)', padding: '4px 4px', fontVariantNumeric: 'tabular-nums' }}>{ing.proteinContributed.toFixed(0)}g</td>
            <td style={{ textAlign: 'right', fontSize: 11, color: 'var(--amber)',  padding: '4px 4px', fontVariantNumeric: 'tabular-nums' }}>{carbs.toFixed(0)}g</td>
            <td style={{ textAlign: 'right', fontSize: 11, color: 'var(--orange)',       padding: '4px 4px', fontVariantNumeric: 'tabular-nums' }}>{fat.toFixed(0)}g</td>
            <td style={{ textAlign: 'right', fontSize: 11, color: 'var(--text-3)', padding: '4px 8px', fontVariantNumeric: 'tabular-nums' }}>{cals != null ? cals.toFixed(0) : '—'}</td>
          </tr>
        );
      })}
      {expanded && (
        <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
          <td colSpan={5} style={{ padding: '6px 8px 10px' }}>
            {photoUrl && (
              <img
                src={photoUrl}
                style={{ width: '100%', maxHeight: 260, objectFit: 'cover', borderRadius: 6, display: 'block', marginBottom: 6 }}
              />
            )}
            <label style={{
              display: 'inline-flex', alignItems: 'center', gap: 5, cursor: 'pointer',
              fontSize: 11, color: 'var(--text-3)', padding: '4px 8px',
              border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)',
            }}>
              <span>📷</span>
              <span>{photoUrl ? 'Replace photo' : 'Add photo'}</span>
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
          </td>
        </tr>
      )}
    </>
  );
}

function DaySection({ date, meals }: { date: string; meals: Meal[] }) {
  const totalProtein = meals.reduce((s, m) => s + m.proteinG, 0);
  const totalCarbs   = meals.reduce((s, m) => s + m.carbsG, 0);
  const totalFat     = meals.reduce((s, m) => s + m.fatG, 0);
  const totalCals    = meals.reduce((s, m) => s + (m.calories ?? 0), 0);

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 6, padding: '2px 4px',
      }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.2px' }}>
          {formatDayLabel(date)}
        </span>
        <span style={{ fontSize: 12, color: 'var(--text-2)', display: 'flex', gap: 6, fontVariantNumeric: 'tabular-nums' }}>
          <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{totalProtein.toFixed(0)}P</span>
          <span style={{ color: 'var(--amber)' }}>{totalCarbs.toFixed(0)}C</span>
          <span style={{ color: 'var(--orange)' }}>{totalFat.toFixed(0)}F</span>
          {totalCals > 0 && <span style={{ color: 'var(--text-3)' }}>{totalCals.toFixed(0)}</span>}
        </span>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
          <colgroup>
            <col />
            <col style={{ width: '11%' }} />
            <col style={{ width: '11%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '14%' }} />
          </colgroup>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '5px 8px', textAlign: 'left',  fontSize: 10, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase' }}>Meal</th>
              <th style={{ padding: '5px 4px', textAlign: 'right', fontSize: 10, fontWeight: 600, color: 'var(--accent)',  textTransform: 'uppercase' }}>P</th>
              <th style={{ padding: '5px 4px', textAlign: 'right', fontSize: 10, fontWeight: 600, color: 'var(--amber)',   textTransform: 'uppercase' }}>C</th>
              <th style={{ padding: '5px 4px', textAlign: 'right', fontSize: 10, fontWeight: 600, color: 'var(--orange)',        textTransform: 'uppercase' }}>F</th>
              <th style={{ padding: '5px 8px', textAlign: 'right', fontSize: 10, fontWeight: 600, color: 'var(--text-3)',  textTransform: 'uppercase' }}>kcal</th>
            </tr>
          </thead>
          <tbody>
            {meals.map(meal => <CompactMealRow key={meal.id} meal={meal} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MealsContent({ dateFrom, dateTo }: { dateFrom: string; dateTo: string }) {
  const data = useLazyLoadQuery<MealsViewQuery>(query, { dateFrom, dateTo });
  const meals = data.meals.edges.map(e => e.node);

  const [search, setSearch] = useState('');

  const byDay = useMemo(() => {
    const q = search.toLowerCase();
    const filtered = q ? meals.filter(m => m.name.toLowerCase().includes(q)) : meals;
    const map = new Map<string, Meal[]>();
    for (const meal of filtered) {
      const day = new Date(meal.loggedAt).toLocaleDateString('en-CA');
      if (!map.has(day)) map.set(day, []);
      map.get(day)!.push(meal);
    }
    return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a));
  }, [meals, search]);

  const totals = useMemo(() => ({
    protein:  meals.reduce((s, m) => s + m.proteinG, 0),
    carbs:    meals.reduce((s, m) => s + m.carbsG, 0),
    fat:      meals.reduce((s, m) => s + m.fatG, 0),
    calories: meals.reduce((s, m) => s + (m.calories ?? 0), 0),
  }), [meals]);

  return (
    <>
      {/* Title + totals + donut inline */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h2 className="page-title" style={{ margin: 0 }}>Meals</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 12, display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{totals.protein.toFixed(0)}g P</span>
            <span style={{ color: 'var(--amber)' }}>{totals.carbs.toFixed(0)}g C</span>
            <span style={{ color: 'var(--orange)' }}>{totals.fat.toFixed(0)}g F</span>
            {totals.calories > 0 && <span style={{ color: 'var(--text-3)' }}>{totals.calories.toFixed(0)} kcal</span>}
          </div>
          <MacroDonut protein={totals.protein} carbs={totals.carbs} fat={totals.fat} size={36} />
        </div>
      </div>

      {/* Search */}
      <div className="card" style={{ marginBottom: 14, padding: '8px 12px' }}>
        <input
          type="search"
          placeholder="Search meals…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', border: 'none', outline: 'none', fontSize: 14, background: 'transparent', color: 'var(--text-1)' }}
        />
      </div>

      {byDay.length === 0
        ? <p style={{ color: 'var(--text-3)', marginTop: 16 }}>{search ? `No meals matching "${search}".` : 'No meals logged in this range.'}</p>
        : byDay.map(([date, dayMeals]) => (
            <DaySection key={date} date={date} meals={dayMeals} />
          ))
      }
    </>
  );
}

export default function MealsView() {
  const { dateFrom, dateTo } = useDateRange();
  return (
    <div>
      <Suspense fallback={<h2 className="page-title">Meals</h2>}>
        <MealsContent key={`${dateFrom}|${dateTo}`} dateFrom={dateFrom} dateTo={dateTo} />
      </Suspense>
    </div>
  );
}
