import type { TalentTree } from "../tree/skillTree";
import type { KnowledgeGraph } from "./knowledgeGraph";
import { addEdge } from "./knowledgeGraph";

/**
 * Cross-branch synergies not declared in the TalentTree.
 * These are domain-knowledge edges that make the graph richer for discovery.
 * Format: [from, to, label]
 */
const CROSS_SYNERGIES: [string, string, string][] = [
  ["ai-rag-pipeline",       "decodo",                 "Web scraping → RAG context"],
  ["comms-notifier",        "multiversx-nft-monitor", "NFT event → instant alert"],
  ["analytics-engine",      "on-chain-oracle",        "On-chain data → analytics"],
  ["multi-agent-orchestra", "clawhub-inception-oracle", "Meta: orchestra ← inception"],
  ["trust-oracle",          "clawhub-publisher",      "Publish only after full audit"],
  ["insight-oracle",        "comms-oracle",           "Insights → digest & broadcast"],
  ["ci-guardian",           "clawhub-publisher",      "CI gate before publish"],
  ["rlm-controller",        "multi-agent-orchestra",  "Rate-limit fleet orchestration"],
];

/**
 * Enrich a KnowledgeGraph with:
 *   1. Cross-branch synergy edges (declared above)
 *   2. "suggests" edges between tier-adjacent nodes in the same branch
 */
export function enrichGraph(graph: KnowledgeGraph, tree: TalentTree): void {
  // 1. Cross-branch synergies
  for (const [from, to, label] of CROSS_SYNERGIES) {
    if (graph.nodes[from] && graph.nodes[to]) {
      addEdge(graph, { from, to, type: "synergy", weight: 0.4, label, bidirectional: true });
    }
  }

  // 2. "suggests" edges along each branch (T1 → T2 → T3 …)
  for (const branch of Object.values(tree.branches)) {
    const sorted = [...branch.nodes].sort((a, b) => a.tier - b.tier);
    for (let i = 0; i < sorted.length - 1; i++) {
      addEdge(graph, {
        from:          sorted[i].slug,
        to:            sorted[i + 1].slug,
        type:          "suggests",
        weight:        0.3,
        label:         "next in branch",
        bidirectional: false,
      });
    }
  }
}
