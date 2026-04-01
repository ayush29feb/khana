import { describe, it, expect, afterEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { createTestYoga, gql } from '../src/test-utils.js';

describe('goals', () => {
  let prisma: PrismaClient;

  afterEach(async () => {
    await prisma.$disconnect();
  });

  it('activeGoals returns a connection', async () => {
    prisma = new PrismaClient();
    const yoga = createTestYoga(prisma);
    const result = await gql(yoga, `{
      activeGoals {
        edges {
          node {
            id name startDate endDate
            targets { protein carbs fat calories }
            progress { protein carbs fat calories }
            pace { protein { expected actual status } }
            dailyBreakdown { date protein carbs fat calories }
            meals(first: 5) { edges { node { id name proteinG } } }
          }
        }
      }
    }`);
    expect(result.errors).toBeUndefined();
    expect(Array.isArray(result.data.activeGoals.edges)).toBe(true);
  });

  it('goals returns all goals', async () => {
    prisma = new PrismaClient();
    const yoga = createTestYoga(prisma);
    const result = await gql(yoga, `{
      goals(first: 10) {
        edges { node { id name startDate endDate targets { protein } } }
      }
    }`);
    expect(result.errors).toBeUndefined();
    expect(Array.isArray(result.data.goals.edges)).toBe(true);
  });

  it('goal returns null for nonexistent id', async () => {
    prisma = new PrismaClient();
    const yoga = createTestYoga(prisma);
    const fakeId = Buffer.from('Goal:99999').toString('base64');
    const result = await gql(yoga, `{ goal(id: "${fakeId}") { id name } }`);
    expect(result.errors).toBeUndefined();
    expect(result.data.goal).toBeNull();
  });
});
