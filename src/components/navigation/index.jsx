import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'gatsby';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Logo from '../../../static/logos/logo.png';
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
  return (
    <div>
      <input type="checkbox" ariaLabel="Switch between Dark and Light mdoe" />
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
  children: PropTypes.element.isRequired,
};

export default React.memo(Navigation);
