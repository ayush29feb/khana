import { graphql, useLazyLoadQuery } from 'react-relay';
import type { CatalogViewQuery } from './__generated__/CatalogViewQuery.graphql.js';

const query = graphql`
  query CatalogViewQuery {
    catalog(first: 100) {
      edges {
        node {
          id
          name
          brand
          servingSizeG
          proteinPerServing
          carbsPerServing
          fatPerServing
          caloriesPerServing
          healthNotes
        }
      }
    }
  }
`;

export default function CatalogView() {
  const data = useLazyLoadQuery<CatalogViewQuery>(query, {});
  const items = data.catalog.edges;

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Food Catalog</h2>
      <p style={{ color: '#555', fontSize: 14 }}>{items.length} items</p>

      {items.length === 0 && (
        <p>No items. Use <code>food catalog add</code> to add items.</p>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
            <th style={{ padding: '6px 8px' }}>Name</th>
            <th style={{ padding: '6px 8px' }}>Brand</th>
            <th style={{ padding: '6px 8px', textAlign: 'right' }}>Serving</th>
            <th style={{ padding: '6px 8px', textAlign: 'right' }}>Protein</th>
            <th style={{ padding: '6px 8px', textAlign: 'right' }}>Carbs</th>
            <th style={{ padding: '6px 8px', textAlign: 'right' }}>Fat</th>
            <th style={{ padding: '6px 8px', textAlign: 'right' }}>Calories</th>
            <th style={{ padding: '6px 8px' }}>Notes</th>
          </tr>
        </thead>
        <tbody>
          {items.map(({ node }) => (
            <tr key={node.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '6px 8px' }}>{node.name}</td>
              <td style={{ padding: '6px 8px', color: '#777' }}>{node.brand}</td>
              <td style={{ padding: '6px 8px', textAlign: 'right' }}>{node.servingSizeG}g</td>
              <td style={{ padding: '6px 8px', textAlign: 'right' }}>{node.proteinPerServing}g</td>
              <td style={{ padding: '6px 8px', textAlign: 'right' }}>{node.carbsPerServing}g</td>
              <td style={{ padding: '6px 8px', textAlign: 'right' }}>{node.fatPerServing}g</td>
              <td style={{ padding: '6px 8px', textAlign: 'right' }}>{node.caloriesPerServing ?? '—'}</td>
              <td style={{ padding: '6px 8px', color: '#777', fontSize: 12 }}>{node.healthNotes ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
