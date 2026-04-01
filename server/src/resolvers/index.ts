import { PrismaClient } from '@prisma/client';
import { pantryResolvers } from './pantry.js';
import { mealResolvers } from './meals.js';
import { goalResolvers } from './goals.js';

export function buildResolvers(prisma: PrismaClient) {
  const pantry = pantryResolvers(prisma);
  const meals = mealResolvers(prisma);
  const goals = goalResolvers(prisma);

  return {
    Query: {
      ...pantry.Query,
      ...meals.Query,
      ...goals.Query,
      node: () => null,
    },
    PantryEntry: pantry.PantryEntry,
    Meal: meals.Meal,
    Goal: goals.Goal,
  };
}
