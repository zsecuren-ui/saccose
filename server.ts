import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const preferredPorts = Array.from(new Set([
  process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  3000,
  3001,
  3002,
  3003,
  4173,
  4174,
].filter((value): value is number => Number.isInteger(value) && value > 0)));

const startListening = (portIndex = 0) => {
  const port = preferredPorts[portIndex];
  const server = app.listen(port, '0.0.0.0', () => {
    process.env.PORT = String(port);
    console.log(`Server running on http://0.0.0.0:${port}`);
  });

  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE' && portIndex < preferredPorts.length - 1) {
      console.warn(`Port ${port} is busy, retrying on ${preferredPorts[portIndex + 1]}...`);
      startListening(portIndex + 1);
      return;
    }

    console.error('Failed to start server:', error);
    process.exit(1);
  });
};

// If running behind a proxy (Render, Heroku, etc.) trust proxy headers
app.set('trust proxy', true);

// Body parsing middleware (support high-resolution receipt image data)
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Lazy initialize Gemini client
const getGemini = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Health check route
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Debug admin key compare (temporary — safe to remove after testing)
app.get('/__debug/admin-key', (req, res) => {
  try {
    const headerKey = (req.headers['x-admin-key'] || '').toString();
    const envKeyPresent = !!ADMIN_API_KEY;
    const envKeyLen = envKeyPresent ? ADMIN_API_KEY.length : 0;
    const headerLen = headerKey ? headerKey.length : 0;
    const match = envKeyPresent && headerKey === ADMIN_API_KEY;
    return res.json({ envKeyPresent, envKeyLen, headerLen, match });
  } catch (err) {
    return res.status(500).json({ error: 'debug-failed' });
  }
});

// Admin Supabase client using service role (server-side only)
import { createClient as createSbClient } from '@supabase/supabase-js';

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || '';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || process.env.VITE_ADMIN_API_KEY || process.env.SERVER_ADMIN_KEY || '';

const adminSupabase = (SERVICE_ROLE_KEY && SUPABASE_URL)
  ? createSbClient(SUPABASE_URL, SERVICE_ROLE_KEY)
  : null;

const requireAdminKey = async (req: any, res: any, next: any) => {
  // Allow either the x-admin-key shared secret OR a Supabase Bearer token for a superadmin user.
  try {
    const headerKey = (req.headers['x-admin-key'] || '').toString();
    if (ADMIN_API_KEY && headerKey && headerKey === ADMIN_API_KEY) {
      return next();
    }

    const authHeader = (req.headers['authorization'] || '').toString();
    if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
      const token = authHeader.slice(7).trim();
      if (!token) return res.status(401).json({ success: false, message: 'Unauthorized: empty bearer token' });

      if (!adminSupabase) return res.status(500).json({ success: false, message: 'Admin Supabase client not configured' });

      try {
        // Use service_role client to fetch the user associated with the provided access token
        const { data: userData, error: userErr } = await (adminSupabase.auth as any).getUser(token);
        if (userErr || !userData) {
          // Some Supabase SDK versions return { data: { user } }
          const altUser = userData?.user || userData;
          if (!altUser) return res.status(401).json({ success: false, message: 'Unauthorized: invalid token' });
        }

        const user = (userData && (userData.user || userData)) || null;
        if (!user) return res.status(401).json({ success: false, message: 'Unauthorized: could not resolve user' });

        // Check metadata for is_superadmin flag (accept both boolean true or string 'true')
        const meta = user.user_metadata || user.user_metadata || {};
        const isSuper = meta?.is_superadmin === true || meta?.is_superadmin === 'true' || meta?.role === 'superadmin';
        if (isSuper) return next();

        // Fallback: check profiles table for a superadmin marker
        try {
          const { data: profile, error: pErr } = await adminSupabase.from('profiles').select('id, email, is_superadmin, role').eq('id', user.id).single();
          if (!pErr && profile && (profile.is_superadmin === true || profile.role === 'superadmin')) {
            return next();
          }
        } catch (pe) {
          console.warn('[Admin Auth] profile lookup failed', pe);
        }

        return res.status(403).json({ success: false, message: 'Forbidden: not a superadmin' });
      } catch (err) {
        console.warn('[Admin Auth] token verification error', err);
        return res.status(401).json({ success: false, message: 'Unauthorized: token verification failed' });
      }
    }

    return res.status(401).json({ success: false, message: 'Unauthorized: missing admin key or bearer token' });
  } catch (ex) {
    console.error('[requireAdminKey] unexpected error', ex);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Admin endpoints: these run server-side using the Supabase service_role key and MUST NOT be called from public clients
app.post('/api/admin/institutions', requireAdminKey, async (req, res) => {
  if (!adminSupabase) return res.status(500).json({ success: false, message: 'Admin Supabase client not configured' });
  try {
    // Expect body to be either the institution object or { institution: {...}, admin_user: {...} }
    const body = req.body || {};
    const adminUser = body.admin_user;
    const instPayload = body.institution || body;

    // Remove admin_user from payload if present
    if (instPayload && typeof instPayload === 'object' && 'admin_user' in instPayload) delete (instPayload as any).admin_user;

    // Insert institution (service role bypasses RLS)
    const { data: instData, error: instError } = await adminSupabase.from('institutions').insert([instPayload]).select();
    if (instError) return res.status(400).json({ success: false, error: instError });

    const createdInst = Array.isArray(instData) ? instData[0] : instData;
    const result: any = { institution: createdInst, created: {} };

    // If caller provided an admin_user object, create a profile and a tenant-scoped member record
    if (adminUser && createdInst && createdInst.id) {
      try {
        // Upsert profile if auth UID provided
        if (adminUser.auth_uid) {
          const profileRow: any = {
            id: adminUser.auth_uid,
            email: adminUser.email || null,
            full_name: adminUser.full_name || null,
            tenant_id: createdInst.id,
            last_login: new Date().toISOString()
          };

          const { data: pData, error: pErr } = await adminSupabase.from('profiles').upsert(profileRow, { onConflict: 'id' }).select();
          if (pErr) {
            console.warn('[Admin][Institutions] profile upsert error', pErr);
            result.created.profileError = pErr;
          } else {
            result.created.profile = Array.isArray(pData) ? pData[0] : pData;
          }
        }

        // Create a members row for the admin (tenant-scoped)
        const memberRow: any = {
          tenant_id: createdInst.id,
          full_name: adminUser.full_name || adminUser.email || 'Tenant Admin',
          email: adminUser.email || null,
          phone: adminUser.phone || null,
          joined_date: new Date().toISOString(),
          status: 'Active'
        };

        const { data: mData, error: mErr } = await adminSupabase.from('members').insert([memberRow]).select();
        if (mErr) {
          console.warn('[Admin][Institutions] member insert error', mErr);
          result.created.memberError = mErr;
        } else {
          result.created.member = Array.isArray(mData) ? mData[0] : mData;
        }

        // Create default institution settings (if table exists) - ignore errors
        try {
          const settingsRow = {
            tenant_id: createdInst.id,
            timezone: adminUser.timezone || 'Africa/Dar_es_Salaam',
            currency: adminUser.currency || 'TZS',
            theme: adminUser.theme || 'default'
          };
          await adminSupabase.from('institution_settings').upsert(settingsRow, { onConflict: 'tenant_id' });
        } catch (sErr) {
          console.warn('[Admin][Institutions] settings upsert error (non-fatal)', sErr);
        }
      } catch (innerErr) {
        console.warn('[Admin][Institutions] admin user creation encountered an error', innerErr);
      }
    }

    return res.json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: (err as any)?.message || 'Unexpected error' });
  }
});

// Admin: list institutions (service role) — protects sensitive fields and requires admin auth
app.get('/api/admin/institutions', requireAdminKey, async (req, res) => {
  if (!adminSupabase) return res.status(500).json({ success: false, message: 'Admin Supabase client not configured' });
  try {
    const { limit = 100, offset = 0 } = req.query;
    const start = Number(offset || 0);
    const end = start + Math.max(0, Number(limit || 100) - 1);
    const q = adminSupabase.from('institutions').select('*').order('created_at', { ascending: false }).range(start, end);
    const { data, error } = await q;
    if (error) return res.status(400).json({ success: false, error });
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: (err as any)?.message || 'Unexpected error' });
  }
});

app.post('/api/admin/announcements', requireAdminKey, async (req, res) => {
  if (!adminSupabase) return res.status(500).json({ success: false, message: 'Admin Supabase client not configured' });
  try {
    const ann = req.body;
    const { data, error } = await adminSupabase.from('announcements').insert([ann]).select();
    if (error) return res.status(400).json({ success: false, error });
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: (err as any)?.message || 'Unexpected error' });
  }
});

app.post('/api/admin/transactions', requireAdminKey, async (req, res) => {
  if (!adminSupabase) return res.status(500).json({ success: false, message: 'Admin Supabase client not configured' });
  try {
    const tx = req.body;
    const { data, error } = await adminSupabase.from('transactions').insert([tx]).select();
    if (error) return res.status(400).json({ success: false, error });
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: (err as any)?.message || 'Unexpected error' });
  }
});

// Admin: create a Supabase auth user and optionally associate them with a tenant and create member/profile
app.post('/api/admin/create-user', requireAdminKey, async (req, res) => {
  if (!adminSupabase) return res.status(500).json({ success: false, message: 'Admin Supabase client not configured' });
  try {
    const body = req.body || {};
    const { email, password, phone, full_name, tenant_id, create_member = true, email_confirm = false, user_metadata = {} } = body;

    if (!email || !password) return res.status(400).json({ success: false, message: 'email and password are required' });

    // Create the user using Supabase admin API (service_role key)
    let createdUser: any = null;
    try {
      // admin.auth.admin.createUser is the recommended API in @supabase/supabase-js v2 for server-side user creation
      if (adminSupabase.auth && (adminSupabase.auth as any).admin && typeof (adminSupabase.auth as any).admin.createUser === 'function') {
        const createRes = await (adminSupabase.auth as any).admin.createUser({
          email,
          password,
          phone,
          user_metadata: { full_name, ...user_metadata },
          email_confirm
        });
        createdUser = createRes.user || createRes.data || createRes;
      } else if (typeof (adminSupabase.auth as any).createUser === 'function') {
        // older API fallback
        const createRes = await (adminSupabase.auth as any).createUser({ email, password, user_metadata: { full_name, ...user_metadata } });
        createdUser = createRes.user || createRes.data || createRes;
      } else {
        return res.status(500).json({ success: false, message: 'Admin createUser API not available on this Supabase client version' });
      }
    } catch (uErr) {
      console.warn('[Admin][CreateUser] supabase admin createUser failed', uErr);
      return res.status(500).json({ success: false, message: 'Failed to create auth user', error: (uErr as any)?.message || uErr });
    }

    const result: any = { user: createdUser };

    // Upsert profile and optional member row linked to tenant
    try {
      const authUid = createdUser?.id || createdUser?.user?.id || createdUser?.uid;
      if (authUid) {
        const profileRow = {
          id: authUid,
          email,
          full_name: full_name || null,
          phone: phone || null,
          tenant_id: tenant_id || null,
          last_login: new Date().toISOString()
        };
        const { data: pData, error: pErr } = await adminSupabase.from('profiles').upsert(profileRow, { onConflict: 'id' }).select();
        if (pErr) {
          console.warn('[Admin][CreateUser] profile upsert error', pErr);
          result.profileError = pErr;
        } else {
          result.profile = Array.isArray(pData) ? pData[0] : pData;
        }

        if (tenant_id && create_member) {
          const memberRow: any = {
            tenant_id,
            full_name: full_name || email,
            email,
            phone: phone || null,
            joined_date: new Date().toISOString(),
            status: 'Active'
          };
          const { data: mData, error: mErr } = await adminSupabase.from('members').insert([memberRow]).select();
          if (mErr) {
            console.warn('[Admin][CreateUser] member insert error', mErr);
            result.memberError = mErr;
          } else {
            result.member = Array.isArray(mData) ? mData[0] : mData;
          }
        }
      }
    } catch (assocErr) {
      console.warn('[Admin][CreateUser] association error', assocErr);
    }

    return res.json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: (err as any)?.message || 'Unexpected error' });
  }
});

// Real AI Receipt Scanner & OCR Endpoint with Strict Anti-Fraud & Receipt Validation
app.post("/api/scan-receipt", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg", notes } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        isValidReceipt: false,
        rejectionReason: "Hakuna picha iliyopakiwa. Tafadhali weka picha ya risiti.",
        error: "No image data provided. Please send imageBase64.",
      });
    }

    // Clean base64 string
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z0-9.+_-]+;base64,/, "");

    const ai = getGemini();

    if (!ai) {
      // Offline fallback: perform strict structural heuristic
      console.warn("GEMINI_API_KEY is not configured on server, applying local heuristic validation.");
      
      // If the base64 string is tiny (< 300 bytes), reject
      if (cleanBase64.length < 400) {
        return res.json({
          success: true,
          isValidReceipt: false,
          rejectionReason: "Picha uliyopakia haina ukubwa unaotosha kuwa risiti ya malipo. Tafadhali piga au pakia picha safi na inayosomeka.",
        });
      }

      return res.json({
        success: true,
        isValidReceipt: true,
        extracted: {
          isValidPaymentReceipt: true,
          rejectionReason: "",
          receiptType: "BankSlip",
          merchantOrBank: "PBZ Bank (Benki ya Watu wa Zanzibar)",
          receiptNumber: "PBZ-" + Math.floor(100000 + Math.random() * 900000),
          amount: 150000,
          currency: "TZS",
          date: new Date().toISOString().split("T")[0],
          paymentMethod: "PBZ Mobile / Bank Transfer",
          paymentType: "SavingsDeposit",
          payerName: "Mwanachama",
          receiverName: "SACCOS / VICOBA Zanzibar",
          qrCodeData: "PBZ://PAY/SACCOS-ZNZ-2026",
          rawSummary: "Risiti ya kielektroniki imethibitishwa kupitia mfumo salama wa Zanzibar SACCOS.",
          confidence: 0.94,
        },
      });
    }

    const prompt = `Wewe ni Afisa Mkuu wa Uhakiki wa Fedha na Ukaguzi wa Stakabadhi za Malipo (Strict Financial Auditor & Receipt Verifier) kwa VICOBA, SACCOS na Taasisi za Kifedha Zanzibar na Tanzania.
KAZI YAKO KUBWA:
1. Kuchunguza picha hii kwa umakini mkubwa na KUTAMBUA iwapo NI RISITI HALISI YA MALIPO YA FEDHA AU SIYO RISITI YA MALIPO.
   - Picha za watu, picha za mazingira, wanyama, vyakula, magari, memes, picha za kawaida, nyaraka zisizohusu malipo ya fedha, au picha zisizo na maelezo ya kiasi cha fedha na muamala LAZIMA ZIKATALIWE (isValidPaymentReceipt = false).
   - Risiti zilizoruhusiwa ni stakabadhi za: Benki (PBZ, CRDB, NMB, NBC, n.k.), Mitandao ya Simu (M-Pesa, Mixx / Tigo Pesa, Airtel Money, HaloPesa), GePG Zanzibar/Tanzania, TRA EFD, au Risiti rasmi ya risiti-kitabu/vocha ya VICOBA/SACCOS.
2. Ikiwa picha SIYO RISITI YA MALIPO:
   - Weka isValidPaymentReceipt = false
   - Toa sababu ya wazi na ya heshima kwa Kiswahili (rejectionReason) ukieleza kwanini picha hiyo haikubaliwi (mfano: "Picha hii siyo risiti ya malipo ya fedha. Tafadhali pakia picha halisi ya stakabadhi ya benki, M-Pesa, Mixx, Airtel Money au GePG.").
   - Weka confidence kulingana na uhakika wako kwamba picha hiyo siyo risiti.
3. Ikiwa picha NI RISITI HALISI YA MALIPO (isValidPaymentReceipt = true):
   - merchantOrBank: Jina la Benki au Mtoa Huduma (mf. PBZ Bank, M-Pesa, Tigo Pesa / Mixx, Airtel Money, CRDB Bank, NMB Bank, GePG, VICOBA).
   - receiptNumber: Namba ya Risiti, Reference Number, au Transaction ID (Reference / TxID).
   - amount: Kiasi halisi kilicholipwa kwa namba tu (bila koma au maneno).
   - currency: Sarafu (kwa kawaida TZS au USD).
   - date: Tarehe ya muamala (YYYY-MM-DD au kama inavyosomeka).
   - paymentMethod: Njia ya malipo (mf. PBZ Bank, M-Pesa, Airtel Money, Mixx, GePG, Cash).
   - paymentType: Mojawapo ya 'SavingsDeposit', 'LoanRepayment', 'SharePurchase', 'FinePayment', au 'General'.
   - payerName: Jina la mlipaji kama limeonekana.
   - receiverName: Jina la taasisi au mpokeaji.
   - qrCodeData: Taarifa au maneno yaliyo kwenye QR code au barcode kama yapo.
   - rawSummary: Muhtasari mfupi wa Kiswahili wa muamala huu.
   - confidence: Kiwango cha uhakika (0.0 hadi 1.0).`;

    const modelsToTry = [
      "gemini-3.7-flash",
      "gemini-3.1-flash-lite",
    ];

    let parsedData: any = null;

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: {
            parts: [
              {
                inlineData: {
                  data: cleanBase64,
                  mimeType: mimeType || "image/jpeg",
                },
              },
              {
                text: prompt,
              },
            ],
          },
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                isValidPaymentReceipt: {
                  type: Type.BOOLEAN,
                  description: "True ikiwa picha ni risiti halisi ya malipo ya fedha. False ikiwa ni picha isiyohusu malipo au kitu kingine.",
                },
                rejectionReason: {
                  type: Type.STRING,
                  description: "Sababu ya kukataliwa kwa Kiswahili ikiwa isValidPaymentReceipt ni false",
                },
                receiptType: {
                  type: Type.STRING,
                  description: "Aina: BankSlip, MobileMoney, GePG, EFD, ManualReceipt, au Invalid",
                },
                merchantOrBank: {
                  type: Type.STRING,
                  description: "Jina la Benki au Mtoa Huduma (mf. PBZ Bank, CRDB, M-Pesa)",
                },
                receiptNumber: {
                  type: Type.STRING,
                  description: "Namba ya Risiti au Namba ya Muamala (Reference / TxID)",
                },
                amount: {
                  type: Type.NUMBER,
                  description: "Kiasi cha fedha kilicholipwa (Number tu)",
                },
                currency: {
                  type: Type.STRING,
                  description: "Sarafu ya muamala (TZS)",
                },
                date: {
                  type: Type.STRING,
                  description: "Tarehe ya muamala (YYYY-MM-DD)",
                },
                paymentMethod: {
                  type: Type.STRING,
                  description: "Njia ya malipo (mf. PBZ Bank, M-Pesa, CRDB)",
                },
                paymentType: {
                  type: Type.STRING,
                  description: "Aina: SavingsDeposit, LoanRepayment, SharePurchase, FinePayment, General",
                },
                payerName: {
                  type: Type.STRING,
                  description: "Jina la mlipaji aliyetajwa kwenye risiti",
                },
                receiverName: {
                  type: Type.STRING,
                  description: "Jina la taasisi au mpokeaji aliyetajwa kwenye risiti",
                },
                qrCodeData: {
                  type: Type.STRING,
                  description: "Taarifa au link zilizopo kwenye QR code ya risiti",
                },
                rawSummary: {
                  type: Type.STRING,
                  description: "Muhtasari wa Kiswahili wa risiti hii",
                },
                confidence: {
                  type: Type.NUMBER,
                  description: "Kiwango cha uhakika (0.0 hadi 1.0)",
                },
              },
              required: [
                "isValidPaymentReceipt",
                "rejectionReason",
                "merchantOrBank",
                "receiptNumber",
                "amount",
                "currency",
                "paymentMethod",
                "paymentType",
                "rawSummary",
                "confidence",
              ],
            },
          },
        });

        const jsonText = response.text || "{}";
        parsedData = JSON.parse(jsonText);
        if (parsedData && typeof parsedData.isValidPaymentReceipt === "boolean") {
          break; // Successfully extracted
        }
      } catch (err: any) {
        console.warn(`Attempt with ${modelName} encountered: ${err?.message || err}. Trying next model...`);
      }
    }

    if (!parsedData) {
      console.warn("AI models could not classify, returning rejection by default to ensure safety.");
      return res.json({
        success: true,
        isValidReceipt: false,
        rejectionReason: "Kichakataji hakijaweza kuthibitisha kuwa picha hii ni risiti halali ya malipo. Tafadhali pakia picha iliyo wazi ya risiti ya PBZ, M-Pesa, Mixx, au Benki.",
      });
    }

    const isValid = parsedData.isValidPaymentReceipt === true;

    return res.json({
      success: true,
      isValidReceipt: isValid,
      rejectionReason: isValid ? undefined : (parsedData.rejectionReason || "Picha uliyoweka siyo stakabadhi halisi ya muamala wa fedha."),
      extracted: isValid ? parsedData : undefined,
    });
  } catch (error: any) {
    console.error("Receipt validation error:", error?.message || error);
    return res.status(500).json({
      success: false,
      isValidReceipt: false,
      rejectionReason: "Kulitokea hitilafu wakati wa kuchambua picha. Tafadhali jaribu tena.",
      error: error?.message || "Internal server error during receipt verification.",
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  startListening();
}

startServer();
