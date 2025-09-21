import NavbarPublic from "./NavbarPublic";
import NavbarUser from "./NavbarUser";
import NavbarSeller from "./NavbarSeller";
import NavbarAdmin from "./NavbarAdmin";
import { useAuth } from "../../auth/AuthContext";

const Navbar = () => {
  const { user } = useAuth();

  if (!user) return <NavbarPublic />;
  if (user.role === "USER") return <NavbarUser />;
  if (user.role === "SELLER") return <NavbarSeller />;
  if (user.role === "ADMIN") return <NavbarAdmin />;

  return <NavbarPublic />;
};

export default Navbar;
