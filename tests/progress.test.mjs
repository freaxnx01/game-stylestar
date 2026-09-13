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
