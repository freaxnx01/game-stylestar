// StyleUp! – Kleiderschrank der Mädchen-Figur
import { uri, sp, dot, fl, capSleeve, tank, sleeves, hip, legs, buildItems, buildHair } from './wardrobe-core.js';

const dollUri = (c) => uri(`
<path d='M97 168 L86 300' stroke='${c}' stroke-width='17' stroke-linecap='round' fill='none'/>
<path d='M203 168 L214 300' stroke='${c}' stroke-width='17' stroke-linecap='round' fill='none'/>
<path d='M134 300 L131 562' stroke='${c}' stroke-width='27' stroke-linecap='round' fill='none'/>
<path d='M166 300 L169 562' stroke='${c}' stroke-width='27' stroke-linecap='round' fill='none'/>
<ellipse cx='127' cy='572' rx='19' ry='10' fill='${c}'/><ellipse cx='173' cy='572' rx='19' ry='10' fill='${c}'/>
<rect x='140' y='112' width='20' height='46' fill='${c}'/>
<path d='M105 162 Q150 146 195 162 Q201 226 178 252 L178 302 Q150 314 122 302 L122 252 Q99 226 105 162 Z' fill='${c}'/>
<ellipse cx='102' cy='92' rx='10' ry='12' fill='${c}'/><ellipse cx='198' cy='92' rx='10' ry='12' fill='${c}'/>
<ellipse cx='150' cy='88' rx='50' ry='54' fill='${c}'/>
<circle cx='131' cy='90' r='5.5' fill='#4A3728'/><circle cx='169' cy='90' r='5.5' fill='#4A3728'/>
<circle cx='133' cy='88' r='1.8' fill='#fff'/><circle cx='171' cy='88' r='1.8' fill='#fff'/>
<path d='M122 76 Q131 71 140 75' stroke='#4A3728' stroke-width='2.5' stroke-linecap='round' fill='none'/>
<path d='M160 75 Q169 71 178 76' stroke='#4A3728' stroke-width='2.5' stroke-linecap='round' fill='none'/>
<path d='M139 109 Q150 119 161 109' stroke='#B34A55' stroke-width='3' stroke-linecap='round' fill='none'/>
<circle cx='117' cy='103' r='6' fill='#F79FB0' opacity='.5'/><circle cx='183' cy='103' r='6' fill='#F79FB0' opacity='.5'/>
<path d='M118 196 L118 300 Q150 312 182 300 L182 196 Q150 210 118 196 Z' fill='#FFFFFF'/>
<path d='M118 294 Q150 308 182 294 L184 328 L156 332 L150 320 L144 332 L116 328 Z' fill='#EDE7F5'/>
`);

const HAIR = buildHair([
  { id: 'h1', name: 'Lange Mähne', c: '#F2C14E',
    back: `<path d='M90 80 Q150 4 210 80 L216 298 Q183 316 150 316 Q117 316 84 298 Z' fill='#F2C14E'/>`,
    front: `<path d='M97 96 Q94 28 150 24 Q206 28 203 96 Q198 102 193 96 Q195 54 150 50 Q105 54 107 96 Q102 102 97 96 Z' fill='#F2C14E'/>` },
  { id: 'h2', name: 'Pferdeschwanz', c: '#8A5B34',
    back: `<path d='M94 86 Q150 8 206 86 L206 130 L94 130 Z' fill='#8A5B34'/><path d='M198 58 Q248 92 232 190 Q224 240 208 258' stroke='#8A5B34' stroke-width='24' fill='none' stroke-linecap='round'/>`,
    front: `<path d='M97 96 Q94 28 150 24 Q206 28 203 96 Q198 102 193 96 Q195 54 150 50 Q105 54 107 96 Q102 102 97 96 Z' fill='#8A5B34'/><circle cx='200' cy='54' r='9' fill='#F45FA2'/>` },
  { id: 'h3', name: 'Frecher Bob', c: '#3A3A46',
    back: `<path d='M92 84 Q150 8 208 84 L212 160 Q212 188 186 190 L114 190 Q88 188 88 160 Z' fill='#3A3A46'/>`,
    front: `<path d='M98 96 Q95 26 150 24 Q205 26 202 96 L186 96 L186 64 L114 64 L114 96 Z' fill='#3A3A46'/>` },
  { id: 'h4', name: 'Zauberwellen', c: '#F27FB2',
    back: `<path d='M90 80 Q150 4 210 80 Q222 130 210 170 Q224 210 210 250 Q220 285 200 305 Q150 322 100 305 Q80 285 90 250 Q76 210 90 170 Q78 130 90 80 Z' fill='#F27FB2'/>`,
    front: `<path d='M97 96 Q94 28 150 24 Q206 28 203 96 Q198 102 193 96 Q195 54 150 50 Q105 54 107 96 Q102 102 97 96 Z' fill='#F27FB2'/>` },
  { id: 'h5', name: 'Zöpfe', c: '#C4593B',
    back: `<path d='M94 84 Q150 8 206 84 L206 126 L94 126 Z' fill='#C4593B'/>`,
    front: `<path d='M97 96 Q94 28 150 24 Q206 28 203 96 Q198 102 193 96 Q195 54 150 50 Q105 54 107 96 Q102 102 97 96 Z' fill='#C4593B'/>` +
      [[97, 138], [94, 170], [92, 202], [203, 138], [206, 170], [208, 202]].map(p => dot(p[0], p[1], 13, '#C4593B')).join('') +
      `<circle cx='91' cy='224' r='6' fill='#35C9C0'/><circle cx='209' cy='224' r='6' fill='#35C9C0'/>` },
  { id: 'h6', name: 'Wilde Locken', c: '#5B3A26',
    back: `<ellipse cx='150' cy='100' rx='64' ry='74' fill='#5B3A26'/>` + [[104, 66], [150, 40], [196, 66], [96, 118], [204, 118], [102, 168], [198, 168]].map(p => dot(p[0], p[1], 26, '#5B3A26')).join(''),
    front: `<path d='M99 92 Q98 30 150 26 Q202 30 201 92 Q196 60 150 54 Q104 60 99 92 Z' fill='#5B3A26'/>` + dot(103, 92, 12, '#5B3A26') + dot(197, 92, 12, '#5B3A26') },
]);

const rawItems = {
  top: [
    { id: 't1', name: 'Sternen-Schlafshirt', tags: ['pyjama'], art: sleeves('#B9A6F2') + capSleeve('#B9A6F2') + sp(135, 198, 7) + sp(166, 228, 6) + sp(150, 178, 5) },
    { id: 't2', name: 'Glitzer-Top', tags: ['schule', 'festival'], art: capSleeve('#F45FA2') + [[128, 180], [158, 195], [140, 220], [172, 176], [125, 240], [165, 248]].map(p => dot(p[0], p[1], 2.6)).join('') },
    { id: 't3', name: 'Sommer-Top', tags: ['strand'], art: tank('#35C9C0') + `<path d='M116 244 Q133 236 150 244 Q167 252 184 244' stroke='#fff' stroke-width='4' fill='none' stroke-linecap='round'/>` },
    { id: 't4', name: 'Boho-Fransentop', tags: ['festival'], art: `<path d='M112 164 Q150 152 188 164 L187 240 Q150 252 113 240 Z' fill='#E8933A'/>` + [118, 128, 139, 150, 161, 172, 182].map(x => `<path d='M${x} 240 L${x} 268' stroke='#E8933A' stroke-width='4' stroke-linecap='round'/>`).join('') },
    { id: 't5', name: 'Kuschel-Hoodie', tags: ['pyjama', 'sport'], art: sleeves('#7FD8B8') + capSleeve('#7FD8B8') + `<path d='M120 170 Q150 198 180 170 Q180 150 150 145 Q120 150 120 170 Z' fill='#6BC4A4'/><rect x='128' y='222' width='44' height='26' rx='11' fill='#6BC4A4'/><path d='M142 182 L142 200 M158 182 L158 200' stroke='#fff' stroke-width='3' stroke-linecap='round'/>` },
    { id: 't6', name: 'Schicke Bluse', tags: ['ball', 'schule'], art: sleeves('#FFF6E8') + capSleeve('#FFF6E8') + `<path d='M136 154 L150 172 L145 151 Z' fill='#F3E3C8'/><path d='M164 154 L150 172 L155 151 Z' fill='#F3E3C8'/>` + [190, 210, 230].map(y => dot(150, y, 2.6, '#D9B96A')).join('') },
    { id: 't7', name: 'Norweger-Pulli', tags: ['winter'], art: sleeves('#D65A5A') + capSleeve('#D65A5A') + `<path d='M113 210 L123 199 L133 210 L143 199 L153 210 L163 199 L173 210 L183 199' stroke='#fff' stroke-width='4' fill='none' stroke-linecap='round'/>` + [[122, 180], [150, 174], [178, 180], [128, 238], [172, 238]].map(p => dot(p[0], p[1], 2.8)).join('') },
    { id: 't8', name: 'Bühnen-Glitzerjacke', tags: ['kpop'], art: sleeves('#5FD4F4') + capSleeve('#5FD4F4') + `<path d='M150 160 L150 258' stroke='#fff' stroke-width='4'/>` + [sp(130, 190, 5, '#F45FA2'), sp(170, 214, 5, '#F45FA2'), sp(134, 240, 5, '#F45FA2'), sp(168, 176, 4, '#F45FA2')].join('') },
    { id: 't9', name: 'Sportshirt', tags: ['sport'], art: capSleeve('#4A7DF4') + `<path d='M120 172 L120 252 M180 172 L180 252' stroke='#fff' stroke-width='5' stroke-linecap='round'/>` + sp(150, 206, 9) },
  ],
  bottom: [
    { id: 'b1', name: 'Kuschelhose', tags: ['pyjama'], art: hip('#B9A6F2') + legs('#B9A6F2', 542, 32) + [[131, 340], [132, 410], [130, 480], [169, 360], [168, 430], [171, 500], [135, 275], [165, 285]].map(p => dot(p[0], p[1], 3)).join('') },
    { id: 'b2', name: 'Jeansrock', tags: ['schule'], art: `<path d='M118 250 L104 328 Q150 342 196 328 L182 250 Q150 263 118 250 Z' fill='#5B84C4'/><path d='M108 320 Q150 333 192 320' stroke='#9FBCE8' stroke-width='3' stroke-dasharray='6 5' fill='none'/><path d='M122 258 Q130 272 140 274 M178 258 Q170 272 160 274' stroke='#9FBCE8' stroke-width='3' fill='none'/>` },
    { id: 'b3', name: 'Sommer-Shorts', tags: ['strand', 'festival', 'sport'], art: hip('#FF8A7A') + `<path d='M133 292 L130 332' stroke='#FF8A7A' stroke-width='33' stroke-linecap='round' fill='none'/><path d='M167 292 L170 332' stroke='#FF8A7A' stroke-width='33' stroke-linecap='round' fill='none'/><path d='M118 330 L144 330 M156 330 L182 330' stroke='#fff' stroke-width='4' stroke-linecap='round'/>` },
    { id: 'b4', name: 'Glitzer-Leggings', tags: ['festival', 'schule', 'kpop'], art: hip('#A05FF4') + legs('#A05FF4', 552, 29) + [sp(132, 360, 5), sp(168, 410, 5), sp(131, 470, 5), sp(169, 510, 5)].join('') },
    { id: 'b5', name: 'Tüllrock', tags: ['ball', 'schule'], art: `<path d='M116 250 Q150 263 184 250 L200 352 Q150 372 100 352 Z' fill='#FBB6D9' opacity='.85'/><path d='M120 250 L188 250 L196 330 Q150 348 104 330 Z' fill='#F9CFE4' opacity='.7'/><rect x='116' y='245' width='68' height='13' rx='6' fill='#F45FA2'/>` },
    { id: 'b6', name: 'Jogginghose', tags: ['pyjama', 'sport'], art: hip('#9AA3B2') + legs('#9AA3B2', 526, 32) + `<rect x='115' y='522' width='31' height='17' rx='8' fill='#7E8795'/><rect x='154' y='522' width='31' height='17' rx='8' fill='#7E8795'/><path d='M141 300 L138 510 M159 300 L162 510' stroke='#fff' stroke-width='3'/>` },
    { id: 'b7', name: 'Schneehose', tags: ['winter'], art: hip('#EAF2FB') + legs('#EAF2FB', 538, 32) + `<path d='M133 292 L130 538 M167 292 L170 538' stroke='#C9DEF5' stroke-width='4'/><rect x='114' y='530' width='32' height='14' rx='7' fill='#C9DEF5'/><rect x='154' y='530' width='32' height='14' rx='7' fill='#C9DEF5'/>` },
  ],
  dress: [
    { id: 'd1', name: 'Funkel-Ballkleid', tags: ['ball'], art: `<path d='M114 166 Q150 154 186 166 L186 248 L114 248 Z' fill='#F45FA2'/><path d='M114 244 Q92 380 72 522 Q150 550 228 522 Q208 380 186 244 Q150 258 114 244 Z' fill='#F45FA2'/><rect x='112' y='239' width='76' height='14' rx='7' fill='#D6437F'/>` + [sp(112, 380, 6), sp(152, 330, 6), sp(190, 420, 6), sp(130, 470, 6), sp(176, 492, 6)].join('') },
    { id: 'd2', name: 'Sonnen-Sommerkleid', tags: ['strand'], art: `<path d='M114 164 Q150 152 186 164 L186 248 L114 248 Z' fill='#FFCB47'/><path d='M114 244 Q100 330 92 400 Q150 420 208 400 Q200 330 186 244 Q150 258 114 244 Z' fill='#FFCB47'/><path d='M94 396 Q150 416 206 396' stroke='#fff' stroke-width='5' fill='none'/>` + [[126, 300], [162, 320], [140, 360], [176, 372], [118, 356]].map(p => dot(p[0], p[1], 3.5)).join('') },
    { id: 'd3', name: 'Glitzer-Partykleid', tags: ['schule', 'festival', 'kpop'], art: `<circle cx='108' cy='170' r='12' fill='#8A5FF4'/><circle cx='192' cy='170' r='12' fill='#8A5FF4'/><path d='M112 162 Q150 148 188 162 L188 248 L112 248 Z' fill='#8A5FF4'/><path d='M112 244 Q98 320 90 378 Q150 396 210 378 Q202 320 188 244 Q150 258 112 244 Z' fill='#8A5FF4'/><rect x='110' y='240' width='80' height='12' rx='6' fill='#6E44D9'/>` + [sp(130, 300, 5, '#EDE7FA'), sp(170, 330, 5, '#EDE7FA'), sp(148, 362, 5, '#EDE7FA'), sp(150, 200, 5, '#EDE7FA')].join('') },
    { id: 'd4', name: 'Traum-Nachthemd', tags: ['pyjama'], art: sleeves('#A8CFF5') + `<path d='M110 164 Q150 150 190 164 L200 418 Q150 434 100 418 Z' fill='#A8CFF5'/><path d='M102 408 Q150 424 198 408' stroke='#fff' stroke-width='4' fill='none'/>` + [sp(132, 220, 6), sp(168, 270, 6), sp(138, 330, 6), sp(170, 380, 6)].join('') },
  ],
  shoes: [
    { id: 's1', name: 'Hasen-Hausschuhe', tags: ['pyjama'], art: `<ellipse cx='118' cy='548' rx='5' ry='12' fill='#fff'/><ellipse cx='132' cy='548' rx='5' ry='12' fill='#fff'/><ellipse cx='168' cy='548' rx='5' ry='12' fill='#fff'/><ellipse cx='182' cy='548' rx='5' ry='12' fill='#fff'/><ellipse cx='125' cy='568' rx='23' ry='14' fill='#fff'/><ellipse cx='175' cy='568' rx='23' ry='14' fill='#fff'/><circle cx='125' cy='570' r='5' fill='#F9A8CE'/><circle cx='175' cy='570' r='5' fill='#F9A8CE'/>` },
    { id: 's2', name: 'Coole Sneaker', tags: ['schule', 'festival', 'sport', 'kpop'], art: `<rect x='104' y='550' width='42' height='24' rx='11' fill='#fff'/><rect x='154' y='550' width='42' height='24' rx='11' fill='#fff'/><rect x='104' y='570' width='42' height='9' rx='4' fill='#35C9C0'/><rect x='154' y='570' width='42' height='9' rx='4' fill='#35C9C0'/><path d='M112 558 L124 558 M162 558 L174 558' stroke='#B9A6F2' stroke-width='3' stroke-linecap='round'/>` },
    { id: 's3', name: 'Strand-Sandalen', tags: ['strand'], art: `<ellipse cx='125' cy='576' rx='22' ry='8' fill='#B97B4E'/><ellipse cx='175' cy='576' rx='22' ry='8' fill='#B97B4E'/><path d='M112 570 L125 556 L138 570' stroke='#8A5B34' stroke-width='4' fill='none' stroke-linecap='round'/><path d='M162 570 L175 556 L188 570' stroke='#8A5B34' stroke-width='4' fill='none' stroke-linecap='round'/>` },
    { id: 's4', name: 'Glitzer-Ballerinas', tags: ['ball', 'schule'], art: `<ellipse cx='125' cy='568' rx='21' ry='12' fill='#F9A8CE'/><ellipse cx='175' cy='568' rx='21' ry='12' fill='#F9A8CE'/>` + [sp(125, 566, 4), sp(175, 566, 4)].join('') },
    { id: 's5', name: 'Festival-Boots', tags: ['festival'], art: `<rect x='112' y='510' width='27' height='58' rx='9' fill='#8A5B34'/><rect x='161' y='510' width='27' height='58' rx='9' fill='#8A5B34'/><rect x='107' y='562' width='37' height='13' rx='6' fill='#5E3B1E'/><rect x='156' y='562' width='37' height='13' rx='6' fill='#5E3B1E'/><circle cx='125' cy='528' r='3' fill='#F2C14E'/><circle cx='174' cy='528' r='3' fill='#F2C14E'/>` },
    { id: 's6', name: 'Flausch-Boots', tags: ['winter'], art: `<rect x='112' y='518' width='27' height='50' rx='9' fill='#F6F9FF'/><rect x='161' y='518' width='27' height='50' rx='9' fill='#F6F9FF'/><ellipse cx='125' cy='520' rx='17' ry='8' fill='#fff'/><ellipse cx='174' cy='520' rx='17' ry='8' fill='#fff'/><rect x='108' y='562' width='36' height='12' rx='6' fill='#C9DEF5'/><rect x='157' y='562' width='36' height='12' rx='6' fill='#C9DEF5'/>` },
  ],
  extra: [
    { id: 'e1', name: 'Schlafmaske', tags: ['pyjama'], art: `<path d='M102 66 Q150 46 198 66' stroke='#8F7BD8' stroke-width='7' fill='none'/><ellipse cx='150' cy='44' rx='30' ry='16' fill='#B9A6F2'/><path d='M138 44 Q142 49 146 44 M154 44 Q158 49 162 44' stroke='#6C58B8' stroke-width='2.5' fill='none' stroke-linecap='round'/>` },
    { id: 'e2', name: 'Funkel-Diadem', tags: ['ball'], art: `<path d='M114 50 Q150 28 186 50' stroke='#F2C14E' stroke-width='7' fill='none'/><path d='M150 10 L157 34 L143 34 Z' fill='#F2C14E'/><path d='M127 22 L135 42 L121 45 Z' fill='#F2C14E'/><path d='M173 22 L179 45 L165 42 Z' fill='#F2C14E'/><circle cx='150' cy='14' r='4' fill='#F45FA2'/><circle cx='127' cy='26' r='3.2' fill='#F45FA2'/><circle cx='173' cy='26' r='3.2' fill='#F45FA2'/>` },
    { id: 'e3', name: 'Sonnenbrille', tags: ['strand', 'festival'], art: `<rect x='114' y='78' width='32' height='22' rx='10' fill='#3A3A46'/><rect x='154' y='78' width='32' height='22' rx='10' fill='#3A3A46'/><path d='M146 86 L154 86' stroke='#3A3A46' stroke-width='4'/><path d='M114 84 L103 78 M186 84 L197 78' stroke='#3A3A46' stroke-width='4' stroke-linecap='round'/>` },
    { id: 'e4', name: 'Mini-Handtasche', tags: ['schule', 'ball'], art: `<path d='M198 304 Q214 282 230 304' stroke='#D6437F' stroke-width='5' fill='none'/><rect x='194' y='302' width='40' height='32' rx='11' fill='#F45FA2'/><circle cx='214' cy='310' r='3.5' fill='#FFE1EF'/>` },
    { id: 'e5', name: 'Blumenkranz', tags: ['festival', 'strand'], art: [[112, 58], [131, 44], [150, 38], [169, 44], [188, 58]].map(p => fl(p[0], p[1])).join('') },
    { id: 'e6', name: 'Perlenkette', tags: ['ball', 'schule'], art: [[126, 168], [134, 177], [143, 182], [150, 184], [157, 182], [166, 177], [174, 168]].map(p => `<circle cx='${p[0]}' cy='${p[1]}' r='4.5' fill='#FDF6EA' stroke='#E0CD9F' stroke-width='1.5'/>`).join('') },
    { id: 'e7', name: 'Bommelmütze', tags: ['winter'], art: `<path d='M102 66 Q104 18 150 14 Q196 18 198 66 Z' fill='#D65A5A'/><rect x='100' y='56' width='100' height='17' rx='8' fill='#B94747'/><circle cx='150' cy='12' r='10' fill='#fff'/>` },
    { id: 'e8', name: 'Neon-Kopfhörer', tags: ['kpop'], art: `<path d='M104 62 Q150 8 196 62' stroke='#F45FA2' stroke-width='9' fill='none'/><rect x='90' y='70' width='19' height='32' rx='9' fill='#F45FA2'/><rect x='191' y='70' width='19' height='32' rx='9' fill='#F45FA2'/><circle cx='99' cy='86' r='4' fill='#FFE1EF'/><circle cx='201' cy='86' r='4' fill='#FFE1EF'/>` },
    { id: 'e9', name: 'Sport-Cap', tags: ['sport'], art: `<path d='M104 60 Q106 24 150 22 Q194 24 196 60 Z' fill='#4A7DF4'/><path d='M96 60 Q150 76 204 60 L207 67 Q150 86 93 67 Z' fill='#3B66C9'/><circle cx='150' cy='24' r='3.5' fill='#fff'/>` },
  ],
};

const EVB = { e1: '85 15 130 70', e2: '95 0 110 65', e3: '90 60 120 55', e4: '180 275 70 75', e5: '95 20 110 60', e6: '110 150 80 55', e7: '88 0 124 85', e8: '82 5 136 105', e9: '85 15 130 75' };

const { ITEMS, ITEM_BY_ID } = buildItems(rawItems, EVB);

const THEMES = [
  { id: 'pyjama', name: 'Pyjama-Party', hints: ['kuschelig', 'Sterne', 'gemütlich'], sig: 'd4' },
  { id: 'schule', name: 'Schulparty', hints: ['schick', 'Glitzer', 'cool'], sig: 'd3' },
  { id: 'strand', name: 'Strand & Sommer', hints: ['sonnig', 'luftig', 'Sommer'], sig: 'd2' },
  { id: 'sport', name: 'Sport & Streetwear', hints: ['sportlich', 'bequem', 'aktiv'], sig: 't9' },
  { id: 'festival', name: 'Festival', hints: ['Boho', 'Fransen', 'Blumen'], sig: 't4' },
  { id: 'winter', name: 'Winter-Style', hints: ['warm', 'flauschig', 'Schnee'], sig: 't7' },
  { id: 'kpop', name: 'K-Pop Star', hints: ['Bühne', 'Glitzer', 'Neon'], sig: 't8' },
  { id: 'ball', name: 'Prinzessinnen-Ball', hints: ['elegant', 'funkelnd', 'royal'], sig: 'd1' },
];

export const CHARACTER = {
  id: 'girl',
  name: 'Mädchen',
  dollUri,
  HAIR, ITEMS, ITEM_BY_ID, THEMES,
  tabs: [['hair', 'Haare'], ['dress', 'Kleider'], ['top', 'Oben'], ['bottom', 'Unten'], ['shoes', 'Schuhe'], ['extra', 'Extras']],
  defaultWorn: { hair: 'h1', top: 't2', bottom: 'b2', dress: null, shoes: 's2', extra: null },
};
