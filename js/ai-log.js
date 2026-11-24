// ==========================================================
// AI-LOG.JS · filteret på AI log-siden (ai-log.html)
// Selve loggen står som almindelig HTML-tabel i ai-log.html.
// Denne fil skjuler bare de rækker, der ikke passer til filteret,
// og holder tallene øverst opdaterede. Uden JavaScript ses hele tabellen.
// ==========================================================

const filter = document.getElementById('filter');
const raekker = Array.from(document.querySelectorAll('.log tbody tr'));
const status = document.getElementById('filter-status');
const tom = document.getElementById('log-tom');

const tbody = document.querySelector('.log tbody');

// Det valgte filter. 'alle' betyder, at der ikke filtreres på det
const valgt = { person: 'alle', vaerktoej: 'alle', sortering: 'aeldste' };

// Husk rækkefølgen fra HTML'en, så rækker med samme dato altid står ens
raekker.forEach(function (r, i) { r.dataset.nr = i; });

// ---------- 1 · Tallene øverst ----------
// Tælles ud fra tabellen, så de passer, når nye rækker kommer til
function opdaterTal() {
  const vaerktoejer = new Set();
  raekker.forEach(function (r) {
    r.dataset.vaerktoejer.split(' ').filter(Boolean).forEach(function (v) { vaerktoejer.add(v); });
  });
  document.querySelector('[data-tal="raekker"]').textContent = raekker.length;
  document.querySelector('[data-tal="vaerktoejer"]').textContent = vaerktoejer.size;
}

// ---------- 2 · Vis kun de rækker, der passer ----------
function filtrer() {
  let synlige = 0;
  raekker.forEach(function (r) {
    // En række med "heidi marcus" passer både på Heidi og på Marcus
    const passerPerson = valgt.person === 'alle' || r.dataset.personer.split(' ').includes(valgt.person);
    const passerVaerktoej = valgt.vaerktoej === 'alle' || r.dataset.vaerktoejer.split(' ').includes(valgt.vaerktoej);
    const vis = passerPerson && passerVaerktoej;
    r.hidden = !vis;
    if (vis) synlige++;
  });
  tom.hidden = synlige > 0;
  status.textContent = 'Viser ' + synlige + ' af ' + raekker.length + ' opslag';
}

// ---------- 3 · Rækkefølgen ----------
// Ældste først: efter startdatoen (datetime på <time>).
// Nyeste først: efter slutdatoen (data-slut), så fx »12-11 – 24-11« står
// sammen med de andre rækker fra 24-11.
// Datoerne er skrevet år-måned-dag, så de kan sammenlignes som tekst.
function sorter() {
  const sorteret = raekker.slice().sort(function (a, b) {
    if (valgt.sortering === 'nyeste') {
      return b.dataset.slut.localeCompare(a.dataset.slut) || b.dataset.nr - a.dataset.nr;
    }
    const startA = a.querySelector('time').getAttribute('datetime');
    const startB = b.querySelector('time').getAttribute('datetime');
    return startA.localeCompare(startB) || a.dataset.nr - b.dataset.nr;
  });
  // appendChild flytter en række, der allerede står i tabellen, hen til sidst.
  // Gøres det i den nye rækkefølge, ender tabellen sorteret
  sorteret.forEach(function (r) { tbody.appendChild(r); });
}

// ---------- 4 · Knapperne ----------
// aria-pressed fortæller skærmlæsere, hvilken knap der er valgt
filter.addEventListener('click', function (e) {
  const knap = e.target.closest('.filter__knap');
  if (!knap) return;
  const gruppe = knap.dataset.filter;
  valgt[gruppe] = knap.dataset.vaerdi;
  filter.querySelectorAll('[data-filter="' + gruppe + '"]').forEach(function (k) {
    k.setAttribute('aria-pressed', k === knap ? 'true' : 'false');
  });
  if (gruppe === 'sortering') sorter();
  filtrer();
});

// Filteret er skjult i HTML'en og vises først her, så det aldrig står
// som knapper, der ikke virker, hvis JavaScript mangler
filter.hidden = false;
opdaterTal();
filtrer();
