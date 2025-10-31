# Simulatore Conto Termico 3.0

Calcolatore web per gli incentivi del Conto Termico 3.0 secondo la normativa italiana.

## Avvio rapido

1. Apri il file `src/index.html` nel browser
2. Oppure usa l'estensione "Live Server" di VS Code: click destro su `index.html` → "Open with Live Server"

## Descrizione

Il simulatore permette di calcolare l'incentivo stimato per gli interventi di:
- **Efficienza Energetica** (Art. 5): isolamento, infissi, schermature, LED, building automation, ricarica elettrica, fotovoltaico
- **Fonti Rinnovabili** (Art. 8): pompe di calore, sistemi ibridi, biomassa, solare termico, teleriscaldamento, microcogenerazione

## Caratteristiche

✅ Formule di calcolo conformi alla normativa  
✅ Supporto per 3 categorie di beneficiari (PA, Imprese, Privati residenziali)  
✅ Zone climatiche A-F con coefficienti differenziati  
✅ Maggiorazioni e premialità (multi-intervento, PMI, prodotti UE, ecc.)  
✅ Verifiche automatiche su tetti massimi e spese ammissibili  
✅ Interfaccia moderna ispirata al sito GSE.it  

## Come usare

1. **Seleziona il tipo di soggetto** richiedente dal menu a tendina
2. **Scegli uno o più interventi** da realizzare
3. **Compila i parametri tecnici** (superfici, potenze, zone climatiche, ecc.)
4. **Seleziona le premialità** applicabili
5. **Calcola** per vedere l'incentivo stimato con il dettaglio del calcolo

## Struttura file

```
src/
├── index.html      # Interfaccia utente
├── style.css       # Stili GSE.it
├── data.js         # Dati interventi e formule
└── script.js       # Logica applicazione
```

## Note legali

⚠️ Questo è uno strumento di simulazione. I valori calcolati sono indicativi.  
Per importi ufficiali consultare sempre il GSE e la normativa vigente.

## Tecnologie

- HTML5 / CSS3 / JavaScript (vanilla)
- Nessuna dipendenza esterna
