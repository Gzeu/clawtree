import { describe, it, expect } from "@jest/globals";
import { buildFromTree } from "../src/graph/knowledgeGraph";
import type { TalentTree } from "../src/tree/skillTree";

const MINIMAL_TREE: TalentTree = {
  version: "1.0.0",
  mode: "hybrid",
  totalXP: 0,
  lastSaved: "2026-02-20",
  branches: {
    foundation: {
      emoji: "🌱",
      label: "Foundation",
      name: "foundation",
      unlocked: true,
      nodes: [
        { slug: "alpha", name: "Alpha", tier: 1, status: "installed", usageCount: 2, evolveAt: 5, prerequisites: [], unlocks: ["beta"], chainsWith: ["beta"] },
        { slug: "beta",  name: "Beta",  tier: 2, status: "available", usageCount: 0, evolveAt: 10, prerequisites: ["alpha"], unlocks: [], chainsWith: ["alpha"] },
      ],
    },
  },
} as any;

describe("KnowledgeGraph", () => {
  it("builds nodes from tree", () => {
    const g = buildFromTree(MINIMAL_TREE);
    expect(Object.keys(g.nodes)).toHaveLength(2);
    expect(g.nodes["alpha"]).toBeDefined();
    expect(g.nodes["alpha"].status).toBe("installed");
  });

  it("creates prerequisite edge alpha -> beta", () => {
    const g = buildFromTree(MINIMAL_TREE);
    const prereqEdge = g.edges.find((e) => e.from === "alpha" && e.to === "beta" && e.type === "unlocks");
    expect(prereqEdge).toBeDefined();
  });

  it("creates bidirectional chain edge", () => {
    const g = buildFromTree(MINIMAL_TREE);
    const fwd = g.edges.find((e) => e.from === "alpha" && e.to === "beta" && e.type === "chains");
    expect(fwd).toBeDefined();
    // Bidirectional — adjacency should have both directions
    const revInAdj = g.adjacency["beta"]?.find((e) => e.to === "alpha" && e.type === "chains");
    expect(revInAdj).toBeDefined();
  });
});
