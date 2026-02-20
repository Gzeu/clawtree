<div align="center">

# 🌳 ClawTree

**The OpenClaw skill that grows your skills.**

Audit → Gap Analysis → Talent Tree → Knowledge Graph → Evolve

[![clawhub install](https://img.shields.io/badge/clawhub-install%20clawtree-brightgreen?style=flat-square)](https://clawhub.com/skills/clawtree)
[![Version](https://img.shields.io/badge/version-1.0.0-blue?style=flat-square)](https://github.com/Gzeu/clawtree/releases/tag/v1.0.0)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)
[![OpenClaw Compatible](https://img.shields.io/badge/OpenClaw-compatible-blueviolet?style=flat-square)](https://openclaw.ai)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Node](https://img.shields.io/badge/Node-%3E%3D20-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![CI](https://github.com/Gzeu/clawtree/actions/workflows/ci.yml/badge.svg)](https://github.com/Gzeu/clawtree/actions/workflows/ci.yml)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](CONTRIBUTING.md)

</div>

---

## What it does

`clawtree` is a **meta-skill** for the OpenClaw ecosystem: it manages, recommends, and evolves your skill collection using a talent-tree model, a semantic knowledge graph, and a persistent Gardener memory layer that survives across agent restarts.

```
/inception "web scraping"   → full audit + gap analysis + 3 install variants
/tree show                  → ASCII talent tree with live XP bars
/tree install <slug>        → install with XP tracking + auto-unlock
/graph search "monitoring"  → semantic search (offline, no API key)
/graph path <slug>          → shortest path to any skill (Dijkstra)
/fleet sync                 → merge all agent trees into shared fleet tree
/slots add * on_evolve flush_memory  → auto-flush on every evolution
/remember                   → flush memory before context compaction
```

---

## Quick install

```bash
clawhub install clawtree
```

Or manually:

```bash
git clone https://github.com/Gzeu/clawtree
cp -r clawtree/skills/clawtree ~/path/to/your/openclaw/skills/
```

---

## Architecture

```
clawtree/
├── 🔍 Inception Engine    audit + gap + 3 variants automatically
├── 🌳 Talent Tree         DAG of skills with XP + auto-evolution
│   ├── AUTO mode           agent recommends and installs at threshold
│   ├── MANUAL mode         full user control
│   └── HYBRID mode         auto-recommend, manual approve (default)
├── 🧠 Knowledge Graph     semantic search + Dijkstra pathfinding
│   ├── Xenova/all-MiniLM   offline embeddings, 23 MB, no API key
│   └── Mermaid renderer    flowchart auto-generated in reports/
├── 💾 Gardener Memory     XP survives restarts via MEMORY.md
│   ├── Summary Layer       MEMORY.md — always loaded at session start
│   └── Detail Layer        memory/YYYY-MM-DD.md — lazy daily logs
├── 🌍 Fleet Tree (V3)     multi-agent shared talent tree
│   ├── fleetRegistry       register/list agents globally
│   ├── sharedTree          ~/.clawtree/fleet-tree.json (max-wins merge)
│   └── fleetSync           push/pull between personal and fleet
└── 🔧 Conditional Slots (V3)  event-driven rule engine
    ├── Triggers            on_use | on_install | on_evolve | on_chain | *
    └── Actions             notify | auto_install | unlock_branch | flush | emit
```

---

## File structure

```
skills/clawtree/
├── index.ts                     command router
├── skill.json                   ClawHub manifest (triggers + lifecycle)
├── SKILL.md                     OpenClaw manifest
├── config.example.json          default config
├── src/
│   ├── tree/       (6 files)    SkillTree, Manager, Evolver, Recommender, Renderer, Persistence
│   ├── memory/     (4 files)    Gardener, SummaryIndex, DetailLayer, MemoryFlush
│   ├── graph/      (6 files)    KnowledgeGraph, SemanticSearch, Pathfinder, Mermaid, Persistence, Enricher
│   ├── safety/     (2 files)    PermissionsGate, InjectionHeuristics
│   ├── audit/      (1 file)     localClawhub (Inception Engine)
│   ├── fleet/      (4 files)    FleetRegistry, SharedTree, FleetSync, GardenerAgent
│   └── slots/      (3 files)    ConditionalSlots, SlotEngine, SlotPersistence
├── tests/          (8 suites)   tree, pathfinder, safety, memory, recommender, integration, fleet, slots
└── docs/
    ├── architecture.md          full system architecture
    ├── talent-tree.md           branch reference, XP rules, modes
    ├── knowledge-graph.md       edge types, semantic search, pathfinding
    ├── memory.md                Gardener two-layer memory system
    ├── fleet.md                 Fleet Tree: multi-agent shared tree
    └── slots.md                 Conditional Slots: event-driven rules
```

---

## All commands

| Command | Description |
|---|---|
| `/inception <query>` | Audit + gap analysis + 3 install variants |
| `/tree show` | ASCII talent tree with XP bars |
| `/tree recommend` | Top 5 recommendations + 30-day history boost |
| `/tree install <slug>` | Install a skill with XP tracking |
| `/tree mode auto\|manual\|hybrid` | Change management mode |
| `/tree evolve <slug>` | Force evolution check |
| `/graph show` | Mermaid flowchart → `reports/skill-graph.md` |
| `/graph search <query>` | Hybrid semantic + keyword search |
| `/graph path <slug>` | Shortest path to a skill (Dijkstra) |
| `/graph subgraph <slug>` | BFS depth-2 neighbourhood |
| `/graph recommend <query>` | Semantic recommendations + path |
| `/remember` | Flush `MEMORY.md` manually |
| `/gardener stats` | Usage stats + top skills + total XP |
| `/gardener flush` | Force flush to `MEMORY.md` |
| `/fleet status` | Show registered agents + fleet summary |
| `/fleet sync` | Merge all agents into shared fleet tree |
| `/fleet pull` | Upgrade personal tree from fleet |
| `/fleet push` | Contribute personal tree to fleet |
| `/fleet register <name> <path>` | Register an agent |
| `/fleet list` | List all registered agents |
| `/slots list` | List all conditional slots |
| `/slots add <slug> <trigger> <action>` | Create a conditional slot |
| `/slots remove <id>` | Remove a slot by ID |
| `/slots fire <event> <slug>` | Manually test a slot trigger |

---

## Talent Tree — Branches

| Branch | Skills | Unlocked by |
|---|---|---|
| 🌱 Foundation | clawtree → clawhub-cli → clawguard → skillscan → publisher | Always |
| 🌐 Web Intelligence | decodo → web-monitor → amadeus → web-oracle | `skill-clawhub` |
| 🔗 Blockchain & Web3 | multiversx-wallet → nft-monitor → defi-tracker → on-chain-oracle | `skill-clawhub` |
| 🛡️ Security & Trust | blocklist → prime-auditor → supply-chain → trust-oracle | `clawguard` |
| 🤖 AI & LLM | model-router → rag-pipeline → prompt-chain → multi-agent | `skill-clawhub` |
| 📊 Data & Analytics | csv-processor → data-pipeline → analytics → insight-oracle | `skill-clawhub` |
| ⚙️ DevOps & Infra | tautulli → rlm-controller → ci-guardian | `skill-clawhub` |
| 📡 Comms | notifier → router → comms-oracle | `skill-clawhub` |

---

## Safety

ClawTree's `PermissionsGate` checks every skill before install:
- Skills requesting `shell + filesystem + network` simultaneously require **explicit user confirmation**
- Unknown permission strings are **blocked by default**

`InjectionHeuristics` scans all user queries and skill metadata for 10 prompt-injection patterns before executing any command.

---

## OpenClaw lifecycle hooks

```json
"lifecycle": {
  "onSessionStart": "gardener.boot",
  "onMemoryFlush":  "gardener.flush"
}
```

Your XP state is automatically restored at session start and saved before context compaction. No manual `/remember` needed for normal operation.

---

## Docs

- [`docs/architecture.md`](skills/clawtree/docs/architecture.md) — full system architecture
- [`docs/talent-tree.md`](skills/clawtree/docs/talent-tree.md) — branch reference, XP rules, modes
- [`docs/knowledge-graph.md`](skills/clawtree/docs/knowledge-graph.md) — graph model, edge types, semantic search
- [`docs/memory.md`](skills/clawtree/docs/memory.md) — Gardener two-layer memory
- [`docs/fleet.md`](skills/clawtree/docs/fleet.md) — Fleet Tree: multi-agent shared tree
- [`docs/slots.md`](skills/clawtree/docs/slots.md) — Conditional Slots: event-driven rules
- [`CHANGELOG.md`](CHANGELOG.md) — full release notes

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Open a **New Branch Idea** issue to propose new skill branches.

After your first contribution, we’ll add you to the contributors list. ❤️

---

## Roadmap

- [x] V1 — Gardener Memory (XP survives restarts)
- [x] V2 — Knowledge Graph (semantic search + Dijkstra + Mermaid)
- [x] V3 — Fleet Tree (multi-agent shared tree + Conditional Slots)
- [x] ClawHub publish automation via CI
- [ ] User-defined branches via `config.json`
- [ ] Fleet Web UI (dashboard for multi-agent view)

---

## License

MIT © 2026 [Gzeu](https://github.com/Gzeu) — contributions welcome 🌳
