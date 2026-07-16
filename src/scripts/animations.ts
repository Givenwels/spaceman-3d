import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initAnimations() {
  initHeroReveal();
  initScrollReveals();
  initParallax();
  initProjectCards();
  initHeaderScroll();
  initTunnelTitle();
  initReelSection();
  initEndSection();
}

function initHeroReveal() {
  const title = document.getElementById('home-hero-title');
  if (!title) return;

  const text = title.textContent || '';
  const words = text.trim().split(/\s+/);
  title.innerHTML = words.map(word =>
    `<span class="word"><span class="word-inner">${word}</span></span>`
  ).join(' ');

  gsap.set('.word-inner', { y: '110%' });

  gsap.to('.word-inner', {
    y: '0%',
    duration: 1,
    ease: 'expo.out',
    stagger: 0.04,
    delay: 0.2,
  });

  // Scroll indicator
  const scrollContainer = document.getElementById('home-hero-scroll-container');
  if (scrollContainer) {
    gsap.from(scrollContainer, {
      opacity: 0,
      y: 20,
      duration: 1,
      delay: 1.2,
      ease: 'expo.out',
    });

    gsap.to(scrollContainer, {
      opacity: 0,
      scrollTrigger: {
        trigger: '#home-hero',
        start: 'top top',
        end: '30% top',
        scrub: true,
      },
    });
  }
}

function initScrollReveals() {
  const revealElements = document.querySelectorAll('.reveal-up, .reveal-fade, .reveal-scale');

  revealElements.forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => el.classList.add('revealed'),
    });
  });

  const staggerGroups = document.querySelectorAll('.stagger-children');
  staggerGroups.forEach((group) => {
    ScrollTrigger.create({
      trigger: group,
      start: 'top 80%',
      once: true,
      onEnter: () => group.classList.add('revealed'),
    });
  });
}

function initParallax() {
  // Goal section images
  const imageIn = document.getElementById('home-goal-image-in-inner');
  const imageOut = document.getElementById('home-goal-image-out-inner');

  if (imageIn) {
    gsap.to(imageIn, {
      y: '-15%',
      ease: 'none',
      scrollTrigger: {
        trigger: '#home-goal-image-in-outer',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      },
    });
  }

  if (imageOut) {
    gsap.to(imageOut, {
      y: '-10%',
      ease: 'none',
      scrollTrigger: {
        trigger: '#home-goal-image-out-outer',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      },
    });
  }
}

function initProjectCards() {
  const items = document.querySelectorAll('.project-item');

  items.forEach((item, index) => {
    gsap.from(item, {
      y: 80,
      opacity: 0,
      duration: 0.8,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: item,
        start: 'top 90%',
        once: true,
      },
      delay: (index % 2) * 0.12,
    });

    // Magnetic hover effect
    const el = item as HTMLElement;
    el.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(el, {
        x: x * 0.03,
        y: y * 0.03,
        duration: 0.4,
        ease: 'power2.out',
      });
    });

    el.addEventListener('mouseleave', () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: 'elastic.out(1, 0.5)',
      });
    });
  });
}

function initHeaderScroll() {
  const header = document.getElementById('header');
  if (!header) return;

  let lastScroll = 0;
  let headerHidden = false;

  ScrollTrigger.create({
    start: 'top top',
    end: 'max',
    onUpdate: (self) => {
      const currentScroll = self.scroll();
      const direction = self.direction;

      if (currentScroll > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      if (direction === 1 && currentScroll > 300 && !headerHidden) {
        gsap.to(header, { y: -80, duration: 0.4, ease: 'power2.inOut' });
        headerHidden = true;
      } else if (direction === -1 && headerHidden) {
        gsap.to(header, { y: 0, duration: 0.4, ease: 'power2.inOut' });
        headerHidden = false;
      }

      lastScroll = currentScroll;
    },
  });
}

function initTunnelTitle() {
  const lines = document.querySelectorAll('.home-goal-tunnel-title-line');

  lines.forEach((line, i) => {
    gsap.from(line, {
      y: 60,
      opacity: 0,
      scale: 0.95,
      duration: 1,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: '#home-goal-tunnel-title',
        start: 'top 75%',
        once: true,
      },
      delay: i * 0.15,
    });
  });

  // Parallax on tunnel title
  gsap.to('#home-goal-tunnel-title', {
    y: -60,
    ease: 'none',
    scrollTrigger: {
      trigger: '#home-goal-tunnel-title',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1.5,
    },
  });
}

function initReelSection() {
  // Title lines
  gsap.from('#home-reel-title-line-1', {
    x: -40,
    opacity: 0,
    duration: 0.8,
    ease: 'expo.out',
    scrollTrigger: {
      trigger: '#home-reel',
      start: 'top 70%',
      once: true,
    },
  });

  gsap.from('#home-reel-title-line-2', {
    x: -40,
    opacity: 0,
    duration: 0.8,
    ease: 'expo.out',
    delay: 0.1,
    scrollTrigger: {
      trigger: '#home-reel',
      start: 'top 70%',
      once: true,
    },
  });

  // Video container scale-in
  gsap.from('#home-reel-video-container', {
    scale: 0.85,
    opacity: 0,
    duration: 1.2,
    ease: 'expo.out',
    scrollTrigger: {
      trigger: '#home-reel-video-container',
      start: 'top 80%',
      once: true,
    },
  });
}

function initEndSection() {
  // CTA box
  gsap.from('#end-section-content', {
    scale: 0.9,
    opacity: 0,
    duration: 1,
    ease: 'expo.out',
    scrollTrigger: {
      trigger: '#end-section',
      start: 'top 70%',
      once: true,
    },
  });

  // Title text
  gsap.from('#end-section-title-link', {
    y: 40,
    opacity: 0,
    duration: 0.8,
    ease: 'expo.out',
    delay: 0.2,
    scrollTrigger: {
      trigger: '#end-section',
      start: 'top 70%',
      once: true,
    },
  });

  // Decorative circles
  const decorations = [
    '#end-section-title-top-decoration',
    '#end-section-title-bottom-left-decoration',
    '#end-section-title-bottom-right-decoration',
  ];

  decorations.forEach((sel, i) => {
    gsap.from(sel, {
      scale: 0,
      opacity: 0,
      duration: 0.6,
      ease: 'back.out(2)',
      delay: 0.4 + i * 0.1,
      scrollTrigger: {
        trigger: '#end-section',
        start: 'top 70%',
        once: true,
      },
    });
  });
}
