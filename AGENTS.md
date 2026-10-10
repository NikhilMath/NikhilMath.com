# AGENTS.md

Notes for AI coding agents working on this repo. `CLAUDE.md` imports this
file, so everything here applies to Claude Code too.

## Keeping these notes current

When you learn something about this repo that the next agent would need,
such as a convention, a gotcha, or a file that must stay in sync with
another, add it here before you finish. Put it in this file, not in
`CLAUDE.md`. `CLAUDE.md` only imports `AGENTS.md`, so a note written here
reaches Claude Code and every other agent, while a note written in
`CLAUDE.md` reaches Claude Code alone. If something here turns out to be
wrong or out of date, fix it.

## What this is

Source for [nikhilmath.com](https://nikhilmath.com), Nikhil Math's personal
landing page, styled as a macOS terminal window over a warm amber
background. It's a single static page with no framework, no build step and
no dependencies, and it should stay that way.

Netlify deploys the repo root from `master` on every push, so `master` is
production. There's no `netlify.toml`; Netlify's settings live in its web UI.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The whole page. CSS is inlined in `<style>`; its only inline JavaScript sets the footer year. |
| `chrome.js` | Makes the window's red/yellow/green buttons work, and holds the wizard-cat easter egg. |
| `.github/scripts/update-books.py` | Regenerates the book covers from Goodreads (see below). |
| `.github/workflows/update-books.yml` | Runs that script daily and commits any changes. |
| `Nikhil-Math-Resume.pdf` | The resume linked from the "resume" row. |
| `avatar.jpg` | 800×800 photo shown at the top right. |
| `og-image.png` | 1200×630 link-preview image, a picture of the terminal design with the photo. |
| `googleea46bcb01ea400be.html` | Google Search Console verification. Never delete it or the matching meta tag. |
| `robots.txt`, `sitemap.xml` | Allow all crawlers. The sitemap lists only the homepage, with a hand-set `<lastmod>`. |
| `.vscode/settings.json` | Sets VS Code Live Server to port 5501. |
| `README.md`, `LICENSE` | Short README with the preview image; MIT license. |

The site used to have sub-pages (`books/`, `resume/`, `archive/`,
`resume-blaster/`). They were removed on purpose, and the site is now one
page. If a new page is ever added, it needs a `.window` with a `.chrome` of
three spans plus `<script src="/chrome.js" defer>`, and an entry in
`sitemap.xml`.

## The page, top to bottom

1. **Title bar**: traffic lights, plus `nikhil@math — -zsh — 90×27`. The
   size label is decoration, and it's hidden on phones.
2. **Avatar** in the top right corner (128px, or 80px on phones).
3. **Prompt line** `~ nikhil@math:$ whoami` with a blinking cursor, then the name as `<h1>`.
4. **Status**, in two columns:
   - `on the clock:` lists current roles, each linked to the organization.
   - `off-hours:` lists hobbies.
5. **`games i've made:`** holds one `.project` card per game inside a
   `.projects` wrapper, newest first. The newest card carries a `latest`
   badge (`.badge`); move it when a new game goes on top. Right now
   that's Rarest Catch (rarest-catch.netlify.app), a daily Pokémon
   guessing game, then Keyboard Heist (keyboardheist.com). Each game lives
   in its own repo, not this one. On phones the badge stays on the name's
   line, which only just fits at 320px with a 12-character name; check
   320px if you add a game with a longer name.
6. **Link rows**: resume (a highlighted download), github, linkedin, goodreads, email.
7. **Books**: `last N books finished:` and `currently reading:`. Generated; see below.
8. **Footer**: `© <year> Nikhil Math`, with the year filled in by script.

## Things that must stay in sync

- **Job title or employer**: `<title>`, `<meta name="description">`, the
  JSON-LD `jobTitle` / `worksFor` / `knowsAbout`, and the first item under
  `on the clock:`.
- **Profiles**: the link rows and the JSON-LD `sameAs` list should name the same accounts.
- **Link-preview text**: each `og:*` tag has a `twitter:*` twin. Change both.
- **Photo**: `avatar.jpg` is also the JSON-LD `image`. `og-image.png` shows
  the design and photo, so it goes stale if either changes.
- **Resume**: replace `Nikhil-Math-Resume.pdf` and keep the filename; the
  page links to it with `download`.
- **Domain**: the canonical URL, `og:url`, JSON-LD URLs and `sitemap.xml`
  all use `https://nikhilmath.com/`.

## Book covers update themselves

Everything between `<!-- goodreads:start ... -->` and `<!-- goodreads:end -->`
in `index.html` is generated. **Don't hand-edit inside that block**, because
the next run overwrites it.

- `update-books.py` reads the Goodreads RSS feeds for user `143237965`
  (goodreads.com/nikhilmath): the `read` and `currently-reading` shelves.
- It shows the 5 most recently finished books, sorted by date read and then
  date added, under `last N books finished:`. It also shows up to 5
  currently-reading books, newest first. The currently-reading heading is
  left out when that shelf is empty.
- Titles are shortened for captions. Subtitles, trailing series tags such as
  `(Dragon Ball Super, #24)`, and year ranges such as `(2024-)` are dropped,
  and `Volume` becomes `Vol.`. A subtitle is kept when it carries the volume
  or issue number, as in `Solo Leveling: Ragnarok, Vol. 1`.
- Each book Nikhil has rated on Goodreads shows Nikhil's own rating underneath,
  as amber `★` stars with the unearned ones dimmed (`.book-rating`,
  `.unlit`). Unrated books (rating 0 in the feed) show no stars. JetBrains
  Mono has no `★`, so the browser borrows the glyph from a fallback font,
  which is why the stars are set larger than the caption text.
- Covers load from Goodreads' image servers at 240px wide (`._SX240_` in the
  filename). Goodreads resizes based on that part of the filename.
- It refuses to write if the read shelf comes back empty or the markers are
  missing, so a Goodreads outage can't wipe the section.
- To change the markup, labels or count, edit the script, then run
  `python3 .github/scripts/update-books.py` to regenerate the block. To
  change the look, edit the `ul.books` CSS in `index.html`. The script uses
  only Python's standard library.

The workflow runs daily at 12:00 UTC (about 6am in Utah). It can also be
run by hand from the Actions tab or with `gh workflow run update-books.yml`.
It commits as `github-actions[bot]` with the message
`Update My Books From Goodreads`, and only when the block changed. GitHub
turns off scheduled workflows in public repos after 60 days with no repo
activity; turn it back on from the Actions tab if that happens.

## Window buttons and the wizard cat (`chrome.js`)

- **Red** fades the window out and shows `[Process completed]`, with a
  wizard cat startled awake from a nap on his spellbook. Clicking the cat
  brings the window back.
- **Yellow** shrinks the window into a dock at the bottom, with a `>_`
  icon. Clicking the icon restores it.
- **Green** toggles `.zoomed`, which widens the window from 700px to 1200px.
- The buttons are keyboard accessible (role, tabindex, Enter/Space, focus
  rings). All motion is skipped under `prefers-reduced-motion`.
- The cat's SVG and all of `chrome.js`'s CSS are inlined in the script.
  The script expects the `.window > ... > .chrome > span ×3` structure, so
  keep that markup if you restyle the title bar.

## Style

- **Font**: JetBrains Mono from Google Fonts, weights 400 and 600.
- **Colors**: use the CSS variables on `:root` (`--text`, `--muted`,
  `--accent`, `--border` and so on). The accent is amber `#ffb86c`. The
  design is dark only, with no light mode.
- **Voice**: labels are lowercase terminal-style, with a trailing colon in
  the accent color, such as `on the clock:` and `games i've made:`.
  Body copy is casual and first person.
- **Components**: borders are 1px translucent; hover states turn the
  border amber, with transitions around 120ms. External links get
  `target="_blank" rel="noopener"`.
- **Images**: give real images alt text. Book covers use `alt=""` because
  the caption under each one already names the book.
- **Phones**: one breakpoint, `@media (max-width: 480px)`. The page gets a
  16px gutter and 20px terminal padding. The books become a sideways swipe
  strip, using `-20px` margins to run edge to edge; if you change the
  terminal padding, change those margins to match. The email shows as
  `erulemath<wbr>@gmail.com` so it can wrap at the `@` on narrow phones.
- **Favicon**: an inline SVG data URI (`>_` in amber), with no separate file.

## Testing a change

- Serve the folder rather than opening the file directly, for example with
  `python3 -m http.server 5501` or VS Code Live Server. Root-relative paths
  like `/chrome.js` don't load over `file://`.
- Check widths of 320, 360, 375 and 390px, plus desktop, and look for
  horizontal scrolling at each. Also check the zoomed window (green button).
- If you touched the window or title bar, click all three buttons, reopen
  the window via the cat, and restore it from the dock.

## Commits and pushing

- Work directly on `master` with no branches or PRs, and push when you're
  done; the owner wants changes to go live. Pull with `--rebase` first,
  because the book bot also commits to `master`.
- Commit subjects are imperative and Title Case with no prefix, and describe
  what a visitor would notice. For example:
  `Show My Goodreads Books And Keep Them Updated Daily`,
  `Catch The Wizard Cat Napping On His Spellbook`,
  `Swap The Resume Page For A PDF Download And Link My Roles`.
  Add a short body when the why isn't obvious.
