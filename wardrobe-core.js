// StyleUp! – gemeinsame SVG-Bausteine für alle Figuren
export const FULL = '0 0 300 620';
export const uri = (inner, vb = FULL) => 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb + '">' + inner + '</svg>');
export const BLANK = uri('', '0 0 1 1');

export const sp = (x, y, s, c = '#fff') => `<path d='M${x} ${y - s} L${x + s * .35} ${y - s * .35} L${x + s} ${y} L${x + s * .35} ${y + s * .35} L${x} ${y + s} L${x - s * .35} ${y + s * .35} L${x - s} ${y} L${x - s * .35} ${y - s * .35} Z' fill='${c}'/>`;
export const dot = (x, y, r, c = '#fff') => `<circle cx='${x}' cy='${y}' r='${r}' fill='${c}'/>`;
export const fl = (x, y) => [0, 72, 144, 216, 288].map(a => dot(x + 5.5 * Math.cos(a * Math.PI / 180), y + 5.5 * Math.sin(a * Math.PI / 180), 4, '#FBB6D9')).join('') + dot(x, y, 3.2, '#FFCB47');

export const SKINS = ['#F8CEAA', '#DCA478', '#9C6B43'];

export const capSleeve = c => `<path d='M102 160 Q150 144 198 160 L207 212 Q197 222 187 214 L187 258 Q150 272 113 258 L113 214 Q103 222 93 212 Z' fill='${c}'/>`;
export const tank = c => `<path d='M112 164 Q150 152 188 164 L187 258 Q150 272 113 258 Z' fill='${c}'/>`;
export const sleeves = c => `<path d='M97 168 L88 296' stroke='${c}' stroke-width='21' stroke-linecap='round' fill='none'/><path d='M203 168 L212 296' stroke='${c}' stroke-width='21' stroke-linecap='round' fill='none'/>`;
export const hip = c => `<path d='M116 250 Q150 263 184 250 L187 298 Q150 312 113 298 Z' fill='${c}'/>`;
export const legs = (c, y, w) => `<path d='M133 292 L130 ${y}' stroke='${c}' stroke-width='${w}' stroke-linecap='round' fill='none'/><path d='M167 292 L170 ${y}' stroke='${c}' stroke-width='${w}' stroke-linecap='round' fill='none'/>`;

export const TVB = { top: '80 130 145 165', bottom: '85 235 130 320', dress: '55 135 190 430', shoes: '95 500 110 100', hair: '55 0 190 250' };

// Baut aus rohen Item-Definitionen die gerenderten Listen plus die Lookup-Map.
// evb hält die Extra-ViewBoxes, weil Extras über die ganze Figur verteilt sitzen
// und sich keinen gemeinsamen Thumbnail-Ausschnitt teilen.
export function buildItems(rawItems, evb = {}) {
  const ITEMS = {}, ITEM_BY_ID = {};
  for (const cat of Object.keys(rawItems)) {
    ITEMS[cat] = rawItems[cat].map(it => {
      const vb = cat === 'extra' ? evb[it.id] : TVB[cat];
      const o = { id: it.id, name: it.name, tags: it.tags, cat, img: uri(it.art), thumb: uri(it.art, vb) };
      ITEM_BY_ID[it.id] = o;
      return o;
    });
  }
  return { ITEMS, ITEM_BY_ID };
}

// faceFill ist der Gesichtston im Frisuren-Thumbnail. Default ist der erste
// Hautton, also derselbe, mit dem die Figur startet.
export function buildHair(hairDefs, faceFill = SKINS[0]) {
  return hairDefs.map(h => ({
    ...h,
    backImg: uri(h.back),
    frontImg: uri(h.front),
    thumb: uri(h.back + `<ellipse cx='150' cy='88' rx='50' ry='54' fill='${faceFill}'/>` + h.front, TVB.hair),
  }));
}

// Der Gesichtston im Thumbnail muss dem gewählten Hautton folgen, back/front
// hängen aber nicht daran. Statt bei jedem Render neu zu bauen, liefert die
// Fabrik pro Ton eine gemerkte Liste — es gibt nur so viele wie SKINS.
export function hairFactory(hairDefs) {
  const cache = new Map();
  return (faceFill = SKINS[0]) => {
    if (!cache.has(faceFill)) cache.set(faceFill, buildHair(hairDefs, faceFill));
    return cache.get(faceFill);
  };
}
