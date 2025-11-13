# Authentication System - JWT Based

## Overview
The system now uses JWT (JSON Web Token) based authentication with MongoDB, replacing the previous Firebase authentication.

## Login Credentials

### Admin Account
- **Email:** suraj6re@gmail.com
- **Password:** Admin@123

## How It Works

### 1. Login Process
1. User submits email and password
2. Backend validates credentials against MongoDB
3. If valid, generates a JWT token (valid for 7 days)
4. Token and user data returned to frontend
5. Frontend stores token in localStorage

### 2. Protected Routes
1. Frontend sends JWT token in Authorization header
2. Backend middleware verifies token
3. If valid, attaches user to request
4. Route handler processes request with user context

### 3. Token Structure
```javascript
{
  userId: "user_mongodb_id",
  email: "user@example.com",
  role: "Admin|Manager|MR",
  iat: issued_at_timestamp,
  exp: expiration_timestamp
}
```

## API Usage

### Login
```bash
POST /api/users/login
Content-Type: application/json

{
  "email": "suraj6re@gmail.com",
  "password": "Admin@123",
  "role": "Admin"  // optional, validates user role
}
```

### Response
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "...",
      "name": "Admin User",
      "email": "suraj6re@gmail.com",
      "role": "Admin",
      ...
    }
  }
}
```

### Using Token in Requests
```bash
GET /api/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Creating New Users

### Via API (Admin only)
```bash
POST /api/users
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "role": "MR",
  "phone": "+91-9876543210",
  "territory": "Mumbai",
  "employeeId": "EMP001"
}
```

### Via Script
```bash
# Edit server/create-admin.js with desired credentials
node server/create-admin.js
```

## Security Features

1. **Password Hashing** - Bcrypt with salt rounds
2. **Token Expiration** - 7 days validity
3. **Role-Based Access** - Middleware checks user role
4. **Protected Routes** - All API routes require authentication
5. **Secure Storage** - Passwords never stored in plain text

## Frontend Integration

### AuthContext
```javascript
const { user, login, logout, token } = useAuth();

// Login
await login(email, password, role);

// Logout
await logout();

// Check if logged in
if (user) {
  // User is authenticated
}
```

### API Service
```javascript
// Token automatically added to all requests
import { getAllDoctors } from './services/api';

const doctors = await getAllDoctors();
```

## Troubleshooting

### "Invalid credentials" error
- Check email and password are correct
- Ensure user exists in database
- Verify user is active (isActive: true)

### "Token expired" error
- Token is valid for 7 days
- User needs to login again
- Frontend automatically redirects to login

### "User not found" error
- User doesn't exist in MongoDB
- Create user using create-admin.js or API

## Migration from Firebase

All Firebase authentication code has been removed:
- ✅ Removed Firebase SDK dependencies
- ✅ Removed Firebase config files
- ✅ Updated AuthContext to use JWT
- ✅ Updated API interceptors
- ✅ Updated auth middleware
- ✅ Simplified User model

## Environment Variables

Required in `.env`:
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key-here
PORT=5000
FRONTEND_URL=http://localhost:5173
```

## Next Steps

1. **Restart Backend Server** - Changes require server restart
2. **Clear Browser Storage** - Clear localStorage to remove old Firebase tokens
3. **Login with New Credentials** - Use Admin@123 password
4. **Create Additional Users** - Use admin panel or API

## Support

If you encounter issues:
1. Check backend server is running
2. Verify MongoDB connection
3. Check browser console for errors
4. Verify JWT_SECRET is set in .env
