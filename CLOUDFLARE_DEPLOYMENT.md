# ☁️ Cloudflare Deployment Guide for SACCOS Platform

Cloudflare Pages offers lightning-fast, global CDN hosting with automatic deployments from GitHub. Perfect for hosting your frontend with a backend API proxy.

---

## ✅ Prerequisites

- GitHub account with code pushed (✓ Already done!)
- Cloudflare account: https://cloudflare.com
- Render deployment (backend) OR direct Node.js backend
- Custom domain (optional but recommended)

---

## 📋 Deployment Strategy

Two approaches:

### **Option A: Frontend on Cloudflare Pages + Backend on Render** (RECOMMENDED)
- **Best for**: Production, optimal performance
- **Speed**: Lightning-fast globally
- **Cost**: Free tier available
- **Setup**: Moderate

### **Option B: Cloudflare Workers (Full Stack)**
- **Best for**: Serverless, minimal cost
- **Speed**: Extremely fast
- **Cost**: Free tier with limitations
- **Setup**: Advanced

We'll cover **Option A** (most common).

---

## 🚀 Option A: Cloudflare Pages + Render Backend

### Step 1: Create Cloudflare Account

1. Go to [cloudflare.com](https://cloudflare.com)
2. Sign up or log in
3. Click **Pages** in left sidebar
4. Click **Create a project**

### Step 2: Connect GitHub Repository

1. Click **Connect to Git**
2. Select **GitHub**
3. Authorize Cloudflare to access your GitHub account
4. Search for and select: `zsecuren-ui/saccose`
5. Click **Begin setup**

### Step 3: Configure Build Settings

| Field | Value |
|-------|-------|
| **Production Branch** | `main` |
| **Build Command** | `npm run build` |
| **Build Output Directory** | `dist` |
| **Node Version** | `20.x` |

### Step 4: Set Environment Variables

Click **Environment variables** and add:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=https://saccos-platform.onrender.com
```

**Note**: `VITE_API_URL` should point to your Render backend URL

### Step 5: Deploy

1. Click **Save and Deploy**
2. Wait for build to complete (usually 1-2 minutes)
3. You'll get a URL like: `https://saccos-platform.pages.dev`

---

## 🔗 Configure API Routing

Your frontend needs to communicate with Render backend. Update your API client:

### Update API Configuration

Edit `src/lib/supabase.ts`:

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const fetchAPI = async (endpoint: string, options?: RequestInit) => {
  const response = await fetch(`${API_URL}/api${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  return response.json();
};
```

### CORS Configuration on Render

Add to your `server.ts` (backend):

```typescript
import cors from 'cors';

const app = express();

app.use(cors({
  origin: [
    'https://saccos-platform.pages.dev',
    'http://localhost:3000',
    'http://localhost:5173' // Vite dev
  ],
  credentials: true,
}));
```

---

## ✅ Test Deployment

### Check Frontend

```bash
# Test Cloudflare Pages URL
curl https://saccos-platform.pages.dev

# Should return HTML with your app
```

### Check Backend Connection

1. Open your app: `https://saccos-platform.pages.dev`
2. Open Developer Console (F12)
3. Check Network tab for API calls
4. Look for requests to `https://saccos-platform.onrender.com/api/*`

---

## 🌍 Connect Custom Domain

### Step 1: Add Domain to Cloudflare

1. Go to Cloudflare dashboard
2. Click **Domains** → **Add site**
3. Enter your domain (e.g., `saccos.yourdomain.com`)
4. Follow DNS setup instructions
5. Update nameservers at your registrar

### Step 2: Connect Domain to Pages

1. Go to Pages project
2. Click **Custom domains**
3. Click **Set up a custom domain**
4. Enter your domain
5. Add DNS records as instructed

### Step 3: SSL Certificate

Cloudflare automatically issues free SSL certificates (within 15 minutes).

---

## 🚀 Option B: Cloudflare Workers (Advanced)

Use Wrangler to deploy full-stack app to Cloudflare Workers:

### Step 1: Install Wrangler

```bash
npm install -g wrangler
```

### Step 2: Initialize Wrangler Project

```bash
cd c:\Users\ZAKA\Pictures\saccose\saccos
wrangler init
```

### Step 3: Configure `wrangler.toml`

Create/update `wrangler.toml`:

```toml
name = "saccos-platform"
type = "javascript"
account_id = "your-account-id"
workers_dev = true
route = "saccos.yourdomain.com/*"
zone_id = "your-zone-id"

[env.production]
name = "saccos-platform-prod"
route = "saccos.yourdomain.com/*"

[[env.production.vars]]
ENVIRONMENT = "production"
```

### Step 4: Create Worker Handler

Create `src/worker.ts`:

```typescript
import { handleRequest } from './server.ts';

export default {
  fetch: handleRequest,
};
```

### Step 5: Deploy

```bash
wrangler deploy
```

**Note**: Workers have limitations:
- 30-second timeout per request
- 128 MB memory max
- Best for APIs, not heavy computations

---

## 📊 Monitoring & Analytics

### Cloudflare Pages Analytics

1. Go to your Pages project
2. Click **Analytics**
3. View:
   - Page views
   - Request details
   - Performance metrics
   - Error logs

### Render Backend Logs

1. Go to Render dashboard
2. Click your service
3. View:
   - Real-time logs
   - CPU/memory usage
   - Deployment history

---

## 🔒 Security Configuration

### 1. Secure Headers

Add to Render backend:

```typescript
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000');
  next();
});
```

### 2. Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
});

app.use('/api/', limiter);
```

### 3. HTTPS Only

- Cloudflare Pages: ✅ Automatic
- Render: ✅ Automatic
- Add to `server.ts`:

```typescript
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});
```

---

## 🔄 Automatic Deployments

Both Cloudflare and Render watch your GitHub repo:

```bash
# After making changes:
git add .
git commit -m "Update: feature description"
git push origin main

# Both platforms automatically redeploy!
```

---

## ⚡ Performance Optimization

### Cloudflare Caching

1. Go to Cloudflare dashboard
2. Select your domain
3. **Caching** → **Configuration**
4. Set:
   - **Browser Cache TTL**: 30 minutes
   - **Cache Level**: Cache Everything (for static files)

### Render Backend Optimization

1. Enable compression in `server.ts`:

```typescript
import compression from 'compression';
app.use(compression());
```

2. Cache headers:

```typescript
app.use(express.static('dist', {
  maxAge: '1d',
  etag: false,
}));
```

---

## 💰 Pricing Comparison

| Platform | Plan | Price | Features |
|----------|------|-------|----------|
| **Cloudflare Pages** | Free | $0 | Unlimited builds, 500 deploys/month |
| **Cloudflare Workers** | Free | $0 | 100K requests/day |
| **Render** | Free | $0 | 750 hrs/month, auto-sleeps |
| **Render** | Starter | $7/month | Always-on |

---

## 🧪 Testing Before Production

### Local Testing

```bash
cd c:\Users\ZAKA\Pictures\saccose\saccos

# Test build
npm run build

# Check dist folder
ls -la dist/

# Test locally
npm start
# Open http://localhost:3000
```

### Staging Deployment

1. Create a `staging` branch
2. Deploy to separate Render/Cloudflare services
3. Test thoroughly
4. Merge to `main` when ready

---

## 📞 Troubleshooting

### Issue: Cloudflare shows "Error 1099"

**Solution**: 
- CORS issue between Cloudflare and Render
- Add `Access-Control-Allow-Origin` headers on Render

### Issue: Assets not loading (404 errors)

**Solution**:
- Check build output: `npm run build`
- Verify `dist/` contains all files
- Clear Cloudflare cache: **Caching** → **Purge Cache**

### Issue: API calls returning 401 Unauthorized

**Solution**:
- Check `VITE_SUPABASE_ANON_KEY` in Cloudflare environment
- Verify Render backend is receiving requests
- Check CORS configuration

---

## ✨ Next Steps

1. **Deploy Frontend** to Cloudflare Pages (5 minutes)
2. **Deploy Backend** to Render (already done)
3. **Test API Connectivity** (app ↔ backend ↔ Supabase)
4. **Set Up Custom Domain** (optional but recommended)
5. **Configure Monitoring** (CloudFlare + Render dashboards)
6. **Enable Analytics** (track user behavior)
7. **Set Up Backups** (Supabase automated backups)

Your SACCOS platform is now globally distributed! 🌍🚀
