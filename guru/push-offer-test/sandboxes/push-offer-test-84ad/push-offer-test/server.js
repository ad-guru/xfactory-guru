const http = require("http");

const PORT = parseInt(process.env.PORT, 10) || 3000;

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

const server = http.createServer((req, res) => {
  const handler = routes[req.url];
  if (handler && req.method === "GET") {
    handler(req, res);
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "not found" }));
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`push-offer-test listening on 0.0.0.0:${PORT}`);
});
