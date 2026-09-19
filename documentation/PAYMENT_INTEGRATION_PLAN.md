# Payment Integration Plan for Events

## Overview
Enable students to pay for events directly on the website with automated email confirmations and payment verification tracking.

## Recommended Payment Gateways (Nigeria)

### Option 1: Paystack (RECOMMENDED) ⭐
**Best for:** Nigerian payments, great documentation, student-friendly
- ✅ Accepts Naira (₦)
- ✅ Card payments (Mastercard, Visa, Verve)
- ✅ Bank transfers
- ✅ USSD
- ✅ Mobile money
- ✅ Free to integrate
- ✅ 1.5% + ₦100 per transaction (capped at ₦2,000)
- ✅ Instant verification via webhooks
- ✅ Test mode for development
- 🌐 https://paystack.com

### Option 2: Flutterwave
**Alternative:** More payment options, slightly higher fees
- ✅ Cards, bank transfer, mobile money
- ✅ International payments
- ✅ 1.4% transaction fee
- 🌐 https://flutterwave.com

### Option 3: Monnify (For Bank Transfers)
**Best for:** Direct bank transfers without cards
- ✅ Generates temporary account numbers
- ✅ Cheaper than card payments
- ✅ Good for larger amounts
- 🌐 https://monnify.com

## Recommended: Paystack Integration

### Why Paystack?
1. Most popular in Nigeria
2. Easy integration
3. Students trust it
4. Great documentation
5. Instant webhooks for verification
6. Test mode for development

## System Architecture

### Flow Diagram
```
Student → Event Page → "Pay Now" Button
    ↓
Paystack Payment Modal Opens
    ↓
Student Enters Card/Bank Details
    ↓
Payment Processed by Paystack
    ↓
Webhook Sent to Backend
    ↓
Backend Verifies Payment
    ↓
Create Payment Record → Send Email → Update Event Registration
    ↓
Student Receives Confirmation Email
```

### Database Tables (Already Exist!)

**payments** table:
```sql
- id (UUID)
- user_id (UUID) - References students
- event_id (UUID) - References events
- amount (DECIMAL)
- status ('pending', 'verified', 'failed')
- payment_reference (TEXT) - Paystack reference
- payment_type ('event_registration')
- submitted_at (TIMESTAMP)
- verified_at (TIMESTAMP)
```

**events** table (has payment fields):
```sql
- requires_payment (BOOLEAN)
- payment_amount (DECIMAL)
- payment_link (TEXT) - For manual payments
- payment_details (TEXT) - Bank account info
```

## Implementation Steps

### Phase 1: Setup Paystack Account
1. Sign up at https://paystack.com
2. Complete business verification
3. Get API keys:
   - Public Key (for frontend)
   - Secret Key (for backend)
4. Set up webhook URL

### Phase 2: Backend Implementation
**Files to Create/Modify:**
1. `backend/routes/paystack.js` - Payment routes
2. `backend/services/paystack.js` - Paystack API wrapper
3. `backend/.env` - Add Paystack keys
4. `backend/webhooks/paystack.js` - Webhook handler

### Phase 3: Frontend Implementation
**Files to Modify:**
1. `frontend/student-dashboard.html` - Add "Pay Now" button
2. `frontend/assets/js/paystack-handler.js` - Payment modal
3. Event details modal - Show payment status

### Phase 4: Email Notifications
**Using existing email system (Resend):**
1. Payment successful email
2. Payment failed email
3. Payment pending email

## Technical Implementation

### 1. Backend - Paystack Service

**File: `backend/services/paystack.js`**
```javascript
const axios = require('axios');

class PaystackService {
  constructor() {
    this.baseUrl = 'https://api.paystack.co';
    this.secretKey = process.env.PAYSTACK_SECRET_KEY;
  }

  // Initialize payment
  async initializePayment({ email, amount, metadata }) {
    const response = await axios.post(
      `${this.baseUrl}/transaction/initialize`,
      {
        email,
        amount: amount * 100, // Convert to kobo
        metadata,
        callback_url: `${process.env.FRONTEND_URL}/payment-callback`
      },
      {
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  }

  // Verify payment
  async verifyPayment(reference) {
    const response = await axios.get(
      `${this.baseUrl}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${this.secretKey}`
        }
      }
    );
    return response.data;
  }
}

module.exports = new PaystackService();
```

### 2. Backend - Payment Routes

**File: `backend/routes/paystack.js`**
```javascript
const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { authenticate } = require('../middleware/auth');
const paystackService = require('../services/paystack');
const { sendEmail } = require('../services/email');

// Initialize payment
router.post('/initialize', authenticate, async (req, res) => {
  try {
    const { event_id, amount } = req.body;
    const userId = req.userId;

    // Get user details
    const { data: user } = await supabase
      .from('students')
      .select('email, name')
      .eq('id', userId)
      .single();

    // Get event details
    const { data: event } = await supabase
      .from('events')
      .select('*')
      .eq('id', event_id)
      .single();

    if (!event.requires_payment) {
      return res.status(400).json({ error: 'Event does not require payment' });
    }

    // Initialize Paystack payment
    const payment = await paystackService.initializePayment({
      email: user.email,
      amount: event.payment_amount,
      metadata: {
        user_id: userId,
        event_id: event_id,
        user_name: user.name,
        event_title: event.title
      }
    });

    // Create payment record
    await supabase.from('payments').insert({
      user_id: userId,
      event_id: event_id,
      amount: event.payment_amount,
      status: 'pending',
      payment_reference: payment.data.reference,
      payment_type: 'event_registration',
      submitted_at: new Date().toISOString()
    });

    res.json({
      success: true,
      data: {
        authorization_url: payment.data.authorization_url,
        access_code: payment.data.access_code,
        reference: payment.data.reference
      }
    });

  } catch (error) {
    console.error('Payment initialization error:', error);
    res.status(500).json({ error: 'Payment initialization failed' });
  }
});

// Verify payment
router.get('/verify/:reference', authenticate, async (req, res) => {
  try {
    const { reference } = req.params;

    // Verify with Paystack
    const verification = await paystackService.verifyPayment(reference);

    if (verification.data.status === 'success') {
      // Update payment record
      const { data: payment } = await supabase
        .from('payments')
        .update({
          status: 'verified',
          verified_at: new Date().toISOString()
        })
        .eq('payment_reference', reference)
        .select()
        .single();

      // Get event and user details for email
      const { data: event } = await supabase
        .from('events')
        .select('*')
        .eq('id', payment.event_id)
        .single();

      const { data: user } = await supabase
        .from('students')
        .select('*')
        .eq('id', payment.user_id)
        .single();

      // Send confirmation email
      await sendEmail({
        to: user.email,
        subject: `Payment Confirmed - ${event.title}`,
        html: generatePaymentSuccessEmail(user, event, payment)
      });

      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: payment
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

// Webhook endpoint (for automatic verification)
router.post('/webhook', async (req, res) => {
  try {
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(400).send('Invalid signature');
    }

    const event = req.body;

    if (event.event === 'charge.success') {
      const reference = event.data.reference;
      const metadata = event.data.metadata;

      // Update payment
      await supabase
        .from('payments')
        .update({
          status: 'verified',
          verified_at: new Date().toISOString()
        })
        .eq('payment_reference', reference);

      // Send email notification
      // ... (similar to verify endpoint)
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Webhook processing failed');
  }
});

function generatePaymentSuccessEmail(user, event, payment) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1b8c0c; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #1b8c0c; }
        .footer { text-align: center; padding: 20px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Confirmed! ✅</h1>
        </div>
        <div class="content">
          <p>Hi ${user.name},</p>
          <p>Your payment for <strong>${event.title}</strong> has been confirmed!</p>
          
          <div class="details">
            <h3>Payment Details:</h3>
            <p><strong>Amount:</strong> ₦${payment.amount.toLocaleString()}</p>
            <p><strong>Reference:</strong> ${payment.payment_reference}</p>
            <p><strong>Date:</strong> ${new Date(payment.verified_at).toLocaleString()}</p>
          </div>

          <div class="details">
            <h3>Event Details:</h3>
            <p><strong>Title:</strong> ${event.title}</p>
            <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${event.time || 'TBA'}</p>
            <p><strong>Location:</strong> ${event.location || 'TBA'}</p>
          </div>

          <p>You're all set! See you at the event.</p>
        </div>
        <div class="footer">
          <p>NACOS TAU Chapter</p>
          <p>This is an automated email. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

module.exports = router;
```

### 3. Frontend - Payment Button

**Add to `frontend/student-dashboard.html`:**
```html
<!-- In event details modal -->
<div id="paymentSection" style="display: none;">
  <div class="alert alert-info">
    <i class="bi bi-credit-card"></i>
    <strong>Payment Required:</strong> ₦<span id="eventAmount"></span>
  </div>
  <button class="btn btn-success w-100" onclick="initiatePayment()">
    <i class="bi bi-lock-fill"></i> Pay with Paystack
  </button>
</div>

<script>
// Load Paystack inline JS
const paystackScript = document.createElement('script');
paystackScript.src = 'https://js.paystack.co/v1/inline.js';
document.head.appendChild(paystackScript);

async function initiatePayment() {
  const eventId = currentEventId;
  const amount = currentEventAmount;

  try {
    // Initialize payment with backend
    const response = await fetch(`${API_URL}/api/paystack/initialize`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event_id: eventId,
        amount: amount
      })
    });

    const result = await response.json();

    if (result.success) {
      // Open Paystack payment modal
      const handler = PaystackPop.setup({
        key: 'pk_test_your_public_key', // Replace with your public key
        email: userEmail,
        amount: amount * 100, // In kobo
        ref: result.data.reference,
        onClose: function() {
          Swal.fire('Payment Cancelled', 'You closed the payment window', 'warning');
        },
        callback: function(response) {
          verifyPayment(response.reference);
        }
      });
      handler.openIframe();
    }
  } catch (error) {
    console.error('Payment error:', error);
    Swal.fire('Error', 'Failed to initialize payment', 'error');
  }
}

async function verifyPayment(reference) {
  try {
    const response = await fetch(`${API_URL}/api/paystack/verify/${reference}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    const result = await response.json();

    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Payment Successful!',
        text: 'Check your email for confirmation',
        confirmButtonColor: '#1b8c0c'
      });
      
      // Reload events to show updated registration status
      loadEvents();
    }
  } catch (error) {
    console.error('Verification error:', error);
    Swal.fire('Error', 'Payment verification failed', 'error');
  }
}
</script>
```

## Environment Variables

**Add to `backend/.env`:**
```env
# Paystack Configuration
PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxx
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxx
PAYSTACK_WEBHOOK_SECRET=your_webhook_secret
```

## Testing

### Test Mode (Free)
1. Use Paystack test keys (pk_test_xxx and sk_test_xxx)
2. Use test card: **4084084084084081**
3. CVV: **408**
4. Expiry: Any future date
5. PIN: **0000**
6. OTP: **123456**

## Security Considerations

1. ✅ Never expose secret key in frontend
2. ✅ Verify webhook signatures
3. ✅ Validate payment amounts on backend
4. ✅ Check payment status before granting access
5. ✅ Use HTTPS only
6. ✅ Log all payment attempts

## Benefits

1. **Automated** - No manual verification needed
2. **Instant** - Payment confirmed in seconds
3. **Secure** - PCI-DSS compliant via Paystack
4. **Email confirmations** - Automatic receipts
5. **Multiple payment methods** - Cards, bank transfer, USSD
6. **Audit trail** - All payments logged
7. **Refund support** - Can process refunds via Paystack dashboard

## Cost Analysis

For a ₦5,000 event fee:
- **Paystack fee**: 1.5% + ₦100 = ₦175
- **Net amount**: ₦4,825
- **Student pays**: ₦5,000

## Alternative: Split Payment Options

Can offer both:
1. **Online payment** (Paystack) - Instant confirmation
2. **Bank transfer** (Manual) - Current system with proof upload

## Next Steps

1. Choose payment gateway (Paystack recommended)
2. Create account and get API keys
3. Implement backend routes
4. Add payment buttons to frontend
5. Test with test mode
6. Deploy and switch to live keys
7. Train admins on refund process

---

**Estimated Implementation Time**: 8-12 hours
**Difficulty**: Medium
**Cost**: Free to integrate, 1.5% + ₦100 per transaction
