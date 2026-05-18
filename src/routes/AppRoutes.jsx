import React from 'react';
import AccountLayout from '../layouts/AccountLayout.jsx';
import AdminLayout from '../layouts/AdminLayout.jsx';
import AccountPage from '../pages/AccountPage.jsx';
import AdminPage from '../pages/AdminPage.jsx';
import AdminUserDetailPage from '../pages/AdminUserDetailPage.jsx';
import AmenitiesAdminPage from '../pages/AmenitiesAdminPage.jsx';
import AuthCallbackPage from '../pages/AuthCallbackPage.jsx';
import ChartersAdminPage from '../pages/ChartersAdminPage.jsx';
import LandingPage from '../pages/LandingPage.jsx';
import NewsAdminPage from '../pages/NewsAdminPage.jsx';
import NewsArticlePage from '../pages/NewsArticlePage.jsx';
import UsersAdminPage from '../pages/UsersAdminPage.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import { useCurrentPath } from './router.js';

const adminTitles = {
  '/admin': 'Dashboard',
  '/admin/yachts': 'Yachts',
  '/admin/charters': 'Charters',
  '/admin/amenities': 'Amenities',
  '/admin/destinations': 'Destinations',
  '/admin/news': 'News',
  '/admin/users': 'Users',
  '/admin/inquiries': 'Inquiries',
};

export default function AppRoutes() {
  const path = useCurrentPath();

  if (path === '/') {
    return <LandingPage />;
  }

  if (path === '/auth/callback') {
    return <AuthCallbackPage />;
  }

  if (path.startsWith('/news/')) {
    const slug = decodeURIComponent(path.replace('/news/', ''));
    return <NewsArticlePage slug={slug} />;
  }

  if (path === '/profile' || path === '/account') {
    return (
      <ProtectedRoute>
        <AccountLayout>
          <AccountPage />
        </AccountLayout>
      </ProtectedRoute>
    );
  }

  if (path.startsWith('/admin/users/')) {
    const userId = decodeURIComponent(path.replace('/admin/users/', ''));

    return (
      <ProtectedRoute requireAdmin>
        <AdminLayout title="User Details">
          <AdminUserDetailPage userId={userId} />
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  if (adminTitles[path]) {
    let content;
    if (path === '/admin/news') {
      content = <NewsAdminPage />;
    } else if (path === '/admin/charters') {
      content = <ChartersAdminPage />;
    } else if (path === '/admin/amenities') {
      content = <AmenitiesAdminPage />;
    } else if (path === '/admin/users') {
      content = <UsersAdminPage />;
    } else {
      content = <AdminPage title={adminTitles[path]} />;
    }

    return (
      <ProtectedRoute requireAdmin>
        <AdminLayout title={adminTitles[path]}>
          {content}
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  return <LandingPage />;
}
