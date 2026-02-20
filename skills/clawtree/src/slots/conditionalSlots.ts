/**
 * Conditional Slots — dynamic skill activation based on runtime events.
 *
 * A slot watches a skill (or '*' for all) and fires an action when its
 * trigger condition is met. Slots make the tree dynamic: skills unlock,
 * notify, or cascade automatically instead of requiring manual commands.
 */

export type TriggerType =
  | "on_evolve"        // fires when a skill reaches 100% XP and evolves
  | "on_install"       // fires immediately when a skill is installed
  | "xp_threshold"     // fires when usageCount/evolveAt >= triggerValue (%)
  | "chain_detected"   // fires when a chain is detected with triggerValue slug
  | "on_fleet_sync";   // fires after every fleet sync

export type ActionType =
  | "auto_install"       // automatically marks a target skill as available
  | "notify_user"        // prints a notification
  | "unlock_bonus_branch"// marks all locked nodes in a branch as available
  | "emit_event"         // emits a custom event payload
  | "flush_memory";      // triggers a Gardener memory flush

export interface ConditionalSlot {
  id:              string;
  slug:            string;           // watched skill slug, or '*' for all
  trigger:         TriggerType;
  triggerValue?:   string | number;  // xp_threshold: 80 | chain_detected: "other-slug"
  action:          ActionType;
  actionPayload?:  Record<string, any>;
  enabled:         boolean;
  createdAt:       string;
  lastFiredAt?:    string;
  fireCount:       number;
}

export interface SlotEvent {
  type:   TriggerType;
  slug:   string;
  value?: string | number;
  ts:     string;
}

/** Returns true if the slot should fire given the incoming event. */
export function shouldFire(slot: ConditionalSlot, event: SlotEvent): boolean {
  if (!slot.enabled)                                return false;
  if (slot.slug !== event.slug && slot.slug !== "*") return false;
  if (slot.trigger !== event.type)                  return false;

  switch (slot.trigger) {
    case "xp_threshold":
      return typeof event.value === "number" && event.value >= +(slot.triggerValue ?? 0);
    case "chain_detected":
      return event.value === slot.triggerValue;
    default:
      return true;
  }
}

/** Built-in default slots — created on first run. */
export function createDefaultSlots(): ConditionalSlot[] {
  const now = new Date().toISOString();
  return [
    {
      id: "slot-001", slug: "clawhub-inception-oracle",
      trigger: "on_evolve",  action: "notify_user",
      enabled: true, createdAt: now, fireCount: 0,
    },
    {
      id: "slot-002", slug: "*",
      trigger: "xp_threshold", triggerValue: 80,
      action: "notify_user",
      enabled: true, createdAt: now, fireCount: 0,
    },
    {
      id: "slot-003", slug: "clawguard",
      trigger: "on_install",  action: "unlock_bonus_branch",
      actionPayload: { branch: "security" },
      enabled: true, createdAt: now, fireCount: 0,
    },
    {
      id: "slot-004", slug: "skill-clawhub",
      trigger: "on_install",  action: "flush_memory",
      enabled: true, createdAt: now, fireCount: 0,
    },
  ];
}
