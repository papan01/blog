import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import './style.scss';

const ScrollToTop = () => {
  const [scroller, setScroller] = useState(0);

  const handleScroll = () => {
    if (typeof document !== 'undefined') {
      setScroller(document.documentElement.scrollTop);
    }
  };

  const clickToTop = () => {
    if (typeof window !== 'undefined') {
      window.scroll({ top: 0, left: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll);
    }
  }, []);

  const toTopClass = classNames({
    'to-top': true,
    'to-top-active': scroller > 400,
  });

  return (
    <div role="button" tabIndex="-1" className={toTopClass} onClick={clickToTop} onKeyPress={clickToTop}>
      ⬆
    </div>
  );
};

export default ScrollToTop;
