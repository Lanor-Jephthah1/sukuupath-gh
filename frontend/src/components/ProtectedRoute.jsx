import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  let account = null;
  try {
    account = window.localStorage.getItem('userAccount');
  } catch {
    account = null;
  }
  
  if (!account) {
    // User not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  // User is logged in, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
