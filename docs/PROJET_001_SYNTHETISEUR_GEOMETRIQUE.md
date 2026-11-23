# LE PROJET QUI N'EXISTE PAS
## Fiche projet 001 — Le Synthétiseur Géométrique

**L'Arche — Laboratoire ludique et scientifique**  
**Statut :** concept exploratoire sérieux  
**Version :** 0.1 — 24 novembre 2026  
**Formats envisagés :** prototype de l'Arche, expérience web, atelier, installation muséale

## 1. Vision

Créer un instrument interactif permettant à tout le monde, enfants comme adultes, de jouer avec des objets mathématiques et géométriques complexes **sans connaissance préalable des équations**.

Une console inspirée d'un synthétiseur à potentiomètres et séquenceur pilote des formes projetées en temps réel : fractales tridimensionnelles, représentations de variétés de Calabi-Yau, simulation du roulement d'un oloïde et, à terme, compositions hybrides.

**Principe fondateur : jouer d'abord, comprendre ensuite.**

## 2. L'expérience

1. **Découvrir :** « Tourne un bouton. Regarde ce qui se passe. »
2. **Expérimenter :** modifier librement les paramètres, explorer des symétries, changements d'échelle, mouvements et transformations.
3. **Composer :** produire une séquence de formes et éventuellement sauvegarder ou exporter sa création.
4. **Comprendre :** découvrir, après l'expérience, ce que l'on vient de manipuler et pourquoi certains comportements sont étonnants.

L'installation doit laisser la place au jeu libre et à la curiosité, sans transformer la première rencontre en cours magistral.

## 3. Console — le « TD-3 géométrique »

Une interface physique inspirée des instruments de musique électronique :

- 8 à 16 potentiomètres, avec affectation selon le module ;
- boutons pour sélectionner les familles d'objets et les modes d'affichage ;
- séquenceur de transformations ;
- commandes possibles de rotation, torsion, échelle, densité, vitesse, itérations et couleur ;
- remise à zéro simple et visible ;
- option de synchronisation avec un univers sonore, désactivable.

**Exigence essentielle :** les commandes influencent réellement des paramètres géométriques ou des simulations, plutôt que de ne déclencher que des vidéos préfabriquées. Les effets présentés comme scientifiques doivent rester fidèles aux objets concernés.

## 4. Modules de découverte

### A — Fractales

Explorer des structures fractales 2D/3D, leurs niveaux de détail, itérations, symétries et changements de paramètres. Exemple de terrain de jeu : fractales tridimensionnelles rendues avec un moteur adapté.

**Question possible :** comment une règle répétée engendre-t-elle une telle complexité ?

### B — Représentations de Calabi-Yau

Manipuler une **représentation**, une coupe ou une projection d'une variété de Calabi-Yau, selon une méthode mathématiquement documentée. Il ne s'agit pas de montrer directement une variété de dimension supérieure dans son intégralité.

**Question possible :** comment représenter visuellement quelque chose qui dépasse nos trois dimensions spatiales habituelles ?

### C — Oloïde simulé

Observer un oloïde en roulement et explorer la relation entre sa géométrie, ses points de contact et son mouvement. Une version d'exposition pourrait juxtaposer l'objet physique et sa simulation.

**Question possible :** pourquoi cette forme roule-t-elle de cette façon ?

### D — Laboratoire expérimental (piste ultérieure)

Étudier des correspondances entre motifs ANSI produits avec Moebius, textures, paramètres fractals et géométries génératives. Cette piste est **artistique et exploratoire**, sans supposer qu'une importation directe dans Mandelbulber existe déjà.

## 5. Message de sortie proposé

> **Salut !**
>
> Tu viens de jouer avec des fractales, une représentation de variété de Calabi-Yau et un oloïde simulé en mouvement.
>
> Tu n'avais pas besoin de connaître leurs équations pour commencer à les explorer.
>
> Tu as peut-être repéré une symétrie, une répétition ou un mouvement surprenant. C'est une excellente question de départ pour les sciences.
>
> **Tu as joué avec des mathématiques. Maintenant, tu peux découvrir pourquoi ça fonctionne.**

## 6. Architecture technique — pistes, non décisions

| Élément | Rôle possible | Point à vérifier |
|---|---|---|
| Blender | Modèles et prototypes visuels | Intégration avec rendu interactif |
| Mandelbulber | Génération de fractales 3D | Pilotage externe et latence de rendu |
| MuJoCo ou autre moteur physique | Simulation mécanique | Modèle fiable du roulement de l'oloïde |
| Moteur graphique temps réel | Affichage, interactions, projection | Performances et stabilité |
| Console MIDI existante | Prototype de commandes physiques | Correspondance paramètres / contrôles |
| Microcontrôleur | Console dédiée ultérieure | Robustesse et maintenance |
| Moebius | Motifs ANSI et expérimentations visuelles | Transformation en paramètres ou textures |

Le **MPK Mini mk3** peut constituer une première interface de test disponible à l'Arche ; une console spécialement conçue viendrait éventuellement plus tard. La TD-3 sert ici d'inspiration ergonomique et créative, pas de cahier des charges matériel.

Privilégier, si faisable, logiciels libres, formats ouverts, documentation et reproductibilité.

## 7. Accessibilité et médiation

- Aucun prérequis mathématique.
- Effet des commandes immédiatement perceptible.
- Explications facultatives, progressives et disponibles après l'exploration.
- Utilisation possible sans son ; contrôle de la luminosité et du mouvement.
- Contrastes lisibles et modes adaptés aux différentes sensibilités visuelles.
- Commandes accessibles, repères clairs, retour à l'état initial facile.
- Pas de compte ni de collecte de données personnelles nécessaires pour jouer.
- En installation publique, prévoir résistance du matériel et gestion des files d'attente sans pénaliser inutilement l'exploration.

## 8. Public et contextes

- Enfants et adolescents curieux ; adultes sans formation technique.
- Musées scientifiques et centres de culture scientifique.
- Ateliers de médiation, fablabs, événements associatifs.
- Utilisation ludique et expérimentale au sein de l'Arche.
- Version web pour une découverte à distance.

## 9. Plan exploratoire

**P0 — Preuve du plaisir d'interaction**  
Un contrôleur existant, un ordinateur, une famille de formes fractales et quelques paramètres réellement manipulables. Vérifier les sensations de jeu et les limites de latence.

**P1 — Deuxième univers**  
Ajouter l'oloïde simulé ou une visualisation de Calabi-Yau soigneusement définie ; tester les différences entre familles d'objets.

**P2 — Prototype de médiation**  
Intégrer la note explicative finale, une sélection de questions scientifiques et une interface accessible.

**P3 — Expériences publiques**  
Observer des essais volontaires : exploration spontanée, questions suscitées, compréhension du lien entre commandes et comportements.

**P4 — Déclinaisons**  
Évaluer séparément la version web et la console muséale avec projection immersive.

Aucune date ni dépense n'est engagée à ce stade.

## 10. Risques et points de vigilance

- Éviter les représentations trompeuses de mathématiques de dimension supérieure.
- Ne pas confondre simulation exacte, approximation numérique et création visuelle artistique.
- Mesurer la réactivité de chaque moteur avant de choisir l'architecture.
- Documenter les licences et dépendances avant toute diffusion.
- Éviter qu'une complexité technique excessive ne compromette l'expérience simple et ludique.

## 11. Hypothèse pédagogique à éprouver

Une exploration libre, sensorielle et interactive pourrait inciter les visiteurs à formuler des questions sur des objets mathématiques qu'ils n'auraient pas spontanément abordés. Cette hypothèse doit être testée plutôt que tenue pour acquise.

**Critères possibles :** plaisir de manipulation, diversité d'exploration, questions formulées et intérêt à poursuivre la découverte.

## 12. Décisions et idées à conserver

- **Nom du dossier :** *Le Projet qui n'existe pas*.
- **Nom de travail de l'installation :** *Le Synthétiseur Géométrique* / *TD-3 géométrique*.
- **Ordre pédagogique :** manipulation → étonnement → explication.
- **Trois premières familles :** fractales, représentations de Calabi-Yau, oloïde.
- **Double perspective :** jeu de l'Arche et installation scientifique publique.
- **Piste artistique :** motifs ANSI de Moebius couplés à un univers fractal, à étudier.

---

### FOX NOTES 🦊

> « Trois nuits de Bonzai Records dans les AKG K240 et les potentiomètres auront probablement découvert une dimension supplémentaire. »

**L'Arche — Département des projets qui n'existent pas encore.**
