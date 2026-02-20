import { describe, it, expect } from "@jest/globals";
import {
  addSlot, removeSlot, toggleSlot, shouldFire,
  type ConditionalSlot, type SlotEvent
} from "../src/slots/conditionalSlots";

const makeSlot = (overrides: Partial<ConditionalSlot> = {}): ConditionalSlot => ({
  id:        "test-slot-1",
  slug:      "clawtree",
  trigger:   "on_use",
  action:    "notify_user",
  enabled:   true,
  fireCount: 0,
  createdAt: new Date().toISOString(),
  ...overrides,
});

const makeEvent = (overrides: Partial<SlotEvent> = {}): SlotEvent => ({
  type: "on_use",
  slug: "clawtree",
  ts:   new Date().toISOString(),
  ...overrides,
});

describe("shouldFire", () => {
  it("fires when trigger and slug match exactly", () => {
    expect(shouldFire(makeSlot(), makeEvent())).toBe(true);
  });

  it("does not fire when disabled", () => {
    expect(shouldFire(makeSlot({ enabled: false }), makeEvent())).toBe(false);
  });

  it("does not fire when trigger mismatch", () => {
    expect(shouldFire(makeSlot({ trigger: "on_install" }), makeEvent({ type: "on_use" }))).toBe(false);
  });

  it("wildcard slug '*' fires for any slug", () => {
    expect(shouldFire(makeSlot({ slug: "*" }), makeEvent({ slug: "decodo" }))).toBe(true);
  });

  it("wildcard trigger '*' fires for any event type", () => {
    expect(shouldFire(makeSlot({ trigger: "*" }), makeEvent({ type: "on_evolve" }))).toBe(true);
  });
});

describe("addSlot / removeSlot / toggleSlot", () => {
  it("addSlot adds slot with generated id", () => {
    const slots = addSlot([], { slug: "decodo", trigger: "on_install", action: "notify_user" });
    expect(slots).toHaveLength(1);
    expect(slots[0].id).toMatch(/^slot-/);
    expect(slots[0].fireCount).toBe(0);
  });

  it("removeSlot removes by id", () => {
    let slots = addSlot([], { slug: "decodo", trigger: "on_use", action: "notify_user" });
    slots = removeSlot(slots, slots[0].id);
    expect(slots).toHaveLength(0);
  });

  it("removeSlot is no-op for unknown id", () => {
    let slots = addSlot([], { slug: "decodo", trigger: "on_use", action: "notify_user" });
    slots = removeSlot(slots, "ghost-id");
    expect(slots).toHaveLength(1);
  });

  it("toggleSlot disables and re-enables a slot", () => {
    let slots = addSlot([], { slug: "decodo", trigger: "on_use", action: "notify_user" });
    slots = toggleSlot(slots, slots[0].id, false);
    expect(slots[0].enabled).toBe(false);
    slots = toggleSlot(slots, slots[0].id, true);
    expect(slots[0].enabled).toBe(true);
  });
});
