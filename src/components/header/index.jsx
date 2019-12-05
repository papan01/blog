import React, { useState, useEffect } from 'react';
import { Link } from 'gatsby';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import classNames from 'classnames';
import Logo from '../../../static/favicons/logo.png';
import Dark from '../../../static/material/dark.png';
import Light from '../../../static/material/light.png';
import config from '../../../config/siteConfig';
import './style.scss';
import '@fortawesome/fontawesome-free/css/all.min.css';

const NavList = ({ navStyle, closeMenu }) => {
  return (
    <nav className={navStyle}>
      <ul className="nav-list">
        {config.navbarLinks.map(item => (
          <li key={item.label}>
            <Link to={item.url} activeClassName="active" onClick={() => closeMenu(false)}>
              <i className={`${item.iconClassName} fa-2x`} />
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

NavList.propTypes = {
  navStyle: PropTypes.string.isRequired,
  closeMenu: PropTypes.func.isRequired,
};

const ThemeToggle = () => {
  let theme;
  if (typeof window !== 'undefined') {
    theme = localStorage.getItem('theme');
    if (!theme) {
      localStorage.setItem('theme', 'dark');
      theme = 'dark';
    }
  }
  const [isChecked, toggleChecked] = useState(theme === 'dark');

  useEffect(() => {
    localStorage.setItem('theme', isChecked ? 'dark' : 'light');
  }, [isChecked]);

  const toggleStyle = isChecked ? 'theme-toggle theme-toggle--checked' : 'theme-toggle';

  theme = isChecked ? 'dark' : 'light';

  return (
    <div
      role="checkbox"
      aria-checked={isChecked}
      aria-label="theme-toggle"
      tabIndex="-1"
      className={toggleStyle}
      onClick={() => toggleChecked(!isChecked)}
      onKeyPress={() => {
        toggleChecked(!isChecked);
      }}
    >
      <Helmet>
        <body className={theme} />
      </Helmet>
      <div className="theme-toggle-track">
        <div className="theme-toggle-track-dark">
          <img src={Dark} alt="theme dark" />
        </div>
        <div className="theme-toggle-track-light">
          <img src={Light} alt="theme light" />
        </div>
      </div>
      <div className="theme-toggle-thumb" />
      <input
        className="theme-toggle-screenreader-only"
        type="checkbox"
        aria-label="Switch between Dark and Light mdoe"
      />
    </div>
  );
};

const Header = () => {
  const [isOpenMenu, toggleOpenMenu] = useState(false);

  const navClass = classNames({
    'top-nav-bar': true,
    open: isOpenMenu,
  });
  const mobileIcon = classNames({
    fa: true,
    'fa-bars': !isOpenMenu,
    'fa-times': isOpenMenu,
    'fa-3x': true,
  });
  return (
    <header className="top-bar">
      <div className="container">
        <div className="logo">
          <Link to="/">
            <img src={Logo} alt={config.siteTitle} loading="lazy" />
          </Link>
        </div>
        <NavList navStyle={navClass} closeMenu={toggleOpenMenu} />
        <ThemeToggle />
        <div className="mobile-actions">
          <button
            type="button"
            className="menu-button"
            aria-label="mobile-menu"
            onClick={() => toggleOpenMenu(!isOpenMenu)}
          >
            <i className={mobileIcon} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default React.memo(Header);
