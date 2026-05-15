import React from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import Avatar from '../components/Avatar.jsx';
import Logo from '../components/Logo.jsx';
import { navigateTo } from '../routes/router.js';

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
  const { openAuthModal, profile, signOut, user } = useAuth();
  const currentPath = window.location.pathname;

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar" aria-label="Admin navigation">
        <a className="admin-brand" href="/" onClick={(event) => {
          event.preventDefault();
          navigateTo('/');
        }}>
          <Logo />
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
              <Avatar className="admin-avatar" fallbackName={user?.email ?? 'Admin'} profile={profile} user={user} />
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
