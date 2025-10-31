
// calculator.ts - GENERATO AUTOMATICAMENTE da sync-to-wasm.js
// NON MODIFICARE MANUALMENTE - Modifica src/data.js invece

// ============================================
// FUNZIONI DI CALCOLO INCENTIVI
// ============================================

// Utility functions
function min(a: f64, b: f64): f64 {
    return a < b ? a : b;
}

function max(a: f64, b: f64): f64 {
    return a > b ? a : b;
}

// ============================================
// 1.A - ISOLAMENTO TERMICO
// ============================================
export function calcolaIsolamento(
    superficie: f64,
    costoSpecifico: f64,
    zonaClimatica: i32,
    operatorType: i32,
    prodottiUE: bool
): f64 {
    const cmax: f64 = 300.0;
    const costoEffettivo = min(costoSpecifico, cmax);
    
    let percentuale: f64 = 0.40;
    if (operatorType === 0) { // PA
        percentuale = 1.0;
    } else if (zonaClimatica >= 4) { // Zone E,F
        percentuale = 0.50;
    }
    
    let incentivo = percentuale * costoEffettivo * superficie;
    
    if (prodottiUE) {
        incentivo *= 1.10;
    }
    
    return min(incentivo, 1000000.0);
}

// ============================================
// 1.B - INFISSI
// ============================================
export function calcolaInfissi(
    superficie: f64,
    costoSpecifico: f64,
    zonaClimatica: i32,
    operatorType: i32,
    prodottiUE: bool
): f64 {
    const cmaxInfissi = (zonaClimatica >= 3) ? 800.0 : 700.0;
    const costoEffettivo = min(costoSpecifico, cmaxInfissi);
    
    let percentuale: f64 = 0.40;
    if (operatorType === 0) {
        percentuale = 1.0;
    } else if (zonaClimatica >= 4) {
        percentuale = 0.50;
    }
    
    let incentivo = percentuale * costoEffettivo * superficie;
    
    if (prodottiUE) {
        incentivo *= 1.10;
    }
    
    return min(incentivo, 500000.0);
}

// ============================================
// AGGIUNGI ALTRE FUNZIONI QUI
// TODO: Implementare gli altri 14 interventi
// ============================================

// Funzione helper per mappare tipo operatore
// 0 = PA, 1 = private_tertiary, 2 = private_residential
export function getOperatorType(type: i32): i32 {
    return type;
}

// Funzione helper per zona climatica
// 0=A, 1=B, 2=C, 3=D, 4=E, 5=F
export function getZonaClimaticaIndex(zona: i32): i32 {
    return zona;
}
