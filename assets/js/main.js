/* ==========================================================================
   UPSARPANCH CHAI — Built By Azeem
   GSAP 3 + ScrollTrigger + SplitText + Lenis smooth scroll
   ========================================================================== */

(function () {
  "use strict";

  gsap.registerPlugin(ScrollTrigger, SplitText);

  const ACCENTS = {
    hero:   "#6B3F1D",
    coffee: "#8A5A2B",
    thali:  "#E38A2C",
    street: "#C23B22",
    sweets: "#D9A441",
    cold:   "#F2994A",
    footer: "#C23B22"
  };

  /* ------------------------------------------------------------------ *
   * 0. GRAIN OVERLAY
   * ------------------------------------------------------------------ */
  function initGrain() {
    const canvas = document.getElementById("grain");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Draw into a small fixed-size buffer and let CSS (width/height:100vw/100vh
    // on the canvas element) upscale it — a full-viewport buffer (e.g. 1920x1080
    // = ~2M pixels) redrawn on an interval was a real, measurable jank source.
    // A 240x240 buffer is ~35x fewer pixels and visually indistinguishable at
    // 3% opacity.
    const TILE = 240;
    canvas.width = TILE;
    canvas.height = TILE;

    function draw() {
      const imgData = ctx.createImageData(TILE, TILE);
      const buf = imgData.data;
      for (let i = 0; i < buf.length; i += 4) {
        const v = Math.random() * 255;
        buf[i] = buf[i + 1] = buf[i + 2] = v;
        buf[i + 3] = 22; // subtle alpha
      }
      ctx.putImageData(imgData, 0, 0);
    }
    draw();
    // occasional reroll for a subtle "living" grain feel — cheap now that the
    // buffer is tiny, and slower than before so it's never a stutter source.
    setInterval(draw, 3000);
  }

  /* ------------------------------------------------------------------ *
   * 1. CUSTOM CURSOR (ring, magnetic-aware) — fine pointer only
   * ------------------------------------------------------------------ */
  function initCursor() {
    const ring = document.getElementById("cursorRing");
    if (!ring || window.matchMedia("(pointer:coarse)").matches) return;

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;

    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      ring.classList.remove("is-hidden");
    });
    window.addEventListener("mouseleave", () => ring.classList.add("is-hidden"));

    gsap.ticker.add(() => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
    });

    document.addEventListener("mouseover", (e) => {
      if (e.target.closest("a, button, [data-hover], [data-magnetic]")) {
        ring.classList.add("is-hover");
      }
    });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest("a, button, [data-hover], [data-magnetic]")) {
        ring.classList.remove("is-hover");
      }
    });

    // tint the ring with the active section's accent colour
    document.querySelectorAll("[data-accent]").forEach((section) => {
      const accent = ACCENTS[section.dataset.accent] || ACCENTS.hero;
      ScrollTrigger.create({
        trigger: section,
        start: "top center",
        end: "bottom center",
        onToggle: (self) => {
          if (self.isActive) ring.style.borderColor = accent;
        }
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * 2. MAGNETIC BUTTON
   * ------------------------------------------------------------------ */
  function initMagnetic() {
    document.querySelectorAll("[data-magnetic]").forEach((btn) => {
      const strength = 0.35;
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * strength;
        const y = (e.clientY - r.top - r.height / 2) * strength;
        gsap.to(btn, { x, y, duration: 0.5, ease: "power3.out" });
      });
      btn.addEventListener("mouseleave", () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1,0.4)" });
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * 3. GRACEFUL MEDIA FALLBACK
   *    Any <video>/<img> that fails (or is simply missing on disk)
   *    reveals the warm-white placeholder instead of breaking layout.
   * ------------------------------------------------------------------ */
  function initMediaFallbacks() {
    document.querySelectorAll(".media-frame").forEach((frame) => {
      const video = frame.querySelector("video");
      const img = frame.querySelector("img");
      const el = video || img;
      if (!el) return;

      const markLoaded = () => frame.classList.add("is-loaded");
      const markMissing = () => frame.classList.add("is-missing");

      if (video) {
        // the preloader delays boot() by ~2.4s — on fast (especially local)
        // connections the video's 'loadeddata' event can fire *before* this
        // listener is attached, so check current readiness first.
        if (video.readyState >= 2) {
          markLoaded();
        } else {
          video.addEventListener("loadeddata", markLoaded);
        }
        video.addEventListener("error", markMissing, true);
        // if a <source> 404s, the video element itself fires 'error'
        video.querySelectorAll("source").forEach((s) =>
          s.addEventListener("error", markMissing)
        );
        // safety net: if nothing happens quickly, assume missing
        setTimeout(() => {
          if (video.readyState === 0) markMissing();
        }, 2500);
      } else if (img) {
        if (img.complete && img.naturalWidth > 0) markLoaded();
        img.addEventListener("load", () => {
          if (img.naturalWidth > 0) markLoaded();
          else markMissing();
        });
        img.addEventListener("error", markMissing);
      }
    });
  }

  /* ------------------------------------------------------------------ *
   * 3b. PAUSE OFF-SCREEN VIDEOS
   *     Every autoplay/loop background video was decoding continuously
   *     regardless of scroll position — with 5 HD videos that's a lot of
   *     simultaneous work and a real source of scroll jank. Pause each one
   *     the moment it leaves the viewport, resume when it re-enters.
   *     (The two pinned "scrub" videos aren't autoplay — their currentTime
   *     is driven by scroll and ScrollTrigger already gates that to when
   *     the pin is active — so they're untouched here.)
   * ------------------------------------------------------------------ */
  function initVideoVisibilityPausing() {
    const videos = document.querySelectorAll("video[autoplay]");
    if (!videos.length || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const v = entry.target;
        if (entry.isIntersecting) v.play().catch(() => {});
        else v.pause();
      });
    }, { threshold: 0.1 });
    videos.forEach((v) => io.observe(v));
  }

  /* ------------------------------------------------------------------ *
   * 3c. LOTTIE FALLBACKS (LottieFiles dotlottie-wc web component)
   *     Same graceful pattern as media: a static glyph shows until the
   *     animation reports 'load'; stays put if it errors or the CDN/
   *     script is blocked, so nothing ever breaks layout.
   * ------------------------------------------------------------------ */
  function initLottieFallbacks() {
    document.querySelectorAll(".lottie-frame").forEach((frame) => {
      const el = frame.querySelector(".lottie-el");
      if (!el) return;
      el.addEventListener("load", () => frame.classList.add("is-loaded"));
      el.addEventListener("error", () => frame.classList.remove("is-loaded"));
      // safety net: custom element script may be blocked entirely
      setTimeout(() => {
        if (!customElements.get("dotlottie-wc")) frame.classList.remove("is-loaded");
      }, 3000);
    });
  }

  /* ------------------------------------------------------------------ *
   * 4. LENIS SMOOTH SCROLL <-> SCROLLTRIGGER
   * ------------------------------------------------------------------ */
  function initSmoothScroll() {
    if (typeof Lenis === "undefined") return null;
    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    return lenis;
  }

  /* ------------------------------------------------------------------ *
   * 5. PRELOADER
   * ------------------------------------------------------------------ */
  function runPreloader(onDone) {
    const pre = document.getElementById("preloader");
    const titleEl = document.getElementById("preloaderTitle");
    const bar = document.getElementById("preloaderBarFill");
    if (!pre) { onDone(); return; }

    const split = new SplitText(titleEl, { type: "chars", charsClass: "pc" });

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(pre, {
          autoAlpha: 0,
          duration: 0.7,
          ease: "power2.inOut",
          onComplete: () => { pre.style.display = "none"; onDone(); }
        });
      }
    });
    tl.to(split.chars, {
      opacity: 1, y: 0, duration: 0.55, ease: "power3.out", stagger: 0.035
    })
      .to(bar, { width: "100%", duration: 0.9, ease: "power2.inOut" }, 0.1)
      .to({}, { duration: 0.25 }); // brief hold
  }

  /* ------------------------------------------------------------------ *
   * 6. HERO — split-text reveal + scroll parallax zoom-out
   * ------------------------------------------------------------------ */
  function initHero() {
    const heroTitle = document.getElementById("heroTitle");
    const hero = document.getElementById("hero");
    if (!heroTitle || !hero) return;

    const split = new SplitText(heroTitle, { type: "chars", charsClass: "char" });
    gsap.set(split.chars, { yPercent: 120, opacity: 0 });

    const logo = hero.querySelector(".hero-logo-badge");
    const kicker = hero.querySelector(".kicker");
    const sub = hero.querySelector(".hero-sub");
    const tagline = hero.querySelector(".hero-tagline");

    const tl = gsap.timeline({ delay: 0.15 });
    if (logo) tl.to(logo, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" });
    tl.to(kicker, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, logo ? "-=0.35" : 0)
      .to(split.chars, {
        yPercent: 0, opacity: 1, duration: 0.9, ease: "power4.out", stagger: 0.028
      }, "-=0.3")
      .to(sub, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, "-=0.5")
      .to(tagline, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, "-=0.4");

    // parallax zoom-out on scroll start
    gsap.to(hero.querySelectorAll(".media-frame--bg"), {
      scale: 1.18,
      scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.6 }
    });
    gsap.to(hero.querySelector(".hero-content"), {
      opacity: 0, y: -60,
      scrollTrigger: { trigger: hero, start: "10% top", end: "70% top", scrub: 0.6 }
    });
  }

  /* ------------------------------------------------------------------ *
   * 7. GENERIC "REVEAL UP" ON SCROLL (non-hero elements)
   * ------------------------------------------------------------------ */
  function initReveals() {
    gsap.utils.toArray(".reveal-up").forEach((el) => {
      if (el.closest(".hero")) return; // hero handles its own timeline
      gsap.fromTo(el,
        { opacity: 0, y: 24 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none reverse" }
        }
      );
    });

    gsap.utils.toArray(".stat").forEach((el, i) => {
      gsap.fromTo(el, { opacity: 0, y: 20 }, {
        opacity: 1, y: 0, duration: 0.6, delay: i * 0.1, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none reverse" }
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * 8. NAV VISIBILITY
   * ------------------------------------------------------------------ */
  function initNav() {
    const nav = document.getElementById("siteNav");
    if (!nav) return;
    ScrollTrigger.create({
      trigger: "#hero",
      start: "bottom top+=120",
      onEnter: () => nav.classList.add("is-visible"),
      onLeaveBack: () => nav.classList.remove("is-visible")
    });
  }

  /* ------------------------------------------------------------------ *
   * 9. PINNED SCROLL-SCRUB SECTIONS (Exploded Thali / Samosa)
   *    THE hero interaction. Binds video.currentTime to scroll progress
   *    when real footage is present; otherwise drives a CSS/GSAP
   *    "ingredients assemble" fallback so scroll is never dead.
   * ------------------------------------------------------------------ */
  function initPinScrub(section) {
    const video = section.querySelector(".scrub-video");
    const items = section.querySelectorAll(".assembly-item");
    const plate = section.querySelector(".assembly-plate");
    const labels = section.querySelectorAll(".pop-label");
    const progressBar = section.querySelector(".scrub-progress span");

    // randomized "explode" origins for each ingredient, per item (cycled if more items than origins)
    const origins = [
      { x: -260, y: -140, r: -35 },
      { x: 260, y: -120, r: 28 },
      { x: -240, y: 160, r: 22 },
      { x: 250, y: 150, r: -24 },
      { x: -320, y: 10, r: -18 },
      { x: 320, y: 20, r: 32 }
    ];
    items.forEach((item, i) => {
      const o = origins[i % origins.length];
      const angle = (i / items.length) * Math.PI * 2;
      gsap.set(item, {
        x: o.x, y: o.y, rotate: o.r, scale: 0.5, opacity: 0,
        xPercent: -50, yPercent: -50
      });
      item.dataset.targetX = Math.cos(angle) * 90;
      item.dataset.targetY = Math.sin(angle) * 90;
    });
    if (plate) gsap.set(plate, { opacity: 0, scale: 0.6, xPercent: -50, yPercent: -50, left: "50%", top: "50%" });
    gsap.set(labels, { opacity: 0, y: 14 });

    let videoReady = false;
    if (video) {
      // same fix as initMediaFallbacks(): fast-loading local video can hit
      // 'loadedmetadata' before this listener attaches (boot() runs after
      // the preloader delay), so check current readiness first too.
      const markReady = () => {
        if (isFinite(video.duration) && video.duration > 0) videoReady = true;
      };
      if (video.readyState >= 1) markReady();
      else video.addEventListener("loadedmetadata", markReady);
    }

    // Setting video.currentTime is expensive (browsers often re-seek to the
    // nearest keyframe each time) — doing it on every single scroll tick
    // (up to ~60/sec with Lenis's smooth interpolation) was a major jank
    // source. Cap real seeks to ~24/sec; everything else (progress bar,
    // labels, fallback assembly) still updates every frame since those are
    // cheap.
    let lastSeek = 0;
    const SEEK_INTERVAL_MS = 42;

    ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "+=180%",
      pin: true,
      scrub: 1,
      onUpdate: (self) => {
        const p = self.progress;

        if (progressBar) progressBar.style.width = (p * 100) + "%";

        if (videoReady) {
          const now = performance.now();
          if (now - lastSeek >= SEEK_INTERVAL_MS) {
            video.currentTime = p * video.duration;
            lastSeek = now;
          }
        } else {
          // fallback assembly, driven purely by scroll progress
          const assembleP = gsap.utils.clamp(0, 1, p / 0.75); // finishes assembling by 75%
          if (plate) {
            gsap.set(plate, { opacity: assembleP, scale: 0.6 + assembleP * 0.4 });
          }
          items.forEach((item, i) => {
            const o = origins[i % origins.length];
            const tx = parseFloat(item.dataset.targetX);
            const ty = parseFloat(item.dataset.targetY);
            gsap.set(item, {
              x: gsap.utils.interpolate(o.x, tx, assembleP),
              y: gsap.utils.interpolate(o.y, ty, assembleP),
              rotate: gsap.utils.interpolate(o.r, 0, assembleP),
              scale: gsap.utils.interpolate(0.5, 1, assembleP),
              opacity: assembleP
            });
          });
        }

        // pop labels at staggered thresholds regardless of video/fallback mode
        // (spread evenly across the scrub range so any label count — 4 or 6 — fits)
        labels.forEach((label, i) => {
          const span = labels.length > 1 ? labels.length - 1 : 1;
          const threshold = 0.16 + (i / span) * 0.72;
          const on = p >= threshold;
          gsap.to(label, {
            opacity: on ? 1 : 0, y: on ? 0 : 14,
            duration: 0.3, overwrite: "auto"
          });
        });
      }
    });
  }

  /* ------------------------------------------------------------------ *
   * 10. HORIZONTAL SCROLL GALLERIES (Sweets + Ingredient texture wall)
   * ------------------------------------------------------------------ */
  function initHScroll(trackId, cardsId, { parallax = false } = {}) {
    const track = document.getElementById(trackId);
    const cards = document.getElementById(cardsId);
    if (!track || !cards) return;

    function build() {
      ScrollTrigger.getAll().forEach((st) => { if (st.vars.id === trackId) st.kill(); });

      const totalWidth = cards.scrollWidth;
      const viewport = window.innerWidth;
      const distance = Math.max(0, totalWidth - viewport + 96);

      track.style.height = (distance > 0 ? (distance / viewport) * 100 + 100 : 140) + "vh";

      const st = gsap.to(cards, {
        x: -distance,
        ease: "none",
        scrollTrigger: {
          id: trackId,
          trigger: track,
          start: "top top",
          end: () => "+=" + distance,
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (!parallax) return;
            const p = self.progress;
            cards.querySelectorAll("[data-speed]").forEach((card) => {
              const speed = parseFloat(card.dataset.speed) || 1;
              const offset = (p - 0.5) * 60 * (speed - 1);
              gsap.set(card, { y: offset });
            });
          }
        }
      });
    }

    build();
    window.addEventListener("resize", () => {
      clearTimeout(window.__hsResizeTO);
      window.__hsResizeTO = setTimeout(() => ScrollTrigger.refresh(), 250);
    });
  }

  /* ------------------------------------------------------------------ *
   * 11. FINALE PARALLAX
   * ------------------------------------------------------------------ */
  function initFinaleParallax() {
    const finale = document.getElementById("finale");
    if (!finale) return;
    gsap.to(finale.querySelectorAll(".media-frame--bg"), {
      yPercent: 14,
      ease: "none",
      scrollTrigger: { trigger: finale, start: "top bottom", end: "bottom top", scrub: 0.6 }
    });
  }

  /* ------------------------------------------------------------------ *
   * 12. RESERVE BUTTON — placeholder action (no booking backend yet)
   * ------------------------------------------------------------------ */
  function initReserveButton() {
    const btn = document.getElementById("reserveBtn");
    if (!btn) return;
    btn.addEventListener("click", () => {
      btn.querySelector("span").textContent = "SEE YOU SOON ✓";
      setTimeout(() => { btn.querySelector("span").textContent = "RESERVE YOUR TABLE"; }, 2200);
    });
  }

  /* ------------------------------------------------------------------ *
   * BOOT
   * ------------------------------------------------------------------ */
  function boot() {
    initGrain();
    initMediaFallbacks();
    initLottieFallbacks();
    initVideoVisibilityPausing();
    const lenis = initSmoothScroll();
    window.__lenis = lenis; // debug hook — safe to leave, used by QA/dev tools only

    initCursor();
    initMagnetic();
    initNav();
    initHero();
    initReveals();
    initFinaleParallax();
    initReserveButton();

    document.querySelectorAll(".pin-scrub").forEach(initPinScrub);
    initHScroll("sweetsTrack", "sweetsCards", { parallax: false });
    initHScroll("galleryTrack", "galleryCards", { parallax: true });

    ScrollTrigger.refresh();
  }

  window.addEventListener("DOMContentLoaded", () => {
    runPreloader(boot);
  });
})();
