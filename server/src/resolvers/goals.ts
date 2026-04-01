import { PrismaClient } from '@prisma/client';
import { buildConnection, fromGlobalId, toGlobalId } from '../relay.js';
import { mealToGql } from './meals.js';

type DBGoal = {
  id: number;
  name: string;
  start_date: Date;
  end_date: Date;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  calories: number | null;
};

function goalToGql(g: DBGoal) {
  return {
    ...g,
    startDate: g.start_date.toISOString().slice(0, 10),
    endDate: g.end_date.toISOString().slice(0, 10),
  };
}

async function getMealsInRange(prisma: PrismaClient, goal: DBGoal) {
  return prisma.meal.findMany({
    where: { logged_at: { gte: goal.start_date, lte: goal.end_date } },
  });
}

async function computeProgress(prisma: PrismaClient, goal: DBGoal) {
  const meals = await getMealsInRange(prisma, goal);
  return {
    protein: meals.reduce((s, m) => s + m.protein_g, 0),
    carbs: meals.reduce((s, m) => s + m.carbs_g, 0),
    fat: meals.reduce((s, m) => s + m.fat_g, 0),
    calories: meals.reduce((s, m) => s + (m.calories ?? 0), 0),
  };
}

function computePace(goal: DBGoal, progress: { protein: number; carbs: number; fat: number; calories: number }) {
  const now = new Date();
  const totalMs = goal.end_date.getTime() - goal.start_date.getTime() + 86400000;
  const elapsedMs = Math.min(totalMs, Math.max(0, now.getTime() - goal.start_date.getTime()));
  const fraction = elapsedMs / totalMs;

  function pace(target: number | null, actual: number) {
    if (target === null) return null;
    const expected = target * fraction;
    const status = actual >= target ? 'ahead' : actual >= expected ? 'on_track' : 'behind';
    return { expected, actual, status };
  }

  return {
    protein: pace(goal.protein_g, progress.protein),
    carbs: pace(goal.carbs_g, progress.carbs),
    fat: pace(goal.fat_g, progress.fat),
    calories: pace(goal.calories, progress.calories),
  };
}

async function computeDailyBreakdown(prisma: PrismaClient, goal: DBGoal) {
  const meals = await getMealsInRange(prisma, goal);
  const byDay: Record<string, { protein: number; carbs: number; fat: number; calories: number }> = {};
  for (const m of meals) {
    const day = m.logged_at.toISOString().slice(0, 10);
    if (!byDay[day]) byDay[day] = { protein: 0, carbs: 0, fat: 0, calories: 0 };
    byDay[day].protein += m.protein_g;
    byDay[day].carbs += m.carbs_g;
    byDay[day].fat += m.fat_g;
    byDay[day].calories += m.calories ?? 0;
  }
  return Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, macros]) => ({ date, ...macros }));
}

export function goalResolvers(prisma: PrismaClient) {
  return {
    Query: {
      async activeGoals() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const goals = await prisma.goal.findMany({
          where: { start_date: { lte: today }, end_date: { gte: today } },
          orderBy: { start_date: 'desc' },
        });
        return buildConnection(goals.map(goalToGql), 'Goal');
      },

      async goal(_: unknown, { id }: { id: string }) {
        const { id: numId } = fromGlobalId(id);
        const g = await prisma.goal.findUnique({ where: { id: numId } });
        return g ? goalToGql(g) : null;
      },

      async goals(_: unknown, args: { first?: number; last?: number }) {
        const take = args.first ?? args.last ?? 50;
        const goals = await prisma.goal.findMany({
          orderBy: { start_date: 'desc' },
          take,
        });
        return buildConnection(goals.map(goalToGql), 'Goal');
      },
    },

    Goal: {
      id: (g: { id: number }) => toGlobalId('Goal', g.id),
      targets: (g: DBGoal) => ({
        protein: g.protein_g,
        carbs: g.carbs_g,
        fat: g.fat_g,
        calories: g.calories,
      }),
      async progress(g: DBGoal) {
        return computeProgress(prisma, g);
      },
      async pace(g: DBGoal) {
        const progress = await computeProgress(prisma, g);
        return computePace(g, progress);
      },
      async dailyBreakdown(g: DBGoal) {
        return computeDailyBreakdown(prisma, g);
      },
      async meals(g: DBGoal, args: { first?: number }) {
        const take = args.first ?? 50;
        const meals = await prisma.meal.findMany({
          where: { logged_at: { gte: g.start_date, lte: g.end_date } },
          orderBy: { logged_at: 'desc' },
          take,
        });
        return buildConnection(meals.map(mealToGql), 'Meal');
      },
    },
  };
}
