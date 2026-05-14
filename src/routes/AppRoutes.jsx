import React from 'react';
import AccountLayout from '../layouts/AccountLayout.jsx';
import AdminLayout from '../layouts/AdminLayout.jsx';
import AccountPage from '../pages/AccountPage.jsx';
import AdminPage from '../pages/AdminPage.jsx';
import LandingPage from '../pages/LandingPage.jsx';
import NewsAdminPage from '../pages/NewsAdminPage.jsx';
import NewsArticlePage from '../pages/NewsArticlePage.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import { useCurrentPath } from './router.js';

const adminTitles = {
  '/admin': 'Dashboard',
  '/admin/yachts': 'Yachts',
  '/admin/charters': 'Charters',
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

  if (path.startsWith('/news/')) {
    const slug = decodeURIComponent(path.replace('/news/', ''));
    return <NewsArticlePage slug={slug} />;
  }

  if (path === '/account') {
    return (
      <ProtectedRoute>
        <AccountLayout>
          <AccountPage />
        </AccountLayout>
      </ProtectedRoute>
    );
  }

  if (adminTitles[path]) {
    return (
      <ProtectedRoute requireAdmin>
        <AdminLayout title={adminTitles[path]}>
          {path === '/admin/news' ? <NewsAdminPage /> : <AdminPage title={adminTitles[path]} />}
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  return <LandingPage />;
}
