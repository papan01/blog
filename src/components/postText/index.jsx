import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Link } from 'gatsby';
import './style.scss';

const PostText = ({ data, wrapClass, children }) => {
  return (
    <div className={wrapClass}>
      <Link to={data.path}>
        <h3 className="post-title">{data.title}</h3>
      </Link>
      <div className="post-subtitle">
        {data.category && (
          <Link to={`/categories/${_.kebabCase(data.category)}`}>
            <span className="post-category">{data.category}</span>
          </Link>
        )}
        <span>
          <i className="fas fa-calendar-alt" style={{ marginRight: '4px' }} />
          {data.date}
        </span>
        <span>{` • ${data.timeToRead} min read`}</span>
      </div>
      {children}
    </div>
  );
};

PostText.propTypes = {
  data: PropTypes.shape({
    path: PropTypes.string,
    title: PropTypes.string,
    category: PropTypes.string,
    date: PropTypes.string,
    timeToRead: PropTypes.number,
  }).isRequired,
  wrapClass: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default React.memo(PostText);
