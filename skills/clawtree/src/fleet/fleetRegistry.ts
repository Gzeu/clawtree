import fs   from "fs";
import path from "path";

export interface AgentRegistration {
  name:         string;
  path:         string;   // absolute path to agent's clawtree baseDir
  registeredAt: string;
  lastSync?:    string;
}

interface FleetRegistry {
  agents:    Record<string, AgentRegistration>;
  gardener?: string;     // name of the designated gardener agent
}

const fleetDir  = () => path.resolve(process.env.HOME ?? process.cwd(), ".clawtree");
const fleetFile = () => path.join(fleetDir(), "fleet-registry.json");

export function getFleetDir(): string { return fleetDir(); }

function load(): FleetRegistry {
  const f = fleetFile();
  if (!fs.existsSync(f)) return { agents: {} };
  try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch { return { agents: {} }; }
}

function save(reg: FleetRegistry): void {
  fs.mkdirSync(fleetDir(), { recursive: true });
  fs.writeFileSync(fleetFile(), JSON.stringify(reg, null, 2), "utf8");
}

/** Register an agent in the global fleet registry (~/.clawtree/fleet-registry.json). */
export function registerAgent(name: string, agentPath: string): void {
  const reg = load();
  reg.agents[name] = { name, path: path.resolve(agentPath), registeredAt: new Date().toISOString() };
  save(reg);
  console.log(`[FLEET] ✓ Agent '${name}' registered at ${agentPath}`);
}

/** Remove an agent from the registry. */
export function unregisterAgent(name: string): boolean {
  const reg = load();
  if (!reg.agents[name]) return false;
  delete reg.agents[name];
  save(reg);
  return true;
}

export function listAgents(): AgentRegistration[] {
  return Object.values(load().agents);
}

export function getAgent(name: string): AgentRegistration | null {
  return load().agents[name] ?? null;
}
