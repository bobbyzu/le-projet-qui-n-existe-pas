# Contre-audit P1-Nef

## Démarrage et vérifications automatisées

Depuis la racine de la copie du dépôt, lancer le serveur statique.

```sh
python3 -m http.server 8768 --bind 127.0.0.1 --directory experiments/p1-nef
```

Ouvrir `http://127.0.0.1:8768/`. Dans un autre terminal, exécuter les tests sans GPU avec Node.js 20 ou ultérieur.

```sh
node --test experiments/p1-nef/tests.mjs
```

Le contrôle Chromium est facultatif et utilise une installation existante de Playwright et Chromium. Laisser le serveur actif.

```sh
PLAYWRIGHT_MODULE=/chemin/vers/playwright CHROMIUM_BIN=/usr/bin/chromium \
  node experiments/p1-nef/browser-tests.mjs
```

Ajouter `NEF_CAPTURE_DIR=/chemin/vers/un/dossier` pour enregistrer deux vues à l’arrêt. Le trajet automatisé utilise un tampon de 80 × 50 px avec SwiftShader pour limiter le coût du rendu logiciel. Les captures en fenêtre de 800 × 500 px sont prises avec un tampon de 400 × 250 px. Les FPS obtenus ainsi servent à vérifier l’affichage du compteur.

## Firefox sous Debian sur Gibus / T14

| Critère | Procédure | Résultat attendu | État matériel |
|---|---|---|---|
| A1 | Vérifier le diff et le SHA-256 indiqués dans le rapport. Ouvrir la P0 et faire un contrôle rapide avec le MPK Mini mk3. | Les curseurs MIDI et les pads reset/pause se comportent comme sur la référence. | Non testé sur matériel |
| A2 | Ouvrir la P1 depuis le serveur statique. Ouvrir l’onglet Réseau de Firefox et recharger. | Motifs fractals visibles au démarrage, aucune requête externe ni erreur shader. | Non testé sur matériel |
| A3 | Désactiver la réduction des animations pour le trajet de référence. Cliquer sur la vue, maintenir ↑ environ 15 s, puis utiliser X. Tourner avec → pour observer la paroi, puis revenir à l’orientation initiale avec ←, ou refaire l’aller sans rotation. Maintenir ↓ environ 15 s, puis utiliser R. | Progression dans le passage, parois reconnaissables, retour vers la zone de départ, puis pose initiale exacte. Le temps de parcours augmente si le rendu descend au-dessous de 20 i/s. | Non testé sur matériel |
| A4 | Tester X en translation et tourner aussitôt. Utiliser P pendant une translation, relâcher la touche de mouvement, attendre, puis reprendre. Répéter X → P → P, puis P → R. Refaire avec Tab et Entrée sur les boutons. | Stop laisse tourner, Pause fige pose et scène, puis reprend à partir de la vitesse mémorisée. Après Stop, la vitesse reprise vaut zéro. Retour quitte la pause et rétablit pose et vitesse initiales. | Non testé sur matériel |
| A4 | Tester sur les deux dispositions, avec les flèches puis W/A/S/D physiques et Q/E physiques. Utiliser les flèches avec le focus sur la vue et tester un raccourci Firefox avec modificateur. | Les positions physiques produisent les mêmes effets. La vue ne défile pas. Les raccourcis Firefox avec modificateur restent disponibles. | Non testé sur matériel |
| A5 | À mi-parcours, maintenir ← et E physiques ensemble environ 0,7 s pour viser en bas à gauche, puis avancer vers la paroi jusqu’au message, puis reculer ou utiliser Retour départ. Maintenir ↑ pendant un changement d’onglet, relâcher et revenir. Répéter rapidement les commandes. Activer la réduction de mouvement et comparer. | Freinage ou arrêt à la paroi, retour possible, aucune touche bloquée au retour de focus, rotations et vitesse réduites si demandé. | Non testé sur matériel |
| A6 | Suivre le protocole ci-dessous. | Cible ≥ 20 i/s en parcours représentatif à 50 % fixe. Consigner l’écart et suspendre les ajouts si la cible manque. | Non testé sur matériel |

Le trajet nominal part de `(1,125 ; 1,125 ; −1,4)`, avec yaw et pitch à zéro, en direction de `+z`. Il vise `z ≈ 1,4` avant de revenir en reculant.

### Mesure A6

Cocher **Résolution fixe à 50 %**. Relever le modèle de GPU ou le moteur de rendu dans `about:support`, la version de Firefox, le mode d’alimentation, la taille de la fenêtre, le facteur de pixels et les dimensions effectives affichées par la page. Après un premier aller-retour d’échauffement, effectuer un nouvel aller-retour. Relever les FPS du compteur au moins toutes les deux secondes pendant les segments parcourus, avec l’heure ou le temps écoulé. Le compteur mesure les images dessinées sur des fenêtres d’au moins 750 ms. Consigner la durée totale en mouvement ainsi que le minimum, la médiane et les périodes sous 20 i/s. Écarter les arrêts entre les deux segments et consigner séparément un essai avec rotation vers la paroi. Laisser le navigateur au premier plan durant la mesure.

## Contrôle du diff et de la P0

```sh
git diff --check 2a05871303a4acb47fc5f2b2f2d963e763783cec HEAD
git diff --exit-code 2a05871303a4acb47fc5f2b2f2d963e763783cec HEAD -- experiments/p0-mandelbulb/
sha256sum experiments/p0-mandelbulb/index.html
```
