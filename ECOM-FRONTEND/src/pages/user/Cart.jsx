// src/pages/user/Cart.jsx
import { useEffect, useState } from "react";
import apiClient from "../../api/apiClient";
import { useAuth } from "../../auth/AuthContext";
//import Loader from "../../components/Loader";
import ProductCard from "../../components/ProductCard";

export default function Cart() {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/cart/${user.id}`);
      setCart(response.data);
    } catch (error) {
      console.error(error);
      alert("Error fetching cart");
    }
    setLoading(false);
  };

  const removeItem = async (itemId) => {
    try {
      const response = await apiClient.delete(`/cart/${user.id}/item/${itemId}`);
      setCart(response.data);
    } catch (error) {
      console.error(error);
      alert("Error removing item");
    }
  };

  const clearCart = async () => {
    if (!window.confirm("Are you sure you want to clear your cart?")) return;
    try {
      const response = await apiClient.delete(`/cart/${user.id}/clear`);
      setCart(response.data);
    } catch (error) {
      console.error(error);
      alert("Error clearing cart");
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  if (loading) return <Loader />;
  if (!cart || cart.items.length === 0)
    return <div className="container text-center mt-10"><h2>Your cart is empty</h2></div>;

  return (
    <div className="container max-w-5xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
      <button
        onClick={clearCart}
        className="mb-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Clear Cart
      </button>
      <div className="grid gap-4">
        {cart.items.map((item) => (
          <div key={item.id} className="flex flex-col md:flex-row gap-4 p-4 border rounded shadow items-center">
            <ProductCard product={item.product} minimal />
            <div className="flex-1 flex flex-col gap-2">
              <p>Quantity: {item.quantity}</p>
              <p className="font-semibold">Price: ${(item.product.price * item.quantity).toFixed(2)}</p>
              <button
                onClick={() => removeItem(item.id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 w-max"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <h3 className="text-xl font-bold mt-4">Total: ${cart.totalAmount.toFixed(2)}</h3>
      <button className="mt-3 px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600">Proceed to Checkout</button>
    </div>
  );
}
// // src/pages/user/Cart.jsx
// import { useEffect, useState } from "react";
// import apiClient from "../../api/apiClient";
// import { useAuth } from "../../auth/AuthContext";
// import ProductCard from "../../components/ProductCard";
// import Loader from "../../components/Loader";

// export default function Cart() {
//   const { user } = useAuth();
//   const [cart, setCart] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const fetchCart = async () => {
//     setLoading(true);
//     try {
//       const response = await apiClient.get(`/cart/${user.id}`);
//       setCart(response.data);
//     } catch (error) {
//       console.error(error);
//       alert("Error fetching cart");
//     }
//     setLoading(false);
//   };

//   const removeItem = async (itemId) => {
//     try {
//       const response = await apiClient.delete(`/cart/${user.id}/item/${itemId}`);
//       setCart(response.data);
//     } catch (error) {
//       console.error(error);
//       alert("Error removing item");
//     }
//   };

//   const clearCart = async () => {
//     if (!window.confirm("Are you sure you want to clear your cart?")) return;
//     try {
//       const response = await apiClient.delete(`/cart/${user.id}/clear`);
//       setCart(response.data);
//     } catch (error) {
//       console.error(error);
//       alert("Error clearing cart");
//     }
//   };

//   useEffect(() => {
//     fetchCart();
//   }, []);

//   if (loading) return <Loader />;

//   if (!cart || cart.items.length === 0) return <div className="container"><h2>Your cart is empty</h2></div>;

//   return (
//     <div className="container">
//       <h2>Your Cart</h2>
//       <button onClick={clearCart} className="btn">Clear Cart</button>
//       <div style={{ display: "grid", gap: "15px", marginTop: "15px" }}>
//         {cart.items.map((item) => (
//           <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "15px", border: "1px solid #ccc", borderRadius: "8px", padding: "10px" }}>
//             <ProductCard product={item.product} minimal />
//             <div>
//               <p>Quantity: {item.quantity}</p>
//               <p>Price: ${(item.product.price * item.quantity).toFixed(2)}</p>
//               <button onClick={() => removeItem(item.id)} className="btn btn-danger">Remove</button>
//             </div>
//           </div>
//         ))}
//       </div>
//       <h3>Total: ${cart.totalAmount.toFixed(2)}</h3>
//       <button className="btn" style={{ marginTop: "10px" }}>Proceed to Checkout</button>
//     </div>
//   );
// }
