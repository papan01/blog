import React from 'react';
import PropTypes from 'prop-types';
import 'prismjs/themes/prism-tomorrow.css';
import { graphql } from 'gatsby';
import Layout from '../layout';
import './post.scss';

const Post = ({ data }) => {
  const post = data.markdownRemark;
  return (
    <Layout>
      <h1>{post.frontmatter.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.html }} />
    </Layout>
  );
};

export const query = graphql`
  query($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
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
`;

Post.propTypes = {
  data: PropTypes.shape({
    markdownRemark: PropTypes.shape({
      html: PropTypes.string.isRequired,
      frontmatter: PropTypes.shape({
        title: PropTypes.string.isRequired,
        tags: PropTypes.arrayOf(PropTypes.string),
        cover: PropTypes.string,
        date: PropTypes.string,
        category: PropTypes.string,
      }).isRequired,
    }).isRequired,
  }).isRequired,
};

export default Post;
