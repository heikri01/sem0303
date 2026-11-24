# Karakterark · Mormor Grethe (AI-karakter)

*16/11 · Heidi + Claude · til Marcus og jeres Claude*
*Status: **FORSLAG – afventer Marcus' ja.** Afviger fra billedreglen "ingen ansigter i fokus" (se `soevnguide_billedprompts_dengang.md`). Se afsnit 7.*

Brug dette ark **hver gang** Grethe skal genereres, i billede, video eller stemme. Formålet er, at hun er den samme person i guiden, i den lange video, i klippene og i opslagene. Arket er samtidig et konkret eksempel til AI Playbooken på, hvordan Ringsted Dun bruger AI uden at gå på kompromis med kvaliteten.

---

## 1. Hvem hun er
- **Navn:** Grethe. Børnebørnene kalder hende Mormor.
- **Født:** 1947 i Danmark, ligesom Ringsted Dun.
- **Gift med:** Henning, som børnebørnene kalder Morfar.
- **Fiktiv:** Hun findes ikke, og det siger vi højt (se afsnit 6).
- **Rolle:** fortæller. Hun husker, hvordan det var dengang, og ser med et glimt i øjet på, hvordan det er i dag. Hun er ikke ekspert. Rådene kommer fra kilderne.

## 2. Udseende (fast prompt-blok)
Sæt denne blok foran **alle** prompts, hvor Grethe er med:

```
Grethe, en dansk kvinde på 79 år. Kort, blødt sølvgråt hår med en naturlig bølge, lysegrå-blå øjne, fine smilerynker og et lunt, lidt drillende smil. Slank, rank holdning. Bærer en strikket cardigan i havregrå eller mosgrøn over en lys bluse. Tynd guldvielsesring og små perleøreringe, ellers intet smykke. Læsebriller i en snor om halsen. Naturligt lys, rolige farver, realistisk fotografi, ingen filtre, ingen tekst, ingen logoer.
```

**Altid:**
- Samme hår, samme cardigan (to farver i alt), samme ring og øreringe.
- Hun er rask og aktiv, ikke skrøbelig.
- Hun befinder sig i de samme rum som i dag-billederne i `img/guide/` (filerne `idag-…`), så video og guide hænger sammen.

**Aldrig:**
- Hospitals- eller plejemiljø, stok eller rollator.
- Moderne fitness- eller wellness-look.
- Produktnavne eller emballage i billedet.

## 3. Dengang og i dag
- **I dag:** Grethe vises med ansigt. Hun er den synlige fortæller.
- **Dengang:** Billederne forbliver erindringer uden ansigter i fokus, ligesom dengang-billederne i guiden. Erindringerne skal ikke ligne et "rigtigt" arkivfoto af en bestemt person.
- **Henning/Morfar:** ses kun delvist (ryggen, en hånd, i baggrunden) eller nævnes. Det fastholder individfokus.

## 4. Stemme (AI-stemme)
**Beskrivelse til stemmeværktøjet:**

```
Dansk kvinde, ca. 80 år. Varm, rolig og lidt hæs stemme. Rigsdansk med en blød sjællandsk klang, ingen stærk dialekt. Langsomt, tydeligt tempo. Man kan høre smilet, og hun holder en lille pause før pointen. Ikke skrøbelig og ikke sød-sukret.
```

- Lav stemmen **én gang**, og gem den med navn (fx "Grethe – Ringsted Dun"). Brug samme stemme og samme indstillinger i alle optagelser.
- Ca. 120–130 ord i minuttet. Den lange video på maks. 3 minutter er altså højst ca. 330 ord.
- Lyt altid hele optagelsen igennem. Ret udtalen af danske ord og stednavne, før den bruges.

## 5. Sådan taler hun
- **Jeg-form og korte sætninger.** Konkrete ting som gardiner, radioen, strikketøjet og kaffekanden.
- **Humoren** kommer fra hverdagen og fra Morfar. Den er aldrig på nogens bekostning.
- **Hendes replikker** står i guiden (`docs/soevnguide_tekst.md`). Nye replikker skal godkendes af jer begge.
- **Fakta:** Grethe kan sige "I dag ved man, at …", men kun med formuleringer fra v6 og kilderne. Hun giver aldrig selv sundhedsråd og lover aldrig bedre søvn.
- **Undgå disse ord:** ældre, seniorer, powernap, "sover varmt/koldt" og laboratorium/Sleep Lab (samme liste som guiden).

## 6. Mærkning: AI skal kunne ses
| Hvor | Tekst |
|---|---|
| Start eller slutkort i videoen | "Mormor Grethe er en fiktiv person. Hendes billede og stemme er skabt med AI." |
| Under billeder i guiden og i karruseller | "AI-genereret billede" (som nu) |
| YouTube | Markér videoen som ændret/syntetisk indhold ved upload |
| Facebook/Instagram | Brug Metas AI-mærkning ("AI-info") |
| Videobeskrivelse | Kort note om, at Grethe er fiktiv, og at rådene bygger på Sundhedsstyrelsen, sundhed.dk, Ældre Sagen og søvnforsker Birgitte Kornum |

Mærkningen er både et etisk valg (kampagnen bygger på oprigtighed) og et krav: EU's AI-forordning stiller krav om at mærke kunstigt skabte personer og stemmer.

## 7. Arbejdsgang, så hun forbliver den samme
1. **Masterbillede:** Generér ét referenceportræt (forfra, halvprofil og profil) ud fra afsnit 2. Vælg det bedste sammen, og gem det som `img/guide/grethe_master.png`.
2. **Brug altid masterbilledet som reference**, når der laves nye billeder eller videoklip, sammen med prompt-blokken.
3. **Video:** Lav korte klip (3–5 sek.) ud fra stillbilleder med rolige bevægelser, fx hun drikker kaffe eller kigger ud ad vinduet, med stemmen lagt ovenpå. Undgå lange klip, hvor hun taler direkte i kameraet med læbesynk. De ser hurtigt kunstige ud, især på ældre ansigter.
4. **Kvalitetstjek pr. klip:** Er det samme ansigt, hår og tøj? Hænder og fingre i orden? Ingen tekst eller fejl i baggrunden? Ligner rummet i dag-billedet? Kassér hellere end at bruge et klip, der næsten passer.
5. **Notér** værktøj, prompt og antal forsøg i AI-loggen på FigJam.

## 8. Anbefaling til Ringsted Dun (til AI Playbooken)
AI-Grethe gør det muligt at lave en gennemført fortæller hurtigt og billigt og at teste, om formatet virker, før man investerer mere.

Ringsted Dun kan med fordel overveje at bruge et rigtigt menneske, fx en skuespiller, en mangeårig kunde eller en medarbejders mor eller mormor. Det kræver mere: casting, optagedage, aftaler om rettigheder og brug, og formentlig større omkostninger. Til gengæld får brandet ægte autenticitet, og den passer godt til tone of voice (oprigtighed) og til historien om 75 års håndværk.

**Forslag:** Brug AI-Grethe i kampagnen som test. Viser målingerne, at fortælleren virker, kan Ringsted Dun lave de faste videoer med et rigtigt menneske.
