# Design: Jungen-Figur mit eigenem Kleiderschrank und Themen

**Issue:** [#1](https://github.com/freaxnx01/game-stylestar/issues/1)
**Datum:** 2026-09-12
**Status:** validiert

## Ziel

StyleUp! bietet heute genau eine Figur (Mädchen) mit einem Kleiderschrank und
acht Themen. Dieses Design führt eine zweite Figur ein — einen Jungen mit
eigenem Kleiderschrank und eigener Themenliste — und macht die Figur damit zu
einer expliziten Dimension des Datenmodells statt zu einer impliziten Annahme.

Nicht Teil dieses Designs: der Date-Modus (Issue #2), der lediglich voraussetzt,
dass es die Jungen-Figur gibt.

## Entscheidungen

| Frage | Entscheidung |
| --- | --- |
| Themen | Eigene Themenliste pro Figur |
| Figurwahl | Auf dem Startscreen, direkt über den Hautton-Swatches |
| Themeninhalt Junge | Sport-/Action-lastig, 8 Themen |
| Fortschritt | Getrennt pro Figur, alter Fortschritt migriert auf das Mädchen |
| Codestruktur | Aufteilung in `wardrobe-core` + zwei Figur-Module + Registry |
| Hautton | Bleibt gemeinsam für beide Figuren |

## 1. Modulstruktur

```
wardrobe-core.js   SVG-Primitiven + gemeinsame Bausteine
wardrobe-girl.js   CHARACTER 'girl' — heutiger Inhalt, 1:1 verschoben
wardrobe-boy.js    CHARACTER 'boy'  — neuer Inhalt
wardrobe.js        Registry: export CHARACTERS, CHAR_IDS, SKINS
```

`wardrobe-core.js` enthält alles, was bereits heute figur-neutral ist: `uri`,
`FULL`, `BLANK`, `sp`, `dot`, `fl`, `SKINS`, `TVB`, `capSleeve`, `tank`,
`sleeves`, `hip`, `legs`. Dazu kommt `buildItems(rawItems, evb)`, das die
heutige Aufbereitungsschleife am Ende von `wardrobe.js` kapselt — sie erzeugt
`img`, `thumb` und `cat` je Teil und baut die `ITEM_BY_ID`-Map. Beide
Figur-Module rufen dieselbe Funktion auf, damit diese Logik nicht dupliziert
wird.

`index.html` importiert weiterhin ausschliesslich `./wardrobe.js`. Kein
Lazy-Loading: bei rund 40 KB Gesamtdaten steht der Aufwand einer zweiten
Ladepfad-Logik in keinem Verhältnis zum Nutzen.

**Keine ID-Präfixe.** `ITEM_BY_ID` wird pro Figur gebaut und jeder Lookup läuft
über die aktive Figur, also dürfen `t1` beim Mädchen und `t1` beim Jungen
koexistieren. Das hält `wardrobe-boy.js` lesbar und macht die Extraktion von
`wardrobe-girl.js` zu einem reinen Verschieben ohne Umbenennungen — der
Girl-Refactor bleibt damit diff-arm und überprüfbar.

## 2. Datenmodell

Jedes Figur-Modul exportiert eine gleich geformte `CHARACTER`:

```js
export const CHARACTER = {
  id: 'boy', name: 'Junge',
  dollUri,                          // (skinColor) => data-uri
  HAIR, ITEMS, ITEM_BY_ID, THEMES,
  tabs: [['hair','Haare'], ['top','Oben'], ['bottom','Unten'],
         ['shoes','Schuhe'], ['extra','Extras']],
  defaultWorn: { hair:'h1', top:'t1', bottom:'b1', dress:null, shoes:'s1', extra:null },
};
```

`wardrobe.js` reduziert sich auf:

```js
import { CHARACTER as girl } from './wardrobe-girl.js';
import { CHARACTER as boy } from './wardrobe-boy.js';
export { SKINS } from './wardrobe-core.js';
export const CHARACTERS = { girl, boy };
export const CHAR_IDS = ['girl', 'boy'];
```

### Der Junge hat keine Kleider

Sein `ITEMS.dress` ist leer und der Tab „Kleider" fehlt in seiner `tabs`-Liste.
Genau deshalb ist `tabs` figur-eigen statt wie heute als `tabDefs` in
`index.html` hartcodiert. Die acht Render-Ebenen der Figur bleiben unverändert;
die `dress`-Ebene ist beim Jungen dauerhaft leer.

Die Scoring-Funktion braucht dadurch **keine** Änderung. `finish()` rechnet
heute `worn.dress ? (fits ? 2 : 0) : fits(top) + fits(bottom)`, plus Schuhe und
Extra. Bei dauerhaft `dress: null` greift automatisch der Zweig mit
Oberteil + Unterteil; das Maximum bleibt bei 4 Punkten und die Sterne-Schwellen
(`>= 4` → 3 Sterne, `>= 2` → 2) gelten unverändert für beide Figuren.

### Themenliste des Jungen

| `id` | Name | Hinweise |
| --- | --- | --- |
| `pyjama` | Pyjama-Party | kuschelig, Sterne, gemütlich |
| `schule` | Schulparty | cool, schick, lässig |
| `strand` | Strand & Sommer | sonnig, luftig, Sommer |
| `fussball` | Fussball-Match | Trikot, Stollen, Team |
| `skater` | Skater-Park | Streetwear, Cap, baggy |
| `winter` | Winter-Style | warm, flauschig, Schnee |
| `rockstar` | Rockstar | Bühne, Leder, laut |
| `ritter` | Ritter-Fest | Rüstung, Wappen, mutig |

Die vier mit dem Mädchen geteilten IDs (`pyjama`, `schule`, `strand`, `winter`)
kollidieren nicht, weil der Fortschritt pro Figur getrennt gespeichert wird.
Jedes Thema braucht mindestens ein passendes Teil in `top`, `bottom`, `shoes`
und `extra` — diese Invariante ist testgesichert, siehe Abschnitt 5.

### Jungen-Figur (Doll)

`dollUri(c)` des Jungen folgt demselben ViewBox-Raster `0 0 300 620` und
denselben Ankerpunkten wie die Mädchen-Figur, damit alle Kleidungs-SVGs auf
denselben Koordinaten sitzen. Unterschiede in der Silhouette: breitere
Schulterpartie, etwas kräftigerer Oberkörper, kein Wangenrot, kürzere
Standard-Haarabdeckung. Die Unterwäsche-Ebene wird zu einer schlichten Shorts.

## 3. Startscreen-Flow und State

`index.html` bekommt das State-Feld `char: 'girl'`. Der Startscreen zeigt über
den Hautton-Swatches eine Zeile „Wer wird gestylt?" mit zwei Buttons — je ein
kleines Figur-Thumbnail plus Label. Der aktive Button trägt denselben pinken
Ring wie ein gewählter Hautton, damit beide Auswahlen visuell als eine Gruppe
lesen. Die Vorschaufigur rendert sofort die gewählte Figur in ihrem
`defaultWorn`.

Ein Figurwechsel setzt `worn` auf `defaultWorn` der neuen Figur, `tab` auf
`hair`, `levelIdx` auf `0` und `result` auf `null`. Ohne das zeigt die
Themenwahl einen Index aus der alten Liste, oder die Figur trägt Teile, die es
bei ihr nicht gibt.

In `renderVals` wird einmal `const C = W.CHARACTERS[s.char]` geholt; alle
heutigen Zugriffe auf `W.HAIR`, `W.ITEMS`, `W.THEMES`, `W.ITEM_BY_ID`,
`W.dollUri` sowie die hartcodierte `tabDefs`-Liste laufen ab dann über `C`. Der
Doll-Cache bekommt den Schlüssel `s.char + ':' + s.skin` statt nur `s.skin`.

**Der Hautton bleibt gemeinsam** — ein `skin` für beide Figuren. Er steht direkt
neben der Figurwahl und gilt sichtbar für die gerade gewählte Figur; zwei
getrennte Töne zu halten wäre Zustand ohne erkennbaren Nutzen.

## 4. Persistenz und Migration

Der `localStorage`-Key bleibt `stylestar_v1` — ein neuer Key würde vorhandenen
Fortschritt wegwerfen. Versioniert wird stattdessen der Wert:

```js
{ v: 2, chars: { girl: { unlocked, stars }, boy: { unlocked, stars } } }
```

`load()` unterscheidet drei Fälle:

- `v === 2` → direkt verwenden.
- Objekt mit `unlocked` auf oberster Ebene (das alte Format) → wandert als
  `chars.girl` hinein, der Junge startet mit `{ unlocked: 1, stars: {} }`.
- Alles andere (fehlend, kaputt, `JSON.parse` wirft) → Defaults für beide.

`save()` schreibt immer das v2-Format. Die Freischalt-Kette und `needStars()`
bleiben unverändert und arbeiten nur noch auf `progress.chars[s.char]`.

## 5. Testing

Das Repo hat heute keine Tests. Diese Änderung ist der richtige Moment dafür,
weil der Jungen-Kleiderschrank **Daten-Invarianten** mitbringt, die sich visuell
kaum prüfen lassen — ihre Verletzung macht ein Thema unlösbar, ohne dass etwas
kaputt aussieht.

`tests/wardrobe.test.mjs` läuft mit `node --test` (in Node eingebaut, keine
Dependency) und iteriert über beide Figuren:

1. Jedes Thema hat mindestens ein passendes Teil in `top`, `bottom`, `shoes`
   und `extra` — genau die vier Kategorien, die für 3 Sterne zählen. `dress`
   ist ausdrücklich **nicht** gefordert: schon heute haben `sport`, `festival`,
   `winter` und `kpop` kein passendes Kleid, und der Kleid-Zweig im Scoring ist
   eine Alternative zu Oberteil + Unterteil, keine zusätzliche Pflicht.
2. Jedes `theme.sig` löst in `ITEM_BY_ID` der Figur auf, sonst crasht die
   Themenwahl beim Thumbnail.
3. Keine doppelten Item-IDs innerhalb einer Figur.
4. Jeder `tags`-Eintrag zeigt auf eine existierende Themen-ID derselben Figur —
   fängt Tippfehler wie `fussbal`.
5. Alle `defaultWorn`-IDs existieren; beim Jungen ist `dress` gleich `null`.
6. Keine Kategorie in `tabs`, die leer ist.

Dazu eine minimale `package.json` mit `"test": "node --test tests/"`, damit die
Pipeline einen Befehl hat.

Vorgehen ist TDD: Tests und Girl-Refactor zuerst — die Suite muss auf dem
heutigen Inhalt grün sein — dann die Invarianten gegen den noch leeren Jungen
laufen lassen (rot) und den Kleiderschrank bis grün bauen.

## 6. Akzeptanzkriterien

- [ ] `wardrobe-core.js`, `wardrobe-girl.js`, `wardrobe-boy.js` existieren;
      `wardrobe.js` ist nur noch Registry und exportiert `CHARACTERS`,
      `CHAR_IDS`, `SKINS`.
- [ ] Der Mädchen-Kleiderschrank ist inhaltlich unverändert — gleiche Item-IDs,
      gleiche Themen, gleiche Optik.
- [ ] Der Startscreen bietet die Figurwahl Mädchen/Junge über den
      Hautton-Swatches; die Vorschaufigur wechselt sofort.
- [ ] Der Junge hat 8 Themen, mindestens 6 Frisuren und in `top`, `bottom`,
      `shoes` und `extra` je genug Teile, dass jedes seiner Themen mit 3 Sternen
      lösbar ist.
- [ ] Beim Jungen fehlt der Tab „Kleider"; alle übrigen Tabs funktionieren.
- [ ] Ein Figurwechsel setzt Outfit, Tab und Level-Index zurück.
- [ ] Der Fortschritt wird pro Figur getrennt gespeichert; bestehender
      Fortschritt aus dem alten Format landet beim Mädchen und geht nicht
      verloren.
- [ ] Der gewählte Hautton wirkt auf beide Figuren.
- [ ] `npm test` läuft grün und deckt die sechs Invarianten aus Abschnitt 5 ab.

## 7. Ausserhalb des Scopes

- **Date-Modus** — Issue #2.
- **Offene Hautton-Punkte** aus der Prüfung vom 2026-09-12: Haar-Thumbnails mit
  hartcodiertem Gesichtston `#F3D9C0`, Hautton nicht persistiert, Hautton im
  Ankleide-Screen nicht wechselbar. Betrifft beide Figuren und gehört in einen
  eigenen Durchgang.
