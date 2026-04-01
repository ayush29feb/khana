import { PrismaClient } from '@prisma/client';
import { pantryResolvers } from './pantry.js';

export function buildResolvers(prisma: PrismaClient) {
  const pantry = pantryResolvers(prisma);
  return {
    Query: {
      ...pantry.Query,
      node: () => null,
      goal: () => null,
      activeGoals: () => ({ edges: [], pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: null, endCursor: null } }),
      goals: () => ({ edges: [], pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: null, endCursor: null } }),
      meals: () => ({ edges: [], pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: null, endCursor: null } }),
    },
    PantryEntry: pantry.PantryEntry,
  };
}
