import React, { useEffect, useRef, useState } from "react";
import { useAuth } from '../auth/AuthContext.jsx';
import { canAccessAdmin, normalizeRole } from '../auth/roles.js';
import { menus } from '../data.js';
import { navigateTo } from '../routes/router.js';
import Avatar from './Avatar.jsx';
import DropdownMenu from './DropdownMenu.jsx';
import Icon from './Icons.jsx';
import Logo from './Logo.jsx';
import searchIconUrl from '../assets/icons/actions/ico-search.svg?url&no-inline';
import menuIconUrl from '../assets/icons/navigation/ico-menu.svg?url&no-inline';
import chevronDownIconUrl from '../assets/icons/navigation/ico-chevron-down.svg?url&no-inline';

export default function Header() {
  const { openAuthModal, profile, role, user } = useAuth();
  const [isStickyVisible, setIsStickyVisible] = useState(false);
  const [hasEnhancedContrast, setHasEnhancedContrast] = useState(false);
  const [isStickyMenuOpen, setIsStickyMenuOpen] = useState(false);
  const [activeStickyMenu, setActiveStickyMenu] = useState(null);
  const [openNavMenu, setOpenNavMenu] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const stickyHeaderRef = useRef(null);
  const navCloseTimer = useRef(null);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSearchOpen && searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSearchOpen]);

  useEffect(() => {
    const updateStickyHeader = () => {
      const scrollY = window.scrollY;
      setIsStickyVisible(scrollY > 120);

      const sampledElement = document.elementFromPoint(window.innerWidth / 2, 96);
      const activeSection = sampledElement?.closest('section, footer');
      const isDarkSection =
        activeSection?.classList.contains('hero') ||
        activeSection?.classList.contains('crew-section') ||
        activeSection?.classList.contains('footer');

      setHasEnhancedContrast(scrollY > 120 && Boolean(activeSection) && !isDarkSection);
    };

    updateStickyHeader();
    window.addEventListener('scroll', updateStickyHeader, { passive: true });
    window.addEventListener('resize', updateStickyHeader);

    return () => {
      window.removeEventListener('scroll', updateStickyHeader);
      window.removeEventListener('resize', updateStickyHeader);
    };
  }, []);

  useEffect(() => {
    if (!isStickyVisible) {
      setIsStickyMenuOpen(false);
    }
  }, [isStickyVisible]);

  useEffect(() => {
    if (!isStickyMenuOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!stickyHeaderRef.current?.contains(event.target)) {
        setIsStickyMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsStickyMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isStickyMenuOpen]);

  useEffect(() => () => {
    if (navCloseTimer.current) {
      window.clearTimeout(navCloseTimer.current);
    }
  }, []);

  const openPrimaryMenu = (label) => {
    if (navCloseTimer.current) {
      window.clearTimeout(navCloseTimer.current);
    }
    setOpenNavMenu(label);
  };

  const closePrimaryMenu = () => {
    if (navCloseTimer.current) {
      window.clearTimeout(navCloseTimer.current);
    }
    navCloseTimer.current = window.setTimeout(() => {
      setOpenNavMenu(null);
    }, 150);
  };

  return (
    <>
      <header className="site-header">
        <div className="header-top">
          <a className="logo-link" href="#" aria-label="Luxury Yacht Group home">
            <Logo />
          </a>
          <div className="header-actions">
            <div className={`search-container ${isSearchOpen ? 'is-open' : ''}`} ref={searchContainerRef}>
              <input
                type="text"
                className="search-input"
                placeholder="Search yachts, destinations, crew..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => {
                  if (searchQuery === '') setIsSearchOpen(false);
                }}
                ref={searchInputRef}
                aria-label="Search field"
              />
              <button 
                className="icon-search" 
                type="button" 
                aria-label="Search"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                <SearchGlyph />
              </button>
            </div>
            {user ? (
              <AccountMenu onAuthOpen={openAuthModal} profile={profile} role={role} user={user} />
            ) : (
              <button className="button button-ghost" type="button" onClick={openAuthModal}>
                Sign In
              </button>
            )}
          </div>
        </div>
        <nav className="main-nav" aria-label="Main navigation">
          {Object.entries(menus).map(([label, items]) => (
            <div
              className={`nav-item ${openNavMenu === label ? 'is-open' : ''}`}
              key={label}
              onBlur={closePrimaryMenu}
              onFocus={() => openPrimaryMenu(label)}
              onMouseEnter={() => openPrimaryMenu(label)}
              onMouseLeave={closePrimaryMenu}
            >
              <a href="#" aria-haspopup="true">
                {label}
                <NavCaret />
              </a>
              <DropdownMenu items={items} />
            </div>
          ))}
        </nav>
      </header>
      <CompactStickyHeader
        activeMenu={activeStickyMenu}
        hasEnhancedContrast={hasEnhancedContrast}
        isMenuOpen={isStickyMenuOpen}
        isVisible={isStickyVisible}
        onAuthOpen={openAuthModal}
        role={role}
        profile={profile}
        user={user}
        onMenuToggle={() => {
          setIsStickyMenuOpen((isOpen) => !isOpen);
        }}
        onSelectMenu={(label) => setActiveStickyMenu((current) => (current === label ? null : label))}
        refNode={stickyHeaderRef}
      />
    </>
  );
}

function NavCaret() {
  return (
    <span className="hero-nav-caret" aria-hidden="true">
      <img className="svg-icon icon-on-brand-primary" src={chevronDownIconUrl} alt="" aria-hidden="true" />
    </span>
  );
}

function CompactStickyHeader({
  activeMenu,
  hasEnhancedContrast,
  isMenuOpen,
  isVisible,
  onAuthOpen,
  onMenuToggle,
  onSelectMenu,
  refNode,
  profile,
  role,
  user,
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSearchOpen && searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isSearchOpen) setIsSearchOpen(false);
    };
    document.addEventListener('pointerdown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSearchOpen]);

  return (
    <header
      className={`compact-sticky-header ${isVisible ? 'is-visible' : ''} ${hasEnhancedContrast ? 'sticky-header--high-contrast' : ''}`}
      aria-hidden={!isVisible}
      ref={refNode}
    >
      <div className="compact-sticky-inner">
        <button
          aria-expanded={isMenuOpen}
          aria-label="Open menu"
          className="compact-menu"
          onClick={onMenuToggle}
          type="button"
        >
          <span className="compact-menu-icon header-icon-asset" aria-hidden="true">
            <img className="svg-icon icon-on-brand-primary" src={menuIconUrl} alt="" aria-hidden="true" />
          </span>
          <span>Menu</span>
        </button>
        <a className="compact-logo" href="#" aria-label="Luxury Yacht Group home">
          <Logo />
        </a>
        <div className="compact-actions">
          <div className={`search-container compact-search-container ${isSearchOpen ? 'is-open' : ''}`} ref={searchContainerRef}>
            <input
              type="text"
              className="search-input"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={() => {
                if (searchQuery === '') setIsSearchOpen(false);
              }}
              ref={searchInputRef}
              aria-label="Search field"
            />
            <button 
              className="compact-search" 
              type="button" 
              aria-label="Search"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <SearchGlyph />
            </button>
          </div>
          {user ? (
            <AccountMenu onAuthOpen={onAuthOpen} profile={profile} role={role} user={user} />
          ) : (
            <button className="compact-sign-in sign-in" type="button" onClick={onAuthOpen}>Sign In</button>
          )}
          <a className="compact-inquiry" href="#">Start an inquiry</a>
        </div>
      </div>
      <StickyAccordionMenu activeMenu={activeMenu} isOpen={isMenuOpen} onClose={() => onMenuToggle()} onSelectMenu={onSelectMenu} />
    </header>
  );
}

function StickyAccordionMenu({ activeMenu, isOpen, onClose, onSelectMenu }) {
  return (
    <>
      <button
        aria-hidden={!isOpen}
        aria-label="Close menu"
        className={`sticky-menu-overlay ${isOpen ? 'is-open' : ''}`}
        onClick={onClose}
        tabIndex={isOpen ? 0 : -1}
        type="button"
      />
      <aside
        aria-hidden={!isOpen}
        aria-label="Sticky navigation menu"
        className={`sticky-menu-panel ${isOpen ? 'is-open' : ''}`}
        role="dialog"
      >
        <nav className="sticky-menu-panel-inner" aria-label="Sticky navigation">
          {Object.entries(menus).map(([label, items]) => {
            const isExpanded = activeMenu === label;

            return (
              <div className="sticky-menu-group" key={label}>
                <button
                  aria-expanded={isExpanded}
                  className="sticky-menu-category"
                  onClick={() => onSelectMenu(label)}
                  type="button"
                >
                  <span>{label}</span>
                  <span className="sticky-menu-chevron header-icon-asset" aria-hidden="true">
                    <img className="svg-icon icon-on-brand-primary" src={chevronDownIconUrl} alt="" aria-hidden="true" />
                  </span>
                </button>
                <div className={`sticky-menu-items-wrap ${isExpanded ? 'is-expanded' : ''}`}>
                  <div className="sticky-menu-items">
                    {items.map((item) => (
                      <a href="#" key={item}>{item}</a>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

function SearchGlyph() {
  return (
    <span className="header-search-icon header-icon-asset" aria-hidden="true">
      <img className="svg-icon icon-on-brand-primary" src={searchIconUrl} alt="" aria-hidden="true" />
    </span>
  );
}

function AccountMenu({ onAuthOpen, profile, role, user }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const normalizedRole = normalizeRole(role);
  const isAdmin = canAccessAdmin(normalizedRole);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!user) {
      setIsOpen(false);
    }
  }, [user]);

  const handleAdminClick = (event) => {
    event.preventDefault();
    setIsOpen(false);
    navigateTo('/admin');
  };

  const handleProfileClick = (event) => {
    event.preventDefault();
    setIsOpen(false);
    navigateTo('/profile');
  };

  const handleSignOut = () => {
    setIsOpen(false);
    onAuthOpen();
  };

  return (
    <div className="account-menu" ref={menuRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Open account menu"
        className="button button-ghost header-account-button"
        onClick={() => setIsOpen((current) => !current)}
        ref={triggerRef}
        type="button"
      >
        <Avatar ariaLabel="Open account" className="user-avatar" fallbackName={user?.email ?? 'User'} profile={profile} user={user} />
      </button>

      {isOpen && (
        <div className="account-menu-panel" role="menu" aria-label="Account menu">
          <a className="account-menu-item" href="/profile" onClick={handleProfileClick} role="menuitem">
            Profile
          </a>
          {isAdmin ? (
            <a className="account-menu-item" href="/admin" onClick={handleAdminClick} role="menuitem">
              Admin Dashboard
            </a>
          ) : role === null ? (
            <span className="account-menu-item account-menu-item--loading">Loading permissions...</span>
          ) : null}
          <button className="account-menu-item" onClick={handleSignOut} role="menuitem" type="button">
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
