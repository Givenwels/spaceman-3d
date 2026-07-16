import { initPreloader } from './preloader';
import { initThreeScene } from './three-scene';
import { initAnimations } from './animations';
import { initMenu } from './menu';
import { initVideoOverlay } from './video-overlay';

// Astro module scripts are deferred — DOM is already ready
window.scrollTo(0, 0);

initPreloader(() => {
  initThreeScene();
  initAnimations();
  initMenu();
  initVideoOverlay();
  initScrollIndicator();
  initSoundButton();
  initScrollToTop();
  initNewsletterForms();
});

function initScrollIndicator() {
  const bar = document.getElementById('scroll-indicator-bar');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.height = `${percent}%`;
  }, { passive: true });
}

function initSoundButton() {
  const btn = document.getElementById('header-right-sound-btn');
  if (!btn) return;

  const canvas = btn.querySelector('canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = 48;
  canvas.height = 48;

  let active = false;
  let frame = 0;

  function drawBars() {
    if (!ctx) return;
    ctx.clearRect(0, 0, 48, 48);

    const barCount = 4;
    const barWidth = 3;
    const gap = 5;
    const totalWidth = barCount * barWidth + (barCount - 1) * gap;
    const startX = (48 - totalWidth) / 2;

    for (let i = 0; i < barCount; i++) {
      const x = startX + i * (barWidth + gap);
      let h: number;

      if (active) {
        h = 8 + Math.sin(frame * 0.08 + i * 1.2) * 8;
      } else {
        h = 4;
      }

      const y = (48 - h) / 2;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillRect(x, y, barWidth, h);
    }

    frame++;
    requestAnimationFrame(drawBars);
  }

  drawBars();

  btn.addEventListener('click', () => {
    active = !active;
  });
}

function initScrollToTop() {
  const btn = document.getElementById('footer-bottom-up');
  if (!btn) return;

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function initNewsletterForms() {
  const forms = [
    { form: 'header-menu-newsletter-form', feedback: 'header-menu-newsletter-feedback-message' },
    { form: 'footer-newsletter-form', feedback: 'footer-newsletter-feedback-message' },
  ];

  forms.forEach(({ form: formId, feedback: feedbackId }) => {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    const feedback = document.getElementById(feedbackId);
    if (!form || !feedback) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]') as HTMLInputElement;
      if (input && input.value) {
        feedback.textContent = 'Thank you for subscribing!';
        input.value = '';
        setTimeout(() => {
          feedback.textContent = '';
        }, 3000);
      }
    });
  });
}
