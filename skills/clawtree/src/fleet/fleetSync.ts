import type { TalentTree } from "../tree/skillTree";
import { loadSharedTree }  from "./sharedTree";

const STATUS_RANK: Record<string, number> = {
  locked: 0, available: 1, installed: 2, evolved: 3, mastered: 4,
};

export interface SyncResult {
  changed: number;
  details: string[];
}

/**
 * Pull fleet-level upgrades into a personal tree.
 * If a node is more advanced in the fleet tree, upgrade the personal one.
 * Never downgrades — personal mastery is always preserved.
 */
export function pullFromFleet(personalTree: TalentTree): SyncResult {
  const fleet = loadSharedTree();
  if (!fleet) return { changed: 0, details: ["No fleet tree found — nothing to pull."] };

  let changed = 0;
  const details: string[] = [];

  for (const [key, branch] of Object.entries(personalTree.branches)) {
    const fb = fleet.branches[key];
    if (!fb) continue;

    for (const node of branch.nodes) {
      const fn = fb.nodes.find((n) => n.slug === node.slug);
      if (!fn) continue;

      const fleetRank = STATUS_RANK[fn.status]   ?? 0;
      const localRank = STATUS_RANK[node.status] ?? 0;

      if (fleetRank > localRank) {
        details.push(`  ↑ ${node.slug}: ${node.status} → ${fn.status}  (fleet upgrade)`);
        node.status     = fn.status;
        node.usageCount = Math.max(node.usageCount, fn.usageCount);
        changed++;
      }
    }
  }

  return { changed, details };
}

/**
 * Push personal tree into the fleet tree (calls mergeIntoFleet internally).
 * Returns the number of nodes that the fleet upgraded.
 */
export function pushToFleet(personalTree: TalentTree): number {
  const { mergeIntoFleet } = require("./sharedTree");
  const before = loadSharedTree();
  mergeIntoFleet(personalTree);
  const after  = loadSharedTree();
  if (!before || !after) return 0;

  let upgraded = 0;
  for (const [key, branch] of Object.entries(after.branches)) {
    const bb = before.branches[key];
    if (!bb) { upgraded += branch.nodes.length; continue; }
    for (const node of branch.nodes) {
      const was = bb.nodes.find((n) => n.slug === node.slug);
      if (!was || was.status !== node.status || was.usageCount !== node.usageCount) upgraded++;
    }
  }
  return upgraded;
}
