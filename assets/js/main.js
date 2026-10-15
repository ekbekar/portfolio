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
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.setAttribute("data-visible", "");
        io.unobserve(e.target);
      }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
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
})();
