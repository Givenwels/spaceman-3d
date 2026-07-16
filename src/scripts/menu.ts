export function initMenu() {
  const menuBtn = document.getElementById('header-right-menu-btn');
  const menu = document.getElementById('header-menu');
  if (!menuBtn || !menu) return;

  let isOpen = false;

  menuBtn.addEventListener('click', () => {
    isOpen = !isOpen;

    if (isOpen) {
      menu.classList.add('open');
      menuBtn.classList.add('active');
      document.body.style.overflow = 'hidden';
    } else {
      menu.classList.remove('open');
      menuBtn.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // Close on link click
  const links = menu.querySelectorAll('.header-menu-link');
  links.forEach((link) => {
    link.addEventListener('click', () => {
      isOpen = false;
      menu.classList.remove('open');
      menuBtn.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // Close on escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      isOpen = false;
      menu.classList.remove('open');
      menuBtn.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}
