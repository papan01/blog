import React from 'react';
import PropTypes from 'prop-types';
import Navigation from '../components/navigation';
import './style/style.scss';

const Layout = ({ children }) => {
  return <Navigation>{children}</Navigation>;
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
