# AGENTS.md

Notes for AI coding agents working on this repo.

## What this is

Source for [nikhilmath.com](https://nikhilmath.com), a personal landing page
styled as a macOS terminal window. It's a static site with no build step:
Netlify deploys the repo root straight from `master` on every push.

- `index.html` holds the whole page, with its CSS inlined in a `<style>` tag.
- `chrome.js` makes the window's red/yellow/green buttons work, and hides the
  wizard-cat easter egg that appears when you close the window.
- `Nikhil-Math-Resume.pdf`, `avatar.jpg` and `og-image.png` are linked from the page.
- `googleea46bcb01ea400be.html` and the `google-site-verification` meta tag
  verify the site in Google Search Console. Don't remove them.

## Book covers update themselves

The book covers at the bottom of `index.html`, between the
`goodreads:start` and `goodreads:end` comments, are generated. A daily GitHub
Action (`.github/workflows/update-books.yml`) runs
`.github/scripts/update-books.py`. That script reads the "read" and
"currently-reading" shelves from Goodreads, rewrites the block, and commits
to `master` when it changed.

- Don't hand-edit inside that block, because the next run overwrites it.
  Change the markup, title shortening or labels in the script, then run
  `python3 .github/scripts/update-books.py` to regenerate the block.
- The script uses only Python's standard library, so it needs no installs.
- Because the bot commits to `master`, pull with `--rebase` before pushing.

## Style

- Colors come from the CSS variables on `:root`; the accent is `--accent`
  (`#ffb86c`). Text is lowercase terminal-style, such as `on the clock:` and
  `last 5 books finished:`.
- Mobile styles live in the `@media (max-width: 480px)` block. Check changes
  at 320–390px wide as well as desktop.
- `chrome.js` is loaded from `/chrome.js`, so preview the page through a local
  server, such as `python3 -m http.server`, rather than opening the file directly.

## Commits

Use imperative messages in Title Case with no prefix, describing the change
as a visitor would notice it. For example: `Show My Goodreads Books And Keep
Them Updated Daily`, `Catch The Wizard Cat Napping On His Spellbook`.
