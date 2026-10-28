const express = require("express");
const path = require("path");
const staticData = require("./data/static-stats");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// API endpoint — returns the cricket stats (static fallback)
app.get("/api/stats", (_req, res) => {
  res.json({
    source: "static",
    lastUpdated: "2024-06-01",
    players: staticData
  });
});

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// SPA fallback
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Cricket Stats dashboard running on http://0.0.0.0:${PORT}`);
});
