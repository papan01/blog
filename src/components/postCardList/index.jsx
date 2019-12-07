import React from 'react';
import PropTypes from 'prop-types';
import PostCard from '../postCard';
import './style.scss';

const PostCardList = ({ posts }) => {
  return (
    <div className="posts">
      {posts.map(post => (
        <PostCard key={post.title} data={post} />
      ))}
    </div>
  );
};

PostCardList.propTypes = {
  posts: PropTypes.arrayOf(
    PropTypes.shape({
      path: PropTypes.string,
      tags: PropTypes.arrayOf(PropTypes.string),
      cover: PropTypes.any,
      title: PropTypes.string,
      category: PropTypes.string,
      date: PropTypes.string,
      timeToRead: PropTypes.number,
      excerpt: PropTypes.string,
    }),
  ).isRequired,
};

export default React.memo(PostCardList);
