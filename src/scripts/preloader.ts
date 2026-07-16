export function initPreloader(onComplete: () => void) {
  const preloader = document.getElementById('preloader');
  if (!preloader) {
    onComplete();
    return;
  }

  const digits = preloader.querySelectorAll('.preloader-percent-digit');
  let progress = 0;
  const duration = 1800;
  const startTime = performance.now();

  function easeOutExpo(t: number): number {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function updateDigits(value: number) {
    const str = String(Math.min(Math.floor(value), 100)).padStart(3, '0');
    digits.forEach((digit, i) => {
      const numEl = digit.querySelector('.preloader-percent-digit-num');
      if (numEl) {
        numEl.textContent = str[i];
      }
    });
  }

  function animate(now: number) {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / duration, 1);
    progress = easeOutExpo(t) * 100;

    updateDigits(progress);

    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      updateDigits(100);
      setTimeout(() => {
        preloader.classList.add('hidden');
        setTimeout(() => {
          onComplete();
        }, 400);
      }, 300);
    }
  }

  requestAnimationFrame(animate);
}
