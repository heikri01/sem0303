/* ==========================================================
   SPØRGSMÅL OG TEKSTER TIL QUIZZEN "MYTE ELLER SANDHED?"

   Her retter I tekster, svar og billeder.
   Logikken (hvad der sker, når man klikker) ligger i quiz.js.

   Hvert spørgsmål har de samme felter:
   - udsagn:  det, man sagde dengang
   - svar:    "sandhed" eller "myte" (skal staves præcis sådan)
   - fakta:   forklaringen i dag. Kun fakta fra søvnguidens faktatjek (v6, 13/11)
   - grethe:  Grethes kommentar
   - kilde:   vises med lille skrift under svaret
   - billede: filnavn i img/dengang/
   - alt:     beskrivelse af billedet til skærmlæsere
   - kapitel: kapitlet i søvnguiden, som spørgsmålet peger hen til
   ========================================================== */

const SPOERGSMAAL = [
  {
    udsagn: 'Lys ind, så vågner man.',
    svar: 'sandhed',
    fakta: 'Lys om morgenen hjælper kroppens døgnrytme på vej, så du lettere bliver træt om aftenen.',
    grethe: 'Far trak gardinerne fra, før vi andre var vågne. Nu ved jeg, hvorfor.',
    kilde: 'Ældre Sagen',
    billede: 'dengang_0700.jpg',
    alt: 'Gardinerne trækkes fra i et soveværelse, og morgenlyset falder ind over en redt seng.',
    kapitel: '07.00 Morgen'
  },
  {
    udsagn: 'En lille en til natten giver en god søvn.',
    svar: 'myte',
    fakta: 'Alkohol kan gøre det lettere at falde i søvn, men søvnen bliver ofte mere urolig og afbrudt.',
    grethe: 'Morfar holdt meget af sin lille likør. Nu får han en kop te. Han siger, det smager af ingenting.',
    kilde: 'sundhed.dk',
    billede: 'dengang_1400.jpg',
    alt: 'To mennesker på cykel ad en landevej om sommeren, set bagfra.',
    kapitel: '14.00 Eftermiddag'
  },
  {
    udsagn: 'Det er helt fint at falde i søvn foran fjernsynet.',
    svar: 'myte',
    fakta: 'Kraftigt lys og skærme om aftenen forsinker døgnrytmen. Læg gerne skærmene væk et par timer før sengetid, og undgå at falde i søvn foran fjernsynet.',
    grethe: 'Dengang var det radioen. Den slukkede vi, og så gik vi i seng.',
    kilde: 'sundhed.dk og Ældre Sagen',
    billede: 'dengang_2000.jpg',
    alt: 'En stue om aftenen med radio, bordlampe og strikketøj i lænestolen.',
    kapitel: '20.00 Aften'
  },
  {
    udsagn: 'Jo koldere soveværelset er, jo bedre sover man.',
    svar: 'myte',
    fakta: 'De fleste sover bedst ved 18–21 grader. Køligt, mørkt og stille er godt, men iskoldt er ikke bedre.',
    grethe: 'Der var rimfrost på indersiden af ruden. Vi sov godt, men det var dynen, der gjorde det.',
    kilde: 'sundhed.dk',
    billede: 'dengang_vinter_foraar.jpg',
    alt: 'Rimfrost på indersiden af en gammel vinduesrude.',
    kapitel: '22.30 Sengetid'
  },
  {
    udsagn: 'Man skal ikke ligge og tælle timer.',
    svar: 'sandhed',
    fakta: 'Det er normalt at vågne om natten, og det sker oftere med alderen. Det vigtigste er, at du samlet får nok søvn. Kan du ikke sove efter en halv times tid, så stå op, gør noget roligt, og gå i seng igen, når du bliver søvnig.',
    grethe: 'Mor stod op og satte kaffe over. Jeg tænder for radioen.',
    kilde: 'sundhed.dk og søvnforsker Birgitte Kornum',
    billede: 'dengang_0430.jpg',
    alt: 'Et køkken i den tidlige morgen med kaffekande og radio på bordet.',
    kapitel: '04.30 Natten'
  },
  {
    udsagn: 'Dynerne skal vaskes, så miderne ikke flytter ind.',
    svar: 'sandhed',
    fakta: 'Som hovedregel kan dyne og pude vaskes ved 60 grader med enzymfrit vaskepulver, og det dræber husstøvmider. Tør dem grundigt i mindst 4 timer. Følg altid vaskeanvisningen.',
    grethe: 'Når bladene faldt, var det tid til den store vask. Det er det stadig.',
    kilde: 'Ringsted Duns plejevejledning',
    billede: 'dengang_sommer_efteraar.jpg',
    alt: 'Hvide dyner hængt til luftning over et stakit ved et sommerhus.',
    kapitel: 'Sommer og efterår'
  }
];

/* Resultatteksterne. "fra" er det mindste antal rigtige, der giver teksten.
   Listen gennemgås oppefra, så den højeste grænse skal stå først */
const RESULTATER = [
  {
    fra: 5,
    overskrift: 'Du kender søvnen som din egen bukselomme',
    grethe: 'Du kunne have skrevet guiden selv. Men måske er der alligevel et kapitel, du ikke har læst.'
  },
  {
    fra: 3,
    overskrift: 'Du har godt styr på det meste',
    grethe: 'Lidt af det gamle holder, og lidt af det gør ikke. Sådan har jeg det også.'
  },
  {
    fra: 0,
    overskrift: 'Der er noget at gå på opdagelse i',
    grethe: 'Morfar fik to rigtige. Han siger, quizzen var for svær.'
  }
];
