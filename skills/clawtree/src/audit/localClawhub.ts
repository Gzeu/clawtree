import { execSync } from "child_process";
import type { TalentTree } from "../tree/skillTree";

export interface InceptionResult {
  query:    string;
  installed: string[];
  gaps:     string[];
  variants: InceptionVariant[];
}

export interface InceptionVariant {
  rank:        number;
  slug:        string;
  name:        string;
  source:      "clawhub" | "local" | "proposed";
  description: string;
  install?:    string; // CLI command to install
}

/**
 * runInception — Audit installed skills, analyse gaps, propose 3 variants.
 *
 * Phase 1: list locally installed skills (clawhub list)
 * Phase 2: search ClawHub for query-relevant skills (clawhub search)
 * Phase 3: compare → gap analysis → rank top 3 variants
 */
export async function runInception(
  query:   string,
  tree:    TalentTree,
  baseDir: string,
  context: { log: (msg: string) => void }
): Promise<InceptionResult> {
  context.log(`\n[CLAWTREE] \u{1F50D} Inception: "${query}"\n`);

  // ── Phase 1: installed skills from talent tree ──────────────────────────
  const installedSlugs: string[] = [];
  for (const branch of Object.values(tree.branches)) {
    for (const node of branch.nodes) {
      if (["installed", "evolved", "mastered"].includes(node.status)) {
        installedSlugs.push(node.slug);
      }
    }
  }
  context.log(`  \u2705 Installed (${installedSlugs.length}): ${installedSlugs.join(", ") || "none"}`);

  // ── Phase 2: search ClawHub for relevant skills ─────────────────────────
  const clawhubResults = searchClawhub(query, context);

  // ── Phase 3: gap analysis → 3 variants ─────────────────────────────
  const gaps = clawhubResults
    .filter((r) => !installedSlugs.includes(r.slug))
    .map((r) => r.slug);

  context.log(`  \u{1F50D} Gaps identified (${gaps.length}): ${gaps.slice(0, 5).join(", ") || "none"}`);

  const variants = buildVariants(query, clawhubResults, installedSlugs);

  context.log("\n  \u{1F3AF} Top 3 variants:\n");
  for (const v of variants) {
    context.log(`  ${v.rank}. [${v.source}] \`${v.slug}\` \u2014 ${v.description}`);
    if (v.install) context.log(`     \u2514\u2500 ${v.install}`);
  }

  return { query, installed: installedSlugs, gaps, variants };
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function searchClawhub(
  query:   string,
  context: { log: (msg: string) => void }
): InceptionVariant[] {
  try {
    const raw    = execSync(`npx clawhub@latest search "${query}" --json`, { timeout: 15_000 }).toString();
    const parsed = JSON.parse(raw) as any[];
    return parsed.slice(0, 10).map((item, i) => ({
      rank:        i + 1,
      slug:        item.slug ?? item.name?.toLowerCase().replace(/\s+/g, "-"),
      name:        item.name ?? item.slug,
      source:      "clawhub" as const,
      description: item.description ?? "",
      install:     `clawhub install ${item.slug}`,
    }));
  } catch {
    context.log("  \u26A0\uFE0F  clawhub CLI not available — using local tree data only");
    return [];
  }
}

function buildVariants(
  query:      string,
  results:    InceptionVariant[],
  installed:  string[]
): InceptionVariant[] {
  const keywords = query.toLowerCase().split(/\s+/);

  // Score by keyword overlap in slug + description
  const scored = results.map((r) => {
    const text  = `${r.slug} ${r.description}`.toLowerCase();
    const score = keywords.filter((k) => text.includes(k)).length;
    return { ...r, score };
  });

  const top = scored
    .filter((r) => !installed.includes(r.slug))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // If fewer than 3, pad with a "propose new" entry
  if (top.length < 3) {
    const proposedSlug = query.toLowerCase().replace(/\s+/g, "-") + "-skill";
    top.push({
      rank:        top.length + 1,
      slug:        proposedSlug,
      name:        `${query} Skill`,
      source:      "proposed" as const,
      description: `Custom skill for "${query}" \u2014 create with \`clawhub create ${proposedSlug}\``,
      install:     `clawhub create ${proposedSlug}`,
      score:       0,
    });
  }

  return top.slice(0, 3).map((v, i) => ({ ...v, rank: i + 1 }));
}
