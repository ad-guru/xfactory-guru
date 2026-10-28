// Test script for incident board
// Starts the server, runs HTTP tests against it, then shuts down.

const http = require("http");

const PORT = 49123; // Use a non-conflicting port for tests
process.env.PORT = String(PORT);

let server;
let passed = 0;
let failed = 0;

function get(path) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://127.0.0.1:${PORT}${path}`, (res) => {
      let body = "";
      res.on("data", (chunk) => { body += chunk; });
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on("error", reject);
    req.setTimeout(5000, () => { req.destroy(); reject(new Error("timeout")); });
  });
}

function assert(label, condition) {
  if (condition) {
    console.log(`  PASS: ${label}`);
    passed++;
  } else {
    console.error(`  FAIL: ${label}`);
    failed++;
  }
}

async function runTests() {
  console.log("Testing /health ...");
  const health = await get("/health");
  assert("/health returns 200", health.status === 200);
  assert("/health body is 'ok'", health.body.trim() === "ok");
  assert("/health content-type is text", health.headers["content-type"].includes("text/plain"));

  console.log("\nTesting /api/summary ...");
  const summary = await get("/api/summary");
  assert("/api/summary returns 200", summary.status === 200);
  assert("/api/summary content-type is json", summary.headers["content-type"].includes("application/json"));
  const data = JSON.parse(summary.body);
  assert("/api/summary has by_severity", data.by_severity && typeof data.by_severity === "object");
  assert("/api/summary has by_status", data.by_status && typeof data.by_status === "object");
  assert("/api/summary has total", typeof data.total === "number" && data.total > 0);
  assert("/api/summary sev0 count >= 1", data.by_severity.sev0 >= 1);
  assert("/api/summary sev1 count >= 1", data.by_severity.sev1 >= 1);
  assert("/api/summary all severities sum to total",
    data.by_severity.sev0 + data.by_severity.sev1 + data.by_severity.sev2 + data.by_severity.sev3 === data.total);
  assert("/api/summary all statuses sum to total",
    data.by_status.open + data.by_status.mitigating + data.by_status.resolved === data.total);

  console.log("\nTesting GET / ...");
  const board = await get("/");
  assert("GET / returns 200", board.status === 200);
  assert("GET / is HTML", board.headers["content-type"].includes("text/html"));
  assert("GET / contains incident table", board.body.includes("<table"));
  assert("GET / shows SEV0 count badge", board.body.includes("SEV0:"));
  assert("GET / shows SEV1 count badge", board.body.includes("SEV1:"));
  assert("GET / contains an incident ID", board.body.includes("INC-001"));
  assert("GET / shows US/Pacific timezone note", board.body.includes("US/Pacific"));

  console.log("\nTesting GET /?status=open ...");
  const filtered = await get("/?status=open");
  assert("GET /?status=open returns 200", filtered.status === 200);
  assert("Filtered page does NOT contain resolved incidents",
    !filtered.body.includes('>RESOLVED</span>'));
  assert("Filtered page contains open incidents", filtered.body.includes(">OPEN</span>"));

  console.log("\nTesting GET /?status=resolved ...");
  const resolved = await get("/?status=resolved");
  assert("GET /?status=resolved returns 200", resolved.status === 200);
  assert("Resolved filter does NOT contain open-status badges",
    !resolved.body.includes('>OPEN</span>'));

  console.log("\nTesting GET /incidents/INC-001 ...");
  const detail = await get("/incidents/INC-001");
  assert("GET /incidents/INC-001 returns 200", detail.status === 200);
  assert("Detail page shows incident title", detail.body.includes("Payment gateway timeout"));
  assert("Detail page has timeline", detail.body.includes("Timeline"));
  assert("Detail page shows service", detail.body.includes("payments-api"));

  console.log("\nTesting GET /incidents/NONEXISTENT ...");
  const notFound = await get("/incidents/NONEXISTENT");
  assert("GET /incidents/NONEXISTENT returns 404", notFound.status === 404);

  console.log("\n---");
  console.log(`Results: ${passed} passed, ${failed} failed`);
}

// Require server module which starts listening
const app = require("./server");

// Give server a moment to start
setTimeout(async () => {
  try {
    await runTests();
  } catch (err) {
    console.error("Test error:", err);
    failed++;
  } finally {
    process.exit(failed > 0 ? 1 : 0);
  }
}, 500);
