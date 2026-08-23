/**
 * shared.js — mrjones.org.uk
 * Injects a hidden slide-out menu, opened by a ☰ button in the top-left.
 * Usage: <script src="/shared.js"></script>  (anywhere in <head> or <body>)
 *
 * The path is absolute, so it only loads when the page is served from the
 * site — open an app file locally and it simply runs without the menu.
 */

(function () {
  const NAV_ITEMS = [
    { label: 'Home',        icon: 'HM', href: '/'            },
    { label: 'Nim',         icon: '01', href: '/nim/'        },
    { label: 'Hanoi',       icon: '02', href: '/hanoi/'      },
    { label: 'Mastermind',  icon: '03', href: '/mastermind/' },
    { label: 'Build a PC',  icon: '04', href: '/buildapc/'   },
  ];

  /* ── Styles ─────────────────────────────────────────────────────── */
  const css = `
    :root { --mrj-z: 100000; }

    /* ── Hamburger button (top-left, over the header) ── */
    #mrj-burger {
      position: fixed; top: 8px; left: 10px;
      z-index: var(--mrj-z);
      width: 44px; height: 40px;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center; gap: 5px;
      background: #fbfaf3;
      border: 2px solid #71828b;
      border-radius: 9px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.12);
      cursor: pointer; padding: 0;
      transition: background 0.14s;
    }
    #mrj-burger:hover { background: #e7f0f6; }
    #mrj-burger span {
      display: block; width: 20px; height: 2.5px; border-radius: 2px;
      background: #1e1e1e;
      transition: transform 0.22s, opacity 0.18s;
    }
    /* morph the bars into an X while open */
    html.mrj-open #mrj-burger span:nth-child(1) { transform: translateY(7.5px) rotate(45deg); }
    html.mrj-open #mrj-burger span:nth-child(2) { opacity: 0; }
    html.mrj-open #mrj-burger span:nth-child(3) { transform: translateY(-7.5px) rotate(-45deg); }

    /* ── Dim backdrop ── */
    #mrj-backdrop {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.38);
      z-index: calc(var(--mrj-z) - 2);
      opacity: 0; visibility: hidden;
      transition: opacity 0.25s, visibility 0.25s;
    }
    html.mrj-open #mrj-backdrop { opacity: 1; visibility: visible; }

    /* ── Slide-out drawer ── */
    #mrj-drawer {
      position: fixed; top: 0; left: 0; bottom: 0;
      width: 250px; max-width: 80vw;
      z-index: calc(var(--mrj-z) - 1);
      background: #ffffff;
      border-right: 2px solid #15283a;
      box-shadow: 4px 0 24px rgba(0,0,0,0.18);
      transform: translateX(-100%);
      transition: transform 0.25s ease;
      display: flex; flex-direction: column;
      font-family: Verdana, Arial, sans-serif;
    }
    html.mrj-open #mrj-drawer { transform: translateX(0); }

    #mrj-drawer .mrj-head {
      background: #fbfaf3;
      border-bottom: 2px solid #cbd4d1;
      padding: 14px 16px 14px 64px;   /* leave room for the ☰ button */
      display: flex; align-items: center; justify-content: space-between;
      min-height: 56px;
    }
    #mrj-drawer .mrj-head b { font: 700 1.1rem "Courier New", monospace; color: #15283a; }
    #mrj-drawer .mrj-head b .mrj-prompt, #mrj-drawer .mrj-head b .mrj-cursor { color: #497994; }
    #mrj-drawer .mrj-close {
      background: none; border: none; cursor: pointer;
      font-size: 1.6rem; line-height: 1; color: #888880; padding: 0 2px;
    }
    #mrj-drawer .mrj-close:hover { color: #1e1e1e; }

    #mrj-drawer nav { padding: 10px; display: flex; flex-direction: column; gap: 2px; }
    #mrj-drawer a {
      display: flex; align-items: center; gap: 11px;
      padding: 11px 13px; border-radius: 8px;
      text-decoration: none; color: #1e1e1e;
      font-size: 0.95rem; font-weight: 700;
    }
    #mrj-drawer a .mrj-ic { width: 2.35em; height: 2.35em; display: grid; place-items: center; border: 2px solid #15283a; border-radius: 50%; background: #ffffff; font: 800 .68rem Verdana, sans-serif; text-align: center; }
    #mrj-drawer a:hover { background: #e7f0f6; }
    #mrj-drawer a.mrj-active { background: #dcefe7; }
    #mrj-drawer a.mrj-home { color: #174c78; }
  `;

  /* ── Build & wire up once the DOM is ready ──────────────────────── */
  function init() {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    const root = document.documentElement;
    const currentPath = location.pathname.replace(/\/?$/, '/');

    /* Hamburger button */
    const burger = document.createElement('button');
    burger.id = 'mrj-burger';
    burger.type = 'button';
    burger.setAttribute('aria-controls', 'mrj-drawer');
    burger.setAttribute('aria-label', 'Open menu');
    burger.setAttribute('aria-expanded', 'false');
    burger.innerHTML = '<span></span><span></span><span></span>';

    /* Backdrop */
    const backdrop = document.createElement('div');
    backdrop.id = 'mrj-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');

    /* Drawer */
    const drawer = document.createElement('aside');
    drawer.id = 'mrj-drawer';
    drawer.setAttribute('aria-hidden', 'true');
    drawer.inert = true;

    const head = document.createElement('div');
    head.className = 'mrj-head';
    head.innerHTML = '<b><span class="mrj-prompt">&gt;</span> tj<span class="mrj-cursor">_</span></b>';
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'mrj-close';
    closeBtn.setAttribute('aria-label', 'Close menu');
    closeBtn.innerHTML = '&times;';
    head.appendChild(closeBtn);

    const nav = document.createElement('nav');
    NAV_ITEMS.forEach(({ label, icon, href }) => {
      const a = document.createElement('a');
      a.href = href;
      a.innerHTML = '<span class="mrj-ic">' + icon + '</span>' + label;

      const normHref = href.replace(/\/?$/, '/');
      const active = href === '/' ? currentPath === '/' : currentPath.startsWith(normHref);
      if (active) a.classList.add('mrj-active');
      if (href === '/') a.classList.add('mrj-home');

      nav.appendChild(a);
    });

    drawer.appendChild(head);
    drawer.appendChild(nav);

    /* Open / close */
    function open() {
      root.classList.add('mrj-open');
      drawer.inert = false;
      burger.setAttribute('aria-expanded', 'true');
      burger.setAttribute('aria-label', 'Close menu');
      drawer.setAttribute('aria-hidden', 'false');
      requestAnimationFrame(() => nav.querySelector('a')?.focus());
    }
    function close() {
      root.classList.remove('mrj-open');
      drawer.inert = true;
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Open menu');
      drawer.setAttribute('aria-hidden', 'true');
      burger.focus();
    }
    function toggle() { root.classList.contains('mrj-open') ? close() : open(); }

    burger.addEventListener('click', toggle);
    backdrop.addEventListener('click', close);
    closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

    document.body.appendChild(backdrop);
    document.body.appendChild(drawer);
    document.body.appendChild(burger);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
