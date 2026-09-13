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
  // ...progress statt eines Literals: die Funktion besitzt weder die
  // Formatversion noch den Date-Zweig und darf beides nicht verlieren.
  return { ...progress, chars: { ...progress.chars, [charId]: mine } };
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
