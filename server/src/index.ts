import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import { createReadStream, existsSync, mkdirSync, createWriteStream } from 'node:fs';
import { extname, join, dirname } from 'node:path';
import { createYoga, createSchema } from 'graphql-yoga';
import { PrismaClient } from '@prisma/client';
import Busboy from 'busboy';
import { typeDefs } from './schema.js';
import { buildResolvers } from './resolvers/index.js';

const prisma = new PrismaClient();
const port = parseInt(process.env.PORT ?? '47321', 10);

// Derive images root as a sibling of the DB file
const dbPath = (process.env.DATABASE_URL ?? '').replace(/^file:/, '');
const imagesRoot = join(dirname(dbPath), 'images');

const MIME: Record<string, string> = {
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.webp': 'image/webp',
};

// POST /upload/meal/:id  or  /upload/catalog/:id
async function handleUpload(req: IncomingMessage, res: ServerResponse, prisma: PrismaClient): Promise<boolean> {
  const match = req.url?.match(/^\/upload\/(meal|catalog)\/(\d+)$/);
  if (!match || req.method !== 'POST') return false;

  const [, category, idStr] = match;
  const id = parseInt(idStr, 10);
  const subdir = category === 'meal' ? 'meals' : 'catalog';
  const destDir = join(imagesRoot, subdir);
  mkdirSync(destDir, { recursive: true });
  const destPath = join(destDir, `${id}.jpg`);
  const relPath = `${subdir}/${id}.jpg`;

  const bb = Busboy({ headers: req.headers as any });
  let saved = false;

  await new Promise<void>((resolve, reject) => {
    bb.on('file', (_field: string, stream: NodeJS.ReadableStream) => {
      saved = true;
      stream.pipe(createWriteStream(destPath)).on('finish', resolve).on('error', reject);
    });
    bb.on('error', reject);
    bb.on('close', () => { if (!saved) resolve(); });
    req.pipe(bb);
  });

  if (!saved) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'No file received' }));
    return true;
  }

  if (category === 'meal') {
    await prisma.$executeRawUnsafe(`UPDATE meals SET photo_path = '${relPath}' WHERE id = ${id}`);
  } else {
    await prisma.$executeRawUnsafe(`UPDATE food_catalog SET label_photo_path = '${relPath}' WHERE id = ${id}`);
  }

  res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify({ url: `/images/${relPath}` }));
  return true;
}

function serveImage(req: IncomingMessage, res: ServerResponse): boolean {
  if (!req.url?.startsWith('/images/')) return false;
  const relative = req.url.slice('/images/'.length);
  if (relative.includes('..')) {
    res.writeHead(400);
    res.end();
    return true;
  }
  const abs = join(imagesRoot, relative);
  if (!existsSync(abs)) {
    res.writeHead(404);
    res.end();
    return true;
  }
  const mime = MIME[extname(abs).toLowerCase()] ?? 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'public, max-age=86400' });
  createReadStream(abs).pipe(res);
  return true;
}

const yoga = createYoga({
  schema: createSchema({
    typeDefs,
    resolvers: buildResolvers(prisma) as any,
  }),
});

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS' && req.url?.startsWith('/upload/')) {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type' });
    res.end();
    return;
  }
  if (await handleUpload(req, res, prisma)) return;
  if (serveImage(req, res)) return;
  yoga(req, res);
});

server.listen(port, () => {
  console.log(`Food tracker GraphQL server running at http://localhost:${port}/graphql`);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  server.close();
});
