import { PrismaClient } from '@prisma/client';
import { buildConnection, toGlobalId } from '../relay.js';

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
  category: string | null;
  label_photo_path: string | null;
};

export function catalogResolvers(prisma: PrismaClient) {
  return {
    Query: {
      async catalog(_: unknown, args: { first?: number; search?: string }) {
        const take = args.first ?? 100;
        let items;
        if (args.search) {
          const s = `%${args.search}%`;
          items = await prisma.$queryRawUnsafe<any[]>(
            `SELECT * FROM food_catalog WHERE name LIKE '${s}' OR brand LIKE '${s}' ORDER BY name ASC LIMIT ${take}`
          );
        } else {
          items = await prisma.foodCatalog.findMany({
            orderBy: { name: 'asc' },
            take,
          });
        }
        const mapped = items.map((c: any) => ({ ...catalogItemToGql(c), _raw: c, _numericId: Number(c.id) }));
        return buildConnection(mapped.map(m => ({ ...m, id: m._numericId })), 'FoodCatalogItem');
      },
    },
  };
}

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
    labelPhotoUrl: c.label_photo_path ? `/images/${c.label_photo_path}` : null,
    category: c.category,
  };
}
