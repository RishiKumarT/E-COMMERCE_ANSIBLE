import { useEffect, useState } from "react";
import apiClient from "../../api/apiClient";
import { useAuth } from "../../auth/AuthContext";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await apiClient.get("/products");
        setProducts(response.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = async (productId) => {
    if (!user) {
      alert("Please login to add items to cart");
      navigate("/login");
      return;
    }
    try {
      await apiClient.post(`/cart/add?productId=${productId}&quantity=1`);
      alert("Product added to cart");
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleAddToWishlist = async (productId) => {
    if (!user) {
      alert("Please login to add items to wishlist");
      navigate("/login");
      return;
    }
    try {
      await apiClient.post(`/wishlist/add?productId=${productId}`);
      alert("Product added to wishlist");
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading products...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">All Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="border rounded shadow p-4 flex flex-col justify-between"
          >
            <img
              src={product.imageUrl || "https://via.placeholder.com/150"}
              alt={product.name}
              className="h-40 w-full object-cover mb-4 rounded"
            />
            <h2 className="text-lg font-semibold">{product.name}</h2>
            <p className="text-gray-700 mb-2">{product.description}</p>
            <p className="font-bold mb-2">${product.price.toFixed(2)}</p>
            <div className="flex gap-2 mt-auto">
              <button
                onClick={() => handleAddToCart(product.id)}
                className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
              >
                Add to Cart
              </button>
              <button
                onClick={() => handleAddToWishlist(product.id)}
                className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
              >
                Wishlist
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
