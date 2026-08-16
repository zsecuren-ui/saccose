# ISACCOS & Zanzibar VICOBA Multi-Tenant Financial Management Platform

Mfumo kamili wa kisasa wa kusimamia **SACCOS, VICOBA, Microfinance, na Taasisi za Kifedha za Zanzibar na Tanzania Mainland**.

---

## 🌟 Vipengele Kuu vya Mfumo (Key Features)

1. **Multi-Tenant Architecture**:
   - SuperAdmin Portal ya kusimamia Taasisi nyingi (SaaS Subscriptions, Multi-currency, System Audits).
   - Backup ya papo hapo ya Database yote katika faili la **ZIP** (One-Click Database ZIP Export).

2. **Tenant Admin Portal**:
   - Usimamizi wa Wanachama (Single & Batch Registration 1 - 200).
   - Usimamizi wa Mikopo na Uidhinishaji (Loan Approvals & Disbursement).
   - Repoti za Kihesabu za Settlement (Settlement & Financial Audits).
   - Payment Gateways Integration (AzamPay, M-Pesa, TigoPesa, Airtel Money, NMB, CRDB).

3. **Member Portal (Mwanachama Portal)**:
   - Dashboard binafsi ya kuangalia Akiba, Hisa, na Mikopo.
   - **Usajili wa Wanachama Wapya (1 mpaka 50)**: Mwanachama anaweza kusajili au kuwaalika wanachama 1 mpaka 50 chini ya namba yake ya uanachama.
   - Ombi la mkopo la papo hapo na Uwekaji wa Akiba.
   - Pakia Resiti za Malipo (Proof of Payment Upload).

4. **Responsive Layout (PC, Tablet, Mobile)**:
   - Imejengwa kufanya kazi vizuri na kwa ufasaha katika skrini za Desktop/PC, Tablet, na Simu za mkononi.

---

## 🚀 Kuanzisha Mfumo katika VSCode (Getting Started)

### Kuanzisha Dev Server:
```bash
# 1. Pakua au Sasisha Dependencies
npm install

# 2. Anzisha Dev Server (Inatumia Port 3000)
npm run dev
```

Fungua anwani hii kwenye kivinjari:
`http://localhost:3000`

---

## 🚀 Mwongozo wa VS Code, GitHub & Render Deployment

Tazama mwongozo kamili ulioandaliwa kwa Kiswahili katika faili la **[`MKOBO_DEPLOY_GUIDE.md`](./MKOBO_DEPLOY_GUIDE.md)** au faili la **[`render.yaml`](./render.yaml)**.

### Mfumo Hata Supabase Ikikosa Mtandao (Zero-Downtime Resilience):
- Mfumo una **IndexedDB & LocalStorage Engine** iliyounganishwa na timeout guards za kiotomatiki.
- Hata kama akaunti ya Supabase haijawekwa au intaneti ikasita, watumiaji wanaweza kuingia (**Login**), kuona akaunti zao, na kutumia kila huduma bila kukwama.

### Amri za Haraka (Quick Commands):
```bash
# 1. Kusanidi ndani ya VS Code
npm install
npm run dev

# 2. Kujenga (Build) kwa uzalishaji / Render
npm run build
npm start
```


Mfumo umeunganishwa na zana za kisasa za majaribio (`Vitest` na `Playwright`):

| Aina ya Kipimo | Amri (Command) | Maelezo |
| :--- | :--- | :--- |
| **Unit Tests** | `npm run test:unit` | Inapima kanuni za hisabati na export utilities |
| **Integration Tests** | `npm run test:integration` | Inapima muunganiko wa React Components & AppContext |
| **Functional E2E Tests** | `npm run test:e2e` | Playwright E2E tests kwa mtiririko wote wa authentication & portals |
| **Playwright Visual UI** | `npm run test:e2e:ui` | E2E Dashboard na kivinjari cha Playwright |

Tazama faili la [`TESTING.md`](./TESTING.md) kwa maelezo ya kina na picha za kusanidi VSCode extensions.
