import { describe, it, expect, afterEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { createTestYoga, gql } from '../src/test-utils.js';

describe('meals', () => {
  let prisma: PrismaClient;

  afterEach(async () => {
    await prisma.$disconnect();
  });

  it('meals returns a connection', async () => {
    prisma = new PrismaClient();
    const yoga = createTestYoga(prisma);
    const result = await gql(yoga, `{
      meals(first: 5) {
        edges {
          cursor
          node {
            id name loggedAt proteinG carbsG fatG calories isEstimate notes
            ingredients { servingsUsed proteinContributed catalogItem { name brand } }
          }
        }
        pageInfo { hasNextPage }
      }
    }`);
    expect(result.errors).toBeUndefined();
    expect(Array.isArray(result.data.meals.edges)).toBe(true);
  });

  it('meals filtered by date returns only that day', async () => {
    prisma = new PrismaClient();
    const yoga = createTestYoga(prisma);
    const result = await gql(yoga, `{ meals(date: "2026-04-01") { edges { node { id loggedAt } } } }`);
    expect(result.errors).toBeUndefined();
    const edges = result.data.meals.edges as Array<{ node: { loggedAt: string } }>;
    for (const { node } of edges) {
      expect(node.loggedAt.startsWith('2026-04-01')).toBe(true);
    }
  });
});
