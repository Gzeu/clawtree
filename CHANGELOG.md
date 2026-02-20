# Changelog — ClawTree

All notable changes are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) | [Semantic Versioning](https://semver.org/).

---

## [1.0.0] — 2026-02-20

### Added
- **Inception Engine**: audit local + ClawHub + GitHub → gap analysis → 3 implementation variants
- **Talent Tree**: 8 branches, 30+ nodes, XP system + automatic evolution
- Management modes: `AUTO` / `MANUAL` / `HYBRID` (default)
- Chain bonus: +25 XP when compatible skills are invoked together
- **V1 Gardener Memory**: `MEMORY.md` Summary Layer + daily Detail Layer logs + `memoryFlush` hook
- **V2 Knowledge Graph**: semantic search via `Xenova/all-MiniLM-L6-v2` (offline, 23MB)
- Dijkstra pathfinding: optimal path to any skill in the tree
- Mermaid renderer: programmatic flowchart with per-status styles
- Graph enricher: auto cross-branch synergy edges
- Safety: prompt injection heuristics + permissions gate
- Commands: `/inception`, `/tree`, `/graph`, `/remember`, `/gardener`
- Mono-repo structure: `skills/clawtree/` as installable skill folder
- CI: test + lint on every PR
- ClawHub auto-publish workflow on release
