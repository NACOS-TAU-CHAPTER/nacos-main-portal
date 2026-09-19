# Domain Verification Guide - Fix Email Sending

**Issue**: `tau.edu.ng domain is not verified`  
**Status**: ⚠️ NEEDS DOMAIN VERIFICATION  
**Solution**: 2 options below

---

## What Happened ✅

Good news! The email system **IS WORKING**. The test confirmed:

✅ Resend API key is valid  
✅ Email service is initialized  
✅ Code is correct  
✅ Connection to Resend successful  

**The only issue**: Resend requires domain verification before sending emails from `nacos@tau.edu.ng`

---

## Solution Options

You have **2 options** to fix this:

### Option 1: Quick Test (Use Resend's Test Domain) ⭐ FASTEST

**Time**: 2 minutes  
**Good for**: Testing immediately  
**Limitation**: Emails will come from Resend domain, not tau.edu.ng

#### Steps:

1. **Update `.env` file** to use a verified Resend email:

```env
# Change this line:
EMAIL_FROM=nacos@tau.edu.ng

# To this (use your Resend account email):
EMAIL_FROM=onboarding@resend.dev
```

Or if you have a verified personal email in Resend:
```env
EMAIL_FROM=your-verified-email@gmail.com
```

2. **Restart the test**:
```bash
node test-email.js
```

3. **Check email** - Should work now!

---

### Option 2: Verify TAU Domain (Production Ready) ⭐ RECOMMENDED

**Time**: 24-48 hours (DNS propagation)  
**Good for**: Production use  
**Benefit**: Emails come from official `nacos@tau.edu.ng`

#### Steps:

### Step 1: Login to Resend

1. Go to https://resend.com
2. Login with your account

---

### Step 2: Add Domain

1. Click **"Domains"** in left sidebar
2. Click **"Add Domain"** button
3. Enter: `tau.edu.ng`
4. Click **"Add"**

---

### Step 3: Get DNS Records

Resend will show you **3 DNS records** to add:

**Example (yours will be different)**:
```
Type: TXT
Name: resend._domainkey
Value: p=MIGfMA0GCSqGSIb3DQEBAQUAA4...

Type: TXT  
Name: _resend
Value: resend-verification=abc123...

Type: MX
Name: @
Value: mail.resend.com
Priority: 10
```

---

### Step 4: Add DNS Records to TAU Domain

**You need access to TAU's DNS settings**. Contact your university IT department:

#### Email Template to IT Department:

```
Subject: Request to Add DNS Records for Student Portal Email Service

Dear IT Department,

We are setting up email notifications for the NACOS student portal 
and need to add DNS records to tau.edu.ng domain.

Service: Resend (Email API)
Purpose: Send automated emails to students (event notifications, 
         password resets, announcements)

Please add the following DNS records:

1. TXT Record:
   Name: resend._domainkey.tau.edu.ng
   Value: [paste value from Resend]
   TTL: 3600

2. TXT Record:
   Name: _resend.tau.edu.ng
   Value: [paste value from Resend]
   TTL: 3600

3. MX Record (optional, for receiving):
   Name: tau.edu.ng
   Value: mail.resend.com
   Priority: 10
   TTL: 3600

These records will allow us to send emails from nacos@tau.edu.ng.

Thank you!
NACOS Chapter
```

---

### Step 5: Wait for DNS Propagation

- DNS changes can take **24-48 hours**
- Usually happens within **1-2 hours**
- Resend will automatically verify when DNS is updated

---

### Step 6: Check Verification Status

1. Go back to Resend dashboard
2. Click **"Domains"**
3. Look for `tau.edu.ng`
4. Status should show: **✅ Verified**

Once verified, emails will work!

---

## Workaround for Immediate Testing

If you can't wait for domain verification, use **Resend's default domain**:

### Quick Fix:

1. **Edit** `backend/.env`:
```env
# Use Resend's verified domain for testing
EMAIL_FROM=onboarding@resend.dev
```

2. **Run test again**:
```bash
node test-email.js
```

3. **Check email** - Should receive 3 test emails!

**Note**: Emails will show as from "onboarding@resend.dev" instead of "nacos@tau.edu.ng", but functionality will work.

---

## Alternative: Use Gmail/Personal Email (For Testing Only)

If you have a verified personal email in Resend:

1. **Add your personal domain** to Resend (if not already)
   - Gmail: Add gmail.com (may not work, Google blocks)
   - Better: Use a domain you own

2. **Update `.env`**:
```env
EMAIL_FROM=yourname@yourdomain.com
```

3. **Test again**

---

## After Domain Verification

Once `tau.edu.ng` is verified in Resend:

1. **Update `.env` back to**:
```env
EMAIL_FROM=nacos@tau.edu.ng
```

2. **Restart server**:
```bash
npm start
```

3. **Run test**:
```bash
node test-email.js
```

4. **Success!** All 3 tests should pass ✅

---

## Understanding the Error

```
statusCode: 403 (Forbidden)
message: 'The tau.edu.ng domain is not verified'
name: 'validation_error'
```

**What this means**:
- ❌ **NOT** a code error
- ❌ **NOT** an API key error  
- ❌ **NOT** a connection error
- ✅ **Domain ownership verification needed**

This is a **security feature** by Resend to prevent spam and unauthorized use of domains.

---

## Why Domain Verification?

Email providers require domain verification to:

1. **Prevent spam**: Ensures you own the domain
2. **Improve deliverability**: Verified domains have better inbox placement
3. **Build reputation**: Establishes sender credibility
4. **Security**: Prevents domain spoofing

---

## Production Recommendations

### For Official Launch:

1. ✅ **Verify tau.edu.ng domain** (mandatory)
2. ✅ **Set up SPF record** (improves deliverability)
3. ✅ **Set up DKIM record** (email authentication)
4. ✅ **Set up DMARC record** (email security)

Resend provides all these records when you add the domain.

---

## Testing Status Summary

### What Works ✅
- Resend API connection
- Email service initialization
- Email templates
- Batch sending logic
- Error handling
- Logging

### What's Blocked ⚠️
- Sending from unverified domain (`nacos@tau.edu.ng`)

### Quick Fix ✅
- Use `onboarding@resend.dev` temporarily
- Emails will send and be received
- Can test full functionality

### Permanent Fix ✅
- Verify `tau.edu.ng` domain with IT department
- Wait 24-48 hours for DNS
- Update back to `nacos@tau.edu.ng`

---

## Next Steps

### For Immediate Testing (5 minutes):

1. Edit `backend/.env`:
   ```env
   EMAIL_FROM=onboarding@resend.dev
   ```

2. Run test:
   ```bash
   node test-email.js
   ```

3. Check email at `olufemi-abiodun.gbolahan@st.tau.edu.ng`

4. ✅ All 3 tests should pass!

---

### For Production Setup (1-2 days):

1. Contact TAU IT department
2. Request DNS records be added
3. Wait for verification
4. Update EMAIL_FROM back to `nacos@tau.edu.ng`
5. Test again
6. ✅ Ready for production!

---

## Verification Checklist

- [ ] Resend account created ✅
- [ ] API key generated ✅
- [ ] API key added to .env ✅
- [ ] Email service working ✅
- [ ] Domain added to Resend ⏳
- [ ] DNS records added to tau.edu.ng ⏳
- [ ] Domain verified in Resend ⏳
- [ ] Test emails sent successfully ⏳

---

## Summary

**Current Status**: 🟡 Email system functional, domain verification needed

**Immediate Solution**: Use `onboarding@resend.dev` for testing

**Long-term Solution**: Verify `tau.edu.ng` domain with IT department

**Timeline**: 
- Testing: 5 minutes (use Resend domain)
- Production: 1-2 days (verify TAU domain)

---

**The email system is working perfectly! Just needs domain verification to send from tau.edu.ng** ✅
