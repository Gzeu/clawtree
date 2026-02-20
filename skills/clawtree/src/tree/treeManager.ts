import { loadTree, saveTree }  from "./persistence";
import { addXP, chainBonus, evolveCheck, findNode } from "./evolver";
import { autoRecommend }       from "./recommender";
import { renderASCIITree }     from "./renderer";
import { Gardener }            from "../memory/gardener";
import type { TalentTree, TreeMode } from "./skillTree";

export class TreeManager {
  private tree:        TalentTree;
  private recentSlugs: string[] = [];
  private gardener:    Gardener;

  constructor(private baseDir: string) {
    this.tree     = loadTree(baseDir);
    this.gardener = new Gardener(baseDir);
    this.gardener.boot(this.tree);
  }

  getTree(): TalentTree { return this.tree; }

  async installSkill(slug: string): Promise<void> {
    const node = findNode(this.tree, slug);
    if (!node) { console.log(`[CLAWTREE] ✗ Skill not found: ${slug}`); return; }
    if (node.status === "locked") { console.log(`[CLAWTREE] ✗ ${slug} is locked. Install prerequisites first.`); return; }
    if (["installed", "evolved", "mastered"].includes(node.status)) {
      console.log(`[CLAWTREE] ℹ️ ${slug} is already installed.`); return;
    }
    node.status = "installed";
    this.gardener.logEvent(this.tree, "install", slug);
    console.log(`[CLAWTREE] ✅ Installed: ${slug}`);
    this.flush();
  }

  onSkillUsed(slug: string, chainedWith?: string): void {
    this.recentSlugs.push(slug);
    const event = addXP(this.tree, slug, 10);
    if (event) {
      console.log(event.message);
      this.gardener.logEvent(this.tree, "evolve", slug,
        `T${event.fromTier}→T${event.toTier} unlocked:${event.unlocked.join(",")}`, 100);
    }
    if (chainedWith) {
      const bonus = chainBonus(this.tree, slug, chainedWith);
      if (bonus > 0) {
        addXP(this.tree, slug, bonus);
        this.gardener.logEvent(this.tree, "chain", slug, `→${chainedWith}`, bonus);
      }
    }
    this.gardener.logEvent(this.tree, "use", slug, undefined, 10);
    if (this.recentSlugs.length % 10 === 0) this.flush();
    if ((this.tree.mode === "auto" || this.tree.mode === "hybrid") && this.recentSlugs.length % 5 === 0) {
      this.printRecommendations();
    }
    saveTree(this.baseDir, this.tree);
  }

  forceEvolve(slug: string): void {
    const event = evolveCheck(this.tree, slug);
    if (event) { console.log(event.message); this.flush(); }
    else console.log(`[CLAWTREE] ℹ️ ${slug} not ready for evolution yet.`);
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
    const recs = this.gardener.enrichedRecommendations(this.tree, this.recentSlugs);
    if (!recs.length) { console.log("[CLAWTREE] ✓ No new recommendations."); return; }
    console.log("\n🌳 ClawTree — Recommendations (+ history boost):\n");
    for (const r of recs.slice(0, 5)) {
      const badge = { now: "🟢", soon: "🟡", future: "🔵" }[r.urgency];
      console.log(`${badge} [${r.branch}] \`${r.slug}\` — ${r.reason}`);
    }
  }

  flush(): void { this.gardener.flush(this.tree); }

  getStats() { return this.gardener.getStats(this.baseDir); }
}
