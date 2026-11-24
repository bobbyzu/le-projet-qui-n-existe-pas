# La Cathédrale du Mandelbulb — P0

*Première expérience du Synthétiseur Géométrique, dans « Le Projet qui n'existe pas ».*

Une seule page, sans dépendance ni réseau : `index.html`.
Elle affiche un Mandelbulb calculé en temps réel (*ray marching* en WebGL).

## Lancer

Ouvrir `index.html` dans un navigateur. Pour le MIDI, il vaut mieux la servir en local :

```bash
cd p0 && python3 -m http.server 8768 --bind 127.0.0.1
```

puis ouvrir `http://localhost:8768/`.

## Commandes

| Bouton | MPK Mini mk3 | Effet |
|---|---|---|
| 1 | CC 70 | Puissance de la règle (2 à 12) |
| 2 | CC 71 | Itérations (2 à 16) |
| 3 | CC 72 | Inclinaison |
| 4 | CC 73 | Rotation |
| 5 | CC 74 | Distance |
| 6 | CC 75 | Couleur |
| 7 | CC 76 | Finesse du rendu |
| 8 | CC 77 | Phase : la forme se transforme de l'intérieur |
| Pad 1 | note 36 | Remise à zéro |
| Pad 2 | note 37 | Figer / animer |

Un autre contrôleur fonctionne aussi : ses boutons sont attribués dans l'ordre où on les tourne.

Clavier : `R` remise à zéro, `Espace` figer, `F` plein écran, `H` masquer la console.

## Notes

- Sans contrôleur, les curseurs à l'écran font la même chose.
- WebMIDI marche directement dans Chromium. Firefox demande une autorisation spéciale ; sinon, utiliser les curseurs.
- La résolution s'adapte toute seule à la puissance de la carte graphique.
- Au repos, plus rien n'est calculé : la carte graphique se repose aussi.
- Si le système demande de réduire les animations, la rotation automatique démarre arrêtée.
- Aucun compte, aucune donnée collectée, aucune requête réseau.