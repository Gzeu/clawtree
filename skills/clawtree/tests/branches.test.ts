import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import fs   from "fs";
import path from "path";
import os   from "os";
import { defaultTree }        from "../src/tree/skillTree";
import { mergeCustomBranches, addCustomBranch, removeCustomBranch } from "../src/tree/branchLoader";
import { validateBranchDef }  from "../src/tree/configLoader";
import type { CustomBranchDef } from "../src/tree/configLoader";

let tmpDir: string;

const validBranch: CustomBranchDef = {
  name:  "crypto-trading",
  label: "💹 Crypto Trading",
  nodes: [
    { slug: "binance-api",    name: "Binance API",    description: "Spot & futures data",      tier: 1 },
    { slug: "dex-aggregator", name: "DEX Aggregator", description: "On-chain swap routing",   tier: 2 },
  ],
};

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "clawtree-branches-"));
});
aftterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("validateBranchDef", () => {
  it("passes valid branch definition", () => {
    expect(validateBranchDef(validBranch)).toHaveLength(0);
  });

  it("rejects branch with non-kebab-case name", () => {
    const errs = validateBranchDef({ ...validBranch, name: "My Branch!" });
    expect(errs.some((e) => e.includes("kebab-case"))).toBe(true);
  });

  it("rejects empty nodes array", () => {
    const errs = validateBranchDef({ ...validBranch, nodes: [] });
    expect(errs.some((e) => e.includes("non-empty"))).toBe(true);
  });

  it("rejects node with invalid tier", () => {
    const errs = validateBranchDef({
      ...validBranch,
      nodes: [{ slug: "test", name: "Test", description: "x", tier: 9 }],
    });
    expect(errs.some((e) => e.includes("tier"))).toBe(true);
  });
});

describe("mergeCustomBranches", () => {
  it("adds new branch from config.json", () => {
    // Write config.json with custom_branches
    fs.writeFileSync(
      path.join(tmpDir, "config.json"),
      JSON.stringify({ custom_branches: [validBranch] }),
      "utf8"
    );
    const tree = defaultTree();
    const added = mergeCustomBranches(tree, tmpDir);
    expect(added).toBe(1);
    expect(tree.branches["crypto-trading"]).toBeDefined();
    expect(tree.branches["crypto-trading"]!.nodes).toHaveLength(2);
  });

  it("adds new branch from branches/ folder", () => {
    const branchesDir = path.join(tmpDir, "branches");
    fs.mkdirSync(branchesDir);
    fs.writeFileSync(
      path.join(branchesDir, "crypto-trading.json"),
      JSON.stringify(validBranch),
      "utf8"
    );
    const tree  = defaultTree();
    const added = mergeCustomBranches(tree, tmpDir);
    expect(added).toBe(1);
    expect(tree.branches["crypto-trading"]).toBeDefined();
  });

  it("does not overwrite existing persisted node XP", () => {
    const tree = defaultTree();
    tree.branches["crypto-trading"] = {
      name: "crypto-trading", label: "💹 Crypto Trading",
      nodes: [{ slug: "binance-api", name: "Binance API", description: "x", tier: 1,
                status: "evolved", xp: 500, usageCount: 50, evolveAt: 10,
                prerequisites: [], unlocks: [], chainsWith: [] }],
    };
    fs.writeFileSync(
      path.join(tmpDir, "config.json"),
      JSON.stringify({ custom_branches: [validBranch] }),
      "utf8"
    );
    mergeCustomBranches(tree, tmpDir);
    // binance-api already existed with xp:500 — must NOT be reset
    const node = tree.branches["crypto-trading"]!.nodes.find((n) => n.slug === "binance-api");
    expect(node!.xp).toBe(500);
    expect(node!.status).toBe("evolved");
    // New node dex-aggregator was added
    expect(tree.branches["crypto-trading"]!.nodes).toHaveLength(2);
  });
});

describe("removeCustomBranch", () => {
  it("removes a custom branch from tree and config", () => {
    fs.writeFileSync(
      path.join(tmpDir, "config.json"),
      JSON.stringify({ custom_branches: [validBranch] }),
      "utf8"
    );
    const tree = defaultTree();
    mergeCustomBranches(tree, tmpDir);
    expect(tree.branches["crypto-trading"]).toBeDefined();

    const result = removeCustomBranch(tree, tmpDir, "crypto-trading");
    expect(result.ok).toBe(true);
    expect(tree.branches["crypto-trading"]).toBeUndefined();
  });

  it("refuses to remove built-in branches", () => {
    const tree   = defaultTree();
    const result = removeCustomBranch(tree, tmpDir, "foundation");
    expect(result.ok).toBe(false);
    expect(result.reason).toContain("built-in");
  });
});
