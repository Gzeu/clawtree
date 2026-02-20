import fs from "fs";
import path from "path";
import type { KnowledgeGraph, GraphNode } from "./knowledgeGraph";

const GRAPH_FILE = "skill-graph.json";

/** Save the graph, stripping embeddings (they are recalculated lazily). */
export function saveGraph(baseDir: string, graph: KnowledgeGraph): void {
  const clean: KnowledgeGraph = {
    ...graph,
    nodes: Object.fromEntries(
      Object.entries(graph.nodes).map(([slug, node]) => [
        slug,
        { ...node, embedding: undefined } as GraphNode,
      ])
    ),
  };
  fs.writeFileSync(
    path.resolve(baseDir, GRAPH_FILE),
    JSON.stringify(clean, null, 2),
    "utf8"
  );
}

/** Load a previously saved graph, or return null on first run. */
export function loadGraph(baseDir: string): KnowledgeGraph | null {
  const p = path.resolve(baseDir, GRAPH_FILE);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf8")) as KnowledgeGraph;
  } catch {
    return null;
  }
}
