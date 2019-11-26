import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'gatsby';
import Layout from '../layout';
import PostCardList from '../components/postCardList';

const Index = ({ data }) => {
  const { edges } = data.allMarkdownRemark;
  const postList = [];
  edges.forEach(edge => {
    postList.push({
      path: edge.node.fields.slug,
      tags: edge.node.frontmatter.tags,
      category: edge.node.frontmatter.category,
      cover: edge.node.frontmatter.cover,
      title: edge.node.frontmatter.title,
      date: edge.node.frontmatter.date,
      timeToRead: edge.node.timeToRead,
      excerpt: edge.node.excerpt,
    });
  });
  return (
    <Layout>
      <PostCardList posts={postList} />
    </Layout>
  );
};

Index.propTypes = {
  data: PropTypes.shape({
    allMarkdownRemark: PropTypes.shape({
      edges: PropTypes.arrayOf(
        PropTypes.shape({
          node: PropTypes.shape({
            fields: PropTypes.shape({
              slug: PropTypes.string.isRequired,
            }).isRequired,
            excerpt: PropTypes.string.isRequired,
            timeToRead: PropTypes.number.isRequired,
            frontmatter: PropTypes.shape({
              title: PropTypes.string.isRequired,
              tags: PropTypes.arrayOf(PropTypes.string),
              cover: PropTypes.string,
              category: PropTypes.string,
              date: PropTypes.string,
            }).isRequired,
          }).isRequired,
        }),
      ).isRequired,
    }).isRequired,
  }).isRequired,
};

export default Index;

export const pageQuery = graphql`
  query IndexQuery {
    allMarkdownRemark(limit: 2000, sort: { fields: [frontmatter___date], order: DESC }) {
      edges {
        node {
          fields {
            slug
          }
          excerpt
          timeToRead
          frontmatter {
            title
            tags
            cover
            date
            category
          }
        }
      }
    }
  }
`;
