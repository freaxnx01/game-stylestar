# Design: Eine Quelle für die Figur-IDs

**Issue:** [#5](https://github.com/freaxnx01/game-stylestar/issues/5)
**Datum:** 2026-09-13
**Status:** validiert (Quick-Mode — Entscheidungen als Assumptions dokumentiert)

## Ziel

Die Liste der Figur-IDs steht heute zweimal hartcodiert im Repo:

- `wardrobe.js:8` — `export const CHAR_IDS = ['girl', 'boy'];`
- `progress.js:6` — `const CHAR_IDS = ['girl', 'boy'];`

Kommt eine dritte Figur in die Registry, ohne dass die Kopie in `progress.js`
nachgezogen wird, lässt `migrate()` diese Figur bei jedem Laden still aus
`chars` weg — stiller Fortschrittsverlust. Heute fällt das keinem Test auf,
weil beide Listen übereinstimmen.

Genau genommen gibt es sogar **drei** Literale: `wardrobe.js:7` baut
`CHARACTERS = { girl, boy }` und Zeile 8 wiederholt dieselben Namen als Array.

## Ansatz

Zwei Änderungen, die zusammen jede Kopie beseitigen:

**1. `CHAR_IDS` wird aus der Registry abgeleitet.**

```js
export const CHARACTERS = { girl, boy };
export const CHAR_IDS = Object.keys(CHARACTERS);
```

Damit kann die Liste nicht mehr von der Registry abweichen — sie *ist* die
Registry.

**2. `progress.js` bekommt die IDs übergeben, statt sie zu kennen.**

```js
export const blankProgress = (charIds) => ({ … });
export function migrate(parsed, charIds) { … }
```

`index.html` ist die einzige Stelle, die beide Module kennt, und reicht dort
`w.CHAR_IDS` durch:

```js
this.setState({ ready: true, progress: p.migrate(raw, w.CHAR_IDS), … });
```

`progress.js` weiss danach nichts mehr über Figuren und hat keinen Grund, es je
wieder zu tun.

## Assumptions

- **A1** [med] `progress.js` bekommt die IDs als **Parameter**, statt
  `CHAR_IDS` aus `wardrobe.js` zu importieren.
  Rejected: `import { CHAR_IDS } from './wardrobe.js'`. Das würde das
  Fortschritts-Modul an den kompletten Kleiderschrank hängen — `wardrobe.js`
  zieht über `wardrobe-girl.js`/`wardrobe-boy.js` rund 40 KB SVG-Daten nach.
  Für die Laufzeit im Browser wäre das egal, weil `index.html:182` ohnehin
  beide Module lädt; für die Tests bedeutet es aber, dass ein Test der
  Migrationslogik den ganzen Kleiderschrank parsen müsste, und es dreht die
  Abhängigkeitsrichtung falschherum: Persistenz soll nichts über Spielinhalt
  wissen.
  Rejected: ein drittes Modul `characters.js`, das nur das Array hält. Es wäre
  eine Datei für eine Zeile, und die Registry in `wardrobe.js` bleibt trotzdem
  die Wahrheit — dann kann man sie auch direkt fragen.

- **A2** [high] Die neuen Parameter haben **keinen Default-Wert**.
  Rejected: `migrate(parsed, charIds = ['girl', 'boy'])`. Ein Default wäre
  genau das Literal wieder, nur versteckter — ein vergessener Aufruf liefe
  still weiter und nähme die dritte Figur nicht mit. Ohne Default schlägt ein
  vergessener Aufruf sofort und laut fehl.

- **A3** [high] Abgesichert wird das mit einem Test, der `migrate()` eine
  **dreielementige** ID-Liste gibt und drei Einträge in `chars` erwartet.
  Rejected: ein Test, der den Quelltext von `progress.js` nach dem String
  `'girl'` durchsucht. Er wäre brüchig und würde Kommentare mitzählen; die
  Verhaltensprüfung belegt dieselbe Eigenschaft direkter.

- **A4** [low] Die bestehende Signatur von `blankChar()` bleibt unverändert —
  sie kennt keine IDs.

## Consequences

- Die öffentliche Signatur von `progress.js` ändert sich. Ausser
  `index.html` und den Tests ruft heute niemand diese Funktionen auf
  (`grep -rn "migrate(\|blankProgress(" --include=*.js --include=*.html`
  nennt nur diese Stellen), der Bruch bleibt also im Repo.

- `CHAR_IDS` ist nach der Änderung die Schlüsselreihenfolge von `CHARACTERS`.
  Das ist in JavaScript für String-Schlüssel die Einfügereihenfolge, also
  weiterhin `['girl', 'boy']` — die Reihenfolge der Figur-Buttons im
  Startscreen bleibt damit unverändert.

- Wer künftig eine Figur ergänzt, fasst nur noch `wardrobe.js` an. Das ist der
  eigentliche Gewinn und zugleich das, was kein Test erzwingen kann — er kann
  nur belegen, dass `progress.js` der Liste folgt.

## Akzeptanzkriterien

- [ ] `progress.js` enthält kein Literal `['girl', 'boy']` mehr und keine eigene
      `CHAR_IDS`-Konstante.
- [ ] `wardrobe.js` leitet `CHAR_IDS` per `Object.keys(CHARACTERS)` ab, statt es
      erneut aufzulisten.
- [ ] `blankProgress(charIds)` und `migrate(parsed, charIds)` nehmen die IDs als
      Parameter **ohne Default**.
- [ ] `index.html` reicht `w.CHAR_IDS` an `migrate()` durch.
- [ ] Ein Test belegt, dass `migrate()` mit einer dreielementigen ID-Liste drei
      Einträge in `chars` erzeugt.
- [ ] Alle bestehenden Tests bleiben grün; `npm test` meldet mindestens 23
      bestandene Tests.
- [ ] Ein bestehender Spielstand im alten Flachformat wird weiterhin auf
      `chars.girl` migriert.

## Ausserhalb des Scopes

- Eine dritte Figur tatsächlich hinzuzufügen.
- Die Abdeckung von `pickChar()` und `finish()` — das ist Issue #6.
