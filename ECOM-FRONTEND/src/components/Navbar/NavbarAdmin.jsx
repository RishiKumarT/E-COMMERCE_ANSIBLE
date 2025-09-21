import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

export default function NavbarAdmin() {
  const { logout } = useAuth();
  return (
    <nav>
      <div>
        <Link to="/admin/dashboard">Admin Dashboard</Link>
      </div>
      <div>
        <Link to="/admin/users">Users</Link>
        <Link to="/admin/sellers">Sellers</Link>
        <Link to="/admin/products">Products</Link>
        <Link to="/admin/orders">Orders</Link>
        <Link to="/profile">Profile</Link>
        <button onClick={logout}>Logout</button>
      </div>
    </nav>
  );
}
