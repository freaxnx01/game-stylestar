import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scoreLook, recordResult, switchCharacterState, scoreDate, recordDateResult } from '../game-rules.js';

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

test('ein getragenes Kleid verdrängt Oberteil und Unterteil aus der Wertung', () => {
  const r = scoreLook(CHAR, THEME, { ...leer, dress: 'd1', top: 't1', bottom: 'b1' });
  assert.equal(r.pts, 2, 'd1 passt (2); top/bottom zählen im Kleid-Zweig gar nicht mit');
});

test('ein unpassendes Kleid gibt null Punkte, auch wenn Oberteil und Unterteil passen', () => {
  const r = scoreLook(CHAR, { id: 'schule' }, { ...leer, dress: 'd1', top: 't2', bottom: 'b2' });
  assert.equal(r.pts, 0, 'd1 passt nicht zu schule, und t2/b2 werden verdrängt');
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
