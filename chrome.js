// Makes the macOS-style traffic lights on the site's window work.
//
// Red closes, yellow minimizes to a dock, green zooms. A page only needs a
// `.window` containing a `.chrome` with three spans, plus this script.
(() => {
  "use strict";

  const win = document.querySelector(".window");
  const lights = win && win.querySelectorAll(".chrome > span");
  if (!lights || lights.length < 3) return;
  const [red, yellow, green] = lights;

  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

    /* Easter egg: close the main window and you catch a wizard cat napping on
       his spellbook. He jolts awake, and clicking him brings the window back. */
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
      line-height: 1.5;
      max-width: 290px;
    }
    .cat-btn .bubble::after {
      content: "";
      position: absolute;
      left: calc(50% - 22px);
      bottom: -7px;
      width: 12px;
      height: 12px;
      margin-left: -6px;
      border-right: 1px solid rgba(255, 184, 108, 0.5);
      border-bottom: 1px solid rgba(255, 184, 108, 0.5);
      background: rgba(17, 22, 29, 0.95);
      transform: rotate(45deg);
    }
    .cat-btn svg { width: 150px; height: 140px; overflow: visible; transition: transform 160ms ease; }
    .cat-btn:hover svg { transform: translateY(-5px); }
    .cat-btn:hover .bubble { border-color: var(--accent, #ffb86c); }
    .cat-btn:focus-visible { outline: 2px solid var(--accent, #ffb86c); outline-offset: 6px; border-radius: 12px; }

    /* Startled awake each time the window closes (the panel is display: none
       until then, so these replay), then fidgety while he waits. */
    .cat-btn .cat { transform-origin: 75px 120px; animation: startle 560ms cubic-bezier(0.3, 1.5, 0.5, 1) both; }
    .cat-btn .hat { transform-origin: 57px 57px; animation: knocked 1.1s 120ms ease-out both; }
    .cat-btn .bang { transform-box: fill-box; transform-origin: center bottom; animation: pop 420ms 160ms cubic-bezier(0.3, 1.6, 0.5, 1) both; }
    .cat-btn .z { opacity: 0; animation: drift 1.4s ease-out both; }
    .cat-btn .tail { transform-origin: 112px 104px; animation: swish 1.6s ease-in-out infinite alternate; }
    .cat-btn .eyes { transform-box: fill-box; transform-origin: center; animation: blink 4.5s 1.2s infinite; }
    .cat-btn .star { transform-box: fill-box; transform-origin: center; animation: twinkle 2.8s ease-in-out infinite; }
    @keyframes startle {
      0% { transform: translateY(4px) scaleY(0.92); }
      35% { transform: translateY(-10px) scaleY(1.04); }
      100% { transform: none; }
    }
    @keyframes knocked {
      0% { transform: translateY(8px) rotate(-14deg); }
      40% { transform: translateY(-4px) rotate(8deg); }
      70% { transform: rotate(-4deg); }
      100% { transform: none; }
    }
    @keyframes pop { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    @keyframes drift { from { transform: translate(-14px, 12px); opacity: 0.9; } to { transform: translate(10px, -18px); opacity: 0; } }
    @keyframes swish { from { transform: rotate(-12deg); } to { transform: rotate(6deg); } }
    @keyframes blink { 0%, 94%, 100% { transform: scaleY(1); } 97% { transform: scaleY(0.1); } }
    @keyframes twinkle { 0%, 100% { transform: scale(0.6); opacity: 0.6; } 50% { transform: scale(1.15); opacity: 1; } }
    @media (prefers-reduced-motion: reduce) {
      .cat-btn .cat, .cat-btn .hat, .cat-btn .bang, .cat-btn .z,
      .cat-btn .tail, .cat-btn .eyes, .cat-btn .star { animation: none; }
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
      <span class="bubble">oh, you caught me napping on the job! do me a favor: if you click me, the linktree will pop back up and I can finish my nap.</span>
      <svg viewBox="0 0 150 140" aria-hidden="true">
        <rect x="19" y="122" width="112" height="8" rx="2" fill="#5e37a8"/>
        <path d="M23 110 Q49 102 75 110 L75 124 Q49 116 23 124 Z" fill="#efe3cc"/>
        <path d="M75 110 Q101 102 127 110 L127 124 Q101 116 75 124 Z" fill="#dccdb0"/>
        <path d="M83 113 Q101 108 119 113 M83 118 Q101 113 119 118" fill="none" stroke="#b9a684" stroke-width="1"/>
        <text class="z" x="96" y="60" font-family="ui-monospace, Menlo, monospace" font-size="13" font-weight="700" fill="#fff4e0">z</text>
        <g class="cat">
          <path class="tail" d="M112 104 Q130 98 126 76" fill="none" stroke="#0b0b0d" stroke-width="8" stroke-linecap="round"/>
          <ellipse cx="82" cy="102" rx="34" ry="15" fill="#0b0b0d"/>
          <ellipse cx="56" cy="100" rx="14" ry="12" fill="#0b0b0d"/>
          <ellipse cx="44" cy="112" rx="7" ry="4.5" fill="#0b0b0d"/>
          <ellipse cx="62" cy="113" rx="7" ry="4.5" fill="#0b0b0d"/>
          <path d="M40 72 L37 50 L51 65 Z M58 65 L68 50 L66 72 Z" fill="#0b0b0d"/>
          <path d="M41 66 L40 55 L47 63 Z M61 63 L65 55 L64 66 Z" fill="#4a2f2a"/>
          <circle cx="52" cy="82" r="17" fill="#0b0b0d"/>
          <g class="eyes">
            <circle cx="45.5" cy="81" r="4.6" fill="#ffb86c"/>
            <circle cx="58.5" cy="81" r="4.6" fill="#ffb86c"/>
            <circle cx="45.5" cy="81" r="1.5" fill="#0b0b0d"/>
            <circle cx="58.5" cy="81" r="1.5" fill="#0b0b0d"/>
          </g>
          <path d="M50 88 L54 88 L52 90.5 Z" fill="#d08a80"/>
          <ellipse cx="52" cy="93.5" rx="1.8" ry="2.2" fill="#d08a80"/>
          <path d="M38 87 L26 82 M38 90 L26 91 M66 87 L78 82 M66 90 L78 91" stroke="rgba(255,255,255,0.4)" stroke-width="1" stroke-linecap="round"/>
          <g class="hat">
            <g transform="translate(5 -9) rotate(18 52 66)">
              <path d="M38 66 Q46 46 50 34 Q53 28 60 26 Q56 36 57 46 Q58 56 66 66 Z" fill="#7d4fd1"/>
              <path d="M38 63 Q52 66 66 63 L66 66 Q52 69 38 66 Z" fill="#ffb86c"/>
              <ellipse cx="52" cy="66" rx="16" ry="3.6" fill="#5e37a8"/>
              <path class="star" d="M53 44 l1.2 2.8 2.8 1.2 -2.8 1.2 -1.2 2.8 -1.2 -2.8 -2.8 -1.2 2.8 -1.2 z" fill="#ffb86c"/>
            </g>
          </g>
          <g class="bang">
            <path d="M80 44 L85 44 L84 60 L81 60 Z" fill="#ffb86c"/>
            <circle cx="82.5" cy="65" r="2.3" fill="#ffb86c"/>
          </g>
        </g>
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

  async function minimize(el, icon, label, afterRestore) {
    const to = towardDock(el);
    await animate(el, [{ transform: "none", opacity: 1 }, { transform: to, opacity: 0.3 }], 380, "cubic-bezier(0.5, 0, 0.75, 0)");
    el.style.visibility = "hidden";
    settle(el);

    const btn = document.createElement("button");
    btn.type = "button";
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

  red.addEventListener("click", async () => {
    await animate(win, [{ transform: "none", opacity: 1 }, { transform: "scale(0.92)", opacity: 0 }], 180, "ease-in");
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
})();
