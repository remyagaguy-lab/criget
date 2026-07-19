# Cahier des charges — Site web vitrine CRIGET-CS

*Document produit par un consortium de 7 experts (AMO digital, stratège de marque/UX writer, UX/UI designer, architecte web Cloudflare, expert SEO/accessibilité, expert cybersécurité/conformité, consultant relations B2G/B2NGO). Prêt à être transmis à un développeur ou une agence.*

**Périmètre validé avec le client :** budget élevé (>15 000 € ou à définir sur devis) · délai urgent (mise en ligne sous 1 mois) · espace actualités/blog souhaité, avec publication régulière.

---

## Table des matières

0. [Arbitrages stratégiques](#0-arbitrages-stratégiques-synthèse-des-débats-dexperts)
1. [Résumé exécutif](#1-résumé-exécutif)
2. [Cibles & personas](#2-cibles--personas)
3. [Positionnement & message clé](#3-positionnement--message-clé)
4. [Arborescence du site](#4-arborescence-du-site-sitemap)
5. [Structure détaillée des pages clés](#5-structure-détaillée-des-pages-clés)
6. [Direction artistique & charte graphique](#6-direction-artistique--charte-graphique)
7. [Ligne éditoriale](#7-ligne-éditoriale)
8. [Fonctionnalités](#8-fonctionnalités)
9. [Architecture technique](#9-architecture-technique)
10. [SEO & performance](#10-seo--performance)
11. [Accessibilité](#11-accessibilité)
12. [Sécurité & conformité](#12-sécurité--conformité)
13. [Plan de contenu initial](#13-plan-de-contenu-initial)
14. [Budget & ressources](#14-budget--ressources)
15. [Planning de réalisation](#15-planning-de-réalisation)
16. [KPIs de succès](#16-kpis-de-succès)

---

## 0. Arbitrages stratégiques (synthèse des débats d'experts)

Le brief identifiait quatre points de friction prévisibles. Le consortium y ajoute un cinquième, soulevé par l'AMO à la lecture des contraintes de délai. Pour chacun, voici le débat en bref et la décision retenue.

| # | Point de friction | Décision arbitrée | Justification courte |
|---|---|---|---|
| 1 | Minimalisme visuel vs richesse institutionnelle attendue par les bailleurs | **Minimalisme en surface, richesse en profondeur** (progressive disclosure) | L'accueil reste épuré ; chaque page DAS et la page Réalisations portent la preuve détaillée. Le minimalisme est une question de hiérarchie, pas de suppression de contenu. |
| 2 | Carte interactive SIG vs simplicité/coût | **Reportée en Phase 2**, mais l'architecture est conçue pour l'accueillir | Une carte interactive bien faite (Leaflet + GeoJSON) demande un cycle de dev/QA incompatible avec un délai de 4 semaines sans dégrader le reste du site. Le budget le permettrait, le délai non. |
| 3 | Statique pur vs back-office éditable | **CMS headless (Sanity.io)** branché sur Cloudflare Pages via webhook de build | Le client a confirmé vouloir publier des actualités régulièrement : un site 100 % statique sans interface d'édition serait un frein opérationnel dès le mois 2. Sanity offre un onboarding plus rapide qu'un CMS git-based (Decap) pour un profil non technique, ce qui compte vu l'urgence. |
| 4 | Site unique multi-DAS vs dilution du message | **Un seul site, architecture "hub and spoke"** | L'accueil est un hub court qui renvoie vers 4 pages DAS totalement autonomes, chacune avec son propre message, ses preuves et son call-to-action. Aucun mélange des messages sur une même page. |
| 5 | Délai urgent (<1 mois) vs périmètre ambitieux (multilingue, CMS, SEO, accessibilité, conformité marchés publics) | **Lancement en 2 phases** | Phase 1 (4 semaines) : site FR complet et solide sur les fondamentaux. Phase 2 (mois 2-3) : version anglaise, carte SIG, approfondissement SEO/accessibilité, newsletter. Mieux vaut un périmètre réduit mais fini qu'un périmètre complet mais bâclé. |

---

## 1. Résumé exécutif

CRIGET-CS est un cabinet togolais fondé en 2016, structuré autour de 4 Domaines d'Activités Stratégiques (Ingénierie-Conseil, Géomatique, Recherche & Développement, Formation) et positionné comme partenaire du développement durable en Afrique. Son site vitrine doit remplir un rôle précis : **installer la confiance auprès d'interlocuteurs qui évaluent la crédibilité d'un cabinet avant de le contacter** — États, collectivités, PTF, bailleurs, ONG, entreprises.

Le site sera hébergé sur Cloudflare Pages (JAMstack), en français au lancement, avec une architecture pensée pour recevoir une version anglaise et une carte SIG interactive en phase 2. Il reposera sur un CMS headless permettant au client de publier lui-même ses actualités, un point non négociable compte tenu du besoin de publication régulière confirmé.

Compte tenu du délai de mise en ligne sous un mois, le consortium recommande un lancement en deux temps : une Phase 1 fonctionnelle et soignée sous 4 semaines, suivie d'enrichissements en Phase 2. Le facteur de risque principal identifié n'est pas technique mais logistique : à ce jour, seul le logo est disponible comme contenu existant — la fourniture rapide de photos et de données de réalisations par le client conditionne la tenue du planning (voir section 13).

---

## 2. Cibles & personas

### Persona A — Le décideur public (agent de l'État, collectivité)
**Vient chercher :** la preuve d'une compétence mobilisable sur marché public — références de projets similaires, capacité à répondre à un appel d'offres, statut juridique clair, coordonnées directes.
**CTA prioritaire :** téléchargement de la plaquette institutionnelle / prise de contact directe.

### Persona B — Le bailleur / PTF (chargé de programme, fondation)
**Vient chercher :** la crédibilité scientifique et la rigueur méthodologique — publications, partenariats universitaires (DAS3), gouvernance du cabinet, track record vérifiable.
**CTA prioritaire :** consultation des publications / prise de contact pour un partenariat.

### Persona C — L'ONG ou association
**Vient chercher :** une offre de formation adaptée à des équipes terrain (DAS4) — catalogue, formats, tarifs indicatifs, capacité d'intervention en milieu rural.
**CTA prioritaire :** consultation du catalogue de formations / demande de formation sur mesure.

### Persona D — L'entreprise privée
**Vient chercher :** une prestation ponctuelle et réactive — géomatique (DAS2) ou étude d'impact réglementaire (DAS1), avec une demande de devis rapide.
**CTA prioritaire :** demande de devis directe depuis la page DAS concernée.

---

## 3. Positionnement & message clé

**Proposition de valeur globale :**
Une expertise togolaise de terrain, doublée d'une rigueur scientifique, au service du développement durable en Afrique.

**Message par DAS** (à affiner en atelier rédactionnel avec le client, ces formulations sont des propositions de départ) :

- **DAS 1 — Ingénierie-Conseil :** des études qui tiennent la route sur le terrain et devant les bailleurs.
- **DAS 2 — Géomatique :** la donnée géospatiale au service de vos décisions territoriales.
- **DAS 3 — R&D Appliqué :** une recherche appliquée, publiée, qui nourrit l'action.
- **DAS 4 — Formation :** transférer nos compétences pour multiplier l'impact.

---

## 4. Arborescence du site (sitemap)

```
Accueil
├── Nos expertises (menu déroulant)
│   ├── DAS 1 — Ingénierie-Conseil Environnement & Territoire
│   ├── DAS 2 — Géomatique & Intelligence Territoriale
│   ├── DAS 3 — Recherche & Développement Appliqué
│   └── DAS 4 — Formation & Transfert de Connaissances
├── Réalisations / Références (filtrable par DAS)
├── Actualités
├── À propos / Équipe
└── Contact

Footer : Mentions légales · Politique de confidentialité · Coordonnées
```

**Logique de navigation :** menu principal court (6 entrées max) ; le bouton "Nous contacter" est visuellement distinct du reste de la navigation (traité comme CTA, pas comme lien de menu classique) pour rester accessible depuis toutes les pages.

---

## 5. Structure détaillée des pages clés

### Accueil
- **Objectif :** orienter chaque visiteur vers son DAS ou son contenu d'intérêt en moins de 10 secondes.
- **Contenu attendu :** hero (slogan + mission en une phrase), quatre blocs DAS de poids visuel égal (icône + titre + phrase + lien), bandeau de confiance (année de création, zones d'intervention, chiffres clés), extrait des 2-3 dernières actualités, bloc contact.
- **CTA :** "Découvrir nos expertises" + "Nous contacter".

### Page DAS 1 — Ingénierie-Conseil Environnement & Territoire
- **Objectif :** convaincre décideurs publics et bailleurs de la rigueur méthodologique.
- **Contenu attendu :** description des activités (études environnementales, foresterie/REDD+, changement climatique, planification territoriale), méthodologie en étapes, 2-3 réalisations types, typologie de clients.
- **CTA :** "Discuter d'un projet" / demande de devis.

### Page DAS 2 — Géomatique & Intelligence Territoriale
- **Objectif :** convaincre un client technique que ce DAS se suffit à lui-même.
- **Contenu attendu :** services (cartographie, drones, télédétection, ArcGIS/QGIS), exemples de livrables (captures de cartes/rendus), équipements et logiciels maîtrisés.
- **CTA :** "Discuter de vos besoins géomatiques".

### Page DAS 3 — Recherche & Développement Appliqué
- **Objectif :** asseoir la crédibilité académique auprès des bailleurs.
- **Contenu attendu :** axes de recherche, publications et références, partenariats universitaires, projets financés.
- **CTA :** "Consulter nos publications" / "Proposer un partenariat".

### Page DAS 4 — Formation & Transfert de Connaissances
- **Objectif :** convertir ONG, agents de l'État et étudiants en demandes de formation.
- **Contenu attendu :** catalogue de formations, formats (présentiel/à distance), publics visés, certification, calendrier.
- **CTA :** "Consulter le catalogue" / "Demander une formation sur mesure".

### À propos / Équipe
- **Objectif :** humaniser et légitimer le cabinet.
- **Contenu attendu :** historique (fondation 2016), mission, valeurs, statut juridique (SARL), présentation de l'équipe.
- **CTA :** lien vers Contact.

### Réalisations / Références
- **Objectif :** apporter la preuve sociale, filtrable par DAS pour rester pertinent pour chaque persona.
- **Contenu attendu :** fiches projet (contexte, actions menées, résultats, client si autorisé).
- **CTA :** lien vers la page DAS correspondante.

### Actualités
- **Objectif :** démontrer une activité continue — un signal de vitalité important pour rassurer les bailleurs.
- **Contenu attendu :** articles gérés via CMS (annonces de projets, publications, participations à des événements).
- **CTA :** inscription newsletter (Phase 2).

### Contact
- **Objectif :** convertir, sans friction, quel que soit le persona.
- **Contenu attendu :** formulaire (nom, organisation, e-mail, DAS concerné, message), coordonnées, adresse, mention RGPD.
- **CTA :** envoi du formulaire.

---

## 6. Direction artistique & charte graphique

**Palette :** ancrage environnement et territoire togolais — verts profonds et ocre/terre en couleurs dominantes, complétés d'un anthracite ou bleu nuit pour la sobriété institutionnelle attendue par des bailleurs, et d'une touche d'accent chaleureuse (jaune ou orange) réservée aux CTA.

**Typographie :** une sans-serif géométrique pour les titres (forte présence, moderne, sans être froide) associée à une sans-serif humaniste très lisible pour le texte courant (type Inter ou IBM Plex Sans). Deux familles maximum.

**Style d'image :** photographie de terrain réelle en priorité — pas de banque d'images générique, qui nuirait à la crédibilité recherchée. Tant que peu de visuels réels sont disponibles, un traitement duotone cohérent avec la palette permet d'unifier des photos hétérogènes. Iconographie linéaire minimaliste pour représenter chaque DAS.

**Principes du minimalisme retenu :** espace négatif généreux, grille claire, hiérarchie typographique limitée à 2-3 niveaux, peu de couleurs actives simultanément, micro-interactions discrètes plutôt que décoratives.

---

## 7. Ligne éditoriale

**Ton :** expert, rassurant, factuel — jamais promotionnel au sens "startup". Institutionnel sans être rigide.

**Longueur :** phrases courtes, paragraphes de 3-4 lignes maximum, listes à puces pour toute méthodologie ou étape de processus.

**Vocabulaire à privilégier :** expertise, rigueur, impact, partenaire, territoire, durable, terrain.

**Vocabulaire à éviter :** anglicismes marketing creux ("disruptif", "game changer"), superlatifs non étayés ("le meilleur", "leader incontesté") — leur préférer une preuve factuelle datée et chiffrée.

---

## 8. Fonctionnalités

| Fonctionnalité | Statut | Détail |
|---|---|---|
| Formulaire de contact sécurisé | Phase 1 | Cloudflare Turnstile anti-spam + envoi via Worker vers service e-mail transactionnel |
| Multilingue FR (+ EN) | FR en Phase 1, EN en Phase 2 | Structure de routing i18n statique prévue dès le départ pour éviter une refonte |
| Téléchargement de documents | Phase 1 | Plaquette institutionnelle et rapports publics stockés sur R2 |
| Actualités / Blog | Phase 1 | Piloté par CMS headless (voir arbitrage #3) |
| Filtrage des réalisations par DAS | Phase 1 | Filtre simple côté client, sans base de données |
| Carte interactive des projets (SIG) | Phase 2 | Voir arbitrage #2 |
| Newsletter | Phase 2 | Formulaire simple + service tiers, pas de développement lourd |

---

## 9. Architecture technique

- **Hébergement :** Cloudflare Pages, conformément à la contrainte non négociable (pas de serveur PHP/WordPress classique).
- **Générateur de site :** Astro recommandé — build rapide, empreinte JS minimale, bon support i18n natif, cohérent avec l'exigence de performance et le délai serré.
- **CMS headless :** Sanity.io. Interface d'édition prête à l'emploi (pas de configuration serveur), webhook déclenchant automatiquement un nouveau build Cloudflare Pages à chaque publication d'actualité.
- **Formulaires :** Cloudflare Workers + Turnstile, envoi vers un service e-mail transactionnel (type Resend).
- **Stockage documents :** Cloudflare R2 (plaquette PDF, rapports publics).
- **Cache / CDN :** natif Cloudflare, purge automatique déclenchée à chaque build.

---

## 10. SEO & performance

**Mots-clés stratégiques indicatifs par DAS** (à valider et enrichir avec le client) :

- DAS 1 : bureau d'études environnementales Togo, étude d'impact environnemental Afrique de l'Ouest, REDD+ Togo, planification territoriale Togo.
- DAS 2 : cabinet géomatique Togo, cartographie SIG Afrique, drone cartographie Togo.
- DAS 3 : recherche appliquée environnement Afrique, publications scientifiques REDD+.
- DAS 4 : formation gestion environnementale Togo, formation SIG Afrique de l'Ouest.

**Données structurées :** schema.org `Organization`, `LocalBusiness` (siège social), `Article` pour chaque actualité, `BreadcrumbList` sur les pages profondes.

**Objectifs Core Web Vitals :** LCP < 2,5 s, CLS < 0,1, INP < 200 ms — atteignables nativement grâce à l'architecture statique, sous réserve d'une optimisation systématique des images (WebP/AVIF, lazy loading).

---

## 11. Accessibilité

**Niveau visé :** WCAG 2.1 AA — un standard cohérent pour un site institutionnel visant des bailleurs internationaux, dont certains valorisent explicitement l'accessibilité dans leurs critères.

**Points de vigilance :**
- Contraste des couleurs à tester spécifiquement sur la palette verte/terre retenue.
- Navigation complète au clavier.
- Texte alternatif systématique, en particulier sur les visuels de cartes et graphiques.
- Labels explicites sur tous les champs de formulaire.
- Hiérarchie de titres cohérente sur chaque page (un seul H1).

Un audit d'accessibilité complet est prévu en Phase 2 ; la Phase 1 couvre les fondamentaux ci-dessus.

---

## 12. Sécurité & conformité

**RGPD :**
- Bandeau de consentement si un outil d'analytics tiers est utilisé.
- Politique de confidentialité claire et accessible depuis le footer.
- Case de consentement explicite sur le formulaire de contact, durée de conservation des données précisée, point de contact dédié pour les demandes d'accès/suppression.

**Exigences marchés publics :**
- Mentions légales complètes (n° RCCM, statut SARL, siège social) sur une page dédiée.
- Documents administratifs téléchargeables si le client le souhaite (agréments, références).

**Sécurité des formulaires :**
- Cloudflare Turnstile contre le spam automatisé.
- Validation côté serveur (Worker), aucune donnée sensible stockée côté client.
- HTTPS natif via Cloudflare.

---

## 13. Plan de contenu initial

| Contenu | Responsable | Note |
|---|---|---|
| Textes institutionnels (mission, historique, valeurs) | Client fournit la matière → Prestataire réécrit pour le web | Base déjà disponible dans les documents transmis |
| Description détaillée des 4 DAS | Client fournit la matière → Prestataire réécrit | Base déjà disponible |
| Fiches réalisations (2-3 par DAS minimum) | Client fournit les données factuelles → Prestataire rédige | **Élément bloquant potentiel** |
| Photos terrain / équipe | Client | **Point de vigilance prioritaire** — à ce jour, seul le logo est disponible |
| Plaquette institutionnelle PDF | Client ou Prestataire selon existant | À clarifier en semaine 1 |
| 2-3 premiers articles d'actualité (pour ne pas lancer un blog vide) | Client + Prestataire | — |
| Mentions légales / politique de confidentialité | Prestataire (rédaction) + validation juridique Client | — |

> **Point d'alerte du consortium :** vu le délai d'un mois et l'absence actuelle de tout visuel autre que le logo, la fourniture rapide de photos et de données de réalisations par le client est le facteur le plus critique pour tenir le planning. Ce point doit être traité en priorité absolue dès la semaine 1.

---

## 14. Budget & ressources

Estimation indicative pour un périmètre "élevé", à confirmer par devis détaillé de l'agence retenue :

| Poste | Fourchette indicative |
|---|---|
| Design (DA + maquettes desktop/mobile, 8 pages + système graphique) | 3 000 – 5 000 € |
| Développement (Astro + CMS + Workers/R2 + formulaires + structure i18n) | 6 000 – 9 000 € |
| Rédaction web des 8 pages + SEO on-page | 1 500 – 3 000 € |
| CMS (abonnement Sanity) | 0 – 200 €/mois (plan gratuit suffisant au démarrage) |
| Nom de domaine + Cloudflare | 15 – 30 €/an (hébergement Cloudflare Pages gratuit) |
| **Total indicatif Phase 1** | **≈ 11 000 – 17 000 €** |
| Phase 2 (version EN, carte SIG, SEO avancé, audit accessibilité) | à chiffrer séparément après livraison Phase 1 |

---

## 15. Planning de réalisation

Vu le délai contraint (<1 mois), la Phase 1 est découpée en 4 semaines :

- **Semaine 1 :** cadrage final, collecte prioritaire du contenu (photos, données de réalisations), validation de l'arborescence et des wireframes, choix définitif de la palette et de la typographie.
- **Semaine 2 :** maquettes UI (accueil + une page DAS type, validation rapide client), démarrage de l'intégration technique (setup Astro + Cloudflare Pages + Sanity).
- **Semaine 3 :** intégration des 8 pages, connexion du CMS, formulaire + Turnstile, premiers contrôles SEO/accessibilité.
- **Semaine 4 :** injection du contenu final, tests multi-appareils, contrôle qualité accessibilité de base, mise en ligne.

**Jalons :** validation arborescence (fin S1) · validation maquettes (fin S2) · recette technique (fin S3) · mise en ligne (fin S4).

**Phase 2 (mois 2-3) :** version anglaise, carte SIG interactive, structured data avancée, audit accessibilité complet, newsletter.

---

## 16. KPIs de succès

- Trafic qualifié : sessions issues de la recherche organique sur les mots-clés par DAS, part de trafic depuis les zones cibles (Afrique de l'Ouest, pays des bailleurs).
- Nombre de demandes de contact/devis via le formulaire, ventilées par DAS.
- Taux de téléchargement des documents (plaquette, rapports).
- Temps passé sur les pages DAS (indicateur d'intérêt réel, à distinguer du taux de rebond).
- Nombre d'abonnés à la newsletter (dès Phase 2).
- Core Web Vitals maintenus en production (LCP/CLS/INP).
- Score d'accessibilité (Lighthouse/axe) maintenu ≥ 90.

---

*Fin du document. Toute question de cadrage supplémentaire (visuels manquants, arbitrage budgétaire final, choix EN dès Phase 1) peut être adressée avant transmission à l'agence ou au développeur retenu.*
