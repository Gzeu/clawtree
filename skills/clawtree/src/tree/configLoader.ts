/**
 * configLoader.ts — loads and validates clawtree config.json.
 *
 * Merge order (each layer overrides the previous for scalar keys):
 *   1. built-in defaults
 *   2. config.json in baseDir
 *
 * Custom branches are NOT merged here — that’s handled by branchLoader.
 */

import fs   from "fs";
import path from "path";

// ── Types ───────────────────────────────────────────────────────────────

export interface CustomNodeDef {
  slug:           string;
  name:           string;
  description:    string;
  tier?:          number;        // default: 1
  status?:        "available" | "locked"; // default: "available"
  evolveAt?:      number;        // default: 10
  prerequisites?: string[];
  unlocks?:       string[];
  chainsWith?:    string[];
}

export interface CustomBranchDef {
  name:   string;               // key used in tree.branches (e.g. "crypto-trading")
  label:  string;               // display label with emoji (e.g. "💹 Crypto Trading")
  nodes:  CustomNodeDef[];
}

export interface ClawTreeConfig {
  // Scalar settings (all optional — fall back to built-in defaults)
  mode?:                   "auto" | "manual" | "hybrid";
  memory_flush_enabled?:   boolean;
  semantic_search_model?:  string;
  xp_per_use?:             number;
  chain_bonus_xp?:         number;
  auto_flush_interval?:    number;
  graph_bfs_depth?:        number;
  recommend_top_k?:        number;
  history_days?:           number;

  // User-defined branches
  custom_branches?:        CustomBranchDef[];
}

const CONFIG_FILE = "config.json";

export const DEFAULT_CONFIG: Required<Omit<ClawTreeConfig, "custom_branches">> = {
  mode:                  "hybrid",
  memory_flush_enabled:  true,
  semantic_search_model: "Xenova/all-MiniLM-L6-v2",
  xp_per_use:            10,
  chain_bonus_xp:        25,
  auto_flush_interval:   10,
  graph_bfs_depth:       2,
  recommend_top_k:       5,
  history_days:          30,
};

/** Load config.json from baseDir, merged with DEFAULT_CONFIG. */
export function loadConfig(baseDir: string): ClawTreeConfig {
  const p = path.resolve(baseDir, CONFIG_FILE);
  if (!fs.existsSync(p)) return { ...DEFAULT_CONFIG };
  try {
    const raw = JSON.parse(fs.readFileSync(p, "utf8")) as ClawTreeConfig;
    return { ...DEFAULT_CONFIG, ...raw };
  } catch {
    console.warn("[CLAWTREE] ⚠️  config.json parse error — using defaults");
    return { ...DEFAULT_CONFIG };
  }
}

/** Save a full config back to baseDir/config.json. */
export function saveConfig(baseDir: string, cfg: ClawTreeConfig): void {
  fs.writeFileSync(
    path.resolve(baseDir, CONFIG_FILE),
    JSON.stringify(cfg, null, 2),
    "utf8"
  );
}

/**
 * Validate a CustomBranchDef.
 * Returns array of error strings (empty = valid).
 */
export function validateBranchDef(def: CustomBranchDef): string[] {
  const errors: string[] = [];
  if (!def.name?.match(/^[a-z0-9-]+$/)) {
    errors.push(`branch.name must be kebab-case alphanumeric (got: "${def.name}")`);
  }
  if (!def.label?.trim()) errors.push("branch.label is required");
  if (!Array.isArray(def.nodes) || def.nodes.length === 0) {
    errors.push("branch.nodes must be a non-empty array");
  }
  for (const node of def.nodes ?? []) {
    if (!node.slug?.match(/^[a-z0-9-]+$/)) {
      errors.push(`node.slug must be kebab-case (got: "${node.slug}")`);
    }
    if (!node.name?.trim()) errors.push(`node '${node.slug}' missing name`);
    if (node.tier !== undefined && (node.tier < 1 || node.tier > 5)) {
      errors.push(`node '${node.slug}' tier must be 1-5`);
    }
  }
  return errors;
}
