// src/ProductCard.jsx
import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  return (
    <div style={{
      border: "1px solid #e0e0e0",
      borderRadius: "8px",
      padding: "15px",
      textAlign: "center",
      boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
      transition: "transform 0.2s",
    }}
    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
    >
      <img src={product.imageUrl} alt={product.name} style={{ maxHeight: "150px", objectFit: "contain", marginBottom: "10px" }} />
      <h3 style={{ fontSize: "1rem", margin: "5px 0" }}>{product.name}</h3>
      <p style={{ color: "#4caf50", fontWeight: "bold" }}>${product.price.toFixed(2)}</p>
      <Link to={`/product/${product.id}`}>
        <button style={{
          marginTop: "10px",
          padding: "8px 12px",
          backgroundColor: "#2196f3",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer"
        }}>View Details</button>
      </Link>
    </div>
  );
}
