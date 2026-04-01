import { describe, it, expect, afterEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { createTestYoga, gql } from '../src/test-utils.js';

describe('pantry', () => {
  let prisma: PrismaClient;

  afterEach(async () => {
    await prisma.$disconnect();
  });

  it('pantry returns a connection', async () => {
    prisma = new PrismaClient();
    const yoga = createTestYoga(prisma);
    const result = await gql(yoga, `{
      pantry {
        edges { cursor node { id servingsRemaining catalogItem { name brand } } }
        pageInfo { hasNextPage hasPreviousPage startCursor endCursor }
      }
    }`);
    expect(result.errors).toBeUndefined();
    expect(Array.isArray(result.data.pantry.edges)).toBe(true);
  });

  it('pantryProteinTotal returns a non-negative number', async () => {
    prisma = new PrismaClient();
    const yoga = createTestYoga(prisma);
    const result = await gql(yoga, `{ pantryProteinTotal }`);
    expect(result.errors).toBeUndefined();
    expect(typeof result.data.pantryProteinTotal).toBe('number');
    expect(result.data.pantryProteinTotal as number).toBeGreaterThanOrEqual(0);
  });
});
