// ==========================================================
// GUIDE.JS · søvnguidens tre visninger og bladre-funktionen
//
// Visningerne (klassen på <body>):
//   guide--start  Forsiden med knapperne "Åbn bogen" og "Læs som tekst"
//   guide--bog    Bladremagasinet
//   guide--laes   Én lang side (mobildesignet). Bruges altid på telefon
//
// Knappen "Læs som tekst" åbner et tekstpanel med guiden som ren tekst
// (som i Marcus' bladrebog). Teksten hentes fra bogens sider, så den altid passer.
//
// Bogen:
// - Bogen har 13 blade. Hvert blad har to sider (forside + bagside).
// - "vendt" er antallet af blade, der er vendt over på venstre side.
//   vendt = 0 → bogen er lukket (man ser forsiden)
//   vendt = 13 → bogen er færdiglæst (man ser bagsiden)
// - Bogen gøres større eller mindre med CSS-egenskaben zoom. Så tegner
//   browseren teksten i den rigtige størrelse, og den bliver skarp.
// ==========================================================

const SIDE_B = 561.5;   // en sides bredde i px (som i Figma)
const SIDE_H = 794;     // en sides højde i px
const SMAL = 760;       // under denne bredde vises altid mobilvisningen (samme tal som $smal i SCSS)

const krop = document.body;
const ramme = document.getElementById('bog-ramme');
const bog = document.getElementById('bog');
const blade = Array.from(bog.querySelectorAll('.blad'));
const sider = Array.from(bog.querySelectorAll('.side'));
const forrigeKnap = document.getElementById('forrige');
const naesteKnap = document.getElementById('naeste');
const taeller = document.getElementById('taeller');

const ANTAL_BLADE = blade.length;   // 13
const ANTAL_SIDER = sider.length;   // 26

const tekstpanel = document.getElementById('tekstpanel');

let visning = 'start';   // 'start', 'bog' eller 'laes'
let vendt = 0;           // antal vendte blade
let tekstKnap = null;    // den knap, der åbnede tekstpanelet (fokus går tilbage hertil)


// ==========================================================
// SKIFT VISNING
// ==========================================================

function erSmal() {
  return window.innerWidth < SMAL;
}

function visVisning(ny) {
  // På telefon er der kun mobilvisningen
  if (erSmal()) ny = 'laes';

  const forrigeVisning = visning;
  visning = ny;
  krop.classList.remove('guide--start', 'guide--bog', 'guide--laes');
  krop.classList.add('guide--' + ny);

  if (ny === 'laes') {
    flytMormor(true);
    ryd();
  } else {
    if (forrigeVisning === 'laes') flytMormor(false);
    if (ny === 'start') vendt = 0;
    tegn();
  }
}

// I mobilvisningen står "Mormor i dag" nederst på papirsiden (som i Figma).
// I bogen står den nederst på den mørke kapitelside. Her flyttes den frem og tilbage.
const mormorFlyt = Array.from(bog.querySelectorAll('.side--moerk .mormor-i-dag')).map((boks) => {
  const kapitelside = boks.closest('.side');
  const nummer = Number(kapitelside.id.replace('side-', ''));
  const papirside = document.getElementById('side-' + String(nummer + 1).padStart(2, '0'));
  return { boks, hjem: boks.parentElement, ude: papirside.querySelector('.side__indre') };
});

function flytMormor(tilPapir) {
  mormorFlyt.forEach(({ boks, hjem, ude }) => {
    (tilPapir ? ude : hjem).appendChild(boks);
  });
}

// I mobilvisningen fjernes alt det, bogen har sat på elementerne
function ryd() {
  bog.style.zoom = '';
  ramme.style.left = '';
  ramme.style.top = '';
  sider.forEach((side) => {
    side.inert = false;
    side.removeAttribute('aria-hidden');
  });
}


// ==========================================================
// TEGN BOGEN
// ==========================================================

function tegn() {
  // 1. Vend bladene og læg dem i den rigtige rækkefølge (z-index)
  blade.forEach((blad, i) => {
    const erVendt = i < vendt;
    const skifter = blad.classList.contains('blad--vendt') !== erVendt;
    blad.classList.toggle('blad--vendt', erVendt);

    // Vendte blade: det sidste vendte ligger øverst. Ikke-vendte: det første ligger øverst
    const plads = erVendt ? i + 1 : ANTAL_BLADE - i;

    if (skifter) {
      // Et blad, der er ved at blive vendt, skal ligge over alle de andre, mens det bevæger sig
      blad.style.zIndex = 100 + i;
      clearTimeout(blad.vendeTimer);
      blad.vendeTimer = setTimeout(() => { blad.style.zIndex = plads; }, 950);
    } else if (!blad.vendeTimer || Number(blad.style.zIndex) < 100) {
      blad.style.zIndex = plads;
    }
  });

  // Papirkanterne: hvor mange blade ligger der på hver side?
  bog.style.setProperty('--blade-venstre', vendt);
  bog.style.setProperty('--blade-hoejre', ANTAL_BLADE - vendt);
  // Skyggen under bogen ligger kun under den halvdel, der er papir på
  bog.style.setProperty('--skygge-venstre', vendt === 0 ? '52%' : '2%');
  bog.style.setProperty('--skygge-hoejre', vendt === ANTAL_BLADE ? '52%' : '2%');

  // 2. Find plads til bogen. Forsiden skal have plads til knapperne under bogen,
  //    den åbne bog til knapperne foroven og sidetælleren forneden
  const top = visning === 'start' ? 24 : 76;
  const bund = visning === 'start' ? 108 : 44;
  const pladsB = window.innerWidth - 2 * 100;
  const pladsH = window.innerHeight - top - bund;
  const skala = Math.min(pladsB / (SIDE_B * 2), pladsH / SIDE_H, 1.3);

  // Forsiden og bagsiden står alene, så bogen skubbes, så de står i midten
  let skub = 0;
  if (vendt === 0) skub = -SIDE_B / 2;
  if (vendt === ANTAL_BLADE) skub = SIDE_B / 2;

  // Hele pixels, så teksten ikke bliver sløret
  bog.style.zoom = skala;
  ramme.style.left = Math.round((window.innerWidth - SIDE_B * 2 * skala) / 2 + skub * skala) + 'px';
  ramme.style.top = Math.round(top + (pladsH - SIDE_H * skala) / 2) + 'px';

  // 3. Sider, man ikke kan se, skal hverken kunne nås med tastatur eller læses op
  const synlige = synligeSider();
  sider.forEach((side, i) => {
    const vises = synlige.includes(i + 1);
    side.inert = !vises;
    side.setAttribute('aria-hidden', vises ? 'false' : 'true');
  });

  // 4. Knapper og sidetæller
  forrigeKnap.disabled = vendt === 0;
  naesteKnap.disabled = vendt === ANTAL_BLADE;
  taeller.textContent = tekstTilTaeller(synlige);
}

// Hvilke sidetal kan man se lige nu?
function synligeSider() {
  const venstre = vendt > 0 ? vendt * 2 : null;                // bagsiden af det sidst vendte blad
  const hoejre = vendt < ANTAL_BLADE ? vendt * 2 + 1 : null;   // forsiden af det næste blad
  return [venstre, hoejre].filter(Boolean);
}

function tekstTilTaeller(synlige) {
  if (synlige.length === 1 && synlige[0] === 1) return 'Forside';
  if (synlige.length === 1 && synlige[0] === ANTAL_SIDER) return 'Bagside';
  return 'Side ' + synlige.join('–') + ' af ' + ANTAL_SIDER;
}


// ==========================================================
// BLADRE
// ==========================================================

function naeste() {
  if (visning === 'start') { aabnBog(); return; }
  if (vendt >= ANTAL_BLADE) return;
  vendt++;
  tegn();
}

function forrige() {
  if (visning !== 'bog' || vendt <= 0) return;
  vendt--;
  tegn();
}

// Gå direkte til et sidetal (bruges af indholdsfortegnelsen og af #side-08 i adressen)
function gaaTil(sidetal) {
  sidetal = Math.max(1, Math.min(ANTAL_SIDER, sidetal));
  vendt = Math.floor(sidetal / 2);
  if (visning !== 'bog') visVisning('bog'); else tegn();
}

function aabnBog() {
  vendt = 1;               // slå op på side 2–3
  visVisning('bog');
  naesteKnap.focus();
}

function lukBog() {
  visVisning('start');
  document.getElementById('aabn').focus();
}



// ==========================================================
// TEKSTPANEL ("Læs som tekst")
// ==========================================================

// Byg tekstversionen ud fra bogens sider. Det sker første gang, panelet åbnes
let tekstErBygget = false;

function bygTekst() {
  const indhold = document.getElementById('tekstindhold');

  sider.forEach((side) => {
    const afsnit = document.createElement('section');
    afsnit.className = 'tekst__side';
    afsnit.id = 'tekst-' + side.id;   // fx tekst-side-05

    const sidetal = document.createElement('h2');
    sidetal.className = 'tekst__sidetal';
    sidetal.textContent = side.getAttribute('aria-label');
    afsnit.appendChild(sidetal);

    // Gå siden igennem i rækkefølge og tag overskrifter, tekst, punkter og billeder med
    side.querySelectorAll('h2, h3, p, li, img, .helfoto__kreditering').forEach((el) => {
      if (el.closest('.kun-laes')) return;        // kun i mobilvisningen (fx pdf-knappen)
      if (el.closest('.sidehoved')) return;       // "Søvnguiden · Ringsted Dun" gentages på hver side
      if (el.closest('h2, h3') !== el && el.closest('h2, h3')) return;

      let ny;
      if (el.tagName === 'IMG') {
        ny = lavAfsnit('p', 'tekst__afsnit tekst__billede', 'Billede: ' + el.alt);
      } else if (el.tagName === 'H2' || el.tagName === 'H3') {
        // Kapiteltitler består af flere dele (fx 07.00 · Morgen · Lys ind, så vågner man)
        const dele = el.children.length
          ? Array.from(el.children).map(tekstFra)
          : [tekstFra(el)];
        ny = lavAfsnit('h3', 'tekst__overskrift', dele.join(' · '));
      } else if (el.tagName === 'LI') {
        const nr = Array.from(el.parentElement.children).indexOf(el) + 1;
        ny = lavAfsnit('p', 'tekst__afsnit', nr + '. ' + tekstFra(el));
      } else if (/__etiket|__siden/.test(el.className)) {
        ny = lavAfsnit('p', 'tekst__etiket', tekstFra(el));
      } else {
        ny = lavAfsnit('p', 'tekst__afsnit', tekstFra(el));
      }
      afsnit.appendChild(ny);
    });

    indhold.appendChild(afsnit);
  });

  tekstErBygget = true;
}

// Teksten i et element – uden det, der kun hører til mobilvisningen, og med mellemrum, hvor der er linjeskift
function tekstFra(el) {
  const kopi = el.cloneNode(true);
  kopi.querySelectorAll('.kun-laes, .sr-only').forEach((x) => x.remove());
  kopi.querySelectorAll('br').forEach((br) => br.replaceWith(' '));
  return kopi.textContent.replace(/\s+/g, ' ').trim();
}

function lavAfsnit(tag, klasse, tekst) {
  const el = document.createElement(tag);
  el.className = klasse;
  el.textContent = tekst;
  return el;
}

// Åbn panelet. Er bogen åben, hopper teksten til den side, man er nået til
function aabnTekst(e) {
  if (!tekstErBygget) bygTekst();
  tekstKnap = e ? e.currentTarget : null;
  tekstpanel.hidden = false;

  const sidetal = visning === 'bog' ? synligeSider()[0] : 1;
  const maal = document.getElementById('tekst-side-' + String(sidetal).padStart(2, '0'));
  if (sidetal > 1 && maal) maal.scrollIntoView();
  else tekstpanel.scrollTop = 0;

  document.getElementById('tekst-overskrift').focus({ preventScroll: true });
}

function lukTekst() {
  tekstpanel.hidden = true;
  if (tekstKnap) tekstKnap.focus();
}

// ==========================================================
// KNAPPER, TASTATUR, KLIK OG SWIPE
// ==========================================================

document.getElementById('aabn').addEventListener('click', aabnBog);
document.getElementById('tekst-fra-start').addEventListener('click', aabnTekst);
document.getElementById('tekst-fra-bog').addEventListener('click', aabnTekst);
document.getElementById('luk-tekst').addEventListener('click', lukTekst);
document.getElementById('luk').addEventListener('click', lukBog);
naesteKnap.addEventListener('click', naeste);
forrigeKnap.addEventListener('click', forrige);

document.addEventListener('keydown', (e) => {
  // I tekstpanelet virker tasterne som normalt. Escape lukker panelet
  if (!tekstpanel.hidden) {
    if (e.key === 'Escape') lukTekst();
    return;
  }
  if (visning === 'laes') return;   // i mobilvisningen virker tasterne som normalt
  if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); naeste(); }
  if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); forrige(); }
  if (e.key === 'Home' && visning === 'bog') { e.preventDefault(); gaaTil(1); }
  if (e.key === 'End' && visning === 'bog') { e.preventDefault(); gaaTil(ANTAL_SIDER); }
  if (e.key === 'Escape' && visning === 'bog') lukBog();
});

// Links i indholdsfortegnelsen: i bogen bladres der hen til siden.
// I tekstvisningen hopper linket ned til kapitlet som et almindeligt link
bog.addEventListener('click', (e) => {
  const link = e.target.closest('a[data-side]');
  if (!link || visning !== 'bog') return;
  e.preventDefault();
  gaaTil(Number(link.dataset.side));
  history.replaceState(null, '', link.getAttribute('href'));
});

// Swipe og klik: træk eller klik i højre side af bogen = næste, venstre side = forrige
let startX = null;
let startY = null;

bog.addEventListener('pointerdown', (e) => {
  startX = e.clientX;
  startY = e.clientY;
});

bog.addEventListener('pointerup', (e) => {
  if (startX === null || visning === 'laes') return;
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;
  startX = null;

  // Klik på et link eller en knap skal ikke bladre
  if (e.target.closest('a, button')) return;

  // Forsiden: et klik åbner bogen
  if (visning === 'start') {
    if (Math.abs(dx) < 6 && Math.abs(dy) < 6) aabnBog();
    return;
  }

  // Swipe: vandret træk på mindst 40 px
  if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
    if (dx < 0) naeste(); else forrige();
    return;
  }

  // Klik (ingen bevægelse, og ingen tekst er markeret)
  if (Math.abs(dx) < 6 && Math.abs(dy) < 6 && !String(window.getSelection())) {
    const boks = bog.getBoundingClientRect();
    if (e.clientX >= boks.left + boks.width / 2) naeste(); else forrige();
  }
});

// Når vinduet ændrer størrelse: tegn bogen igen, og skift til/fra mobilvisningen
let ventTimer;
window.addEventListener('resize', () => {
  clearTimeout(ventTimer);
  ventTimer = setTimeout(() => {
    if (erSmal() && visning !== 'laes') visVisning('laes');
    else if (!erSmal() && visning === 'laes') visVisning('start');
    else if (visning !== 'laes') tegn();
  }, 120);
});


// ==========================================================
// START
// ==========================================================

// Siderne kan få fokus, når man hopper til dem (så skærmlæsere starter det rigtige sted)
sider.forEach((side) => { side.tabIndex = -1; });

// Står der fx #side-08 i adressen, åbnes bogen på den side (eller man hopper dertil på telefon)
const fraAdresse = location.hash.match(/^#side-(\d+)$/);
if (erSmal()) {
  visVisning('laes');
  if (fraAdresse) document.getElementById(location.hash.slice(1))?.scrollIntoView();
} else if (fraAdresse) {
  gaaTil(Number(fraAdresse[1]));
} else {
  visVisning('start');
}
