import React from 'react';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import config from '../../../data/siteConfig';

const SEO = ({ seo }) => {
  return (
    <Helmet>
      <meta name="description" content={seo.description} />
      <meta name="image" content={seo.image} />
      <meta property="og:url" content={seo.path} />
      <meta property="og:type" content="article" />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />
      <meta property="fb:app_id" content={config.siteFBAppID ? config.siteFBAppID : ''} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content={config.twitterUserName} />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />
    </Helmet>
  );
};

SEO.propTypes = {
  seo: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    image: PropTypes.string,
    path: PropTypes.string,
  }).isRequired,
};

export default React.memo(SEO);
