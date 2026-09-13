// StyleUp! – Figur-Registry. Der einzige Kleiderschrank-Import in index.html.
import { CHARACTER as girl } from './wardrobe-girl.js';
import { CHARACTER as boy } from './wardrobe-boy.js';

export { SKINS } from './wardrobe-core.js';
export { DATE_THEMES } from './wardrobe-dates.js';

export const CHARACTERS = { girl, boy };
// Aus der Registry abgeleitet, damit die Liste nicht von ihr abweichen kann.
export const CHAR_IDS = Object.keys(CHARACTERS);
