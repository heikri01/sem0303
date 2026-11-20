# Sådan virker det · webmappen til afleveringen

*Opdateret 20/11 (Heidi + Claude). Opdatér filen, når noget flyttes, tilføjes eller fjernes.*

## Overblik

```
web/
├── quiz.html            Quizzen "Myte eller sandhed?" (selve siden)
├── playbook.html        AI Playbook som opslagsværk (SKELET – indhold kommer)
├── index.html           Tom – landingssiden kommer her
├── guide.html           Søvnguiden: bladremagasin på computer, mobildesign på telefon
├── scss/                Designet. Her retter du farver, skrift og layout
│   ├── quiz.scss        Hovedfil til quizzen
│   ├── playbook.scss    Hovedfil til AI Playbook
│   ├── guide.scss       Hovedfil til søvnguiden
│   ├── _tokens.scss     Farver (palet C), skrift og mål
│   ├── _mixins.scss     Genbrugte stykker: spærret skrift og fokusramme
│   ├── _base.scss       Siden, overskrifter, sidehoved og sidefod
│   ├── _knapper.scss    Alle knapper
│   ├── _quiz-dele.scss  Quizzens dele: citater, billede, svar, resultat
│   ├── _playbook-dele.scss  Playbookens dele: menu, kort, prompts, tjekliste, print
│   └── _guide-dele.scss Søvnguidens dele: bogen, siderne, fotopar, felter, knapper
├── css/
│   ├── quiz.css         Lavet automatisk ud fra scss/quiz.scss. Ret IKKE her
│   ├── playbook.css     Lavet automatisk ud fra scss/playbook.scss. Ret IKKE her
│   └── guide.css        Lavet automatisk ud fra scss/guide.scss. Ret IKKE her
├── js/
│   ├── spoergsmaal.js   Teksterne: udsagn, svar, fakta, Grethes replikker, resultater
│   ├── quiz.js          Quizzens logik: hvad der sker, når man klikker
│   ├── playbook.js      Kopiér-knapper, filter, tjekliste og aktiv menu
│   └── guide.js         Søvnguidens visninger og bladre-funktion
├── img/dengang/         De seks dengang-billeder (kopieret fra søvnguiden)
├── img/guide/           Søvnguidens billeder og logoer (kopieret fra Marcus' Mobilguide/img)
├── pdf/soevnguiden.pdf  Søvnguiden som pdf (knappen "Hent guiden som pdf")
└── .vscode/settings.json  Fortæller Live Sass Compiler, at CSS'en skal i css/ (opret selv – se nedenfor)
```

## Hvor retter jeg …

| Jeg vil rette … | Gå ind i |
|---|---|
| Et udsagn, et svar, en faktatekst eller en Grethe-replik | `js/spoergsmaal.js` – listen `SPOERGSMAAL` |
| Resultatteksterne (5–6, 3–4, 0–2 rigtige) | `js/spoergsmaal.js` – listen `RESULTATER` |
| Startsidens tekst | `js/quiz.js` – funktionen `visStart()` |
| Teksten i tilmeldingen | `js/quiz.js` – funktionen `visResultat()` |
| En farve eller en skriftstørrelse | `scss/_tokens.scss` |
| Knapperne | `scss/_knapper.scss` |
| Citatboksen, billedet, svarfeltet eller formularen | `scss/_quiz-dele.scss` |
| Teksten i sidefoden (AI-mærkning og kilder) | `quiz.html` – `<footer class="bund">` |

**Tilføj et spørgsmål:** Kopiér en blok `{ … },` i `SPOERGSMAAL`, ret teksterne, og læg billedet i `img/dengang/`. Antallet ("Spørgsmål 2 af 7") og fremdriftsbjælken tilpasser sig selv.

## Sådan hænger quizzen sammen

1. `quiz.html` er næsten tom. Den har sidehoved, sidefod og et tomt `<main id="quiz">`.
2. `spoergsmaal.js` indlæses først og gemmer teksterne i `SPOERGSMAAL` og `RESULTATER`.
3. `quiz.js` fylder `<main>` med én skærm ad gangen:
   - `visStart()` viser startsiden
   - `visSpoergsmaal()` viser spørgsmål nr. `nr`
   - `besvar()` tæller rigtige, låser knapperne og viser svaret
   - `visResultat()` viser resultat, tilmelding og deling
4. Hver gang skærmen skifter, flyttes fokus til den nye overskrift (`skiftSkaerm()`). Så starter skærmlæsere og tastaturbrugere øverst.

## SCSS med Live Sass Compiler

- Åbn mappen `web` som projekt i VS Code (Filer → Åbn mappe). Ellers bliver `.vscode/settings.json` ikke læst.
- **Første gang:** Opret mappen `.vscode` i `web`, og læg filen `settings.json` i den med dette indhold. Uden den lægger Live Sass Compiler CSS-filen i `scss/` i stedet for `css/`, og så finder siden den ikke:

```json
{
  "liveSassCompile.settings.formats": [
    { "format": "expanded", "extensionName": ".css", "savePath": "~/../css" }
  ],
  "liveSassCompile.settings.generateMap": false
}
```

  `~` betyder "mappen, hvor SCSS-filen ligger", og `/../css` betyder "gå én mappe op og ind i css".
- Klik på **Watch Sass** nederst i VS Code. Hver gang du gemmer en `.scss`-fil, laves `css/quiz.css` på ny.
- Ret aldrig direkte i `css/quiz.css`. Ændringen forsvinder næste gang, der kompileres.

> **Nyt begreb: partials og `@use`**
> Filer, der starter med `_` (fx `_knapper.scss`), er *partials*: små dele, som ikke bliver til deres egen CSS-fil. `quiz.scss` samler dem med `@use 'knapper';`. **En partial må ikke hedde det samme som en hovedfil** (fx `_quiz.scss` ved siden af `quiz.scss`) – så ved Sass ikke, hvilken fil `@use 'quiz'` peger på. Derfor hedder de `_quiz-dele.scss` og `_playbook-dele.scss`. Hver partial, der skal bruge farverne, skriver selv `@use 'tokens' as *;` øverst. `as *` betyder, at man kan skrive `$roed` i stedet for `tokens.$roed`.

> **Nyt begreb: BEM-navne**
> Klasserne følger et mønster: `.knap` er blokken, `.knap--primaer` er en variant (to bindestreger), og `.fremdrift__bar` er en del af blokken (to understreger). I SCSS skrives de med `&`, fx `&--primaer` inde i `.knap`. Så står alt om én blok samlet ét sted.

> **Nyt begreb: mixin**
> En mixin er et genbrugeligt stykke CSS. `@include spaerret(0.875rem);` giver store, spærrede bogstaver i den størrelse, man skriver i parentesen.

> **Nyt begreb: `aria-live`**
> Et område med `aria-live="polite"` bliver læst højt af skærmlæsere, når indholdet ændrer sig. Det bruges til svaret og til fejlbeskeder, så blinde og svagtseende også får besked.

> **Nyt begreb: `data-valg`**
> `data-`-attributter gemmer små oplysninger på et HTML-element. Knapperne har `data-valg="myte"` og `data-valg="sandhed"`, og JavaScript læser dem med `knap.dataset.valg`.

## AI Playbook (playbook.html) – skelet 18/11

Siden er et opslagsværk med syv afsnit og en menu i venstre side. **Stiplede felter (`class="pladsholder"`) er indhold, der ikke er skrevet endnu** – det godkendte indhold kommer fra FigJam (siden AI Playbook). Alle pladsholdere skal være væk før afleveringen.

| Jeg vil … | Gå ind i |
|---|---|
| Skrive indhold i et afsnit | `playbook.html` – find `<section class="afsnit" id="…">` |
| Tilføje et afsnit | Kopiér en `<section class="afsnit">`, giv den et nyt `id`, og tilføj et link i `<nav class="menu">` |
| Tilføje en prompt med kopiér-knap | Kopiér en `<div class="prompt">`. `id` på `<pre>` skal være det samme som `data-kopier` på knappen |
| Tilføje en produktion til filteret | En knap med `data-filter="navn"` + et kort med `data-produktion="navn"` |
| Tilføje et punkt til tjeklisten | Kopiér en `<li>` i `<ul class="tjekliste">`. Tælleren tilpasser sig selv |
| Gemme som PDF | Udskriv siden (Ctrl+P) → Gem som PDF. Menu og knapper skjules, og alle kort vises |

> **Nyt begreb: `position: sticky`**
> Menuen bliver stående i toppen af skærmen, mens man scroller i indholdet. På smalle skærme er den slået fra, så menuen står øverst som en almindelig liste.

> **Nyt begreb: `IntersectionObserver`**
> En indbygget funktion i browseren, der holder øje med, hvilket afsnit der er synligt. `playbook.js` bruger den til at markere afsnittet i menuen med rød streg.

> **Nyt begreb: `@media print`**
> Regler, der kun gælder, når siden udskrives eller gemmes som PDF. Så kan samme side både være et klikbart værktøj og en pæn PDF til afleveringen.

## Søvnguiden (guide.html) – 20/11

Søvnguiden er bygget som rigtig HTML efter Marcus' Figma-sider **"Søvnguide - Desktop/bog"** og **"Søvnguide - Mobil"**. Al tekst er tekst – ikke billeder – så den kan læses af skærmlæsere og findes med Ctrl+F.

**Tre visninger af samme HTML.** `guide.js` sætter en klasse på `<body>`:

| Klasse | Hvad man ser | Hvornår |
|---|---|---|
| `guide--start` | Den lukkede bog med knapperne "Åbn bogen" og "Læs som tekst" | Computer, når siden åbnes |
| `guide--bog` | Bladremagasinet (Figma: Desktop/bog) | Når man klikker "Åbn bogen" |
| `guide--laes` | Én lang side (Figma: Mobil) | Altid på telefon (under 760 px) |

**"Læs som tekst"** åbner et tekstpanel med hele guiden som ren tekst, ligesom i Marcus' bladrebog: én overskrift pr. side og billederne beskrevet med deres alt-tekst. Teksten hentes fra bogens sider af `guide.js` (funktionen `bygTekst`), så den altid passer med bogen – ret derfor teksten i bogens sider. Åbnes panelet fra bogen, hopper det til den side, man er nået til. "Tilbage" eller Esc lukker panelet.

Indhold, der kun hører til én visning, har klassen `kun-bog` (fx bagsiden) eller `kun-laes` (fx "Hent guiden som pdf" og fotoet nederst på Velkommen).

**Sådan er bogen bygget:** Bogen har 13 blade (`<div class="blad">`). Hvert blad har to sider: forsiden og bagsiden af bladet. Blad 1 = side 1 + 2, blad 2 = side 3 + 4 osv. Når man bladrer, vender `guide.js` bladet 180 grader om ryggen.

| Jeg vil … | Gå ind i |
|---|---|
| Rette en tekst på en side | `guide.html` – find siden med `id="side-07"` (sidetallet) |
| Skifte et billede | `guide.html` – ret `src` i `<img>` og læg billedet i `img/guide/` |
| Rette bogens design | `scss/_guide-dele.scss`, afsnit 1–6. Søvnguidens egne farver står øverst (`$g-linned` osv.) |
| Rette mobilvisningen | `scss/_guide-dele.scss`, afsnit 7 (alt under `.guide--laes`) |
| Rette tekstpanelets udseende | `scss/_guide-dele.scss`, afsnit 8 (`.tekstpanel` og `.tekst`) |
| Rette hvordan der bladres eller skiftes visning | `js/guide.js` |
| Skifte pdf'en | Læg den nye fil i `pdf/` med navnet `soevnguiden.pdf` |
| Linke direkte til en side | Skriv `guide.html#side-08` – så åbner bogen på side 8 |

**Sådan bladrer man:** pileknapperne, piletasterne (← →), Home/End, klik i højre eller venstre side af bogen eller swipe. Esc lukker bogen. Linkene i indholdsfortegnelsen (side 3) bladrer hen til kapitlet.

**Mormor i dag flytter sig:** I bogen står "Mormor i dag" nederst på den mørke kapitelside. I mobildesignet står den nederst på papirsiden. `guide.js` flytter boksen, når man skifter visning (funktionen `flytMormor`), så teksten kun står ét sted i HTML'en.

> **Nyt begreb: `zoom` i stedet for `transform: scale()`**
> Bogen er 1123 × 794 px og skal gøres større eller mindre, så den passer til skærmen. `transform: scale()` tager et billede af teksten og strækker det – så bliver teksten sløret. `zoom` tegner siden igen i den nye størrelse, så teksten bliver skarp. Bogen placeres også i hele pixels af samme grund.

> **Nyt begreb: `transform: rotateY()` og `backface-visibility`**
> Et blad vendes ved at dreje det 180 grader om sin venstre kant (`transform-origin: left center`). Bagsiden af bladet er drejet 180 grader på forhånd, og `backface-visibility: hidden` skjuler den side, der vender væk. Så ser man forsiden før vendingen og bagsiden efter – ligesom et rigtigt blad papir.

> **Nyt begreb: `inert`**
> Sider, man ikke kan se i bogen, får attributten `inert`. Så kan man ikke tabbe ind i dem, og skærmlæsere springer dem over.

**Bemærk:**
- `$linned` i `_tokens.scss` er stadig quizzens gamle farve (#F4EDE0). Søvnguiden bruger den nye farve fra 19/11 (#E7D8BE) via `$g-linned`. Det rettes, når designet opdateres samlet.
- Skrifterne (Lato og EB Garamond) hentes stadig fra Google Fonts. De lægges lokalt, når designet opdateres samlet.
- `pdf/soevnguiden.pdf` er Marcus' `Soevnguiden_bog.pdf` fra 19/11 (9 MB).

## Prototype – det mangler før lancering

- **Tilmeldingen sender ikke noget.** Den skal forbindes til et nyhedsbrevssystem (fx Mailchimp), som også sender søvnguiden ud. Se funktionen `tilmeld()` i `quiz.js`.
- **Link til privatlivspolitik** under samtykket, når Ringsted Duns side er klar.
- **Skrifttyper:** Lato og EB Garamond hentes i dag fra Google Fonts. På en rigtig side bør de ligge lokalt i mappen (GDPR).
- **Målepunkter** (start, gennemført, tilmelding, frafald pr. spørgsmål) kræver et analyseværktøj, fx Meta Pixel og Google Analytics.

## Testet

20/11 (eftermiddag): Søvnguiden i Chromium på computer (1440 px) og mobil (390 px) – forside med valg, bladring, tekstpanelet fra forsiden og fra bogen (hopper til den rigtige side, Esc lukker), luk-knap, piletaster, direkte link (#side-05) og mobilvisningen side for side mod Figma.

18/11: AI Playbook-skelettet i Chromium på computer og mobil – kopiér-knapper, filter, tjekliste, aktiv menu og print-udgave.


16/11: hele quizzen igennem i Chromium på mobil (390 px) og computer (1280 px). Rigtige og forkerte svar, fejl i formularen, tilmelding, "Se mine svar igen" og fokus ved skærmskift er tjekket.
