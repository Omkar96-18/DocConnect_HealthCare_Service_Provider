import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const ROLE_ROUTES = {
  admin: '/admin/dashboard',
  doctor: '/doctor/dashboard',
  patient: '/patient/dashboard',
  assistant: '/assistant/dashboard',
};

export default function Dashboard() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  const dest = ROLE_ROUTES[user?.role] ?? '/login';
  return <Navigate to={dest} replace />;
}
