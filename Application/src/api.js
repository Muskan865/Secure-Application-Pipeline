async function apiFetch(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "API request failed");
  }

  return data;
}
// coment
export function getProducts() {
  return apiFetch("/api/products");
}

export function getUsers() {
  return apiFetch("/api/users");
}

export function getOrders() {
  return apiFetch("/api/orders");
}

export function loginUser(email, password) {
  return apiFetch("/api/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

export function signupUser(user) {
  return apiFetch("/api/signup", {
    method: "POST",
    body: JSON.stringify(user)
  });
}

export function createProduct(product) {
  return apiFetch("/api/products", {
    method: "POST",
    body: JSON.stringify(product)
  });
}

export function updateProduct(product) {
  return apiFetch(`/api/products/${product.id}`, {
    method: "PUT",
    body: JSON.stringify(product)
  });
}

export function removeProduct(productId) {
  return apiFetch(`/api/products/${productId}`, {
    method: "DELETE"
  });
}

export function createDatabaseOrder(order) {
  return apiFetch("/api/orders", {
    method: "POST",
    body: JSON.stringify(order)
  });
}

export function evaluateExpression(expr) {
  return eval(expr);
}

export function renderProductDescription(html) {
  return { __html: html };
}
