import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import fs   from "fs";
import path from "path";
import os   from "os";

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "clawtree-fleet-"));
  process.env.HOME = tmpDir;
});
afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  delete process.env.HOME;
});

import { registerAgent, unregisterAgent, listAgents, getAgent } from "../src/fleet/fleetRegistry";

describe("FleetRegistry", () => {
  it("registerAgent stores agent in fleet-registry.json", () => {
    registerAgent("agent-alpha", tmpDir);
    const agents = listAgents();
    expect(agents.length).toBe(1);
    expect(agents[0].name).toBe("agent-alpha");
  });

  it("getAgent returns correct registration", () => {
    registerAgent("agent-beta", tmpDir);
    const a = getAgent("agent-beta");
    expect(a).not.toBeNull();
    expect(a!.path).toBe(path.resolve(tmpDir));
  });

  it("unregisterAgent removes agent", () => {
    registerAgent("agent-gamma", tmpDir);
    const ok = unregisterAgent("agent-gamma");
    expect(ok).toBe(true);
    expect(listAgents()).toHaveLength(0);
  });

  it("unregisterAgent returns false for unknown agent", () => {
    expect(unregisterAgent("ghost")).toBe(false);
  });

  it("multiple agents co-exist in registry", () => {
    registerAgent("alpha", tmpDir);
    registerAgent("beta",  tmpDir);
    expect(listAgents()).toHaveLength(2);
  });
});
