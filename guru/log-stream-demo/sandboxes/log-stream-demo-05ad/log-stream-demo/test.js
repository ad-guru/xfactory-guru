const http = require("http");

const PORT = 0; // let OS pick a free port
let baseUrl;
let server;

function request(method, path) {
  return new Promise((resolve, reject) => {
    const req = http.request(`${baseUrl}${path}`, { method }, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body });
        }
      });
    });
    req.on("error", reject);
    req.end();
  });
}

async function run() {
  let passed = 0;
  let failed = 0;

  function assert(condition, name) {
    if (condition) {
      console.log(`  PASS: ${name}`);
      passed++;
    } else {
      console.error(`  FAIL: ${name}`);
      failed++;
    }
  }

  // Start server on random port
  process.env.PORT = String(PORT);
  delete require.cache[require.resolve("./server")];
  server = require("./server");

  await new Promise((resolve) => {
    if (server.listening) {
      resolve();
    } else {
      server.on("listening", resolve);
    }
  });

  const addr = server.address();
  baseUrl = `http://127.0.0.1:${addr.port}`;
  console.log(`Test server on port ${addr.port}\n`);

  // f2: GET / returns 200 with status ok
  console.log("Feature f2: Health / root route");
  {
    const res = await request("GET", "/");
    assert(res.status === 200, "GET / returns 200");
    assert(res.headers["content-type"].includes("application/json"), "GET / content-type is JSON");
    assert(res.body && res.body.status === "ok", "GET / body has status ok");
  }

  // f1: GET /time returns 200 with ISO timestamp
  console.log("\nFeature f1: GET /time endpoint");
  {
    const res = await request("GET", "/time");
    assert(res.status === 200, "GET /time returns 200");
    assert(res.headers["content-type"].includes("application/json"), "GET /time content-type is JSON");
    assert(typeof res.body.time === "string", "GET /time body has time field");
    const d = new Date(res.body.time);
    assert(!isNaN(d.getTime()), "time field is valid ISO-8601");
    assert(res.body.time.endsWith("Z"), "time field is UTC (ends with Z)");
  }

  // f3: Error handling — 404 for unknown routes
  console.log("\nFeature f3: Error handling");
  {
    const res = await request("GET", "/nope");
    assert(res.status === 404, "GET /nope returns 404");
    assert(res.headers["content-type"].includes("application/json"), "404 response is JSON");
    assert(res.body && res.body.error === "Not Found", "404 body has error message");
  }

  // f3: 405 for unsupported methods on /time
  {
    const res = await request("POST", "/time");
    assert(res.status === 405, "POST /time returns 405");
    assert(res.headers["content-type"].includes("application/json"), "405 response is JSON");
    assert(res.body && res.body.error === "Method Not Allowed", "405 body has error message");
  }

  // f3: 405 for unsupported methods on /
  {
    const res = await request("DELETE", "/");
    assert(res.status === 405, "DELETE / returns 405");
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  server.close();

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error(err);
  if (server) server.close();
  process.exit(1);
});
