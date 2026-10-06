'use client';

import { useEffect, useRef, useState } from 'react';

// Background music bar: starts quietly after the first tap/scroll, with Pause and Next.
export default function Player({ tracks }) {
  const audio = useRef(null);
  const idx = useRef(0);
  const muted = useRef(false);
  const list = useRef(tracks);
  const [playing, setPlaying] = useState(false);
  const [title, setTitle] = useState('');

  list.current = tracks;

  const load = () => {
    const t = list.current[idx.current];
    if (!t || !audio.current) return;
    audio.current.src = t.u;
    setTitle(t.n);
  };
  const start = () => {
    if (muted.current || !audio.current) return;
    audio.current.play().catch(() => {});
  };

  useEffect(() => {
    if (!list.current.length) return undefined;
    const a = new Audio();
    a.volume = 0.18;
    a.preload = 'none';
    audio.current = a;
    const nextTrack = () => {
      idx.current = (idx.current + 1) % list.current.length;
      load();
      start();
    };
    a.addEventListener('ended', nextTrack);
    a.addEventListener('pause', () => setPlaying(false));
    a.addEventListener('play', () => setPlaying(true));
    idx.current = Math.floor(Math.random() * list.current.length);
    load();
    const first = () => {
      start();
      ['pointerdown', 'keydown', 'scroll'].forEach((e) => window.removeEventListener(e, first));
    };
    ['pointerdown', 'keydown', 'scroll'].forEach((e) => window.addEventListener(e, first, { passive: true }));
    return () => {
      a.pause();
      ['pointerdown', 'keydown', 'scroll'].forEach((e) => window.removeEventListener(e, first));
    };
  }, []);

  if (!tracks.length) return null;

  const toggle = () => {
    const a = audio.current;
    if (!a) return;
    if (a.paused) { muted.current = false; a.play().catch(() => {}); } else { muted.current = true; a.pause(); }
  };
  const skip = () => {
    idx.current = (idx.current + 1) % list.current.length;
    load();
    muted.current = false;
    audio.current.play().catch(() => {});
  };

  return (
    <div className="player">
      <button type="button" onClick={toggle} aria-label="Play or pause background music">{playing ? 'Pause' : 'Play'}</button>
      <span className="ptitle">♪ {title}</span>
      <button type="button" onClick={skip} aria-label="Next track">Next</button>
    </div>
  );
}
