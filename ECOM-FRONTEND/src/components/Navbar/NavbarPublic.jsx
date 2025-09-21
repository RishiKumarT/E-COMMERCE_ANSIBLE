import { Link } from "react-router-dom";

export default function NavbarPublic() {
  return (
    <nav>
      <div>
        <Link to="/">E-Shop</Link>
      </div>
      <div>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
      </div>
    </nav>
  );
}
