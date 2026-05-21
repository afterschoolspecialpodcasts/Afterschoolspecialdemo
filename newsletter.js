/**
 * newsletter.js
 * After School Special Podcast — The Collective newsletter page
 *
 * Features:
 *   1. Scroll-based reveal (IntersectionObserver, no RAF needed)
 *   2. Parallax hero background (RAF, GPU-only transform)
 *   3. prefers-reduced-motion respected throughout
 *   4. No layout thrashing — reads/writes batched separately
 *   5. No external libraries
 */

(function () {
  'use strict';

  /* ── Reduced motion check ── */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ================================================================
     1. SCROLL REVEAL
     Uses IntersectionObserver (no scroll listener, no RAF needed).
     Adds .nl-revealed when element crosses into viewport.
  ================================================================ */
  const revealEls = document.querySelectorAll('.nl-reveal');

  if (revealEls.length > 0) {
    if (prefersReduced) {
      /* Skip animation — show everything immediately */
      revealEls.forEach(el => el.classList.add('nl-revealed'));
    } else {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('nl-revealed');
              revealObserver.unobserve(entry.target); /* fire once */
            }
          });
        },
        {
          threshold: 0.12,       /* trigger when 12% visible */
          rootMargin: '0px 0px -40px 0px'  /* slightly before bottom edge */
        }
      );
      revealEls.forEach(el => revealObserver.observe(el));
    }
  }

  /* ================================================================
     2. PARALLAX HERO BACKGROUND
     Moves only the .nl-hero-img via transform: translateY
     — compositor-only, zero layout impact, no repaints.
     Capped to a max offset so background never reveals edges.
  ================================================================ */
  const parallaxBg = document.getElementById('nlParallaxBg');

  if (parallaxBg && !prefersReduced) {
    const PARALLAX_FACTOR = 0.28;  /* 0 = no movement, 1 = 1:1 with scroll */
    const MAX_OFFSET_PX   = 80;    /* never move more than this */

    let lastScrollY = window.scrollY;
    let ticking     = false;

    function applyParallax () {
      const scrollY = window.scrollY;
      const heroEl  = parallaxBg.closest('.nl-hero');

      /* Only run while hero is partially visible */
      if (heroEl) {
        const rect = heroEl.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) {
          ticking = false;
          return;
        }
      }

      const rawOffset = scrollY * PARALLAX_FACTOR;
      const offset    = Math.min(rawOffset, MAX_OFFSET_PX);

      /* GPU-only property — no layout, no paint */
      parallaxBg.style.transform = 'translate3d(0,' + offset + 'px,0)';
      ticking = false;
    }

    function onScroll () {
      lastScrollY = window.scrollY;
      if (!ticking) {
        window.requestAnimationFrame(applyParallax);
        ticking = true;
      }
    }

    /* Passive listener = browser can optimise scroll */
    window.addEventListener('scroll', onScroll, { passive: true });

    /* Apply on load so initial state is correct */
    applyParallax();
  }

})();
