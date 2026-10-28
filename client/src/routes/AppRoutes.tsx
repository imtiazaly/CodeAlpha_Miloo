import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";
import { Feed } from "../pages/Feed";
import { Profile } from "../pages/Profile";
import { Search } from "../pages/Search";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Feed />} />
        <Route path="/search" element={<Search />} />
        <Route path="/profile/:id" element={<Profile />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
