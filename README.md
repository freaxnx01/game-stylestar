# StyleUp! – Ankleide-Puzzle

Ein Anziehspiel im Stil bunter Casual-Games: Du stylst eine Figur über sechs
Ebenen (Haare, Kleider, Oberteile, Unterteile, Schuhe, Extras) passend zu einem
vorgegebenen Thema. Der Look wird mit Sternen und Likes bewertet; ab 2 Sternen
wird das nächste von 8 Themen-Levels freigeschaltet. Zur Wahl stehen ein
Mädchen und ein Junge, jeweils mit eigenem Kleiderschrank und eigener
Themenliste; der Fortschritt wird pro Figur getrennt lokal im Browser
gespeichert.

Play it: <https://github.freaxnx01.ch/game-stylestar/>

## Spielen

- **Hautton wählen** auf dem Startbildschirm, dann Thema aussuchen.
- **Item anklicken** zieht es an, erneut anklicken zieht es aus (Haare lassen
  sich nur tauschen). Ein Kleid ersetzt Oberteil + Unterteil und umgekehrt.
- **„Fertig – zeig deinen Look!"** wertet das Outfit gegen die Themen-Hinweise
  aus: Kleid 2 Punkte oder Oberteil 1 + Unterteil 1, Schuhe 1, Extra 1.
  Ab 4 Punkten gibt es 3 Sterne, ab 2 Punkten 2 Sterne.

## Stack

Buildless static page. `index.html` is a Claude Design (`dc`) document hydrated
by the generic `support.js` runtime; `wardrobe.js` is a dependency-free ES module
holding the whole asset and item catalogue as inline-SVG data URIs. No build
step, no dependencies to install — GitHub Pages serves the repo root as-is.

The full design reference (colours, tokens, screens, scoring) is in
[`docs/design-handoff.md`](docs/design-handoff.md).

## Versioning

The git tag `vX.Y.Z` is the source of truth; `version.js` mirrors it for the
in-page badge. See [`CHANGELOG.md`](CHANGELOG.md).
