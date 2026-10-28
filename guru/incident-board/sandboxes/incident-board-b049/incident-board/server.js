const express = require("express");
const incidents = require("./data");

const app = express();
const PORT = process.env.PORT || 3000;
const DISPLAY_TZ = "US/Pacific";

app.set("trust proxy", 1);

// ---------- helpers ----------

function formatTime(isoString) {
  const d = new Date(isoString);
  return d.toLocaleString("en-US", {
    timeZone: DISPLAY_TZ,
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
}

const STATUS_ORDER = { open: 0, mitigating: 1, resolved: 2 };
const SEV_ORDER = { sev1: 1, sev2: 2, sev3: 3 };

function sortIncidents(list) {
  return [...list].sort((a, b) => {
    const so = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    if (so !== 0) return so;
    return SEV_ORDER[a.severity] - SEV_ORDER[b.severity];
  });
}

function sevBadge(sev) {
  const colors = { sev1: "#dc2626", sev2: "#ea580c", sev3: "#ca8a04" };
  return `<span style="background:${colors[sev]};color:#fff;padding:2px 8px;border-radius:4px;font-size:0.85em;font-weight:600">${sev.toUpperCase()}</span>`;
}

function statusBadge(status) {
  const colors = { open: "#dc2626", mitigating: "#ea580c", resolved: "#16a34a" };
  return `<span style="background:${colors[status]};color:#fff;padding:2px 8px;border-radius:4px;font-size:0.85em;font-weight:600">${status.charAt(0).toUpperCase() + status.slice(1)}</span>`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---------- layout ----------

function pageHead(title) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
  *,*::before,*::after{box-sizing:border-box}
  body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#0f172a;color:#e2e8f0;line-height:1.6}
  .container{max-width:1100px;margin:0 auto;padding:24px 16px}
  h1{font-size:1.75rem;margin:0 0 4px;color:#f8fafc}
  .subtitle{color:#94a3b8;font-size:0.9rem;margin-bottom:24px}
  table{width:100%;border-collapse:collapse;background:#1e293b;border-radius:8px;overflow:hidden}
  th{text-align:left;padding:12px 16px;background:#334155;color:#94a3b8;font-size:0.8rem;text-transform:uppercase;letter-spacing:0.05em}
  td{padding:12px 16px;border-top:1px solid #334155;font-size:0.9rem}
  tr:hover td{background:#253349}
  a{color:#38bdf8;text-decoration:none}
  a:hover{text-decoration:underline}
  .filter-bar{display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap}
  .filter-bar a{padding:6px 14px;border-radius:6px;font-size:0.85rem;font-weight:500;transition:background .15s}
  .filter-bar a.active{background:#38bdf8;color:#0f172a}
  .filter-bar a:not(.active){background:#334155;color:#cbd5e1}
  .filter-bar a:not(.active):hover{background:#475569}
  .card{background:#1e293b;border-radius:8px;padding:24px;margin-bottom:16px}
  .card h2{margin:0 0 4px;font-size:1.3rem;color:#f8fafc}
  .card .meta{color:#94a3b8;font-size:0.85rem;margin-bottom:16px}
  .timeline{list-style:none;padding:0;margin:0;border-left:2px solid #475569;margin-left:8px}
  .timeline li{padding:8px 0 8px 20px;position:relative}
  .timeline li::before{content:"";position:absolute;left:-6px;top:14px;width:10px;height:10px;border-radius:50%;background:#38bdf8}
  .timeline .tl-time{font-size:0.8rem;color:#64748b}
  .timeline .tl-note{margin-top:2px}
  .back{display:inline-block;margin-bottom:16px;font-size:0.9rem}
</style>
</head>
<body>
<div class="container">`;
}

function pageFoot() {
  return `</div></body></html>`;
}

// ---------- GET / — incident board ----------

app.get("/", (req, res) => {
  const filterStatus = req.query.status || null;
  const validStatuses = ["open", "mitigating", "resolved"];
  const activeFilter = validStatuses.includes(filterStatus) ? filterStatus : null;

  let list = activeFilter
    ? incidents.filter((i) => i.status === activeFilter)
    : incidents;
  list = sortIncidents(list);

  let html = pageHead("Incident Board");
  html += `<h1>Incident Board</h1>`;
  html += `<p class="subtitle">Displaying times in ${DISPLAY_TZ}</p>`;

  // filter bar
  html += `<div class="filter-bar">`;
  html += `<a href="./" class="${!activeFilter ? "active" : ""}">All</a>`;
  for (const s of validStatuses) {
    html += `<a href="?status=${s}" class="${activeFilter === s ? "active" : ""}">${s.charAt(0).toUpperCase() + s.slice(1)}</a>`;
  }
  html += `</div>`;

  html += `<table>
  <thead><tr>
    <th>ID</th><th>Title</th><th>Severity</th><th>Service</th><th>Opened At</th><th>Status</th>
  </tr></thead><tbody>`;

  for (const inc of list) {
    html += `<tr>
      <td>${escapeHtml(inc.id)}</td>
      <td><a href="incidents/${encodeURIComponent(inc.id)}">${escapeHtml(inc.title)}</a></td>
      <td>${sevBadge(inc.severity)}</td>
      <td>${escapeHtml(inc.service)}</td>
      <td>${formatTime(inc.openedAt)}</td>
      <td>${statusBadge(inc.status)}</td>
    </tr>`;
  }

  html += `</tbody></table>`;
  html += pageFoot();
  res.type("html").send(html);
});

// ---------- GET /incidents/:id — detail ----------

app.get("/incidents/:id", (req, res) => {
  const inc = incidents.find((i) => i.id === req.params.id);
  if (!inc) {
    res.status(404).type("html").send(
      pageHead("Not Found") +
        `<h1>Incident not found</h1><a class="back" href="../">Back to board</a>` +
        pageFoot()
    );
    return;
  }

  let html = pageHead(`${inc.id} — ${inc.title}`);
  html += `<a class="back" href="../">&#8592; Back to board</a>`;
  html += `<div class="card">`;
  html += `<h2>${escapeHtml(inc.id)}: ${escapeHtml(inc.title)}</h2>`;
  html += `<div class="meta">${sevBadge(inc.severity)} ${statusBadge(inc.status)} &nbsp;&middot;&nbsp; <strong>Service:</strong> ${escapeHtml(inc.service)} &nbsp;&middot;&nbsp; <strong>Opened:</strong> ${formatTime(inc.openedAt)}</div>`;

  html += `<h3 style="margin:16px 0 8px;color:#f8fafc">Timeline</h3>`;
  html += `<ul class="timeline">`;
  for (const entry of inc.timeline) {
    html += `<li>
      <div class="tl-time">${formatTime(entry.time)} — ${statusBadge(entry.status)}</div>
      <div class="tl-note">${escapeHtml(entry.note)}</div>
    </li>`;
  }
  html += `</ul></div>`;
  html += pageFoot();
  res.type("html").send(html);
});

// ---------- GET /api/summary ----------

app.get("/api/summary", (_req, res) => {
  const bySeverity = {};
  const byStatus = {};
  for (const inc of incidents) {
    bySeverity[inc.severity] = (bySeverity[inc.severity] || 0) + 1;
    byStatus[inc.status] = (byStatus[inc.status] || 0) + 1;
  }
  res.json({ total: incidents.length, bySeverity, byStatus });
});

// ---------- GET /health ----------

app.get("/health", (_req, res) => {
  res.type("text").send("ok");
});

// ---------- start ----------

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Incident board listening on 0.0.0.0:${PORT}`);
});
