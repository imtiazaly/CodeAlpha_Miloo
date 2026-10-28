import React from "react";
import { useAuth } from "../context/AuthContext";

export const Feed: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome, @{user?.username}!
          </h1>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-500"
          >
            Logout
          </button>
        </div>
        <p className="mt-4 text-gray-600">Feed page will be built next.</p>
      </div>
    </div>
  );
};
