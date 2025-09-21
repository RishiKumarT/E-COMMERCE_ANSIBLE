// src/pages/public/ProductDetails.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";
import { useAuth } from "../../auth/AuthContext";
import Loader from "../../components/Loader";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await apiClient.get(`/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error("Failed to fetch product:", error);
        alert("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) return navigate("/login");
    try {
      await apiClient.post(`/cart/add?productId=${product.id}&quantity=1`);
      alert("Product added to cart");
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleAddToWishlist = async () => {
    if (!user) return navigate("/login");
    try {
      await apiClient.post(`/wishlist/add?productId=${product.id}`);
      alert("Product added to wishlist");
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  if (loading) return <Loader />;
  if (!product) return <div className="container text-center mt-10">Product not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow mt-6">
      <div className="flex flex-col md:flex-row gap-6">
        <img
          src={product.imageUrl || "https://via.placeholder.com/300"}
          alt={product.name}
          className="w-full md:w-1/2 h-64 md:h-80 object-cover rounded"
        />
        <div className="flex-1 flex flex-col gap-4">
          <h2 className="text-2xl font-bold">{product.name}</h2>
          <p className="text-gray-700">{product.description}</p>
          <p className="text-xl font-semibold">${product.price.toFixed(2)}</p>
          <div className="flex gap-3 mt-auto">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
            >
              Add to Cart
            </button>
            <button
              onClick={handleAddToWishlist}
              className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
            >
              Add to Wishlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// // src/pages/public/ProductDetails.jsx
// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import apiClient from "../../api/apiClient";
// import ProductCard from "../../components/ProductCard";

// export default function ProductDetails() {
//   const { id } = useParams();
//   const [product, setProduct] = useState(null);

//   useEffect(() => {
//     const fetchProduct = async () => {
//       try {
//         const response = await apiClient.get(`/products/${id}`);
//         setProduct(response.data);
//       } catch (error) {
//         console.error("Failed to fetch product:", error);
//       }
//     };
//     fetchProduct();
//   }, [id]);

//   if (!product) return <div className="container">Loading...</div>;

//   return (
//     <div className="container">
//       <h2>{product.name}</h2>
//       <div style={{ display: "flex", gap: "20px" }}>
//         {product.image && <img src={product.image} alt={product.name} style={{ width: "300px", borderRadius: "10px" }} />}
//         <div>
//           <p><strong>Price:</strong> ${product.price.toFixed(2)}</p>
//           <p>{product.description}</p>
//           <button>Add to Cart</button>
//           <button style={{ marginLeft: "10px" }}>Add to Wishlist</button>
//         </div>
//       </div>
//     </div>
//   );
// }
