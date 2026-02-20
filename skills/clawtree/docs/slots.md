# ClawTree V3 — Conditional Slots

## What are Conditional Slots?

Conditional Slots are an **event-driven rule engine** built into ClawTree. A slot defines a trigger (e.g., "when `decodo` is installed") and an action (e.g., "notify user" or "auto-unlock bonus branch"). Slots fire automatically whenever the matching event occurs.

---

## Slot anatomy

```json
{
  "id":      "slot-1700000000000-abc12",
  "slug":    "decodo",
  "trigger": "on_install",
  "action":  "unlock_bonus_branch",
  "enabled": true,
  "actionPayload": { "branch": "web" },
  "fireCount": 0,
  "createdAt": "2026-02-20T06:00:00.000Z"
}
```

---

## Triggers

| Trigger | Fires when |
|---|---|
| `on_use` | A skill is used in a session |
| `on_install` | A skill is installed |
| `on_evolve` | A skill node evolves |
| `on_chain` | A chain bonus is awarded |
| `on_flush` | Memory is flushed |
| `*` | Any event (wildcard) |

Use `*` in `slug` to match any skill.

---

## Actions

| Action | Effect |
|---|---|
| `notify_user` | Logs a 🔔 notification to the context |
| `auto_install` | Unlocks `actionPayload.targetSlug` from locked → available |
| `unlock_bonus_branch` | Unlocks all locked nodes in `actionPayload.branch` |
| `flush_memory` | Triggers a `MEMORY.md` flush |
| `emit_event` | Emits arbitrary payload to context log |

---

## Commands

```bash
# List all configured slots
/slots list

# Add a slot: notify when 'decodo' is installed
/slots add decodo on_install notify_user

# Add a wildcard slot: flush memory on every evolution
/slots add * on_evolve flush_memory

# Remove a slot by ID
/slots remove slot-1700000000000-abc12

# Manually test a slot trigger
/slots fire on_install decodo
```

---

## Persistence

Slots are stored in `<baseDir>/slots.json`. Slots survive restarts and are loaded on every event via `SlotEngine`.

---

## Module reference

| Module | Exports |
|---|---|
| `src/slots/conditionalSlots.ts` | `shouldFire`, `addSlot`, `removeSlot`, `toggleSlot` |
| `src/slots/slotEngine.ts` | `processEvent` |
| `src/slots/slotPersistence.ts` | `loadSlots`, `saveSlots` |
