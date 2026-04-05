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

function hitStatus(actual: number, target: number | null | undefined) {
  if (target == null) return null;
  return actual >= target * 0.9;
}

function formatDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function TrendsView() {
  const data = useLazyLoadQuery<TrendsViewQuery>(query, {});
  const goals = data.goals.edges;

  return (
    <div>
      <h2 className="page-title">Trends</h2>
      {goals.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 32, color: 'var(--text-2)' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📈</div>
          <p>No goals recorded yet.</p>
        </div>
      )}
      {goals.map(({ node: goal }) => {
        const hit = hitStatus(goal.progress.protein, goal.targets.protein);
        return (
          <div key={goal.id} className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 15 }}>{goal.name}</span>
                {hit != null && (
                  <span style={{
                    fontSize: 12, fontWeight: 600,
                    color: hit ? '#065f46' : '#991b1b',
                    background: hit ? 'var(--accent-bg)' : '#fee2e2',
                    padding: '1px 7px', borderRadius: 99,
                  }}>
                    {hit ? '✓ hit' : '✗ missed'}
                  </span>
                )}
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
                {formatDate(goal.startDate)} – {formatDate(goal.endDate)}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
              {goal.targets.protein != null && (
                <MacroBar label="Protein" actual={goal.progress.protein} target={goal.targets.protein} />
              )}
              {goal.targets.calories != null && (
                <MacroBar label="Calories" actual={goal.progress.calories} target={goal.targets.calories} unit=" kcal" />
              )}
              {goal.targets.carbs != null && (
                <MacroBar label="Carbs" actual={goal.progress.carbs} target={goal.targets.carbs} />
              )}
              {goal.targets.fat != null && (
                <MacroBar label="Fat" actual={goal.progress.fat} target={goal.targets.fat} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
