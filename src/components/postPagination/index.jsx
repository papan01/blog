import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'gatsby';
import './style.scss';

const PostPagination = ({ currentPage, numPages }) => {
  const isFirst = currentPage === 1;
  const isLast = currentPage === numPages;
  const prevPage = currentPage - 1 === 1 ? '/' : (currentPage - 1).toString();
  const nextPage = (currentPage + 1).toString();

  return (
    <div className="post-pagination">
      <div className="pagination-prev">
        {!isFirst && (
          <Link to={prevPage} rel="prev">
            <i className="fas fa-arrow-left" />
            Previous Page
          </Link>
        )}
      </div>
      <div className="pagination-number">
        {Array.from({ length: numPages }, (_, i) => (
          <Link key={`pagination-number${i + 1}`} to={`/${i === 0 ? '' : i + 1}`} activeClassName="active">
            {i + 1}
          </Link>
        ))}
      </div>
      <div className="pagination-next">
        {!isLast && (
          <Link to={nextPage} rel="next">
            Next Page
            <i className="fas fa-arrow-right" />
          </Link>
        )}
      </div>
    </div>
  );
};

PostPagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  numPages: PropTypes.number.isRequired,
};

export default PostPagination;
