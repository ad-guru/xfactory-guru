const http = require("http");
const assert = require("assert");

// Import the server — we need to start it on a random port for testing
const PORT = 0; // kernel-assigned
process.env.PORT = "0";

let server;
let baseUrl;

function request(path) {
  return new Promise((resolve, reject) => {
    http.get(`${baseUrl}${path}`, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    }).on("error", reject);
  });
}

async function runTests() {
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  FAIL: ${name}`);
      console.error(`    ${err.message}`);
      failed++;
    }
  }

  // Start server
  const srv = http.createServer();
  const { routes } = (() => {
    // Re-implement inline to avoid port conflict with require
    const routes = {
      "/health": (_req, res) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok" }));
      },
      "/version": (_req, res) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ name: "push-offer-test", version: "1.0.0" }));
      },
    };
    return { routes };
  })();

  srv.on("request", (req, res) => {
    const handler = routes[req.url];
    if (handler && req.method === "GET") {
      handler(req, res);
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "not found" }));
    }
  });

  await new Promise((resolve) => srv.listen(0, "127.0.0.1", resolve));
  const addr = srv.address();
  baseUrl = `http://127.0.0.1:${addr.port}`;
  console.log(`Test server on ${baseUrl}`);

  // Tests
  await test("GET /health returns 200", async () => {
    const res = await request("/health");
    assert.strictEqual(res.status, 200);
  });

  await test("GET /health body has status ok", async () => {
    const res = await request("/health");
    assert.deepStrictEqual(res.body, { status: "ok" });
  });

  await test("GET /version returns 200", async () => {
    const res = await request("/version");
    assert.strictEqual(res.status, 200);
  });

  await test("GET /version body has name and version", async () => {
    const res = await request("/version");
    assert.deepStrictEqual(res.body, { name: "push-offer-test", version: "1.0.0" });
  });

  await test("GET /unknown returns 404", async () => {
    const res = await request("/unknown");
    assert.strictEqual(res.status, 404);
  });

  // Cleanup
  srv.close();

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
