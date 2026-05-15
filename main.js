/* ═══════════════════════════════════════════════════════════
   GRAPA Estudio — main.js
   Pattern: IIFE (no ES modules). Classic <script defer>.
   v20260515
═══════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ── UTILS ──────────────────────────────────────────────── */
  function safe(fn, name) {
    try { fn(); }
    catch (e) { console.warn("[GRAPA/" + name + "]", e); }
  }

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  /* ── SMOOTH SCROLL ──────────────────────────────────────── */
  function initSmoothScroll() {
    var NAV_OFFSET = 72;
    var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();

      /* close mobile nav if open */
      var toggle = qs(".nav-toggle");
      var links = qs(".nav-links");
      if (toggle && toggle.classList.contains("open")) {
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        links.classList.remove("open");
      }

      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET,
        behavior: reduced ? "auto" : "smooth",
      });
    });
  }

  /* ── NAV ─────────────────────────────────────────────────── */
  function initNav() {
    var nav = qs(".nav");
    if (!nav) return;

    var lastScroll = 0;

    function onScroll() {
      var y = window.scrollY;
      if (y > 60) { nav.classList.add("scrolled"); }
      else        { nav.classList.remove("scrolled"); }
      lastScroll = y;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* Mobile toggle */
    var toggle = qs(".nav-toggle");
    var links  = qs(".nav-links");
    if (toggle && links) {
      toggle.addEventListener("click", function () {
        var open = toggle.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
        links.classList.toggle("open", open);
        nav.classList.toggle("menu-open", open);
      });
    }
  }

  /* ── CURSOR ─────────────────────────────────────────────── */
  function initCursor() {
    if (matchMedia("(hover: none)").matches) return;

    var cursor = qs(".cursor");
    var ring   = qs(".cursor-ring");
    var dot    = qs(".cursor-dot");
    if (!cursor || !ring || !dot) return;

    var rx = 0, ry = 0, mx = 0, my = 0;
    var firstMove = false;
    var raf;

    window.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      if (!firstMove) {
        firstMove = true;
        rx = mx; ry = my;
        ring.style.transform = "translate3d(" + mx + "px," + my + "px,0)";
        dot.style.transform  = "translate3d(" + mx + "px," + my + "px,0)";
        cursor.classList.add("is-ready");
        if (!raf) loop();
      }
    });

    function loop() {
      raf = requestAnimationFrame(loop);
      rx += (mx - rx) * 0.14;
      ry += (my - ry) * 0.14;
      ring.style.transform = "translate3d(" + rx + "px," + ry + "px,0)";
      dot.style.transform  = "translate3d(" + mx + "px," + my + "px,0)";
    }

    /* Link hover state */
    var links = qsa("a, button, .filter-btn, .proyecto-card");
    links.forEach(function (el) {
      el.addEventListener("mouseover", function (e) {
        if (cursor.contains(e.relatedTarget)) return;
        cursor.classList.add("is-link");
      });
      el.addEventListener("mouseout", function (e) {
        if (cursor.contains(e.relatedTarget)) return;
        cursor.classList.remove("is-link");
      });
    });

    document.addEventListener("mouseleave", function () {
      cursor.classList.remove("is-ready");
    });
    document.addEventListener("mouseenter", function () {
      if (firstMove) cursor.classList.add("is-ready");
    });
  }

  /* ── HERO PARALLAX ──────────────────────────────────────── */
  function initHeroParallax() {
    var img = qs(".hero-img");
    if (!img) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      img.style.transform = "scale(1)";
      return;
    }

    function onScroll() {
      var y = window.scrollY;
      var shift = y * 0.22;
      img.style.transform = "scale(1.07) translateY(" + shift + "px)";
    }

    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ── REVEALS ─────────────────────────────────────────────── */
  function initReveals() {
    var els = qsa(".reveal");
    if (!els.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var delay = parseFloat(el.dataset.delay || "0") || 0;
        setTimeout(function () {
          el.classList.add("is-visible");
        }, delay * 1000);
        io.unobserve(el);
      });
    }, { threshold: 0.04, rootMargin: "0px 0px -4% 0px" });

    els.forEach(function (el) {
      io.observe(el);
    });

    /* Safety net: force-reveal anything still hidden after 6s */
    setTimeout(function () {
      qsa(".reveal:not(.is-visible)").forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) {
          el.classList.add("is-visible");
        }
      });
    }, 6000);
  }

  /* ── PROYECTOS REVEAL + FILTER ──────────────────────────── */
  function initProyectos() {
    var cards = qsa(".proyecto-card");
    if (!cards.length) return;

    /* Staggered reveal */
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var idx = cards.indexOf(el);
        setTimeout(function () {
          el.classList.add("is-visible");
        }, idx * 80);
        io.unobserve(el);
      });
    }, { threshold: 0.04 });

    cards.forEach(function (c) { io.observe(c); });

    /* Safety net */
    setTimeout(function () {
      cards.forEach(function (c) {
        if (!c.classList.contains("is-visible") &&
            c.getBoundingClientRect().top < window.innerHeight) {
          c.classList.add("is-visible");
        }
      });
    }, 6000);

    /* Filter */
    var btns = qsa(".filter-btn");
    btns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var filter = btn.dataset.filter;
        btns.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");

        cards.forEach(function (card) {
          var cat = card.dataset.cat;
          if (filter === "all" || cat === filter) {
            /* Show: restore layout first, then fade in */
            card.style.removeProperty("display");
            requestAnimationFrame(function () {
              requestAnimationFrame(function () {
                card.classList.remove("filtered-out");
              });
            });
          } else {
            /* Hide: fade out, then collapse */
            card.classList.add("filtered-out");
            setTimeout(function () {
              if (card.classList.contains("filtered-out")) {
                card.style.display = "none";
              }
            }, 340);
          }
        });
      });
    });
  }

  /* ── PROJECT MODAL ──────────────────────────────────────── */
  function initModal() {
    var modal = qs("#proyecto-modal");
    if (!modal) return;

    var backdrop  = qs(".pmodal-backdrop", modal);
    var closeBtn  = qs(".pmodal-close", modal);
    var imgEl     = qs("#pmodal-img");
    var catEl     = qs("#pmodal-cat");
    var titleEl   = qs("#pmodal-title");
    var yearEl    = qs("#pmodal-year");
    var descEl    = qs("#pmodal-desc");
    var ubicEl    = qs("#pmodal-ubicacion");
    var supEl     = qs("#pmodal-sup");
    var servicEl  = qs("#pmodal-servicios");

    function openModal(card) {
      var cardImg = card.querySelector(".proyecto-img-wrap img");
      imgEl.src = cardImg ? cardImg.src : "";
      imgEl.alt = cardImg ? cardImg.alt : "";

      var rawCat = card.dataset.cat || "";
      catEl.textContent = rawCat.charAt(0).toUpperCase() + rawCat.slice(1);

      var h3 = card.querySelector("h3");
      titleEl.textContent = h3 ? h3.textContent : "";

      var meta = card.querySelector(".proyecto-info p");
      yearEl.textContent = meta ? meta.textContent : "";

      descEl.textContent    = card.dataset.desc      || "";
      ubicEl.textContent    = card.dataset.ubicacion  || "";
      supEl.textContent     = card.dataset.sup        || "";
      servicEl.textContent  = card.dataset.servicios  || "";

      modal.hidden = false;
      document.body.style.overflow = "hidden";
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          modal.classList.add("is-open");
        });
      });
    }

    function closeModal() {
      modal.classList.remove("is-open");
      document.body.style.overflow = "";
      setTimeout(function () { modal.hidden = true; }, 520);
    }

    qsa(".proyecto-card").forEach(function (card) {
      card.addEventListener("click", function () { openModal(card); });
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openModal(card);
        }
      });
    });

    closeBtn.addEventListener("click", closeModal);
    backdrop.addEventListener("click", closeModal);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !modal.hidden) closeModal();
    });
  }

  /* ── PROCESO ANIMATIONS ─────────────────────────────────── */
  function initProceso() {
    var els = qsa(".proceso-anim");
    if (!els.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var delay = parseFloat(el.dataset.delay || "0") || 0;
        setTimeout(function () { el.classList.add("is-visible"); }, delay * 1000);
        io.unobserve(el);
      });
    }, { threshold: 0.02, rootMargin: "0px 0px 0px 0px" });

    els.forEach(function (el) { io.observe(el); });

    /* Safety net — always show after 5s regardless */
    setTimeout(function () {
      els.forEach(function (el) { el.classList.add("is-visible"); });
    }, 5000);
  }

  /* ── GSAP SCROLL ANIMATIONS ─────────────────────────────── */
  function initGSAP() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    /* Manifesto image subtle parallax */
    gsap.to(".manifesto-img", {
      yPercent: -8,
      ease: "none",
      scrollTrigger: {
        trigger: ".manifesto-image-wrap",
        start: "top bottom",
        end: "bottom top",
        scrub: 0.8,
      },
    });

    /* Process numbers count animation */
    qsa(".proceso-num").forEach(function (el) {
      ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        once: true,
        onEnter: function () {
          el.style.color = "rgba(196,149,106,0.35)";
          gsap.fromTo(el, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" });
        },
      });
    });
  }

  /* ── CONTACT FORM ───────────────────────────────────────── */
  function initForm() {
    var form = qs(".contacto-form");
    if (!form) return;
    var btn  = qs(".btn-submit", form);
    if (!btn) return;

    form.addEventListener("submit", function (e) {
      if (!form.reportValidity()) { e.preventDefault(); return; }

      btn.classList.add("is-sending");

      /* If using Formspree: let it submit normally.
         Only intercept for mailto fallback. */
      var action = form.getAttribute("action") || "";
      if (action.indexOf("formspree") === -1) {
        e.preventDefault();
        /* mailto fallback */
        var nombre  = form.querySelector("[name=nombre]").value;
        var email   = form.querySelector("[name=email]").value;
        var tipo    = form.querySelector("[name=tipo_proyecto]").value;
        var mensaje = form.querySelector("[name=mensaje]").value;
        var body    = encodeURIComponent(
          "Nombre: " + nombre + "\nEmail: " + email +
          "\nTipo: " + tipo + "\n\n" + mensaje
        );
        window.location.href =
          "mailto:proyectos@grapaestudio.com?subject=Consulta%20de%20proyecto%20-%20GRAPA&body=" + body;

        setTimeout(function () {
          btn.classList.remove("is-sending");
          btn.classList.add("is-ok");
          form.reset();
        }, 1200);
      } else {
        /* Formspree handles submission — show success after redirect */
        setTimeout(function () {
          btn.classList.remove("is-sending");
          btn.classList.add("is-ok");
          form.reset();
        }, 2500);
      }
    });
  }

  /* ── BOOT ───────────────────────────────────────────────── */
  function boot() {
    safe(initSmoothScroll, "initSmoothScroll");
    safe(initNav,          "initNav");
    safe(initCursor,       "initCursor");
    safe(initHeroParallax, "initHeroParallax");
    safe(initReveals,      "initReveals");
    safe(initProyectos,    "initProyectos");
    safe(initModal,        "initModal");
    safe(initProceso,      "initProceso");
    safe(initGSAP,         "initGSAP");
    safe(initForm,         "initForm");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

})();
