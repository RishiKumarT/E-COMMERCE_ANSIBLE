import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

const NavbarUser = () => {
  const { user, logout } = useAuth();

  return (
    <nav style={styles.nav}>
      <div style={styles.logo}><Link to="/" style={styles.link}>E-Shop</Link></div>
      <div style={styles.links}>
        <span style={styles.user}>Hi, {user.name}</span>
        <Link to="/" style={styles.link}>Home</Link>
        <Link to="/cart" style={styles.link}>Cart</Link>
        <Link to="/wishlist" style={styles.link}>Wishlist</Link>
        <Link to="/orders" style={styles.link}>Orders</Link>
        <Link to="/profile" style={styles.link}>Profile</Link>
        <button onClick={logout} style={styles.button}>Logout</button>
      </div>
    </nav>
  );
};

const styles = {
  nav: { display: "flex", justifyContent: "space-between", padding: "10px 20px", background: "#1976d2", color: "#fff" },
  logo: { fontWeight: "bold", fontSize: "20px" },
  links: { display: "flex", gap: "15px", alignItems: "center" },
  link: { color: "#fff", textDecoration: "none" },
  button: { padding: "5px 10px", cursor: "pointer", border: "none", borderRadius: "4px", background: "#f44336", color: "#fff" },
  user: { fontWeight: "bold" }
};

export default NavbarUser;
