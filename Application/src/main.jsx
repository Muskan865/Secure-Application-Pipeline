import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  LogOut,
  ShieldCheck,
  Store,
  Package,
  Star,
  Plus,
  Trash2,
  Pencil,
  Sparkles,
  Truck,
  CreditCard,
  CheckCircle2,
  Menu,
  X
} from "lucide-react";
import "./styles.css";

const STORAGE_KEYS = {
  users: "luxemart_users",
  products: "luxemart_products",
  session: "luxemart_session",
  cart: "luxemart_cart",
  orders: "luxemart_orders"
};

const demoUsers = [
  {
    id: "u-admin",
    name: "Admin User",
    email: "admin@luxemart.com",
    password: "admin123",
    role: "admin"
  },
  {
    id: "u-seller",
    name: "Demo Seller",
    email: "seller@luxemart.com",
    password: "seller123",
    role: "seller"
  },
  {
    id: "u-customer",
    name: "Demo Customer",
    email: "customer@luxemart.com",
    password: "customer123",
    role: "customer"
  }
];

const seedProducts = [
  {
    id: "p-1",
    title: "Aurora Noise Cancelling Headphones",
    category: "Electronics",
    price: 18999,
    oldPrice: 23999,
    rating: 4.8,
    stock: 18,
    sellerId: "u-seller",
    sellerName: "Demo Seller",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
    badge: "Best Seller",
    description:
      "Soft-touch wireless headphones with rich bass, active noise cancellation, and a clean luxury finish."
  },
  {
    id: "p-2",
    title: "Pastel Ceramic Dinner Set",
    category: "Home",
    price: 8999,
    oldPrice: 10999,
    rating: 4.6,
    stock: 12,
    sellerId: "u-seller",
    sellerName: "Demo Seller",
    image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=80",
    badge: "New Arrival",
    description:
      "Minimal ceramic dinnerware with a soft pastel glaze, perfect for everyday dining and hosting."
  },
  {
    id: "p-3",
    title: "Linen Oversized Shirt",
    category: "Fashion",
    price: 5499,
    oldPrice: 6999,
    rating: 4.7,
    stock: 30,
    sellerId: "u-seller",
    sellerName: "Demo Seller",
    image: "https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=900&q=80",
    badge: "Limited",
    description:
      "A breathable oversized linen shirt with a soft premium look. Designed for effortless everyday styling."
  },
  {
    id: "p-4",
    title: "Rose Glow Skincare Box",
    category: "Beauty",
    price: 7499,
    oldPrice: 9999,
    rating: 4.9,
    stock: 20,
    sellerId: "u-seller",
    sellerName: "Demo Seller",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80",
    badge: "Luxury Pick",
    description:
      "A soft pastel skincare kit with cleanser, serum, cream, and mist for a glowy self-care routine."
  },
  {
    id: "p-5",
    title: "Modern Desk Lamp",
    category: "Home",
    price: 6299,
    oldPrice: 7999,
    rating: 4.5,
    stock: 16,
    sellerId: "u-seller",
    sellerName: "Demo Seller",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80",
    badge: "Editor Choice",
    description:
      "A warm LED desk lamp with a clean metal body, adjustable angle, and gentle light for study or work."
  },
  {
    id: "p-6",
    title: "Leather Everyday Tote",
    category: "Fashion",
    price: 12999,
    oldPrice: 15999,
    rating: 4.8,
    stock: 11,
    sellerId: "u-seller",
    sellerName: "Demo Seller",
    image: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=900&q=80",
    badge: "Premium",
    description:
      "A structured everyday tote with a smooth luxury finish and spacious compartments."
  },
  {
    id: "p-7",
    title: "Minimal Productivity Planner",
    category: "Books",
    price: 1999,
    oldPrice: 2499,
    rating: 4.4,
    stock: 45,
    sellerId: "u-seller",
    sellerName: "Demo Seller",
    image: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=900&q=80",
    badge: "Popular",
    description:
      "A clean daily planner for goals, notes, schedules, habits, and weekly reflection."
  },
  {
    id: "p-8",
    title: "Smart Watch Pearl Edition",
    category: "Electronics",
    price: 21999,
    oldPrice: 27999,
    rating: 4.7,
    stock: 9,
    sellerId: "u-seller",
    sellerName: "Demo Seller",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
    badge: "Hot Deal",
    description:
      "A sleek smartwatch with fitness tracking, notifications, sleep insights, and a soft pearl strap."
  }
];

function money(value) {
  return `Rs. ${Number(value).toLocaleString("en-PK")}`;
}

function readStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function initializeStore() {
  if (!localStorage.getItem(STORAGE_KEYS.users)) {
    writeStorage(STORAGE_KEYS.users, demoUsers);
  }
  if (!localStorage.getItem(STORAGE_KEYS.products)) {
    writeStorage(STORAGE_KEYS.products, seedProducts);
  }
  if (!localStorage.getItem(STORAGE_KEYS.cart)) {
    writeStorage(STORAGE_KEYS.cart, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.orders)) {
    writeStorage(STORAGE_KEYS.orders, []);
  }
}

function App() {
  const [page, setPage] = useState("home");
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [session, setSession] = useState(null);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    initializeStore();
    setUsers(readStorage(STORAGE_KEYS.users, []));
    setProducts(readStorage(STORAGE_KEYS.products, []));
    setSession(readStorage(STORAGE_KEYS.session, null));
    setCart(readStorage(STORAGE_KEYS.cart, []));
    setOrders(readStorage(STORAGE_KEYS.orders, []));
  }, []);

  const currentUser = useMemo(
    () => users.find((u) => u.id === session?.userId) || null,
    [users, session]
  );

  const categories = useMemo(
    () => ["All", ...new Set(products.map((product) => product.category))],
    [products]
  );

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = category === "All" || product.category === category;
      const matchesSearch =
        product.title.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, category, query]);

  const cartItems = useMemo(() => {
    return cart
      .map((item) => {
        const product = products.find((p) => p.id === item.productId);
        return product ? { ...product, quantity: item.quantity } : null;
      })
      .filter(Boolean);
  }, [cart, products]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = subtotal > 15000 || subtotal === 0 ? 0 : 350;
  const total = subtotal + delivery;

  function persistProducts(nextProducts) {
    setProducts(nextProducts);
    writeStorage(STORAGE_KEYS.products, nextProducts);
  }

  function persistCart(nextCart) {
    setCart(nextCart);
    writeStorage(STORAGE_KEYS.cart, nextCart);
  }

  function persistUsers(nextUsers) {
    setUsers(nextUsers);
    writeStorage(STORAGE_KEYS.users, nextUsers);
  }

  function persistOrders(nextOrders) {
    setOrders(nextOrders);
    writeStorage(STORAGE_KEYS.orders, nextOrders);
  }

  function go(nextPage) {
    setPage(nextPage);
    setMobileNav(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function addToCart(productId) {
    const product = products.find((p) => p.id === productId);
    if (!product || product.stock <= 0) return;

    const existing = cart.find((item) => item.productId === productId);
    let nextCart;

    if (existing) {
      nextCart = cart.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
          : item
      );
    } else {
      nextCart = [...cart, { productId, quantity: 1 }];
    }

    persistCart(nextCart);
  }

  function updateQuantity(productId, quantity) {
    if (quantity <= 0) {
      persistCart(cart.filter((item) => item.productId !== productId));
      return;
    }
    const product = products.find((p) => p.id === productId);
    persistCart(
      cart.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.min(quantity, product?.stock || 1) }
          : item
      )
    );
  }

  function login(email, password) {
    const found = users.find(
      (user) =>
        user.email.toLowerCase() === email.toLowerCase() &&
        user.password === password
    );

    if (!found) {
      return { ok: false, message: "Invalid email or password." };
    }

    const nextSession = { userId: found.id };
    setSession(nextSession);
    writeStorage(STORAGE_KEYS.session, nextSession);
    go(found.role === "customer" ? "home" : "dashboard");
    return { ok: true };
  }

  function signup({ name, email, password, role }) {
    const exists = users.some((user) => user.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return { ok: false, message: "An account with this email already exists." };
    }

    const newUser = {
      id: crypto.randomUUID(),
      name,
      email,
      password,
      role
    };

    const nextUsers = [...users, newUser];
    persistUsers(nextUsers);

    const nextSession = { userId: newUser.id };
    setSession(nextSession);
    writeStorage(STORAGE_KEYS.session, nextSession);
    go(role === "customer" ? "home" : "dashboard");
    return { ok: true };
  }

  function logout() {
    setSession(null);
    localStorage.removeItem(STORAGE_KEYS.session);
    go("home");
  }

  function createOrder(formData) {
    if (!currentUser) {
      go("auth");
      return;
    }
    if (cartItems.length === 0) return;

    const order = {
      id: `ORD-${Date.now()}`,
      userId: currentUser.id,
      customerName: formData.name,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      payment: "Checkout",
      status: "Placed",
      createdAt: new Date().toLocaleString(),
      items: cartItems.map((item) => ({
        productId: item.id,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        sellerId: item.sellerId
      })),
      subtotal,
      delivery,
      total
    };

    const nextProducts = products.map((product) => {
      const ordered = cartItems.find((item) => item.id === product.id);
      return ordered ? { ...product, stock: product.stock - ordered.quantity } : product;
    });

    persistProducts(nextProducts);
    persistOrders([order, ...orders]);
    persistCart([]);
    go("success");
  }

  function saveProduct(product) {
    const finalProduct = {
      ...product,
      price: Number(product.price),
      oldPrice: Number(product.oldPrice || product.price),
      stock: Number(product.stock),
      rating: Number(product.rating || 4.5),
      sellerId:
        currentUser?.role === "seller"
          ? currentUser.id
          : product.sellerId || currentUser?.id || "u-admin",
      sellerName:
        currentUser?.role === "seller"
          ? currentUser.name
          : product.sellerName || currentUser?.name || "Admin"
    };

    if (product.id) {
      persistProducts(products.map((p) => (p.id === product.id ? finalProduct : p)));
    } else {
      persistProducts([{ ...finalProduct, id: crypto.randomUUID() }, ...products]);
    }
  }

  function deleteProduct(productId) {
    persistProducts(products.filter((product) => product.id !== productId));
    persistCart(cart.filter((item) => item.productId !== productId));
  }

  function canManage(product) {
    if (!currentUser) return false;
    if (currentUser.role === "admin") return true;
    return currentUser.role === "seller" && product.sellerId === currentUser.id;
  }

  const selectedProduct = products.find((product) => product.id === selectedProductId);

  return (
    <div>
      <Header
        currentUser={currentUser}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        query={query}
        setQuery={setQuery}
        go={go}
        page={page}
        logout={logout}
        mobileNav={mobileNav}
        setMobileNav={setMobileNav}
      />

      {page === "home" && (
        <Home
          products={products}
          filteredProducts={filteredProducts}
          categories={categories}
          category={category}
          setCategory={setCategory}
          addToCart={addToCart}
          setSelectedProductId={setSelectedProductId}
          go={go}
        />
      )}

      {page === "products" && (
        <ProductsPage
          products={filteredProducts}
          categories={categories}
          category={category}
          setCategory={setCategory}
          addToCart={addToCart}
          setSelectedProductId={setSelectedProductId}
          go={go}
        />
      )}

      {page === "detail" && selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          addToCart={addToCart}
          go={go}
        />
      )}

      {page === "cart" && (
        <Cart
          cartItems={cartItems}
          updateQuantity={updateQuantity}
          subtotal={subtotal}
          delivery={delivery}
          total={total}
          go={go}
        />
      )}

      {page === "checkout" && (
        <Checkout
          currentUser={currentUser}
          cartItems={cartItems}
          subtotal={subtotal}
          delivery={delivery}
          total={total}
          createOrder={createOrder}
          go={go}
        />
      )}

      {page === "success" && <Success go={go} />}

      {page === "auth" && (
        <Auth
          login={login}
          signup={signup}
        />
      )}

      {page === "dashboard" && (
        <Dashboard
          currentUser={currentUser}
          products={products}
          orders={orders}
          saveProduct={saveProduct}
          deleteProduct={deleteProduct}
          canManage={canManage}
          go={go}
        />
      )}

      {page === "orders" && (
        <Orders
          currentUser={currentUser}
          orders={orders}
          go={go}
        />
      )}

      <Footer />
    </div>
  );
}

function Header({
  currentUser,
  cartCount,
  query,
  setQuery,
  go,
  page,
  logout,
  mobileNav,
  setMobileNav
}) {
  const navItems = [
    ["home", "Home"],
    ["products", "Products"],
    ["orders", "Orders"]
  ];

  if (currentUser?.role === "seller" || currentUser?.role === "admin") {
    navItems.push(["dashboard", "Dashboard"]);
  }

  return (
    <header className="header">
      <div className="topbar">
        <button className="brand" onClick={() => go("home")}>
          <span className="brandMark">L</span>
          <span>LuxeMart</span>
        </button>

        <div className="searchBox">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products, brands and categories"
          />
        </div>

        <div className="headerActions">
          <button className="iconButton mobileOnly" onClick={() => setMobileNav(!mobileNav)}>
            {mobileNav ? <X size={21} /> : <Menu size={21} />}
          </button>

          {currentUser ? (
            <button className="userPill" onClick={() => go("orders")}>
              <User size={17} />
              <span>{currentUser.name}</span>
              <small>{currentUser.role}</small>
            </button>
          ) : (
            <button className="softButton" onClick={() => go("auth")}>
              Sign in
            </button>
          )}

          <button className="cartButton" onClick={() => go("cart")}>
            <ShoppingCart size={20} />
            <span>{cartCount}</span>
          </button>

          {currentUser && (
            <button className="iconButton" onClick={logout} title="Logout">
              <LogOut size={19} />
            </button>
          )}
        </div>
      </div>

      <nav className={mobileNav ? "nav open" : "nav"}>
        {navItems.map(([key, label]) => (
          <button
            key={key}
            className={page === key ? "active" : ""}
            onClick={() => go(key)}
          >
            {label}
          </button>
        ))}
        <span>Free delivery over Rs. 15,000</span>
      </nav>
    </header>
  );
}

function Home({
  products,
  filteredProducts,
  categories,
  category,
  setCategory,
  addToCart,
  setSelectedProductId,
  go
}) {
  const featured = products.slice(0, 4);

  return (
    <main>
      <section className="hero">
        <div className="heroText">
          <span className="eyebrow">
            <Sparkles size={16} /> Soft luxury marketplace
          </span>
          <h1>Shop everything you love, all from one elegant marketplace.</h1>
          <p>
            Discover curated electronics, fashion, homeware, beauty, and more.
          </p>
          <div className="heroActions">
            <button className="primaryButton" onClick={() => go("products")}>
              Start Shopping
            </button>
            <button className="ghostButton" onClick={() => go("auth")}>
              Create Account
            </button>
          </div>
        </div>

        <div className="heroCard">
          <span>Today&apos;s Luxury Deal</span>
          <img src={featured[0]?.image} alt={featured[0]?.title} />
          <h3>{featured[0]?.title}</h3>
          <p>{money(featured[0]?.price)}</p>
        </div>
      </section>

      <SectionTitle title="Featured Collections" />
      <CategoryTabs categories={categories} category={category} setCategory={setCategory} />
      <ProductGrid
        products={filteredProducts.slice(0, 8)}
        addToCart={addToCart}
        setSelectedProductId={setSelectedProductId}
        go={go}
      />
    </main>
  );
}

function ProductsPage({
  products,
  categories,
  category,
  setCategory,
  addToCart,
  setSelectedProductId,
  go
}) {
  return (
    <main className="page">
      <SectionTitle
        title="All Products"
        subtitle="Browse the full marketplace catalogue."
      />
      <CategoryTabs categories={categories} category={category} setCategory={setCategory} />
      <ProductGrid
        products={products}
        addToCart={addToCart}
        setSelectedProductId={setSelectedProductId}
        go={go}
      />
    </main>
  );
}

function CategoryTabs({ categories, category, setCategory }) {
  return (
    <div className="categoryTabs">
      {categories.map((item) => (
        <button
          key={item}
          className={category === item ? "active" : ""}
          onClick={() => setCategory(item)}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

function ProductGrid({ products, addToCart, setSelectedProductId, go }) {
  if (products.length === 0) {
    return <div className="emptyState">No products found.</div>;
  }

  return (
    <section className="productGrid">
      {products.map((product) => (
        <article className="productCard" key={product.id}>
          <button
            className="imageButton"
            onClick={() => {
              setSelectedProductId(product.id);
              go("detail");
            }}
          >
            <img src={product.image} alt={product.title} />
            <span className="badge">{product.badge}</span>
          </button>
          <div className="productInfo">
            <p className="category">{product.category}</p>
            <h3>{product.title}</h3>
            <div className="rating">
              <Star size={15} fill="currentColor" /> {product.rating}
              <span>{product.stock} in stock</span>
            </div>
            <div className="priceRow">
              <strong>{money(product.price)}</strong>
              <del>{money(product.oldPrice)}</del>
            </div>
            <button className="primaryButton full" onClick={() => addToCart(product.id)}>
              Add to Cart
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}

function ProductDetail({ product, addToCart, go }) {
  return (
    <main className="page">
      <section className="detailLayout">
        <div className="detailImage">
          <img src={product.image} alt={product.title} />
        </div>
        <div className="detailText">
          <span className="badge inline">{product.badge}</span>
          <p className="category">{product.category}</p>
          <h1>{product.title}</h1>
          <div className="rating large">
            <Star size={17} fill="currentColor" /> {product.rating}
            <span>Sold by {product.sellerName}</span>
          </div>
          <p className="description">{product.description}</p>
          <div className="priceRow big">
            <strong>{money(product.price)}</strong>
            <del>{money(product.oldPrice)}</del>
          </div>
          <p className="stockNote">{product.stock} pieces available</p>
          <div className="heroActions">
            <button className="primaryButton" onClick={() => addToCart(product.id)}>
              Add to Cart
            </button>
            <button className="ghostButton" onClick={() => go("checkout")}>
              Buy Now
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

function Cart({ cartItems, updateQuantity, subtotal, delivery, total, go }) {
  return (
    <main className="page">
      <SectionTitle title="Shopping Cart" subtitle="Review your items before checkout." />

      {cartItems.length === 0 ? (
        <div className="emptyState">
          Your cart is empty.
          <button className="primaryButton" onClick={() => go("products")}>
            Browse Products
          </button>
        </div>
      ) : (
        <section className="cartLayout">
          <div className="cartList">
            {cartItems.map((item) => (
              <div className="cartItem" key={item.id}>
                <img src={item.image} alt={item.title} />
                <div>
                  <h3>{item.title}</h3>
                  <p>{money(item.price)}</p>
                  <span>{item.category}</span>
                </div>
                <div className="quantityBox">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                  <strong>{item.quantity}</strong>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                </div>
              </div>
            ))}
          </div>

          <SummaryCard
            subtotal={subtotal}
            delivery={delivery}
            total={total}
            buttonText="Proceed to Checkout"
            onClick={() => go("checkout")}
          />
        </section>
      )}
    </main>
  );
}

function Checkout({
  currentUser,
  cartItems,
  subtotal,
  delivery,
  total,
  createOrder,
  go
}) {
  const [form, setForm] = useState({
    name: currentUser?.name || "",
    phone: "",
    address: "",
    city: "Karachi"
  });

  const [paymentStatus, setPaymentStatus] = useState("idle");
  const [transactionCode, setTransactionCode] = useState("");

  if (!currentUser) {
    return (
      <main className="page">
        <div className="emptyState">
          Please sign in before checkout.
          <button className="primaryButton" onClick={() => go("auth")}>
            Sign in
          </button>
        </div>
      </main>
    );
  }

  if (cartItems.length === 0) {
    return (
      <main className="page">
        <div className="emptyState">
          Your cart is empty.
          <button className="primaryButton" onClick={() => go("products")}>
            Browse Products
          </button>
        </div>
      </main>
    );
  }

  function submit(event) {
    event.preventDefault();

    if (paymentStatus !== "approved") {
      alert("Please complete the demo payment before placing the order.");
      return;
    }

    createOrder({
      ...form,
      transactionCode
    });
  }

  return (
    <main className="page">
      <SectionTitle title="Checkout" subtitle="Review your order and place it securely." />

      <section className="checkoutLayout">
        <form className="panel" onSubmit={submit}>
          <h2>Shipping Details</h2>

          <label>
            Full Name
            <input
              required
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          </label>

          <label>
            Phone Number
            <input
              required
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
              placeholder="03xx-xxxxxxx"
            />
          </label>

          <label>
            Address
            <textarea
              required
              value={form.address}
              onChange={(event) => setForm({ ...form, address: event.target.value })}
              placeholder="House, street, area"
            />
          </label>

          <label>
            City
            <input
              required
              value={form.city}
              onChange={(event) => setForm({ ...form, city: event.target.value })}
            />
          </label>

          <PaymentTerminal
            total={total}
            paymentStatus={paymentStatus}
            setPaymentStatus={setPaymentStatus}
            transactionCode={transactionCode}
            setTransactionCode={setTransactionCode}
            form={form}
            createOrder={createOrder}
          />

        </form>

        <SummaryCard
          subtotal={subtotal}
          delivery={delivery}
          total={total}
          buttonText=""
          onClick={() => {}}
        />
      </section>
    </main>
  );
}

function PaymentTerminal({
  total,
  paymentStatus,
  setPaymentStatus,
  transactionCode,
  setTransactionCode,
  form,
  createOrder
}) {
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [pin, setPin] = useState("");

  function processPaymentAndOrder() {
    if (!form.name || !form.phone || !form.address || !form.city) {
      alert("Please fill your shipping details first.");
      return;
    }

    if (!cardNumber || !cardName || !expiry || !pin) {
      alert("Please fill all payment fields.");
      return;
    }

    setPaymentStatus("processing");

    setTimeout(() => {
      const code = "TXN-" + Math.floor(100000 + Math.random() * 900000);
      setTransactionCode(code);
      setPaymentStatus("approved");

      createOrder({
        ...form,
        transactionCode: code
      });
    }, 1500);
  }

  return (
    <div className="paymentTerminal">
      <div className="terminalHeader">
        <CreditCard />
        <div>
          <strong>Payment Terminal</strong>
          <p>Enter payment details and place your order.</p>
        </div>
      </div>

      <div className="terminalScreen">
        <span>AMOUNT</span>
        <strong>{money(total)}</strong>

        {paymentStatus === "idle" && <p>Waiting for payment details...</p>}
        {paymentStatus === "processing" && <p>Processing transaction...</p>}
        {paymentStatus === "approved" && (
          <p className="approvedText">Approved • {transactionCode}</p>
        )}
      </div>

      <label>
        Cardholder Name
        <input
          value={cardName}
          onChange={(event) => setCardName(event.target.value)}
          placeholder="Example: Ehzem Sheikh"
        />
      </label>

      <label>
        Card Number
        <input
          value={cardNumber}
          onChange={(event) => setCardNumber(event.target.value)}
          placeholder="4242 4242 4242 4242"
          maxLength="19"
        />
      </label>

      <div className="twoCols">
        <label>
          Expiry
          <input
            value={expiry}
            onChange={(event) => setExpiry(event.target.value)}
            placeholder="12/28"
            maxLength="5"
          />
        </label>

        <label>
          PIN / CVV
          <input
            value={pin}
            onChange={(event) => setPin(event.target.value)}
            placeholder="123"
            maxLength="4"
            type="password"
          />
        </label>
      </div>

      <button
        type="button"
        className="primaryButton full"
        onClick={processPaymentAndOrder}
        disabled={paymentStatus === "processing"}
      >
        {paymentStatus === "processing"
          ? "Processing..."
          : "Pay and Place Order"}
      </button>
    </div>
  );
}

function SummaryCard({ subtotal, delivery, total, buttonText, onClick }) {
  return (
    <aside className="summaryCard">
      <h2>Order Summary</h2>
      <div>
        <span>Subtotal</span>
        <strong>{money(subtotal)}</strong>
      </div>
      <div>
        <span>Delivery</span>
        <strong>{delivery === 0 ? "Free" : money(delivery)}</strong>
      </div>
      <div className="totalRow">
        <span>Total</span>
        <strong>{money(total)}</strong>
      </div>
      {buttonText && (
        <button className="primaryButton full" onClick={onClick}>
          {buttonText}
        </button>
      )}
    </aside>
  );
}

function Success({ go }) {
  return (
    <main className="page">
      <div className="successBox">
        <CheckCircle2 size={70} />
        <h1>Order placed successfully!</h1>
        <p>Your order has been saved. You can view it in your orders page.</p>
        <div className="heroActions centered">
          <button className="primaryButton" onClick={() => go("orders")}>
            View Orders
          </button>
          <button className="ghostButton" onClick={() => go("products")}>
            Continue Shopping
          </button>
        </div>
      </div>
    </main>
  );
}

function Auth({ login, signup }) {
  const [mode, setMode] = useState("login");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer"
  });

  function submit(event) {
    event.preventDefault();
    setMessage("");

    const result =
      mode === "login"
        ? login(form.email, form.password)
        : signup(form);

    if (!result.ok) setMessage(result.message);
  }

  return (
    <main className="authPage">
      <section className="authCard">
        <div className="authIntro">
          
          <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
          <p>
            Login or sign up today as a customer, seller, or admin.
          </p>

        </div>

        <form onSubmit={submit}>
          {mode === "signup" && (
            <label>
              Name
              <input
                required
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
            </label>
          )}

          <label>
            Email
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
          </label>

          <label>
            Password
            <input
              required
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
          </label>

          {mode === "signup" && (
            <label>
              Account Type
              <select
                value={form.role}
                onChange={(event) => setForm({ ...form, role: event.target.value })}
              >
                <option value="customer">Customer</option>
                <option value="seller">Seller</option>
                <option value="admin">Admin</option>
              </select>
            </label>
          )}

          {message && <p className="error">{message}</p>}

          <button className="primaryButton full">
            {mode === "login" ? "Login" : "Sign Up"}
          </button>

          <button
            type="button"
            className="textButton"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
          >
            {mode === "login"
              ? "Need an account? Sign up"
              : "Already have an account? Login"}
          </button>
        </form>
      </section>
    </main>
  );
}

function Dashboard({
  currentUser,
  products,
  orders,
  saveProduct,
  deleteProduct,
  canManage,
  go
}) {
  const [editing, setEditing] = useState(null);

  if (!currentUser || !["admin", "seller"].includes(currentUser.role)) {
    return (
      <main className="page">
        <div className="emptyState">
          Only sellers and admins can access this page.
          <button className="primaryButton" onClick={() => go("auth")}>
            Login
          </button>
        </div>
      </main>
    );
  }

  const manageableProducts = products.filter(canManage);
  const relevantOrders =
    currentUser.role === "admin"
      ? orders
      : orders.filter((order) =>
          order.items.some((item) => item.sellerId === currentUser.id)
        );

  return (
    <main className="page">
      <SectionTitle
        title={`${currentUser.role === "admin" ? "Admin" : "Seller"} Dashboard`}
        subtitle="Manage products and review orders."
      />

      <section className="statsGrid">
        <Stat icon={<Package />} label="Products" value={manageableProducts.length} />
        <Stat icon={<Store />} label="Orders" value={relevantOrders.length} />
        <Stat icon={<ShieldCheck />} label="Role" value={currentUser.role} />
      </section>

      <section className="dashboardGrid">
        <ProductForm
          editing={editing}
          setEditing={setEditing}
          saveProduct={saveProduct}
        />

        <div className="panel">
          <h2>Your Products</h2>
          <div className="adminList">
            {manageableProducts.map((product) => (
              <div className="adminItem" key={product.id}>
                <img src={product.image} alt={product.title} />
                <div>
                  <strong>{product.title}</strong>
                  <span>{money(product.price)} • {product.stock} stock</span>
                </div>
                <button className="iconButton" onClick={() => setEditing(product)}>
                  <Pencil size={17} />
                </button>
                <button className="iconButton danger" onClick={() => deleteProduct(product.id)}>
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel">
        <h2>Recent Orders</h2>
        {relevantOrders.length === 0 ? (
          <p className="muted">No orders yet.</p>
        ) : (
          <div className="orderList">
            {relevantOrders.slice(0, 8).map((order) => (
              <div className="orderCard" key={order.id}>
                <div>
                  <strong>{order.id}</strong>
                  <span>{order.customerName} • {order.city}</span>
                </div>
                <div>
                  <strong>{money(order.total)}</strong>
                  <span>{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function ProductForm({ editing, setEditing, saveProduct }) {
  const emptyProduct = {
    title: "",
    category: "Fashion",
    price: "",
    oldPrice: "",
    rating: 4.5,
    stock: "",
    image: "",
    badge: "New",
    description: ""
  };

  const [form, setForm] = useState(emptyProduct);

  useEffect(() => {
    setForm(editing || emptyProduct);
  }, [editing]);

  function submit(event) {
    event.preventDefault();
    saveProduct(form);
    setForm(emptyProduct);
    setEditing(null);
  }

  return (
    <form className="panel" onSubmit={submit}>
      <h2>{editing ? "Edit Product" : "Add Product"}</h2>

      <label>
        Product Title
        <input
          required
          value={form.title}
          onChange={(event) => setForm({ ...form, title: event.target.value })}
        />
      </label>

      <label>
        Category
        <select
          value={form.category}
          onChange={(event) => setForm({ ...form, category: event.target.value })}
        >
          <option>Fashion</option>
          <option>Electronics</option>
          <option>Home</option>
          <option>Beauty</option>
          <option>Books</option>
          <option>Sports</option>
        </select>
      </label>

      <div className="twoCols">
        <label>
          Price
          <input
            required
            type="number"
            value={form.price}
            onChange={(event) => setForm({ ...form, price: event.target.value })}
          />
        </label>
        <label>
          Old Price
          <input
            type="number"
            value={form.oldPrice}
            onChange={(event) => setForm({ ...form, oldPrice: event.target.value })}
          />
        </label>
      </div>

      <div className="twoCols">
        <label>
          Stock
          <input
            required
            type="number"
            value={form.stock}
            onChange={(event) => setForm({ ...form, stock: event.target.value })}
          />
        </label>
        <label>
          Rating
          <input
            type="number"
            step="0.1"
            min="1"
            max="5"
            value={form.rating}
            onChange={(event) => setForm({ ...form, rating: event.target.value })}
          />
        </label>
      </div>

      <label>
        Image URL
        <input
          required
          value={form.image}
          onChange={(event) => setForm({ ...form, image: event.target.value })}
          placeholder="Paste image link"
        />
      </label>

      <label>
        Badge
        <input
          value={form.badge}
          onChange={(event) => setForm({ ...form, badge: event.target.value })}
        />
      </label>

      <label>
        Description
        <textarea
          required
          value={form.description}
          onChange={(event) => setForm({ ...form, description: event.target.value })}
        />
      </label>

      <button className="primaryButton full">
        <Plus size={17} /> {editing ? "Save Product" : "Add Product"}
      </button>

      {editing && (
        <button type="button" className="textButton" onClick={() => setEditing(null)}>
          Cancel editing
        </button>
      )}
    </form>
  );
}

function Orders({ currentUser, orders, go }) {
  if (!currentUser) {
    return (
      <main className="page">
        <div className="emptyState">
          Please login to view orders.
          <button className="primaryButton" onClick={() => go("auth")}>
            Login
          </button>
        </div>
      </main>
    );
  }

  const visibleOrders =
    currentUser.role === "admin"
      ? orders
      : currentUser.role === "seller"
      ? orders.filter((order) =>
          order.items.some((item) => item.sellerId === currentUser.id)
        )
      : orders.filter((order) => order.userId === currentUser.id);

  return (
    <main className="page">
      <SectionTitle title="Orders" subtitle="Your order history." />

      {visibleOrders.length === 0 ? (
        <div className="emptyState">No orders found.</div>
      ) : (
        <div className="orderList">
          {visibleOrders.map((order) => (
            <div className="orderCard expanded" key={order.id}>
              <div className="orderTop">
                <div>
                  <strong>{order.id}</strong>
                  <span>{order.createdAt}</span>
                </div>
                <div>
                  <strong>{money(order.total)}</strong>
                  <span>{order.status}</span>
                </div>
              </div>

              <div className="orderItems">
                {order.items.map((item) => (
                  <span key={item.productId}>
                    {item.quantity}× {item.title}
                  </span>
                ))}
              </div>

              <p className="muted">
                Ship to: {order.address}, {order.city}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="statCard">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function SectionTitle({ title, subtitle }) {
  return (
    <div className="sectionTitle">
      <span className="eyebrow">LuxeMart</span>
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  );
}

function Footer() {
  return (
    <footer>
      <strong>LuxeMart</strong>
      <p>
        A modern ecommerce marketplace for you.
      </p>
    </footer>
  );
}

createRoot(document.getElementById("root")).render(<App />);
