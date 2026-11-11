/* =========================================================
   VISIÓNICA · comportamiento de la página
   ========================================================= */

/* ---------------------------------------------------------
   1) PEGA AQUÍ EL ENLACE DE DESCARGA DE TU APK
   Es el link del archivo dentro de tu Release en GitHub, por ejemplo:
   https://github.com/TU_USUARIO/visionica/releases/download/v1.0/visionica.apk
   --------------------------------------------------------- */
const DOWNLOAD_URL = "https://github.com/TU_USUARIO/visionica/releases/download/v1.0/visionica.apk";

const downloadReady = !DOWNLOAD_URL.includes("TU_USUARIO");

/* ---------- Aviso breve en pantalla ---------- */
const toast = document.createElement("div");
toast.className = "toast";
toast.setAttribute("role", "status");
document.body.appendChild(toast);

let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 4000);
}

/* ---------- Botones de descarga ---------- */
document.querySelectorAll("[data-download]").forEach((link) => {
  if (downloadReady) {
    link.setAttribute("href", DOWNLOAD_URL);
    link.setAttribute("download", "");
    link.setAttribute("rel", "noopener");
  } else {
    link.addEventListener("click", (event) => {
      /* Los botones de arriba llevan a la sección de descarga; el principal avisa. */
      if (link.id === "link-descarga") {
        event.preventDefault();
        showToast("La descarga estará disponible muy pronto.");
        console.warn("Falta el enlace de descarga: cambia DOWNLOAD_URL al inicio de app.js.");
      }
    });
  }
});

/* ---------- Cómo funciona: cambiar la pantalla según el paso ---------- */
const stepButtons = document.querySelectorAll(".step");
const stepImg = document.getElementById("step-img");

/* Cargar las imágenes antes para que el cambio sea suave */
stepButtons.forEach((button) => {
  const preload = new Image();
  preload.src = button.dataset.img;
});

function activateStep(button) {
  if (!stepImg || button.classList.contains("is-active")) return;

  stepButtons.forEach((b) => {
    b.classList.remove("is-active");
    b.removeAttribute("aria-current");
  });
  button.classList.add("is-active");
  button.setAttribute("aria-current", "true");

  stepImg.classList.add("is-swapping");
  setTimeout(() => {
    stepImg.src = button.dataset.img;
    stepImg.alt = button.dataset.alt;
    stepImg.classList.remove("is-swapping");
  }, 180);
}

stepButtons.forEach((button, index) => {
  button.addEventListener("click", () => activateStep(button));

  /* Flechas del teclado para moverse entre pasos */
  button.addEventListener("keydown", (event) => {
    const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    if (!(event.key in keys)) return;
    event.preventDefault();
    const next = stepButtons[(index + keys[event.key] + stepButtons.length) % stepButtons.length];
    next.focus();
    activateStep(next);
  });
});

/* ---------- Galería: flechas para desplazar ---------- */
const gallery = document.getElementById("gallery");
const prev = document.getElementById("gal-prev");
const next = document.getElementById("gal-next");

function scrollGallery(direction) {
  if (!gallery) return;
  const item = gallery.querySelector("figure");
  const step = item ? item.getBoundingClientRect().width + 26 : 260;
  gallery.scrollBy({ left: direction * step, behavior: "smooth" });
}

if (prev) prev.addEventListener("click", () => scrollGallery(-1));
if (next) next.addEventListener("click", () => scrollGallery(1));

/* También con las flechas del teclado cuando la galería tiene el foco */
if (gallery) {
  gallery.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") { event.preventDefault(); scrollGallery(1); }
    if (event.key === "ArrowLeft")  { event.preventDefault(); scrollGallery(-1); }
  });
}


/* =========================================================
   ANIMACIONES Y EFECTOS
   (todo esto se salta si el sistema pide "reducir movimiento")
   ========================================================= */
(function () {
  const root = document.documentElement;
  const motionOK = root.classList.contains("anim");
  root.dataset.ready = "1";

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Encabezado + barra de progreso ---------- */
  const header = $(".site-header");
  const progress = document.createElement("div");
  progress.className = "progress";
  progress.setAttribute("aria-hidden", "true");
  document.body.appendChild(progress);

  let scrollTick = false;
  function onScroll() {
    if (scrollTick) return;
    scrollTick = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      progress.style.scale = (max > 0 ? Math.min(1, scrollY / max) : 0) + " 1";
      if (header) header.classList.toggle("is-scrolled", scrollY > 12);
      scrollTick = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Menú: marca la sección en la que estás ---------- */
  const navLinks = $$(".site-nav a");
  if ("IntersectionObserver" in window && navLinks.length) {
    const byId = new Map(navLinks.map((a) => [a.getAttribute("href").slice(1), a]));
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => a.classList.remove("is-current"));
        const link = byId.get(entry.target.id);
        if (link) link.classList.add("is-current");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("main section[id]").forEach((s) => navObserver.observe(s));
  }

  if (!motionOK) {
    /* Sin animaciones: solo dejamos los números finales y salimos */
    $$(".bars").forEach((b) => b.classList.add("is-in"));
    faceMesh(true);
    return;
  }

  /* ---------- Título: las palabras entran una por una ---------- */
  const h1 = $(".hero__text h1");
  if (h1) {
    h1.setAttribute("aria-label", h1.textContent.trim().replace(/\s+/g, " "));
    let n = 0;
    $$("span", h1).forEach((box, k) => {
      const parts = k === 0 ? box.textContent.trim().split("") : box.textContent.trim().split(/\s+/);
      box.textContent = "";
      parts.forEach((p, i) => {
        const s = document.createElement("span");
        s.className = "w"; s.setAttribute("aria-hidden", "true");
        s.style.setProperty("--i", n++); s.textContent = p;
        box.appendChild(s);
        if (k && i < parts.length - 1) box.appendChild(document.createTextNode(" "));
      });
    });
  }

  /* ---------- Aparecer al bajar ---------- */
  const targets = [
    [".section h2, .section-lead", ""],
    [".gallery__nav", ""],
    [".steps li", "reveal--left"],
    [".how__stage", "reveal--scale"],
    [".bento .tile", "reveal--scale"],
    [".gallery figure", "reveal--scale"],
    [".trust__col > p", ""],
    [".trust__panel", "reveal--scale"],
    [".get__main > *", ""],
    [".install li", "reveal--right"],
    [".credits > div", ""],
    [".footer__brand", ""],
  ];
  const revealEls = [];
  targets.forEach(([selector, extra]) => {
    $$(selector).forEach((el) => {
      if (el.classList.contains("reveal")) return;
      el.classList.add("reveal");
      if (extra) el.classList.add(extra);
      revealEls.push(el);
    });
  });
  /* Elementos que no se mueven pero activan su propia animación */
  const watchOnly = [...$$(".bars"), ...$$(".tones")];
  $$(".tones span").forEach((s, i) => s.style.setProperty("--i", i));

  function onRevealed(el) {
    if (el.classList.contains("bars")) countBars(el);
    if (el.matches(".tile--code")) scrambleCode(el);
  }

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top ||
                        a.boundingClientRect.left - b.boundingClientRect.left);
      visible.forEach((entry, i) => {
        const el = entry.target;
        el.style.setProperty("--d", (i * 0.09).toFixed(2) + "s");
        el.classList.add("is-in");
        io.unobserve(el);
        onRevealed(el);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
    [...revealEls, ...watchOnly].forEach((el) => io.observe(el));
  } else {
    [...revealEls, ...watchOnly].forEach((el) => { el.classList.add("is-in"); onRevealed(el); });
  }

  /* ---------- Barras: los números suben contando ---------- */
  function countBars(bars) {
    $$(".bar b", bars).forEach((b, i) => {
      const target = parseInt(b.textContent, 10);
      if (isNaN(target)) return;
      b.textContent = "0";
      const start = performance.now() + 300 + i * 250;
      const dur = 1400;
      (function tick(now) {
        const t = Math.max(0, Math.min(1, (now - start) / dur));
        b.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
        if (t < 1) requestAnimationFrame(tick);
      })(performance.now());
    });
  }

  /* ---------- Código de clase: letras que se mezclan y se acomodan ---------- */
  function scrambleCode(tile) {
    const code = $(".code", tile);
    if (!code) return;
    const finalText = code.textContent.trim();
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let frame = 0;
    const timer = setInterval(() => {
      frame++;
      const settled = Math.floor(frame / 4);
      code.textContent = finalText.split("").map((ch, i) =>
        i < settled ? ch : chars[Math.floor(Math.random() * chars.length)]).join("");
      if (settled >= finalText.length) { clearInterval(timer); code.textContent = finalText; }
    }, 45);
  }

  /* ---------- Mosaico: luz que sigue al cursor dentro de cada tarjeta ---------- */
  $$(".tile").forEach((tile) => {
    tile.addEventListener("pointermove", (e) => {
      const r = tile.getBoundingClientRect();
      tile.style.setProperty("--x", e.clientX - r.left + "px");
      tile.style.setProperty("--y", e.clientY - r.top + "px");
    });
  });

  /* ---------- Cómo funciona: pasa solo de un paso al siguiente ---------- */
  const how = $(".how");
  const stepsList = $("#steps");
  const stepBtns = $$(".step");
  if (how && stepsList && stepBtns.length) {
    how.classList.add("auto", "is-paused");
    let hovering = false, focusing = false, onScreen = false;
    const syncPause = () => how.classList.toggle("is-paused", hovering || focusing || !onScreen);

    stepsList.addEventListener("animationend", (e) => {
      if (e.animationName !== "stepfill") return;
      const i = stepBtns.findIndex((b) => b.classList.contains("is-active"));
      activateStep(stepBtns[(i + 1) % stepBtns.length]);
    });
    [stepsList, $(".how__stage")].forEach((el) => {
      if (!el) return;
      el.addEventListener("pointerenter", () => { hovering = true; syncPause(); });
      el.addEventListener("pointerleave", () => { hovering = false; syncPause(); });
    });
    stepsList.addEventListener("focusin",  () => { focusing = true;  syncPause(); });
    stepsList.addEventListener("focusout", () => { focusing = false; syncPause(); });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; syncPause(); },
        { threshold: 0.35 }).observe(how);
    } else { onScreen = true; syncPause(); }
  }

  /* ---------- Galería: se puede arrastrar con el mouse ---------- */
  if (gallery) {
    let down = false, startX = 0, startLeft = 0;
    gallery.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      down = true; startX = e.clientX; startLeft = gallery.scrollLeft;
    });
    addEventListener("pointermove", (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) gallery.classList.add("is-dragging");
      gallery.scrollLeft = startLeft - dx;
    });
    addEventListener("pointerup", () => { down = false; gallery.classList.remove("is-dragging"); });
    gallery.addEventListener("dragstart", (e) => e.preventDefault());
  }

  /* ---------- Inicio: inclinación 3D, luz del cursor y partículas ---------- */
  const hero = $(".hero");
  const stage = $(".hero__stage");

  if (finePointer && hero && stage) {
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      stage.style.setProperty("--ry", (nx * 9).toFixed(2) + "deg");
      stage.style.setProperty("--rx", (-ny * 7).toFixed(2) + "deg");
    });
    hero.addEventListener("pointerleave", () => {
      stage.style.setProperty("--ry", "0deg");
      stage.style.setProperty("--rx", "0deg");
    });
  }

  if (finePointer) {
    const glow = document.createElement("div");
    glow.className = "cursor-glow";
    glow.setAttribute("aria-hidden", "true");
    document.body.appendChild(glow);
    let tx = 0, ty = 0, gx = 0, gy = 0, glowRunning = false;
    function glowLoop() {
      gx += (tx - gx) * 0.12; gy += (ty - gy) * 0.12;
      glow.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
      if (Math.abs(tx - gx) + Math.abs(ty - gy) > 0.5) requestAnimationFrame(glowLoop);
      else glowRunning = false;
    }
    addEventListener("pointermove", (e) => {
      tx = e.clientX; ty = e.clientY;
      glow.classList.add("is-on");
      if (!glowRunning) { glowRunning = true; requestAnimationFrame(glowLoop); }
    }, { passive: true });
    document.documentElement.addEventListener("pointerleave", () => glow.classList.remove("is-on"));
  }

  faceMesh(false);

  /* ---------- Inclinación 3D en tarjetas y escenarios ---------- */
  if (finePointer) {
    $$(".tile, .how__stage, .trust__panel, .install, .mascot__stage").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--ty", ((e.clientX - r.left) / r.width - .5) * 9 + "deg");
        el.style.setProperty("--tx", -((e.clientY - r.top) / r.height - .5) * 9 + "deg");
      });
      el.addEventListener("pointerleave", () => {
        el.style.setProperty("--tx", "0deg"); el.style.setProperty("--ty", "0deg");
      });
    });
  }

  /* ---------- Galería en perspectiva 3D (coverflow) ---------- */
  if (gallery) {
    const figs = $$("figure", gallery);
    let gTick = false;
    const flow = () => {
      gTick = false;
      const g = gallery.getBoundingClientRect(), c = g.left + g.width / 2;
      figs.forEach((f) => {
        const r = f.getBoundingClientRect();
        const d = Math.max(-2.5, Math.min(2.5, (r.left + r.width / 2 - c) / r.width)), ad = Math.abs(d);
        const s = f.firstElementChild.style;
        s.setProperty("--ry", -d * 26 + "deg");
        s.setProperty("--z", -ad * 80 + "px");
        s.setProperty("--s", (1.1 - Math.min(ad, 2) * .09).toFixed(3));
        s.setProperty("--o", (1 - Math.min(ad, 2.5) * .17).toFixed(3));
      });
    };
    const queue = () => { if (!gTick) { gTick = true; requestAnimationFrame(flow); } };
    gallery.addEventListener("scroll", queue, { passive: true });
    addEventListener("resize", queue);
    figs.forEach((f) => f.addEventListener("click", () => {
      if (!gallery.classList.contains("is-dragging")) f.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }));
    flow();
    gallery.scrollLeft = (gallery.scrollWidth - gallery.clientWidth) / 2 - 2 * (figs[0].offsetWidth + 26);
    flow();
  }

  /* ---------- Malla facial 3D que escanea (ilustración del hero) ---------- */
  function faceMesh(still) {
    const cv = $("#face-canvas"), hud = $(".hud"), st = $("#hud-state"), hero = $(".hero");
    if (!cv) return;
    const ctx = cv.getContext("2d"), NX = 24, NY = 32, P = [];
    const g = (x, y, cx, cy, sx, sy, a) => a * Math.exp(-(((x - cx) / sx) ** 2 + ((y - cy) / sy) ** 2));
    for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
      const y = 1.25 - (j / (NY - 1)) * 2.5, u = (i / (NX - 1)) * 2 - 1;
      const dome = Math.sqrt(Math.max(0, 1 - (y / 1.25) ** 2));
      const x = u * .82 * dome * (y < 0 ? 1 + y * .2 : 1), ax = Math.abs(x);
      const z = .8 * Math.sqrt(Math.max(0, 1 - u * u)) * dome
        + 1.8 * (g(ax, y, 0, -.1, .13, .3, .3) + g(ax, y, 0, -.3, .16, .09, .12) - g(ax, y, .38, .25, .17, .09, .1)
        + g(ax, y, .36, .42, .22, .06, .07) + g(ax, y, .55, 0, .2, .2, .07)
        + g(ax, y, 0, -.55, .27, .06, .07) + g(ax, y, 0, -1, .2, .12, .07));
      P.push({ x, y, z });
    }
    const near = (x, y) => { let b = 0, d = 9; P.forEach((p, k) => { const e = (p.x - x) ** 2 + (p.y - y) ** 2; if (e < d) { d = e; b = k; } }); return b; };
    const LM = [[-.36, .25], [.36, .25], [-.38, .42], [.38, .42], [0, -.25], [-.26, -.55], [.26, -.55], [0, -1], [-.62, -.45], [.62, -.45]].map((a) => near(a[0], a[1]));
    const LINES = [[0, 1], [0, 4], [1, 4], [4, 5], [4, 6], [5, 7], [6, 7], [8, 5], [9, 6], [2, 0], [3, 1]];
    let W = 0, H = 0, raf = 0, on = false, mx = 0, my = 0, tx = 0, ty = 0, last = "";

    function size() {
      const d = Math.min(devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0);
    }
    function frame(t) {
      ctx.clearRect(0, 0, W, H);
      mx += (tx - mx) * .06; my += (ty - my) * .06;
      const yaw = (still ? .25 : Math.sin(t * .6) * .3) + mx * .6, pit = my * .3;
      const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pit), sp = Math.sin(pit);
      const R = Math.min(W, H) * .31, ox = W * .46, oy = H * .5;
      const ph = t % 5, sc = ph < 3.3 ? 1.35 - (ph / 3.3) * 2.7 : -9;
      const Q = P.map((p) => {
        const x1 = p.x * cy + p.z * sy, z1 = -p.x * sy + p.z * cy;
        const y2 = p.y * cp - z1 * sp, z2 = p.y * sp + z1 * cp, s = 3.4 / (3.4 - z2);
        return { x: ox + x1 * s * R, y: oy - y2 * s * R, on: p.y > sc, hot: Math.abs(p.y - sc) < .07 };
      });
      const seg = (a, b) => { ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); };
      ctx.globalCompositeOperation = "lighter"; ctx.lineWidth = 1;
      [[0, "rgba(186,147,232,.16)"], [1, "rgba(220,200,250,.55)"], [2, "rgba(255,255,255,.95)"]].forEach(([k, col]) => {
        ctx.strokeStyle = col; ctx.beginPath();
        for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
          const a = Q[j * NX + i];
          if ((a.hot ? 2 : a.on ? 1 : 0) !== k) continue;
          if (i < NX - 1) seg(a, Q[j * NX + i + 1]);
          if (j < NY - 1) seg(a, Q[(j + 1) * NX + i]);
        }
        ctx.stroke();
      });
      ctx.fillStyle = "rgba(230,213,249,.9)";
      Q.forEach((q) => { if (q.on) ctx.fillRect(q.x - 1, q.y - 1, 2, 2); });
      ctx.strokeStyle = "rgba(255,255,255,.6)"; ctx.beginPath();
      LINES.forEach(([a, b]) => { const A = Q[LM[a]], B = Q[LM[b]]; if (A.on && B.on) seg(A, B); });
      ctx.stroke(); ctx.fillStyle = "#fff";
      LM.forEach((k) => { const q = Q[k]; if (q.on) { ctx.beginPath(); ctx.arc(q.x, q.y, 3 + Math.sin(t * 4 + k) * .6, 0, 6.3); ctx.fill(); } });

      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = "rgba(186,147,232,.7)"; ctx.lineWidth = 2;
      ctx.setLineDash([7, 9]); ctx.lineDashOffset = -t * 18;
      ctx.beginPath(); ctx.ellipse(ox, oy, R * 1.12, R * 1.55, 0, 0, 6.2832); ctx.stroke(); ctx.setLineDash([]);
      const k = ph < 1 ? 1.12 - ph * .12 : 1, bw = R * 1.45 * k, bh = R * 1.85 * k, L = 22;
      ctx.strokeStyle = ph > 3.3 ? "#9ff0c8" : "#E6D5F9"; ctx.lineWidth = 3; ctx.beginPath();
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => {
        const x = ox + a * bw, y = oy + b * bh;
        ctx.moveTo(x - a * L, y); ctx.lineTo(x, y); ctx.lineTo(x, y - b * L);
      });
      ctx.stroke();

      const s = ph < .3 ? "No se detecta rostro" : ph < 3.3 ? "Analizando rostro" : "Rostro identificado";
      if (s !== last) { last = s; if (st) st.textContent = s; if (hud) hud.classList.toggle("is-ok", ph >= 3.3); }
    }

    size();
    if (still) { frame(4); addEventListener("resize", () => { size(); frame(4); }); return; }
    const loop = (now) => { frame(now / 1000); raf = on ? requestAnimationFrame(loop) : 0; };
    const go = () => { if (!on) { on = true; raf = requestAnimationFrame(loop); } };
    const halt = () => { on = false; cancelAnimationFrame(raf); };
    addEventListener("resize", size);
    if (hero) {
      hero.addEventListener("pointermove", (e) => {
        const r = hero.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - .5) * 2; ty = ((e.clientY - r.top) / r.height - .5) * 2;
      });
      hero.addEventListener("pointerleave", () => { tx = ty = 0; });
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([en]) => (en.isIntersecting ? go() : halt())).observe(cv);
    } else go();
    document.addEventListener("visibilitychange", () => (document.hidden ? halt() : go()));
  }
})();

/* ---------- Video de la mascota ---------- */
(function () {
  const v = document.getElementById("mascot-video"), b = document.getElementById("sound");
  if (!v) return;
  if (!document.documentElement.classList.contains("anim")) { v.removeAttribute("autoplay"); v.pause(); v.controls = true; }
  else if ("IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => { e.isIntersecting ? v.play().catch(() => {}) : v.pause(); }, { threshold: 0.25 }).observe(v);
  }
  if (b) b.addEventListener("click", () => {
    v.muted = !v.muted;
    b.setAttribute("aria-pressed", String(!v.muted));
    b.textContent = v.muted ? "Activar sonido" : "Silenciar";
    if (!v.muted) v.play().catch(() => {});
  });
})();
