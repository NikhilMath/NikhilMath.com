// Makes the macOS-style traffic lights on the site's windows work, and opens
// internal pages (like the resume) as their own window over the page instead
// of navigating to them.
//
// Red closes, yellow minimizes to a dock, green zooms. A page only needs a
// `.window` containing a `.chrome` with three spans, plus this script. Inside
// an embedded window, the lights ask the parent page to act instead.
(() => {
  "use strict";

  const win = document.querySelector(".window");
  const lights = win && win.querySelectorAll(".chrome > span");
  if (!lights || lights.length < 3) return;
  const [red, yellow, green] = lights;

  const embedded = window.self !== window.top;
  const path = location.pathname;
  const isHome = !/^\/resume(\/|$)/.test(path);
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Internal pages that open as windows over the current page.
  const APPS = {
    "/resume/": { label: "Resume", icon: "CV" },
  };
  const slash = p => (p.endsWith("/") ? p : `${p}/`);
  const here = slash(path);
  const modified = e => e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
  function appFor(link) {
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin) return null;
    const key = slash(url.pathname);
    return APPS[key] && key !== here ? key : null;
  }

  const glyph = paths =>
    `url("data:image/svg+xml,${encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'>${paths}</svg>`
    )}")`;
  const ink = "stroke='rgba(0,0,0,0.55)' stroke-width='1.4' stroke-linecap='round'";

  const style = document.createElement("style");
  style.textContent = `
    .chrome > span { position: relative; cursor: pointer; }
    .chrome > span::after {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: center / 100% no-repeat;
      opacity: 0;
      transition: opacity 120ms ease;
    }
    .chrome:hover > span::after,
    .chrome:focus-within > span::after { opacity: 1; }
    .chrome > span:nth-child(1)::after { background-image: ${glyph(`<path d='M4 4l4 4M8 4l-4 4' ${ink}/>`)}; }
    .chrome > span:nth-child(2)::after { background-image: ${glyph(`<path d='M3.5 6h5' ${ink}/>`)}; }
    .chrome > span:nth-child(3)::after { background-image: ${glyph("<path d='M3.6 3.6h3.3L3.6 6.9z M8.4 8.4H5.1l3.3-3.3z' fill='rgba(0,0,0,0.55)'/>")}; }
    .chrome > span:active { filter: brightness(0.8); }
    .chrome > span:focus-visible { outline: 2px solid var(--accent, #ffb86c); outline-offset: 2px; }

    .window { transition: max-width 320ms cubic-bezier(0.2, 0.8, 0.2, 1); }
    .window.zoomed { max-width: min(1200px, 100%); }

    .app-layer {
      position: fixed;
      inset: 0;
      z-index: 20;
      display: grid;
      place-items: center;
      padding: 12px;
      pointer-events: none;
    }
    .app-window {
      width: min(800px, 100%);
      height: min(900px, calc(100vh - 24px));
      height: min(900px, calc(100dvh - 24px));
      pointer-events: auto;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 40px 100px rgba(0, 0, 0, 0.6), 0 2px 8px rgba(0, 0, 0, 0.35);
      transition: width 320ms cubic-bezier(0.2, 0.8, 0.2, 1), height 320ms cubic-bezier(0.2, 0.8, 0.2, 1);
    }
    .app-window.zoomed {
      width: min(1100px, 100%);
      height: calc(100vh - 24px);
      height: calc(100dvh - 24px);
    }
    .app-window iframe { display: block; width: 100%; height: 100%; border: 0; background: transparent; }

    .chrome-dock {
      position: fixed;
      left: 50%;
      bottom: 14px;
      z-index: 30;
      display: flex;
      gap: 8px;
      padding: 8px 10px 6px 10px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 16px;
      background: rgba(40, 32, 28, 0.55);
      backdrop-filter: blur(24px) saturate(160%);
      -webkit-backdrop-filter: blur(24px) saturate(160%);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
      transform: translateX(-50%);
    }
    .chrome-dock:empty { display: none; }
    .chrome-dock button {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
      padding: 0;
      border: 0;
      background: none;
      cursor: pointer;
      font: inherit;
    }
    .chrome-dock .app {
      display: grid;
      place-items: center;
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: #0b0f14;
      color: var(--accent, #ffb86c);
      font: 700 17px "JetBrains Mono", ui-monospace, Menlo, monospace;
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
      transition: transform 160ms ease;
    }
    .chrome-dock button:hover .app { transform: translateY(-4px) scale(1.06); }
    .chrome-dock .dot { width: 4px; height: 4px; border-radius: 50%; background: rgba(255, 255, 255, 0.7); }
    .chrome-dock button:focus-visible { outline: 2px solid var(--accent, #ffb86c); outline-offset: 3px; border-radius: 12px; }

    .chrome-closed {
      position: fixed;
      inset: 0;
      z-index: 5;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 14px;
      padding: 24px;
      text-align: center;
      font-family: "JetBrains Mono", ui-monospace, Menlo, monospace;
      font-size: 13px;
      color: var(--muted, #8b949e);
    }
    .chrome-closed[hidden] { display: none; }
    .chrome-closed p { margin: 0; }

    /* Easter egg: close the main window and a cat waits to bring it back. */
    .cat-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 0;
      border: 0;
      background: none;
      font: inherit;
      cursor: pointer;
    }
    .cat-btn .bubble {
      position: relative;
      padding: 9px 14px;
      border: 1px solid rgba(255, 184, 108, 0.5);
      border-radius: 10px;
      background: rgba(17, 22, 29, 0.9);
      color: var(--text, #e6edf3);
      font-size: 13px;
    }
    .cat-btn .bubble::after {
      content: "";
      position: absolute;
      left: 50%;
      bottom: -7px;
      width: 12px;
      height: 12px;
      margin-left: -6px;
      border-right: 1px solid rgba(255, 184, 108, 0.5);
      border-bottom: 1px solid rgba(255, 184, 108, 0.5);
      background: rgba(17, 22, 29, 0.95);
      transform: rotate(45deg);
    }
    .cat-btn svg { width: 130px; height: 150px; transition: transform 160ms ease; }
    .cat-btn:hover svg { transform: translateY(-5px); }
    .cat-btn:hover .bubble { border-color: var(--accent, #ffb86c); }
    .cat-btn:focus-visible { outline: 2px solid var(--accent, #ffb86c); outline-offset: 6px; border-radius: 12px; }
    .cat-btn .tail { transform-origin: 40px 98px; animation: swish 2.4s ease-in-out infinite alternate; }
    .cat-btn .eyes { transform-box: fill-box; transform-origin: center; animation: blink 4.5s infinite; }
    @keyframes swish { from { transform: rotate(-10deg); } to { transform: rotate(8deg); } }
    @keyframes blink { 0%, 94%, 100% { transform: scaleY(1); } 97% { transform: scaleY(0.1); } }
    .cat-btn .spark, .cat-btn .star { transform-box: fill-box; transform-origin: center; }
    .cat-btn .spark { animation: twinkle 1.6s ease-in-out infinite; }
    .cat-btn .star { animation: twinkle 2.8s ease-in-out infinite; }
    .cat-btn .star:nth-of-type(2) { animation-delay: -1.4s; }
    .cat-btn:hover .spark { animation-duration: 0.6s; }
    @keyframes twinkle { 0%, 100% { transform: scale(0.6); opacity: 0.6; } 50% { transform: scale(1.15); opacity: 1; } }
    @media (prefers-reduced-motion: reduce) {
      .cat-btn .tail, .cat-btn .eyes, .cat-btn .spark, .cat-btn .star { animation: none; }
    }
  `;
  document.head.appendChild(style);

  const labels = ["Close window", "Minimize window", "Zoom window"];
  lights.forEach((light, i) => {
    light.setAttribute("role", "button");
    light.setAttribute("tabindex", "0");
    light.setAttribute("aria-label", labels[i]);
    light.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        light.click();
      }
    });
  });

  // ---- Inside an embedded window: ask the page underneath to act ----

  if (embedded) {
    ["close", "minimize", "zoom"].forEach((action, i) => {
      lights[i].addEventListener("click", () => {
        window.parent.postMessage({ chrome: action }, location.origin);
      });
    });
    document.addEventListener("click", e => {
      const link = e.target.closest("a[href]");
      const key = link && !modified(e) && appFor(link);
      if (!key) return;
      e.preventDefault();
      window.parent.postMessage({ chrome: "open", href: key }, location.origin);
    });
    return;
  }

  // ---- A top-level page: manage its window, any page windows and the dock ----

  const dock = document.createElement("div");
  dock.className = "chrome-dock";
  dock.setAttribute("aria-label", "Dock");
  document.body.appendChild(dock);

  const closed = document.createElement("div");
  closed.className = "chrome-closed";
  closed.hidden = true;
  closed.setAttribute("role", "status");
  closed.innerHTML = `
    <p>nikhil@math — [Process completed]</p>
    <button type="button" class="cat-btn" aria-label="Reopen nikhil@math">
      <span class="bubble">press me to get the link tree back up</span>
      <svg viewBox="0 -30 130 150" aria-hidden="true">
        <path class="tail" d="M40 98 C12 98 8 68 24 56" fill="none" stroke="#0b0b0d" stroke-width="8" stroke-linecap="round"/>
        <ellipse cx="60" cy="90" rx="26" ry="22" fill="#0b0b0d"/>
        <ellipse cx="49" cy="110" rx="7" ry="4" fill="#0b0b0d"/>
        <ellipse cx="71" cy="110" rx="7" ry="4" fill="#0b0b0d"/>
        <path d="M43 44 L40 20 L57 36 Z M77 44 L80 20 L63 36 Z" fill="#0b0b0d"/>
        <circle cx="60" cy="52" r="21" fill="#0b0b0d"/>
        <path d="M45 38 L44 27 L52 35 Z M75 38 L76 27 L68 35 Z" fill="#4a2f2a"/>
        <g class="eyes">
          <ellipse cx="52" cy="51" rx="3.4" ry="4.4" fill="#ffb86c"/>
          <ellipse cx="68" cy="51" rx="3.4" ry="4.4" fill="#ffb86c"/>
        </g>
        <path d="M57.5 59 L62.5 59 L60 62 Z" fill="#d08a80"/>
        <path d="M42 58 L31 55 M42 61 L31 62 M78 58 L89 55 M78 61 L89 62" stroke="rgba(255,255,255,0.35)" stroke-width="1" stroke-linecap="round"/>
        <path d="M45 35 Q55 12 61 -6 Q64 -16 74 -20 Q67 -7 70 6 Q73 22 76 35 Z" fill="#7d4fd1"/>
        <path d="M46 31 Q60 35 75 31 L76 35 Q60 39 45 35 Z" fill="#ffb86c"/>
        <ellipse cx="60.5" cy="36" rx="25" ry="4.5" fill="#5e37a8"/>
        <path class="star" d="M60 10 l1.4 3.2 3.2 1.4 -3.2 1.4 -1.4 3.2 -1.4 -3.2 -3.2 -1.4 3.2 -1.4 z" fill="#ffb86c"/>
        <path class="star" d="M68 -2 l1 2.2 2.2 1 -2.2 1 -1 2.2 -1 -2.2 -2.2 -1 2.2 -1 z" fill="#ffb86c"/>
        <path d="M82 98 L106 66" stroke="#b08158" stroke-width="3" stroke-linecap="round"/>
        <ellipse cx="82" cy="98" rx="6" ry="5" fill="#0b0b0d"/>
        <path class="spark" d="M107 58 l2.2 5.3 5.3 2.2 -5.3 2.2 -2.2 5.3 -2.2 -5.3 -5.3 -2.2 5.3 -2.2 z" fill="#fff4e0"/>
      </svg>
    </button>`;
  document.body.appendChild(closed);

  function animate(el, keyframes, duration, easing) {
    if (calm || !el.animate) return Promise.resolve();
    return el.animate(keyframes, { duration, easing, fill: "forwards" }).finished;
  }
  const settle = el => el.getAnimations().forEach(a => a.cancel());

  function towardDock(el) {
    const r = el.getBoundingClientRect();
    const dx = window.innerWidth / 2 - (r.left + r.width / 2);
    const dy = window.innerHeight - 44 - (r.top + r.height / 2);
    return `translate(${dx}px, ${dy}px) scale(0.06)`;
  }

  async function minimize(el, icon, label, afterRestore, key = "main") {
    const to = towardDock(el);
    await animate(el, [{ transform: "none", opacity: 1 }, { transform: to, opacity: 0.3 }], 380, "cubic-bezier(0.5, 0, 0.75, 0)");
    el.style.visibility = "hidden";
    settle(el);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.dataset.app = key;
    btn.setAttribute("aria-label", `Restore ${label}`);
    btn.title = label;
    btn.innerHTML = `<span class="app">${icon}</span><span class="dot"></span>`;
    btn.addEventListener("click", async () => {
      btn.remove();
      el.style.visibility = "";
      const from = towardDock(el);
      await animate(el, [{ transform: from, opacity: 0.3 }, { transform: "none", opacity: 1 }], 360, "cubic-bezier(0.25, 1, 0.5, 1)");
      settle(el);
      if (afterRestore) afterRestore();
    });
    dock.appendChild(btn);
    btn.focus();
  }

  // This page's own window.
  red.addEventListener("click", async () => {
    await animate(win, [{ transform: "none", opacity: 1 }, { transform: "scale(0.92)", opacity: 0 }], 180, "ease-in");
    if (!isHome) {
      location.href = "/";
      return;
    }
    win.style.visibility = "hidden";
    settle(win);
    closed.hidden = false;
    closed.querySelector("button").focus();
  });

  closed.querySelector("button").addEventListener("click", async () => {
    closed.hidden = true;
    win.style.visibility = "";
    await animate(win, [{ transform: "scale(0.92)", opacity: 0 }, { transform: "none", opacity: 1 }], 220, "ease-out");
    settle(win);
    red.focus();
  });

  yellow.addEventListener("click", () => {
    minimize(win, "&gt;_", "nikhil@math", () => yellow.focus());
  });

  green.addEventListener("click", () => {
    green.setAttribute("aria-pressed", String(win.classList.toggle("zoomed")));
  });

  // ---- Internal pages open as windows over the page ----

  const apps = new Map(); // key -> { key, def, layer, box, frame }
  let topZ = 20;
  const front = app => { app.layer.style.zIndex = String(++topZ); };

  function openApp(key) {
    const existing = apps.get(key);
    if (existing) {
      const docked = dock.querySelector(`[data-app="${key}"]`);
      if (docked) docked.click();
      else {
        front(existing);
        existing.frame.contentWindow.focus();
      }
      return;
    }
    const def = APPS[key];
    const layer = document.createElement("div");
    layer.className = "app-layer";
    layer.innerHTML = `<div class="app-window" role="dialog" aria-label="${def.label}"><iframe src="${key}" title="${def.label}"></iframe></div>`;
    document.body.appendChild(layer);
    const box = layer.firstElementChild;
    const frame = box.querySelector("iframe");
    frame.addEventListener("load", () => frame.contentWindow.focus(), { once: true });
    const app = { key, def, layer, box, frame };
    apps.set(key, app);
    front(app);
    animate(box, [{ transform: "scale(0.92)", opacity: 0 }, { transform: "none", opacity: 1 }], 220, "ease-out").then(() => settle(box));
  }

  async function closeApp(app) {
    apps.delete(app.key);
    const docked = dock.querySelector(`[data-app="${app.key}"]`);
    if (docked) docked.remove();
    await animate(app.box, [{ transform: "none", opacity: 1 }, { transform: "scale(0.92)", opacity: 0 }], 180, "ease-in");
    app.layer.remove();
  }

  window.addEventListener("message", e => {
    if (e.origin !== location.origin) return;
    const app = [...apps.values()].find(a => a.frame.contentWindow === e.source);
    if (!app) return;
    const action = e.data && e.data.chrome;
    if (action === "close") closeApp(app);
    else if (action === "minimize") {
      minimize(app.box, app.def.icon, app.def.label, () => {
        front(app);
        app.frame.contentWindow.focus();
      }, app.key);
    } else if (action === "zoom") app.box.classList.toggle("zoomed");
    else if (action === "open" && APPS[e.data.href]) openApp(e.data.href);
  });

  // Clicking into a window brings it to the front.
  window.addEventListener("blur", () => {
    setTimeout(() => {
      const app = [...apps.values()].find(a => a.frame === document.activeElement);
      if (app) front(app);
    });
  });

  // Links to internal pages open their window instead of leaving the page.
  // Modified clicks (new tab, new window) still work as normal links.
  document.addEventListener("click", e => {
    const link = e.target.closest("a[href]");
    const key = link && !modified(e) && appFor(link);
    if (!key) return;
    e.preventDefault();
    openApp(key);
  });
})();
