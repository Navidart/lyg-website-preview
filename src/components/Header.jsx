import React from "react";
import { assets, menus } from '../data.js';
import DropdownMenu from './DropdownMenu.jsx';
import Icon from './Icons.jsx';

export default function Header() {
  return (
    <header className="site-header">
      <div className="header-top">
        <a className="logo-link" href="#" aria-label="Luxury Yacht Group home">
          <img src={assets.logo} alt="Luxury Yacht Group" />
        </a>
        <div className="header-actions">
          <button className="icon-search" type="button" aria-label="Search">
            <Icon name="search" size={22} />
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
  );
}
