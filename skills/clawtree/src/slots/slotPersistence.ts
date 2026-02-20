import fs   from "fs";
import path from "path";
import type { ConditionalSlot } from "./conditionalSlots";
import { createDefaultSlots } from "./conditionalSlots";

const FILE = "conditional-slots.json";

export function loadSlots(baseDir: string): ConditionalSlot[] {
  const f = path.resolve(baseDir, FILE);
  if (!fs.existsSync(f)) {
    const defaults = createDefaultSlots();
    saveSlots(baseDir, defaults);
    return defaults;
  }
  try { return JSON.parse(fs.readFileSync(f, "utf8")); }
  catch { return createDefaultSlots(); }
}

export function saveSlots(baseDir: string, slots: ConditionalSlot[]): void {
  fs.writeFileSync(path.resolve(baseDir, FILE), JSON.stringify(slots, null, 2), "utf8");
}

export function addSlot(
  baseDir: string,
  slot: Omit<ConditionalSlot, "id" | "createdAt" | "fireCount">
): ConditionalSlot {
  const slots   = loadSlots(baseDir);
  const newSlot: ConditionalSlot = {
    ...slot,
    id:        `slot-${Date.now()}`,
    createdAt: new Date().toISOString(),
    fireCount: 0,
  };
  slots.push(newSlot);
  saveSlots(baseDir, slots);
  return newSlot;
}

export function removeSlot(baseDir: string, id: string): boolean {
  const before   = loadSlots(baseDir);
  const filtered = before.filter((s) => s.id !== id);
  if (filtered.length === before.length) return false;
  saveSlots(baseDir, filtered);
  return true;
}

export function toggleSlot(baseDir: string, id: string): boolean | null {
  const slots = loadSlots(baseDir);
  const slot  = slots.find((s) => s.id === id);
  if (!slot) return null;
  slot.enabled = !slot.enabled;
  saveSlots(baseDir, slots);
  return slot.enabled;
}
