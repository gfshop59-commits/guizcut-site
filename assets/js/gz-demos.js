/* GUIZCUT — portfolio P3 : trois démonstrations verticales (Issue #18).
   Les cartes .p3-carte[data-demo] restent en état « en préparation » tant que assets/videos/demos/index.json
   ne contient pas une démo VALIDÉE par le fondateur (valide_fondateur = true). En prévisualisation locale
   (localhost), les démos rendues mais non validées sont aussi montrées, avec la mention « à valider ».
   Les créateurs ne sont nommés qu'une fois la démo autorisée et publiée. */
(function () {
  "use strict";
  var racine = document.querySelector("[data-demos]") || document.querySelector(".p3");   // carrousel même sans manifeste
  if (!racine) return;
  var local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  var manifeste = racine.getAttribute("data-demos"), dossier = (manifeste || "").replace(/[^/]*$/, "");

  function el(tag, attrs, texte) {
    var e = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (texte) e.textContent = texte;
    return e;
  }
  function secondes(s) { return Math.round(s) + " s"; }

  function brancher(carte, d) {
    var fig = carte.querySelector("figure.gzv"), media = fig.querySelector(".gzv-media");
    var attente = media.querySelector(".gzv-attente");
    var f = d.fichiers || {};
    var v = el("video", { muted: "", playsinline: "", preload: "none", poster: dossier + (f.poster_webp || f.poster) });
    if (f.webm) v.appendChild(el("source", { src: dossier + f.webm, type: "video/webm" }));
    if (f.mp4) v.appendChild(el("source", { src: dossier + f.mp4, type: "video/mp4" }));
    if (attente) attente.remove();
    media.appendChild(v);
    fig.setAttribute("data-titre", (document.documentElement.lang === "en" ? "demo " : "démonstration ") + d.categorie);
    var duree = carte.querySelector("[data-champ=duree]");
    if (duree && d.duree_s) duree.textContent = secondes(d.duree_s);
    var source = carte.querySelector("[data-champ=source]");
    if (source) {
      source.textContent = "";
      var a = el("a", { href: d.url_source, rel: "noopener", target: "_blank" }, d.chaine);
      source.appendChild(a);
      if (d.date_source && !/relever/.test(d.date_source)) source.appendChild(document.createTextNode(" · " + d.date_source));
    }
    var attr = carte.querySelector("[data-champ=attribution]");
    if (attr) attr.textContent = d.attribution;
    if (!d.valide_fondateur) {
      carte.classList.add("p3-a-valider");
      media.appendChild(el("span", { class: "p3-drapeau" }, (document.documentElement.lang === "en" ? "Local preview · pending approval" : "Prévisualisation locale · à valider")));
    }
    carte.classList.add("p3-prete");
    if (window.GZVideo) window.GZVideo.monter(fig);
  }

  if (manifeste) fetch(manifeste, { cache: "no-cache" })
    .then(function (r) { return r.ok ? r.json() : { demos: [] }; })
    .then(function (j) {
      (j.demos || []).forEach(function (d) {
        if (!d.valide_fondateur && !local) return;
        var carte = racine.querySelector('.p3-carte[data-demo="' + d.id + '"]');
        if (carte) brancher(carte, d);
      });
    })
    .catch(function () { /* hors ligne : les cartes restent « en préparation » */ });

  // Carrousel mobile : boutons précédent / suivant + indicateur, sans piéger le défilement tactile
  var piste = racine.querySelector(".p3-piste"), cartes = racine.querySelectorAll(".p3-carte");
  var prec = racine.querySelector(".p3-prec"), suiv = racine.querySelector(".p3-suiv"), etat = racine.querySelector(".p3-etat");
  if (!piste || !prec || !suiv) return;
  function bord() {   // bord gauche « d'accroche » des cartes, en tenant compte du retrait (scroll-padding)
    var cs = getComputedStyle(piste);
    return piste.getBoundingClientRect().left + (parseFloat(cs.scrollPaddingLeft) || parseFloat(cs.paddingLeft) || 0);
  }
  function courant() {
    var g = bord(), best = 0, dist = Infinity;
    cartes.forEach(function (c, i) { var dd = Math.abs(c.getBoundingClientRect().left - g); if (dd < dist) { dist = dd; best = i; } });
    return best;
  }
  function maj() {
    var i = courant();
    if (etat) etat.textContent = (i + 1) + " / " + cartes.length;
    prec.disabled = i === 0; suiv.disabled = i === cartes.length - 1;
  }
  function aller(i) {
    var c = cartes[Math.max(0, Math.min(cartes.length - 1, i))];
    var reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    piste.scrollBy({ left: c.getBoundingClientRect().left - bord(), behavior: reduit ? "auto" : "smooth" });
  }
  prec.addEventListener("click", function () { aller(courant() - 1); });
  suiv.addEventListener("click", function () { aller(courant() + 1); });
  var t; piste.addEventListener("scroll", function () { clearTimeout(t); t = setTimeout(maj, 80); }, { passive: true });
  piste.addEventListener("scrollend", maj);
  window.addEventListener("resize", maj);
  maj();
})();
