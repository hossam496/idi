import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import GuestRoute from '../components/layout/GuestRoute';

// Lazy load pages for optimized loading speed and bundle sizes
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const LandingPage = lazy(() => import('../pages/LandingPage'));
const Chat = lazy(() => import('../pages/Chat'));
const Grammar = lazy(() => import('../pages/Grammar'));
const Vocabulary = lazy(() => import('../pages/Vocabulary'));
const Profile = lazy(() => import('../pages/Profile'));

// Fullscreen luxurious loading state for chunk loading
const FullPageLoader = () => (
  <div className="min-h-screen bg-brand-cream flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-12 h-12 border-4 border-brand-green border-t-transparent rounded-full animate-spin"></div>
      <p className="font-serif text-brand-navy text-lg italic">Istituto Di Italiano IDI...</p>
    </div>
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <Routes>
        {/* Guest Routes (Login, Register) */}
        <Route 
          path="/" 
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          } 
        />

        {/* Protected Routes (Dashboard, Chat, Grammar, Vocabulary, Profile) */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <LandingPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/chat" 
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/grammar" 
          element={
            <ProtectedRoute>
              <Grammar />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/vocabulary" 
          element={
            <ProtectedRoute>
              <Vocabulary />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />

        {/* 404 Catch All */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
