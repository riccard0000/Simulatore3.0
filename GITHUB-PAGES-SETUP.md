# 📦 Come Pubblicare su GitHub Pages

Segui questi passaggi per pubblicare il Simulatore Conto Termico 3.0 su GitHub Pages.

## 1️⃣ Crea Repository su GitHub

1. Vai su [github.com](https://github.com)
2. Clicca su **"+"** in alto a destra → **"New repository"**
3. Dai un nome al repository, ad esempio: `Simulatore-CT30`
4. **NON** selezionare "Initialize with README" (abbiamo già i file)
5. Clicca su **"Create repository"**

## 2️⃣ Collega il Repository Locale

Copia il comando che GitHub ti mostra (sostituisci `[tuo-username]` con il tuo username):

```powershell
git remote add origin https://github.com/[tuo-username]/Simulatore-CT30.git
```

## 3️⃣ Publica il Codice

Esegui questi comandi in ordine:

```powershell
# Publica branch master (codice sorgente)
git push -u origin master

# Publica branch gh-pages (sito web)
git push -u origin gh-pages
```

## 4️⃣ Attiva GitHub Pages

1. Vai su GitHub nel tuo repository
2. Clicca su **"Settings"** (Impostazioni)
3. Nel menu a sinistra, clicca su **"Pages"**
4. Sotto **"Source"**, seleziona:
   - **Branch**: `gh-pages`
   - **Folder**: `/ (root)`
5. Clicca su **"Save"**

## 5️⃣ Verifica la Pubblicazione

Dopo alcuni minuti, GitHub Pages mostrerà l'URL del sito:

```
https://[tuo-username].github.io/Simulatore-CT30/
```

Clicca sul link per verificare che il simulatore funzioni correttamente!

## 🔄 Aggiornare il Sito

Quando fai modifiche al simulatore:

```powershell
# 1. Fai le tue modifiche nei file in src/

# 2. Commit delle modifiche su master
git add .
git commit -m "Descrizione modifiche"
git push origin master

# 3. Aggiorna gh-pages con le nuove modifiche
git checkout gh-pages
Copy-Item src/* . -Recurse -Force
git add .
git commit -m "Update: descrizione modifiche"
git push origin gh-pages

# 4. Torna a master
git checkout master
```

Dopo il push, GitHub Pages aggiornerà automaticamente il sito (può richiedere 1-2 minuti).

## 🛠️ Script di Deploy Automatico

Per semplificare gli aggiornamenti, puoi usare questo script PowerShell:

```powershell
# deploy.ps1
git add .
git commit -m "Update simulatore"
git push origin master

git checkout gh-pages
Copy-Item src/* . -Recurse -Force
git add .
git commit -m "Deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
git push origin gh-pages
git checkout master

Write-Host "✅ Deploy completato! Il sito verrà aggiornato in 1-2 minuti." -ForegroundColor Green
```

Salva come `deploy.ps1` e esegui con:

```powershell
.\deploy.ps1
```

## 🎨 Personalizzazione

Se vuoi personalizzare il README visibile su GitHub Pages:

1. Modifica il file `README-GITHUB-PAGES.md`
2. Rinominalo in `README.md` nella branch `gh-pages`
3. Aggiorna l'URL `[tuo-username]` con il tuo username GitHub

## ❓ Problemi Comuni

**Il sito non si carica:**
- Verifica che la branch `gh-pages` sia pubblicata
- Controlla che GitHub Pages sia attivato nelle Settings
- Aspetta 1-2 minuti dopo il push

**Errori 404:**
- Assicurati che i file `index.html`, `data.js`, `script.js`, `style.css` siano nella root della branch `gh-pages`
- Controlla che i percorsi nei file HTML siano relativi (senza `/` iniziale)

**Modifiche non visibili:**
- Svuota la cache del browser (Ctrl+F5)
- Aspetta qualche minuto per la propagazione
- Verifica di aver fatto push su `gh-pages` (non solo su `master`)

## 📞 Supporto

Per problemi con GitHub Pages, consulta la [documentazione ufficiale](https://docs.github.com/pages).

---

✨ **Buona pubblicazione!**
