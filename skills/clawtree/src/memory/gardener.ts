import type { TalentTree } from "../tree/skillTree";
import { flushToMemory, restoreFromMemory } from "./memoryFlush";
import { appendDetail, usageFrequency } from "./detailLayer";
import { loadSummary } from "./summaryIndex";
import { autoRecommend } from "../tree/recommender";

/**
 * Gardener — orchestrates ClawTree memory persistence.
 *
 * Two-layer memory architecture:
 *   Summary Layer  → MEMORY.md              (loaded at every session start, lean)
 *   Detail Layer   → memory/YYYY-MM-DD.md   (lazy-loaded on demand)
 *
 * OpenClaw native lifecycle hooks:
 *   onSessionStart  → boot()  — restores tree state from MEMORY.md
 *   onMemoryFlush   → flush() — writes state before context compaction
 */
export class Gardener {
  private actionCount = 0;
  private restored    = false;

  constructor(private readonly baseDir: string) {}

  /** Restore tree from MEMORY.md on session start. */
  boot(tree: TalentTree): void {
    this.restored = restoreFromMemory(tree, this.baseDir);

    if (this.restored) {
      const s = loadSummary(this.baseDir)!;
      console.log(
        `[GARDENER] \u2713 Tree restored from MEMORY.md\n` +
        `  \u{1F4E6} Installed : ${s.installed.join(", ") || "none"}\n` +
        `  \u{1F513} Available : ${s.available.join(", ") || "none"}\n` +
        `  \u26A1 Evolving  : ${s.evolving.join(", ")  || "none"}\n` +
        `  \u{1F3AF} Total XP  : ${s.totalXP}\n` +
        `  \u{1F4BE} Last save : ${s.lastSaved}`
      );
    } else {
      console.log("[GARDENER] \u{1F331} First run \u2014 initialising MEMORY.md");
      this.flush(tree);
    }
  }

  /**
   * Log a skill event to today's detail layer.
   * Auto-flushes MEMORY.md every 10 actions as a safety net.
   */
  logEvent(
    tree:     TalentTree,
    event:    "use" | "install" | "evolve" | "chain" | "inception",
    slug:     string,
    detail?:  string,
    xpDelta?: number
  ): void {
    appendDetail(this.baseDir, {
      ts: new Date().toISOString(), event, slug, detail, xpDelta,
    });
    this.actionCount++;
    if (this.actionCount % 10 === 0) this.flush(tree);
  }

  /** Flush tree state to MEMORY.md. Also called by OpenClaw onMemoryFlush hook. */
  flush(tree: TalentTree): void {
    flushToMemory(tree, this.baseDir);
    console.log("[GARDENER] \u{1F4BE} Flush \u2192 MEMORY.md updated");
  }

  /**
   * Return rule-based recommendations enriched with 30-day usage history.
   * Signature matches the call in TreeManager: (tree, recentSlugs)
   */
  enrichedRecommendations(
    tree:        TalentTree,
    recentSlugs: string[]
  ) {
    const baseRecs = autoRecommend(tree, recentSlugs);
    const freqMap  = usageFrequency(this.baseDir, 30);

    return baseRecs
      .map((rec) => {
        const freq = freqMap[rec.slug] ?? 0;
        if (freq >= 5 && rec.urgency === "future") {
          return {
            ...rec,
            urgency: "soon" as const,
            reason:  `${rec.reason} *(used ${freq}\u00D7 in last 30 days)*`,
          };
        }
        return rec;
      })
      .sort((a, b) => {
        const order = { now: 0, soon: 1, future: 2 };
        return order[a.urgency] - order[b.urgency];
      });
  }

  /** Usage statistics from memory history. */
  getStats(baseDir: string) {
    const summary = loadSummary(baseDir);
    const freq    = usageFrequency(baseDir, 30);
    const top5    = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return {
      totalXP:   summary?.totalXP  ?? 0,
      installed: summary?.installed.length ?? 0,
      lastSaved: summary?.lastSaved ?? "never",
      topUsed:   top5,
    };
  }
}
