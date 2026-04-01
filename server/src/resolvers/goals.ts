import { PrismaClient } from '@prisma/client';
import { buildConnection, fromGlobalId, toGlobalId } from '../relay.js';
import { mealToGql } from './meals.js';

function parseDate(s: string): Date {
  return new Date(s.replace(' ', 'T').replace(/(\.\d{3})\d+/, '$1'));
}

// Raw queries return Date objects for date columns, strings for text columns
function toDateStr(d: string | Date): string {
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  return String(d).slice(0, 10);
}

type DBGoal = {
  id: number;
  name: string;
  start_date: string | Date;
  end_date: string | Date;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  calories: number | null;
};

type DBMealRaw = {
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

function goalToGql(g: DBGoal) {
  return {
    ...g,
    startDate: toDateStr(g.start_date),
    endDate: toDateStr(g.end_date),
  };
}

async function getMealsInRange(prisma: PrismaClient, goal: DBGoal): Promise<DBMealRaw[]> {
  const start = toDateStr(goal.start_date) + ' 00:00:00';
  const end = toDateStr(goal.end_date) + ' 23:59:59.999999';
  const cols = `id, name, substr(logged_at,1,23) as logged_at, protein_g, carbs_g, fat_g, calories, is_estimate, notes`;
  return prisma.$queryRawUnsafe<DBMealRaw[]>(
    `SELECT ${cols} FROM meals WHERE logged_at >= '${start}' AND logged_at <= '${end}' ORDER BY logged_at ASC`
  );
}

async function computeProgress(prisma: PrismaClient, goal: DBGoal) {
  const meals = await getMealsInRange(prisma, goal);
  return {
    protein: meals.reduce((s, m) => s + Number(m.protein_g), 0),
    carbs: meals.reduce((s, m) => s + Number(m.carbs_g), 0),
    fat: meals.reduce((s, m) => s + Number(m.fat_g), 0),
    calories: meals.reduce((s, m) => s + Number(m.calories ?? 0), 0),
  };
}

function computePace(goal: DBGoal, progress: { protein: number; carbs: number; fat: number; calories: number }) {
  const now = new Date();
  const startMs = goal.start_date instanceof Date ? goal.start_date.getTime() : parseDate(String(goal.start_date)).getTime();
  const endMs = goal.end_date instanceof Date ? goal.end_date.getTime() : parseDate(String(goal.end_date)).getTime();
  const totalMs = endMs - startMs + 86400000;
  const elapsedMs = Math.min(totalMs, Math.max(0, now.getTime() - startMs));
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
    const day = m.logged_at.slice(0, 10);
    if (!byDay[day]) byDay[day] = { protein: 0, carbs: 0, fat: 0, calories: 0 };
    byDay[day].protein += Number(m.protein_g);
    byDay[day].carbs += Number(m.carbs_g);
    byDay[day].fat += Number(m.fat_g);
    byDay[day].calories += Number(m.calories ?? 0);
  }
  return Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, macros]) => ({ date, ...macros }));
}

export function goalResolvers(prisma: PrismaClient) {
  return {
    Query: {
      async activeGoals() {
        const today = new Date().toISOString().slice(0, 10);
        const goals = await prisma.$queryRawUnsafe<DBGoal[]>(
          `SELECT * FROM goals WHERE start_date <= '${today}' AND end_date >= '${today}' ORDER BY start_date DESC`
        );
        return buildConnection(goals.map(goalToGql), 'Goal');
      },

      async goal(_: unknown, { id }: { id: string }) {
        const { id: numId } = fromGlobalId(id);
        const rows = await prisma.$queryRawUnsafe<DBGoal[]>(
          `SELECT * FROM goals WHERE id = ${numId}`
        );
        return rows[0] ? goalToGql(rows[0]) : null;
      },

      async goals(_: unknown, args: { first?: number; last?: number }) {
        const take = args.first ?? args.last ?? 50;
        const goals = await prisma.$queryRawUnsafe<DBGoal[]>(
          `SELECT * FROM goals ORDER BY start_date DESC LIMIT ${take}`
        );
        return buildConnection(goals.map(goalToGql), 'Goal');
      },
    },

    Goal: {
      id: (g: { id: number }) => toGlobalId('Goal', Number(g.id)),
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
        const start = toDateStr(g.start_date) + ' 00:00:00';
        const end = toDateStr(g.end_date) + ' 23:59:59.999999';
        const mcols = `id, name, substr(logged_at,1,23) as logged_at, protein_g, carbs_g, fat_g, calories, is_estimate, notes`;
        const meals = await prisma.$queryRawUnsafe<DBMealRaw[]>(
          `SELECT ${mcols} FROM meals WHERE logged_at >= '${start}' AND logged_at <= '${end}' ORDER BY logged_at DESC LIMIT ${take}`
        );
        return buildConnection(meals.map(mealToGql), 'Meal');
      },
    },
  };
}
