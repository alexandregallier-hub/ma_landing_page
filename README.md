# Site vitrine d'un formateur-consultant IA (démonstration)

Site statique complet pour un personnage fictif, **Élise Garnier**, consultante et formatrice IA à Nantes, qui s'adresse aux dirigeants de PME et d'ETI de 10 à 250 salariés. Aucun framework, aucune dépendance, aucun cookie.

```
index.html              page principale (environ 11 écrans sur ordinateur)
methode.html            méthode détaillée : déroulé, carte des tâches, choix d'outil, AI Act
formation-ia.html       programme détaillé de la formation (exigence Qualiopi)
mentions-legales.html   éditeur, hébergeur, déclaration d'activité, accessibilité
confidentialite.html    politique RGPD
404.html                page d'erreur
assets/css/site.css     système de design complet
assets/js/site.js       interactions, sans bibliothèque
assets/fonts/           Schibsted Grotesk et Geist Mono, auto-hébergées (licence OFL)
assets/img/             icône, image de partage
robots.txt, sitemap.xml, site.webmanifest
```

## Voir le site

En local : `npx http-server -p 8080` à la racine, puis ouvrir http://localhost:8080.

Mise en ligne : n'importe quel hébergement statique. Pour rester cohérent avec le discours sur les données, un hébergeur européen (OVHcloud, Scaleway, o2switch) est préférable à GitHub Pages ou Netlify. Activer la compression gzip ou brotli côté serveur.

## Ce que le visiteur comprend en moins de dix secondes

| Question du visiteur | Réponse sur la page |
|---|---|
| Qu'est-ce qu'on me promet ? | Titre : « Vos équipes gagnent 4 heures par semaine avec l'IA », présenté comme un gain médian mesuré au 90e jour |
| Comment ? | Trois offres chiffrées : diagnostic (2 400 € HT), formation finançable OPCO (2 900 € HT le groupe), accompagnement 90 jours (dès 9 800 € HT) |
| Par quelles étapes ? | Cinq jalons sous les offres, avec le temps total demandé au dirigeant ; le détail semaine par semaine est sur la page Méthode |
| Ça marche vraiment ? | Trois études de cas chiffrées juste après le premier écran, trois avis, calculateur ; carte des tâches interactive sur la page Méthode |
| Pourquoi elle ? | Parcours de l'opérationnel (direction d'usine), Qualiopi, position claire sur les données et l'AI Act |
| Que dois-je faire ? | Un seul bouton sur toute la page : « Réserver un appel de 30 min », avec un agenda intégré |

## Analyse réalisée

### Concurrents français (20 sites analysés dans un navigateur)

Meteor Conseil, IAvarone, Proactive Academy, IAvenir, Nerolia, Synapse IA, Proxiformation, Conversion Boosters, Liora (ex-DataScientest), Jedha, Le Wagon, Orsys, M2i, Demos, Skipia, Auratech, Alexandre Carette, formateur.marketing, Unow, NWI Academy.

Ce qui en ressort :

- **Les titres décrivent une catégorie, pas un résultat.** « Formation IA en entreprise », « Formations IA générative certifiées Qualiopi ». Très peu promettent un gain mesurable. NWI annonce « 10h/sem » sans dire d'où vient le chiffre.
- **Les outils cités sont ChatGPT, Claude, Copilot et Gemini.** Copilot revient jusqu'à 15 fois sur une même page (Meteor, Proactive) : en France, beaucoup de PME ont déjà Microsoft 365. Mistral et Dust sont presque absents. RGPD et souveraineté sont rarement abordés (0 à 4 mentions).
- **L'AI Act est vendu par la peur.** « L'article 4 vous oblige à agir », « sanctions ». Or l'article 4 a été réécrit en juillet 2026 (règlement 2026/1744) : il demande désormais de *prendre des mesures pour développer* la maîtrise de l'IA et précise qu'il n'exige pas un niveau donné par personne. Le site prend le contre-pied avec une position exacte, ce qui le rend plus crédible.
- **Preuves faibles.** Logos, étoiles, « +50 entreprises », rarement une étude de cas avec situation, action, chiffre et méthode de mesure.
- **Tics visuels fréquents** : texte en dégradé violet-cyan et fond « constellation » (Auratech), titres tout en capitales italiques et photo de banque d'images avec cartes flottantes (NWI), fenêtre surgissante dès l'arrivée et bulle de discussion (Skipia), titres en graisse 700 à 900 sur la moitié des sites.
- **Ce qui marche chez eux et a été repris** : bandeau d'indicateurs de satisfaction (Meteor), promesse de délai court (« moins de deux semaines »), phrases courtes et factuelles (Skipia : « 2 ou 5 jours. Six places max. »), données structurées Course et FAQPage.

### Marché français (sources)

- 55 % des TPE-PME utilisent l'IA générative fin 2025, contre 31 % un an plus tôt ([Bpifrance Le Lab, via IT Social](https://itsocial.fr/contenus/actualites/intelligence-artificielle-actualites-contenus/bpifrance-constate-un-basculement-des-usages-avec-55-des-tpe-pme-utilisatrices-dia-generative-fin-2025/)).
- 80 % des dirigeants utilisent l'IA générative chaque semaine, 55 % des collaborateurs de TPE, et 61 % des utilisateurs passent par un compte personnel au moins une fois par semaine ([Microsoft France et YouGov, janvier 2026](https://news.microsoft.com/source/emea/2026/02/etude-microsoft-france-lusage-de-lia-progresse-dans-les-entreprises-francaises-mais-se-heurte-a-un-manque-daccompagnement/?lang=fr)).
- Article 4 de l'AI Act réécrit par le [règlement (UE) 2026/1744](https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=OJ:L_202601744) : « prennent des mesures pour favoriser le développement de la maîtrise de l'IA » ; « cette obligation ne contraint pas [...] à garantir un niveau spécifique de maîtrise de l'IA par un individu ».
- Budget du plan de développement des compétences des moins de 50 salariés : 521 M€ en 2026, en légère baisse ([CPFormation, budget France compétences 2026](https://cpformation.com/budget-2026-de-france-competences-un-excedent-inedit-qui-masque-une-contraction-historique-des-financements/)). D'où le conseil de déposer tôt, dans la FAQ.
- Dust : hébergement au choix en Europe ou aux États-Unis, aucune donnée utilisée pour l'entraînement, conformité RGPD et SOC 2 ([page sécurité de Dust](https://dust.tt/home/security)).
- Mistral : « Le Chat is now Vibe ». Hors offre Enterprise, les données servent à l'entraînement tant que l'administrateur ne le désactive pas ; l'offre Enterprise est exclue par défaut et peut être déployée sur site ([page produit](https://mistral.ai/products/vibe/), [aide Mistral sur l'entraînement](https://help.mistral.ai/en/articles/347617-do-you-use-my-user-data-to-train-your-artificial-intelligence-models)). Plusieurs concurrents parlent encore de « Le Chat ».
- Copilot reste le point de départ naturel des entreprises déjà sous Microsoft 365.

Conclusion retenue pour un consultant français : parler de Copilot (déjà payé, peu utilisé), de Mistral et Dust (données sensibles), de la charte d'usage et du RGPD, et traiter l'AI Act avec exactitude. Un site américain équivalent n'aurait eu besoin d'aucun de ces sujets.

### Références de qualité d'exécution

Mesures relevées dans le navigateur sur Linear, Vercel, Rauno Freiberg et Emil Kowalski : graisse 400 très majoritaire, titres à 400-510, interlettrage autour de −0,022 em, transitions de 100 à 160 ms avec courbes sur mesure, une seule ombre ou aucune. Le site suit ces valeurs.

## Tics « générés par IA » évités

Visuels : pas de dégradé violet-bleu, pas de texte en dégradé, pas de glassmorphism, pas de fond à particules ou constellation, pas de robot ni de cerveau lumineux, pas d'emoji comme icône, pas de trois cartes identiques à icône ronde, pas de badge pilule au-dessus du titre, pas de titre en graisse 700 ou plus, une seule ombre dans tout le système, un seul accent de couleur, pas de photo de banque d'images.

Mouvement : une seule entrée marquante (le titre et la démo du hero), le reste en révélations discrètes de 320 ms ; aucun texte à lire n'est caché en attendant une animation ; pas de fenêtre surgissante, pas de bulle de discussion, pas de carrousel automatique ; tout s'arrête si le système demande de réduire les animations.

Texte : pas de « boostez », « libérez le potentiel », « dans un monde où », pas d'antithèse « ce n'est pas X, c'est Y », pas de cadratin, des chiffres précis avec leur source, typographie française (espaces insécables, guillemets « », apostrophes typographiques), un avis volontairement nuancé parmi les autres.

## Bonnes pratiques appliquées

- **Conversion** : promesse chiffrée dans le titre, un seul appel à l'action répété, prix affichés, garantie écrite (« je continue sans facturer »), objections traitées en FAQ, agenda intégré à trois champs, bouton d'appel fixe sur mobile qui disparaît sur la section de réservation.
- **Qualiopi** : mention exacte de la catégorie d'action, numéro de déclaration d'activité avec « ne vaut pas agrément de l'État », programme détaillé (objectifs, prérequis, évaluation, délai d'accès, accessibilité et référente handicap), indicateurs de résultats publiés.
- **SEO** : balises title et description, Open Graph avec image, URL canoniques, sitemap, robots, données structurées ProfessionalService, Person, WebSite, FAQPage et Course. Pas d'AggregateRating : Google n'affiche pas les notes qu'une entreprise publie sur elle-même.
- **Référencement par les IA (GEO)** : statistiques datées avec leurs sources, entité claire (nom, métier, lieu, offre), réponses factuelles en questions-réponses, contenu entièrement présent dans le HTML.
- **RGPD** : aucun cookie ni traceur, polices auto-hébergées (aucun appel à Google Fonts), formulaire avec information sur la durée de conservation, politique de confidentialité complète.
- **Accessibilité** : navigation complète au clavier, focus visible, lien d'évitement, contrastes calculés (texte 16,7:1, accent 6:1, bordures de champ au-dessus de 3:1), erreurs de formulaire en texte avec focus sur la première, annonces pour lecteurs d'écran.

## Audit et coupe (26 septembre 2026)

Audit Impeccable en double évaluation (revue design et marketing, détecteur automatique). Note Nielsen 23/32. Constat principal : la page était trop longue, surtout parce que la même histoire y revenait quatre fois et que les preuves n'arrivaient qu'à 46 % de la hauteur.

Corrections appliquées :
- Nouvel ordre : hero, logos, résultats avec trois avis, offres et jalons, calcul, données, à propos, FAQ, rendez-vous.
- Suppression de la section de statistiques générales. La carte des tâches, le déroulé détaillé, le choix d'outil et le texte sur l'AI Act passent sur la page Méthode.
- Emplacement de portrait prêt dans l'À propos et à côté de l'agenda (`assets/img/portrait.svg`, à remplacer).
- Textes secondaires portés à 14 px minimum, cibles tactiles à 44 px, bouton du calculateur contrasté.
- Calculateur cohérent avec la promesse (16 h par semaine × 25 % = 4 h), coût calculé par groupe.
- Libellés corrigés (« PME de 10 à 250 salariés », champ entreprise, période de l'agenda).

Longueur de la page d'accueil : 14 788 px → 9 900 px sur ordinateur (16,4 → 11 écrans), 22 423 px → 14 600 px sur mobile, 2 576 → 1 618 mots.

## Résultats mesurés

Lighthouse, profil mobile, après la coupe : performance 99, accessibilité 100, bonnes pratiques 100, SEO 100, sur l'accueil comme sur la page Méthode. LCP 2,1 s, CLS 0. Aucun débordement horizontal en 1440, 768 et 390 px. Tests automatisés passés sur la prise de rendez-vous (erreurs, succès, fichier agenda), le calculateur, les onglets au clavier, le choix d'outil, la carte des tâches, le menu mobile et le mode animations réduites.

## Tout ce qui est fictif, à remplacer avant la mise en ligne

Publier ces éléments tels quels serait trompeur : de faux avis ou de fausses études de cas constituent une pratique commerciale trompeuse au sens du Code de la consommation.

- Identité : Élise Garnier, son parcours, l'adresse rue de la Fosse, le domaine elisegarnier.fr, l'adresse e-mail, le profil LinkedIn.
- Numéros : SIRET, TVA, déclaration d'activité 52 44 09876 44. Le téléphone 02 61 91 42 17 est fictif, choisi dans une plage que l'Arcep réserve à la fiction.
- Entreprises clientes (Le Goff Menuiseries, Arvor Expertise, Transports Mauduit, Kerlann, Ouest Climatique, Hélios Santé, Atelier Poulain, Socomat), leurs chiffres et leurs citations.
- Les six avis de stagiaires et les indicateurs 2025 (612 personnes formées, 4,8/5, 97 %, 89 %, 98 %).
- Le gain médian de 4 heures par semaine et les tarifs.
- La certification Qualiopi : n'afficher la mention et le logo qu'avec un certificat valide, en respectant la charte d'usage de la marque.
- Hébergeur indiqué dans les mentions légales (OVH) : à aligner sur l'hébergeur réel.

Les statistiques de marché (Bpifrance, Microsoft, France compétences) et le texte de l'article 4 ont été vérifiés directement sur les pages sources. Les éléments sur Mistral et Dust ont été vérifiés sur les pages des éditeurs.

## Brancher la prise de rendez-vous

Le formulaire fonctionne sans serveur : il confirme le créneau et génère un fichier agenda (.ics). Pour recevoir réellement les demandes, ajouter l'adresse d'un service de réception sur le bloc `#sched` :

```html
<div class="sched" id="sched" data-endpoint="https://votre-service/rdv">
```

Le script envoie alors en POST un JSON `{name, email, organization, start}`. Pour rester dans l'Union européenne, privilégier un outil hébergé en Europe ou un Cal.com auto-hébergé plutôt que Calendly.

## Photos

Le site n'utilise volontairement aucune photo de banque d'images : c'est l'un des signes les plus visibles d'un site générique. Les visuels sont construits en code (démo animée, carte des tâches, tableau d'atelier dessiné, charte d'usage). Un portrait réel est indispensable : remplacer `assets/img/portrait.svg` par une photo (960 × 1200, noir et blanc légèrement contrasté) ; elle apparaît dans l'À propos et en vignette à côté de l'agenda.
