// Original, inline vector illustrations for shop cosmetics.
// Artwork is decorative and does not affect ownership or learning.
const wrap=(body,id='art',viewBox='0 0 320 160')=>`<svg class="vocab-shop-illustration" viewBox="${viewBox}" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><defs>
<linearGradient id="sky-${id}" x2="1" y2="1"><stop stop-color="#f3faff"/><stop offset="1" stop-color="#e3eeff"/></linearGradient>
<linearGradient id="gold-${id}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff4ae"/><stop offset=".48" stop-color="#f9af39"/><stop offset="1" stop-color="#d47a16"/></linearGradient>
</defs>${body}</svg>`;
const windowGraphic=(dark=false)=>`<rect x="58" y="41" width="205" height="102" rx="15" fill="${dark?'#26375f':'#f9fffa'}" stroke="${dark?'#6376c1':'#acd9ad'}" stroke-width="4"/>
<rect x="58" y="41" width="205" height="24" rx="11" fill="${dark?'#3d5284':'#b7e5aa'}"/>
<circle cx="76" cy="52" r="4" fill="#f9b47b"/><circle cx="91" cy="52" r="4" fill="#f5df91"/><circle cx="106" cy="52" r="4" fill="#88dccb"/>
<rect x="75" y="79" width="110" height="8" rx="4" fill="${dark?'#889bd0':'#95c7a2'}"/>
<rect x="75" y="98" width="74" height="8" rx="4" fill="${dark?'#718ac0':'#badfc2'}"/>
<rect x="75" y="117" width="145" height="8" rx="4" fill="${dark?'#657caf':'#c6e5c7'}"/>
<circle cx="223" cy="97" r="12" fill="${dark?'#7187c3':'#b1dcb8'}"/> `;
const themes={
  midnight:wrap(`<rect width="320" height="160" rx="18" fill="#222f61"/><circle cx="276" cy="28" r="23" fill="#fff3c9"/><circle cx="287" cy="21" r="23" fill="#222f61"/>
  <path d="M0 135 Q46 97 87 133 Q131 100 178 138 Q245 110 320 133 V160 H0" fill="#5061a1"/>
  ${windowGraphic(true)}<g fill="#f6e6bd"><path d="m26 31 3 8 8 3-8 3-3 8-3-8-8-3 8-3z"/><circle cx="42" cy="74" r="3"/><circle cx="290" cy="106" r="3"/></g>`,'midnight'),
  forest:wrap(`<rect width="320" height="160" rx="18" fill="#d8f4b4"/><circle cx="283" cy="30" r="33" fill="#ffedaa"/><path d="M0 65Q66 20 139 61Q214 9 320 54V0H0" fill="#8acb6e"/><path d="M0 142 Q63 83 137 141Q214 80 320 140V160H0" fill="#9bdb9f"/>
  <g stroke="#72a95b" stroke-width="8" stroke-linecap="round"><path d="M14 0L46 85M307 0L281 81"/></g>
  ${windowGraphic(false)}<g fill="#a1ce78"><ellipse cx="32" cy="52" rx="20" ry="10" transform="rotate(25 32 52)"/><ellipse cx="293" cy="48" rx="25" ry="9" transform="rotate(-28 293 48)"/></g>`,'forest'),
  sakura:wrap(`<rect width="320" height="160" rx="18" fill="#fff0f5"/><circle cx="285" cy="33" r="37" fill="#ffd4df"/><path d="M0 45Q76-7 145 48T320 46" fill="none" stroke="#9f665b" stroke-width="12"/><g fill="#f7a7c6"><circle cx="44" cy="36" r="20"/><circle cx="90" cy="28" r="21"/><circle cx="268" cy="34" r="18"/><circle cx="299" cy="62" r="16"/></g>${windowGraphic(false)}`,'sakura'),
  ocean:wrap(`<rect width="320" height="160" rx="18" fill="#d5f3fc"/><circle cx="274" cy="32" r="29" fill="#fdf3b6"/><path d="M0 113Q35 86 70 114T140 114T210 114T280 114T350 114V160H0" fill="#4fb3c5"/>${windowGraphic(false)}`,'ocean')
};
const frames={
  'gold-frame':wrap(`<rect width="320" height="160" rx="18" fill="#fff8e9"/><g transform="translate(160 79)"><circle r="66" fill="none" stroke="#ffce64" stroke-width="8"/><circle r="60" fill="#f5dcb0" stroke="#d38b29" stroke-width="4"/><circle r="53" fill="#d6eaf9"/><circle cx="0" cy="-14" r="25" fill="#efbe96"/><path d="M-29-25Q-25-64 6-46Q36-51 29-15Q2-31-29-25" fill="#3d3853"/><path d="M-46 56Q-32 23 0 21Q34 23 46 56" fill="#5c779d"/><path d="m0-79 7 14 16 2-12 11 3 16-14-8-14 8 3-16-12-11 16-2z" fill="#ffc649" stroke="#dd901e" stroke-width="2"/></g><g fill="#e6a83a"><path d="m72 105 14 17 19 6-12 10-19-11-13-16zM248 105l-14 17-19 6 12 10 19-11 13-16z"/></g>`,'gold-frame'),
  'aurora-frame':wrap(`<rect width="320" height="160" rx="18" fill="#f0efff"/><circle cx="160" cy="80" r="63" fill="none" stroke="#ad8df7" stroke-width="12"/><circle cx="160" cy="80" r="63" fill="none" stroke="#68d8d2" stroke-width="5" stroke-dasharray="110 30 90 60" transform="rotate(20 160 80)"/><circle cx="160" cy="80" r="51" fill="#fff" opacity=".67"/><path d="m160 0 9 25 24 9-24 9-9 24-10-24-24-9 24-9zM160 94l9 24 24 9-24 10-9 23-10-23-24-10 24-9z" fill="#8ef5f0" stroke="#5688d2" stroke-width="3"/>`,'aurora-frame'),
  'scholar-frame':wrap(`<rect width="320" height="160" rx="18" fill="#f5f2e9"/><rect x="93" y="14" width="134" height="132" rx="20" fill="#fff8e7" stroke="#957143" stroke-width="9"/><rect x="106" y="27" width="108" height="106" rx="14" fill="#f7e8c8" stroke="#d8be88" stroke-width="3"/><path d="m125 106 35-45 35 45M125 106h70" fill="none" stroke="#957143" stroke-width="5"/><path d="m160 25 10 17-10 17-10-17z" fill="#cba458"/>`,'scholar-frame')
};
const titles={
  'word-wizard':wrap(`<rect width="320" height="160" rx="18" fill="#f3f1ff"/><path d="M38 48H282L302 80 282 112H38L18 80z" fill="#fff1ca" stroke="#dc9b2a" stroke-width="5"/><path d="M53 55H268L284 80 268 105H53L36 80z" fill="none" stroke="#f3c55f" stroke-width="2"/>
  <path d="m83 87 23-51 26 55-19-7-16 18z" fill="#4c5fb4" stroke="#283b88" stroke-width="3"/><path d="M76 96Q107 103 136 94" stroke="#e2ac47" stroke-width="6" fill="none"/>
  <text x="199" y="89" fill="#273e67" font-size="22" text-anchor="middle" font-weight="800" font-family="Georgia,serif">Word Wizard</text>`,'wizard'),
  'word-explorer':wrap(`<rect width="320" height="160" rx="18" fill="#f0f7ff"/><path d="M39 46H281L300 80 281 114H39L20 80z" fill="#fef3d6" stroke="#caad65" stroke-width="4"/><circle cx="77" cy="80" r="27" fill="#d4f0e9" stroke="#368e8a" stroke-width="4"/><path d="m77 58 9 23-9 22-9-22z" fill="#eebf58"/><text x="202" y="88" fill="#254a62" font-size="22" text-anchor="middle" font-weight="800" font-family="Georgia,serif">Word Explorer</text>`,'explorer'),
  'language-ace':wrap(`<rect width="320" height="160" rx="18" fill="#fffaed"/><path d="M42 50H278L299 80 278 110H42L21 80z" fill="#fff1d4" stroke="#d7a349" stroke-width="5"/><text x="159" y="89" fill="#7a5523" font-size="24" text-anchor="middle" font-weight="800" font-family="Georgia,serif">Language Ace</text><path d="m160 16 11 12 18 0-11 12 4 17-22-8-22 8 4-17-11-12h18z" fill="#f7c24b"/>`,'ace')
};
const effects={
  'pixel-badge':wrap(`<rect width="320" height="160" rx="18" fill="#f1ecff"/><path d="m160 13 24 15 30 2 5 33 17 17-19 26-5 24-52 24-52-24-5-24-19-26 17-17 5-33 30-2z" fill="#354f9e" stroke="#f8bf51" stroke-width="8"/><path d="m116 66 44-16 44 16v45l-44 17-44-17z" fill="#fff3cd" stroke="#cda45d" stroke-width="5"/><path d="M160 55v70M120 68l40 11 40-11" fill="none" stroke="#ddac66" stroke-width="4"/><path d="m160 10 6 14 14 6-14 6-6 14-6-14-14-6 14-6z" fill="#fff5a7"/>`,'pixel'),
  sparkle:wrap(`<rect width="320" height="160" rx="18" fill="#f0ecff"/><circle cx="160" cy="82" r="58" fill="#e4ddff"/><g fill="#c39bee" stroke="#815fb8" stroke-width="3"><path d="m160 14 14 44 44 14-44 14-14 44-14-44-44-14 44-14z"/><path d="m78 108 7 16 16 7-16 7-7 16-7-16-16-7 16-7z"/></g>`,'sparkle')
};
export function rewardIllustration(id,icon='✨') {
  return themes[id]??frames[id]??titles[id]??effects[id]??wrap(`<rect width="320" height="160" rx="18" fill="url(#sky-art)"/><text x="160" y="110" text-anchor="middle" font-size="72">${icon}</text>`);
}
export const bannerIllustration=wrap(`<rect width="320" height="160" rx="18" fill="#d2ecf6"/><rect x="25" y="15" width="270" height="138" rx="9" fill="#f5fbff"/><path d="M110 15v138M215 15v138M25 77h270" stroke="#b6d6e9" stroke-width="8"/><path d="M0 145Q130 107 320 142V160H0" fill="#81b6c8"/>
<circle cx="109" cy="75" r="33" fill="#f0bb92"/><path d="M72 66Q76 26 115 35Q150 42 140 82L123 64 90 58z" fill="#373b50"/><path d="M65 160V127Q71 106 108 107Q142 108 154 160" fill="#456888"/>
<circle cx="226" cy="83" r="29" fill="#edc19e"/><path d="M194 80Q186 39 226 44Q262 44 256 87L243 63 205 62z" fill="#56423d"/><path d="M187 160V130Q191 115 228 113Q263 119 268 160" fill="#8db8d1"/>
<path d="M126 80q5-4 10 0M240 86q4 3 9 0" stroke="#5a433d" stroke-width="3" fill="none"/><circle cx="113" cy="75" r="2" fill="#473e3a"/><circle cx="234" cy="81" r="2" fill="#473e3a"/><path d="m165 32 5 9 10 4-10 4-5 9-5-9-10-4 10-4z" fill="#fee0a5"/>`,'banner');
