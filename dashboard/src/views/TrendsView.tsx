import { graphql, useLazyLoadQuery } from 'react-relay';
import MacroBar from '../components/MacroBar.js';
import type { TrendsViewQuery } from './__generated__/TrendsViewQuery.graphql.js';

const query = graphql`
  query TrendsViewQuery {
    goals(first: 24) {
      edges {
        node {
          id
          name
          startDate
          endDate
          targets { protein carbs fat calories }
          progress { protein carbs fat calories }
        }
      }
    }
  }
`;

function hitStatus(actual: number, target: number | null | undefined): string {
  if (target == null) return '—';
  return actual >= target * 0.9 ? '✓' : '✗';
}

export default function TrendsView() {
  const data = useLazyLoadQuery<TrendsViewQuery>(query, {});
  const goals = data.goals.edges;

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Trends</h2>
      {goals.length === 0 && <p>No goals recorded yet.</p>}
      {goals.map(({ node: goal }) => (
        <div key={goal.id} style={{ marginBottom: 24, padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <strong>{goal.name}</strong>
            <span style={{ fontSize: 13, color: '#777' }}>{goal.startDate} → {goal.endDate}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            {goal.targets.protein != null && (
              <MacroBar label={`Protein ${hitStatus(goal.progress.protein, goal.targets.protein)}`} actual={goal.progress.protein} target={goal.targets.protein} />
            )}
            {goal.targets.calories != null && (
              <MacroBar label={`Calories ${hitStatus(goal.progress.calories, goal.targets.calories)}`} actual={goal.progress.calories} target={goal.targets.calories} unit=" kcal" />
            )}
            {goal.targets.carbs != null && (
              <MacroBar label={`Carbs ${hitStatus(goal.progress.carbs, goal.targets.carbs)}`} actual={goal.progress.carbs} target={goal.targets.carbs} />
            )}
            {goal.targets.fat != null && (
              <MacroBar label={`Fat ${hitStatus(goal.progress.fat, goal.targets.fat)}`} actual={goal.progress.fat} target={goal.targets.fat} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
