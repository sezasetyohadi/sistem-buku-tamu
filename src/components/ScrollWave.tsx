'use client';

import { useEffect } from 'react';

export default function ScrollWave() {
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * -0.5;
      
      // Animate wave elements
      const waves = document.querySelectorAll('.wave-element');
      waves.forEach((wave, index) => {
        const speed = (index + 1) * 0.3;
        (wave as HTMLElement).style.transform = `translateX(${rate * speed}px) scaleX(${1 + Math.sin(scrolled * 0.01 + index) * 0.1})`;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return null;
}
