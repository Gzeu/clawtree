# ClawTree — Knowledge Graph Reference

## Graph Model

Each skill is a **node**. Relations become **weighted directed edges**:

| Edge type | Weight | Direction | Meaning |
|---|---|---|---|
| `prerequisite` | 1.0 | A → B | A must be installed before B |
| `unlocks` | 0.8 | A → B | Installing A makes B available |
| `chains` | 0.6 | A ↔ B | A + B together = +25 XP bonus |
| `synergy` | 0.4 | A ↔ B | Amplify each other’s capabilities |
| `suggests` | 0.3 | A → B | Recommended to have together |
| `conflicts` | -1.0 | A — B | Should not run simultaneously |

## Semantic Search

Powered by `Xenova/all-MiniLM-L6-v2` (23 MB, fully offline). Embeddings are computed lazily at first search and cached for the session.

Hybrid score formula:
```
hybridScore = semanticScore × 0.7 + keywordScore × 0.3
```

## Pathfinding

Dijkstra’s algorithm with edge cost `= 1 − weight`. High-weight edges (prerequisites) are cheaper to traverse, so the algorithm naturally follows the intended install order.

## Commands

```
/graph show                 — full Mermaid flowchart → reports/skill-graph.md
/graph search <query>       — semantic + keyword hybrid search
/graph path <slug>          — shortest path from any installed skill to target
/graph subgraph <slug>      — BFS depth-2 neighbourhood
/graph recommend <query>    — top 5 semantic recommendations + path
```

## Output files

| File | Contents |
|---|---|
| `skill-graph.json` | Full graph (no embeddings) |
| `reports/skill-graph.md` | Mermaid diagram |
| `reports/*.md` | Ad-hoc subgraph / path renders |
