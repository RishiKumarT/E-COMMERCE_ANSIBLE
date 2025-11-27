import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LoadingSpinner, ErrorMessage, EmptyState } from "../../components/UI";
import apiClient from "../../api/apiClient";

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    fetchWishlistItems();
  }, []);

  const fetchWishlistItems = async () => {
    try {
      const response = await apiClient.get("/wishlist");
      setWishlistItems(response.data.products || []);
    } catch (error) {
      console.error("Failed to fetch wishlist items:", error);
      setError("Failed to load wishlist items");
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    setRemoving(true);
    try {
      await apiClient.delete(`/wishlist/remove?productId=${productId}`);
      setWishlistItems((prev) => prev.filter((item) => item.id !== productId));
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
      alert("Failed to remove item from wishlist");
    } finally {
      setRemoving(false);
    }
  };

  const addToCart = async (productId) => {
    try {
      await apiClient.post(`/cart/add?productId=${productId}&quantity=1`);
      alert("Product added to cart successfully!");
    } catch (error) {
      console.error("Failed to add to cart:", error);
      alert("Failed to add product to cart");
    }
  };

  if (loading) {
    return <LoadingSpinner size="large" text="Loading wishlist..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchWishlistItems} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              My Wishlist
            </h1>

            {wishlistItems.length === 0 ? (
              <EmptyState
                title="Your wishlist is empty"
                description="Add products to your wishlist to save them for later"
                action={
                  <Link
                    to="/"
                    className="btn btn-primary"
                  >
                    Browse Products
                  </Link>
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {wishlistItems.map((product) => (
                  <div
                    key={product.id}
                    className="product-card large"
                  >
                    <Link to={`/product/${product.id}`}>
                      <img
                        src={product.imageUrl || "/api/placeholder/300/200"}
                        alt={product.name}
                        className="product-image"
                      />
                    </Link>

                    <div className="product-content">
                      <Link to={`/product/${product.id}`}>
                        <h3 className="product-title">{product.name}</h3>
                      </Link>

                      <p className="product-description">
                        {product.description}
                      </p>

                      <div className="flex justify-between items-center mb-3">
                        <span className="product-price">${product.price}</span>
                        <span className="text-xs text-gray-500">
                          Stock: {product.stockQuantity}
                        </span>
                      </div>

                      <div className="product-actions">
                        <button
                          onClick={() => addToCart(product.id)}
                          className="btn btn-primary"
                        >
                          Add to cart
                        </button>

                        <button
                          onClick={() => removeFromWishlist(product.id)}
                          disabled={removing}
                          className="btn btn-danger"
                        >
                          {removing ? "..." : "Remove"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
