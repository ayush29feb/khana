import { PrismaClient } from '@prisma/client';
import { buildConnection, toGlobalId } from '../relay.js';
import { catalogItemToGql } from './catalog.js';

type PantryRow = {
  catalog_id: bigint | number;
  name: string;
  brand: string;
  protein_per_serving: number;
  carbs_per_serving: number;
  fat_per_serving: number;
  health_notes: string | null;
  servings_remaining: number;
  protein_available: number;
};

export function pantryResolvers(prisma: PrismaClient) {
  return {
    Query: {
      async pantry() {
        const rows = await prisma.$queryRaw<PantryRow[]>`
          SELECT * FROM pantry ORDER BY name ASC
        `;
        const items = rows.map((row) => {
          const catalogId = Number(row.catalog_id);
          return {
            id: catalogId,
            catalogItem: catalogItemToGql({
              id: catalogId,
              name: row.name,
              brand: row.brand,
              serving_size_g: 0,
              protein_per_serving: row.protein_per_serving,
              carbs_per_serving: row.carbs_per_serving,
              fat_per_serving: row.fat_per_serving,
              calories_per_serving: null,
              health_notes: row.health_notes,
              label_photo_path: null,
            }),
            servingsRemaining: row.servings_remaining,
            proteinAvailable: row.protein_available,
          };
        });
        return buildConnection(items, 'PantryEntry');
      },

      async pantryProteinTotal() {
        const rows = await prisma.$queryRaw<{ total: number }[]>`
          SELECT COALESCE(SUM(protein_available), 0) as total FROM pantry
        `;
        return Number(rows[0]?.total ?? 0);
      },
    },

    PantryEntry: {
      id: (entry: { id: number }) => toGlobalId('PantryEntry', entry.id),
    },
  };
}
