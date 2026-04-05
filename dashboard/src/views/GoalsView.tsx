import { graphql, useLazyLoadQuery } from 'react-relay';
import MacroBar from '../components/MacroBar.js';
import MacroDonut from '../components/MacroDonut.js';
import DailyMacroChart from '../components/DailyMacroChart.js';
import { useDateRange } from '../DateRangeContext.js';
import type { GoalsViewQuery } from './__generated__/GoalsViewQuery.graphql.js';

const query = graphql`
  query GoalsViewQuery {
    goals(first: 100) {
      edges {
        node {
          id
          name
          startDate
          endDate
          targets { protein carbs fat calories }
          progress { protein carbs fat calories }
          pace { protein { expected actual status } calories { expected actual status } }
          dailyBreakdown { date protein carbs fat calories }
        }
      }
    }
  }
`;

function PaceChip({ status }: { status: string }) {
  return (
    <span className={`badge badge-${status}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

function formatDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function GoalsView() {
  const { dateFrom, dateTo } = useDateRange();
  const data = useLazyLoadQuery<GoalsViewQuery>(query, {});

  const goals = data.goals.edges.filter(({ node: g }) =>
    g.startDate <= dateTo && g.endDate >= dateFrom
  );

  if (goals.length === 0) {
    return (
      <div>
        <h2 className="page-title">Goals</h2>
        <div className="card" style={{ color: 'var(--text-2)', textAlign: 'center', padding: 32 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🎯</div>
          <p>No goals in this date range.</p>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>Use <code>food goal add</code> to create one.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="page-title">Goals</h2>
      {goals.map(({ node: goal }) => (
        <div key={goal.id} className="card" style={{ marginBottom: 10, padding: '10px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{goal.name}</span>
            {goal.pace.protein && <PaceChip status={goal.pace.protein.status} />}
            <span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 'auto' }}>
              {formatDate(goal.startDate)} – {formatDate(goal.endDate)}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <MacroDonut protein={goal.progress.protein} carbs={goal.progress.carbs} fat={goal.progress.fat} size={56} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <MacroBar label="Protein"  actual={goal.progress.protein}  target={goal.targets.protein} />
              <MacroBar label="Carbs"    actual={goal.progress.carbs}    target={goal.targets.carbs} />
              <MacroBar label="Fat"      actual={goal.progress.fat}      target={goal.targets.fat} />
              <MacroBar label="Calories" actual={goal.progress.calories} target={goal.targets.calories} unit=" kcal" />
            </div>
          </div>

          {goal.dailyBreakdown.length > 0 && (
            <details style={{ marginTop: 8 }}>
              <summary style={{ fontSize: 12, cursor: 'pointer', color: 'var(--text-3)', fontWeight: 500 }}>
                Daily breakdown
              </summary>
              <DailyMacroChart days={goal.dailyBreakdown} />
            </details>
          )}
        </div>
      ))}
    </div>
  );
}
