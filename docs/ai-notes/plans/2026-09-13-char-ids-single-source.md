# CHAR_IDS Single-Source Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Die Figur-IDs existieren nur noch an einer Stelle — als Schlüssel der Registry in `wardrobe.js`. `progress.js` bekommt sie übergeben, statt eine eigene Kopie zu führen.

**Architecture:** `wardrobe.js` leitet `CHAR_IDS` per `Object.keys(CHARACTERS)` ab. `blankProgress()` und `migrate()` nehmen die ID-Liste als Pflichtparameter. `index.html` ist die einzige Stelle, die beide Module kennt, und reicht `w.CHAR_IDS` durch.

**Tech Stack:** Buildless ES-Module im Browser, `node --test`.

**Spec:** [`docs/ai-notes/specs/2026-09-13-char-ids-single-source-design.md`](../specs/2026-09-13-char-ids-single-source-design.md)

## Global Constraints

- **Buildless.** Kein Bundler, kein Framework, keine neuen Dependencies. `package.json` bleibt ohne `dependencies`/`devDependencies`.
- **Kein Default-Wert für die neuen Parameter.** Ein Default wäre dasselbe Literal, nur versteckt — ein vergessener Aufruf muss laut scheitern, nicht still die falsche Liste benutzen.
- **`progress.js` importiert nichts aus `wardrobe.js`.** Persistenz weiss nichts über Spielinhalt; die Abhängigkeit liefe sonst in die falsche Richtung und zöge 40 KB SVG in die Migrationstests.
- **Das Speicherformat ändert sich nicht.** Der Key bleibt `stylestar_v1`, die Struktur bleibt `{ v: 2, chars: { … } }`. Ein bestehender Spielstand muss sich nach der Änderung unverändert laden lassen.
- **TDD.** Jeder Verhaltenswechsel beginnt mit einem Test, der aus dem richtigen Grund rot ist.

---

## File Structure

| Datei | Änderung |
| --- | --- |
| `tests/progress.test.mjs` | Bestehende Aufrufe um das ID-Argument ergänzt; ein neuer Test für eine dreielementige Liste |
| `progress.js` | `CHAR_IDS`-Konstante entfällt; `blankProgress`/`migrate` nehmen `charIds` |
| `wardrobe.js` | `CHAR_IDS` wird aus `CHARACTERS` abgeleitet |
| `index.html` | `p.migrate(raw)` → `p.migrate(raw, w.CHAR_IDS)` |

---

### Task 1: `progress.js` bekommt die IDs übergeben

**Files:**
- Test: `tests/progress.test.mjs`
- Modify: `progress.js:6` (Konstante entfernen), `progress.js:10-13` (`blankProgress`), `progress.js:15-38` (`migrate`)

**Interfaces:**
- Consumes: nichts aus vorherigen Tasks
- Produces:
  - `blankProgress(charIds: string[]) => { v: 2, chars: Record<string, {unlocked: number, stars: Record<string, number>}> }`
  - `migrate(parsed: unknown, charIds: string[]) => Progress`
  - `blankChar()` bleibt unverändert
  - `STORAGE_KEY` bleibt unverändert

- [ ] **Step 1: Den neuen Test schreiben und die bestehenden anpassen**

In `tests/progress.test.mjs` ganz oben eine Konstante ergänzen und alle bestehenden Aufrufe damit versorgen:

```js
const IDS = ['girl', 'boy'];
```

Die bestehenden Aufrufe werden zu:

```js
test('blankProgress gibt beiden Figuren einen eigenen leeren Stand', () => {
  const p = blankProgress(IDS);
  assert.equal(p.v, 2);
  assert.deepEqual(p.chars.girl, { unlocked: 1, stars: {} });
  assert.deepEqual(p.chars.boy, { unlocked: 1, stars: {} });
  p.chars.girl.stars.pyjama = 3;
  assert.deepEqual(p.chars.boy.stars, {}, 'die Figuren dürfen sich kein Objekt teilen');
});

test('migrate übernimmt ein v2-Objekt unverändert', () => {
  const src = { v: 2, chars: { girl: { unlocked: 5, stars: { ball: 3 } }, boy: { unlocked: 2, stars: {} } } };
  assert.deepEqual(migrate(src, IDS), src);
});

test('migrate hebt das alte Flachformat auf das Mädchen', () => {
  const old = { unlocked: 4, stars: { pyjama: 3, schule: 2 } };
  const p = migrate(old, IDS);
  assert.equal(p.v, 2);
  assert.deepEqual(p.chars.girl, { unlocked: 4, stars: { pyjama: 3, schule: 2 } });
  assert.deepEqual(p.chars.boy, { unlocked: 1, stars: {} });
});

test('migrate füllt eine im v2-Objekt fehlende Figur auf', () => {
  const p = migrate({ v: 2, chars: { girl: { unlocked: 3, stars: {} } } }, IDS);
  assert.deepEqual(p.chars.boy, { unlocked: 1, stars: {} });
});

test('migrate gibt für Müll einen frischen Stand', () => {
  for (const bad of [null, undefined, 0, 'nope', [], {}, { v: 99 }]) {
    assert.deepEqual(migrate(bad, IDS), blankProgress(IDS), `Eingabe ${JSON.stringify(bad)}`);
  }
});
```

Der Test für `blankChar()` bleibt unverändert — die Funktion kennt keine IDs.

Neu dazu kommt der Test, der die Kopie unmöglich macht:

```js
test('migrate folgt der übergebenen ID-Liste, nicht einer eigenen', () => {
  const drei = ['girl', 'boy', 'robot'];

  const frisch = migrate(null, drei);
  assert.deepEqual(Object.keys(frisch.chars), drei,
    'blankProgress muss alle übergebenen IDs anlegen');

  const alt = migrate({ unlocked: 2, stars: { pyjama: 1 } }, drei);
  assert.deepEqual(Object.keys(alt.chars), drei,
    'auch die Migration des Flachformats muss alle IDs anlegen');
  assert.deepEqual(alt.chars.robot, { unlocked: 1, stars: {} });

  const v2 = migrate({ v: 2, chars: { girl: { unlocked: 7, stars: {} } } }, drei);
  assert.deepEqual(Object.keys(v2.chars), drei);
  assert.equal(v2.chars.girl.unlocked, 7, 'vorhandene Stände bleiben erhalten');
  assert.deepEqual(v2.chars.robot, { unlocked: 1, stars: {} });
});

test('eine Figur, die nicht in der Liste steht, fällt raus', () => {
  const p = migrate(
    { v: 2, chars: { girl: { unlocked: 3, stars: {} }, ghost: { unlocked: 9, stars: {} } } },
    ['girl', 'boy'],
  );
  assert.deepEqual(Object.keys(p.chars), ['girl', 'boy']);
});
```

- [ ] **Step 2: Test laufen lassen und Fehlschlag bestätigen**

Run: `npm test`
Expected: FAIL. `migrate folgt der übergebenen ID-Liste` scheitert mit einem Vergleich von `['girl','boy']` gegen `['girl','boy','robot']` — die Funktion benutzt noch ihre eigene Konstante. Die angepassten Bestandstests bleiben grün, weil das zusätzliche Argument heute schlicht ignoriert wird.

- [ ] **Step 3: `progress.js` umbauen**

Die Konstante in Zeile 6 entfällt ersatzlos. Die beiden Funktionen bekommen den Parameter:

```js
export const blankProgress = (charIds) => ({
  v: 2,
  chars: Object.fromEntries(charIds.map(id => [id, blankChar()])),
});

export function migrate(parsed, charIds) {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return blankProgress(charIds);

  // v2: übernehmen, aber jede fehlende Figur auffüllen.
  if (parsed.v === 2 && parsed.chars && typeof parsed.chars === 'object') {
    const chars = {};
    for (const id of charIds) {
      const c = parsed.chars[id];
      chars[id] = (c && typeof c.unlocked === 'number' && c.stars && typeof c.stars === 'object')
        ? { unlocked: c.unlocked, stars: { ...c.stars } }
        : blankChar();
    }
    return { v: 2, chars };
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

Der Kommentarblock am Dateikopf über `STORAGE_KEY` bleibt unverändert.

- [ ] **Step 4: Tests laufen lassen**

Run: `npm test`
Expected: PASS, mindestens 24 Tests.

- [ ] **Step 5: Belegen, dass kein Literal übrig ist**

```bash
grep -n "girl" progress.js
```

Expected: genau eine Trefferzeile — `p.chars.girl = { unlocked: parsed.unlocked, … }` in der Flachformat-Migration. Das ist **kein** Duplikat der ID-Liste, sondern die inhaltliche Aussage „der alte Einzelstand gehörte dem Mädchen", und sie muss bleiben.

```bash
grep -n "CHAR_IDS" progress.js || echo "keine CHAR_IDS-Kopie mehr"
```

Expected: `keine CHAR_IDS-Kopie mehr`.

- [ ] **Step 6: Commit**

```bash
git add progress.js tests/progress.test.mjs
git commit -m "refactor(progress): take the character ids as a parameter"
```

---

### Task 2: `CHAR_IDS` aus der Registry ableiten und durchreichen

**Files:**
- Modify: `wardrobe.js:7-8`
- Modify: `index.html:186`
- Test: `tests/wardrobe.test.mjs` (bestehender Test deckt es ab, siehe Step 1)

**Interfaces:**
- Consumes: `blankProgress(charIds)` / `migrate(parsed, charIds)` aus Task 1
- Produces: `CHAR_IDS` als abgeleiteter Wert; `index.html` ruft `migrate` zweistellig auf

- [ ] **Step 1: Prüfen, dass die Ableitung bereits abgesichert ist**

`tests/wardrobe.test.mjs` enthält schon:

```js
test('Registry kennt genau die erwarteten Figuren', () => {
  assert.deepEqual(CHAR_IDS, ['girl', 'boy']);
  for (const id of CHAR_IDS) {
    assert.equal(CHARACTERS[id].id, id, `CHARACTERS.${id}.id muss '${id}' sein`);
    assert.ok(CHARACTERS[id].name.length > 0, `CHARACTERS.${id}.name fehlt`);
  }
});
```

Dieser Test belegt nach der Änderung, dass die Ableitung dieselbe Liste in derselben Reihenfolge liefert. Es ist kein neuer Test nötig — aber er muss nach Step 2 weiterhin grün sein, sonst hat sich die Reihenfolge verschoben.

- [ ] **Step 2: `wardrobe.js` ändern**

```js
export const CHARACTERS = { girl, boy };
// Aus der Registry abgeleitet, damit die Liste nicht von ihr abweichen kann.
export const CHAR_IDS = Object.keys(CHARACTERS);
```

- [ ] **Step 3: `index.html` die IDs durchreichen lassen**

Zeile 186 lautet heute:

```js
      const migrated = p.migrate(raw);
```

und wird zu:

```js
      const migrated = p.migrate(raw, w.CHAR_IDS);
```

Falls die Variable, die das Wardrobe-Modul hält, an dieser Stelle anders heisst als `w`, den dort tatsächlich gebundenen Namen aus `Promise.all([...]).then(([w, p]) => {` in Zeile 182 verwenden.

- [ ] **Step 4: Tests laufen lassen**

Run: `npm test`
Expected: PASS, unverändert mindestens 24 Tests — insbesondere `Registry kennt genau die erwarteten Figuren`.

- [ ] **Step 5: Im Browser belegen, dass ein bestehender Spielstand weiterlebt**

```bash
python3 -m http.server 8799 --directory . &
```

Im Browser `http://localhost:8799/` öffnen, in der Konsole einen alten Stand setzen und neu laden:

```js
localStorage.setItem('stylestar_v1', JSON.stringify({ unlocked: 4, stars: { pyjama: 3, schule: 2 } }));
location.reload();
```

Expected: die Themenwahl des Mädchens zeigt vier freigeschaltete Themen, Pyjama-Party mit 3 und Schulparty mit 2 Sternen. Danach in der Konsole prüfen:

```js
JSON.parse(localStorage.getItem('stylestar_v1'))
```

Expected: `{ v: 2, chars: { girl: {...}, boy: {...} } }` — beide Figuren vorhanden. Danach den Server beenden.

Schlägt das fehl, ist der Durchreich-Schritt die erste Verdächtige: ein `undefined` als `charIds` lässt `Object.fromEntries(undefined.map(...))` werfen, und die Seite bliebe im Ladezustand hängen.

- [ ] **Step 6: Commit**

```bash
git add wardrobe.js index.html
git commit -m "refactor(wardrobe): derive CHAR_IDS from the character registry"
```

---

## Self-Review

**Spec-Abdeckung**

| Spec-Akzeptanzkriterium | Task |
| --- | --- |
| `progress.js` ohne ID-Literal und ohne `CHAR_IDS` | Task 1, Steps 3 und 5 |
| `wardrobe.js` leitet `CHAR_IDS` ab | Task 2, Step 2 |
| Parameter ohne Default | Task 1, Step 3 |
| `index.html` reicht `w.CHAR_IDS` durch | Task 2, Step 3 |
| Test mit dreielementiger Liste | Task 1, Step 1 |
| Alle Tests grün, ≥ 23 | Task 1 Step 4, Task 2 Step 4 (tatsächlich ≥ 24) |
| Alter Spielstand migriert weiterhin | Task 1 Step 1 (Unit), Task 2 Step 5 (im Browser) |

**Placeholder-Scan** — keine TBDs; jeder Code-Schritt enthält den vollständigen Zielzustand.

**Typkonsistenz** — `charIds` ist in `blankProgress` und `migrate` durchgehend `string[]` und wird in Task 2 Step 3 aus `CHAR_IDS` (`Object.keys` → `string[]`) versorgt. `blankChar()` bleibt überall nullstellig. `STORAGE_KEY` wird nicht angefasst.

**Reihenfolge-Abhängigkeit** — Task 2 Step 3 darf nicht vor Task 1 laufen: `migrate(raw, w.CHAR_IDS)` gegen die alte, einstellige Signatur würde das zweite Argument still schlucken und den Fehler verdecken. Task 1 zuerst, dann Task 2.
