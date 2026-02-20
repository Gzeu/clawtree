import { describe, it, expect } from "@jest/globals";
import { buildFromTree } from "../src/graph/knowledgeGraph";
import { findShortestPath, findAllPaths } from "../src/graph/pathfinder";
import type { TalentTree } from "../src/tree/skillTree";

const TREE: TalentTree = {
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
        { slug: "a", name: "A", tier: 1, status: "installed", usageCount: 1, evolveAt: 5, prerequisites: [], unlocks: ["b"], chainsWith: [] },
        { slug: "b", name: "B", tier: 2, status: "available", usageCount: 0, evolveAt: 10, prerequisites: ["a"], unlocks: ["c"], chainsWith: [] },
        { slug: "c", name: "C", tier: 3, status: "locked",    usageCount: 0, evolveAt: 15, prerequisites: ["b"], unlocks: [], chainsWith: [] },
      ],
    },
  },
} as any;

describe("Pathfinder", () => {
  it("finds shortest path a → c", () => {
    const g    = buildFromTree(TREE);
    const result = findShortestPath(g, "a", "c");
    expect(result).not.toBeNull();
    expect(result!.path).toEqual(["a", "b", "c"]);
    expect(result!.hops).toBe(2);
  });

  it("returns null when no path exists", () => {
    const g = buildFromTree(TREE);
    expect(findShortestPath(g, "c", "a")).toBeNull();
  });

  it("findAllPaths returns path from installed nodes", () => {
    const g    = buildFromTree(TREE);
    const paths = findAllPaths(g, "c");
    expect(paths.length).toBeGreaterThan(0);
    expect(paths[0].path[0]).toBe("a");
  });
});
