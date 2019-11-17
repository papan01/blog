import React from 'react';
import { Link } from 'gatsby';
import config from '../../../data/siteConfig';
import './style.scss';

const Footer = () => {
  return (
    <footer className="footer container">
      <div className="links">
        {config.rrssb.map(item => (
          <a href={item.url} key={item.id}>
            <i className={`${item.iconClassName} fa-2x`} />
          </a>
        ))}
        <Link to={config.siteRss}>
          <i className="fa fa-rss fa-2x" />
        </Link>
      </div>
      <p>{config.copyright}</p>
    </footer>
  );
};

export default React.memo(Footer);
