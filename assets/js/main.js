/* GUIZCUT — scripts du site (seul appel externe : l'envoi direct du formulaire via Web3Forms, si configuré).
   Les médias de démonstration sont fabriqués hors du site (travail/prospection-registre/tools/render-scenes.mjs). */
(function () {
  "use strict";

  var root = document.documentElement;
  var EN = root.lang === "en";   // pages /en/ : mêmes scripts, textes anglais
  function T(fr, en) { return EN ? en : fr; }
  // Racine du site déduite du script (les pages /en/ sont un niveau plus bas)
  var BASE = (document.currentScript && document.currentScript.src || "").replace(/assets\/js\/main\.js.*$/, "");
  root.classList.remove("no-js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var hasIO = "IntersectionObserver" in window;

  // ---------- Navigation ----------
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? T("Fermer le menu", "Close menu") : T("Ouvrir le menu", "Open menu"));
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && links.classList.contains("open")) { toggle.click(); toggle.focus(); }
    });
  }
  var page = document.body.getAttribute("data-page");
  document.querySelectorAll(".nav-links a[data-page]").forEach(function (a) {
    if (a.getAttribute("data-page") === page) a.setAttribute("aria-current", "page");
  });
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // ---------- Apparition au défilement ----------
  var reveals = document.querySelectorAll(".reveal");
  if (hasIO && !reduce.matches) {
    var ioReveal = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); ioReveal.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { ioReveal.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  // ---------- Lecteurs vidéo (clic pour lire, jamais de son automatique) ----------
  function initPlayer(p) {
    var btn = p.querySelector(".play");
    if (!btn) return;
    p.style.setProperty("--w", p.clientWidth + "px");
    btn.addEventListener("click", function () {
      var src = p.getAttribute("data-src");
      var v = document.createElement("video");
      v.src = src;
      v.controls = true; v.playsInline = true; v.muted = true; v.preload = "auto";
      var poster = p.querySelector("img.poster");
      if (poster) v.poster = poster.currentSrc || poster.getAttribute("src");
      v.setAttribute("aria-label", btn.getAttribute("aria-label").replace(/^(Lire|Play) /, ""));
      v.addEventListener("error", function () {
        var msg = document.createElement("p");
        msg.className = "player-msg";
        msg.textContent = T("Vidéo indisponible pour le moment.", "Video unavailable at the moment.");
                p.appendChild(msg);
      });
      btn.replaceWith(v);
      var pr = v.play();
      if (pr && pr.catch) pr.catch(function () { /* lecture refusée : les contrôles restent disponibles */ });
      v.focus();
    });
  }
  document.querySelectorAll(".player").forEach(initPlayer);

  // ---------- CTA mobile fixe ----------
  var mcta = document.querySelector(".mobile-cta");
  var heroEl = document.querySelector(".hero, .page-hero");
  var endEl = document.querySelector(".closing, .site-footer");
  if (mcta && heroEl && hasIO) {
    var heroOut = false, endIn = false;
    var upd = function () {
      var show = heroOut && !endIn;
      mcta.classList.toggle("show", show);
      mcta.setAttribute("aria-hidden", show ? "false" : "true");
      mcta.querySelectorAll("a").forEach(function (a) { a.tabIndex = show ? 0 : -1; });
    };
    new IntersectionObserver(function (e) { heroOut = !e[0].isIntersecting; upd(); }).observe(heroEl);
    if (endEl) new IntersectionObserver(function (e) { endIn = e[0].isIntersecting; upd(); }).observe(endEl);
    upd();
  }

  // ---------- Copier l'adresse e-mail (page Contact) ----------
  document.querySelectorAll("[data-copier]").forEach(function (b) {
    b.addEventListener("click", function () {
      var texte = b.getAttribute("data-copier");
      var etat = b.closest(".panel") && b.closest(".panel").querySelector(".copie-etat");
      var ok = function () { if (etat) etat.textContent = T("Adresse copiée : ", "Address copied: ") + texte; };
      var echec = function () {
        // Presse-papiers refusé : on sélectionne l'adresse pour une copie manuelle (Ctrl+C)
        var cible = b.closest(".panel") && b.closest(".panel").querySelector(".adresse");
        if (cible && window.getSelection) { var r = document.createRange(); r.selectNodeContents(cible); var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r); }
        if (etat) etat.textContent = T("Adresse sélectionnée : appuyez sur Ctrl+C (ou ⌘+C) pour la copier.", "Address selected: press Ctrl+C (or ⌘+C) to copy it.");
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(texte).then(ok, echec); else echec();
    });
  });

  // ---------- Portfolio (piloté par assets/videos/portfolio.json) ----------
  var grid = document.getElementById("portfolio-grid");
  if (grid) initPortfolio(grid);

  function initPortfolio(target) {
    var limit = parseInt(target.getAttribute("data-limit") || "0", 10);
    var filtersEl = document.getElementById("portfolio-filters");

    fetch(BASE + "assets/videos/portfolio.json", { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (data) { render(data.clips || []); })
      .catch(function () { render([]); });

    function render(clips) {
      // Double sécurité : seul un montage dont la publication publique est attestée par écrit peut s'afficher
      clips = clips.filter(autorise);
      var vide = document.getElementById("portfolio-vide");
      if (vide) vide.hidden = clips.length > 0;
      if (!clips.length) {
        // Aucun faux portfolio : tant qu'aucun clip réel autorisé n'est publié, on l'annonce simplement.
        target.innerHTML = ""; // état vide : le texte d'introduction de la section suffit (pas de répétition)
        if (filtersEl) filtersEl.hidden = true;
        return;
      }
      if (limit > 0) clips = clips.slice(0, limit);
      draw(clips, "all");
      if (!filtersEl) return;
      var cats = ["all"];
      clips.forEach(function (c) { if (c.categorie && cats.indexOf(c.categorie) < 0) cats.push(c.categorie); });
      filtersEl.innerHTML = "";
      cats.forEach(function (cat) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "filter";
        b.textContent = cat === "all" ? T("Tous", "All") : cat;
        b.setAttribute("aria-pressed", cat === "all" ? "true" : "false");
        b.addEventListener("click", function () {
          filtersEl.querySelectorAll(".filter").forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
          b.setAttribute("aria-pressed", "true");
          draw(clips, cat);
        });
        filtersEl.appendChild(b);
      });
    }

    function draw(clips, cat) {
      target.innerHTML = "";
      clips.filter(function (c) { return cat === "all" || c.categorie === cat; }).forEach(function (c, i) {
        target.appendChild(card(c, i));
      });
      target.setAttribute("aria-live", "polite");
    }

    function card(c, i) {
      var art = document.createElement("article");
      art.className = "clip";
      var media = document.createElement("div");
      media.className = "clip-media";

      if (c.fichier) {
        var v = document.createElement("video");
        v.src = BASE + "assets/videos/" + c.fichier;
        if (c.affiche) v.poster = BASE + "assets/videos/" + c.affiche;
        v.controls = true; v.playsInline = true; v.preload = "none"; v.muted = true;
        v.setAttribute("aria-label", c.titre || T("Exemple de clip", "Sample clip"));
        v.addEventListener("error", function () { media.innerHTML = ""; media.appendChild(placeholder(c, i, T("Fichier introuvable : ", "File not found: ") + c.fichier)); });
        media.appendChild(v);
      } else {
        media.appendChild(placeholder(c, i, T("Clip réel à venir, diffusé après accord des personnes filmées.", "Real clip coming soon, shown once the people filmed have agreed.")));
      }

      var body = document.createElement("div");
      body.className = "clip-body";
      var origine = document.createElement("p");   // distingue nos montages des références externes de la page
      origine.className = "clip-origine";
      origine.textContent = T("Réalisation GUIZCUT", "Made by GUIZCUT") + (c.createur ? T(" · vidéo de ", " · video by ") + c.createur + T(", publiée avec son accord", ", published with their consent") : "");
      body.appendChild(origine);
      var h = document.createElement("h3");
      h.textContent = c.titre || T("Clip exemple", "Sample clip");
      var p = document.createElement("p");
      p.textContent = c.description || "";
      var meta = document.createElement("div");
      meta.className = "clip-meta";
      [c.categorie, c.duree, c.format].forEach(function (t) {
        if (!t) return;
        var s = document.createElement("span");
        s.textContent = t;
        meta.appendChild(s);
      });
      body.appendChild(h); body.appendChild(p); body.appendChild(meta);
      art.appendChild(media); art.appendChild(body);
      return art;
    }

    function placeholder(c, i, text) {
      var d = document.createElement("div");
      d.className = "clip-placeholder";
      var top = document.createElement("span");
      top.className = "ph-top";
      top.textContent = T("Prochainement · ", "Coming soon · ") + String(i + 1).padStart(2, "0");
      var mid = document.createElement("span");
      mid.className = "ph-mid";
      mid.textContent = c.categorie || "Clip";
      var bot = document.createElement("span");
      bot.className = "ph-bot";
      bot.textContent = text;
      d.appendChild(top); d.appendChild(mid); d.appendChild(bot);
      return d;
    }
  }

  /** Publication publique autorisée par écrit (portfolio.json : autorisation.publication_publique + preuve_ecrite). */
  function autorise(c) {
    var a = c && c.autorisation;
    return !!(a && a.publication_publique === true && typeof a.preuve_ecrite === "string" && a.preuve_ecrite.trim());
  }

  // ---------- Accueil : emplacement « cas client réel » (désactivé sans autorisation écrite) ----------
  var casReel = document.querySelector("[data-cas-reel]");
  if (casReel) {
    fetch(BASE + "assets/videos/portfolio.json", { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : {}; })
      .then(function (data) { var c = data.cas_reel; if (c && autorise(c) && c.source && c.source.extrait && (c.clips || []).length) remplirCas(casReel, c); })
      .catch(function () { /* hors ligne : l'emplacement reste masqué */ });
  }
  function remplirCas(sec, c) {
    var dossier = BASE + "assets/videos/";
    var champ = function (n) { return sec.querySelector('[data-champ="' + n + '"]'); };
    if (c.titre) champ("titre").textContent = c.titre;
    champ("description").textContent = c.description || "";
    champ("mention").textContent = T("Réalisation GUIZCUT · vidéo de ", "Made by GUIZCUT · video by ") + (c.createur || "") +
      T(", publiée avec son accord écrit.", ", published with their written consent.");
    var medias = champ("medias");
    var fig = function (fichier, affiche, legende, ratio, piste) {
      var f = document.createElement("figure");
      var v = document.createElement("video");
      v.controls = true; v.playsInline = true; v.preload = "none"; v.muted = true;
      v.style.aspectRatio = ratio; v.style.width = "100%";
      if (affiche) v.poster = dossier + affiche;
      v.src = dossier + fichier;
      v.setAttribute("aria-label", legende);
      if (piste) { var t = document.createElement("track"); t.kind = "subtitles"; t.srclang = "fr"; t.label = "Français"; t.src = dossier + piste; v.appendChild(t); }
      var cap = document.createElement("figcaption"); cap.textContent = legende;
      f.appendChild(v); f.appendChild(cap);
      return f;
    };
    medias.appendChild(fig(c.source.extrait, c.source.affiche, T("Avant · vidéo source ", "Before · source video ") + (c.source.duree || ""), "16 / 9", c.source.sous_titres));
    c.clips.forEach(function (k, i) {
      medias.appendChild(fig(k.fichier, k.affiche, T("Après · clip ", "After · clip ") + (i + 1) + (k.duree ? " · " + k.duree : ""), "9 / 16", k.sous_titres));
    });
    sec.hidden = false;
  }

  // ---------- Formulaire de demande : envoi direct si configuré, sinon e-mail pré-rempli ----------
  var form = document.getElementById("order-form");
  if (form) initForm(form);

  function initForm(f) {
    var MAX_MIN = 45;
    var result = document.getElementById("form-result");

    var rules = {
      nom: function (v) { return v.trim().length >= 2 || T("Indiquez votre nom (2 caractères minimum).", "Enter your name (at least 2 characters)."); },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || T("Adresse e-mail invalide.", "Invalid email address."); },
      plateforme: function (v) { return v !== "" || T("Choisissez une plateforme principale.", "Choose a main platform."); },
      lien: function (v) {
        if (v.trim() === "") return true; // facultatif
        try { var u = new URL(v.trim()); return /^https?:$/.test(u.protocol) || T("Lien http(s) attendu.", "An http(s) link is expected."); }
        catch (e) { return T("Lien invalide (ex. https://youtube.com/watch?v=...).", "Invalid link (e.g. https://youtube.com/watch?v=...)."); }
      },
      duree: function (v) {
        var n = Number(v);
        return (v && !isNaN(n) && n > 0) || T("Indiquez la durée de la vidéo en minutes.", "Enter the video length in minutes.");
      },
      // La limite de 45 min ne vaut que pour la séance pilote ; au-delà, on monte le passage indiqué dans les consignes (FAQ Tarifs)
      consignes: function (v) {
        if (!trop_longue()) return true;
        return v.trim().length >= 5 ||
          T("Votre vidéo dure plus de " + MAX_MIN + " min : indiquez ici le passage à monter (" + MAX_MIN + " min maximum), ou choisissez la demande de devis à l'étape 1.",
            "Your video is longer than " + MAX_MIN + " min: tell us here which part to edit (" + MAX_MIN + " min maximum), or choose the quote request in step 1.");
      },
      formule: function (v) { return v !== "" || T("Choisissez une formule.", "Choose an offer."); },
      droits: function (_, el) { return el.checked || T("Cette confirmation est nécessaire pour traiter une vidéo.", "We need this confirmation to work on a video."); },
      consentement: function (_, el) { return el.checked || T("Merci d'accepter le traitement de votre demande.", "Please agree to us processing your request."); }
    };

    function check(name) {
      var el = f.elements[name];
      if (!el) return true;
      var res = rules[name](el.value, el);
      var field = el.closest(".field") || el.closest(".check");
      var err = field && field.querySelector(".error");
      var ok = res === true;
      if (field) {
        field.classList.toggle("invalid", !ok);
        field.classList.toggle("valid", ok && el.type !== "checkbox" && el.value !== "");
      }
      if (err) err.textContent = ok ? "" : res;
      el.setAttribute("aria-invalid", ok ? "false" : "true");
      return ok;
    }

    function trop_longue() { return f.elements.formule.value === "pilote-29" && Number(f.elements.duree.value) > MAX_MIN; }

    Object.keys(rules).forEach(function (name) {
      var el = f.elements[name];
      if (!el) return;
      el.addEventListener("blur", function () { check(name); });
      el.addEventListener("change", function () { if (el.getAttribute("aria-invalid") === "true") check(name); });
    });
    // Vidéo de plus de 45 min (séance pilote) : avis immédiat sous la durée, la précision se donne à l'étape 2
    var avis = document.getElementById("a-duree");
    function majAvis() {
      if (avis) avis.textContent = trop_longue()
        ? T("Plus de " + MAX_MIN + " min : à l'étape 2, indiquez le passage à monter (" + MAX_MIN + " min maximum), ou choisissez la demande de devis.",
            "Over " + MAX_MIN + " min: in step 2, tell us which part to edit (" + MAX_MIN + " min maximum), or choose the quote request.")
        : "";
      if (f.elements.consignes.getAttribute("aria-invalid") === "true") check("consignes");
    }
    ["duree", "formule"].forEach(function (name) { f.elements[name].addEventListener("change", majAvis); f.elements[name].addEventListener("input", majAvis); });

    // ---- Deux étapes : 1. la vidéo (formule, plateforme, lien, durée) ; 2. consignes, coordonnées et confirmations ----
    var etapes = [].slice.call(f.querySelectorAll("fieldset[data-etape]"));
    var etat = document.getElementById("etape-etat");
    var recap = document.getElementById("recap-etape1");
    function champsEtape(n) {
      return Object.keys(rules).filter(function (name) { var el = f.elements[name]; return el && el.closest("fieldset[data-etape]") === etapes[n - 1]; });
    }
    function afficherEtape(n, focus) {
      if (!etapes.length) return;
      etapes.forEach(function (fs, i) { fs.hidden = i !== n - 1; });
      f.setAttribute("data-etape-courante", String(n));
      if (etat) etat.textContent = T("Étape " + n + " sur 2 · ", "Step " + n + " of 2 · ") + etapes[n - 1].querySelector("legend .titre").textContent;
      if (n === 2 && recap) remplirRecap();
      if (focus) etapes[n - 1].querySelector("legend").focus();
    }
    function remplirRecap() {
      var E = f.elements, o = E.formule.options[E.formule.selectedIndex], codePromo = E.code_promo ? E.code_promo.value.trim() : "";
      recap.textContent = "";
      [[T("Formule", "Offer"), o ? o.text : ""], [T("Plateforme", "Platform"), E.plateforme.value],
       [T("Durée", "Length"), E.duree.value + " min"], [T("Lien", "Link"), E.lien.value.trim() || T("à transmettre plus tard", "to be sent later")],
       [T("Code promo", "Promo code"), codePromo || T("aucun", "none")]]
        .forEach(function (l) { var dt = document.createElement("dt"), dd = document.createElement("dd"); dt.textContent = l[0]; dd.textContent = l[1]; recap.appendChild(dt); recap.appendChild(dd); });
    }
    function verifier(noms) {
      var ok = noms.map(check).every(Boolean);
      if (!ok) { var first = f.querySelector('[aria-invalid="true"]'); if (first) first.focus(); }
      return ok;
    }
    if (etapes.length === 2) {
      f.querySelector("[data-suivant]").addEventListener("click", function () { if (verifier(champsEtape(1))) afficherEtape(2, true); });
      f.querySelector("[data-retour]").addEventListener("click", function () { afficherEtape(1, true); });
      afficherEtape(1, false);
    }
    // Formule présélectionnée depuis les boutons de la page Tarifs (contact.html?formule=devis#commande)
    var formuleDemandee = (window.location.search.match(/[?&]formule=([\w-]+)/) || [])[1];
    if (formuleDemandee === "pilote-49") formuleDemandee = "pilote-29"; // anciens liens : même séance pilote, nouveau tarif
    if (formuleDemandee === "pilote-29" || formuleDemandee === "devis") f.elements.formule.value = formuleDemandee;

    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var allOk = Object.keys(rules).map(check).every(Boolean);
      if (!allOk) {
        var first = f.querySelector('[aria-invalid="true"]');
        var fs = first && first.closest("fieldset[data-etape]");
        if (fs && fs.hidden) afficherEtape(Number(fs.getAttribute("data-etape")), false);   // erreur dans l'étape masquée : on y revient
        if (first) first.focus();
        result.classList.remove("show");
        return;
      }
      var demande = construireDemande(f);
      if (envoiDirect()) envoyer(demande); else ouvrirMessagerie(demande);
    });

    // ---- Envoi direct (si configuré) : antispam par champ piège + délai minimal + une demande par minute ----
    var ouverture = Date.now();
    var bouton = f.querySelector('button[type="submit"]');
    function envoiDirect() { var c = window.GZContact; return !!(c && c.cle && c.url && window.fetch); }
    function mode() {
      var direct = envoiDirect();
      document.querySelectorAll("[data-mode]").forEach(function (el) { el.hidden = el.getAttribute("data-mode") !== (direct ? "direct" : "mailto"); });
      if (bouton) bouton.textContent = direct ? T("Envoyer ma demande", "Send my request") : T("Préparer mon e-mail de demande", "Prepare my request email");
    }
    mode();

    function afficher(titre, texte, demande, avecMail, erreur) {
      result.querySelector("strong").textContent = titre;
      result.querySelector("p.small").textContent = texte;
      result.querySelector("pre").textContent = demande.apercu;
      var lien = document.getElementById("mail-lien");
      if (lien) { lien.href = demande.mailto; lien.parentNode.hidden = !avecMail; }
      result.classList.toggle("erreur", !!erreur);
      result.classList.add("show");
      result.focus();
    }
    function ouvrirMessagerie(demande) {
      afficher(T("Votre messagerie s'ouvre avec la demande pré-remplie.", "Your email app opens with the request filled in."),
        T("Vérifiez le message puis cliquez sur « Envoyer » dans votre messagerie. Si rien ne s'ouvre, copiez le texte ci-dessous et envoyez-le à contact@guizcut.fr.",
          "Check the message, then click “Send” in your email app. If nothing opens, copy the text below and send it to contact@guizcut.fr."),
        demande, true);
      window.location.href = demande.mailto; // ouvre la messagerie du visiteur ; rien ne part sans son clic sur « Envoyer »
    }
    function derniereDemande() { try { return Number(sessionStorage.getItem("gz-envoi") || 0); } catch (e) { return 0; } }
    function envoyer(demande) {
      var piege = f.elements.site_web && f.elements.site_web.value;
      if (piege || Date.now() - ouverture < 3000) {   // robot probable : rien n'est transmis, réponse neutre
        afficher(T("Demande envoyée.", "Request sent."), T("Merci : nous vous répondons par e-mail.", "Thank you: we will reply by email."), demande, false);
        return;
      }
      if (Date.now() - derniereDemande() < 60000) {
        afficher(T("Demande déjà envoyée.", "Request already sent."), T("Votre demande vient de partir : inutile de la renvoyer. Nous vous répondons par e-mail.", "Your request has just been sent: no need to send it again. We will reply by email."), demande, false);
        return;
      }
      var c = window.GZContact;
      bouton.disabled = true; bouton.textContent = T("Envoi en cours…", "Sending…");
      var controle = window.AbortController ? new AbortController() : null;
      var minuteur = setTimeout(function () { if (controle) controle.abort(); }, 15000);
      fetch(c.url, {
        method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ access_key: c.cle, subject: demande.sujet, from_name: T("Site GUIZCUT — ", "GUIZCUT site (EN) — ") + f.elements.nom.value.trim(),
          replyto: f.elements.email.value.trim(), email: f.elements.email.value.trim(), message: demande.corps, botcheck: "" }),
        signal: controle ? controle.signal : undefined
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || j.success === false) throw new Error(j.message || "HTTP " + r.status); });
      }).then(function () {
        try { sessionStorage.setItem("gz-envoi", String(Date.now())); } catch (e) { /* stockage indisponible */ }
        afficher(T("Demande envoyée à contact@guizcut.fr.", "Request sent to contact@guizcut.fr."), T("Merci ! Nous vous répondons par e-mail, à l'adresse indiquée. Récapitulatif :", "Thank you! We will reply by email to the address you gave. Summary:"), demande, false);
        f.reset();
        majAvis();
        afficherEtape(1, false);
      }).catch(function () {
        afficher(T("Votre demande n'a pas pu être envoyée depuis la page.", "Your request could not be sent from this page."),
          T("Rien n'est perdu : envoyez-la depuis votre messagerie avec le bouton ci-dessous, ou copiez le texte vers contact@guizcut.fr.",
            "Nothing is lost: send it from your email app with the button below, or copy the text to contact@guizcut.fr."), demande, true, true);
      }).then(function () { clearTimeout(minuteur); bouton.disabled = false; mode(); });
    }
  }

  /** Prépare la demande (texte, objet, lien mailto). Le site ne stocke rien. */
  function construireDemande(f) {
      var formules = EN
        ? { "pilote-29": "Pilot session — 3 clips, €29 excl. VAT", "devis": "Volume — quote request" }
        : { "pilote-29": "Séance pilote — 3 clips, 29 € HT", "devis": "Volume — demande de devis" };
      var E = f.elements;
      var codePromo = E.code_promo ? E.code_promo.value.trim() : "";
      var formule = formules[E.formule.value] || E.formule.value;
      var corps = (EN ? [
        "Hello GUIZCUT,",
        "",
        "I would like to make a request (English-language page — please reply in English):",
        "- Name or handle: " + E.nom.value.trim(),
        "- Reply-to email: " + E.email.value.trim(),
        "- Main platform: " + E.plateforme.value,
        "- Offer: " + formule,
        "- Video length: " + Number(E.duree.value) + " min",
        "- Video link: " + (E.lien.value.trim() || "to be sent later"),
        "- Promo or ambassador code: " + (codePromo || "none"),
        "- Subtitle style: " + E.style.value,
        "- Notes: " + (E.consignes.value.trim() || "none"),
        "",
        "I confirm that I hold the rights to this video and the consent of the people who appear in it.",
        ""
      ] : [
        "Bonjour GUIZCUT,",
        "",
        "Je souhaite faire une demande :",
        "- Nom ou pseudo : " + E.nom.value.trim(),
        "- E-mail de réponse : " + E.email.value.trim(),
        "- Plateforme principale : " + E.plateforme.value,
        "- Formule : " + formule,
        "- Durée de la vidéo : " + Number(E.duree.value) + " min",
        "- Lien vers la vidéo : " + (E.lien.value.trim() || "à transmettre plus tard"),
        "- Code promo ou ambassadeur : " + (codePromo || "aucun"),
        "- Style de sous-titres : " + E.style.value,
        "- Consignes : " + (E.consignes.value.trim() || "aucune"),
        "",
        "Je confirme détenir les droits sur cette vidéo et l'accord des personnes qui y apparaissent.",
        ""
      ]).join("\n");
      var sujet = (EN ? "[EN] GUIZCUT request — " : "Demande GUIZCUT — ") + (formules[E.formule.value] || T("demande", "request"));
      var mailto = "mailto:contact@guizcut.fr?subject=" + encodeURIComponent(sujet) + "&body=" + encodeURIComponent(corps);
      return { mailto: mailto, sujet: sujet, corps: corps,
        apercu: T("À : ", "To: ") + "contact@guizcut.fr\n" + T("Objet : ", "Subject: ") + sujet + "\n\n" + corps };
  }
  window.GZConstruireDemande = construireDemande; // exposé pour les tests (aucun envoi)
})();
