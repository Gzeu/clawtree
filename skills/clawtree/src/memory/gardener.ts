import type { TalentTree } from "../tree/skillTree";
import { flushToMemory, restoreFromMemory } from "./memoryFlush";
import { appendDetail, usageFrequency } from "./detailLayer";
import { loadSummary } from "./summaryIndex";

/**
 * Gardener — orchestrates ClawTree memory.
 *
 * Two-layer memory architecture:
 *   Summary Layer  → MEMORY.md  (always loaded at startup, lean)
 *   Detail Layer   → memory/YYYY-MM-DD.md  (lazy-loaded on demand)
 *
 * Integrated with OpenClaw native lifecycle:
 *   onSessionStart  → boot() restores tree from MEMORY.md
 *   onMemoryFlush   → flush() writes state before context compaction
 */
export class Gardener {
  private actionCount = 0;
  private restored    = false;

  constructor(private readonly baseDir: string) {}

  /** Call at session start. Restores tree from MEMORY.md if available. */
  boot(tree: TalentTree): void {
    this.restored = restoreFromMemory(tree, this.baseDir);

    if (this.restored) {
      const s = loadSummary(this.baseDir)!;
      console.log(
        `[GARDENER] ✓ Tree restored from MEMORY.md\n` +
        `  📦 Installed : ${s.installed.join(", ") || "none"}\n` +
        `  🔓 Available : ${s.available.join(", ") || "none"}\n` +
        `  ⚡ Evolving  : ${s.evolving.join(", ")  || "none"}\n` +
        `  🎯 Total XP  : ${s.totalXP}\n` +
        `  💾 Last save : ${s.lastSaved}`
      );
    } else {
      console.log("[GARDENER] 🌱 First run — initialising MEMORY.md");
      this.flush(tree);
    }
  }

  /**
   * Log a skill event to today's detail layer.
   * Auto-flushes MEMORY.md every 10 actions.
   */
  logEvent(
    tree:     TalentTree,
    event:    "use" | "install" | "evolve" | "chain" | "inception",
    slug:     string,
    detail?:  string,
    xpDelta?: number
  ): void {
    appendDetail(this.baseDir, { ts: new Date().toISOString(), event, slug, detail, xpDelta });
    this.actionCount++;
    if (this.actionCount % 10 === 0) this.flush(tree);
  }

  /** Flush tree state to MEMORY.md (also called by OpenClaw onMemoryFlush). */
  flush(tree: TalentTree): void {
    flushToMemory(tree, this.baseDir);
    console.log("[GARDENER] 💾 Flush → MEMORY.md updated");
  }

  /** Return recommendations enriched with 30-day usage history boost. */
  enrichedRecommendations(
    baseRecs: Array<{ slug: string; urgency: string; reason: string; branch: string }>,
    _tree:    TalentTree
  ) {
    const freqMap = usageFrequency(this.baseDir, 30);
    return baseRecs
      .map((rec) => {
        const freq = freqMap[rec.slug] ?? 0;
        if (freq >= 5 && rec.urgency === "future") {
          return { ...rec, urgency: "soon", reason: `${rec.reason} *(used ${freq}× in last 30 days)*` };
        }
        return rec;
      })
      .sort((a, b) => (["now", "soon", "future"].indexOf(a.urgency)) - (["now", "soon", "future"].indexOf(b.urgency)));
  }

  /** Print stats from memory history. */
  stats(): void {
    const summary = loadSummary(this.baseDir);
    const freq    = usageFrequency(this.baseDir, 30);
    const top5    = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5);

    console.log(
      `\n[GARDENER] 📊 Stats\n` +
      `  Total XP  : ${summary?.totalXP ?? 0}\n` +
      `  Installed : ${summary?.installed.length ?? 0}\n` +
      `  Last save : ${summary?.lastSaved ?? "never"}\n` +
      `  Top used  :\n${top5.map(([s, n]) => `    - ${s}: ${n}×`).join("\n") || "    (no history yet)"}`
    );
  }
}
