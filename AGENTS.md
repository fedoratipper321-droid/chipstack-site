# Chipstack Studios — Main Site

Static marketing site for Chipstack Studios. No build step — plain HTML/CSS/JS.

## Structure

- `index.html` — homepage (hero, games, upcoming, about, footer)
- `game.html?slug=<slug>` — detail page, rendered entirely from game data
- `privacy.html` — privacy policy (static prose)
- `js/games.js` — **game registry + generative SVG poster art**
- `js/main.js` — renders games grid, upcoming list, footer links, detail page; nav toggle, hero scroll fade
- `css/style.css` — all styles (CSS variables in `:root` control the theme)
- `img/sj/` — Salvage Junkies art (key art, town maps, dossier portraits, resident badges, stills), optimized WebP from the game repo
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
  description: ["...", ...],  // detail page paragraphs (beside the sidebar)
  features: [{ title, body }, ...],   // optional feature grid
  privacy: "privacy-xxx.html",        // optional: adds a policy button
}
```

Optional richer sections (used by Salvage Junkies — omit for a standard page):

```js
banner: "img/...webp",          // real art for the detail-page banner
cardArt: "img/...webp",         // optional separate art for the homepage card
                                // (each falls back to the other, then ART[])
pitch: ["big lede line", "supporting line"],  // statement block under banner
loop: ["FIND IT", "..."],                     // horizontal loop strip
verbs: ["LOOSEN", "..."],                     // mono chip row inside description
ladder: { steps: ["TOASTERS", "..."], caption: "..." },  // scale strip + line
shots: [{ img, alt }],          // gameplay stills strip (tilted plates)
world: {
  map: "img/...webp",           // optional establishing map above the intro
  intro: "...",
  characters: [{ name, species, role, note, portrait? }],  // case-file cards
  places: [{ name, text, image?, residents: [{ name, img, tag }] }],
  travel: "...",
},
files: [{ title, body, img?, imgAlt? }],  // case-system blocks
                                        // (dossier, odd drawer, ...)
arc: [{                                 // escalation narrative (Blackjack Empire)
  stage, body, img?, imgAlt?, tone?,    // tone overrides the step's accent color
  cards?: [{ img, name, tag }],         // mini property/asset card grid
  ranks?: [{ name, at }],               // progression strip with thresholds
}],
closer: "...",              // large closing line
legal: "...",               // small mono disclaimer under the closer
```

That's it — the game automatically appears in the Games grid, the Upcoming
list (if `in-development`/`announced`), the footer, and gets a detail page.
Character cards show a display-font initial in `.file-face` until you set a
`portrait` image path. Characters and place `residents` with a `file:`
field (`{ notes: [...], quote? }`) open a dossier sheet modal on click.

## Previewing

Serve the folder with any static server, e.g. `python -m http.server 8000`,
then open http://localhost:8000. (Game pages use `?slug=` query params, so
opening `index.html` via `file://` works for the homepage but the detail
pages are best viewed over HTTP.)

## Conventions

- Display type: Changa One (matches the logo); body: Space Grotesk; labels: JetBrains Mono
- Dark theme only. Internal page navigations iris-open via cross-document
  View Transitions (`@view-transition` in css + `initPageTransitions` in
  main.js stashes the click position in sessionStorage["vt-pos"])
- No eyebrow labels, no scroll-reveal animations, no marquee: deliberate anti-generic choices
- Motion is purposeful: hero logo intro + scroll-scrub fade (`.hero-stage` via `initHeroScroll`)
- Buttons: `.btn--solid` (amber) / `.btn--ghost` (outlined), hard-shadow hover
- Statuses shown via `.status--released` / `.status--dev` / `.status--stealth`
