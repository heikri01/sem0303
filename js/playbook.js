/* ==========================================================
   AI PLAYBOOK · små funktioner, der gør siden til et værktøj

   1. Kopiér-knapper ved prompterne
   2. Tjeklisten tæller, hvor mange punkter der er krydset af
   3. Undersider: ét afsnit vises ad gangen, med Forrige/Næste
   4. Værkstedet: faner med én produktion ad gangen
   5. Forhåndsvisning af karrusellen
   6. Søgning
   7. PDF (kun en note – se nederst)

   Selve indholdet ligger i playbook.html.
   ========================================================== */


/* ---------- 1. Kopiér-knapper ---------- */

// Hver knap har data-kopier="id", som peger på den <pre>, der skal kopieres.
// Beskeden vises i den .kopi-status, der står i samme prompt-boks
document.querySelectorAll('[data-kopier]').forEach(function (knap) {
  knap.addEventListener('click', function () {
    const pre = document.getElementById(knap.dataset.kopier);
    const status = knap.closest('.prompt').querySelector('.kopi-status');

    navigator.clipboard.writeText(pre.innerText).then(function () {
      knap.textContent = 'Kopieret ✓';
      status.textContent = 'Kopieret. Sæt teksten ind i samtalen med AI, og ret det i [firkantede klammer].';
      // Knapteksten skifter tilbage efter 2 sekunder, så knappen kan bruges igen
      setTimeout(function () { knap.textContent = 'Kopiér'; }, 2000);
    }).catch(function () {
      // Nogle browsere tillader ikke kopiering fra en lokal fil – så markeres teksten i stedet
      const valg = window.getSelection();
      const omraade = document.createRange();
      omraade.selectNodeContents(pre);
      valg.removeAllRanges();
      valg.addRange(omraade);
      status.textContent = 'Teksten er markeret. Tryk Ctrl+C (Cmd+C på Mac) for at kopiere.';
    });
  });
});


/* ---------- 2. Tjeklisten ---------- */

const flueben = document.querySelectorAll('.tjekliste input');
const tjekStatus = document.getElementById('tjekStatus');

function opdaterTjekliste() {
  const antal = document.querySelectorAll('.tjekliste input:checked').length;
  tjekStatus.textContent = antal === flueben.length
    ? 'Alle ' + antal + ' punkter er tjekket – det er klar til brug.'
    : antal + ' af ' + flueben.length + ' punkter er tjekket';
}

flueben.forEach(function (f) { f.addEventListener('change', opdaterTjekliste); });

document.getElementById('nulstil').addEventListener('click', function () {
  flueben.forEach(function (f) { f.checked = false; });
  opdaterTjekliste();
});


/* ---------- 3. Undersider: ét afsnit ad gangen ---------- */

// Hvert <section class="afsnit"> er en underside. Adressen (#lav) bestemmer,
// hvilken der vises, så links, tilbage-knappen og bogmærker virker.
// Ved udskrift (Gem som PDF) viser CSS'en alle afsnit igen.
const afsnit = Array.from(document.querySelectorAll('.afsnit'));
const menuLinks = document.querySelectorAll('.menu a');
let soegeMaal = null;   // et element, søgningen vil hoppe til (se afsnit 6)

// Navnet på et afsnit hentes fra menuen, så det kun skal skrives ét sted
function navn(s) {
  const link = document.querySelector('.menu a[href="#' + s.id + '"]');
  return link ? link.textContent : s.id;
}

function overskrift(s) { return s.querySelector('h1, h2'); }

// Byg Forrige/Næste ind nederst i hvert afsnit
afsnit.forEach(function (s, nr) {
  // tabindex -1: overskriften kan få fokus fra JavaScript, men ikke med Tab-tasten
  overskrift(s).setAttribute('tabindex', '-1');

  const bladr = document.createElement('nav');
  bladr.className = 'bladr';
  bladr.setAttribute('aria-label', 'Bladr mellem siderne');
  if (nr > 0) {
    bladr.innerHTML += '<a class="bladr__forrige" href="#' + afsnit[nr - 1].id + '"><span>← Forrige</span><strong>' + navn(afsnit[nr - 1]) + '</strong></a>';
  }
  if (nr < afsnit.length - 1) {
    bladr.innerHTML += '<a class="bladr__naeste" href="#' + afsnit[nr + 1].id + '"><span>Næste →</span><strong>' + navn(afsnit[nr + 1]) + '</strong></a>';
  }
  s.append(bladr);
});

function visAfsnit(flytFokus) {
  const id = location.hash.slice(1);
  // Findes afsnittet ikke (eller er der ingen #), vises forsiden
  const valgt = afsnit.find(function (s) { return s.id === id; }) || afsnit[0];

  afsnit.forEach(function (s) { s.hidden = s !== valgt; });

  menuLinks.forEach(function (link) {
    const aktiv = link.getAttribute('href') === '#' + valgt.id;
    link.classList.toggle('aktiv', aktiv);
    // aria-current fortæller skærmlæsere, hvilken side man er på
    if (aktiv) { link.setAttribute('aria-current', 'page'); } else { link.removeAttribute('aria-current'); }
  });

  if (soegeMaal) {
    visSoegeMaal();
  } else if (flytFokus) {
    window.scrollTo(0, 0);
    overskrift(valgt).focus({ preventScroll: true });
  }
}

// hashchange sker, når man klikker på et link til #noget – også links inde i teksten
window.addEventListener('hashchange', function () { visAfsnit(true); });
visAfsnit(false);

// Åbnes siden med fx #lav, hopper browseren ned til afsnittet. Start i stedet øverst
window.addEventListener('load', function () {
  if (location.hash) { setTimeout(function () { window.scrollTo(0, 0); }, 0); }
});


/* ---------- 4. Værkstedet: faner ---------- */

// Hver fane (role="tab") har aria-controls="v-…", som er id'et på dens panel
const faner = document.querySelectorAll('[role="tab"]');
const tjekblok = document.getElementById('tjekblok');

function visFane(fane) {
  faner.forEach(function (f) {
    const aktiv = f === fane;
    f.classList.toggle('knap--aktiv', aktiv);
    f.setAttribute('aria-selected', aktiv ? 'true' : 'false');
    document.getElementById(f.getAttribute('aria-controls')).hidden = !aktiv;
  });

  // Tjeklisten findes kun én gang. Den flyttes ind i det sidste trin i det valgte panel
  const panel = document.getElementById(fane.getAttribute('aria-controls'));
  panel.querySelector('[data-tjek-plads]').append(tjekblok);
}

faner.forEach(function (f) {
  f.addEventListener('click', function () { visFane(f); });
});
visFane(faner[0]);


/* ---------- 5. Forhåndsvisning af karrusellen ---------- */

// Billederne læses med URL.createObjectURL – de bliver på computeren og sendes ingen steder hen
const fSlides = document.getElementById('fSlides');
const fForsideB = document.getElementById('fForsideB');
const fTekst = document.getElementById('fTekst');
const fAiBillede = document.getElementById('fAiBillede');
const fGrethe = document.getElementById('fGrethe');
const vSpor = document.getElementById('vSpor');
const vTekst = document.getElementById('vTekst');
const vNr = document.getElementById('vNr');
const vAB = document.getElementById('vAB');
const vKontrol = document.getElementById('vKontrol');

const SE_MERE = 125;      // ca. så mange tegn vises, før der står »Se mere«
const MAERKNING = 'Mormor Grethe er en fiktiv person. Billeder og stemme er skabt med AI.';

// Eksemplet: kapitlet 22.30 Sengetid. Vises, indtil man uploader sine egne slides
const EKSEMPEL = {
  slides: [
    { src: 'img/guide/dengang-sengetid.jpg', navn: 'dengang-sengetid.jpg' },
    { src: 'img/guide/idag-sengetid.jpg', navn: 'idag-sengetid.jpg' }
  ],
  tekst: 'Kan du huske de kolde soveværelser, hvor dynen var det luneste sted?\n\n' +
    'Meget har ændret sig siden dengang. Men de gode rammer for natten er stadig vigtige.\n\n' +
    'For de fleste er 18–21 grader det bedste. Luft ud, hold lys og støj ude, og lad gerne telefonen blive uden for soveværelset.\n\n' +
    'Prøv at måle temperaturen i dit soveværelse i aften – og tag vores quiz: Myte eller sandhed?'
};

let slides = [];          // { src, navn, forhold } – forside A er nr. 0
let forsideB = null;      // samme form som en slide, eller null
let visB = false;         // true = forside B vises i stedet for A
let nr = 0;               // den slide, der vises nu
let udvidet = false;      // true = hele teksten vises (man har klikket »Se mere«)

// Mål billedets forhold (bredde/højde), så vi kan advare, hvis det ikke er 4:5
function maalBillede(slide) {
  return new Promise(function (svar) {
    const img = new Image();
    img.onload = function () { slide.forhold = img.naturalWidth / img.naturalHeight; svar(slide); };
    img.onerror = function () { slide.forhold = null; svar(slide); };
    img.src = slide.src;
  });
}

function filTilSlide(fil) {
  return maalBillede({ src: URL.createObjectURL(fil), navn: fil.name });
}

// Teksten: korte den af ved »Se mere«, og sæt mærkningen under, hvis Grethe er med
function tegnTekst() {
  let tekst = fTekst.value.trim();
  if (fGrethe.checked && tekst.indexOf('fiktiv person') === -1) {
    tekst += (tekst ? '\n\n' : '') + MAERKNING;
  }

  vTekst.textContent = '';
  if (!udvidet && tekst.length > SE_MERE) {
    vTekst.textContent = tekst.slice(0, SE_MERE).trimEnd() + '… ';
    const knap = document.createElement('button');
    knap.type = 'button';
    knap.className = 'opslag__se-mere';
    knap.textContent = 'Se mere';
    knap.addEventListener('click', function () { udvidet = true; tegnTekst(); });
    vTekst.append(knap);
  } else {
    vTekst.textContent = tekst;
  }
}

// Karrusellen: alle slides ligger på en række, og sporet flyttes, så den valgte ses
function tegnSlides() {
  const vist = slides.slice();
  if (visB && forsideB) { vist[0] = forsideB; }

  vSpor.innerHTML = '';
  vist.forEach(function (s, i) {
    const fig = document.createElement('figure');
    fig.className = 'karrusel__slide';
    const img = document.createElement('img');
    img.src = s.src;
    img.alt = 'Slide ' + (i + 1);
    fig.append(img);
    if (fAiBillede.checked) {
      const m = document.createElement('figcaption');
      m.className = 'karrusel__maerke';
      m.textContent = 'AI-genereret billede';
      fig.append(m);
    }
    vSpor.append(fig);
  });

  nr = Math.min(nr, Math.max(vist.length - 1, 0));
  flyt();
}

function flyt() {
  const antal = vSpor.children.length;
  vSpor.style.transform = 'translateX(' + (-nr * 100) + '%)';
  vNr.textContent = antal ? 'Slide ' + (nr + 1) + ' af ' + antal : 'Ingen slides endnu';
  document.getElementById('vForrige').disabled = nr === 0;
  document.getElementById('vNaeste').disabled = nr >= antal - 1;
}

document.getElementById('vForrige').addEventListener('click', function () { nr--; flyt(); });
document.getElementById('vNaeste').addEventListener('click', function () { nr++; flyt(); });

// Piletasterne virker, når man har fokus i karrusellen
document.getElementById('vKarrusel').addEventListener('keydown', function (e) {
  if (e.key === 'ArrowLeft' && nr > 0) { nr--; flyt(); }
  if (e.key === 'ArrowRight' && nr < vSpor.children.length - 1) { nr++; flyt(); }
});

// Kontrollen under opslaget: tjekker det, der kan tjekkes automatisk
function tegnKontrol() {
  const punkter = [];
  const antal = slides.length;
  const tekst = fTekst.value.trim();

  // ok: true = grøn, false = advarsel
  punkter.push(antal >= 6 && antal <= 8
    ? { ok: true, t: antal + ' slides – det passer (6–8)' }
    : { ok: false, t: antal + ' slides – en karrusel skal have 6–8 (Facebook tager højst 10)' });

  const forkerte = slides.concat(forsideB ? [forsideB] : []).filter(function (s) {
    return s.forhold && Math.abs(s.forhold - 0.8) > 0.02;
  });
  punkter.push(forkerte.length
    ? { ok: false, t: 'Ikke i stående format (1080 × 1350) og bliver beskåret: ' + forkerte.map(function (s) { return s.navn; }).join(', ') }
    : { ok: true, t: 'Alle billeder har det rigtige stående format' });

  const foer = tekst.slice(0, SE_MERE);
  punkter.push(tekst.length > SE_MERE
    ? { ok: true, t: 'Før »Se mere« står: »' + foer.split('\n')[0] + '« – fanger det?' }
    : { ok: true, t: 'Hele teksten ses uden »Se mere«' });

  punkter.push(fGrethe.checked || tekst.indexOf('fiktiv person') !== -1
    ? { ok: true, t: 'Grethe-mærkningen står under teksten' }
    : { ok: false, t: 'Ingen Grethe-mærkning – er Grethe virkelig ikke med?' });

  punkter.push(forsideB
    ? { ok: true, t: 'To forsider – kun forsiden er forskellig, så testen er fair' }
    : { ok: false, t: 'Kun én forside – tilføj forside B, hvis du vil teste, hvilken der virker bedst' });

  vKontrol.innerHTML = '';
  punkter.forEach(function (p) {
    const li = document.createElement('li');
    li.className = p.ok ? 'kontrol--ok' : 'kontrol--obs';
    li.textContent = p.t;
    vKontrol.append(li);
  });
}

function tegnAlt() {
  vAB.hidden = !forsideB;
  tegnSlides();
  tegnTekst();
  tegnKontrol();
}

// Upload af slides: sorteres efter filnavn, så 01, 02, 03 … kommer i rækkefølge
fSlides.addEventListener('change', function () {
  const filer = Array.from(fSlides.files).sort(function (a, b) {
    return a.name.localeCompare(b.name, 'da', { numeric: true });
  });
  Promise.all(filer.map(filTilSlide)).then(function (nye) {
    slides = nye;
    nr = 0;
    tegnAlt();
  });
});

fForsideB.addEventListener('change', function () {
  if (!fForsideB.files[0]) { forsideB = null; visB = false; tegnAlt(); return; }
  filTilSlide(fForsideB.files[0]).then(function (s) { forsideB = s; tegnAlt(); });
});

fTekst.addEventListener('input', function () { udvidet = false; tegnTekst(); tegnKontrol(); });
fAiBillede.addEventListener('change', tegnSlides);
fGrethe.addEventListener('change', function () { tegnTekst(); tegnKontrol(); });

// Skift mellem forside A og B
vAB.querySelectorAll('[data-forside]').forEach(function (knap) {
  knap.addEventListener('click', function () {
    visB = knap.dataset.forside === 'B';
    vAB.querySelectorAll('[data-forside]').forEach(function (k) {
      k.classList.toggle('knap--aktiv', k === knap);
      k.setAttribute('aria-pressed', k === knap ? 'true' : 'false');
    });
    nr = 0;
    tegnSlides();
  });
});

function visEksempel() {
  fSlides.value = '';
  fForsideB.value = '';
  forsideB = null;
  visB = false;
  nr = 0;
  udvidet = false;
  fTekst.value = EKSEMPEL.tekst;
  Promise.all(EKSEMPEL.slides.map(function (s) { return maalBillede(Object.assign({}, s)); }))
    .then(function (nye) { slides = nye; tegnAlt(); });
}

document.getElementById('eksempel').addEventListener('click', visEksempel);
visEksempel();


/* ---------- 6. Søgning ---------- */

// Søger i overskrifter, afsnit, punkter og tabeller på alle sider – også dem, der er skjult.
// Klikker man på et resultat, skifter siden (og evt. fanen) og hopper til teksten
const soegefelt = document.getElementById('soeg');
const resultater = document.getElementById('soegeresultater');
const SOEG_I = 'h3, p, li, td, dt, dd';

// Elementer, der ikke skal kunne findes (forhåndsvisningen, bladr-links og selve søgningen)
function springOver(el) {
  return el.closest('.soeg, .bladr, .vaerksted__side, .felter, .prompt, .forside');
}

function find(ord) {
  const fund = [];
  afsnit.forEach(function (s) {
    s.querySelectorAll(SOEG_I).forEach(function (el) {
      if (springOver(el)) return;
      // Elementer med andre tekstblokke inden i (fx et helt trin) tæller ikke –
      // så findes den lille tekst inden i i stedet, og prompterne kommer ikke med
      if (el.querySelector('p, li, ul, ol, pre, div, h3')) return;
      const tekst = el.textContent.replace(/\s+/g, ' ').trim();
      const plads = tekst.toLowerCase().indexOf(ord);
      if (plads !== -1) { fund.push({ el: el, afsnit: s, tekst: tekst, plads: plads }); }
    });
  });
  return fund;
}

// Et udsnit af teksten omkring ordet, med ordet markeret
function udsnit(f, ord) {
  let start = Math.max(0, f.plads - 40);
  // Start ved et helt ord, så udsnittet ikke begynder midt i et ord
  if (start > 0) { start = f.tekst.indexOf(' ', start) + 1 || start; }
  const slut = Math.min(f.tekst.length, f.plads + ord.length + 60);
  const frag = document.createDocumentFragment();
  frag.append((start > 0 ? '… ' : '') + f.tekst.slice(start, f.plads));
  const mark = document.createElement('mark');
  mark.textContent = f.tekst.slice(f.plads, f.plads + ord.length);
  frag.append(mark);
  frag.append(f.tekst.slice(f.plads + ord.length, slut) + (slut < f.tekst.length ? ' …' : ''));
  return frag;
}

function visResultater() {
  const ord = soegefelt.value.trim().toLowerCase();
  resultater.innerHTML = '';
  if (ord.length < 2) { resultater.hidden = true; return; }

  const fund = find(ord).slice(0, 8);
  if (!fund.length) {
    const li = document.createElement('li');
    li.className = 'soeg__tom';
    li.textContent = 'Ingen resultater for »' + soegefelt.value.trim() + '«';
    resultater.append(li);
  }

  fund.forEach(function (f) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '#' + f.afsnit.id;
    const sted = document.createElement('small');
    sted.textContent = navn(f.afsnit);
    a.append(sted, udsnit(f, ord));
    a.addEventListener('click', function (e) {
      e.preventDefault();
      gaaTil(f);
    });
    li.append(a);
    resultater.append(li);
  });
  resultater.hidden = false;
}

function gaaTil(f) {
  resultater.hidden = true;
  soegefelt.value = '';

  // Ligger teksten i en fane, der ikke vises, så skift til den fane først
  const panel = f.el.closest('.vaerksted');
  if (panel && panel.hidden) {
    visFane(document.querySelector('[aria-controls="' + panel.id + '"]'));
  }

  soegeMaal = f.el;
  if (location.hash === '#' + f.afsnit.id) {
    visAfsnit(true);
  } else {
    location.hash = f.afsnit.id;   // hashchange kalder visAfsnit
  }
}

function visSoegeMaal() {
  const el = soegeMaal;
  soegeMaal = null;
  el.scrollIntoView({ block: 'center' });
  el.classList.remove('fundet');
  void el.offsetWidth;            // genstarter animationen, hvis man finder det samme to gange
  el.classList.add('fundet');
}

soegefelt.addEventListener('input', visResultater);


/* ---------- 7. PDF ----------
   Knappen »Hent som PDF« er et almindeligt link til pdf/ai-playbook.pdf, så der skal ingen JavaScript til.
   Den PDF er designet for sig i playbook-pdf.html. */

// Enter hopper til første resultat. Esc lukker listen. Pil ned går ind i listen
soegefelt.addEventListener('keydown', function (e) {
  const foerste = resultater.querySelector('a');
  if (e.key === 'Enter' && foerste) { e.preventDefault(); foerste.click(); }
  if (e.key === 'Escape') { resultater.hidden = true; }
  if (e.key === 'ArrowDown' && foerste) { e.preventDefault(); foerste.focus(); }
});

resultater.addEventListener('keydown', function (e) {
  const links = Array.from(resultater.querySelectorAll('a'));
  const nr = links.indexOf(document.activeElement);
  if (e.key === 'ArrowDown' && nr < links.length - 1) { e.preventDefault(); links[nr + 1].focus(); }
  if (e.key === 'ArrowUp') { e.preventDefault(); (nr > 0 ? links[nr - 1] : soegefelt).focus(); }
  if (e.key === 'Escape') { resultater.hidden = true; soegefelt.focus(); }
});

// Klik et andet sted lukker listen
document.addEventListener('click', function (e) {
  if (!e.target.closest('.soeg')) { resultater.hidden = true; }
});
