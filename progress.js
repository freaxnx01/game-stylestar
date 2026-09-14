// StyleUp! – Fortschritts-Format und Migration.
// Der Key bleibt bewusst 'stylestar_v1': ein neuer Key würde bestehenden
// Fortschritt wegwerfen. Versioniert wird stattdessen der Wert über 'v'.
export const STORAGE_KEY = 'stylestar_v1';

export const blankChar = () => ({ unlocked: 1, stars: {} });

export const blankProgress = (charIds) => ({
  v: 4,
  chars: Object.fromEntries(charIds.map(id => [id, blankChar()])),
  dates: { stars: {} },
  skin: 0,
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

// Der Hautton ist ein Index in SKINS. Die Liste kennt progress.js nicht, also
// wird hier nur auf 'nicht-negative ganze Zahl' geprüft; gegen die tatsächliche
// Länge klemmt die Anzeige.
const skinFrom = (src) => (Number.isInteger(src) && src >= 0) ? src : 0;

const datesFrom = (src) =>
  (src && src.stars && typeof src.stars === 'object') ? { stars: { ...src.stars } } : { stars: {} };

export function migrate(parsed, charIds) {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return blankProgress(charIds);

  // v2, v3 und v4 unterscheiden sich nur in Zweigen, die dazugekommen sind:
  // v3 kennt die Dates, v4 den gewählten Hautton. Ältere Stände erben die
  // Defaults, ohne dass Sterne verloren gehen.
  if ((parsed.v === 2 || parsed.v === 3 || parsed.v === 4) && parsed.chars && typeof parsed.chars === 'object') {
    return {
      v: 4,
      chars: charsFrom(parsed.chars, charIds),
      dates: datesFrom(parsed.dates),
      skin: skinFrom(parsed.skin),
    };
  }

  // Altes Flachformat { unlocked, stars } — der gesamte Stand gehört dem Mädchen.
  if (typeof parsed.unlocked === 'number' && parsed.stars && typeof parsed.stars === 'object') {
    const p = blankProgress(charIds);
    p.chars.girl = { unlocked: parsed.unlocked, stars: { ...parsed.stars } };
    return p;
  }

  return blankProgress(charIds);
}
