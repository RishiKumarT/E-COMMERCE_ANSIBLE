// src/pages/user/Orders.jsx
import { useEffect, useState } from "react";
import apiClient from "../../api/apiClient";
import { useAuth } from "../../auth/AuthContext";
//import Loader from "../../components/Loader";

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/orders/${user.id}`);
      setOrders(response.data);
    } catch (error) {
      console.error(error);
      alert("Error fetching orders");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [user.id]);

  if (loading) return <Loader />;
  if (!orders.length) return <div className="container text-center mt-10"><h2>No orders yet</h2></div>;

  return (
    <div className="container max-w-5xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Your Orders</h2>
      <div className="grid gap-4">
        {orders.map((order) => (
          <div key={order.id} className="p-4 border rounded shadow bg-white">
            <p><strong>Order ID:</strong> {order.id}</p>
            <p><strong>Date:</strong> {new Date(order.date).toLocaleDateString()}</p>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Total:</strong> ${order.totalAmount.toFixed(2)}</p>
            <ul className="mt-2 list-disc list-inside">
              {order.items.map((item) => (
                <li key={item.id}>{item.product.name} x {item.quantity}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

// // src/pages/user/Orders.jsx
// import { useEffect, useState } from "react";
// import apiClient from "../../api/apiClient";
// import { useAuth } from "../../auth/AuthContext";
// import Loader from "../../components/Loader";

// export default function Orders() {
//   const { user } = useAuth();
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const fetchOrders = async () => {
//       setLoading(true);
//       try {
//         const response = await apiClient.get(`/orders/${user.id}`);
//         setOrders(response.data);
//       } catch (error) {
//         console.error(error);
//         alert("Error fetching orders");
//       }
//       setLoading(false);
//     };
//     fetchOrders();
//   }, [user.id]);

//   if (loading) return <Loader />;

//   if (!orders.length) return <div className="container"><h2>No orders yet</h2></div>;

//   return (
//     <div className="container">
//       <h2>Your Orders</h2>
//       <div style={{ display: "grid", gap: "15px" }}>
//         {orders.map((order) => (
//           <div key={order.id} style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "10px" }}>
//             <p><strong>Order ID:</strong> {order.id}</p>
//             <p><strong>Date:</strong> {new Date(order.date).toLocaleDateString()}</p>
//             <p><strong>Status:</strong> {order.status}</p>
//             <p><strong>Total:</strong> ${order.totalAmount.toFixed(2)}</p>
//             <ul>
//               {order.items.map((item) => (
//                 <li key={item.id}>{item.product.name} x {item.quantity}</li>
//               ))}
//             </ul>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
