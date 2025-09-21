// src/pages/seller/AddEditProduct.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";
import { useAuth } from "../../auth/AuthContext";

export default function AddEditProduct() {
  const { id } = useParams(); // product id for edit
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    imageUrl: "",
    categoryId: ""
  });
  const [loading, setLoading] = useState(false);

  // Fetch product details if editing
  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          const response = await apiClient.get(`/products/${id}`);
          const p = response.data;

          setFormData({
            name: p.name || "",
            description: p.description || "",
            price: p.price != null ? p.price.toString() : "",
            stock: p.stock != null ? p.stock.toString() : "",
            imageUrl: p.imageUrl || "",
            categoryId: p.category?.id != null ? p.category.id.toString() : ""
          });
        } catch (error) {
          console.error("Failed to fetch product:", error);
          alert("Error fetching product details");
        }
      };
      fetchProduct();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const submitData = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      categoryId: parseInt(formData.categoryId)
    };

    try {
      if (id) {
        // Update product
        await apiClient.put(`/products/${id}?categoryId=${submitData.categoryId}`, submitData);
        alert("Product updated successfully");
      } else {
        // Add new product
        await apiClient.post(`/products/add?categoryId=${submitData.categoryId}`, {
          ...submitData,
          sellerId: user.id
        });
        alert("Product added successfully");
      }
      navigate("/seller/products");
    } catch (error) {
      console.error("Error saving product:", error);
      alert(error.response?.data?.message || "Error saving product");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "650px", margin: "30px auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        {id ? "Edit Product" : "Add Product"}
      </h2>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          background: "#fff",
          padding: "25px",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        }}
      >
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Product Name"
            style={inputStyle}
          />
        </label>

        <label>
          Description:
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Product Description"
            style={{ ...inputStyle, height: "80px" }}
          />
        </label>

        <label>
          Price:
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            placeholder="0.00"
            style={inputStyle}
          />
        </label>

        <label>
          Stock:
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            required
            placeholder="0"
            style={inputStyle}
          />
        </label>

        <label>
          Image URL:
          <input
            type="text"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            required
            placeholder="https://example.com/image.jpg"
            style={inputStyle}
          />
        </label>

        <label>
          Category ID:
          <input
            type="number"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            required
            placeholder="1"
            style={inputStyle}
          />
        </label>

        <button type="submit" style={buttonStyle} disabled={loading}>
          {loading ? "Saving..." : id ? "Update Product" : "Add Product"}
        </button>
      </form>
    </div>
  );
}

// Styles
const inputStyle = {
  width: "100%",
  padding: "10px",
  marginTop: "5px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  outline: "none",
  fontSize: "14px"
};

const buttonStyle = {
  padding: "12px",
  backgroundColor: "#4caf50",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  fontSize: "16px",
  cursor: "pointer"
};
