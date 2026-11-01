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
landing page, styled as a macOS terminal window: a dark window over a
warm amber glow. It's a small static site (one page) with no framework, no build step and no
dependencies, and it should stay that way.

Netlify deploys the repo root from `master` on every push, so `master` is
production. There's no `netlify.toml`; Netlify's settings live in its web UI.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The site's only page, at `/`. Its only inline JavaScript sets the footer year. |
| `style.css` | All the CSS, linked as `/style.css`. |
| `chrome.js` | Makes the window's red/yellow/green buttons work, and holds the wizard-cat easter egg. |
| `typing.js` | Types out the prompt line slowly on load. |
| `.github/scripts/update-books.py` | Regenerates the book covers from Goodreads (see below). |
| `.github/workflows/update-books.yml` | Runs that script daily and commits any changes. |
| `Nikhil-Math-Resume.pdf` | The resume linked from the "resume" row. |
| `avatar.jpg` | 800×800 photo shown at the top right of the home page. |
| `og-image.png` | 1200×630 link-preview image, a picture of the terminal design with the photo. |
| `googleea46bcb01ea400be.html` | Google Search Console verification. Never delete it or the matching meta tag. |
| `robots.txt`, `sitemap.xml` | Allow all crawlers. The sitemap lists the home page with a hand-set `<lastmod>`. |
| `.vscode/settings.json` | Sets VS Code Live Server to port 5501. |
| `README.md`, `LICENSE` | Short README with the preview image; MIT license. |

The site once had other pages (`books/`, `resume/`, `archive/`,
`resume-blaster/`, a `wiki/` page, and a `games/` video games page with a
tab bar for switching pages), which were removed on purpose. Don't bring
them back. If a second page is ever wanted, it needs its own copy of the
`<head>` and window shell plus some navigation again; the old `.tabs` nav
is in git history before 2026-10-26.

## The page, top to bottom

1. **Title bar**: traffic lights and `nikhil@math — -zsh — 90×27` in the
   middle. The size label is
   decoration, and it's hidden on phones.
2. **Avatar** in the top right corner (128px, or 80px on phones).
3. **Prompt line** `~ nikhil@math:$ whoami` with a blinking cursor, then
   the name as `<h1>`. `typing.js` types the whole line out slowly on load
   (about four seconds, with a beat after the `$`), keeping the amber `~`
   and `$`. Under `prefers-reduced-motion` it shows the line at once.
4. **Status**, in two columns:
   - `on the clock:` lists current roles, each linked to the organization.
   - `off-hours:` lists hobbies.
5. **Link rows**: resume (a highlighted download), github, linkedin, goodreads, email,
   phone (a `tel:` link). The resume PDF lists a different phone number on
   purpose; don't make them match.
6. **Books**: `last N books i've read or listened to:` and `currently reading:`. Generated; see below.
7. **Published books**: `books i've published:`, Nikhil's own pick-your-path
   books on Amazon, in the same cover grid as the Goodreads books. This list
   is hand-edited and sits outside the generated block. Covers load from
   Amazon by ASIN (`m.media-amazon.com/images/P/<ASIN>.01._SCLZZZZZZZ_SX500_.jpg`),
   and the links are the product pages with the search tracking stripped.
8. **Footer**: `© <year> Nikhil Math`, with the year filled in by script.

Nikhil asked to keep the page clean, so check with him before adding
much to it.

## Things that must stay in sync

- **Job title or employer**: `<title>`, `<meta name="description">`, the
  JSON-LD `jobTitle` / `worksFor` / `knowsAbout`, the first item under
  `on the clock:`.
- **Profiles**: the link rows and the JSON-LD `sameAs` list should name the same accounts.
- **Link-preview text**: each `og:*` tag has a `twitter:*` twin. Change both.
- **Photo**: `avatar.jpg` is also the JSON-LD `image`. `og-image.png` shows
  the design and photo, so it goes stale if either changes.
- **Resume**: replace `Nikhil-Math-Resume.pdf` and keep the filename; the
  home page links to it with `download`.
- **Domain**: the canonical URL, `og:url`, JSON-LD URLs and `sitemap.xml`
  all use `https://nikhilmath.com/`.

## Book covers update themselves

Everything between `<!-- goodreads:start ... -->` and `<!-- goodreads:end -->`
in `index.html` is generated. **Don't hand-edit inside that block**, because
the next run overwrites it.

- `update-books.py` reads the Goodreads RSS feeds for user `143237965`
  (goodreads.com/nikhilmath): the `read` and `currently-reading` shelves.
- It shows the 5 most recently finished books, sorted by date read and then
  date added, under `last N books i've read or listened to:`. It also shows up to 5
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
  change the look, edit the `ul.books` CSS in `style.css`. The script uses
  only Python's standard library.

The workflow runs daily at 12:00 UTC (about 6am in Utah). It can also be
run by hand from the Actions tab or with `gh workflow run update-books.yml`.
It commits as `github-actions[bot]` with the message
`Update My Books From Goodreads`, and only when the block changed. GitHub
turns off scheduled workflows in public repos after 60 days with no repo
activity; turn it back on from the Actions tab if that happens.

## The liquid glass look was removed

From 2026-10-26 to 2026-11-01 a title bar switch offered a "liquid glass"
look (frosted window, ocean-blue blobs, seafoam accent). Nikhil had it
removed, so the amber look is now the only one and lives in the base rules
of `style.css`. Don't bring the switch back unless asked; it's in git
history if wanted.

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
  `--accent`, `--hover`, `--border` and so on). For a translucent accent
  tint use `rgba(var(--accent-rgb), alpha)`. The accent is amber
  `#ffb86c`. The design is dark only, with no light mode.
- **Backdrop**: `.glow` is a fixed dark layer whose `::before` holds four
  blurred amber radial gradients drifting slowly (`amber-drift`, paused
  under `prefers-reduced-motion`). The `.window` is a dark translucent
  pane with a `backdrop-filter` blur.
- **Keyframe names are global**: `chrome.js` injects its own `@keyframes`
  (`blink`, `drift` and others), and those win over same-named ones in
  `style.css`. Give new keyframes in `style.css` distinct names, like
  `cursor-blink` and `amber-drift`. (An older glow used `drift`, which
  clashed with the cat's and made the glow fade out every 30 seconds.)
- **Voice**: labels are lowercase terminal-style, with a trailing colon in
  the accent color, such as `on the clock:` and `books i've published:`.
  Body copy is casual and first person.
- **Components**: borders are 1px translucent; hover states turn the
  border `var(--hover)` (amber), with
  transitions around 120ms. External links get
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
  like `/chrome.js` don't load over `file://`. In the Claude desktop app, a
  `.claude/launch.json` server can't read this folder (it's under
  `~/Documents`), so start `http.server` from the shell in the background
  and open `http://localhost:5501` in the browser pane instead.
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
