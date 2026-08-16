# Mwongozo wa Ku-run Mfumo kwenye VS Code na Localhost (VS Code Localhost Setup Guide)

Mwongozo huu unakupa maelekezo ya hatua kwa hatua jinsi ya kufungua na ku-run mfumo huu wa **SACCOS / Microfinance Core Engine** kwenye tarakilishi (kompyuta) yako kwa kutumia **Visual Studio Code (VS Code)** na **Localhost**.

---

## 📋 1. Vitu Unavyohitaji Kabla ya Kuanza (Prerequisites)

1. **Node.js**: Hakikisha ume-install Node.js (Version 18.x au 20.x au mpya zaidi).
   - [Pakua Node.js Hapa](https://nodejs.org/)
   - Kagua kama ipo kwa kuandika kwenye terminal:
     ```bash
     node -v
     npm -v
     ```
2. **VS Code**: Visual Studio Code editor.
   - [Pakua VS Code Hapa](https://code.visualstudio.com/)
3. **Git** (Hiari lakini inashauriwa):
   - [Pakua Git Hapa](https://git-scm.com/)

---

## 🚀 2. Hatua za Ku-run Mfumo Kwenye Localhost

### Hatua ya 1: Fungua Mradi Kwenye VS Code
1. Fungua **VS Code**.
2. Nenda kwenye **File** ➔ **Open Folder...** (au bonyeza `Ctrl + O` / `Cmd + O`).
3. Chagua folda yenye mradi huu.
4. Au kwenye terminal ya kompyuta yako:
   ```bash
   cd njia/ya/folda/ya/mradi
   code .
   ```

### Hatua ya 2: Fungua Terminal Ndani ya VS Code
- Bonyeza `Ctrl + ~` (au `Cmd + ~` kwenye Mac) au nenda kwenye menu ya juu: **Terminal** ➔ **New Terminal**.

### Hatua ya 3: Weka Dependencies (Install NPM Packages)
Kwenye Terminal ya VS Code, andika amri hii kisha ubonyeze `Enter`:
```bash
npm install
```
*Hii itapakua maktaba zote zinazohitajika (React, Vite, Lucide Icons, Recharts, n.k).*

### Hatua ya 4: Weka Environment Variables (`.env`)
Mfumo unakuja na faida ya `.env.example`. Tengeneza faili jipya linaloitwa `.env` kwenye root folder na uweke variables zako:
```env
# Mfano wa .env
VITE_APP_TITLE="SACCOS & Microfinance Management System"
# GEMINI_API_KEY=weka_key_yako_hapa (kama unatumia AI Features)
```

### Hatua ya 5: Anzisha Local Dev Server (Run Project)
Andika amri hii kwenye Terminal:
```bash
npm run dev
```

Ukiona matokeo kama haya:
```text
  VITE v6.2.3  ready in 320 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://0.0.0.0:3000/
```

### Hatua ya 6: Fungua Mfumo kwenye Browser
- Fungua Web Browser yako (Chrome, Edge, Firefox, au Safari).
- Nenda kwenye anuani: **`http://localhost:3000`**
- Pia unaweza kubonyeza `Ctrl + Click` kwenye link ya `http://localhost:3000` inayotokea kwenye Terminal ya VS Code.

---

## 🧪 3. Jinsi ya Ku-run Tests (Vipimo vya Mfumo)

Mfumo umejumuisha vipimo vya Automated Unit Tests, Integration Tests, na E2E Tests.

1. **Kukagua TypeScript Syntax & Errors (Lint):**
   ```bash
   npm run lint
   ```
2. **Kukimbiza Unit Tests & Integration Tests zote (Vitest):**
   ```bash
   npm run test
   ```
3. **Kukimbiza Unit Tests Pekee:**
   ```bash
   npm run test:unit
   ```
4. **Kukimbiza Integration Tests Pekee:**
   ```bash
   npm run test:integration
   ```
5. **Kukimbiza End-to-End (E2E) Browser Tests (Playwright):**
   ```bash
   npm run test:e2e
   ```
6. **Kukimbiza Playwright E2E wenye UI Interactive Runner:**
   ```bash
   npm run test:e2e:ui
   ```

---

## 🛠️ 4. VS Code Extensions Zinazoshauriwa (Recommended Extensions)

Akaunti ya VS Code inashauriwa kuwa na extensions zifuatazo kwa urahisi wa ujenzi na uendeshaji:

1. **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
   - Inakupa auto-complete na mapendekezo ya Tailwind CSS classes.
2. **ESLint** (`dbaeumer.vscode-eslint`)
   - Inakagua makosa ya kificho (code quality & syntax formatting).
3. **Vitest Runner** (`vitest.explorer`)
   - Inakuruhusu ku-run na kuona matokeo ya vipimo moja kwa moja kwenye VS Code side panel.
4. **Playwright Test for VS Code** (`ms-playwright.playwright`)
   - Inakuruhusu ku-run E2E tests na kuziona zikijiendesha kwenye mtandao.
5. **Prettier - Code formatter** (`esbenp.prettier-vscode`)
   - Inapanga msimbo kwa uzuri (formatting).

---

## 📦 5. Kuandaa Mfumo kwa Ajili ya Production (Build Project)

Kama unataka kurusha mfumo kwenye server rasmi (Cloud Run, Netlify, Vercel, VPS):
```bash
npm run build
```
Faili zote za uzalishaji zitatengenezwa ndani ya folda la `/dist`.

---

## ❓ 6. Utatuzi wa Changamoto (Troubleshooting)

- **Port 3000 ipo busy?**
  Kama port 3000 inatumika na programu nyingine, unaweza kubadilisha port kwenye `package.json`:
  ```json
  "dev": "vite --port=3001 --host=0.0.0.0"
  ```
- **Module Not Found / Missing Packages?**
  Run `npm install` au futa `node_modules` kisha upakue upya:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

---
*SACCOS & Microfinance Management System - Engineered for High Scalability and Ease of Local Operation.*
