const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// Hard-coded mock orders
const orders = [
  { id: "ORD-001", item: "Wireless Keyboard",   qty: 2, total: 3500  },
  { id: "ORD-002", item: "USB-C Hub",           qty: 1, total: 2750  },
  { id: "ORD-003", item: "Noise-Cancelling Headphones", qty: 1, total: 8999 },
  { id: "ORD-004", item: "Laptop Stand",        qty: 3, total: 4500  },
  { id: "ORD-005", item: "Mechanical Mouse",    qty: 5, total: 6250  },
];

const CURRENCY = "\u20b9";

// GET /health — plain 200
app.get("/health", (_req, res) => {
  res.status(200).send("ok");
});

// GET /orders — server-rendered HTML table
app.get("/orders", (_req, res) => {
  const grandQty = orders.reduce((sum, o) => sum + o.qty, 0);
  const grandTotal = orders.reduce((sum, o) => sum + o.total, 0);

  const rows = orders
    .map(
      (o) => `
      <tr>
        <td>${o.id}</td>
        <td>${o.item}</td>
        <td>${o.qty}</td>
        <td>${CURRENCY}${o.total.toLocaleString("en-IN")}</td>
      </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Orders Dashboard</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #f5f6f8;
      color: #1a1a2e;
      padding: 2rem;
    }
    h1 { margin-bottom: 1.5rem; font-size: 1.6rem; }
    table {
      width: 100%;
      max-width: 720px;
      border-collapse: collapse;
      background: #fff;
      border-radius: 6px;
      overflow: hidden;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    }
    th, td { padding: 0.75rem 1rem; text-align: left; }
    th { background: #1a1a2e; color: #fff; font-weight: 600; }
    tr:nth-child(even) { background: #f0f1f4; }
    td:last-child { font-variant-numeric: tabular-nums; }
    tfoot td { border-top: 2px solid #1a1a2e; background: #e8e9ed; }
  </style>
</head>
<body>
  <h1>Orders Dashboard</h1>
  <table>
    <thead>
      <tr>
        <th>Order ID</th>
        <th>Item</th>
        <th>Qty</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
    <tfoot>
      <tr>
        <td colspan="2"><strong>Grand Total</strong></td>
        <td><strong>${grandQty}</strong></td>
        <td><strong>${CURRENCY}${grandTotal.toLocaleString("en-IN")}</strong></td>
      </tr>
    </tfoot>
  </table>
</body>
</html>`;

  res.type("html").send(html);
});

// Redirect root to /orders for convenience
app.get("/", (_req, res) => {
  res.redirect("orders");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on 0.0.0.0:${PORT}`);
});
