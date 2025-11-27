import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const PrivateRoute = ({ children, allowedRoles = [], requireSellerApproval = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading-spinner large"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  if (requireSellerApproval && user.role === 'SELLER' && user.accountStatus !== 'APPROVED') {
    return <Navigate to="/seller/onboarding" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default PrivateRoute;
