# TODO

Geparkte Punkte, die bewusst nicht in einem laufenden Issue stecken.

## Hautton

Aufgekommen am 2026-09-12 aus der Meldung „beim Start ist brauner Hautton
gewählt, Figur hat aber helle Haut".

**Stand der Prüfung:** nicht reproduzierbar. Sechs Wege geprüft (frischer Start,
nach Klick auf braun, zweimal zurück zum Startscreen, im Ankleide-Screen, nach
Reload) — Figur und markierter Swatch waren jedes Mal synchron. Beim frischen
Start ist Swatch 1 markiert und die Figur hell. Offen bleibt, ob es an einem
veralteten Browser-Cache lag (weder `index.html` noch `wardrobe.js` haben
Cache-Busting) oder an einem Pfad, den das Skript nicht abdeckt.

Zum Nachstellen: das Playwright-Skript aus der Session baut einen lokalen Server
auf `:8796`, klickt die Pfade durch und liest die Gesichtsfarbe direkt aus der
Data-URI der Figur.

- [ ] **Auswahl-Markierung kräftiger machen.** Der gewählte Swatch hat nur einen
  3-px-Ring in `#F45FA2`, die nicht gewählten einen weissen — auf dem bunten
  Verlauf ist der dunkelbraune Swatch mit weissem Rand der kontraststärkste und
  zieht den Blick, obwohl er nicht gewählt ist. Vorschlag: dickerer Ring plus
  Häkchen im gewählten Swatch, kein weisser Rand auf den übrigen.
  Betrifft `index.html`, `vals.skinBtns`.

- [ ] **Haar-Thumbnails folgen dem Hautton nicht.** Die Gesichtsfarbe in der
  Frisuren-Vorschau ist hartcodiert `#F3D9C0` und damit keiner der drei Töne aus
  `SKINS`. Nach Issue #1 ist das ein Einzeiler: `buildHair(hairDefs, faceFill)`
  in `wardrobe-core.js` nimmt den Ton bereits als Parameter, er muss nur
  durchgereicht werden.

- [ ] **Hautton wird nicht persistiert.** Nach einem Reload springt die Figur
  zurück auf Ton 1. Gehört in den `stylestar_v1`-Wert, der mit Issue #1 ohnehin
  auf v2 gehoben wird.

- [ ] **Hautton nur auf dem Startscreen wählbar.** Im Ankleide-Screen lässt er
  sich nicht mehr ändern.

## Infrastruktur

- [ ] **`agent.yml` referenziert `@v1` statt eines SHA.** Aufgefallen am
  2026-09-12 durch den automatischen Security-Review. Kein Fremd-Repo, also kein
  Supply-Chain-Risiko durch Dritte — aber `v1` ist verschiebbar. Die Datei kommt
  1:1 aus `onboard-consumer.sh`, der Fix gehört deshalb in den Generator im Repo
  `agent-workflow`, nicht in diesen Stub.
