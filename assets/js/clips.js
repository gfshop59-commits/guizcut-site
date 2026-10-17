/* GUIZCUT — extraits SYNTHÉTIQUES dessinés en direct (aucune personne filmée, aucun logo ni contenu tiers).
   <canvas class="clip" data-scene="gaming|podcast|createur" data-caption="MOT MOT|MOT" data-offset="1.2"></canvas>
   Les tailles reposent sur la zone 9:16 centrale : la même scène fonctionne en vertical et en 16:9
   (utilisé par tools/render-scenes.mjs pour fabriquer la source de démonstration du pipeline).
   Animation suspendue hors écran ; image fixe si prefers-reduced-motion. */
(function () {
  "use strict";

  var P = { night: "#0a0a0a", deep: "#07161a", teal: "#0e2a2e", turq: "#35c9bc", gold: "#ffb000", ember: "#e2572c", bone: "#f2ede4" };
  var DISPLAY = '"Anton", "Arial Narrow", sans-serif';
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function rr(ctx, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath(); ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function lg(ctx, y0, y1, c0, c1) { var g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, c0); g.addColorStop(1, c1); return g; }
  function rgba(hex, a) { var n = parseInt(hex.slice(1), 16); return "rgba(" + (n >> 16) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")"; }
  function frac(x) { return x - Math.floor(x); }

  // Repère : u = largeur de la zone 9:16 centrale, x0 = son bord gauche
  function frame(w, h) { var u = Math.min(w, h * 9 / 16); return { u: u, cx: w / 2, x0: w / 2 - u / 2 }; }

  function hud(ctx, f, h, t, label) {
    var u = f.u, x = f.x0 + u * 0.06, y = h * 0.04, on = Math.floor(t * 2) % 2 === 0;
    ctx.fillStyle = "rgba(0,0,0,.55)"; rr(ctx, x, y, u * 0.3, h * 0.04, 999); ctx.fill();
    ctx.fillStyle = on ? "#ff3b30" : "#7a1f1a"; ctx.beginPath(); ctx.arc(x + u * 0.04, y + h * 0.02, u * 0.016, 0, Math.PI * 2); ctx.fill();
    var s = 8053 + Math.floor(t), hh = Math.floor(s / 3600), mm = Math.floor(s / 60) % 60, ss = s % 60;
    ctx.fillStyle = "#fff"; ctx.font = Math.round(u * 0.042) + "px " + DISPLAY; ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.fillText(label + " " + hh + ":" + (mm < 10 ? "0" : "") + mm + ":" + (ss < 10 ? "0" : "") + ss, x + u * 0.075, y + h * 0.021);
    ctx.textBaseline = "alphabetic";
  }

  // ---------- Stream de jeu : arène néon ----------
  function gaming(ctx, w, h, t) {
    var f = frame(w, h), u = f.u, cx = f.cx, i;
    ctx.fillStyle = lg(ctx, 0, h, "#051014", P.teal); ctx.fillRect(0, 0, w, h);
    var hz = h * 0.5, r = u * 0.36, cy = hz - r * 0.15;
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = lg(ctx, cy - r, cy + r, P.gold, P.ember); ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.fillStyle = "#051014";
    for (i = 0; i < 6; i++) ctx.fillRect(cx - r, cy + r * (0.1 + i * 0.16), r * 2, 3 + i * 2.2);
    ctx.restore();
    ctx.fillStyle = "#04090b"; ctx.fillRect(0, hz, w, h - hz);
    ctx.strokeStyle = rgba(P.ember, .85); ctx.lineWidth = Math.max(1, u / 260);
    var N = 12, sp = frac(t * 0.6);
    for (i = 0; i < N; i++) { var k = (i + sp) / N, y = hz + (h - hz) * k * k; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    var nv = Math.ceil(w / (u * 0.12));
    for (i = -nv; i <= nv; i++) { ctx.beginPath(); ctx.moveTo(cx + i * u * 0.02, hz); ctx.lineTo(cx + i * u * 0.24, h); ctx.stroke(); }
    for (i = 0; i < 7; i++) {
      var ex = cx + (frac(i * 0.37 + 0.13) - 0.5) * Math.max(u * 0.8, w * 0.85) + Math.sin(t * 1.3 + i) * u * 0.05;
      var ey = frac(t * 0.18 + i * 0.21) * hz * 0.95, s = u * 0.035;
      ctx.fillStyle = i % 3 === 0 ? P.turq : (i % 2 ? P.gold : P.bone);
      ctx.beginPath(); ctx.moveTo(ex, ey - s); ctx.lineTo(ex + s, ey); ctx.lineTo(ex, ey + s); ctx.lineTo(ex - s, ey); ctx.closePath(); ctx.fill();
    }
    var px = cx + Math.sin(t * 1.7) * u * 0.18, py = h * 0.62;
    ctx.fillStyle = P.bone; ctx.beginPath(); ctx.moveTo(px, py - u * 0.06); ctx.lineTo(px + u * 0.05, py + u * 0.035); ctx.lineTo(px - u * 0.05, py + u * 0.035); ctx.closePath(); ctx.fill();
    ctx.fillStyle = P.turq; ctx.fillRect(px - 2, py - u * 0.2 - frac(t * 3) * u * 0.15, 4, u * 0.06);
    var ph = (t % 2.4) / 2.4;
    if (ph < 0.35) {
      var bx = cx + u * 0.12, by = hz * 0.42, rad = ph * u * 0.5;
      for (i = 0; i < 14; i++) {
        var an = i / 14 * Math.PI * 2;
        ctx.fillStyle = rgba(i % 2 ? P.gold : P.turq, 1 - ph / 0.35);
        ctx.fillRect(bx + Math.cos(an) * rad, by + Math.sin(an) * rad, u * 0.018, u * 0.018);
      }
      ctx.fillStyle = rgba(P.bone, 1 - ph / 0.35); ctx.font = Math.round(u * 0.08) + "px " + DISPLAY; ctx.textAlign = "center";
      ctx.fillText("+250", bx, by - rad * 0.4);
    }
    hud(ctx, f, h, t, "LIVE");
    ctx.fillStyle = rgba(P.bone, .25); rr(ctx, f.x0 + u * 0.06, h * 0.1, u * 0.4, h * 0.012, 4); ctx.fill();
    ctx.fillStyle = P.turq; rr(ctx, f.x0 + u * 0.06, h * 0.1, u * 0.4 * (0.35 + 0.25 * Math.abs(Math.sin(t * 0.7))), h * 0.012, 4); ctx.fill();
  }

  // ---------- Plateau podcast : deux micros, ondes ----------
  function podcast(ctx, w, h, t) {
    var f = frame(w, h), u = f.u, cx = f.cx, i;
    ctx.fillStyle = lg(ctx, 0, h, P.teal, "#1a0d08"); ctx.fillRect(0, 0, w, h);
    var nb = Math.max(7, Math.round(7 * w / u));
    for (i = 0; i < nb; i++) {
      var bx = frac(i * 0.29 + 0.1) * w, by = frac(i * 0.43 + 0.15) * h * 0.6, br = u * (0.12 + (i % 3) * 0.07);
      ctx.fillStyle = rgba(i % 3 === 0 ? P.turq : (i % 2 ? P.gold : P.bone), 0.08 + 0.04 * Math.sin(t + i));
      ctx.beginPath(); ctx.arc(bx + Math.sin(t * 0.3 + i) * 10, by, br, 0, Math.PI * 2); ctx.fill();
    }
    var actif = Math.floor(t / 2) % 2;
    [-0.2, 0.2].forEach(function (dx, idx) {
      var mx = cx + dx * u, my = h * 0.43, mw = u * 0.16, mh = u * 0.27;
      if (idx === actif) {
        for (var k = 0; k < 4; k++) {
          var ph = frac(t * 0.9 + k * 0.25);
          ctx.strokeStyle = rgba(idx ? P.turq : P.gold, 1 - ph); ctx.lineWidth = u * 0.012;
          ctx.beginPath(); ctx.arc(mx, my, mw * 0.7 + ph * u * 0.28, 0, Math.PI * 2); ctx.stroke();
        }
      }
      ctx.fillStyle = idx === actif ? P.bone : rgba(P.bone, .7);
      rr(ctx, mx - mw / 2, my - mh / 2, mw, mh, mw / 2); ctx.fill();
      ctx.strokeStyle = rgba(P.night, .35); ctx.lineWidth = Math.max(1, u / 300);
      for (var g = 1; g < 6; g++) { ctx.beginPath(); ctx.moveTo(mx - mw / 2 + 4, my - mh / 2 + g * mh / 6.5); ctx.lineTo(mx + mw / 2 - 4, my - mh / 2 + g * mh / 6.5); ctx.stroke(); }
      ctx.strokeStyle = P.bone; ctx.lineWidth = u * 0.022;
      ctx.beginPath(); ctx.arc(mx, my + mh * 0.05, mw * 0.85, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(mx, my + mh * 0.05 + mw * 0.85); ctx.lineTo(mx, h * 0.66); ctx.stroke();
      ctx.fillStyle = P.bone; rr(ctx, mx - u * 0.09, h * 0.66, u * 0.18, u * 0.03, 6); ctx.fill();
    });
    var on = 0.65 + 0.35 * Math.sin(t * 4);
    ctx.fillStyle = rgba(P.ember, on); rr(ctx, cx - u * 0.18, h * 0.1, u * 0.36, h * 0.055, 8); ctx.fill();
    ctx.fillStyle = P.bone; ctx.font = Math.round(u * 0.065) + "px " + DISPLAY; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("ON AIR", cx, h * 0.128); ctx.textBaseline = "alphabetic";
  }

  // ---------- Studio créateur : ring light, caméra, cartes ----------
  function createur(ctx, w, h, t) {
    var f = frame(w, h), u = f.u, cx = f.cx, i;
    ctx.fillStyle = lg(ctx, 0, h, "#f4e7cf", P.gold); ctx.fillRect(0, 0, w, h);
    var cy = h * 0.32, R = u * 0.3;
    ctx.save(); ctx.shadowColor = P.ember; ctx.shadowBlur = u * 0.1;
    ctx.strokeStyle = "#fffdf6"; ctx.lineWidth = u * 0.06; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    var spots = [[-0.32, 0.2], [0.3, 0.25], [-0.34, 0.5], [0.32, 0.52]], cols = [P.teal, P.ember, P.night, P.turq], icons = ["play", "star", "check", "play"];
    for (i = 0; i < 4; i++) {
      var fx = cx + spots[i][0] * u, fy = h * spots[i][1] + Math.sin(t * 1.2 + i) * h * 0.015;
      ctx.save(); ctx.translate(fx, fy); ctx.rotate((i % 2 ? 1 : -1) * 0.18 + Math.sin(t + i) * 0.05);
      ctx.fillStyle = cols[i]; rr(ctx, -u * 0.09, -u * 0.09, u * 0.18, u * 0.18, u * 0.035); ctx.fill();
      ctx.fillStyle = i === 3 ? P.night : P.bone; ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = u * 0.015;
      var s = u * 0.04;
      if (icons[i] === "play") { ctx.beginPath(); ctx.moveTo(-s * 0.6, -s); ctx.lineTo(s, 0); ctx.lineTo(-s * 0.6, s); ctx.closePath(); ctx.fill(); }
      else if (icons[i] === "star") { ctx.beginPath(); for (var k = 0; k < 10; k++) { var r2 = k % 2 ? s * 0.45 : s, an = -Math.PI / 2 + k * Math.PI / 5; ctx.lineTo(Math.cos(an) * r2, Math.sin(an) * r2); } ctx.closePath(); ctx.fill(); }
      else { ctx.beginPath(); ctx.moveTo(-s, 0); ctx.lineTo(-s * 0.2, s * 0.8); ctx.lineTo(s, -s * 0.8); ctx.stroke(); }
      ctx.restore();
    }
    var camY = h * 0.47;
    ctx.strokeStyle = P.night; ctx.lineWidth = u * 0.018;
    ctx.beginPath(); ctx.moveTo(cx, camY); ctx.lineTo(cx - u * 0.16, h * 0.68); ctx.moveTo(cx, camY); ctx.lineTo(cx + u * 0.16, h * 0.68); ctx.moveTo(cx, camY); ctx.lineTo(cx, h * 0.69); ctx.stroke();
    ctx.fillStyle = P.night; rr(ctx, cx - u * 0.17, camY - u * 0.2, u * 0.34, u * 0.22, u * 0.03); ctx.fill();
    ctx.fillStyle = P.teal; ctx.beginPath(); ctx.arc(cx, camY - u * 0.09, u * 0.075, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = rgba(P.turq, .9); ctx.beginPath(); ctx.arc(cx - u * 0.025, camY - u * 0.115, u * 0.02, 0, Math.PI * 2); ctx.fill();
    hud(ctx, f, h, t, "REC");
    ctx.fillStyle = P.night; rr(ctx, f.x0 + u * 0.62, h * 0.04, u * 0.32, h * 0.04, 999); ctx.fill();
    ctx.fillStyle = P.bone; ctx.font = Math.round(u * 0.042) + "px " + DISPLAY; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("ÉTAPE " + (1 + Math.floor(t / 2.5) % 3) + "/3", f.x0 + u * 0.78, h * 0.06); ctx.textBaseline = "alphabetic";
  }

  // ---------- Sous-titres mot par mot (Anton, mot actif en or) ----------
  function caption(ctx, w, h, t, lines) {
    var f = frame(w, h), u = f.u, words = [];
    lines.forEach(function (l, li) { l.split(" ").forEach(function (wd) { words.push({ w: wd, l: li }); }); });
    var cycle = words.length * 0.42 + 1.2, cur = Math.min(words.length - 1, Math.floor((t % cycle) / 0.42));
    var size = Math.round(u * 0.11);
    ctx.font = size + "px " + DISPLAY;
    var widest = Math.max.apply(null, lines.map(function (l) { return ctx.measureText(l).width + size * 0.4; }));
    if (widest > u * 0.86) { size = Math.floor(size * u * 0.86 / widest); ctx.font = size + "px " + DISPLAY; }
    ctx.textAlign = "left"; ctx.textBaseline = "middle";
    var y0 = h * 0.78 - (lines.length - 1) * size * 0.6;
    lines.forEach(function (l, li) {
      var ws = words.filter(function (x) { return x.l === li; }), gap = size * 0.28;
      var total = ws.reduce(function (a, x) { return a + ctx.measureText(x.w).width; }, 0) + gap * (ws.length - 1);
      var x = f.cx - total / 2, y = y0 + li * size * 1.12;
      ws.forEach(function (x0) {
        var idx = words.indexOf(x0), tw = ctx.measureText(x0.w).width;
        ctx.lineWidth = size * 0.16; ctx.lineJoin = "round"; ctx.strokeStyle = "rgba(0,0,0,.85)"; ctx.strokeText(x0.w, x, y);
        ctx.fillStyle = idx === cur ? P.gold : (idx < cur ? "#fff" : "rgba(255,255,255,.55)");
        ctx.fillText(x0.w, x, y); x += tw + gap;
      });
    });
    ctx.textBaseline = "alphabetic";
  }

  var SCENES = { gaming: gaming, podcast: podcast, createur: createur };

  /** Dessine une image : scène + bandes cinéma + sous-titres. Utilisé par le site et par l'outil de rendu. */
  function draw(ctx, w, h, scene, t, opts) {
    opts = opts || {};
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, w, h);
    (SCENES[scene] || gaming)(ctx, w, h, t);
    if (opts.letterbox !== false) { ctx.fillStyle = "#000"; ctx.fillRect(0, 0, w, h * 0.035); ctx.fillRect(0, h * 0.965, w, h * 0.035); }
    if (opts.caption && opts.caption.length) caption(ctx, w, h, t, opts.caption);
  }

  function mount(cv) {
    var scene = cv.getAttribute("data-scene") || "gaming";
    var lines = (cv.getAttribute("data-caption") || "").split("|").filter(Boolean);
    var offset = parseFloat(cv.getAttribute("data-offset") || "0");
    var ctx = cv.getContext("2d"), visible = true, raf = null, t0 = performance.now(), last = 0;
    var paint = function (t) { draw(ctx, cv.width, cv.height, scene, t, { caption: lines }); };
    function size() {
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      cv.width = Math.max(1, Math.round(cv.clientWidth * dpr));
      cv.height = Math.max(1, Math.round(cv.clientHeight * dpr));
    }
    function loop(now) {
      raf = null;
      if (!visible) return;
      if (now - last > 33) { last = now; paint((now - t0) / 1000 + offset); }
      raf = requestAnimationFrame(loop);
    }
    size();
    if (window.ResizeObserver) new ResizeObserver(function () { size(); if (reduce || !visible) paint(1.3 + offset); }).observe(cv);
    if (reduce) { paint(1.3 + offset); return; }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (e) { visible = e[0].isIntersecting; if (visible && !raf) raf = requestAnimationFrame(loop); }).observe(cv);
    }
    paint(offset);
    raf = requestAnimationFrame(loop);
  }

  window.APClips = { draw: draw };
  function init() { document.querySelectorAll("canvas.clip").forEach(mount); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(init); else window.addEventListener("load", init);
})();
