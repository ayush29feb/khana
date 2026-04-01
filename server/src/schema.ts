export const typeDefs = /* GraphQL */ `
  interface Node {
    id: ID!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  type FoodCatalogItem implements Node {
    id: ID!
    name: String!
    brand: String!
    servingSizeG: Float!
    proteinPerServing: Float!
    carbsPerServing: Float!
    fatPerServing: Float!
    caloriesPerServing: Float
    healthNotes: String
  }

  type PantryEntry implements Node {
    id: ID!
    catalogItem: FoodCatalogItem!
    servingsRemaining: Float!
    proteinAvailable: Float!
  }

  type PantryEntryEdge {
    cursor: String!
    node: PantryEntry!
  }

  type PantryEntryConnection {
    edges: [PantryEntryEdge!]!
    pageInfo: PageInfo!
  }

  type MealIngredient {
    catalogItem: FoodCatalogItem!
    servingsUsed: Float!
    proteinContributed: Float!
  }

  type Meal implements Node {
    id: ID!
    name: String!
    loggedAt: String!
    proteinG: Float!
    carbsG: Float!
    fatG: Float!
    calories: Float
    isEstimate: Boolean!
    notes: String
    ingredients: [MealIngredient!]!
  }

  type MealEdge {
    cursor: String!
    node: Meal!
  }

  type MealConnection {
    edges: [MealEdge!]!
    pageInfo: PageInfo!
  }

  type MacroTargets {
    protein: Float
    carbs: Float
    fat: Float
    calories: Float
  }

  type MacroProgress {
    protein: Float!
    carbs: Float!
    fat: Float!
    calories: Float!
  }

  type DailyMacros {
    date: String!
    protein: Float!
    carbs: Float!
    fat: Float!
    calories: Float!
  }

  type PaceInfo {
    expected: Float
    actual: Float
    status: String!
  }

  type GoalPace {
    protein: PaceInfo
    carbs: PaceInfo
    fat: PaceInfo
    calories: PaceInfo
  }

  type Goal implements Node {
    id: ID!
    name: String!
    startDate: String!
    endDate: String!
    targets: MacroTargets!
    progress: MacroProgress!
    pace: GoalPace!
    dailyBreakdown: [DailyMacros!]!
    meals(first: Int, after: String): MealConnection!
  }

  type GoalEdge {
    cursor: String!
    node: Goal!
  }

  type GoalConnection {
    edges: [GoalEdge!]!
    pageInfo: PageInfo!
  }

  type FoodCatalogItemEdge {
    cursor: String!
    node: FoodCatalogItem!
  }

  type FoodCatalogItemConnection {
    edges: [FoodCatalogItemEdge!]!
    pageInfo: PageInfo!
  }

  type Query {
    node(id: ID!): Node
    activeGoals: GoalConnection!
    goal(id: ID!): Goal
    goals(first: Int, last: Int, after: String, before: String): GoalConnection!
    pantry: PantryEntryConnection!
    pantryProteinTotal: Float!
    meals(first: Int, after: String, date: String, dateFrom: String, dateTo: String): MealConnection!
    catalog(first: Int, search: String): FoodCatalogItemConnection!
  }
`;
