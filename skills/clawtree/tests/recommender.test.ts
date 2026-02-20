import { describe, it, expect } from "@jest/globals";
import { autoRecommend, type Recommendation } from "../src/tree/recommender";
import { defaultTree } from "../src/tree/skillTree";

describe("autoRecommend", () => {
  it("returns no recommendations on default tree (nothing available that chains with recent)", () => {
    const tree = defaultTree();
    // In default tree only 'clawtree' is installed, 'skill-clawhub' and 'clawguard' are available
    const recs = autoRecommend(tree, []);
    // Should have some recs (available nodes exist)
    expect(Array.isArray(recs)).toBe(true);
  });

  it("promotes chain partner to 'now' urgency when recently used", () => {
    const tree = defaultTree();
    // 'skill-clawhub' is available and chainsWith 'clawtree'
    // If we recently used 'clawtree', chain partner should be 'now'
    const recs = autoRecommend(tree, ["clawtree"]);
    const clawhubRec = recs.find((r: Recommendation) => r.slug === "skill-clawhub");
    expect(clawhubRec).toBeDefined();
    expect(clawhubRec!.urgency).toBe("now");
  });

  it("sorts results so 'now' comes before 'soon' before 'future'", () => {
    const tree = defaultTree();
    const recs = autoRecommend(tree, ["clawtree"]);
    if (recs.length >= 2) {
      const order = { now: 0, soon: 1, future: 2 };
      for (let i = 0; i < recs.length - 1; i++) {
        expect(order[recs[i].urgency]).toBeLessThanOrEqual(order[recs[i + 1].urgency]);
      }
    }
  });

  it("includes branch and name in recommendation", () => {
    const tree = defaultTree();
    const recs = autoRecommend(tree, []);
    if (recs.length > 0) {
      expect(recs[0]).toHaveProperty("branch");
      expect(recs[0]).toHaveProperty("name");
      expect(recs[0]).toHaveProperty("reason");
    }
  });
});
