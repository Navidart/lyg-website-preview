import React, { useEffect, useRef, useState } from 'react';
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
  const { openAuthModal, profile, user } = useAuth();
  const currentPath = window.location.pathname;
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);
  const accountTriggerRef = useRef(null);

  useEffect(() => {
    if (!isAccountMenuOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!accountMenuRef.current?.contains(event.target)) {
        setIsAccountMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsAccountMenuOpen(false);
        accountTriggerRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAccountMenuOpen]);

  const handleViewWebsite = (event) => {
    event.preventDefault();
    setIsAccountMenuOpen(false);
    navigateTo('/');
  };

  const handleLogOut = () => {
    setIsAccountMenuOpen(false);
    openAuthModal();
  };

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
            <div className="account-menu" ref={accountMenuRef}>
              <button
                aria-expanded={isAccountMenuOpen}
                aria-haspopup="menu"
                aria-label="Open account menu"
                className="admin-avatar-button"
                onClick={() => setIsAccountMenuOpen((current) => !current)}
                ref={accountTriggerRef}
                type="button"
              >
                <Avatar className="admin-avatar" fallbackName={user?.email ?? 'Admin'} profile={profile} user={user} />
              </button>
              {isAccountMenuOpen && (
                <div className="account-menu-panel" role="menu" aria-label="Account menu">
                  <a className="account-menu-item" href="/" onClick={handleViewWebsite} role="menuitem">
                    View website
                  </a>
                  <button className="account-menu-item" onClick={handleLogOut} role="menuitem" type="button">
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="admin-panel">{children}</div>
      </section>
    </main>
  );
}
