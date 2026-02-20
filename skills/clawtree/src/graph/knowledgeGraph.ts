import type { TalentTree } from "../tree/skillTree";

// ── Types ───────────────────────────────────────────────────────────────────

export type EdgeType =
  | "prerequisite" // A must be installed before B          (weight: 1.0)
  | "unlocks"      // A installed → B becomes available     (weight: 0.8)
  | "chains"       // A + B = +25 XP bonus                  (weight: 0.6)
  | "synergy"      // A and B amplify each other            (weight: 0.4)
  | "suggests"     // recommended to have together          (weight: 0.3)
  | "conflicts";   // A and B should not run simultaneously (weight: -1.0)

export interface GraphEdge {
  from:          string;
  to:            string;
  type:          EdgeType;
  weight:        number;
  label?:        string;
  bidirectional: boolean;
}

export interface GraphNode {
  slug:        string;
  name:        string;
  branch:      string;
  tier:        number;
  status:      string;
  description: string;
  tags:        string[];
  embedding?:  number[]; // Lazy-computed by semanticSearch module
}

export interface KnowledgeGraph {
  version:   string;
  nodes:     Record<string, GraphNode>;
  edges:     GraphEdge[];
  adjacency: Record<string, GraphEdge[]>; // Pre-built index: slug → outgoing edges
}

// ── Build ───────────────────────────────────────────────────────────────────

/** Build a KnowledgeGraph from a TalentTree. */
export function buildFromTree(tree: TalentTree): KnowledgeGraph {
  const graph: KnowledgeGraph = { version: "1.0.0", nodes: {}, edges: [], adjacency: {} };

  // 1. Register all nodes
  for (const [branchKey, branch] of Object.entries(tree.branches)) {
    for (const node of branch.nodes) {
      graph.nodes[node.slug] = {
        slug:        node.slug,
        name:        node.name,
        branch:      branch.label ?? branchKey,
        tier:        node.tier,
        status:      node.status,
        description: (node as any).description ?? "",
        tags:        [branchKey, `tier-${node.tier}`, node.status],
      };
    }
  }

  // 2. Build edges from tree relations
  for (const branch of Object.values(tree.branches)) {
    for (const node of branch.nodes) {
      for (const prereq of node.prerequisites ?? []) {
        addEdge(graph, { from: prereq, to: node.slug, type: "prerequisite", weight: 1.0, label: "required by", bidirectional: false });
      }
      for (const unlock of node.unlocks ?? []) {
        addEdge(graph, { from: node.slug, to: unlock, type: "unlocks", weight: 0.8, label: "unlocks", bidirectional: false });
      }
      for (const chain of node.chainsWith ?? []) {
        addEdge(graph, { from: node.slug, to: chain, type: "chains", weight: 0.6, label: "+25 XP", bidirectional: true });
      }
    }
  }

  return graph;
}

// ── CRUD ────────────────────────────────────────────────────────────────────

/** Add an edge, de-duplicating by (from, to, type). */
export function addEdge(graph: KnowledgeGraph, edge: GraphEdge): void {
  const dup = graph.edges.find((e) => e.from === edge.from && e.to === edge.to && e.type === edge.type);
  if (dup) return;

  graph.edges.push(edge);
  if (!graph.adjacency[edge.from]) graph.adjacency[edge.from] = [];
  graph.adjacency[edge.from].push(edge);

  if (edge.bidirectional) {
    const rev = { ...edge, from: edge.to, to: edge.from };
    if (!graph.adjacency[rev.from]) graph.adjacency[rev.from] = [];
    graph.adjacency[rev.from].push(rev);
  }
}

/** Add a node (no-op if already exists). */
export function addNode(graph: KnowledgeGraph, node: GraphNode): void {
  graph.nodes[node.slug] = node;
  if (!graph.adjacency[node.slug]) graph.adjacency[node.slug] = [];
}

/** Get outgoing edges for a node. */
export function getNeighbors(graph: KnowledgeGraph, slug: string): GraphEdge[] {
  return graph.adjacency[slug] ?? [];
}

/**
 * Extract a sub-graph via BFS up to `depth` hops from the centre slugs.
 * Useful for Mermaid visualisation of a local neighbourhood.
 */
export function subgraph(
  graph: KnowledgeGraph,
  centerSlugs: string[],
  depth = 2
): KnowledgeGraph {
  const visited = new Set<string>();
  let frontier  = [...centerSlugs];

  for (let d = 0; d <= depth && frontier.length; d++) {
    const next: string[] = [];
    for (const slug of frontier) {
      if (visited.has(slug)) continue;
      visited.add(slug);
      for (const edge of getNeighbors(graph, slug)) {
        if (!visited.has(edge.to)) next.push(edge.to);
      }
    }
    frontier = next;
  }

  const subNodes: Record<string, GraphNode> = {};
  const subEdges: GraphEdge[]               = [];
  const subAdj:   Record<string, GraphEdge[]> = {};

  for (const slug of visited) {
    if (graph.nodes[slug]) subNodes[slug] = graph.nodes[slug];
  }
  for (const edge of graph.edges) {
    if (visited.has(edge.from) && visited.has(edge.to)) {
      subEdges.push(edge);
      if (!subAdj[edge.from]) subAdj[edge.from] = [];
      subAdj[edge.from].push(edge);
    }
  }

  return { version: graph.version, nodes: subNodes, edges: subEdges, adjacency: subAdj };
}
