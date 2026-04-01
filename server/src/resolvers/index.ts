import { PrismaClient } from '@prisma/client';
import { pantryResolvers } from './pantry.js';
import { mealResolvers } from './meals.js';
import { goalResolvers } from './goals.js';
import { catalogResolvers } from './catalog.js';

export function buildResolvers(prisma: PrismaClient) {
  const pantry = pantryResolvers(prisma);
  const meals = mealResolvers(prisma);
  const goals = goalResolvers(prisma);
  const catalog = catalogResolvers(prisma);

  return {
    Query: {
      ...pantry.Query,
      ...meals.Query,
      ...goals.Query,
      ...catalog.Query,
      node: () => null,
    },
    PantryEntry: pantry.PantryEntry,
    Meal: meals.Meal,
    Goal: goals.Goal,
  };
}
