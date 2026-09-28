# Chipstack Studios — Main Site

Static marketing site for Chipstack Studios. No build step — plain HTML/CSS/JS.

## Structure

- `index.html` — homepage (hero, games, upcoming, about, footer)
- `game.html?slug=<slug>` — detail page, rendered entirely from game data
- `privacy.html` — privacy policy (static prose)
- `js/games.js` — **game registry + generative SVG poster art**
- `js/main.js` — renders games grid, upcoming list, footer links, detail page; nav toggle, hero scroll fade
- `css/style.css` — all styles (CSS variables in `:root` control the theme)
- `logo.png` — full logo lockup (transparent); `logo-icon.png` — chips mark only
- `mainlogo.png` — original logo source (RGB, black background)

## Adding a new game

Append one object to `GAMES` in `js/games.js`:

```js
{
  slug: "my-game",            // used in game.html?slug=my-game
  title: "MY GAME",
  status: "in-development",   // released | in-development | announced | stealth
  year: "2027",
  platforms: ["iOS", "ANDROID"],
  accent: "#ff6b2c",          // per-game accent color
  art: "stealth",             // key into ART — reuse existing or add a new renderer
  tagline: "...",
  short: "...",               // card description
  description: ["...", ...],  // detail page paragraphs
  features: [{ title, body }, ...],
}
```

That's it — the game automatically appears in the Games grid, the Upcoming
list (if `in-development`/`announced`), the footer, and gets a detail page.

## Previewing

Serve the folder with any static server, e.g. `python -m http.server 8000`,
then open http://localhost:8000. (Game pages use `?slug=` query params, so
opening `index.html` via `file://` works for the homepage but the detail
pages are best viewed over HTTP.)

## Conventions

- Display type: Changa One (matches the logo); body: Space Grotesk; labels: JetBrains Mono
- No eyebrow labels, no scroll-reveal animations, no marquee: deliberate anti-generic choices
- Motion is purposeful: hero logo intro + scroll-scrub fade (`.hero-stage` via `initHeroScroll`)
- Buttons: `.btn--solid` (amber) / `.btn--ghost` (outlined), hard-shadow hover
- Statuses shown via `.status--released` / `.status--dev` / `.status--stealth`
