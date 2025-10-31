# Simulatore Conto Termico 3.0

Questo progetto implementa un simulatore web per il calcolo degli incentivi del Conto Termico 3.0.

## Funzionalità implementate

### Interventi supportati
- **Efficienza Energetica (Art. 5)**: Isolamento termico, infissi, schermature solari, NZEB, illuminazione LED, building automation, infrastrutture ricarica, fotovoltaico con accumulo
- **Fonti Rinnovabili (Art. 8)**: Pompe di calore, sistemi ibridi, biomassa, solare termico, scaldacqua a pompa di calore, teleriscaldamento, microcogenerazione

### Formule di calcolo
Il simulatore implementa le formule previste dalla normativa:

1. **Isolamento/Infissi/Schermature**: `incentivo = min(superficie × costo_specifico × percentuale_incentivata, tetto_massimo)`
2. **Pompe di calore**: `incentivo = energia_incentivata_annua × coefficiente_valorizzazione` con fattori di zona climatica
3. **Solare termico**: `incentivo = superficie × energia_annua_per_superficie × coefficiente_valorizzazione`
4. **Biomassa**: Con coefficienti per classe emissioni e zona climatica
5. **Altri interventi**: Percentuale su spesa ammissibile con tetti massimi specifici

**Applicazione maggiorazioni**: Le maggiorazioni (multi-intervento, prodotti UE, PMI, biomassa 5 stelle) vengono applicate sull'incentivo base calcolato, aumentandolo della percentuale prevista. La maggiorazione prodotti UE del +10% si applica agli interventi di efficienza energetica (Art. 5) quando i componenti sono prodotti nell'UE. La maggiorazione multi-intervento porta l'incentivo dal 25% al 30% dei costi ammissibili e si applica SOLO agli interventi 1.A (isolamento) e 1.B (infissi) del Titolo II quando vengono combinati con almeno un intervento del Titolo III tra 2.A (pompe di calore), 2.B (sistemi ibridi), 2.C (biomassa), o 2.E (scaldacqua a PdC). Riferimento normativo: paragrafo 607 delle Regole Applicative CT 3.0.

### Maggiorazioni supportate
- **Multi-intervento: dal 25% al 30%** (per interventi Titolo II - solo 1.A e 1.B - quando combinati con Titolo III - 2.A, 2.B, 2.C, 2.E)
- **Prodotti UE: +10%** (componenti prodotti nell'Unione Europea - Art. 5, richiede attestazione ufficiale)
- Piccole e medie imprese: +15% (solo per soggetti privati terziario)
- Diagnosi energetica: €1000 fissi (richiede diagnosi certificata e APE)
- Biomassa 5 stelle: +20% (generatori con classe emissioni 5 stelle)

### Soggetti beneficiari
- Pubbliche Amministrazioni ed ETS non commerciali (fino al 100%)
- Soggetti Privati - Ambito Terziario (25-45%)
- Soggetti Privati - Ambito Residenziale (fino al 65%)

## Come usare il simulatore

1. Apri `src/index.html` nel browser
2. Seleziona il tipo di soggetto richiedente
3. Scegli gli interventi da realizzare
4. Inserisci i parametri tecnici richiesti
5. Seleziona le eventuali premialità applicabili
6. Clicca su "Calcola Incentivo"

## Struttura del progetto

- `src/index.html`: Interfaccia utente
- `src/style.css`: Stili ispirati al sito GSE.it
- `src/data.js`: Dati degli interventi e formule di calcolo
- `src/script.js`: Logica dell'applicazione

## Note tecniche

- I calcoli sono basati sulle regole del Conto Termico 3.0
- Le zone climatiche influenzano i coefficienti di calcolo (A-F)
- I costi specifici sono confrontati con i massimali ammissibili
- Le percentuali variano in base al tipo di soggetto beneficiario
