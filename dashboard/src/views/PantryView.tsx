import { graphql, useLazyLoadQuery } from 'react-relay';
import type { PantryViewQuery } from './__generated__/PantryViewQuery.graphql.js';

const query = graphql`
  query PantryViewQuery {
    pantry {
      edges {
        node {
          id
          servingsRemaining
          proteinAvailable
          catalogItem {
            name
            brand
            healthNotes
          }
        }
      }
    }
    pantryProteinTotal
  }
`;

export default function PantryView() {
  const data = useLazyLoadQuery<PantryViewQuery>(query, {});
  const entries = data.pantry.edges;

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Pantry</h2>
      <p style={{ color: '#555', fontSize: 14 }}>
        Total protein available: <strong>{data.pantryProteinTotal.toFixed(1)}g</strong>
      </p>
      {entries.length === 0 && <p>No items in pantry.</p>}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
            <th style={{ padding: '6px 8px' }}>Item</th>
            <th style={{ padding: '6px 8px' }}>Brand</th>
            <th style={{ padding: '6px 8px', textAlign: 'right' }}>Servings</th>
            <th style={{ padding: '6px 8px', textAlign: 'right' }}>Protein avail.</th>
            <th style={{ padding: '6px 8px' }}>Notes</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(({ node }) => (
            <tr key={node.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '6px 8px' }}>{node.catalogItem.name}</td>
              <td style={{ padding: '6px 8px', color: '#777' }}>{node.catalogItem.brand}</td>
              <td style={{ padding: '6px 8px', textAlign: 'right' }}>{node.servingsRemaining.toFixed(1)}</td>
              <td style={{ padding: '6px 8px', textAlign: 'right' }}>{node.proteinAvailable.toFixed(1)}g</td>
              <td style={{ padding: '6px 8px', color: '#777', fontSize: 12 }}>{node.catalogItem.healthNotes ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
