import type { TalentTree, SkillNode } from "./skillTree";

const STATUS_ICON: Record<string, string> = {
  installed: "✅",
  available: "🔓",
  locked:    "🔒",
  evolved:   "⭐",
  mastered:  "💎",
};

export function renderASCIITree(tree: TalentTree): string {
  const installed = countByStatus(tree, "installed") + countByStatus(tree, "evolved") + countByStatus(tree, "mastered");
  const available = countByStatus(tree, "available");
  const locked    = countByStatus(tree, "locked");
  const total     = installed + available + locked;

  const lines: string[] = [
    `╔${"═".repeat(66)}╗`,
    `║             🌳  ClawTree Talent Tree  v${tree.version}                    ║`,
    `║  Mode: ${tree.mode.toUpperCase().padEnd(10)}│  XP: ${String(tree.totalXP).padEnd(8)}│  ${installed}/${total} installed      ║`,
    `║  🟢 Installed: ${installed}  │  🔓 Available: ${available}  │  🔒 Locked: ${locked}          ║`,
    `╚${"═".repeat(66)}╝`,
    "",
  ];

  for (const branch of Object.values(tree.branches)) {
    const allLocked = branch.nodes.every((n) => n.status === "locked");
    lines.push(`${"-".repeat(68)}`);
    lines.push(`  ${branch.label}${allLocked ? "  🔒 LOCKED" : ""}`);
    lines.push(`${"-".repeat(68)}`);

    const nodes = branch.nodes;
    for (let i = 0; i < nodes.length; i++) {
      const node    = nodes[i]!;
      const isLast  = i === nodes.length - 1;
      const prefix  = isLast ? "  └──" : "  ├──";
      const icon    = STATUS_ICON[node.status] ?? "❓";
      const pct     = Math.round((node.usageCount / node.evolveAt) * 100);
      const bar     = xpBar(pct);

      lines.push(`${prefix} ${icon}  ${node.name.padEnd(28)} T${node.tier} [${"█".repeat(node.tier)}░░░░░`.slice(0, 40));
      lines.push(`${isLast ? "     " : "  │   "} XP: [${bar}] ${node.usageCount}/${node.evolveAt} (${pct}%)`);
      if (node.chainsWith.length) {
        lines.push(`${isLast ? "     " : "  │   "} 🔗 chains: ${node.chainsWith.join(", ")}`);
      }
    }
    lines.push("");
  }

  lines.push("=".repeat(68));
  lines.push("  📌  ✅ installed  🔓 available  🔒 locked  ⭐ evolved  💎 mastered");
  lines.push("  🔗 chain = +25 XP bonus per paired invocation");
  lines.push("  ⚡ auto-evolution at 100% XP bar → unlocks new nodes");
  lines.push("=".repeat(68));

  return lines.join("\n");
}

function xpBar(pct: number): string {
  const filled = Math.round(pct / 10);
  return "▓".repeat(filled) + "░".repeat(10 - filled);
}

function countByStatus(tree: TalentTree, status: string): number {
  let count = 0;
  for (const b of Object.values(tree.branches)) {
    count += b.nodes.filter((n) => n.status === status).length;
  }
  return count;
}
