import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import fs   from "fs";
import path from "path";
import os   from "os";
import { saveSummary, loadSummary } from "../src/memory/summaryIndex";
import { appendDetail, loadDetailDays } from "../src/memory/detailLayer";

let tmpDir: string;

beforeEach(() => { tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "clawtree-test-")); });
afterEach(()  => { fs.rmSync(tmpDir, { recursive: true, force: true }); });

describe("SummaryIndex", () => {
  it("returns null when MEMORY.md does not exist", () => {
    expect(loadSummary(tmpDir)).toBeNull();
  });

  it("round-trips a summary state", () => {
    const state = {
      mode: "hybrid", totalXP: 42, lastSaved: "2026-02-20",
      installed: ["alpha"], available: ["beta"], evolving: ["alpha:3/5:60%"],
      xpIndex: { alpha: { xp: 3, evolveAt: 5, pct: 60, status: "installed" } },
      chainHistory: ["alpha → beta | +25xp"],
      evolveLog: ["2026-02-20 alpha T1→T2"],
    };
    saveSummary(tmpDir, state);
    const loaded = loadSummary(tmpDir);
    expect(loaded).not.toBeNull();
    expect(loaded!.totalXP).toBe(42);
    expect(loaded!.installed).toContain("alpha");
    expect(loaded!.xpIndex["alpha"].pct).toBe(60);
  });

  it("preserves USER_NOTES across saves", () => {
    saveSummary(tmpDir, { mode: "hybrid", totalXP: 0, lastSaved: "", installed: [], available: [], evolving: [], xpIndex: {}, chainHistory: [], evolveLog: [] });
    const memPath = path.join(tmpDir, "MEMORY.md");
    fs.writeFileSync(memPath, fs.readFileSync(memPath, "utf8").replace(
      "<!-- Add personal notes here",
      "My private note <!-- Add personal notes here"
    ));
    saveSummary(tmpDir, { mode: "auto", totalXP: 1, lastSaved: "2026-02-20", installed: [], available: [], evolving: [], xpIndex: {}, chainHistory: [], evolveLog: [] });
    const content = fs.readFileSync(memPath, "utf8");
    expect(content).toContain("My private note");
  });
});

describe("DetailLayer", () => {
  it("appends and reads back entries", () => {
    appendDetail(tmpDir, { ts: "2026-02-20T05:00:00.000Z", event: "use",     slug: "alpha", xpDelta: 10 });
    appendDetail(tmpDir, { ts: "2026-02-20T05:01:00.000Z", event: "install", slug: "beta" });
    const entries = loadDetailDays(tmpDir, 1);
    expect(entries.length).toBeGreaterThanOrEqual(2);
    expect(entries.some((e) => e.slug === "alpha" && e.event === "use")).toBe(true);
  });
});
