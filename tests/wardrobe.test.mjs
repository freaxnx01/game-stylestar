import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHARACTERS, CHAR_IDS, SKINS, DATE_THEMES } from '../wardrobe.js';

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
    // Erlaubt sind die Themen der Figur und die gemeinsamen Date-Themen.
    const themeIds = new Set([...C.THEMES.map(t => t.id), ...DATE_THEMES.map(t => t.id)]);
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
