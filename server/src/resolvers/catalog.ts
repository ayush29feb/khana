import { toGlobalId } from '../relay.js';

type DBCatalog = {
  id: number;
  name: string;
  brand: string;
  serving_size_g: number;
  protein_per_serving: number;
  carbs_per_serving: number;
  fat_per_serving: number;
  calories_per_serving: number | null;
  health_notes: string | null;
};

export function catalogItemToGql(c: DBCatalog) {
  return {
    id: toGlobalId('FoodCatalogItem', c.id),
    name: c.name,
    brand: c.brand,
    servingSizeG: c.serving_size_g,
    proteinPerServing: c.protein_per_serving,
    carbsPerServing: c.carbs_per_serving,
    fatPerServing: c.fat_per_serving,
    caloriesPerServing: c.calories_per_serving,
    healthNotes: c.health_notes,
  };
}
