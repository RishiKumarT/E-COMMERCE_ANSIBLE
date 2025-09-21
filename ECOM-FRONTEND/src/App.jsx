import { Routes, Route } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import PrivateRoute from "./auth/PrivateRoute";

import NavbarPublic from "./components/Navbar/NavbarPublic";
import NavbarUser from "./components/Navbar/NavbarUser";
import NavbarSeller from "./components/Navbar/NavbarSeller";
import NavbarAdmin from "./components/Navbar/NavbarAdmin";
import SellerDashboard from "./pages/seller/SellerDashboard";
import SellerProducts from "./pages/seller/SellerProducts";
import AddEditProduct from "./pages/seller/AddEditProduct";
import Home from "./pages/public/Home";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import Profile from "./pages/user/Profile"; // reuse Profile page for all roles
import Cart from "./pages/user/Cart";

function App() {
  const { user } = useAuth();

  const renderNavbar = () => {
    if (!user) return <NavbarPublic />;
    if (user.role === "USER") return <NavbarUser />;
    if (user.role === "SELLER") return <NavbarSeller />;
    if (user.role === "ADMIN") return <NavbarAdmin />;
  };

  return (
    <>
      {renderNavbar()}
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
  path="/seller/dashboard"
  element={
    <PrivateRoute allowedRoles={["SELLER"]}>
      <SellerDashboard />
    </PrivateRoute>
  }
/>
<Route
  path="/seller/products"
  element={
    <PrivateRoute allowedRoles={["SELLER"]}>
      <SellerProducts />
    </PrivateRoute>
  }
/>
<Route
  path="/cart"
  element={
    <PrivateRoute allowedRoles={["USE"]}>
      <Cart />
    </PrivateRoute>
  }
/>
<Route
  path="/seller/product/add"
  element={
    <PrivateRoute allowedRoles={["SELLER"]}>
      <AddEditProduct />
    </PrivateRoute>
  }
/>
<Route
          path="seller/products/edit/:id"
          element={
            <PrivateRoute allowedRoles={["SELLER"]}>
              <AddEditProduct />
            </PrivateRoute>
          }
        />

        {/* Profile accessible for all logged-in roles */}
        <Route
          path="/profile"
          element={
            <PrivateRoute allowedRoles={["USER", "SELLER", "ADMIN"]}>
              <Profile />
            </PrivateRoute>
          }
        />
        
      </Routes>
    </>
  );
}

export default App;
