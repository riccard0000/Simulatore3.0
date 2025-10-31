// Questo file contiene i dati di configurazione per il calcolatore.
// Modificando questo file è possibile aggiornare le opzioni, i parametri
// e le logiche di calcolo senza toccare il codice principale.

const calculatorData = {
    // STEP 1: Soggetti Ammessi (chi ha disponibilità dell'immobile)
    subjectTypes: [
        {
            id: 'pa',
            name: 'Pubblica Amministrazione',
            description: 'PA ex D.Lgs 165/2001, enti pubblici, società in house, ex IACP, concessionari'
        },
        {
            id: 'ets_non_economic',
            name: 'ETS non economico',
            description: 'Enti del Terzo Settore iscritti al RUNTS che NON svolgono attività economica'
        },
        {
            id: 'person',
            name: 'Persona fisica o condominio',
            description: 'Soggetti privati non imprese'
        },
        {
            id: 'sme',
            name: 'Piccola o Media Impresa (PMI)',
            description: 'Micro, piccole e medie imprese regolarmente iscritte al registro imprese'
        },
        {
            id: 'large_company',
            name: 'Grande Impresa',
            description: 'Grandi imprese regolarmente iscritte al registro imprese'
        },
        {
            id: 'ets_economic',
            name: 'ETS economico',
            description: 'Enti del Terzo Settore iscritti al RUNTS che svolgono attività economica'
        }
    ],

    // STEP 2: Categorie catastali immobile
    buildingCategories: [
        {
            id: 'residential',
            name: 'Residenziale',
            description: 'Gruppo A (escluso A/8, A/9, A/10)',
            allowedSubjects: ['pa', 'ets_non_economic', 'person', 'sme', 'large_company', 'ets_economic'],
            note: 'PA/ETS: Titolo II solo su edifici di proprietà pubblica (es. ex IACP/ATER)'
        },
        {
            id: 'tertiary',
            name: 'Terziario',
            description: 'A/10, Gruppo B, C, D, E',
            allowedSubjects: ['pa', 'ets_non_economic', 'person', 'sme', 'large_company', 'ets_economic'],
            subcategories: [
                {
                    id: 'tertiary_generic',
                    name: 'Terziario generico',
                    description: 'Uffici, negozi, attività commerciali',
                    allowedSubjects: ['pa', 'ets_non_economic', 'person', 'sme', 'large_company', 'ets_economic'],
                    art48ter: false
                },
                {
                    id: 'tertiary_school',
                    name: 'Scuola',
                    description: 'Edificio pubblico adibito a uso scolastico (non università)',
                    allowedSubjects: ['pa', 'ets_non_economic'],
                    art48ter: true,
                    note: 'Art. 48-ter: incentivo al 100% della spesa ammissibile'
                },
                {
                    id: 'tertiary_hospital',
                    name: 'Ospedale/Struttura sanitaria pubblica',
                    description: 'Strutture ospedaliere e sanitarie pubbliche del SSN (incluse residenziali, assistenza, cura, ricovero)',
                    allowedSubjects: ['pa', 'ets_non_economic'],
                    art48ter: true,
                    note: 'Art. 48-ter: incentivo al 100% della spesa ammissibile'
                },
                {
                    id: 'tertiary_prison',
                    name: 'Carcere',
                    description: 'Istituto penitenziario',
                    allowedSubjects: ['pa'],
                    art48ter: true,
                    note: 'Art. 48-ter: incentivo al 100% della spesa ammissibile'
                }
            ]
        }
    ],

    // STEP 3 (opzionale): Modalità di realizzazione
    implementationModes: [
        {
            id: 'direct',
            name: 'Intervento diretto',
            description: 'Il soggetto ammesso realizza direttamente l\'intervento e ne sostiene le spese.',
            allowedSubjects: ['pa', 'ets_non_economic', 'person', 'sme', 'large_company', 'ets_economic'] // Tutti
        },
        {
            id: 'esco',
            name: 'Tramite ESCO/Contratto EPC',
            description: 'Energy Service Company che sostiene le spese per conto del soggetto ammesso.',
            allowedSubjects: ['pa', 'ets_non_economic', 'person', 'sme', 'large_company', 'ets_economic'], // Tutti, ma con condizioni
            note: 'Per i privati in ambito RESIDENZIALE, è ammessa solo per interventi Titolo III con P > 70 kW o S > 20 m². Altrimenti, si usa il mandato all\'incasso.'
        },
        {
            id: 'energy_community',
            name: 'Tramite Comunità Energetica',
            description: 'Configurazione di autoconsumo collettivo o comunità energetica rinnovabile (CER).',
            allowedSubjects: ['pa', 'ets_non_economic', 'person', 'sme', 'large_company', 'ets_economic'] // Tutti
        },
        {
            id: 'ppp',
            name: 'Partenariato Pubblico-Privato',
            description: 'Contratto PPP per interventi su immobili pubblici (non per soggetti privati).',
            allowedSubjects: ['pa', 'ets_non_economic'] // Solo PA ed enti assimilati
        }
    ],

    // Matrice di compatibilità: soggetto + categoria → operatorType interno (per calcoli)
    // Questo mantiene la compatibilità con la logica esistente
    operatorMatrix: {
        'pa_tertiary': {
            operatorTypeId: 'pa',
            maxIncentiveRate: 1.0,
            defaultRate: 0.65,
            allowedInterventions: 'all_titolo2_and_3'
        },
        'pa_tertiary_generic': {
            operatorTypeId: 'pa',
            maxIncentiveRate: 1.0,
            defaultRate: 0.65,
            allowedInterventions: 'all_titolo2_and_3',
            art48ter: false
        },
        'pa_tertiary_school': {
            operatorTypeId: 'pa',
            maxIncentiveRate: 1.0,
            defaultRate: 1.0, // 100% per Art. 48-ter
            allowedInterventions: 'all_titolo2_and_3',
            art48ter: true
        },
        'pa_tertiary_hospital': {
            operatorTypeId: 'pa',
            maxIncentiveRate: 1.0,
            defaultRate: 1.0, // 100% per Art. 48-ter
            allowedInterventions: 'all_titolo2_and_3',
            art48ter: true
        },
        'pa_tertiary_prison': {
            operatorTypeId: 'pa',
            maxIncentiveRate: 1.0,
            defaultRate: 1.0, // 100% per Art. 48-ter
            allowedInterventions: 'all_titolo2_and_3',
            art48ter: true
        },
        'pa_residential': {
            operatorTypeId: 'pa',
            maxIncentiveRate: 1.0,
            defaultRate: 0.65,
            allowedInterventions: 'all_titolo2_and_3',
            requiresPublicOwnership: true, // Titolo II richiede proprietà pubblica (es. ex IACP)
            note: 'Titolo II ammesso solo per edifici di proprietà pubblica (es. ex IACP/ATER su edilizia sociale)'
        },
        'ets_non_economic_tertiary': {
            operatorTypeId: 'pa',
            maxIncentiveRate: 1.0,
            defaultRate: 0.65,
            allowedInterventions: 'all_titolo2_and_3'
        },
        'ets_non_economic_tertiary_generic': {
            operatorTypeId: 'pa',
            maxIncentiveRate: 1.0,
            defaultRate: 0.65,
            allowedInterventions: 'all_titolo2_and_3',
            art48ter: false
        },
        'ets_non_economic_tertiary_school': {
            operatorTypeId: 'pa',
            maxIncentiveRate: 1.0,
            defaultRate: 1.0, // 100% per Art. 48-ter
            allowedInterventions: 'all_titolo2_and_3',
            art48ter: true
        },
        'ets_non_economic_tertiary_hospital': {
            operatorTypeId: 'pa',
            maxIncentiveRate: 1.0,
            defaultRate: 1.0, // 100% per Art. 48-ter
            allowedInterventions: 'all_titolo2_and_3',
            art48ter: true
        },
        'ets_non_economic_residential': {
            operatorTypeId: 'pa',
            maxIncentiveRate: 1.0,
            defaultRate: 0.65,
            allowedInterventions: 'all_titolo2_and_3',
            requiresPublicOwnership: true, // Titolo II richiede proprietà pubblica
            note: 'Titolo II ammesso solo per edifici di proprietà pubblica (equiparati a PA)'
        },
        'person_residential': {
            operatorTypeId: 'private_residential',
            maxIncentiveRate: 0.65,
            allowedInterventions: 'only_titolo3'
        },
        'person_tertiary': {
            operatorTypeId: 'private_tertiary_person',
            maxIncentiveRate: 0.65,
            allowedInterventions: 'all_titolo2_and_3'
        },
        'person_tertiary_generic': {
            operatorTypeId: 'private_tertiary_person',
            maxIncentiveRate: 0.65,
            allowedInterventions: 'all_titolo2_and_3',
            art48ter: false
        },
        'sme_residential': {
            operatorTypeId: 'private_residential',
            maxIncentiveRate: 0.50,
            allowedInterventions: 'only_titolo3'
        },
        'sme_tertiary': {
            operatorTypeId: 'private_tertiary_sme',
            maxIncentiveRate: 0.50,
            allowedInterventions: 'all_titolo2_and_3'
        },
        'sme_tertiary_generic': {
            operatorTypeId: 'private_tertiary_sme',
            maxIncentiveRate: 0.50,
            allowedInterventions: 'all_titolo2_and_3',
            art48ter: false
        },
        'large_company_residential': {
            operatorTypeId: 'private_residential',
            maxIncentiveRate: 0.30,
            allowedInterventions: 'only_titolo3'
        },
        'large_company_tertiary': {
            operatorTypeId: 'private_tertiary_large',
            maxIncentiveRate: 0.30,
            allowedInterventions: 'all_titolo2_and_3'
        },
        'large_company_tertiary_generic': {
            operatorTypeId: 'private_tertiary_large',
            maxIncentiveRate: 0.30,
            allowedInterventions: 'all_titolo2_and_3',
            art48ter: false
        },
        'ets_economic_residential': {
            operatorTypeId: 'private_residential',
            maxIncentiveRate: 0.50,
            allowedInterventions: 'only_titolo3'
        },
        'ets_economic_tertiary': {
            operatorTypeId: 'private_tertiary_sme',
            maxIncentiveRate: 0.50,
            allowedInterventions: 'all_titolo2_and_3'
        },
        'ets_economic_tertiary_generic': {
            operatorTypeId: 'private_tertiary_sme',
            maxIncentiveRate: 0.50,
            allowedInterventions: 'all_titolo2_and_3',
            art48ter: false
        }
    },

    // Campi aggiuntivi specifici per soggetto e modalità di realizzazione
    // NOTA: La maggiorazione per comuni sotto 15.000 abitanti si applica SOLO quando:
    // 1. Il soggetto è un Comune (non altra PA)
    // 2. Modalità di realizzazione: Intervento Diretto
    // 3. L'edificio è di proprietà E utilizzato dal Comune
    // Riferimento: Regole Applicative CT 3.0, paragrafo 586
    subjectSpecificFields: {
        // Questi campi non sono più utilizzati qui, spostati in implementationModeFields
    },

    // Campi specifici che compaiono dopo la selezione della modalità di realizzazione
    implementationModeFields: {
        // Solo per PA + Intervento Diretto
        pa_direct: [
            {
                id: 'is_comune',
                name: 'Il soggetto richiedente è un Comune?',
                type: 'checkbox',
                help: 'Seleziona se sei un Comune (non altra PA come Regione, Provincia, ASL, Università, etc.)',
                optional: false,
                affects_incentive: false,
                shows: ['is_edificio_comunale'] // Mostra il campo successivo solo se checked
            },
            {
                id: 'is_edificio_comunale',
                name: 'L\'edificio è di proprietà del Comune ed è utilizzato dallo stesso Comune?',
                type: 'checkbox',
                help: 'Entrambe le condizioni devono essere vere: proprietà comunale E utilizzo da parte del Comune',
                optional: true,
                affects_incentive: false,
                visible_if: { field: 'is_comune', value: true },
                shows: ['is_piccolo_comune']
            },
            {
                id: 'is_piccolo_comune',
                name: 'Il Comune ha popolazione inferiore a 15.000 abitanti?',
                type: 'checkbox',
                help: 'Se SÌ, si applica automaticamente l\'incentivo al 100% della spesa ammissibile. Dovrai attestare questa condizione in fase di richiesta al GSE.',
                optional: true,
                affects_incentive: true,
                visible_if: { field: 'is_edificio_comunale', value: true }
            }
        ]
    },

    // Note normative importanti per l'applicazione corretta del decreto
    regulatoryNotes: {
        pa_residential_titolo2: {
            title: 'PA/ETS su edifici residenziali - Interventi Titolo II',
            text: 'Gli interventi di efficienza energetica (Titolo II) su edifici residenziali sono ammessi per PA e ETS non economici SOLO quando l\'edificio è di proprietà pubblica. Esempio: ex IACP/ATER su edilizia sociale. Riferimento: Paragrafo 12.10.4 delle Regole Applicative.',
            severity: 'warning',
            applies_to: ['pa_residential', 'ets_non_economic_residential']
        },
        private_residential_restrictions: {
            title: 'Soggetti Privati su edifici residenziali',
            text: 'I soggetti privati (persone fisiche, condomini, imprese, ETS economici) su edifici residenziali possono accedere SOLO agli interventi del Titolo III (fonti rinnovabili). Gli interventi del Titolo II (efficienza energetica) sono esclusi. Riferimento: Tabella ammissibilità, righe 335-385 Regole Applicative.',
            severity: 'info',
            applies_to: ['person_residential', 'sme_residential', 'large_company_residential', 'ets_economic_residential']
        },
        public_buildings_special: {
            title: 'Edifici pubblici speciali (scuole, ospedali)',
            text: 'Per interventi realizzati su edifici pubblici adibiti a uso scolastico, strutture ospedaliere e sanitarie del SSN, l\'incentivo è al 100% delle spese ammissibili. Riferimento: Art. 48-ter D.L. 104/2020 - Paragrafo 12.11 Regole Applicative.',
            severity: 'info',
            applies_to: ['pa_tertiary', 'pa_residential', 'ets_non_economic_tertiary', 'ets_non_economic_residential']
        },
        esco_residential_thresholds: {
            title: 'ESCO su edifici residenziali - Soglie minime',
            text: 'In ambito residenziale, l\'utilizzo di ESCO tramite contratti EPC/Servizio Energia richiede soglie minime: ≥70 kW per impianti climatizzazione, ≥20 m² per solare termico. Sotto tali soglie: solo mandato irrevocabile all\'incasso. Riferimento: Paragrafo 3.5 Regole Applicative.',
            severity: 'info',
            applies_to: ['person_residential', 'sme_residential', 'large_company_residential']
        }
    },

    // Manteniamo operatorTypes per retrocompatibilità con i test
    operatorTypes: [
        {
            id: 'pa',
            name: 'Pubbliche Amministrazioni ed ETS non economici',
            maxIncentiveRate: 1.0,
            defaultRate: 0.65,
            description: 'Include tutte le PA ex D.Lgs 165/2001 e ETS non economici'
        },
        {
            id: 'private_tertiary_person',
            name: 'Soggetti Privati - Ambito Terziario (Persone fisiche, condomini)',
            maxIncentiveRate: 0.65,
            description: 'Persone fisiche e soggetti non imprese per edifici categoria catastale terziaria (A/10, B, C, D, E)'
        },
        {
            id: 'private_tertiary_sme',
            name: 'Piccole e Medie Imprese (PMI) ed ETS economici - Ambito Terziario',
            maxIncentiveRate: 0.50,
            description: 'Micro, piccole e medie imprese ed ETS economici - limiti Titolo V applicabili'
        },
        {
            id: 'private_tertiary_large',
            name: 'Grandi Imprese - Ambito Terziario',
            maxIncentiveRate: 0.30,
            description: 'Grandi imprese - limiti Titolo V applicabili'
        },
        {
            id: 'private_residential',
            name: 'Soggetti Privati - Ambito Residenziale',
            maxIncentiveRate: 0.65,
            description: 'Persone fisiche, condomini per edifici categoria catastale residenziale (Gruppo A escluso A/8, A/9, A/10)'
        }
    ],

    // Zone climatiche e relativi coefficienti
    climateZones: {
        A: { gdd: 600, coefficient: 0.8 },
        B: { gdd: 900, coefficient: 0.9 },
        C: { gdd: 1400, coefficient: 1.0 },
        D: { gdd: 2100, coefficient: 1.1 },
        E: { gdd: 3000, coefficient: 1.3 },
        F: { gdd: 3000, coefficient: 1.5 }
    },

    // Definizione degli interventi incentivabili (Art. 5 e Art. 8)
    interventions: {
        // --- INTERVENTI DI EFFICIENZA ENERGETICA (Art. 5) ---
        'isolamento-opache': {
            name: '1.A - Isolamento termico di superfici opache',
            description: 'Art. 5, comma 1, lett. a) - Coibentazione delle superfici opache dell\'edificio (pareti, coperture, pavimenti) per ridurre le dispersioni termiche e migliorare l\'efficienza energetica.',
            category: 'Efficienza Energetica',
            allowedOperators: ['pa', 'private_tertiary_person', 'private_tertiary_sme', 'private_tertiary_large'],
            restrictionNote: 'SOLO per PA/ETS non economici e Soggetti Privati su edifici TERZIARIO. NO ambito residenziale.',
            inputs: [
                {
                    id: 'righe_opache',
                    name: 'Tabella strutture opache',
                    type: 'table',
                    columns: [
                        {
                            id: 'tipologia_struttura',
                            name: 'Tipologia',
                            type: 'select',
                            options: [
                                { value: 'copertura_esterno', label: 'i. Copertura - Isolamento esterno', cmax: 300 },
                                { value: 'copertura_interno', label: 'i. Copertura - Isolamento interno', cmax: 150 },
                                { value: 'copertura_ventilata', label: 'i. Copertura - Copertura ventilata', cmax: 350 },
                                { value: 'pavimento_esterno', label: 'ii. Pavimento - Isolamento esterno', cmax: 170 },
                                { value: 'pavimento_interno', label: 'ii. Pavimento - Isolamento interno', cmax: 150 },
                                { value: 'parete_esterno', label: 'iii. Parete perimetrale - Isolamento esterno', cmax: 200 },
                                { value: 'parete_interno', label: 'iii. Parete perimetrale - Isolamento interno', cmax: 100 },
                                { value: 'parete_ventilata', label: 'iii. Parete perimetrale - Parete ventilata', cmax: 250 }
                            ]
                        },
                        {
                            id: 'superficie',
                            name: 'Superficie (m²)',
                            type: 'number',
                            min: 0
                        },
                        {
                            id: 'costo_totale',
                            name: 'Costo totale (€)',
                            type: 'number',
                            min: 0
                        },
                        {
                            id: 'costo_specifico',
                            name: 'Costo specifico (€/m²)',
                            type: 'computed',
                            compute: (riga) => {
                                if (!riga.costo_totale || !riga.superficie) return '0.00';
                                return (riga.costo_totale / riga.superficie).toFixed(2);
                            }
                        }
                    ],
                    help: 'Inserisci una riga per ogni tipologia di struttura opaca isolata. Puoi aggiungere più tipologie.'
                },
                { 
                    id: 'zona_climatica', 
                    name: 'Zona climatica', 
                    type: 'select', 
                    options: ['A', 'B', 'C', 'D', 'E', 'F'],
                    help: 'Zona climatica in cui si trova l\'edificio (influisce sulla percentuale di incentivo per zone E ed F)'
                }
            ],
            calculate: (params, operatorType, contextData) => {
                const { righe_opache, zona_climatica } = params;
                
                // Se non ci sono righe o la zona climatica, return 0
                if (!righe_opache || !Array.isArray(righe_opache) || righe_opache.length === 0 || !zona_climatica) return 0;
                
                // Mappa delle tipologie e dei loro Cmax
                const tipologieOptions = [
                    { value: 'copertura_esterno', label: 'i. Copertura - Isolamento esterno', cmax: 300 },
                    { value: 'copertura_interno', label: 'i. Copertura - Isolamento interno', cmax: 150 },
                    { value: 'copertura_ventilata', label: 'i. Copertura - Copertura ventilata', cmax: 350 },
                    { value: 'pavimento_esterno', label: 'ii. Pavimento - Isolamento esterno', cmax: 170 },
                    { value: 'pavimento_interno', label: 'ii. Pavimento - Isolamento interno', cmax: 150 },
                    { value: 'parete_esterno', label: 'iii. Parete perimetrale - Isolamento esterno', cmax: 200 },
                    { value: 'parete_interno', label: 'iii. Parete perimetrale - Isolamento interno', cmax: 100 },
                    { value: 'parete_ventilata', label: 'iii. Parete perimetrale - Parete ventilata', cmax: 250 }
                ];
                
                // Determina la percentuale base
                const isArt48ter = contextData?.art48ter === true;
                let percentuale = 0.40; // 40% base
                
                if (operatorType === 'pa' && isArt48ter) {
                    percentuale = 1.0; // 100% per edifici pubblici speciali
                } else if (operatorType === 'pa') {
                    percentuale = 0.65; // 65% per PA generiche
                } else if (zona_climatica === 'E' || zona_climatica === 'F') {
                    percentuale = 0.50; // 50% per zone E/F (soggetti privati)
                }
                
                // Premio UE (+10%)
                const ueMultiplier = params?.premiums?.['prodotti-ue'] ? 1.10 : 1.0;
                
                // Calcola l'incentivo totale sommando tutte le righe
                let incentivoTotale = 0;
                
                righe_opache.forEach(riga => {
                    const { tipologia_struttura, superficie, costo_totale } = riga;
                    
                    if (!tipologia_struttura || !superficie || !costo_totale || superficie <= 0) return;
                    
                    // Trova il Cmax per questa tipologia
                    const tipologiaData = tipologieOptions.find(t => t.value === tipologia_struttura);
                    const cmax = tipologiaData?.cmax || 300;
                    
                    // Calcola costo specifico
                    const costo_specifico = costo_totale / superficie;
                    
                    // Applica il massimale
                    const costoEffettivo = Math.min(costo_specifico, cmax);
                    
                    // Calcola incentivo per questa riga
                    let incentivoRiga = percentuale * costoEffettivo * superficie;
                    incentivoRiga *= ueMultiplier;
                    
                    incentivoTotale += incentivoRiga;
                    
                    // Log per debug
                    if (costo_specifico > cmax) {
                        console.warn(`⚠️  Riga ${tipologiaData?.label}: Costo specifico (${costo_specifico.toFixed(2)} €/m²) supera Cmax (${cmax} €/m²)`);
                    }
                });
                
                // Tetto massimo Imas = 1.000.000 €
                const tettoMassimo = 1000000;
                return Math.min(incentivoTotale, tettoMassimo);
            },
            explain: (params, operatorType, contextData) => {
                const { righe_opache, zona_climatica } = params;
                
                if (!righe_opache || !Array.isArray(righe_opache) || righe_opache.length === 0) {
                    return {
                        result: 0,
                        formula: 'Nessuna riga inserita',
                        variables: {},
                        steps: ['Inserire almeno una tipologia di struttura opaca']
                    };
                }
                
                // Mappa delle tipologie
                const tipologieOptions = [
                    { value: 'copertura_esterno', label: 'i. Copertura - Isolamento esterno', cmax: 300 },
                    { value: 'copertura_interno', label: 'i. Copertura - Isolamento interno', cmax: 150 },
                    { value: 'copertura_ventilata', label: 'i. Copertura - Copertura ventilata', cmax: 350 },
                    { value: 'pavimento_esterno', label: 'ii. Pavimento - Isolamento esterno', cmax: 170 },
                    { value: 'pavimento_interno', label: 'ii. Pavimento - Isolamento interno', cmax: 150 },
                    { value: 'parete_esterno', label: 'iii. Parete perimetrale - Isolamento esterno', cmax: 200 },
                    { value: 'parete_interno', label: 'iii. Parete perimetrale - Isolamento interno', cmax: 100 },
                    { value: 'parete_ventilata', label: 'iii. Parete perimetrale - Parete ventilata', cmax: 250 }
                ];
                
                // Determina percentuale
                const isArt48ter = contextData?.art48ter === true;
                let percentuale = 0.40;
                let percentualeDesc = '40% (base)';
                
                if (operatorType === 'pa' && isArt48ter) {
                    percentuale = 1.0;
                    percentualeDesc = '100% (Art. 48-ter: scuole/ospedali/carceri)';
                } else if (operatorType === 'pa') {
                    percentuale = 0.65;
                    percentualeDesc = '65% (PA/ETS non economici)';
                } else if (zona_climatica === 'E' || zona_climatica === 'F') {
                    percentuale = 0.50;
                    percentualeDesc = `50% (zona climatica ${zona_climatica})`;
                }
                
                const ue = params?.premiums?.['prodotti-ue'] ? 1.10 : 1.0;
                const steps = [];
                let incentivoTotale = 0;
                
                steps.push(`Zona climatica: ${zona_climatica}`);
                steps.push(`Percentuale: ${percentualeDesc}`);
                steps.push(ue > 1 ? `Premio UE: +10%` : `Premio UE: non applicato`);
                steps.push(`---`);
                
                righe_opache.forEach((riga, index) => {
                    const { tipologia_struttura, superficie, costo_totale } = riga;
                    
                    if (!tipologia_struttura || !superficie || !costo_totale || superficie <= 0) {
                        steps.push(`Riga ${index + 1}: dati incompleti`);
                        return;
                    }
                    
                    const tipologiaData = tipologieOptions.find(t => t.value === tipologia_struttura);
                    const cmax = tipologiaData?.cmax || 300;
                    const tipologiaLabel = tipologiaData?.label || 'Sconosciuta';
                    
                    const costo_specifico = costo_totale / superficie;
                    const costoEffettivo = Math.min(costo_specifico, cmax);
                    const superaMassimale = costo_specifico > cmax;
                    
                    let incentivoRiga = percentuale * costoEffettivo * superficie * ue;
                    incentivoTotale += incentivoRiga;
                    
                    steps.push(`Riga ${index + 1}: ${tipologiaLabel}`);
                    steps.push(`  Superficie: ${superficie.toFixed(2)} m²`);
                    steps.push(`  Costo totale: ${costo_totale.toLocaleString('it-IT')} €`);
                    steps.push(`  C = ${costo_totale.toLocaleString('it-IT')} / ${superficie.toFixed(2)} = ${costo_specifico.toFixed(2)} €/m²`);
                    steps.push(superaMassimale 
                        ? `  ⚠️  C supera Cmax! Uso Cmax=${cmax} €/m²` 
                        : `  ✓ C (${costo_specifico.toFixed(2)}) ≤ Cmax (${cmax})`
                    );
                    steps.push(`  Incentivo riga = ${percentuale.toFixed(2)} × ${costoEffettivo.toFixed(2)} × ${superficie.toFixed(2)}${ue > 1 ? ' × 1.10' : ''} = ${incentivoRiga.toLocaleString('it-IT', {minimumFractionDigits: 2})} €`);
                    steps.push(`---`);
                });
                
                const imas = 1000000;
                const finale = Math.min(incentivoTotale, imas);
                
                steps.push(`Totale = ${incentivoTotale.toLocaleString('it-IT', {minimumFractionDigits: 2})} €`);
                steps.push(`Finale = min(${incentivoTotale.toLocaleString('it-IT', {minimumFractionDigits: 2})}, ${imas.toLocaleString('it-IT')}) = ${finale.toLocaleString('it-IT', {minimumFractionDigits: 2})} €`);
                
                return {
                    result: finale,
                    formula: `Itot = Σ [p × min(Ci, Cmax,i) × Sint,i]${ue > 1 ? ' × 1.10 (UE)' : ''}`,
                    variables: {
                        NumeroRighe: righe_opache.length,
                        p: percentuale,
                        pDesc: percentualeDesc,
                        ZonaClimatica: zona_climatica,
                        UE: ue > 1,
                        Imas: imas
                    },
                    steps
                };
            }
        },
        'sostituzione-infissi': {
            name: '1.B - Sostituzione di chiusure trasparenti (infissi)',
            description: 'Art. 5, comma 1, lett. b) - Sostituzione di serramenti e infissi esistenti con nuovi a maggiore efficienza energetica per ridurre le dispersioni termiche attraverso le superfici vetrate.',
            category: 'Efficienza Energetica',
                allowedOperators: ['pa', 'private_tertiary_person', 'private_tertiary_sme', 'private_tertiary_large'],
                restrictionNote: 'SOLO per PA/ETS non economici e Soggetti Privati su edifici TERZIARIO. NO ambito residenziale.',
            inputs: [
                { id: 'superficie', name: 'Superficie infissi Sint (m²)', type: 'number', min: 0 },
                { id: 'costo_specifico', name: 'Costo specifico C (€/m²)', type: 'number', min: 0 },
                { id: 'zona_climatica', name: 'Zona climatica', type: 'select', options: ['A', 'B', 'C', 'D', 'E', 'F'] }
            ],
            calculate: (params, operatorType) => {
                const { superficie, costo_specifico, zona_climatica } = params;
                if (!superficie || !costo_specifico) return 0;
                
                // Cmax = 700 €/m² per zone A,B,C o 800 €/m² per zone D,E,F
                const cmaxInfissi = (zona_climatica === 'D' || zona_climatica === 'E' || zona_climatica === 'F') ? 800 : 700;
                const costoEffettivo = Math.min(costo_specifico, cmaxInfissi);
                
                // Percentuale: 40% base, 50% per zone E/F, 100% per PA
                let percentuale = 0.40;
                if (operatorType === 'pa') {
                    percentuale = 1.0;
                } else if (zona_climatica === 'E' || zona_climatica === 'F') {
                    percentuale = 0.50;
                }
                
                let incentivo = percentuale * costoEffettivo * superficie;
                
                // Premio UE (+10%)
                const ueMultiplier = params?.premiums?.['prodotti-ue'] ? 1.10 : 1.0;
                incentivo *= ueMultiplier;
                
                // Imas = 500.000 €
                const tettoMassimo = 500000;
                return Math.min(incentivo, tettoMassimo);
            },
            explain: (params, operatorType) => {
                const { superficie, costo_specifico, zona_climatica } = params;
                const cmaxInfissi = (zona_climatica === 'D' || zona_climatica === 'E' || zona_climatica === 'F') ? 800 : 700;
                const costoEffettivo = Math.min(costo_specifico || 0, cmaxInfissi);
                let percentuale = 0.40;
                if (operatorType === 'pa') percentuale = 1.0;
                else if (zona_climatica === 'E' || zona_climatica === 'F') percentuale = 0.50;
                const ue = params?.premiums?.['prodotti-ue'] ? 1.10 : 1.0;
                const base = percentuale * costoEffettivo * (superficie || 0);
                const conUE = base * ue;
                const imas = 500000;
                const finale = Math.min(conUE, imas);
                return {
                    result: finale,
                    formula: `Itot = p × min(C, ${cmaxInfissi}) × Sint${ue>1?' × 1.10 (prodotti UE)':''}; Imas=${imas.toLocaleString('it-IT')}€`,
                    variables: { p: percentuale, C: costo_specifico || 0, Ceff: costoEffettivo, Sint: superficie || 0, UE: ue>1, Imas: imas },
                    steps: [
                        `p=${percentuale.toFixed(2)}`,
                        `Ceff=min(${(costo_specifico||0).toFixed(2)}, ${cmaxInfissi})=${costoEffettivo.toFixed(2)}`,
                        `Base=${percentuale.toFixed(2)}×${costoEffettivo.toFixed(2)}×${(superficie||0).toFixed(2)}=${base.toFixed(2)}`,
                        ue>1?`UE: ${base.toFixed(2)}×1.10=${conUE.toFixed(2)}`:`UE: non applicata`,
                        `Finale=min(${conUE.toFixed(2)}, ${imas})=${finale.toFixed(2)}`
                    ]
                };
            }
        },
        'schermature-solari': {
            name: '1.C - Installazione di schermature e ombreggiamenti',
            description: 'Art. 5, comma 1, lett. c) - Installazione di sistemi di schermatura solare (tende, veneziane, pellicole) per ridurre l\'apporto termico solare e migliorare il comfort estivo.',
            category: 'Efficienza Energetica',
                allowedOperators: ['pa', 'private_tertiary_person', 'private_tertiary_sme', 'private_tertiary_large'],
                restrictionNote: 'SOLO per PA/ETS non economici e Soggetti Privati su edifici TERZIARIO. NO ambito residenziale.',
            inputs: [
                { id: 'superficie', name: 'Superficie schermata Sint (m²)', type: 'number', min: 0 },
                { id: 'costo_specifico', name: 'Costo specifico C (€/m²)', type: 'number', min: 0 },
                { id: 'tipo_schermatura', name: 'Tipo di schermatura', type: 'select', options: ['Schermature/ombreggiamento', 'Meccanismi automatici', 'Filtrazione solare selettiva non riflettente', 'Filtrazione solare selettiva riflettente'] }
            ],
            calculate: (params, operatorType) => {
                const { superficie, costo_specifico, tipo_schermatura } = params;
                if (!superficie || !costo_specifico) return 0;
                
                // Cmax e Imas variano per tipo
                let cmax, imax;
                switch(tipo_schermatura) {
                    case 'Schermature/ombreggiamento':
                        cmax = 250; imax = 90000; break;
                    case 'Meccanismi automatici':
                        cmax = 50; imax = 10000; break;
                    case 'Filtrazione solare selettiva non riflettente':
                        cmax = 130; imax = 30000; break;
                    case 'Filtrazione solare selettiva riflettente':
                        cmax = 80; imax = 30000; break;
                    default:
                        cmax = 250; imax = 90000;
                }
                
                const costoEffettivo = Math.min(costo_specifico, cmax);
                const percentuale = operatorType === 'pa' ? 1.0 : 0.40;
                
                let incentivo = percentuale * costoEffettivo * superficie;
                
                // Premio UE (+10%)
                const ueMultiplier = params?.premiums?.['prodotti-ue'] ? 1.10 : 1.0;
                incentivo *= ueMultiplier;
                
                return Math.min(incentivo, imax);
            },
            explain: (params, operatorType) => {
                const { superficie, costo_specifico, tipo_schermatura } = params;
                let cmax, imax;
                switch(tipo_schermatura) {
                    case 'Schermature/ombreggiamento': cmax = 250; imax = 90000; break;
                    case 'Meccanismi automatici': cmax = 50; imax = 10000; break;
                    case 'Filtrazione solare selettiva non riflettente': cmax = 130; imax = 30000; break;
                    case 'Filtrazione solare selettiva riflettente': cmax = 80; imax = 30000; break;
                    default: cmax = 250; imax = 90000;
                }
                const p = operatorType === 'pa' ? 1.0 : 0.40;
                const Ceff = Math.min(costo_specifico || 0, cmax);
                const base = p * Ceff * (superficie || 0);
                const ue = params?.premiums?.['prodotti-ue'] ? 1.10 : 1.0;
                const conUE = base * ue;
                const finale = Math.min(conUE, imax);
                return {
                    result: finale,
                    formula: `Itot = p × min(C, ${cmax}) × Sint${ue>1?' × 1.10 (prodotti UE)':''}; Imas=${imax.toLocaleString('it-IT')}€`,
                    variables: { p, C: costo_specifico||0, Ceff, Sint: superficie||0, UE: ue>1, Imas: imax },
                    steps: [
                        `p=${p.toFixed(2)}`,
                        `Ceff=min(${(costo_specifico||0).toFixed(2)}, ${cmax})=${Ceff.toFixed(2)}`,
                        `Base=${p.toFixed(2)}×${Ceff.toFixed(2)}×${(superficie||0).toFixed(2)}=${base.toFixed(2)}`,
                        ue>1?`UE: ${base.toFixed(2)}×1.10=${conUE.toFixed(2)}`:`UE: non applicata`,
                        `Finale=min(${conUE.toFixed(2)}, ${imax})=${finale.toFixed(2)}`
                    ]
                };
            }
        },
        'nzeb': {
            name: '1.D - Trasformazione in edificio a energia quasi zero (NZEB)',
            description: 'Art. 5, comma 1, lett. d) - Trasformazione di edifici esistenti in edifici a energia quasi zero (Nearly Zero Energy Building) attraverso interventi integrati di efficienza energetica e fonti rinnovabili.',
            category: 'Efficienza Energetica',
                allowedOperators: ['pa', 'private_tertiary_person', 'private_tertiary_sme', 'private_tertiary_large'],
                restrictionNote: 'SOLO per PA/ETS non economici e Soggetti Privati su edifici TERZIARIO. NO ambito residenziale.',
            inputs: [
                { id: 'superficie', name: 'Superficie utile Sed (m²)', type: 'number', min: 0 },
                { id: 'costo_specifico', name: 'Costo specifico C (€/m²)', type: 'number', min: 0 },
                { id: 'zona_climatica', name: 'Zona climatica', type: 'select', options: ['A', 'B', 'C', 'D', 'E', 'F'] }
            ],
            calculate: (params, operatorType) => {
                const { superficie, costo_specifico, zona_climatica } = params;
                if (!superficie || !costo_specifico) return 0;
                
                // Cmax e Imas variano per zona climatica
                let cmax, imax;
                if (zona_climatica === 'A' || zona_climatica === 'B' || zona_climatica === 'C') {
                    cmax = 1000; // €/m²
                    imax = 2500000; // €
                } else {
                    cmax = 1300; // €/m²
                    imax = 3000000; // €
                }
                
                const costoEffettivo = Math.min(costo_specifico, cmax);
                const percentuale = operatorType === 'pa' ? 1.0 : 0.65;
                
                let incentivo = percentuale * costoEffettivo * superficie;
                
                // Premio UE (+10%)
                const ueMultiplier = params?.premiums?.['prodotti-ue'] ? 1.10 : 1.0;
                incentivo *= ueMultiplier;
                
                return Math.min(incentivo, imax);
            },
            explain: (params, operatorType) => {
                const { superficie, costo_specifico, zona_climatica } = params;
                let cmax, imax;
                if (['A','B','C'].includes(zona_climatica)) { cmax=1000; imax=2500000; } else { cmax=1300; imax=3000000; }
                const p = operatorType === 'pa' ? 1.0 : 0.65;
                const Ceff = Math.min(costo_specifico||0, cmax);
                const base = p * Ceff * (superficie||0);
                const ue = params?.premiums?.['prodotti-ue'] ? 1.10 : 1.0;
                const conUE = base * ue;
                const finale = Math.min(conUE, imax);
                return {
                    result: finale,
                    formula: `Itot = p × min(C, ${cmax}) × Sed${ue>1?' × 1.10 (prodotti UE)':''}; Imas=${imax.toLocaleString('it-IT')}€`,
                    variables: { p, C: costo_specifico||0, Ceff, Sed: superficie||0, UE: ue>1, Imas: imax },
                    steps: [
                        `p=${p.toFixed(2)}`,
                        `Ceff=min(${(costo_specifico||0).toFixed(2)}, ${cmax})=${Ceff.toFixed(2)}`,
                        `Base=${p.toFixed(2)}×${Ceff.toFixed(2)}×${(superficie||0).toFixed(2)}=${base.toFixed(2)}`,
                        ue>1?`UE: ${base.toFixed(2)}×1.10=${conUE.toFixed(2)}`:`UE: non applicata`,
                        `Finale=min(${conUE.toFixed(2)}, ${imax})=${finale.toFixed(2)}`
                    ]
                };
            }
        },
        'illuminazione-led': {
            name: '1.E - Sostituzione sistemi di illuminazione con LED',
            description: 'Art. 5, comma 1, lett. e) - Sostituzione di corpi illuminanti tradizionali con sistemi ad alta efficienza (LED) per ridurre i consumi elettrici per l\'illuminazione.',
            category: 'Efficienza Energetica',
                allowedOperators: ['pa', 'private_tertiary_person', 'private_tertiary_sme', 'private_tertiary_large'],
                restrictionNote: 'SOLO per PA/ETS non economici e Soggetti Privati su edifici TERZIARIO. NO ambito residenziale.',
            inputs: [
                { id: 'superficie', name: 'Superficie edificio Sed (m²)', type: 'number', min: 0 },
                { id: 'costo_specifico', name: 'Costo specifico C (€/m²)', type: 'number', min: 0 },
                { id: 'tipo_lampada', name: 'Tipo di lampada', type: 'select', options: ['Alta efficienza', 'LED'] }
            ],
            calculate: (params, operatorType) => {
                const { superficie, costo_specifico, tipo_lampada } = params;
                if (!superficie || !costo_specifico) return 0;
                
                // Formula: Itot = %spesa × C × Sed
                // Cmax e Imas variano per tipo
                let cmax, imax;
                if (tipo_lampada === 'Alta efficienza') {
                    cmax = 15; // €/m²
                    imax = 50000; // €
                } else { // LED
                    cmax = 35; // €/m²
                    imax = 140000; // €
                }
                
                const costoEffettivo = Math.min(costo_specifico, cmax);
                const percentuale = operatorType === 'pa' ? 1.0 : 0.40;
                
                let incentivo = percentuale * costoEffettivo * superficie;
                
                // Premio UE (+10%)
                const ueMultiplier = params?.premiums?.['prodotti-ue'] ? 1.10 : 1.0;
                incentivo *= ueMultiplier;
                
                return Math.min(incentivo, imax);
            },
            explain: (params, operatorType) => {
                const { superficie, costo_specifico, tipo_lampada } = params;
                let cmax, imax; if (tipo_lampada==='Alta efficienza'){cmax=15;imax=50000;} else {cmax=35;imax=140000;}
                const p = operatorType === 'pa' ? 1.0 : 0.40;
                const Ceff = Math.min(costo_specifico||0, cmax);
                const base = p * Ceff * (superficie||0);
                const ue = params?.premiums?.['prodotti-ue'] ? 1.10 : 1.0;
                const conUE = base * ue;
                const finale = Math.min(conUE, imax);
                return { result: finale, formula: `Itot = p × min(C, ${cmax}) × Sed${ue>1?' × 1.10 (prodotti UE)':''}; Imas=${imax.toLocaleString('it-IT')}€`, variables:{p,C:costo_specifico||0,Ceff,Sed:superficie||0,UE:ue>1,Imas:imax}, steps:[`p=${p.toFixed(2)}`,`Ceff=min(${(costo_specifico||0).toFixed(2)}, ${cmax})=${Ceff.toFixed(2)}`,`Base=${p.toFixed(2)}×${Ceff.toFixed(2)}×${(superficie||0).toFixed(2)}=${base.toFixed(2)}`, ue>1?`UE: ${base.toFixed(2)}×1.10=${conUE.toFixed(2)}`:`UE: non applicata`, `Finale=min(${conUE.toFixed(2)}, ${imax})=${finale.toFixed(2)}`] };
            }
        },
        'building-automation': {
            name: '1.F - Installazione di sistemi di building automation',
            description: 'Art. 5, comma 1, lett. f) - Installazione di sistemi intelligenti per il controllo e la gestione automatica degli impianti termici e dell\'illuminazione per ottimizzare i consumi energetici.',
            category: 'Efficienza Energetica',
                allowedOperators: ['pa', 'private_tertiary_person', 'private_tertiary_sme', 'private_tertiary_large'],
                restrictionNote: 'SOLO per PA/ETS non economici e Soggetti Privati su edifici TERZIARIO. NO ambito residenziale.',
            inputs: [
                { id: 'superficie', name: 'Superficie edificio Sed (m²)', type: 'number', min: 0 },
                { id: 'costo_specifico', name: 'Costo specifico C (€/m²)', type: 'number', min: 0 }
            ],
            calculate: (params, operatorType) => {
                const { superficie, costo_specifico } = params;
                if (!superficie || !costo_specifico) return 0;
                
                // Formula: Itot = %spesa × C × Sed, con Itot ≤ Imas
                const cmax = 60; // €/m²
                const imax = 100000; // €
                
                const costoEffettivo = Math.min(costo_specifico, cmax);
                const percentuale = operatorType === 'pa' ? 1.0 : 0.40;
                
                let incentivo = percentuale * costoEffettivo * superficie;
                
                // Premio UE (+10%)
                const ueMultiplier = params?.premiums?.['prodotti-ue'] ? 1.10 : 1.0;
                incentivo *= ueMultiplier;
                
                return Math.min(incentivo, imax);
            },
            explain: (params, operatorType) => {
                const { superficie, costo_specifico } = params;
                const cmax=60, imax=100000, p= operatorType==='pa'?1.0:0.40;
                const Ceff=Math.min(costo_specifico||0,cmax);
                const base=p*Ceff*(superficie||0);
                const ue=params?.premiums?.['prodotti-ue']?1.10:1.0;
                const conUE=base*ue; const finale=Math.min(conUE, imax);
                return { result: finale, formula:`Itot = p × min(C, ${cmax}) × Sed${ue>1?' × 1.10 (prodotti UE)':''}; Imas=${imax.toLocaleString('it-IT')}€`, variables:{p,C:costo_specifico||0,Ceff,Sed:superficie||0,UE:ue>1,Imas:imax}, steps:[`p=${p.toFixed(2)}`,`Ceff=min(${(costo_specifico||0).toFixed(2)}, ${cmax})=${Ceff.toFixed(2)}`,`Base=${p.toFixed(2)}×${Ceff.toFixed(2)}×${(superficie||0).toFixed(2)}=${base.toFixed(2)}`, ue>1?`UE: ${base.toFixed(2)}×1.10=${conUE.toFixed(2)}`:`UE: non applicata`, `Finale=min(${conUE.toFixed(2)}, ${imax})=${finale.toFixed(2)}`] };
            }
        },
        'infrastrutture-ricarica': {
            name: '1.G - Infrastrutture di ricarica per veicoli elettrici',
            description: 'Art. 5, comma 1, lett. g) - Realizzazione di infrastrutture per la ricarica di veicoli elettrici presso edifici pubblici o ad uso terziario per promuovere la mobilità sostenibile.',
            category: 'Efficienza Energetica',
                allowedOperators: ['pa', 'private_tertiary_person', 'private_tertiary_sme', 'private_tertiary_large'],
                restrictionNote: 'SOLO per PA/ETS non economici e Soggetti Privati su edifici TERZIARIO. NO ambito residenziale. Deve essere congiunto a installazione pompa di calore elettrica.',
            inputs: [
                { id: 'tipo_infrastruttura', name: 'Tipo infrastruttura', type: 'select', options: ['Standard monofase (7.4-22kW)', 'Standard trifase (7.4-22kW)', 'Media (22-50kW)', 'Alta (50-100kW)', 'Oltre 100kW'] },
                { 
                    id: 'numero_punti', 
                    name: 'Numero punti di ricarica (solo per standard 7.4–22kW)', 
                    type: 'number', 
                    min: 1, 
                    step: 1, 
                    help: 'Inserisci il numero di punti per le infrastrutture standard (monofase o trifase).', 
                    visible_if: { 
                        field: 'tipo_infrastruttura', 
                        values: ['Standard monofase (7.4-22kW)', 'Standard trifase (7.4-22kW)'] 
                    }
                },
                { 
                    id: 'potenza', 
                    name: 'Potenza dell\'infrastruttura (kW) – solo per 22–50 kW', 
                    type: 'number', 
                    min: 0, 
                    step: 0.1, 
                    visible_if: { 
                        field: 'tipo_infrastruttura', 
                        values: ['Media (22-50kW)', 'Alta (50-100kW)', 'Oltre 100kW'] 
                    }
                },
                { id: 'costo_totale', name: 'Costo totale sostenuto (€)', type: 'number', min: 0 }
            ],
            calculate: (params, operatorType) => {
                const { tipo_infrastruttura, numero_punti, potenza, costo_totale } = params;
                if (!costo_totale) return 0;
                
                // Limiti massimi di costo secondo Art. 5.1.g
                let costoMassimoAmmissibile;
                switch(tipo_infrastruttura) {
                    case 'Standard monofase (7.4-22kW)': {
                        const n = parseInt(numero_punti, 10) || 0;
                        costoMassimoAmmissibile = 2400 * n; break;
                    }
                    case 'Standard trifase (7.4-22kW)': {
                        const n = parseInt(numero_punti, 10) || 0;
                        costoMassimoAmmissibile = 8400 * n; break;
                    }
                    case 'Media (22-50kW)':
                        costoMassimoAmmissibile = potenza * 1200; break;
                    case 'Alta (50-100kW)':
                        costoMassimoAmmissibile = 60000; break;
                    case 'Oltre 100kW':
                        costoMassimoAmmissibile = 110000; break;
                    default:
                        costoMassimoAmmissibile = 0;
                }
                
                const spesaAmmissibile = Math.min(costo_totale, costoMassimoAmmissibile);
                
                // Incentivo = 30% della spesa ammissibile
                let incentivo = 0.30 * spesaAmmissibile;
                
                // Note: "incentivo comunque non superiore a quello per pompe di calore elettriche"
                // Per ora lasciamo solo la formula base
                
                return incentivo;
            },
            explain: (params) => {
                const { tipo_infrastruttura, numero_punti, potenza, costo_totale } = params;
                let costoMassimoAmmissibile = 0;
                const steps = [];
                switch(tipo_infrastruttura) {
                    case 'Standard monofase (7.4-22kW)': {
                        const n = parseInt(numero_punti, 10) || 0;
                        costoMassimoAmmissibile = 2400 * n;
                        steps.push(`Cmax = 2400 € × N_punti (${n}) = ${costoMassimoAmmissibile.toLocaleString('it-IT')} €`);
                        break;
                    }
                    case 'Standard trifase (7.4-22kW)': {
                        const n = parseInt(numero_punti, 10) || 0;
                        costoMassimoAmmissibile = 8400 * n;
                        steps.push(`Cmax = 8400 € × N_punti (${n}) = ${costoMassimoAmmissibile.toLocaleString('it-IT')} €`);
                        break;
                    }
                    case 'Media (22-50kW)': {
                        const p = parseFloat(potenza || 0);
                        costoMassimoAmmissibile = p * 1200;
                        steps.push(`Cmax = P × 1200 €/kW = ${p.toFixed(1)} × 1200 = ${costoMassimoAmmissibile.toLocaleString('it-IT')} €`);
                        break;
                    }
                    case 'Alta (50-100kW)': costoMassimoAmmissibile = 60000; steps.push(`Cmax = 60.000 € per infrastruttura`); break;
                    case 'Oltre 100kW': costoMassimoAmmissibile = 110000; steps.push(`Cmax = 110.000 € per infrastruttura`); break;
                    default: costoMassimoAmmissibile = 0; steps.push(`Tipo non selezionato`);
                }
                const spesa = parseFloat(costo_totale || 0) || 0;
                const spesaAmmissibile = Math.min(spesa, costoMassimoAmmissibile);
                const incentivo = 0.30 * spesaAmmissibile;
                steps.push(`Spesa ammissibile = min(Spesa, Cmax) = min(${spesa.toLocaleString('it-IT')}, ${costoMassimoAmmissibile.toLocaleString('it-IT')}) = ${spesaAmmissibile.toLocaleString('it-IT')}`);
                steps.push(`Itot = 30% × Spesa ammissibile = 0,30 × ${spesaAmmissibile.toLocaleString('it-IT')} = ${incentivo.toLocaleString('it-IT', {minimumFractionDigits: 2})} €`);
                return { result: incentivo, formula:`Itot = 30% × min(Spesa, Cmax)`, variables:{Spesa:spesa, Cmax:costoMassimoAmmissibile, SpesaAmm:spesaAmmissibile}, steps };
            }
        },
        'fotovoltaico-accumulo': {
            name: '1.H - Impianto fotovoltaico con sistema di accumulo',
            description: 'Art. 5, comma 1, lett. h) - Installazione di impianti fotovoltaici integrati con sistemi di accumulo elettrico per l\'autoconsumo dell\'energia prodotta e la riduzione dei prelievi dalla rete.',
            category: 'Efficienza Energetica',
                allowedOperators: ['pa', 'private_tertiary_person', 'private_tertiary_sme', 'private_tertiary_large'],
                restrictionNote: 'SOLO per PA/ETS non economici e Soggetti Privati su edifici TERZIARIO. NO ambito residenziale. Deve essere congiunto a installazione pompa di calore elettrica.',
            inputs: [
                { id: 'potenza_fv', name: 'Potenza impianto FV (kWp)', type: 'number', min: 0, step: 0.1 },
                { id: 'capacita_accumulo', name: 'Capacità accumulo (kWh)', type: 'number', min: 0, step: 0.1 },
                { id: 'registro_ue', name: 'Moduli FV iscritti al registro UE', type: 'select', options: ['No', 'Sì - Requisiti lett. a) (+5%)', 'Sì - Requisiti lett. b) (+10%)', 'Sì - Requisiti lett. c) (+15%)'] }
            ],
            calculate: (params, operatorType) => {
                const { potenza_fv, capacita_accumulo, registro_ue } = params;
                if (!potenza_fv || !capacita_accumulo) return 0;
                
                // Costo massimo ammissibile per FV (scalare per potenza)
                let cmaxFV;
                if (potenza_fv <= 20) cmaxFV = 1500;
                else if (potenza_fv <= 200) cmaxFV = 1200;
                else if (potenza_fv <= 600) cmaxFV = 1100;
                else cmaxFV = 1050;
                
                const costoAmmissibileFV = potenza_fv * cmaxFV;
                
                // Costo massimo ammissibile per accumulo: 1000 €/kWh
                const costoAmmissibileAccumulo = capacita_accumulo * 1000;
                
                // Percentuale base: 20%
                let percentuale = 0.20;
                
                // Maggiorazioni per registro UE
                if (registro_ue.includes('lett. a)')) percentuale += 0.05;
                else if (registro_ue.includes('lett. b)')) percentuale += 0.10;
                else if (registro_ue.includes('lett. c)')) percentuale += 0.15;
                
                const incentivo = percentuale * (costoAmmissibileFV + costoAmmissibileAccumulo);
                
                return incentivo;
            },
            explain: (params) => {
                const { potenza_fv, capacita_accumulo, registro_ue } = params;
                let cmaxFV; const p=potenza_fv||0; const k=capacita_accumulo||0;
                if (p<=20) cmaxFV=1500; else if (p<=200) cmaxFV=1200; else if (p<=600) cmaxFV=1100; else cmaxFV=1050;
                const costoAmmissibileFV=p*cmaxFV;
                const costoAmmissibileAccumulo=k*1000;
                let percentuale=0.20;
                if (registro_ue?.includes('lett. a)')) percentuale+=0.05; else if (registro_ue?.includes('lett. b)')) percentuale+=0.10; else if (registro_ue?.includes('lett. c)')) percentuale+=0.15;
                const base=percentuale*(costoAmmissibileFV+costoAmmissibileAccumulo);
                return { result: base, formula:`Itot = ${percentuale*100}% × (min(C_FV, cmax_FV) + min(C_acc, 1000€/kWh))`, variables:{p_fv:p, cmax_fv:cmaxFV, costi_fv:costoAmmissibileFV, kwh_acc:k, cmax_acc_kwh:1000, costi_acc:costoAmmissibileAccumulo} };
            }
        },

        // --- INTERVENTI DI PRODUZIONE DI ENERGIA TERMICA DA FONTI RINNOVABILI (Art. 8) ---
        'pompa-calore': {
            name: '2.A - Sostituzione con pompe di calore',
            description: 'Art. 8, comma 1, lett. a) - Sostituzione di impianti di climatizzazione invernale esistenti con pompe di calore elettriche o a gas ad alta efficienza per la produzione di energia termica da fonti rinnovabili.',
            category: 'Fonti Rinnovabili',
                allowedOperators: ['pa', 'private_tertiary_person', 'private_tertiary_sme', 'private_tertiary_large', 'private_residential'],
                restrictionNote: 'Per imprese e ETS economici: NON ammesse pompe di calore a GAS (art. 25, comma 2). Solo pompe di calore elettriche.',
            inputs: [
                { id: 'costo_totale', name: 'Costo totale intervento (€)', type: 'number', min: 0, help: 'Necessario per calcolo premialità 100%' },
                { id: 'tipo_pompa', name: 'Tipo di pompa di calore', type: 'select', options: ['aria/aria split/multisplit', 'aria/aria fixed double duct', 'aria/aria VRF/VRV (13-35kW)', 'aria/aria VRF/VRV (>35kW)', 'aria/aria rooftop (≤35kW)', 'aria/aria rooftop (>35kW)', 'aria/acqua (≤35kW)', 'aria/acqua (>35kW)', 'acqua/aria (≤35kW)', 'acqua/aria (>35kW)', 'acqua/acqua (≤35kW)', 'acqua/acqua (>35kW)', 'salamoia/aria (≤35kW)', 'salamoia/aria (>35kW)', 'salamoia/acqua (≤35kW)', 'salamoia/acqua (>35kW)'] },
                { id: 'potenza_nominale', name: 'Potenza termica nominale Prated (kW)', type: 'number', min: 0, step: 0.1 },
                { id: 'scop', name: 'SCOP stagionale', type: 'number', min: 2.5, step: 0.01 },
                { id: 'scop_minimo', name: 'SCOP minimo ecodesign', type: 'number', min: 2.5, step: 0.01 },
                { id: 'zona_climatica', name: 'Zona climatica', type: 'select', options: ['A', 'B', 'C', 'D', 'E', 'F'] }
            ],
            calculate: (params, operatorType) => {
                const { tipo_pompa, potenza_nominale, scop, scop_minimo, zona_climatica } = params;
                if (!potenza_nominale || !scop || !scop_minimo || !zona_climatica) return 0;
                
                // Formula: Ia_tot = Ci × EI
                // dove EI = Qu × [1 - 1/SCOP] × kp
                // e Qu = Prated × Quf
                
                // Tabella 8: Quf per zona climatica
                const qufTable = { A: 600, B: 850, C: 1100, D: 1400, E: 1700, F: 1800 };
                const quf = qufTable[zona_climatica];
                
                // Calcolo Qu
                const qu = potenza_nominale * quf;
                
                // Calcolo kp (coefficiente di premialità)
                const kp = scop / scop_minimo;
                
                // Calcolo EI (energia termica incentivata)
                let ei;
                if (tipo_pompa.includes('fixed double duct')) {
                    // Per fixed double duct usa COP invece di SCOP
                    // Formula: EI = Qu × [1 - 1/COP] × kp
                    // Assumiamo COP = SCOP per semplificazione (andrebbe chiesto separatamente)
                    ei = qu * (1 - 1/scop) * kp;
                } else {
                    ei = qu * (1 - 1/scop) * kp;
                }
                
                // Tabella 9: Ci coefficiente di valorizzazione
                let ci;
                if (tipo_pompa.includes('aria/aria split') || tipo_pompa.includes('fixed double duct')) {
                    ci = potenza_nominale <= 12 ? (tipo_pompa.includes('split') ? 0.070 : 0.200) : 0.055;
                } else if (tipo_pompa.includes('VRF') || tipo_pompa.includes('rooftop')) {
                    if (potenza_nominale <= 35) ci = 0.150;
                    else ci = 0.055;
                } else if (tipo_pompa.includes('aria/acqua')) {
                    ci = potenza_nominale <= 35 ? 0.150 : 0.060;
                } else if (tipo_pompa.includes('acqua/aria')) {
                    ci = potenza_nominale <= 35 ? 0.160 : 0.060;
                } else if (tipo_pompa.includes('acqua/acqua')) {
                    ci = potenza_nominale <= 35 ? 0.160 : 0.060;
                } else if (tipo_pompa.includes('salamoia')) {
                    ci = potenza_nominale <= 35 ? 0.160 : 0.060;
                } else {
                    ci = 0.150; // default
                }
                
                // Incentivo annuo
                const incentivo_annuo = ci * ei;
                
                // Incentivo totale (assumiamo durata incentivo, es. 2 anni per residenziale, 5 per PA)
                const durata = operatorType === 'pa' ? 5 : 2;
                return incentivo_annuo * durata;
            },
            explain: (params, operatorType) => {
                const { tipo_pompa, potenza_nominale, scop, scop_minimo, zona_climatica } = params;
                const qufTable = { A: 600, B: 850, C: 1100, D: 1400, E: 1700, F: 1800 };
                const Quf = qufTable[zona_climatica]||0; const Pr=potenza_nominale||0;
                const Qu = Pr * Quf;
                const kp = (scop||0) / (scop_minimo||1);
                const EI = Qu * (1 - 1/(scop||1)) * kp;
                let Ci;
                if (tipo_pompa?.includes('aria/aria split') || tipo_pompa?.includes('fixed double duct')) {
                    Ci = Pr <= 12 ? (tipo_pompa.includes('split') ? 0.070 : 0.200) : 0.055;
                } else if (tipo_pompa?.includes('VRF') || tipo_pompa?.includes('rooftop')) {
                    Ci = Pr <= 35 ? 0.150 : 0.055;
                } else if (tipo_pompa?.includes('aria/acqua')) { Ci = Pr<=35?0.150:0.060; }
                else if (tipo_pompa?.includes('acqua/aria')) { Ci = Pr<=35?0.160:0.060; }
                else if (tipo_pompa?.includes('acqua/acqua')) { Ci = Pr<=35?0.160:0.060; }
                else if (tipo_pompa?.includes('salamoia')) { Ci = Pr<=35?0.160:0.060; }
                else { Ci=0.150; }
                const Ia_annuo = Ci * EI;
                const durata = operatorType === 'pa' ? 5 : 2;
                const totale = Ia_annuo * durata;
                return { result: totale, formula:`Ia_tot = Ci × EI × durata; EI = Qu × (1 - 1/SCOP) × kp; Qu = Prated × Quf`, variables:{Ci,EI,Qu,Prated:Pr,Quf,SCOP:scop||0,kp,durata} };
            }
        },
        'sistemi-ibridi': {
            name: '2.B - Sistemi ibridi factory made o bivalenti',
            description: 'Art. 8, comma 1, lett. b) - Installazione di sistemi ibridi composti da pompa di calore integrata con caldaia a condensazione (factory made o bivalenti) per ottimizzare l\'efficienza e ridurre i consumi.',
            category: 'Fonti Rinnovabili',
                allowedOperators: ['pa', 'private_tertiary_person', 'private_residential'],
                restrictionNote: 'NON AMMESSI per imprese e ETS economici (art. 25, comma 2): sistemi ibridi con caldaia a gas sono combustibili fossili.',
            inputs: [
                { id: 'costo_totale', name: 'Costo totale intervento (€)', type: 'number', min: 0, help: 'Necessario per calcolo premialità 100%' },
                { id: 'tipo_sistema', name: 'Tipo sistema', type: 'select', options: ['Ibrido factory made (Pn ≤35kW)', 'Ibrido factory made (Pn >35kW)', 'Sistema bivalente (Pn ≤35kW)', 'Sistema bivalente (Pn >35kW)'] },
                { id: 'potenza_pdc', name: 'Potenza termica pompa di calore Prated (kW)', type: 'number', min: 0, step: 0.1 },
                { id: 'scop', name: 'SCOP pompa di calore', type: 'number', min: 2.5, step: 0.01 },
                { id: 'scop_minimo', name: 'SCOP minimo ecodesign', type: 'number', min: 2.5, step: 0.01 },
                { id: 'zona_climatica', name: 'Zona climatica', type: 'select', options: ['A', 'B', 'C', 'D', 'E', 'F'] }
            ],
            calculate: (params, operatorType) => {
                const { tipo_sistema, potenza_pdc, scop, scop_minimo, zona_climatica } = params;
                if (!potenza_pdc || !scop || !scop_minimo || !zona_climatica) return 0;
                
                // Formula: Ia_tot = k × Ei × Ci
                // dove Ei = Qu × [1 - 1/SCOP] × kp
                
                // Tabella 8: Quf
                const qufTable = { A: 600, B: 850, C: 1100, D: 1400, E: 1700, F: 1800 };
                const quf = qufTable[zona_climatica];
                
                // Qu = Prated × Quf
                const qu = potenza_pdc * quf;
                
                // kp = SCOP/SCOP_minimo
                const kp = scop / scop_minimo;
                
                // EI
                const ei = qu * (1 - 1/scop) * kp;
                
                // Tabella 18: Coefficiente k
                let k;
                if (tipo_sistema.includes('factory made')) {
                    k = 1.25; // Ibrido factory made
                } else {
                    k = tipo_sistema.includes('>35kW') ? 1.1 : 1.0; // Bivalente
                }
                
                // Ci (assumiamo aria/acqua come tipo più comune per sistemi ibridi)
                const ci = potenza_pdc <= 35 ? 0.150 : 0.060;
                
                // Incentivo annuo
                const incentivo_annuo = k * ei * ci;
                
                // Incentivo totale
                const durata = operatorType === 'pa' ? 5 : 2;
                return incentivo_annuo * durata;
            },
            explain: (params, operatorType) => {
                const { tipo_sistema, potenza_pdc, scop, scop_minimo, zona_climatica } = params;
                const qufTable = { A: 600, B: 850, C: 1100, D: 1400, E: 1700, F: 1800 };
                const Quf = qufTable[zona_climatica]||0; const Pr=potenza_pdc||0; const Qu=Pr*Quf; const kp=(scop||0)/(scop_minimo||1);
                const EI = Qu * (1 - 1/(scop||1)) * kp;
                let k; if (tipo_sistema?.includes('factory made')) k=1.25; else k = tipo_sistema?.includes('>35kW')?1.1:1.0;
                const Ci = Pr<=35?0.150:0.060; const Ia_annuo = k * EI * Ci; const durata= operatorType==='pa'?5:2; const tot=Ia_annuo*durata;
                return { result: tot, formula:`Ia_tot = k × EI × Ci × durata; EI = Qu × (1 - 1/SCOP) × kp; Qu = Prated × Quf`, variables:{k,Ei:EI,Qu,Prated:Pr,Quf,Ci,SCOP:scop||0,kp,durata} };
            }
        },
        'biomassa': {
            name: '2.C - Sostituzione con generatori a biomassa',
            description: 'Art. 8, comma 1, lett. c) - Sostituzione di generatori di calore esistenti con caldaie, stufe o termocamini alimentati a biomassa (pellet, legna) ad alta efficienza e basse emissioni.',
            category: 'Fonti Rinnovabili',
                allowedOperators: ['pa', 'private_tertiary_person', 'private_tertiary_sme', 'private_tertiary_large', 'private_residential'],
                restrictionNote: 'Ammesso per tutti i soggetti. Biomassa è fonte rinnovabile, non combustibile fossile.',
            inputs: [
                { id: 'costo_totale', name: 'Costo totale intervento (€)', type: 'number', min: 0, help: 'Necessario per calcolo premialità 100%' },
                { id: 'tipo_generatore', name: 'Tipo generatore', type: 'select', options: ['Caldaia a biomassa', 'Stufa a pellet', 'Stufa a legna', 'Termocamino'] },
                { id: 'potenza_nominale', name: 'Potenza termica nominale Pn (kW)', type: 'number', min: 0, step: 0.1 },
                { id: 'zona_climatica', name: 'Zona climatica', type: 'select', options: ['A', 'B', 'C', 'D', 'E', 'F'] },
                { id: 'riduzione_emissioni', name: 'Riduzione emissioni particolato vs DM 186/2017 classe 5 stelle', type: 'select', options: ['Fino al 20%', 'Dal 20% al 50%', 'Oltre il 50%'] },
                { id: 'centrale_teleriscaldamento', name: 'Installato presso centrale teleriscaldamento?', type: 'select', options: ['No', 'Sì'] }
            ],
            calculate: (params, operatorType) => {
                const { tipo_generatore, potenza_nominale, zona_climatica, riduzione_emissioni, centrale_teleriscaldamento } = params;
                if (!potenza_nominale || !zona_climatica || !riduzione_emissioni) return 0;
                
                // Tabella 11: Hr ore di funzionamento per zona climatica
                const hrTable = { A: 600, B: 850, C: 1100, D: 1400, E: 1700, F: 1800 };
                const hr = hrTable[zona_climatica];
                
                // Tabella 12/13: Coefficiente Ce per emissioni
                let ce;
                if (riduzione_emissioni === 'Fino al 20%') ce = 1.0;
                else if (riduzione_emissioni === 'Dal 20% al 50%') ce = 1.2;
                else ce = 1.5; // Oltre 50%
                
                // Tabella 10: Ci coefficiente di valorizzazione
                let ci;
                if (tipo_generatore === 'Caldaia a biomassa') {
                    if (potenza_nominale <= 35) ci = 0.060;
                    else if (potenza_nominale <= 500) ci = 0.025;
                    else ci = 0.020;
                } else if (tipo_generatore.includes('pellet')) {
                    ci = 0.055; // Solo per Pn ≤ 35 kW
                } else { // Stufa a legna o Termocamino
                    ci = 0.045; // Solo per Pn ≤ 35 kW
                }
                
                // Formula varia per tipo generatore
                let incentivo_annuo;
                if (tipo_generatore === 'Caldaia a biomassa') {
                    // Formula: Ia_tot = Pn × Hr × Ci × Ce
                    incentivo_annuo = potenza_nominale * hr * ci * ce;
                } else {
                    // Formula per stufe/termocamini: Ia_tot = 3.35 × ln(Pn) × Hr × Ci × Ce
                    incentivo_annuo = 3.35 * Math.log(potenza_nominale) * hr * ci * ce;
                }
                
                // Riduzione 20% se presso centrale teleriscaldamento
                if (centrale_teleriscaldamento === 'Sì') {
                    incentivo_annuo *= 0.80;
                }
                
                // Incentivo totale
                const durata = operatorType === 'pa' ? 5 : 2;
                return incentivo_annuo * durata;
            },
            explain: (params, operatorType) => {
                const { tipo_generatore, potenza_nominale, zona_climatica, riduzione_emissioni, centrale_teleriscaldamento } = params;
                const hrTable = { A: 600, B: 850, C: 1100, D: 1400, E: 1700, F: 1800 };
                const Hr = hrTable[zona_climatica]||0; const Pn=potenza_nominale||0;
                let Ce; if (riduzione_emissioni==='Fino al 20%') Ce=1.0; else if (riduzione_emissioni==='Dal 20% al 50%') Ce=1.2; else Ce=1.5;
                let Ci; if (tipo_generatore==='Caldaia a biomassa'){ if (Pn<=35) Ci=0.060; else if (Pn<=500) Ci=0.025; else Ci=0.020; }
                else if (tipo_generatore?.includes('pellet')) Ci=0.055; else Ci=0.045;
                let Ia_annuo; if (tipo_generatore==='Caldaia a biomassa'){ Ia_annuo = Pn * Hr * Ci * Ce; } else { Ia_annuo = 3.35 * Math.log(Math.max(Pn,1)) * Hr * Ci * Ce; }
                if (centrale_teleriscaldamento==='Sì') Ia_annuo*=0.80;
                const durata = operatorType==='pa'?5:2; const tot=Ia_annuo*durata;
                return { result: tot, formula:`Ia_tot = f(tipo) × Hr × Ci × Ce × durata${centrale_teleriscaldamento==='Sì'?' × 0.80 (teleriscaldamento)':''}`, variables:{tipo:tipo_generatore,Pn,Hr,Ci,Ce,durata} };
            }
        },
        'solare-termico': {
            name: '2.D - Installazione di collettori solari termici',
            description: 'Art. 8, comma 1, lett. d) - Installazione di impianti solari termici per la produzione di acqua calda sanitaria (ACS), riscaldamento o solar cooling utilizzando l\'energia solare.',
            category: 'Fonti Rinnovabili',
                allowedOperators: ['pa', 'private_tertiary_person', 'private_tertiary_sme', 'private_tertiary_large', 'private_residential'],
                restrictionNote: 'Ammesso per tutti i soggetti. Solare termico è fonte rinnovabile.',
            inputs: [
                { id: 'costo_totale', name: 'Costo totale intervento (€)', type: 'number', min: 0, help: 'Necessario per calcolo premialità 100%' },
                { id: 'superficie_lorda', name: 'Superficie solare lorda Sl (m²)', type: 'number', min: 0, step: 0.01 },
                { id: 'tipo_impianto', name: 'Tipo di impianto', type: 'select', options: ['Produzione ACS', 'Produzione ACS + riscaldamento', 'Collettori a concentrazione', 'Solar cooling'] },
                { id: 'tipo_collettore', name: 'Tipo collettore (se applicabile)', type: 'select', options: ['Piani vetrati', 'Sottovuoto', 'Concentrazione', 'N/A'] },
                { id: 'qcol', name: 'Energia annua Qcol da certificazione (kWh) - opzionale', type: 'number', min: 0, step: 0.1 }
            ],
            calculate: (params, operatorType) => {
                const { superficie_lorda, tipo_impianto, tipo_collettore, qcol } = params;
                if (!superficie_lorda || !tipo_impianto) return 0;
                
                // Formula: Ia_tot = Ci × Qu × Sl
                // dove Qu = Qcol/AG (energia per m²)
                
                // Tabella 16: Ci in base a Sl e tipo impianto
                let ci;
                if (superficie_lorda < 12) {
                    if (tipo_impianto === 'Produzione ACS') ci = 0.35;
                    else if (tipo_impianto === 'Produzione ACS + riscaldamento') ci = 0.36;
                    else if (tipo_impianto === 'Collettori a concentrazione') ci = 0.38;
                    else ci = 0.43; // Solar cooling
                } else if (superficie_lorda < 50) {
                    if (tipo_impianto === 'Produzione ACS') ci = 0.32;
                    else if (tipo_impianto === 'Produzione ACS + riscaldamento') ci = 0.33;
                    else if (tipo_impianto === 'Collettori a concentrazione') ci = 0.35;
                    else ci = 0.40;
                } else if (superficie_lorda < 200) {
                    ci = tipo_impianto === 'Solar cooling' ? 0.17 : 0.13;
                } else if (superficie_lorda < 500) {
                    ci = tipo_impianto === 'Solar cooling' ? 0.15 : 0.12;
                } else {
                    ci = tipo_impianto === 'Solar cooling' ? 0.14 : 0.11;
                }
                
                // Qu: energia termica prodotta per m²
                // Se fornito Qcol dalla certificazione, usalo
                // Altrimenti stima generica (da Tabella 17: Tm 50°C per ACS, 75°C per processo/cooling)
                let qu;
                if (qcol && qcol > 0) {
                    qu = qcol; // già in kWh, assumiamo per m² o totale
                } else {
                    // Stime conservative basate su tipo collettore e applicazione
                    if (tipo_collettore === 'Piani vetrati') qu = 400;
                    else if (tipo_collettore === 'Sottovuoto') qu = 600;
                    else if (tipo_collettore === 'Concentrazione') qu = 800;
                    else qu = 500; // default
                }
                
                // Incentivo annuo
                const incentivo_annuo = ci * qu * superficie_lorda;
                
                // Incentivo totale
                const durata = operatorType === 'pa' ? 5 : 2;
                return incentivo_annuo * durata;
            },
            explain: (params, operatorType) => {
                const { superficie_lorda, tipo_impianto, tipo_collettore, qcol } = params;
                const Sl=superficie_lorda||0; let Ci;
                if (Sl<12){ if (tipo_impianto==='Produzione ACS') Ci=0.35; else if (tipo_impianto==='Produzione ACS + riscaldamento') Ci=0.36; else if (tipo_impianto==='Collettori a concentrazione') Ci=0.38; else Ci=0.43; }
                else if (Sl<50){ if (tipo_impianto==='Produzione ACS') Ci=0.32; else if (tipo_impianto==='Produzione ACS + riscaldamento') Ci=0.33; else if (tipo_impianto==='Collettori a concentrazione') Ci=0.35; else Ci=0.40; }
                else if (Sl<200){ Ci = tipo_impianto==='Solar cooling'?0.17:0.13; }
                else if (Sl<500){ Ci = tipo_impianto==='Solar cooling'?0.15:0.12; } else { Ci = tipo_impianto==='Solar cooling'?0.14:0.11; }
                let Qu; if (qcol&&qcol>0) Qu=qcol; else { if (tipo_collettore==='Piani vetrati') Qu=400; else if (tipo_collettore==='Sottovuoto') Qu=600; else if (tipo_collettore==='Concentrazione') Qu=800; else Qu=500; }
                const Ia_annuo = Ci * Qu * Sl; const durata = operatorType==='pa'?5:2; const tot=Ia_annuo*durata;
                return { result: tot, formula:`Ia_tot = Ci × Qu × Sl × durata`, variables:{Ci,Qu,Sl,durata} };
            }
        },
        'scaldacqua-pdc': {
            name: '2.E - Sostituzione con scaldacqua a pompa di calore',
            description: 'Art. 8, comma 1, lett. e) - Sostituzione di scaldacqua elettrici tradizionali o a gas con scaldacqua a pompa di calore ad alta efficienza per la produzione di acqua calda sanitaria.',
            category: 'Fonti Rinnovabili',
                allowedOperators: ['pa', 'private_tertiary_person', 'private_tertiary_sme', 'private_tertiary_large', 'private_residential'],
                restrictionNote: 'Ammesso per tutti i soggetti. Scaldacqua a pompa di calore elettrica.',
            inputs: [
                { id: 'capacita', name: 'Capacità del serbatoio (litri)', type: 'number', min: 80 },
                { id: 'classe_energetica', name: 'Classe energetica (Reg. EU 812/2013)', type: 'select', options: ['Classe A', 'Classe A+'] },
                { id: 'costo_totale', name: 'Costo totale intervento (€)', type: 'number', min: 0 }
            ],
            calculate: (params, operatorType) => {
                const { capacita, classe_energetica, costo_totale } = params;
                if (!capacita || !classe_energetica || !costo_totale) return 0;
                
                // Formula: Incentivo = 40% della spesa sostenuta
                // con tetti massimi per classe e capacità
                
                let incentivo = 0.40 * costo_totale;
                
                // Tetti massimi secondo sezione 2.5
                let imax;
                if (classe_energetica === 'Classe A') {
                    imax = capacita <= 150 ? 500 : 1100;
                } else { // Classe A+
                    imax = capacita <= 150 ? 700 : 1500;
                }
                
                return Math.min(incentivo, imax);
            },
            explain: (params) => {
                const { capacita, classe_energetica, costo_totale } = params; const cap=capacita||0;
                let imax; if (classe_energetica==='Classe A') imax = cap<=150?500:1100; else imax = cap<=150?700:1500;
                const base = 0.40*(costo_totale||0); const finale=Math.min(base, imax);
                return { result: finale, formula:`Itot = 40% × Spesa; Imas=${imax.toLocaleString('it-IT')}€`, variables:{Spesa:costo_totale||0,Imas:imax}, steps:[`Base=0.40×${(costo_totale||0).toFixed(2)}=${base.toFixed(2)}`,`Finale=min(${base.toFixed(2)}, ${imax})=${finale.toFixed(2)}`] };
            }
        },
        'teleriscaldamento': {
            name: '2.F - Teleriscaldamento alimentato da biomassa/solare termico/geotermia',
            description: 'Art. 8, comma 1, lett. f) - Allacciamento a reti di teleriscaldamento efficienti alimentate da fonti rinnovabili (biomassa, solare termico, geotermia) per ridurre l\'impatto ambientale del riscaldamento.',
            category: 'Fonti Rinnovabili',
                allowedOperators: ['pa', 'private_tertiary_person', 'private_tertiary_sme', 'private_tertiary_large', 'private_residential'],
                restrictionNote: 'Ammesso per tutti i soggetti. Teleriscaldamento da fonti rinnovabili.',
            inputs: [
                { id: 'potenza_contrattuale', name: 'Potenza termica contrattuale (kW)', type: 'number', min: 0 },
                { id: 'costo_totale', name: 'Costo totale dell\'allacciamento (€)', type: 'number', min: 0 }
            ],
            calculate: (params, operatorType) => {
                const { potenza_contrattuale, costo_totale } = params;
                if (!potenza_contrattuale || !costo_totale) return 0;
                
                // Formula: Itot = percentuale × C × Pnsc
                // Sezione 2.7: 65% della spesa, con Cmax variabile per fasce
                
                let cmax;
                if (potenza_contrattuale <= 35) {
                    cmax = 200;
                } else if (potenza_contrattuale <= 100) {
                    cmax = 160;
                } else {
                    cmax = 130;
                }
                
                const percentuale = 0.65;
                const costoAmmissibile = potenza_contrattuale * cmax;
                const costoEffettivo = Math.min(costo_totale, costoAmmissibile);
                
                let incentivo = percentuale * costoEffettivo;
                
                // Tetti massimi per fasce
                let imax;
                if (potenza_contrattuale <= 35) {
                    imax = 6500;
                } else if (potenza_contrattuale <= 100) {
                    imax = 15000;
                } else {
                    imax = 30000;
                }
                
                return Math.min(incentivo, imax);
            },
            explain: (params) => {
                const { potenza_contrattuale, costo_totale } = params; const P=potenza_contrattuale||0; let cmax, imax;
                if (P<=35){ cmax=200; imax=6500; } else if (P<=100){ cmax=160; imax=15000; } else { cmax=130; imax=30000; }
                const costoAmmissibile=P*cmax; const costoEffettivo=Math.min(costo_totale||0, costoAmmissibile); const base=0.65*costoEffettivo; const finale=Math.min(base, imax);
                return { result: finale, formula:`Itot = 65% × min(Spesa, Pn × Cmax); Imas=${imax.toLocaleString('it-IT')}€`, variables:{Spesa:costo_totale||0,Pn:P,cmax,Imas:imax}, steps:[`C_amm=P×Cmax=${P}×${cmax}=${costoAmmissibile.toFixed(2)}`,`Spesa_eff=min(${(costo_totale||0).toFixed(2)}, ${costoAmmissibile.toFixed(2)})=${costoEffettivo.toFixed(2)}`,`Base=0.65×${costoEffettivo.toFixed(2)}=${base.toFixed(2)}`,`Finale=min(${base.toFixed(2)}, ${imax})=${finale.toFixed(2)}`] };
            }
        },
        'microcogenerazione': {
            name: '2.G - Microcogenerazione alimentata da fonti rinnovabili',
            description: 'Art. 8, comma 1, lett. g) - Installazione di sistemi di microcogenerazione (potenza ≤50 kWe) alimentati da fonti rinnovabili per la produzione combinata di energia elettrica e termica.',
            category: 'Fonti Rinnovabili',
                allowedOperators: ['pa', 'private_tertiary_person', 'private_tertiary_sme', 'private_tertiary_large', 'private_residential'],
                restrictionNote: 'Ammesso per tutti i soggetti. Microcogenerazione da fonti rinnovabili.',
            inputs: [
                { id: 'potenza_elettrica', name: 'Potenza elettrica nominale (kWe)', type: 'number', min: 0, max: 50 },
                { id: 'costo_totale', name: 'Costo totale intervento (€)', type: 'number', min: 0 }
            ],
            calculate: (params, operatorType) => {
                const { potenza_elettrica, costo_totale } = params;
                if (!potenza_elettrica || !costo_totale) return 0;
                
                // Formula: Itot = percentuale × C × Pnint
                // Sezione 2.8: 65% della spesa, Cmax 5000 €/kWe, Imas 100.000 €
                
                const percentuale = 0.65;
                const cmax = 5000; // €/kWe
                const imax = 100000; // €
                
                const costoAmmissibile = potenza_elettrica * cmax;
                const costoEffettivo = Math.min(costo_totale, costoAmmissibile);
                
                const incentivo = percentuale * costoEffettivo;
                
                return Math.min(incentivo, imax);
            },
            explain: (params) => {
                const { potenza_elettrica, costo_totale } = params; const P=potenza_elettrica||0; const cmax=5000; const imax=100000;
                const costoAmm=P*cmax; const costoEff=Math.min(costo_totale||0, costoAmm); const base=0.65*costoEff; const finale=Math.min(base, imax);
                return { result: finale, formula:`Itot = 65% × min(Spesa, P_el × 5000€/kWe); Imas=${imax.toLocaleString('it-IT')}€`, variables:{Spesa:costo_totale||0,P_el:P,Imas:imax}, steps:[`C_amm=P_el×5000=${P}×5000=${costoAmm.toFixed(2)}`,`Spesa_eff=min(${(costo_totale||0).toFixed(2)}, ${costoAmm.toFixed(2)})=${costoEff.toFixed(2)}`,`Base=0.65×${costoEff.toFixed(2)}=${base.toFixed(2)}`,`Finale=min(${base.toFixed(2)}, ${imax})=${finale.toFixed(2)}`] };
            }
        }
    },

    // Definizione delle premialità e maggiorazioni
    premiums: {
        'multi-intervento': {
            name: 'Maggiorazione multi-intervento',
            description: 'Porta l\'incentivo dal 25% al 30% dei costi ammissibili per interventi Titolo II (1.A e 1.B) quando combinati con interventi Titolo III (2.A, 2.B, 2.C, 2.E) - Art. Regole Applicative par. 607',
            scope: 'per-intervention', // Applicato solo agli interventi specifici
            type: 'percentage',
            value: 20, // +20% sull'incentivo calcolato (matematicamente: 30/25 = 1.20)
            applicableToInterventions: ['isolamento-opache', 'sostituzione-infissi'], // Solo 1.A e 1.B
            isApplicable: (selectedInterventions) => {
                // Deve esserci almeno un intervento Titolo II (1.A o 1.B)
                const hasTitoloII = selectedInterventions.some(id => 
                    id === 'isolamento-opache' || id === 'sostituzione-infissi'
                );
                // E almeno un intervento Titolo III tra 2.A, 2.B, 2.C, 2.E
                const hasTitoloIII = selectedInterventions.some(id => 
                    id === 'pompa-calore' || id === 'sistemi-ibridi' || 
                    id === 'biomassa' || id === 'scaldacqua-pdc'
                );
                return hasTitoloII && hasTitoloIII;
            }
        },
        'prodotti-ue': {
            name: 'Premio prodotti UE (+10%)',
            description: 'Maggiorazione del 10% per componenti tecnologici prodotti nell\'Unione Europea (Art. 5). Richiede documentazione attestante la produzione europea.',
            scope: 'per-intervention',
            type: 'percentage',
            value: 10, // +10% sull'incentivo base
            applicableToInterventions: [
                'isolamento-opache',
                'sostituzione-infissi',
                'schermature-solari',
                'nzeb',
                'illuminazione-led',
                'building-automation',
                'infrastrutture-ricarica',
                'fotovoltaico-accumulo'
            ],
            requiresDocumentation: 'Attestazione ufficiale che certifica la produzione europea dei componenti',
            isApplicable: (selectedInterventions) => {
                // Verifica che almeno un intervento selezionato sia tra quelli ammissibili
                const eligibleInterventions = [
                    'isolamento-opache',
                    'sostituzione-infissi',
                    'schermature-solari',
                    'nzeb',
                    'illuminazione-led',
                    'building-automation',
                    'infrastrutture-ricarica',
                    'fotovoltaico-accumulo'
                ];
                return selectedInterventions.some(int => eligibleInterventions.includes(int));
            }
        },
        'pmi': {
            name: 'Maggiorazione per piccole e medie imprese (+15%)',
            description: 'Maggiorazione del 15% dell\'incentivo per PMI (solo per soggetti privati ambito terziario - PMI)',
            scope: 'global',
            type: 'percentage',
            value: 15, // +15% sull'incentivo calcolato
            applicableToInterventions: ['all'],
            isApplicable: (selectedInterventions, inputs, operatorType) => {
                // Applicabile solo alle PMI in ambito terziario
                return operatorType === 'private_tertiary_sme';
            }
        },
        'diagnosi-energetica': {
            name: 'Diagnosi energetica e certificazione',
            description: 'Premio aggiuntivo fisso di €1.000 per diagnosi energetica certificata e APE',
            scope: 'global',
            type: 'fixed',
            value: 1000, // € fissi
            applicableToInterventions: ['all'],
            requiresDocumentation: 'Diagnosi energetica e Attestato di Prestazione Energetica (APE)',
            isApplicable: () => true
        },
        'emissioni-biomassa': {
            name: 'Maggiorazione biomassa 5 stelle (+20%)',
            description: 'Premio del 20% per generatori a biomassa con classe emissioni 5 stelle',
            scope: 'per-intervention',
            type: 'percentage',
            value: 20, // +20% sull'incentivo calcolato
            applicableToInterventions: ['biomassa'],
            isApplicable: (selectedInterventions, inputs) => {
                return selectedInterventions.includes('biomassa') && 
                       inputs.biomassa?.emissioni === '5';
            }
        }
    },

    /**
     * Calcola l'incentivo totale per più interventi combinati
     * @param {Array} selectedInterventions - Array di ID interventi selezionati
     * @param {Object} inputsByIntervention - Oggetto con parametri per ogni intervento { interventionId: params }
     * @param {String} operatorType - Tipo di operatore (pa, private_tertiary, private_residential)
     * @param {Array} globalPremiums - Array di ID premialità globali selezionate
     * @param {Object} contextData - Dati di contesto aggiuntivi: { buildingSubcategory, popolazione_comune, subjectType }
     * @returns {Object} - { total, details: [{id, name, baseIncentive, appliedPremiums, finalIncentive}], appliedGlobalPremiums }
     */
    calculateCombinedIncentives: function(selectedInterventions, inputsByIntervention, operatorType, globalPremiums = [], contextData = {}) {
        const details = [];
        let sumBaseIncentives = 0;

        // VERIFICA CONDIZIONI PER INCENTIVO AL 100%
        // 1. Art. 48-ter: scuole, ospedali, carceri (PA/ETS)
        const isArt48ter = contextData.buildingSubcategory && 
                          ['tertiary_school', 'tertiary_hospital', 'tertiary_prison'].includes(contextData.buildingSubcategory);
        
        // 2. Comuni < 15.000 abitanti - SOLO per Comuni con intervento diretto su edificio di proprietà e utilizzo comunale
        // Requisiti cumulativi:
        // - Deve essere un Comune (non altra PA)
        // - Edificio di proprietà E utilizzato dal Comune
        // - Popolazione < 15.000 abitanti
        // - Modalità: intervento diretto
        const isPiccoloComune = contextData.is_comune === true && 
                               contextData.is_edificio_comunale === true &&
                               contextData.is_piccolo_comune === true &&
                               contextData.subjectType === 'pa' &&
                               contextData.implementationMode === 'direct';
        
        const hasIncentivo100 = isArt48ter || isPiccoloComune;

        if (hasIncentivo100) {
            // Modalità speciale: incentivo = 100% spesa sostenuta, max = Imas calcolato
            let totalCost = 0;
            let totalImas = 0;

            selectedInterventions.forEach(intId => {
                const intervention = this.interventions[intId];
                if (!intervention || !intervention.calculate) {
                    details.push({
                        id: intId,
                        name: intervention?.name || intId,
                        baseIncentive: 0,
                        appliedPremiums: [],
                        finalIncentive: 0,
                        error: 'Calcolo non disponibile'
                    });
                    return;
                }

                const params = inputsByIntervention[intId] || {};
                
                // Calcola o estrai il costo totale
                let costInput = params.costo_totale || params.spesa_totale || params.costo_intervento || 0;
                
                // Se non specificato, prova a calcolarlo dai parametri specifici
                if (!costInput) {
                    if (Array.isArray(params.righe_opache) && params.righe_opache.length > 0) {
                        // Isolamento 1.A con tabella: somma dei costi riga
                        costInput = params.righe_opache.reduce((sum, r) => sum + (parseFloat(r.costo_totale) || 0), 0);
                    } else if (params.superficie && params.costo_specifico) {
                        // Per interventi a singolo input: superficie × costo
                        costInput = params.superficie * params.costo_specifico;
                    } else if (params.potenza_contrattuale && params.costo_totale) {
                        // Per teleriscaldamento
                        costInput = params.costo_totale;
                    }
                    // Altri casi possono essere aggiunti qui
                }
                
                // Calcola Imas (incentivo massimo standard)
                let imas = 0;
                try {
                    imas = intervention.calculate(params, operatorType);
                } catch (error) {
                    details.push({
                        id: intId,
                        name: intervention.name,
                        baseIncentive: 0,
                        appliedPremiums: [],
                        finalIncentive: 0,
                        error: error.message
                    });
                    return;
                }

                // Con incentivo al 100%: incentivo = min(100% costo, Imas)
                const incentivo100 = Math.min(costInput, imas);
                
                totalCost += costInput;
                totalImas += imas;

                let incentivo100Reason = '';
                if (isArt48ter) {
                    const buildingNames = {
                        'tertiary_school': 'Scuola',
                        'tertiary_hospital': 'Ospedale/Struttura sanitaria',
                        'tertiary_prison': 'Carcere'
                    };
                    incentivo100Reason = `Art. 48-ter (${buildingNames[contextData.buildingSubcategory]})`;
                } else if (isPiccoloComune) {
                    incentivo100Reason = `Comune < 15.000 abitanti`;
                }

                details.push({
                    id: intId,
                    name: intervention.name,
                    baseIncentive: incentivo100,
                    appliedPremiums: [{ 
                        id: 'incentivo-100-auto', 
                        name: `Incentivo al 100% - ${incentivo100Reason}`, 
                        value: incentivo100 
                    }],
                    finalIncentive: incentivo100,
                    note: `100% spesa (€${costInput.toLocaleString('it-IT')}), max Imas €${imas.toLocaleString('it-IT')}`
                });

                sumBaseIncentives += incentivo100;
            });

            let premiumNote = '';
            if (isArt48ter) {
                const buildingNames = {
                    'tertiary_school': 'edificio scolastico',
                    'tertiary_hospital': 'struttura ospedaliera/sanitaria pubblica',
                    'tertiary_prison': 'struttura penitenziaria'
                };
                premiumNote = `Art. 48-ter applicato automaticamente per ${buildingNames[contextData.buildingSubcategory]}. Incentivo al 100% della spesa ammissibile (totale spesa: €${totalCost.toLocaleString('it-IT')}, tetto massimo: €${totalImas.toLocaleString('it-IT')})`;
            } else if (isPiccoloComune) {
                premiumNote = `Maggiorazione per Comune sotto 15.000 abitanti applicata. L'edificio è di proprietà ed utilizzato dal Comune, con intervento diretto. Incentivo al 100% della spesa ammissibile (totale spesa: €${totalCost.toLocaleString('it-IT')}, tetto massimo: €${totalImas.toLocaleString('it-IT')}). Dovrai attestare queste condizioni nella richiesta al GSE.`;
            }

            return {
                total: sumBaseIncentives,
                subtotal: sumBaseIncentives,
                details,
                appliedGlobalPremiums: [{
                    id: 'incentivo-100-auto',
                    name: isArt48ter ? 'Incentivo 100% - Art. 48-ter' : 'Incentivo 100% - Piccolo Comune',
                    value: sumBaseIncentives,
                    note: premiumNote
                }],
                wasCapped: false,
                originalTotal: sumBaseIncentives,
                isIncentivo100: true
            };
        }

        // MODALITÀ STANDARD (senza incentivo al 100%)
        // 1. Calcola incentivo base per ogni intervento
        selectedInterventions.forEach(intId => {
            const intervention = this.interventions[intId];
            if (!intervention || !intervention.calculate) {
                details.push({
                    id: intId,
                    name: intervention?.name || intId,
                    baseIncentive: 0,
                    appliedPremiums: [],
                    finalIncentive: 0,
                    error: 'Calcolo non disponibile'
                });
                return;
            }

            const params = inputsByIntervention[intId] || {};
            const perInterventionPremiums = (params && params.premiums) ? { ...params.premiums } : {};
            
            // Calcola incentivo base (senza premialità globali)
            let baseIncentive = 0;
            try {
                baseIncentive = intervention.calculate(params, operatorType);
            } catch (error) {
                details.push({
                    id: intId,
                    name: intervention.name,
                    baseIncentive: 0,
                    appliedPremiums: [],
                    finalIncentive: 0,
                    error: error.message
                });
                return;
            }

            // Applica premialità specifiche dell'intervento (già incluse nel calculate)
            const appliedPremiums = [];
            let finalIncentive = baseIncentive;

            // Applica eventuali premi per-intervento dichiarati in calculatorData.premiums
            // Evita doppio conteggio per 'prodotti-ue' che è integrato nelle singole formule Art. 5
            for (const [premId, premData] of Object.entries(this.premiums)) {
                if (premData.scope !== 'per-intervention') continue;
                if (premId === 'prodotti-ue') continue; // Prodotti UE già integrato nelle formule
                
                // Per multi-intervento: è AUTOMATICO (non richiede selezione utente)
                if (premId === 'multi-intervento') {
                    // Verifica se la combinazione di interventi soddisfa i requisiti (Titolo II + Titolo III)
                    const isApplicableToCombination = premData.isApplicable(selectedInterventions);
                    if (!isApplicableToCombination) continue;
                    // Verifica se questo specifico intervento riceve il premio (solo 1.A e 1.B)
                    const isApplicableToThisInt = premData.applicableToInterventions?.includes(intId);
                    if (!isApplicableToThisInt) continue;
                    // Applica il premio
                    let delta = 0;
                    if (premData.type === 'percentage') {
                        delta = finalIncentive * (premData.value / 100);
                        finalIncentive += delta;
                    }
                    appliedPremiums.push({ id: premId, name: premData.name, value: delta });
                    continue; // Passa al prossimo premio
                }
                
                // Altri premi per-intervention: richiedono selezione utente
                const selected = !!perInterventionPremiums[premId];
                const applicable = premData.applicableToInterventions?.includes('all') || premData.applicableToInterventions?.includes(intId);
                if (!selected || !applicable) continue;
                // Verifica regole specifiche
                const ok = typeof premData.isApplicable === 'function'
                    ? premData.isApplicable([intId], inputsByIntervention, operatorType)
                    : true;
                if (!ok) continue;
                
                let delta = 0;
                if (premData.type === 'percentage') {
                    delta = finalIncentive * (premData.value / 100);
                    finalIncentive += delta;
                } else if (premData.type === 'fixed') {
                    delta = premData.value;
                    finalIncentive += delta;
                }
                appliedPremiums.push({ id: premId, name: premData.name, value: delta });
            }

            details.push({
                id: intId,
                name: intervention.name,
                baseIncentive,
                appliedPremiums,
                finalIncentive
            });

            sumBaseIncentives += finalIncentive;
        });

        // 2. Applica premialità globali sulla somma
        let totalIncentive = sumBaseIncentives;
        const appliedGlobalPremiums = [];

        // Verifica se il premio multi-intervento è stato applicato (per mostrarlo nei global premiums)
        let multiInterventoTotalBonus = 0;
        details.forEach(detail => {
            const multiPremium = detail.appliedPremiums?.find(p => p.id === 'multi-intervento');
            if (multiPremium) {
                multiInterventoTotalBonus += multiPremium.value;
            }
        });
        if (multiInterventoTotalBonus > 0) {
            appliedGlobalPremiums.push({
                id: 'multi-intervento',
                name: 'Multi-intervento (dal 25% al 30%) - già applicato agli interventi Titolo II',
                value: multiInterventoTotalBonus
            });
        }

        // PMI: +15% se applicabile
        if (globalPremiums.includes('pmi') && operatorType === 'private_tertiary_sme') {
            const pmiBonus = sumBaseIncentives * 0.15;
            totalIncentive += pmiBonus;
            appliedGlobalPremiums.push({
                id: 'pmi',
                name: 'PMI (+15%)',
                value: pmiBonus
            });
        }

        // Diagnosi energetica: +1000€ fissi
        if (globalPremiums.includes('diagnosi-energetica')) {
            totalIncentive += 1000;
            appliedGlobalPremiums.push({
                id: 'diagnosi-energetica',
                name: 'Diagnosi energetica',
                value: 1000
            });
        }

        // 3. Verifica tetti massimi
        // Tetto generale per soggetto e per intervento (varia in base al tipo)
        const maxIncentiveByOperator = {
            'pa': 5000000, // 5M€ per PA
            'private_tertiary_person': 2000000, // 2M€ per privati terziario (non imprese)
            'private_tertiary_sme': 2000000, // 2M€ per PMI ed ETS economici
            'private_tertiary_large': 2000000, // 2M€ per grandi imprese
            'private_residential': 1000000 // 1M€ per privati residenziale
        };

        const cappedTotal = Math.min(totalIncentive, maxIncentiveByOperator[operatorType] || 2000000);

        return {
            total: cappedTotal,
            subtotal: sumBaseIncentives,
            details,
            appliedGlobalPremiums,
            wasCapped: cappedTotal < totalIncentive,
            originalTotal: totalIncentive
        };
    }
};