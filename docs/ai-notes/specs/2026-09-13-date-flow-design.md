# Design: Date-Modus spielbar machen

**Issue:** [#10](https://github.com/freaxnx01/game-stylestar/issues/10)
**Datum:** 2026-09-13
**Status:** validiert

Teil 2 von zwei. [#2](https://github.com/freaxnx01/game-stylestar/issues/2)
hat die Daten und Regeln gebracht — `DATE_THEMES`, `scoreDate`,
`recordDateResult` und den `dates`-Zweig im Fortschritt. Dieses Issue macht
daraus einen spielbaren Modus. Es ist reine Verdrahtung in `index.html`; an
den Regeln ändert sich nichts.

## 1. State

Drei neue Felder:

```js
mode: 'solo',                           // 'solo' | 'date'
dateIdx: 0,                             // Index in DATE_THEMES
dateLooks: { girl: null, boy: null },   // gesicherte Outfits der Runde
```

`mode` ist der Schalter, an dem der Ankleide-Screen sein Verhalten aufhängt.
`char` bleibt die aktive Figur — im Date-Modus wandert sie von `girl` zu `boy`.

## 2. Ablauf

```
start ──[Date-Modus]──> dateThemes ──[Thema]──> game (char='girl', mode='date')
                                                   │ [Weiter]  → dateLooks.girl = worn
                                                   ▼
                                                game (char='boy', mode='date')
                                                   │ [Fertig]  → dateLooks.boy = worn
                                                   ▼
                                                dateResult
```

Der Einstieg setzt `mode: 'date'`, `dateLooks: { girl: null, boy: null }`,
`char: 'girl'` und das Outfit des Mädchens auf ihr `defaultWorn` — dafür wird
`switchCharacterState` aus `game-rules.js` wiederverwendet, dieselbe Funktion,
die schon der Figurwechsel benutzt.

Der Schrittwechsel sichert `worn` nach `dateLooks[char]` und ruft
`switchCharacterState` für die nächste Figur. Beim zweiten „Fertig" wird mit
`scoreDate` bewertet, mit `recordDateResult` gespeichert und `dateResult`
gezeigt.

## 3. Der Ankleide-Screen wird wiederverwendet

Nicht kopiert. Im Date-Modus ändern sich genau drei Dinge:

- Die Kopfzeile zeigt Name und Hinweise des **Date-Themas** statt des
  Figur-Themas.
- Statt „Thema n / 8" steht dort „Schritt 1 von 2 — style das Mädchen".
- Der grosse Button heisst im ersten Schritt **„Weiter"**, im zweiten
  „Fertig – zeigt euer Date!".

Tabs, Kleiderschrank und Figur-Rendering bleiben unberührt — sie folgen
ohnehin `s.char`. Umgesetzt wird das über die vorhandenen Platzhalter
`themeName`, `hints`, und einen neuen `stepLabel`; der Button-Text wird zu
`finishLabel`.

Der Zurück-Pfeil führt im Date-Modus zur Date-Themenwahl statt zur
Figur-Themenwahl.

## 4. Die Date-Szene

Zwei Figuren nebeneinander im selben 300×620-Raster. Statt sechzehn einzeln
benannter Ebenen-Platzhalter wird `sc-for` **verschachtelt** — dasselbe Muster,
das die Themenwahl schon für ihre Sterne benutzt (`levels` → `lv.starCols`):

```html
<sc-for list="{{ dateFigures }}" as="fig" hint-placeholder-count="2">
  <div style="…">
    <div style="{{ fig.frame }}">
      <sc-for list="{{ fig.layers }}" as="ly" hint-placeholder-count="8">
        <div style="{{ ly }}"></div>
      </sc-for>
    </div>
    <div>{{ fig.label }} · {{ fig.pts }} / 4</div>
  </div>
</sc-for>
```

`vals.dateFigures` ist eine Liste aus zwei Einträgen mit je `label`, `pts`,
`frame` und `layers` — acht Style-Objekte in derselben Reihenfolge wie im
Ankleide-Screen (Haare hinten, Figur, Schuhe, Unterteil, Oberteil, Kleid,
Haare vorne, Extra).

Darunter Sterne und Likes wie im Solo-Ergebnis. Die Einzelpunktzahlen kommen
aus `scoreDate`, das `girlPts` und `boyPts` genau dafür zurückgibt.

## 5. Startscreen und Themenwahl

Auf dem Startscreen ein zweiter Button **„Date-Modus"** unter „Los geht's!",
optisch sekundär (heller, kleiner), damit der Einzelmodus der Haupteinstieg
bleibt.

Der neue `dateThemes`-Screen zeigt vier Karten im selben Gitter wie die
Figur-Themenwahl. Jede Karte trägt **zwei** Thumbnails nebeneinander — je das
`sig`-Teil der beiden Figuren — plus die Sterne aus `progress.dates.stars`.
Keine Schlösser: alle vier Themen sind von Anfang an offen.

## Akzeptanzkriterien

- [ ] Der Startscreen hat einen zweiten Button „Date-Modus", der in die
      Date-Themenwahl führt.
- [ ] Die Date-Themenwahl zeigt alle vier Themen ohne Schloss, je mit zwei
      Thumbnails und den erreichten Sternen.
- [ ] Ein gewähltes Thema startet den Modus mit dem Mädchen im
      `defaultWorn`, leerem `dateLooks` und dem Date-Thema in der Kopfzeile.
- [ ] Der Ankleide-Screen zeigt im Date-Modus „Schritt 1 von 2" bzw.
      „Schritt 2 von 2" und den Button „Weiter" bzw. „Fertig – zeigt euer
      Date!".
- [ ] „Weiter" sichert das Outfit und schaltet auf den Jungen in seinem
      `defaultWorn` um; der Kleiderschrank zeigt seine Teile.
- [ ] „Fertig" bewertet mit `scoreDate` und zeigt beide Figuren nebeneinander
      mit Sternen, Likes und den beiden Einzelpunktzahlen.
- [ ] Das Ergebnis landet über `recordDateResult` in `progress.dates.stars`
      und überlebt einen Reload.
- [ ] Der Zurück-Pfeil führt im Date-Modus zur Date-Themenwahl.
- [ ] Der Einzelmodus verhält sich unverändert: Figurwahl, Themenwahl,
      Bewertung, Freischaltung, getrennter Fortschritt je Figur.
- [ ] `npm test` bleibt grün mit mindestens 49 Tests.

## Ausserhalb des Scopes

- Neue Date-Themen oder neue Kleidungsstücke.
- Eine Freischalt-Kette für Date-Themen.
- Animationen in der Date-Szene.
- Ein Browser-/DOM-Test der Verdrahtung — die Regeln sind getestet, der Flow
  wird von Hand durchgespielt.
