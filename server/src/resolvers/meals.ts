import { PrismaClient } from '@prisma/client';
import { buildConnection, toGlobalId } from '../relay.js';
import { catalogItemToGql } from './catalog.js';

// SQLAlchemy stores datetimes as "2026-03-25 08:00:00.000000"
function parseDate(s: string): Date {
  return new Date(s.replace(' ', 'T').replace(/(\.\d{3})\d+/, '$1'));
}

type DBMeal = {
  id: number;
  name: string;
  logged_at: string;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  calories: number | null;
  is_estimate: number | boolean;
  notes: string | null;
  photo_path: string | null;
};

export function mealToGql(meal: DBMeal) {
  return {
    id: Number(meal.id),
    name: meal.name,
    loggedAt: parseDate(meal.logged_at).toISOString(),
    proteinG: Number(meal.protein_g),
    carbsG: Number(meal.carbs_g),
    fatG: Number(meal.fat_g),
    calories: meal.calories != null ? Number(meal.calories) : null,
    isEstimate: Boolean(meal.is_estimate),
    notes: meal.notes,
    photoUrl: meal.photo_path ? `/images/${meal.photo_path}` : null,
  };
}

export function mealResolvers(prisma: PrismaClient) {
  return {
    Query: {
      async meals(
        _: unknown,
        args: { first?: number; after?: string; date?: string; dateFrom?: string; dateTo?: string }
      ) {
        const limit = args.first ?? 200;
        const cols = `id, name, substr(logged_at,1,23) as logged_at, protein_g, carbs_g, fat_g, calories, is_estimate, notes, photo_path`;
        let sql: string;
        if (args.dateFrom && args.dateTo) {
          const start = args.dateFrom + ' 00:00:00';
          const end = args.dateTo + ' 23:59:59.999999';
          sql = `SELECT ${cols} FROM meals WHERE logged_at >= '${start}' AND logged_at <= '${end}' ORDER BY logged_at ASC LIMIT ${limit}`;
        } else if (args.date) {
          const start = args.date + ' 00:00:00';
          const end = args.date + ' 23:59:59.999999';
          sql = `SELECT ${cols} FROM meals WHERE logged_at >= '${start}' AND logged_at <= '${end}' ORDER BY logged_at ASC LIMIT ${limit}`;
        } else {
          sql = `SELECT ${cols} FROM meals ORDER BY logged_at DESC LIMIT ${limit}`;
        }
        const rows = await prisma.$queryRawUnsafe<DBMeal[]>(sql);
        return buildConnection(rows.map(mealToGql), 'Meal');
      },
    },

    Meal: {
      id: (meal: { id: number }) => toGlobalId('Meal', meal.id),

      async ingredients(meal: { id: number }) {
        type TxnRow = {
          id: number; catalog_id: number; delta: number;
          name: string; brand: string; serving_size_g: number;
          protein_per_serving: number; carbs_per_serving: number;
          fat_per_serving: number; calories_per_serving: number | null;
          health_notes: string | null;
        };
        const txns = await prisma.$queryRawUnsafe<TxnRow[]>(`
          SELECT pt.id, pt.catalog_id, pt.delta,
                 fc.name, fc.brand, fc.serving_size_g,
                 fc.protein_per_serving, fc.carbs_per_serving,
                 fc.fat_per_serving, fc.calories_per_serving, fc.health_notes
          FROM pantry_transactions pt
          JOIN food_catalog fc ON fc.id = pt.catalog_id
          WHERE pt.meal_id = ${meal.id} AND pt.reason = 'meal'
        `);
        return txns.map((t) => ({
          catalogItem: catalogItemToGql({
            id: t.catalog_id, name: t.name, brand: t.brand,
            serving_size_g: t.serving_size_g, protein_per_serving: t.protein_per_serving,
            carbs_per_serving: t.carbs_per_serving, fat_per_serving: t.fat_per_serving,
            calories_per_serving: t.calories_per_serving, health_notes: t.health_notes,
            label_photo_path: null,
          }),
          servingsUsed: Math.abs(Number(t.delta)),
          proteinContributed: Math.abs(Number(t.delta)) * Number(t.protein_per_serving),
        }));
      },
    },
  };
}
