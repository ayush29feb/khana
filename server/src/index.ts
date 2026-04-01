import { createServer } from 'node:http';
import { createYoga, createSchema } from 'graphql-yoga';
import { PrismaClient } from '@prisma/client';
import { typeDefs } from './schema.js';
import { buildResolvers } from './resolvers/index.js';

const prisma = new PrismaClient();
const port = parseInt(process.env.PORT ?? '4000', 10);

const yoga = createYoga({
  schema: createSchema({
    typeDefs,
    resolvers: buildResolvers(prisma) as any,
  }),
});

const server = createServer(yoga);

server.listen(port, () => {
  console.log(`Food tracker GraphQL server running at http://localhost:${port}/graphql`);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  server.close();
});
