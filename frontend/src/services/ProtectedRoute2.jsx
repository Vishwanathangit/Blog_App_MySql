import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute2 = () => {
  const { token } = useAuth();
  return !token ? <Outlet /> : <Navigate to="/" />;
};

export default ProtectedRoute2;