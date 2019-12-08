const config = {
  author: 'Papan01', // Site owner
  siteTitle: "Papan01's Blog", // Site title.
  siteTitleShort: "Papan01's Blog", // Short site title for homescreen (PWA). Preferably should be under 12 characters to prevent truncation.
  siteTitleAlt: 'Papan01 OverSoftware', // Alternative site title for SEO.
  siteLanguage: 'zh-tw', // Site language.
  siteDescription: 'Personal blog by Papan01. Life and code.', // Website description used for RSS feeds/meta description tag.
  siteLogo: 'static/favicons/favicon.png', // Logo used for SEO and manifest.
  siteUrl: 'https://papan01.netlify.com', // Domain of your website without pathPrefix.
  pathPrefix: '/', // Prefixes all links. For cases when deployed to example.github.io/gatsby-material-starter/.
  siteRss: '/rss.xml', // Path to the RSS file.
  siteFBAppID: '464217807633356', // FB Application ID for using app insights
  siteGATrackingID: 'UA-153303709-2', // Tracking code ID for google analytics.
  disqusShortname: 'papan01-blog-netlify', // Disqus shortname.
  twitterUserName: '', // twitter creator for SEO
  datePublished: '2019-11-10', // for SEO
  copyrightYear: '2019', // for SEO
  postsPerPage: 4, // posts per page used in gatsby-node.js
  // Links to social profiles/projects you want to display in the author segment/navigation bar.
  rrssb: [
    {
      label: 'github',
      url: 'https://github.com/papan01',
      iconClassName: 'fab fa-github',
    },
    {
      label: 'mail',
      url: 'mailto: navy90517@gmail.com',
      iconClassName: 'fa fa-envelope',
    },
    {
      label: 'facebbok',
      url: 'https://www.facebook.com/louis.peng.58?ref=bookmarks',
      iconClassName: 'fab fa-facebook',
    },
    {
      label: 'instagram',
      url: 'https://www.instagram.com/n_louis_peng/?hl=zh-tw',
      iconClassName: 'fab fa-instagram',
    },
  ],
  navbarLinks: [
    {
      label: 'Archives',
      url: '/archives',
      iconClassName: 'fa fa-book-open',
    },
    {
      label: 'Categories',
      url: '/categories',
      iconClassName: 'fa fa-list-alt',
    },
    {
      label: 'About',
      url: '/about',
      iconClassName: 'fa fa-address-card',
    },
  ],
};
config.copyright = `Copyright © ${config.copyrightYear}. ${config.author}`;

// Make sure pathPrefix is empty if not needed
if (config.pathPrefix === '/') {
  config.pathPrefix = '';
} else {
  // Make sure pathPrefix only contains the first forward slash
  config.pathPrefix = `/${config.pathPrefix.replace(/^\/|\/$/g, '')}`;
}

// Make sure siteUrl doesn't have an ending forward slash
if (config.siteUrl.substr(-1) === '/') config.siteUrl = config.siteUrl.slice(0, -1);

// Make sure siteRss has a starting forward slash
if (config.siteRss && config.siteRss[0] !== '/') config.siteRss = `/${config.siteRss}`;

module.exports = config;
