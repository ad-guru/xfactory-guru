const express = require("express");
const { getSortedIncidents, getIncidentById, getSummary, getCriticalCounts } = require("./data");
const { formatTime } = require("./tz");

const app = express();
app.set("trust proxy", 1);

const TIMEZONE = "US/Pacific";

// --- Severity color helpers ---
function sevColor(sev) {
  const map = { sev0: "#dc2626", sev1: "#ea580c", sev2: "#ca8a04", sev3: "#65a30d" };
  return map[sev] || "#6b7280";
}

function statusColor(status) {
  const map = { open: "#dc2626", mitigating: "#d97706", resolved: "#16a34a" };
  return map[status] || "#6b7280";
}

function sevBadge(sev) {
  return `<span style="background:${sevColor(sev)};color:#fff;padding:2px 8px;border-radius:4px;font-size:0.85em;font-weight:600;">${sev.toUpperCase()}</span>`;
}

function statusBadge(status) {
  return `<span style="background:${statusColor(status)};color:#fff;padding:2px 8px;border-radius:4px;font-size:0.85em;font-weight:600;">${status.toUpperCase()}</span>`;
}

// --- Layout ---
function pageHead(title, extra) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background:#0f172a; color:#e2e8f0; }
  a { color:#38bdf8; text-decoration:none; }
  a:hover { text-decoration:underline; }
  .container { max-width:1100px; margin:0 auto; padding:24px 16px; }
  header { background:#1e293b; border-bottom:2px solid #334155; padding:16px 0; margin-bottom:24px; }
  header .inner { max-width:1100px; margin:0 auto; padding:0 16px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; }
  header h1 { font-size:1.4em; color:#f8fafc; }
  .critical-counts { display:flex; gap:12px; }
  .count-badge { padding:6px 14px; border-radius:6px; font-weight:700; font-size:0.95em; }
  .count-sev0 { background:#7f1d1d; color:#fca5a5; border:1px solid #dc2626; }
  .count-sev1 { background:#7c2d12; color:#fdba74; border:1px solid #ea580c; }
  table { width:100%; border-collapse:collapse; margin-top:16px; }
  th { background:#1e293b; color:#94a3b8; text-align:left; padding:10px 12px; font-size:0.85em; text-transform:uppercase; letter-spacing:0.05em; border-bottom:2px solid #334155; }
  td { padding:10px 12px; border-bottom:1px solid #1e293b; }
  tr:hover { background:#1e293b; }
  .filter-bar { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:8px; }
  .filter-btn { display:inline-block; padding:6px 16px; border-radius:6px; font-size:0.9em; font-weight:500; border:1px solid #475569; color:#cbd5e1; background:#1e293b; }
  .filter-btn:hover { background:#334155; text-decoration:none; }
  .filter-btn.active { background:#3b82f6; color:#fff; border-color:#3b82f6; }
  .detail-card { background:#1e293b; border-radius:8px; padding:24px; margin-bottom:24px; }
  .detail-card h2 { margin-bottom:12px; }
  .meta-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px; margin-top:16px; }
  .meta-item { background:#0f172a; padding:12px; border-radius:6px; }
  .meta-label { font-size:0.8em; color:#94a3b8; text-transform:uppercase; letter-spacing:0.05em; }
  .meta-value { font-size:1.1em; margin-top:4px; }
  .timeline { margin-top:24px; }
  .timeline h3 { margin-bottom:16px; color:#94a3b8; text-transform:uppercase; font-size:0.85em; letter-spacing:0.05em; }
  .tl-entry { display:flex; gap:16px; padding:12px 0; border-left:2px solid #334155; margin-left:8px; padding-left:20px; position:relative; }
  .tl-entry::before { content:''; position:absolute; left:-5px; top:16px; width:10px; height:10px; border-radius:50%; background:#3b82f6; }
  .tl-time { color:#94a3b8; font-size:0.85em; min-width:170px; }
  .tl-note { flex:1; }
  .tz-note { color:#64748b; font-size:0.8em; margin-top:8px; }
  ${extra || ""}
</style>
</head>
<body>`;
}

function pageFooter() {
  return `<div class="container"><p class="tz-note">All times displayed in ${TIMEZONE}</p></div></body></html>`;
}

// --- Routes ---

// GET / — Incident board
app.get("/", (req, res) => {
  const filterStatus = req.query.status || null;
  const incidents = getSortedIncidents(filterStatus);
  const counts = getCriticalCounts();

  const statuses = ["open", "mitigating", "resolved"];

  let filterHtml = `<div class="filter-bar">`;
  filterHtml += `<a class="filter-btn${!filterStatus ? " active" : ""}" href="./">All</a>`;
  for (const s of statuses) {
    filterHtml += `<a class="filter-btn${filterStatus === s ? " active" : ""}" href="?status=${s}">${s.charAt(0).toUpperCase() + s.slice(1)}</a>`;
  }
  filterHtml += `</div>`;

  let rows = "";
  for (const inc of incidents) {
    rows += `<tr>
      <td><a href="incidents/${inc.id}">${inc.id}</a></td>
      <td><a href="incidents/${inc.id}">${inc.title}</a></td>
      <td>${sevBadge(inc.severity)}</td>
      <td>${inc.service}</td>
      <td>${formatTime(inc.opened_at, TIMEZONE)}</td>
      <td>${statusBadge(inc.status)}</td>
    </tr>`;
  }

  const html = `${pageHead("Incident Board")}
<header>
  <div class="inner">
    <h1>Incident Board</h1>
    <div class="critical-counts">
      <span class="count-badge count-sev0">SEV0: ${counts.sev0}</span>
      <span class="count-badge count-sev1">SEV1: ${counts.sev1}</span>
    </div>
  </div>
</header>
<div class="container">
  ${filterHtml}
  <table>
    <thead><tr>
      <th>ID</th><th>Title</th><th>Severity</th><th>Service</th><th>Opened At</th><th>Status</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
</div>
${pageFooter()}`;

  res.type("html").send(html);
});

// GET /incidents/:id — Incident detail
app.get("/incidents/:id", (req, res) => {
  const inc = getIncidentById(req.params.id);
  if (!inc) {
    res.status(404).type("html").send(`${pageHead("Not Found")}<div class="container"><h2>Incident not found</h2><p><a href="../">Back to board</a></p></div></body></html>`);
    return;
  }

  let timelineHtml = "";
  for (const entry of inc.timeline) {
    timelineHtml += `<div class="tl-entry">
      <div class="tl-time">${formatTime(entry.time, TIMEZONE)}<br>${statusBadge(entry.status)}</div>
      <div class="tl-note">${entry.note}</div>
    </div>`;
  }

  const html = `${pageHead(`${inc.id} - ${inc.title}`)}
<header>
  <div class="inner">
    <h1><a href="../" style="color:#f8fafc;">Incident Board</a></h1>
  </div>
</header>
<div class="container">
  <div class="detail-card">
    <h2>${inc.id}: ${inc.title}</h2>
    <div class="meta-grid">
      <div class="meta-item">
        <div class="meta-label">Severity</div>
        <div class="meta-value">${sevBadge(inc.severity)}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Status</div>
        <div class="meta-value">${statusBadge(inc.status)}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Service</div>
        <div class="meta-value">${inc.service}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Opened At</div>
        <div class="meta-value">${formatTime(inc.opened_at, TIMEZONE)}</div>
      </div>
    </div>
  </div>
  <div class="detail-card timeline">
    <h3>Timeline</h3>
    ${timelineHtml}
  </div>
  <p><a href="../">Back to board</a></p>
</div>
${pageFooter()}`;

  res.type("html").send(html);
});

// GET /api/summary — JSON summary
app.get("/api/summary", (_req, res) => {
  res.json(getSummary());
});

// GET /health — liveness check
app.get("/health", (_req, res) => {
  res.type("text").send("ok");
});

// Start
const PORT = parseInt(process.env.PORT || "3000", 10);
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Incident board listening on 0.0.0.0:${PORT}`);
});
