# P1-Nef — Rapport technique

Implémentation proposée pour le contre-audit Aël–Silus sur la branche locale `experiments/p1-nef`. Référence de départ `2a05871303a4acb47fc5f2b2f2d963e763783cec`. SHA-256 du fichier P0 au départ et après développement `96591c88844bf3dd293227273dd81aafea83f0e068187ecaaf6e9fe510a54c75`. Toutes les additions Git sont sous `experiments/p1-nef/`.

```sh
python3 -m http.server 8768 --bind 127.0.0.1 --directory experiments/p1-nef
```

Ouvrir `http://127.0.0.1:8768/`, puis cliquer sur la vue ou lui donner le focus avec Tab. Les flèches naviguent. L’aide de la page indique les touches physiques et les raccourcis. Voir [TESTS_P1_NEF.md](TESTS_P1_NEF.md) pour le trajet, les commandes de test et le protocole A6.

## Mandelbox et navigation

- Le preset applique un repliement de boîte à ±1, puis un repliement sphérique avec rayons carrés de 0,25 et 1. Chaque itération multiplie le point replié par l’échelle puis ajoute la position de l’échantillon. Le DE après 14 itérations divise la longueur du point transformé par la dérivée scalaire accumulée. Le shader reçoit le même preset par uniforms.
- Le balayage initial a comparé des segments droits de 1,5 unité dans la boîte centrale. Le meilleur candidat échantillonné à l’échelle −1,5 ne dépassait pas 0,000197 de dégagement minimal estimé. L’échelle −2,3 a fourni un passage continu sur l’axe z autour de x = y = 1,125. Pose initiale `[1.125, 1.125, -1.4]`, yaw et pitch nuls. Le départ et le segment complet de 2,8 unités donnent respectivement des minima de 0,052550 et 0,074539 sur 27 et 561 points. Les seuils du test sont 0,045 et 0,065.
- Le ray marching WebGL1 commence à la caméra, avec un facteur de marche de 0,72, un maximum de 112 pas et une portée de 6 unités. Le déplacement vérifie une marge de 0,018 avec des sous-pas d’au plus 0,005 et un delta temporel plafonné à 50 ms. À vitesse nominale, l’accélération maximale vaut 0,55 unité/s² et la vitesse maximale 0,28 unité/s. La position est limitée à ±2,45 sur chaque axe. La réduction du mouvement abaisse les plafonds de vitesse, d’accélération et de rotation.
- Stop annule la vitesse et libère les entrées de translation. Pause sauvegarde la vitesse, puis la reprise la restaure. Si aucune touche de translation n’est maintenue à la reprise, le freinage normal s’applique ensuite. Retour départ réinitialise pose, vitesse et pause. En cas de position invalide, la navigation revient à la dernière position sûre. Une perte de contexte arrête le mouvement et affiche un diagnostic. Le contexte est réinitialisé lorsqu’il est restauré par le navigateur.

Le DE est une approximation numérique. Les échantillons et le contrôle des sous-pas couvrent le trajet testé avec marge. La précision du shader et le nombre de pas limitent le détail visible près des surfaces fines et au loin. En cas de tampon très lent, le plafonnement du delta réduit la distance parcourue par seconde réelle. La résolution adaptative est bornée de 25 % à 100 %. Le mode à 50 % fixe est prévu pour la mesure sur Gibus.

## Fichiers ajoutés

| Fichier | Rôle |
|---|---|
| `index.html` | Page, commandes accessibles et affichage de l’état, des FPS et de la résolution |
| `app.mjs` | Entrées, boucle de rendu, mesure FPS et cycle de vie WebGL |
| `mandelbox.mjs` | Preset et estimateurs JavaScript/GLSL |
| `navigation.mjs` | Caméra, déplacement, garde géométrique et commandes |
| `render.mjs` | Programme WebGL1 et éclairage |
| `tests.mjs` | Sept tests Node.js sans GPU |
| `browser-tests.mjs` | Vérification Chromium facultative avec Playwright |
| `TESTS_P1_NEF.md` | Procédures automatisées et scénario Firefox/Gibus |
| `RAPPORT_P1_NEF.md` | Référence, choix techniques, limites et résultats |

## Résultats

- Sept tests Node.js réussis. L’aller simulé à 60 pas temporels/s atteint `z = 1,411789` après 15 s et revient à moins de 0,025 unité du départ au recul. Les tests couvrent les marges, Stop/Pause/Retour, le pas temporel, les traversées d’une paroi simulée, la réduction de mouvement, le DE invalide et les codes du clavier.
- Chromium 156.0.8078.79 sous Debian, WebGL1 via ANGLE/Vulkan et SwiftShader. Le test navigateur a franchi les deux repères du trajet, de `z = −1,4` à `z ≥ 1,35` puis `z ≤ −1,35`. Stop, rotation à l’arrêt, Pause/Reprise, perte de focus de la vue, codes clavier simulés et perte/restauration du contexte ont passé. Aucune erreur JavaScript et aucune requête externe n’ont été observées pendant le test.
- Deux captures de la scène à 400 × 250 px ont été examinées. Le départ montre les parois fractales encadrant le passage et le point d’arrivée ouvre sur une zone centrale plus sombre avec des parois encore visibles. L’écart maximal JavaScript/GLSL sur sept points est de 4,62 × 10⁻⁷ unité, sous le seuil de 0,0005. Le compteur a affiché 26,1 i/s dans le petit tampon de test de 80 × 50 px. Cette lecture vérifie l’instrumentation. Un essai exploratoire en mouvement dans le tampon de capture de 400 × 250 px a affiché environ 1 à 2 i/s avec SwiftShader. La performance matérielle A6 reste à mesurer.
- Le diff P0 est vide et l’empreinte SHA-256 correspond à la référence. La P0 s’est ouverte sous Chromium/SwiftShader et a affiché son compteur sans erreur JavaScript. L’approche puis le recul devant une paroi du preset sont couverts hors GPU, avec un DE de 0,018262 au point d’arrêt.
- Firefox et le T14/Gibus sont indisponibles dans cet environnement. Le clavier physique AZERTY/QWERTY, la vérification MIDI de la P0 et la mesure A6 à 50 % sur T14 restent à effectuer. Maintenir le statut de contre-audit jusqu’aux essais et à la décision de Kaëlys.
