import express from "express";
import cors from "cors";
import { pool } from "./db.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

function mapProduct(row) {
  return {
    id: String(row.id),
    title: row.title,
    category: row.category,
    price: Number(row.price),
    oldPrice: Number(row.old_price),
    rating: Number(row.rating),
    stock: Number(row.stock),
    sellerId: row.seller_id ? String(row.seller_id) : null,
    sellerName: row.seller_name,
    image: row.image,
    badge: row.badge,
    description: row.description
  };
}

function mapUser(row) {
  return {
    id: String(row.id),
    name: row.name,
    email: row.email,
    password: row.password,
    role: row.role
  };
}

app.get("/api/health", async (req, res) => {
  res.json({ ok: true, message: "LuxeMart API is running" });
});

app.get("/api/products", async (req, res) => {
  const result = await pool.query("SELECT * FROM products ORDER BY id DESC");
  res.json(result.rows.map(mapProduct));
});

app.post("/api/products", async (req, res) => {
  const product = req.body;

  const result = await pool.query(
    `INSERT INTO products
      (title, category, price, old_price, rating, stock, seller_id, seller_name, image, badge, description)
     VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     RETURNING *`,
    [
      product.title,
      product.category,
      product.price,
      product.oldPrice || product.price,
      product.rating || 4.5,
      product.stock,
      product.sellerId || null,
      product.sellerName || null,
      product.image,
      product.badge,
      product.description
    ]
  );

  res.status(201).json(mapProduct(result.rows[0]));
});

app.put("/api/products/:id", async (req, res) => {
  const product = req.body;

  const result = await pool.query(
    `UPDATE products
     SET title=$1, category=$2, price=$3, old_price=$4, rating=$5, stock=$6,
         seller_id=$7, seller_name=$8, image=$9, badge=$10, description=$11
     WHERE id=$12
     RETURNING *`,
    [
      product.title,
      product.category,
      product.price,
      product.oldPrice || product.price,
      product.rating || 4.5,
      product.stock,
      product.sellerId || null,
      product.sellerName || null,
      product.image,
      product.badge,
      product.description,
      req.params.id
    ]
  );

  res.json(mapProduct(result.rows[0]));
});

app.delete("/api/products/:id", async (req, res) => {
  await pool.query("DELETE FROM products WHERE id=$1", [req.params.id]);
  res.json({ ok: true });
});

app.get("/api/users", async (req, res) => {
  const result = await pool.query("SELECT * FROM users ORDER BY id ASC");
  res.json(result.rows.map(mapUser));
});

app.post("/api/signup", async (req, res) => {
  const { name, email, password, role } = req.body;

  const existing = await pool.query("SELECT * FROM users WHERE LOWER(email)=LOWER($1)", [email]);

  if (existing.rows.length > 0) {
    return res.status(409).json({ message: "An account with this email already exists." });
  }

  const result = await pool.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, email, password, role]
  );

  res.status(201).json(mapUser(result.rows[0]));
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const result = await pool.query(
    "SELECT * FROM users WHERE LOWER(email)=LOWER($1) AND password=$2",
    [email, password]
  );

  if (result.rows.length === 0) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  res.json(mapUser(result.rows[0]));
});

app.get("/api/orders", async (req, res) => {
  const ordersResult = await pool.query("SELECT * FROM orders ORDER BY id DESC");
  const itemsResult = await pool.query("SELECT * FROM order_items");

  const orders = ordersResult.rows.map((order) => ({
    id: String(order.id),
    userId: order.user_id ? String(order.user_id) : null,
    customerName: order.customer_name,
    phone: order.phone,
    address: order.address,
    city: order.city,
    payment: order.payment,
    transactionCode: order.transaction_code,
    status: order.status,
    createdAt: order.created_at,
    subtotal: Number(order.subtotal),
    delivery: Number(order.delivery),
    total: Number(order.total),
    items: itemsResult.rows
      .filter((item) => item.order_id === order.id)
      .map((item) => ({
        productId: item.product_id ? String(item.product_id) : null,
        title: item.title,
        price: Number(item.price),
        quantity: Number(item.quantity),
        sellerId: item.seller_id ? String(item.seller_id) : null
      }))
  }));

  res.json(orders);
});

app.post("/api/orders", async (req, res) => {
  const order = req.body;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const orderResult = await client.query(
      `INSERT INTO orders
        (user_id, customer_name, phone, address, city, payment, transaction_code, status, subtotal, delivery, total)
       VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        order.userId,
        order.customerName,
        order.phone,
        order.address,
        order.city,
        order.payment || "Checkout",
        order.transactionCode,
        order.status || "Placed",
        order.subtotal,
        order.delivery,
        order.total
      ]
    );

    const createdOrder = orderResult.rows[0];

    for (const item of order.items) {
      await client.query(
        `INSERT INTO order_items
          (order_id, product_id, title, price, quantity, seller_id)
         VALUES
          ($1,$2,$3,$4,$5,$6)`,
        [
          createdOrder.id,
          item.productId,
          item.title,
          item.price,
          item.quantity,
          item.sellerId || null
        ]
      );

      await client.query(
        "UPDATE products SET stock = stock - $1 WHERE id=$2",
        [item.quantity, item.productId]
      );
    }

    await client.query("COMMIT");
    res.status(201).json({ ok: true, id: String(createdOrder.id) });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

app.listen(PORT, () => {
  console.log(`LuxeMart API running on http://localhost:${PORT}`);
});