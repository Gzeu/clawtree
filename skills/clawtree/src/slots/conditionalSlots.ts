/**
 * ConditionalSlots — event-driven rule engine for ClawTree.
 *
 * A slot fires when an event matching its trigger arrives.
 * The SlotEngine (slotEngine.ts) calls shouldFire() on every event.
 */

export type SlotTrigger =
  | "on_use"
  | "on_install"
  | "on_evolve"
  | "on_chain"
  | "on_flush"
  | "*";           // wildcard — fires on any event

export type SlotAction =
  | "notify_user"
  | "auto_install"
  | "unlock_bonus_branch"
  | "flush_memory"
  | "emit_event";

export interface SlotEvent {
  type:     SlotTrigger;
  slug:     string;
  ts:       string;   // ISO 8601
  xpDelta?: number;
}

export interface ConditionalSlot {
  id:             string;
  slug:           string;   // target skill slug (or "*" for any)
  trigger:        SlotTrigger;
  action:         SlotAction;
  enabled:        boolean;
  actionPayload?: Record<string, unknown>;
  lastFiredAt?:   string;
  fireCount:      number;
  createdAt:      string;
}

/** Returns true if slot should fire for the given event. */
export function shouldFire(slot: ConditionalSlot, event: SlotEvent): boolean {
  if (!slot.enabled) return false;
  const triggerMatch = slot.trigger === "*" || slot.trigger === event.type;
  const slugMatch    = slot.slug    === "*" || slot.slug    === event.slug;
  return triggerMatch && slugMatch;
}

/**
 * Returns the default slot set loaded on first boot (no slots.json).
 * One sensible default: auto-flush Gardener memory after every evolution.
 */
export function createDefaultSlots(): ConditionalSlot[] {
  const ts = new Date().toISOString();
  return [
    {
      id:         "default-flush-on-evolve",
      slug:       "*",
      trigger:    "on_evolve",
      action:     "flush_memory",
      enabled:    true,
      fireCount:  0,
      createdAt:  ts,
    },
  ];
}

/**
 * Add a new slot to the collection. Generates a stable ID.
 * Returns the updated slots array.
 */
export function addSlot(
  slots:   ConditionalSlot[],
  partial: Pick<ConditionalSlot, "slug" | "trigger" | "action"> & Partial<ConditionalSlot>
): ConditionalSlot[] {
  const id = `slot-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const slot: ConditionalSlot = {
    id,
    slug:          partial.slug,
    trigger:       partial.trigger,
    action:        partial.action,
    enabled:       partial.enabled   ?? true,
    actionPayload: partial.actionPayload,
    fireCount:     0,
    createdAt:     new Date().toISOString(),
  };
  return [...slots, slot];
}

/**
 * Remove a slot by ID.
 * Returns the updated slots array (unchanged if ID not found).
 */
export function removeSlot(slots: ConditionalSlot[], id: string): ConditionalSlot[] {
  return slots.filter((s) => s.id !== id);
}

/** Toggle a slot’s enabled state. */
export function toggleSlot(
  slots:   ConditionalSlot[],
  id:      string,
  enabled: boolean
): ConditionalSlot[] {
  return slots.map((s) => s.id === id ? { ...s, enabled } : s);
}
