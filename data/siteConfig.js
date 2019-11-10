const config = {
    siteTitle: "Papan's Blog", // Site title.
    siteTitleShort: "Papan's Blog", // Short site title for homescreen (PWA). Preferably should be under 12 characters to prevent truncation.
    siteTitleAlt: "Papan's Blog", // Alternative site title for SEO.
    siteLogo: "static/logos/logo.png", // Logo used for SEO and manifest.
    siteUrl: "", // Domain of your website without pathPrefix.
    pathPrefix: "/", // Prefixes all links. For cases when deployed to example.github.io/gatsby-material-starter/.
    fixedFooter: false, // Whether the footer component is fixed, i.e. always visible
    siteDescription: "Personal blog by Papan. Life and code.", // Website description used for RSS feeds/meta description tag.
    siteRss: "", // Path to the RSS file.
    siteFBAppID: "", // FB Application ID for using app insights
    siteGATrackingID: "", // Tracking code ID for google analytics.
    disqusShortname: "", // Disqus shortname.
    postDefaultCategoryID: "", // Default category for posts.
    dateFromFormat: "YYYY-MM-DD", // Date format used in the frontmatter.
    dateFormat: "DD/MM/YYYY", // Date format for display.
    userName: "", // Username to display in the author segment.
    userEmail: "", // Email used for RSS feed's author segment
    userTwitter: "", // Optionally renders "Follow Me" in the UserInfo segment.
    userLocation: "", // User location to display in the author segment.
    userAvatar: "https://api.adorable.io/avatars/150/test.png", // User avatar to display in the author segment.
    userDescription:
      "", // User description to display in the author segment.
    // Links to social profiles/projects you want to display in the author segment/navigation bar.
    userLinks: [
      {
        label: "",
        url: "",
        iconClassName: ""
      },
      {
        label: "",
        url: "",
        iconClassName: ""
      },
      {
        label: "",
        url: "",
        iconClassName: ""
      }
    ],
    copyright: "" // Copyright string for the footer of the website and RSS feed.
  };
  
  // Validate
  
  // Make sure pathPrefix is empty if not needed
  if (config.pathPrefix === "/") {
    config.pathPrefix = "";
  } else {
    // Make sure pathPrefix only contains the first forward slash
    config.pathPrefix = `/${config.pathPrefix.replace(/^\/|\/$/g, "")}`;
  }
  
  // Make sure siteUrl doesn't have an ending forward slash
  if (config.siteUrl.substr(-1) === "/")
    config.siteUrl = config.siteUrl.slice(0, -1);
  
  // Make sure siteRss has a starting forward slash
  if (config.siteRss && config.siteRss[0] !== "/")
    config.siteRss = `/${config.siteRss}`;
  
  module.exports = config;
  