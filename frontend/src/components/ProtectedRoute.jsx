import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const account = localStorage.getItem('userAccount');
  
  if (!account) {
    // User not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  // User is logged in, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
