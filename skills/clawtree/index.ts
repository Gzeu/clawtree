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

export async function run(
  params: { query: string; baseDir?: string },
  context: { log: (msg: string) => void; baseDir: string }
) {
  const query   = params.query?.trim() ?? "";
  const baseDir = params.baseDir ?? context.baseDir;

  // Safety first
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

  // ── /tree ────────────────────────────────────────────────────────────
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
        context.log("[CLAWTREE] Available: /tree show | recommend | install <slug> | evolve <slug> | mode auto|manual|hybrid");
    }
    return { success: true };
  }

  // ── /graph ───────────────────────────────────────────────────────────
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
        context.log("[CLAWTREE] Available: /graph show | search <q> | path <slug> | subgraph <slug> | recommend <q>");
    }

    saveGraph(baseDir, graph);
    return { success: true };
  }

  // ── /remember / /gardener ────────────────────────────────────────────
  if (query === "/remember" || query.startsWith("/gardener")) {
    const args = query.split(" ");
    const cmd  = args[1] ?? "flush";
    if (cmd === "flush" || query === "/remember") {
      treeManager.flush();
      context.log("[CLAWTREE] 💾 MEMORY.md flushed successfully.");
    } else if (cmd === "stats") {
      const stats = treeManager.getStats();
      context.log(`\n📊 Gardener Stats\n  Total XP: ${stats.totalXP}\n  Installed: ${stats.installed}\n  Last save: ${stats.lastSaved}`);
      if (stats.topUsed.length) {
        context.log("  Top used: " + stats.topUsed.map(([s, n]) => `${s}(${n}x)`).join(", "));
      }
    }
    return { success: true };
  }

  context.log("[CLAWTREE] Type /inception, /tree, /graph, /remember, or /gardener");
  return { success: true };
}
