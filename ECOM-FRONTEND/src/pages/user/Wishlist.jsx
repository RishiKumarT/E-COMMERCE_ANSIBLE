// src/pages/user/Wishlist.jsx
import { useEffect, useState } from "react";
import apiClient from "../../api/apiClient";
import { useAuth } from "../../auth/AuthContext";
import ProductCard from "../../components/ProductCard";
//import Loader from "../../components/Loader";

export default function Wishlist() {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/wishlist/${user.id}`);
      setWishlist(response.data);
    } catch (error) {
      console.error(error);
      alert("Error fetching wishlist");
    }
    setLoading(false);
  };

  const removeItem = async (itemId) => {
    try {
      const response = await apiClient.delete(`/wishlist/${user.id}/item/${itemId}`);
      setWishlist(response.data);
    } catch (error) {
      console.error(error);
      alert("Error removing item");
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  if (loading) return <Loader />;
  if (!wishlist.length)
    return <div className="container text-center mt-10"><h2>Your wishlist is empty</h2></div>;

  return (
    <div className="container max-w-5xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Your Wishlist</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.map((item) => (
          <div key={item.id} className="relative">
            <ProductCard product={item.product} />
            <button
              onClick={() => removeItem(item.id)}
              className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

     // src/pages/user/Wishlist.jsx
// import { useEffect, useState } from "react";
// import apiClient from "../../api/apiClient";
// import { useAuth } from "../../auth/AuthContext";
// import ProductCard from "../../components/ProductCard";
// import Loader from "../../components/Loader";

// export default function Wishlist() {
//   const { user } = useAuth();
//   const [wishlist, setWishlist] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const fetchWishlist = async () => {
//     setLoading(true);
//     try {
//       const response = await apiClient.get(`/wishlist/${user.id}`);
//       setWishlist(response.data);
//     } catch (error) {
//       console.error(error);
//       alert("Error fetching wishlist");
//     }
//     setLoading(false);
//   };

//   const removeItem = async (itemId) => {
//     try {
//       const response = await apiClient.delete(`/wishlist/${user.id}/item/${itemId}`);
//       setWishlist(response.data);
//     } catch (error) {
//       console.error(error);
//       alert("Error removing item");
//     }
//   };

//   useEffect(() => {
//     fetchWishlist();
//   }, []);

//   if (loading) return <Loader />;

//   if (!wishlist.length) return <div className="container"><h2>Your wishlist is empty</h2></div>;

//   return (
//     <div className="container">
//       <h2>Your Wishlist</h2>
//       <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "20px" }}>
//         {wishlist.map((item) => (
//           <div key={item.id} style={{ position: "relative" }}>
//             <ProductCard product={item.product} />
//             <button onClick={() => removeItem(item.id)} style={{ position: "absolute", top: "5px", right: "5px" }}>Remove</button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
