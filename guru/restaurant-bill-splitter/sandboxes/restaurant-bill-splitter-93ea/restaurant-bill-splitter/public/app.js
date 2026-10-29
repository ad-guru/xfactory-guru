/* ========================================================
   Restaurant Bill Splitter — client-side logic
   Features: f1 (equal), f2 (itemized), f3 (custom),
             f4 (tip), f5 (summary), f6 (mode switcher)
   ======================================================== */

(function () {
  "use strict";

  // ── State ──────────────────────────────────────────────
  const state = {
    mode: "equal",          // "equal" | "itemized" | "custom"
    tip: { pct: 18, flat: null },
    equal: { total: 0, diners: 2 },
    itemized: {
      diners: 2,
      names: ["Diner 1", "Diner 2"],
      items: [],            // { name, price, assignees: Set<int> }
    },
    custom: { total: 0, diners: 2, amounts: [0, 0] },
  };

  // ── DOM refs ───────────────────────────────────────────
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  const modeBtns = $$(".mode-btn");
  const panels = $$(".panel");
  const tipPresets = $$(".tip-preset");
  const tipCustom = $("#tip-custom");
  const tipFlat = $("#tip-flat");

  const eqTotal = $("#eq-total");
  const eqDiners = $("#eq-diners");

  const izDiners = $("#iz-diners");
  const izDinerNames = $("#iz-diner-names");
  const izItems = $("#iz-items");
  const izAddBtn = $("#iz-add-item");

  const cuTotal = $("#cu-total");
  const cuDiners = $("#cu-diners");
  const cuInputs = $("#cu-inputs");
  const cuRemaining = $("#cu-remaining");

  const summaryCards = $("#summary-cards");
  const grandTotalVal = $("#grand-total-value");

  // ── Helpers ────────────────────────────────────────────
  function fmt(n) {
    return "$" + Math.abs(n).toFixed(2);
  }

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  function ensureLength(arr, len, fill) {
    while (arr.length < len) arr.push(typeof fill === "function" ? fill() : fill);
    arr.length = len;
  }

  // ── Tip logic (f4) ────────────────────────────────────
  function getTipAmount(subtotal) {
    if (state.tip.flat !== null && state.tip.flat >= 0) return state.tip.flat;
    return subtotal * (state.tip.pct / 100);
  }

  function bindTip() {
    tipPresets.forEach((btn) => {
      btn.addEventListener("click", () => {
        const pct = parseFloat(btn.dataset.tip);
        state.tip.pct = pct;
        state.tip.flat = null;
        tipCustom.value = pct;
        tipFlat.value = "";
        tipPresets.forEach((b) => b.classList.toggle("active", b === btn));
        recalc();
      });
    });

    tipCustom.addEventListener("input", () => {
      const v = parseFloat(tipCustom.value);
      if (!isNaN(v) && v >= 0) {
        state.tip.pct = v;
        state.tip.flat = null;
        tipFlat.value = "";
        tipPresets.forEach((b) =>
          b.classList.toggle("active", parseFloat(b.dataset.tip) === v)
        );
      }
      recalc();
    });

    tipFlat.addEventListener("input", () => {
      const v = parseFloat(tipFlat.value);
      if (!isNaN(v) && v >= 0) {
        state.tip.flat = v;
        tipCustom.value = "";
        tipPresets.forEach((b) => b.classList.remove("active"));
      } else {
        state.tip.flat = null;
      }
      recalc();
    });
  }

  // ── Mode switcher (f6) ────────────────────────────────
  function setMode(mode) {
    state.mode = mode;
    modeBtns.forEach((b) => {
      const m = b.dataset.mode;
      b.classList.toggle("active", m === mode);
      b.setAttribute("aria-selected", m === mode ? "true" : "false");
    });
    panels.forEach((p) => {
      p.classList.toggle("hidden", p.id !== "panel-" + mode);
    });
    recalc();
  }

  function bindModeSwitcher() {
    modeBtns.forEach((b) => {
      b.addEventListener("click", () => setMode(b.dataset.mode));
    });
  }

  // ── Equal Split (f1) ──────────────────────────────────
  function bindEqual() {
    eqTotal.addEventListener("input", () => {
      state.equal.total = Math.max(0, parseFloat(eqTotal.value) || 0);
      recalc();
    });
    eqDiners.addEventListener("input", () => {
      state.equal.diners = clamp(parseInt(eqDiners.value) || 1, 1, 99);
      recalc();
    });
  }

  function calcEqual() {
    const { total, diners } = state.equal;
    const tip = getTipAmount(total);
    const perShare = total / diners;
    const tipShare = tip / diners;
    const results = [];
    for (let i = 0; i < diners; i++) {
      results.push({
        name: "Diner " + (i + 1),
        subtotal: perShare,
        tip: tipShare,
        total: perShare + tipShare,
      });
    }
    return { results, grandTotal: total + tip };
  }

  // ── Itemized Split (f2) ───────────────────────────────
  function renderDinerNames() {
    const n = state.itemized.diners;
    ensureLength(state.itemized.names, n, () => "Diner " + (state.itemized.names.length + 1));
    izDinerNames.innerHTML = "";
    for (let i = 0; i < n; i++) {
      const inp = document.createElement("input");
      inp.type = "text";
      inp.value = state.itemized.names[i];
      inp.placeholder = "Diner " + (i + 1);
      inp.addEventListener("input", () => {
        state.itemized.names[i] = inp.value || "Diner " + (i + 1);
        renderItemizedItems();
        recalc();
      });
      izDinerNames.appendChild(inp);
    }
  }

  function renderItemizedItems() {
    izItems.innerHTML = "";
    state.itemized.items.forEach((item, idx) => {
      const div = document.createElement("div");
      div.className = "iz-item";

      const header = document.createElement("div");
      header.className = "iz-item-header";

      const nameInp = document.createElement("input");
      nameInp.type = "text";
      nameInp.value = item.name;
      nameInp.placeholder = "Item name";
      nameInp.addEventListener("input", () => {
        item.name = nameInp.value;
      });

      const priceInp = document.createElement("input");
      priceInp.type = "number";
      priceInp.min = "0";
      priceInp.step = "0.01";
      priceInp.value = item.price || "";
      priceInp.placeholder = "Price";
      priceInp.addEventListener("input", () => {
        item.price = Math.max(0, parseFloat(priceInp.value) || 0);
        recalc();
      });

      const removeBtn = document.createElement("button");
      removeBtn.className = "iz-item-remove";
      removeBtn.textContent = "\u00d7";
      removeBtn.title = "Remove item";
      removeBtn.addEventListener("click", () => {
        state.itemized.items.splice(idx, 1);
        renderItemizedItems();
        recalc();
      });

      header.append(nameInp, priceInp, removeBtn);

      const diners = document.createElement("div");
      diners.className = "iz-item-diners";
      for (let d = 0; d < state.itemized.diners; d++) {
        const tag = document.createElement("button");
        tag.className = "iz-diner-tag" + (item.assignees.has(d) ? " selected" : "");
        tag.textContent = state.itemized.names[d] || "Diner " + (d + 1);
        tag.addEventListener("click", () => {
          if (item.assignees.has(d)) item.assignees.delete(d);
          else item.assignees.add(d);
          tag.classList.toggle("selected");
          recalc();
        });
        diners.appendChild(tag);
      }

      div.append(header, diners);
      izItems.appendChild(div);
    });
  }

  function bindItemized() {
    izDiners.addEventListener("input", () => {
      state.itemized.diners = clamp(parseInt(izDiners.value) || 1, 1, 20);
      renderDinerNames();
      renderItemizedItems();
      recalc();
    });

    izAddBtn.addEventListener("click", () => {
      state.itemized.items.push({ name: "", price: 0, assignees: new Set() });
      renderItemizedItems();
    });

    renderDinerNames();
  }

  function calcItemized() {
    const { diners, names, items } = state.itemized;
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
    const tip = getTipAmount(billTotal);

    const results = [];
    for (let i = 0; i < diners; i++) {
      const tipShare = billTotal > 0 ? (subtotals[i] / billTotal) * tip : tip / diners;
      results.push({
        name: names[i] || "Diner " + (i + 1),
        subtotal: subtotals[i],
        tip: tipShare,
        total: subtotals[i] + tipShare,
      });
    }
    return { results, grandTotal: billTotal + tip };
  }

  // ── Custom Amounts (f3) ───────────────────────────────
  function renderCustomInputs() {
    const n = state.custom.diners;
    ensureLength(state.custom.amounts, n, 0);
    cuInputs.innerHTML = "";
    for (let i = 0; i < n; i++) {
      const row = document.createElement("div");
      row.className = "cu-row";

      const label = document.createElement("label");
      label.textContent = "Diner " + (i + 1);

      const inp = document.createElement("input");
      inp.type = "number";
      inp.min = "0";
      inp.step = "0.01";
      inp.value = state.custom.amounts[i] || "";
      inp.placeholder = "0.00";
      inp.addEventListener("input", () => {
        state.custom.amounts[i] = Math.max(0, parseFloat(inp.value) || 0);
        recalc();
      });

      row.append(label, inp);
      cuInputs.appendChild(row);
    }
  }

  function bindCustom() {
    cuTotal.addEventListener("input", () => {
      state.custom.total = Math.max(0, parseFloat(cuTotal.value) || 0);
      recalc();
    });
    cuDiners.addEventListener("input", () => {
      state.custom.diners = clamp(parseInt(cuDiners.value) || 1, 1, 20);
      renderCustomInputs();
      recalc();
    });
    renderCustomInputs();
  }

  function calcCustom() {
    const { total, diners, amounts } = state.custom;
    const tip = getTipAmount(total);
    const totalWithTip = total + tip;
    const claimed = amounts.reduce((a, b) => a + b, 0);
    const tipPerDiner = tip / diners;

    const results = [];
    for (let i = 0; i < diners; i++) {
      results.push({
        name: "Diner " + (i + 1),
        subtotal: amounts[i],
        tip: tipPerDiner,
        total: amounts[i] + tipPerDiner,
      });
    }

    const remaining = totalWithTip - results.reduce((s, r) => s + r.total, 0);
    cuRemaining.textContent = (remaining >= 0 ? "" : "-") + fmt(remaining);
    cuRemaining.className = "balance-value " +
      (Math.abs(remaining) < 0.005 ? "zero" : remaining > 0 ? "positive" : "negative");

    return { results, grandTotal: totalWithTip };
  }

  // ── Render Summary (f5) ───────────────────────────────
  function renderSummary(results, grandTotal) {
    summaryCards.innerHTML = "";
    results.forEach((r) => {
      const card = document.createElement("div");
      card.className = "summary-card";
      card.innerHTML =
        '<span class="name">' + escHtml(r.name) + "</span>" +
        '<span class="line-label">Subtotal</span><span class="line-value">' + fmt(r.subtotal) + "</span>" +
        '<span class="line-label">Tip</span><span class="line-value">' + fmt(r.tip) + "</span>" +
        '<span class="total-label">Total</span><span class="total-value">' + fmt(r.total) + "</span>";
      summaryCards.appendChild(card);
    });
    grandTotalVal.textContent = fmt(grandTotal);
  }

  function escHtml(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  // ── Recalculate ────────────────────────────────────────
  function recalc() {
    let data;
    switch (state.mode) {
      case "equal":
        data = calcEqual();
        break;
      case "itemized":
        data = calcItemized();
        break;
      case "custom":
        data = calcCustom();
        break;
    }
    if (data) renderSummary(data.results, data.grandTotal);
  }

  // ── Boot ───────────────────────────────────────────────
  function init() {
    bindModeSwitcher();
    bindTip();
    bindEqual();
    bindItemized();
    bindCustom();
    recalc();
  }

  // Expose for testing
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { state, calcEqual, calcItemized, calcCustom, getTipAmount };
  }

  document.addEventListener("DOMContentLoaded", init);
})();
