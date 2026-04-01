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
        const cols = `id, name, substr(logged_at,1,23) as logged_at, protein_g, carbs_g, fat_g, calories, is_estimate, notes`;
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
        const txns = await prisma.pantryTransaction.findMany({
          where: { meal_id: meal.id, reason: 'meal' },
          include: { catalog: true },
        });
        return txns.map((t) => ({
          catalogItem: catalogItemToGql(t.catalog),
          servingsUsed: Math.abs(t.delta),
          proteinContributed: Math.abs(t.delta) * t.catalog.protein_per_serving,
        }));
      },
    },
  };
}
