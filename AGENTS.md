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
landing page: a link-in-bio style column of equal-weight link cards on a
warm peach gradient. It's a small static site (one page) with no
framework, no build step, no JavaScript beyond the footer year and no
dependencies, and it should stay that way.

Netlify deploys the repo root from `master` on every push, so `master` is
production. There's no `netlify.toml`; Netlify's settings live in its web UI.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The site's only page, at `/`. Its only inline JavaScript sets the footer year. |
| `style.css` | All the CSS, linked as `/style.css`. |
| `Nikhil-Math-Resume.pdf` | The resume linked from the "resume" row. |
| `avatar.jpg` | 800×800 photo shown in the circle at the top of the page. |
| `og-image.png` | 1200×630 link-preview image in the site's style: photo, name, roles and the four main link cards. |
| `tools/og-image.html` | Source for `og-image.png`; render it with the command under "Preview image and favicon follow the design". |
| `googleea46bcb01ea400be.html` | Google Search Console verification. Never delete it or the matching meta tag. |
| `robots.txt`, `sitemap.xml` | Allow all crawlers. The sitemap lists the home page with a hand-set `<lastmod>`. |
| `.vscode/settings.json` | Sets VS Code Live Server to port 5501. |
| `README.md`, `LICENSE` | Short README with the preview image; MIT license. |

The site once had other pages (`books/`, `resume/`, `archive/`,
`resume-blaster/`, a `wiki/` page, and a `games/` video games page with a
tab bar for switching pages), which were removed on purpose. Don't bring
them back. If a second page is ever wanted, it needs its own copy of the
`<head>` plus some navigation again; the old `.tabs` nav
is in git history before 2026-10-26.

## The page, top to bottom

On wide screens items 1 and 2 form the hero (intro left, links right,
like the preview card) and items 3 and 4 follow below in two columns;
on phones it's all one column.

1. **Intro**: the round avatar, the name as `<h1>` (Fraunces), the roles
   line (President of Recovery Cafe is linked; Property Manager is left
   unlinked at Nikhil's request), and the hobbies as plain text chips.
2. **Links** (heading visually hidden): Résumé (a `download` link to the
   PDF), LinkedIn, GitHub, Goodreads, in that order (Nikhil's pick).
3. **Things I've made**: Nikhil's iPhone apps (Plate Chase, Chip Chaser)
   and pick-your-path books (Keyboard Heist, Hex Support), each a card
   with its icon or cover. App icon URLs come from
   `https://itunes.apple.com/lookup?id=<app id>` (`artworkUrl512`, with
   `512x512bb` swapped for `240x240bb`). Book covers load from Amazon by
   ASIN (`m.media-amazon.com/images/P/<ASIN>.01._SCLZZZZZZZ_SX500_.jpg`),
   and the links are the product pages with the search tracking stripped.
4. **Say hi**: email and phone (a `tel:` link). The resume PDF lists a
   different phone number on purpose; don't make them match.
5. **Footer**: `© <year> Nikhil Math`, with the year filled in by script.

**Every link must carry the same visual weight.** Nikhil wants visitors
to see the résumé, LinkedIn, Goodreads and the rest as equals, each
saying plainly what it does (a name plus a short line like "download the
PDF" or "books I've read"). Don't highlight one link over the others.

Nikhil asked to keep the page clean, so check with him before adding
much to it.

## Things that must stay in sync

- **Job title or employer**: `<title>`, `<meta name="description">`, the
  JSON-LD `jobTitle` / `worksFor` / `knowsAbout`, and `on the clock:`.
  These follow the resume's headline (`IT Support Manager | CompTIA A+ |
  ITIL 4 | ...`). Nikhil's Visionary Homes job ended in Nov 2026, so the
  page has no IT employer under `on the clock:` and no JSON-LD
  `worksFor`. The title, the description and `jobTitle` still say IT
  Support Manager because that's the resume's headline. When he starts a
  new IT job, add it to the top of `on the clock:` and add `worksFor` back.
- **Profiles**: the link rows and the JSON-LD `sameAs` list should name the same accounts.
- **Link-preview text**: each `og:*` tag has a `twitter:*` twin. Change both.
- **Photo**: `avatar.jpg` is also the JSON-LD `image`, and it's in
  `og-image.png`.
- **Preview image and favicon follow the design.** Nikhil's standing rule:
  whenever the site's look changes (colours, fonts, layout, main links,
  roles), update `og-image.png` and the favicon in the same change so
  they match, without being asked. Edit `tools/og-image.html`, then
  render it with headless Chrome from the repo root:

  ```bash
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars --user-data-dir="$(mktemp -d)" --window-size=1200,630 --virtual-time-budget=6000 --screenshot="$PWD/og-image.png" "file://$PWD/tools/og-image.html"
  ```

  Look at the PNG before committing. The favicon is the inline SVG data
  URI in `index.html`'s `<head>`.
- **Resume**: replace `Nikhil-Math-Resume.pdf` and keep the filename; the
  home page links to it with `download`.
- **Domain**: the canonical URL, `og:url`, JSON-LD URLs and `sitemap.xml`
  all use `https://nikhilmath.com/`.

## No Goodreads book list

The page used to show the last few books Nikhil read and was currently
reading, pulled daily from Goodreads RSS by a GitHub Action. Nikhil
dropped it on 2026-11-08 ("if people cared, they will check out my
goodreads"); the goodreads link row is enough. The feed had also broken:
once Nikhil published books, Goodreads turned the profile into an author
page and `review/list_rss/143237965` started returning 404. Don't bring
the list back without asking; the old script is in git history.

## Earlier designs

The site was a macOS terminal window over an amber glow until
2026-11-08, with typed-out prompt text (`typing.js`), working window
buttons and a wizard-cat easter egg (`chrome.js`). A "liquid glass"
variant with a title bar switch ran from 2026-10-26 to 2026-11-01.
Nikhil replaced the terminal with the current link-card design ("Stack")
after comparing several windowless concepts. All of it is in git
history; don't bring it back unless asked.

## Style

- **Fonts**: Fraunces 600 for the name, Inter 400/600 for everything
  else, both from Google Fonts.
- **Colors**: use the CSS variables on `:root` (`--text`, `--muted`,
  `--faint`, `--heading`, `--card`, `--card-edge`, `--icon-bg`,
  `--accent`, and the `--bg-*` gradient stops). Hover and focus use
  `--accent`, a burnt orange. The design is light only.
- **Link cards** (`ul.links a`): a white card with a 2px solid lip
  underneath (`--card-edge`), a 44px icon tile on the left, the name and
  a `<small>` description, and an arrow on the right (`↓` for the
  download, `↗` for other sites, `→` for email and phone). Hover lifts the
  card 2px and turns the lip and arrow `--accent`, over 120ms; motion is
  off under `prefers-reduced-motion`.
- **Icons**: small inline SVG line icons (stroke `currentColor`), not
  emoji. Nikhil asked for the page to be "less emoji'd".
- **Voice**: casual and first person. Section headings are small
  uppercase letter-spaced labels.
- **Links**: external links get `target="_blank" rel="noopener"`.
- **Images**: give real images alt text. Icons and covers inside link
  cards use `alt=""` because the card's text already names them.
- **Layout**: below 1000px it's one centred column (460px max, 16px
  gutter), and `@media (max-width: 480px)` shrinks the avatar and name.
  From `@media (min-width: 1000px)`, the top of the page (`.hero`) is laid
  out like the link-preview card, which Nikhil liked: the intro on the
  left, left-aligned, and the four main links on the right in a 420px
  column. The hero has no minimum height, so the rest follows right
  after it with no big gap (Nikhil asked for that). The roles go on
  separate lines there (the ` · ` separator is hidden). Everything else
  (`.more`: things I've made, say hi) follows below in a two-column grid
  of the same cards. Keep `tools/og-image.html` matching the hero.
- **Favicon**: an inline SVG data URI (a cream serif `N` on dark brown),
  with no separate file.

## Testing a change

- Serve the folder rather than opening the file directly, for example with
  `python3 -m http.server 5501` or VS Code Live Server. Root-relative paths
  like `/style.css` don't load over `file://`. In the Claude desktop app, a
  `.claude/launch.json` server can't read this folder (it's under
  `~/Documents`), so start `http.server` from the shell in the background
  and open `http://localhost:5501` in the browser pane instead.
- Check widths of 320, 360, 375 and 390px, plus desktop, and look for
  horizontal scrolling at each.

## Commits and pushing

- Work directly on `master` with no branches or PRs, and push when you're
  done; the owner wants changes to go live. Pull with `--rebase` first
  in case `master` moved.
- Commit subjects are imperative and Title Case with no prefix, and describe
  what a visitor would notice. For example:
  `Swap The Resume Page For A PDF Download And Link My Roles`.
  Add a short body when the why isn't obvious.
