import { loadTree, saveTree }   from "./persistence";
import { addXP, chainBonus, evolveCheck, findNode } from "./evolver";
import { autoRecommend }        from "./recommender";
import { renderASCIITree }      from "./renderer";
import { Gardener }             from "../memory/gardener";
import { mergeCustomBranches, addCustomBranch, removeCustomBranch, listCustomBranches } from "./branchLoader";
import { loadConfig }           from "./configLoader";
import { processEvent }         from "../slots/slotEngine";
import type { TalentTree, TreeMode } from "./skillTree";
import type { CustomBranchDef, ClawTreeConfig } from "./configLoader";

export class TreeManager {
  private tree:        TalentTree;
  private recentSlugs: string[] = [];
  private gardener:    Gardener;
  private cfg:         ClawTreeConfig;

  constructor(private baseDir: string) {
    this.cfg      = loadConfig(baseDir);
    this.tree     = loadTree(baseDir);
    const added   = mergeCustomBranches(this.tree, baseDir);
    if (added > 0) console.log(`[CLAWTREE] 🌳 Loaded ${added} custom branch(es) from config`);
    this.gardener = new Gardener(baseDir);
    this.gardener.boot(this.tree);
  }

  getTree(): TalentTree { return this.tree; }

  // ── Skill actions ────────────────────────────────────────────────────

  async installSkill(slug: string): Promise<void> {
    const node = findNode(this.tree, slug);
    if (!node) { console.log(`[CLAWTREE] ✗ Skill not found: ${slug}`); return; }
    if (node.status === "locked") { console.log(`[CLAWTREE] ✗ ${slug} is locked. Install prerequisites first.`); return; }
    if (["installed", "evolved", "mastered"].includes(node.status)) {
      console.log(`[CLAWTREE] ℹ️ ${slug} is already installed.`); return;
    }
    node.status = "installed";
    this.gardener.logEvent(this.tree, "install", slug);
    // 🔧 Fire on_install slots
    processEvent({ type: "on_install", slug, ts: new Date().toISOString() }, this.tree, this.baseDir);
    console.log(`[CLAWTREE] ✅ Installed: ${slug}`);
    this.flush();
  }

  onSkillUsed(slug: string, chainedWith?: string): void {
    this.recentSlugs.push(slug);
    const xpPerUse = this.cfg.xp_per_use ?? 10;
    const event    = addXP(this.tree, slug, xpPerUse);

    if (event) {
      console.log(event.message);
      this.gardener.logEvent(this.tree, "evolve", slug,
        `T${event.fromTier}→T${event.toTier} unlocked:${event.unlocked.join(",")}`, 100);
      // 🔧 Fire on_evolve slots
      processEvent({ type: "on_evolve", slug, ts: new Date().toISOString(), xpDelta: 100 }, this.tree, this.baseDir);
    }

    if (chainedWith) {
      const chainBonusXP = this.cfg.chain_bonus_xp ?? 25;
      const bonus        = chainBonus(this.tree, slug, chainedWith, chainBonusXP);
      if (bonus > 0) {
        addXP(this.tree, slug, bonus);
        this.gardener.logEvent(this.tree, "chain", slug, `→${chainedWith}`, bonus);
        // 🔧 Fire on_chain slots
        processEvent({ type: "on_chain", slug, ts: new Date().toISOString(), xpDelta: bonus }, this.tree, this.baseDir);
      }
    }

    // 🔧 Fire on_use slots
    processEvent({ type: "on_use", slug, ts: new Date().toISOString(), xpDelta: xpPerUse }, this.tree, this.baseDir);
    this.gardener.logEvent(this.tree, "use", slug, undefined, xpPerUse);

    const flushEvery = this.cfg.auto_flush_interval ?? 10;
    if (this.recentSlugs.length % flushEvery === 0) this.flush();
    if ((this.tree.mode === "auto" || this.tree.mode === "hybrid") && this.recentSlugs.length % 5 === 0) {
      this.printRecommendations();
    }
    saveTree(this.baseDir, this.tree);
  }

  forceEvolve(slug: string): void {
    const event = evolveCheck(this.tree, slug);
    if (event) {
      console.log(event.message);
      // 🔧 Fire on_evolve slots
      processEvent({ type: "on_evolve", slug, ts: new Date().toISOString() }, this.tree, this.baseDir);
      this.flush();
    } else {
      console.log(`[CLAWTREE] ℹ️ ${slug} not ready for evolution yet.`);
    }
  }

  setMode(mode: TreeMode): void {
    this.tree.mode = mode;
    console.log(`[CLAWTREE] Mode set to: ${mode}`);
    this.flush();
  }

  printTree(): void {
    console.log(renderASCIITree(this.tree));
  }

  printRecommendations(): void {
    const topK = this.cfg.recommend_top_k ?? 5;
    const recs  = this.gardener.enrichedRecommendations(this.tree, this.recentSlugs);
    if (!recs.length) { console.log("[CLAWTREE] ✓ No new recommendations."); return; }
    console.log("\n🌳 ClawTree — Recommendations (+ history boost):\n");
    for (const r of recs.slice(0, topK)) {
      const badge = { now: "🟢", soon: "🟡", future: "🔵" }[r.urgency];
      console.log(`${badge} [${r.branch}] \`${r.slug}\` — ${r.reason}`);
    }
  }

  flush(): void {
    this.gardener.flush(this.tree);
    // 🔧 Fire on_flush slots
    processEvent({ type: "on_flush", slug: "*", ts: new Date().toISOString() }, this.tree, this.baseDir);
  }

  getStats() { return this.gardener.getStats(this.baseDir); }

  // ── Custom branch management ─────────────────────────────────────────────

  addBranch(def: CustomBranchDef): string[] {
    const errors = addCustomBranch(this.tree, this.baseDir, def);
    if (!errors.length) {
      this.flush();
      console.log(`[CLAWTREE] 🌱 Custom branch '${def.name}' added (${def.nodes.length} node(s))`);
    }
    return errors;
  }

  removeBranch(name: string): { ok: boolean; reason?: string } {
    const result = removeCustomBranch(this.tree, this.baseDir, name);
    if (result.ok) {
      this.flush();
      console.log(`[CLAWTREE] 🗑️ Branch '${name}' removed`);
    }
    return result;
  }

  listBranches(): CustomBranchDef[] {
    return listCustomBranches(this.baseDir);
  }
}
