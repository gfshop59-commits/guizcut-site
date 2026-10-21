/* GUIZCUT — Shorts YouTube de référence (portfolio P3, Issue #18).
   Façade légère : miniature officielle + bouton ; le lecteur officiel YouTube (youtube-nocookie.com) n'est chargé
   qu'au clic. Une seule vidéo à la fois : lancer un Short, ou le faire sortir de l'écran, remet les autres en façade.
   Sans JavaScript, la façade est un simple lien vers le Short sur YouTube. */
(function () {
  "use strict";
  var figures = [].slice.call(document.querySelectorAll("figure.gzv-yt"));
  if (!figures.length) return;
  var prechauffe = false;

  function prechauffer() {   // ouvre la connexion à l'avance, au survol ou au focus (gain au clic)
    if (prechauffe) return;
    prechauffe = true;
    ["https://www.youtube-nocookie.com", "https://i.ytimg.com"].forEach(function (u) {
      var l = document.createElement("link"); l.rel = "preconnect"; l.href = u; document.head.appendChild(l);
    });
  }

  function arreter(fig) {
    var cadre = fig.querySelector("iframe");
    if (!cadre) return;
    cadre.remove();
    fig.classList.remove("gzv-joue");
    fig.querySelector(".gzv-facade").hidden = false;
  }

  function lancer(fig) {
    figures.forEach(function (f) { if (f !== fig) arreter(f); });
    if (fig.querySelector("iframe")) return;
    var id = fig.getAttribute("data-yt");
    var cadre = document.createElement("iframe");
    cadre.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id) +
      "?autoplay=1&playsinline=1&rel=0&modestbranding=1&cc_load_policy=1&cc_lang_pref=" + (document.documentElement.lang === "en" ? "en" : "fr");
    cadre.title = (document.documentElement.lang === "en" ? "YouTube player: " : "Lecteur YouTube : ") + fig.getAttribute("data-titre");
    cadre.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    cadre.setAttribute("allowfullscreen", "");
    cadre.referrerPolicy = "strict-origin-when-cross-origin";
    var facade = fig.querySelector(".gzv-facade");
    facade.hidden = true;
    fig.querySelector(".gzv-media").appendChild(cadre);
    fig.classList.add("gzv-joue");
    cadre.focus();
  }

  figures.forEach(function (fig) {
    var facade = fig.querySelector(".gzv-facade"), img = facade.querySelector("img");
    facade.addEventListener("click", function (e) {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;   // ouverture dans un nouvel onglet respectée
      e.preventDefault();
      lancer(fig);
    });
    facade.addEventListener("pointerenter", prechauffer);
    facade.addEventListener("focus", prechauffer);
    // Miniature indisponible : la carte reste lisible (fond de marque + titre), la lecture reste possible
    var sansImage = function () { fig.classList.add("gzv-sans-image"); };
    img.addEventListener("error", sansImage);
    if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) sansImage();
  });

  // Un Short qui sort de l'écran (défilement, carrousel) est arrêté
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) { if (!e.isIntersecting || e.intersectionRatio < 0.35) arreter(e.target); });
    }, { threshold: [0, 0.35] });
    figures.forEach(function (f) { io.observe(f); });
  }
  document.addEventListener("visibilitychange", function () { if (document.hidden) figures.forEach(arreter); });
  window.GZYouTube = { lancer: lancer, arreter: arreter };
})();
