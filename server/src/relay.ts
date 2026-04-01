export function toGlobalId(type: string, id: number): string {
  return Buffer.from(`${type}:${id}`).toString('base64');
}

export function fromGlobalId(globalId: string): { type: string; id: number } {
  const decoded = Buffer.from(globalId, 'base64').toString('utf8');
  const colon = decoded.indexOf(':');
  return {
    type: decoded.slice(0, colon),
    id: parseInt(decoded.slice(colon + 1), 10),
  };
}

export interface Edge<T> {
  cursor: string;
  node: T;
}

export interface Connection<T> {
  edges: Edge<T>[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
  };
}

export function buildConnection<T extends { id: number }>(
  items: T[],
  type: string
): Connection<T> {
  const edges = items.map((item) => ({
    cursor: toGlobalId(type, item.id),
    node: item,
  }));
  return {
    edges,
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: edges[0]?.cursor ?? null,
      endCursor: edges[edges.length - 1]?.cursor ?? null,
    },
  };
}
