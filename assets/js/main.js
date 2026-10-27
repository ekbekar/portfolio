(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const desktop = window.matchMedia("(min-width: 1024px)");

  // ---------- Top nav: "ekbekar." menu + back-to-top with scroll progress ----------
  const siteNav = document.querySelector("[data-nav]");
  if (siteNav) {
    const toggle = siteNav.querySelector(".nav-toggle");
    const toTop = siteNav.querySelector(".nav-top");
    const bar = siteNav.querySelector(".nav-progress .bar");
    const menu = siteNav.querySelector(".nav-menu");
    const label = siteNav.querySelector("[data-nav-label]");

    const setOpen = (open) => {
      if (open === siteNav.classList.contains("is-open")) return;
      siteNav.classList.toggle("is-open", open);
      if (!open) siteNav.classList.add("was-open"); // lets the dots play their "close" animation
      document.body.classList.toggle("nav-open", open); // blurred backdrop
      menu.inert = !open; // hidden menu stays out of Tab order and clicks
      toggle.setAttribute("aria-expanded", String(open));
    };

    // Bar label follows where you are: "ekbekar." at the top, "Works / <project>" on the
    // works section, "About" on the about page. New text rolls in, old text rolls out.
    const works = document.getElementById("works");
    const isAbout = !works && /about/.test(location.pathname);
    let project = "";
    let labelKey = "ekbekar.";
    const setLabel = (key, html) => {
      if (key === labelKey) return;
      labelKey = key;
      for (const old of label.querySelectorAll(":scope > span:not(.is-out)")) {
        old.classList.remove("is-in");
        old.classList.add("is-out");
        old.addEventListener("animationend", (e) => { if (e.target === old) old.remove(); });
        if (reduceMotion) old.remove();
      }
      const next = document.createElement("span");
      next.className = "is-in";
      next.innerHTML = html;
      label.append(next);
    };
    const updateLabel = () => {
      if (works && works.getBoundingClientRect().top < 140 && project) {
        setLabel(`w:${project}`, `<span class="muted">Works /</span> ${project}`);
      } else if (isAbout && window.scrollY > 24) {
        setLabel("about", "About");
      } else {
        setLabel("ekbekar.", "ekbekar.");
      }
    };
    document.addEventListener("project:change", (e) => { project = e.detail.name; updateLabel(); });
    toggle.addEventListener("click", () => setOpen(!siteNav.classList.contains("is-open")));
    document.addEventListener("click", (e) => { if (!siteNav.contains(e.target)) setOpen(false); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && siteNav.classList.contains("is-open")) { setOpen(false); toggle.focus(); }
    });
    siteNav.querySelectorAll(".nav-menu a").forEach((a) => a.addEventListener("click", () => setOpen(false)));

    // Progress: 0 at the top, 1 at the bottom. The arrow appears once the page has scrolled.
    let ticking = false;
    let shown = null;
    const update = () => {
      ticking = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
      bar.style.strokeDashoffset = String(100 - p * 100);
      const show = window.scrollY > 24;
      if (show !== shown) {
        if (shown && !show) siteNav.classList.add("was-scrolled"); // drop gets absorbed back
        shown = show;
        siteNav.classList.toggle("is-scrolled", show);
        toTop.tabIndex = show ? 0 : -1;
      }
      updateLabel();
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();

    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      toggle.focus({ preventScroll: true });
    });
  }

  // ---------- Hero: split text into words for the blur-in (photos keep their own pop-in) ----------
  let wordIndex = 0;
  for (const inner of document.querySelectorAll(".line-inner")) {
    const walker = document.createTreeWalker(inner, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.parentElement.closest(".avatars") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      const frag = document.createDocumentFragment();
      for (const part of node.textContent.split(/(\s+)/)) {
        if (!part) continue;
        if (/^\s+$/.test(part)) { frag.append(part); continue; }
        const w = document.createElement("span");
        w.className = "word";
        w.style.setProperty("--i", wordIndex++);
        w.textContent = part;
        frag.append(w);
      }
      node.replaceWith(frag);
    }
  }

  // ---------- About: paragraphs get the same word blur, played when they scroll into view ----------
  for (const para of document.querySelectorAll(".blur-words")) {
    let i = 0;
    const walker = document.createTreeWalker(para, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      const frag = document.createDocumentFragment();
      for (const part of node.textContent.split(/(\s+)/)) {
        if (!part) continue;
        if (/^\s+$/.test(part)) { frag.append(part); continue; }
        const w = document.createElement("span");
        w.className = "word";
        w.style.setProperty("--i", i++);
        w.textContent = part;
        frag.append(w);
      }
      node.replaceWith(frag);
    }
  }

  // ---------- Hero hover tricks ----------
  // "fancy": scramble through glyphs, resolving left to right
  const fancy = document.querySelector(".fx-fancy .word") || document.querySelector(".fx-fancy");
  if (fancy) {
    const original = fancy.textContent;
    const glyphs = "!<>-_\\/[]{}=+*^?#%&@";
    let running = false;
    fancy.parentElement.closest(".fx-fancy").addEventListener("pointerenter", () => {
      if (running || reduceMotion) return;
      running = true;
      fancy.style.display = "inline-block";
      fancy.style.width = `${fancy.offsetWidth}px`; // no reflow of the line while glyphs change
      let frame = 0;
      const tick = () => {
        const revealed = Math.floor(frame / 2);
        fancy.textContent = [...original]
          .map((ch, i) => (i < revealed ? ch : glyphs[Math.floor(Math.random() * glyphs.length)]))
          .join("");
        frame++;
        if (revealed <= original.length) setTimeout(tick, 45);
        else { fancy.textContent = original; fancy.style.width = ""; running = false; }
      };
      tick();
    });
  }

  // "people-friendly": split into letters so they can wave
  const friendly = document.querySelector(".fx-friendly");
  const friendlyWord = friendly && (friendly.querySelector(".word") || friendly);
  if (friendlyWord) {
    const letters = [...friendlyWord.textContent];
    friendlyWord.textContent = "";
    letters.forEach((ch, i) => {
      const s = document.createElement("span");
      s.className = "ch";
      s.style.setProperty("--c", i);
      s.textContent = ch;
      friendlyWord.append(s);
    });
    const last = friendlyWord.lastElementChild;
    friendly.addEventListener("pointerenter", () => {
      if (reduceMotion || friendly.classList.contains("is-waving")) return;
      friendly.classList.add("is-waving");
    });
    last.addEventListener("animationend", () => friendly.classList.remove("is-waving"));
  }

  // Company badge: tap toggles the preview on touch screens; tap elsewhere closes it
  const company = document.querySelector(".company");
  if (company) {
    // Touch: first tap opens the preview, second tap follows the link
    company.addEventListener("click", (e) => {
      if ((e.pointerType !== "touch" && e.pointerType !== "pen") || company.classList.contains("is-open")) return;
      e.preventDefault();
      e.stopPropagation();
      company.classList.add("is-open");
    });
    document.addEventListener("click", () => company.classList.remove("is-open"));

    // Logo: rings wind up once per hover/focus/tap, and always finish the turn
    const outer = company.querySelector('.ring[style*="--r: 4"]');
    const spin = () => {
      if (reduceMotion || company.classList.contains("is-spinning")) return;
      company.classList.add("is-spinning");
    };
    company.addEventListener("pointerenter", spin);
    company.addEventListener("focus", spin);
    outer?.addEventListener("animationend", () => company.classList.remove("is-spinning"));
  }

  // ---------- Hero text recede fallback (where CSS scroll-driven animations are unsupported) ----------
  const hero = document.querySelector(".hero");
  const recede = document.querySelector(".hero-recede");
  if (hero && recede && !reduceMotion && !CSS.supports("animation-timeline: view()")) {
    let ticking = false;
    const update = () => {
      ticking = false;
      // 0 when the hero fills the screen, 1 once 60% of it has scrolled away
      const r = Math.min(Math.max(window.scrollY / (hero.offsetHeight * 0.6), 0), 1);
      recede.style.transform = `translateY(${-64 * r}px)`;
      recede.style.opacity = 1 - r;
    };
    window.addEventListener("scroll", () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  // ---------- Footer clock (Istanbul time) ----------
  const clock = document.querySelector("[data-clock]");
  if (clock) {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone: "Europe/Istanbul",
    });
    const tick = () => { clock.textContent = fmt.format(new Date()); };
    tick();
    setInterval(tick, 1000);
  }

  // ---------- Works: render side nav + projects ----------
  const list = document.querySelector("[data-works]");
  const sideNav = document.querySelector("[data-side-nav]");
  if (list && sideNav && window.PROJECTS) renderWorks(list, sideNav, window.PROJECTS);

  // ---------- Scroll reveal: fire once ----------
  const reveals = document.querySelectorAll(".reveal, .curtain, .blur-words, .career-list");
  // a clipped-away curtain never counts as intersecting, so watch its (unclipped) parent instead
  const watchTarget = (el) => (el.classList.contains("curtain") ? el.parentElement : el);
  if ("IntersectionObserver" in window) {
    const pending = new Map();
    // About motion plays as one timeline: things arriving together queue up (top to bottom,
    // then left to right) and each holds the stage for a slot before the next one starts
    const slotFor = (el) => {
      if (el.classList.contains("blur-words")) return el.querySelectorAll(".word").length * 8 + 150;
      if (el.classList.contains("career-list")) return 500;
      if (el.classList.contains("curtain")) return 140;
      return 0;
    };
    let nextAt = 0;
    const io = new IntersectionObserver((entries) => {
      const hits = entries.filter((e) => e.isIntersecting).sort((a, b) =>
        Math.round(a.boundingClientRect.top - b.boundingClientRect.top) || a.boundingClientRect.left - b.boundingClientRect.left);
      for (const e of hits) {
        for (const el of pending.get(e.target)) {
          const slot = slotFor(el);
          if (slot) {
            const now = performance.now();
            const delay = Math.max(0, nextAt - now);
            nextAt = now + delay + slot;
            // set on the watched element so a photo's caption (a sibling of the curtain) shares it
            e.target.style.setProperty("--start", `${Math.round(delay)}ms`);
          }
          el.setAttribute("data-visible", "");
        }
        io.unobserve(e.target);
      }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach((el) => {
      const t = watchTarget(el);
      if (!pending.has(t)) { pending.set(t, []); io.observe(t); }
      pending.get(t).push(el);
    });
  } else {
    reveals.forEach((el) => el.setAttribute("data-visible", ""));
  }

  function renderWorks(listEl, navEl, projects) {
    const icon = (p) => `assets/icons/${p.id}.svg`;
    const iconXs = (p) => `assets/icons/${p.id}-xs.svg`;
    const status = {
      ongoing: { label: "On Going", src: "assets/icons/status-ongoing.svg" },
      shipped: { label: "Shipped", src: "assets/icons/status-shipped.svg" },
    };

    // Side nav
    const ul = navEl.querySelector("ul");
    ul.insertAdjacentHTML("beforeend", projects.map((p) => `
      <li class="shrink-0">
        <a href="#${p.id}" data-target="${p.id}" class="page-control relative flex items-center p-4 text-base leading-normal whitespace-nowrap lg:w-full" style="--shift:${p.iconShift}px">
          <span class="pc-bg absolute inset-0 rounded-lg bg-slate-50" aria-hidden="true"></span>
          <img class="pc-icon relative h-6 w-auto max-w-[38px] lg:absolute lg:left-4 lg:top-1/2 lg:-mt-3" src="${iconXs(p)}" alt="" aria-hidden="true">
          <span class="pc-label relative">${p.nav}</span>
        </a>
      </li>`).join(""));

    // Projects
    listEl.innerHTML = projects.map((p) => {
      const s = status[p.status];
      const header = `
        <div class="flex items-center justify-between gap-4 lg:absolute lg:left-6 lg:right-6 lg:top-6 lg:z-10">
          <div class="flex h-8 items-center gap-2">
            <img src="${s.src}" width="24" height="24" alt="">
            <span class="text-base leading-normal text-slate-700">${s.label}</span>
          </div>
          <span class="text-right text-base leading-normal text-slate-700">${p.category}</span>
        </div>`;
      const info = (extra) => `
        <div class="flex flex-col items-start gap-2 ${extra}">
          <img src="${icon(p)}" width="50.16" height="50.16" class="size-10 lg:size-[50.16px]" alt="${p.name} logo">
          <h2 class="whitespace-nowrap text-xl font-medium leading-[1.32] text-slate-800 lg:text-2xl">${p.name}</h2>
          <p class="max-w-full text-sm font-light leading-normal text-slate-700 lg:w-[${p.descWidth}px] lg:text-base" style="max-width:${p.descWidth}px">${p.desc}</p>
        </div>`;

      let cover;
      if (p.cover.type === "phone") {
        cover = `
          <div class="relative flex flex-col gap-6 overflow-hidden rounded-2xl bg-[#f5f5f5] p-4 pb-0 lg:block lg:h-[600px] lg:rounded-[40px] lg:p-0">
            ${header}
            ${info("lg:absolute lg:left-6 lg:top-[calc(50%-69.92px)] lg:-translate-y-1/2 lg:w-[400px]")}
            <div class="zoom relative -mb-px ml-auto aspect-[464/599] w-[78%] max-w-[464px] overflow-hidden lg:absolute lg:bottom-px lg:right-0 lg:m-0 lg:h-[599px] lg:w-[464px] lg:aspect-auto">
              <img src="assets/works/${p.cover.img}" alt="${p.name} app shown on a phone" class="zoom-img absolute max-w-none" style="left:-39.66%;top:-2.34%;width:176.29%;height:102.42%" fetchpriority="${p.id === projects[0].id ? "high" : "auto"}">
            </div>
          </div>`;
      } else {
        const c = p.cover;
        const frame = [c.rounded ? "rounded-[16px]" : "", c.border ? "border border-[rgba(107,114,128,0.31)]" : ""].join(" ");
        cover = `
          <div class="relative flex flex-col gap-6 overflow-hidden rounded-2xl bg-[#f5f5f5] p-4 pb-0 lg:h-[800px] lg:gap-8 lg:rounded-[40px] lg:p-6 lg:pb-0">
            ${header.replace("lg:absolute lg:left-6 lg:right-6 lg:top-6 lg:z-10", "")}
            ${info("lg:w-[400px]")}
            <div class="relative aspect-[848.694/440] w-full overflow-hidden lg:absolute lg:bottom-0 lg:left-6 lg:top-[var(--shot-top)] lg:w-[calc(100%-59.3px)] lg:aspect-auto" style="--shot-top:${c.top}px">
              <div class="zoom absolute left-0 top-0 aspect-[848.694/693.1] w-full overflow-hidden ${frame}">
                <img src="assets/works/${c.img}" alt="${p.name} interface" class="zoom-img absolute max-w-none ${c.rounded ? "rounded-[16px]" : ""}" style="${c.imgStyle}" fetchpriority="${p.id === projects[0].id ? "high" : "auto"}">
              </div>
            </div>
          </div>`;
      }

      const assets = p.assets.map(([file, h]) => `
        <figure class="reveal overflow-hidden rounded-2xl lg:rounded-[40px]">
          <img src="assets/works/${file}" width="908" height="${h}" loading="lazy" decoding="async" alt="${p.name} design detail" class="block h-auto w-full">
        </figure>`).join("");

      return `
        <article id="${p.id}" data-project class="flex scroll-mt-[152px] flex-col gap-4 lg:scroll-mt-20 lg:gap-6" aria-label="${p.name}">
          <div class="reveal">${cover}</div>
          ${assets}
        </article>`;
    }).join("");

    // Scroll spy + sliding indicator
    const links = [...ul.querySelectorAll(".page-control")];
    const indicator = ul.querySelector(".side-indicator");
    let activeId = null;

    // Mobile: keep the active tab centred in the tab row
    let activeLi = null;
    const centerChip = (behavior) => {
      if (desktop.matches || !activeLi) return;
      const left = activeLi.offsetLeft - (ul.clientWidth - activeLi.offsetWidth) / 2;
      if (Math.abs(ul.scrollLeft - left) > 4) ul.scrollTo({ left, behavior });
    };
    // Edge blur: show each side only while there are more tabs to scroll that way
    const updateEdges = () => {
      const max = ul.scrollWidth - ul.clientWidth;
      navEl.toggleAttribute("data-more-left", ul.scrollLeft > 2);
      navEl.toggleAttribute("data-more-right", ul.scrollLeft < max - 2);
    };
    ul.addEventListener("scroll", updateEdges, { passive: true });
    window.addEventListener("resize", updateEdges);
    updateEdges();

    // iOS can drop the smooth scroll while the page is still gliding after a flick,
    // so re-centre once page scrolling has settled.
    let settle;
    window.addEventListener("scroll", () => {
      clearTimeout(settle);
      settle = setTimeout(() => centerChip(reduceMotion ? "auto" : "smooth"), 160);
    }, { passive: true });

    const setActive = (id) => {
      if (id === activeId) return;
      activeId = id;
      let current;
      for (const a of links) {
        const on = a.dataset.target === id;
        a.setAttribute("aria-current", on ? "true" : "false");
        if (on) current = a;
      }
      if (!current) return;
      document.dispatchEvent(new CustomEvent("project:change", { detail: { name: current.querySelector(".pc-label").textContent } }));
      const li = current.parentElement;
      if (indicator) {
        indicator.style.transform = `translateY(${li.offsetTop}px)`;
        indicator.style.opacity = "1";
      }
      activeLi = li;
      centerChip(reduceMotion ? "auto" : "smooth");
    };

    const sections = [...listEl.querySelectorAll("[data-project]")];
    const visible = new Map();
    let locked = false;
    let unlockTimer;
    const spy = new IntersectionObserver((entries) => {
      for (const e of entries) visible.set(e.target.id, e.isIntersecting);
      if (locked) return;
      const first = sections.find((s) => visible.get(s.id));
      if (first) setActive(first.id);
    }, { rootMargin: "-30% 0px -60% 0px" });
    sections.forEach((s) => spy.observe(s));
    setActive(sections[0].id);

    // Clicking a nav item: move the indicator straight to the target and ignore
    // the sections it passes on the way (otherwise it flickers through each one).
    const unlock = () => { locked = false; clearTimeout(unlockTimer); };
    window.addEventListener("scrollend", unlock);
    for (const a of links) {
      a.addEventListener("click", () => {
        setActive(a.dataset.target);
        locked = true;
        clearTimeout(unlockTimer);
        unlockTimer = setTimeout(unlock, 1200); // fallback where scrollend is unsupported
      });
    }

    // Mobile: the tab strip slides away while you scroll down through the projects (more room
    // for the work) and comes back as soon as you scroll up. It stays put during a tab-tap scroll.
    const worksSection = document.getElementById("works");
    let lastY = window.scrollY;
    let hidden = false;
    const setHidden = (h) => {
      if (h === hidden) return;
      hidden = h;
      navEl.toggleAttribute("data-hidden", h);
    };
    window.addEventListener("scroll", () => {
      const y = window.scrollY;
      if (desktop.matches || locked) { lastY = y; setHidden(false); return; }
      const dy = y - lastY;
      if (Math.abs(dy) < 6) return; // ignore tiny jitters
      lastY = y;
      const inWorks = worksSection.getBoundingClientRect().top < 0; // strip is stuck to the top
      setHidden(dy > 0 && inWorks);
    }, { passive: true });
  }

  // ---------- Turkish flag bunting from the top corners on national holidays ----------
  // Goes up a few days before each bayram and comes down the day after (visitor's local date).
  // 23 Nisan, 19 Mayıs, 30 Ağustos and 29 Ekim. Add ?bayrak to preview any day.
  const FLAG_DAYS = [ // [month, firstDay, month, lastDay], months 1–12
    [4, 20, 4, 24],  // 23 Nisan Ulusal Egemenlik ve Çocuk Bayramı
    [5, 16, 5, 20],  // 19 Mayıs Atatürk'ü Anma, Gençlik ve Spor Bayramı
    [8, 27, 8, 31],  // 30 Ağustos Zafer Bayramı
    [10, 22, 11, 2], // 29 Ekim Cumhuriyet Bayramı, the whole week
  ];
  const now = new Date();
  const today = (now.getMonth() + 1) * 100 + now.getDate(); // e.g. 1029
  const flagDay = FLAG_DAYS.some(([m1, d1, m2, d2]) => today >= m1 * 100 + d1 && today <= m2 * 100 + d2) ||
    /[?&](bayrak|29ekim)\b/.test(location.search);
  if (flagDay) {
    // One pennant, 26×38, hung from the middle of its top edge: red triangle, crescent opening down, star below
    const star = Array.from({ length: 10 }, (_, k) => {
      const r = k % 2 ? 0.85 : 2.1, a = -Math.PI / 2 + (k * Math.PI) / 5;
      return `${(13 + r * Math.cos(a)).toFixed(2)},${(18.6 + r * Math.sin(a)).toFixed(2)}`;
    }).join(" ");
    const pennant = `<g transform="translate(-13 0)"><path d="M0 0H26L13 38Z" fill="#FF4B55"/>` +
      `<circle cx="13" cy="11" r="5.2" fill="#F5F5F5"/><circle cx="13" cy="12.3" r="4.3" fill="#FF4B55"/>` +
      `<polygon points="${star}" fill="#F5F5F5"/></g>`;

    // A string hanging between two anchors just above the page edge takes a catenary shape:
    // y = anchorY + a·(cosh(half/a) − cosh((x − mid)/a)), with `a` solved so the dip equals `sag`.
    // Pennants are sewn along it at equal arc-length spacing, and each one's top edge lies on
    // the string's tangent, so the end ones tilt and the middle ones hang straight.
    const W = 300, H = 110, ANCHOR_Y = -14, SAG = 64, COUNT = 8, SCALE = 1.05, GAP = 7;
    const half = W / 2;
    let lo = 1, hi = 1e5; // the dip shrinks as `a` grows; bisect for the one that matches SAG
    for (let k = 0; k < 60; k++) {
      const a = (lo + hi) / 2;
      if (a * (Math.cosh(half / a) - 1) > SAG) lo = a; else hi = a;
    }
    const a = (lo + hi) / 2;
    const yAt = (x) => ANCHOR_Y + a * (Math.cosh(half / a) - Math.cosh((x - half) / a));
    const length = 2 * a * Math.sinh(half / a);
    const xAtArc = (s) => half + a * Math.asinh(s / a - Math.sinh(half / a));
    const string = Array.from({ length: 31 }, (_, k) => {
      const x = (W * k) / 30;
      return `${k ? "L" : "M"}${x.toFixed(1)} ${yAt(x).toFixed(1)}`;
    }).join("");

    const step = 26 * SCALE + GAP;
    const firstArc = length / 2 - (step * (COUNT - 1)) / 2;
    const garland = (side, windDelay) => {
      let flags = "";
      for (let k = 0; k < COUNT; k++) {
        const x = xAtArc(firstArc + k * step);
        const tilt = (Math.atan(-Math.sinh((x - half) / a)) * 180) / Math.PI;
        // The gust reaches each pennant a little later the further right it hangs
        const lag = (windDelay + (x / W) * 0.9).toFixed(2);
        flags += `<g transform="translate(${x.toFixed(1)} ${yAt(x).toFixed(1)}) rotate(${tilt.toFixed(1)}) scale(${SCALE})">` +
          `<g class="flag" style="--lag: ${lag}">${pennant}</g></g>`;
      }
      return `<svg class="bunting bunting-${side}" viewBox="0 0 ${W} ${H}">` +
        `<g class="swag" style="--lag: ${windDelay}"><path class="bunting-string" d="${string}"/>${flags}</g></svg>`;
    };

    const wrap = document.createElement("div");
    wrap.className = "bunting-wrap";
    wrap.setAttribute("aria-hidden", "true");
    wrap.innerHTML = garland("left", 0) + garland("right", 0.6);
    document.body.prepend(wrap);
  }
})();
