// Types out the command on the page's prompt line, as if it had just been
// entered, then leaves the cursor blinking after it.
//
// The command is the text right before `.prompt .cursor` (`whoami` on the
// home page), so the page reads fine without this script.
(() => {
  "use strict";

  const cursor = document.querySelector(".prompt .cursor");
  const command = cursor && cursor.previousSibling;
  if (!command || command.nodeType !== Node.TEXT_NODE) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const full = command.textContent;
  const lead = full.match(/^\s*/)[0];
  let shown = lead.length;

  command.textContent = lead;
  cursor.classList.add("typing");

  function typeNext() {
    shown += 1;
    command.textContent = full.slice(0, shown);
    if (shown < full.length) {
      setTimeout(typeNext, 55 + Math.random() * 90);
    } else {
      cursor.classList.remove("typing");
    }
  }
  setTimeout(typeNext, 450);
})();
