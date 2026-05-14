import React, { useEffect } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { navigateTo } from './router.js';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthLoading, isProfileLoading, openAuthModal, role, user } = useAuth();
  const isLoading = isAuthLoading || (Boolean(user) && isProfileLoading);
  const normalizedRole = role?.trim().toLowerCase() ?? null;
  const isAdmin = normalizedRole === 'admin';

  useEffect(() => {
    if (isLoading) return;

    console.log('[auth guard] decision:', {
      isAdmin,
      isLoading,
      normalizedRole,
      path: window.location.pathname,
      requireAdmin,
      userId: user?.id ?? null,
    });

    if (!user) {
      navigateTo('/');
      openAuthModal();
      return;
    }

    if (requireAdmin && !isAdmin) {
      navigateTo('/account');
    }
  }, [isAdmin, isLoading, normalizedRole, openAuthModal, requireAdmin, user]);

  if (isLoading) {
    return <RouteLoadingState label="Restoring secure session..." />;
  }

  if (!user || (requireAdmin && !isAdmin)) {
    return <RouteLoadingState label="Redirecting..." />;
  }

  return children;
}

export function RouteLoadingState({ label = 'Loading...' }) {
  return (
    <main className="route-loading">
      <p>{label}</p>
    </main>
  );
}
