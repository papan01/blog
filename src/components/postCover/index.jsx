import React from 'react';
import Img from 'gatsby-image';
import PropTypes from 'prop-types';
import { useStaticQuery, graphql } from 'gatsby';

const PostCover = ({ imagePath }) => {
  const data = useStaticQuery(graphql`
    query {
      allFile {
        edges {
          node {
            relativePath
            name
            childImageSharp {
              fluid(maxWidth: 1280) {
                ...GatsbyImageSharpFluid
              }
            }
          }
        }
      }
    }
  `);
  const image = data.allFile.edges.find(n => {
    return n.node.relativePath.includes(imagePath);
  });
  return image ? <Img fluid={image.node.childImageSharp.fluid} className="post-card-cover" /> : null;
};

PostCover.propTypes = {
  imagePath: PropTypes.string.isRequired,
};

export default PostCover;
