/* ==========================================================
   QUIZ-LOGIK · "Myte eller sandhed?"

   Quizzen har tre skærme, som skiftes ud inde i <main id="quiz">:
   1. visStart()        – startsiden
   2. visSpoergsmaal()  – ét spørgsmål ad gangen + svaret
   3. visResultat()     – resultat, tilmelding og deling

   Tekster og spørgsmål ligger i spoergsmaal.js.
   ========================================================== */

const quiz = document.getElementById('quiz');

// Quizzens tilstand: hvor langt man er, og hvad man har svaret
let nr = 0;           // nummeret på det spørgsmål, der vises (0 = det første)
let rigtige = 0;
let besvarelser = []; // gemmer hvert svar, så man kan se sine svar igen til sidst


/* ---------- Hjælpefunktioner ---------- */

// Skifter indholdet i <main> og flytter fokus til den nye overskrift.
// Fokus flyttes, så skærmlæsere og tastaturbrugere starter øverst på den nye skærm
// i stedet for at blive efterladt på en knap, der ikke findes længere.
function skiftSkaerm(html) {
  quiz.innerHTML = html;
  window.scrollTo({ top: 0 });
  const overskrift = quiz.querySelector('h1, h2');
  if (overskrift) {
    overskrift.setAttribute('tabindex', '-1');
    overskrift.focus();
  }
}

// Grethes citater står altid i samme ramme, så de ligner citaterne i søvnguiden
function grethesCitat(tekst) {
  return `
    <blockquote class="grethe">
      <p>»${tekst}«</p>
      <footer>– Grethe</footer>
    </blockquote>`;
}


/* ---------- 1. Startsiden ---------- */

function visStart() {
  nr = 0;
  rigtige = 0;
  besvarelser = [];

  skiftSkaerm(`
    <section class="skaerm skaerm--start">
      <p class="etiket">Søvnguiden · dengang og i dag</p>
      <h1>Myte eller sandhed?</h1>
      ${grethesCitat('Mor sagde altid, at man ikke skulle ligge og tælle timer. Far sagde: Lys ind, så vågner man. Men havde de ret?')}
      <p class="intro">Seks ting, man sagde om søvn dengang. Gæt, om de holder i dag.</p>
      <button class="knap knap--primaer" id="start">Start quizzen</button>
      <p class="lille">Ca. 2 minutter · Du skal ikke oplyse noget for at være med.</p>
    </section>
  `);

  document.getElementById('start').addEventListener('click', visSpoergsmaal);
}


/* ---------- 2. Ét spørgsmål ---------- */

function visSpoergsmaal() {
  const s = SPOERGSMAAL[nr];
  const procent = Math.round((nr / SPOERGSMAAL.length) * 100);

  skiftSkaerm(`
    <section class="skaerm">
      <div class="fremdrift">
        <p>Spørgsmål ${nr + 1} af ${SPOERGSMAAL.length}</p>
        <div class="fremdrift__bar" aria-hidden="true"><span style="width:${procent}%"></span></div>
      </div>

      <figure class="dengang-billede">
        <img src="img/dengang/${s.billede}" alt="${s.alt}">
        <figcaption>Dengang · AI-genereret billede</figcaption>
      </figure>

      <p class="etiket">Det sagde man dengang</p>
      <h2 class="udsagn">»${s.udsagn}«</h2>

      <div class="valg" role="group" aria-label="Vælg dit svar">
        <button class="knap knap--valg" data-valg="myte">Myte</button>
        <button class="knap knap--valg" data-valg="sandhed">Sandhed</button>
      </div>

      <!-- aria-live: skærmlæsere læser svaret højt, når det dukker op her -->
      <div class="svar" id="svar" aria-live="polite"></div>
    </section>
  `);

  quiz.querySelectorAll('[data-valg]').forEach(function (knap) {
    knap.addEventListener('click', function () {
      besvar(knap.dataset.valg);
    });
  });
}

function besvar(valg) {
  const s = SPOERGSMAAL[nr];
  const korrekt = valg === s.svar;
  if (korrekt) rigtige++;
  besvarelser.push({ udsagn: s.udsagn, svar: s.svar, korrekt: korrekt });

  // Knapperne låses, så man ikke kan ændre sit svar, når facit er vist.
  // Den valgte knap markeres, så man kan se, hvad man trykkede på
  quiz.querySelectorAll('[data-valg]').forEach(function (knap) {
    knap.disabled = true;
    if (knap.dataset.valg === valg) {
      knap.classList.add('knap--valgt');
      // Rigtigt svar: knappen bliver grøn, så man tydeligt kan se, at man ramte
      if (korrekt) knap.classList.add('knap--rigtig');
    }
  });

  const sidste = nr === SPOERGSMAAL.length - 1;
  const facit = s.svar === 'sandhed' ? 'Sandhed!' : 'Myte!';
  const respons = korrekt ? 'Du svarede rigtigt.' : 'Godt gættet, men ikke helt.';

  document.getElementById('svar').innerHTML = `
    <div class="facit ${korrekt ? 'facit--rigtigt' : 'facit--forkert'}">
      <p class="facit__overskrift">${facit}</p>
      <p class="facit__respons">${respons}</p>
    </div>

    <div class="idag">
      <p class="etiket etiket--roed">I dag</p>
      <p>${s.fakta}</p>
      <p class="kilde">Kilde: ${s.kilde} · Læs mere i søvnguiden: ${s.kapitel}</p>
    </div>

    ${grethesCitat(s.grethe)}

    <button class="knap knap--primaer" id="naeste">
      ${sidste ? 'Se dit resultat' : 'Næste spørgsmål'}
    </button>
  `;

  const naeste = document.getElementById('naeste');
  naeste.addEventListener('click', function () {
    nr++;
    if (sidste) {
      visResultat();
    } else {
      visSpoergsmaal();
    }
  });
  // Rul svaret frem, så det kan ses på en lille skærm uden at lede efter det
  document.getElementById('svar').scrollIntoView({ behavior: 'smooth', block: 'start' });
}


/* ---------- 3. Resultat, tilmelding og deling ---------- */

function visResultat() {
  // Finder den første resultattekst, hvor antallet af rigtige er højt nok
  const resultat = RESULTATER.find(function (r) { return rigtige >= r.fra; });

  skiftSkaerm(`
    <section class="skaerm skaerm--resultat">
      <p class="etiket">Dit resultat · ${rigtige} af ${SPOERGSMAAL.length} rigtige</p>
      <h1>${resultat.overskrift}</h1>
      ${grethesCitat(resultat.grethe)}

      <div class="tilmeld" id="tilmeld">
        <h2>Vil du vide mere?</h2>
        <p>Få <strong>Søvnguiden – dengang og i dag</strong> som gave. Den følger dig døgnet rundt og året rundt med Grethes erindringer og råd, du kan prøve allerede i aften.</p>

        <form id="tilmeldForm" novalidate>
          <label for="fornavn">Fornavn</label>
          <input id="fornavn" name="fornavn" type="text" autocomplete="given-name" required>

          <label for="email">E-mail</label>
          <input id="email" name="email" type="email" autocomplete="email" required>

          <label class="samtykke">
            <input id="samtykke" type="checkbox" required>
            <span>Ja tak, send mig søvnguiden og Ringsted Duns nyhedsbrev. Jeg kan altid afmelde mig.</span>
          </label>

          <p class="fejl" id="fejl" role="alert"></p>
          <button class="knap knap--primaer" type="submit">Send mig guiden</button>
        </form>
      </div>

      <div class="ekstra">
        <button class="knap knap--sekundaer" id="del">Del quizzen med en, du holder af</button>
        <p class="lille" id="delBesked" aria-live="polite"></p>
        <button class="knap knap--link" id="seSvar">Se mine svar igen</button>
        <button class="knap knap--link" id="igen">Tag quizzen igen</button>
      </div>

      <div id="oversigt"></div>
    </section>
  `);

  document.getElementById('tilmeldForm').addEventListener('submit', tilmeld);
  document.getElementById('del').addEventListener('click', del);
  document.getElementById('seSvar').addEventListener('click', visOversigt);
  document.getElementById('igen').addEventListener('click', visStart);
}

// PROTOTYPE: Formularen sender ikke noget. I en rigtig kampagne skal den forbindes
// til et nyhedsbrevssystem (fx Mailchimp), som også sender guiden ud.
function tilmeld(event) {
  event.preventDefault(); // stopper browseren i at genindlæse siden

  const fornavn = document.getElementById('fornavn').value.trim();
  const email = document.getElementById('email').value.trim();
  const samtykke = document.getElementById('samtykke').checked;
  const fejl = document.getElementById('fejl');

  // Fejlbeskederne står i almindelige ord, så det er tydeligt, hvad man skal rette
  if (!fornavn) { fejl.textContent = 'Skriv dit fornavn.'; return; }
  if (!email.includes('@') || !email.includes('.')) { fejl.textContent = 'Tjek, at din e-mailadresse er skrevet rigtigt.'; return; }
  if (!samtykke) { fejl.textContent = 'Sæt flueben, hvis du vil have guiden og nyhedsbrevet.'; return; }

  document.getElementById('tilmeld').innerHTML = `
    <h2 tabindex="-1">Tak, ${fornavn}!</h2>
    <p>Søvnguiden er på vej til din indbakke. God fornøjelse med læsningen, og sov godt i nat.</p>
    <p class="lille">(Prototype: der bliver ikke sendt noget.)</p>
  `;
  document.querySelector('#tilmeld h2').focus();
}

// Deler quizzen. På mobilen åbnes telefonens egen deleknap (fx Messenger eller sms).
// Findes den ikke, kopieres linket i stedet
function del() {
  const besked = document.getElementById('delBesked');
  const data = {
    title: 'Myte eller sandhed?',
    text: 'Seks ting, man sagde om søvn dengang. Hvor mange kan du gætte?',
    url: window.location.href
  };

  if (navigator.share) {
    navigator.share(data).catch(function () { /* brugeren lukkede delingen – det er ok */ });
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(data.url).then(function () {
      besked.textContent = 'Linket er kopieret. Sæt det ind i en besked.';
    });
  } else {
    besked.textContent = 'Kopiér adressen øverst i browseren, og send den til en, du holder af.';
  }
}

// Viser en liste over alle udsagn med rigtigt svar og om man ramte det
function visOversigt() {
  const liste = besvarelser.map(function (b) {
    return `
      <li class="${b.korrekt ? 'rigtigt' : 'forkert'}">
        <span class="oversigt__udsagn">»${b.udsagn}«</span>
        <span class="oversigt__facit">${b.svar === 'sandhed' ? 'Sandhed' : 'Myte'} · ${b.korrekt ? 'du svarede rigtigt' : 'du svarede forkert'}</span>
      </li>`;
  }).join('');

  document.getElementById('oversigt').innerHTML = `
    <h2 tabindex="-1">Dine svar</h2>
    <ol class="oversigt">${liste}</ol>
  `;
  document.querySelector('#oversigt h2').focus();
}


// Quizzen starter, når siden er indlæst
visStart();
