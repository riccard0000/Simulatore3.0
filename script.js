// Funzione di inizializzazione principale
async function initCalculator() {
    // Attendi che WASM sia caricato (se disponibile)
    if (typeof loadWASM === 'function') {
        const wasmLoaded = await loadWASM();
        if (wasmLoaded) {
            console.log('✅ Calcoli con WASM attivati');
        } else {
            console.log('⚠️  Usando calcoli JavaScript (WASM non disponibile)');
        }
    } else {
        console.log('ℹ️  Usando calcoli JavaScript (loader WASM non trovato)');
    }

    // Elementi DOM per i 3 step
    const subjectTypeSelect = document.getElementById('subject-type');
    const buildingCategorySelect = document.getElementById('building-category');
    const buildingCategoryGroup = document.getElementById('building-category-group');
    const implementationModeSelect = document.getElementById('implementation-mode');
    const implementationModeGroup = document.getElementById('implementation-mode-group');
    
    const interventionsList = document.getElementById('interventions-list');
    const premiumsList = document.getElementById('premiums-list');
    const dynamicInputsContainer = document.getElementById('dynamic-inputs');
    const calculateButton = document.getElementById('calculate-btn');
    const resetButton = document.getElementById('reset-btn');
    const resultsContainer = document.getElementById('result-container');
    const incentiveResultEl = document.getElementById('result-amount');
    const resultDetailsEl = document.getElementById('result-details');

    // Stato dell'applicazione
    const state = {
        selectedSubject: '', // Step 1
        selectedBuilding: '', // Step 2
        buildingSubcategory: '', // Sottocategoria terziario (school/hospital/prison)
        selectedMode: 'direct', // Step 3
        selectedOperator: '', // operatorType calcolato dalla matrice
        selectedInterventions: [],
        selectedPremiums: [],
        inputValues: {},
        subjectSpecificData: {} // Dati aggiuntivi come popolazione_comune
    };

    // --- INIZIALIZZAZIONE ---

    function initialize() {
        populateSubjectTypes();
        populateBuildingCategories();
        populateImplementationModes();
        addEventListeners();
    }

    function populateSubjectTypes() {
        subjectTypeSelect.innerHTML = '<option value="" disabled selected>Seleziona il soggetto ammesso...</option>';
        
        calculatorData.subjectTypes.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject.id;
            option.textContent = subject.name;
            option.title = subject.description;
            subjectTypeSelect.appendChild(option);
        });
    }

    function populateBuildingCategories() {
        // Inizializza con un'opzione vuota, il popolamento vero avviene in updateBuildingCategoryOptions
        buildingCategorySelect.innerHTML = '<option value="" disabled selected>Seleziona prima il soggetto...</option>';
    }

    function populateImplementationModes() {
        implementationModeSelect.innerHTML = '';
        
        calculatorData.implementationModes.forEach(mode => {
            const option = document.createElement('option');
            option.value = mode.id;
            option.textContent = mode.name;
            option.title = mode.description;
            implementationModeSelect.appendChild(option);
        });
    }

    function updateOperatorType() {
        // Calcola l'operatorType interno dalla matrice
        if (!state.selectedSubject || !state.selectedBuilding) {
            state.selectedOperator = '';
            state.buildingSubcategory = '';
            return;
        }

        // Memorizza la sottocategoria se è una sottocategoria terziario
        if (['tertiary_generic', 'tertiary_school', 'tertiary_hospital', 'tertiary_prison'].includes(state.selectedBuilding)) {
            state.buildingSubcategory = state.selectedBuilding;
        } else {
            state.buildingSubcategory = '';
        }

        // Prova prima con la sottocategoria
        let matrixKey = `${state.selectedSubject}_${state.selectedBuilding}`;
        let mapping = calculatorData.operatorMatrix[matrixKey];
        
        // Se non trovato e è una sottocategoria, prova con la categoria principale
        if (!mapping && state.buildingSubcategory) {
            matrixKey = `${state.selectedSubject}_tertiary`;
            mapping = calculatorData.operatorMatrix[matrixKey];
        }
        
        if (mapping) {
            state.selectedOperator = mapping.operatorTypeId;
            console.log(`✅ Mappatura: ${matrixKey} → ${state.selectedOperator}` + 
                       (state.buildingSubcategory ? ` (sottocategoria: ${state.buildingSubcategory})` : ''));
        } else {
            state.selectedOperator = '';
            state.buildingSubcategory = '';
            console.warn(`⚠️  Nessuna mappatura trovata per: ${matrixKey}`);
        }
    }

    function updateImplementationModeOptions() {
        const selectedSubjectId = state.selectedSubject;
        implementationModeSelect.innerHTML = ''; // Pulisci le opzioni

        if (!selectedSubjectId) {
            implementationModeGroup.style.display = 'none';
            return;
        }

        const filteredModes = calculatorData.implementationModes.filter(mode => {
            return mode.allowedSubjects.includes(selectedSubjectId);
        });

        if (filteredModes.length > 0) {
            implementationModeGroup.style.display = 'block';
            filteredModes.forEach(mode => {
                const option = document.createElement('option');
                option.value = mode.id;
                option.textContent = mode.name;
                option.title = mode.description;
                if (mode.note) {
                    option.title += `\n\nNOTA: ${mode.note}`;
                }
                implementationModeSelect.appendChild(option);
            });
            // Imposta il valore di default o il primo disponibile
            state.selectedMode = implementationModeSelect.value;
        } else {
            implementationModeGroup.style.display = 'none';
        }
    }

    function renderInterventions() {
        interventionsList.innerHTML = '';
        state.selectedInterventions = [];
        state.inputValues = {};
        updateDynamicInputs();

        if (!state.selectedOperator) {
            interventionsList.innerHTML = '<p class="notice">Completa i passi 1 e 2 per visualizzare gli interventi disponibili.</p>';
            return;
        }

        // Determina gli interventi ammissibili dalla matrice
        const matrixKey = `${state.selectedSubject}_${state.selectedBuilding}`;
        const mapping = calculatorData.operatorMatrix[matrixKey];
        
        if (!mapping) {
            interventionsList.innerHTML = '<p class="notice">⚠️ Combinazione non valida. Verifica i dati inseriti.</p>';
            return;
        }

        // Mostra avviso normativo se presente
        if (mapping.note && mapping.requiresPublicOwnership) {
            const warningDiv = document.createElement('div');
            warningDiv.className = 'regulatory-warning';
            warningDiv.innerHTML = `
                <div style="background: #fff3cd; border: 2px solid #ff9800; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                    <h4 style="margin: 0 0 10px 0; color: #ff6f00; display: flex; align-items: center; gap: 8px;">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm1 15H9v-2h2v2zm0-4H9V5h2v6z"/>
                        </svg>
                        ⚠️ Attenzione: Requisito normativo
                    </h4>
                    <p style="margin: 0; color: #663c00; line-height: 1.6;">
                        ${mapping.note}
                    </p>
                    <p style="margin: 10px 0 0 0; font-size: 0.9em; color: #666;">
                        <strong>Riferimento:</strong> Paragrafo 12.10.4 delle Regole Applicative CT 3.0
                    </p>
                </div>
            `;
            interventionsList.appendChild(warningDiv);
        }

        // Filtra interventi in base alle regole della matrice
        const filteredEntries = Object.entries(calculatorData.interventions).filter(([_, data]) => {
            // Verifica allowedOperators standard
            if (data.allowedOperators && data.allowedOperators.length > 0) {
                if (!data.allowedOperators.includes(state.selectedOperator)) {
                    return false;
                }
            }
            
            // Applica regole della matrice (Titolo II vs Titolo III)
            if (mapping.allowedInterventions === 'only_titolo3' && data.category === 'Efficienza Energetica') {
                return false; // Residenziale: solo Titolo III per privati
            }
            
            return true;
        });

        if (filteredEntries.length === 0) {
            interventionsList.innerHTML = '<p class="notice">Nessun intervento disponibile per questa combinazione.</p>';
            return;
        }

        const categories = {};
        filteredEntries.forEach(([id, data]) => {
            const category = data.category || 'Generale';
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push({ id, ...data });
        });

        // Crea sezioni per ogni categoria
        for (const categoryName in categories) {
            const categoryWrapper = document.createElement('div');
            categoryWrapper.className = 'category-wrapper';
            
            const categoryTitle = document.createElement('h3');
            categoryTitle.className = 'category-title';
            categoryTitle.textContent = categoryName;
            categoryWrapper.appendChild(categoryTitle);

            categories[categoryName].forEach(data => {
                const div = document.createElement('div');
                div.className = 'intervention';
                
                const tooltip = data.description ? `
                    <span class="tooltip-icon" data-tooltip="${data.description}">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5" fill="none"/>
                            <text x="8" y="11" text-anchor="middle" font-size="10" font-weight="bold" fill="currentColor">?</text>
                        </svg>
                    </span>
                ` : '';
                
                div.innerHTML = `
                    <input type="checkbox" id="int-${data.id}" name="intervention" value="${data.id}">
                    <label for="int-${data.id}">
                        ${data.name}
                        ${tooltip}
                    </label>
                `;
                categoryWrapper.appendChild(div);
            });

            interventionsList.appendChild(categoryWrapper);
        }
    }

    function populatePremiums() {
        // Mostra SOLO le premialità di tipo globale applicabili al contesto corrente
        premiumsList.innerHTML = '';
        
        let hasAnyPremium = false;
        for (const [id, data] of Object.entries(calculatorData.premiums)) {
            if (data.scope !== 'global') continue;
            if (id === 'multi-intervento') continue; // Multi-intervento non selezionabile
            // Verifica se la premialità è applicabile al contesto corrente
            const isApplicable = data.isApplicable(
                state.selectedInterventions, 
                state.inputValues, 
                state.selectedOperator
            );
            if (!isApplicable) continue;
            hasAnyPremium = true;
            const div = document.createElement('div');
            div.className = 'premium';
            
            // Stile speciale per premialità override-100
            if (data.type === 'override-100') {
                div.style.backgroundColor = '#e3f2fd';
                div.style.border = '2px solid #1976d2';
                div.style.padding = '12px';
                div.style.borderRadius = '8px';
            }
            
            let description = data.description ? `<small style="display: block; opacity: 0.8; margin-top: 4px;">${data.description}</small>` : '';
            
            // Badge per override-100
            const badge = data.type === 'override-100' ? '<span style="background: #1976d2; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.75em; margin-left: 8px;">100% SPESA</span>' : '';
            
            div.innerHTML = `
                <input type="checkbox" id="prem-${id}" name="premium" value="${id}">
                <label for="prem-${id}">${data.name}${badge}${description}</label>
            `;
            premiumsList.appendChild(div);
        }
        
        if (!hasAnyPremium) {
            premiumsList.innerHTML = '<p class="notice">Nessuna premialità globale applicabile al contesto attuale.</p>';
        }
    }

    // --- GESTIONE EVENTI ---

    function addEventListeners() {
        // Step 1: Selezione soggetto
        subjectTypeSelect.addEventListener('change', (e) => {
            state.selectedSubject = e.target.value;
            
            // Mostra step 2
            buildingCategoryGroup.style.display = 'block';
            
            // Filtra categorie immobile ammissibili per questo soggetto
            updateBuildingCategoryOptions();
            
            // Filtra le modalità di realizzazione
            updateImplementationModeOptions();
            
            // Mostra campi specifici del soggetto (es. popolazione comune per PA)
            renderSubjectSpecificFields();

            // Reset step successivi
            state.selectedBuilding = '';
            state.selectedOperator = '';
            buildingCategorySelect.value = '';
            implementationModeGroup.style.display = 'none';
            renderInterventions();
            populatePremiums();
        });

        // Step 2: Selezione categoria immobile
        buildingCategorySelect.addEventListener('change', (e) => {
            state.selectedBuilding = e.target.value;
            
            // Calcola operatorType dalla matrice
            updateOperatorType();
            
            // Mostra step 3 (se ci sono opzioni)
            updateImplementationModeOptions();
            
            // Aggiorna interventi e premialità
            renderInterventions();
            populatePremiums();
        });

        // Step 3: Modalità di realizzazione (opzionale, solo informativo)
        implementationModeSelect.addEventListener('change', (e) => {
            state.selectedMode = e.target.value;
            // Questo non influenza i calcoli, solo a scopo informativo
        });

        interventionsList.addEventListener('change', (e) => {
            if (e.target.name === 'intervention') {
                state.selectedInterventions = Array.from(
                    interventionsList.querySelectorAll('input[name="intervention"]:checked')
                ).map(input => input.value);
                updateDynamicInputs();
                populatePremiums();
            }
        });

        premiumsList.addEventListener('change', (e) => {
            if (e.target.name === 'premium') {
                state.selectedPremiums = Array.from(
                    premiumsList.querySelectorAll('input[name="premium"]:checked')
                ).map(input => input.value);
            }
        });

        calculateButton.addEventListener('click', calculateIncentive);
        
        resetButton.addEventListener('click', () => {
            location.reload();
        });
    }

    function updateBuildingCategoryOptions() {
        // Ripopola il select delle categorie in base al soggetto selezionato
        buildingCategorySelect.innerHTML = '<option value="" disabled selected>Seleziona la categoria...</option>';
        
        if (!state.selectedSubject) {
            return;
        }
        
        calculatorData.buildingCategories.forEach(building => {
            // Se la categoria ha sottocategorie, mostra solo quelle compatibili
            if (building.subcategories && building.subcategories.length > 0) {
                const compatibleSubcategories = building.subcategories.filter(sub => 
                    sub.allowedSubjects.includes(state.selectedSubject)
                );
                
                if (compatibleSubcategories.length > 0) {
                    // Crea optgroup per le sottocategorie
                    const optgroup = document.createElement('optgroup');
                    optgroup.label = building.name;
                    
                    compatibleSubcategories.forEach(sub => {
                        const option = document.createElement('option');
                        option.value = sub.id;
                        option.textContent = `${sub.name}`;
                        if (sub.description) {
                            option.textContent += ` - ${sub.description}`;
                        }
                        if (sub.note) {
                            option.title = sub.note;
                        }
                        optgroup.appendChild(option);
                    });
                    
                    buildingCategorySelect.appendChild(optgroup);
                } else {
                    // Nessuna sottocategoria compatibile, mostra categoria principale
                    if (building.allowedSubjects.includes(state.selectedSubject)) {
                        const option = document.createElement('option');
                        option.value = building.id;
                        option.textContent = `${building.name} - ${building.description}`;
                        buildingCategorySelect.appendChild(option);
                    }
                }
            } else {
                // Nessuna sottocategoria, mostra categoria principale
                if (building.allowedSubjects.includes(state.selectedSubject)) {
                    const option = document.createElement('option');
                    option.value = building.id;
                    option.textContent = `${building.name} - ${building.description}`;
                    buildingCategorySelect.appendChild(option);
                }
            }
        });
        
        // Mostra nota informativa se PA/ETS su residenziale
        const buildingNoteDiv = document.getElementById('building-category-note');
        if (buildingNoteDiv && state.selectedBuilding === 'residential') {
            const isPAorETSnonEcon = state.selectedSubject === 'pa' || state.selectedSubject === 'ets_non_economic';
            if (isPAorETSnonEcon) {
                buildingNoteDiv.style.display = 'block';
                buildingNoteDiv.innerHTML = `
                    <strong>ℹ️ Nota per PA/ETS:</strong> Su edifici residenziali sono ammessi:<br>
                    • <strong>Titolo III</strong> (fonti rinnovabili): sempre<br>
                    • <strong>Titolo II</strong> (efficienza energetica): solo su edifici di <strong>proprietà pubblica</strong> (es. ex IACP/ATER su edilizia sociale)
                `;
            } else {
                buildingNoteDiv.style.display = 'none';
            }
        }
    }

    // --- AGGIORNAMENTO UI DINAMICA ---
    
    // Funzione per validare i campi obbligatori
    function validateRequiredFields() {
        let allValid = true;
        const missingFields = [];
        
        // Verifica che sia selezionato almeno un intervento
        if (state.selectedInterventions.length === 0) {
            return { valid: false, message: 'Seleziona almeno un intervento' };
        }
        
        // Verifica che ogni intervento selezionato abbia tutti i campi compilati
        state.selectedInterventions.forEach(intId => {
            const intervention = calculatorData.interventions[intId];
            if (!intervention.inputs) return;
            
            intervention.inputs.forEach(input => {
                const value = state.inputValues[intId]?.[input.id];
                const inputEl = document.querySelector(`#input-${intId}-${input.id}`);
                
                // Valida il campo
                const isEmpty = value === null || value === undefined || value === '';
                const isInvalid = input.type === 'number' && (isEmpty || isNaN(value) || value < (input.min || 0));
                
                if (isEmpty || isInvalid) {
                    allValid = false;
                    missingFields.push(`${intervention.name}: ${input.name}`);
                    if (inputEl) {
                        inputEl.classList.add('invalid');
                    }
                } else {
                    if (inputEl) {
                        inputEl.classList.remove('invalid');
                    }
                }
            });
        });
        
        if (!allValid) {
            return { 
                valid: false, 
                message: 'Completa tutti i campi obbligatori evidenziati in rosso',
                fields: missingFields 
            };
        }
        
        return { valid: true };
    }

    function renderSubjectSpecificFields() {
        // Verifica se ci sono campi specifici per il soggetto selezionato
        const specificFields = calculatorData.subjectSpecificFields?.[state.selectedSubject];
        
        if (!specificFields || specificFields.length === 0) {
            // Nessun campo specifico, nascondi la sezione
            return;
        }

        // Crea una sezione dedicata nell'HTML dopo il building category
        let specificFieldsContainer = document.getElementById('subject-specific-fields');
        if (!specificFieldsContainer) {
            specificFieldsContainer = document.createElement('div');
            specificFieldsContainer.id = 'subject-specific-fields';
            specificFieldsContainer.className = 'form-group';
            specificFieldsContainer.style.marginTop = '20px';
            specificFieldsContainer.style.padding = '16px';
            specificFieldsContainer.style.background = '#f0f8ff';
            specificFieldsContainer.style.borderRadius = '8px';
            specificFieldsContainer.style.border = '2px solid #2196f3';
            
            // Inseriscilo dopo il building-category-group
            const buildingGroup = document.getElementById('building-category-group');
            buildingGroup.parentNode.insertBefore(specificFieldsContainer, buildingGroup.nextSibling);
        }

        specificFieldsContainer.innerHTML = '<h4 style="margin: 0 0 16px 0; color: #1976d2;">Dati aggiuntivi</h4>';

        specificFields.forEach(field => {
            const fieldDiv = document.createElement('div');
            fieldDiv.className = 'form-group';
            fieldDiv.style.marginBottom = '12px';

            if (field.type === 'checkbox') {
                // Gestione checkbox
                const checkboxWrapper = document.createElement('div');
                checkboxWrapper.style.display = 'flex';
                checkboxWrapper.style.alignItems = 'center';
                checkboxWrapper.style.gap = '8px';

                const input = document.createElement('input');
                input.type = 'checkbox';
                input.id = `subject-field-${field.id}`;
                input.name = field.id;
                input.checked = state.subjectSpecificData[field.id] || false;
                
                input.addEventListener('change', (e) => {
                    state.subjectSpecificData[field.id] = e.target.checked;
                    console.log(`Aggiornato ${field.id}:`, e.target.checked);
                });

                const label = document.createElement('label');
                label.htmlFor = input.id;
                label.textContent = field.name;
                label.style.cursor = 'pointer';
                label.style.fontWeight = 'bold';

                checkboxWrapper.appendChild(input);
                checkboxWrapper.appendChild(label);
                fieldDiv.appendChild(checkboxWrapper);

                if (field.help) {
                    const help = document.createElement('small');
                    help.className = 'info-text';
                    help.textContent = field.help;
                    help.style.display = 'block';
                    help.style.marginTop = '4px';
                    help.style.marginLeft = '28px';
                    help.style.color = '#666';
                    fieldDiv.appendChild(help);
                }
            } else {
                // Gestione input standard
                const label = document.createElement('label');
                label.textContent = field.name;
                if (!field.optional) {
                    label.innerHTML += ' <span style="color: #d32f2f;">*</span>';
                }
                fieldDiv.appendChild(label);

                const input = document.createElement('input');
                input.type = field.type || 'text';
                input.id = `subject-field-${field.id}`;
                input.name = field.id;
                if (field.min !== undefined) input.min = field.min;
                if (field.max !== undefined) input.max = field.max;
                if (field.help) input.title = field.help;
                input.value = state.subjectSpecificData[field.id] || '';
                
                input.addEventListener('input', (e) => {
                    const value = field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
                    state.subjectSpecificData[field.id] = value;
                    console.log(`Aggiornato ${field.id}:`, value);
                });

                fieldDiv.appendChild(input);

                if (field.help) {
                    const help = document.createElement('small');
                    help.className = 'info-text';
                    help.textContent = field.help;
                    help.style.display = 'block';
                    help.style.marginTop = '4px';
                    help.style.color = '#666';
                    fieldDiv.appendChild(help);
                }
            }

            specificFieldsContainer.appendChild(fieldDiv);
        });
    }

    function updateDynamicInputs() {
        dynamicInputsContainer.innerHTML = '';
        
        // NON resettare completamente, ma rimuovi solo gli interventi deselezionati
        const currentInterventions = new Set(state.selectedInterventions);
        const keysToRemove = Object.keys(state.inputValues).filter(key => !currentInterventions.has(key));
        keysToRemove.forEach(key => delete state.inputValues[key]);

        if (state.selectedInterventions.length === 0) {
            dynamicInputsContainer.innerHTML = '<p class="notice">Seleziona almeno un intervento per visualizzare i campi richiesti.</p>';
            return;
        }

        state.selectedInterventions.forEach(intId => {
            const interventionData = calculatorData.interventions[intId];
            if (!interventionData.inputs) return;

            const groupDiv = document.createElement('div');
            groupDiv.className = 'input-group';
            groupDiv.id = `group-${intId}`;

            const title = document.createElement('h3');
            title.textContent = interventionData.name;
            groupDiv.appendChild(title);

            // Inizializza solo se non esiste già
            if (!state.inputValues[intId]) {
                state.inputValues[intId] = { premiums: {} };
            }

            interventionData.inputs.forEach(input => {
                const inputDiv = document.createElement('div');
                inputDiv.className = 'form-group';
                
                const label = document.createElement('label');
                label.setAttribute('for', `input-${intId}-${input.id}`);
                label.textContent = input.name;
                inputDiv.appendChild(label);

                let inputEl;
                if (input.type === 'select') {
                    inputEl = document.createElement('select');
                    input.options.forEach(opt => {
                        const option = document.createElement('option');
                        option.value = opt;
                        option.textContent = opt;
                        inputEl.appendChild(option);
                    });
                } else {
                    inputEl = document.createElement('input');
                    inputEl.type = input.type;
                    if (input.min !== undefined) inputEl.min = input.min;
                    if (input.max !== undefined) inputEl.max = input.max;
                    if (input.step !== undefined) inputEl.step = input.step;
                }
                
                inputEl.id = `input-${intId}-${input.id}`;
                inputEl.dataset.intervention = intId;
                inputEl.dataset.inputId = input.id;
                inputDiv.appendChild(inputEl);
                groupDiv.appendChild(inputDiv);

                // Ripristina il valore salvato se esiste, altrimenti inizializza
                const savedValue = state.inputValues[intId][input.id];
                if (savedValue !== undefined && savedValue !== null) {
                    inputEl.value = savedValue;
                } else {
                    state.inputValues[intId][input.id] = inputEl.value || null;
                }
                
                inputEl.addEventListener('change', handleInputChange);
                inputEl.addEventListener('keyup', handleInputChange);
                
                // Aggiungi classe per campi obbligatori
                inputEl.classList.add('required-field');
            });

            // Sezione premi per-intervento
            const perPremWrapper = document.createElement('div');
            perPremWrapper.className = 'form-group';
            const perPremTitle = document.createElement('label');
            perPremTitle.textContent = 'Premialità applicabili a questo intervento:';
            perPremWrapper.appendChild(perPremTitle);

            let hasPerInterventionPrem = false;
            for (const [premId, premData] of Object.entries(calculatorData.premiums)) {
                if (premData.scope !== 'per-intervention') continue;
                // Il premio multi-intervento è applicato automaticamente: non mostrare la checkbox
                if (premId === 'multi-intervento') continue;
                const applicable = premData.applicableToInterventions?.includes('all') || premData.applicableToInterventions?.includes(intId);
                if (!applicable) continue;
                hasPerInterventionPrem = true;
                const premDiv = document.createElement('div');
                premDiv.className = 'premium inline';
                premDiv.innerHTML = `
                    <input type="checkbox" id="prem-int-${intId}-${premId}" data-intervention="${intId}" data-premium-id="${premId}" name="premium-int" value="${premId}">
                    <label for="prem-int-${intId}-${premId}">${premData.name}</label>
                `;
                perPremWrapper.appendChild(premDiv);

                // Inizializza lo stato solo se non esiste già
                if (state.inputValues[intId].premiums[premId] === undefined) {
                    state.inputValues[intId].premiums[premId] = false;
                }
                
                // Ripristina lo stato della checkbox
                const checkboxEl = premDiv.querySelector(`#prem-int-${intId}-${premId}`);
                checkboxEl.checked = state.inputValues[intId].premiums[premId];
                checkboxEl.addEventListener('change', handleInputChange);
            }

            if (hasPerInterventionPrem) {
                groupDiv.appendChild(perPremWrapper);
            }

            // Applica limiti dinamici DOPO che tutti gli input sono stati creati
            applyDynamicMaxLimits(intId, groupDiv);

            // Ricollega eventi di dipendenza per aggiornare i limiti quando cambiano i select
            groupDiv.querySelectorAll('select').forEach(sel => {
                sel.addEventListener('change', () => applyDynamicMaxLimits(intId, groupDiv));
            });
            groupDiv.querySelectorAll('input[type="number"]').forEach(inp => {
                inp.addEventListener('input', () => applyDynamicMaxLimits(intId, groupDiv));
            });

            dynamicInputsContainer.appendChild(groupDiv);
        });
    }

    // Limiti massimi su input numerici, applicati SOLO dove la norma è certa
    function applyDynamicMaxLimits(intId, groupDiv) {
        // Utility per trovare input dentro il gruppo
        const byId = (fieldId) => groupDiv.querySelector(`#input-${intId}-${fieldId}`);

        if (intId === 'sostituzione-infissi') {
            // Cmax: 700 €/m² (zone A,B,C) | 800 €/m² (zone D,E,F)
            const zonaSel = byId('zona_climatica');
            const costoEl = byId('costo_specifico');
            if (zonaSel && costoEl) {
                const z = zonaSel.value;
                const cmax = (z === 'D' || z === 'E' || z === 'F') ? 800 : 700;
                costoEl.max = String(cmax);
                costoEl.setAttribute('max', String(cmax));
                costoEl.title = `Valore massimo consentito: ${cmax} €/m² (Regole Applicative)`;
                costoEl.placeholder = `Max: ${cmax}`;
                
                // Aggiungi validazione live
                costoEl.addEventListener('input', function() {
                    const val = parseFloat(this.value) || 0;
                    if (val > cmax) {
                        this.style.borderColor = '#d32f2f';
                        this.style.backgroundColor = '#ffebee';
                        this.setCustomValidity(`Il valore non può superare ${cmax} €/m² (limite normativo)`);
                    } else {
                        this.style.borderColor = '';
                        this.style.backgroundColor = '';
                        this.setCustomValidity('');
                    }
                });
            }
        }

        if (intId === 'schermature-solari') {
            // Cmax per tipo
            const tipoSel = byId('tipo_schermatura');
            const costoEl = byId('costo_specifico');
            if (tipoSel && costoEl) {
                let cmax = undefined;
                switch (tipoSel.value) {
                    case 'Schermature/ombreggiamento': cmax = 250; break;
                    case 'Meccanismi automatici': cmax = 50; break;
                    case 'Filtrazione solare selettiva non riflettente': cmax = 130; break;
                    case 'Filtrazione solare selettiva riflettente': cmax = 80; break;
                }
                if (cmax) {
                    costoEl.max = String(cmax);
                    costoEl.setAttribute('max', String(cmax));
                    costoEl.title = `Valore massimo consentito: ${cmax} €/m² (Regole Applicative)`;
                    costoEl.placeholder = `Max: ${cmax}`;
                    
                    // Validazione live
                    costoEl.addEventListener('input', function() {
                        const val = parseFloat(this.value) || 0;
                        let currentCmax;
                        switch (tipoSel.value) {
                            case 'Schermature/ombreggiamento': currentCmax = 250; break;
                            case 'Meccanismi automatici': currentCmax = 50; break;
                            case 'Filtrazione solare selettiva non riflettente': currentCmax = 130; break;
                            case 'Filtrazione solare selettiva riflettente': currentCmax = 80; break;
                        }
                        if (currentCmax && val > currentCmax) {
                            this.style.borderColor = '#d32f2f';
                            this.style.backgroundColor = '#ffebee';
                            this.setCustomValidity(`Il valore non può superare ${currentCmax} €/m² (limite normativo)`);
                        } else {
                            this.style.borderColor = '';
                            this.style.backgroundColor = '';
                            this.setCustomValidity('');
                        }
                    });
                }
            }
        }

        if (intId === 'nzeb') {
            // Cmax: 1000 €/m² (zone A,B,C) | 1300 €/m² (zone D,E,F)
            const zonaSel = byId('zona_climatica');
            const costoEl = byId('costo_specifico');
            if (zonaSel && costoEl) {
                const z = zonaSel.value;
                const cmax = (z === 'A' || z === 'B' || z === 'C') ? 1000 : 1300;
                costoEl.max = String(cmax);
                costoEl.setAttribute('max', String(cmax));
                costoEl.title = `Valore massimo consentito: ${cmax} €/m² (Regole Applicative)`;
                costoEl.placeholder = `Max: ${cmax}`;
                
                // Validazione live
                costoEl.addEventListener('input', function() {
                    const val = parseFloat(this.value) || 0;
                    const currentZona = zonaSel.value;
                    const currentCmax = (currentZona === 'A' || currentZona === 'B' || currentZona === 'C') ? 1000 : 1300;
                    if (val > currentCmax) {
                        this.style.borderColor = '#d32f2f';
                        this.style.backgroundColor = '#ffebee';
                        this.setCustomValidity(`Il valore non può superare ${currentCmax} €/m² (limite normativo)`);
                    } else {
                        this.style.borderColor = '';
                        this.style.backgroundColor = '';
                        this.setCustomValidity('');
                    }
                });
            }
        }

        if (intId === 'illuminazione-led') {
            // Cmax: 15 €/m² (alta efficienza) | 35 €/m² (LED)
            const tipoSel = byId('tipo_lampada');
            const costoEl = byId('costo_specifico');
            if (tipoSel && costoEl) {
                const cmax = (tipoSel.value === 'Alta efficienza') ? 15 : 35;
                costoEl.max = String(cmax);
                costoEl.setAttribute('max', String(cmax));
                costoEl.title = `Valore massimo consentito: ${cmax} €/m² (Regole Applicative)`;
                costoEl.placeholder = `Max: ${cmax}`;
                
                // Validazione live
                costoEl.addEventListener('input', function() {
                    const val = parseFloat(this.value) || 0;
                    const currentCmax = (tipoSel.value === 'Alta efficienza') ? 15 : 35;
                    if (val > currentCmax) {
                        this.style.borderColor = '#d32f2f';
                        this.style.backgroundColor = '#ffebee';
                        this.setCustomValidity(`Il valore non può superare ${currentCmax} €/m² (limite normativo)`);
                    } else {
                        this.style.borderColor = '';
                        this.style.backgroundColor = '';
                        this.setCustomValidity('');
                    }
                });
            }
        }

        if (intId === 'building-automation') {
            // Cmax: 60 €/m²
            const costoEl = byId('costo_specifico');
            if (costoEl) {
                const cmax = 60;
                costoEl.max = String(cmax);
                costoEl.setAttribute('max', String(cmax));
                costoEl.title = `Valore massimo consentito: ${cmax} €/m² (Regole Applicative)`;
                costoEl.placeholder = `Max: ${cmax}`;
                
                // Validazione live
                costoEl.addEventListener('input', function() {
                    const val = parseFloat(this.value) || 0;
                    if (val > cmax) {
                        this.style.borderColor = '#d32f2f';
                        this.style.backgroundColor = '#ffebee';
                        this.setCustomValidity(`Il valore non può superare ${cmax} €/m² (limite normativo)`);
                    } else {
                        this.style.borderColor = '';
                        this.style.backgroundColor = '';
                        this.setCustomValidity('');
                    }
                });
            }
        }

        if (intId === 'infrastrutture-ricarica') {
            // Limite su costo_totale in base al tipo (e potenza per 22-50kW)
            const tipoSel = byId('tipo_infrastruttura');
            const potenzaEl = byId('potenza');
            const costoTot = byId('costo_totale');
            if (tipoSel && costoTot) {
                let maxCost;
                switch (tipoSel.value) {
                    case 'Standard monofase (7.4-22kW)': maxCost = 2400; break;
                    case 'Standard trifase (7.4-22kW)': maxCost = 8400; break;
                    case 'Media (22-50kW)':
                        {
                            const p = parseFloat(potenzaEl?.value || '0') || 0;
                            maxCost = p * 1200; // valore da norma
                        }
                        break;
                    case 'Alta (50-100kW)': maxCost = 60000; break;
                    case 'Oltre 100kW': maxCost = 110000; break;
                }
                if (maxCost) {
                    costoTot.max = String(Math.max(0, Math.round(maxCost)));
                    costoTot.setAttribute('max', String(Math.max(0, Math.round(maxCost))));
                    costoTot.title = `Spesa massima ammissibile: ${Math.round(maxCost).toLocaleString('it-IT')} € (Regole Applicative)`;
                    costoTot.placeholder = `Max: ${Math.round(maxCost).toLocaleString('it-IT')} €`;
                    
                    // Validazione live
                    costoTot.addEventListener('input', function() {
                        const val = parseFloat(this.value) || 0;
                        let currentMaxCost;
                        switch (tipoSel.value) {
                            case 'Standard monofase (7.4-22kW)': currentMaxCost = 2400; break;
                            case 'Standard trifase (7.4-22kW)': currentMaxCost = 8400; break;
                            case 'Media (22-50kW)':
                                {
                                    const p = parseFloat(potenzaEl?.value || '0') || 0;
                                    currentMaxCost = p * 1200;
                                }
                                break;
                            case 'Alta (50-100kW)': currentMaxCost = 60000; break;
                            case 'Oltre 100kW': currentMaxCost = 110000; break;
                        }
                        if (currentMaxCost && val > currentMaxCost) {
                            this.style.borderColor = '#d32f2f';
                            this.style.backgroundColor = '#ffebee';
                            this.setCustomValidity(`La spesa non può superare ${Math.round(currentMaxCost).toLocaleString('it-IT')} € (limite normativo)`);
                        } else {
                            this.style.borderColor = '';
                            this.style.backgroundColor = '';
                            this.setCustomValidity('');
                        }
                    });
                }
            }
        }
    }
    
    function handleInputChange(e) {
        const { intervention, inputId } = e.target.dataset;
        if (e.target.name === 'premium-int') {
            const premId = e.target.dataset.premiumId;
            const checked = e.target.checked;
            state.inputValues[intervention].premiums[premId] = checked;
            return;
        }
        const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
        state.inputValues[intervention][inputId] = value;
        
        // Valida in tempo reale
        validateRequiredFields();
    }

    // --- LOGICA DI CALCOLO ---

    function calculateIncentive() {
        // Verifica che siano completati gli step obbligatori
        if (!state.selectedSubject) {
            alert('Completa lo Step 1: seleziona chi ha la disponibilità dell\'immobile');
            return;
        }
        
        if (!state.selectedBuilding) {
            alert('Completa lo Step 2: seleziona la categoria catastale dell\'immobile');
            return;
        }
        
        if (!state.selectedOperator) {
            alert('Errore: non è stato possibile determinare il tipo di operatore. Verifica i dati inseriti.');
            return;
        }
        
        // Valida tutti i campi obbligatori
        const validation = validateRequiredFields();
        if (!validation.valid) {
            let message = validation.message;
            if (validation.fields && validation.fields.length > 0) {
                message += '\n\nCampi mancanti:\n' + validation.fields.join('\n');
            }
            alert(message);
            return;
        }

        // Prepara input per calcolo combinato ufficiale (include premi per-intervento selezionati)
        const inputsByIntervention = {};
        state.selectedInterventions.forEach(intId => {
            inputsByIntervention[intId] = { ...(state.inputValues[intId] || {}), premiums: { ...(state.inputValues[intId]?.premiums || {}) } };
        });

        // Prepara dati di contesto per incentivo al 100% automatico
        const contextData = {
            buildingSubcategory: state.buildingSubcategory,
            is_piccolo_comune: state.subjectSpecificData.is_piccolo_comune || false,
            subjectType: state.selectedSubject
        };

        // 1. Calcolo combinato con gestione automatica di premi globali e massimali
        const combo = calculatorData.calculateCombinedIncentives(
            state.selectedInterventions,
            inputsByIntervention,
            state.selectedOperator,
            state.selectedPremiums,
            contextData
        );

        let detailsHtml = '<h4>Dettaglio Calcolo per Intervento:</h4><ul class="int-list">';

        // 1.a Dettaglio per ciascun intervento con formula e variabili
        state.selectedInterventions.forEach(intId => {
            const intervention = calculatorData.interventions[intId];
            const params = inputsByIntervention[intId];
            const detail = combo.details.find(d => d.id === intId);
            const value = detail ? detail.finalIncentive : 0;

            // Spiegazione dettagliata
            let explainBlock = '';
            if (typeof intervention.explain === 'function') {
                try {
                    const exp = intervention.explain(params, state.selectedOperator) || {};
                    const vars = exp.variables || {};
                    const steps = exp.steps || [];
                    const formula = exp.formula ? `<div class="formula">🧮 Formula: <span>${exp.formula}</span></div>` : '';
                    const varsRows = Object.entries(vars).map(([k,v]) => `<tr><td>${k}</td><td>${formatValue(v)}</td></tr>`).join('');
                    const stepsList = steps.length ? `<ol class="steps">${steps.map(s=>`<li>${s}</li>`).join('')}</ol>` : '';
                    const refs = intervention.category === 'Efficienza Energetica' ? ['Art. 5 - Interventi di efficienza energetica'] : ['Art. 8 - Fonti rinnovabili per la produzione di energia termica'];
                    const refsHtml = `<div class="refs"><strong>Riferimenti:</strong> ${refs.join(' · ')}</div>`;

                    // Premi per-intervento applicati
                    let perPremHtml = '';
                    if (detail && detail.appliedPremiums && detail.appliedPremiums.length) {
                        perPremHtml = `<div class="premi-int"><strong>Premialità sull'intervento:</strong> <ul>` +
                            detail.appliedPremiums.map(p=>`<li>${p.name}: € ${formatMoney(p.value)}</li>`).join('') +
                            `</ul></div>`;
                    }

                    explainBlock = `
                        <button class="details-toggle" data-target="det-${intId}">Mostra dettagli</button>
                        <div id="det-${intId}" class="details-panel" hidden>
                            ${formula}
                            <div class="vars-wrapper">
                                <table class="vars-table"><thead><tr><th>Variabile</th><th>Valore</th></tr></thead><tbody>${varsRows}</tbody></table>
                            </div>
                            ${stepsList}
                            ${perPremHtml}
                            ${refsHtml}
                        </div>
                    `;
                } catch (e) {
                    console.warn('Spiegazione non disponibile per', intId, e);
                }
            }

            detailsHtml += `<li>Incentivo per "${intervention.name}": <strong>€ ${formatMoney(value)}</strong>${explainBlock}</li>`;
        });
        detailsHtml += '</ul>';

        // 3. Documentazione richiesta per le premialità selezionate
        const documentationRequired = [];
        state.selectedPremiums.forEach(premId => {
            const premium = calculatorData.premiums[premId];
            if (premium && premium.requiresDocumentation && premium.isApplicable(state.selectedInterventions, state.inputValues, state.selectedOperator)) {
                documentationRequired.push(`<strong>${premium.name}</strong>: ${premium.requiresDocumentation}`);
            }
        });
        if (documentationRequired.length > 0) {
            detailsHtml += '<h4>📋 Documentazione Obbligatoria per Premialità:</h4>';
            detailsHtml += '<ul class="notice">';
            documentationRequired.forEach(doc => {
                detailsHtml += `<li>${doc}</li>`;
            });
            detailsHtml += '</ul>';
        }

        // 4. Informazioni sui vincoli e sulla documentazione generale
        detailsHtml += '<h4>⚠️ Requisiti Generali:</h4>';
        detailsHtml += '<ul class="notice">';
        detailsHtml += '<li>Non devono essere percepiti altri incentivi statali sulla medesima spesa</li>';
        detailsHtml += '<li>Gli apparecchi devono essere nuovi o ricondizionati e rispettare i requisiti minimi ecodesign</li>';
        detailsHtml += '<li>Deve essere disponibile la diagnosi energetica e l\'APE (dove obbligatori)</li>';
        detailsHtml += '<li>I limiti di spesa ammissibile devono rispettare i massimali previsti dalla normativa</li>';
        detailsHtml += '</ul>';

        // 4.b Riepilogo premi globali e massimali
        detailsHtml += '<h4>🎯 Premi Globali e Massimali:</h4>';
        if (combo.appliedGlobalPremiums && combo.appliedGlobalPremiums.length) {
            detailsHtml += '<ul>' + combo.appliedGlobalPremiums.map(p=>`<li>${p.name}: <strong>€ ${formatMoney(p.value)}</strong></li>`).join('') + '</ul>';
        } else {
            detailsHtml += '<p class="notice">Nessuna premialità globale applicata.</p>';
        }
        if (combo.wasCapped) {
            detailsHtml += `<p class="notice">Tetto massimo per soggetto applicato: totale originario € ${formatMoney(combo.originalTotal)}, totale dopo cap € ${formatMoney(combo.total)}.</p>`;
        }
        
        // 5. Disclaimer legale
        detailsHtml += '<div class="disclaimer">';
        detailsHtml += '<h4>⚖️ Avvertenze Legali</h4>';
        detailsHtml += '<p><strong>ATTENZIONE:</strong> Il presente simulatore fornisce una <strong>stima indicativa</strong> dell\'incentivo spettante basata sui dati inseriti dall\'utente. ';
        detailsHtml += 'Il <strong>calcolo definitivo dell\'incentivo</strong> sarà effettuato dal GSE (Gestore dei Servizi Energetici) in fase di:</p>';
        detailsHtml += '<ul>';
        detailsHtml += '<li>Presentazione della pratica ufficiale</li>';
        detailsHtml += '<li>Istruttoria tecnico-amministrativa</li>';
        detailsHtml += '<li>Verifica della documentazione probatoria</li>';
        detailsHtml += '</ul>';
        detailsHtml += '<p>Il GSE <strong>non assume alcuna responsabilità</strong> per eventuali inesattezze, errori o discrepanze tra i valori stimati dal presente simulatore e gli importi effettivamente riconosciuti. ';
        detailsHtml += 'L\'ammissione all\'incentivo e la determinazione del suo ammontare sono subordinate all\'esito positivo dell\'istruttoria condotta dal GSE secondo i criteri stabiliti dal D.M. Conto Termico 3.0.</p>';
        detailsHtml += '</div>';

        // 6. Mostra i risultati
        incentiveResultEl.textContent = `€ ${formatMoney(combo.total)}`;
        resultDetailsEl.innerHTML = detailsHtml;
        resultsContainer.style.display = 'block';

        // Wiring toggle eventi
        resultDetailsEl.querySelectorAll('.details-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-target');
                const panel = document.getElementById(id);
                const isHidden = panel.hasAttribute('hidden');
                if (isHidden) { panel.removeAttribute('hidden'); btn.textContent = 'Nascondi dettagli'; }
                else { panel.setAttribute('hidden', ''); btn.textContent = 'Mostra dettagli'; }
            });
        });
    }

    // Avvia l'applicazione
    initialize();
}

// Inizializza quando il DOM è pronto
document.addEventListener('DOMContentLoaded', initCalculator);

// Utilità formattazione/esportazione
function formatMoney(v){
    const n = Number(v)||0; return n.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function formatValue(v){
    if (typeof v === 'number') return formatMoney(v);
    if (typeof v === 'boolean') return v ? 'Sì' : 'No';
    return v;
}
function downloadText(content, filename, mime){
    const blob = new Blob([content], { type: mime||'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    setTimeout(()=>URL.revokeObjectURL(url), 5000);
}