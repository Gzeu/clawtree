import type { TalentTree, SkillNode } from "./skillTree";

export interface EvolveEvent {
  slug:      string;
  fromTier:  number;
  toTier:    number;
  unlocked:  string[];
  message:   string;
}

// Find a node across all branches
export function findNode(tree: TalentTree, slug: string): SkillNode | null {
  for (const branch of Object.values(tree.branches)) {
    const found = branch.nodes.find((n) => n.slug === slug);
    if (found) return found;
  }
  return null;
}

// Add XP to a node and check for evolution
export function addXP(
  tree:     TalentTree,
  slug:     string,
  amount:   number = 10
): EvolveEvent | null {
  const node = findNode(tree, slug);
  if (!node || !["installed", "evolved"].includes(node.status)) return null;

  node.xp          += amount;
  node.usageCount  += 1;
  tree.totalXP     += amount;

  return evolveCheck(tree, slug);
}

// Check if a node is ready to evolve
export function evolveCheck(tree: TalentTree, slug: string): EvolveEvent | null {
  const node = findNode(tree, slug);
  if (!node) return null;
  if (node.usageCount < node.evolveAt) return null;
  if (node.status === "mastered") return null;

  const fromTier = node.tier;
  const toTier   = Math.min(node.tier + 1, 5);
  node.tier      = toTier;
  node.status    = toTier >= 5 ? "mastered" : "evolved";
  node.usageCount = 0;               // reset for next tier
  node.evolveAt   = Math.round(node.evolveAt * 1.5); // harder next time

  // Unlock dependent nodes
  const unlocked: string[] = [];
  for (const unlock of node.unlocks) {
    const dep = findNode(tree, unlock);
    if (dep && dep.status === "locked" && arePrereqsMet(tree, dep)) {
      dep.status = "available";
      unlocked.push(unlock);
    }
  }
  // Unlock nodes that depend on this one
  for (const branch of Object.values(tree.branches)) {
    for (const n of branch.nodes) {
      if (n.status === "locked" && n.prerequisites.includes(slug)) {
        if (arePrereqsMet(tree, n)) {
          n.status = "available";
          unlocked.push(n.slug);
        }
      }
    }
  }

  return {
    slug, fromTier, toTier, unlocked,
    message: [
      `\n⚡ EVOLUTION: \`${node.name}\` T${fromTier} → T${toTier} [${
        node.status === "mastered" ? "💎 MASTERED" : "⭐ EVOLVED"
      }]`,
      unlocked.length ? `  🔓 Unlocked: ${unlocked.join(", ")}` : "",
    ].filter(Boolean).join("\n"),
  };
}

export function chainBonus(tree: TalentTree, slugA: string, slugB: string): number {
  const a = findNode(tree, slugA);
  if (!a) return 0;
  return a.chainsWith.includes(slugB) ? 25 : 0;
}

function arePrereqsMet(tree: TalentTree, node: SkillNode): boolean {
  return node.prerequisites.every((p) => {
    const dep = findNode(tree, p);
    return dep && ["installed", "evolved", "mastered"].includes(dep.status);
  });
}
