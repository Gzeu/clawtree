# ClawTree — Talent Tree Reference

## Branches

| Branch | Emoji | Unlocked by | Nodes |
|---|---|---|---|
| Foundation | 🌱 | Always | 5 |
| Web Intelligence | 🌐 | `skill-clawhub` | 4 |
| Blockchain & Web3 | 🔗 | `skill-clawhub` | 4 |
| Security & Trust | 🛡️ | `clawguard` | 4 |
| AI & LLM Pipelines | 🤖 | `skill-clawhub` | 4 |
| Data & Analytics | 📊 | `skill-clawhub` | 4 |
| DevOps & Infra | ⚙️ | `skill-clawhub` | 3 |
| Notifications & Comms | 📡 | `skill-clawhub` | 3 |

## Status Values

| Status | Icon | Meaning |
|---|---|---|
| `locked` | 🔒 | Prerequisites not met |
| `available` | 🔓 | Ready to install |
| `installed` | ✅ | Active, accruing XP |
| `evolved` | ⭐ | Reached 100% XP, tier upgraded |
| `mastered` | 💎 | Max tier reached |

## XP & Evolution

Every time you use a command that invokes a skill, that skill gains XP. When `usageCount / evolveAt` reaches 100%, the skill evolves to the next tier, optionally unlocking new nodes.

Chain bonus: invoking two skills listed in each other’s `chainsWith` on the same task awards +25 XP to both.

## Modes

| Mode | Behaviour |
|---|---|
| `auto` | Agent recommends AND installs at threshold |
| `manual` | No automatic actions; user controls everything |
| `hybrid` | Agent recommends; user approves installs (default) |

## Commands

```
/tree show                  — ASCII talent tree with XP bars
/tree recommend             — top 5 recommendations + history boost
/tree install <slug>        — install a skill with tracking
/tree mode auto|manual|hybrid
/tree evolve <slug>         — force evolution check
```
