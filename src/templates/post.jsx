import React from 'react';
import PropTypes from 'prop-types';
import { Disqus } from 'gatsby-plugin-disqus';
import 'prismjs/themes/prism-tomorrow.css';
import { graphql } from 'gatsby';
import Layout from '../layout';
import PostText from '../components/postText';
import PostTags from '../components/postTags';
import PostCover from '../components/postCover';
import SEO from '../components/SEO';
import './post.scss';
import config from '../../config/siteConfig';

const Post = ({ data, pageContext }) => {
  const post = data.markdownRemark;
  const { html, excerpt, timeToRead, frontmatter } = post;
  const { title, tags, cover, date, category } = frontmatter;
  const { slug } = pageContext;
  const disqusConfig = {
    url: `${config.siteUrl + config.pathPrefix + slug}`,
    identifier: title,
    title,
  };
  return (
    <Layout>
      <SEO title={title} description={excerpt} image={cover} path={slug} articleDate={date} />
      <PostText category={category} date={date} timeToRead={timeToRead} wrapClass="post-head" head={title}>
        <PostTags tags={tags} />
      </PostText>
      <hr />
      <PostCover imagePath={cover} />
      <div className="post-content" dangerouslySetInnerHTML={{ __html: html }} />
      <Disqus config={disqusConfig} />
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
      excerpt: PropTypes.string.isRequired,
      timeToRead: PropTypes.number.isRequired,
      frontmatter: PropTypes.shape({
        title: PropTypes.string.isRequired,
        tags: PropTypes.arrayOf(PropTypes.string),
        cover: PropTypes.string,
        date: PropTypes.string,
        category: PropTypes.string,
      }).isRequired,
    }).isRequired,
  }).isRequired,
  pageContext: PropTypes.shape({
    slug: PropTypes.string.isRequired,
  }).isRequired,
};

export default Post;
