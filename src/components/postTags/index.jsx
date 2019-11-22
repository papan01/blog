import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Link } from 'gatsby';
import './style.scss';

const PostTags = ({ tags }) => {
  return (
    <div className="post-tags">
      {tags.map(tag => (
        <Link key={tag} to={`/tags/${_.kebabCase(tag)}`}>
          <span className="post-tag">{`🏷${tag}`}</span>
        </Link>
      ))}
    </div>
  );
};

PostTags.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default React.memo(PostTags);
