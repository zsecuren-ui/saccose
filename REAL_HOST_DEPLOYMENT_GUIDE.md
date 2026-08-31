# Mwongozo wa Deployment kwa Hosting ya Kweli na Render

Mwongozo huu unakupa hatua kamili za kuweka mfumo huu kwenye hosting ya kweli (VPS / Linux server) na kwenye Render.

Lengo ni kuhakikisha:
- app inafunguka kwenye production host
- Supabase inaunganisha vizuri
- service role key haipo kwenye frontend
- demo data imefutwa
- RLS inafaa kwa tenant scoping
- app inafikia data za kweli bila kuathiri usalama

---

## 1. Kitu cha kwanza: Viwango vya Production

Kabla ya deployment, hakikisha hivi vimewekwa:

- `VITE_SUPABASE_URL` ni URL ya project yako ya Supabase
- `VITE_SUPABASE_ANON_KEY` ni anon key ya Supabase
- `SUPABASE_SERVICE_ROLE_KEY` ni secret, iwe kwenye server side tu
- `ADMIN_API_KEY` ni shared secret ya admin APIs (ikiwa unatumia admin endpoints)
- RLS imewekwa kwenye Supabase live DB
- demo/sample institution, member, transaction zimefutwa

Hakuna chochote kilichofichwa kinapaswa kuonekana kwenye browser frontend.

---

## 2. Env Vars za Production

### 2.1 File ya environment la server

Tumia `.env.production` au environment variables ya hosting.

Mfano:

```bash
NODE_ENV=production
PORT=3000

VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_API_KEY=your-admin-secret
GEMINI_API_KEY=your-gemini-key-if-used
```

### 2.2 Kitu cha muhimu

- `SUPABASE_SERVICE_ROLE_KEY` ni secret kabisa
- `ADMIN_API_KEY` si lazima kuwekwa kwenye frontend
- `VITE_` variables zinaweza kutumika kwenye frontend
- `SUPABASE_SERVICE_ROLE_KEY` lazima iwe kwenye backend/server env tu

---

## 3. Deployment kwenye Render

Render ni rahisi kwa project hii kwa sababu inajenga Node.js app na inafanya `npm run build`.

### 3.1 Hatua za Render

1. Fungua Render dashboard
2. Bonyeza `New +`
3. Chagua `Web Service`
4. Chagua repo yako ya GitHub
5. Weka:
   - Name: `saccos-platform` (au jina lako)
   - Branch: `main`
   - Runtime: `Node`
   - Build Command:
     ```bash
     npm install && npm run build
     ```
   - Start Command:
     ```bash
     npm start
     ```
6. Katika tab ya Environment Variables, weka zote zilizotajwa hapo juu
7. Bofya `Create Web Service`
8. Render itajenga app na kuanza service

### 3.2 Render health check

Baada ya deployment, angalia logs na test:

```bash
curl https://your-render-url.onrender.com/api/health
```

Lazima urudishe:

```json
{"status":"ok","timestamp":"..."}
```

### 3.3 Render gotchas

- `npm run build` ni lazima iwekamilika bila makosa
- `PORT` inaweza kutolewa na Render, lakini `server.ts` inafungua `process.env.PORT` ikiwa ipo
- Sichana kwamba `SUPABASE_SERVICE_ROLE_KEY` haiweki kwenye build-time output ambayo inaweza kuonekana na frontend

---

## 4. Deployment kwenye VPS / Linux Server ya Kweli

Kwa VPS (DigitalOcean, Hetzner, AWS EC2, Azure VM, Linode, etc.) hatua ni zifuatazo.

### 4.1 Upload code kwenye server

```bash
ssh user@your-server-ip
cd /var/www/saccos-platform
git clone https://github.com/your-user/your-repo.git .
```

Kama repo tayari ipo:

```bash
cd /var/www/saccos-platform
git pull origin main
```

### 4.2 Install dependencies

```bash
npm install
npm run build
```

### 4.3 Set environment variables

Kwenye server, weka env vars kwenye shell ya production au kwenye file ya environment.

Mfano kwa bash:

```bash
export NODE_ENV=production
export PORT=3000
export VITE_SUPABASE_URL=https://your-project.supabase.co
export VITE_SUPABASE_ANON_KEY=your-anon-key
export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
export ADMIN_API_KEY=your-admin-secret
```

### 4.4 Run app in production

Njia rahisi ya kufanya kazi kwenye VPS ni kutumia `pm2`:

```bash
npm install -g pm2
pm2 start "npm start" --name saccos-platform
pm2 save
pm2 startup
```

Kama unatumia systemd:

```bash
sudo nano /etc/systemd/system/saccos-platform.service
```

Mfano:

```ini
[Unit]
Description=SACCOS Platform Production Service
After=network.target

[Service]
WorkingDirectory=/var/www/saccos-platform
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=VITE_SUPABASE_URL=https://your-project.supabase.co
Environment=VITE_SUPABASE_ANON_KEY=your-anon-key
Environment=SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
Environment=ADMIN_API_KEY=your-admin-secret
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Kisha:

```bash
sudo systemctl daemon-reload
sudo systemctl enable saccos-platform
sudo systemctl start saccos-platform
sudo systemctl status saccos-platform
```

### 4.5 Nginx reverse proxy (ikiwa unahitaji domain)

Install Nginx na config:

```bash
sudo apt update
sudo apt install nginx
sudo nano /etc/nginx/sites-available/saccos-platform
```

Config mfano:

```nginx
server {
    listen 80;
    server_name app.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Activate:

```bash
sudo ln -s /etc/nginx/sites-available/saccos-platform /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4.6 LetsEncrypt / HTTPS

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d app.yourdomain.com
```

---

## 5. Supabase production setup

Kabla ya kutumia app moja kwa moja kwenye live environment, lazima hii ifanyike kwenye Supabase project ya kweli.

### 5.1 Tables zifanyike

Zingatia hizi:
- institutions
- profiles
- members
- transactions
- loans

### 5.2 Apply migrations

Katika SQL editor ya Supabase, fanya migrations zifuatazo kwa mpangilio:

1. `002_create_core_tables.sql`
2. `004_profiles_tenant_and_institution_settings.sql`
3. `006_rls_recommended.sql`

Kama app yako inatumia tenant_id claim, hakikisha claim imeandikwa kwa jina sahihi.

### 5.3 RLS must match JWT claims

Ukiwa na claims za JWT kama:
- `tenant_id`
- `is_superadmin`

policies hukutakuwa na shida.

Kama claim names ni tofauti, badilisha SQL kabla ya kutumia.

### 5.4 Remove demo data

Hakikisha hakuna sample/demo institution zilizobaki.

Mfano wa query ya cleanup:

```sql
DELETE FROM public.transactions
WHERE tenant_id IN (
  SELECT id
  FROM public.institutions
  WHERE name ILIKE '%sample%'
     OR domain ILIKE '%sample%'
);

DELETE FROM public.members
WHERE tenant_id IN (
  SELECT id
  FROM public.institutions
  WHERE name ILIKE '%sample%'
     OR domain ILIKE '%sample%'
);

DELETE FROM public.institutions
WHERE name ILIKE '%sample%'
   OR domain ILIKE '%sample%';
```

---

## 6. Real member creation flow

Kabla ya production live, miembro wa kweli lazima aundwe kwa Supabase Auth, kisha aletiwe `profiles` na `members` row yenye `tenant_id` ya institution yake.

### 6.1 Create auth user via service role

Kwenye Node script au server admin endpoint:

```js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

(async () => {
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'member@real.tz',
    password: 'StrongPassword123!',
    email_confirm: true,
    user_metadata: { full_name: 'Juma Kassim', role: 'member' }
  });

  if (error) {
    console.error(error);
    return;
  }

  console.log('Auth user created:', data.user.id);
})();
```

### 6.2 Map user to institution

```sql
INSERT INTO public.profiles (id, email, full_name, tenant_id, role, last_login)
VALUES (
  'AUTH_UID_HERE',
  'member@real.tz',
  'Juma Kassim',
  'INSTITUTION_UUID_HERE',
  'member',
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    tenant_id = EXCLUDED.tenant_id,
    role = EXCLUDED.role,
    last_login = NOW();

INSERT INTO public.members (
  tenant_id,
  full_name,
  email,
  phone,
  member_number,
  status,
  joined_date,
  branch
)
VALUES (
  'INSTITUTION_UUID_HERE',
  'Juma Kassim',
  'member@real.tz',
  '+255712345678',
  'MB-2026-0001',
  'Active',
  NOW(),
  'Dar es Salaam'
)
ON CONFLICT (email) DO UPDATE
SET tenant_id = EXCLUDED.tenant_id,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    member_number = EXCLUDED.member_number,
    status = EXCLUDED.status,
    branch = EXCLUDED.branch;
```

---

## 7. Verification ya after deployment

### 7.1 Health check

```bash
curl http://localhost:3000/api/health
```

### 7.2 Inspect real data

```sql
SELECT * FROM public.institutions ORDER BY joined_date DESC LIMIT 20;
SELECT * FROM public.members ORDER BY joined_date DESC LIMIT 20;
SELECT * FROM public.transactions ORDER BY created_at DESC LIMIT 20;
```

### 7.3 Validate tenant visibility

Kama kuna user wa tenant moja, angalia kwamba anapata data ya tenant yake pekee. Ikiwa anapata data ya tenants nyingine, RLS inaonekana vibaya.

### 7.4 Validate one real transaction write

- login kama member
- do deposit or loan request
- check transaction row has same tenant_id as user institution

---

## 8. Production launch checklist (final)

Huduma hii ni tayari kwa production kama vipengele hivi vimekamilika:

- [ ] server env vars zimewekwa
- [ ] frontend has anon key only
- [ ] service role key in server env, not frontend
- [ ] Supabase tables exist
- [ ] RLS policies applied
- [ ] demo rows removed
- [ ] real institution exists
- [ ] real admin exists
- [ ] real member exists and belongs to tenant
- [ ] same-tenant visibility verified
- [ ] deposit/loan writes verified
- [ ] health check passes
- [ ] domain/HTTPS ready

---

## 9. Recommended production path

### Recommended for fastest real deployment

- Use Render for easiest deployment if you want managed hosting
- Use VPS if you want full control of reverse proxy, SSL, and custom deployment

### Recommended for security

- Use Render or VPS with Nginx + SSL
- Keep `SUPABASE_SERVICE_ROLE_KEY` in server env only
- Restrict admin endpoints to trusted clients only
- Use real tenant-based auth and RLS

---

## 10. Final note

App ya project hii imejengwa vizuri kwa production style. Hata hivyo, final live deployment ya kweli inaanza vizuri tu baada ya:

- Supabase live DB kuwekwa vizuri
- RLS policies kutumika kweli
- auth users kutengenezwa kwa kweli
- demo data kufutwa
- tenant scoping kupitiwa kwa ushahidi

Kama hizi zifanyike, mfumo utakuwa tayari kwa matumizi ya kweli na production live.
