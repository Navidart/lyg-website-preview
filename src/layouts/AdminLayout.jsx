import React from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { navigateTo } from '../routes/router.js';

const adminLogo = 'https://www.figma.com/api/mcp/asset/5fa9ead2-6fb0-4287-9bf6-3cb25aa595dc';

const adminLinks = [
  { label: 'Dashboard', path: '/admin' },
  { label: 'Yachts', path: '/admin/yachts' },
  { label: 'Charters', path: '/admin/charters' },
  { label: 'Destinations', path: '/admin/destinations' },
  { label: 'News', path: '/admin/news' },
  { label: 'Users', path: '/admin/users' },
  { label: 'Inquiries', path: '/admin/inquiries' },
];

export default function AdminLayout({ children, title }) {
  const { openAuthModal, signOut, user } = useAuth();
  const currentPath = window.location.pathname;

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar" aria-label="Admin navigation">
        <a className="admin-brand" href="/" onClick={(event) => {
          event.preventDefault();
          navigateTo('/');
        }}>
          <img src={adminLogo} alt="Luxury Yacht Group" />
        </a>
        <nav>
          {adminLinks.map((link) => (
            <a
              className={currentPath === link.path ? 'is-active' : ''}
              href={link.path}
              key={link.path}
              onClick={(event) => {
                event.preventDefault();
                navigateTo(link.path);
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </aside>
      <section className="admin-content">
        <header className="admin-topbar">
          <div>
            <p>LYG Admin</p>
            <h1>{title}</h1>
          </div>
          <div className="admin-account-actions">
            <button className="admin-avatar-button" type="button" onClick={openAuthModal} aria-label="Open account">
              <AdminAvatar user={user} />
            </button>
            <button className="admin-logout-button" type="button" onClick={signOut}>
              Logout
            </button>
          </div>
        </header>
        <div className="admin-panel">{children}</div>
      </section>
    </main>
  );
}

function AdminAvatar({ user }) {
  const imageUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const displayName = user?.user_metadata?.full_name || user?.email || 'Admin';
  const initial = displayName.trim().charAt(0).toUpperCase() || 'A';

  return (
    <span className="admin-avatar">
      {imageUrl ? <img src={imageUrl} alt="" /> : <span>{initial}</span>}
    </span>
  );
}
