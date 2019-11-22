import React from 'react';
import Img from 'gatsby-image';
import PropTypes from 'prop-types';
import { useStaticQuery, graphql } from 'gatsby';

const PostCover = ({ imagePath, wrapClass }) => {
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
  return image ? <Img fluid={image.node.childImageSharp.fluid} className={wrapClass} /> : null;
};

PostCover.propTypes = {
  imagePath: PropTypes.string.isRequired,
  wrapClass: PropTypes.string.isRequired,
};

export default React.memo(PostCover);
