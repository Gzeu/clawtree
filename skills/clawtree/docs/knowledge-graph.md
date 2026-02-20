# Knowledge Graph

## Edge Types

| Type | Direction | Weight | Meaning |
|---|---|---|---|
| `prerequisite` | A → B | 1.0 | A must be installed before B |
| `unlocks` | A → B | 0.8 | Installing A makes B available |
| `chains` | A ↔ B | 0.6 | A + B = +25 XP bonus |
| `synergy` | A ↔ B | 0.4 | A and B amplify each other |
| `suggests` | A → B | 0.3 | Recommended to have both |
| `conflicts` | A ↔ B | -1.0 | A and B cannot coexist |

## Semantic Search

Uses `Xenova/all-MiniLM-L6-v2` (23MB, fully offline). Each node is embedded as:
```
{name} {description} {tags.join(' ')}
```

Search uses a **hybrid score**: 70% semantic similarity + 30% keyword overlap.

## Pathfinding

Dijkstra algorithm on the directed graph. Edge cost = `1 - weight`. Lower weight edges (like `prerequisite` with weight 1.0) have cost 0, so they are preferred paths.

## Cross-Branch Synergies

Defined in `src/graph/graphEnricher.ts`. Example:
- `ai-rag-pipeline` ⇔ `decodo` (Web + AI: scraping → RAG context)
- `comms-notifier` ⇔ `multiversx-nft-monitor` (NFT alert → instant notification)
- `trust-oracle` ⇔ `clawhub-publisher` (Publish safely after full audit)
