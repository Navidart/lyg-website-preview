import React, { useEffect } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { canAccessAdmin, normalizeRole } from '../auth/roles.js';
import { navigateTo } from './router.js';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthLoading, isProfileLoading, isSigningOut, openAuthModal, profileError, role, user } = useAuth();
  const normalizedRole = normalizeRole(role);
  const canAccessAdminRoute = canAccessAdmin(normalizedRole);
  const isCheckingAdminRole = Boolean(user) && requireAdmin && !profileError && normalizedRole === null;
  const isLoading = isAuthLoading || (Boolean(user) && isProfileLoading) || isCheckingAdminRole;

  useEffect(() => {
    if (isLoading) return;

    const redirectTarget = !user ? '/' : requireAdmin && !profileError && !canAccessAdminRoute ? '/profile' : null;

    if (!user) {
      navigateTo('/');
      if (!isSigningOut) {
        openAuthModal();
      }
      return;
    }

    if (requireAdmin && profileError) {
      return;
    }

    if (redirectTarget) {
      navigateTo(redirectTarget);
    }
  }, [canAccessAdminRoute, isLoading, isSigningOut, normalizedRole, openAuthModal, profileError, requireAdmin, user]);

  if (isLoading) {
    return <RouteLoadingState label={requireAdmin ? 'Checking admin access...' : 'Restoring secure session...'} />;
  }

  if (requireAdmin && profileError) {
    return <RouteLoadingState label="Unable to verify admin access." />;
  }

  if (!user || (requireAdmin && !canAccessAdminRoute)) {
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
