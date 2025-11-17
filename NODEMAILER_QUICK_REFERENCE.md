# Nodemailer Quick Reference - MR Reporting System

## 🚀 Quick Start

### Test Email Service
```bash
cd server
npm run test-email
```

### Check Your Inbox
- **Email:** suraj6re@gmail.com
- **Check:** Inbox and Spam folder

---

## 📧 Email Configuration

### .env File
```env
EMAIL_USER=suraj6re@gmail.com
EMAIL_APP_PASSWORD=ximw pfkv hzsk tevz
EMAIL_SENDER_NAME=Ajaka Pharma
```

### Gmail Settings
- **Service:** Gmail SMTP
- **Port:** 465 (SSL) or 587 (TLS)
- **Authentication:** App Password (16 digits)

---

## 💻 Code Usage

### Import Email Service
```javascript
const emailService = require('../services/emailService');
```

### Send Application Received Email
```javascript
await emailService.sendApplicationReceivedEmail(
  'John Doe',              // name
  'john@example.com',      // email
  '+91 98765 43210',       // phone
  'Mumbai'                 // area
);
```

### Send Approval Email
```javascript
await emailService.sendApprovalEmail(
  'john@example.com',      // email
  'TEMP123'                // temporary password
);
```

### Send Rejection Email
```javascript
await emailService.sendRejectionEmail(
  'john@example.com'       // email
);
```

### Send Custom Email
```javascript
await emailService.sendEmail(
  'recipient@example.com',           // to
  'Subject Line',                    // subject
  '<h1>HTML Content</h1>'           // html content
);
```

---

## 🔧 Nodemailer Configuration

### Basic Setup
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'suraj6re@gmail.com',
    pass: 'ximw pfkv hzsk tevz'
  }
});
```

### Send Email
```javascript
const mailOptions = {
  from: '"Ajaka Pharma" <suraj6re@gmail.com>',
  to: 'recipient@example.com',
  subject: 'Subject',
  html: '<h1>HTML Content</h1>'
};

await transporter.sendMail(mailOptions);
```

---

## 📨 Email Templates

### 1. Application Received
**Trigger:** User submits MR application
**Template:** Professional confirmation with application details
**Color Scheme:** Blue gradient

### 2. Approval Email
**Trigger:** Admin approves application
**Template:** Congratulations with login credentials
**Color Scheme:** Green gradient
**Contains:** Email, temporary password, login URL

### 3. Rejection Email
**Trigger:** Admin rejects application
**Template:** Polite rejection with encouragement
**Color Scheme:** Blue gradient

---

## 🧪 Testing

### Test All Email Types
```bash
npm run test-email
```

### Expected Output
```
✅ Test 1 PASSED - Email sent successfully
✅ Test 2 PASSED - Application email sent
✅ Test 3 PASSED - Approval email sent
✅ Test 4 PASSED - Rejection email sent
```

### Check Results
1. Open Gmail: suraj6re@gmail.com
2. Check Inbox for 4 test emails
3. Verify HTML formatting
4. Check all links work

---

## 🔍 Troubleshooting

### Problem: "Invalid login"
**Solution:**
```bash
1. Go to Google Account → Security
2. Enable 2-Factor Authentication
3. Generate new App Password
4. Update .env file
```

### Problem: Emails not received
**Check:**
- Spam folder
- Gmail sending limits (500/day)
- Internet connection
- .env file loaded correctly

### Problem: HTML not rendering
**Solution:**
- Use `html` property, not `text`
- Ensure HTML is valid
- Test in different email clients

---

## 📊 Email Limits

### Gmail Free Account
- **Daily Limit:** 500 emails/day
- **Per Hour:** ~100 emails/hour
- **Attachment Size:** 25 MB max
- **Recipients per email:** 500 max

### For MR System
- **Expected Usage:** 5-20 emails/day
- **Peak Usage:** 50 emails/day
- **Status:** Well within limits ✅

---

## 🔐 Security Best Practices

### App Password
- ✅ Use app password, not regular password
- ✅ Store in .env file
- ✅ Never commit to git
- ✅ Rotate periodically

### Email Content
- ✅ Sanitize user input
- ✅ Use HTML templates
- ✅ No sensitive data in subject
- ✅ HTTPS links only

---

## 📝 Common Commands

```bash
# Install nodemailer
npm install nodemailer

# Test email service
npm run test-email

# Start server (emails will work)
npm run dev

# Test MR requests (includes emails)
npm run test-mr-requests
```

---

## 🎯 Integration Points

### MR Request Flow
1. User submits application → **Confirmation email sent**
2. Admin reviews application
3. Admin approves → **Approval email with credentials**
4. Admin rejects → **Rejection email**

### Files Involved
- `server/services/emailService.js` - Email service
- `server/controllers/mrRequestController.js` - MR request logic
- `.env` - Email configuration

---

## ✅ Verification Checklist

- [x] Nodemailer installed
- [x] Gmail app password configured
- [x] .env file updated
- [x] Test script created
- [x] All 4 email types tested
- [x] Emails received successfully
- [x] HTML templates rendering correctly
- [x] Integration with MR requests working

---

## 🚀 Production Ready

**Status:** ✅ READY

**Email Service:** Fully operational with Gmail SMTP via Nodemailer

**Test Results:** All tests passing

**Integration:** Complete with MR application system

---

## 📞 Support

### Gmail App Password Issues
- Visit: https://myaccount.google.com/apppasswords
- Ensure 2FA is enabled
- Generate new 16-digit password

### Nodemailer Documentation
- Website: https://nodemailer.com
- GitHub: https://github.com/nodemailer/nodemailer

### Email Testing
- Use: npm run test-email
- Check: suraj6re@gmail.com inbox

---

## 🎉 Summary

✅ **Brevo removed** - No longer using Brevo API
✅ **Nodemailer installed** - Gmail SMTP configured
✅ **All emails working** - 4 templates tested
✅ **Production ready** - Fully integrated

**Your email service is now running on Nodemailer with Gmail!** 📧
