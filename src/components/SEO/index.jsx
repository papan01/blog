import React from 'react';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import { useStaticQuery, graphql } from 'gatsby';

const query = graphql`
  query SEO {
    site {
      siteMetadata {
        author
        siteUrl
        siteLanguage
        siteTitleAlt
        defaultTitle: title
        defaultDescription: description
        defaultImage: image
        postImagePath
        datePublished
        copyrightYear
        twitterUsername
        fbAppId
      }
    }
  }
`;

const SEO = ({ title, description, image, path, article, date }) => {
  const { site } = useStaticQuery(query);
  const {
    author,
    siteUrl,
    siteLanguage,
    siteTitleAlt,
    defaultTitle,
    defaultDescription,
    defaultImage,
    postImagePath,
    datePublished,
    copyrightYear,
    twitterUsername,
    fbAppId,
  } = site;

  const seo = {
    url: path ? `${siteUrl}${path}` : siteUrl,
    title: title ? `${title} | ${defaultTitle}` : defaultTitle,
    description: description || defaultDescription,
    image: image ? `${postImagePath}/${image}` : defaultImage,
  };

  const schemaOrgWebPage = {
    '@context': 'http://schema.org',
    '@type': 'WebPage',
    url: siteUrl,
    headline: siteTitleAlt,
    inLanguage: siteLanguage,
    mainEntityOfPage: siteUrl,
    description: defaultDescription,
    name: defaultTitle,
    author: {
      '@type': 'Person',
      name: author,
    },
    copyrightHolder: {
      '@type': 'Person',
      name: author,
    },
    copyrightYear,
    creator: {
      '@type': 'Person',
      name: author,
    },
    publisher: {
      '@type': 'Person',
      name: author,
    },
    datePublished,
    dateModified: date,
    image: {
      '@type': 'ImageObject',
      url: seo.image,
    },
  };

  const itemListElement = [
    {
      '@type': 'ListItem',
      item: {
        '@id': siteUrl,
        name: 'Homepage',
      },
      position: 1,
    },
  ];

  let schemaArticle = null;

  if (article) {
    schemaArticle = {
      '@context': 'http://schema.org',
      '@type': 'Article',
      author: {
        '@type': 'Person',
        name: author,
      },
      copyrightHolder: {
        '@type': 'Person',
        name: author,
      },
      copyrightYear,
      creator: {
        '@type': 'Person',
        name: author,
      },
      publisher: {
        '@type': 'Organization',
        name: author,
        logo: {
          '@type': 'ImageObject',
          url: defaultImage,
        },
      },
      datePublished: date,
      dateModified: date,
      description: seo.description,
      headline: seo.title,
      inLanguage: siteLanguage,
      url: seo.url,
      name: seo.title,
      image: {
        '@type': 'ImageObject',
        url: seo.image,
      },
      mainEntityOfPage: seo.url,
    };
    // Push current blogpost into breadcrumb list
    itemListElement.push({
      '@type': 'ListItem',
      item: {
        '@id': seo.url,
        name: seo.title,
      },
      position: 2,
    });
  }

  const breadcrumb = {
    '@context': 'http://schema.org',
    '@type': 'BreadcrumbList',
    description: 'Breadcrumbs list',
    name: 'Breadcrumbs',
    itemListElement,
  };

  return (
    <Helmet>
      <title>{seo.title}</title>
      <link rel="canonical" href={`${seo.path}`} />
      <meta name="description" content={seo.description} />
      <meta name="image" content={seo.image} />
      {/* Schema.org */}
      {!article && <script type="application/ld+json">{JSON.stringify(schemaOrgWebPage)}</script>}
      {article && <script type="application/ld+json">{JSON.stringify(schemaArticle)}</script>}
      <script type="application/ld+json">{JSON.stringify(breadcrumb)}</script>
      {/* OpenGraph */}
      <meta property="og:url" content={seo.path} />
      {article && <meta property="og:type" content="article" />}
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />
      {/* fb app id */}
      <meta property="fb:app_id" content={fbAppId || ''} />
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content={twitterUsername} />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />
    </Helmet>
  );
};

SEO.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  image: PropTypes.string,
  path: PropTypes.string,
  article: PropTypes.bool,
  date: PropTypes.string.isRequired,
};

SEO.defaultProps = {
  title: null,
  description: null,
  image: null,
  path: null,
  article: false,
};

export default React.memo(SEO);
