import type { TalentTree }              from "../tree/skillTree";
import type { ConditionalSlot, SlotEvent } from "./conditionalSlots";
import { shouldFire }                   from "./conditionalSlots";
import { loadSlots, saveSlots }         from "./slotPersistence";
import { flushToMemory }               from "../memory/memoryFlush";

export interface SlotFireResult {
  slot:    ConditionalSlot;
  fired:   boolean;
  message: string;
}

/**
 * Process a single event through all enabled slots.
 * Returns which slots fired and what actions were taken.
 */
export function processEvent(
  event:   SlotEvent,
  tree:    TalentTree,
  baseDir: string
): SlotFireResult[] {
  const slots   = loadSlots(baseDir);
  const results: SlotFireResult[] = [];

  for (const slot of slots) {
    if (!shouldFire(slot, event)) continue;
    const result      = executeAction(slot, tree, baseDir);
    slot.lastFiredAt  = event.ts;
    slot.fireCount++;
    results.push(result);
  }

  saveSlots(baseDir, slots);

  if (results.length) {
    console.log(`[SLOTS] ${results.length} slot(s) fired for event: ${event.type}:${event.slug}`);
    for (const r of results) console.log(`  → ${r.message}`);
  }

  return results;
}

function executeAction(
  slot:    ConditionalSlot,
  tree:    TalentTree,
  baseDir: string
): SlotFireResult {
  switch (slot.action) {

    case "notify_user":
      console.log(`\n🔔 [SLOT:${slot.id}] ${slot.slug} → ${slot.trigger} → ${slot.action}`);
      return { slot, fired: true, message: `Notified: ${slot.slug} hit trigger '${slot.trigger}'` };

    case "auto_install": {
      const targetSlug = (slot.actionPayload?.targetSlug as string | undefined) ?? slot.slug;
      for (const branch of Object.values(tree.branches)) {
        const node = branch.nodes.find((n) => n.slug === targetSlug);
        if (node && node.status === "locked") {
          node.status = "available";
          return { slot, fired: true, message: `auto_install: unlocked '${targetSlug}'` };
        }
      }
      return { slot, fired: true, message: `auto_install: '${targetSlug}' already available/installed` };
    }

    case "unlock_bonus_branch": {
      const branchKey = slot.actionPayload?.branch as string | undefined;
      if (!branchKey || !tree.branches[branchKey]) {
        return { slot, fired: false, message: `unlock_bonus_branch: branch '${branchKey}' not found` };
      }
      let count = 0;
      for (const node of tree.branches[branchKey].nodes) {
        if (node.status === "locked") { node.status = "available"; count++; }
      }
      return { slot, fired: true, message: `Unlocked ${count} node(s) in branch '${branchKey}'` };
    }

    case "flush_memory":
      flushToMemory(tree, baseDir);
      return { slot, fired: true, message: "Memory flushed via slot" };

    case "emit_event":
      console.log(`[SLOT:${slot.id}] 📡 emit_event:`, slot.actionPayload);
      return { slot, fired: true, message: `Event emitted: ${JSON.stringify(slot.actionPayload)}` };

    default:
      return { slot, fired: false, message: `Unknown action: ${slot.action}` };
  }
}
