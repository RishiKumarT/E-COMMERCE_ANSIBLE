import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

export default function NavbarSeller() {
  const { logout } = useAuth();
  return (
    <nav>
      <div>
        <Link to="/seller/dashboard">Seller Dashboard</Link>
      </div>
      <div>
        <Link to="/seller/products">My Products</Link>
        <Link to="/seller/product/add">Add Product</Link>
        <Link to="/profile">Profile</Link>
        <button onClick={logout}>Logout</button>
      </div>
    </nav>
  );
}
