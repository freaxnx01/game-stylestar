# Jungen-Figur Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** StyleUp! um eine zweite, komplett eigenständige Figur erweitern — einen Jungen mit eigenem Kleiderschrank und eigener Themenliste — und die Figur dabei zu einer expliziten Dimension des Datenmodells machen.

**Architecture:** `wardrobe.js` wird von einer Datendatei zu einer dünnen Registry. Die SVG-Primitiven wandern nach `wardrobe-core.js`, der heutige Inhalt unverändert nach `wardrobe-girl.js`, der neue Inhalt nach `wardrobe-boy.js`. Beide Figur-Module exportieren eine gleich geformte `CHARACTER`. `index.html` holt sich pro Render einmal die aktive Figur und liest alles über sie. Der Fortschritt wird pro Figur getrennt in einem versionierten `localStorage`-Wert gehalten; die Migrationslogik lebt in einem eigenen, testbaren Modul.

**Tech Stack:** Buildless ES-Module im Browser, SVG als Data-URI, `node --test` (in Node eingebaut, keine Dependencies), Playwright nur für eine manuelle visuelle Kontrolle.

**Spec:** [`docs/ai-notes/specs/2026-09-12-jungen-figur-design.md`](../specs/2026-09-12-jungen-figur-design.md)

## Global Constraints

- **Buildless.** Kein Bundler, kein Transpiler, kein Framework. Alle Module sind ES-Module, die der Browser direkt lädt. `index.html` importiert dynamisch per `import('./…')`.
- **Keine Runtime-Dependencies.** `package.json` existiert nur für `npm test`; `dependencies` und `devDependencies` bleiben leer. Tests laufen mit `node --test`.
- **ViewBox-Raster.** Jedes figurgrosse SVG benutzt `0 0 300 620`. Alle Kleidungsteile beider Figuren sitzen auf denselben Ankerpunkten, damit dieselben Render-Ebenen für beide Figuren gelten.
- **Sprache.** Alle sichtbaren Texte, Item- und Themennamen sind Deutsch. Code-Bezeichner sind Englisch, so wie heute schon.
- **`localStorage`-Key bleibt `stylestar_v1`.** Versioniert wird der Wert über das Feld `v`, nicht der Key — ein neuer Key würde bestehenden Fortschritt wegwerfen.
- **Item-IDs sind nur innerhalb einer Figur eindeutig.** `t1` darf es bei beiden Figuren geben; jeder Lookup läuft über `ITEM_BY_ID` der aktiven Figur.
- **Der Mädchen-Inhalt bleibt bitgleich.** Task 1 verschiebt ihn, ohne eine Farbe, eine Koordinate oder eine ID zu ändern.
- **Commits** folgen Conventional Commits auf Deutsch/Englisch gemischt wie im Repo üblich (`feat:`, `refactor:`, `test:`, `docs:`).

---

## File Structure

| Datei | Verantwortung |
| --- | --- |
| `wardrobe-core.js` | *(neu)* SVG-Primitiven, `SKINS`, ViewBox-Tabelle, `buildItems`, `buildHair` |
| `wardrobe-girl.js` | *(neu)* `CHARACTER` der Mädchen-Figur — heutiger Inhalt, verschoben |
| `wardrobe-boy.js` | *(neu)* `CHARACTER` der Jungen-Figur — neuer Inhalt |
| `wardrobe.js` | *(umgebaut)* Registry: `CHARACTERS`, `CHAR_IDS`, `SKINS` |
| `progress.js` | *(neu)* `localStorage`-Format v2, Migration aus dem alten Format |
| `tests/wardrobe.test.mjs` | *(neu)* Daten-Invarianten über beide Figuren |
| `tests/progress.test.mjs` | *(neu)* Migration und Defaults |
| `package.json` | *(neu)* nur `"test": "node --test tests/"` |
| `index.html` | *(modifiziert)* `char`-State, Zugriff über die aktive Figur, Figurwahl im Startscreen |

---

## Task 1: Kleiderschrank in Core + Figur-Modul + Registry aufteilen

Die Mädchen-Figur läuft danach durch die neue Struktur, sieht im Spiel identisch aus, und die Invarianten-Suite ist grün. Es entsteht noch keine zweite Figur.

**Files:**
- Create: `package.json`
- Create: `wardrobe-core.js`
- Create: `wardrobe-girl.js`
- Create: `tests/wardrobe.test.mjs`
- Modify: `wardrobe.js` (Inhalt wird vollständig ersetzt)

**Interfaces:**
- Consumes: nichts (erste Task)
- Produces:
  - `wardrobe-core.js`: `FULL: string`, `uri(inner: string, vb?: string) => string`, `BLANK: string`, `sp(x,y,s,c?) => string`, `dot(x,y,r,c?) => string`, `fl(x,y) => string`, `SKINS: string[]`, `TVB: Record<string,string>`, `capSleeve(c) => string`, `tank(c) => string`, `sleeves(c) => string`, `hip(c) => string`, `legs(c,y,w) => string`, `buildItems(rawItems, evb?) => { ITEMS, ITEM_BY_ID }`, `buildHair(hairDefs, faceFill?) => HairItem[]`
  - `wardrobe-girl.js`: `CHARACTER` mit `{ id, name, dollUri, HAIR, ITEMS, ITEM_BY_ID, THEMES, tabs, defaultWorn }`
  - `wardrobe.js`: `CHARACTERS: Record<string, Character>`, `CHAR_IDS: string[]`, `SKINS: string[]`

- [ ] **Step 1: `package.json` anlegen**

```json
{
  "name": "game-styleup",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test tests/"
  }
}
```

- [ ] **Step 2: Die fehlschlagende Test-Suite schreiben**

`tests/wardrobe.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHARACTERS, CHAR_IDS, SKINS } from '../wardrobe.js';

// Genau die vier Kategorien, die in finish() Punkte geben. 'dress' fehlt hier
// bewusst: der Kleid-Zweig ist eine Alternative zu Oberteil + Unterteil, keine
// zusätzliche Pflicht — schon beim Mädchen haben sport/festival/winter/kpop
// kein passendes Kleid.
const SCORING_CATS = ['top', 'bottom', 'shoes', 'extra'];

test('Registry kennt genau die erwarteten Figuren', () => {
  assert.deepEqual(CHAR_IDS, ['girl', 'boy']);
  for (const id of CHAR_IDS) {
    assert.equal(CHARACTERS[id].id, id, `CHARACTERS.${id}.id muss '${id}' sein`);
    assert.ok(CHARACTERS[id].name.length > 0, `CHARACTERS.${id}.name fehlt`);
  }
});

test('SKINS ist eine nicht-leere Liste von Hex-Farben', () => {
  assert.ok(SKINS.length > 0);
  for (const c of SKINS) assert.match(c, /^#[0-9A-Fa-f]{6}$/);
});

for (const charId of ['girl', 'boy']) {
  test(`${charId}: jedes Thema ist mit drei Sternen lösbar`, () => {
    const C = CHARACTERS[charId];
    for (const theme of C.THEMES) {
      for (const cat of SCORING_CATS) {
        const hit = (C.ITEMS[cat] || []).some(it => it.tags.includes(theme.id));
        assert.ok(hit, `${charId}/${theme.id}: kein passendes Teil in '${cat}'`);
      }
    }
  });

  test(`${charId}: jedes theme.sig löst in ITEM_BY_ID auf`, () => {
    const C = CHARACTERS[charId];
    for (const theme of C.THEMES) {
      assert.ok(C.ITEM_BY_ID[theme.sig], `${charId}/${theme.id}: sig '${theme.sig}' unbekannt`);
    }
  });

  test(`${charId}: keine doppelten IDs innerhalb der Figur`, () => {
    const C = CHARACTERS[charId];
    const seen = new Set();
    const ids = [...C.HAIR.map(h => h.id), ...Object.values(C.ITEMS).flat().map(i => i.id)];
    for (const id of ids) {
      assert.ok(!seen.has(id), `${charId}: ID '${id}' kommt doppelt vor`);
      seen.add(id);
    }
  });

  test(`${charId}: jeder Tag zeigt auf ein existierendes Thema`, () => {
    const C = CHARACTERS[charId];
    const themeIds = new Set(C.THEMES.map(t => t.id));
    for (const it of Object.values(C.ITEMS).flat()) {
      for (const tag of it.tags) {
        assert.ok(themeIds.has(tag), `${charId}/${it.id}: unbekannter Tag '${tag}'`);
      }
    }
  });

  test(`${charId}: defaultWorn verweist nur auf existierende Teile`, () => {
    const C = CHARACTERS[charId];
    assert.ok(C.HAIR.some(h => h.id === C.defaultWorn.hair),
      `${charId}: defaultWorn.hair '${C.defaultWorn.hair}' unbekannt`);
    for (const [cat, id] of Object.entries(C.defaultWorn)) {
      if (cat === 'hair' || id === null) continue;
      assert.ok(C.ITEM_BY_ID[id], `${charId}: defaultWorn.${cat} '${id}' unbekannt`);
    }
  });

  test(`${charId}: kein Tab zeigt auf eine leere Kategorie`, () => {
    const C = CHARACTERS[charId];
    for (const [cat] of C.tabs) {
      const n = cat === 'hair' ? C.HAIR.length : (C.ITEMS[cat] || []).length;
      assert.ok(n > 0, `${charId}: Tab '${cat}' ist leer`);
    }
  });
}

test('boy trägt keine Kleider', () => {
  const C = CHARACTERS.boy;
  assert.equal(C.defaultWorn.dress, null);
  assert.equal((C.ITEMS.dress || []).length, 0);
  assert.ok(!C.tabs.some(([cat]) => cat === 'dress'), 'boy darf keinen Kleider-Tab haben');
});
```

- [ ] **Step 3: Test laufen lassen und Fehlschlag bestätigen**

Run: `npm test`
Expected: FAIL — `wardrobe.js` exportiert weder `CHARACTERS` noch `CHAR_IDS`; die Import-Zeile wirft `SyntaxError: The requested module './../wardrobe.js' does not provide an export named 'CHARACTERS'`.

- [ ] **Step 4: `wardrobe-core.js` anlegen**

Die Funktionskörper werden **wörtlich** aus dem heutigen `wardrobe.js` übernommen (Zeilen 2–9 und 31–37) und nur mit `export` versehen. `buildItems` ist die heutige Schleife vom Dateiende, `buildHair` die heutige `.map(h => …)`-Kette hinter dem `HAIR`-Array.

```js
// StyleUp! – gemeinsame SVG-Bausteine für alle Figuren
export const FULL = '0 0 300 620';
export const uri = (inner, vb = FULL) => 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb + '">' + inner + '</svg>');
export const BLANK = uri('', '0 0 1 1');

export const sp = (x, y, s, c = '#fff') => `<path d='M${x} ${y - s} L${x + s * .35} ${y - s * .35} L${x + s} ${y} L${x + s * .35} ${y + s * .35} L${x} ${y + s} L${x - s * .35} ${y + s * .35} L${x - s} ${y} L${x - s * .35} ${y - s * .35} Z' fill='${c}'/>`;
export const dot = (x, y, r, c = '#fff') => `<circle cx='${x}' cy='${y}' r='${r}' fill='${c}'/>`;
export const fl = (x, y) => [0, 72, 144, 216, 288].map(a => dot(x + 5.5 * Math.cos(a * Math.PI / 180), y + 5.5 * Math.sin(a * Math.PI / 180), 4, '#FBB6D9')).join('') + dot(x, y, 3.2, '#FFCB47');

export const SKINS = ['#F8CEAA', '#DCA478', '#9C6B43'];

export const capSleeve = c => `<path d='M102 160 Q150 144 198 160 L207 212 Q197 222 187 214 L187 258 Q150 272 113 258 L113 214 Q103 222 93 212 Z' fill='${c}'/>`;
export const tank = c => `<path d='M112 164 Q150 152 188 164 L187 258 Q150 272 113 258 Z' fill='${c}'/>`;
export const sleeves = c => `<path d='M97 168 L88 296' stroke='${c}' stroke-width='21' stroke-linecap='round' fill='none'/><path d='M203 168 L212 296' stroke='${c}' stroke-width='21' stroke-linecap='round' fill='none'/>`;
export const hip = c => `<path d='M116 250 Q150 263 184 250 L187 298 Q150 312 113 298 Z' fill='${c}'/>`;
export const legs = (c, y, w) => `<path d='M133 292 L130 ${y}' stroke='${c}' stroke-width='${w}' stroke-linecap='round' fill='none'/><path d='M167 292 L170 ${y}' stroke='${c}' stroke-width='${w}' stroke-linecap='round' fill='none'/>`;

export const TVB = { top: '80 130 145 165', bottom: '85 235 130 320', dress: '55 135 190 430', shoes: '95 500 110 100', hair: '55 0 190 250' };

// Baut aus rohen Item-Definitionen die gerenderten Listen plus die Lookup-Map.
// evb hält die Extra-ViewBoxes, weil Extras über die ganze Figur verteilt sitzen
// und sich keinen gemeinsamen Thumbnail-Ausschnitt teilen.
export function buildItems(rawItems, evb = {}) {
  const ITEMS = {}, ITEM_BY_ID = {};
  for (const cat of Object.keys(rawItems)) {
    ITEMS[cat] = rawItems[cat].map(it => {
      const vb = cat === 'extra' ? evb[it.id] : TVB[cat];
      const o = { id: it.id, name: it.name, tags: it.tags, cat, img: uri(it.art), thumb: uri(it.art, vb) };
      ITEM_BY_ID[it.id] = o;
      return o;
    });
  }
  return { ITEMS, ITEM_BY_ID };
}

// faceFill ist der Gesichtston im Frisuren-Thumbnail. Er ist bewusst ein
// Parameter mit dem heutigen Festwert als Default, damit sich die Optik durch
// diesen Refactor nicht ändert.
export function buildHair(hairDefs, faceFill = '#F3D9C0') {
  return hairDefs.map(h => ({
    ...h,
    backImg: uri(h.back),
    frontImg: uri(h.front),
    thumb: uri(h.back + `<ellipse cx='150' cy='88' rx='50' ry='54' fill='${faceFill}'/>` + h.front, TVB.hair),
  }));
}
```

- [ ] **Step 5: `wardrobe-girl.js` anlegen**

Inhalt wird aus dem heutigen `wardrobe.js` übernommen — `dollUri`, das `HAIR`-Array, `rawItems`, `EVB`, `THEMES` bleiben **zeichengleich**. Neu sind nur die Import-Zeile, der Aufruf von `buildHair`/`buildItems` und der `CHARACTER`-Export am Ende.

```js
// StyleUp! – Kleiderschrank der Mädchen-Figur
import { uri, sp, dot, fl, capSleeve, tank, sleeves, hip, legs, buildItems, buildHair } from './wardrobe-core.js';

const dollUri = (c) => uri(`
<path d='M97 168 L86 300' stroke='${c}' stroke-width='17' stroke-linecap='round' fill='none'/>
<path d='M203 168 L214 300' stroke='${c}' stroke-width='17' stroke-linecap='round' fill='none'/>
<path d='M134 300 L131 562' stroke='${c}' stroke-width='27' stroke-linecap='round' fill='none'/>
<path d='M166 300 L169 562' stroke='${c}' stroke-width='27' stroke-linecap='round' fill='none'/>
<ellipse cx='127' cy='572' rx='19' ry='10' fill='${c}'/><ellipse cx='173' cy='572' rx='19' ry='10' fill='${c}'/>
<rect x='140' y='112' width='20' height='46' fill='${c}'/>
<path d='M105 162 Q150 146 195 162 Q201 226 178 252 L178 302 Q150 314 122 302 L122 252 Q99 226 105 162 Z' fill='${c}'/>
<ellipse cx='102' cy='92' rx='10' ry='12' fill='${c}'/><ellipse cx='198' cy='92' rx='10' ry='12' fill='${c}'/>
<ellipse cx='150' cy='88' rx='50' ry='54' fill='${c}'/>
<circle cx='131' cy='90' r='5.5' fill='#4A3728'/><circle cx='169' cy='90' r='5.5' fill='#4A3728'/>
<circle cx='133' cy='88' r='1.8' fill='#fff'/><circle cx='171' cy='88' r='1.8' fill='#fff'/>
<path d='M122 76 Q131 71 140 75' stroke='#4A3728' stroke-width='2.5' stroke-linecap='round' fill='none'/>
<path d='M160 75 Q169 71 178 76' stroke='#4A3728' stroke-width='2.5' stroke-linecap='round' fill='none'/>
<path d='M139 109 Q150 119 161 109' stroke='#B34A55' stroke-width='3' stroke-linecap='round' fill='none'/>
<circle cx='117' cy='103' r='6' fill='#F79FB0' opacity='.5'/><circle cx='183' cy='103' r='6' fill='#F79FB0' opacity='.5'/>
<path d='M118 196 L118 300 Q150 312 182 300 L182 196 Q150 210 118 196 Z' fill='#FFFFFF'/>
<path d='M118 294 Q150 308 182 294 L184 328 L156 332 L150 320 L144 332 L116 328 Z' fill='#EDE7F5'/>
`);

const HAIR = buildHair([
  // ---- unverändert aus dem alten wardrobe.js übernehmen (h1 … h6) ----
  { id: 'h1', name: 'Lange Mähne', c: '#F2C14E',
    back: `<path d='M90 80 Q150 4 210 80 L216 298 Q183 316 150 316 Q117 316 84 298 Z' fill='#F2C14E'/>`,
    front: `<path d='M97 96 Q94 28 150 24 Q206 28 203 96 Q198 102 193 96 Q195 54 150 50 Q105 54 107 96 Q102 102 97 96 Z' fill='#F2C14E'/>` },
  { id: 'h2', name: 'Pferdeschwanz', c: '#8A5B34',
    back: `<path d='M94 86 Q150 8 206 86 L206 130 L94 130 Z' fill='#8A5B34'/><path d='M198 58 Q248 92 232 190 Q224 240 208 258' stroke='#8A5B34' stroke-width='24' fill='none' stroke-linecap='round'/>`,
    front: `<path d='M97 96 Q94 28 150 24 Q206 28 203 96 Q198 102 193 96 Q195 54 150 50 Q105 54 107 96 Q102 102 97 96 Z' fill='#8A5B34'/><circle cx='200' cy='54' r='9' fill='#F45FA2'/>` },
  { id: 'h3', name: 'Frecher Bob', c: '#3A3A46',
    back: `<path d='M92 84 Q150 8 208 84 L212 160 Q212 188 186 190 L114 190 Q88 188 88 160 Z' fill='#3A3A46'/>`,
    front: `<path d='M98 96 Q95 26 150 24 Q205 26 202 96 L186 96 L186 64 L114 64 L114 96 Z' fill='#3A3A46'/>` },
  { id: 'h4', name: 'Zauberwellen', c: '#F27FB2',
    back: `<path d='M90 80 Q150 4 210 80 Q222 130 210 170 Q224 210 210 250 Q220 285 200 305 Q150 322 100 305 Q80 285 90 250 Q76 210 90 170 Q78 130 90 80 Z' fill='#F27FB2'/>`,
    front: `<path d='M97 96 Q94 28 150 24 Q206 28 203 96 Q198 102 193 96 Q195 54 150 50 Q105 54 107 96 Q102 102 97 96 Z' fill='#F27FB2'/>` },
  { id: 'h5', name: 'Zöpfe', c: '#C4593B',
    back: `<path d='M94 84 Q150 8 206 84 L206 126 L94 126 Z' fill='#C4593B'/>`,
    front: `<path d='M97 96 Q94 28 150 24 Q206 28 203 96 Q198 102 193 96 Q195 54 150 50 Q105 54 107 96 Q102 102 97 96 Z' fill='#C4593B'/>` +
      [[97, 138], [94, 170], [92, 202], [203, 138], [206, 170], [208, 202]].map(p => dot(p[0], p[1], 13, '#C4593B')).join('') +
      `<circle cx='91' cy='224' r='6' fill='#35C9C0'/><circle cx='209' cy='224' r='6' fill='#35C9C0'/>` },
  { id: 'h6', name: 'Wilde Locken', c: '#5B3A26',
    back: `<ellipse cx='150' cy='100' rx='64' ry='74' fill='#5B3A26'/>` + [[104, 66], [150, 40], [196, 66], [96, 118], [204, 118], [102, 168], [198, 168]].map(p => dot(p[0], p[1], 26, '#5B3A26')).join(''),
    front: `<path d='M99 92 Q98 30 150 26 Q202 30 201 92 Q196 60 150 54 Q104 60 99 92 Z' fill='#5B3A26'/>` + dot(103, 92, 12, '#5B3A26') + dot(197, 92, 12, '#5B3A26') },
]);

const rawItems = {
  // ---- unverändert aus dem alten wardrobe.js übernehmen ----
  // top: t1 … t9, bottom: b1 … b7, dress: d1 … d4, shoes: s1 … s6, extra: e1 … e9
};

const EVB = { e1: '85 15 130 70', e2: '95 0 110 65', e3: '90 60 120 55', e4: '180 275 70 75', e5: '95 20 110 60', e6: '110 150 80 55', e7: '88 0 124 85', e8: '82 5 136 105', e9: '85 15 130 75' };

const { ITEMS, ITEM_BY_ID } = buildItems(rawItems, EVB);

const THEMES = [
  { id: 'pyjama', name: 'Pyjama-Party', hints: ['kuschelig', 'Sterne', 'gemütlich'], sig: 'd4' },
  { id: 'schule', name: 'Schulparty', hints: ['schick', 'Glitzer', 'cool'], sig: 'd3' },
  { id: 'strand', name: 'Strand & Sommer', hints: ['sonnig', 'luftig', 'Sommer'], sig: 'd2' },
  { id: 'sport', name: 'Sport & Streetwear', hints: ['sportlich', 'bequem', 'aktiv'], sig: 't9' },
  { id: 'festival', name: 'Festival', hints: ['Boho', 'Fransen', 'Blumen'], sig: 't4' },
  { id: 'winter', name: 'Winter-Style', hints: ['warm', 'flauschig', 'Schnee'], sig: 't7' },
  { id: 'kpop', name: 'K-Pop Star', hints: ['Bühne', 'Glitzer', 'Neon'], sig: 't8' },
  { id: 'ball', name: 'Prinzessinnen-Ball', hints: ['elegant', 'funkelnd', 'royal'], sig: 'd1' },
];

export const CHARACTER = {
  id: 'girl',
  name: 'Mädchen',
  dollUri,
  HAIR, ITEMS, ITEM_BY_ID, THEMES,
  tabs: [['hair', 'Haare'], ['dress', 'Kleider'], ['top', 'Oben'], ['bottom', 'Unten'], ['shoes', 'Schuhe'], ['extra', 'Extras']],
  defaultWorn: { hair: 'h1', top: 't2', bottom: 'b2', dress: null, shoes: 's2', extra: null },
};
```

Für `rawItems` gilt: das komplette Objekt aus dem heutigen `wardrobe.js` (Zeilen 41–121, ab `const rawItems = {` bis zur schliessenden Klammer) unverändert einsetzen. Es referenziert `sp`, `dot`, `fl`, `capSleeve`, `tank`, `sleeves`, `hip`, `legs` — alle oben importiert, also ohne weitere Anpassung lauffähig.

- [ ] **Step 6: `wardrobe.js` zur Registry umbauen**

Der bisherige Inhalt wird vollständig ersetzt:

```js
// StyleUp! – Figur-Registry. Der einzige Kleiderschrank-Import in index.html.
import { CHARACTER as girl } from './wardrobe-girl.js';
import { CHARACTER as boy } from './wardrobe-boy.js';

export { SKINS } from './wardrobe-core.js';

export const CHARACTERS = { girl, boy };
export const CHAR_IDS = ['girl', 'boy'];
```

`wardrobe-boy.js` existiert in dieser Task noch nicht. Damit die Suite bis auf die Jungen-Zusicherungen laufen kann, wird in diesem Schritt ein **Platzhalter-Modul** angelegt, das die Form erfüllt und in Task 4 mit Inhalt gefüllt wird:

```js
// StyleUp! – Kleiderschrank der Jungen-Figur (Inhalt folgt in Task 4)
import { uri, buildItems } from './wardrobe-core.js';

const dollUri = (c) => uri(`<ellipse cx='150' cy='88' rx='50' ry='54' fill='${c}'/>`);
const { ITEMS, ITEM_BY_ID } = buildItems({ top: [], bottom: [], dress: [], shoes: [], extra: [] }, {});

export const CHARACTER = {
  id: 'boy',
  name: 'Junge',
  dollUri,
  HAIR: [], ITEMS, ITEM_BY_ID, THEMES: [],
  tabs: [],
  defaultWorn: { hair: null, top: null, bottom: null, dress: null, shoes: null, extra: null },
};
```

- [ ] **Step 7: Tests laufen lassen**

Run: `npm test`
Expected: Die Girl-Tests und `boy trägt keine Kleider` sind grün. Die Boy-Tests `jedes Thema ist mit drei Sternen lösbar`, `jedes theme.sig löst in ITEM_BY_ID auf`, `defaultWorn verweist nur auf existierende Teile` und `kein Tab zeigt auf eine leere Kategorie` laufen über leere Listen und sind damit **vacuously** grün — bis auf `defaultWorn.hair`, das fehlschlägt.

Dieser Fehlschlag ist gewollt und markiert den offenen Jungen-Inhalt. Ihn hier zu beheben, hiesse den Platzhalter zu verstecken.

Um die Suite trotzdem als Gate benutzen zu können, wird der Boy-Block in dieser Task übersprungen: Die `for (const charId of ['girl', 'boy'])`-Schleife wird vorübergehend auf `['girl']` gesetzt und in Task 4 zurückgedreht. Ebenso wird `assert.deepEqual(CHAR_IDS, ['girl', 'boy'])` bereits jetzt erfüllt, weil die Registry beide IDs kennt.

Erwartetes Ergebnis nach der Anpassung: **alle Tests grün**.

- [ ] **Step 8: Beweisen, dass der Mädchen-Inhalt den Umzug unverändert überstanden hat**

`rawItems` und `HAIR` wurden per Copy-Paste verschoben, nicht neu geschrieben. Ein einzelnes verrutschtes Zeichen in einem SVG-Pfad fällt visuell nicht auf, ändert aber das gerenderte Teil. Deshalb wird der Umzug gegen den letzten Commit vor dem Refactor gemessen, nicht nur angeschaut.

Vor dem Refactor (oder nachträglich aus `git show`) einen Referenz-Abzug erzeugen:

```bash
mkdir -p /tmp/styleup-ref
git show HEAD:wardrobe.js > /tmp/styleup-ref/wardrobe-old.js
node --input-type=module -e "
  const m = await import('/tmp/styleup-ref/wardrobe-old.js');
  const out = { hair: m.HAIR.map(h => [h.id, h.backImg, h.frontImg, h.thumb]),
                items: Object.values(m.ITEMS).flat().map(i => [i.id, i.cat, i.img, i.thumb]),
                themes: m.THEMES };
  console.log(JSON.stringify(out));
" > /tmp/styleup-ref/before.json
```

Nach dem Refactor dasselbe aus der neuen Struktur ziehen und vergleichen:

```bash
node --input-type=module -e "
  const { CHARACTERS } = await import('./wardrobe.js');
  const C = CHARACTERS.girl;
  const out = { hair: C.HAIR.map(h => [h.id, h.backImg, h.frontImg, h.thumb]),
                items: Object.values(C.ITEMS).flat().map(i => [i.id, i.cat, i.img, i.thumb]),
                themes: C.THEMES };
  console.log(JSON.stringify(out));
" > /tmp/styleup-ref/after.json
diff <(python3 -m json.tool /tmp/styleup-ref/before.json) <(python3 -m json.tool /tmp/styleup-ref/after.json) && echo "IDENTISCH"
```

Expected: `IDENTISCH`, kein Diff. Jede Abweichung nennt genau das Teil, bei dem das Kopieren schiefging.

- [ ] **Step 9: Visuell gegenprüfen, dass sich am Mädchen nichts geändert hat**

```bash
python3 -m http.server 8799 --directory . &
```

Im Browser `http://localhost:8799/` öffnen: Startscreen zeigt die Figur wie bisher, alle drei Hauttöne wirken, Themenwahl zeigt 8 Karten, im Ankleide-Screen sind alle 6 Tabs mit Inhalt gefüllt. Danach den Server beenden.

- [ ] **Step 10: Commit**

```bash
git add package.json wardrobe.js wardrobe-core.js wardrobe-girl.js wardrobe-boy.js tests/wardrobe.test.mjs
git commit -m "refactor(wardrobe): split into core, per-character modules and a registry"
```

---

## Task 2: `index.html` auf die Registry umstellen

Das Spiel liest alle Figur-Daten über die aktive Figur statt über das Modul. Sichtbar ändert sich nichts — es gibt weiterhin nur die Mädchen-Figur, aber der Zugriffspfad ist vorbereitet.

**Files:**
- Modify: `index.html:166-297` (State und `renderVals`)

**Interfaces:**
- Consumes: `CHARACTERS`, `CHAR_IDS`, `SKINS` aus `wardrobe.js` (Task 1)
- Produces: State-Feld `char: string`, lokale Konstante `C` in `renderVals`, figur-abhängiger Doll-Cache-Schlüssel

- [ ] **Step 1: State um `char` erweitern**

In `index.html`, im `state = { … }`-Block, `char` vor `skin` einfügen:

```js
  state = {
    ready: false, screen: 'start', char: 'girl', skin: 0, levelIdx: 0, tab: 'hair',
    worn: { hair: 'h1', top: 't2', bottom: 'b2', dress: null, shoes: 's2', extra: null },
    result: null, likesShown: 0, progress: { unlocked: 1, stars: {} }
  };
```

- [ ] **Step 2: `finish()` auf die aktive Figur umstellen**

Die erste Zeile von `finish()` wird von

```js
    const W = this.W, t = W.THEMES[this.state.levelIdx], w = this.state.worn;
    const fits = id => !!(id && W.ITEM_BY_ID[id] && W.ITEM_BY_ID[id].tags.includes(t.id));
```

zu

```js
    const C = this.W.CHARACTERS[this.state.char];
    const t = C.THEMES[this.state.levelIdx], w = this.state.worn;
    const fits = id => !!(id && C.ITEM_BY_ID[id] && C.ITEM_BY_ID[id].tags.includes(t.id));
```

Die Punkte- und Sterne-Rechnung darunter bleibt unverändert — sie funktioniert für die Jungen-Figur automatisch, weil dort `w.dress` immer `null` ist und damit der Zweig `fits(top) + fits(bottom)` greift.

Die Zeile `if (stars >= this.needStars()) prog.unlocked = Math.max(prog.unlocked, this.state.levelIdx + 2);` bleibt hier ebenfalls unverändert; sie wird erst in Task 3 auf den figur-getrennten Fortschritt umgestellt.

- [ ] **Step 3: `renderVals` auf die aktive Figur umstellen**

Direkt nach `const s = this.state, W = this.W;` einfügen:

```js
    const C = W.CHARACTERS[s.char];
```

Dann diese sechs Stellen ersetzen:

```js
    // vorher: vals.dollL = L(this._dolls[s.skin] = this._dolls[s.skin] || W.dollUri(W.SKINS[s.skin]));
    const dollKey = s.char + ':' + s.skin;
    vals.dollL = L(this._dolls[dollKey] = this._dolls[dollKey] || C.dollUri(W.SKINS[s.skin]));

    // vorher: const hair = W.HAIR.find(h => h.id === s.worn.hair) || W.HAIR[0];
    const hair = C.HAIR.find(h => h.id === s.worn.hair) || C.HAIR[0];

    // vorher: vals[cat + 'L'] = s.worn[cat] ? L(W.ITEM_BY_ID[s.worn[cat]].img) : HIDE;
    vals[cat + 'L'] = s.worn[cat] ? L(C.ITEM_BY_ID[s.worn[cat]].img) : HIDE;

    // vorher: vals.levels = W.THEMES.map((t, i) => {
    vals.levels = C.THEMES.map((t, i) => {

    // innerhalb von vals.levels, vorher: backgroundImage: 'url("' + W.ITEM_BY_ID[t.sig].thumb + '")'
    backgroundImage: 'url("' + C.ITEM_BY_ID[t.sig].thumb + '")',

    // vorher: const list = s.tab === 'hair' ? W.HAIR : W.ITEMS[s.tab];
    const list = s.tab === 'hair' ? C.HAIR : C.ITEMS[s.tab];
```

- [ ] **Step 4: Die hartcodierte Tab-Liste durch die der Figur ersetzen**

```js
    // vorher:
    // const tabDefs = [['hair', 'Haare'], ['dress', 'Kleider'], ['top', 'Oben'], ['bottom', 'Unten'], ['shoes', 'Schuhe'], ['extra', 'Extras']];
    // vals.tabs = tabDefs.map(([id, label]) => {
    vals.tabs = C.tabs.map(([id, label]) => {
```

Der Rest des `map`-Körpers bleibt unverändert.

- [ ] **Step 5: Themenname und Zähler über die Figur lesen**

```js
    // vorher: const theme = W.THEMES[s.levelIdx];
    const theme = C.THEMES[s.levelIdx];
    // vorher: vals.levelCount = W.THEMES.length;
    vals.levelCount = C.THEMES.length;
    // vorher: vals.canNext = s.result.stars >= this.needStars() && s.levelIdx + 1 < W.THEMES.length;
    vals.canNext = s.result.stars >= this.needStars() && s.levelIdx + 1 < C.THEMES.length;
```

- [ ] **Step 6: Prüfen, dass keine direkten Modulzugriffe übrig sind**

Run:

```bash
grep -n "W\.\(HAIR\|ITEMS\|THEMES\|ITEM_BY_ID\|dollUri\)" index.html
```

Expected: keine Ausgabe. Übrig bleiben dürfen nur `W.CHARACTERS`, `W.CHAR_IDS` und `W.SKINS`.

- [ ] **Step 7: Im Browser gegenprüfen**

Server starten wie in Task 1 Step 8. Durchspielen: Startscreen → Themenwahl → ein Thema öffnen → in jedem Tab ein Teil anziehen → „Fertig". Erwartung: identisches Verhalten wie vor der Änderung, keine Fehler in der Browser-Konsole.

- [ ] **Step 8: Commit**

```bash
git add index.html
git commit -m "refactor(game): read wardrobe data through the active character"
```

---

## Task 3: Fortschritt pro Figur mit Migration

**Files:**
- Create: `progress.js`
- Create: `tests/progress.test.mjs`
- Modify: `index.html` (`componentDidMount`, `save`, `finish`, `renderVals`)

**Interfaces:**
- Consumes: nichts aus vorherigen Tasks
- Produces: `progress.js` exportiert `STORAGE_KEY: string`, `blankChar() => { unlocked: number, stars: {} }`, `blankProgress() => Progress`, `migrate(parsed: unknown) => Progress` mit `Progress = { v: 2, chars: { girl: CharProgress, boy: CharProgress } }`

- [ ] **Step 1: Die fehlschlagenden Tests schreiben**

`tests/progress.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STORAGE_KEY, blankChar, blankProgress, migrate } from '../progress.js';

test('der Storage-Key bleibt stylestar_v1', () => {
  assert.equal(STORAGE_KEY, 'stylestar_v1');
});

test('blankProgress gibt beiden Figuren einen eigenen leeren Stand', () => {
  const p = blankProgress();
  assert.equal(p.v, 2);
  assert.deepEqual(p.chars.girl, { unlocked: 1, stars: {} });
  assert.deepEqual(p.chars.boy, { unlocked: 1, stars: {} });
  p.chars.girl.stars.pyjama = 3;
  assert.deepEqual(p.chars.boy.stars, {}, 'die Figuren dürfen sich kein Objekt teilen');
});

test('migrate übernimmt ein v2-Objekt unverändert', () => {
  const src = { v: 2, chars: { girl: { unlocked: 5, stars: { ball: 3 } }, boy: { unlocked: 2, stars: {} } } };
  assert.deepEqual(migrate(src), src);
});

test('migrate hebt das alte Flachformat auf das Mädchen', () => {
  const old = { unlocked: 4, stars: { pyjama: 3, schule: 2 } };
  const p = migrate(old);
  assert.equal(p.v, 2);
  assert.deepEqual(p.chars.girl, { unlocked: 4, stars: { pyjama: 3, schule: 2 } });
  assert.deepEqual(p.chars.boy, { unlocked: 1, stars: {} });
});

test('migrate füllt eine im v2-Objekt fehlende Figur auf', () => {
  const p = migrate({ v: 2, chars: { girl: { unlocked: 3, stars: {} } } });
  assert.deepEqual(p.chars.boy, { unlocked: 1, stars: {} });
});

test('migrate gibt für Müll einen frischen Stand', () => {
  for (const bad of [null, undefined, 0, 'nope', [], {}, { v: 99 }]) {
    assert.deepEqual(migrate(bad), blankProgress(), `Eingabe ${JSON.stringify(bad)}`);
  }
});

test('blankChar liefert jedes Mal ein neues Objekt', () => {
  assert.notEqual(blankChar(), blankChar());
  assert.deepEqual(blankChar(), { unlocked: 1, stars: {} });
});
```

- [ ] **Step 2: Test laufen lassen und Fehlschlag bestätigen**

Run: `npm test`
Expected: FAIL — `Cannot find module '…/progress.js'`.

- [ ] **Step 3: `progress.js` implementieren**

```js
// StyleUp! – Fortschritts-Format und Migration.
// Der Key bleibt bewusst 'stylestar_v1': ein neuer Key würde bestehenden
// Fortschritt wegwerfen. Versioniert wird stattdessen der Wert über 'v'.
export const STORAGE_KEY = 'stylestar_v1';

const CHAR_IDS = ['girl', 'boy'];

export const blankChar = () => ({ unlocked: 1, stars: {} });

export const blankProgress = () => ({
  v: 2,
  chars: Object.fromEntries(CHAR_IDS.map(id => [id, blankChar()])),
});

export function migrate(parsed) {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return blankProgress();

  // v2: übernehmen, aber jede fehlende Figur auffüllen.
  if (parsed.v === 2 && parsed.chars && typeof parsed.chars === 'object') {
    const chars = {};
    for (const id of CHAR_IDS) {
      const c = parsed.chars[id];
      chars[id] = (c && typeof c.unlocked === 'number' && c.stars && typeof c.stars === 'object')
        ? { unlocked: c.unlocked, stars: { ...c.stars } }
        : blankChar();
    }
    return { v: 2, chars };
  }

  // Altes Flachformat { unlocked, stars } — der gesamte Stand gehört dem Mädchen.
  if (typeof parsed.unlocked === 'number' && parsed.stars && typeof parsed.stars === 'object') {
    const p = blankProgress();
    p.chars.girl = { unlocked: parsed.unlocked, stars: { ...parsed.stars } };
    return p;
  }

  return blankProgress();
}
```

- [ ] **Step 4: Tests laufen lassen**

Run: `npm test`
Expected: PASS — alle Tests aus `tests/progress.test.mjs` und `tests/wardrobe.test.mjs` grün.

- [ ] **Step 5: `index.html` auf das neue Format umstellen**

`componentDidMount` lädt beide Module und migriert beim Lesen:

```js
  componentDidMount() {
    Promise.all([import('./wardrobe.js'), import('./progress.js')]).then(([w, p]) => {
      this.W = w; this.P = p;
      let raw = null;
      try { raw = JSON.parse(localStorage.getItem(p.STORAGE_KEY)); } catch (e) {}
      this.setState({ ready: true, progress: p.migrate(raw) });
    });
  }
```

`save` schreibt das migrierte Objekt:

```js
  save(p) { try { localStorage.setItem(this.P.STORAGE_KEY, JSON.stringify(p)); } catch (e) {} }
```

Der Default im State wird auf die neue Form gezogen:

```js
    result: null, likesShown: 0, progress: { v: 2, chars: { girl: { unlocked: 1, stars: {} }, boy: { unlocked: 1, stars: {} } } }
```

- [ ] **Step 6: `finish()` auf den figur-getrennten Stand umstellen**

Der Block ab `const prog = …` wird ersetzt durch:

```js
    const cur = this.state.progress.chars[this.state.char];
    const mine = { unlocked: cur.unlocked, stars: { ...cur.stars } };
    mine.stars[t.id] = Math.max(mine.stars[t.id] || 0, stars);
    if (stars >= this.needStars()) mine.unlocked = Math.max(mine.unlocked, this.state.levelIdx + 2);
    const prog = { v: 2, chars: { ...this.state.progress.chars, [this.state.char]: mine } };
    this.save(prog);
```

Die Zeile `this.setState({ result: { stars, likes }, likesShown: 0, progress: prog });` darunter bleibt unverändert.

- [ ] **Step 7: Die Themenwahl auf den figur-getrennten Stand umstellen**

In `renderVals`:

```js
    // vorher: const unlocked = this.props.alleThemenOffen ? 99 : s.progress.unlocked;
    const mine = s.progress.chars[s.char];
    const unlocked = this.props.alleThemenOffen ? 99 : mine.unlocked;

    // innerhalb von vals.levels, vorher: const locked = i >= unlocked, st = s.progress.stars[t.id] || 0;
    const locked = i >= unlocked, st = mine.stars[t.id] || 0;
```

- [ ] **Step 8: Migration im Browser gegenprüfen**

Server starten, dann in der Browser-Konsole den alten Stand setzen und neu laden:

```js
localStorage.setItem('stylestar_v1', JSON.stringify({ unlocked: 4, stars: { pyjama: 3, schule: 2 } }));
location.reload();
```

Erwartung: Die Themenwahl zeigt vier freigeschaltete Themen, Pyjama-Party mit 3 und Schulparty mit 2 Sternen. Danach `JSON.parse(localStorage.getItem('stylestar_v1'))` prüfen — es muss das v2-Format mit `chars.girl` und `chars.boy` zeigen.

- [ ] **Step 9: Commit**

```bash
git add progress.js tests/progress.test.mjs index.html
git commit -m "feat(progress): store progress per character and migrate the old format"
```

---

## Task 4: Jungen-Kleiderschrank

Ersetzt das Platzhalter-Modul aus Task 1 durch den vollständigen Inhalt und dreht die in Task 1 Step 7 eingeschränkte Test-Schleife zurück.

**Files:**
- Modify: `wardrobe-boy.js` (Inhalt wird vollständig ersetzt)
- Modify: `tests/wardrobe.test.mjs` (Schleife zurück auf beide Figuren)

**Interfaces:**
- Consumes: `uri`, `sp`, `dot`, `capSleeve`, `tank`, `sleeves`, `hip`, `legs`, `buildItems`, `buildHair` aus `wardrobe-core.js`
- Produces: `CHARACTER` der Jungen-Figur in derselben Form wie `wardrobe-girl.js`

- [ ] **Step 1: Die Test-Schleife auf beide Figuren zurückdrehen**

In `tests/wardrobe.test.mjs`:

```js
// vorher: for (const charId of ['girl']) {
for (const charId of ['girl', 'boy']) {
```

- [ ] **Step 2: Tests laufen lassen und Fehlschlag bestätigen**

Run: `npm test`
Expected: FAIL — `boy: defaultWorn.hair 'null' unbekannt` und (sobald Themen existieren) die Solvability-Zusicherung. Das ist der rote Ausgangspunkt für den Inhalt.

- [ ] **Step 3: Die Jungen-Figur zeichnen**

`wardrobe-boy.js`, erster Abschnitt. Gleiches ViewBox-Raster und gleiche Ankerpunkte wie beim Mädchen, damit alle Kleidungs-SVGs passen. Unterschiede: breitere Schulterpartie, kräftigerer Oberkörper, kein Wangenrot, Boxershorts statt Unterwäsche-Set.

```js
// StyleUp! – Kleiderschrank der Jungen-Figur
import { uri, sp, dot, capSleeve, tank, sleeves, hip, legs, buildItems, buildHair } from './wardrobe-core.js';

const dollUri = (c) => uri(`
<path d='M95 170 L84 300' stroke='${c}' stroke-width='19' stroke-linecap='round' fill='none'/>
<path d='M205 170 L216 300' stroke='${c}' stroke-width='19' stroke-linecap='round' fill='none'/>
<path d='M134 300 L131 562' stroke='${c}' stroke-width='29' stroke-linecap='round' fill='none'/>
<path d='M166 300 L169 562' stroke='${c}' stroke-width='29' stroke-linecap='round' fill='none'/>
<ellipse cx='127' cy='572' rx='20' ry='10' fill='${c}'/><ellipse cx='173' cy='572' rx='20' ry='10' fill='${c}'/>
<rect x='139' y='112' width='22' height='48' fill='${c}'/>
<path d='M100 164 Q150 146 200 164 Q206 226 180 250 L180 302 Q150 314 120 302 L120 250 Q94 226 100 164 Z' fill='${c}'/>
<ellipse cx='100' cy='92' rx='10' ry='12' fill='${c}'/><ellipse cx='200' cy='92' rx='10' ry='12' fill='${c}'/>
<ellipse cx='150' cy='88' rx='49' ry='53' fill='${c}'/>
<circle cx='131' cy='90' r='5.5' fill='#4A3728'/><circle cx='169' cy='90' r='5.5' fill='#4A3728'/>
<circle cx='133' cy='88' r='1.8' fill='#fff'/><circle cx='171' cy='88' r='1.8' fill='#fff'/>
<path d='M121 75 Q131 70 141 76' stroke='#4A3728' stroke-width='3' stroke-linecap='round' fill='none'/>
<path d='M159 76 Q169 70 179 75' stroke='#4A3728' stroke-width='3' stroke-linecap='round' fill='none'/>
<path d='M139 110 Q150 118 161 110' stroke='#B34A55' stroke-width='3' stroke-linecap='round' fill='none'/>
<path d='M118 250 Q150 264 182 250 L186 322 L156 322 L150 306 L144 322 L114 322 Z' fill='#5B84C4'/>
`);
```

- [ ] **Step 4: Frisuren anlegen**

```js
const HAIR = buildHair([
  { id: 'h1', name: 'Kurzhaarschnitt', c: '#8A5B34',
    back: `<path d='M96 88 Q150 18 204 88 L204 120 L96 120 Z' fill='#8A5B34'/>`,
    front: `<path d='M99 94 Q97 32 150 28 Q203 32 201 94 Q196 62 150 56 Q104 62 99 94 Z' fill='#8A5B34'/>` },
  { id: 'h2', name: 'Struppelkopf', c: '#3A3A46',
    back: `<path d='M96 90 Q150 16 204 90 L204 118 L96 118 Z' fill='#3A3A46'/>`,
    front: `<path d='M99 92 Q98 30 150 26 Q202 30 201 92 Q196 58 150 52 Q104 58 99 92 Z' fill='#3A3A46'/>` +
      [[112, 46], [132, 32], [152, 27], [172, 33], [190, 48]].map(p => dot(p[0], p[1], 11, '#3A3A46')).join('') },
  { id: 'h3', name: 'Undercut', c: '#F2C14E',
    back: `<path d='M98 92 Q150 20 202 92 L202 116 L98 116 Z' fill='#F2C14E'/>`,
    front: `<path d='M100 92 Q100 34 150 28 Q200 34 200 92 L182 92 Q186 58 150 54 Q116 60 118 92 Z' fill='#F2C14E'/><path d='M118 66 Q150 46 182 66' stroke='#D9A02E' stroke-width='4' fill='none'/>` },
  { id: 'h4', name: 'Lockenkopf', c: '#5B3A26',
    back: `<ellipse cx='150' cy='86' rx='60' ry='62' fill='#5B3A26'/>` + [[108, 52], [150, 32], [192, 52], [100, 100], [200, 100]].map(p => dot(p[0], p[1], 23, '#5B3A26')).join(''),
    front: `<path d='M101 90 Q100 32 150 28 Q200 32 199 90 Q194 58 150 52 Q106 58 101 90 Z' fill='#5B3A26'/>` + dot(106, 86, 12, '#5B3A26') + dot(194, 86, 12, '#5B3A26') },
  { id: 'h5', name: 'Surfer-Mähne', c: '#D9A441',
    back: `<path d='M94 84 Q150 10 206 84 L208 208 Q180 222 150 222 Q120 222 92 208 Z' fill='#D9A441'/>`,
    front: `<path d='M98 96 Q96 30 150 26 Q204 30 202 96 Q196 60 168 56 Q140 54 120 70 Q106 80 98 96 Z' fill='#D9A441'/>` },
  { id: 'h6', name: 'Buzzcut', c: '#2F2A26',
    back: `<path d='M100 94 Q150 26 200 94 L200 112 L100 112 Z' fill='#2F2A26'/>`,
    front: `<path d='M102 92 Q102 38 150 34 Q198 38 198 92 Q192 66 150 62 Q108 66 102 92 Z' fill='#2F2A26' opacity='.9'/>` },
]);
```

- [ ] **Step 5: Kleiderschrank anlegen**

```js
const rawItems = {
  top: [
    { id: 't1', name: 'Sternen-Schlafshirt', tags: ['pyjama'], art: sleeves('#7C86E8') + capSleeve('#7C86E8') + sp(133, 196, 7) + sp(167, 228, 6) + sp(150, 176, 5) },
    { id: 't2', name: 'Streifen-Shirt', tags: ['schule'], art: capSleeve('#4A7DF4') + [186, 206, 226, 246].map(y => `<path d='M115 ${y} Q150 ${y + 8} 185 ${y}' stroke='#fff' stroke-width='6' fill='none'/>`).join('') },
    { id: 't3', name: 'Strand-Tanktop', tags: ['strand'], art: tank('#35C9C0') + `<path d='M116 242 Q133 234 150 242 Q167 250 184 242' stroke='#fff' stroke-width='4' fill='none' stroke-linecap='round'/>` },
    { id: 't4', name: 'Fussball-Trikot', tags: ['fussball'], art: capSleeve('#E8433A') + `<path d='M136 158 L150 176 L164 158' stroke='#fff' stroke-width='5' fill='none'/><text x='150' y='232' font-family='Fredoka,sans-serif' font-size='44' font-weight='700' fill='#fff' text-anchor='middle'>9</text>` },
    { id: 't5', name: 'Skater-Hoodie', tags: ['skater', 'schule'], art: sleeves('#6BC4A4') + capSleeve('#6BC4A4') + `<path d='M120 170 Q150 198 180 170 Q180 150 150 145 Q120 150 120 170 Z' fill='#4FAE8C'/><rect x='128' y='222' width='44' height='26' rx='11' fill='#4FAE8C'/><path d='M142 182 L142 200 M158 182 L158 200' stroke='#fff' stroke-width='3' stroke-linecap='round'/>` },
    { id: 't6', name: 'Norweger-Pulli', tags: ['winter'], art: sleeves('#D65A5A') + capSleeve('#D65A5A') + `<path d='M113 210 L123 199 L133 210 L143 199 L153 210 L163 199 L173 210 L183 199' stroke='#fff' stroke-width='4' fill='none' stroke-linecap='round'/>` + [[122, 180], [150, 174], [178, 180]].map(p => dot(p[0], p[1], 2.8)).join('') },
    { id: 't7', name: 'Lederjacke', tags: ['rockstar'], art: sleeves('#2F2A26') + capSleeve('#2F2A26') + `<path d='M150 158 L150 258' stroke='#6E655C' stroke-width='4'/><path d='M126 166 L136 254 M174 166 L164 254' stroke='#6E655C' stroke-width='3'/><circle cx='138' cy='200' r='3' fill='#C9BFA8'/><circle cx='162' cy='200' r='3' fill='#C9BFA8'/>` },
    { id: 't8', name: 'Kettenhemd', tags: ['ritter'], art: sleeves('#A8B0BC') + capSleeve('#A8B0BC') + [176, 194, 212, 230, 248].map(y => [122, 136, 150, 164, 178].map(x => dot(x, y, 3.2, '#8C95A3')).join('')).join('') },
  ],
  bottom: [
    { id: 'b1', name: 'Schlafhose', tags: ['pyjama'], art: hip('#7C86E8') + legs('#7C86E8', 542, 34) + [[131, 340], [132, 410], [130, 480], [169, 360], [168, 430], [171, 500]].map(p => dot(p[0], p[1], 3)).join('') },
    { id: 'b2', name: 'Chino', tags: ['schule'], art: hip('#C9A87C') + legs('#C9A87C', 546, 32) + `<path d='M133 300 L131 540 M167 300 L169 540' stroke='#B08F63' stroke-width='3'/>` },
    { id: 'b3', name: 'Badeshorts', tags: ['strand'], art: hip('#FF8A7A') + `<path d='M133 292 L130 340' stroke='#FF8A7A' stroke-width='35' stroke-linecap='round' fill='none'/><path d='M167 292 L170 340' stroke='#FF8A7A' stroke-width='35' stroke-linecap='round' fill='none'/><path d='M116 336 L146 336 M154 336 L184 336' stroke='#fff' stroke-width='5' stroke-linecap='round'/>` },
    { id: 'b4', name: 'Fussball-Shorts', tags: ['fussball', 'skater'], art: hip('#fff') + `<path d='M133 292 L130 346' stroke='#fff' stroke-width='35' stroke-linecap='round' fill='none'/><path d='M167 292 L170 346' stroke='#fff' stroke-width='35' stroke-linecap='round' fill='none'/><path d='M118 300 L118 342 M182 300 L182 342' stroke='#E8433A' stroke-width='5'/>` },
    { id: 'b5', name: 'Baggy-Jeans', tags: ['skater'], art: hip('#5B84C4') + `<path d='M132 292 L126 548' stroke='#5B84C4' stroke-width='40' stroke-linecap='round' fill='none'/><path d='M168 292 L174 548' stroke='#5B84C4' stroke-width='40' stroke-linecap='round' fill='none'/><path d='M112 430 L140 430 M160 430 L188 430' stroke='#9FBCE8' stroke-width='3' stroke-dasharray='6 5'/>` },
    { id: 'b6', name: 'Schneehose', tags: ['winter'], art: hip('#4C6FA8') + legs('#4C6FA8', 538, 35) + `<rect x='112' y='528' width='34' height='16' rx='8' fill='#3A5684'/><rect x='154' y='528' width='34' height='16' rx='8' fill='#3A5684'/>` },
    { id: 'b7', name: 'Nietenjeans', tags: ['rockstar'], art: hip('#3A3A46') + legs('#3A3A46', 550, 28) + [[128, 330], [172, 330], [128, 400], [172, 400]].map(p => dot(p[0], p[1], 3, '#C9BFA8')).join('') },
    { id: 'b8', name: 'Ritterhose', tags: ['ritter'], art: hip('#6E655C') + legs('#6E655C', 544, 32) + `<path d='M120 300 Q150 314 180 300' stroke='#A8B0BC' stroke-width='5' fill='none'/>` },
  ],
  dress: [],
  shoes: [
    { id: 's1', name: 'Drachen-Hausschuhe', tags: ['pyjama'], art: `<ellipse cx='125' cy='568' rx='23' ry='14' fill='#6BC4A4'/><ellipse cx='175' cy='568' rx='23' ry='14' fill='#6BC4A4'/><path d='M112 558 L118 548 L124 558 L130 548 L136 558' stroke='#4FAE8C' stroke-width='4' fill='none'/><path d='M162 558 L168 548 L174 558 L180 548 L186 558' stroke='#4FAE8C' stroke-width='4' fill='none'/>` },
    { id: 's2', name: 'Coole Sneaker', tags: ['schule', 'skater'], art: `<rect x='104' y='550' width='42' height='24' rx='11' fill='#fff'/><rect x='154' y='550' width='42' height='24' rx='11' fill='#fff'/><rect x='104' y='570' width='42' height='9' rx='4' fill='#4A7DF4'/><rect x='154' y='570' width='42' height='9' rx='4' fill='#4A7DF4'/><path d='M112 558 L124 558 M162 558 L174 558' stroke='#9AA3B2' stroke-width='3' stroke-linecap='round'/>` },
    { id: 's3', name: 'Flip-Flops', tags: ['strand'], art: `<ellipse cx='125' cy='576' rx='22' ry='8' fill='#35C9C0'/><ellipse cx='175' cy='576' rx='22' ry='8' fill='#35C9C0'/><path d='M113 572 L125 560 L137 572' stroke='#fff' stroke-width='4' fill='none' stroke-linecap='round'/><path d='M163 572 L175 560 L187 572' stroke='#fff' stroke-width='4' fill='none' stroke-linecap='round'/>` },
    { id: 's4', name: 'Fussballschuhe', tags: ['fussball'], art: `<path d='M104 566 Q112 552 132 554 L146 566 Q146 576 128 576 L110 576 Q102 574 104 566 Z' fill='#E8433A'/><path d='M196 566 Q188 552 168 554 L154 566 Q154 576 172 576 L190 576 Q198 574 196 566 Z' fill='#E8433A'/>` + [[112, 578], [124, 578], [136, 578], [164, 578], [176, 578], [188, 578]].map(p => dot(p[0], p[1], 2.6, '#3A3A46')).join('') },
    { id: 's5', name: 'Skater-Schuhe', tags: ['skater', 'rockstar'], art: `<rect x='102' y='546' width='46' height='28' rx='10' fill='#3A3A46'/><rect x='152' y='546' width='46' height='28' rx='10' fill='#3A3A46'/><rect x='102' y='568' width='46' height='10' rx='5' fill='#fff'/><rect x='152' y='568' width='46' height='10' rx='5' fill='#fff'/><path d='M110 556 L128 556' stroke='#fff' stroke-width='3' stroke-linecap='round'/><path d='M160 556 L178 556' stroke='#fff' stroke-width='3' stroke-linecap='round'/>` },
    { id: 's6', name: 'Winterstiefel', tags: ['winter'], art: `<rect x='110' y='514' width='30' height='54' rx='9' fill='#4C6FA8'/><rect x='160' y='514' width='30' height='54' rx='9' fill='#4C6FA8'/><ellipse cx='125' cy='516' rx='18' ry='8' fill='#EAF2FB'/><ellipse cx='175' cy='516' rx='18' ry='8' fill='#EAF2FB'/><rect x='106' y='562' width='38' height='13' rx='6' fill='#3A5684'/><rect x='156' y='562' width='38' height='13' rx='6' fill='#3A5684'/>` },
    { id: 's7', name: 'Rockerboots', tags: ['rockstar'], art: `<rect x='111' y='504' width='28' height='64' rx='9' fill='#2F2A26'/><rect x='161' y='504' width='28' height='64' rx='9' fill='#2F2A26'/><rect x='106' y='562' width='38' height='14' rx='6' fill='#1D1A17'/><rect x='156' y='562' width='38' height='14' rx='6' fill='#1D1A17'/><path d='M113 522 L137 522 M163 522 L187 522' stroke='#C9BFA8' stroke-width='3'/>` },
    { id: 's8', name: 'Ritterstiefel', tags: ['ritter'], art: `<rect x='111' y='508' width='28' height='60' rx='8' fill='#6E655C'/><rect x='161' y='508' width='28' height='60' rx='8' fill='#6E655C'/><path d='M111 530 L139 530 M161 530 L189 530' stroke='#A8B0BC' stroke-width='5'/><rect x='106' y='562' width='38' height='13' rx='6' fill='#4A443D'/><rect x='156' y='562' width='38' height='13' rx='6' fill='#4A443D'/>` },
  ],
  extra: [
    { id: 'e1', name: 'Schlafmütze', tags: ['pyjama'], art: `<path d='M102 66 Q106 20 150 16 Q186 20 196 44 Q210 30 224 34 Q216 52 200 58 L198 66 Z' fill='#7C86E8'/><rect x='100' y='58' width='100' height='16' rx='8' fill='#fff'/><circle cx='226' cy='34' r='10' fill='#fff'/>` },
    { id: 'e2', name: 'Schulrucksack', tags: ['schule'], art: `<path d='M112 172 L120 262' stroke='#E8433A' stroke-width='11' stroke-linecap='round' fill='none'/><path d='M188 172 L180 262' stroke='#E8433A' stroke-width='11' stroke-linecap='round' fill='none'/><rect x='196' y='186' width='40' height='56' rx='12' fill='#E8433A'/><rect x='196' y='214' width='40' height='12' fill='#B93028'/>` },
    { id: 'e3', name: 'Sonnenbrille', tags: ['strand'], art: `<rect x='114' y='78' width='32' height='22' rx='10' fill='#3A3A46'/><rect x='154' y='78' width='32' height='22' rx='10' fill='#3A3A46'/><path d='M146 86 L154 86' stroke='#3A3A46' stroke-width='4'/><path d='M114 84 L103 78 M186 84 L197 78' stroke='#3A3A46' stroke-width='4' stroke-linecap='round'/>` },
    { id: 'e4', name: 'Kapitänsbinde', tags: ['fussball'], art: `<path d='M96 190 Q106 182 116 190 L114 216 Q105 222 97 216 Z' fill='#FFCB47'/><text x='106' y='210' font-family='Fredoka,sans-serif' font-size='18' font-weight='700' fill='#E8433A' text-anchor='middle'>C</text>` },
    { id: 'e5', name: 'Skater-Cap', tags: ['skater', 'fussball'], art: `<path d='M104 60 Q106 22 150 20 Q194 22 196 60 Z' fill='#6BC4A4'/><path d='M96 60 Q150 76 204 60 L207 67 Q150 86 93 67 Z' fill='#4FAE8C'/><circle cx='150' cy='22' r='3.5' fill='#fff'/>` },
    { id: 'e6', name: 'Bommelmütze', tags: ['winter'], art: `<path d='M102 66 Q104 18 150 14 Q196 18 198 66 Z' fill='#4C6FA8'/><rect x='100' y='56' width='100' height='17' rx='8' fill='#3A5684'/><circle cx='150' cy='12' r='10' fill='#fff'/>` },
    { id: 'e7', name: 'E-Gitarre', tags: ['rockstar'], art: `<path d='M196 322 Q186 300 200 288 Q216 278 230 292 Q244 306 234 326 Q224 344 210 338 Q198 334 196 322 Z' fill='#E8433A'/><path d='M216 292 L246 232' stroke='#6E655C' stroke-width='9' stroke-linecap='round'/><rect x='240' y='220' width='14' height='18' rx='4' fill='#3A3A46'/><path d='M208 314 L232 302' stroke='#fff' stroke-width='2'/>` },
    { id: 'e8', name: 'Ritterhelm', tags: ['ritter'], art: `<path d='M104 96 Q104 28 150 24 Q196 28 196 96 Q150 110 104 96 Z' fill='#A8B0BC'/><rect x='112' y='76' width='76' height='9' rx='4' fill='#4A443D'/><path d='M150 24 L150 76' stroke='#8C95A3' stroke-width='4'/><path d='M138 30 Q150 6 162 30' fill='#E8433A'/>` },
  ],
};
```

- [ ] **Step 6: ViewBoxes, Themen und `CHARACTER` ergänzen**

```js
const EVB = { e1: '88 0 124 85', e2: '100 160 145 115', e3: '90 60 120 55', e4: '88 172 40 58', e5: '85 15 130 75', e6: '88 0 124 85', e7: '188 210 75 145', e8: '95 0 110 118' };

const { ITEMS, ITEM_BY_ID } = buildItems(rawItems, EVB);

const THEMES = [
  { id: 'pyjama', name: 'Pyjama-Party', hints: ['kuschelig', 'Sterne', 'gemütlich'], sig: 't1' },
  { id: 'schule', name: 'Schulparty', hints: ['cool', 'schick', 'lässig'], sig: 't2' },
  { id: 'strand', name: 'Strand & Sommer', hints: ['sonnig', 'luftig', 'Sommer'], sig: 't3' },
  { id: 'fussball', name: 'Fussball-Match', hints: ['Trikot', 'Stollen', 'Team'], sig: 't4' },
  { id: 'skater', name: 'Skater-Park', hints: ['Streetwear', 'Cap', 'baggy'], sig: 't5' },
  { id: 'winter', name: 'Winter-Style', hints: ['warm', 'flauschig', 'Schnee'], sig: 't6' },
  { id: 'rockstar', name: 'Rockstar', hints: ['Bühne', 'Leder', 'laut'], sig: 't7' },
  { id: 'ritter', name: 'Ritter-Fest', hints: ['Rüstung', 'Wappen', 'mutig'], sig: 't8' },
];

export const CHARACTER = {
  id: 'boy',
  name: 'Junge',
  dollUri,
  HAIR, ITEMS, ITEM_BY_ID, THEMES,
  tabs: [['hair', 'Haare'], ['top', 'Oben'], ['bottom', 'Unten'], ['shoes', 'Schuhe'], ['extra', 'Extras']],
  defaultWorn: { hair: 'h1', top: 't2', bottom: 'b2', dress: null, shoes: 's2', extra: null },
};
```

- [ ] **Step 7: Tests laufen lassen**

Run: `npm test`
Expected: PASS. Falls die Solvability-Zusicherung für ein Thema rot ist, fehlt dort ein Tag — die Fehlermeldung nennt Figur, Thema und Kategorie. Dann in `rawItems` den fehlenden Tag ergänzen, statt den Test zu lockern.

- [ ] **Step 8: Commit**

```bash
git add wardrobe-boy.js tests/wardrobe.test.mjs
git commit -m "feat(wardrobe): add the boy character with its own wardrobe and themes"
```

---

## Task 5: Figurwahl im Startscreen

**Files:**
- Modify: `index.html:40-44` (Startscreen-Markup)
- Modify: `index.html` (`renderVals`: `charBtns`, Figurwechsel)
- Modify: `README.md`

**Interfaces:**
- Consumes: `CHARACTERS`, `CHAR_IDS` (Task 1), `char`-State (Task 2), `defaultWorn` je Figur (Task 4)
- Produces: `vals.charBtns: Array<{ label, style, thumbStyle, pick }>` für das Startscreen-Markup

- [ ] **Step 1: Markup im Startscreen ergänzen**

Direkt **über** dem bestehenden `Dein Hautton:`-Block einfügen:

```html
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;justify-content:center;">
          <span style="font-weight:800;font-size:15px;color:#7A5A96;">Wer wird gestylt?</span>
          <sc-for list="{{ charBtns }}" as="ch" hint-placeholder-count="2">
            <button onClick="{{ ch.pick }}" style="{{ ch.style }}">
              <div style="{{ ch.thumbStyle }}"></div>
              <span>{{ ch.label }}</span>
            </button>
          </sc-for>
        </div>
```

- [ ] **Step 2: `charBtns` in `renderVals` bauen**

Direkt nach dem `vals.skinBtns = …`-Block einfügen:

```js
    vals.charBtns = W.CHAR_IDS.map(id => {
      const ch = W.CHARACTERS[id], act = id === s.char;
      const key = id + ':' + s.skin;
      const doll = this._dolls[key] = this._dolls[key] || ch.dollUri(W.SKINS[s.skin]);
      return {
        label: ch.name,
        thumbStyle: { width: '30px', height: '54px', backgroundImage: 'url("' + doll + '")', backgroundSize: 'contain', backgroundPosition: 'center top', backgroundRepeat: 'no-repeat' },
        style: { display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '999px', border: act ? '3px solid #F45FA2' : '3px solid #fff', background: 'rgba(255,255,255,.8)', padding: '5px 16px 5px 8px', fontFamily: 'Nunito,sans-serif', fontWeight: 800, fontSize: '15px', color: '#7A5A96', cursor: 'pointer', boxShadow: '0 3px 8px rgba(0,0,0,.15)' },
        pick: () => this.pickChar(id),
      };
    });
```

Die Zeile `this._dolls = this._dolls || {};` steht bereits weiter oben in `renderVals` und deckt diesen Zugriff mit ab.

- [ ] **Step 3: Den Figurwechsel als eigene Methode implementieren**

Neben `wear()` einfügen:

```js
  // Ein Figurwechsel muss Outfit, Tab und Level mitnehmen: defaultWorn der alten
  // Figur referenziert IDs, die es bei der neuen nicht gibt, und levelIdx zeigt
  // sonst in eine fremde Themenliste.
  pickChar(id) {
    if (id === this.state.char) return;
    const C = this.W.CHARACTERS[id];
    this.setState({
      char: id,
      worn: { ...C.defaultWorn },
      tab: C.tabs[0][0],
      levelIdx: 0,
      result: null,
    });
  }
```

- [ ] **Step 4: Den Start-State an die Vorgabe der Figur koppeln**

`componentDidMount` setzt `worn` beim Laden auf die Vorgabe der Startfigur, damit der hartcodierte Wert im `state`-Literal nicht zweimal gepflegt werden muss:

```js
      this.setState({
        ready: true,
        progress: p.migrate(raw),
        worn: { ...w.CHARACTERS[this.state.char].defaultWorn },
      });
```

- [ ] **Step 5: Im Browser durchspielen**

Server starten. Prüfen:

1. Startscreen zeigt zwei Figur-Buttons, „Mädchen" ist aktiv umrandet.
2. Klick auf „Junge" wechselt die Vorschaufigur sofort.
3. Ein Hautton-Wechsel wirkt auf die gerade gewählte Figur, und die beiden Figur-Thumbnails übernehmen ihn ebenfalls.
4. „Los geht's!" mit Junge → Themenwahl zeigt Fussball-Match, Skater-Park, Rockstar, Ritter-Fest.
5. Im Ankleide-Screen des Jungen fehlt der Tab „Kleider"; die übrigen fünf Tabs sind gefüllt.
6. „Fertig" bewerten, zurück zum Start, auf „Mädchen" wechseln — die Mädchen-Themenwahl zeigt ihren eigenen Sterne-Stand.
7. Seite neu laden: beide Sterne-Stände sind erhalten und getrennt.

- [ ] **Step 6: README ergänzen**

In `README.md` den Beschreibungsabschnitt um einen Satz ergänzen, dass zwei Figuren mit je eigenem Kleiderschrank und eigener Themenliste zur Wahl stehen und der Fortschritt pro Figur getrennt gespeichert wird.

- [ ] **Step 7: Tests ein letztes Mal laufen lassen**

Run: `npm test`
Expected: PASS — beide Suites grün.

- [ ] **Step 8: Commit**

```bash
git add index.html README.md
git commit -m "feat(game): let players pick the girl or the boy on the start screen"
```

---

## Self-Review

**Spec-Abdeckung**

| Spec-Abschnitt | Task |
| --- | --- |
| 1. Modulstruktur | Task 1, Steps 4–6 |
| 2. Datenmodell (`CHARACTER`-Form) | Task 1 Step 5, Task 4 Step 6 |
| 2. Kein Kleider-Tab beim Jungen | Task 4 Step 6, Test `boy trägt keine Kleider` |
| 2. Scoring unverändert | Task 2 Step 2 |
| 2. Themenliste des Jungen | Task 4 Step 6 |
| 2. Jungen-Doll | Task 4 Step 3 |
| 3. Startscreen-Flow und State | Task 2 Steps 1–5, Task 5 Steps 1–4 |
| 3. Figurwechsel setzt zurück | Task 5 Step 3 |
| 3. Doll-Cache-Schlüssel | Task 2 Step 3 |
| 3. Hautton gemeinsam | Task 5 Step 2 (`charBtns` nutzt `s.skin`) |
| 4. Persistenz und Migration | Task 3 |
| 5. Testing | Task 1 Steps 1–2, Task 3 Step 1 |
| 6. Akzeptanzkriterien | über alle Tasks, verifiziert in Task 5 Step 5 |

**Typkonsistenz** — `CHARACTER` hat in `wardrobe-girl.js` (Task 1 Step 5) und `wardrobe-boy.js` (Task 4 Step 6) dieselben neun Felder. `tabs` ist in beiden ein `Array<[string, string]>` und wird in Task 2 Step 4 und Task 5 Step 3 als solches gelesen. `migrate` gibt in allen Zweigen `{ v: 2, chars: { girl, boy } }` zurück, wie in Task 3 Steps 5–7 vorausgesetzt. Der Doll-Cache benutzt in Task 2 Step 3 und Task 5 Step 2 denselben Schlüssel `char + ':' + skin`.

**Offene Abhängigkeit** — Task 1 legt `wardrobe-boy.js` als Platzhalter an und schränkt die Test-Schleife auf `['girl']` ein; Task 4 dreht beides zurück. Wird Task 4 übersprungen, bleibt die Suite grün, obwohl es keine Jungen-Figur gibt — deshalb ist Task 4 Step 1 der erste Schritt dieser Task.
