# 🚀 Render Deployment Guide for SACCOS Platform

Render provides a modern, easy way to deploy your full-stack Node.js + React application with automatic CI/CD, SSL, and a free tier.

---

## ✅ Prerequisites

- GitHub account with your code pushed (✓ Already done!)
- Render account: https://render.com
- Supabase project URL and API keys
- Gemini API key (for OCR features)

---

## 📋 Step-by-Step Deployment

### Step 1: Connect to Render

1. Go to [render.com](https://render.com)
2. Sign up or log in with your GitHub account
3. Click **New +** button in top right
4. Select **Web Service**

### Step 2: Connect Your GitHub Repository

1. Choose **GitHub** as the source
2. Search for and select: `zsecuren-ui/saccose`
3. Click **Connect**

### Step 3: Configure Deployment Settings

Fill in the following fields:

| Field | Value |
|-------|-------|
| **Name** | `saccos-platform` |
| **Environment** | `Node` |
| **Region** | `Frankfurt (EU Central)` or closest to you |
| **Branch** | `main` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Plan Type** | `Free` (includes 750 free hours/month) |

### Step 4: Set Environment Variables

Click the **Environment** tab and add these variables:

```
NODE_ENV=production
PORT=3000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
GEMINI_API_KEY=your-gemini-api-key-here
ADMIN_API_KEY=your-admin-secret-key
```

**How to get these values:**

- **VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY**: From Supabase dashboard → Settings → API
- **SUPABASE_SERVICE_ROLE_KEY**: From Supabase dashboard → Settings → API → Service Role Secret
- **GEMINI_API_KEY**: From Google AI Studio → Get API Key
- **ADMIN_API_KEY**: Create a secure random string (e.g., `openssl rand -base64 32`)

### Step 5: Deploy

1. Click **Create Web Service**
2. Render will start building immediately
3. Watch the logs in real-time
4. Once deployed, you'll get a URL like: `https://saccos-platform.onrender.com`

---

## 🔍 After Deployment

### Test Your App

```bash
# Check if the server is running
curl https://saccos-platform.onrender.com/api/health

# Should return:
# {"status":"ok","timestamp":"..."}
```

### Access Your App

Open in browser: `https://saccos-platform.onrender.com`

### View Logs

- Click on your service in Render dashboard
- Select **Logs** tab to see real-time server output
- Check **Events** tab for deployment history

---

## ⚙️ Common Issues & Solutions

### Issue: Build fails with "npm not found"

**Solution**: Ensure Node version is set
1. Go to Settings → Environment
2. Add `NODE_VERSION=20` (or your preferred version)

### Issue: App crashes immediately after deploy

**Solution**: Check logs for errors
1. Click your service
2. Go to Logs tab
3. Look for error messages
4. Common causes:
   - Missing environment variables
   - Database connection issues
   - Port already in use

### Issue: Static assets (CSS, JS) not loading

**Solution**: Ensure Vite build is correct
- Build command should be: `npm install && npm run build`
- Check that `dist/` folder is created during build

### Issue: "Service role key" warning but app works

**Don't worry!** The app falls back to:
- IndexedDB (browser storage)
- LocalStorage (browser cache)
- Anonymous Supabase access

This is by design for resilience.

---

## 🔄 Automatic Deployments

Render auto-deploys when you push to `main` branch:

```bash
# After making changes locally:
git add .
git commit -m "Update: feature or fix"
git push origin main

# Render automatically starts building and deploying!
```

---

## 📊 Monitoring & Scaling

### View Metrics

1. Go to your service in Render
2. Click **Metrics** tab to see:
   - CPU usage
   - Memory consumption
   - Request count
   - Response time

### Upgrade Plan

1. Click **Settings** → **Plan**
2. Options:
   - **Free** (750 hrs/month, sleeps after 15 min inactivity)
   - **Starter** ($7/month, always-on)
   - **Standard** ($25/month, auto-scaling, better performance)

### Manual Restart

If you need to restart the app:
1. Go to your service
2. Click **Manual Deploy** → **Deploy Latest Commit**

---

## 🔐 Security Best Practices

✅ **Already Implemented:**
- HTTPS/SSL (automatic)
- Environment variables not exposed
- Service role key on backend only

✅ **Do These:**
1. Never commit `.env` files (already in `.gitignore`)
2. Rotate `ADMIN_API_KEY` periodically
3. Use strong `GEMINI_API_KEY`
4. Enable Supabase RLS policies (already configured)
5. Monitor Render logs for suspicious activity

---

## 💰 Pricing

| Plan | Price | Features |
|------|-------|----------|
| **Free** | $0 | 750 hrs/month, sleeps after inactivity |
| **Starter** | $7/month | Always-on, included in free tier credits |
| **Standard** | $25+/month | Auto-scaling, production-ready |

**Pro Tip**: Render gives **$5 free credit/month** for new accounts!

---

## 📞 Support & Resources

- **Render Docs**: https://render.com/docs
- **Render Status**: https://status.render.com
- **Help & Feedback**: https://render.com/support

---

## ✨ Next Steps

1. **Monitor Logs**: Keep an eye on logs for the first 24 hours
2. **Test Features**: Make sure Supabase sync works
3. **Set Up Domain**: (Optional) Point custom domain to Render
4. **Backup Database**: Regular backups from Supabase
5. **CI/CD Automation**: (Optional) Add GitHub Actions for testing before deploy

Congratulations! 🎉 Your SACCOS platform is now live on Render!
