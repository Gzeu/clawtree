import { listAgents }              from "./fleetRegistry";
import { mergeIntoFleet, loadSharedTree } from "./sharedTree";
import { loadTree }               from "../tree/persistence";

export interface FleetStatus {
  agents:    number;
  totalXP:   number;
  installed: number;
  available: number;
  locked:    number;
  lastSync:  string;
}

/**
 * Fleet Gardener: reads every registered agent's personal tree
 * and merges it into ~/.clawtree/fleet-tree.json.
 * Safe to call at any time; errors per-agent are warned, not thrown.
 */
export function syncFleet(): FleetStatus {
  const agents = listAgents();

  for (const agent of agents) {
    try {
      const tree = loadTree(agent.path);
      mergeIntoFleet(tree);
      console.log(`[FLEET GARDENER] ✓ Synced: ${agent.name}`);
    } catch (e) {
      console.warn(`[FLEET GARDENER] ✗ ${agent.name}: ${(e as Error).message}`);
    }
  }

  const fleet = loadSharedTree();
  if (!fleet) {
    return { agents: agents.length, totalXP: 0, installed: 0, available: 0, locked: 0, lastSync: new Date().toISOString() };
  }

  let installed = 0, available = 0, locked = 0;
  for (const branch of Object.values(fleet.branches)) {
    for (const node of branch.nodes) {
      if (["installed", "evolved", "mastered"].includes(node.status)) installed++;
      else if (node.status === "available") available++;
      else locked++;
    }
  }

  const status: FleetStatus = {
    agents: agents.length, totalXP: fleet.totalXP,
    installed, available, locked, lastSync: new Date().toISOString(),
  };

  console.log(
    `[FLEET GARDENER] 🌳 Sync complete\n` +
    `  Agents    : ${status.agents}\n` +
    `  Total XP  : ${status.totalXP}\n` +
    `  Installed : ${status.installed} | Available: ${status.available} | Locked: ${status.locked}`
  );

  return status;
}

/** Print a human-readable fleet status table. */
export function printFleetStatus(): void {
  const agents = listAgents();
  if (!agents.length) {
    console.log("[FLEET] No agents registered. Run: /fleet register <name> <path>");
    return;
  }
  console.log("\n[FLEET] Registered agents:\n");
  for (const a of agents) {
    console.log(`  • ${a.name.padEnd(24)} ${a.path}`);
    console.log(`    registered: ${a.registeredAt.slice(0, 10)}${
      a.lastSync ? " | last sync: " + a.lastSync.slice(0, 10) : ""
    }`);
  }
  console.log("");
}
