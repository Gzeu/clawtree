---
name: clawtree
description: Talent tree + knowledge graph for OpenClaw skills. Audit, gap analysis, semantic search, evolve.
metadata: {"openclaw":{"emoji":"🌳","homepage":"https://github.com/Gzeu/clawtree","requires":{"bins":["node","clawhub"]}}}
---

## Commands

- `/inception <query>` — full audit + gap + 3 implementation variants
- `/tree show` — ASCII talent tree with XP bars
- `/tree recommend` — top 5 recommendations + history boost
- `/tree install <slug>` — install skill with XP tracking
- `/tree mode auto|manual|hybrid` — change management mode
- `/tree evolve <slug>` — force evolution check
- `/graph show` — Mermaid flowchart → reports/
- `/graph search <query>` — semantic search (local embeddings)
- `/graph path <slug>` — Dijkstra optimal path to skill
- `/graph subgraph <slug>` — BFS depth-2 subgraph
- `/graph recommend <query>` — semantic recommendations + path
- `/remember` — manual MEMORY.md flush
- `/gardener stats` — usage stats, XP totals, top skills
- `/gardener flush` — force flush

## Permissions

- filesystem: read/write MEMORY.md, memory/, reports/, talent-tree.json
- network: ClawHub API, GitHub API (audit phase only)
- shell: clawhub CLI (install phase only, with user confirmation)
