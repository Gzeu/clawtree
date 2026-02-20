import { execSync } from "child_process";
import type { TalentTree } from "../tree/skillTree";

export interface InceptionResult {
  query:     string;
  installed: string[];
  gaps:      string[];
  variants:  InceptionVariant[];
}

export interface InceptionVariant {
  rank:        number;
  slug:        string;
  name:        string;
  source:      "clawhub" | "local" | "proposed";
  description: string;
  install?:    string;
}

/**
 * runInception — Audit installed skills, analyse gaps, propose 3 variants.
 *
 * Phase 1: list locally installed skills from the talent tree
 * Phase 2: search ClawHub for query-relevant skills
 *   └─ Attempt A: `clawhub search <q> --json`  (clawhub ≥ 2.x)
 *   └─ Attempt B: `clawhub search <q>`         (plain text, parsed)
 *   └─ Fallback:  local tree data only
 * Phase 3: gap analysis → rank top 3 variants
 */
export async function runInception(
  query:   string,
  tree:    TalentTree,
  baseDir: string,
  context: { log: (msg: string) => void }
): Promise<InceptionResult> {
  context.log(`\n[CLAWTREE] 🔍 Inception: "${query}"\n`);

  // ── Phase 1: installed skills ───────────────────────────────────────────────
  const installedSlugs: string[] = [];
  for (const branch of Object.values(tree.branches)) {
    for (const node of branch.nodes) {
      if (["installed", "evolved", "mastered"].includes(node.status)) {
        installedSlugs.push(node.slug);
      }
    }
  }
  context.log(`  ✅ Installed (${installedSlugs.length}): ${installedSlugs.join(", ") || "none"}`);

  // ── Phase 2: search ClawHub ─────────────────────────────────────────────────
  const clawhubResults = searchClawhub(query, context);

  // ── Phase 3: gap analysis → 3 variants ───────────────────────────────────────────
  const gaps = clawhubResults
    .filter((r) => !installedSlugs.includes(r.slug))
    .map((r) => r.slug);

  context.log(`  🔍 Gaps identified (${gaps.length}): ${gaps.slice(0, 5).join(", ") || "none"}`);

  const variants = buildVariants(query, clawhubResults, installedSlugs);

  context.log("\n  🎯 Top 3 variants:\n");
  for (const v of variants) {
    context.log(`  ${v.rank}. [${v.source}] \`${v.slug}\` — ${v.description}`);
    if (v.install) context.log(`     └─ ${v.install}`);
  }

  return { query, installed: installedSlugs, gaps, variants };
}

// ── Helpers ─────────────────────────────────────────────────────────────────────

function searchClawhub(
  query:   string,
  context: { log: (msg: string) => void }
): InceptionVariant[] {
  const q = query.replace(/"/g, "\\\""); // escape quotes for shell

  // ─ Attempt A: --json flag (clawhub ≥ 2.x) ────────────────────────────────
  try {
    const raw    = execSync(`npx clawhub@latest search "${q}" --json`, { timeout: 15_000, encoding: "utf-8" });
    const parsed = JSON.parse(raw) as Record<string, unknown>[];
    context.log("  📦 ClawHub: results via --json");
    return parsed.slice(0, 10).map((item, i) => ({
      rank:        i + 1,
      slug:        String(item["slug"] ?? slugify(String(item["name"] ?? q))),
      name:        String(item["name"] ?? item["slug"] ?? q),
      source:      "clawhub" as const,
      description: String(item["description"] ?? ""),
      install:     `clawhub install ${item["slug"]}`,
    }));
  } catch { /* CLI doesn't support --json, try plain text */ }

  // ─ Attempt B: plain text output ───────────────────────────────────────
  try {
    const raw     = execSync(`npx clawhub@latest search "${q}"`, { timeout: 15_000, encoding: "utf-8" });
    const results = parseTextOutput(raw);
    if (results.length > 0) {
      context.log(`  📦 ClawHub: ${results.length} result(s) via text parser`);
      return results;
    }
  } catch { /* CLI not installed or errored */ }

  // ─ Fallback: local tree data only ─────────────────────────────────────
  context.log("  ⚠️  clawhub CLI not available — using local tree data only");
  return [];
}

/**
 * Parse plain-text clawhub search output.
 * Handles common formats:
 *   • "slug - description"
 *   • "slug  description"
 *   • table rows with | separators
 */
function parseTextOutput(raw: string): InceptionVariant[] {
  const results: InceptionVariant[] = [];

  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("-") ||
        trimmed.startsWith("Name") || trimmed.startsWith("Slug") || /^[\u2500-\u257F|+]/.test(trimmed)) {
      continue; // skip headers, separators, decorators
    }

    // Format: "slug - description" or "slug  description" or "| slug | description |"
    const clean    = trimmed.replace(/^\|/, "").replace(/\|$/, "").trim();
    const parts    = clean.split(/\s{2,}|\s-\s|\|/).map((p) => p.trim()).filter(Boolean);
    const rawSlug  = parts[0] ?? "";
    const slug     = slugify(rawSlug);

    if (!slug || slug.length < 2) continue;

    results.push({
      rank:        results.length + 1,
      slug,
      name:        rawSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      source:      "clawhub" as const,
      description: parts.slice(1).join(" ").slice(0, 120) || `Skill: ${slug}`,
      install:     `clawhub install ${slug}`,
    });

    if (results.length >= 10) break;
  }

  return results;
}

function buildVariants(
  query:     string,
  results:   InceptionVariant[],
  installed: string[]
): InceptionVariant[] {
  const keywords = query.toLowerCase().split(/\s+/);

  const scored = results.map((r) => {
    const text  = `${r.slug} ${r.description}`.toLowerCase();
    const score = keywords.filter((k) => text.includes(k)).length;
    return { ...r, score };
  });

  const top = scored
    .filter((r) => !installed.includes(r.slug))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // Pad to 3 with a "proposed" entry if needed
  while (top.length < 3) {
    const proposedSlug = `${slugify(query)}-skill`;
    top.push({
      rank:        top.length + 1,
      slug:        proposedSlug,
      name:        `${query} Skill`,
      source:      "proposed" as const,
      description: `Custom skill for "${query}" — create with \`clawhub create ${proposedSlug}\``,
      install:     `clawhub create ${proposedSlug}`,
      score:       0,
    });
  }

  return top.slice(0, 3).map((v, i) => ({ ...v, rank: i + 1 }));
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}