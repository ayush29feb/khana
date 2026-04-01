import { graphql, useLazyLoadQuery } from 'react-relay';
import MealCard from '../components/MealCard.js';
import type { MealsViewQuery } from './__generated__/MealsViewQuery.graphql.js';

const query = graphql`
  query MealsViewQuery($first: Int) {
    meals(first: $first) {
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

export default function MealsView() {
  const data = useLazyLoadQuery<MealsViewQuery>(query, { first: 30 });
  const meals = data.meals.edges;

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Meals</h2>
      {meals.length === 0 && <p>No meals logged yet.</p>}
      {meals.map(({ node }) => (
        <MealCard
          key={node.id}
          name={node.name}
          loggedAt={node.loggedAt}
          proteinG={node.proteinG}
          carbsG={node.carbsG}
          fatG={node.fatG}
          calories={node.calories ?? null}
          isEstimate={node.isEstimate}
          notes={node.notes ?? null}
          ingredients={node.ingredients}
        />
      ))}
    </div>
  );
}
