import React, { useEffect, useRef, useState } from "react";
import { menus } from '../data.js';
import DropdownMenu from './DropdownMenu.jsx';
import Icon from './Icons.jsx';

const stickyLogo = 'https://www.figma.com/api/mcp/asset/5fa9ead2-6fb0-4287-9bf6-3cb25aa595dc';
const searchGlyph = 'https://www.figma.com/api/mcp/asset/cb495483-f376-401d-a3a3-a52484233b5a';

export default function Header() {
  const [isStickyVisible, setIsStickyVisible] = useState(false);
  const [hasEnhancedContrast, setHasEnhancedContrast] = useState(false);
  const [isStickyMenuOpen, setIsStickyMenuOpen] = useState(false);
  const [activeStickyMenu, setActiveStickyMenu] = useState('Sales');
  const stickyHeaderRef = useRef(null);

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

  return (
    <>
      <header className="site-header">
        <div className="header-top">
          <a className="logo-link" href="#" aria-label="Luxury Yacht Group home">
            <img src={stickyLogo} alt="Luxury Yacht Group" />
          </a>
          <div className="header-actions">
            <button className="icon-search" type="button" aria-label="Search">
              <SearchGlyph />
            </button>
            <a className="button button-ghost" href="#">Sign In</a>
          </div>
        </div>
        <nav className="main-nav" aria-label="Main navigation">
          {Object.entries(menus).map(([label, items]) => (
            <div className="nav-item" key={label}>
              <a href="#" aria-haspopup="true">
                {label}
                <Icon name="chevron" size={8} />
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
        onMenuToggle={() => {
          setActiveStickyMenu((current) => current || 'Sales');
          setIsStickyMenuOpen((isOpen) => !isOpen);
        }}
        onSelectMenu={setActiveStickyMenu}
        refNode={stickyHeaderRef}
      />
    </>
  );
}

function CompactStickyHeader({ activeMenu, hasEnhancedContrast, isMenuOpen, isVisible, onMenuToggle, onSelectMenu, refNode }) {
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
          <svg className="compact-menu-icon" aria-hidden="true" fill="none" viewBox="0 0 32 32">
            <path d="M0 7.5H24" />
            <path d="M0 16H24" />
            <path d="M0 24.5H24" />
          </svg>
          <span>Menu</span>
        </button>
        <a className="compact-logo" href="#" aria-label="Luxury Yacht Group home">
          <img src={stickyLogo} alt="Luxury Yacht Group" />
        </a>
        <div className="compact-actions">
          <button className="compact-search" type="button" aria-label="Search">
            <SearchGlyph />
          </button>
          <a className="compact-sign-in" href="#">Sign In</a>
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
                  <Icon name="chevron" size={10} className="sticky-menu-chevron" />
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
    <span
      aria-hidden="true"
      className="search-glyph"
      style={{ '--search-icon': `url(${searchGlyph})` }}
    />
  );
}
