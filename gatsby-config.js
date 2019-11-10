const config = require("./data/SiteConfig");

module.exports = {
  plugins: [
    `gatsby-plugin-sass`,
    `gatsby-transformer-remark`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `src`,
        path: `${__dirname}/src/`,
      },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "posts",
        path: `${__dirname}/content`
      }
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
            src: "/logos/logo-128x128.png",
            sizes: "128x128",
            type: "image/png"
          },
          {
            src: "/logos/logo-256x256.png",
            sizes: "256x256",
            type: "image/png"
          },
          {
            src: "/logos/logo-512x512.png",
            sizes: "512x512",
            type: "image/png"
          },
        ]
      },
      
    },
    `gatsby-plugin-offline`,
  ],
}
