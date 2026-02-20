import type { KnowledgeGraph } from "./knowledgeGraph";

export interface PathResult {
  path:     string[];  // [startSlug, ..., targetSlug]
  distance: number;   // Total Dijkstra cost
  hops:     number;
  summary:  string;   // Human-readable step-by-step
}

/**
 * Dijkstra shortest path from startSlug to targetSlug.
 * Edge cost = 1 - weight, so high-weight edges (prerequisites) are preferred.
 * Returns null if no path exists.
 */
export function findShortestPath(
  graph:      KnowledgeGraph,
  startSlug:  string,
  targetSlug: string
): PathResult | null {
  const dist:    Record<string, number>        = {};
  const prev:    Record<string, string | null> = {};
  const visited: Set<string>                   = new Set();

  for (const n of Object.keys(graph.nodes)) { dist[n] = Infinity; prev[n] = null; }
  dist[startSlug] = 0;

  // Simple priority queue via sorted array (sufficient for ~30 nodes)
  const pq: [number, string][] = [[0, startSlug]];

  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, u] = pq.shift()!;
    if (visited.has(u)) continue;
    visited.add(u);
    if (u === targetSlug) break;

    for (const edge of graph.adjacency[u] ?? []) {
      const cost = 1 - Math.max(0, edge.weight);
      const alt  = d + cost;
      if (alt < dist[edge.to]) {
        dist[edge.to] = alt;
        prev[edge.to] = u;
        pq.push([alt, edge.to]);
      }
    }
  }

  if (dist[targetSlug] === Infinity) return null;

  // Reconstruct path
  const path: string[] = [];
  let cur: string | null = targetSlug;
  while (cur) { path.unshift(cur); cur = prev[cur] ?? null; }

  const stepLabels = path.map((slug, i) => {
    if (i === 0) return `🟢 START: \`${slug}\` [${graph.nodes[slug]?.status}]`;
    const edge = graph.adjacency[path[i - 1]]?.find((e) => e.to === slug);
    return `  → ${edge?.type ?? "link"} \`${slug}\` [${graph.nodes[slug]?.status}]`;
  });

  return { path, distance: dist[targetSlug], hops: path.length - 1, summary: stepLabels.join("\n") };
}

/**
 * Find the shortest path from ANY installed skill to targetSlug.
 * Returns all viable paths sorted by hop count.
 */
export function findAllPaths(
  graph:      KnowledgeGraph,
  targetSlug: string
): PathResult[] {
  const starts = Object.values(graph.nodes)
    .filter((n) => ["installed", "evolved", "mastered"].includes(n.status))
    .map((n) => n.slug);

  return starts
    .map((s) => findShortestPath(graph, s, targetSlug))
    .filter((r): r is PathResult => r !== null)
    .sort((a, b) => a.hops - b.hops);
}
