# Le Projet qui n'existe pas 🦊

> **Statut :** officiellement inexistant ; une P0 expérimentale a néanmoins été observée en mouvement.
>
> **Objectif :** construire un synthétiseur géométrique pour jouer avec les mathématiques.
>
> **Prérequis :** curiosité.
>
> **Première version stable :** quand elle existera.

## Mais qu'est-ce que c'est ?

Un projet d'art génératif et de médiation scientifique porté par **l'Arche** : une console inspirée des synthétiseurs électroniques, avec des potentiomètres et des boutons qui transforment en temps réel des objets mathématiques projetés sur un écran ou dans une salle.

Au menu : **fractales 3D**, **représentations de variétés de Calabi-Yau**, **oloïde en mouvement** — et toutes sortes d'expériences géométriques encore à inventer.

**On joue d'abord. On comprend ensuite.** Pas besoin de maîtriser les équations différentielles pour tourner un potentiomètre.

## Le premier objet qui n'existe pas

**Le Synthétiseur Géométrique** : un peu de TD-3, un peu de laboratoire mathématique, un peu d'installation muséale.

- Une commande = une transformation visible.
- Des familles géométriques à explorer librement.
- Une explication accessible *après* l'expérience.
- Une version web envisagée, puis éventuellement une installation physique.

Lire la [fiche projet 001](docs/PROJET_001_SYNTHETISEUR_GEOMETRIQUE.md).

## État d'avancement

**Concept documenté + prototype P0 expérimental (Mandelbulb WebGL) ; aucune release stable ni date de sortie.**

Silus a réalisé une page HTML autonome utilisant un shader WebGL en *raymarching*. Le 24 novembre 2026, Kaëlys a confirmé sur Debian que la fractale s'affichait et réagissait aux curseurs, notamment aux transformations de puissance et de phase. Le navigateur a présenté une demande d'accès MIDI ; **le véritable contrôleur AKAI MPK Mini mk3 n'a pas encore été testé**. Le rendu et les paramètres extrêmes n'ont pas fait l'objet d'un contre-audit complet.

- [Ouvrir le prototype P0 (source HTML)](experiments/p0-mandelbulb/index.html)
- [Instructions et commandes — LISEZMOI](experiments/p0-mandelbulb/LISEZMOI.md)

**Exécution locale :** depuis `experiments/p0-mandelbulb/`, lancer `python3 -m http.server 8768 --bind 127.0.0.1`, puis ouvrir manuellement `http://127.0.0.1:8768/index.html` dans le navigateur.

Le code P0 est archivé tel que fourni par **Silus**, sans retouche du shader.

Les autres outils évoqués (Blender, Mandelbulber, MuJoCo, etc.) restent des pistes à évaluer, pas des composants intégrés à la P0.

## Participation

Les idées et questions sont bienvenues. Les modalités de contribution évolueront avec le projet.

## Licence

**Licence non encore choisie.** Le prototype est consultable publiquement pour documentation et évaluation, mais la publication du code ne vaut pas autorisation implicite de réutilisation, modification ou redistribution sous licence libre. Les conditions de licence devront être définies explicitement avec les contributeurs avant toute diffusion sous licence.

## Notes du Renard

Voir [`FOX_NOTES.md`](FOX_NOTES.md). Il nie toute responsabilité quant à l'existence du projet.

---

*« Ce projet n'existe pas. Toute contribution à son développement constitue une anomalie ontologique. »*
