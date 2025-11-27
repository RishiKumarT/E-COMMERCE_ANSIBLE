import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { LoadingSpinner, ErrorMessage, SuccessMessage } from '../../components/UI';
import apiClient from '../../api/apiClient';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProduct();
    if (user) {
      checkWishlist();
    }
  }, [id, user]);

  const fetchProduct = async () => {
    try {
      const response = await apiClient.get(`/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Failed to fetch product:', error);
      setError('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const checkWishlist = async () => {
    try {
      const response = await apiClient.get('/wishlist');
      const wishlistItems = response.data.map(item => item.product.id);
      setIsInWishlist(wishlistItems.includes(parseInt(id)));
    } catch (error) {
      console.error('Failed to check wishlist:', error);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setAddingToCart(true);
    try {
      await apiClient.post(`/cart/add?productId=${id}&quantity=${quantity}`);
      setSuccess('Product added to cart successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add product to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setAddingToWishlist(true);
    try {
      if (isInWishlist) {
        await apiClient.delete(`/wishlist/remove?productId=${id}`);
        setIsInWishlist(false);
        setSuccess('Product removed from wishlist!');
      } else {
        await apiClient.post(`/wishlist/add?productId=${id}`);
        setIsInWishlist(true);
        setSuccess('Product added to wishlist!');
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to update wishlist:', error);
      alert('Failed to update wishlist');
    } finally {
      setAddingToWishlist(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="large" text="Loading product..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchProduct} />;
  }

  if (!product) {
    return <ErrorMessage message="Product not found" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Image */}
            <div className="flex justify-center items-center">
  <img
    src={product.imageUrl || '/api/placeholder/600/400'}
    alt={product.name}
    className="w-80 h-80 object-contain rounded-lg shadow-md bg-white p-4"
  />
</div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <p className="text-lg text-gray-600 mb-4">{product.description}</p>
                <div className="flex items-center space-x-4 mb-4">
                  <span className="text-3xl font-bold text-blue-600">${product.price}</span>
                  <span className={`px-2 py-1 text-sm font-semibold rounded-full ${
                    product.stockQuantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  <p>Category: {product.category?.name || 'No Category'}</p>
                  <p>Seller: {product.seller?.name || 'Unknown'}</p>
                  <p>Stock: {product.stockQuantity} units</p>
                </div>
              </div>

              {success && <SuccessMessage message={success} />}

              {product.stockQuantity > 0 && (
                <div className="space-y-4">
                 <div className="quantity-wrapper" style={{
  display: "flex",
  alignItems: "center",
  gap: "0.75rem"
}}>
  <span className="text-sm font-medium text-gray-700">Quantity:</span>

  <div className="quantity-box">
    <button
      className="quantity-btn"
      onClick={() => setQuantity(Math.max(1, quantity - 1))}
    >
      −
    </button>

    <input
      type="number"
      value={quantity}
      onChange={(e) =>
        setQuantity(Math.max(1, parseInt(e.target.value) || 1))
      }
      className="quantity-input"
      min="1"
      max={product.stockQuantity}
    />

    <button
      className="quantity-btn"
      onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
    >
      +
    </button>
  </div>
</div>



<div className="flex items-center gap-3 mt-4">

{/* Add to Cart */}
<button
  onClick={handleAddToCart}
  disabled={addingToCart}
  className="btn btn-primary"
  style={{ borderRadius: "var(--radius-lg)" }}
>
  {addingToCart ? "Adding..." : "Add to Cart"}
</button>

{/* Wishlist */}
<button
  onClick={handleAddToWishlist}
  disabled={addingToWishlist}
  className={`btn ${isInWishlist ? "btn-danger" : "btn-secondary"}`}
  style={{ borderRadius: "var(--radius-lg)" }}
>
  {addingToWishlist
    ? "Updating..."
    : isInWishlist
    ? "❤️ Remove"
    : "🤍 Wishlist"}
</button>
</div>


                </div>
              )}

              {product.stockQuantity === 0 && (
                <div className="bg-gray-100 p-4 rounded-md">
                  <p className="text-gray-600">This product is currently out of stock.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;


// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useAuth } from "../../auth/AuthContext";
// import {
//   LoadingSpinner,
//   ErrorMessage,
//   SuccessMessage,
// } from "../../components/UI";
// import apiClient from "../../api/apiClient";

// const ProductDetail = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { user } = useAuth();

//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [quantity, setQuantity] = useState(1);
//   const [addingToCart, setAddingToCart] = useState(false);
//   const [addingToWishlist, setAddingToWishlist] = useState(false);
//   const [isInWishlist, setIsInWishlist] = useState(false);
//   const [success, setSuccess] = useState("");

//   useEffect(() => {
//     fetchProduct();
//     if (user) {
//       checkWishlist();
//     }
//   }, [id, user]);

//   const fetchProduct = async () => {
//     try {
//       const response = await apiClient.get(`/products/${id}`);
//       setProduct(response.data);
//     } catch (error) {
//       console.error("Failed to fetch product:", error);
//       setError("Failed to load product details");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const checkWishlist = async () => {
//     try {
//       const response = await apiClient.get("/wishlist");
//       const wishlistItems = response.data.map((item) => item.product.id);
//       setIsInWishlist(wishlistItems.includes(parseInt(id)));
//     } catch (error) {
//       console.error("Failed to check wishlist:", error);
//     }
//   };

//   const handleAddToCart = async () => {
//     if (!user) {
//       navigate("/login");
//       return;
//     }

//     setAddingToCart(true);
//     try {
//       await apiClient.post(`/cart/add?productId=${id}&quantity=${quantity}`);
//       setSuccess("Product added to cart!");
//       setTimeout(() => setSuccess(""), 3000);
//     } catch (error) {
//       console.error("Failed to add to cart:", error);
//       alert("Failed to add product to cart");
//     } finally {
//       setAddingToCart(false);
//     }
//   };

//   const handleAddToWishlist = async () => {
//     if (!user) {
//       navigate("/login");
//       return;
//     }

//     setAddingToWishlist(true);
//     try {
//       if (isInWishlist) {
//         await apiClient.delete(`/wishlist/remove?productId=${id}`);
//         setIsInWishlist(false);
//         setSuccess("Removed from Wishlist");
//       } else {
//         await apiClient.post(`/wishlist/add?productId=${id}`);
//         setIsInWishlist(true);
//         setSuccess("Added to Wishlist");
//       }
//       setTimeout(() => setSuccess(""), 3000);
//     } catch (error) {
//       console.error("Failed to update wishlist:", error);
//       alert("Failed to update wishlist");
//     } finally {
//       setAddingToWishlist(false);
//     }
//   };

//   if (loading) return <LoadingSpinner size="large" text="Loading product..." />;
//   if (error) return <ErrorMessage message={error} onRetry={fetchProduct} />;
//   if (!product) return <ErrorMessage message="Product not found" />;

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="bg-white shadow rounded-lg overflow-hidden card">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">

//             {/* IMAGE */}
//             <div className="flex justify-center items-center">
//               <img
//                 src={product.imageUrl || "/api/placeholder/400/400"}
//                 alt={product.name}
//                 className="w-72 h-72 object-contain rounded-lg bg-white p-4 shadow-sm border border-gray-100"
//                 style={{ borderRadius: "var(--radius-lg)" }}
//               />
//             </div>

//             {/* DETAILS */}
//             <div className="space-y-6">
//               <div>
//                 <h1 className="text-3xl font-bold text-gray-900 mb-2">
//                   {product.name}
//                 </h1>

//                 <p className="text-gray-600 text-base mb-4">
//                   {product.description}
//                 </p>

//                 <div className="flex items-center gap-4 mb-4">
//                   <span className="text-3xl font-bold text-blue-600">
//                     ${product.price}
//                   </span>

//                   <span
//                     className={`px-3 py-1 text-sm font-semibold rounded-full ${
//                       product.stockQuantity > 0
//                         ? "bg-green-100 text-green-700"
//                         : "bg-red-100 text-red-700"
//                     }`}
//                   >
//                     {product.stockQuantity > 0
//                       ? "In Stock"
//                       : "Out of Stock"}
//                   </span>
//                 </div>

//                 <div className="text-sm text-gray-500">
//                   <p>Category: {product.category?.name || "N/A"}</p>
//                   <p>Seller: {product.seller?.name || "Unknown"}</p>
//                   <p>Stock: {product.stockQuantity} units</p>
//                 </div>
//               </div>

//               {success && <SuccessMessage message={success} />}

//               {product.stockQuantity > 0 && (
//                 <>
//                   {/* QUANTITY */}
//                   <div className="flex items-center gap-4">
//                     <span className="text-sm font-medium text-gray-700">
//                       Quantity:
//                     </span>

//                     <div
//                       className="flex items-center border border-gray-300 bg-white rounded-lg"
//                       style={{ height: "40px" }}
//                     >
//                       <button
//                         className="px-3 text-lg font-bold text-gray-600 hover:bg-gray-100"
//                         onClick={() =>
//                           setQuantity(Math.max(1, quantity - 1))
//                         }
//                       >
//                         −
//                       </button>

//                       <input
//                         type="number"
//                         value={quantity}
//                         onChange={(e) =>
//                           setQuantity(
//                             Math.max(1, parseInt(e.target.value) || 1)
//                           )
//                         }
//                         className="w-12 text-center border-l border-r border-gray-200 outline-none"
//                       />

//                       <button
//                         className="px-3 text-lg font-bold text-gray-600 hover:bg-gray-100"
//                         onClick={() =>
//                           setQuantity(
//                             Math.min(product.stockQuantity, quantity + 1)
//                           )
//                         }
//                       >
//                         +
//                       </button>
//                     </div>
//                   </div>

//                   {/* BUTTONS */}
//                   <div className="flex items-center gap-3 mt-4">
//                     <button
//                       onClick={handleAddToCart}
//                       disabled={addingToCart}
//                       className="btn btn-primary"
//                       style={{ borderRadius: "var(--radius-lg)" }}
//                     >
//                       {addingToCart ? "Adding..." : "Add to Cart"}
//                     </button>

//                     <button
//                       onClick={handleAddToWishlist}
//                       disabled={addingToWishlist}
//                       className={`btn ${
//                         isInWishlist ? "btn-danger" : "btn-secondary"
//                       }`}
//                       style={{ borderRadius: "var(--radius-lg)" }}
//                     >
//                       {addingToWishlist
//                         ? "Updating..."
//                         : isInWishlist
//                         ? "❤️ Remove"
//                         : "🤍 Wishlist"}
//                     </button>
//                   </div>
//                 </>
//               )}

//               {product.stockQuantity === 0 && (
//                 <div className="bg-gray-100 p-4 rounded-md">
//                   <p className="text-gray-600">
//                     This product is currently out of stock.
//                   </p>
//                 </div>
//               )}
//             </div>

//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProductDetail;
