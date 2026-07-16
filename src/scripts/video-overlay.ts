export function initVideoOverlay() {
  const overlay = document.getElementById('video-overlay');
  const watchBtn = document.getElementById('home-reel-video-watch-btn');
  const videoContainer = document.getElementById('home-reel-video-container');
  const closeBtn = document.getElementById('video-overlay__mobile-close-btn');
  const playBtn = document.getElementById('video-overlay__play-btn');
  const muteBtn = document.getElementById('video-overlay__mute-btn');
  const progressBar = document.getElementById('video-overlay__progress-active');

  if (!overlay) return;

  let isPlaying = false;
  let isMuted = false;
  let progress = 0;
  let progressInterval: number | null = null;

  function openOverlay() {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    startProgress();
  }

  function closeOverlay() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    stopProgress();
    progress = 0;
    if (progressBar) progressBar.style.width = '0%';
  }

  function startProgress() {
    isPlaying = true;
    if (playBtn) playBtn.textContent = 'PAUSE';
    progressInterval = window.setInterval(() => {
      progress += 0.2;
      if (progress >= 100) {
        progress = 0;
      }
      if (progressBar) progressBar.style.width = `${progress}%`;
    }, 100);
  }

  function stopProgress() {
    isPlaying = false;
    if (playBtn) playBtn.textContent = 'PLAY';
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
  }

  if (watchBtn) {
    watchBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openOverlay();
    });
  }

  if (videoContainer) {
    videoContainer.addEventListener('click', openOverlay);
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeOverlay);
  }

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (isPlaying) {
        stopProgress();
      } else {
        startProgress();
      }
    });
  }

  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      isMuted = !isMuted;
      muteBtn.textContent = isMuted ? 'UNMUTE' : 'MUTE';
    });
  }

  // Close on overlay background click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeOverlay();
    }
  });

  // Close on escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      closeOverlay();
    }
  });
}
