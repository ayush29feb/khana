import { PrismaClient } from '@prisma/client';
import { buildConnection, toGlobalId } from '../relay.js';
import { catalogItemToGql } from './catalog.js';

type DBMeal = {
  id: number;
  name: string;
  logged_at: Date;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  calories: number | null;
  is_estimate: boolean;
  notes: string | null;
};

export function mealToGql(meal: DBMeal) {
  return {
    id: meal.id,
    name: meal.name,
    loggedAt: meal.logged_at.toISOString(),
    proteinG: meal.protein_g,
    carbsG: meal.carbs_g,
    fatG: meal.fat_g,
    calories: meal.calories,
    isEstimate: meal.is_estimate,
    notes: meal.notes,
  };
}

export function mealResolvers(prisma: PrismaClient) {
  return {
    Query: {
      async meals(
        _: unknown,
        args: { first?: number; after?: string; date?: string }
      ) {
        const limit = args.first ?? 20;
        const where: Parameters<typeof prisma.meal.findMany>[0]['where'] = {};

        if (args.date) {
          const start = new Date(args.date + 'T00:00:00.000Z');
          const end = new Date(args.date + 'T23:59:59.999Z');
          where.logged_at = { gte: start, lte: end };
        }

        const meals = await prisma.meal.findMany({
          where,
          orderBy: { logged_at: 'desc' },
          take: limit,
        });

        return buildConnection(meals.map(mealToGql), 'Meal');
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
