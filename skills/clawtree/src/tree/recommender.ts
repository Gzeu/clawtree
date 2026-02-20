import type { TalentTree }      from "./skillTree";
import type { KnowledgeGraph }  from "../graph/knowledgeGraph";
import { findAllPaths }         from "../graph/pathfinder";
import { semanticSearch }       from "../graph/semanticSearch";

export interface Recommendation {
  slug:      string;
  name:      string;
  branch:    string;
  urgency:   "now" | "soon" | "future";
  reason:    string;
}

// Simple rule-based recommender (used without graph)
export function autoRecommend(
  tree:         TalentTree,
  recentSlugs:  string[]
): Recommendation[] {
  const recs: Recommendation[] = [];

  for (const branch of Object.values(tree.branches)) {
    for (const node of branch.nodes) {
      if (node.status !== "available") continue;

      const recentHit = recentSlugs.some((s) => node.chainsWith.includes(s));
      const urgency   = recentHit ? "now" : "soon";
      const reason    = recentHit
        ? `Chain bonus available with recently used skills`
        : `Next node in ${branch.label} branch (T${node.tier})`;

      recs.push({ slug: node.slug, name: node.name, branch: branch.label, urgency, reason });
    }
  }

  return recs.sort((a, b) => {
    const order = { now: 0, soon: 1, future: 2 };
    return order[a.urgency] - order[b.urgency];
  });
}

// Semantic recommender (requires Knowledge Graph)
export async function semanticRecommend(
  graph:  KnowledgeGraph,
  query:  string,
  topK:   number = 5
): Promise<Recommendation[]> {
  const results = await semanticSearch(graph, query, topK * 2);

  return results
    .filter((r) => r.node.status !== "mastered")
    .slice(0, topK)
    .map((r) => {
      const paths   = findAllPaths(graph, r.node.slug);
      const nearest = paths[0];
      return {
        slug:    r.node.slug,
        name:    r.node.name,
        branch:  r.node.branch,
        urgency: r.score > 0.8 ? "now" : r.score > 0.6 ? "soon" : "future",
        reason:  [
          `🧠 Semantic match: ${(r.score * 100).toFixed(0)}% (${r.matchType})`,
          nearest
            ? `🗺️ Path: ${nearest.path.join(" → ")} (${nearest.hops} hops)`
            : "",
        ].filter(Boolean).join(" | "),
      } as Recommendation;
    });
}
