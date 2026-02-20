# ClawTree \u2014 Gardener Memory Reference

## Why memory?

OpenClaw AI context resets on every new session. Without memory, your talent tree XP would reset too. Gardener solves this with a two-layer persistence system that survives across restarts.

## Architecture

```
Session start
    \u2502
    \u25BC onSessionStart
    \u2502
    \u251C\u2500 MEMORY.md exists?
    \u2502   \u251C\u2500 YES \u2192 restoreFromMemory(tree)
    \u2502   \u2502           - XP counts restored for all nodes
    \u2502   \u2502           - statuses restored (installed/evolved/mastered)
    \u2502   \u2502           - mode and totalXP restored
    \u2502   \u2514\u2500 NO  \u2192 defaultTree() + initial flush
    \u2502
    \u25BC Running
    \u2502
    \u251C\u2500 Every action  \u2192 appendDetail(memory/YYYY-MM-DD.md)
    \u251C\u2500 Every 10 acts \u2192 flushToMemory (auto)
    \u251C\u2500 /remember     \u2192 flushToMemory (manual)
    \u2514\u2500 onMemoryFlush \u2192 flushToMemory (OpenClaw hook)
```

## MEMORY.md \u2014 Summary Layer

Always loaded at session start. Contains the minimum needed to restore state.

Sections managed by Gardener (\u26A0\uFE0F do not edit manually):
- `TREE_STATE` \u2014 mode, totalXP, lastSaved, installed/available/evolving lists
- `XP_INDEX` \u2014 per-skill XP table with percentages
- `CHAIN_HISTORY` \u2014 last 20 chain bonus events
- `EVOLVE_LOG` \u2014 last 50 evolution events

User-editable section (\u2705 safe to edit):
- `USER_NOTES` \u2014 Gardener never overwrites this section

## memory/YYYY-MM-DD.md \u2014 Detail Layer

Lazy-loaded on demand (e.g., for `/gardener stats` or history-boosted recommendations). One file per day.

Event types logged:

| Event | When |
|---|---|
| `use` | A skill is used in a session |
| `install` | A new skill is installed |
| `evolve` | A node reaches 100% XP and evolves |
| `chain` | A chain bonus is awarded |
| `inception` | An `/inception` query is run |
| `flush` | Memory is flushed to disk |

## Lifecycle hooks in OpenClaw

```json
// In skill.json
"lifecycle": {
  "onSessionStart": "gardener.boot",
  "onMemoryFlush":  "gardener.flush"
}
```

When these hooks fire, ClawTree's Gardener automatically restores or saves tree state. No manual `/remember` needed for normal operation.

## Tips

- Call `/remember` before manually switching OpenClaw contexts or ending a long session
- The `USER_NOTES` section in MEMORY.md is a great place to annotate which skills you use for which projects
- Daily detail logs in `memory/` auto-accumulate; Gardener uses the last 30 days for usage frequency analysis
- To reset completely: delete `MEMORY.md` and `talent-tree.json` (Gardener re-initialises on next session start)
