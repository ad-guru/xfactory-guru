const http = require("http");

const PORT = parseInt(process.env.PORT, 10) || 3000;

function jsonResponse(res, statusCode, body) {
  const payload = JSON.stringify(body);
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const path = url.pathname;

  if (path === "/") {
    if (req.method === "GET" || req.method === "HEAD") {
      return jsonResponse(res, 200, { status: "ok", message: "log-stream-demo is running" });
    }
    return jsonResponse(res, 405, { error: "Method Not Allowed" });
  }

  if (path === "/time") {
    if (req.method === "GET" || req.method === "HEAD") {
      return jsonResponse(res, 200, { time: new Date().toISOString() });
    }
    return jsonResponse(res, 405, { error: "Method Not Allowed" });
  }

  jsonResponse(res, 404, { error: "Not Found" });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on 0.0.0.0:${PORT}`);
});

module.exports = server;
