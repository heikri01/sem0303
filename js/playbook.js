/* ==========================================================
   AI PLAYBOOK · små funktioner, der gør siden til et værktøj

   1. Kopiér-knapper ved promptskabelonerne
   2. Filter: vis kun arbejdsgangen for én produktion
   3. Tjeklisten tæller, hvor mange punkter der er krydset af
   4. Menuen viser, hvilket afsnit man er i

   Selve indholdet ligger i playbook.html.
   ========================================================== */


/* ---------- 1. Kopiér-knapper ---------- */

// Hver knap har data-kopier="id", som peger på den <pre>, der skal kopieres
const kopiStatus = document.getElementById('kopiStatus');

document.querySelectorAll('[data-kopier]').forEach(function (knap) {
  knap.addEventListener('click', function () {
    const tekst = document.getElementById(knap.dataset.kopier).innerText;

    navigator.clipboard.writeText(tekst).then(function () {
      knap.textContent = 'Kopieret ✓';
      kopiStatus.textContent = 'Prompten er kopieret. Sæt den ind i chatten, og ret det i [klammer].';
      // Knapteksten skifter tilbage efter 2 sekunder, så knappen kan bruges igen
      setTimeout(function () { knap.textContent = 'Kopiér'; }, 2000);
    }).catch(function () {
      // Nogle browsere tillader ikke kopiering fra en lokal fil – så markeres teksten i stedet
      const valg = window.getSelection();
      const omraade = document.createRange();
      omraade.selectNodeContents(document.getElementById(knap.dataset.kopier));
      valg.removeAllRanges();
      valg.addRange(omraade);
      kopiStatus.textContent = 'Teksten er markeret. Tryk Ctrl+C (Cmd+C på Mac) for at kopiere.';
    });
  });
});


/* ---------- 2. Filter pr. produktion ---------- */

// Knapperne har data-filter, kortene har data-produktion. "alle" viser alle kort
const filterKnapper = document.querySelectorAll('[data-filter]');
const produktionsKort = document.querySelectorAll('[data-produktion]');

filterKnapper.forEach(function (knap) {
  knap.addEventListener('click', function () {
    const valgt = knap.dataset.filter;

    filterKnapper.forEach(function (k) {
      const aktiv = k === knap;
      k.classList.toggle('knap--aktiv', aktiv);
      // aria-pressed fortæller skærmlæsere, hvilken knap der er valgt
      k.setAttribute('aria-pressed', aktiv ? 'true' : 'false');
    });

    produktionsKort.forEach(function (kort) {
      kort.hidden = valgt !== 'alle' && kort.dataset.produktion !== valgt;
    });
  });
});


/* ---------- 3. Tjeklisten ---------- */

const flueben = document.querySelectorAll('.tjekliste input');
const tjekStatus = document.getElementById('tjekStatus');

function opdaterTjekliste() {
  const antal = document.querySelectorAll('.tjekliste input:checked').length;
  tjekStatus.textContent = antal === flueben.length
    ? 'Alle ' + antal + ' punkter er tjekket – produktionen er klar.'
    : antal + ' af ' + flueben.length + ' punkter er tjekket';
}

flueben.forEach(function (f) { f.addEventListener('change', opdaterTjekliste); });

document.getElementById('nulstil').addEventListener('click', function () {
  flueben.forEach(function (f) { f.checked = false; });
  opdaterTjekliste();
});


/* ---------- 4. Menuen viser det aktuelle afsnit ---------- */

// IntersectionObserver holder øje med, hvilket afsnit der er synligt på skærmen
const menuLinks = document.querySelectorAll('.menu a');

const iagttager = new IntersectionObserver(function (afsnit) {
  afsnit.forEach(function (a) {
    if (!a.isIntersecting) return;
    menuLinks.forEach(function (link) {
      link.classList.toggle('aktiv', link.getAttribute('href') === '#' + a.target.id);
    });
  });
}, { rootMargin: '-20% 0px -70% 0px' });

document.querySelectorAll('.afsnit').forEach(function (s) { iagttager.observe(s); });
