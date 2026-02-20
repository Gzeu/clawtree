/**
 * branchLoader.ts — merges user-defined branches into a TalentTree.
 *
 * Sources (applied in order, last wins for duplicate branch names):
 *   1. defaultTree() built-in branches
 *   2. config.json#custom_branches
 *   3. branches/*.json files in baseDir
 *
 * Individual nodes inside a branch are NEVER overwritten if the branch
 * already exists in talent-tree.json — persisted XP/status is preserved.
 */

import fs   from "fs";
import path from "path";
import type { TalentTree, Branch, SkillNode, SkillStatus } from "./skillTree";
import type { CustomBranchDef, CustomNodeDef }             from "./configLoader";
import { loadConfig, saveConfig, validateBranchDef }       from "./configLoader";

const BRANCHES_DIR = "branches";

// ── Public API ────────────────────────────────────────────────────────────

/**
 * Merge all custom branch definitions into `tree`.
 * Mutates `tree.branches` in place. Returns count of new branches added.
 */
export function mergeCustomBranches(tree: TalentTree, baseDir: string): number {
  const defs = collectDefs(baseDir);
  let added  = 0;

  for (const def of defs) {
    const errors = validateBranchDef(def);
    if (errors.length) {
      console.warn(`[CLAWTREE] ⚠️  Skipping invalid branch '${def.name}':\n  ${errors.join("\n  ")}`);
      continue;
    }

    const existing = tree.branches[def.name];
    if (existing) {
      // Branch exists — only add NEW nodes (preserve persisted state)
      mergeNodes(existing, def.nodes);
    } else {
      // Brand new branch — create it
      tree.branches[def.name] = buildBranch(def);
      added++;
    }
  }

  return added;
}

/**
 * Add a single CustomBranchDef to config.json#custom_branches and merge into tree.
 * Used by `/tree branch add` command.
 */
export function addCustomBranch(
  tree:    TalentTree,
  baseDir: string,
  def:     CustomBranchDef
): string[] {
  const errors = validateBranchDef(def);
  if (errors.length) return errors;

  // Persist to config.json
  const cfg = loadConfig(baseDir);
  cfg.custom_branches = [
    ...(cfg.custom_branches ?? []).filter((b) => b.name !== def.name),
    def,
  ];
  saveConfig(baseDir, cfg);

  // Merge into live tree
  if (tree.branches[def.name]) {
    mergeNodes(tree.branches[def.name]!, def.nodes);
  } else {
    tree.branches[def.name] = buildBranch(def);
  }

  return [];
}

/**
 * Remove a custom branch by name from config.json AND from the live tree.
 * Built-in branches are protected — returns false if branch is built-in.
 */
export function removeCustomBranch(
  tree:       TalentTree,
  baseDir:    string,
  branchName: string
): { ok: boolean; reason?: string } {
  const BUILT_IN = ["foundation", "web", "blockchain", "security", "ai", "data", "devops", "comms"];
  if (BUILT_IN.includes(branchName)) {
    return { ok: false, reason: `'${branchName}' is a built-in branch and cannot be removed` };
  }

  // Remove from config.json
  const cfg = loadConfig(baseDir);
  cfg.custom_branches = (cfg.custom_branches ?? []).filter((b) => b.name !== branchName);
  saveConfig(baseDir, cfg);

  // Remove any branches/<branchName>.json file
  const branchFile = path.resolve(baseDir, BRANCHES_DIR, `${branchName}.json`);
  if (fs.existsSync(branchFile)) fs.unlinkSync(branchFile);

  // Remove from live tree
  if (!tree.branches[branchName]) {
    return { ok: false, reason: `Branch '${branchName}' not found in tree` };
  }
  delete tree.branches[branchName];
  return { ok: true };
}

/** List all custom branch names defined in config + branches/ folder. */
export function listCustomBranches(baseDir: string): CustomBranchDef[] {
  return collectDefs(baseDir);
}

// ── Internals ────────────────────────────────────────────────────────────

function collectDefs(baseDir: string): CustomBranchDef[] {
  const results: CustomBranchDef[] = [];

  // Source 1: config.json#custom_branches
  const cfg = loadConfig(baseDir);
  if (cfg.custom_branches?.length) results.push(...cfg.custom_branches);

  // Source 2: branches/*.json files (win over config.json on duplicate name)
  const branchesDir = path.resolve(baseDir, BRANCHES_DIR);
  if (fs.existsSync(branchesDir)) {
    const files = fs.readdirSync(branchesDir).filter((f) => f.endsWith(".json"));
    for (const file of files) {
      try {
        const raw = JSON.parse(fs.readFileSync(path.join(branchesDir, file), "utf8")) as CustomBranchDef;
        const idx = results.findIndex((r) => r.name === raw.name);
        if (idx >= 0) results[idx] = raw; // file wins
        else results.push(raw);
      } catch {
        console.warn(`[CLAWTREE] ⚠️  Could not parse branches/${file}`);
      }
    }
  }

  return results;
}

function buildBranch(def: CustomBranchDef): Branch {
  return {
    name:  def.name,
    label: def.label,
    nodes: def.nodes.map(nodeFromDef),
  };
}

function nodeFromDef(d: CustomNodeDef): SkillNode {
  return {
    slug:          d.slug,
    name:          d.name,
    description:   d.description,
    tier:          d.tier         ?? 1,
    status:        (d.status      ?? "available") as SkillStatus,
    xp:            0,
    usageCount:    0,
    evolveAt:      d.evolveAt     ?? 10,
    prerequisites: d.prerequisites ?? [],
    unlocks:       d.unlocks       ?? [],
    chainsWith:    d.chainsWith    ?? [],
  };
}

function mergeNodes(branch: Branch, newNodes: CustomNodeDef[]): void {
  for (const nd of newNodes) {
    const exists = branch.nodes.find((n) => n.slug === nd.slug);
    if (!exists) branch.nodes.push(nodeFromDef(nd));
    // If node already exists, keep persisted XP/status — do NOT overwrite
  }
}
