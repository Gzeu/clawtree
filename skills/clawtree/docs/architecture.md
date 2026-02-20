# ClawTree — Architecture

## Overview

ClawTree is a meta-skill for the OpenClaw ecosystem. It manages, recommends, and evolves your skill collection using a talent-tree model, a knowledge graph, and a persistent Gardener memory layer.

```
User query
    │
    ▼
[index.ts]  ── command router ─────────────────────────────▶ Safety Gate
    │                                                  (injectionHeuristics
    ├── /tree   ─▶ TreeManager ─▶ evolver / renderer     permissionsGate)
    ├── /graph  ─▶ KnowledgeGraph ─▶ semanticSearch
    │                           └─▶ Pathfinder (Dijkstra)
    │                           └─▶ MermaidRenderer
    └── /remember, /gardener ─▶ Gardener ─▶ MEMORY.md (Summary Layer)
                                          └─▶ memory/YYYY-MM-DD.md (Detail Layer)
```

## Layers

### Talent Tree (`src/tree/`)
- **skillTree.ts** — type definitions (`TalentTree`, `SkillNode`, `Branch`)
- **treeManager.ts** — orchestrates use-tracking, evolution checks, mode handling
- **evolver.ts** — checks if a node has reached 100% XP and triggers tier upgrade
- **recommender.ts** — keyword-based (V1) and semantic-boosted (V2) suggestions
- **renderer.ts** — ASCII art talent-tree renderer for `/tree show`
- **persistence.ts** — read/write `talent-tree.json`

### Knowledge Graph (`src/graph/`)
- **knowledgeGraph.ts** — DAG with typed, weighted edges; BFS subgraph extractor
- **semanticSearch.ts** — offline embeddings via `Xenova/all-MiniLM-L6-v2` + cosine similarity
- **pathfinder.ts** — Dijkstra shortest-path from installed skills to any target
- **mermaidRenderer.ts** — programmatic Mermaid flowchart generation
- **graphPersistence.ts** — save/load `skill-graph.json` (embeddings stripped)
- **graphEnricher.ts** — adds cross-branch synergies and suggests edges

### Gardener Memory (`src/memory/`)
- **summaryIndex.ts** — MEMORY.md read/write (lean, always loaded at session start)
- **detailLayer.ts** — `memory/YYYY-MM-DD.md` daily logs (lazy-loaded on demand)
- **memoryFlush.ts** — `flushToMemory` + `restoreFromMemory` (OpenClaw lifecycle hooks)
- **gardener.ts** — orchestrator: boot, logEvent, flush, enrichedRecommendations, stats

### Safety (`src/safety/`)
- **permissionsGate.ts** — validates permission arrays; blocks high-risk combos
- **injectionHeuristics.ts** — regex-based prompt-injection detector

## OpenClaw Lifecycle Integration

| Hook | ClawTree action |
|---|---|
| `onSessionStart` | `gardener.boot(tree)` — restores from MEMORY.md |
| `onMemoryFlush` | `flushToMemory(tree, baseDir)` — writes before compaction |
| `triggers.keywords` | Routes `/tree`, `/graph`, `/remember`, `/gardener` |

## Data Flow on Restart

```
OpenClaw restarts
  │
  ▼ onSessionStart
  │
  ├─ MEMORY.md exists? ─▶ YES ─▶ restoreFromMemory(tree)
  │                                  └─ XP, status, totalXP restored ✓
  └───────────────────▶ NO  ─▶ default tree + initial flush
```
