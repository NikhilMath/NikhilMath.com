// Types out the whole prompt line (`~ nikhil@math:$ whoami`) slowly on
// load, as if someone were at the keyboard, then leaves the cursor
// blinking after it.
//
// The line is already in the HTML, so the page reads fine without this
// script, and visitors who prefer reduced motion see it all at once.
(() => {
  "use strict";

  const prompt = document.querySelector(".prompt");
  const cursor = prompt && prompt.querySelector(".cursor");
  if (!cursor) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Each run of text in the line, in order, so the amber `~` and `$` spans
  // keep their colour while they're typed.
  const parts = [];
  const walker = document.createTreeWalker(prompt, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.textContent) parts.push({ node, text: node.textContent });
  }
  if (!parts.length) return;
  parts.forEach(p => { p.node.textContent = ""; });
  cursor.classList.add("typing");

  let part = 0;
  let shown = 0;

  function typeNext() {
    const { node, text } = parts[part];
    shown += 1;
    node.textContent = text.slice(0, shown);
    const typed = text[shown - 1];
    if (shown === text.length) {
      part += 1;
      shown = 0;
    }
    if (part === parts.length) {
      cursor.classList.remove("typing");
      return;
    }
    // A longer beat after the `$`, as if deciding what to run.
    const delay = typed === "$" ? 550 : 110 + Math.random() * 110;
    setTimeout(typeNext, delay);
  }
  setTimeout(typeNext, 700);
})();
