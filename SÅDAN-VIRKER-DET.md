# Sådan virker det · webmappen til afleveringen

*Opdateret 18/11 (Heidi + Claude). Opdatér filen, når noget flyttes, tilføjes eller fjernes.*

## Overblik

```
web/
├── quiz.html            Quizzen "Myte eller sandhed?" (selve siden)
├── playbook.html        AI Playbook som opslagsværk (SKELET – indhold kommer)
├── index.html           Tom – landingssiden kommer her
├── guide.html           Tom – søvnguiden kommer her
├── scss/                Designet. Her retter du farver, skrift og layout
│   ├── quiz.scss        Hovedfil til quizzen
│   ├── playbook.scss    Hovedfil til AI Playbook
│   ├── _tokens.scss     Farver (palet C), skrift og mål
│   ├── _mixins.scss     Genbrugte stykker: spærret skrift og fokusramme
│   ├── _base.scss       Siden, overskrifter, sidehoved og sidefod
│   ├── _knapper.scss    Alle knapper
│   ├── _quiz-dele.scss  Quizzens dele: citater, billede, svar, resultat
│   └── _playbook-dele.scss  Playbookens dele: menu, kort, prompts, tjekliste, print
├── css/
│   ├── quiz.css         Lavet automatisk ud fra scss/quiz.scss. Ret IKKE her
│   └── playbook.css     Lavet automatisk ud fra scss/playbook.scss. Ret IKKE her
├── js/
│   ├── spoergsmaal.js   Teksterne: udsagn, svar, fakta, Grethes replikker, resultater
│   ├── quiz.js          Quizzens logik: hvad der sker, når man klikker
│   └── playbook.js      Kopiér-knapper, filter, tjekliste og aktiv menu
├── img/dengang/         De seks dengang-billeder (kopieret fra søvnguiden)
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

## Prototype – det mangler før lancering

- **Tilmeldingen sender ikke noget.** Den skal forbindes til et nyhedsbrevssystem (fx Mailchimp), som også sender søvnguiden ud. Se funktionen `tilmeld()` i `quiz.js`.
- **Link til privatlivspolitik** under samtykket, når Ringsted Duns side er klar.
- **Skrifttyper:** Lato og EB Garamond hentes i dag fra Google Fonts. På en rigtig side bør de ligge lokalt i mappen (GDPR).
- **Målepunkter** (start, gennemført, tilmelding, frafald pr. spørgsmål) kræver et analyseværktøj, fx Meta Pixel og Google Analytics.

## Testet

18/11: AI Playbook-skelettet i Chromium på computer og mobil – kopiér-knapper, filter, tjekliste, aktiv menu og print-udgave.


16/11: hele quizzen igennem i Chromium på mobil (390 px) og computer (1280 px). Rigtige og forkerte svar, fejl i formularen, tilmelding, "Se mine svar igen" og fokus ved skærmskift er tjekket.
