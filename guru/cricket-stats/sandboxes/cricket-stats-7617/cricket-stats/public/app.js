/* ===== Cricket Stats Dashboard — app.js ===== */

(function () {
  "use strict";

  const FORMATS = ["test", "odi", "t20i"];
  const FORMAT_LABELS = { test: "Test", odi: "ODI", t20i: "T20I" };
  const STAT_FIELDS = [
    { key: "matches", label: "Matches" },
    { key: "innings", label: "Innings" },
    { key: "runs", label: "Runs" },
    { key: "notOuts", label: "Not Outs" },
    { key: "highestScore", label: "Highest" },
    { key: "average", label: "Average" },
    { key: "strikeRate", label: "SR" },
    { key: "centuries", label: "100s" },
    { key: "halfCenturies", label: "50s" },
    { key: "fours", label: "4s" },
    { key: "sixes", label: "6s" }
  ];
  const CHART_COLORS = {
    sachin: { bg: "rgba(240,136,62,0.75)", border: "#f0883e" },
    kohli:  { bg: "rgba(88,166,255,0.75)", border: "#58a6ff" }
  };

  let data = null;

  /* ---------- fetch ---------- */
  async function loadData() {
    try {
      const res = await fetch("api/stats");
      if (!res.ok) throw new Error(res.statusText);
      const json = await res.json();
      data = json.players;
      document.getElementById("dataBadge").textContent =
        json.source === "static"
          ? "Static data — last updated " + json.lastUpdated
          : "Live data";
    } catch (err) {
      console.error("Failed to load stats:", err);
      document.getElementById("dataBadge").textContent = "Data load failed";
      return;
    }
    renderAll();
  }

  /* ---------- f1: Overview Cards ---------- */
  function renderOverviewCards() {
    const container = document.getElementById("overviewCards");
    container.innerHTML = "";
    for (const [key, player] of [["sachin", data.sachin], ["kohli", data.kohli]]) {
      const totals = computeTotals(player);
      const card = document.createElement("div");
      card.className = `player-card ${key}`;
      card.innerHTML = `
        <div class="card-header">
          <img class="card-avatar" src="${player.image}" alt="${player.name}"
               onerror="this.style.display='none'" />
          <div>
            <div class="card-name">${player.name}</div>
            <div class="card-meta">${player.country} &middot; ${player.career} &middot; ${player.battingStyle}</div>
          </div>
        </div>
        <div class="stat-grid">
          ${statBox(totals.matches, "Matches")}
          ${statBox(totals.innings, "Innings")}
          ${statBox(fmt(totals.runs), "Runs")}
          ${statBox(totals.average.toFixed(2), "Average")}
          ${statBox(totals.strikeRate.toFixed(2), "Strike Rate")}
          ${statBox(totals.highestScore, "Highest")}
          ${statBox(totals.centuries, "Centuries")}
          ${statBox(totals.halfCenturies, "Half Cents")}
        </div>`;
      container.appendChild(card);
    }
  }

  function statBox(value, label) {
    return `<div class="stat-item"><div class="stat-value">${value}</div><div class="stat-label">${label}</div></div>`;
  }

  function computeTotals(player) {
    let matches = 0, innings = 0, runs = 0, notOuts = 0, centuries = 0, halfCenturies = 0;
    let best = "", bestNum = 0;
    for (const f of FORMATS) {
      const s = player.formats[f];
      matches += s.matches;
      innings += s.innings;
      runs += s.runs;
      notOuts += s.notOuts;
      centuries += s.centuries;
      halfCenturies += s.halfCenturies;
      const hs = parseHS(s.highestScore);
      if (hs > bestNum) { bestNum = hs; best = s.highestScore; }
    }
    const avg = (innings - notOuts) > 0 ? runs / (innings - notOuts) : 0;
    const balls = estimateBalls(player);
    const sr = balls > 0 ? (runs / balls) * 100 : 0;
    return { matches, innings, runs, notOuts, average: avg, strikeRate: sr, highestScore: best, centuries, halfCenturies };
  }

  function estimateBalls(player) {
    let balls = 0;
    for (const f of FORMATS) {
      const s = player.formats[f];
      if (s.strikeRate > 0) balls += (s.runs / s.strikeRate) * 100;
    }
    return Math.round(balls);
  }

  function parseHS(str) { return parseInt(String(str).replace("*", ""), 10) || 0; }

  function fmt(n) { return Number(n).toLocaleString("en-IN"); }

  /* ---------- f2: Format Tables ---------- */
  function renderFormatTables() {
    const container = document.getElementById("formatTables");
    container.innerHTML = "";
    for (const f of FORMATS) {
      const wrapper = document.createElement("div");
      wrapper.className = `format-table-wrapper ${f === "test" ? "active" : ""}`;
      wrapper.dataset.format = f;

      const sachinStats = data.sachin.formats[f];
      const kohliStats  = data.kohli.formats[f];

      let headerCells = "<th>Player</th>";
      let sachinCells = `<td class="player-name-cell">${data.sachin.name}</td>`;
      let kohliCells  = `<td class="player-name-cell">${data.kohli.name}</td>`;

      for (const sf of STAT_FIELDS) {
        headerCells += `<th>${sf.label}</th>`;
        const sv = sachinStats[sf.key];
        const kv = kohliStats[sf.key];
        const sNum = typeof sv === "number" ? sv : parseHS(sv);
        const kNum = typeof kv === "number" ? kv : parseHS(kv);
        const sLeader = sNum > kNum ? ' class="leader-cell"' : "";
        const kLeader = kNum > sNum ? ' class="leader-cell"' : "";
        sachinCells += `<td${sLeader}>${fmtStat(sv)}</td>`;
        kohliCells  += `<td${kLeader}>${fmtStat(kv)}</td>`;
      }

      wrapper.innerHTML = `<table class="stats-table">
        <thead><tr>${headerCells}</tr></thead>
        <tbody>
          <tr class="sachin-row">${sachinCells}</tr>
          <tr class="kohli-row">${kohliCells}</tr>
        </tbody></table>`;
      container.appendChild(wrapper);
    }

    // Tab listeners
    document.querySelectorAll(".format-tabs .tab").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".format-tabs .tab").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        document.querySelectorAll(".format-table-wrapper").forEach(w => {
          w.classList.toggle("active", w.dataset.format === btn.dataset.format);
        });
      });
    });
  }

  function fmtStat(v) {
    if (typeof v === "number") return Number.isInteger(v) ? fmt(v) : v.toFixed(2);
    return v;
  }

  /* ---------- f3: Comparison Bars ---------- */
  function renderComparison() {
    renderComparisonForFormat("test");

    document.querySelectorAll(".comp-tab").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".comp-tab").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderComparisonForFormat(btn.dataset.format);
      });
    });
  }

  function renderComparisonForFormat(format) {
    const container = document.getElementById("comparisonBars");
    container.innerHTML = "";

    let sachinStats, kohliStats;
    if (format === "overall") {
      sachinStats = computeTotals(data.sachin);
      kohliStats  = computeTotals(data.kohli);
    } else {
      sachinStats = data.sachin.formats[format];
      kohliStats  = data.kohli.formats[format];
    }

    const metrics = [
      { key: "matches", label: "Matches" },
      { key: "runs", label: "Runs" },
      { key: "average", label: "Average" },
      { key: "strikeRate", label: "Strike Rate" },
      { key: "centuries", label: "Centuries" },
      { key: "halfCenturies", label: "Half Centuries" },
      { key: "fours", label: "Fours" },
      { key: "sixes", label: "Sixes" }
    ];

    for (const m of metrics) {
      const sv = typeof sachinStats[m.key] === "number" ? sachinStats[m.key] : parseHS(sachinStats[m.key]);
      const kv = typeof kohliStats[m.key] === "number" ? kohliStats[m.key] : parseHS(kohliStats[m.key]);
      const max = Math.max(sv, kv, 1);
      const sWidth = Math.max((sv / max) * 100, 8);
      const kWidth = Math.max((kv / max) * 100, 8);

      const row = document.createElement("div");
      row.className = "comparison-row";
      row.innerHTML = `
        <div class="comp-label">${m.label}</div>
        <div class="comp-bars-container">
          <div class="comp-bar sachin${sv >= kv ? " leader" : ""}" style="width:${sWidth}%">${fmtStat(sv)}</div>
          <span class="comp-vs">vs</span>
          <div class="comp-bar kohli${kv >= sv ? " leader" : ""}" style="width:${kWidth}%">${fmtStat(kv)}</div>
        </div>`;
      container.appendChild(row);
    }
  }

  /* ---------- f4: Centuries & Milestones Charts ---------- */
  function renderMilestoneCharts() {
    const labels = FORMATS.map(f => FORMAT_LABELS[f]);
    const sachinCenturies = FORMATS.map(f => data.sachin.formats[f].centuries);
    const kohliCenturies  = FORMATS.map(f => data.kohli.formats[f].centuries);
    const sachinHalfs     = FORMATS.map(f => data.sachin.formats[f].halfCenturies);
    const kohliHalfs      = FORMATS.map(f => data.kohli.formats[f].halfCenturies);
    const sachinDoubles   = FORMATS.map(f => data.sachin.formats[f].doubleCenturies);
    const kohliDoubles    = FORMATS.map(f => data.kohli.formats[f].doubleCenturies);

    barChart("centuriesChart", "Centuries by Format", labels, sachinCenturies, kohliCenturies);
    barChart("halfCenturiesChart", "Half-Centuries by Format", labels, sachinHalfs, kohliHalfs);
    barChart("doubleCenturiesChart", "Double Centuries by Format", labels, sachinDoubles, kohliDoubles);
  }

  /* ---------- f5: Average & Strike Rate Charts ---------- */
  function renderAvgSrCharts() {
    const labels = FORMATS.map(f => FORMAT_LABELS[f]);
    const sachinAvg = FORMATS.map(f => data.sachin.formats[f].average);
    const kohliAvg  = FORMATS.map(f => data.kohli.formats[f].average);
    const sachinSR  = FORMATS.map(f => data.sachin.formats[f].strikeRate);
    const kohliSR   = FORMATS.map(f => data.kohli.formats[f].strikeRate);

    barChart("averageChart", "Batting Average by Format", labels, sachinAvg, kohliAvg);
    barChart("strikeRateChart", "Strike Rate by Format", labels, sachinSR, kohliSR);
  }

  /* ---------- Chart helper ---------- */
  function barChart(canvasId, title, labels, sachinData, kohliData) {
    const ctx = document.getElementById(canvasId).getContext("2d");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Sachin Tendulkar",
            data: sachinData,
            backgroundColor: CHART_COLORS.sachin.bg,
            borderColor: CHART_COLORS.sachin.border,
            borderWidth: 1,
            borderRadius: 4
          },
          {
            label: "Virat Kohli",
            data: kohliData,
            backgroundColor: CHART_COLORS.kohli.bg,
            borderColor: CHART_COLORS.kohli.border,
            borderWidth: 1,
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: title, color: "#e6edf3", font: { size: 14, weight: "bold" } },
          legend: { labels: { color: "#8b949e" } }
        },
        scales: {
          x: { ticks: { color: "#8b949e" }, grid: { color: "rgba(48,54,61,0.5)" } },
          y: { beginAtZero: true, ticks: { color: "#8b949e" }, grid: { color: "rgba(48,54,61,0.5)" } }
        }
      }
    });
  }

  /* ---------- Render all ---------- */
  function renderAll() {
    renderOverviewCards();
    renderFormatTables();
    renderComparison();
    renderMilestoneCharts();
    renderAvgSrCharts();
  }

  /* ---------- Init ---------- */
  loadData();

})();
