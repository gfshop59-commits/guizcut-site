/* Configuration centrale des habillages saisonniers (Issue #6).
   ─ Pour DÉSACTIVER immédiatement Halloween : passer `actif` à false (ou supprimer ce bloc).
   ─ Fin : 6 novembre 2026 à 00:00, heure de Paris (UTC+1 après le passage à l'heure d'hiver du 25 octobre),
     soit 2026-11-05T23:00:00Z. L'habillage est visible jusqu'au 5 novembre inclus.
   ─ horlogeMin : une horloge antérieure à cette date est jugée incohérente → pas d'habillage.
   Détails, tests et limites : docs/SAISONNIER.md */
window.AP_SAISON_CONFIG = {
  halloween: {
    actif: true,
    debut: "2026-10-16T00:00:00+02:00",
    fin: "2026-11-06T00:00:00+01:00",
    horlogeMin: "2026-10-01T00:00:00+02:00"
  }
};
