#!/usr/bin/env python3
"""Refreshes the book covers at the bottom of index.html from Goodreads.

Rewrites everything between the goodreads:start and goodreads:end comments
with the books I read most recently and the ones I'm reading now. Runs daily
from .github/workflows/update-books.yml, and is safe to run by hand.
"""
import html
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from email.utils import parsedate_to_datetime
from pathlib import Path

FEED = "https://www.goodreads.com/review/list_rss/143237965?shelf={}&per_page=50"
SHOW = 5
PAGE = Path(__file__).resolve().parents[2] / "index.html"
START = "<!-- goodreads:start (filled in daily by .github/scripts/update-books.py) -->"
END = "<!-- goodreads:end -->"
INDENT = " " * 8


def fetch(shelf):
    req = urllib.request.Request(
        FEED.format(shelf), headers={"User-Agent": "nikhilmath.com book updater"}
    )
    with urllib.request.urlopen(req, timeout=30) as res:
        root = ET.fromstring(res.read())

    books = []
    for item in root.iter("item"):
        text = lambda key: " ".join((item.findtext(key) or "").split())
        date = lambda key: parsedate_to_datetime(text(key)) if text(key) else None
        books.append({
            "id": text("book_id"),
            "title": short_title(text("title")),
            "author": text("author_name"),
            "cover": cover(text("book_large_image_url")),
            "added": date("user_date_added"),
            "read": date("user_read_at"),
            "rating": int(text("user_rating") or 0),
        })
    return books


def short_title(title):
    """Drops the subtitle and series tag, so a cover caption stays short.

    "Born a Crime: Stories from a South African Childhood" -> "Born a Crime"
    "One Piece, Volume 1: Romance Dawn" -> "One Piece, Vol. 1"
    "Solo Leveling: Ragnarok, Vol. 1 (comic)" -> "Solo Leveling: Ragnarok, Vol. 1"
    "Absolute Batman (2024-) #18" -> "Absolute Batman #18"
    """
    title = re.sub(r"\s*\([^()]*\)$", "", title)
    title = re.sub(r"\s*\(\d{4}-\d*\)", "", title)
    title = title.replace("Volume ", "Vol. ")
    main, colon, rest = title.partition(": ")
    if colon and not re.search(r"(Vol\.|#)\s*\d", rest):
        title = main
    return title


def cover(url):
    """Asks Goodreads for a 240px-wide cover; it resizes from the filename."""
    if "/books/" not in url:  # the "no photo" placeholder
        return url
    return re.sub(r"(?:\._S[XY]\d+_)?(\.\w+)$", r"._SX240_\1", url)


def section(label, books):
    lines = [f'<p class="section-key">{label}:</p>', '<ul class="books">']
    for book in books:
        lines += [
            "  <li>",
            f'    <a href="https://www.goodreads.com/book/show/{book["id"]}" target="_blank" rel="noopener">',
            f'      <img src="{html.escape(book["cover"])}" alt="" width="240" height="360" loading="lazy">',
            f'      <span class="book-title">{html.escape(book["title"], quote=False)}</span>',
            f'      <span class="book-author">{html.escape(book["author"], quote=False)}</span>',
        ]
        if book["rating"]:  # 0 means I haven't rated it
            lit, unlit = "★" * book["rating"], "★" * (5 - book["rating"])
            lines.append(
                f'      <span class="book-rating" role="img" aria-label="rated {book["rating"]} of 5 stars">'
                + lit + (f'<span class="unlit">{unlit}</span>' if unlit else "") + "</span>"
            )
        lines += [
            "    </a>",
            "  </li>",
        ]
    lines.append("</ul>")
    return lines


def main():
    read = fetch("read")
    if not read:
        sys.exit("Goodreads returned no read books, so the page was left alone.")
    read.sort(key=lambda b: (b["read"] or b["added"], b["added"]), reverse=True)
    reading = sorted(fetch("currently-reading"), key=lambda b: b["added"], reverse=True)

    finished = read[:SHOW]
    label = f"last {len(finished)} books finished" if len(finished) > 1 else "last book finished"
    lines = section(label, finished)
    if reading:
        lines += section("currently reading", reading[:SHOW])

    page = PAGE.read_text()
    if page.count(START) != 1 or page.count(END) != 1:
        sys.exit(f"Couldn't find exactly one goodreads:start and goodreads:end in {PAGE.name}.")
    before, rest = page.split(START)
    _, after = rest.split(END)
    block = "\n".join(INDENT + line for line in [START, *lines, END])
    updated = before.rstrip(" ") + block + after

    if updated == page:
        print("Books are already up to date.")
        return
    PAGE.write_text(updated)
    print("Finished:", *(f"  {b['title']} by {b['author']}" for b in finished), sep="\n")
    print("Currently reading:", *(f"  {b['title']} by {b['author']}" for b in reading[:SHOW]), sep="\n")


if __name__ == "__main__":
    main()
