import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'gatsby';
import Helmet from 'react-helmet';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Logo from '../../../static/logos/logo.png';
import Dark from '../../../static/material/dark.png';
import Light from '../../../static/material/light.png';
import config from '../../../data/siteConfig';
import './style.scss';

const NavList = () => {
  return (
    <nav className="top-nav-bar">
      <ul className="nav-list">
        {config.navbarLinks.map(item => (
          <li key={item.id}>
            <Link to={item.url} activeClassName="active">
              <i className={`${item.iconClassName} fa-2x`} />
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

const ThemeToggle = () => {
  let theme = localStorage.getItem('theme');
  if (!theme) {
    localStorage.setItem('theme', 'dark');
  }
  const [isChecked, setChecked] = useState(theme === 'dark');

  useEffect(() => {
    localStorage.setItem('theme', isChecked ? 'dark' : 'light');
  }, [isChecked]);

  const toggleStyle = isChecked
    ? 'theme-toggle theme-toggle--checked'
    : 'theme-toggle';

  theme = isChecked ? 'dark' : 'light';

  return (
    <div
      role="checkbox"
      aria-checked={isChecked}
      tabIndex="-1"
      className={toggleStyle}
      onClick={() => {
        setChecked(!isChecked);
      }}
      onKeyDown={() => {
        setChecked(!isChecked);
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

const Navigation = ({ children }) => {
  return (
    <div>
      <header className="top-bar">
        <div className="container">
          <div className="logo">
            <Link to="/">
              <img src={Logo} alt={config.siteTitle} />
            </Link>
          </div>
          <NavList />
          <ThemeToggle />
        </div>
      </header>
      {children}
    </div>
  );
};

Navigation.propTypes = {
  children: PropTypes.node.isRequired,
};

export default React.memo(Navigation);
