# Changelog

All notable changes to ClawTree are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

---

## [Unreleased]

### Planned
- Fleet Web UI (dashboard for multi-agent view)

---

## [1.1.0] — 2026-02-20

### Added — User-Defined Branches

**New modules**
- `src/tree/configLoader.ts` — `ClawTreeConfig` type, `loadConfig`, `saveConfig`, `validateBranchDef`
- `src/tree/branchLoader.ts` — `mergeCustomBranches`, `addCustomBranch`, `removeCustomBranch`, `listCustomBranches`

**TreeManager updates**
- Merges custom branches at boot (from `config.json#custom_branches` + `branches/*.json`)
- New methods: `addBranch(def)`, `removeBranch(name)`, `listBranches()`
- XP and status of existing nodes are **never overwritten** during merge

**New commands**
- `/tree branch list` — list all user-defined branches
- `/tree branch add <json>` — add a branch inline
- `/tree branch remove <name>` — remove a custom branch (built-in branches are protected)

**Merge priority** (last wins for duplicate names):
1. Built-in `defaultTree()`
2. `config.json#custom_branches`
3. `branches/*.json` files

**Tests**
- `tests/branches.test.ts` — 8 tests: validateBranchDef, mergeCustomBranches, XP preservation, removeCustomBranch, built-in protection

**Docs**
- `docs/custom-branches.md` — Method A/B/C guide, node fields reference, fleet compatibility
- `config.example.json` — updated with `custom_branches` example

---

## [1.0.0] — 2026-02-20

Initial open-source release. Full V1 + V2 + V3 implemented.

### V3 — Fleet Tree + Conditional Slots

**Fleet Tree — multi-agent shared talent tree**
- `src/fleet/fleetRegistry.ts` — global agent registry in `~/.clawtree/fleet-registry.json`
- `src/fleet/sharedTree.ts` — shared `fleet-tree.json` with max-wins merge strategy
- `src/fleet/fleetSync.ts` — `pullFromFleet` (never downgrades) + `pushToFleet`
- `src/fleet/gardenerAgent.ts` — `syncFleet` orchestrator + `printFleetStatus`
- Commands: `/fleet status | sync | pull | push | register | unregister | list`

**Conditional Slots — event-driven rule engine**
- `src/slots/conditionalSlots.ts` — `shouldFire`, `addSlot`, `removeSlot`, `toggleSlot`
- `src/slots/slotEngine.ts` — `processEvent` with 5 action types
- `src/slots/slotPersistence.ts` — `slots.json` persistence
- Commands: `/slots list | add | remove | fire`

**Tests**
- `tests/fleet.test.ts` — FleetRegistry: register, get, unregister, multi-agent
- `tests/slots.test.ts` — ConditionalSlots: shouldFire, wildcard, add/remove/toggle

**Docs**
- `docs/fleet.md` — Fleet Tree architecture, commands, module reference
- `docs/slots.md` — Conditional Slots anatomy, triggers, actions, commands

---

### V1 + V2 — Core

**Talent Tree (V1)**
- Full TalentTree type system: 8 branches, 32 skill nodes
- TreeManager, Evolver (XP + chain bonuses), Recommender, Renderer, Persistence

**Gardener Memory (V1)**
- Two-layer: `MEMORY.md` summary + `memory/YYYY-MM-DD.md` daily detail logs
- OpenClaw `onSessionStart` + `onMemoryFlush` lifecycle hooks

**Knowledge Graph (V2)**
- Typed weighted DAG, 6 edge types, BFS subgraph extractor
- Offline semantic search via Xenova/all-MiniLM-L6-v2 (23 MB, no API key)
- Dijkstra shortest path + Mermaid flowchart renderer

**Safety**
- PermissionsGate (high-risk combo blocking)
- InjectionHeuristics (10 prompt-injection patterns)

**Inception Engine**
- Full audit + gap analysis + 3 variants (ClawHub CLI + propose fallback)

**Tests (9 suites total)**
- tree, pathfinder, safety, memory, recommender, integration, fleet, slots, branches

**CI / GitHub**
- `.github/workflows/ci.yml` — test + lint + build on push/PR
- `.github/workflows/clawhub-publish.yml` — auto-publish on Release
- Issue templates, PR template, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY
