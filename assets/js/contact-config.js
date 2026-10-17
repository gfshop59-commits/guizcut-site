/* GUIZCUT — envoi direct du formulaire de contact (docs/CONTACT.md).
   Tant que `cle` est vide, le formulaire prépare un e-mail dans la messagerie du visiteur (comportement historique).
   Avec une clé d'accès Web3Forms (gratuite, liée à contact@guizcut.fr, publique par conception : ce n'est pas un secret),
   la demande est envoyée directement depuis la page, sans ouvrir de messagerie. */
window.GZContact = window.GZContact || {
  service: "web3forms",
  url: "https://api.web3forms.com/submit",
  cle: "ec7bdd99-78f0-4fd2-8a4a-c634b9ef5ddb"
};
