# Design: Date-Themen, Paar-Bewertung und Fortschritt

**Issue:** [#2](https://github.com/freaxnx01/game-stylestar/issues/2)
**Datum:** 2026-09-13
**Status:** validiert

Teil 1 von zwei. Dieses Issue bringt die **Daten und Regeln** des Date-Modus.
Der spielbare Ablauf — Startscreen-Button, Themenwahl, der Date-Modus im
Ankleide-Screen und die gemeinsame Szene — ist Teil 2 und hat ein eigenes
Issue.

## Entscheidungen

| Frage | Entscheidung |
| --- | --- |
| Ablauf | Ein gemeinsames Date-Thema, beide Figuren nacheinander gestylt |
| Bewertung | Summe beider Einzelbewertungen, keine Farb-Harmonie |
| Themen | Vier eigene, von Anfang an offen, keine Freischalt-Kette |
| Einstieg | Zweiter Button auf dem Startscreen *(Teil 2)* |
| Fortschritt | Eigener Sterne-Topf neben den Figuren |

## 1. Die vier Date-Themen

Neu in `wardrobe-dates.js`:

| `id` | Name | Hinweise | `sig.girl` / `sig.boy` |
| --- | --- | --- | --- |
| `kino` | Kino-Abend | schick, gemütlich, dunkel | `d3` / `t7` |
| `eisdiele` | Eisdiele | sommerlich, leger, bunt | `t3` / `t3` |
| `sommerfest` | Sommerfest | luftig, fröhlich, draussen | `d2` / `t5` |
| `herbst` | Herbstspaziergang | warm, gemütlich, bunt | `t7` / `t6` |

`sig` ist zweiteilig, weil die Themenkarte später beide Figuren andeutet —
anders als bei den Figur-Themen, wo ein Signatur-Teil genügt.

## 2. Tags auf vorhandenen Teilen

Kein neues SVG. Die Date-Themen werden über zusätzliche `tags` an bestehenden
Teilen erschlossen. Verifiziert am 2026-09-13 gegen den echten Kleiderschrank:
jedes Thema hat für **beide** Figuren mindestens ein passendes Teil in `top`,
`bottom`, `shoes` und `extra`.

**`wardrobe-girl.js`**

| Thema | top | bottom | dress | shoes | extra |
| --- | --- | --- | --- | --- | --- |
| `kino` | t2, t6 | b2, b4 | d3 | s2, s4 | e4, e6 |
| `eisdiele` | t2, t3 | b2, b3 | d2 | s2, s3 | e3, e5 |
| `sommerfest` | t2, t4 | b3, b4 | d2, d3 | s2, s5 | e3, e5 |
| `herbst` | t5, t7 | b4, b6 | — | s5, s6 | e6, e7 |

**`wardrobe-boy.js`**

| Thema | top | bottom | shoes | extra |
| --- | --- | --- | --- | --- |
| `kino` | t2, t7 | b2, b5 | s2, s5 | e5 |
| `eisdiele` | t2, t3 | b3, b5 | s2, s3 | e3, e5 |
| `sommerfest` | t2, t5 | b4, b5 | s2, s5 | e3, e5 |
| `herbst` | t5, t6 | b2, b5 | s5, s6 | e5, e6 |

## 3. Die Invarianten-Suite muss mitwachsen

`tests/wardrobe.test.mjs` prüft heute *„jeder Tag zeigt auf ein existierendes
Thema"* gegen `C.THEMES` der jeweiligen Figur. Sobald ein Teil `kino` trägt,
wird dieser Test **rot** — `kino` steht in `DATE_THEMES`, nicht in `C.THEMES`.

Das ist kein Kollateralschaden, sondern der Kern der Absicherung: die erlaubte
Tag-Menge ist ab jetzt „Figur-Themen **plus** Date-Themen". Dazu kommt eine
neue Invariante, die für Date-Themen dasselbe fordert wie für Figur-Themen —
Lösbarkeit mit drei Sternen in den vier wertenden Kategorien, für **beide**
Figuren.

## 4. Bewertung

`game-rules.js` bekommt zwei weitere reine Funktionen:

```js
scoreDate(girlChar, boyChar, theme, girlWorn, boyWorn)
  => { girlPts, boyPts, pts, stars }
```

Ruft zweimal das bestehende `scoreLook` auf und summiert: 0–8 Punkte.
Schwellen: **≥7 → 3 Sterne, ≥4 → 2, sonst 1**. Im Solomodus sind drei Sterne
das perfekte Outfit (4 von 4); beim Paar wären 8 von 8 zu hart, 7 lässt genau
einen Patzer zu. Die Einzelwerte kommen mit zurück, damit die Szene in Teil 2
zeigen kann, woran es lag.

```js
recordDateResult(progress, themeId, stars) => progress
```

Setzt den Sterne-Bestwert für ein Date-Thema, lässt die Figuren unberührt und
mutiert das Argument nicht — dieselben Regeln wie `recordResult`.

## 5. Fortschritt auf v3

```js
{ v: 3, chars: { girl: {…}, boy: {…} }, dates: { stars: { kino: 3 } } }
```

Der `localStorage`-Key bleibt `stylestar_v1`. Der Date-Zweig hat **kein**
`unlocked` — alle vier Themen sind von Anfang an offen.

`migrate` deckt danach vier Fälle ab:

- **v3** → übernehmen, fehlende Figuren und ein fehlender oder kaputter
  Date-Zweig werden aufgefüllt.
- **v2** → Figuren behalten, leerer Date-Zweig dazu.
- **Flachformat** `{unlocked, stars}` → wie bisher auf `chars.girl`, Rest leer.
- **Alles andere** → frischer Stand.

Die Version wird bewusst gehoben, statt `dates` still in v2 zu ergänzen: die
Versionsnummer existiert, um eine Formänderung zu markieren, und sie beim
ersten Anlass zu umgehen entwertet sie beim nächsten.

## Akzeptanzkriterien

- [ ] `wardrobe-dates.js` exportiert `DATE_THEMES` mit den vier Themen aus
      Abschnitt 1, jedes mit `id`, `name`, `hints` und zweiteiligem `sig`.
- [ ] Die Tags aus Abschnitt 2 sind in `wardrobe-girl.js` und
      `wardrobe-boy.js` ergänzt; kein bestehender Tag wird entfernt.
- [ ] `wardrobe.js` exportiert `DATE_THEMES` mit, damit `index.html` weiterhin
      nur ein Kleiderschrank-Modul importiert.
- [ ] Der Test *„jeder Tag zeigt auf ein existierendes Thema"* akzeptiert
      Figur- **und** Date-Themen-IDs und ist grün.
- [ ] Eine neue Invariante belegt: jedes Date-Thema ist für **beide** Figuren
      in `top`, `bottom`, `shoes` und `extra` mit drei Sternen lösbar.
- [ ] `game-rules.js` exportiert `scoreDate` und `recordDateResult`, beide ohne
      Seiteneffekte und ohne `this`.
- [ ] `progress.js` schreibt `v: 3` mit `dates: { stars: {} }`, und `migrate`
      deckt die vier Fälle aus Abschnitt 5 ab.
- [ ] `index.html` ruft `migrate` unverändert auf und das Spiel läuft wie
      bisher — ein bestehender v2-Stand behält Sterne und Freischaltung.
- [ ] `npm test` ist grün und meldet mindestens 48 Tests.

## Ausserhalb des Scopes

- Der gesamte spielbare Ablauf: Startscreen-Button, `dateThemes`-Screen, der
  Date-Modus im Ankleide-Screen, die gemeinsame Szene. Das ist Teil 2.
- Farb-Harmonie in der Bewertung.
- Eine Freischalt-Kette für Date-Themen.
