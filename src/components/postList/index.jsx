import React from 'react';
import PropTypes from 'prop-types';
import PostCard from '../postCard';
import './style.scss';

const PostList = ({ posts }) => {
  return (
    <div className="posts">
      {posts.map(post => (
        <PostCard key={post.title} data={post} />
      ))}
    </div>
  );
};

PostList.propTypes = {
  posts: PropTypes.arrayOf(
    PropTypes.shape({
      path: PropTypes.string,
      tags: PropTypes.arrayOf(PropTypes.string),
      cover: PropTypes.string,
      title: PropTypes.string,
      category: PropTypes.string,
      date: PropTypes.string,
      timeToRead: PropTypes.number,
      excerpt: PropTypes.string,
    }),
  ).isRequired,
};

export default React.memo(PostList);
