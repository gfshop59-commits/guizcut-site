# Développer les recherches hors marque — 23 octobre 2026

Coordination : https://github.com/gfshop59-commits/studio-video-ia/issues/55

## Ce que cette livraison apporte

La première refonte SEO (PR #12) est fusionnée dans `main`. La capture fournie par le fondateur montre le site pour la recherche `guizcut.fr` ; elle ne permet pas de mesurer les positions sur des recherches génériques. Aucun volume de recherche, classement ou trafic n'est inventé ici.

Quatre contenus français distincts complètent l'offre générale :

| Page | Besoin traité | Contenu spécifique |
|---|---|---|
| `/montage-shorts-youtube.html` | Confier le montage d'une vidéo YouTube en Shorts | Choix de séquences autonomes, limites du recadrage des tutoriels, préparation des consignes |
| `/podcast-en-clips.html` | Extraire des moments d'un podcast vidéo | Respect du contexte, plusieurs intervenants, noms propres, distinction podcast audio/vidéo |
| `/clips-stream-twitch.html` | Monter les moments forts d'un stream | Fenêtre de 45 minutes pour une longue VOD, contexte du défi, lisibilité jeu/webcam |
| `/choisir-extrait-video-courte.html` | Choisir un bon passage avant de monter | Grille de sélection, exemple fictif commenté, points de contrôle et préparation des horodatages |

Ces pages sont reliées entre elles et depuis l'accueil, le studio, les tarifs, le portfolio et la présentation de l'équipe. Elles utilisent les styles existants, un sommaire accessible et un affichage adapté au mobile. Elles disposent de titres et descriptions distincts, d'une URL canonique, de métadonnées de partage et de fils d'Ariane structurés. Les pages commerciales décrivent un service et une offre à 29 € HT ; le guide est décrit comme un article. Aucune promesse d'affichage enrichi n'est faite.

Le sitemap passe de 14 à 18 URL. Les variantes anglaises existantes et leurs liens de langue sont conservés. Les quatre nouvelles pages sont uniquement françaises : aucune traduction fictive ou correspondance linguistique avec une page sans rapport.

Les fichiers `assets/js/main.js`, `contact.html` et `en/contact.html`, dont le code promo, sont identiques à `main` au départ de la branche. Pas de nouvelle dépendance, de nouveau traceur, de formulaire envoyé, de contenu client ni de média ajouté. Les démonstrations et références historiques du site ne sont pas reprises dans les nouvelles pages.

## Vérifications avant la PR

- `python tools/check-seo.py` : 347 contrôles réussis. Vérifie les liens et ancres locaux des nouvelles pages, les références depuis les pages existantes, H1, unicité des titres, métadonnées, JSON-LD, offre HT et sitemap.
- `git diff --check` : aucune erreur.
- Chromium/Playwright 1.64.1 : 9 pages × 2 tailles (1440 × 900, 390 × 844). HTTP 200, un H1 et un contenu principal, aucune erreur JavaScript ou ressource locale en échec, aucun débordement horizontal. Menu mobile testé. Lien du bouton vers le formulaire et présélection `pilote-29` vérifiés, sans soumission.
- Captures revues du guide et de la page Shorts en bureau et mobile. Résultats et captures de contrôle locaux conservés à côté de la copie de travail, hors du site publié.
- L'analytique de production est neutralisée pendant les tests locaux afin de ne pas créer de fausses visites.

Le premier test de navigation comptait les formulaires avant leur chargement et échouait. Après attente du formulaire visible et contrôle de la formule sélectionnée, les 18 scénarios passent. Ce correctif concerne le contrôle, pas le formulaire du site.

Non vérifié : indexation des nouvelles URL (encore non publiées), résultats enrichis Google, performances réelles Search Console, réception d'une demande commerciale, comportement d'autres navigateurs. Un HTTP 200 et un JSON-LD valide ne garantissent ni indexation ni classement.

## Après fusion et publication autorisées

1. Contrôler les quatre nouvelles URL en production et les liens vers la demande pilote. Vérifier qu'elles ne sont ni redirigées vers l'accueil ni bloquées à l'indexation.
2. Dans la propriété Google Search Console existante, inspecter les nouvelles URL et vérifier le sitemap `https://guizcut.fr/sitemap.xml`. Demander l'indexation des pages importantes si nécessaire. Ne pas répéter quotidiennement les demandes.
3. Vérifier le même sitemap dans la propriété Bing Webmaster Tools existante. Les balises de vérification déjà présentes restent inchangées.
4. Relever une base dans le rapport de performances : clics, impressions, CTR et position moyenne, par page et par requête. Séparer les requêtes de marque (`guizcut`, `guizcut.fr`, variantes) des recherches de service. Consigner une absence de données comme telle, sans la convertir en zéro de performance.
5. Après quelques semaines, comparer des périodes cohérentes, en tenant compte du faible volume possible. Une page impressionnée mais peu cliquée peut nécessiter un meilleur titre ; une page sans impression nécessite d'abord un contrôle d'indexation et de pertinence.

## Suite éditoriale, guidée par les données

- Compléter les questions réellement posées par les prospects, en anonymisant les demandes. Un contenu utile par besoin, plutôt qu'une multiplication de pages presque identiques par ville ou plateforme.
- Créer un cas avant/après uniquement avec une source et une autorisation de publication vérifiées. Ne pas citer LuuxiA ni publier son média par défaut. Montrer la sélection, le cadrage et les sous-titres ; ne pas inventer de vues ou de ventes.
- Vérifier les liens de site déjà présents sur les comptes sociaux officiels. Toute modification ou publication externe reste à valider. Aucun achat de liens, faux avis ou inscription massive à des annuaires.
- Créer ensuite un second guide selon les impressions réellement observées, par exemple préparer une source ou rendre des sous-titres lisibles. Ne pas publier automatiquement des contenus répétitifs pour augmenter le nombre de pages.
- Si des données d'expérience réelle apparaissent dans Search Console, traiter les problèmes de chargement ou de stabilité observés. Aucun score de performance ou gain de position n'est revendiqué par cette livraison.

La prochaine étape de publication reste la revue et la fusion humaine de la PR vers `main`. Cette branche ne déclenche pas de mise en ligne.

## Références

- Google Search Central, guide de démarrage SEO : https://developers.google.com/search/docs/fundamentals/seo-starter-guide?hl=fr
- Google Search Central, contenu utile : https://developers.google.com/search/docs/fundamentals/creating-helpful-content?hl=fr
- Google Search Central, sitemaps : https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview?hl=fr

Google recommande d'évaluer les effets sur plusieurs semaines et ne garantit pas de première place. Les contenus et le maillage constituent ici un socle à mesurer, pas une promesse de résultat.
