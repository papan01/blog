import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'gatsby';
import PostCover from '../postCover';
import PostText from '../postText';
import PostTags from '../postTags';
import './style.scss';

const PostCard = ({ data }) => {
  return (
    <article className="post-card">
      <PostCover imagePath={data.cover} wrapClass="post-card-cover" />
      <PostText
        category={data.category}
        date={data.date}
        timeToRead={data.timeToRead}
        wrapClass="post-card-text"
        head={<Link to={data.path}>{data.title}</Link>}
      >
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
