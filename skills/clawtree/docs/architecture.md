# Architecture

## Overview

ClawTree is a mono-repo skill with a layered architecture:

```
Query
  ↓
[Safety Gate]         injectionHeuristics + permissionsGate
  ↓
[Inception Engine]    audit + gap analysis + 3 variants
  ↓
[Talent Tree]         DAG nodes, XP, evolution, AUTO/MANUAL/HYBRID
  ↓
[Knowledge Graph]     semantic search + Dijkstra + Mermaid
  ↓
[Gardener Memory]     MEMORY.md Summary + daily Detail Layer
  ↓
Output + flush
```

## Module Map

| Module | Path | Responsibility |
|---|---|---|
| Inception Engine | `src/audit/` + `src/gap/` + `src/propose/` | Discover, compare, generate skill variants |
| Talent Tree | `src/tree/` | DAG nodes, XP tracking, evolution, rendering |
| Knowledge Graph | `src/graph/` | Edges, semantic search, pathfinding, Mermaid |
| Gardener Memory | `src/memory/` | Persist state across sessions via MEMORY.md |
| Safety | `src/safety/` | Injection detection, permissions enforcement |

## Data Flow: Session Start

1. `TreeManager` instantiated
2. `Gardener.boot(tree)` → reads `MEMORY.md`
3. Tree nodes restored with XP/status from Summary Layer
4. Knowledge Graph loaded from `skill-graph.json` (or rebuilt)
5. Embeddings loaded lazily on first `/graph search`

## Data Flow: Session End / Compaction

1. OpenClaw fires `onMemoryFlush` lifecycle event
2. `memoryFlush.ts` writes all XP + status to `MEMORY.md`
3. Daily log appended to `memory/YYYY-MM-DD.md`
4. Graph saved to `skill-graph.json` (without embeddings)
