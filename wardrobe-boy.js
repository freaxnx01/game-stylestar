// StyleUp! – Kleiderschrank der Jungen-Figur
import { uri, sp, dot, capSleeve, tank, sleeves, hip, legs, buildItems, buildHair } from './wardrobe-core.js';

const dollUri = (c) => uri(`
<path d='M95 170 L84 300' stroke='${c}' stroke-width='19' stroke-linecap='round' fill='none'/>
<path d='M205 170 L216 300' stroke='${c}' stroke-width='19' stroke-linecap='round' fill='none'/>
<path d='M134 300 L131 562' stroke='${c}' stroke-width='29' stroke-linecap='round' fill='none'/>
<path d='M166 300 L169 562' stroke='${c}' stroke-width='29' stroke-linecap='round' fill='none'/>
<ellipse cx='127' cy='572' rx='20' ry='10' fill='${c}'/><ellipse cx='173' cy='572' rx='20' ry='10' fill='${c}'/>
<rect x='139' y='112' width='22' height='48' fill='${c}'/>
<path d='M100 164 Q150 146 200 164 Q206 226 180 250 L180 302 Q150 314 120 302 L120 250 Q94 226 100 164 Z' fill='${c}'/>
<ellipse cx='100' cy='92' rx='10' ry='12' fill='${c}'/><ellipse cx='200' cy='92' rx='10' ry='12' fill='${c}'/>
<ellipse cx='150' cy='88' rx='49' ry='53' fill='${c}'/>
<circle cx='131' cy='90' r='5.5' fill='#4A3728'/><circle cx='169' cy='90' r='5.5' fill='#4A3728'/>
<circle cx='133' cy='88' r='1.8' fill='#fff'/><circle cx='171' cy='88' r='1.8' fill='#fff'/>
<path d='M121 75 Q131 70 141 76' stroke='#4A3728' stroke-width='3' stroke-linecap='round' fill='none'/>
<path d='M159 76 Q169 70 179 75' stroke='#4A3728' stroke-width='3' stroke-linecap='round' fill='none'/>
<path d='M139 110 Q150 118 161 110' stroke='#B34A55' stroke-width='3' stroke-linecap='round' fill='none'/>
<path d='M118 250 Q150 264 182 250 L186 322 L156 322 L150 306 L144 322 L114 322 Z' fill='#5B84C4'/>
`);

const HAIR = buildHair([
  { id: 'h1', name: 'Kurzhaarschnitt', c: '#8A5B34',
    back: `<path d='M96 88 Q150 18 204 88 L204 120 L96 120 Z' fill='#8A5B34'/>`,
    front: `<path d='M99 94 Q97 32 150 28 Q203 32 201 94 Q196 62 150 56 Q104 62 99 94 Z' fill='#8A5B34'/>` },
  { id: 'h2', name: 'Struppelkopf', c: '#3A3A46',
    back: `<path d='M96 90 Q150 16 204 90 L204 118 L96 118 Z' fill='#3A3A46'/>`,
    front: `<path d='M99 92 Q98 30 150 26 Q202 30 201 92 Q196 58 150 52 Q104 58 99 92 Z' fill='#3A3A46'/>` +
      [[112, 46], [132, 32], [152, 27], [172, 33], [190, 48]].map(p => dot(p[0], p[1], 11, '#3A3A46')).join('') },
  { id: 'h3', name: 'Undercut', c: '#F2C14E',
    back: `<path d='M98 92 Q150 20 202 92 L202 116 L98 116 Z' fill='#F2C14E'/>`,
    front: `<path d='M100 92 Q100 34 150 28 Q200 34 200 92 L182 92 Q186 58 150 54 Q116 60 118 92 Z' fill='#F2C14E'/><path d='M118 66 Q150 46 182 66' stroke='#D9A02E' stroke-width='4' fill='none'/>` },
  { id: 'h4', name: 'Lockenkopf', c: '#5B3A26',
    back: `<ellipse cx='150' cy='86' rx='60' ry='62' fill='#5B3A26'/>` + [[108, 52], [150, 32], [192, 52], [100, 100], [200, 100]].map(p => dot(p[0], p[1], 23, '#5B3A26')).join(''),
    front: `<path d='M101 90 Q100 32 150 28 Q200 32 199 90 Q194 58 150 52 Q106 58 101 90 Z' fill='#5B3A26'/>` + dot(106, 86, 12, '#5B3A26') + dot(194, 86, 12, '#5B3A26') },
  { id: 'h5', name: 'Surfer-Mähne', c: '#D9A441',
    back: `<path d='M94 84 Q150 10 206 84 L208 208 Q180 222 150 222 Q120 222 92 208 Z' fill='#D9A441'/>`,
    front: `<path d='M98 96 Q96 30 150 26 Q204 30 202 96 Q196 60 168 56 Q140 54 120 70 Q106 80 98 96 Z' fill='#D9A441'/>` },
  { id: 'h6', name: 'Buzzcut', c: '#2F2A26',
    back: `<path d='M100 94 Q150 26 200 94 L200 112 L100 112 Z' fill='#2F2A26'/>`,
    front: `<path d='M102 92 Q102 38 150 34 Q198 38 198 92 Q192 66 150 62 Q108 66 102 92 Z' fill='#2F2A26' opacity='.9'/>` },
]);

const rawItems = {
  top: [
    { id: 't1', name: 'Sternen-Schlafshirt', tags: ['pyjama'], art: sleeves('#7C86E8') + capSleeve('#7C86E8') + sp(133, 196, 7) + sp(167, 228, 6) + sp(150, 176, 5) },
    { id: 't2', name: 'Streifen-Shirt', tags: ['schule'], art: capSleeve('#4A7DF4') + [186, 206, 226, 246].map(y => `<path d='M115 ${y} Q150 ${y + 8} 185 ${y}' stroke='#fff' stroke-width='6' fill='none'/>`).join('') },
    { id: 't3', name: 'Strand-Tanktop', tags: ['strand'], art: tank('#35C9C0') + `<path d='M116 242 Q133 234 150 242 Q167 250 184 242' stroke='#fff' stroke-width='4' fill='none' stroke-linecap='round'/>` },
    { id: 't4', name: 'Fussball-Trikot', tags: ['fussball'], art: capSleeve('#E8433A') + `<path d='M136 158 L150 176 L164 158' stroke='#fff' stroke-width='5' fill='none'/><text x='150' y='232' font-family='Fredoka,sans-serif' font-size='44' font-weight='700' fill='#fff' text-anchor='middle'>9</text>` },
    { id: 't5', name: 'Skater-Hoodie', tags: ['skater', 'schule'], art: sleeves('#6BC4A4') + capSleeve('#6BC4A4') + `<path d='M120 170 Q150 198 180 170 Q180 150 150 145 Q120 150 120 170 Z' fill='#4FAE8C'/><rect x='128' y='222' width='44' height='26' rx='11' fill='#4FAE8C'/><path d='M142 182 L142 200 M158 182 L158 200' stroke='#fff' stroke-width='3' stroke-linecap='round'/>` },
    { id: 't6', name: 'Norweger-Pulli', tags: ['winter'], art: sleeves('#D65A5A') + capSleeve('#D65A5A') + `<path d='M113 210 L123 199 L133 210 L143 199 L153 210 L163 199 L173 210 L183 199' stroke='#fff' stroke-width='4' fill='none' stroke-linecap='round'/>` + [[122, 180], [150, 174], [178, 180]].map(p => dot(p[0], p[1], 2.8)).join('') },
    { id: 't7', name: 'Lederjacke', tags: ['rockstar'], art: sleeves('#2F2A26') + capSleeve('#2F2A26') + `<path d='M150 158 L150 258' stroke='#6E655C' stroke-width='4'/><path d='M126 166 L136 254 M174 166 L164 254' stroke='#6E655C' stroke-width='3'/><circle cx='138' cy='200' r='3' fill='#C9BFA8'/><circle cx='162' cy='200' r='3' fill='#C9BFA8'/>` },
    { id: 't8', name: 'Kettenhemd', tags: ['ritter'], art: sleeves('#A8B0BC') + capSleeve('#A8B0BC') + [176, 194, 212, 230, 248].map(y => [122, 136, 150, 164, 178].map(x => dot(x, y, 3.2, '#8C95A3')).join('')).join('') },
  ],
  bottom: [
    { id: 'b1', name: 'Schlafhose', tags: ['pyjama'], art: hip('#7C86E8') + legs('#7C86E8', 542, 34) + [[131, 340], [132, 410], [130, 480], [169, 360], [168, 430], [171, 500]].map(p => dot(p[0], p[1], 3)).join('') },
    { id: 'b2', name: 'Chino', tags: ['schule'], art: hip('#C9A87C') + legs('#C9A87C', 546, 32) + `<path d='M133 300 L131 540 M167 300 L169 540' stroke='#B08F63' stroke-width='3'/>` },
    { id: 'b3', name: 'Badeshorts', tags: ['strand'], art: hip('#FF8A7A') + `<path d='M133 292 L130 340' stroke='#FF8A7A' stroke-width='35' stroke-linecap='round' fill='none'/><path d='M167 292 L170 340' stroke='#FF8A7A' stroke-width='35' stroke-linecap='round' fill='none'/><path d='M116 336 L146 336 M154 336 L184 336' stroke='#fff' stroke-width='5' stroke-linecap='round'/>` },
    { id: 'b4', name: 'Fussball-Shorts', tags: ['fussball', 'skater'], art: hip('#fff') + `<path d='M133 292 L130 346' stroke='#fff' stroke-width='35' stroke-linecap='round' fill='none'/><path d='M167 292 L170 346' stroke='#fff' stroke-width='35' stroke-linecap='round' fill='none'/><path d='M118 300 L118 342 M182 300 L182 342' stroke='#E8433A' stroke-width='5'/>` },
    { id: 'b5', name: 'Baggy-Jeans', tags: ['skater'], art: hip('#5B84C4') + `<path d='M132 292 L126 548' stroke='#5B84C4' stroke-width='40' stroke-linecap='round' fill='none'/><path d='M168 292 L174 548' stroke='#5B84C4' stroke-width='40' stroke-linecap='round' fill='none'/><path d='M112 430 L140 430 M160 430 L188 430' stroke='#9FBCE8' stroke-width='3' stroke-dasharray='6 5'/>` },
    { id: 'b6', name: 'Schneehose', tags: ['winter'], art: hip('#4C6FA8') + legs('#4C6FA8', 538, 35) + `<rect x='112' y='528' width='34' height='16' rx='8' fill='#3A5684'/><rect x='154' y='528' width='34' height='16' rx='8' fill='#3A5684'/>` },
    { id: 'b7', name: 'Nietenjeans', tags: ['rockstar'], art: hip('#3A3A46') + legs('#3A3A46', 550, 28) + [[128, 330], [172, 330], [128, 400], [172, 400]].map(p => dot(p[0], p[1], 3, '#C9BFA8')).join('') },
    { id: 'b8', name: 'Ritterhose', tags: ['ritter'], art: hip('#6E655C') + legs('#6E655C', 544, 32) + `<path d='M120 300 Q150 314 180 300' stroke='#A8B0BC' stroke-width='5' fill='none'/>` },
  ],
  dress: [],
  shoes: [
    { id: 's1', name: 'Drachen-Hausschuhe', tags: ['pyjama'], art: `<ellipse cx='125' cy='568' rx='23' ry='14' fill='#6BC4A4'/><ellipse cx='175' cy='568' rx='23' ry='14' fill='#6BC4A4'/><path d='M112 558 L118 548 L124 558 L130 548 L136 558' stroke='#4FAE8C' stroke-width='4' fill='none'/><path d='M162 558 L168 548 L174 558 L180 548 L186 558' stroke='#4FAE8C' stroke-width='4' fill='none'/>` },
    { id: 's2', name: 'Coole Sneaker', tags: ['schule', 'skater'], art: `<rect x='104' y='550' width='42' height='24' rx='11' fill='#fff'/><rect x='154' y='550' width='42' height='24' rx='11' fill='#fff'/><rect x='104' y='570' width='42' height='9' rx='4' fill='#4A7DF4'/><rect x='154' y='570' width='42' height='9' rx='4' fill='#4A7DF4'/><path d='M112 558 L124 558 M162 558 L174 558' stroke='#9AA3B2' stroke-width='3' stroke-linecap='round'/>` },
    { id: 's3', name: 'Flip-Flops', tags: ['strand'], art: `<ellipse cx='125' cy='576' rx='22' ry='8' fill='#35C9C0'/><ellipse cx='175' cy='576' rx='22' ry='8' fill='#35C9C0'/><path d='M113 572 L125 560 L137 572' stroke='#fff' stroke-width='4' fill='none' stroke-linecap='round'/><path d='M163 572 L175 560 L187 572' stroke='#fff' stroke-width='4' fill='none' stroke-linecap='round'/>` },
    { id: 's4', name: 'Fussballschuhe', tags: ['fussball'], art: `<path d='M104 566 Q112 552 132 554 L146 566 Q146 576 128 576 L110 576 Q102 574 104 566 Z' fill='#E8433A'/><path d='M196 566 Q188 552 168 554 L154 566 Q154 576 172 576 L190 576 Q198 574 196 566 Z' fill='#E8433A'/>` + [[112, 578], [124, 578], [136, 578], [164, 578], [176, 578], [188, 578]].map(p => dot(p[0], p[1], 2.6, '#3A3A46')).join('') },
    { id: 's5', name: 'Skater-Schuhe', tags: ['skater', 'rockstar'], art: `<rect x='102' y='546' width='46' height='28' rx='10' fill='#3A3A46'/><rect x='152' y='546' width='46' height='28' rx='10' fill='#3A3A46'/><rect x='102' y='568' width='46' height='10' rx='5' fill='#fff'/><rect x='152' y='568' width='46' height='10' rx='5' fill='#fff'/><path d='M110 556 L128 556' stroke='#fff' stroke-width='3' stroke-linecap='round'/><path d='M160 556 L178 556' stroke='#fff' stroke-width='3' stroke-linecap='round'/>` },
    { id: 's6', name: 'Winterstiefel', tags: ['winter'], art: `<rect x='110' y='514' width='30' height='54' rx='9' fill='#4C6FA8'/><rect x='160' y='514' width='30' height='54' rx='9' fill='#4C6FA8'/><ellipse cx='125' cy='516' rx='18' ry='8' fill='#EAF2FB'/><ellipse cx='175' cy='516' rx='18' ry='8' fill='#EAF2FB'/><rect x='106' y='562' width='38' height='13' rx='6' fill='#3A5684'/><rect x='156' y='562' width='38' height='13' rx='6' fill='#3A5684'/>` },
    { id: 's7', name: 'Rockerboots', tags: ['rockstar'], art: `<rect x='111' y='504' width='28' height='64' rx='9' fill='#2F2A26'/><rect x='161' y='504' width='28' height='64' rx='9' fill='#2F2A26'/><rect x='106' y='562' width='38' height='14' rx='6' fill='#1D1A17'/><rect x='156' y='562' width='38' height='14' rx='6' fill='#1D1A17'/><path d='M113 522 L137 522 M163 522 L187 522' stroke='#C9BFA8' stroke-width='3'/>` },
    { id: 's8', name: 'Ritterstiefel', tags: ['ritter'], art: `<rect x='111' y='508' width='28' height='60' rx='8' fill='#6E655C'/><rect x='161' y='508' width='28' height='60' rx='8' fill='#6E655C'/><path d='M111 530 L139 530 M161 530 L189 530' stroke='#A8B0BC' stroke-width='5'/><rect x='106' y='562' width='38' height='13' rx='6' fill='#4A443D'/><rect x='156' y='562' width='38' height='13' rx='6' fill='#4A443D'/>` },
  ],
  extra: [
    { id: 'e1', name: 'Schlafmütze', tags: ['pyjama'], art: `<path d='M102 66 Q106 20 150 16 Q186 20 196 44 Q210 30 224 34 Q216 52 200 58 L198 66 Z' fill='#7C86E8'/><rect x='100' y='58' width='100' height='16' rx='8' fill='#fff'/><circle cx='226' cy='34' r='10' fill='#fff'/>` },
    { id: 'e2', name: 'Schulrucksack', tags: ['schule'], art: `<path d='M112 172 L120 262' stroke='#E8433A' stroke-width='11' stroke-linecap='round' fill='none'/><path d='M188 172 L180 262' stroke='#E8433A' stroke-width='11' stroke-linecap='round' fill='none'/><rect x='196' y='186' width='40' height='56' rx='12' fill='#E8433A'/><rect x='196' y='214' width='40' height='12' fill='#B93028'/>` },
    { id: 'e3', name: 'Sonnenbrille', tags: ['strand'], art: `<rect x='114' y='78' width='32' height='22' rx='10' fill='#3A3A46'/><rect x='154' y='78' width='32' height='22' rx='10' fill='#3A3A46'/><path d='M146 86 L154 86' stroke='#3A3A46' stroke-width='4'/><path d='M114 84 L103 78 M186 84 L197 78' stroke='#3A3A46' stroke-width='4' stroke-linecap='round'/>` },
    { id: 'e4', name: 'Kapitänsbinde', tags: ['fussball'], art: `<path d='M96 190 Q106 182 116 190 L114 216 Q105 222 97 216 Z' fill='#FFCB47'/><text x='106' y='210' font-family='Fredoka,sans-serif' font-size='18' font-weight='700' fill='#E8433A' text-anchor='middle'>C</text>` },
    { id: 'e5', name: 'Skater-Cap', tags: ['skater', 'fussball'], art: `<path d='M104 60 Q106 22 150 20 Q194 22 196 60 Z' fill='#6BC4A4'/><path d='M96 60 Q150 76 204 60 L207 67 Q150 86 93 67 Z' fill='#4FAE8C'/><circle cx='150' cy='22' r='3.5' fill='#fff'/>` },
    { id: 'e6', name: 'Bommelmütze', tags: ['winter'], art: `<path d='M102 66 Q104 18 150 14 Q196 18 198 66 Z' fill='#4C6FA8'/><rect x='100' y='56' width='100' height='17' rx='8' fill='#3A5684'/><circle cx='150' cy='12' r='10' fill='#fff'/>` },
    { id: 'e7', name: 'E-Gitarre', tags: ['rockstar'], art: `<path d='M196 322 Q186 300 200 288 Q216 278 230 292 Q244 306 234 326 Q224 344 210 338 Q198 334 196 322 Z' fill='#E8433A'/><path d='M216 292 L246 232' stroke='#6E655C' stroke-width='9' stroke-linecap='round'/><rect x='240' y='220' width='14' height='18' rx='4' fill='#3A3A46'/><path d='M208 314 L232 302' stroke='#fff' stroke-width='2'/>` },
    { id: 'e8', name: 'Ritterhelm', tags: ['ritter'], art: `<path d='M104 96 Q104 28 150 24 Q196 28 196 96 Q150 110 104 96 Z' fill='#A8B0BC'/><rect x='112' y='76' width='76' height='9' rx='4' fill='#4A443D'/><path d='M150 24 L150 76' stroke='#8C95A3' stroke-width='4'/><path d='M138 30 Q150 6 162 30' fill='#E8433A'/>` },
  ],
};

const EVB = { e1: '88 0 124 85', e2: '100 160 145 115', e3: '90 60 120 55', e4: '88 172 40 58', e5: '85 15 130 75', e6: '88 0 124 85', e7: '188 210 75 145', e8: '95 0 110 118' };

const { ITEMS, ITEM_BY_ID } = buildItems(rawItems, EVB);

const THEMES = [
  { id: 'pyjama', name: 'Pyjama-Party', hints: ['kuschelig', 'Sterne', 'gemütlich'], sig: 't1' },
  { id: 'schule', name: 'Schulparty', hints: ['cool', 'schick', 'lässig'], sig: 't2' },
  { id: 'strand', name: 'Strand & Sommer', hints: ['sonnig', 'luftig', 'Sommer'], sig: 't3' },
  { id: 'fussball', name: 'Fussball-Match', hints: ['Trikot', 'Stollen', 'Team'], sig: 't4' },
  { id: 'skater', name: 'Skater-Park', hints: ['Streetwear', 'Cap', 'baggy'], sig: 't5' },
  { id: 'winter', name: 'Winter-Style', hints: ['warm', 'flauschig', 'Schnee'], sig: 't6' },
  { id: 'rockstar', name: 'Rockstar', hints: ['Bühne', 'Leder', 'laut'], sig: 't7' },
  { id: 'ritter', name: 'Ritter-Fest', hints: ['Rüstung', 'Wappen', 'mutig'], sig: 't8' },
];

export const CHARACTER = {
  id: 'boy',
  name: 'Junge',
  dollUri,
  HAIR, ITEMS, ITEM_BY_ID, THEMES,
  tabs: [['hair', 'Haare'], ['top', 'Oben'], ['bottom', 'Unten'], ['shoes', 'Schuhe'], ['extra', 'Extras']],
  defaultWorn: { hair: 'h1', top: 't2', bottom: 'b2', dress: null, shoes: 's2', extra: null },
};
