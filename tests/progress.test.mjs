import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STORAGE_KEY, blankChar, blankProgress, migrate } from '../progress.js';

const IDS = ['girl', 'boy'];

test('der Storage-Key bleibt stylestar_v1', () => {
  assert.equal(STORAGE_KEY, 'stylestar_v1');
});

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

test('blankChar liefert jedes Mal ein neues Objekt', () => {
  assert.notEqual(blankChar(), blankChar());
  assert.deepEqual(blankChar(), { unlocked: 1, stars: {} });
});

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
