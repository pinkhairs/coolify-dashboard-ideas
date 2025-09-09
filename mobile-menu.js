// Exported init so you can control boot order elsewhere.
export function initMobileMenu() {
  const qs = (s, r = document) => r.querySelector(s);

  const nav = qs('#primary-nav');
  const btn = qs('#btn-hamburger');
  const header = qs('#sidebar-left');

  if (!nav || !btn || !header) return;

  let open = false;

  const applyMobileOpenStyles = () => {
    // Kill Tailwind's "hidden md:block" at runtime
    nav.classList.remove('hidden');
    nav.classList.add('block');

    // Position as an overlay panel under the header
    const top = (header?.offsetHeight || 56) + 'px';
    nav.setAttribute('data-mm', 'open');
    Object.assign(nav.style, {
      position: 'absolute',
      inset: `0 0 auto 0`, // top will be overridden
      top,
      maxHeight: `calc(100vh - ${top})`,
      overflowY: 'auto',
      background: '#fff',
      boxShadow: '0 12px 30px rgba(0,0,0,.12)',
      transform: 'translateY(0)',
      opacity: '1',
      transition: 'opacity .18s ease',
      display: 'block'
    });

    btn.setAttribute('aria-expanded', 'true');
    open = true;
  };

  const applyMobileClosedStyles = () => {
    nav.setAttribute('data-mm', 'closed');
    // Hide without removing from DOM
    Object.assign(nav.style, {
      position: '',
      inset: '',
      top: '',
      maxHeight: '',
      overflowY: '',
      background: '',
      boxShadow: '',
      transform: '',
      opacity: '',
      transition: '',
      display: 'none' // <- actual hide
    });

    // Restore Tailwind’s default for small screens
    nav.classList.add('hidden');
    nav.classList.remove('block');

    btn.setAttribute('aria-expanded', 'false');
    open = false;
  };

  const openMobileNav = () => {
    // Only act on mobile; desktop uses sidebar layout
    if (window.matchMedia('(min-width: 768px)').matches) return;
    applyMobileOpenStyles();
  };

  const closeMobileNav = () => {
    applyMobileClosedStyles();
  };

  // Toggle
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    open ? closeMobileNav() : openMobileNav();
  });

  // Click outside to close
  document.addEventListener('click', (e) => {
    if (!open) return;
    if (e.target.closest('#primary-nav') || e.target.closest('#btn-hamburger')) return;
    closeMobileNav();
  });

  // Keep state sane across resizes
  const mq = window.matchMedia('(min-width: 768px)');
  const handleMQ = () => {
    if (mq.matches) {
      // Desktop: ensure visible as a normal sidebar and clear inline styles
      nav.classList.remove('hidden');
      nav.classList.add('block');
      nav.removeAttribute('style');
      btn.setAttribute('aria-expanded', 'false');
      open = false;
    } else {
      // Mobile default: hidden
      applyMobileClosedStyles();
    }
  };
  mq.addEventListener ? mq.addEventListener('change', handleMQ) : mq.addListener(handleMQ);
  handleMQ();
}
