import { graphql, useLazyLoadQuery } from 'react-relay';
import { Suspense, useMemo } from 'react';
import MealCard from '../components/MealCard.js';
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
          ingredients {
            servingsUsed
            proteinContributed
            catalogItem { name brand }
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
  ingredients: readonly { servingsUsed: number; proteinContributed: number; catalogItem: { name: string; brand: string } }[];
};

function DaySection({ date, meals }: { date: string; meals: Meal[] }) {
  const totalProtein = meals.reduce((s, m) => s + m.proteinG, 0);
  const totalCarbs = meals.reduce((s, m) => s + m.carbsG, 0);
  const totalFat = meals.reduce((s, m) => s + m.fatG, 0);
  const totalCals = meals.reduce((s, m) => s + (m.calories ?? 0), 0);

  const label = new Date(date + 'T12:00:00').toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8, borderBottom: '1px solid #e5e7eb', paddingBottom: 4 }}>
        <strong style={{ fontSize: 14 }}>{label}</strong>
        <span style={{ fontSize: 12, color: '#777' }}>
          P: <strong>{totalProtein.toFixed(0)}g</strong>
          {' · '}C: {totalCarbs.toFixed(0)}g
          {' · '}F: {totalFat.toFixed(0)}g
          {totalCals > 0 && <> · {totalCals.toFixed(0)} kcal</>}
        </span>
      </div>
      {meals.map(meal => (
        <MealCard
          key={meal.id}
          name={meal.name}
          loggedAt={meal.loggedAt}
          proteinG={meal.proteinG}
          carbsG={meal.carbsG}
          fatG={meal.fatG}
          calories={meal.calories ?? null}
          isEstimate={meal.isEstimate}
          notes={meal.notes ?? null}
          ingredients={meal.ingredients}
        />
      ))}
    </div>
  );
}

function MealsContent({ dateFrom, dateTo }: { dateFrom: string; dateTo: string }) {
  const data = useLazyLoadQuery<MealsViewQuery>(query, { dateFrom, dateTo });
  const meals = data.meals.edges.map(e => e.node);

  const byDay = useMemo(() => {
    const map = new Map<string, Meal[]>();
    for (const meal of meals) {
      const day = new Date(meal.loggedAt).toLocaleDateString('en-CA');
      if (!map.has(day)) map.set(day, []);
      map.get(day)!.push(meal);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [meals]);

  return (
    <>
      {byDay.length === 0 && <p style={{ color: '#777' }}>No meals logged in this range.</p>}
      {byDay.map(([date, dayMeals]) => (
        <DaySection key={date} date={date} meals={dayMeals} />
      ))}
    </>
  );
}

export default function MealsView() {
  const { dateFrom, dateTo } = useDateRange();
  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Meals</h2>
      <Suspense fallback={<p style={{ color: '#aaa' }}>Loading…</p>}>
        <MealsContent key={`${dateFrom}|${dateTo}`} dateFrom={dateFrom} dateTo={dateTo} />
      </Suspense>
    </div>
  );
}
