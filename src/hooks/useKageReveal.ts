import React, { useEffect } from 'react';

/**
 * useKageReveal — Kage temple scroll reveal system.
 *
 * Watches all [data-rv] elements and adds .rv-in when they enter
 * the viewport. Supports three patterns:
 *   data-rv="up"   — slides up 26 px + fades in
 *   data-rv="fade" — fades in only
 *   data-rv="word" — staggered per-word reveal (use with .word-reveal)
 *
 * The corresponding CSS lives in kage-animations.css.
 */
export function useKageReveal(containerRef?: React.RefObject<Element>) {
  useEffect(() => {
    const root = containerRef?.current ?? document;

    const targets = Array.from(
      (root as Document | Element).querySelectorAll('[data-rv]')
    ) as HTMLElement[];

    if (!targets.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const delay = parseFloat(el.dataset.rvDelay ?? '0');
            if (delay > 0) {
              setTimeout(() => el.classList.add('rv-in'), delay);
            } else {
              el.classList.add('rv-in');
            }
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );

    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  });
}
