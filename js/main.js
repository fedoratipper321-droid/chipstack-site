/* ============================================================
   CHIPSTACK STUDIOS · site logic
   ============================================================ */

const $ = (sel, el = document) => el.querySelector(sel);

const pad2 = n => String(n + 1).padStart(2, "0");

/* characters/residents with a `file` open a dossier sheet */
let ROSTER = [];

function artSVG(game, i, title = false) {
  const renderer = ART[game.art] || ART.stealth;
  const label = title ? `role="img" aria-label="${game.title} artwork"` : `aria-hidden="true"`;
  return `<svg viewBox="0 0 800 500" ${label} preserveAspectRatio="xMidYMid slice">${renderer.call(ART, game, i)}</svg>`;
}

function artMedia(game, i, title = false) {
  const src = title ? (game.banner || game.cardArt) : (game.cardArt || game.banner);
  if (src) {
    const alt = title ? `alt="${game.title} key art"` : `alt=""`;
    return `<img src="${src}" ${alt} loading="lazy">`;
  }
  return artSVG(game, i, title);
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
        <a class="game-card-art" href="${gameURL(g)}" tabindex="-1">${artMedia(g, i)}</a>
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
            ${g.store ? `<a class="btn btn--ghost" href="${g.store}" target="_blank" rel="noopener">GOOGLE PLAY
              <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M6 3l7 5-7 5V3z" fill="currentColor"/></svg>
            </a>` : ""}
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
    document.title = "CHIPSTACK STUDIOS · Game Not Found";
    root.innerHTML = `
      <div class="container not-found">
        <p class="mono-dim">[ SIGNAL LOST ]</p>
        <h1>GAME NOT FOUND</h1>
        <p>That cartridge isn't in the stack. It may never have existed.</p>
        <a class="btn btn--solid" href="index.html#games">BACK TO GAMES</a>
      </div>`;
    return;
  }

  document.title = `${g.title} · CHIPSTACK STUDIOS`;
  const meta = STATUS_META[g.status] || STATUS_META.announced;
  ROSTER = [];

  if (g.accent) {
    const rs = document.documentElement.style;
    rs.setProperty("--accent", g.accent);
    rs.setProperty("--accent-ink", g.accentInk || g.accent);
  }

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

  const pitchHTML = g.pitch?.length ? `
    <div class="container pitch">
      ${g.pitch.map((p, i) => `<p${i === 0 ? ' class="pitch-lede"' : ""}>${p}</p>`).join("")}
    </div>` : "";

  const loopHTML = g.loop?.length ? `
    <div class="container">
      <div class="loop-strip">
        ${g.loop.map((s, i) => `<span class="loop-step"><b>${pad2(i)}</b>${s}</span>`).join('<span class="loop-sep">→</span>')}
      </div>
    </div>` : "";

  const shotsHTML = g.shots?.length ? `
    <div class="container">
      <div class="shot-strip">
        ${g.shots.map(s => `<figure class="shot"><img src="${s.img}" alt="${s.alt}" loading="lazy"></figure>`).join("")}
      </div>
    </div>` : "";

  const ladderHTML = g.ladder?.steps?.length ? `
    <section class="section section--alt">
      <div class="container">
        <div class="section-head">
          <h2 class="section-title">THE JUNK LADDER</h2>
          <p class="section-note">Scale is<br/>the story</p>
        </div>
        <div class="loop-strip loop-strip--ladder">
          ${g.ladder.steps.map((s, i) => `<span class="loop-step"><b>${pad2(i)}</b>${s}</span>`).join('<span class="loop-sep">→</span>')}
        </div>
        <p class="ladder-caption">${g.ladder.caption}</p>
      </div>
    </section>` : "";

  const worldHTML = g.world ? `
    <section class="section">
      <div class="container">
        <div class="section-head">
          <h2 class="section-title">LOWTIDE</h2>
          <p class="section-note">Case file<br/>the town</p>
        </div>
        <p class="world-intro">${g.world.intro}</p>
        ${g.world.map ? `<figure class="world-map"><img src="${g.world.map}" alt="Map of Lowtide" loading="lazy"><figcaption>LOWTIDE · SUBJECT TO TIDAL DELIVERY</figcaption></figure>` : ""}
        <p class="world-sub">KNOWN ASSOCIATES · OPEN A FILE</p>
        <div class="file-grid">
          ${g.world.characters.map(c => {
            const ci = ROSTER.push(c) - 1;
            return `
            <div class="file-card" ${c.file ? `data-ci="${ci}" tabindex="0" role="button"` : ""}>
              <div class="file-card-head">
                <span class="file-face">${c.portrait ? `<img src="${c.portrait}" alt="${c.name}">` : c.name[0]}</span>
                <div>
                  <h5>${c.name}</h5>
                  <span class="file-tag">${c.species} · ${c.role}</span>
                </div>
              </div>
              <p>${c.note}</p>
            </div>`;
          }).join("")}
        </div>
        <p class="world-sub">BEYOND LOWTIDE</p>
        <div class="places">
          ${g.world.places.map(p => `
            <div class="place">
              ${p.image ? `<div class="place-map"><img src="${p.image}" alt="Map of ${p.name}" loading="lazy"></div>` : ""}
              <div class="place-body">
                <h5 class="place-name">${p.name}</h5>
                <p>${p.text}</p>
                ${p.residents?.length ? `<div class="place-res">
                  ${p.residents.map(r => {
                    const ci = ROSTER.push(r) - 1;
                    return `
                    <div class="res" ${r.file ? `data-ci="${ci}" tabindex="0" role="button"` : ""}>
                      <img src="${r.img}" alt="${r.name}" loading="lazy">
                      <div><b>${r.name}</b><span>${r.tag}</span></div>
                    </div>`;
                  }).join("")}
                </div>` : ""}
              </div>
            </div>`).join("")}
          <p class="world-travel">${g.world.travel}</p>
        </div>
      </div>
    </section>` : "";

  const filesHTML = g.files?.length ? `
    <div class="container files">
      ${g.files.map((f, i) => `
        <div class="file-block">
          ${f.img ? `<div class="file-block-img"><img src="${f.img}" alt="${f.imgAlt || f.title}" loading="lazy"></div>` : ""}
          <div class="file-block-body">
            <span class="mono-dim">CASE SYSTEM ${pad2(i)}</span>
            <h5>${f.title}</h5>
            <p>${f.body}</p>
          </div>
        </div>`).join("")}
    </div>` : "";

  const arcHTML = g.arc?.length ? `
    <section class="section arc-section">
      <div class="container">
        <div class="section-head">
          <h2 class="section-title">THE ASCENT</h2>
          <p class="section-note">from felt<br/>to orbit</p>
        </div>
        <div class="arc">
          ${g.arc.map((s, i) => `
            <div class="arc-step" style="--arc-accent:${s.tone || g.accent}">
              <div class="arc-meta">
                <span class="arc-num">STAGE ${pad2(i)}</span>
                <h3 class="arc-title">${s.stage}</h3>
              </div>
              <div class="arc-body">
                <p>${s.body}</p>
                ${s.cards?.length ? `<div class="arc-cards">
                  ${s.cards.map(c => `
                    <figure class="arc-card">
                      <img src="${c.img}" alt="${c.name}" loading="lazy">
                      <figcaption><b>${c.name}</b><span>${c.tag}</span></figcaption>
                    </figure>`).join("")}
                </div>` : ""}
                ${s.ranks?.length ? `<div class="rank-strip">
                  ${s.ranks.map((r, ri) => `
                    <span class="rank"><b>${r.name}</b><i>${r.at}</i></span>${ri < s.ranks.length - 1 ? '<span class="loop-sep">→</span>' : ""}
                  `).join("")}
                </div>` : ""}
              </div>
              ${s.img ? `<figure class="arc-img"><img src="${s.img}" alt="${s.imgAlt || s.stage}" loading="lazy"></figure>` : ""}
            </div>`).join("")}
        </div>
      </div>
    </section>` : "";

  const closerHTML = g.closer ? `
    <div class="container closer"><p>${g.closer}</p></div>` : "";

  const legalHTML = g.legal ? `
    <div class="container"><p class="legal">${g.legal}</p></div>` : "";

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
        ${g.legal ? `<p class="sim-chip">18+ · SIMULATED GAMBLING · VIRTUAL CURRENCY ONLY · NO REAL-MONEY WINNINGS OR PRIZES</p>` : ""}
        <h1 class="game-hero-title">${g.title}</h1>
        <p class="game-hero-tag">${g.tagline}</p>
      </div>
    </section>

    <div class="container">
      <div class="game-banner" style="--game-accent:${g.accent}">${artMedia(g, idx, true)}</div>
    </div>

    ${pitchHTML}
    ${loopHTML}

    <div class="container game-detail-grid">
      <div class="game-desc">
        ${g.description.map(p => `<p>${p}</p>`).join("")}
        ${g.verbs?.length ? `<div class="verb-row">${g.verbs.map(v => `<span class="verb">${v}</span>`).join("")}</div>` : ""}
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
          ${g.store
            ? `<a class="btn btn--solid" href="${g.store}" target="_blank" rel="noopener">GET IT ON GOOGLE PLAY</a>`
            : `<a class="btn btn--solid" href="#" onclick="return false">${ctaLabel}</a>`}
          <a class="btn btn--ghost" href="mailto:hello@chipstackstudios.com?subject=${encodeURIComponent(g.title)}">ASK US ANYTHING</a>
          ${g.privacy ? `<a class="btn btn--ghost" href="${g.privacy}">PRIVACY POLICY</a>` : ""}
        </div>
      </aside>
    </div>

    ${shotsHTML}
    ${ladderHTML}
    ${arcHTML}
    ${worldHTML}
    ${filesHTML}
    ${closerHTML}
    ${legalHTML}

    <div class="container other-games">
      <div class="section-head">
        <h2 class="section-title" style="font-size:clamp(1.8rem,4vw,2.6rem)">OTHER GAMES</h2>
      </div>
      <div class="upcoming-list">${others}</div>
    </div>
  `;

  initCharFiles(root);
}

/* ---------- character dossier sheet ---------- */

function initCharFiles(root) {
  let modal = $("#char-modal");
  if (!modal) {
    document.body.insertAdjacentHTML("beforeend", `
      <div class="char-modal" id="char-modal" aria-hidden="true">
        <div class="char-back" data-close></div>
        <div class="char-sheet" role="dialog" aria-modal="true" aria-label="Character file">
          <div class="char-img"><img alt=""></div>
          <div class="char-body">
            <span class="file-tag" id="cm-tag"></span>
            <h4 id="cm-name"></h4>
            <ul id="cm-notes"></ul>
            <blockquote id="cm-quote"></blockquote>
          </div>
          <button class="char-close" data-close aria-label="Close file">×</button>
        </div>
      </div>`);
    modal = $("#char-modal");
    modal.addEventListener("click", e => {
      if (e.target.hasAttribute("data-close")) closeCharFile();
    });
    addEventListener("keydown", e => {
      if (e.key === "Escape") closeCharFile();
    });
  }

  const open = c => {
    const img = c.portrait || c.img;
    const meta = [c.species, c.role || c.tag].filter(Boolean).join(" · ");
    $("#char-modal .char-img").innerHTML = img ? `<img src="${img}" alt="${c.name}">` : `<span class="char-letter">${c.name[0]}</span>`;
    $("#cm-tag").textContent = meta;
    $("#cm-name").textContent = c.name;
    $("#cm-notes").innerHTML = (c.file.notes || []).map(n => `<li>${n}</li>`).join("");
    const q = $("#cm-quote");
    if (c.file.quote) { q.textContent = `"${c.file.quote}"`; q.style.display = ""; }
    else q.style.display = "none";
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  root.addEventListener("click", e => {
    const el = e.target.closest("[data-ci]");
    if (el) open(ROSTER[+el.dataset.ci]);
  });
  root.addEventListener("keydown", e => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const el = e.target.closest("[data-ci]");
    if (el) { e.preventDefault(); open(ROSTER[+el.dataset.ci]); }
  });
}

function closeCharFile() {
  const modal = $("#char-modal");
  if (!modal) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
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

function initPageTransitions() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // remember where internal links were clicked
  addEventListener("click", e => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest("a[href]");
    if (!a || a.target === "_blank") return;
    try {
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.hash) return; // in-page scroll
      sessionStorage.setItem("vt-pos", JSON.stringify({ x: e.clientX, y: e.clientY }));
    } catch (err) {}
  });

  // iris-open the incoming page from the click point
  addEventListener("pagereveal", e => {
    if (!e.viewTransition) return;
    let x = innerWidth / 2, y = innerHeight / 2;
    try {
      const pos = JSON.parse(sessionStorage.getItem("vt-pos"));
      if (pos && typeof pos.x === "number") { x = pos.x; y = pos.y; }
      sessionStorage.removeItem("vt-pos");
    } catch (err) {}
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
      { duration: 650, easing: "cubic-bezier(.22,1,.36,1)", pseudoElement: "::view-transition-new(root)" }
    );
  });
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
  renderGamePage, initNav, initYear, initFactGames, initHeroScroll, initPageTransitions,
].forEach(fn => {
  try { fn(); } catch (err) { console.error(`[chipstack] ${fn.name} failed:`, err); }
});
