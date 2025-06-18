// frontend/src/components/common/AnimatedNumber.jsx
import React, { useState, useEffect, useRef } from 'react';
const AnimatedNumber = ({ value }) => {
  const [currentValue, setCurrentValue] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const currentRef = ref.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const duration = 1500; 
          const increment = value / (duration / 10); 
          const timer = setInterval(() => {
            start += increment;
            if (start > value) {
              start = value;
              clearInterval(timer);
            }
            setCurrentValue(Math.floor(start));
          }, 10);
          observer.disconnect(); 
        }
      },
      { threshold: 0.5 } 
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [value]); 

  return <span ref={ref}>{currentValue}</span>;
};

export default AnimatedNumber;