# 🔐 Login Credentials

## Available Admin Accounts

### Option 1: Main Admin
```
Email: admin@ajaka.com
Password: admin123
Role: Admin
```

### Option 2: Your Admin Account
```
Email: suraj6re@gmail.com
Password: Admin@123
Role: Admin
```

---

## Available MR Accounts

### MR Test Account
```
Email: mr@ajaka.com
Password: mr123
Role: MR
```

### Sample MR Accounts
All have password: `mr123`

1. rajesh.kumar@ajakapharma.com
2. priya.sharma@ajakapharma.com
3. amit.patel@ajakapharma.com
4. sneha.reddy@ajakapharma.com
5. vikram.singh@ajakapharma.com
6. anjali.verma@ajakapharma.com
7. rahul.gupta@ajakapharma.com
8. kavita.desai@ajakapharma.com

---

## 🔧 If Login Still Fails

### Reset Admin Password
```bash
cd server
node create-admin.js
```

This will create/reset the admin account:
- Email: admin@ajaka.com
- Password: admin123

---

## 🧪 Test Login

### From Command Line
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ajaka.com","password":"admin123"}'
```

### Expected Response
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "name": "Admin User",
      "email": "admin@ajaka.com",
      "role": "Admin"
    }
  }
}
```

---

## 🚨 Common Login Issues

### Issue 1: Wrong Password
**Error:** 401 Unauthorized
**Solution:** Use correct password (admin123 or mr123)

### Issue 2: Wrong Email
**Error:** 401 Unauthorized
**Solution:** Check email spelling

### Issue 3: Server Not Running
**Error:** Network Error
**Solution:** Start server with `npm run dev`

### Issue 4: Wrong Port
**Error:** Network Error
**Solution:** Server runs on port 5000, frontend on 5173

---

## 📝 Quick Start

1. **Start Backend:**
   ```bash
   cd server
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd .. (to root)
   npm run dev
   ```

3. **Login as Admin:**
   - Go to: http://localhost:5173/login
   - Email: admin@ajaka.com
   - Password: admin123
   - Click Login

4. **Access Admin Panel:**
   - After login, you'll be redirected to admin dashboard
   - Navigate to "MR Requests" to approve applications

---

## 🎯 For Testing MR Approval Email

1. **Create Application with Your Email:**
   - Go to: http://localhost:5173/request-mr-access
   - Name: Your Name
   - Email: suraj6re@gmail.com
   - Phone: +91 9876543210
   - Area: Mumbai
   - Experience: Test
   - Submit

2. **Login as Admin:**
   - Email: admin@ajaka.com
   - Password: admin123

3. **Approve Request:**
   - Go to "MR Requests"
   - Click "Approve" on your application
   - Confirm in modal
   - See credentials in modal
   - **Check your email:** suraj6re@gmail.com

4. **Verify Email:**
   - Open Gmail
   - Look for email from "Ajaka Pharma"
   - Subject: "🎉 Your MR Account is Approved"
   - Contains your login credentials

---

## ✅ Summary

**Admin Login:**
- Email: `admin@ajaka.com`
- Password: `admin123`

**MR Login:**
- Email: `mr@ajaka.com`
- Password: `mr123`

**Your Admin:**
- Email: `suraj6re@gmail.com`
- Password: `Admin@123`

**Server:** http://localhost:5000
**Frontend:** http://localhost:5173
