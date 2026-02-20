# ClawTree — User-Defined Branches

You can extend the talent tree with your own branches — no code changes needed. Just edit `config.json` or drop a `.json` file in `branches/`.

---

## Method A — config.json `custom_branches` *(recommended)*

Add a `custom_branches` array to your `<baseDir>/config.json`:

```json
{
  "mode": "hybrid",
  "custom_branches": [
    {
      "name":  "crypto-trading",
      "label": "💹 Crypto Trading",
      "nodes": [
        {
          "slug":         "binance-api",
          "name":         "Binance API",
          "description":  "Real-time spot & futures data via Binance REST/WS",
          "tier":         1,
          "status":       "available",
          "evolveAt":     10,
          "prerequisites": [],
          "unlocks":      ["dex-aggregator"],
          "chainsWith":   ["defi-tracker"]
        },
        {
          "slug":         "dex-aggregator",
          "name":         "DEX Aggregator",
          "description":  "On-chain swap routing across Uniswap, 1inch, etc.",
          "tier":         2,
          "status":       "locked",
          "evolveAt":     15,
          "prerequisites": ["binance-api"],
          "unlocks":      [],
          "chainsWith":   ["on-chain-oracle"]
        }
      ]
    }
  ]
}
```

The branch is loaded automatically at every session start.

---

## Method B — `branches/` folder *(modular, version-control friendly)*

Create a file `<baseDir>/branches/crypto-trading.json` with the same structure:

```
<baseDir>/
├── config.json
└── branches/
    ├── crypto-trading.json
    └── my-devtools.json
```

The `branches/` file takes priority over the `config.json` entry if both define the same `name`.

---

## Method C — `/tree branch` commands *(agent-managed)*

Let the agent manage branches for you:

```bash
# List all custom branches
/tree branch list

# Add a branch (JSON inline)
/tree branch add {"name":"crypto","label":"💹 Crypto","nodes":[{"slug":"binance-api","name":"Binance API","description":"Spot data"}]}

# Remove a custom branch (built-in branches are protected)
/tree branch remove crypto
```

---

## Merge rules

| Rule | Behaviour |
|---|---|
| New branch | Added to talent tree immediately |
| Existing branch, new node | Node appended |
| Existing branch, existing node | **XP and status preserved** (never overwritten) |
| Built-in branch | Protected — cannot be removed via `/tree branch remove` |
| Duplicate name (config + file) | `branches/` file wins |

---

## Node fields reference

| Field | Type | Default | Description |
|---|---|---|---|
| `slug` | `string` | required | Kebab-case unique identifier |
| `name` | `string` | required | Display name |
| `description` | `string` | required | One-sentence description |
| `tier` | `1–5` | `1` | Skill tier (affects XP bar display) |
| `status` | `available\|locked` | `available` | Initial status |
| `evolveAt` | `number` | `10` | Usage count needed to evolve |
| `prerequisites` | `string[]` | `[]` | Slugs that must be installed first |
| `unlocks` | `string[]` | `[]` | Slugs this node unlocks on install |
| `chainsWith` | `string[]` | `[]` | Compatible slugs for +25 XP chain bonus |

---

## Fleet compatibility

Custom branches are included in `/fleet push` and `/fleet sync`. Other agents that pull will receive the branch if it’s present in the fleet tree.
