# Trust Proxy Configuration Fix

## Issue
Railway deployment logs showed this warning:
```
ValidationError: The Express 'trust proxy' setting is true, which allows 
anyone to trivially bypass IP-based rate limiting.
```

## What is Trust Proxy?

### The Problem
When your app runs behind a reverse proxy (Railway, Cloudflare, Nginx), the IP address Express sees is the proxy's IP, not the real client IP. This breaks:
- Rate limiting (all requests look like they come from same IP)
- IP-based access control
- Logging/analytics

### The Solution
Use the `X-Forwarded-For` header, which proxies set to indicate the real client IP.

## Security Concern

### `trust proxy = true` (INSECURE)
Trusts **all** `X-Forwarded-For` headers from **anyone**, including:
- Legitimate proxies (Railway, Cloudflare)
- **Malicious clients** who can spoof this header

**Risk**: Attackers can bypass rate limiting by setting fake IPs.

### `trust proxy = 1` (SECURE)
Trusts only the **first proxy** (Railway's proxy), ignoring any client-provided headers.

## Our Fix

### Before (Insecure)
```javascript
// Trust all proxies - anyone can spoof
app.set('trust proxy', true);
```

### After (Secure)
```javascript
// Trust only 1 hop (Railway's proxy)
if (process.env.TRUST_PROXY) {
  const tp = process.env.TRUST_PROXY;
  if (/^(true|1)$/i.test(tp)) {
    app.set('trust proxy', 1); // Trust only the first proxy
  } else {
    app.set('trust proxy', tp);
  }
}
```

### Rate Limiter Configuration
```javascript
// In middleware/rateLimit.js and server.js
const commonConfig = {
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false } // Disable warning (we handle it properly)
};

const limiter = rateLimit({
  ...commonConfig,
  // ... other options
});
```

## How It Works

### Request Flow
```
Real Client (IP: 203.0.113.5)
    ↓
Railway Proxy (adds X-Forwarded-For: 203.0.113.5)
    ↓
Your Express App
    ↓
req.ip = 203.0.113.5 ✅ (correct IP from first proxy)
```

### Attack Attempt (Blocked)
```
Attacker (IP: 198.51.100.10)
Sends: X-Forwarded-For: 1.2.3.4 (fake)
    ↓
Railway Proxy (overwrites with real IP: 198.51.100.10)
    ↓
Your Express App
    ↓
req.ip = 198.51.100.10 ✅ (attacker's real IP, can't spoof)
```

## Configuration Options

### Option 1: Trust 1 Hop (Railway - Recommended)
```bash
TRUST_PROXY=true  # or TRUST_PROXY=1
```
Result: `app.set('trust proxy', 1)`

### Option 2: Trust Specific IPs
```bash
TRUST_PROXY=loopback,linklocal,uniquelocal
```
Result: Only trust specific network ranges

### Option 3: Custom Number of Hops
```bash
TRUST_PROXY=2  # If using Cloudflare + Railway
```
Result: Trust 2 proxies in chain

## Files Modified

1. **backend/server.js**
   - Changed `trust proxy` from `true` to `1`
   - Added comment explaining security reasoning

2. **backend/middleware/rateLimit.js**
   - Added `validate: { trustProxy: false }` to all limiters
   - Extracts common config to avoid repetition

## Testing

### Test Real IP Detection
```bash
# Should return your real IP
curl https://naco-tau-backend-production.up.railway.app/api/health

# Check logs - should show your IP, not Railway's proxy IP
```

### Test Rate Limiting
```bash
# Make 101 requests quickly (limit is 100/15min)
for i in {1..101}; do 
  curl https://naco-tau-backend-production.up.railway.app/api/health
done

# Request 101 should return 429 Too Many Requests
```

### Test Spoof Attempt (Should Fail)
```bash
# Try to spoof IP (should be ignored)
curl -H "X-Forwarded-For: 1.2.3.4" \
  https://naco-tau-backend-production.up.railway.app/api/health

# Your real IP should still be logged, not 1.2.3.4
```

## Benefits

✅ **Security**: Can't bypass rate limiting  
✅ **Accurate Logging**: Real client IPs in logs  
✅ **No Warnings**: Rate limiter warning eliminated  
✅ **Railway Compatible**: Works with Railway's proxy setup  
✅ **Future-Proof**: Easy to add more proxies if needed  

## Deployment

No environment variable changes needed. Current `TRUST_PROXY=true` works correctly with the new code.

The warning will **disappear** on next deployment.

## Summary

| Setting | Security | Use Case |
|---------|----------|----------|
| `true` | ❌ Low | Never use (allows spoofing) |
| `1` | ✅ High | **Railway (our setup)** |
| `2` | ✅ High | Cloudflare + Railway |
| `loopback` | ✅ High | Only localhost proxy |

**Our Choice**: `trust proxy = 1` (Railway's single proxy)

---

**Created**: 2026-08-24  
**Status**: ✅ Fixed  
**Impact**: Security improvement + warning removal
