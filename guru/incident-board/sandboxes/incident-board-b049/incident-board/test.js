/**
 * Test script for incident-board.
 * Starts the server, runs HTTP assertions, then shuts down.
 */
const http = require("http");
const { spawn } = require("child_process");

const PORT = 9736; // high ephemeral port to avoid conflicts
let server;
let passed = 0;
let failed = 0;

function get(path) {
  return new Promise((resolve, reject) => {
    http
      .get(`http://127.0.0.1:${PORT}${path}`, (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body }));
      })
      .on("error", reject);
  });
}

function assert(label, condition) {
  if (condition) {
    passed++;
    console.log(`  PASS  ${label}`);
  } else {
    failed++;
    console.error(`  FAIL  ${label}`);
  }
}

async function run() {
  console.log("Starting server...");
  server = spawn(process.execPath, ["server.js"], {
    env: { ...process.env, PORT: String(PORT) },
    cwd: __dirname,
    stdio: ["ignore", "pipe", "pipe"]
  });

  // wait for server to be ready
  await new Promise((resolve) => {
    const check = () => {
      http
        .get(`http://127.0.0.1:${PORT}/health`, (res) => {
          res.resume();
          resolve();
        })
        .on("error", () => setTimeout(check, 200));
    };
    setTimeout(check, 500);
  });

  console.log("\n--- /health ---");
  {
    const r = await get("/health");
    assert("status 200", r.status === 200);
    assert("body is 'ok'", r.body.trim() === "ok");
    assert("content-type text", r.headers["content-type"].includes("text/plain"));
  }

  console.log("\n--- /api/summary ---");
  {
    const r = await get("/api/summary");
    assert("status 200", r.status === 200);
    assert("content-type json", r.headers["content-type"].includes("application/json"));
    const data = JSON.parse(r.body);
    assert("total is 8", data.total === 8);
    assert("has bySeverity", typeof data.bySeverity === "object");
    assert("has byStatus", typeof data.byStatus === "object");
    assert("sev1 count is 3", data.bySeverity.sev1 === 3);
    assert("sev2 count is 3", data.bySeverity.sev2 === 3);
    assert("sev3 count is 2", data.bySeverity.sev3 === 2);
    assert("open count is 3", data.byStatus.open === 3);
    assert("mitigating count is 2", data.byStatus.mitigating === 2);
    assert("resolved count is 3", data.byStatus.resolved === 3);
  }

  console.log("\n--- GET / (board) ---");
  {
    const r = await get("/");
    assert("status 200", r.status === 200);
    assert("contains Incident Board", r.body.includes("Incident Board"));
    assert("contains INC-001", r.body.includes("INC-001"));
    assert("contains US/Pacific timezone label", r.body.includes("US/Pacific"));
    assert("contains filter links", r.body.includes("?status=open"));
  }

  console.log("\n--- GET /?status=open (filtered) ---");
  {
    const r = await get("/?status=open");
    assert("status 200", r.status === 200);
    assert("contains INC-001 (open)", r.body.includes("INC-001"));
    assert("does not contain INC-003 (resolved)", !r.body.includes("INC-003"));
    assert("does not contain INC-005 (resolved)", !r.body.includes("INC-005"));
  }

  console.log("\n--- GET /incidents/INC-001 (detail) ---");
  {
    const r = await get("/incidents/INC-001");
    assert("status 200", r.status === 200);
    assert("contains incident title", r.body.includes("Database connection pool exhaustion"));
    assert("contains timeline entries", r.body.includes("Alert triggered"));
    assert("contains back link", r.body.includes("Back to board"));
  }

  console.log("\n--- GET /incidents/NONEXIST (404) ---");
  {
    const r = await get("/incidents/NONEXIST");
    assert("status 404", r.status === 404);
    assert("contains not found message", r.body.includes("not found"));
  }

  // summary
  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);

  server.kill("SIGTERM");
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error("Test runner error:", err);
  if (server) server.kill("SIGTERM");
  process.exit(1);
});
