<div align="center">

# 🌳 ClawTree

**Talent tree + knowledge graph for OpenClaw skills.**

Audit → Gap Analysis → Talent Tree → Knowledge Graph → Evolve

[![clawhub install](https://img.shields.io/badge/clawhub-install%20clawtree-brightgreen?style=flat-square)](https://clawhub.com/skills/clawtree)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)
[![OpenClaw Compatible](https://img.shields.io/badge/OpenClaw-compatible-blue?style=flat-square)](https://openclaw.ai)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](CONTRIBUTING.md)
[![CI](https://github.com/Gzeu/clawtree/actions/workflows/ci.yml/badge.svg)](https://github.com/Gzeu/clawtree/actions/workflows/ci.yml)

</div>

---

## What it does

`clawtree` is a meta-skill for the OpenClaw ecosystem: it **manages, recommends, and evolves** your skill collection like an RPG talent tree.

```
/inception "web scraping"    → full audit + gap analysis + 3 implementation variants
/tree show                   → ASCII talent tree with XP progress bars
/tree install <slug>         → manual install with XP tracking
/graph search "monitoring"   → semantic search with local embeddings
/graph path <slug>           → Dijkstra: optimal path to unlock a skill
/remember                    → flush memory before context compaction
```

---

## Quick Install

```bash
clawhub install clawtree
```

Or manually:

```bash
git clone https://github.com/Gzeu/clawtree
cp -r clawtree/skills/clawtree ~/path/to/your/skills/
```

---

## Architecture

```
clawtree/
├── 🌱 Inception Engine     audit + gap + 3 variants automatically
├── 🌳 Talent Tree          DAG of skills with XP + branch evolution
│   ├── AUTO mode           agent recommends and installs
│   ├── MANUAL mode         you control every step
│   └── HYBRID mode         auto recommend, manual approve (default)
├── 🧠 Knowledge Graph      semantic search + Dijkstra pathfinding
│   ├── Xenova MiniLM-L6    100% offline embeddings (23MB)
│   └── Mermaid renderer    auto-generated flowchart diagrams
└── 💾 Gardener Memory      cross-session persistence via MEMORY.md
    ├── Summary Layer        MEMORY.md — XP + status on every startup
    └── Detail Layer         memory/YYYY-MM-DD.md — lazy daily logs
```

---

## Commands

| Command | Description |
|---|---|
| `/inception <query>` | Full audit + gap + 3 skill variants |
| `/tree show` | ASCII talent tree with XP bars |
| `/tree recommend` | Top 5 recommendations + history boost |
| `/tree install <slug>` | Manual install + XP tracking |
| `/tree mode auto\|manual\|hybrid` | Change management mode |
| `/tree evolve <slug>` | Force evolution check |
| `/graph show` | Mermaid flowchart → reports/ |
| `/graph search <query>` | Semantic search with hybrid score |
| `/graph path <slug>` | Optimal path to a skill (Dijkstra) |
| `/graph subgraph <slug>` | BFS depth-2 subgraph |
| `/graph recommend <query>` | Recommendations with semantic score + path |
| `/remember` | Manual MEMORY.md flush |
| `/gardener stats` | Usage stats, XP, top skills |

---

## Talent Tree — Branches

| Branch | Skills | Unlock with |
|---|---|---|
| 🌱 Foundation | inception-oracle → clawhub-cli → clawguard → skillscan → publisher | Always unlocked |
| 🌐 Web Intelligence | decodo → web-monitor → amadeus → web-oracle | `skill-clawhub` |
| 🔗 Blockchain & Web3 | multiversx-wallet → nft-monitor → defi-tracker → on-chain-oracle | `skill-clawhub` |
| 🛡️ Security & Trust | blocklist → prime-auditor → supply-chain → trust-oracle | `clawguard` |
| 🤖 AI & LLM | model-router → rag-pipeline → prompt-chain → multi-agent | `skill-clawhub` |
| 📊 Data & Analytics | csv-processor → data-pipeline → analytics → insight-oracle | `skill-clawhub` |
| ⚙️ DevOps & Infra | tautulli → rlm-controller → ci-guardian | `skill-clawhub` |
| 📡 Comms | notifier → router → comms-oracle | `skill-clawhub` |

---

## Mono-repo structure

```
clawtree/
├── skills/
│   └── clawtree/         ← OpenClaw skill (install this folder)
│       ├── SKILL.md
│       ├── index.ts
│       ├── src/
│       │   ├── audit/
│       │   ├── gap/
│       │   ├── propose/
│       │   ├── plan/
│       │   ├── tree/
│       │   ├── graph/
│       │   ├── memory/
│       │   └── safety/
│       └── tests/
├── .github/
│   ├── workflows/        ← CI + ClawHub auto-publish
│   └── ISSUE_TEMPLATE/
├── CONTRIBUTING.md
├── CHANGELOG.md
└── README.md
```

---

## Roadmap

- [x] V1 — Gardener Memory (cross-session XP persistence)
- [x] V2 — Knowledge Graph (semantic search + Dijkstra + Mermaid)
- [ ] V3 — Fleet Tree (multi-agent shared tree + Web UI + conditional slots)
- [ ] User-defined branches via `config.json`
- [ ] ClawHub auto-publish via CI

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). PRs welcome — especially new branches for the talent tree!

---

## License

MIT © 2026 [George Pricop](https://github.com/Gzeu)
