import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STORAGE_KEY, blankChar, blankProgress, migrate } from '../progress.js';

const IDS = ['girl', 'boy'];

test('der Storage-Key bleibt stylestar_v1', () => {
  assert.equal(STORAGE_KEY, 'stylestar_v1');
});

test('blankProgress gibt beiden Figuren einen eigenen leeren Stand', () => {
  const p = blankProgress(IDS);
  assert.equal(p.v, 4);
  assert.deepEqual(p.chars.girl, { unlocked: 1, stars: {} });
  assert.deepEqual(p.chars.boy, { unlocked: 1, stars: {} });
  p.chars.girl.stars.pyjama = 3;
  assert.deepEqual(p.chars.boy.stars, {}, 'die Figuren dürfen sich kein Objekt teilen');
});

test('migrate übernimmt ein v4-Objekt unverändert', () => {
  const src = { v: 4, chars: { girl: { unlocked: 5, stars: { ball: 3 } }, boy: { unlocked: 2, stars: {} } }, dates: { stars: {} }, skin: 1 };
  assert.deepEqual(migrate(src, IDS), src);
});

test('migrate hebt das alte Flachformat auf das Mädchen', () => {
  const old = { unlocked: 4, stars: { pyjama: 3, schule: 2 } };
  const p = migrate(old, IDS);
  assert.equal(p.v, 4);
  assert.deepEqual(p.chars.girl, { unlocked: 4, stars: { pyjama: 3, schule: 2 } });
  assert.deepEqual(p.chars.boy, { unlocked: 1, stars: {} });
  assert.deepEqual(p.dates, { stars: {} });
});

test('blankProgress ist v4 mit leerem Date-Zweig', () => {
  const p = blankProgress(IDS);
  assert.equal(p.v, 4);
  assert.deepEqual(p.dates, { stars: {} });
});

test('v2 wird auf v4 gehoben, die Figuren bleiben', () => {
  const p = migrate({ v: 2, chars: { girl: { unlocked: 5, stars: { ball: 3 } }, boy: { unlocked: 2, stars: {} } } }, IDS);
  assert.equal(p.v, 4);
  assert.deepEqual(p.chars.girl, { unlocked: 5, stars: { ball: 3 } });
  assert.deepEqual(p.dates, { stars: {} });
});

test('v3 behält seine Date-Sterne beim Heben auf v4', () => {
  const src = { v: 3, chars: { girl: { unlocked: 1, stars: {} }, boy: { unlocked: 1, stars: {} } }, dates: { stars: { kino: 3 } } };
  assert.deepEqual(migrate(src, IDS), { ...src, v: 4, skin: 0 });
});

test('ein kaputter Date-Zweig wird ersetzt, nicht übernommen', () => {
  for (const bad of [null, 'nope', 42, {}, { stars: 'nein' }]) {
    const p = migrate({ v: 3, chars: { girl: { unlocked: 1, stars: {} }, boy: { unlocked: 1, stars: {} } }, dates: bad }, IDS);
    assert.deepEqual(p.dates, { stars: {} }, `Eingabe ${JSON.stringify(bad)}`);
  }
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

test('blankProgress startet bei Hautton 0', () => {
  assert.equal(blankProgress(IDS).skin, 0);
});

test('migrate uebernimmt den gespeicherten Hautton', () => {
  const src = { v: 4, chars: { girl: { unlocked: 2, stars: {} }, boy: { unlocked: 1, stars: {} } }, dates: { stars: {} }, skin: 2 };
  assert.equal(migrate(src, IDS).skin, 2);
});

test('v3 wird auf v4 gehoben und erbt Hautton 0', () => {
  const src = { v: 3, chars: { girl: { unlocked: 5, stars: { ball: 3 } }, boy: { unlocked: 1, stars: {} } }, dates: { stars: { kino: 2 } } };
  const p = migrate(src, IDS);
  assert.equal(p.v, 4);
  assert.equal(p.skin, 0);
  assert.deepEqual(p.chars.girl, { unlocked: 5, stars: { ball: 3 } }, 'Sterne duerfen nicht verloren gehen');
  assert.deepEqual(p.dates, { stars: { kino: 2 } });
});

test('ein unbrauchbarer Hautton faellt auf 0 zurueck', () => {
  for (const bad of [-1, 1.5, '2', null, undefined, NaN]) {
    const src = { v: 4, chars: { girl: { unlocked: 1, stars: {} }, boy: { unlocked: 1, stars: {} } }, dates: { stars: {} }, skin: bad };
    assert.equal(migrate(src, IDS).skin, 0, `skin ${String(bad)} muss auf 0 fallen`);
  }
});
