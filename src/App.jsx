import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

import chickenImage from "./assets/chiken.jpeg";
import muttonImage from "./assets/mutton.jpeg";
import beefImage from "./assets/beef.jpeg";
import logoImage from "./assets/logo.jpg";

// ==========================================
// BACKEND API URL
// ==========================================

const API_URL = "https://pbackend-k25g.onrender.com/api";

// ==========================================
// ADMIN
// ==========================================

const ADMIN_USERNAME = "Amrina";
const ADMIN_PASSWORD = "Amrina1403";

// ==========================================
// AXIOS CONFIG
// ==========================================

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

function App() {
  // ==========================================
  // STATE
  // ==========================================

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [activePage, setActivePage] = useState("home");

  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const [orderPhone, setOrderPhone] = useState("");
  const [myOrders, setMyOrders] = useState([]);

  const [isAdmin, setIsAdmin] = useState(
    localStorage.getItem("adminLoggedIn") === "true"
  );

  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const [adminCredentials, setAdminCredentials] = useState({
    username: "",
    password: "",
  });

  const [adminError, setAdminError] = useState("");
  const [allOrders, setAllOrders] = useState([]);

  const [showProductModal, setShowProductModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    stock: "",
    image_url: "chicken",
  });

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchProducts();

    const savedPhone = localStorage.getItem("pickleCustomerPhone");

    if (savedPhone) {
      setOrderPhone(savedPhone);
    }

    if (localStorage.getItem("adminLoggedIn") === "true") {
      fetchAllOrders();
    }
  }, []);

  // ==========================================
  // FETCH PRODUCTS
  // ==========================================

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const response = await api.get("/products");

      setProducts(response.data.products || []);
    } catch (error) {
      console.error("Products error:", error);

      setProducts([]);

      alert(
        error.response?.data?.message ||
          "Unable to load products. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FETCH ALL ORDERS
  // ==========================================

  const fetchAllOrders = async () => {
    try {
      const response = await api.get("/orders");

      setAllOrders(response.data.orders || []);
    } catch (error) {
      console.error("Orders error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to load orders"
      );
    }
  };

  // ==========================================
  // NAVIGATION
  // ==========================================

  const navigate = (page) => {
    setActivePage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // PRODUCT IMAGE
  // ==========================================

  const getProductImage = (product) => {
    const type = String(
      product.image_url || product.image || ""
    ).toLowerCase();

    const name = String(product.name || "").toLowerCase();

    if (
      type.includes("mutton") ||
      name.includes("mutton")
    ) {
      return muttonImage;
    }

    if (
      type.includes("beef") ||
      name.includes("beef")
    ) {
      return beefImage;
    }

    return chickenImage;
  };

  // ==========================================
  // ADD TO CART
  // ==========================================

  const addToCart = (product) => {
    if (Number(product.stock) <= 0) {
      alert("This product is out of stock");
      return;
    }

    setCart((previousCart) => {
      const existingItem = previousCart.find(
        (item) => item.id === product.id
      );

      if (existingItem) {
        if (
          existingItem.quantity >=
          Number(product.stock)
        ) {
          alert("Maximum stock reached");
          return previousCart;
        }

        return previousCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...previousCart,
        {
          ...product,
          quantity: 1,
        },
      ];
    });

    alert(`${product.name} added to cart`);
  };

  // ==========================================
  // INCREASE QUANTITY
  // ==========================================

  const increaseQuantity = (id) => {
    setCart((previousCart) =>
      previousCart.map((item) => {
        if (item.id !== id) return item;

        if (item.quantity >= Number(item.stock)) {
          alert("Maximum stock reached");

          return item;
        }

        return {
          ...item,
          quantity: item.quantity + 1,
        };
      })
    );
  };

  // ==========================================
  // DECREASE QUANTITY
  // ==========================================

  const decreaseQuantity = (id) => {
    setCart((previousCart) =>
      previousCart
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // ==========================================
  // REMOVE ITEM
  // ==========================================

  const removeItem = (id) => {
    setCart((previousCart) =>
      previousCart.filter(
        (item) => item.id !== id
      )
    );
  };

  // ==========================================
  // CART TOTAL
  // ==========================================

  const total = cart.reduce(
    (sum, item) =>
      sum + Number(item.price) * item.quantity,
    0
  );

  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // ==========================================
  // CUSTOMER CHANGE
  // ==========================================

  const handleCustomerChange = (event) => {
    const { name, value } = event.target;

    setCustomer((previousCustomer) => ({
      ...previousCustomer,
      [name]: value,
    }));
  };

  // ==========================================
  // PLACE ORDER
  // ==========================================

  const placeOrder = async (event) => {
    event.preventDefault();

    if (cart.length === 0) {
      alert("Your cart is empty");
      return;
    }

    if (
      !customer.name.trim() ||
      !customer.phone.trim() ||
      !customer.address.trim()
    ) {
      alert("Please fill all customer details");
      return;
    }

    try {
      setPlacingOrder(true);

      const response = await api.post("/orders", {
        customer: {
          name: customer.name.trim(),
          phone: customer.phone.trim(),
          address: customer.address.trim(),
        },

        items: cart.map((item) => ({
          id: item.id,
          quantity: item.quantity,
        })),
      });

      if (response.data.success) {
        const completedOrder = response.data.order;

        setOrderSuccess(completedOrder);

        localStorage.setItem(
          "pickleCustomerPhone",
          customer.phone.trim()
        );

        setOrderPhone(customer.phone.trim());

        setCart([]);

        setCustomer({
          name: "",
          phone: "",
          address: "",
        });

        await fetchProducts();

        navigate("success");
      }
    } catch (error) {
      console.error("Place order error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to place order"
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  // ==========================================
  // LOAD MY ORDERS
  // ==========================================

  const loadMyOrders = async () => {
    if (!orderPhone.trim()) {
      alert("Enter your phone number");
      return;
    }

    try {
      const response = await api.get(
        `/orders/customer/${encodeURIComponent(
          orderPhone.trim()
        )}`
      );

      setMyOrders(response.data.orders || []);

      if ((response.data.orders || []).length === 0) {
        alert("No orders found for this phone number");
      }
    } catch (error) {
      console.error("My orders error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to load orders"
      );
    }
  };

  // ==========================================
  // ADMIN LOGIN
  // ==========================================

  const handleAdminLogin = (event) => {
    event.preventDefault();

    if (
      adminCredentials.username === ADMIN_USERNAME &&
      adminCredentials.password === ADMIN_PASSWORD
    ) {
      localStorage.setItem(
        "adminLoggedIn",
        "true"
      );

      setIsAdmin(true);

      setShowAdminLogin(false);

      setAdminError("");

      setAdminCredentials({
        username: "",
        password: "",
      });

      fetchAllOrders();

      navigate("admin");

      alert("Admin login successful");
    } else {
      setAdminError(
        "Invalid username or password"
      );
    }
  };

  // ==========================================
  // ADMIN LOGOUT
  // ==========================================

  const handleAdminLogout = () => {
    localStorage.removeItem("adminLoggedIn");

    setIsAdmin(false);

    setAllOrders([]);

    navigate("home");
  };

  // ==========================================
  // OPEN ADD PRODUCT MODAL
  // ==========================================

  const openAddProductModal = () => {
    setProductForm({
      name: "",
      price: "",
      stock: "",
      image_url: "chicken",
    });

    setEditingProduct(null);

    setIsEditing(false);

    setShowProductModal(true);
  };

  // ==========================================
  // OPEN EDIT PRODUCT MODAL
  // ==========================================

  const openEditProductModal = (product) => {
    setProductForm({
      name: product.name || "",
      price: product.price || "",
      stock: product.stock || "",
      image_url:
        product.image_url ||
        product.image ||
        "chicken",
    });

    setEditingProduct(product);

    setIsEditing(true);

    setShowProductModal(true);
  };

  // ==========================================
  // PRODUCT FORM CHANGE
  // ==========================================

  const handleProductChange = (event) => {
    const { name, value } = event.target;

    setProductForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // ADD PRODUCT
  // ==========================================

  const handleAddProduct = async (event) => {
    event.preventDefault();

    if (
      !productForm.name.trim() ||
      !productForm.price ||
      !productForm.stock
    ) {
      alert("Please fill all product details");
      return;
    }

    try {
      await api.post("/products", {
        name: productForm.name.trim(),
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        image_url: productForm.image_url,
      });

      setShowProductModal(false);

      await fetchProducts();

      alert("Product added successfully");
    } catch (error) {
      console.error("Add product error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to add product"
      );
    }
  };

  // ==========================================
  // UPDATE PRODUCT
  // ==========================================

  const handleUpdateProduct = async (event) => {
    event.preventDefault();

    if (!editingProduct) return;

    try {
      await api.put(
        `/products/${editingProduct.id}`,
        {
          name: productForm.name.trim(),
          price: Number(productForm.price),
          stock: Number(productForm.stock),
          image_url: productForm.image_url,
        }
      );

      setShowProductModal(false);

      await fetchProducts();

      alert("Product updated successfully");
    } catch (error) {
      console.error("Update product error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to update product"
      );
    }
  };

  // ==========================================
  // DELETE PRODUCT
  // ==========================================

  const handleDeleteProduct = async (
    productId
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      await api.delete(
        `/products/${productId}`
      );

      setCart((previousCart) =>
        previousCart.filter(
          (item) => item.id !== productId
        )
      );

      await fetchProducts();

      alert("Product deleted successfully");
    } catch (error) {
      console.error("Delete product error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to delete product"
      );
    }
  };

  // ==========================================
  // UPDATE ORDER STATUS
  // ==========================================

  const updateOrderStatus = async (
    orderId,
    order_status
  ) => {
    try {
      await api.put(
        `/orders/${orderId}/status`,
        {
          order_status,
        }
      );

      setAllOrders((previousOrders) =>
        previousOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                order_status,
              }
            : order
        )
      );

      alert("Order status updated");
    } catch (error) {
      console.error(
        "Order status error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to update status"
      );
    }
  };

  // ==========================================
  // HOME PAGE
  // ==========================================

  const renderHomePage = () => (
    <>
      <section className="hero">
        <div>
          <span className="hero-tag">
            🌶️ 100% Homemade
          </span>

          <h2>
            Authentic Homemade
            <br />
            Non-Veg Pickles
          </h2>

          <p>
            Fresh ingredients. Traditional recipes.
            Delicious taste.
          </p>

          <button
            className="primary-btn"
            onClick={() =>
              navigate("products")
            }
          >
            Shop Now 🛒
          </button>
        </div>
      </section>

      <section className="products-section">
        <div className="section-heading">
          <div>
            <p className="section-label">
              OUR PRODUCTS
            </p>

            <h2>Our Pickles</h2>
          </div>
        </div>

        {loading ? (
          <div className="loading">
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="orders-empty">
            No products available.
          </div>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <div
                className="product-card"
                key={product.id}
              >
                <div className="product-image-box">
                  <img
                    src={getProductImage(product)}
                    alt={product.name}
                  />
                </div>

                <div className="product-info">
                  <h3>{product.name}</h3>

                  <p className="price">
                    ₹
                    {Number(
                      product.price
                    ).toFixed(2)}
                  </p>

                  <p>
                    Stock: {product.stock}
                  </p>

                  <button
                    className="add-cart-btn"
                    disabled={
                      Number(product.stock) <= 0
                    }
                    onClick={() =>
                      addToCart(product)
                    }
                  >
                    {Number(product.stock) <= 0
                      ? "Out of Stock"
                      : "🛒 Add to Cart"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );

  // ==========================================
  // CART PAGE
  // ==========================================

  const renderCartPage = () => (
    <section className="page-container">
      <h2>🛒 Shopping Cart</h2>

      {cart.length === 0 ? (
        <div className="empty-cart">
          <h3>Your cart is empty</h3>

          <button
            className="primary-btn"
            onClick={() =>
              navigate("home")
            }
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {cart.map((item) => (
              <div
                className="cart-item"
                key={item.id}
              >
                <img
                  src={getProductImage(item)}
                  alt={item.name}
                />

                <div className="cart-item-info">
                  <h3>{item.name}</h3>

                  <p>
                    ₹
                    {Number(item.price).toFixed(
                      2
                    )}
                  </p>

                  <div className="quantity-control">
                    <button
                      onClick={() =>
                        decreaseQuantity(item.id)
                      }
                    >
                      −
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      onClick={() =>
                        increaseQuantity(item.id)
                      }
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="cart-item-right">
                  <strong>
                    ₹
                    {(
                      Number(item.price) *
                      item.quantity
                    ).toFixed(2)}
                  </strong>

                  <button
                    className="remove-btn"
                    onClick={() =>
                      removeItem(item.id)
                    }
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="order-summary">
            <h3>Order Summary</h3>

            <div className="summary-row">
              <span>Items</span>

              <span>{totalItems}</span>
            </div>

            <div className="summary-row">
              <span>Delivery</span>

              <span>Free</span>
            </div>

            <div className="summary-total">
              <strong>Total</strong>

              <strong>
                ₹{total.toFixed(2)}
              </strong>
            </div>

            <button
              className="checkout-btn"
              onClick={() =>
                navigate("checkout")
              }
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </section>
  );

  // ==========================================
  // CHECKOUT PAGE
  // ==========================================

  const renderCheckoutPage = () => {
    if (cart.length === 0) {
      return (
        <section className="page-container">
          <div className="empty-cart">
            <h2>Your cart is empty</h2>

            <button
              className="primary-btn"
              onClick={() =>
                navigate("home")
              }
            >
              Continue Shopping
            </button>
          </div>
        </section>
      );
    }

    return (
      <section className="page-container">
        <h2>🔒 Checkout</h2>

        <div className="checkout-layout">
          <form
            className="checkout-form"
            onSubmit={placeOrder}
          >
            <div className="checkout-card">
              <h3>Delivery Address</h3>

              <label>Full Name</label>

              <input
                type="text"
                name="name"
                value={customer.name}
                onChange={handleCustomerChange}
                placeholder="Enter your name"
                required
              />

              <label>Phone Number</label>

              <input
                type="tel"
                name="phone"
                value={customer.phone}
                onChange={handleCustomerChange}
                placeholder="Enter your phone number"
                required
              />

              <label>
                Delivery Address
              </label>

              <textarea
                name="address"
                value={customer.address}
                onChange={handleCustomerChange}
                placeholder="Enter your full delivery address"
                rows="5"
                required
              />
            </div>

            <div className="checkout-card">
              <h3>Payment Method</h3>

              <div className="payment-option">
                💵 Cash on Delivery
              </div>
            </div>

            <button
              type="submit"
              className="place-order-btn"
              disabled={placingOrder}
            >
              {placingOrder
                ? "Placing Order..."
                : `Place Order • ₹${total.toFixed(
                    2
                  )}`}
            </button>
          </form>
        </div>
      </section>
    );
  };

  // ==========================================
  // SUCCESS PAGE
  // ==========================================

  const renderSuccessPage = () => {
    if (!orderSuccess) {
      return (
        <section className="page-container">
          <div className="empty-cart">
            <h2>No recent order found</h2>

            <button
              className="primary-btn"
              onClick={() =>
                navigate("home")
              }
            >
              Continue Shopping
            </button>
          </div>
        </section>
      );
    }

    return (
      <section className="success-page">
        <div className="success-icon">
          ✓
        </div>

        <h2>
          Order Placed Successfully!
        </h2>

        <p>
          Thank you for ordering from
          Lyrah's SANUR.
        </p>

        <div className="success-order-card">
          <p>Order Number</p>

          <h3>
            {orderSuccess.order_number}
          </h3>

          <p>
            Status:{" "}
            {orderSuccess.order_status}
          </p>
        </div>

        {orderSuccess.customer && (
          <div className="success-order-card">
            <h3>Customer Details</h3>

            <p>
              <strong>Name:</strong>{" "}
              {orderSuccess.customer.name}
            </p>

            <p>
              <strong>Phone:</strong>{" "}
              {orderSuccess.customer.phone}
            </p>

            <p>
              <strong>Address:</strong>{" "}
              {orderSuccess.customer.address}
            </p>
          </div>
        )}

        <div className="success-order-card">
          <h3>Ordered Products</h3>

          {(orderSuccess.items || []).map(
            (item, index) => (
              <div
                className="mini-item"
                key={
                  item.productId ||
                  item.id ||
                  index
                }
              >
                <span>
                  {item.productName ||
                    item.product_name}{" "}
                  × {item.quantity}
                </span>

                <strong>
                  ₹
                  {Number(
                    item.subtotal ||
                      item.price *
                        item.quantity ||
                      0
                  ).toFixed(2)}
                </strong>
              </div>
            )
          )}

          <div className="summary-total">
            <strong>Total</strong>

            <strong>
              ₹
              {Number(
                orderSuccess.total_amount || 0
              ).toFixed(2)}
            </strong>
          </div>
        </div>

        <div className="success-buttons">
          <button
            className="secondary-btn"
            onClick={() =>
              navigate("orders")
            }
          >
            📦 View My Orders
          </button>

          <button
            className="primary-btn"
            onClick={() =>
              navigate("home")
            }
          >
            Continue Shopping
          </button>
        </div>
      </section>
    );
  };

  // ==========================================
  // MY ORDERS PAGE
  // ==========================================

  const renderOrdersPage = () => (
    <section className="page-container">
      <h2>📦 My Orders</h2>

      <div className="find-orders">
        <input
          type="tel"
          value={orderPhone}
          onChange={(event) =>
            setOrderPhone(event.target.value)
          }
          placeholder="Enter your phone number"
        />

        <button onClick={loadMyOrders}>
          Find Orders
        </button>
      </div>

      {myOrders.length === 0 ? (
        <div className="orders-empty">
          <p>
            Enter your phone number and click
            Find Orders.
          </p>
        </div>
      ) : (
        <div className="orders-list">
          {myOrders.map((order) => (
            <div
              className="my-order-card"
              key={order.id}
            >
              <h3>
                {order.order_number}
              </h3>

              {(order.items || []).map(
                (item, index) => (
                  <p
                    key={
                      item.productId ||
                      item.id ||
                      index
                    }
                  >
                    {item.product_name ||
                      item.productName}{" "}
                    × {item.quantity}
                  </p>
                )
              )}

              <strong>
                Total: ₹
                {Number(
                  order.total_amount || 0
                ).toFixed(2)}
              </strong>

              <p>
                Status:{" "}
                {order.order_status}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );

  // ==========================================
  // ADMIN LOGIN MODAL
  // ==========================================

  const renderAdminLoginModal = () => {
    if (!showAdminLogin) return null;

    return (
      <div
        className="modal-overlay"
        onClick={() =>
          setShowAdminLogin(false)
        }
      >
        <div
          className="modal-content"
          onClick={(event) =>
            event.stopPropagation()
          }
        >
          <button
            className="modal-close"
            onClick={() =>
              setShowAdminLogin(false)
            }
          >
            ×
          </button>

          <h2>🔐 Admin Login</h2>

          <form
            onSubmit={handleAdminLogin}
          >
            <input
              type="text"
              placeholder="Username"
              value={
                adminCredentials.username
              }
              onChange={(event) =>
                setAdminCredentials({
                  ...adminCredentials,
                  username: event.target.value,
                })
              }
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={
                adminCredentials.password
              }
              onChange={(event) =>
                setAdminCredentials({
                  ...adminCredentials,
                  password: event.target.value,
                })
              }
              required
            />

            {adminError && (
              <p className="error-message">
                {adminError}
              </p>
            )}

            <button
              type="submit"
              className="admin-login-btn"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  };

  // ==========================================
  // PRODUCT MODAL
  // ==========================================

  const renderProductModal = () => {
    if (!showProductModal) return null;

    return (
      <div
        className="modal-overlay"
        onClick={() =>
          setShowProductModal(false)
        }
      >
        <div
          className="modal-content"
          onClick={(event) =>
            event.stopPropagation()
          }
        >
          <button
            className="modal-close"
            onClick={() =>
              setShowProductModal(false)
            }
          >
            ×
          </button>

          <h2>
            {isEditing
              ? "Edit Product"
              : "Add Product"}
          </h2>

          <form
            onSubmit={
              isEditing
                ? handleUpdateProduct
                : handleAddProduct
            }
          >
            <label>Product Name</label>

            <input
              name="name"
              value={productForm.name}
              onChange={handleProductChange}
              required
            />

            <label>Price</label>

            <input
              type="number"
              name="price"
              min="0"
              step="0.01"
              value={productForm.price}
              onChange={handleProductChange}
              required
            />

            <label>Stock</label>

            <input
              type="number"
              name="stock"
              min="0"
              value={productForm.stock}
              onChange={handleProductChange}
              required
            />

            <label>Product Image</label>

            <select
              name="image_url"
              value={
                productForm.image_url
              }
              onChange={handleProductChange}
            >
              <option value="chicken">
                Chicken
              </option>

              <option value="mutton">
                Mutton
              </option>

              <option value="beef">
                Beef
              </option>
            </select>

            <button
              type="submit"
              className="admin-login-btn"
            >
              {isEditing
                ? "Update Product"
                : "Add Product"}
            </button>
          </form>
        </div>
      </div>
    );
  };

  // ==========================================
  // ADMIN PRODUCTS PAGE
  // ==========================================

  const renderAdminProductsPage = () => {
    if (!isAdmin) {
      return (
        <section className="page-container">
          <h2>Admin Access</h2>

          <button
            className="primary-btn"
            onClick={() =>
              setShowAdminLogin(true)
            }
          >
            Admin Login
          </button>
        </section>
      );
    }

    return (
      <section className="page-container">
        <div className="admin-header">
          <h2>📦 Manage Products</h2>

          <button
            className="add-product-btn"
            onClick={openAddProductModal}
          >
            ➕ Add Product
          </button>
        </div>

        <div className="admin-products-grid">
          {products.map((product) => (
            <div
              className="admin-product-card"
              key={product.id}
            >
              <img
                src={getProductImage(
                  product
                )}
                alt={product.name}
              />

              <h3>{product.name}</h3>

              <p>
                ₹
                {Number(
                  product.price
                ).toFixed(2)}
              </p>

              <p>
                Stock: {product.stock}
              </p>

              <button
                className="edit-btn"
                onClick={() =>
                  openEditProductModal(
                    product
                  )
                }
              >
                ✏️ Edit
              </button>

              <button
                className="delete-btn"
                onClick={() =>
                  handleDeleteProduct(
                    product.id
                  )
                }
              >
                🗑️ Delete
              </button>
            </div>
          ))}
        </div>
      </section>
    );
  };

  // ==========================================
  // ADMIN PAGE
  // ==========================================

  const renderAdminPage = () => {
    if (!isAdmin) {
      return (
        <section className="page-container">
          <h2>🔐 Admin</h2>

          <button
            className="primary-btn"
            onClick={() =>
              setShowAdminLogin(true)
            }
          >
            Admin Login
          </button>
        </section>
      );
    }

    return (
      <section className="page-container">
        <div className="admin-header">
          <h2>📊 Admin Dashboard</h2>

          <button
            className="manage-products-btn"
            onClick={() =>
              navigate(
                "admin-products"
              )
            }
          >
            📦 Manage Products
          </button>

          <button
            className="logout-btn"
            onClick={handleAdminLogout}
          >
            Logout
          </button>
        </div>

        <button
          className="refresh-btn"
          onClick={fetchAllOrders}
        >
          🔄 Refresh Orders
        </button>

        {allOrders.length === 0 ? (
          <div className="orders-empty">
            No orders found.
          </div>
        ) : (
          <div className="orders-list">
            {allOrders.map((order) => (
              <div
                className="my-order-card"
                key={order.id}
              >
                <h3>
                  {order.order_number}
                </h3>

                <p>
                  Customer:{" "}
                  {order.customer_name}
                </p>

                <p>
                  Phone: {order.phone}
                </p>

                <p>
                  Address: {order.address}
                </p>

                <strong>
                  ₹
                  {Number(
                    order.total_amount || 0
                  ).toFixed(2)}
                </strong>

                <br />

                <br />

                <select
                  value={
                    order.order_status
                  }
                  onChange={(event) =>
                    updateOrderStatus(
                      order.id,
                      event.target.value
                    )
                  }
                >
                  <option value="Placed">
                    Placed
                  </option>

                  <option value="Confirmed">
                    Confirmed
                  </option>

                  <option value="Processing">
                    Processing
                  </option>

                  <option value="Shipped">
                    Shipped
                  </option>

                  <option value="Out for Delivery">
                    Out for Delivery
                  </option>

                  <option value="Delivered">
                    Delivered
                  </option>

                  <option value="Cancelled">
                    Cancelled
                  </option>
                </select>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  };

  // ==========================================
  // MAIN APP
  // ==========================================

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <button
            className="brand"
            onClick={() =>
              navigate("home")
            }
          >
            <img
              src={logoImage}
              alt="Lyrah's SANUR"
            />

            <div>
              <h1>
                Lyrah's SANUR
              </h1>

              <p>
                Homemade Non-Veg Pickles
              </p>
            </div>
          </button>

          <nav className="nav">
            <button
              onClick={() =>
                navigate("home")
              }
            >
              Home
            </button>

            <button
              onClick={() =>
                navigate("orders")
              }
            >
              My Orders
            </button>

            <button
              onClick={() =>
                isAdmin
                  ? navigate("admin")
                  : setShowAdminLogin(
                      true
                    )
              }
            >
              👑 Admin
            </button>

            <button
              className="cart-nav-btn"
              onClick={() =>
                navigate("cart")
              }
            >
              🛒 Cart ({totalItems})
            </button>
          </nav>
        </div>
      </header>

      <main>
        {(activePage === "home" ||
          activePage === "products") &&
          renderHomePage()}

        {activePage === "cart" &&
          renderCartPage()}

        {activePage === "checkout" &&
          renderCheckoutPage()}

        {activePage === "success" &&
          renderSuccessPage()}

        {activePage === "orders" &&
          renderOrdersPage()}

        {activePage === "admin" &&
          renderAdminPage()}

        {activePage ===
          "admin-products" &&
          renderAdminProductsPage()}
      </main>

      {renderAdminLoginModal()}

      {renderProductModal()}

      <footer>
        <p>© 2026 Lyrah's SANUR</p>
        <p>Homemade Pickles ❤️</p>
      </footer>
    </div>
  );
}

export default App;