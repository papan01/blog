const config = require('./data/siteConfig');

module.exports = {
  pathPrefix: config.pathPrefix === '' ? '/' : config.pathPrefix,
  siteMetadata: {
    author: config.author,
    siteUrl: config.siteUrl + config.pathPrefix,
    siteLanguage: config.siteLanguage,
    siteTitleAlt: config.siteTitleAlt,
    title: config.siteTitle,
    description: config.siteDescription,
    postImagePath: config.siteUrl + config.pathPrefix + config.imagesPath,
    image: config.siteUrl + config.pathPrefix + config.siteLogo,
    datePublished: config.datePublished,
    copyrightYear: config.copyrightYear,
    twitterUsername: config.twitterUserName,
    fbAppId: config.siteFBAppID,
    feed_url: config.siteUrl + config.pathPrefix + config.siteRss,
  },
  plugins: [
    `gatsby-plugin-sass`,
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          `gatsby-remark-relative-images`,
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 680,
            },
          },
          {
            resolve: `gatsby-remark-autolink-headers`,
            options: {
              className: `auto-link`,
            },
          },
          `gatsby-remark-prismjs`,
        ],
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: 'images',
        path: `${__dirname}/static/images`,
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'posts',
        path: `${__dirname}/content`,
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: config.siteTitle,
        short_name: config.siteTitleShort,
        description: config.siteDescription,
        start_url: config.pathPrefix,
        background_color: `#282c35`,
        theme_color: `#282c35`,
        display: `standalone`,
        icon: config.siteLogo,
        icons: [
          {
            src: '/logos/logo-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/logos/logo-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    },
    `gatsby-plugin-offline`,
    {
      resolve: `gatsby-plugin-sitemap`,
      options: {
        output: `/sitemap.xml`,
        query: `
          {
            site {
              siteMetadata {
                siteUrl
              }
            }
  
            allSitePage {
              edges {
                node {
                  path
                }
              }
            }
        }`,
        serialize: ({ site, allSitePage }) =>
          allSitePage.edges.map(edge => {
            return {
              url: site.siteMetadata.siteUrl + edge.node.path,
              changefreq: `daily`,
              priority: 0.7,
            };
          }),
      },
    },
    {
      resolve: 'gatsby-plugin-google-analytics',
      options: {
        trackingId: config.siteGATrackingID,
      },
    },
  ],
};
