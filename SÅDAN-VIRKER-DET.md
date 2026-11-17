# Sådan virker det · webmappen til afleveringen

*Opdateret 16/11 (Heidi + Claude). Opdatér filen, når noget flyttes, tilføjes eller fjernes.*

## Overblik

```
web/
├── quiz.html            Quizzen "Myte eller sandhed?" (selve siden)
├── index.html           Tom – landingssiden kommer her
├── guide.html           Tom – søvnguiden kommer her
├── scss/                Designet. Her retter du farver, skrift og layout
│   ├── quiz.scss        Hovedfilen, som samler alle partials
│   ├── _tokens.scss     Farver (palet C), skrift og mål
│   ├── _mixins.scss     Genbrugte stykker: spærret skrift og fokusramme
│   ├── _base.scss       Siden, overskrifter, sidehoved og sidefod
│   ├── _knapper.scss    Alle knapper
│   └── _quiz.scss       Quizzens dele: citater, billede, svar, resultat
├── css/
│   └── quiz.css         Lavet automatisk ud fra scss/quiz.scss. Ret IKKE her
├── js/
│   ├── spoergsmaal.js   Teksterne: udsagn, svar, fakta, Grethes replikker, resultater
│   └── quiz.js          Logikken: hvad der sker, når man klikker
├── img/dengang/         De seks dengang-billeder (kopieret fra søvnguiden)
└── .vscode/settings.json  Fortæller Live Sass Compiler, at CSS'en skal i css/
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
| Citatboksen, billedet, svarfeltet eller formularen | `scss/_quiz.scss` |
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
- Klik på **Watch Sass** nederst i VS Code. Hver gang du gemmer en `.scss`-fil, laves `css/quiz.css` på ny.
- Ret aldrig direkte i `css/quiz.css`. Ændringen forsvinder næste gang, der kompileres.

> **Nyt begreb: partials og `@use`**
> Filer, der starter med `_` (fx `_knapper.scss`), er *partials*: små dele, som ikke bliver til deres egen CSS-fil. `quiz.scss` samler dem med `@use 'knapper';`. Hver partial, der skal bruge farverne, skriver selv `@use 'tokens' as *;` øverst. `as *` betyder, at man kan skrive `$roed` i stedet for `tokens.$roed`.

> **Nyt begreb: BEM-navne**
> Klasserne følger et mønster: `.knap` er blokken, `.knap--primaer` er en variant (to bindestreger), og `.fremdrift__bar` er en del af blokken (to understreger). I SCSS skrives de med `&`, fx `&--primaer` inde i `.knap`. Så står alt om én blok samlet ét sted.

> **Nyt begreb: mixin**
> En mixin er et genbrugeligt stykke CSS. `@include spaerret(0.875rem);` giver store, spærrede bogstaver i den størrelse, man skriver i parentesen.

> **Nyt begreb: `aria-live`**
> Et område med `aria-live="polite"` bliver læst højt af skærmlæsere, når indholdet ændrer sig. Det bruges til svaret og til fejlbeskeder, så blinde og svagtseende også får besked.

> **Nyt begreb: `data-valg`**
> `data-`-attributter gemmer små oplysninger på et HTML-element. Knapperne har `data-valg="myte"` og `data-valg="sandhed"`, og JavaScript læser dem med `knap.dataset.valg`.

## Prototype – det mangler før lancering

- **Tilmeldingen sender ikke noget.** Den skal forbindes til et nyhedsbrevssystem (fx Mailchimp), som også sender søvnguiden ud. Se funktionen `tilmeld()` i `quiz.js`.
- **Link til privatlivspolitik** under samtykket, når Ringsted Duns side er klar.
- **Skrifttyper:** Lato og EB Garamond hentes i dag fra Google Fonts. På en rigtig side bør de ligge lokalt i mappen (GDPR).
- **Målepunkter** (start, gennemført, tilmelding, frafald pr. spørgsmål) kræver et analyseværktøj, fx Meta Pixel og Google Analytics.

## Testet

16/11: hele quizzen igennem i Chromium på mobil (390 px) og computer (1280 px). Rigtige og forkerte svar, fejl i formularen, tilmelding, "Se mine svar igen" og fokus ved skærmskift er tjekket.
