import React from 'react';
import { Link } from 'gatsby';
import PropTypes from 'prop-types';
import PostCover from '../postCover';
import './style.scss';

const PostCard = ({ data }) => {
  return (
    <article className="post-card">
      <PostCover imagePath={data.cover} />
      <div className="post-card-detail">
        <Link to="/">{data.category}</Link>
        <h3 className="post-card-title">{data.title}</h3>
        <p>{data.date}</p>
        <p>{data.excerpt}</p>
      </div>
    </article>
  );
};

PostCard.propTypes = {
  data: PropTypes.shape({
    path: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    cover: PropTypes.string,
    title: PropTypes.string,
    category: PropTypes.string,
    date: PropTypes.string,
    excerpt: PropTypes.string,
  }).isRequired,
};

export default React.memo(PostCard);
