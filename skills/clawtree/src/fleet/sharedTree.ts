import fs   from "fs";
import path from "path";
import type { TalentTree, SkillNode } from "../tree/skillTree";
import { getFleetDir }               from "./fleetRegistry";

const sharedFile = () => path.join(getFleetDir(), "fleet-tree.json");

/** Atomic write: write to .tmp then rename — prevents corruption on crash. */
function atomicWrite(file: string, content: string): void {
  const tmp = `${file}.tmp`;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(tmp, content, "utf8");
  fs.renameSync(tmp, file);
}

export function loadSharedTree(): TalentTree | null {
  const f = sharedFile();
  if (!fs.existsSync(f)) return null;
  try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch { return null; }
}

export function saveSharedTree(tree: TalentTree): void {
  atomicWrite(sharedFile(), JSON.stringify(tree, null, 2));
}

const STATUS_RANK: Record<string, number> = {
  locked: 0, available: 1, installed: 2, evolved: 3, mastered: 4,
};

/**
 * Merge an agent tree into the fleet tree.
 * Fleet tree keeps MAX XP and MOST ADVANCED status per node.
 * Never downgrades any node.
 */
export function mergeIntoFleet(agentTree: TalentTree): TalentTree {
  const fleet = loadSharedTree() ?? JSON.parse(JSON.stringify(agentTree)) as TalentTree;

  for (const [key, branch] of Object.entries(agentTree.branches)) {
    if (!fleet.branches[key]) {
      fleet.branches[key] = branch;
      continue;
    }

    // Extract into local const so TS narrows correctly after the guard above
    const fleetBranch = fleet.branches[key]!;

    for (const node of branch.nodes) {
      const fn: SkillNode | undefined = fleetBranch.nodes.find(
        (n: SkillNode) => n.slug === node.slug
      );

      if (!fn) {
        fleetBranch.nodes.push({ ...node });
        continue;
      }

      fn.xp         = Math.max(fn.xp,         node.xp);
      fn.usageCount = Math.max(fn.usageCount, node.usageCount);
      if ((STATUS_RANK[node.status] ?? 0) > (STATUS_RANK[fn.status] ?? 0)) {
        fn.status = node.status;
      }
    }
  }

  fleet.totalXP   = Math.max(fleet.totalXP, agentTree.totalXP);
  (fleet as any).lastSaved = new Date().toISOString().slice(0, 10);
  saveSharedTree(fleet);
  return fleet;
}
