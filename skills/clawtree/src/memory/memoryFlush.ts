import type { TalentTree } from "../tree/skillTree";
import { loadSummary, saveSummary, type SummaryState } from "./summaryIndex";
import { appendDetail } from "./detailLayer";

/**
 * Flush current tree state to MEMORY.md.
 * Called by OpenClaw runtime before context compaction (onMemoryFlush lifecycle hook)
 * and every 10 actions as a safety net.
 */
export function flushToMemory(tree: TalentTree, baseDir: string): void {
  const existing = loadSummary(baseDir) ?? buildEmptySummary();

  const xpIndex: SummaryState["xpIndex"] = {};
  const installed: string[] = [];
  const available: string[]  = [];
  const evolving:  string[]  = [];

  for (const branch of Object.values(tree.branches)) {
    for (const node of branch.nodes) {
      const pct = Math.round((node.usageCount / node.evolveAt) * 100);
      xpIndex[node.slug] = { xp: node.usageCount, evolveAt: node.evolveAt, pct, status: node.status };

      if (["installed", "evolved", "mastered"].includes(node.status)) installed.push(node.slug);
      if (node.status === "available") available.push(node.slug);
      if (node.status === "installed" && node.usageCount > 0) {
        evolving.push(`${node.slug}:${node.usageCount}/${node.evolveAt}:${pct}%`);
      }
    }
  }

  saveSummary(baseDir, {
    ...existing,
    mode:      tree.mode,
    totalXP:   tree.totalXP,
    lastSaved: new Date().toISOString().slice(0, 10),
    installed,
    available,
    evolving,
    xpIndex,
  });

  appendDetail(baseDir, {
    ts:     new Date().toISOString(),
    event:  "flush",
    slug:   "gardener",
    detail: `installed:${installed.length} available:${available.length} totalXP:${tree.totalXP}`,
  });
}

/**
 * Restore tree state from MEMORY.md on session start.
 * Returns true if successfully restored, false on first run.
 */
export function restoreFromMemory(tree: TalentTree, baseDir: string): boolean {
  const summary = loadSummary(baseDir);
  if (!summary) return false;

  for (const [slug, data] of Object.entries(summary.xpIndex)) {
    for (const branch of Object.values(tree.branches)) {
      const node = branch.nodes.find((n) => n.slug === slug);
      if (!node) continue;
      node.status      = data.status as typeof node.status;
      node.usageCount  = Math.round((data.pct / 100) * node.evolveAt);
    }
  }

  tree.mode    = summary.mode as typeof tree.mode;
  tree.totalXP = summary.totalXP;
  return true;
}

function buildEmptySummary(): SummaryState {
  return {
    mode: "hybrid", totalXP: 0, lastSaved: "",
    installed: [], available: [], evolving: [],
    xpIndex: {}, chainHistory: [], evolveLog: [],
  };
}
