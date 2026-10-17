/* Habillage saisonnier — décide AVANT l'affichage s'il faut activer Halloween, puis ajoute le décor.
   Chargé dans <head> (synchrone, très léger) pour éviter un flash de thème.
   Règle : actif seulement si la configuration est valide ET début ≤ maintenant < fin. Sinon : site normal.
   Aperçus locaux (localhost / 127.0.0.1 uniquement, ignorés en ligne) :
     ?simuler=2026-11-06T00:00:00+01:00  → évalue la règle à cette date, sans toucher à l'horloge
     ?saison=halloween | ?saison=normal   → force l'un ou l'autre */
(function (global) {
  "use strict";

  function lireDate(v) {
    if (typeof v !== "string" || !v) return NaN;
    return Date.parse(v);
  }

  /** Règle pure (testée par tools/test-saison.mjs). Retourne { actif, raison }. */
  function evaluer(cfg, maintenant) {
    if (!cfg || cfg.actif !== true) return { actif: false, raison: "désactivé dans la configuration" };
    var fin = lireDate(cfg.fin);
    if (!isFinite(fin)) return { actif: false, raison: "date de fin absente ou invalide" };
    var debut = cfg.debut ? lireDate(cfg.debut) : -Infinity;
    if (cfg.debut && !isFinite(debut)) return { actif: false, raison: "date de début invalide" };
    if (typeof maintenant !== "number" || !isFinite(maintenant)) return { actif: false, raison: "horloge illisible" };
    if (cfg.horlogeMin) {
      var min = lireDate(cfg.horlogeMin);
      if (isFinite(min) && maintenant < min) return { actif: false, raison: "horloge incohérente (antérieure au " + cfg.horlogeMin + ")" };
    }
    if (maintenant < debut) return { actif: false, raison: "pas encore commencé" };
    if (maintenant >= fin) return { actif: false, raison: "expiré" };
    return { actif: true, raison: "période en cours" };
  }

  global.APSaison = { evaluer: evaluer };

  var doc = global.document;
  if (!doc || !doc.documentElement) return; // exécution hors navigateur (tests)

  var cfg = (global.AP_SAISON_CONFIG || {}).halloween;
  var maintenant = Date.now();
  var force = null;
  try {
    var local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(global.location.hostname);
    var q = new URLSearchParams(global.location.search);
    if (local && q.get("simuler")) maintenant = Date.parse(q.get("simuler"));
    if (local && q.get("saison") === "halloween") force = true;
    if (local && q.get("saison") === "normal") force = false;
  } catch (e) { /* URL illisible : comportement normal */ }

  var etat = force === null ? evaluer(cfg, maintenant) : { actif: force, raison: "forcé (aperçu local)" };
  var racine = doc.documentElement;
  racine.setAttribute("data-saison-etat", etat.raison);
  if (!etat.actif) return;
  racine.setAttribute("data-saison", "halloween");

  // ---------- Décor (SVG et CSS locaux, aucun fichier tiers) ----------
  var CHAUVE_SOURIS = '<svg viewBox="0 0 54 22" aria-hidden="true"><path d="M0 10C6 2 14 2 18 8c2-4 6-4 7-1l2-4 2 4c1-3 5-3 7 1 4-6 12-6 18 2-6-2-10 2-14 1-4 3-8 1-10 5l-3 4-3-4c-2-4-6-2-10-5-4 1-8-3-14-1z" fill="currentColor"/></svg>';
  var LUNE = '<svg viewBox="0 0 200 200" aria-hidden="true"><defs><radialGradient id="ap-lune" cx="42%" cy="38%" r="62%"><stop offset="0" stop-color="#fff2cf"/><stop offset=".55" stop-color="#ffd27a"/><stop offset="1" stop-color="#ff9a2e"/></radialGradient></defs>' +
    '<circle cx="100" cy="100" r="96" fill="url(#ap-lune)"/><g fill="#c9781d" opacity=".28"><circle cx="70" cy="72" r="16"/><circle cx="128" cy="118" r="22"/><circle cx="92" cy="140" r="9"/><circle cx="140" cy="66" r="7"/></g></svg>';
  var TOILE = '<svg viewBox="0 0 120 120" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1"><path d="M0 0L120 120M0 0L120 40M0 0L40 120M0 0L120 80M0 0L80 120"/><path d="M0 30Q18 22 26 26 30 18 30 0M0 60Q34 46 46 46 46 34 60 0M0 90Q50 70 66 66 70 50 90 0"/></g></svg>';

  function ajouterDecor() {
    var b = doc.body;
    if (!b || doc.querySelector(".hw-brume")) return;
    var brume = doc.createElement("div");
    brume.className = "hw-brume";
    brume.setAttribute("aria-hidden", "true");
    brume.innerHTML = "<i></i><i></i>";
    b.insertBefore(brume, b.firstChild);

    var scene = doc.querySelector(".hero") || doc.querySelector(".page-hero");
    if (scene) {
      var d = doc.createElement("div");
      d.className = "hw-scene";
      d.setAttribute("aria-hidden", "true");
      var html = '<div class="hw-lune">' + LUNE + '</div><div class="hw-toile">' + TOILE + "</div>";
      for (var i = 1; i <= 4; i++) html += '<span class="hw-cs hw-cs' + i + '"><span>' + CHAUVE_SOURIS + "</span></span>";
      d.innerHTML = html;
      scene.insertBefore(d, scene.firstChild);
    }

    // Aucune mention textuelle de l'édition saisonnière : seul le décor change (demande du fondateur, 17/10/2026)
  }
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", ajouterDecor); else ajouterDecor();
})(typeof window !== "undefined" ? window : this);
