import React from 'react';
import PropTypes from 'prop-types';
import PostCover from '../postCover';
import PostText from '../postText';
import PostTags from '../postTags';
import './style.scss';

const PostCard = ({ data }) => {
  return (
    <article className="post-card">
      <PostCover imagePath={data.cover} wrapClass="post-card-cover" />
      <PostText data={data} wrapClass="post-card-text">
        <p>{data.excerpt}</p>
        <PostTags tags={data.tags} />
      </PostText>
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
    timeToRead: PropTypes.number,
  }).isRequired,
};

export default React.memo(PostCard);
