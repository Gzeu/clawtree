<div align="center">

# 🌳 ClawTree

**The OpenClaw skill that grows your skills.**

Audit → Gap Analysis → Talent Tree → Knowledge Graph → Evolve

[![clawhub install](https://img.shields.io/badge/clawhub-install%20clawtree-brightgreen?style=flat-square)](https://clawhub.com/skills/clawtree)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)
[![OpenClaw Compatible](https://img.shields.io/badge/OpenClaw-compatible-blue?style=flat-square)](https://openclaw.ai)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](CONTRIBUTING.md)
[![CI](https://github.com/Gzeu/clawtree/actions/workflows/ci.yml/badge.svg)](https://github.com/Gzeu/clawtree/actions/workflows/ci.yml)

</div>

---

## What it does

`clawtree` is a meta-skill for the OpenClaw ecosystem: it **manages, recommends, and evolves** your skill collection using a talent-tree model, a semantic knowledge graph, and a persistent Gardener memory layer.

```
/inception "web scraping"   → full audit + gap analysis + 3 install variants
/tree show                  → ASCII talent tree with live XP bars
/tree install <slug>        → install with XP tracking
/graph search "monitoring"  → semantic search (offline embeddings)
/graph path <slug>          → shortest path to any skill (Dijkstra)
/remember                   → flush memory before compaction
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
├── 🌱 Inception Engine    audit + gap + 3 variants automatically
├── 🌳 Talent Tree         DAG of skills with XP + auto-evolution
│   ├── AUTO mode           agent recommends and installs at threshold
│   ├── MANUAL mode         full user control
│   └── HYBRID mode         auto-recommend, manual approve (default)
├── 🧠 Knowledge Graph     semantic search + Dijkstra pathfinding
│   ├── Xenova/all-MiniLM   offline embeddings, 23 MB, no API key needed
│   └── Mermaid renderer    flowchart auto-generated in reports/
└── 💾 Gardener Memory     XP survives restarts via MEMORY.md
    ├── Summary Layer       MEMORY.md — loaded at every session start
    └── Detail Layer        memory/YYYY-MM-DD.md — lazy daily logs
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
| `/graph show` | Mermaid flowchart → reports/skill-graph.md |
| `/graph search <query>` | Hybrid semantic + keyword search |
| `/graph path <slug>` | Shortest path to a skill (Dijkstra) |
| `/graph subgraph <slug>` | BFS depth-2 neighbourhood |
| `/graph recommend <query>` | Semantic recommendations + path |
| `/remember` | Flush MEMORY.md manually |
| `/gardener stats` | Usage stats + top skills + total XP |
| `/gardener flush` | Force flush to MEMORY.md |

---

## Talent Tree — Branches

| Branch | Skills | Unlocked by |
|---|---|---|
| 🌱 Foundation | inception-oracle → clawhub-cli → clawguard → skillscan → publisher | Always |
| 🌐 Web Intelligence | decodo → web-monitor → amadeus → web-oracle | `skill-clawhub` |
| 🔗 Blockchain & Web3 | multiversx-wallet → nft-monitor → defi-tracker → on-chain-oracle | `skill-clawhub` |
| 🛡️ Security & Trust | blocklist → prime-auditor → supply-chain → trust-oracle | `clawguard` |
| 🤖 AI & LLM | model-router → rag-pipeline → prompt-chain → multi-agent | `skill-clawhub` |
| 📊 Data & Analytics | csv-processor → data-pipeline → analytics → insight-oracle | `skill-clawhub` |
| ⚙️ DevOps & Infra | tautulli → rlm-controller → ci-guardian | `skill-clawhub` |
| 📡 Comms | notifier → router → comms-oracle | `skill-clawhub` |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Open a **New Branch Idea** issue to propose new talent-tree branches.

After your first contribution, we’ll add you to the contributors list.

---

## Roadmap

- [x] V1 — Gardener Memory (XP survives restarts)
- [x] V2 — Knowledge Graph (semantic search + Dijkstra + Mermaid)
- [ ] V3 — Fleet Tree (multi-agent shared tree + Web UI + conditional slots)
- [ ] ClawHub publish automation via CI
- [ ] User-defined branches via `config.json`

---

## License

MIT © 2026 [Gzeu](https://github.com/Gzeu) — contributions welcome 🌳
