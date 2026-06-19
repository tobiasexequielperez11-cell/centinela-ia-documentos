'use client';

import { useEffect } from 'react';

export function LandingHashNavigation() {
  useEffect(() => {
    const cleanAddress = () => {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    };

    const initialHash = window.location.hash;
    if (initialHash) {
      const initialSection = document.querySelector<HTMLElement>(initialHash);
      if (initialSection) {
        window.requestAnimationFrame(() => {
          initialSection.scrollIntoView({ block: 'start' });
          cleanAddress();
        });
      }
    }

    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest<HTMLAnchorElement>('a[href^="#"]');
      const hash = anchor?.getAttribute('href');
      if (!anchor || !hash || hash === '#') return;

      const section = document.querySelector<HTMLElement>(hash);
      if (!section) return;

      event.preventDefault();
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      cleanAddress();
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  return null;
}
