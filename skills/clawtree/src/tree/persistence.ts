import fs   from "fs";
import path from "path";
import { defaultTree, type TalentTree } from "./skillTree";

const TREE_FILE = "talent-tree.json";

export function loadTree(baseDir: string): TalentTree {
  const p = path.resolve(baseDir, TREE_FILE);
  if (!fs.existsSync(p)) return defaultTree();
  try {
    return JSON.parse(fs.readFileSync(p, "utf8")) as TalentTree;
  } catch {
    return defaultTree();
  }
}

export function saveTree(baseDir: string, tree: TalentTree): void {
  fs.writeFileSync(
    path.resolve(baseDir, TREE_FILE),
    JSON.stringify(tree, null, 2),
    "utf8"
  );
}
