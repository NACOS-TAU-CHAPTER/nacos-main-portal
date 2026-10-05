# Deploy Frontend to Cloudflare Pages

## Overview

Cloudflare Pages is faster and more generous than Vercel/Netlify:

**Benefits:**
- ✅ Unlimited bandwidth
- ✅ Unlimited builds
- ✅ Faster (global edge network)
- ✅ Built-in DDoS protection
- ✅ Free SSL certificates
- ✅ Free subdomain: `your-project.pages.dev`

---

## Step 1: Create Cloudflare Account

1. Go to https://dash.cloudflare.com/sign-up
2. Sign up with your email
3. Verify your email address

---

## Step 2: Deploy Your Site

### Via Dashboard (Easiest)

1. **Go to Cloudflare Dashboard**
   - https://dash.cloudflare.com

2. **Navigate to Pages**
   - Click "Workers & Pages" in left sidebar
   - Click "Create application"
   - Click "Pages" tab
   - Click "Connect to Git"

3. **Connect GitHub Repository**
   - Authorize Cloudflare to access GitHub
   - Select your repository: `nacos-main-portal`
   - Click "Begin setup"

4. **Configure Build Settings**
   ```
   Project name: nacos-tau-portal
   Production branch: master
   Build command: (leave empty)
   Build output directory: frontend
   Root directory: (leave empty)
   ```

   **Important:** Set "Build output directory" to `frontend`

5. **Environment Variables**
   - Click "Add variable" if needed
   - For static sites, usually not needed

6. **Deploy**
   - Click "Save and Deploy"
   - Wait 1-2 minutes
   - Your site will be live at: `https://nacos-tau-portal.pages.dev`

---

## Step 3: Configure Custom Domain (Optional)

### If You Have a Domain

1. **Add Custom Domain**
   - Cloudflare Dashboard → Pages → Your Project
   - Click "Custom domains" tab
   - Click "Set up a custom domain"
   - Enter your domain: `portal.yourdomain.com`

2. **Configure DNS**

   **Option A: Domain already on Cloudflare**
   - Cloudflare automatically creates DNS records
   - Done! ✅

   **Option B: Domain elsewhere**
   - Add CNAME record at your DNS provider:
     ```
     Type: CNAME
     Name: portal (or @)
     Value: nacos-tau-portal.pages.dev
     ```

3. **SSL Certificate**
   - Cloudflare automatically provisions SSL
   - Usually takes 5-10 minutes
   - Certificate renews automatically

---

## Step 4: Update Backend CORS

After deployment, update your backend's `FRONTEND_URL`:

**In Render (Environment Variables):**
```bash
FRONTEND_URL=https://nacos-tau-portal.pages.dev
# Or if using custom domain:
FRONTEND_URL=https://portal.yourdomain.com
```

Then restart your Render backend service.

---

## Step 5: Test Your Deployment

1. **Visit Your Site**
   ```
   https://nacos-tau-portal.pages.dev
   ```

2. **Test in Browser Console**
   ```javascript
   // Check API URL
   console.log('API URL:', window.API_URL);
   
   // Test backend connection
   fetch(window.API_URL + '/health')
     .then(r => r.json())
     .then(d => console.log('✅ Backend connected:', d))
     .catch(e => console.error('❌ Failed:', e));
   ```

3. **Test Features**
   - Homepage loads
   - Events display
   - Login works
   - No CORS errors

---

## Cloudflare Pages Configuration File

Create `frontend/wrangler.toml` (optional):

```toml
name = "nacos-tau-portal"
compatibility_date = "2024-01-01"

[site]
bucket = "."

[build]
command = ""
```

This is optional - Cloudflare Pages works fine without it.

---

## Automatic Deployments

Cloudflare automatically deploys when you push to GitHub:

**Production Deployments:**
- Push to `master` branch → Deploys to production
- URL: `https://nacos-tau-portal.pages.dev`

**Preview Deployments:**
- Push to any other branch → Creates preview
- URL: `https://branch-name.nacos-tau-portal.pages.dev`
- Open PR → Cloudflare comments with preview link

---

## Performance Comparison

| Metric | Cloudflare | Vercel | Netlify |
|--------|-----------|--------|---------|
| **Global Edge** | 275+ locations | 100+ locations | 100+ locations |
| **TTFB** | ~50ms | ~120ms | ~180ms |
| **Bandwidth** | Unlimited | 100GB | 100GB |
| **Builds** | Unlimited | Unlimited | 300 min |
| **DDoS Protection** | Enterprise-grade | Good | Good |

**Winner**: 🏆 Cloudflare Pages (fastest & most generous)

---

## Advanced Features

### Analytics

Cloudflare provides free analytics:
- Page views
- Unique visitors
- Top pages
- Countries
- Browsers

**Access**: Dashboard → Pages → Your Project → Analytics

### Custom Headers

Create `frontend/_headers`:

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### Redirects

Create `frontend/_redirects`:

```
/old-path /new-path 301
/api/* https://your-backend.onrender.com/api/:splat 200
```

---

## Troubleshooting

### Issue: "Build failed"

**Cause**: Build command or output directory misconfigured

**Solution**:
- Build command: Leave empty (static files)
- Build output directory: `frontend`
- Root directory: Leave empty

### Issue: "404 Not Found"

**Cause**: Incorrect output directory

**Solution**:
- Go to Settings → Builds & deployments
- Build output directory: `frontend`
- Redeploy

### Issue: CORS errors

**Cause**: Backend `FRONTEND_URL` not updated

**Solution**:
1. Go to Render dashboard
2. Update `FRONTEND_URL=https://nacos-tau-portal.pages.dev`
3. Restart backend
4. Test again

### Issue: Custom domain not working

**Cause**: DNS not configured correctly

**Solution**:
1. Check CNAME record points to: `nacos-tau-portal.pages.dev`
2. Wait 5-10 minutes for DNS propagation
3. Check status in Cloudflare dashboard

---

## Security Features

Cloudflare Pages includes:

✅ **DDoS Protection** - Enterprise-grade, always-on
✅ **Bot Protection** - Automatic bot filtering
✅ **SSL/TLS** - Free certificates, auto-renewal
✅ **WAF Rules** - Configurable firewall
✅ **Rate Limiting** - Protect against abuse
✅ **DNSSEC** - DNS security

All included free! 🎉

---

## Cost Estimate

### Free Tier (Forever)
- Unlimited requests
- Unlimited bandwidth
- Unlimited builds
- 500 builds/month (more than enough)
- 20,000 files per deployment
- **Total: $0/month**

### Paid Tier (If Needed)
- $20/month
- Concurrent builds
- Advanced analytics
- Longer log retention
- Priority support

**For your use case**: Free tier is perfect! ✨

---

## Comparison with Vercel

| Feature | Cloudflare Pages | Vercel (Personal) |
|---------|-----------------|-------------------|
| **Bandwidth** | Unlimited | 100GB |
| **Builds** | Unlimited | Unlimited |
| **Speed** | Faster | Fast |
| **DDoS** | Enterprise | Good |
| **Price** | Free forever | Free (limits) |
| **Custom domain** | Free | Free |
| **Analytics** | Free | Free (basic) |

**Recommendation**: Cloudflare Pages is better for your needs! 🚀

---

## URLs Summary

**After Deployment:**
- **Production**: `https://nacos-tau-portal.pages.dev`
- **Preview branches**: `https://branch-name.nacos-tau-portal.pages.dev`
- **Custom domain**: `https://your-domain.com` (if configured)

**GitHub**: `https://github.com/NACOS-TAU-CHAPTER/nacos-main-portal`
**Backend**: `https://nacos-backend.onrender.com` (or your Render URL)

---

## Next Steps

1. ✅ Deploy to Cloudflare Pages
2. ✅ Update backend CORS settings
3. ✅ Test all features
4. ✅ (Optional) Configure custom domain
5. ✅ Monitor analytics
6. ✅ Enjoy unlimited free hosting! 🎉

---

**Deployment Time**: ~5 minutes
**Cost**: $0/month
**Performance**: Excellent
**Recommended**: ✅ Yes!

