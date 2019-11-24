const config = {
  siteTitle: "Papan's Blog", // Site title.
  siteTitleShort: "Papan's Blog", // Short site title for homescreen (PWA). Preferably should be under 12 characters to prevent truncation.
  siteTitleAlt: "Papan's Blog", // Alternative site title for SEO.
  siteLogo: 'static/logos/logo.png', // Logo used for SEO and manifest.
  siteUrl: 'https://papan01.github.io', // Domain of your website without pathPrefix.
  pathPrefix: '/blog', // Prefixes all links. For cases when deployed to example.github.io/gatsby-material-starter/.
  siteDescription: 'Personal blog by Papan. Life and code.', // Website description used for RSS feeds/meta description tag.
  siteRss: '/rss.xml', // Path to the RSS file.
  siteFBAppID: '', // FB Application ID for using app insights
  siteGATrackingID: '', // Tracking code ID for google analytics.
  disqusShortname: '', // Disqus shortname.
  postDefaultCategoryID: '', // Default category for posts.
  dateFromFormat: 'YYYY-MM-DD', // Date format used in the frontmatter.
  dateFormat: 'DD/MM/YYYY', // Date format for display.
  // Links to social profiles/projects you want to display in the author segment/navigation bar.
  rrssb: [
    {
      id: 'rsb1',
      url: 'https://github.com/papan01',
      iconClassName: 'fab fa-github',
    },
    {
      id: 'rsb2',
      url: 'mailto: navy90517@gmail.com',
      iconClassName: 'fa fa-envelope',
    },
    {
      id: 'rsb3',
      url: 'https://www.facebook.com/louis.peng.58?ref=bookmarks',
      iconClassName: 'fab fa-facebook',
    },
    {
      id: 'rsb4',
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
  copyright: 'Copyright © 2019. Papan',
};

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
