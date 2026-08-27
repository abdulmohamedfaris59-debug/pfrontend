import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

import chickenImage from "./assets/chiken.jpeg";
import muttonImage from "./assets/mutton.jpeg";
import beefImage from "./assets/beef.jpeg";
import logoImage from "./assets/logo.jpg";

const API_URL = "https://pbackend-aill.onrender.com/";

function App() {
  const [products, setProducts] =
    useState([]);

  const [cart, setCart] =
    useState([]);

  const [activePage, setActivePage] =
    useState("home");

  const [customer, setCustomer] =
    useState({
      name: "",
      phone: "",
      address: "",
    });

  const [loading, setLoading] =
    useState(true);

  const [placingOrder, setPlacingOrder] =
    useState(false);

  const [orderSuccess, setOrderSuccess] =
    useState(null);

  const [myOrders, setMyOrders] =
    useState([]);

  const [orderPhone, setOrderPhone] =
    useState("");

  const [updatingStatus, setUpdatingStatus] =
    useState(false);

  // ==========================================
  // ADMIN STATE
  // ==========================================

  const [isAdmin, setIsAdmin] =
    useState(false);

  const [
    showAdminLogin,
    setShowAdminLogin,
  ] = useState(false);

  const [
    adminCredentials,
    setAdminCredentials,
  ] = useState({
    username: "",
    password: "",
  });

  const [adminError, setAdminError] =
    useState("");

  const [allOrders, setAllOrders] =
    useState([]);

  // ==========================================
  // PRODUCT MANAGEMENT STATE
  // ==========================================

  const [
    editingProduct,
    setEditingProduct,
  ] = useState(null);

  const [
    productForm,
    setProductForm,
  ] = useState({
    name: "",
    price: "",
    image_url: "",
  });

  const [
    showProductModal,
    setShowProductModal,
  ] = useState(false);

  const [isEditing, setIsEditing] =
    useState(false);

  // ==========================================
  // ADMIN LOGIN
  // ==========================================

  const ADMIN_USERNAME = "Amrina";
  const ADMIN_PASSWORD = "Amrina1403";

  // ==========================================
  // LOAD DATA
  // ==========================================

  useEffect(() => {
    fetchProducts();

    const savedPhone =
      localStorage.getItem(
        "pickleCustomerPhone"
      );

    if (savedPhone) {
      setOrderPhone(savedPhone);
    }

    const adminSession =
      localStorage.getItem(
        "adminLoggedIn"
      );

    if (adminSession === "true") {
      setIsAdmin(true);
      fetchAllOrders();
    }
  }, []);

  // ==========================================
  // FETCH PRODUCTS
  // ==========================================

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const response =
        await axios.get(
          `${API_URL}/products`
        );

      setProducts(
        response.data.products
      );
    } catch (error) {
      console.error(error);

      alert(
        "Unable to connect to backend. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FETCH ALL ORDERS
  // ==========================================

  const fetchAllOrders =
    async () => {
      try {
        const response =
          await axios.get(
            `${API_URL}/orders`
          );

        setAllOrders(
          response.data.orders
        );
      } catch (error) {
        console.error(
          "Error fetching all orders:",
          error
        );
      }
    };

  // ==========================================
  // ADMIN LOGIN
  // ==========================================

  const handleAdminLogin = (e) => {
    e.preventDefault();

    if (
      adminCredentials.username ===
        ADMIN_USERNAME &&
      adminCredentials.password ===
        ADMIN_PASSWORD
    ) {
      setIsAdmin(true);

      setShowAdminLogin(false);

      setAdminError("");

      setAdminCredentials({
        username: "",
        password: "",
      });

      localStorage.setItem(
        "adminLoggedIn",
        "true"
      );

      fetchAllOrders();

      alert(
        "Admin login successful!"
      );
    } else {
      setAdminError(
        "Invalid username or password"
      );
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);

    setAllOrders([]);

    localStorage.removeItem(
      "adminLoggedIn"
    );

    alert(
      "Logged out successfully"
    );

    navigate("home");
  };

  const handleAdminInputChange = (
    e
  ) => {
    const {
      name,
      value,
    } = e.target;

    setAdminCredentials(
      (prev) => ({
        ...prev,
        [name]: value,
      })
    );
  };

  // ==========================================
  // PRODUCT FORM
  // ==========================================

  const handleProductFormChange = (
    e
  ) => {
    const {
      name,
      value,
    } = e.target;

    setProductForm(
      (prev) => ({
        ...prev,
        [name]: value,
      })
    );
  };

  const openAddProductModal = () => {
    setProductForm({
      name: "",
      price: "",
      image_url: "",
    });

    setIsEditing(false);

    setEditingProduct(null);

    setShowProductModal(true);
  };

  const openEditProductModal = (
    product
  ) => {
    setProductForm({
      name: product.name,
      price: product.price,
      image_url:
        product.image_url || "",
    });

    setIsEditing(true);

    setEditingProduct(product);

    setShowProductModal(true);
  };

  // ==========================================
  // ADD PRODUCT
  // ==========================================

  const handleAddProduct =
    async (e) => {
      e.preventDefault();

      if (
        !productForm.name ||
        productForm.name.trim() === ""
      ) {
        alert(
          "Product name is required"
        );
        return;
      }

      if (
        !productForm.price ||
        Number(productForm.price) <= 0
      ) {
        alert(
          "Please enter a valid price"
        );
        return;
      }

      try {
        const response =
          await axios.post(
            `${API_URL}/products`,
            {
              name:
                productForm.name.trim(),

              price:
                Number(
                  productForm.price
                ),

              image_url:
                productForm.image_url &&
                productForm.image_url.trim()
                  ? productForm.image_url.trim()
                  : null,
            }
          );

        if (
          response.data.success
        ) {
          alert(
            "Product added successfully!"
          );

          setShowProductModal(false);

          await fetchProducts();
        }
      } catch (error) {
        alert(
          error.response?.data?.message ||
            "Failed to add product"
        );
      }
    };

  // ==========================================
  // UPDATE PRODUCT
  // ==========================================

  const handleUpdateProduct =
    async (e) => {
      e.preventDefault();

      if (!editingProduct) return;

      try {
        const response =
          await axios.put(
            `${API_URL}/products/${editingProduct.id}`,
            {
              name:
                productForm.name.trim(),

              price:
                Number(
                  productForm.price
                ),

              image_url:
                productForm.image_url &&
                productForm.image_url.trim()
                  ? productForm.image_url.trim()
                  : null,
            }
          );

        if (
          response.data.success
        ) {
          alert(
            "Product updated successfully!"
          );

          setShowProductModal(false);

          setEditingProduct(null);

          await fetchProducts();
        }
      } catch (error) {
        alert(
          error.response?.data?.message ||
            "Failed to update product"
        );
      }
    };

  // ==========================================
  // DELETE PRODUCT
  // ==========================================

  const handleDeleteProduct =
    async (productId) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to delete this product?"
        );

      if (!confirmed) return;

      try {
        const response =
          await axios.delete(
            `${API_URL}/products/${productId}`
          );

        if (
          response.data.success
        ) {
          alert(
            "Product deleted successfully!"
          );

          await fetchProducts();
        }
      } catch (error) {
        alert(
          error.response?.data?.message ||
            "Failed to delete product"
        );
      }
    };

  // ==========================================
  // PRODUCT IMAGE
  // ==========================================

  const getProductImage = (
    product
  ) => {
    const imageType =
      product.image_url?.toLowerCase();

    if (
      imageType === "chicken"
    ) {
      return chickenImage;
    }

    if (
      imageType === "mutton"
    ) {
      return muttonImage;
    }

    if (
      imageType === "beef"
    ) {
      return beefImage;
    }

    if (product.id === 1) {
      return chickenImage;
    }

    if (product.id === 2) {
      return muttonImage;
    }

    return beefImage;
  };

  // ==========================================
  // ADD TO CART
  // ==========================================

  const addToCart = (product) => {
    setCart((previousCart) => {
      const existingItem =
        previousCart.find(
          (item) =>
            item.id === product.id
        );

      if (existingItem) {
        return previousCart.map(
          (item) =>
            item.id === product.id
              ? {
                  ...item,
                  quantity:
                    item.quantity + 1,
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
  };

  // ==========================================
  // QUANTITY
  // ==========================================

  const increaseQuantity = (id) => {
    setCart((previousCart) =>
      previousCart.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity:
                item.quantity + 1,
            }
          : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCart((previousCart) =>
      previousCart
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity:
                  item.quantity - 1,
              }
            : item
        )
        .filter(
          (item) =>
            item.quantity > 0
        )
    );
  };

  const removeItem = (id) => {
    setCart((previousCart) =>
      previousCart.filter(
        (item) => item.id !== id
      )
    );
  };

  // ==========================================
  // TOTAL
  // ==========================================

  const total = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.price) *
        Number(item.quantity),
    0
  );

  const totalItems = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.quantity),
    0
  );

  // ==========================================
  // CUSTOMER INPUT
  // ==========================================

  const handleCustomerChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setCustomer(
      (previousCustomer) => ({
        ...previousCustomer,
        [name]: value,
      })
    );
  };

  // ==========================================
  // PLACE ORDER
  // ==========================================

  const placeOrder = async (
    event
  ) => {
    event.preventDefault();

    if (cart.length === 0) {
      alert(
        "Please add products to your cart."
      );

      navigate("home");

      return;
    }

    if (!customer.name.trim()) {
      alert(
        "Please enter your name."
      );
      return;
    }

    if (!customer.phone.trim()) {
      alert(
        "Please enter your phone number."
      );
      return;
    }

    if (!customer.address.trim()) {
      alert(
        "Please enter your delivery address."
      );
      return;
    }

    try {
      setPlacingOrder(true);

      const response =
        await axios.post(
          `${API_URL}/orders`,
          {
            customer: {
              name:
                customer.name.trim(),

              phone:
                customer.phone.trim(),

              address:
                customer.address.trim(),
            },

            items: cart.map(
              (item) => ({
                id: item.id,
                quantity:
                  item.quantity,
              })
            ),
          }
        );

      if (
        response.data.success
      ) {
        const completedOrder =
          response.data.order;

        setOrderSuccess(
          completedOrder
        );

        localStorage.setItem(
          "pickleCustomerPhone",
          customer.phone.trim()
        );

        setOrderPhone(
          customer.phone.trim()
        );

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
      console.error(error);

      const message =
        error.response?.data?.message ||
        "Failed to place order.";

      alert(message);
    } finally {
      setPlacingOrder(false);
    }
  };

  // ==========================================
  // LOAD MY ORDERS
  // ==========================================

  const loadMyOrders = async () => {
    if (!orderPhone.trim()) {
      alert(
        "Please enter your phone number."
      );

      return;
    }

    try {
      const response =
        await axios.get(
          `${API_URL}/orders/customer/${orderPhone.trim()}`
        );

      setMyOrders(
        response.data.orders
      );
    } catch (error) {
      console.error(error);

      alert(
        "Failed to load your orders."
      );
    }
  };

  // ==========================================
  // UPDATE ORDER STATUS
  // ==========================================

  const updateOrderStatus =
    async (
      orderId,
      newStatus
    ) => {
      if (!isAdmin) {
        alert(
          "Only admin can update order status!"
        );

        return;
      }

      if (!newStatus) return;

      try {
        setUpdatingStatus(true);

        const response =
          await axios.put(
            `${API_URL}/orders/${orderId}/status`,
            {
              order_status:
                newStatus,
            }
          );

        if (
          response.data.success
        ) {
          setAllOrders(
            (prevOrders) =>
              prevOrders.map(
                (order) =>
                  order.id ===
                  orderId
                    ? {
                        ...order,
                        order_status:
                          newStatus,
                      }
                    : order
              )
          );

          setMyOrders(
            (prevOrders) =>
              prevOrders.map(
                (order) =>
                  order.id ===
                  orderId
                    ? {
                        ...order,
                        order_status:
                          newStatus,
                      }
                    : order
              )
          );

          alert(
            `Order status updated to: ${newStatus}`
          );
        }
      } catch (error) {
        alert(
          error.response?.data?.message ||
            "Failed to update order status"
        );
      } finally {
        setUpdatingStatus(false);
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
            Fresh ingredients.
            Traditional recipes.
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

            <h2>
              Our Pickles
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="loading">
            Loading products...
          </div>
        ) : (
          <div className="product-grid">
            {products.map(
              (product) => (
                <div
                  className="product-card"
                  key={product.id}
                >
                  <div className="product-image-box">
                    <img
                      src={getProductImage(
                        product
                      )}
                      alt={
                        product.name
                      }
                    />
                  </div>

                  <div className="product-info">
                    <h3>
                      {product.name}
                    </h3>

                    <p className="price">
                      ₹
                      {Number(
                        product.price
                      ).toFixed(2)}
                    </p>

                    <button
                      className="add-cart-btn"
                      onClick={() =>
                        addToCart(
                          product
                        )
                      }
                    >
                      🛒 Add to Cart
                    </button>
                  </div>
                </div>
              )
            )}
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
      <h2>
        🛒 Shopping Cart
      </h2>

      {cart.length === 0 ? (
        <div className="empty-cart">
          <div className="empty-icon">
            🛒
          </div>

          <h3>
            Your cart is empty
          </h3>

          <p>
            Add your favorite pickles
            to start shopping.
          </p>

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
            {cart.map(
              (item) => (
                <div
                  className="cart-item"
                  key={item.id}
                >
                  <img
                    src={getProductImage(
                      item
                    )}
                    alt={item.name}
                  />

                  <div className="cart-item-info">
                    <h3>
                      {item.name}
                    </h3>

                    <p>
                      ₹
                      {Number(
                        item.price
                      ).toFixed(2)}
                    </p>

                    <div className="quantity-control">
                      <button
                        onClick={() =>
                          decreaseQuantity(
                            item.id
                          )
                        }
                      >
                        −
                      </button>

                      <span>
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          increaseQuantity(
                            item.id
                          )
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
                        Number(
                          item.price
                        ) *
                        Number(
                          item.quantity
                        )
                      ).toFixed(2)}
                    </strong>

                    <button
                      className="remove-btn"
                      onClick={() =>
                        removeItem(
                          item.id
                        )
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )
            )}
          </div>

          <div className="order-summary">
            <h3>
              Order Summary
            </h3>

            <div className="summary-row">
              <span>
                Items
              </span>

              <span>
                {totalItems}
              </span>
            </div>

            <div className="summary-row">
              <span>
                Delivery
              </span>

              <span>
                Free
              </span>
            </div>

            <div className="summary-total">
              <strong>
                Total
              </strong>

              <strong>
                ₹
                {total.toFixed(2)}
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
  // CASH ON DELIVERY ONLY
  // ==========================================

  const renderCheckoutPage = () => {
    if (cart.length === 0) {
      return (
        <section className="page-container">
          <div className="empty-cart">
            <h2>
              Your cart is empty
            </h2>

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
        <h2>
          🔒 Checkout
        </h2>

        <div className="checkout-layout">
          <form
            className="checkout-form"
            onSubmit={placeOrder}
          >
            <div className="checkout-card">
              <h3>
                1. Delivery Address
              </h3>

              <label>
                Full Name
              </label>

              <input
                type="text"
                name="name"
                value={customer.name}
                onChange={
                  handleCustomerChange
                }
                placeholder="Enter your full name"
                required
              />

              <label>
                Phone Number
              </label>

              <input
                type="tel"
                name="phone"
                value={customer.phone}
                onChange={
                  handleCustomerChange
                }
                placeholder="Enter your phone number"
                required
              />

              <label>
                Delivery Address
              </label>

              <textarea
                name="address"
                value={customer.address}
                onChange={
                  handleCustomerChange
                }
                placeholder="House number, street, area, city, PIN code"
                rows="5"
                required
              />
            </div>

            <div className="checkout-card">
              <h3>
                2. Payment Method
              </h3>

              <div className="payment-option">
                💵 Cash on Delivery
              </div>

              <p>
                Pay when your order is
                delivered.
              </p>
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

          <div className="checkout-summary">
            <h3>
              Order Summary
            </h3>

            {cart.map(
              (item) => (
                <div
                  className="mini-item"
                  key={item.id}
                >
                  <span>
                    {item.name}

                    <small>
                      ×
                      {item.quantity}
                    </small>
                  </span>

                  <strong>
                    ₹
                    {(
                      Number(
                        item.price
                      ) *
                      Number(
                        item.quantity
                      )
                    ).toFixed(2)}
                  </strong>
                </div>
              )
            )}

            <div className="summary-total">
              <strong>
                Total
              </strong>

              <strong>
                ₹
                {total.toFixed(2)}
              </strong>
            </div>
          </div>
        </div>
      </section>
    );
  };

  // ==========================================
  // SUCCESS PAGE
  // SHOW COMPLETE ORDER DETAILS
  // ==========================================

  const renderSuccessPage = () => {
    if (!orderSuccess) {
      return (
        <section className="page-container">
          <div className="empty-cart">
            <h2>
              No recent order found
            </h2>

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

    const sendWhatsApp = () => {
      const whatsappNumber =
        "919789123392";

      let message =
        "🌶️ *NEW PICKLE ORDER* 🌶️\n\n";

      message +=
        `*Order Number:* ${orderSuccess.order_number}\n\n`;

      message +=
        "*CUSTOMER DETAILS*\n";

      message +=
        "━━━━━━━━━━━━━━━━━━\n";

      message +=
        `Name: ${orderSuccess.customer.name}\n`;

      message +=
        `Phone: ${orderSuccess.customer.phone}\n`;

      message +=
        `Address: ${orderSuccess.customer.address}\n\n`;

      message +=
        "*ORDERED PRODUCTS*\n";

      message +=
        "━━━━━━━━━━━━━━━━━━\n";

      orderSuccess.items.forEach(
        (item, index) => {
          message +=
            `\n${index + 1}. ${item.productName}\n`;

          message +=
            `Quantity: ${item.quantity}\n`;

          message +=
            `Price: ₹${Number(
              item.price
            ).toFixed(2)}\n`;

          message +=
            `Subtotal: ₹${Number(
              item.subtotal
            ).toFixed(2)}\n`;
        }
      );

      message +=
        "\n━━━━━━━━━━━━━━━━━━\n";

      message +=
        `Payment: Cash on Delivery\n`;

      message +=
        `TOTAL: ₹${Number(
          orderSuccess.total_amount
        ).toFixed(2)}\n`;

      message +=
        "━━━━━━━━━━━━━━━━━━\n";

      window.open(
        `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
          message
        )}`,
        "_blank",
        "noopener,noreferrer"
      );
    };

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
          <p>
            Order Number
          </p>

          <h3>
            {orderSuccess.order_number}
          </h3>

          <p>
            Status:{" "}

            <span className="status-pending">
              {orderSuccess.order_status}
            </span>
          </p>
        </div>

        {/* CUSTOMER DETAILS */}

        <div className="success-order-card">
          <h3>
            👤 Customer Details
          </h3>

          <p>
            <strong>
              Name:
            </strong>{" "}

            {
              orderSuccess.customer
                .name
            }
          </p>

          <p>
            <strong>
              Phone:
            </strong>{" "}

            {
              orderSuccess.customer
                .phone
            }
          </p>

          <p>
            <strong>
              Address:
            </strong>{" "}

            {
              orderSuccess.customer
                .address
            }
          </p>
        </div>

        {/* ORDERED PRODUCTS */}

        <div className="success-order-card">
          <h3>
            🛒 Ordered Products
          </h3>

          {orderSuccess.items.map(
            (item, index) => (
              <div
                className="mini-item"
                key={index}
              >
                <span>
                  <strong>
                    {item.productName}
                  </strong>

                  <br />

                  <small>
                    Quantity:{" "}
                    {item.quantity}
                    {" • "}
                    ₹
                    {Number(
                      item.price
                    ).toFixed(2)}
                    {" each"}
                  </small>
                </span>

                <strong>
                  ₹
                  {Number(
                    item.subtotal
                  ).toFixed(2)}
                </strong>
              </div>
            )
          )}

          <div className="summary-row">
            <strong>
              Payment
            </strong>

            <span>
              💵 Cash on Delivery
            </span>
          </div>

          <div className="summary-total">
            <strong>
              Total Amount
            </strong>

            <strong>
              ₹
              {Number(
                orderSuccess.total_amount
              ).toFixed(2)}
            </strong>
          </div>
        </div>

        <div className="success-buttons">
          <button
            className="whatsapp-order-btn"
            onClick={sendWhatsApp}
          >
            💬 Send Order to WhatsApp
          </button>

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
  // ADMIN LOGIN MODAL
  // ==========================================

  const renderAdminLoginModal =
    () => {
      if (!showAdminLogin) {
        return null;
      }

      return (
        <div
          className="modal-overlay"
          onClick={() =>
            setShowAdminLogin(
              false
            )
          }
        >
          <div
            className="modal-content"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <button
              className="modal-close"
              onClick={() =>
                setShowAdminLogin(
                  false
                )
              }
            >
              ×
            </button>

            <h2>
              🔐 Admin Login
            </h2>

            <form
              onSubmit={
                handleAdminLogin
              }
            >
              <div className="form-group">
                <label>
                  Username
                </label>

                <input
                  type="text"
                  name="username"
                  value={
                    adminCredentials.username
                  }
                  onChange={
                    handleAdminInputChange
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Password
                </label>

                <input
                  type="password"
                  name="password"
                  value={
                    adminCredentials.password
                  }
                  onChange={
                    handleAdminInputChange
                  }
                  required
                />
              </div>

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

  const renderProductFormModal =
    () => {
      if (!showProductModal) {
        return null;
      }

      return (
        <div
          className="modal-overlay"
          onClick={() =>
            setShowProductModal(
              false
            )
          }
        >
          <div
            className="modal-content product-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <button
              className="modal-close"
              onClick={() =>
                setShowProductModal(
                  false
                )
              }
            >
              ×
            </button>

            <h2>
              {isEditing
                ? "✏️ Edit Product"
                : "➕ Add New Product"}
            </h2>

            <form
              onSubmit={
                isEditing
                  ? handleUpdateProduct
                  : handleAddProduct
              }
            >
              <div className="form-group">
                <label>
                  Product Name *
                </label>

                <input
                  type="text"
                  name="name"
                  value={
                    productForm.name
                  }
                  onChange={
                    handleProductFormChange
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Price (₹) *
                </label>

                <input
                  type="number"
                  name="price"
                  value={
                    productForm.price
                  }
                  onChange={
                    handleProductFormChange
                  }
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Image Type
                </label>

                <input
                  type="text"
                  name="image_url"
                  value={
                    productForm.image_url
                  }
                  onChange={
                    handleProductFormChange
                  }
                  placeholder="chicken, mutton or beef"
                />

                <small>
                  Use chicken,
                  mutton or beef
                </small>
              </div>

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

  const renderAdminProductsPage =
    () => {
      if (!isAdmin) {
        return (
          <section className="page-container">
            <div className="admin-access-denied">
              <h2>
                ⛔ Access Denied
              </h2>

              <button
                className="primary-btn"
                onClick={() =>
                  setShowAdminLogin(
                    true
                  )
                }
              >
                Admin Login
              </button>
            </div>
          </section>
        );
      }

      return (
        <section className="page-container">
          <div className="admin-header">
            <h2>
              📦 Manage Products
            </h2>

            <div className="admin-header-buttons">
              <button
                className="add-product-btn"
                onClick={
                  openAddProductModal
                }
              >
                ➕ Add New Product
              </button>

              <button
                className="admin-dashboard-btn"
                onClick={() =>
                  navigate("admin")
                }
              >
                📊 Dashboard
              </button>

              <button
                className="logout-btn"
                onClick={
                  handleAdminLogout
                }
              >
                Logout
              </button>
            </div>
          </div>

          <div className="admin-products-grid">
            {products.map(
              (product) => (
                <div
                  className="admin-product-card"
                  key={product.id}
                >
                  <div className="admin-product-image">
                    <img
                      src={getProductImage(
                        product
                      )}
                      alt={
                        product.name
                      }
                    />
                  </div>

                  <div className="admin-product-info">
                    <h3>
                      {product.name}
                    </h3>

                    <p className="product-price">
                      ₹
                      {Number(
                        product.price
                      ).toFixed(2)}
                    </p>

                    <div className="admin-product-actions">
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
                  </div>
                </div>
              )
            )}
          </div>
        </section>
      );
    };

  // ==========================================
  // ADMIN ORDERS PAGE
  // ==========================================

  const renderAdminOrdersPage =
    () => {
      if (!isAdmin) {
        return (
          <section className="page-container">
            <div className="admin-access-denied">
              <h2>
                ⛔ Access Denied
              </h2>

              <button
                className="primary-btn"
                onClick={() =>
                  setShowAdminLogin(
                    true
                  )
                }
              >
                Admin Login
              </button>
            </div>
          </section>
        );
      }

      return (
        <section className="page-container">
          <div className="admin-header">
            <h2>
              📊 Admin Dashboard
            </h2>

            <div className="admin-header-buttons">
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
                onClick={
                  handleAdminLogout
                }
              >
                Logout
              </button>
            </div>
          </div>

          <div className="admin-stats">
            <div className="stat-card">
              <h3>
                Total Orders
              </h3>

              <p>
                {allOrders.length}
              </p>
            </div>

            <div className="stat-card">
              <h3>
                Pending
              </h3>

              <p>
                {
                  allOrders.filter(
                    (o) =>
                      o.order_status ===
                        "Placed" ||
                      o.order_status ===
                        "Pending"
                  ).length
                }
              </p>
            </div>

            <div className="stat-card">
              <h3>
                Delivered
              </h3>

              <p>
                {
                  allOrders.filter(
                    (o) =>
                      o.order_status ===
                      "Delivered"
                  ).length
                }
              </p>
            </div>

            <div className="stat-card">
              <h3>
                Cancelled
              </h3>

              <p>
                {
                  allOrders.filter(
                    (o) =>
                      o.order_status ===
                      "Cancelled"
                  ).length
                }
              </p>
            </div>
          </div>

          <button
            className="refresh-btn"
            onClick={
              fetchAllOrders
            }
          >
            🔄 Refresh Orders
          </button>

          {allOrders.length > 0 ? (
            <div className="orders-list admin-orders">
              {allOrders.map(
                (order) => (
                  <div
                    className="my-order-card admin-order-card"
                    key={order.id}
                  >
                    <div>
                      <p>
                        Order Number
                      </p>

                      <h3>
                        {
                          order.order_number
                        }
                      </h3>

                      <small>
                        {
                          order.customer_name
                        }
                      </small>

                      <br />

                      <small>
                        📱
                        {" "}
                        {order.phone}
                      </small>
                    </div>

                    <div>
                      <p>
                        Products
                      </p>

                      {order.items?.map(
                        (item) => (
                          <small
                            key={
                              item.id
                            }
                          >
                            {
                              item.product_name
                            }
                            {" × "}
                            {
                              item.quantity
                            }
                            <br />
                          </small>
                        )
                      )}
                    </div>

                    <div>
                      <p>
                        Total Amount
                      </p>

                      <strong>
                        ₹
                        {Number(
                          order.total_amount
                        ).toFixed(2)}
                      </strong>
                    </div>

                    <div>
                      <p>
                        Order Status
                      </p>

                      <select
                        value={
                          order.order_status ||
                          "Placed"
                        }
                        onChange={(e) =>
                          updateOrderStatus(
                            order.id,
                            e.target.value
                          )
                        }
                        disabled={
                          updatingStatus
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
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="orders-empty">
              <p>
                No orders found.
              </p>
            </div>
          )}
        </section>
      );
    };

  // ==========================================
  // MY ORDERS PAGE
  // ==========================================

  const renderOrdersPage = () => (
    <section className="page-container">
      <h2>
        📦 My Orders
      </h2>

      <div className="find-orders">
        <input
          type="tel"
          value={orderPhone}
          onChange={(event) =>
            setOrderPhone(
              event.target.value
            )
          }
          placeholder="Enter your phone number"
        />

        <button
          onClick={
            loadMyOrders
          }
        >
          Find Orders
        </button>
      </div>

      {myOrders.length > 0 ? (
        <div className="orders-list">
          {myOrders.map(
            (order) => (
              <div
                className="my-order-card"
                key={order.id}
              >
                <div>
                  <p>
                    Order Number
                  </p>

                  <h3>
                    {
                      order.order_number
                    }
                  </h3>
                </div>

                <div>
                  <p>
                    Ordered Products
                  </p>

                  {order.items?.map(
                    (item) => (
                      <small
                        key={item.id}
                      >
                        {
                          item.product_name
                        }
                        {" × "}
                        {
                          item.quantity
                        }
                        <br />
                      </small>
                    )
                  )}
                </div>

                <div>
                  <p>
                    Total Amount
                  </p>

                  <strong>
                    ₹
                    {Number(
                      order.total_amount
                    ).toFixed(2)}
                  </strong>
                </div>

                <div>
                  <p>
                    Order Status
                  </p>

                  <span>
                    {
                      order.order_status ||
                      "Placed"
                    }
                  </span>
                </div>

                <div>
                  <p>
                    Payment
                  </p>

                  <span>
                    💵 Cash on Delivery
                  </span>
                </div>
              </div>
            )
          )}
        </div>
      ) : (
        <div className="orders-empty">
          <p>
            Enter your phone number
            to view your orders.
          </p>
        </div>
      )}
    </section>
  );

  // ==========================================
  // CONTACT
  // ==========================================

  const renderContactPage = () => (
    <section className="page-container">
      <div className="contact-card">
        <h2>
          📞 Contact Us
        </h2>

        <p>
          📍 Muthupettai
        </p>

        <p>
          📱 +91 97891 23392
        </p>

        <p>
          ✉️ sanurpickles@gmail.com
        </p>

        <a
          href="https://wa.me/919789123392"
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-link"
        >
          💬 Chat on WhatsApp
        </a>
      </div>
    </section>
  );

  // ==========================================
  // ABOUT
  // ==========================================

  const renderAboutPage = () => (
    <section className="page-container">
      <div className="about-card">
        <h2>
          About Lyrah's SANUR
        </h2>

        <p>
          We prepare delicious
          homemade non-vegetarian
          pickles using traditional
          recipes and quality
          ingredients.
        </p>

        <div className="about-features">
          <div>
            🌶️

            <h3>
              Authentic Taste
            </h3>
          </div>

          <div>
            🥫

            <h3>
              Fresh Ingredients
            </h3>
          </div>

          <div>
            ❤️

            <h3>
              Made with Love
            </h3>
          </div>
        </div>
      </div>
    </section>
  );

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
                Homemade Non-Veg
                Pickles
              </p>
            </div>
          </button>

          <nav className="nav">
            <button
              className={
                activePage === "home"
                  ? "active"
                  : ""
              }
              onClick={() =>
                navigate("home")
              }
            >
              Home
            </button>

            <button
              className={
                activePage === "orders"
                  ? "active"
                  : ""
              }
              onClick={() =>
                navigate("orders")
              }
            >
              My Orders
            </button>

            <button
              className={
                activePage === "admin" ||
                activePage ===
                  "admin-products"
                  ? "active"
                  : ""
              }
              onClick={() =>
                navigate("admin")
              }
            >
              {isAdmin
                ? "👑 Admin"
                : "🔐 Admin"}
            </button>

            <button
              className={
                activePage === "contact"
                  ? "active"
                  : ""
              }
              onClick={() =>
                navigate("contact")
              }
            >
              Contact
            </button>

            <button
              className={
                activePage === "about"
                  ? "active"
                  : ""
              }
              onClick={() =>
                navigate("about")
              }
            >
              About
            </button>

            <button
              className="cart-nav-btn"
              onClick={() =>
                navigate("cart")
              }
            >
              🛒 Cart (
              {totalItems})
            </button>
          </nav>
        </div>
      </header>

      <main>
        {activePage === "home" &&
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
          renderAdminOrdersPage()}

        {activePage ===
          "admin-products" &&
          renderAdminProductsPage()}

        {activePage === "contact" &&
          renderContactPage()}

        {activePage === "about" &&
          renderAboutPage()}
      </main>

      {renderAdminLoginModal()}

      {renderProductFormModal()}

      <footer>
        <p>
          © 2026 Lyrah's SANUR
        </p>

        <p>
          Homemade Pickles ❤️
        </p>
      </footer>
    </div>
  );
}

export default App;