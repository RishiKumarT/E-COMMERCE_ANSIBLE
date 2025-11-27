import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner, ErrorMessage, EmptyState } from "../../components/UI";
import apiClient from "../../api/apiClient";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const response = await apiClient.get("/cart");
      setCartItems(response.data.items || []);
    } catch (error) {
      console.error("Failed to fetch cart items:", error);
      setError("Failed to load cart items");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      await removeItem(cartItemId);
      return;
    }

    setUpdating(true);
    try {
      await apiClient.delete(`/cart/remove/${cartItemId}`);
      const cartItem = cartItems.find((item) => item.id === cartItemId);
      await apiClient.post(
        `/cart/add?productId=${cartItem.product.id}&quantity=${newQuantity}`
      );
      await fetchCartItems();
    } catch (error) {
      console.error("Failed to update quantity:", error);
      alert("Failed to update quantity");
    } finally {
      setUpdating(false);
    }
  };

  const removeItem = async (cartItemId) => {
    setUpdating(true);
    try {
      await apiClient.delete(`/cart/remove/${cartItemId}`);
      setCartItems(cartItems.filter((item) => item.id !== cartItemId));
    } catch (error) {
      console.error("Failed to remove item:", error);
      alert("Failed to remove item");
    } finally {
      setUpdating(false);
    }
  };

  const clearCart = async () => {
    if (!window.confirm("Are you sure you want to clear your cart?")) return;

    setUpdating(true);
    try {
      await apiClient.delete("/cart/clear");
      setCartItems([]);
    } catch (error) {
      console.error("Failed to clear cart:", error);
      alert("Failed to clear cart");
    } finally {
      setUpdating(false);
    }
  };

  const placeOrder = async () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }

    setUpdating(true);
    try {
      await apiClient.post("/orders/place");
      alert("Order placed successfully!");
      setCartItems([]);
      navigate("/orders");
    } catch (error) {
      console.error("Failed to place order:", error);
      alert("Failed to place order");
    } finally {
      setUpdating(false);
    }
  };

  const calculateTotal = () =>
    cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );

  if (loading) {
    return <LoadingSpinner size="large" text="Loading cart..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchCartItems} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="card shadow-md rounded-xl">
          <div className="card-body">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-primary">
                Shopping Cart
              </h1>

              {cartItems.length > 0 && (
                <button
                  onClick={clearCart}
                  disabled={updating}
                  className="btn btn-danger btn-sm"
                >
                  Clear Cart
                </button>
              )}
            </div>

            {/* Empty Cart */}
            {cartItems.length === 0 ? (
              <EmptyState
                title="Your cart is empty"
                description="Add some products to your cart"
                action={
                  <button
                    onClick={() => navigate("/")}
                    className="btn btn-primary"
                  >
                    Continue Shopping
                  </button>
                }
              />
            ) : (
              <div className="space-y-6">
                {/* Cart Items */}
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 rounded-lg border shadow-sm bg-white"
                  >
                    {/* Product Image */}
                    <img
                      src={
                        item.product.imageUrl || "/api/placeholder/100/100"
                      }
                      alt={item.product.name}
                      className="w-20 h-20 object-contain rounded-lg shadow-sm bg-surface"
                    />

                    {/* Details */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-primary text-lg">
                        {item.product.name}
                      </h3>
                      <p className="text-secondary">
                        ${item.product.price.toFixed(2)}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={updating}
                        className="btn btn-secondary btn-sm rounded-lg"
                        style={{ width: "32px" }}
                      >
                        –
                      </button>

                      <span className="px-3 py-1 rounded-lg border bg-white text-primary font-medium shadow-sm">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={updating}
                        className="btn btn-secondary btn-sm rounded-lg"
                        style={{ width: "32px" }}
                      >
                        +
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-primary font-semibold text-lg">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={updating}
                      className="btn btn-danger btn-sm rounded-lg"
                    >
                      Remove
                    </button>
                  </div>
                ))}

                {/* Total + Checkout */}
                <div className="border-t pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-bold text-primary">
                      Total:
                    </span>
                    <span className="text-xl font-bold text-primary">
                      ${calculateTotal().toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={placeOrder}
                    disabled={updating}
                    className="btn btn-primary w-full btn-lg rounded-xl shadow-md"
                  >
                    {updating ? "Processing…" : "Place Order"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
