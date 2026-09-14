# TODO

Geparkte Punkte, die bewusst nicht in einem laufenden Issue stecken.

## Hautton

Gemeldet am 2026-09-12 („beim Start ist brauner Hautton gewählt, Figur hat aber
helle Haut"), **gelöst am 2026-09-14**.

**Ursache:** erzwungener Dark Mode im Browser. Chrome invertiert dabei
CSS-Farben — also auch das `background` der Hautton-Kreise, wodurch der helle
Ton `#F8CEAA` dunkelbraun erscheint. Die Figur ist ein SVG-Data-URI; dessen
Innenfarben invertiert Chrome nicht. Swatch und Figur zeigten deshalb
gegensätzliche Töne. Meine erste Prüfung lief in hellem Modus und konnte das
nicht sehen.

**Fix:** `:root{color-scheme:only light;}` in `index.html` — die Seite bringt
ihr Farbschema selbst mit und wird nicht mehr invertiert. Nachgestellt und
verifiziert mit `chromium --force-dark-mode`.

Offen bleiben drei kleinere Punkte aus derselben Ecke:

- [ ] **Haar-Thumbnails folgen dem Hautton nicht.** Die Gesichtsfarbe in der
  Frisuren-Vorschau ist hartcodiert `#F3D9C0` und damit keiner der drei Töne aus
  `SKINS`. `buildHair(hairDefs, faceFill)` in `wardrobe-core.js` nimmt den Ton
  bereits als Parameter, er muss nur durchgereicht werden.

- [ ] **Hautton wird nicht persistiert.** Nach einem Reload springt die Figur
  zurück auf Ton 1. Gehört in den `stylestar_v1`-Wert, der inzwischen bei v3
  steht.

- [ ] **Hautton nur auf dem Startscreen wählbar.** Im Ankleide-Screen lässt er
  sich nicht mehr ändern.

## Infrastruktur

- [ ] **CI-Checks auf Pipeline-PRs stehen auf `action_required`.** Aufgefallen am
  2026-09-13 bei PR #8: der Lauf von `test.yml` wurde angelegt, aber nicht
  gestartet — GitHub hält Workflows auf PRs von `app/github-actions` zurück, bis
  ein Mensch sie freigibt. Der Auto-Review hat den PR trotzdem auf *ready*
  promotet, ohne dass je ein Test lief. Freigeben liess sich der Lauf per
  `gh api -X POST repos/<repo>/actions/runs/<id>/approve` (danach grün, 24/24).
  Betrifft **jeden** künftigen Pipeline-PR — also genau die, bei denen der Check
  am meisten zählt. Zu klären: passende Actions-Einstellung im Repo, oder ein
  Freigabeschritt in der Pipeline.

- [ ] **`agent.yml` referenziert `@v1` statt eines SHA.** Aufgefallen am
  2026-09-12 durch den automatischen Security-Review. Kein Fremd-Repo, also kein
  Supply-Chain-Risiko durch Dritte — aber `v1` ist verschiebbar. Die Datei kommt
  1:1 aus `onboard-consumer.sh`, der Fix gehört deshalb in den Generator im Repo
  `agent-workflow`, nicht in diesen Stub.
