---
name: clawtree
version: 1.0.0
description: Talent tree + knowledge graph for OpenClaw skills. Audit, gap analysis, semantic search, evolve.
metadata:
  openclaw:
    emoji: "\U0001F333"
    homepage: https://github.com/Gzeu/clawtree
    requires:
      bins: [node, clawhub]
    lifecycle:
      onSessionStart: gardener.boot
      onMemoryFlush:  gardener.flush
    triggers:
      keywords:
        - /inception
        - /tree
        - /graph
        - /remember
        - /gardener
---

## Commands

### Inception Engine

- `/inception <query>` \u2014 full audit + gap analysis + 3 implementation variants

### Talent Tree

- `/tree show` \u2014 ASCII talent tree with live XP bars
- `/tree recommend` \u2014 top 5 recommendations + 30-day history boost
- `/tree install <slug>` \u2014 install a skill with XP tracking
- `/tree mode auto|manual|hybrid` \u2014 change management mode
- `/tree evolve <slug>` \u2014 force evolution check

### Knowledge Graph

- `/graph show` \u2014 Mermaid flowchart \u2192 reports/skill-graph.md
- `/graph search <query>` \u2014 semantic search (local embeddings, no API key)
- `/graph path <slug>` \u2014 Dijkstra optimal path from any installed skill
- `/graph subgraph <slug>` \u2014 BFS depth-2 neighbourhood
- `/graph recommend <query>` \u2014 semantic recommendations + path

### Gardener Memory

- `/remember` \u2014 flush MEMORY.md before context compaction
- `/gardener stats` \u2014 usage stats + XP totals + top-5 skills
- `/gardener flush` \u2014 force MEMORY.md flush

## Permissions

- `filesystem` \u2014 read/write `MEMORY.md`, `memory/`, `reports/`, `talent-tree.json`
- `network` \u2014 ClawHub API, GitHub API (audit phase only)
- `shell` \u2014 `clawhub` CLI (install phase only, user confirmation required)

## Lifecycle hooks

| Hook | Action |
|---|---|
| `onSessionStart` | `gardener.boot(tree)` \u2014 restores XP state from `MEMORY.md` |
| `onMemoryFlush` | `gardener.flush(tree)` \u2014 saves state before context compaction |
