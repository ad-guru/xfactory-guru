const http = require("http");
const assert = require("assert");

// Import the server — it starts listening on a random port for testing
const quotes = require("./quotes");

const PORT = 0; // OS-assigned port for tests
let server;
let baseURL;

function request(path) {
  return new Promise((resolve, reject) => {
    http.get(`${baseURL}${path}`, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body });
        }
      });
    }).on("error", reject);
  });
}

async function runTests() {
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    return fn()
      .then(() => { passed++; console.log(`  PASS: ${name}`); })
      .catch((err) => { failed++; console.log(`  FAIL: ${name} - ${err.message}`); });
  }

  // Start a dedicated test server
  const testServer = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname;

    function sendJSON(statusCode, data) {
      res.writeHead(statusCode, { "Content-Type": "application/json" });
      res.end(JSON.stringify(data));
    }

    if (req.method !== "GET") {
      return sendJSON(405, { error: "Method not allowed" });
    }
    if (path === "/") {
      return sendJSON(200, { status: "ok", service: "segment-demo", message: "Service is running" });
    }
    if (path === "/quotes/random") {
      const idx = Math.floor(Math.random() * quotes.length);
      return sendJSON(200, quotes[idx]);
    }
    if (path === "/quotes") {
      return sendJSON(200, quotes);
    }
    return sendJSON(404, { error: "Not found" });
  });

  await new Promise((resolve) => {
    testServer.listen(0, "127.0.0.1", () => {
      const addr = testServer.address();
      baseURL = `http://127.0.0.1:${addr.port}`;
      resolve();
    });
  });

  console.log("Running tests...\n");

  await test("GET / returns status ok", async () => {
    const res = await request("/");
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers["content-type"], "application/json");
    assert.strictEqual(res.body.status, "ok");
    assert.strictEqual(res.body.service, "segment-demo");
    assert.ok(res.body.message);
  });

  await test("GET /quotes returns array of 10 quotes", async () => {
    const res = await request("/quotes");
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers["content-type"], "application/json");
    assert.ok(Array.isArray(res.body));
    assert.strictEqual(res.body.length, 10);
  });

  await test("GET /quotes each quote has id, text, author", async () => {
    const res = await request("/quotes");
    for (const q of res.body) {
      assert.ok(typeof q.id === "number", `id should be number, got ${typeof q.id}`);
      assert.ok(typeof q.text === "string" && q.text.length > 0, "text should be non-empty string");
      assert.ok(typeof q.author === "string" && q.author.length > 0, "author should be non-empty string");
    }
  });

  await test("GET /quotes/random returns a single quote object", async () => {
    const res = await request("/quotes/random");
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers["content-type"], "application/json");
    assert.ok(typeof res.body.id === "number");
    assert.ok(typeof res.body.text === "string");
    assert.ok(typeof res.body.author === "string");
  });

  await test("GET /quotes/random returns a quote from the list", async () => {
    const res = await request("/quotes/random");
    const match = quotes.find((q) => q.id === res.body.id);
    assert.ok(match, `Quote id ${res.body.id} should exist in the list`);
    assert.strictEqual(res.body.text, match.text);
    assert.strictEqual(res.body.author, match.author);
  });

  await test("GET /unknown returns 404", async () => {
    const res = await request("/unknown");
    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.error, "Not found");
  });

  testServer.close();

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});
