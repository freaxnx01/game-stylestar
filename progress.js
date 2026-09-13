// StyleUp! – Fortschritts-Format und Migration.
// Der Key bleibt bewusst 'stylestar_v1': ein neuer Key würde bestehenden
// Fortschritt wegwerfen. Versioniert wird stattdessen der Wert über 'v'.
export const STORAGE_KEY = 'stylestar_v1';

export const blankChar = () => ({ unlocked: 1, stars: {} });

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
