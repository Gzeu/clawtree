import fs from "fs";
import path from "path";

const SECTIONS = {
  TREE_STATE:    "<!-- AUTO-MANAGED: TREE_STATE -->",
  XP_INDEX:      "<!-- AUTO-MANAGED: XP_INDEX -->",
  CHAIN_HISTORY: "<!-- AUTO-MANAGED: CHAIN_HISTORY -->",
  EVOLVE_LOG:    "<!-- AUTO-MANAGED: EVOLVE_LOG -->",
} as const;

export interface SummaryState {
  mode:         string;
  totalXP:      number;
  lastSaved:    string;
  installed:    string[];
  available:    string[];
  evolving:     string[];
  xpIndex:      Record<string, { xp: number; evolveAt: number; pct: number; status: string }>;
  chainHistory: string[];
  evolveLog:    string[];
}

/** Read MEMORY.md and extract lean state. Returns null on first run. */
export function loadSummary(baseDir: string): SummaryState | null {
  const memPath = path.resolve(baseDir, "MEMORY.md");
  if (!fs.existsSync(memPath)) return null;

  const raw = fs.readFileSync(memPath, "utf8");

  return {
    mode:         extractValue(raw, "mode") ?? "hybrid",
    totalXP:      parseInt(extractValue(raw, "totalXP") ?? "0", 10),
    lastSaved:    extractValue(raw, "lastSaved") ?? "",
    installed:    parseList(extractValue(raw, "installed") ?? "[]"),
    available:    parseList(extractValue(raw, "available") ?? "[]"),
    evolving:     parseList(extractValue(raw, "evolving")  ?? "[]"),
    xpIndex:      parseXPTable(extractSection(raw, "XP_INDEX")),
    chainHistory: parseCommentList(extractSection(raw, "CHAIN_HISTORY")),
    evolveLog:    parseCommentList(extractSection(raw, "EVOLVE_LOG")),
  };
}

/** Rewrite MEMORY.md preserving USER_NOTES section. */
export function saveSummary(baseDir: string, state: SummaryState): void {
  const memPath = path.resolve(baseDir, "MEMORY.md");

  let userNotes = "<!-- Add personal notes here — Gardener will never overwrite this section -->";
  if (fs.existsSync(memPath)) {
    const existing = fs.readFileSync(memPath, "utf8");
    const notesMatch = existing.match(/## <!-- USER_NOTES -->\n([\s\S]*?)(?=\n##|$)/);
    if (notesMatch?.[1]?.trim()) userNotes = notesMatch[1].trim();
  }

  const xpRows = Object.entries(state.xpIndex)
    .map(([slug, d]) => `| ${slug} | ${d.xp} | ${d.evolveAt} | ${d.pct}% | ${d.status} |`)
    .join("\n");

  const chainLines = state.chainHistory.slice(-20).map((l) => `<!-- ${l} -->`).join("\n");
  const evolveLines = state.evolveLog.slice(-50).map((l) => `<!-- ${l} -->`).join("\n");

  const content = `# ClawTree — Memory Index
> Auto-managed by ClawTree Gardener. Do not edit AUTO-MANAGED sections manually.

## ${SECTIONS.TREE_STATE}
- mode: ${state.mode}
- totalXP: ${state.totalXP}
- lastSaved: ${state.lastSaved}
- installed: ${JSON.stringify(state.installed)}
- available: ${JSON.stringify(state.available)}
- evolving: ${JSON.stringify(state.evolving)}

## ${SECTIONS.XP_INDEX}
| slug | xp | evolveAt | pct | status |
|---|---|---|---|---|
${xpRows}

## ${SECTIONS.CHAIN_HISTORY}
${chainLines}

## ${SECTIONS.EVOLVE_LOG}
${evolveLines}

## <!-- USER_NOTES -->
${userNotes}
`;

  fs.mkdirSync(path.dirname(memPath), { recursive: true });
  fs.writeFileSync(memPath, content, "utf8");
}

// ── Helpers ──────────────────────────────────────────────────────────────
function extractValue(raw: string, key: string): string | null {
  const m = raw.match(new RegExp(`- ${key}: (.+)`));
  return m?.[1]?.trim() ?? null;
}

function extractSection(raw: string, sectionKey: keyof typeof SECTIONS): string {
  const marker = SECTIONS[sectionKey];
  const start  = raw.indexOf(marker);
  if (start === -1) return "";
  const end = raw.indexOf("\n## ", start + marker.length);
  return end === -1 ? raw.slice(start) : raw.slice(start, end);
}

function parseList(raw: string): string[] {
  try { return JSON.parse(raw); } catch { return []; }
}

function parseCommentList(section: string): string[] {
  return [...section.matchAll(/<!-- (.+?) -->/g)].map((m) => m[1]).filter(Boolean);
}

function parseXPTable(section: string): Record<string, any> {
  const result: Record<string, any> = {};
  const rows = [...section.matchAll(/\| ([\w-]+) \| (\d+) \| (\d+) \| (\d+)% \| (\w+) \|/g)];
  for (const [, slug, xp, evolveAt, pct, status] of rows) {
    result[slug] = { xp: +xp, evolveAt: +evolveAt, pct: +pct, status };
  }
  return result;
}
