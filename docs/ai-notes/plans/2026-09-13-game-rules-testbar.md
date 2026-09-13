# Spielregeln testbar machen — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Die reinen Spielregeln — Bewertung, Fortschritts-Zusammenführung, Figurwechsel — aus der Komponentenklasse in `index.html` in ein testbares Modul `game-rules.js` heben und abdecken.

**Architecture:** Ein neues Modul mit drei seiteneffektfreien Funktionen. Die Komponente behält nur das von Natur aus Unreine: `setState`, `localStorage`, `Math.random`, `setInterval`. Das Spielverhalten ändert sich nicht — nur der Ort, an dem die Entscheidung fällt.

**Tech Stack:** Buildless ES-Module im Browser, `node --test`.

**Spec:** [`docs/ai-notes/specs/2026-09-13-game-rules-testbar-design.md`](../specs/2026-09-13-game-rules-testbar-design.md)

## Global Constraints

- **Buildless.** Keine neuen Dependencies; `package.json` bleibt ohne `dependencies`/`devDependencies`.
- **`npm test` ist `node --test` ohne Pfadargument.** Ein Verzeichnis anzuhängen bricht auf Node 24 mit `MODULE_NOT_FOUND` ab. Das Script nicht anfassen.
- **Verhaltensgleichheit ist Pflicht.** Die Punkte-Formel, die Sterne-Schwellen und die Freischaltregel werden **wörtlich** übernommen, nicht „verbessert". Jede Abweichung wäre eine stille Spieländerung.
- **Keine der drei Funktionen benutzt `this`, `localStorage`, `Math.random`, `setState` oder Timer.**
- **`recordResult` mutiert sein Argument nicht** — die Komponente arbeitet mit `setState` und braucht ein neues Objekt.
- **TDD.** Jede Funktion beginnt mit einem Test, der aus dem richtigen Grund rot ist.

---

## File Structure

| Datei | Änderung |
| --- | --- |
| `game-rules.js` | *(neu)* `scoreLook`, `recordResult`, `switchCharacterState` |
| `tests/game-rules.test.mjs` | *(neu)* 8 Tests über die drei Funktionen |
| `index.html` | Dritter dynamischer Import; `pickChar()` und `finish()` rufen das Modul auf |

---

### Task 1: `game-rules.js` mit Tests

Das Modul entsteht vollständig mit Abdeckung, bevor die Komponente darauf umgestellt wird. Nach dieser Task ist `index.html` unverändert und das Spiel läuft wie bisher — die neue Datei ist nur noch nicht verdrahtet.

**Files:**
- Create: `tests/game-rules.test.mjs`
- Create: `game-rules.js`

**Interfaces:**
- Consumes: nichts aus vorherigen Tasks
- Produces:
  - `scoreLook(character, theme, worn) => { pts: number, stars: 1|2|3 }`
  - `recordResult(progress, charId, themeId, stars, levelIdx, needStars) => { v: 2, chars: Record<string, {unlocked: number, stars: Record<string, number>}> }`
  - `switchCharacterState(character) => { worn: object, tab: string, levelIdx: 0, result: null }`

- [ ] **Step 1: Die fehlschlagenden Tests schreiben**

`tests/game-rules.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scoreLook, recordResult, switchCharacterState } from '../game-rules.js';

// Eine Miniatur-Figur: nur so viel Kleiderschrank, wie die Regeln brauchen.
const CHAR = {
  ITEM_BY_ID: {
    t1: { tags: ['pyjama'] }, t2: { tags: ['schule'] },
    b1: { tags: ['pyjama'] }, b2: { tags: ['schule'] },
    d1: { tags: ['pyjama'] },
    s1: { tags: ['pyjama'] }, e1: { tags: ['pyjama'] },
  },
  defaultWorn: { hair: 'h1', top: 't1', bottom: 'b1', dress: null, shoes: 's1', extra: null },
  tabs: [['hair', 'Haare'], ['top', 'Oben']],
};
const THEME = { id: 'pyjama' };
const leer = { hair: 'h1', top: null, bottom: null, dress: null, shoes: null, extra: null };

test('ein passendes Kleid ersetzt Oberteil und Unterteil', () => {
  const mitKleid = scoreLook(CHAR, THEME, { ...leer, dress: 'd1', shoes: 's1', extra: 'e1' });
  const mitZweiteiler = scoreLook(CHAR, THEME, { ...leer, top: 't1', bottom: 'b1', shoes: 's1', extra: 'e1' });
  assert.deepEqual(mitKleid, { pts: 4, stars: 3 });
  assert.deepEqual(mitZweiteiler, { pts: 4, stars: 3 });
});

test('ein unpassendes Kleid gibt null Punkte, auch wenn Oberteil passt', () => {
  const r = scoreLook(CHAR, THEME, { ...leer, dress: 'd1', top: 't1', bottom: 'b1' });
  assert.equal(r.pts, 2, 'd1 passt (2), top/bottom zählen im Kleid-Zweig nicht');
  const r2 = scoreLook(CHAR, { id: 'schule' }, { ...leer, dress: 'd1', top: 't2', bottom: 'b2' });
  assert.equal(r2.pts, 0);
});

test('die drei Sterne-Schwellen', () => {
  assert.equal(scoreLook(CHAR, THEME, leer).stars, 1);
  assert.equal(scoreLook(CHAR, THEME, { ...leer, top: 't1' }).stars, 1);
  assert.equal(scoreLook(CHAR, THEME, { ...leer, top: 't1', bottom: 'b1' }).stars, 2);
  assert.equal(scoreLook(CHAR, THEME, { ...leer, top: 't1', bottom: 'b1', shoes: 's1' }).stars, 2);
  assert.equal(scoreLook(CHAR, THEME, { ...leer, top: 't1', bottom: 'b1', shoes: 's1', extra: 'e1' }).stars, 3);
});

const PROG = () => ({ v: 2, chars: { girl: { unlocked: 1, stars: {} }, boy: { unlocked: 3, stars: { fussball: 2 } } } });

test('recordResult lässt den übergebenen Fortschritt unverändert', () => {
  const vorher = PROG();
  const kopie = JSON.parse(JSON.stringify(vorher));
  recordResult(vorher, 'girl', 'pyjama', 3, 0, 2);
  assert.deepEqual(vorher, kopie);
});

test('recordResult berührt nur die gespielte Figur', () => {
  const p = recordResult(PROG(), 'girl', 'pyjama', 3, 0, 2);
  assert.deepEqual(p.chars.boy, { unlocked: 3, stars: { fussball: 2 } });
  assert.equal(p.chars.girl.stars.pyjama, 3);
});

test('ein schlechteres Ergebnis senkt den Bestwert nicht', () => {
  const p1 = recordResult(PROG(), 'girl', 'pyjama', 3, 0, 2);
  const p2 = recordResult(p1, 'girl', 'pyjama', 1, 0, 2);
  assert.equal(p2.chars.girl.stars.pyjama, 3);
});

test('freigeschaltet wird erst ab needStars, und nie rückwärts', () => {
  assert.equal(recordResult(PROG(), 'girl', 'pyjama', 1, 0, 2).chars.girl.unlocked, 1);
  assert.equal(recordResult(PROG(), 'girl', 'pyjama', 2, 0, 2).chars.girl.unlocked, 2);
  assert.equal(recordResult(PROG(), 'girl', 'pyjama', 2, 0, 3).chars.girl.unlocked, 1, 'schwierig: 2 Sterne reichen nicht');
  assert.equal(recordResult(PROG(), 'girl', 'pyjama', 3, 0, 3).chars.girl.unlocked, 2);
  const weit = { v: 2, chars: { girl: { unlocked: 5, stars: {} } } };
  assert.equal(recordResult(weit, 'girl', 'pyjama', 3, 0, 2).chars.girl.unlocked, 5, 'darf nicht zurückfallen');
});

test('switchCharacterState liefert die Vorgaben der Zielfigur', () => {
  const s = switchCharacterState(CHAR);
  assert.deepEqual(s, { worn: CHAR.defaultWorn, tab: 'hair', levelIdx: 0, result: null });
  s.worn.top = 'geändert';
  assert.equal(CHAR.defaultWorn.top, 't1', 'defaultWorn darf nicht geteilt werden');
});
```

- [ ] **Step 2: Test laufen lassen und Fehlschlag bestätigen**

Run: `npm test`
Expected: FAIL mit `Cannot find module '…/game-rules.js'`.

- [ ] **Step 3: `game-rules.js` schreiben**

Die drei Funktionen übernehmen die heutige Logik aus `index.html:200-209` und `index.html:221-236` wörtlich:

```js
// StyleUp! – die reinen Spielregeln. Keine Seiteneffekte, kein `this`:
// setState, localStorage, Math.random und Timer bleiben in der Komponente.

// Wie gut passt das Outfit zum Thema? Ein Kleid ersetzt Oberteil + Unterteil
// und zählt deshalb doppelt; Schuhe und Extra geben je einen Punkt.
export function scoreLook(character, theme, worn) {
  const fits = id => !!(id && character.ITEM_BY_ID[id] && character.ITEM_BY_ID[id].tags.includes(theme.id));
  let pts = worn.dress
    ? (fits(worn.dress) ? 2 : 0)
    : (fits(worn.top) ? 1 : 0) + (fits(worn.bottom) ? 1 : 0);
  pts += (fits(worn.shoes) ? 1 : 0) + (fits(worn.extra) ? 1 : 0);
  const stars = pts >= 4 ? 3 : pts >= 2 ? 2 : 1;
  return { pts, stars };
}

// Was ändert sich am Fortschritt, wenn eine Figur ein Thema abschliesst?
// Gibt einen neuen Fortschritt zurück; das Argument bleibt unberührt.
export function recordResult(progress, charId, themeId, stars, levelIdx, needStars) {
  const cur = progress.chars[charId];
  const mine = { unlocked: cur.unlocked, stars: { ...cur.stars } };
  mine.stars[themeId] = Math.max(mine.stars[themeId] || 0, stars);
  if (stars >= needStars) mine.unlocked = Math.max(mine.unlocked, levelIdx + 2);
  return { v: 2, chars: { ...progress.chars, [charId]: mine } };
}

// Welcher Zustand gilt, nachdem auf eine andere Figur gewechselt wurde?
// defaultWorn der alten Figur nennt IDs, die es bei der neuen nicht gibt, und
// levelIdx zeigt sonst in eine fremde Themenliste.
export function switchCharacterState(character) {
  return {
    worn: { ...character.defaultWorn },
    tab: character.tabs[0][0],
    levelIdx: 0,
    result: null,
  };
}
```

- [ ] **Step 4: Tests laufen lassen**

Run: `npm test`
Expected: PASS, mindestens 32 Tests (24 bestehende + 8 neue).

- [ ] **Step 5: Verhaltensgleichheit gegen die heutige Inline-Formel belegen**

Der wichtigste Schritt dieser Task: beweisen, dass die extrahierte Bewertung
identisch rechnet — über alle echten Themen und Kleiderschränke, nicht nur
über die Miniatur-Figur aus den Tests.

```bash
node --input-type=module -e "
const { CHARACTERS } = await import('./wardrobe.js');
const { scoreLook } = await import('./game-rules.js');

// die heutige Formel aus index.html, wörtlich
function inline(C, t, w) {
  const fits = id => !!(id && C.ITEM_BY_ID[id] && C.ITEM_BY_ID[id].tags.includes(t.id));
  let pts = w.dress ? (fits(w.dress) ? 2 : 0) : (fits(w.top) ? 1 : 0) + (fits(w.bottom) ? 1 : 0);
  pts += (fits(w.shoes) ? 1 : 0) + (fits(w.extra) ? 1 : 0);
  return { pts, stars: pts >= 4 ? 3 : pts >= 2 ? 2 : 1 };
}

let n = 0, diff = 0;
const pick = a => a.length ? a[Math.floor(Math.random()*(a.length+1))] : undefined;
for (const cid of ['girl','boy']) {
  const C = CHARACTERS[cid];
  for (const t of C.THEMES) {
    for (let i = 0; i < 4000; i++) {
      const w = {};
      for (const cat of ['top','bottom','dress','shoes','extra']) {
        const it = pick(C.ITEMS[cat] || []);
        w[cat] = it ? it.id : null;
      }
      const a = inline(C, t, w), b = scoreLook(C, t, w);
      n++;
      if (a.pts !== b.pts || a.stars !== b.stars) { diff++; if (diff < 3) console.log('ABWEICHUNG', cid, t.id, JSON.stringify(w), a, b); }
    }
  }
}
console.log('verglichene Outfits:', n, '| Abweichungen:', diff);
"
```

Expected: `verglichene Outfits: 64000 | Abweichungen: 0`.

Bei jeder Abweichung: **nicht** den Vergleich anpassen, sondern `scoreLook` an die Inline-Formel angleichen — die ist der Ist-Zustand des Spiels.

- [ ] **Step 6: Commit**

```bash
git add game-rules.js tests/game-rules.test.mjs
git commit -m "feat(rules): extract the pure game rules into a testable module"
```

---

### Task 2: Die Komponente auf das Modul umstellen

**Files:**
- Modify: `index.html:182` (dritter Import), `index.html:200-209` (`pickChar`), `index.html:221-236` (`finish`)

**Interfaces:**
- Consumes: `scoreLook`, `recordResult`, `switchCharacterState` aus Task 1
- Produces: unverändertes Spielverhalten; `this.R` hält das Regel-Modul

- [ ] **Step 1: Das Modul mitladen**

`componentDidMount` lädt heute zwei Module. Die `Promise.all`-Zeile wird zu:

```js
    Promise.all([import('./wardrobe.js'), import('./progress.js'), import('./game-rules.js')]).then(([w, p, r]) => {
      this.W = w; this.P = p; this.R = r;
```

Der Rest des Rumpfs bleibt unverändert.

- [ ] **Step 2: `pickChar()` umstellen**

```js
  pickChar(id) {
    if (id === this.state.char) return;
    this.setState({ char: id, ...this.R.switchCharacterState(this.W.CHARACTERS[id]) });
  }
```

Der erklärende Kommentar über der Methode wandert mit nach `game-rules.js` (dort steht er bereits über `switchCharacterState`) und entfällt hier.

- [ ] **Step 3: `finish()` umstellen**

Der Kopf der Methode bis einschliesslich `this.save(prog);` wird zu:

```js
  finish() {
    const C = this.W.CHARACTERS[this.state.char];
    const t = C.THEMES[this.state.levelIdx];
    const { pts, stars } = this.R.scoreLook(C, t, this.state.worn);
    const likes = 40 + pts * 38 + Math.floor(Math.random() * 20);
    const prog = this.R.recordResult(this.state.progress, this.state.char, t.id,
                                     stars, this.state.levelIdx, this.needStars());
    this.save(prog);
```

Alles ab `this.setState({ result: { stars, likes }, likesShown: 0, progress: prog });` bleibt unverändert, einschliesslich `clearInterval` und des Likes-Timers.

- [ ] **Step 4: Belegen, dass keine Regel-Logik in `index.html` zurückgeblieben ist**

```bash
grep -n "pts >= 4\|fits(\|Math.max(mine\|defaultWorn" index.html || echo "keine Regel-Logik mehr in index.html"
```

Expected: `keine Regel-Logik mehr in index.html`.

- [ ] **Step 5: Tests laufen lassen**

Run: `npm test`
Expected: PASS, unverändert mindestens 32 Tests.

- [ ] **Step 6: Im Browser durchspielen**

```bash
python3 -m http.server 8799 --directory . &
```

Auf `http://localhost:8799/` prüfen:

1. Startscreen zeigt beide Figuren; ein Klick auf „Junge" wechselt Vorschau, und nach „Los geht's!" erscheinen seine acht Themen.
2. Ein Thema öffnen, ein passendes Oberteil, Unterteil, Schuhe und Extra anziehen, „Fertig" — drei Sterne, das nächste Thema ist frei.
3. Zurück zum Start, auf „Mädchen" wechseln: ihre Themenwahl zeigt ihren eigenen Sterne-Stand, nicht den des Jungen.
4. Seite neu laden — beide Stände sind erhalten.

Danach den Server beenden.

- [ ] **Step 7: Commit**

```bash
git add index.html
git commit -m "refactor(game): apply the extracted rules in the component"
```

---

## Self-Review

**Spec-Abdeckung**

| Spec-Akzeptanzkriterium | Task |
| --- | --- |
| `game-rules.js` mit drei Exporten | Task 1, Step 3 |
| Keine Seiteneffekte in den drei Funktionen | Task 1 Step 3 (Code enthält keine), Global Constraints |
| `index.html` ruft die Funktionen auf | Task 2, Steps 1–3 |
| Punkte-Formel nicht mehr in `index.html` | Task 2, Step 4 |
| Acht Testfälle wie in der AC aufgezählt | Task 1, Step 1 |
| `npm test` ≥ 32 Tests | Task 1 Step 4, Task 2 Step 5 |
| Verhalten unverändert | Task 1 Step 5 (64 000 Outfits), Task 2 Step 6 (Browser) |

**Placeholder-Scan** — keine TBDs; jeder Code-Schritt enthält den vollständigen Zielzustand.

**Typkonsistenz** — `scoreLook` gibt `{ pts, stars }` zurück und wird in Task 2 Step 3 genau so destrukturiert. `recordResult` nimmt sechs Argumente in derselben Reihenfolge wie im Aufruf. `switchCharacterState` liefert vier Felder, die in Task 2 Step 2 per Spread neben `char` in `setState` landen — `char` ist bewusst nicht Teil des Rückgabewerts.

**Reihenfolge-Abhängigkeit** — Task 2 setzt Task 1 voraus: ohne das Modul wirft der Import in `componentDidMount` und das Spiel bleibt im Ladezustand hängen.

**Hinweis zur Herkunft** — Modul, Tests und der Äquivalenz-Check aus Task 1 Step 5 wurden vor dem Schreiben dieses Plans ausgeführt: 8 von 8 Tests grün, 64 000 verglichene Outfits ohne Abweichung.
