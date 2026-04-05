import { useState } from 'react';
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

function InfoIcon({ note }: { note: string }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <span
        onClick={() => setShow(v => !v)}
        title={note}
        style={{
          fontSize: 11, fontWeight: 'bold', cursor: 'pointer', userSelect: 'none',
          color: show ? '#fff' : '#6b7280', background: show ? '#6b7280' : '#f3f4f6',
          borderRadius: '50%', width: 16, height: 16,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        i
      </span>
      {show && (
        <span style={{
          position: 'absolute', left: 20, top: -4, zIndex: 10,
          background: '#1f2937', color: '#fff', fontSize: 12,
          padding: '4px 8px', borderRadius: 6, whiteSpace: 'nowrap', maxWidth: 280,
          whiteSpace: 'normal', lineHeight: 1.4,
        }}>
          {note}
        </span>
      )}
    </span>
  );
}

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
          </tr>
        </thead>
        <tbody>
          {entries.map(({ node }) => (
            <tr key={node.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '6px 8px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {node.catalogItem.name}
                  {node.catalogItem.healthNotes && <InfoIcon note={node.catalogItem.healthNotes} />}
                </span>
              </td>
              <td style={{ padding: '6px 8px', color: '#777' }}>{node.catalogItem.brand}</td>
              <td style={{ padding: '6px 8px', textAlign: 'right' }}>{node.servingsRemaining.toFixed(1)}</td>
              <td style={{ padding: '6px 8px', textAlign: 'right' }}>{node.proteinAvailable.toFixed(1)}g</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
