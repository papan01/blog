import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import Config from '../../data/siteConfig';
import Navigation from '../components/navigation';
import './style/style.scss';

const Layout = ({ children }) => {
  return (
    <Navigation>
      <Helmet>
        <meta name="description" content={Config.siteDescription} />
      </Helmet>
      {children}
    </Navigation>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
