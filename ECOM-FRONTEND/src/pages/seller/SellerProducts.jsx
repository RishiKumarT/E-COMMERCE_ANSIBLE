// src/pages/seller/SellerProducts.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../api/apiClient";
import { useAuth } from "../../auth/AuthContext";

export default function SellerProducts() {
  const { user } = useAuth(); // user contains sellerId
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await apiClient.get(`/products/seller/${user.id}`);
      setProducts(response.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      alert(error.response?.data?.message || "Error fetching products");
    }
    setLoading(false);
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await apiClient.delete(`/products/${id}`);
      setProducts(products.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert(error.response?.data?.message || "Error deleting product");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [user]);

  return (
    <div className="container" style={{ margin: "20px auto", maxWidth: "900px" }}>
      <h2>My Products</h2>
      {/* <Link to="/seller/products/add" style={{ marginBottom: "15px", display: "inline-block" }}>
        <button
          style={{
            padding: "10px",
            borderRadius: "6px",
            backgroundColor: "#4caf50",
            color: "#fff",
            border: "none",
          }}
        >
          Add New Product
        </button>
      </Link> */}

      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Name</th>
              <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Price</th>
              <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Stock</th>
              <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td style={{ padding: "8px" }}>{product.name}</td>
                <td style={{ padding: "8px" }}>${product.price.toFixed(2)}</td>
                <td style={{ padding: "8px" }}>{product.stock}</td>
                <td style={{ padding: "8px", display: "flex", gap: "10px" }}>
                  <Link to={`/seller/products/edit/${product.id}`}>
                    <button
                      style={{
                        padding: "6px",
                        borderRadius: "6px",
                        backgroundColor: "#2196f3",
                        color: "#fff",
                        border: "none",
                      }}
                    >
                      Edit
                    </button>
                  </Link>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    style={{
                      padding: "6px",
                      borderRadius: "6px",
                      backgroundColor: "#f44336",
                      color: "#fff",
                      border: "none",
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
