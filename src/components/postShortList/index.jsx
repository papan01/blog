import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'gatsby';
import './style.scss';

const postShortList = ({ data }) => {
  return (
    <article>
      {data.map(category => (
        <section key={category.fieldValue}>
          <h2>{category.fieldValue}</h2>
          <ul className="post-short-list">
            {category.posts.map(post => (
              <li key={post.title}>
                <p>{post.date}</p>
                <p>{` ☕️ ${post.timeToRead} min read`}</p>
                <Link to={post.slug}>{post.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </article>
  );
};

postShortList.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      fieldValue: PropTypes.string.isRequired,
      posts: PropTypes.arrayOf(
        PropTypes.shape({
          date: PropTypes.string.isRequired,
          timeToRead: PropTypes.number.isRequired,
          slug: PropTypes.string.isRequired,
          title: PropTypes.string.isRequired,
        }),
      ),
    }).isRequired,
  ).isRequired,
};

export default postShortList;
