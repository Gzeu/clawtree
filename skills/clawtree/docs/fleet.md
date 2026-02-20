# ClawTree V3 — Fleet Tree

## What is Fleet Tree?

Fleet Tree enables **multiple OpenClaw agents to share a single talent tree**. Each agent has its own personal tree (upgraded through normal use), but all agents can sync upgrades into a shared `fleet-tree.json` stored in `~/.clawtree/`.

This means: if Agent A installs and evolves `decodo`, Agent B can pull that upgrade into its own tree without having to earn it separately.

---

## Architecture

```
Agent Alpha          Agent Beta           Agent Gamma
  personal tree  ►►►►►►►►►►►►►►►►►►►  personal tree
                         ▼              ▲
                 ~/.clawtree/
                   fleet-tree.json      (shared, max-wins merge)
                   fleet-registry.json  (agent index)
```

**Merge strategy: max-wins.** The fleet tree always reflects the *most advanced* status for each node across all agents. Personal trees never downgrade from fleet pulls.

---

## Commands

| Command | Description |
|---|---|
| `/fleet status` | Show all registered agents + fleet summary |
| `/fleet sync` | Merge all agents' trees into fleet-tree.json |
| `/fleet pull` | Upgrade your personal tree from the fleet |
| `/fleet push` | Contribute your personal tree to the fleet |
| `/fleet register <name> <path>` | Register an agent by base directory path |
| `/fleet unregister <name>` | Remove an agent from the registry |
| `/fleet list` | List all registered agents |

---

## Files

| File | Location | Purpose |
|---|---|---|
| `fleet-registry.json` | `~/.clawtree/` | Global index of registered agents |
| `fleet-tree.json` | `~/.clawtree/` | Shared max-wins talent tree |

---

## Quick start (2 agents)

```bash
# Register both agents
/fleet register main     ~/projects/agent-main/.clawtree
/fleet register assistant ~/projects/agent-assist/.clawtree

# Sync from all agents → fleet tree
/fleet sync

# Pull fleet upgrades into your personal tree
/fleet pull
```

---

## Module reference

| Module | Exports |
|---|---|
| `src/fleet/fleetRegistry.ts` | `registerAgent`, `unregisterAgent`, `listAgents`, `getAgent` |
| `src/fleet/sharedTree.ts` | `loadSharedTree`, `saveSharedTree`, `mergeIntoFleet` |
| `src/fleet/fleetSync.ts` | `pullFromFleet`, `pushToFleet` |
| `src/fleet/gardenerAgent.ts` | `syncFleet`, `printFleetStatus` |
