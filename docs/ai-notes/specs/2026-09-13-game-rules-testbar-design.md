# Design: Spielregeln aus der Komponente lösen und testen

**Issue:** [#6](https://github.com/freaxnx01/game-stylestar/issues/6)
**Datum:** 2026-09-13
**Status:** validiert (Quick-Mode — Entscheidungen als Assumptions dokumentiert)

## Ziel

`wardrobe.js` und `progress.js` sind getestet, die neue nutzersichtbare Logik
aus #1 aber nicht: der Figurwechsel (`index.html:200-209`) und die Bewertung
samt Fortschritts-Zusammenführung (`index.html:221-236`). Beides steckt in der
Komponentenklasse im `<script type="text/x-dc">`-Block und ist nicht
importierbar — heute nur durch Hinschauen verifiziert.

## Ansatz

Die **reinen Entscheidungen** wandern in ein neues Modul `game-rules.js`; die
Komponente behält nur noch das, was von Natur aus unrein ist —
`this.setState`, `localStorage`, `Math.random`, `setInterval`.

Drei Funktionen, alle ohne Seiteneffekte und ohne `this`:

```js
// Wie gut passt das Outfit zum Thema?
export function scoreLook(character, theme, worn) => { pts, stars }

// Was ändert sich am Fortschritt, wenn eine Figur ein Thema abschliesst?
export function recordResult(progress, charId, themeId, stars, levelIdx, needStars) => progress

// Welcher Zustand gilt, nachdem auf eine andere Figur gewechselt wurde?
export function switchCharacterState(character) => { worn, tab, levelIdx, result }
```

Die Komponente ruft sie auf und verpackt das Ergebnis:

```js
pickChar(id) {
  if (id === this.state.char) return;
  this.setState({ char: id, ...switchCharacterState(this.W.CHARACTERS[id]) });
}

finish() {
  const C = this.W.CHARACTERS[this.state.char];
  const t = C.THEMES[this.state.levelIdx];
  const { pts, stars } = scoreLook(C, t, this.state.worn);
  const likes = 40 + pts * 38 + Math.floor(Math.random() * 20);
  const prog = recordResult(this.state.progress, this.state.char, t.id,
                            stars, this.state.levelIdx, this.needStars());
  this.save(prog);
  // … setState und der Likes-Timer bleiben unverändert
}
```

Das Verhalten ändert sich nicht. Der einzige Unterschied ist, wo die
Entscheidung getroffen wird.

## Assumptions

- **A1** [med] Ein neues Modul `game-rules.js`, nicht drei einzelne.
  Rejected: `scoring.js` plus eine Erweiterung von `progress.js`. Die drei
  Funktionen gehören inhaltlich zusammen — es sind genau die Regeln, die die
  Komponente anwendet — und `recordResult` braucht mit `needStars` einen
  Spielparameter, den `progress.js` bewusst nicht kennt (es ist das
  Speicherformat, nicht das Spiel).

- **A2** [high] `likes` bleibt in der Komponente.
  Rejected: `scoreLook` gibt auch `likes` zurück. Der Wert enthält
  `Math.random()`; in der reinen Funktion müsste der Test entweder den
  Zufall mocken oder auf einen Bereich prüfen. Ausserhalb ist er ein Einzeiler
  ohne Testbedarf.

- **A3** [high] `recordResult` bekommt `needStars` als **Parameter**, statt die
  Schwelle selbst zu berechnen. Rejected: `recordResult(..., schwierig)`. Die
  Schwelle kommt aus `this.props.schwierig` (`index.html:220`); sie
  hereinzureichen hält das Modul frei von Props-Wissen und macht beide
  Schwierigkeitsgrade direkt testbar.

- **A4** [high] `recordResult` gibt einen **neuen** Fortschritt zurück und
  verändert den übergebenen nicht. Rejected: In-Place-Mutation. Die Komponente
  arbeitet mit `setState` und braucht ein neues Objekt; ein Test darauf ist
  billig und fängt die typische Regression.

- **A5** [med] `switchCharacterState` liefert nur die Felder, die sich ändern
  (`worn`, `tab`, `levelIdx`, `result`) — nicht `char` selbst. Rejected: auch
  `char` zurückgeben. Die Funktion weiss nur, wohin gewechselt wird, nicht dass
  gewechselt wird; die Abbruchbedingung „schon aktiv" bleibt in der Komponente.

- **A6** [low] `scoreLook` nimmt die ganze `character`, nicht nur
  `ITEM_BY_ID`. Rejected: nur die Map übergeben. Die ganze Figur ist an der
  Aufrufstelle ohnehin vorhanden und macht die Signatur symmetrisch zu
  `switchCharacterState`.

## Consequences

- `index.html` bekommt einen dritten dynamischen Import. `componentDidMount`
  lädt heute per `Promise.all` zwei Module (`index.html:182`); daraus werden
  drei. Kein zusätzlicher Roundtrip-Effekt, die Datei ist winzig.

- Die Punkte-Formel steht danach **nur noch** in `game-rules.js`. Wer die
  Bewertung ändern will, ändert eine Stelle — heute muss man sie im
  HTML-Skriptblock suchen.

- Getestet ist danach die *Entscheidung*, nicht die *Verdrahtung*. Dass
  `pickChar` das Ergebnis wirklich in `setState` gibt, bleibt ungetestet — das
  wäre nur mit einem Browser-Test zu holen und ist hier bewusst nicht im
  Scope.

## Akzeptanzkriterien

- [ ] `game-rules.js` existiert und exportiert `scoreLook`,
      `recordResult` und `switchCharacterState`.
- [ ] Keine der drei Funktionen benutzt `this`, `localStorage`, `Math.random`
      oder `setState`.
- [ ] `index.html` importiert das Modul und ruft die drei Funktionen in
      `pickChar()` und `finish()` auf; die Punkte-Formel steht nicht mehr in
      `index.html`.
- [ ] `tests/game-rules.test.mjs` deckt ab: Kleid schlägt Oberteil+Unterteil,
      alle drei Sterne-Schwellen, beide Schwierigkeitsgrade, dass der
      übergebene Fortschritt unverändert bleibt, dass nur die gespielte Figur
      berührt wird, dass ein schlechteres Ergebnis den Sterne-Bestwert nicht
      senkt, und dass `switchCharacterState` das `defaultWorn` der Zielfigur
      plus deren ersten Tab liefert.
- [ ] `npm test` ist grün und meldet mindestens 32 Tests.
- [ ] Das Spiel verhält sich unverändert: Bewertung, Freischaltung und
      Figurwechsel wie vorher.

## Ausserhalb des Scopes

- Ein Browser-/DOM-Test, der die Verdrahtung von `setState` prüft.
- `wear()` — die Logik ist älter als #1 und nicht Teil dieses Issues.
- Der Likes-Timer.
