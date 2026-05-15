import React from "react";
import { AuthProvider } from './auth/AuthContext.jsx';
import AuthModal from './components/AuthModal.jsx';
import ProfileCompletionModal from './components/ProfileCompletionModal.jsx';
import AppRoutes from './routes/AppRoutes.jsx';

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <AuthModal />
      <ProfileCompletionModal />
    </AuthProvider>
  );
}
