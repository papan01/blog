const path = require(`path`);
const _ = require('lodash');

exports.onCreateNode = ({ node, actions }) => {
  const { createNodeField } = actions;
  if (node.internal.type === `MarkdownRemark`) {
    const slug = `/${_.kebabCase(node.frontmatter.title)}`;
    createNodeField({
      node,
      name: `slug`,
      value: `/archives${slug}`,
    });
  }
};

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;
  const result = await graphql(`
    query {
      allMarkdownRemark {
        edges {
          node {
            fields {
              slug
            }
            frontmatter {
              tags
              category
            }
          }
        }
      }
    }
  `);

  const tagSet = new Set();
  const categorySet = new Set();
  const posts = result.data.allMarkdownRemark.edges;
  const postsPerPage = 5;
  const numPages = Math.ceil(posts.length / postsPerPage);

  for (let i = 0; i < numPages; i += 1) {
    createPage({
      path: i === 0 ? `/` : `/${i + 1}`,
      component: path.resolve('./src/templates/postList.jsx'),
      context: {
        limit: postsPerPage,
        skip: i * postsPerPage,
        numPages,
        currentPage: i + 1,
      },
    });
  }

  posts.forEach(({ node }) => {
    createPage({
      path: node.fields.slug,
      component: path.resolve(`./src/templates/post.jsx`),
      context: {
        slug: node.fields.slug,
      },
    });

    if (node.frontmatter.tags) {
      node.frontmatter.tags.forEach(tag => {
        tagSet.add(tag);
      });
    }

    if (node.frontmatter.category) {
      categorySet.add(node.frontmatter.category);
    }
  });

  tagSet.forEach(tag => {
    createPage({
      path: `/tags/${_.kebabCase(tag)}/`,
      component: path.resolve(`./src/templates/tag.jsx`),
      context: {
        tag,
      },
    });
  });

  categorySet.forEach(category => {
    createPage({
      path: `/categories/${_.kebabCase(category)}/`,
      component: path.resolve(`./src/templates/category.jsx`),
      context: {
        category,
      },
    });
  });
};
