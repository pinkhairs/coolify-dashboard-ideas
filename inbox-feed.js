export function initInboxFeed() {
  const qs = (s, r = document) => r.querySelector(s);
  const navInbox = qs('#nav-inbox');
  const navDashboard = qs('#nav-dashboard');
  const mobileInboxBtn = qs('#btn-mobile-inbox');
  const feed = qs('#activity-feed');
  const header = qs('#sidebar-left');

  if (!feed || (!navInbox && !mobileInboxBtn)) return;

  // Keep a tiny state
  let open = false;
  let hideTimer = null;

  // Prepare element for animated show/hide
  const primeFeed = () => {
    Object.assign(feed.style, {
      position: 'fixed',
      transition: 'transform .2s ease, opacity .2s ease',
      transform: 'translateX(-12px)',
      opacity: '0',
      display: 'none',        // start hidden
      background: '#fff',
      boxShadow: '0 12px 30px rgba(0,0,0,.12)',
      overflowY: 'auto'
    });
    feed.setAttribute('aria-hidden', 'true');
  };

  const layoutFeed = () => {
    // Mobile = < md (768)
    const isDesktop = window.matchMedia('(min-width: 768px)').matches;
    const headerH = (header?.offsetHeight || 56);
    if (isDesktop) {
      Object.assign(feed.style, {
        top: '0',
        left: '15rem',      // md:w-60 sidebar = 240px = 15rem
        right: '',
        width: '20rem',
        height: '100vh',
        maxHeight: '100vh'
      });
    } else {
      Object.assign(feed.style, {
        top: `${headerH}px`,
        left: '0',
        right: '0',
        width: '100vw',
        height: '',
        maxHeight: `calc(100vh - ${headerH}px)`
      });
    }
  };

  const activateInbox = () => {
    navInbox?.classList.add('bg-gray-100', 'text-purple');
    navDashboard?.classList.remove('bg-gray-100', 'text-purple');
    navDashboard?.classList.add('hover:!bg-gray-100'); // preserve hover feel
  };

  const deactivateInbox = () => {
    navInbox?.classList.remove('bg-gray-100', 'text-purple');
    // Return Dashboard to default selected state
    navDashboard?.classList.add('bg-gray-100', 'text-purple');
  };

  const showFeed = () => {
    clearTimeout(hideTimer);
    layoutFeed();
    feed.style.display = 'block';
    requestAnimationFrame(() => {
      feed.style.transform = 'translateX(0)';
      feed.style.opacity = '1';
      feed.setAttribute('aria-hidden', 'false');
    });
    open = true;
  };

  const hideFeed = () => {
    feed.style.transform = 'translateX(-12px)';
    feed.style.opacity = '0';
    feed.setAttribute('aria-hidden', 'true');
    hideTimer = setTimeout(() => {
      if (feed.getAttribute('aria-hidden') === 'true') {
        feed.style.display = 'none';
      }
    }, 180);
    open = false;
  };

  const openInbox = () => {
    activateInbox();
    showFeed();
  };

  const closeInbox = () => {
    deactivateInbox();
    hideFeed();
  };

  const toggle = () => (open ? closeInbox() : openInbox());

  // Initial prep
  primeFeed();

  // Triggers
  navInbox?.addEventListener('click', (e) => { e.preventDefault(); toggle(); });
  mobileInboxBtn?.addEventListener('click', (e) => { e.preventDefault(); toggle(); });

  // Click outside closes
  document.addEventListener('click', (e) => {
    if (!open) return;
    if (e.target.closest('#activity-feed')) return;
    if (e.target.closest('#nav-inbox')) return;
    if (e.target.closest('#btn-mobile-inbox')) return;
    closeInbox();
  });

  // ESC closes
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && open) closeInbox();
  });

  // Keep layout correct across resizes
  const mq = window.matchMedia('(min-width: 768px)');
  const handleMQ = () => {
    if (open) layoutFeed();
    else primeFeed();
  };
  mq.addEventListener ? mq.addEventListener('change', handleMQ) : mq.addListener(handleMQ);
  window.addEventListener('resize', () => { if (open) layoutFeed(); }, { passive: true });
  handleMQ();

  // --- “Mark as read” behavior (event delegation) ---
  feed.addEventListener('click', (e) => {
    const btn = e.target.closest('.mark-read');
    if (!btn) return;
    const li = btn.closest('.activity-item');
    if (!li) return;

    // Visually dim + make it non-interactive
    li.style.opacity = '0.5';
    btn.textContent = 'Undo';
    btn.style.cursor = 'default';
    btn.style.textDecoration = 'none';
  });
}
