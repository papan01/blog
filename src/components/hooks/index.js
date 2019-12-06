import { useState, useEffect } from 'react';

const getWindowDimensions = () => {
  const windowDimensions = { width: 0, height: 0 };
  if (typeof window !== 'undefined') {
    const { innerWidth: width, innerHeight: height } = window;
    windowDimensions.width = width;
    windowDimensions.height = height;
    return windowDimensions;
  }
  return windowDimensions;
};

const useWindowDimensions = () => {
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());
  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions(getWindowDimensions());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
};

export const useIsMobile = () => {
  const windowDimensions = useWindowDimensions();
  const mobile = !(windowDimensions.width > 768);
  return mobile;
};

export default useWindowDimensions;
