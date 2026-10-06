'use client';

import { useEffect, useRef } from 'react';

// Photo strip that advances to the next picture every few seconds.
// Pauses while the visitor is touching/hovering it or a video is playing,
// and is off for people who prefer reduced motion.
export default function Gallery({ children, style, interval = 4000 }) {
  const ref = useRef(null);
  const paused = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const pause = () => { paused.current = true; };
    const resume = () => { setTimeout(() => { paused.current = false; }, 2500); };
    el.addEventListener('mouseenter', pause);
    el.addEventListener('mouseleave', resume);
    el.addEventListener('touchstart', pause, { passive: true });
    el.addEventListener('touchend', resume, { passive: true });
    el.addEventListener('play', pause, true);
    el.addEventListener('pause', resume, true);
    const timer = setInterval(() => {
      if (paused.current || document.hidden) return;
      const rect = el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return; // off-screen
      const items = Array.from(el.children);
      if (items.length < 2) return;
      const left = el.scrollLeft;
      const next = items.find((c) => c.offsetLeft - items[0].offsetLeft > left + 4);
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      if (!next || atEnd) el.scrollTo({ left: 0, behavior: 'smooth' });
      else el.scrollTo({ left: next.offsetLeft - items[0].offsetLeft, behavior: 'smooth' });
    }, interval);
    return () => {
      clearInterval(timer);
      el.removeEventListener('mouseenter', pause);
      el.removeEventListener('mouseleave', resume);
      el.removeEventListener('touchstart', pause);
      el.removeEventListener('touchend', resume);
      el.removeEventListener('play', pause, true);
      el.removeEventListener('pause', resume, true);
    };
  }, [interval]);

  return <div ref={ref} style={style}>{children}</div>;
}
