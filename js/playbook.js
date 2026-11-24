/* ==========================================================
   AI PLAYBOOK · små funktioner, der gør siden til et værktøj

   1. Kopiér-knapper ved prompterne
   2. Tjeklisten tæller, hvor mange punkter der er krydset af
   3. Undersider: ét afsnit vises ad gangen, med Forrige/Næste
   4. Værkstedet: faner med én produktion ad gangen
   5. Forhåndsvisning af karrusellen (egne slides eller søvnguidens billeder)
   5b. Forhåndsvisning af små opslag (Facebook) og velkomstmailen
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

// Søvnguidens kapitler og billedpar. Alle billeder ligger i img/guide/:
// dengang-<fil>.jpg og idag-<fil>.jpg. side = siden i søvnguiden, knappen i mailen linker til
const KAPITLER = [
  { navn: '07.00 Morgen',       fil: '0700-morgen',      side: '04' },
  { navn: '14.00 Eftermiddag',  fil: '1400-eftermiddag', side: '06' },
  { navn: '20.00 Aften',        fil: '2000-aften',       side: '08' },
  { navn: '22.30 Sengetid',     fil: 'sengetid',         side: '10' },
  { navn: '04.30 Natten',       fil: '0430-klokken-fem', side: '12' },
  { navn: 'Vinter og forår',    fil: 'vinter',           side: '14' },
  { navn: 'Sommer og efterår',  fil: 'dyner-luftes',     side: '16' },
  { navn: 'Din side af sengen', fil: 'for-to',           side: '18' },
  { navn: 'Børnebørnene',       fil: 'boerneboern',      side: '20' }
];

function billedSti(kapitel, tid) {   // tid = 'dengang' eller 'idag'
  return 'img/guide/' + tid + '-' + kapitel.fil + '.jpg';
}

// Fylder en <select> med kapitlerne
function fyldKapitler(select, valgt) {
  KAPITLER.forEach(function (k, i) {
    const o = document.createElement('option');
    o.value = i;
    o.textContent = k.navn;
    if (k.navn === valgt) { o.selected = true; }
    select.append(o);
  });
}

// Ord fra baggrundsfilen, vi ikke bruger. »Ældre Sagen« er en kilde og tæller ikke med
const UNDGAA = ['ældre', 'seniorer', 'senior', 'powernap', 'sover varmt', 'sover koldt', 'laboratorium'];
function undgaaedeOrd(tekst) {
  const t = tekst.toLowerCase().replace(/ældre sagen/g, '');
  return UNDGAA.filter(function (ord) {
    return new RegExp('(^|[^a-zæøå])' + ord + '(?![a-zæøå])').test(t);
  });
}

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
let galleriValg = [];     // billeder valgt i galleriet, i den rækkefølge man klikkede
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
  galleriValg = [];
  visGalleriValg();
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

// Galleriet: søvnguidens 18 billeder som knapper. Valgte billeder bliver slides i klikrækkefølge
const galleri = document.getElementById('galleri');

KAPITLER.forEach(function (k) {
  ['dengang', 'idag'].forEach(function (tid) {
    const knap = document.createElement('button');
    knap.type = 'button';
    knap.className = 'galleri__billede';
    knap.dataset.src = billedSti(k, tid);
    knap.setAttribute('aria-pressed', 'false');
    knap.innerHTML = '<img src="' + knap.dataset.src + '" alt=""><span class="galleri__navn">' +
      (tid === 'dengang' ? 'Dengang' : 'I dag') + ' · ' + k.navn + '</span><span class="galleri__nr" aria-hidden="true"></span>';
    knap.addEventListener('click', function () { vaelgIGalleri(knap.dataset.src); });
    galleri.append(knap);
  });
});

function vaelgIGalleri(src) {
  const plads = galleriValg.indexOf(src);
  if (plads === -1) { galleriValg.push(src); } else { galleriValg.splice(plads, 1); }
  fSlides.value = '';   // galleriet afløser de uploadede slides
  visGalleriValg();
  Promise.all(galleriValg.map(function (s) {
    return maalBillede({ src: s, navn: s.replace('img/guide/', '') });
  })).then(function (nye) {
    slides = nye;
    nr = Math.max(0, nye.length - 1);   // vis det billede, man lige har valgt
    tegnAlt();
  });
}

// Viser nummeret på de valgte billeder, så man kan se rækkefølgen
function visGalleriValg() {
  galleri.querySelectorAll('.galleri__billede').forEach(function (knap) {
    const plads = galleriValg.indexOf(knap.dataset.src);
    knap.setAttribute('aria-pressed', plads !== -1 ? 'true' : 'false');
    knap.querySelector('.galleri__nr').textContent = plads !== -1 ? plads + 1 : '';
  });
}

function visEksempel() {
  galleriValg = [];
  visGalleriValg();
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


/* ---------- 5b. Forhåndsvisning af små opslag og velkomstmailen ---------- */

// Fælles: billedparret. To billeder oven på hinanden – dengang til venstre, i dag til højre,
// delt af den røde tråd. Billederne viser samme rum, så de mødes ved tråden
function tegnBilledpar(figur, kapitel, valg, aiMaerke) {
  figur.innerHTML = '';
  figur.classList.toggle('billedpar--enkelt', valg !== 'par');

  if (valg === 'par' || valg === 'dengang') {
    figur.append(lavBillede(billedSti(kapitel, 'dengang'), 'billedpar__dengang', 'Dengang · ' + kapitel.navn));
  }
  if (valg === 'par' || valg === 'idag') {
    figur.append(lavBillede(billedSti(kapitel, 'idag'), 'billedpar__idag', 'I dag · ' + kapitel.navn));
  }
  if (valg === 'par') {
    const traad = document.createElement('span');
    traad.className = 'billedpar__traad';
    figur.append(traad);
  }
  if (aiMaerke) {
    const m = document.createElement('figcaption');
    m.className = 'karrusel__maerke';
    m.textContent = 'AI-genereret billede';
    figur.append(m);
  }
}

function lavBillede(src, klasse, alt) {
  const img = document.createElement('img');
  img.src = src;
  img.className = klasse;
  img.alt = alt;
  return img;
}

// Viser en liste med tjek (samme udseende som under karrusellen)
function tegnPunkter(liste, punkter) {
  liste.innerHTML = '';
  punkter.forEach(function (p) {
    const li = document.createElement('li');
    li.className = p.ok ? 'kontrol--ok' : 'kontrol--obs';
    li.textContent = p.t;
    liste.append(li);
  });
}


// ===== Små opslag (Facebook) =====
const oKapitel = document.getElementById('oKapitel');
const oTekst = document.getElementById('oTekst');
const oAiBillede = document.getElementById('oAiBillede');
const oGrethe = document.getElementById('oGrethe');
const ovTekst = document.getElementById('ovTekst');
const ovBilleder = document.getElementById('ovBilleder');
const ovKontrol = document.getElementById('ovKontrol');
let oUdvidet = false;

fyldKapitler(oKapitel, '07.00 Morgen');

const O_EKSEMPEL = 'Kan du huske, hvordan far trak gardinerne fra, så snart han var oppe? »Lys ind, så vågner man,« sagde han.\n\n' +
  'Han havde ret. Lys om morgenen hjælper kroppens døgnrytme på vej, så du lettere bliver træt om aftenen.\n\n' +
  'Prøv det i morgen: Tag den første kop kaffe et sted med dagslys.\n\nHvem trak gardinerne fra hjemme hos dig?';

function oValg() {
  return document.querySelector('input[name="oBillede"]:checked').value;
}

function tegnOpslag() {
  const kapitel = KAPITLER[oKapitel.value];
  tegnBilledpar(ovBilleder, kapitel, oValg(), oAiBillede.checked);

  // Teksten: kortes af ved »Se mere« ligesom på Facebook
  let tekst = oTekst.value.trim();
  if (oGrethe.checked && tekst.indexOf('fiktiv person') === -1) {
    tekst += (tekst ? '\n\n' : '') + MAERKNING;
  }
  ovTekst.textContent = '';
  if (!oUdvidet && tekst.length > SE_MERE) {
    ovTekst.textContent = tekst.slice(0, SE_MERE).trimEnd() + '… ';
    const knap = document.createElement('button');
    knap.type = 'button';
    knap.className = 'opslag__se-mere';
    knap.textContent = 'Se mere';
    knap.addEventListener('click', function () { oUdvidet = true; tegnOpslag(); });
    ovTekst.append(knap);
  } else {
    ovTekst.textContent = tekst;
  }

  // Tjek
  const egen = oTekst.value.trim();
  const punkter = [];
  punkter.push(egen.length > SE_MERE
    ? { ok: true, t: 'Før »Se mere« står: »' + egen.slice(0, SE_MERE).split('\n')[0] + '« – fanger det?' }
    : { ok: true, t: 'Hele teksten ses uden »Se mere«' });
  punkter.push(/\?\s*$/.test(egen)
    ? { ok: true, t: 'Slutter med et spørgsmål, så folk har lyst til at svare' }
    : { ok: false, t: 'Slutter ikke med et spørgsmål – et »dengang«-opslag skal helst invitere til svar' });
  const ord = undgaaedeOrd(egen);
  punkter.push(ord.length
    ? { ok: false, t: 'Ord, vi undgår: ' + ord.join(', ') }
    : { ok: true, t: 'Ingen af de ord, vi undgår' });
  punkter.push(oAiBillede.checked
    ? { ok: true, t: '»AI-genereret billede« står på billedet' }
    : { ok: false, t: 'Ingen AI-mærkning på billedet – billederne i søvnguiden er lavet med AI' });
  tegnPunkter(ovKontrol, punkter);
}

[oKapitel, oAiBillede, oGrethe].forEach(function (el) { el.addEventListener('change', tegnOpslag); });
document.querySelectorAll('input[name="oBillede"]').forEach(function (el) { el.addEventListener('change', tegnOpslag); });
oTekst.addEventListener('input', function () { oUdvidet = false; tegnOpslag(); });

document.getElementById('oEksempel').addEventListener('click', function () {
  oKapitel.value = 0;
  document.querySelector('input[name="oBillede"][value="par"]').checked = true;
  oTekst.value = O_EKSEMPEL;
  oUdvidet = false;
  tegnOpslag();
});

// Hent billedet: tegner billedparret i 1080 × 1080 på et canvas og gemmer det som png.
// Virker, når siden ligger på nettet. Åbnes filen direkte fra computeren, blokerer browseren det
const oHentStatus = document.getElementById('oHentStatus');

function hentBillede(src) {
  return new Promise(function (svar, fejl) {
    const img = new Image();
    img.onload = function () { svar(img); };
    img.onerror = fejl;
    img.src = src;
  });
}

// Tegner et billede, så det fylder hele lærredet (ligesom object-fit: cover)
function tegnDaekkende(ctx, img, str) {
  const skala = Math.max(str / img.naturalWidth, str / img.naturalHeight);
  const b = img.naturalWidth * skala;
  const h = img.naturalHeight * skala;
  ctx.drawImage(img, (str - b) / 2, (str - h) / 2, b, h);
}

document.getElementById('oHent').addEventListener('click', function () {
  const kapitel = KAPITLER[oKapitel.value];
  const valg = oValg();
  const STR = 1080;
  const kilder = valg === 'par'
    ? [billedSti(kapitel, 'dengang'), billedSti(kapitel, 'idag')]
    : [billedSti(kapitel, valg)];

  Promise.all(kilder.map(hentBillede)).then(function (billeder) {
    const canvas = document.createElement('canvas');
    canvas.width = STR;
    canvas.height = STR;
    const ctx = canvas.getContext('2d');

    tegnDaekkende(ctx, billeder[0], STR);
    if (valg === 'par') {
      // I dag-billedet tegnes kun i højre halvdel
      ctx.save();
      ctx.beginPath();
      ctx.rect(STR / 2, 0, STR / 2, STR);
      ctx.clip();
      tegnDaekkende(ctx, billeder[1], STR);
      ctx.restore();
      // Den røde tråd: 6 px på 1080 px (designguiden)
      ctx.fillStyle = '#A6192E';
      ctx.fillRect(STR / 2 - 3, 0, 6, STR);
    }
    if (oAiBillede.checked) {
      ctx.font = '26px Lato, sans-serif';
      const tekst = 'AI-genereret billede';
      const b = ctx.measureText(tekst).width;
      ctx.fillStyle = 'rgba(43, 42, 41, 0.8)';
      ctx.fillRect(24, STR - 24 - 44, b + 28, 44);
      ctx.fillStyle = '#F3EDE4';
      ctx.fillText(tekst, 38, STR - 24 - 13);
    }

    canvas.toBlob(function (blob) {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'opslag_' + kapitel.fil + '_' + valg + '.png';
      a.click();
      oHentStatus.textContent = 'Billedet er hentet.';
    }, 'image/png');
  }).catch(function () {
    oHentStatus.textContent = 'Billedet kunne ikke hentes. Det virker, når siden ligger på nettet (heididesire.dk/dykon), ikke når filen er åbnet direkte fra computeren.';
  });
});

document.getElementById('oEksempel').click();


// ===== Velkomstmailen =====
// AI's svar er delt i nummererede blokke (se prompten). Vi finder blokkene ud fra deres navne
const mSvar = document.getElementById('mSvar');
const mKapitel = document.getElementById('mKapitel');
const mNr = document.getElementById('mNr');
const mFelter = {
  emne: document.getElementById('mEmne'),
  pre: document.getElementById('mPre'),
  hilsen: document.getElementById('mHilsen'),
  dengang: document.getElementById('mDengang'),
  idag: document.getElementById('mIdag'),
  proev: document.getElementById('mProev'),
  mormor: document.getElementById('mMormor'),
  knap: document.getElementById('mKnap')
};

fyldKapitler(mKapitel, '07.00 Morgen');

// Blokkenes navne, som de står i prompten. Rækkefølgen betyder noget: »I DAG« før »DAG« osv.
const BLOKKE = [
  { noegle: 'emne', ord: 'EMNELINJE' },
  { noegle: 'pre', ord: 'PREHEADER' },
  { noegle: 'hilsen', ord: 'HILSEN' },
  { noegle: 'dengang', ord: 'DENGANG' },
  { noegle: 'idag', ord: 'I DAG' },
  { noegle: 'proev', ord: 'PRØV DET' },
  { noegle: 'mormor', ord: 'MORMOR I DAG' },
  { noegle: 'knap', ord: 'KNAP' },
  { noegle: 'alt', ord: 'ALT-TEKST' },
  { noegle: 'tvivl', ord: 'TVIVLSLISTE' }
];

// Deler AI's svar op. En blok starter med en linje som »4. DENGANG« eller »**4. DENGANG** – …«
function fordelSvar(tekst) {
  const blokke = {};
  let aktiv = null;
  tekst.split('\n').forEach(function (linje) {
    const ren = linje.replace(/[*#_]/g, '').trim();
    const m = ren.match(/^(\d{1,2})\s*[.)]\s*(.+)$/);
    const blok = m && BLOKKE.find(function (b) { return m[2].toUpperCase().indexOf(b.ord) === 0; });
    if (blok) {
      aktiv = blok.noegle;
      // Tekst på samme linje efter navnet, fx »1. EMNELINJE – Godmorgen, Grethe«
      const rest = m[2].slice(blok.ord.length).replace(/^[\s:–—-]+/, '').replace(/^\([^)]*\)\s*[:–—-]?\s*/, '');
      blokke[aktiv] = rest ? [rest] : [];
    } else if (aktiv) {
      blokke[aktiv].push(linje.replace(/\*\*/g, '').trim());
    }
  });
  Object.keys(blokke).forEach(function (k) { blokke[k] = blokke[k].join('\n').trim(); });
  return blokke;
}

// Første rigtige linje i en blok – uden »A:«, »Variant 1:«, punkttegn og anførselstegn
function foersteLinje(tekst) {
  const linje = (tekst || '').split('\n').map(function (l) { return l.trim(); }).filter(Boolean)[0] || '';
  return linje.replace(/^[-•]\s*/, '').replace(/^(variant\s*)?[a-c1-3][.):]\s*/i, '').replace(/^["»“]|["«”]$/g, '').trim();
}

// Fjerner citattegn og »– Grethe« fra Grethes ord, så de ikke står to gange
function renCitat(tekst) {
  return (tekst || '').replace(/\n?\s*[–-]\s*(Grethe|Mormor)\s*$/i, '').trim().replace(/^[»"“]+|[«"”]+$/g, '').trim();
}

function udfyldFraSvar() {
  const b = fordelSvar(mSvar.value);
  mFelter.emne.value = foersteLinje(b.emne);
  mFelter.pre.value = foersteLinje(b.pre);
  mFelter.hilsen.value = b.hilsen || '';
  mFelter.dengang.value = renCitat(b.dengang);
  mFelter.idag.value = b.idag || '';
  mFelter.proev.value = b.proev || '';
  mFelter.mormor.value = renCitat(b.mormor);
  // Knappen: kun knapteksten – ikke navnet på ankeret, der står efter »+« eller »–«
  mFelter.knap.value = foersteLinje(b.knap).split(/\s+[+–—-]\s+|\s*\(/)[0].replace(/^["»“]|["«”]$/g, '');
  tegnMail();
}

function tegnMail() {
  const f = {};
  Object.keys(mFelter).forEach(function (k) { f[k] = mFelter[k].value.trim(); });
  const kapitel = KAPITLER[mKapitel.value];

  document.getElementById('mvEmne').textContent = f.emne || '(emnelinje)';
  document.getElementById('mvPre').textContent = f.pre || '(preheader)';
  document.getElementById('mvHilsen').textContent = f.hilsen;
  document.getElementById('mvDengang').textContent = f.dengang ? '»' + f.dengang + '«' : '';
  document.getElementById('mvProev').textContent = f.proev;
  document.getElementById('mvMormor').textContent = f.mormor ? '»' + f.mormor + '«' : '';
  document.getElementById('mvNr').textContent = mNr.value;

  // I dag kan have flere afsnit
  const idag = document.getElementById('mvIdag');
  idag.innerHTML = '';
  f.idag.split(/\n\s*\n|\n/).filter(Boolean).forEach(function (afsnit) {
    const p = document.createElement('p');
    p.textContent = afsnit.trim();
    idag.append(p);
  });

  const knap = document.getElementById('mvKnap');
  knap.textContent = f.knap || 'Læs kapitlet';
  knap.href = 'guide.html#side-' + kapitel.side;

  tegnBilledpar(document.getElementById('mvBilleder'), kapitel, 'par', true);

  // Tjek
  const alt = Object.keys(f).map(function (k) { return f[k]; }).join('\n') + '\n' + mSvar.value;
  const punkter = [];
  punkter.push(f.emne && f.emne.length <= 45
    ? { ok: true, t: 'Emnelinjen er ' + f.emne.length + ' tegn (højst 45)' }
    : { ok: false, t: f.emne ? 'Emnelinjen er ' + f.emne.length + ' tegn – højst 45, ellers bliver den skåret af' : 'Der mangler en emnelinje' });
  punkter.push(f.pre && f.pre.length <= 90
    ? { ok: true, t: 'Preheaderen er ' + f.pre.length + ' tegn (højst 90)' }
    : { ok: false, t: f.pre ? 'Preheaderen er ' + f.pre.length + ' tegn – højst 90' : 'Der mangler en preheader' });
  const ordIKnap = f.knap ? f.knap.split(/\s+/).length : 0;
  punkter.push(ordIKnap && ordIKnap <= 4
    ? { ok: true, t: 'Knapteksten er ' + ordIKnap + ' ord (højst 4)' }
    : { ok: false, t: ordIKnap ? 'Knapteksten er ' + ordIKnap + ' ord – højst 4' : 'Der mangler en knaptekst' });
  const tomme = ['dengang', 'idag', 'proev', 'mormor'].filter(function (k) { return !f[k]; });
  punkter.push(tomme.length
    ? { ok: false, t: 'Tomme felter: ' + tomme.map(function (k) { return { dengang: 'Dengang', idag: 'I dag', proev: 'Prøv det', mormor: 'Mormor i dag' }[k]; }).join(', ') }
    : { ok: true, t: 'Dengang, I dag, Prøv det og Mormor i dag er udfyldt' });
  punkter.push(/FAKTA MANGLER/i.test(alt)
    ? { ok: false, t: 'AI har skrevet [FAKTA MANGLER] – find svaret i søvnguiden, før mailen bruges' }
    : { ok: true, t: 'Ingen [FAKTA MANGLER]' });
  punkter.push(/\bNYE?\b/.test(mSvar.value)
    ? { ok: false, t: 'AI har markeret nye Grethe-replikker – de skal godkendes af jer begge' }
    : { ok: true, t: 'Ingen nye Grethe-replikker' });
  const ord = undgaaedeOrd(alt);
  punkter.push(ord.length
    ? { ok: false, t: 'Ord, vi undgår: ' + ord.join(', ') }
    : { ok: true, t: 'Ingen af de ord, vi undgår' });
  tegnPunkter(document.getElementById('mvKontrol'), punkter);
}

let mVent;
mSvar.addEventListener('input', function () {
  clearTimeout(mVent);
  mVent = setTimeout(udfyldFraSvar, 250);   // vent til man er færdig med at sætte ind
});
Object.keys(mFelter).forEach(function (k) { mFelter[k].addEventListener('input', tegnMail); });
mKapitel.addEventListener('change', tegnMail);
mNr.addEventListener('change', tegnMail);

// Eksemplet: sådan kan et svar fra AI se ud for mail 2 om 07.00 Morgen (teksten er fra søvnguiden)
const M_EKSEMPEL = [
  '1. EMNELINJE',
  'A: Lys ind, så vågner man',
  'B: Din nat begynder i morgen tidlig',
  '',
  '2. PREHEADER',
  'Grethes far havde ret: Dagslys om morgenen gør det lettere at sove om aftenen.',
  '',
  '3. HILSEN',
  'Kære [Fornavn]',
  'I dag handler det om morgenen – for en god nat begynder, længe før du slukker lyset.',
  '',
  '4. DENGANG',
  '»Far trak gardinerne fra, så snart han var oppe. \'Lys ind, så vågner man,\' sagde han.«',
  '',
  '5. I DAG',
  'Lys er med til at styre kroppens døgnrytme. Kraftigt lys om morgenen fremskynder den, så du lettere bliver træt om aftenen.',
  'Stå op på samme tid hver dag, også efter en dårlig nat. En fast rytme hjælper søvnen.',
  '',
  '6. PRØV DET',
  'Tag den første kop kaffe et sted med dagslys, ved vinduet eller ude på terrassen.',
  '',
  '7. MORMOR I DAG',
  '»Morfar siger, han er et B-menneske. Det har han sagt i 50 år, og han står op klokken seks.«',
  '',
  '8. KNAP',
  'Læs om morgenen + 07.00 Morgen',
  '',
  '9. ALT-TEKST',
  'Dengang: En kvinde trækker blomstrede gardiner fra. I dag: Dagslys over en nyredt seng.',
  '',
  '10. TVIVLSLISTE',
  'Ingen.'
].join('\n');

document.getElementById('mEksempel').addEventListener('click', function () {
  mSvar.value = M_EKSEMPEL;
  mKapitel.value = 0;
  mNr.value = '2';
  udfyldFraSvar();
});
document.getElementById('mEksempel').click();


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
