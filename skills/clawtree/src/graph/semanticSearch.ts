import type { KnowledgeGraph, GraphNode } from "./knowledgeGraph";

/**
 * Semantic search over the KnowledgeGraph.
 *
 * Uses @xenova/transformers (Xenova/all-MiniLM-L6-v2, 23 MB) for 100% offline
 * sentence embeddings, combined with a keyword boost for a hybrid score:
 *   hybridScore = semanticScore * 0.7 + keywordScore * 0.3
 *
 * Embeddings are computed lazily per session and cached on the GraphNode object.
 * They are NOT persisted to disk (recalculated on each boot in < 2 s for 30 nodes).
 */

const MODEL = "Xenova/all-MiniLM-L6-v2";

let extractor: any = null;

async function getExtractor(): Promise<any> {
  if (!extractor) {
    // Dynamic import so the module is optional at compile time
    const { pipeline } = await import("@xenova/transformers" as any);
    console.log("[SEMANTIC] ⏳ Loading MiniLM-L6-v2 (23 MB, offline)...");
    extractor = await pipeline("feature-extraction", MODEL, { dtype: "fp32" });
    console.log("[SEMANTIC] ✓ Model ready");
  }
  return extractor;
}

/** Embed a text string → float32 vector. */
export async function embed(text: string): Promise<number[]> {
  const pipe   = await getExtractor();
  const output = await pipe([text], { pooling: "mean", normalize: true });
  return Array.from(output.data as Float32Array);
}

/** Cosine similarity in [0, 1] range. */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot  += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return (dot / (Math.sqrt(magA) * Math.sqrt(magB)) + 1) / 2;
}

/** Embed all un-embedded nodes in the graph (lazy). */
export async function embedGraph(graph: KnowledgeGraph): Promise<void> {
  const pending = Object.values(graph.nodes).filter((n) => !n.embedding);
  if (!pending.length) return;

  console.log(`[SEMANTIC] ⏳ Embedding ${pending.length} nodes...`);
  for (const node of pending) {
    const text    = `${node.name} ${node.description} ${node.tags.join(" ")}`;
    node.embedding = await embed(text);
  }
  console.log("[SEMANTIC] ✓ Embeddings ready");
}

export interface SemanticResult {
  node:      GraphNode;
  score:     number;
  matchType: "semantic" | "keyword" | "hybrid";
}

/** Hybrid semantic + keyword search. Returns top-K results sorted by score. */
export async function semanticSearch(
  graph:  KnowledgeGraph,
  query:  string,
  topK = 5
): Promise<SemanticResult[]> {
  await embedGraph(graph);

  const queryVec = await embed(query);
  const results: SemanticResult[] = [];

  const queryWords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 3);

  for (const node of Object.values(graph.nodes)) {
    if (!node.embedding) continue;

    const semanticScore = cosineSimilarity(queryVec, node.embedding);

    const text         = `${node.name} ${node.description}`.toLowerCase();
    const keywordHits  = queryWords.filter((w) => text.includes(w)).length;
    const keywordScore = Math.min(1, keywordHits / Math.max(1, queryWords.length));

    const hybridScore = semanticScore * 0.7 + keywordScore * 0.3;

    results.push({
      node,
      score:     hybridScore,
      matchType: keywordScore > 0.5 ? "hybrid" : "semantic",
    });
  }

  return results.sort((a, b) => b.score - a.score).slice(0, topK);
}
