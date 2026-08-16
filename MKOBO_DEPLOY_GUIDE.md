# 🚀 Mwongozo Kamili wa Kuhamisha Mfumo: VS Code ➔ GitHub ➔ Render

Mwongozo huu unakuelekeza hatua kwa hatua jinsi ya kupakua mfumo huu, kuufungua kwenye **VS Code**, kuupandisha **GitHub**, na kuurusha live kwenye **Render** kwa njia salama na yenye **Uhimilivu wa 100% (High Availability & Offline Fallback)** hata kama Supabase ikipata hitilafu.

---

## 🛡️ 1. Mfumo Unavyolinda Watumiaji Hata Supabase Ikizingua (Zero Downtime Resilience)

Mfumo umejengwa kwa usanifu wa **Hybrid Offline-First Persistence & Resilient Fallback**:
1. **IndexedDB + LocalStorage Offline Persistence**:
   - Data zote za Taasisi, Wanachama, Akiba, Hisa, Mikopo, Malipo na Stakabadhi zimehifadhiwa pia ndani ya kifaa/kivinjari kwa usalama wa hali ya juu.
   - Hata Supabase ikizima au kukosa mtandao, watumiaji wanaweza **kuingia (Login)**, kuangalia akaunti zao, kusajili wanachama na kufanya miamala bila kupokea hitilafu wala kuzuiwa.
2. **Auto-Timeout Guards (Sekunde 4)**:
   - Supabase inapochelewa kujibu au ikipata tatizo la mtandao, mfumo unasubiri sekunde chache na kubadili mara moja kwenda kwenye Offline Cache bila mtumiaji kuhisi kuchelewa au kukwama.
3. **Multi-Role Instant Authentication**:
   - Akaunti za SuperAdmin, Institution Admin, na Wanachama zina cryptographic local fallback authentication inayofanya kazi wakati wote.

---

## 💻 2. Hatua ya Kwanza: Kupeleka Mfumo kwenye VS Code

1. **Pakua Msimbo (Download ZIP)**:
   - Kwenye menu ya juu ya AI Studio, bofya **Settings** (alama ya gia) kisha chagua **Export to ZIP** au **Download Code**.
2. **Fungua kwenye VS Code**:
   - Fungua folda uliyopakua ndani ya **VS Code** (`File > Open Folder`).
3. **Sakinisha Package (Dependencies)**:
   - Fungua Terminal ndani ya VS Code (`Ctrl + \`` au `Terminal > New Terminal`):
   ```bash
   npm install
   ```
4. **Kujaribu Mfumo Ndani ya VS Code**:
   ```bash
   npm run dev
   ```
   - Mfumo utafunguka kwenye `http://localhost:3000`.

---

## 🐙 3. Hatua ya Pili: Kupeleka Mfumo kwenye GitHub

1. **Tengeneza Repository Mpya kwenye GitHub**:
   - Ingia kwenye akaunti yako ya [GitHub](https://github.com).
   - Bofya **New Repository** (mfano lipe jina `saccos-vicoba-platform`).
   - Usiweke alama ya *README* au *.gitignore* kwa sababu tayari vipo kwenye mfumo.
2. **Pandisha Msimbo (Git Push)**:
   - Ndani ya Terminal ya VS Code, tekeleza amri hizi:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: SACCOS & VICOBA Platform with Resilient Supabase Fallback"
   git branch -M main
   git remote add origin https://github.com/JINA_LAKO_LA_GITHUB/saccos-vicoba-platform.git
   git push -u origin main
   ```

---

## ☁️ 4. Hatua ya Tatu: Kupeleka Mfumo Live kwenye Render

Render inatoa huduma ya bure na ya haraka ya kurusha mifumo ya Full-Stack Node.js / React:

1. **Ingia Render**:
   - Tembelea [Render.com](https://render.com) na ujiunge au ingia kwa akaunti yako ya GitHub.
2. **Tengeneza Web Service Mpya**:
   - Bofya kitufe cha **New +** kisha chagua **Web Service**.
   - Chagua repository yako ya GitHub uliyoipandisha (`saccos-vicoba-platform`).
3. **Weka Mipangilio (Settings)**:
   - **Name**: `saccos-vicoba-platform` (au jina unalotaka)
   - **Region**: `Frankfurt (EU Central)` au iliyo karibu
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm install && npm run build
     ```
   - **Start Command**:
     ```bash
     npm start
     ```
   - **Plan Type**: `Free`
4. **Environment Variables (Kwenye Tab ya Environment)**:
   Weka vigezo vifuatavyo kama unavyo (kumbuka hata usipoviweka, mfumo unafanya kazi kikamilifu):
   - `NODE_ENV` = `production`
   - `PORT` = `3000`
   - `GEMINI_API_KEY` = *(Weka Gemini API Key yako ya Google AI Studio kwa ajili ya OCR na AI Scanner)*
   - `VITE_SUPABASE_URL` = *(URL ya Supabase kama unayo, vinginevyo acha wazi)*
   - `VITE_SUPABASE_ANON_KEY` = *(Anon Key ya Supabase kama unayo)*
5. **Bofya "Create Web Service"**:
   - Render itaanza kujenga (build) na baada ya dakika 1-2 mfumo utakuwa Live mtandaoni na kupewa link rasmi kama:
     `https://saccos-vicoba-platform.onrender.com`

---

## 🔑 Akaunti za Majaribio (Default Logins)

Hata kama Supabase haijaunganishwa au imezimika:

| Portal | Username / Identity | Neno la Siri (Password) |
| :--- | :--- | :--- |
| **SuperAdmin Portal** | `superadmin` | `Admin2026!` |
| **PBZ SACCOS Admin** | `admin_pbz` | `Password123!` |
| **Kiponda VICOBA Admin** | `admin_kiponda` | `Password123!` |
| **Mwanachama (Member)** | `PBZ-2024-001` au `0777123456` | `Password123!` |
| **Mwanachama 2** | `VIC-2024-001` au `0778889900` | `Password123!` |

---

Kila kitu kimeandaliwa kwa ubora wa juu tayari kwa uzalishaji (production-ready).
