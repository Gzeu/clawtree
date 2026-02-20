import fs from "fs";
import path from "path";

export type DetailEventType = "use" | "install" | "evolve" | "chain" | "recommend" | "inception" | "flush";

export interface DetailEntry {
  ts:       string;
  event:    DetailEventType;
  slug:     string;
  detail?:  string;
  xpDelta?: number;
}

/** Append one event to today's detail log file. */
export function appendDetail(baseDir: string, entry: DetailEntry): void {
  const today   = new Date().toISOString().slice(0, 10);
  const dir     = path.resolve(baseDir, "memory");
  const logFile = path.join(dir, `${today}.md`);

  fs.mkdirSync(dir, { recursive: true });

  if (!fs.existsSync(logFile)) {
    fs.writeFileSync(logFile, `# ClawTree Detail Log — ${today}\n\n`, "utf8");
  }

  fs.appendFileSync(logFile, formatEntry(entry) + "\n", "utf8");
}

/** Lazy-load the last N days of detail logs. */
export function loadDetailDays(baseDir: string, days = 7): DetailEntry[] {
  const dir = path.resolve(baseDir, "memory");
  if (!fs.existsSync(dir)) return [];

  const files = fs
    .readdirSync(dir)
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
    .sort()
    .slice(-days);

  const entries: DetailEntry[] = [];
  for (const file of files) {
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    entries.push(...parseDetailLog(raw));
  }
  return entries;
}

/** Return usage frequency per slug for the last N days. */
export function usageFrequency(baseDir: string, days = 30): Record<string, number> {
  const entries = loadDetailDays(baseDir, days);
  const freq: Record<string, number> = {};
  for (const e of entries) {
    if (e.event === "use") freq[e.slug] = (freq[e.slug] ?? 0) + 1;
  }
  return freq;
}

// ── Helpers ──────────────────────────────────────────────────────────────
function formatEntry(e: DetailEntry): string {
  const xp  = e.xpDelta !== undefined ? ` | +${e.xpDelta}xp` : "";
  const det = e.detail  ? ` | ${e.detail}` : "";
  return `- \`${e.ts}\` **${e.event.toUpperCase()}** \`${e.slug}\`${xp}${det}`;
}

function parseDetailLog(raw: string): DetailEntry[] {
  const entries: DetailEntry[] = [];
  const regex = /- `(.+?)` \*\*(\w+)\*\* `([\w-]+)`(.*)/g;
  for (const [, ts, event, slug, rest] of raw.matchAll(regex)) {
    const xpMatch  = rest.match(/\+(\d+)xp/);
    const detMatch = rest.match(/\| (.+)$/);
    entries.push({
      ts, slug,
      event:   event.toLowerCase() as DetailEventType,
      xpDelta: xpMatch  ? parseInt(xpMatch[1], 10) : undefined,
      detail:  detMatch ? detMatch[1].trim()        : undefined,
    });
  }
  return entries;
}
