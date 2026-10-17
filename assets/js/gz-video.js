/* GUIZCUT — lecteur vidéo premium (Issue #18).
   <figure class="gzv" data-type="montage|source">
     <div class="gzv-media"><video muted playsinline loop preload="none" poster="x.jpg">
       <source src="x.webm" type="video/webm"><source src="x.mp4" type="video/mp4"></video></div>
     <figcaption>…attribution…</figcaption>
   </figure>
   Comportement :
   - lecture automatique SANS SON seulement si la vidéo est visible à 50 %, si l'utilisateur n'a pas demandé
     moins d'animations et sans économiseur de données ; pause dès qu'elle sort de l'écran ;
   - commandes accessibles : lecture/pause, son, progression ; clavier (Espace / K, M) ;
   - une seule vidéo active à la fois ; pause hors écran et en arrière-plan ;
   - si la vidéo ne peut pas être chargée : l'affiche reste, avec un message ; jamais de lecture avec son imposée. */
(function () {
  "use strict";
  var reduit = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var eco = navigator.connection && navigator.connection.saveData;

  function bouton(classe, libelle, svg) {
    var b = document.createElement("button");
    b.type = "button"; b.className = classe; b.setAttribute("aria-label", libelle);
    b.innerHTML = svg;
    return b;
  }
  var ICONES = {
    lire: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6 4l10 6-10 6z" fill="currentColor"/></svg>',
    pause: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 4h3v12H5zM12 4h3v12h-3z" fill="currentColor"/></svg>',
    muet: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 8h3l4-3v10l-4-3H3z" fill="currentColor"/><path d="M13 8l4 4m0-4l-4 4" stroke="currentColor" stroke-width="1.6"/></svg>',
    plein: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 8V3h5M12 3h5v5M17 12v5h-5M8 17H3v-5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
    son: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 8h3l4-3v10l-4-3H3z" fill="currentColor"/><path d="M13 7a4 4 0 010 6M15 5a7 7 0 010 10" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>'
  };

  var EN = document.documentElement.lang === "en";   // textes anglais sur les pages /en/
  function monter(fig) {
    var v = fig.querySelector("video");
    if (!v || fig.dataset.monte) return;
    fig.dataset.monte = "1";
    v.muted = true; v.playsInline = true; v.removeAttribute("controls");
    var titre = fig.getAttribute("data-titre") || (EN ? "video clip" : "extrait vidéo");

    var media = fig.querySelector(".gzv-media");
    // Grand bouton central (affiche) : premier geste évident, masqué pendant la lecture
    var bGrand = bouton("gzv-grand", (EN ? "Play: " : "Lire : ") + titre, ICONES.lire);
    var barre = document.createElement("div");
    barre.className = "gzv-commandes";
    var bLire = bouton("gzv-lire", (EN ? "Play: " : "Lire : ") + titre, ICONES.lire);
    var bSon = bouton("gzv-son", EN ? "Unmute" : "Activer le son", ICONES.muet);
    // Barre de progression = curseur natif (souris, tactile, clavier, lecteurs d'écran)
    var prog = document.createElement("input");
    prog.type = "range"; prog.min = "0"; prog.max = "1000"; prog.step = "1"; prog.value = "0";
    prog.className = "gzv-progres"; prog.setAttribute("aria-label", EN ? "Position in the video" : "Position dans la vidéo");
    var temps = document.createElement("span");
    temps.className = "gzv-temps"; temps.setAttribute("aria-hidden", "true"); temps.textContent = "0:00";
    var bPlein = null;
    if (document.fullscreenEnabled || v.webkitEnterFullscreen) {
      bPlein = bouton("gzv-plein", EN ? "Full screen" : "Plein écran", ICONES.plein);
      bPlein.addEventListener("click", function () {
        if (document.fullscreenElement) document.exitFullscreen();
        else if (media.requestFullscreen) media.requestFullscreen().catch(function () {});
        else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen();   // iPhone : plein écran natif de la vidéo
      });
    }
    barre.appendChild(bLire); barre.appendChild(prog); barre.appendChild(temps); barre.appendChild(bSon);
    if (bPlein) barre.appendChild(bPlein);
    media.appendChild(bGrand); media.appendChild(barre);

    var mmss = function (s) { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2); };
    var etat = function () {
      var joue = !v.paused && !v.ended;
      bLire.innerHTML = joue ? ICONES.pause : ICONES.lire;
      bLire.setAttribute("aria-label", (joue ? (EN ? "Pause: " : "Mettre en pause : ") : (EN ? "Play: " : "Lire : ")) + titre);
      bSon.innerHTML = v.muted ? ICONES.muet : ICONES.son;
      bSon.setAttribute("aria-label", v.muted ? (EN ? "Unmute" : "Activer le son") : (EN ? "Mute" : "Couper le son"));
      fig.classList.toggle("gzv-joue", joue);
      fig.classList.toggle("gzv-demarre", v.currentTime > 0 || joue);
    };
    var lire = function () { var p = v.play(); if (p && p.catch) p.catch(function () { fig.classList.remove("gzv-charge"); etat(); }); };
    var basculer = function () { fig.dataset.choix = "1"; if (v.paused) lire(); else v.pause(); };
    bLire.addEventListener("click", basculer);
    bGrand.addEventListener("click", function () { basculer(); bLire.focus(); });
    v.addEventListener("click", basculer);
    bSon.addEventListener("click", function () { v.muted = !v.muted; if (!v.muted && v.paused) lire(); etat(); });
    prog.addEventListener("input", function () { if (v.duration) v.currentTime = v.duration * prog.value / 1000; });
    fig.addEventListener("keydown", function (e) {
      if ((e.target.tagName === "BUTTON" && (e.key === " " || e.key === "Enter")) || e.target === prog) return;
      if (e.key === " " || e.key.toLowerCase() === "k") { e.preventDefault(); bLire.click(); }
      if (e.key.toLowerCase() === "m") { e.preventDefault(); bSon.click(); }
      if ((e.key === "ArrowRight" || e.key === "ArrowLeft") && v.duration) {
        e.preventDefault(); v.currentTime = Math.min(v.duration, Math.max(0, v.currentTime + (e.key === "ArrowRight" ? 5 : -5)));
      }
    });
    ["play", "pause", "volumechange", "ended"].forEach(function (ev) { v.addEventListener(ev, etat); });
    v.addEventListener("waiting", function () { fig.classList.add("gzv-charge"); });
    ["playing", "pause", "canplay"].forEach(function (ev) { v.addEventListener(ev, function () { fig.classList.remove("gzv-charge"); }); });
    v.addEventListener("play", function () { if (v.readyState < 3) fig.classList.add("gzv-charge"); });
    v.addEventListener("timeupdate", function () {
      if (!v.duration) return;
      prog.value = String(Math.round(1000 * v.currentTime / v.duration));
      prog.style.setProperty("--p", (100 * v.currentTime / v.duration).toFixed(2) + "%");
      temps.textContent = mmss(v.currentTime) + " / " + mmss(v.duration);
      prog.setAttribute("aria-valuetext", mmss(v.currentTime) + " sur " + mmss(v.duration));
    });
    v.addEventListener("error", function () { fig.classList.add("gzv-erreur"); }, true);
    var sources = v.querySelectorAll("source");
    if (sources.length) sources[sources.length - 1].addEventListener("error", function () { fig.classList.add("gzv-erreur"); });

    // Une seule vidéo active à la fois sur la page
    v.addEventListener("play", function () {
      document.querySelectorAll("figure.gzv video").forEach(function (autre) { if (autre !== v && !autre.paused) autre.pause(); });
    });
    // Lecture automatique sans son, seulement si visible, sans « moins d'animations » ni économiseur de données,
    // et jamais après un choix explicite de l'utilisateur (pause manuelle). data-auto="non" : lecture au clic uniquement.
    // Dans tous les cas : pause dès que la vidéo sort de l'écran (défilement, carrousel).
    var auto = !reduit && !eco && fig.getAttribute("data-auto") !== "non";
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entrees) {
        entrees.forEach(function (e) {
          if (e.isIntersecting && e.intersectionRatio >= 0.5) { if (auto && !fig.dataset.choix) { v.preload = "auto"; lire(); } }
          else if (!v.paused) v.pause();
        });
      }, { threshold: [0, 0.5] }).observe(fig);
    }
    etat();
  }

  function init() { document.querySelectorAll("figure.gzv").forEach(monter); }
  // Onglet en arrière-plan : tout se met en pause
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) document.querySelectorAll("figure.gzv video").forEach(function (v) { if (!v.paused) v.pause(); });
  });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
  window.GZVideo = { monter: monter };
})();
