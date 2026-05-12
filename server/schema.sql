CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('customer', 'seller', 'admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  old_price NUMERIC(10, 2),
  rating NUMERIC(2, 1) DEFAULT 4.5,
  stock INTEGER NOT NULL DEFAULT 0,
  seller_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  seller_name TEXT,
  image TEXT,
  badge TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  payment TEXT DEFAULT 'Checkout',
  transaction_code TEXT,
  status TEXT DEFAULT 'Placed',
  subtotal NUMERIC(10, 2),
  delivery NUMERIC(10, 2),
  total NUMERIC(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  seller_id INTEGER REFERENCES users(id) ON DELETE SET NULL
);

INSERT INTO users (name, email, password, role)
VALUES
  ('Admin User', 'admin@luxemart.com', 'admin123', 'admin'),
  ('Demo Seller', 'seller@luxemart.com', 'seller123', 'seller'),
  ('Demo Customer', 'customer@luxemart.com', 'customer123', 'customer')
ON CONFLICT (email) DO NOTHING;

INSERT INTO products (
  title, category, price, old_price, rating, stock, seller_id, seller_name, image, badge, description
)
VALUES
  (
    'Aurora Noise Cancelling Headphones',
    'Electronics',
    18999,
    23999,
    4.8,
    18,
    2,
    'Demo Seller',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
    'Best Seller',
    'Soft-touch wireless headphones with rich bass, active noise cancellation, and a clean luxury finish.'
  ),
  (
    'Pastel Ceramic Dinner Set',
    'Home',
    8999,
    10999,
    4.6,
    12,
    2,
    'Demo Seller',
    'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=80',
    'New Arrival',
    'Minimal ceramic dinnerware with a soft pastel glaze, perfect for everyday dining and hosting.'
  ),
  (
    'Linen Oversized Shirt',
    'Fashion',
    5499,
    6999,
    4.7,
    30,
    2,
    'Demo Seller',
    'https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=900&q=80',
    'Limited',
    'A breathable oversized linen shirt with a soft premium look. Designed for effortless everyday styling.'
  )
ON CONFLICT DO NOTHING;
