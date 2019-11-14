import React from 'react';
import PropTypes from 'prop-types';
import Header from '../header';
import Footer from '../footer';

const Navigation = ({ children }) => {
  return (
    <div>
      <Header />
      {children}
      <Footer />
    </div>
  );
};

Navigation.propTypes = {
  children: PropTypes.node.isRequired,
};

export default React.memo(Navigation);
