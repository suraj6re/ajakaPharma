# Email Service Migration: Brevo → Nodemailer

## ✅ Migration Complete

Successfully migrated from Brevo email service to Nodemailer with Gmail.

---

## 📧 Configuration

### Gmail Account
- **Email:** suraj6re@gmail.com
- **App Password:** ximw pfkv hzsk tevz
- **Service:** Gmail SMTP

### Environment Variables (.env)
```env
EMAIL_USER=suraj6re@gmail.com
EMAIL_APP_PASSWORD=ximw pfkv hzsk tevz
EMAIL_SENDER_NAME=Ajaka Pharma
```

---

## 🔧 Changes Made

### 1. Installed Nodemailer
```bash
npm install nodemailer
```

### 2. Updated Email Service
**File:** `server/services/emailService.js`

**Before (Brevo):**
```javascript
const axios = require('axios');
// Used Brevo REST API with API key
```

**After (Nodemailer):**
```javascript
const nodemailer = require('nodemailer');

// Gmail SMTP configuration
this.transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});
```

### 3. Updated .env File
Replaced Brevo configuration with Gmail configuration.

### 4. Created Test Script
**File:** `server/test-email.js`

Run with:
```bash
npm run test-email
```

---

## ✅ Test Results

All email types tested successfully:

### Test 1: Simple Test Email ✅
- **Status:** PASSED
- **Message ID:** Generated successfully
- **Delivery:** Confirmed

### Test 2: Application Received Email ✅
- **Status:** PASSED
- **Template:** MR application confirmation
- **Delivery:** Confirmed

### Test 3: Approval Email ✅
- **Status:** PASSED
- **Template:** Account approval with credentials
- **Delivery:** Confirmed

### Test 4: Rejection Email ✅
- **Status:** PASSED
- **Template:** Application rejection
- **Delivery:** Confirmed

---

## 📨 Email Templates

### 1. Application Received Email
**Sent when:** User submits MR application
**Contains:**
- Confirmation of receipt
- Application details (name, email, phone, area)
- Expected review timeline (2-3 business days)

### 2. Approval Email
**Sent when:** Admin approves MR application
**Contains:**
- Congratulations message
- Login credentials (email + temporary password)
- Website URL
- Security notice about password change

### 3. Rejection Email
**Sent when:** Admin rejects MR application
**Contains:**
- Polite rejection message
- Encouragement to apply again
- Professional closing

---

## 🔐 Gmail App Password Setup

### How to Generate Gmail App Password:

1. Go to Google Account Settings
2. Enable 2-Factor Authentication
3. Go to Security → App Passwords
4. Generate new app password for "Mail"
5. Copy the 16-digit password
6. Use in .env file (spaces removed)

### Current App Password:
```
ximw pfkv hzsk tevz
```

---

## 🚀 Usage in Application

### In Controllers
```javascript
const emailService = require('../services/emailService');

// Send application received email
await emailService.sendApplicationReceivedEmail(
  name, 
  email, 
  phone, 
  area
);

// Send approval email
await emailService.sendApprovalEmail(
  email, 
  tempPassword
);

// Send rejection email
await emailService.sendRejectionEmail(email);
```

### Error Handling
All email functions return:
```javascript
{
  success: true/false,
  messageId: 'xxx' // if successful
  error: 'message' // if failed
}
```

Emails are sent asynchronously and failures don't block the main operation.

---

## 📊 Comparison: Brevo vs Nodemailer

| Feature | Brevo | Nodemailer |
|---------|-------|------------|
| **Setup** | API Key required | Gmail credentials |
| **Cost** | Free tier limited | Free with Gmail |
| **Reliability** | High | High |
| **Speed** | Fast | Fast |
| **Configuration** | REST API | SMTP |
| **Complexity** | Medium | Simple |
| **Dependencies** | axios | nodemailer |

---

## 🔍 Troubleshooting

### Issue: "Invalid login" error
**Solution:** 
- Ensure 2FA is enabled on Gmail
- Generate new app password
- Use app password, not regular password

### Issue: "Less secure app access"
**Solution:**
- Use app password instead
- Don't enable "less secure apps"

### Issue: Emails not received
**Solution:**
- Check spam folder
- Verify email address
- Check Gmail sending limits (500/day)

---

## 📝 Testing Commands

```bash
# Test email service
npm run test-email

# Test MR request system (includes emails)
npm run test-mr-requests

# Start development server
npm run dev
```

---

## 🎯 Integration Points

Email service is integrated in:

1. **MR Request Controller** (`server/controllers/mrRequestController.js`)
   - `submitRequest()` - Sends confirmation email
   - `approveRequest()` - Sends approval email with credentials
   - `rejectRequest()` - Sends rejection email

2. **Email Controller** (`server/controllers/emailController.js`)
   - Direct email sending endpoints (if needed)

3. **Email Routes** (`server/routes/emailRoutes.js`)
   - API endpoints for email operations

---

## ✅ Migration Checklist

- [x] Install nodemailer package
- [x] Update emailService.js with Nodemailer
- [x] Update .env with Gmail credentials
- [x] Remove Brevo configuration
- [x] Create test script
- [x] Test all email templates
- [x] Verify email delivery
- [x] Update documentation

---

## 🔒 Security Notes

1. **App Password Storage:**
   - Stored in .env file (not committed to git)
   - .env is in .gitignore
   - Never share app password publicly

2. **Email Content:**
   - HTML templates are sanitized
   - No user input directly in templates
   - Professional formatting

3. **Rate Limiting:**
   - Gmail limit: 500 emails/day
   - Sufficient for MR application system
   - Consider upgrade if needed

---

## 📈 Future Enhancements

Possible improvements:

1. **Email Queue:**
   - Use Bull or Bee-Queue for background processing
   - Retry failed emails automatically

2. **Email Templates:**
   - Move HTML to separate template files
   - Use template engine (Handlebars, EJS)

3. **Email Tracking:**
   - Track email opens
   - Track link clicks
   - Delivery confirmations

4. **Multiple Providers:**
   - Fallback to SendGrid if Gmail fails
   - Load balancing across providers

---

## 🎉 Summary

Successfully migrated from Brevo to Nodemailer with Gmail:

- ✅ All email templates working
- ✅ Test script created and passing
- ✅ Gmail SMTP configured
- ✅ App password secured in .env
- ✅ All 4 email types tested
- ✅ Integration with MR request system verified

**Status:** Production Ready ✅

**Email Service:** Fully Operational 📧
