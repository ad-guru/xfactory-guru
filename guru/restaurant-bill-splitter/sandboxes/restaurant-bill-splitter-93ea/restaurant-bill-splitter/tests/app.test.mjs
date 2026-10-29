import { describe, it } from "node:test";
import assert from "node:assert/strict";

/*
 * The client-side app.js lives in an IIFE, so we re-implement the
 * core calculation functions here to test the bill-splitting logic
 * independently. This verifies the algorithms that drive f1-f5.
 */

// ── Helpers (mirrors app.js) ─────────────────────────────
function getTipAmount(subtotal, tip) {
  if (tip.flat !== null && tip.flat >= 0) return tip.flat;
  return subtotal * (tip.pct / 100);
}

function calcEqual(total, diners, tip) {
  const tipAmt = getTipAmount(total, tip);
  const perShare = total / diners;
  const tipShare = tipAmt / diners;
  const results = [];
  for (let i = 0; i < diners; i++) {
    results.push({
      name: "Diner " + (i + 1),
      subtotal: perShare,
      tip: tipShare,
      total: perShare + tipShare,
    });
  }
  return { results, grandTotal: total + tipAmt };
}

function calcItemized(diners, names, items, tip) {
  const subtotals = new Array(diners).fill(0);
  items.forEach((item) => {
    const count = item.assignees.size;
    if (count === 0) return;
    const share = item.price / count;
    item.assignees.forEach((d) => {
      if (d < diners) subtotals[d] += share;
    });
  });
  const billTotal = subtotals.reduce((a, b) => a + b, 0);
  const tipAmt = getTipAmount(billTotal, tip);
  const results = [];
  for (let i = 0; i < diners; i++) {
    const tipShare = billTotal > 0 ? (subtotals[i] / billTotal) * tipAmt : tipAmt / diners;
    results.push({
      name: names[i] || "Diner " + (i + 1),
      subtotal: subtotals[i],
      tip: tipShare,
      total: subtotals[i] + tipShare,
    });
  }
  return { results, grandTotal: billTotal + tipAmt };
}

function calcCustom(total, diners, amounts, tip) {
  const tipAmt = getTipAmount(total, tip);
  const tipPerDiner = tipAmt / diners;
  const results = [];
  for (let i = 0; i < diners; i++) {
    results.push({
      name: "Diner " + (i + 1),
      subtotal: amounts[i],
      tip: tipPerDiner,
      total: amounts[i] + tipPerDiner,
    });
  }
  const remaining = (total + tipAmt) - results.reduce((s, r) => s + r.total, 0);
  return { results, grandTotal: total + tipAmt, remaining };
}

// ── Tests ────────────────────────────────────────────────

describe("f4: Tip Calculator", () => {
  it("computes percentage tip", () => {
    assert.equal(getTipAmount(100, { pct: 20, flat: null }), 20);
  });

  it("computes flat tip (overrides pct)", () => {
    assert.equal(getTipAmount(100, { pct: 20, flat: 15 }), 15);
  });

  it("zero percentage gives zero tip", () => {
    assert.equal(getTipAmount(50, { pct: 0, flat: null }), 0);
  });

  it("flat tip of zero gives zero", () => {
    assert.equal(getTipAmount(100, { pct: 18, flat: 0 }), 0);
  });
});

describe("f1: Equal Split", () => {
  const tip = { pct: 18, flat: null };

  it("splits $100 among 4 diners at 18% tip", () => {
    const r = calcEqual(100, 4, tip);
    assert.equal(r.grandTotal, 118);
    assert.equal(r.results.length, 4);
    r.results.forEach((p) => {
      assert.ok(Math.abs(p.subtotal - 25) < 0.001);
      assert.ok(Math.abs(p.tip - 4.5) < 0.001);
      assert.ok(Math.abs(p.total - 29.5) < 0.001);
    });
  });

  it("single diner pays everything", () => {
    const r = calcEqual(80, 1, { pct: 20, flat: null });
    assert.equal(r.grandTotal, 96);
    assert.equal(r.results[0].subtotal, 80);
    assert.equal(r.results[0].tip, 16);
    assert.equal(r.results[0].total, 96);
  });

  it("zero bill gives zero shares", () => {
    const r = calcEqual(0, 3, tip);
    assert.equal(r.grandTotal, 0);
    r.results.forEach((p) => assert.equal(p.total, 0));
  });

  it("flat tip splits evenly", () => {
    const r = calcEqual(100, 5, { pct: 0, flat: 10 });
    assert.equal(r.grandTotal, 110);
    r.results.forEach((p) => {
      assert.ok(Math.abs(p.tip - 2) < 0.001);
      assert.ok(Math.abs(p.total - 22) < 0.001);
    });
  });
});

describe("f2: Itemized Split", () => {
  it("splits items among assigned diners", () => {
    const items = [
      { name: "Burger", price: 15, assignees: new Set([0]) },
      { name: "Pizza", price: 20, assignees: new Set([1]) },
      { name: "Fries", price: 10, assignees: new Set([0, 1]) },
    ];
    const tip = { pct: 20, flat: null };
    const r = calcItemized(2, ["Alice", "Bob"], items, tip);

    // Alice: 15 + 5 = 20, Bob: 20 + 5 = 25, total bill = 45
    assert.ok(Math.abs(r.results[0].subtotal - 20) < 0.001);
    assert.ok(Math.abs(r.results[1].subtotal - 25) < 0.001);

    // Tip = 45 * 0.20 = 9; Alice tip share = (20/45)*9 = 4, Bob = (25/45)*9 = 5
    assert.ok(Math.abs(r.results[0].tip - 4) < 0.001);
    assert.ok(Math.abs(r.results[1].tip - 5) < 0.001);
    assert.ok(Math.abs(r.grandTotal - 54) < 0.001);
  });

  it("unassigned items cost no one", () => {
    const items = [
      { name: "Mystery", price: 30, assignees: new Set() },
    ];
    const r = calcItemized(2, ["A", "B"], items, { pct: 18, flat: null });
    assert.equal(r.results[0].subtotal, 0);
    assert.equal(r.results[1].subtotal, 0);
    assert.equal(r.grandTotal, 0);
  });

  it("all items assigned to one person", () => {
    const items = [
      { name: "Steak", price: 40, assignees: new Set([0]) },
      { name: "Wine", price: 20, assignees: new Set([0]) },
    ];
    const r = calcItemized(2, ["A", "B"], items, { pct: 0, flat: 0 });
    assert.equal(r.results[0].subtotal, 60);
    assert.equal(r.results[1].subtotal, 0);
    assert.equal(r.grandTotal, 60);
  });
});

describe("f3: Custom Amounts", () => {
  it("shows remaining when under-claimed", () => {
    const r = calcCustom(100, 2, [30, 40], { pct: 0, flat: null });
    assert.ok(Math.abs(r.remaining - 30) < 0.001);
  });

  it("shows zero remaining when exactly claimed", () => {
    const r = calcCustom(100, 2, [50, 50], { pct: 0, flat: null });
    assert.ok(Math.abs(r.remaining) < 0.001);
  });

  it("shows negative remaining when over-claimed", () => {
    const r = calcCustom(100, 2, [60, 60], { pct: 0, flat: null });
    assert.ok(r.remaining < -0.001);
  });

  it("tip is split evenly among diners", () => {
    const r = calcCustom(100, 3, [30, 30, 40], { pct: 15, flat: null });
    // tip = 15
    r.results.forEach((p) => assert.ok(Math.abs(p.tip - 5) < 0.001));
    assert.ok(Math.abs(r.grandTotal - 115) < 0.001);
  });
});

describe("f5: Per-Person Summary shape", () => {
  it("each result has name, subtotal, tip, total", () => {
    const r = calcEqual(50, 2, { pct: 10, flat: null });
    r.results.forEach((p) => {
      assert.ok(typeof p.name === "string");
      assert.ok(typeof p.subtotal === "number");
      assert.ok(typeof p.tip === "number");
      assert.ok(typeof p.total === "number");
      assert.ok(Math.abs(p.total - (p.subtotal + p.tip)) < 0.001);
    });
  });
});
