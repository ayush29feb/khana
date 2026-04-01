import { graphql, useLazyLoadQuery } from 'react-relay';
import MacroBar from '../components/MacroBar.js';
import type { HomeViewQuery } from './__generated__/HomeViewQuery.graphql.js';

const query = graphql`
  query HomeViewQuery {
    activeGoals {
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
  const color = status === 'ahead' || status === 'on_track' ? '#22c55e' : '#ef4444';
  return (
    <span style={{ fontSize: 11, color, background: color + '20', padding: '1px 6px', borderRadius: 4, marginLeft: 8 }}>
      {status.replace('_', ' ')}
    </span>
  );
}

export default function HomeView() {
  const data = useLazyLoadQuery<HomeViewQuery>(query, {});
  const goals = data.activeGoals.edges;

  if (goals.length === 0) {
    return (
      <div>
        <h2 style={{ marginTop: 0 }}>Home</h2>
        <p>No active goals. Use <code>food goal add</code> to create one.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Home</h2>
      {goals.map(({ node: goal }) => (
        <div key={goal.id} style={{ marginBottom: 32, padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>
              {goal.name}
              {goal.pace.protein && <PaceChip status={goal.pace.protein.status} />}
            </h3>
            <span style={{ fontSize: 13, color: '#777' }}>{goal.startDate} → {goal.endDate}</span>
          </div>
          <MacroBar label="Protein" actual={goal.progress.protein} target={goal.targets.protein} />
          <MacroBar label="Carbs" actual={goal.progress.carbs} target={goal.targets.carbs} />
          <MacroBar label="Fat" actual={goal.progress.fat} target={goal.targets.fat} />
          <MacroBar label="Calories" actual={goal.progress.calories} target={goal.targets.calories} unit=" kcal" />
          {goal.dailyBreakdown.length > 0 && (
            <details style={{ marginTop: 12 }}>
              <summary style={{ fontSize: 13, cursor: 'pointer', color: '#555' }}>Daily breakdown</summary>
              <table style={{ marginTop: 8, fontSize: 12, width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                    <th style={{ padding: '4px 6px' }}>Date</th>
                    <th style={{ padding: '4px 6px', textAlign: 'right' }}>Protein</th>
                    <th style={{ padding: '4px 6px', textAlign: 'right' }}>Carbs</th>
                    <th style={{ padding: '4px 6px', textAlign: 'right' }}>Fat</th>
                    <th style={{ padding: '4px 6px', textAlign: 'right' }}>Calories</th>
                  </tr>
                </thead>
                <tbody>
                  {goal.dailyBreakdown.map((day) => (
                    <tr key={day.date} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '4px 6px' }}>{day.date}</td>
                      <td style={{ padding: '4px 6px', textAlign: 'right' }}>{day.protein.toFixed(1)}g</td>
                      <td style={{ padding: '4px 6px', textAlign: 'right' }}>{day.carbs.toFixed(1)}g</td>
                      <td style={{ padding: '4px 6px', textAlign: 'right' }}>{day.fat.toFixed(1)}g</td>
                      <td style={{ padding: '4px 6px', textAlign: 'right' }}>{day.calories.toFixed(0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          )}
        </div>
      ))}
    </div>
  );
}
