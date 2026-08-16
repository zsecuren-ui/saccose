# Swahili & English Guide: Running Tests & VSCode Setup (Mwongozo wa VSCode na Vipimo)

Mwongozo huu unatoa maelezo yote ya kuendesha mfumo wa **ISACCOS & Zanzibar VICOBA Digital Platform**, kufanya majaribio ya kodi (Unit Tests, Integration Tests, Functional Playwright E2E Tests), na kusanidi mazingira ya Visual Studio Code (VSCode).

---

## 1. Jinsi ya Kuendesha Mfumo Katika VSCode (Running in VSCode)

### Hatua za Kuanzia (Prerequisites)
- Hakikisha umesakinisha **Node.js (v18 au zaidi)** na **npm**.
- Sakinisha **Visual Studio Code (VSCode)**.

### Kuanzisha Dev Server:
1. Fungua folda ya mradi katika VSCode: `File -> Open Folder...`
2. Fungua Terminal katika VSCode (`Ctrl + ~` au `Terminal -> New Terminal`).
3. Pakua au thibitisha packages zote zimesakinishwa:
   ```bash
   npm install
   ```
4. Anzisha Server ya Maendeleo (Dev Server):
   ```bash
   npm run dev
   ```
5. Fungua kivinjari (Browser) kupitia Anwani:
   `http://localhost:3000`

---

## 2. Kuangalia na Kujaribu Mwonekano wa Simu, Tablet, na PC (Responsive Testing)

Mfumo umeundwa na Tailwind CSS kufanya kazi kwa ufanisi katika vioo vyote (Responsive Layout):
- **PC / Desktop (Screen wide > 1024px)**: Mwonekano kamili wa meza, dashboards za pande zote 4, na mchanganuo wa takwimu.
- **Tablet (768px - 1024px)**: Mwonekano wa safu 2 wa kadi na gridi zenye uthabiti.
- **Mobile (< 768px)**: Kadi maalum za wanachama, menyu ya kuporomoka (mobile navigation drawer), na vitufe vya haraka vya kugusa.

### Jinsi ya kuangalia Mobile/Tablet katika VSCode au Chrome:
1. Katika Google Chrome/Edge, bonyeza `F12` au Right Click -> **Inspect**.
2. Bonyeza **Toggle Device Toolbar** (`Ctrl + Shift + M`).
3. Chagua kioo cha **iPhone 14 / Pixel 5** (Simu) au **iPad Air** (Tablet).

---

## 3. Vipimo vya Kodi (Running Tests)

Mfumo una aina tatu kuu za vipimo vya kodi:

### A. Unit Tests (Vipimo vya Moduli za Msingi)
Inapima kanuni za hisabati za mikopo, ukokotoaji wa riba, na uumbaji wa faili za export (CSV/Excel).
```bash
npm run test:unit
```

### B. Integration Tests (Vipimo vya Muungano wa Komponents)
Inapima jinsi AppContext na komponents za React (mfano `MemberManagement`) zinavyofanya kazi pamoja wakati wa kusajili wanachama au kubadilisha taarifa.
```bash
npm run test:integration
```

### C. Playwright Functional E2E Tests (Vipimo vya Utendaji wa Mfumo Wote)
Inapima mtiririko mzima wa mtumiaji (Authentication Flow, Navigation across Public, Tenant, Member, and SuperAdmin Portals).

1. Sakinisha Playwright Browsers (ikiwa ni mara ya kwanza):
   ```bash
   npx playwright install
   ```
2. Endesha majaribio yote ya Playwright:
   ```bash
   npm run test:e2e
   ```
3. Endesha Playwright kwenye **Interactive Visual UI** (Inaonyesha kivinjari kikijiendesha chenyewe):
   ```bash
   npm run test:e2e:ui
   ```

---

## 4. Vipengele vya Wanachama: Usajili wa Wanachama (1 mpaka 50)

Kipengele hiki kinamwezesha mwanachama yeyote aliyemo kwenye portal ya **Mwanachama (Member Dashboard)** kusajili au kuwaalika wanachama wapya kuanzia **1 mpaka 50** kwa hatua rahisi:

1. Ingia kwenye Portal ya **Mwanachama**.
2. Kwenye sehemu ya juu (Header Banner), bonyeza kitufe cha dhahabu: **"Sajili Wanachama Wapya (1 - 50)"**.
3. Kwenye Dirisha la Usajili (Modal Window):
   - Tumia Slide Bar au Vitufe vya Haraka **[1, 5, 10, 25, 50]** kuchagua idadi ya wanachama unaotaka kuwasajili.
   - Weka **Jina la Msingi la Kikundi/Wanachama** (Prefix).
   - Bonyeza **"Kamilisha Usajili wa Wanachama"**.
4. Mfumo utazalisha namba za uanachama za mfululizo (`MEM-XXXX`) na kuwahifadhi papo hapo kwenye taasisi!

---

## 5. Mapendekezo ya Extensions za VSCode (Recommended Extensions)
- **Vitest**: `vitest.explorer` (Inaonyesha vipimo vyote vya Vitest moja kwa moja kwenye VSCode sidebar).
- **Playwright**: `ms-playwright.playwright` (Inakuruhusu kuendesha E2E tests kwa kubonyeza Play button pembeni ya kodi).
- **Tailwind CSS IntelliSense**: `bradlc.vscode-tailwindcss`.
- **ESLint / Prettier**: Kwa kuhakikisha usafi wa kodi.
