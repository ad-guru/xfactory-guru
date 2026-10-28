const http = require("http");
const quotes = require("./quotes");

const PORT = parseInt(process.env.PORT || "3000", 10);

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  if (req.method !== "GET") {
    return sendJSON(res, 405, { error: "Method not allowed" });
  }

  if (path === "/") {
    return sendJSON(res, 200, {
      status: "ok",
      service: "segment-demo",
      message: "Service is running"
    });
  }

  if (path === "/quotes/random") {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return sendJSON(res, 200, quotes[randomIndex]);
  }

  if (path === "/quotes") {
    return sendJSON(res, 200, quotes);
  }

  return sendJSON(res, 404, { error: "Not found" });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`segment-demo listening on 0.0.0.0:${PORT}`);
});

module.exports = server;
