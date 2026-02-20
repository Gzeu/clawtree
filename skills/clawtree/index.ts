import { TreeManager }      from "./src/tree/treeManager";
import { buildFromTree }    from "./src/graph/knowledgeGraph";
import { enrichGraph }      from "./src/graph/graphEnricher";
import { semanticSearch }   from "./src/graph/semanticSearch";
import { findAllPaths }     from "./src/graph/pathfinder";
import { subgraph }         from "./src/graph/knowledgeGraph";
import { renderMermaid, saveMermaid, renderPath } from "./src/graph/mermaidRenderer";
import { loadGraph, saveGraph }                  from "./src/graph/graphPersistence";
import { semanticRecommend }                     from "./src/tree/recommender";
import { runInception }     from "./src/audit/localClawhub";
import { checkInjection }   from "./src/safety/injectionHeuristics";
import { checkPermissions } from "./src/safety/permissionsGate";

// V3 Fleet Tree
import { registerAgent, unregisterAgent, listAgents } from "./src/fleet/fleetRegistry";
import { syncFleet, printFleetStatus }               from "./src/fleet/gardenerAgent";
import { pullFromFleet, pushToFleet }                from "./src/fleet/fleetSync";

// V3 Conditional Slots
import { processEvent }      from "./src/slots/slotEngine";
import { loadSlots, saveSlots } from "./src/slots/slotPersistence";
import { addSlot, removeSlot } from "./src/slots/conditionalSlots";

export async function run(
  params: { query: string; baseDir?: string },
  context: { log: (msg: string) => void; baseDir: string }
) {
  const query   = params.query?.trim() ?? "";
  const baseDir = params.baseDir ?? context.baseDir;

  // ── Safety first ─────────────────────────────────────────────────────
  if (checkInjection(query)) {
    context.log("[CLAWTREE] ⚠️ Potential prompt injection detected. Aborting.");
    return { error: "injection_detected" };
  }

  const treeManager = new TreeManager(baseDir);

  // ── /inception ──────────────────────────────────────────────────────
  if (query.startsWith("/inception")) {
    const q = query.replace("/inception", "").trim();
    return await runInception(q, treeManager.getTree(), baseDir, context);
  }

  // ── /tree ──────────────────────────────────────────────────────────
  if (query.startsWith("/tree")) {
    const args = query.split(" ");
    const cmd  = args[1];
    switch (cmd) {
      case "show":      treeManager.printTree();                  break;
      case "recommend": treeManager.printRecommendations();       break;
      case "install":   await treeManager.installSkill(args[2]);  break;
      case "evolve":    treeManager.forceEvolve(args[2]);         break;
      case "mode":      treeManager.setMode(args[2] as any);      break;
      default:
        context.log("[CLAWTREE] /tree: show | recommend | install <slug> | evolve <slug> | mode auto|manual|hybrid");
    }
    return { success: true };
  }

  // ── /graph ─────────────────────────────────────────────────────────
  if (query.startsWith("/graph")) {
    const args  = query.split(" ");
    const cmd   = args[1];
    let graph   = loadGraph(baseDir) ?? buildFromTree(treeManager.getTree());
    enrichGraph(graph, treeManager.getTree());

    switch (cmd) {
      case "show": {
        const outFile = saveMermaid(graph, baseDir);
        context.log(renderMermaid(graph));
        context.log(`\n[CLAWTREE] ✓ Diagram saved: ${outFile}`);
        break;
      }
      case "search": {
        const q       = args.slice(2).join(" ");
        const results = await semanticSearch(graph, q, 5);
        context.log(`\n🧠 Semantic search: "${q}"\n`);
        for (const r of results) {
          context.log(`  ${(r.score * 100).toFixed(1)}% — \`${r.node.slug}\` [${r.node.status}] — ${r.node.description}`);
        }
        break;
      }
      case "path": {
        const target = args[2];
        const paths  = findAllPaths(graph, target);
        if (!paths.length) {
          context.log(`[CLAWTREE] ✗ No path found to \`${target}\``);
        } else {
          const best = paths[0];
          context.log(`\n🗺️ Shortest path → \`${target}\` (${best.hops} hops)\n`);
          context.log(best.summary);
          context.log("\n" + renderPath(graph, best.path));
        }
        break;
      }
      case "subgraph": {
        const center = args[2];
        const sub    = subgraph(graph, [center], 2);
        context.log(renderMermaid(sub, { highlightSlugs: [center] }));
        break;
      }
      case "recommend": {
        const q    = args.slice(2).join(" ");
        const recs = await semanticRecommend(graph, q);
        context.log(`\n🧠 Semantic recommendations for: "${q}"\n`);
        for (const r of recs) {
          const badge = { now: "🟢", soon: "🟡", future: "🔵" }[r.urgency];
          context.log(`${badge} \`${r.slug}\` — ${r.reason}`);
        }
        break;
      }
      default:
        context.log("[CLAWTREE] /graph: show | search <q> | path <slug> | subgraph <slug> | recommend <q>");
    }

    saveGraph(baseDir, graph);
    return { success: true };
  }

  // ── /remember / /gardener ──────────────────────────────────────────
  if (query === "/remember" || query.startsWith("/gardener")) {
    const args = query.split(" ");
    const cmd  = args[1] ?? "flush";
    if (cmd === "flush" || query === "/remember") {
      treeManager.flush();
      context.log("[CLAWTREE] 💾 MEMORY.md flushed successfully.");
    } else if (cmd === "stats") {
      const stats = treeManager.getStats();
      context.log(`\n📊 Gardener Stats\n  Total XP  : ${stats.totalXP}\n  Installed : ${stats.installed}\n  Last save : ${stats.lastSaved}`);
      if (stats.topUsed.length) {
        context.log("  Top used  : " + stats.topUsed.map(([s, n]) => `${s}(${n}x)`).join(", "));
      }
    }
    return { success: true };
  }

  // ── /fleet (V3) ─────────────────────────────────────────────────────
  if (query.startsWith("/fleet")) {
    const args = query.split(" ");
    const cmd  = args[1];
    const tree = treeManager.getTree();

    switch (cmd) {
      // /fleet status
      case "status": {
        printFleetStatus();
        break;
      }

      // /fleet sync
      case "sync": {
        context.log("[CLAWTREE] 🔄 Syncing fleet...");
        const status = syncFleet();
        context.log(
          `\n🌳 Fleet Sync Complete\n` +
          `  Agents    : ${status.agents}\n` +
          `  Total XP  : ${status.totalXP}\n` +
          `  Installed : ${status.installed} | Available: ${status.available} | Locked: ${status.locked}`
        );
        break;
      }

      // /fleet pull   — upgrade personal tree from fleet
      case "pull": {
        const result = pullFromFleet(tree);
        treeManager.flush();
        context.log(`\n⬇️  Fleet Pull: ${result.changed} node(s) upgraded`);
        for (const d of result.details) context.log(d);
        break;
      }

      // /fleet push   — contribute personal tree to fleet
      case "push": {
        const upgraded = pushToFleet(tree);
        context.log(`\n⬆️  Fleet Push: ${upgraded} fleet node(s) updated from your tree`);
        break;
      }

      // /fleet register <name> <path>
      case "register": {
        const [, , name, agentPath] = args;
        if (!name || !agentPath) {
          context.log("[CLAWTREE] Usage: /fleet register <name> <path>");
          break;
        }
        registerAgent(name, agentPath);
        context.log(`[CLAWTREE] ✓ Agent '${name}' registered`);
        break;
      }

      // /fleet unregister <name>
      case "unregister": {
        const name = args[2];
        if (!name) { context.log("[CLAWTREE] Usage: /fleet unregister <name>"); break; }
        const ok = unregisterAgent(name);
        context.log(ok ? `[CLAWTREE] ✓ Agent '${name}' removed` : `[CLAWTREE] Agent '${name}' not found`);
        break;
      }

      // /fleet list
      case "list": {
        const agents = listAgents();
        if (!agents.length) { context.log("[FLEET] No agents registered."); break; }
        context.log("\n[FLEET] Registered agents:\n");
        for (const a of agents) context.log(`  • ${a.name.padEnd(24)} ${a.path}`);
        break;
      }

      default:
        context.log("[CLAWTREE] /fleet: status | sync | pull | push | register <name> <path> | unregister <name> | list");
    }
    return { success: true };
  }

  // ── /slots (V3) ─────────────────────────────────────────────────────
  if (query.startsWith("/slots")) {
    const args    = query.split(" ");
    const cmd     = args[1];
    const tree    = treeManager.getTree();
    const slots   = loadSlots(baseDir);

    switch (cmd) {
      // /slots list
      case "list": {
        if (!slots.length) { context.log("[SLOTS] No conditional slots configured."); break; }
        context.log(`\n🔧 Conditional Slots (${slots.length}):\n`);
        for (const s of slots) {
          const status = s.enabled ? "🟢" : "⚪️";
          context.log(`  ${status} [${s.id}] ${s.slug} — trigger: ${s.trigger} → action: ${s.action}  (fired ${s.fireCount}x)`);
        }
        break;
      }

      // /slots add <slug> <trigger> <action>
      case "add": {
        const [, , slug, trigger, action] = args;
        if (!slug || !trigger || !action) {
          context.log("[CLAWTREE] Usage: /slots add <slug> <trigger> <action>");
          context.log("  Triggers : on_use | on_install | on_evolve | on_chain");
          context.log("  Actions  : notify_user | auto_install | unlock_bonus_branch | flush_memory | emit_event");
          break;
        }
        const updated = addSlot(slots, { slug, trigger: trigger as any, action: action as any });
        saveSlots(baseDir, updated);
        context.log(`[SLOTS] ✓ Slot added: ${slug} — ${trigger} → ${action}`);
        break;
      }

      // /slots remove <id>
      case "remove": {
        const id = args[2];
        if (!id) { context.log("[CLAWTREE] Usage: /slots remove <slot-id>"); break; }
        const updated = removeSlot(slots, id);
        saveSlots(baseDir, updated);
        context.log(`[SLOTS] ✓ Slot '${id}' removed`);
        break;
      }

      // /slots fire <event-type> <slug>   (manual test trigger)
      case "fire": {
        const [, , eventType, slug] = args;
        if (!eventType || !slug) {
          context.log("[CLAWTREE] Usage: /slots fire <event-type> <slug>");
          break;
        }
        const results = processEvent(
          { type: eventType as any, slug, ts: new Date().toISOString() },
          tree, baseDir
        );
        if (!results.length) context.log(`[SLOTS] No slots matched event: ${eventType}:${slug}`);
        break;
      }

      default:
        context.log("[CLAWTREE] /slots: list | add <slug> <trigger> <action> | remove <id> | fire <event> <slug>");
    }
    return { success: true };
  }

  // ── fallback help ─────────────────────────────────────────────────────
  context.log("[CLAWTREE] Commands: /inception | /tree | /graph | /remember | /gardener | /fleet | /slots");
  return { success: true };
}
