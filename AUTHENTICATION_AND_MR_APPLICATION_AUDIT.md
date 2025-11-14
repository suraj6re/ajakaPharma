# Authentication & MR Application System Audit

## Current Status

### ✅ JWT Authentication - WORKING
**Location**: `server/middleware/authMiddleware.js`

**Implementation**:
- Uses `jsonwebtoken` package
- Verifies Bearer token from Authorization header
- Extracts user from MongoDB using decoded token
- Checks if user is active
- Attaches user to request object

**JWT Secret**: Configured in `.env` as `JWT_SECRET`

**Flow**:
```
Client sends request with header:
Authorization: Bearer <token>
    ↓
Middleware extracts token
    ↓
Verifies with JWT_SECRET
    ↓
Fetches user from MongoDB
    ↓
Attaches user to req.user
    ↓
Proceeds to route handler
```

**Status**: ✅ **WORKING CORRECTLY**

---

### ✅ Brevo Email Service - CONFIGURED
**Location**: `server/services/emailService.js`

**Implementation**:
- Uses Brevo (formerly Sendinblue) API
- Configured with API key from `.env`
- Sends HTML emails via Brevo SMTP

**Email Types**:
1. **Approval Email** - Sends login credentials to approved MRs
2. **Rejection Email** - Notifies rejected applicants
3. **Application Received** - Confirms application submission
4. **Generic Email** - For custom emails

**Configuration**:
```env
BREVO_API_KEY=your_brevo_api_key_here
BREVO_SENDER_EMAIL=suraj6re@gmail.com
BREVO_SENDER_NAME=Ajaka Pharma
```

**Status**: ✅ **CONFIGURED** (API key needs to be updated from placeholder)

---

### ❌ MR Application System - NOT USING MONGODB
**Location**: 
- Frontend: `src/pages/RequestMRAccess.jsx`
- Admin: `src/pages/AdminMRRequests.jsx`

**Current Implementation**:
```javascript
// PROBLEM: Using localStorage instead of MongoDB
localStorage.setItem('mr_requests', JSON.stringify(requests));
```

**Issues**:
1. ❌ Applications stored in browser localStorage
2. ❌ Not saved to MongoDB
3. ❌ Data lost when browser cache cleared
4. ❌ Not accessible across different browsers/devices
5. ❌ No backend API integration
6. ❌ No database persistence

**What Should Happen**:
1. User submits MR application form
2. Frontend sends POST request to backend API
3. Backend saves to MongoDB `mrrequests` collection
4. Backend sends confirmation email via Brevo
5. Admin views applications from MongoDB
6. Admin approves/rejects → Updates MongoDB
7. Backend sends approval/rejection email via Brevo

---

## What Needs to be Fixed

### 1. Create MR Request Model
**File**: `server/models/MRRequest.js`

Need to create a Mongoose model:
```javascript
{
  name: String,
  email: String,
  phone: String,
  area: String,
  experience: String,
  status: 'pending' | 'approved' | 'rejected',
  createdAt: Date,
  processedAt: Date,
  processedBy: ObjectId (User),
  tempPassword: String (for approved)
}
```

### 2. Create MR Request Routes
**File**: `server/routes/mrRequestRoutes.js`

Need routes:
- `POST /api/mr-requests` - Submit application
- `GET /api/mr-requests` - Get all requests (Admin)
- `PUT /api/mr-requests/:id/approve` - Approve request (Admin)
- `PUT /api/mr-requests/:id/reject` - Reject request (Admin)
- `DELETE /api/mr-requests/:id` - Delete request (Admin)

### 3. Create MR Request Controller
**File**: `server/controllers/mrRequestController.js`

Need functions:
- `submitRequest()` - Save to MongoDB + Send confirmation email
- `getAllRequests()` - Fetch from MongoDB
- `approveRequest()` - Update status + Create user + Send approval email
- `rejectRequest()` - Update status + Send rejection email
- `deleteRequest()` - Remove from MongoDB

### 4. Update Frontend
**Files**: 
- `src/pages/RequestMRAccess.jsx`
- `src/pages/AdminMRRequests.jsx`

Need to:
- Replace localStorage with API calls
- Use axios to communicate with backend
- Handle loading/error states
- Show real-time data from MongoDB

---

## Current Data Flow (BROKEN)

```
User fills form
    ↓
Frontend saves to localStorage ❌
    ↓
Admin views from localStorage ❌
    ↓
Admin approves/rejects in localStorage ❌
    ↓
No email sent ❌
    ↓
No MongoDB persistence ❌
```

---

## Required Data Flow (CORRECT)

```
User fills form
    ↓
POST /api/mr-requests
    ↓
Save to MongoDB ✅
    ↓
Send confirmation email via Brevo ✅
    ↓
Admin views: GET /api/mr-requests
    ↓
Fetch from MongoDB ✅
    ↓
Admin approves: PUT /api/mr-requests/:id/approve
    ↓
Update MongoDB status ✅
Create User account ✅
Send approval email with credentials ✅
    ↓
MR can login with credentials ✅
```

---

## Summary

### What's Working ✅
1. JWT Authentication
2. User login/logout
3. Protected routes
4. Brevo email service (configured)
5. MongoDB connection
6. User management

### What's Broken ❌
1. MR applications not saved to MongoDB
2. Using localStorage instead of database
3. No backend API for MR requests
4. No MRRequest model
5. Emails not being sent on application

### What Needs to be Done 🔧
1. Create MRRequest model
2. Create MR request routes
3. Create MR request controller
4. Update frontend to use API
5. Integrate Brevo emails
6. Test end-to-end flow

---

## Files to Create/Modify

### Create New Files:
1. `server/models/MRRequest.js` - Mongoose model
2. `server/routes/mrRequestRoutes.js` - API routes
3. `server/controllers/mrRequestController.js` - Business logic

### Modify Existing Files:
1. `server/models/index.js` - Export MRRequest model
2. `server/index.js` - Add MR request routes
3. `src/pages/RequestMRAccess.jsx` - Use API instead of localStorage
4. `src/pages/AdminMRRequests.jsx` - Use API instead of localStorage
5. `src/services/api.js` - Add MR request API functions

---

## Priority

**HIGH PRIORITY** - This is a critical feature that's currently not working. MR applications should be:
- Saved to database
- Accessible by admins
- Persistent across sessions
- Integrated with email notifications

Without this fix, the MR application system is essentially non-functional.
