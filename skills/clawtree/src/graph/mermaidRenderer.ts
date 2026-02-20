import fs from "fs";
import path from "path";
import type { KnowledgeGraph } from "./knowledgeGraph";

const STATUS_STYLE: Record<string, string> = {
  installed: "fill:#22c55e,color:#fff,stroke:#16a34a",
  available: "fill:#3b82f6,color:#fff,stroke:#2563eb",
  locked:    "fill:#6b7280,color:#fff,stroke:#4b5563",
  evolved:   "fill:#f59e0b,color:#fff,stroke:#d97706",
  mastered:  "fill:#8b5cf6,color:#fff,stroke:#7c3aed",
};

const EDGE_ARROW: Record<string, string> = {
  prerequisite: "-->",
  unlocks:      "-.->",
  chains:       "<-->",
  synergy:      "~~~",
  suggests:     "--o",
  conflicts:    "--x",
};

/** Generate a Mermaid flowchart string for a KnowledgeGraph. */
export function renderMermaid(
  graph:   KnowledgeGraph,
  options: { highlightSlugs?: string[] } = {}
): string {
  const lines: string[] = ["```mermaid", "flowchart TD"];

  // Group nodes by branch into Mermaid subgraphs
  const byBranch: Record<string, string[]> = {};
  for (const node of Object.values(graph.nodes)) {
    const b = node.branch ?? "Other";
    if (!byBranch[b]) byBranch[b] = [];
    const id    = toId(node.slug);
    const label = `${node.name}\\n[T${node.tier} · ${node.status}]`;
    const hl    = options.highlightSlugs?.includes(node.slug);
    byBranch[b].push(`    ${id}${hl ? "((" : "["}"${label}"${hl ? "))" : "]"}`); 
  }

  for (const [branch, nodeLines] of Object.entries(byBranch)) {
    lines.push(`  subgraph ${branch.replace(/\s+/g, "_")}`);
    lines.push(...nodeLines);
    lines.push("  end");
  }

  // Edges
  for (const edge of graph.edges) {
    const arrow   = EDGE_ARROW[edge.type] ?? "-->";
    const lbl     = edge.label ? `|"${edge.label}"|` : "";
    lines.push(`  ${toId(edge.from)} ${arrow}${lbl} ${toId(edge.to)}`);
  }

  // Style nodes by status
  for (const node of Object.values(graph.nodes)) {
    const style = STATUS_STYLE[node.status];
    if (style) lines.push(`  style ${toId(node.slug)} ${style}`);
  }

  lines.push("```");
  return lines.join("\n");
}

/** Save a Mermaid diagram to reports/<filename>. Returns the output path. */
export function saveMermaid(
  graph:    KnowledgeGraph,
  baseDir:  string,
  filename = "skill-graph.md"
): string {
  const diagram = renderMermaid(graph);
  const outPath = path.resolve(baseDir, "reports", filename);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(
    outPath,
    `# 🔭 ClawTree — Skill Knowledge Graph\n> Generated: ${new Date().toISOString()}\n\n${diagram}\n`,
    "utf8"
  );
  return outPath;
}

/** Render only the nodes on a path, highlighting them. */
export function renderPath(graph: KnowledgeGraph, pathSlugs: string[]): string {
  const set = new Set(pathSlugs);
  const sub: KnowledgeGraph = {
    ...graph,
    nodes:     Object.fromEntries(Object.entries(graph.nodes).filter(([s]) => set.has(s))),
    edges:     graph.edges.filter((e) => set.has(e.from) && set.has(e.to)),
    adjacency: Object.fromEntries(
      Object.entries(graph.adjacency)
        .filter(([s]) => set.has(s))
        .map(([s, es]) => [s, es.filter((e) => set.has(e.to))])
    ),
  };
  return renderMermaid(sub, { highlightSlugs: pathSlugs });
}

function toId(slug: string): string {
  return slug.replace(/-/g, "_");
}
