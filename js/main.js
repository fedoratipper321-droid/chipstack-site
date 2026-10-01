/* ============================================================
   CHIPSTACK STUDIOS — site logic
   ============================================================ */

const $ = (sel, el = document) => el.querySelector(sel);

const pad2 = n => String(n + 1).padStart(2, "0");

function artSVG(game, i, title = false) {
  const renderer = ART[game.art] || ART.stealth;
  const label = title ? `role="img" aria-label="${game.title} artwork"` : `aria-hidden="true"`;
  return `<svg viewBox="0 0 800 500" ${label} preserveAspectRatio="xMidYMid slice">${renderer.call(ART, game, i)}</svg>`;
}

function statusChip(status) {
  const meta = STATUS_META[status] || STATUS_META["announced"];
  return `<span class="status ${meta.cls}">${meta.label}</span>`;
}

function gameURL(game) {
  return `game.html?slug=${encodeURIComponent(game.slug)}`;
}

/* ---------- homepage renderers ---------- */

function renderGames() {
  const grid = $("#games-grid");
  if (!grid) return;
  grid.insertAdjacentHTML(
    "beforeend",
    GAMES.map((g, i) => `
      <article class="game-card" style="--game-accent:${g.accent}">
        <a class="game-card-art" href="${gameURL(g)}" tabindex="-1">${artSVG(g, i)}</a>
        <div class="game-card-body">
          <div class="game-card-meta">
            ${statusChip(g.status)}
            <span class="mono-dim">${g.platforms.join(" / ")}</span>
          </div>
          <h3 class="game-card-title">${g.title}</h3>
          <p class="game-card-desc">${g.short}</p>
          <div class="game-card-foot">
            <a class="btn btn--ghost" href="${gameURL(g)}">VIEW GAME
              <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M2 8h10M8 3l5 5-5 5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="square"/></svg>
            </a>
            <span class="card-num">${pad2(i)}</span>
          </div>
        </div>
      </article>
    `).join("")
  );
}

function renderUpcoming() {
  const list = $("#upcoming-list");
  if (!list) return;
  const upcoming = GAMES.filter(g => g.status === "in-development" || g.status === "announced");
  list.innerHTML = upcoming.map((g, i) => `
    <a class="upcoming-row" href="${gameURL(g)}" style="--game-accent:${g.accent}">
      <span class="upcoming-idx">[${pad2(i)}]</span>
      <span class="upcoming-title">${g.title}</span>
      <span class="upcoming-plat">${g.platforms.join(" / ")} · ${g.year}</span>
      <span class="upcoming-arrow">-&gt;</span>
    </a>
  `).join("") || `
    <div class="upcoming-row" style="--game-accent:var(--accent)">
      <span class="upcoming-idx">[--]</span>
      <span class="upcoming-title">NOTHING ANNOUNCED. YET.</span>
      <span class="upcoming-plat"></span>
      <span class="upcoming-arrow"></span>
    </div>`;
}

function renderFooterGames() {
  const el = $("#footer-games");
  if (!el) return;
  el.innerHTML = GAMES.map(g =>
    `<a href="${gameURL(g)}">${g.title}</a>`
  ).join("");
}

/* ---------- game detail page ---------- */

function renderGamePage() {
  const root = $("#game-root");
  if (!root) return;

  const slug = new URLSearchParams(location.search).get("slug");
  const idx = GAMES.findIndex(g => g.slug === slug);
  const g = GAMES[idx];

  if (!g) {
    document.title = "CHIPSTACK STUDIOS — Game Not Found";
    root.innerHTML = `
      <div class="container not-found">
        <p class="mono-dim">[ SIGNAL LOST ]</p>
        <h1>GAME NOT FOUND</h1>
        <p>That cartridge isn't in the stack. It may never have existed.</p>
        <a class="btn btn--solid" href="index.html#games">BACK TO GAMES</a>
      </div>`;
    return;
  }

  document.title = `${g.title} — CHIPSTACK STUDIOS`;
  const meta = STATUS_META[g.status] || STATUS_META.announced;

  const featureHTML = g.features?.length ? `
    <section>
      <div class="section-head">
        <h2 class="section-title" style="font-size:clamp(1.8rem,4vw,2.6rem)">FEATURES</h2>
      </div>
      <div class="feature-grid">
        ${g.features.map((f, i) => `
          <div class="feature">
            <span class="feature-num">F.${pad2(i)}</span>
            <h5>${f.title}</h5>
            <p>${f.body}</p>
          </div>`).join("")}
      </div>
    </section>` : "";

  const ctaLabel = g.status === "released" ? "GET IT NOW" : "COMING SOON";

  const others = GAMES.filter(x => x.slug !== g.slug).map((x, i) => `
    <a class="upcoming-row" href="${gameURL(x)}" style="--game-accent:${x.accent}">
      <span class="upcoming-idx">[${pad2(i)}]</span>
      <span class="upcoming-title">${x.title}</span>
      <span class="upcoming-plat">${x.platforms.join(" / ")} · ${x.year}</span>
      <span class="upcoming-arrow">-&gt;</span>
    </a>`).join("");

  root.innerHTML = `
    <section class="game-hero">
      <div class="container">
        <a class="back-link" href="index.html#games">
          <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M2 8h10M8 3l5 5-5 5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="square"/></svg>
          ALL GAMES
        </a>
        <div class="game-hero-meta">
          ${statusChip(g.status)}
          <span class="mono-dim">${g.platforms.join(" / ")}</span>
          <span class="mono-dim">${g.year}</span>
        </div>
        <h1 class="game-hero-title">${g.title}</h1>
        <p class="game-hero-tag">${g.tagline}</p>
      </div>
    </section>

    <div class="container">
      <div class="game-banner" style="--game-accent:${g.accent}">${artSVG(g, idx, true)}</div>
    </div>

    <div class="container game-detail-grid">
      <div class="game-desc">
        ${g.description.map(p => `<p>${p}</p>`).join("")}
        ${featureHTML}
      </div>
      <aside class="game-sidebar">
        <div class="sidebar-block">
          <h4>DOSSIER</h4>
          <div class="fact"><dt>STATUS</dt><dd>${meta.label}</dd></div>
          <div class="fact"><dt>PLATFORM</dt><dd>${g.platforms.join(" / ")}</dd></div>
          <div class="fact"><dt>RELEASE</dt><dd>${g.year}</dd></div>
          <div class="fact"><dt>STUDIO</dt><dd>CHIPSTACK</dd></div>
        </div>
        <div class="sidebar-block">
          <h4>AVAILABILITY</h4>
          <a class="btn btn--solid" href="#" onclick="return false">${ctaLabel}</a>
          <a class="btn btn--ghost" href="mailto:hello@chipstackstudios.com?subject=${encodeURIComponent(g.title)}">ASK US ANYTHING</a>
          ${g.privacy ? `<a class="btn btn--ghost" href="${g.privacy}">PRIVACY POLICY</a>` : ""}
        </div>
      </aside>
    </div>

    <div class="container other-games">
      <div class="section-head">
        <h2 class="section-title" style="font-size:clamp(1.8rem,4vw,2.6rem)">OTHER GAMES</h2>
      </div>
      <div class="upcoming-list">${others}</div>
    </div>
  `;
}

/* ---------- shared chrome ---------- */

function initNav() {
  const nav = $("#site-nav");
  const toggle = $("#nav-toggle");
  const links = $("#nav-links");
  if (nav) addEventListener("scroll", () =>
    nav.classList.toggle("scrolled", scrollY > 8), { passive: true });
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open);
    });
    links.addEventListener("click", e => {
      if (e.target.tagName === "A") document.body.classList.remove("nav-open");
    });
  }
}

function initHeroScroll() {
  const stage = $("#hero-stage");
  if (!stage) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let ticking = false;
  const update = () => {
    const p = Math.min(1, Math.max(0, scrollY / (innerHeight * 0.7)));
    stage.style.opacity = 1 - p;
    stage.style.transform = `translateY(${scrollY * 0.32}px) scale(${1 - p * 0.06})`;
    ticking = false;
  };
  addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
}

function initYear() {
  const y = $("#year");
  if (y) y.textContent = new Date().getFullYear();
}

function initFactGames() {
  const el = $("#fact-games");
  if (el) el.textContent = pad2(GAMES.length - 1);
}

/* ---------- boot ---------- */

[
  renderGames, renderUpcoming, renderFooterGames,
  renderGamePage, initNav, initYear, initFactGames, initHeroScroll,
].forEach(fn => {
  try { fn(); } catch (err) { console.error(`[chipstack] ${fn.name} failed:`, err); }
});
