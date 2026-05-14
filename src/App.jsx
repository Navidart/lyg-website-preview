import React from "react";
import { AuthProvider } from './auth/AuthContext.jsx';
import AuthModal from './components/AuthModal.jsx';
import AppRoutes from './routes/AppRoutes.jsx';

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <AuthModal />
    </AuthProvider>
  );
}

