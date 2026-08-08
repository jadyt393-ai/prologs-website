const express = require("express");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Database = require("better-sqlite3");

const app = express();
const db = new Database(path.join(__dirname, "data", "mezen.db"));
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "development-only-change-me";

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

db.exec(`
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT DEFAULT '',
  price TEXT DEFAULT 'Contact us',
  available INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  whatsapp TEXT DEFAULT '',
  items TEXT NOT NULL,
  status TEXT DEFAULT 'Pending',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

const adminEmail = process.env.ADMIN_EMAIL || "orinami93@gmail.com";
const adminPassword = process.env.ADMIN_PASSWORD || "ChangeThisBeforeDeployment123!";
const existing = db.prepare("SELECT id FROM admins WHERE email=?").get(adminEmail);
if (!existing) {
  db.prepare("INSERT INTO admins (email,password_hash) VALUES (?,?)")
    .run(adminEmail, bcrypt.hashSync(adminPassword, 12));
}

if (db.prepare("SELECT COUNT(*) AS c FROM products").get().c === 0) {
  const add = db.prepare("INSERT INTO products (name,category,description,price) VALUES (?,?,?,?)");
  const seed = db.transaction(() => {
    add.run("Social Media Management", "Social Services", "Authorized social-media management and support.", "Contact us");
    add.run("Social Media Advertising", "Marketing", "Campaign setup and advertising support.", "Contact us");
    add.run("Digital Account Setup", "Consulting", "Assistance setting up accounts using the customer's own information.", "Contact us");
    add.run("VPN Subscription Support", "VPN Services", "Authorized VPN subscription and setup assistance.", "Contact us");
  });
  seed();
}

function auth(req, res, next) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
}

app.post("/api/admin/login", (req, res) => {
  const { email, password } = req.body || {};
  const admin = db.prepare("SELECT * FROM admins WHERE email=?").get(email);
  if (!admin || !bcrypt.compareSync(password || "", admin.password_hash))
    return res.status(401).json({ error: "Invalid email or password" });
  const token = jwt.sign({ id: admin.id, email: admin.email }, JWT_SECRET, { expiresIn: "8h" });
  res.json({ token, email: admin.email });
});

app.get("/api/products", (req, res) => {
  res.json(db.prepare("SELECT * FROM products ORDER BY id DESC").all());
});

app.post("/api/orders", (req, res) => {
  const { customer_name, customer_email, whatsapp, items } = req.body || {};
  if (!customer_name || !customer_email || !items)
    return res.status(400).json({ error: "Name, email and items are required" });
  const result = db.prepare(
    "INSERT INTO orders (customer_name,customer_email,whatsapp,items) VALUES (?,?,?,?)"
  ).run(customer_name, customer_email, whatsapp || "", JSON.stringify(items));
  res.json({ id: result.lastInsertRowid, message: "Order received" });
});

app.get("/api/admin/products", auth, (req, res) => {
  res.json(db.prepare("SELECT * FROM products ORDER BY id DESC").all());
});

app.post("/api/admin/products", auth, (req, res) => {
  const { name, category, description, price, available } = req.body || {};
  if (!name || !category) return res.status(400).json({ error: "Name and category are required" });
  const result = db.prepare(
    "INSERT INTO products (name,category,description,price,available) VALUES (?,?,?,?,?)"
  ).run(name, category, description || "", price || "Contact us", available === false ? 0 : 1);
  res.json({ id: result.lastInsertRowid });
});

app.put("/api/admin/products/:id", auth, (req, res) => {
  const { name, category, description, price, available } = req.body || {};
  db.prepare(
    "UPDATE products SET name=?,category=?,description=?,price=?,available=? WHERE id=?"
  ).run(name, category, description || "", price || "Contact us", available ? 1 : 0, req.params.id);
  res.json({ ok: true });
});

app.delete("/api/admin/products/:id", auth, (req, res) => {
  db.prepare("DELETE FROM products WHERE id=?").run(req.params.id);
  res.json({ ok: true });
});

app.get("/api/admin/orders", auth, (req, res) => {
  res.json(db.prepare("SELECT * FROM orders ORDER BY id DESC").all());
});

app.patch("/api/admin/orders/:id", auth, (req, res) => {
  const allowed = ["Pending", "Processing", "Completed", "Cancelled"];
  if (!allowed.includes(req.body.status)) return res.status(400).json({ error: "Invalid status" });
  db.prepare("UPDATE orders SET status=? WHERE id=?").run(req.body.status, req.params.id);
  res.json({ ok: true });
});

app.get("/api/admin/stats", auth, (req, res) => {
  res.json({
    products: db.prepare("SELECT COUNT(*) c FROM products").get().c,
    available: db.prepare("SELECT COUNT(*) c FROM products WHERE available=1").get().c,
    orders: db.prepare("SELECT COUNT(*) c FROM orders").get().c
  });
});

app.get("*", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

app.listen(PORT, () => console.log(`PROLOGS running on http://localhost:${PORT}`));