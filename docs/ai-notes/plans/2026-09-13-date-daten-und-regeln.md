# Date-Daten und -Regeln — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Vier Date-Themen als Daten anlegen, die Paar-Bewertung als reine Regeln ergänzen und den Fortschritt um einen Date-Zweig erweitern. Der spielbare Ablauf folgt in einem eigenen Issue.

**Architecture:** Ein neues Datenmodul `wardrobe-dates.js`, zusätzliche `tags` auf vorhandenen Kleidungsstücken, zwei weitere reine Funktionen in `game-rules.js` und ein Versionssprung im Speicherformat auf `v: 3`. `index.html` wird nicht angefasst.

**Tech Stack:** Buildless ES-Module im Browser, `node --test`.

**Spec:** [`docs/ai-notes/specs/2026-09-13-date-daten-und-regeln-design.md`](../specs/2026-09-13-date-daten-und-regeln-design.md)

## Global Constraints

- **`npm test` ist `node --test` ohne Pfadargument.** Ein Verzeichnis anzuhängen bricht auf Node 24 mit `MODULE_NOT_FOUND` ab. Das Script nicht anfassen.
- **Kein neues SVG.** Die Date-Themen werden ausschliesslich über zusätzliche `tags` an bestehenden Teilen erschlossen.
- **Kein bestehender Tag wird entfernt.** Die Figur-Themen müssen unverändert lösbar bleiben.
- **`index.html` bleibt unangetastet.** Am Ende darf `git diff --name-only origin/main` diese Datei nicht nennen.
- **Reine Funktionen.** `scoreDate` und `recordDateResult` benutzen kein `this`, kein `localStorage`, kein `Math.random`, kein `setState`, und mutieren ihre Argumente nicht.
- **Der `localStorage`-Key bleibt `stylestar_v1`.** Versioniert wird der Wert.
- **TDD.** Jede Task beginnt mit einem Test, der aus dem richtigen Grund rot ist.

---

## File Structure

| Datei | Änderung |
| --- | --- |
| `wardrobe-dates.js` | *(neu)* `DATE_THEMES` |
| `wardrobe.js` | Re-Export von `DATE_THEMES` |
| `wardrobe-girl.js` | Zusätzliche `tags` auf vorhandenen Teilen |
| `wardrobe-boy.js` | Zusätzliche `tags` auf vorhandenen Teilen |
| `tests/wardrobe.test.mjs` | Tag-Test erweitert; neue Date-Invariante |
| `game-rules.js` | `scoreDate`, `recordDateResult` |
| `tests/game-rules.test.mjs` | Tests für die beiden neuen Funktionen |
| `progress.js` | `v: 3` mit `dates`; Migration erweitert |
| `tests/progress.test.mjs` | Tests für v3 und die vier Migrationswege |

---

### Task 1: Date-Themen und Tags

**Files:**
- Create: `wardrobe-dates.js`
- Modify: `wardrobe.js` (Re-Export), `wardrobe-girl.js` (tags), `wardrobe-boy.js` (tags)
- Test: `tests/wardrobe.test.mjs`

**Interfaces:**
- Consumes: nichts
- Produces: `DATE_THEMES: Array<{ id, name, hints: string[], sig: { girl: string, boy: string } }>`, re-exportiert aus `wardrobe.js`

- [ ] **Step 1: Die fehlschlagenden Tests schreiben**

In `tests/wardrobe.test.mjs` den Import erweitern:

```js
import { CHARACTERS, CHAR_IDS, SKINS, DATE_THEMES } from '../wardrobe.js';
```

Den bestehenden Tag-Test so ändern, dass er beide Themenquellen kennt:

```js
  test(`${charId}: jeder Tag zeigt auf ein existierendes Thema`, () => {
    const C = CHARACTERS[charId];
    // Erlaubt sind die Themen der Figur und die gemeinsamen Date-Themen.
    const themeIds = new Set([...C.THEMES.map(t => t.id), ...DATE_THEMES.map(t => t.id)]);
    for (const it of Object.values(C.ITEMS).flat()) {
      for (const tag of it.tags) {
        assert.ok(themeIds.has(tag), `${charId}/${it.id}: unbekannter Tag '${tag}'`);
      }
    }
  });
```

Und am Dateiende die neuen Date-Invarianten ergänzen:

```js
test('es gibt genau die vier Date-Themen', () => {
  assert.deepEqual(DATE_THEMES.map(t => t.id), ['kino', 'eisdiele', 'sommerfest', 'herbst']);
  for (const t of DATE_THEMES) {
    assert.ok(t.name.length > 0, `${t.id}: name fehlt`);
    assert.ok(Array.isArray(t.hints) && t.hints.length > 0, `${t.id}: hints fehlen`);
  }
});

test('jedes Date-Thema ist fuer beide Figuren mit drei Sternen loesbar', () => {
  for (const t of DATE_THEMES) {
    for (const charId of ['girl', 'boy']) {
      const C = CHARACTERS[charId];
      for (const cat of SCORING_CATS) {
        const hit = (C.ITEMS[cat] || []).some(it => it.tags.includes(t.id));
        assert.ok(hit, `${charId}/${t.id}: kein passendes Teil in '${cat}'`);
      }
    }
  }
});

test('jedes sig eines Date-Themas loest bei der jeweiligen Figur auf', () => {
  for (const t of DATE_THEMES) {
    assert.ok(CHARACTERS.girl.ITEM_BY_ID[t.sig.girl], `${t.id}: sig.girl '${t.sig.girl}' unbekannt`);
    assert.ok(CHARACTERS.boy.ITEM_BY_ID[t.sig.boy], `${t.id}: sig.boy '${t.sig.boy}' unbekannt`);
  }
});
```

`SCORING_CATS` ist bereits oben in der Datei definiert und wird wiederverwendet.

- [ ] **Step 2: Test laufen lassen und Fehlschlag bestätigen**

Run: `npm test`
Expected: FAIL — `wardrobe.js` exportiert `DATE_THEMES` nicht; der Import wirft `SyntaxError: The requested module '../wardrobe.js' does not provide an export named 'DATE_THEMES'`.

- [ ] **Step 3: `wardrobe-dates.js` anlegen**

```js
// StyleUp! – die gemeinsamen Date-Themen. Sie gehören keiner Figur, sondern
// dem Paar: beide Figuren werden am selben Thema gemessen. sig ist deshalb
// zweiteilig — die Themenkarte deutet später beide Looks an.
export const DATE_THEMES = [
  { id: 'kino', name: 'Kino-Abend', hints: ['schick', 'gemütlich', 'dunkel'], sig: { girl: 'd3', boy: 't7' } },
  { id: 'eisdiele', name: 'Eisdiele', hints: ['sommerlich', 'leger', 'bunt'], sig: { girl: 't3', boy: 't3' } },
  { id: 'sommerfest', name: 'Sommerfest', hints: ['luftig', 'fröhlich', 'draussen'], sig: { girl: 'd2', boy: 't5' } },
  { id: 'herbst', name: 'Herbstspaziergang', hints: ['warm', 'gemütlich', 'bunt'], sig: { girl: 't7', boy: 't6' } },
];
```

- [ ] **Step 4: `wardrobe.js` re-exportieren lassen**

```js
export { SKINS } from './wardrobe-core.js';
export { DATE_THEMES } from './wardrobe-dates.js';
```

Der Rest der Datei bleibt unverändert.

- [ ] **Step 5: Die Tags ergänzen**

Jeweils **anhängen**, nie ersetzen. In `wardrobe-girl.js`:

| Item | `tags` vorher | `tags` nachher |
| --- | --- | --- |
| t2 | `['schule', 'festival']` | `['schule', 'festival', 'kino', 'eisdiele', 'sommerfest']` |
| t3 | `['strand']` | `['strand', 'eisdiele']` |
| t4 | `['festival']` | `['festival', 'sommerfest']` |
| t5 | `['pyjama', 'sport']` | `['pyjama', 'sport', 'herbst']` |
| t6 | `['ball', 'schule']` | `['ball', 'schule', 'kino']` |
| t7 | `['winter']` | `['winter', 'herbst']` |
| b2 | `['schule']` | `['schule', 'kino', 'eisdiele']` |
| b3 | `['strand', 'festival', 'sport']` | `['strand', 'festival', 'sport', 'eisdiele', 'sommerfest']` |
| b4 | `['festival', 'schule', 'kpop']` | `['festival', 'schule', 'kpop', 'kino', 'sommerfest', 'herbst']` |
| b6 | `['pyjama', 'sport']` | `['pyjama', 'sport', 'herbst']` |
| d2 | `['strand']` | `['strand', 'eisdiele', 'sommerfest']` |
| d3 | `['schule', 'festival', 'kpop']` | `['schule', 'festival', 'kpop', 'kino', 'sommerfest']` |
| s2 | `['schule', 'festival', 'sport', 'kpop']` | `['schule', 'festival', 'sport', 'kpop', 'kino', 'eisdiele', 'sommerfest']` |
| s3 | `['strand']` | `['strand', 'eisdiele']` |
| s4 | `['ball', 'schule']` | `['ball', 'schule', 'kino']` |
| s5 | `['festival']` | `['festival', 'sommerfest', 'herbst']` |
| s6 | `['winter']` | `['winter', 'herbst']` |
| e3 | `['strand', 'festival']` | `['strand', 'festival', 'eisdiele', 'sommerfest']` |
| e4 | `['schule', 'ball']` | `['schule', 'ball', 'kino']` |
| e5 | `['festival', 'strand']` | `['festival', 'strand', 'eisdiele', 'sommerfest']` |
| e6 | `['ball', 'schule']` | `['ball', 'schule', 'kino', 'herbst']` |
| e7 | `['winter']` | `['winter', 'herbst']` |

In `wardrobe-boy.js`:

| Item | `tags` vorher | `tags` nachher |
| --- | --- | --- |
| t2 | `['schule']` | `['schule', 'kino', 'eisdiele', 'sommerfest']` |
| t3 | `['strand']` | `['strand', 'eisdiele']` |
| t5 | `['skater', 'schule']` | `['skater', 'schule', 'sommerfest', 'herbst']` |
| t6 | `['winter']` | `['winter', 'herbst']` |
| t7 | `['rockstar']` | `['rockstar', 'kino']` |
| b2 | `['schule']` | `['schule', 'kino', 'herbst']` |
| b3 | `['strand']` | `['strand', 'eisdiele']` |
| b4 | `['fussball', 'skater']` | `['fussball', 'skater', 'sommerfest']` |
| b5 | `['skater']` | `['skater', 'kino', 'eisdiele', 'sommerfest', 'herbst']` |
| s2 | `['schule', 'skater']` | `['schule', 'skater', 'kino', 'eisdiele', 'sommerfest']` |
| s3 | `['strand']` | `['strand', 'eisdiele']` |
| s5 | `['skater', 'rockstar']` | `['skater', 'rockstar', 'kino', 'sommerfest', 'herbst']` |
| s6 | `['winter']` | `['winter', 'herbst']` |
| e3 | `['strand']` | `['strand', 'eisdiele', 'sommerfest']` |
| e5 | `['skater', 'fussball']` | `['skater', 'fussball', 'kino', 'eisdiele', 'sommerfest', 'herbst']` |
| e6 | `['winter']` | `['winter', 'herbst']` |

- [ ] **Step 6: Tests laufen lassen**

Run: `npm test`
Expected: PASS. Wird eine Lücke gemeldet, nennt die Fehlermeldung Figur, Thema und Kategorie — dann fehlt dort ein Tag aus den Tabellen oben; **nicht** den Test lockern.

- [ ] **Step 7: Belegen, dass kein Figur-Thema Schaden genommen hat**

```bash
node --input-type=module -e "
const { CHARACTERS } = await import('./wardrobe.js');
const CATS = ['top','bottom','shoes','extra'];
let bad = 0;
for (const cid of ['girl','boy']) {
  const C = CHARACTERS[cid];
  for (const t of C.THEMES) for (const cat of CATS) {
    if (!(C.ITEMS[cat]||[]).some(i => i.tags.includes(t.id))) { console.log('LUECKE', cid, t.id, cat); bad++; }
  }
}
console.log(bad ? ('PROBLEME: '+bad) : 'alle Figur-Themen weiterhin loesbar');
"
```

Expected: `alle Figur-Themen weiterhin loesbar`.

- [ ] **Step 8: Commit**

```bash
git add wardrobe-dates.js wardrobe.js wardrobe-girl.js wardrobe-boy.js tests/wardrobe.test.mjs
git commit -m "feat(dates): add the four date themes and tag the existing wardrobe"
```

---

### Task 2: Paar-Bewertung in `game-rules.js`

**Files:**
- Test: `tests/game-rules.test.mjs`
- Modify: `game-rules.js` (anhängen)

**Interfaces:**
- Consumes: `scoreLook` aus `game-rules.js`
- Produces:
  - `scoreDate(girlChar, boyChar, theme, girlWorn, boyWorn) => { girlPts, boyPts, pts, stars }`
  - `recordDateResult(progress, themeId, stars) => progress`

- [ ] **Step 1: Die fehlschlagenden Tests schreiben**

An `tests/game-rules.test.mjs` anhängen; der Import oben wird erweitert zu
`import { scoreLook, recordResult, switchCharacterState, scoreDate, recordDateResult } from '../game-rules.js';`

```js
const mkChar = ids => ({ ITEM_BY_ID: Object.fromEntries(ids.map(i => [i, { tags: ['kino'] }])) });
const G = mkChar(['t1', 'b1', 's1', 'e1']), B = mkChar(['t1', 'b1', 's1', 'e1']);
const DATE = { id: 'kino' };
const outfit = o => ({ hair: 'h1', top: null, bottom: null, dress: null, shoes: null, extra: null, ...o });
const voll = outfit({ top: 't1', bottom: 'b1', shoes: 's1', extra: 'e1' });

test('beide perfekt gibt acht Punkte und drei Sterne', () => {
  assert.deepEqual(scoreDate(G, B, DATE, voll, voll), { girlPts: 4, boyPts: 4, pts: 8, stars: 3 });
});

test('ein Patzer reicht noch für drei Sterne', () => {
  const fast = outfit({ top: 't1', bottom: 'b1', shoes: 's1' });
  assert.deepEqual(scoreDate(G, B, DATE, voll, fast), { girlPts: 4, boyPts: 3, pts: 7, stars: 3 });
});

test('sechs Punkte geben zwei Sterne', () => {
  const halb = outfit({ top: 't1', bottom: 'b1' });
  assert.equal(scoreDate(G, B, DATE, voll, halb).stars, 2);
});

test('drei Punkte geben einen Stern', () => {
  const eins = outfit({ top: 't1' });
  const zwei = outfit({ top: 't1', bottom: 'b1' });
  const r = scoreDate(G, B, DATE, eins, zwei);
  assert.equal(r.pts, 3);
  assert.equal(r.stars, 1);
});

test('nichts angezogen gibt null Punkte und einen Stern', () => {
  const leer = outfit({});
  assert.deepEqual(scoreDate(G, B, DATE, leer, leer), { girlPts: 0, boyPts: 0, pts: 0, stars: 1 });
});

const DPROG = () => ({
  v: 3,
  chars: { girl: { unlocked: 2, stars: { pyjama: 3 } }, boy: { unlocked: 1, stars: {} } },
  dates: { stars: { kino: 2 } },
});

test('recordDateResult mutiert nicht und lässt die Figuren in Ruhe', () => {
  const vorher = DPROG(), kopie = JSON.parse(JSON.stringify(vorher));
  const p = recordDateResult(vorher, 'eisdiele', 3);
  assert.deepEqual(vorher, kopie, 'das Argument bleibt unverändert');
  assert.deepEqual(p.chars, kopie.chars, 'die Figuren werden nicht berührt');
  assert.equal(p.dates.stars.eisdiele, 3);
  assert.equal(p.dates.stars.kino, 2, 'andere Date-Themen bleiben erhalten');
});

test('ein schlechteres Date senkt den Bestwert nicht', () => {
  assert.equal(recordDateResult(DPROG(), 'kino', 1).dates.stars.kino, 2);
});
```

- [ ] **Step 2: Test laufen lassen und Fehlschlag bestätigen**

Run: `npm test`
Expected: FAIL — `game-rules.js` exportiert `scoreDate` und `recordDateResult` nicht.

- [ ] **Step 3: Die beiden Funktionen anhängen**

Ans Ende von `game-rules.js`:

```js
// Ein Date wird über beide Looks am selben Thema gemessen: je 0-4 Punkte aus
// scoreLook, zusammen 0-8. Die Einzelwerte kommen mit zurück, damit die Szene
// zeigen kann, woran es lag. Acht von acht wäre als Bestnote zu hart — sieben
// lässt genau einen Patzer zu.
export function scoreDate(girlChar, boyChar, theme, girlWorn, boyWorn) {
  const g = scoreLook(girlChar, theme, girlWorn);
  const b = scoreLook(boyChar, theme, boyWorn);
  const pts = g.pts + b.pts;
  const stars = pts >= 7 ? 3 : pts >= 4 ? 2 : 1;
  return { girlPts: g.pts, boyPts: b.pts, pts, stars };
}

// Date-Ergebnisse liegen neben den Figuren, nicht in ihnen: kein unlocked,
// nur der Sterne-Bestwert je Thema.
export function recordDateResult(progress, themeId, stars) {
  const stern = { ...progress.dates.stars };
  stern[themeId] = Math.max(stern[themeId] || 0, stars);
  return { ...progress, dates: { stars: stern } };
}
```

- [ ] **Step 4: Tests laufen lassen**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add game-rules.js tests/game-rules.test.mjs
git commit -m "feat(rules): score a date as the sum of both looks"
```

---

### Task 3: Fortschritt auf v3

**Files:**
- Test: `tests/progress.test.mjs`
- Modify: `progress.js`

**Interfaces:**
- Consumes: nichts aus vorherigen Tasks
- Produces: `blankProgress(charIds) => { v: 3, chars, dates: { stars: {} } }`; `migrate(parsed, charIds)` unverändert zweistellig

- [ ] **Step 1: Die fehlschlagenden Tests schreiben**

Die bestehenden Erwartungen auf `v: 2` in `tests/progress.test.mjs` werden auf `v: 3` gezogen, und diese Tests kommen dazu:

```js
test('blankProgress ist v3 mit leerem Date-Zweig', () => {
  const p = blankProgress(IDS);
  assert.equal(p.v, 3);
  assert.deepEqual(p.dates, { stars: {} });
});

test('v2 wird auf v3 gehoben, die Figuren bleiben', () => {
  const p = migrate({ v: 2, chars: { girl: { unlocked: 5, stars: { ball: 3 } }, boy: { unlocked: 2, stars: {} } } }, IDS);
  assert.equal(p.v, 3);
  assert.deepEqual(p.chars.girl, { unlocked: 5, stars: { ball: 3 } });
  assert.deepEqual(p.dates, { stars: {} });
});

test('v3 bleibt erhalten, inklusive Date-Sternen', () => {
  const src = { v: 3, chars: { girl: { unlocked: 1, stars: {} }, boy: { unlocked: 1, stars: {} } }, dates: { stars: { kino: 3 } } };
  assert.deepEqual(migrate(src, IDS), src);
});

test('ein kaputter Date-Zweig wird ersetzt, nicht übernommen', () => {
  for (const bad of [null, 'nope', 42, {}, { stars: 'nein' }]) {
    const p = migrate({ v: 3, chars: { girl: { unlocked: 1, stars: {} }, boy: { unlocked: 1, stars: {} } }, dates: bad }, IDS);
    assert.deepEqual(p.dates, { stars: {} }, `Eingabe ${JSON.stringify(bad)}`);
  }
});
```

Der bestehende Test *„migrate hebt das alte Flachformat auf das Mädchen"* wird um eine Zeile ergänzt:

```js
  assert.deepEqual(p.dates, { stars: {} });
```

- [ ] **Step 2: Test laufen lassen und Fehlschlag bestätigen**

Run: `npm test`
Expected: FAIL — `blankProgress` liefert noch `v: 2` und kein `dates`.

- [ ] **Step 3: `progress.js` umbauen**

Ab `blankProgress` wird die Datei zu:

```js
export const blankProgress = (charIds) => ({
  v: 3,
  chars: Object.fromEntries(charIds.map(id => [id, blankChar()])),
  dates: { stars: {} },
});

const charsFrom = (src, charIds) => {
  const chars = {};
  for (const id of charIds) {
    const c = src && src[id];
    chars[id] = (c && typeof c.unlocked === 'number' && c.stars && typeof c.stars === 'object')
      ? { unlocked: c.unlocked, stars: { ...c.stars } }
      : blankChar();
  }
  return chars;
};

const datesFrom = (src) =>
  (src && src.stars && typeof src.stars === 'object') ? { stars: { ...src.stars } } : { stars: {} };

export function migrate(parsed, charIds) {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return blankProgress(charIds);

  // v2 und v3 unterscheiden sich nur darin, dass v3 den Date-Zweig kennt.
  if ((parsed.v === 2 || parsed.v === 3) && parsed.chars && typeof parsed.chars === 'object') {
    return { v: 3, chars: charsFrom(parsed.chars, charIds), dates: datesFrom(parsed.dates) };
  }

  // Altes Flachformat { unlocked, stars } — der gesamte Stand gehört dem Mädchen.
  if (typeof parsed.unlocked === 'number' && parsed.stars && typeof parsed.stars === 'object') {
    const p = blankProgress(charIds);
    p.chars.girl = { unlocked: parsed.unlocked, stars: { ...parsed.stars } };
    return p;
  }

  return blankProgress(charIds);
}
```

Der Kommentarblock über `STORAGE_KEY` und `blankChar` bleiben unverändert.

- [ ] **Step 4: Tests laufen lassen**

Run: `npm test`
Expected: PASS, mindestens 48 Tests.

- [ ] **Step 5: Im Browser belegen, dass ein bestehender Stand überlebt**

```bash
python3 -m http.server 8799 --directory . &
```

Auf `http://localhost:8799/` in der Konsole einen v2-Stand setzen und neu laden:

```js
localStorage.setItem('stylestar_v1', JSON.stringify({ v: 2, chars: { girl: { unlocked: 4, stars: { pyjama: 3, schule: 2 } }, boy: { unlocked: 1, stars: {} } } }));
location.reload();
```

Expected: die Themenwahl des Mädchens zeigt vier freigeschaltete Themen mit den alten Sternen. Danach in der Konsole:

```js
JSON.parse(localStorage.getItem('stylestar_v1'))
```

Expected: `v: 3`, die Sterne des Mädchens unverändert, `dates: { stars: {} }` vorhanden. Danach den Server beenden.

- [ ] **Step 6: Belegen, dass `index.html` unangetastet blieb**

```bash
git diff --name-only origin/main
```

Expected: `index.html` kommt in der Liste **nicht** vor.

- [ ] **Step 7: Commit**

```bash
git add progress.js tests/progress.test.mjs
git commit -m "feat(progress): add the date branch and bump the save format to v3"
```

---

## Self-Review

**Spec-Abdeckung**

| Spec-Akzeptanzkriterium | Task |
| --- | --- |
| `wardrobe-dates.js` mit vier Themen | Task 1, Step 3 |
| Tags ergänzt, keine entfernt | Task 1 Step 5, Step 7 |
| `wardrobe.js` re-exportiert `DATE_THEMES` | Task 1, Step 4 |
| Tag-Test akzeptiert beide Themenquellen | Task 1, Step 1 |
| Date-Lösbarkeit testgesichert | Task 1, Step 1 |
| `scoreDate` / `recordDateResult` | Task 2, Step 3 |
| `progress.js` auf v3, vier Migrationswege | Task 3, Step 3 |
| `index.html` unverändert, Spiel läuft | Task 3, Steps 5–6 |
| `npm test` ≥ 48 Tests | Task 3, Step 4 |

**Placeholder-Scan** — keine TBDs; jeder Code-Schritt enthält den vollständigen Zielzustand, jede Tag-Änderung steht als Vorher/Nachher in einer Tabelle.

**Typkonsistenz** — `scoreDate` gibt vier Zahlen zurück und wird in den Tests genau so destrukturiert. `recordDateResult` erwartet ein `progress` mit `dates.stars`, das `blankProgress` aus Task 3 liefert — deshalb hat Task 3 keine Abhängigkeit auf Task 2, wohl aber umgekehrt die Tests von Task 2 auf die v3-Form, die sie sich selbst als Literal bauen.

**Reihenfolge** — Task 1 vor Task 2 und 3 ist nicht zwingend, aber sinnvoll: die Tag-Arbeit ist die umfangreichste und sollte gepusht sein, bevor das Turn-Budget knapp wird.

**Hinweis zur Herkunft** — Tag-Tabellen, `scoreDate`, `recordDateResult` und die v3-Migration wurden vor dem Schreiben dieses Plans ausgeführt: die Tag-Abdeckung gegen den echten Kleiderschrank geprüft (alle acht Thema/Figur-Kombinationen lösbar), die Regel-Tests 7 von 7 grün, die Migrations-Tests 9 von 9 grün.
