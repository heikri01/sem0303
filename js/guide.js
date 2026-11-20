// ==========================================================
// GUIDE.JS · bladre-funktionen i søvnguiden
//
// Sådan virker det:
// - Bogen har 13 blade. Hvert blad har to sider (forside + bagside).
// - "vendt" er antallet af blade, der er vendt over på venstre side.
//   vendt = 0 → bogen er lukket (man ser forsiden)
//   vendt = 13 → bogen er færdiglæst (man ser bagsiden)
// - På store skærme ser man et opslag (to sider). På smalle skærme
//   og telefoner ser man én side ad gangen, og bogen skubbes, så den
//   side, man læser, står i midten.
// ==========================================================

const SIDE_B = 561.5;   // en sides bredde i px (som i Figma)
const SIDE_H = 794;     // en sides højde i px

const bog = document.getElementById('bog');
const blade = Array.from(bog.querySelectorAll('.blad'));
const sider = Array.from(bog.querySelectorAll('.side'));
const forrigeKnap = document.getElementById('forrige');
const naesteKnap = document.getElementById('naeste');
const taeller = document.getElementById('taeller');

const ANTAL_BLADE = blade.length;   // 13
const ANTAL_SIDER = sider.length;   // 26

let vendt = 0;        // antal vendte blade
let aktivSide = 1;    // bruges kun i én-side-visning (1–26)
let enkelt = false;   // true = én side ad gangen


// ---------- Hjælpere ----------

// Skal vi vise én side ad gangen? (smal skærm eller telefon på højkant)
function brugEnkeltSide() {
  return window.innerWidth < 760 || window.innerWidth < window.innerHeight * 0.95;
}

// Hvilke sidetal kan man se lige nu?
function synligeSider() {
  if (enkelt) return [aktivSide];
  const venstre = vendt > 0 ? vendt * 2 : null;                       // bagsiden af det sidst vendte blad
  const hoejre = vendt < ANTAL_BLADE ? vendt * 2 + 1 : null;          // forsiden af det næste blad
  return [venstre, hoejre].filter(Boolean);
}


// ---------- Tegn bogen ----------

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

  // 2. Skalér bogen, så den passer til skærmen, og skub den på plads
  const pladsB = window.innerWidth - (enkelt ? 24 : 2 * 100);
  const pladsH = window.innerHeight - (enkelt ? 90 : 80);
  const bredde = enkelt ? SIDE_B : SIDE_B * 2;
  const skala = Math.min(pladsB / bredde, pladsH / SIDE_H, 1.25);

  // Står vi på en højreside, skubbes bogen til venstre (og omvendt), så siden er i midten.
  // I opslag gælder det kun forsiden og bagsiden, som står alene
  let skub = 0;
  if (enkelt) {
    skub = aktivSide % 2 === 1 ? -SIDE_B / 2 : SIDE_B / 2;
  } else if (vendt === 0) {
    skub = -SIDE_B / 2;
  } else if (vendt === ANTAL_BLADE) {
    skub = SIDE_B / 2;
  }
  bog.style.transform = `translate(-50%, -50%) translateX(${skub * skala}px) scale(${skala})`;

  // 3. Sider, man ikke kan se, skal hverken kunne nås med tastatur eller læses op
  const synlige = synligeSider();
  sider.forEach((side, i) => {
    const vises = synlige.includes(i + 1);
    side.inert = !vises;
    side.setAttribute('aria-hidden', vises ? 'false' : 'true');
  });

  // 4. Knapper og sidetæller
  const foerste = enkelt ? aktivSide === 1 : vendt === 0;
  const sidste = enkelt ? aktivSide === ANTAL_SIDER : vendt === ANTAL_BLADE;
  forrigeKnap.disabled = foerste;
  naesteKnap.disabled = sidste;
  taeller.textContent = tekstTilTaeller(synlige);
}

function tekstTilTaeller(synlige) {
  if (synlige.length === 1 && synlige[0] === 1) return 'Forside';
  if (synlige.length === 1 && synlige[0] === ANTAL_SIDER) return 'Bagside';
  return 'Side ' + synlige.join('–') + ' af ' + ANTAL_SIDER;
}


// ---------- Bladre ----------

function naeste() {
  if (enkelt) {
    if (aktivSide >= ANTAL_SIDER) return;
    if (aktivSide % 2 === 1) vendt++;   // fra en højreside skal bladet vendes
    aktivSide++;
  } else {
    if (vendt >= ANTAL_BLADE) return;
    vendt++;
  }
  tegn();
}

function forrige() {
  if (enkelt) {
    if (aktivSide <= 1) return;
    if (aktivSide % 2 === 0) vendt--;   // fra en venstreside skal bladet vendes tilbage
    aktivSide--;
  } else {
    if (vendt <= 0) return;
    vendt--;
  }
  tegn();
}

// Gå direkte til et sidetal (bruges af indholdsfortegnelsen og af #side-08 i adressen)
function gaaTil(sidetal) {
  sidetal = Math.max(1, Math.min(ANTAL_SIDER, sidetal));
  aktivSide = sidetal;
  vendt = Math.floor(sidetal / 2);
  tegn();
}


// ---------- Knapper, tastatur, klik og swipe ----------

naesteKnap.addEventListener('click', naeste);
forrigeKnap.addEventListener('click', forrige);

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); naeste(); }
  if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); forrige(); }
  if (e.key === 'Home') { e.preventDefault(); gaaTil(1); }
  if (e.key === 'End') { e.preventDefault(); gaaTil(ANTAL_SIDER); }
});

// Links i indholdsfortegnelsen bladrer hen til siden i stedet for at hoppe
bog.addEventListener('click', (e) => {
  const link = e.target.closest('a[data-side]');
  if (!link) return;
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
  if (startX === null) return;
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;
  startX = null;

  // Klik på et link eller en knap skal ikke bladre
  if (e.target.closest('a, button')) return;

  // Swipe: vandret træk på mindst 40 px
  if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
    if (dx < 0) naeste(); else forrige();
    return;
  }

  // Klik (ingen bevægelse, og ingen tekst er markeret)
  if (Math.abs(dx) < 6 && Math.abs(dy) < 6 && !String(window.getSelection())) {
    const boks = bog.getBoundingClientRect();
    const midte = enkelt ? window.innerWidth / 2 : boks.left + boks.width / 2;
    if (e.clientX >= midte) naeste(); else forrige();
  }
});

// Når vinduet ændrer størrelse, kan visningen skifte mellem opslag og én side
let ventTimer;
window.addEventListener('resize', () => {
  clearTimeout(ventTimer);
  ventTimer = setTimeout(() => {
    const nyEnkelt = brugEnkeltSide();
    if (nyEnkelt !== enkelt) {
      // Fra opslag til én side: vis venstresiden i opslaget (eller forsiden)
      if (nyEnkelt) aktivSide = vendt === 0 ? 1 : vendt * 2;
      enkelt = nyEnkelt;
    }
    tegn();
  }, 120);
});


// ---------- Start ----------

enkelt = brugEnkeltSide();

// Står der fx #side-08 i adressen, åbnes bogen på den side
const fraAdresse = location.hash.match(/^#side-(\d+)$/);
if (fraAdresse) {
  gaaTil(Number(fraAdresse[1]));
} else {
  tegn();
}
