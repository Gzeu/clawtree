# Changelog

All notable changes to ClawTree are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

---

## [Unreleased]

### Planned (V3)
- Fleet Tree: multi-agent shared talent tree
- Web UI via ClawHub dashboard
- Conditional skill slots (context-aware auto-swap)
- User-defined branches via `config.json`

---

## [1.0.0] \u2014 2026-02-20

Initial open-source release.

### Added

**Core \u2014 Talent Tree (V1)**
- `src/tree/skillTree.ts` \u2014 full TalentTree type system with 8 branches and 32 skill nodes
- `src/tree/treeManager.ts` \u2014 orchestrator with XP tracking, evolution, mode management
- `src/tree/evolver.ts` \u2014 addXP, evolveCheck, chainBonus, findNode
- `src/tree/recommender.ts` \u2014 autoRecommend (rule-based) + semanticRecommend (graph-based)
- `src/tree/renderer.ts` \u2014 ASCII art talent tree with live XP bars
- `src/tree/persistence.ts` \u2014 loadTree / saveTree with first-run fallback

**Gardener Memory Layer (V1)**
- `src/memory/summaryIndex.ts` \u2014 MEMORY.md read/write with USER_NOTES preservation
- `src/memory/detailLayer.ts` \u2014 daily `memory/YYYY-MM-DD.md` event logs
- `src/memory/memoryFlush.ts` \u2014 flushToMemory + restoreFromMemory (OpenClaw lifecycle)
- `src/memory/gardener.ts` \u2014 orchestrator with 30-day usage frequency boost

**Knowledge Graph (V2)**
- `src/graph/knowledgeGraph.ts` \u2014 DAG with 6 typed edge types, BFS subgraph extractor
- `src/graph/semanticSearch.ts` \u2014 offline embeddings via Xenova/all-MiniLM-L6-v2 (23 MB)
- `src/graph/pathfinder.ts` \u2014 Dijkstra shortest path from installed skills to target
- `src/graph/mermaidRenderer.ts` \u2014 programmatic Mermaid flowchart generation
- `src/graph/graphPersistence.ts` \u2014 save/load skill-graph.json
- `src/graph/graphEnricher.ts` \u2014 cross-branch synergies + tier-adjacent suggests edges

**Safety**
- `src/safety/permissionsGate.ts` \u2014 validates permissions, blocks high-risk combos
- `src/safety/injectionHeuristics.ts` \u2014 10-pattern prompt-injection detector

**Inception Engine**
- `src/audit/localClawhub.ts` \u2014 audit + gap analysis + 3 variants (ClawHub CLI + propose fallback)

**Main entrypoint**
- `index.ts` \u2014 command router: /inception, /tree, /graph, /remember, /gardener

**Tests (5 suites)**
- `tests/tree.test.ts` \u2014 KnowledgeGraph build + edges
- `tests/pathfinder.test.ts` \u2014 Dijkstra correctness
- `tests/safety.test.ts` \u2014 PermissionsGate + InjectionHeuristics
- `tests/memory.test.ts` \u2014 SummaryIndex round-trip + DetailLayer
- `tests/recommender.test.ts` \u2014 autoRecommend urgency + sort
- `tests/integration.test.ts` \u2014 full run() smoke tests

**CI / GitHub**
- `.github/workflows/ci.yml` \u2014 test + lint + build on every push/PR
- `.github/workflows/clawhub-publish.yml` \u2014 auto-publish to ClawHub on GitHub Release
- `.github/ISSUE_TEMPLATE/` \u2014 bug, feature, new-branch-idea templates
- `.github/PULL_REQUEST_TEMPLATE.md`

**Documentation**
- `docs/architecture.md` \u2014 full system architecture with ASCII diagrams
- `docs/talent-tree.md` \u2014 branch reference, status values, XP rules, modes
- `docs/knowledge-graph.md` \u2014 graph model, edge types, semantic search, pathfinding
- `docs/memory.md` \u2014 Gardener two-layer memory architecture
- `SKILL.md` \u2014 OpenClaw manifest with triggers and lifecycle hooks
- `skill.json` \u2014 ClawHub manifest with triggers, lifecycle, default config
- `README.md` \u2014 full reference with all commands, architecture, roadmap
- `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `LICENSE` (MIT)
