import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, isLoggedIn } = useAuth();

  if (!isLoggedIn()) return <Navigate to="/login" />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute;
// import { Navigate } from "react-router-dom";
// import { useAuth } from "./AuthContext";

// const PrivateRoute = ({ children, allowedRoles }) => {
//   const { user } = useAuth();

//   if (!user) return <Navigate to="/login" />;
//   if (allowedRoles && !allowedRoles.includes(user.role)) {
//     return <Navigate to="/" />; // block unauthorized
//   }

//   return children;
// };

// export default PrivateRoute;
