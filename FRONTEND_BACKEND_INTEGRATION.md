# Frontend-Backend Integration Guide

## ✅ What's Been Connected

Your Suno-Campus application now has a fully integrated authentication system connecting React frontend with Node.js backend!

### 🔗 Integrated Features

1. **Student Registration Flow**
   - Multi-step registration form (Personal → College → Documents)
   - File upload support for Student ID cards and College ID cards
   - College email domain validation (@gnu.ac.in, @mitindia.edu, etc.)
   - Real-time field validation
   - FormData submission to backend API

2. **Student Login System**
   - Email/password authentication
   - JWT token storage in localStorage
   - Account status checking (pending email, pending admin, verified, rejected, suspended)
   - Automatic redirect based on account status
   - Error handling with user-friendly messages

3. **API Service Layer** (`src/services/api.js`)
   - Centralized API configuration
   - Automatic token management
   - FormData support for file uploads
   - Error handling and response parsing
   - Available endpoints:
     - `authAPI.register(formData)` - Register new student
     - `authAPI.login(credentials)` - Login
     - `authAPI.verifyEmail(token)` - Verify email
     - `authAPI.getCurrentUser()` - Get logged-in user
     - `authAPI.logout()` - Logout
     - `authAPI.forgotPassword(email)` - Request password reset
     - `authAPI.resetPassword(token, password)` - Reset password

---

## 🚀 How to Test the Integration

### Step 1: Start Backend Server

```powershell
cd Backend
npm start
```

You should see:
```
Server running on port 5000
Environment: development
MongoDB Connected: ac-cjd2rva-shard-00-00.sbyamkk.mongodb.net
Database Name: sunocampus
```

### Step 2: Start Frontend Server

```powershell
cd Frontend\sunocampus
npm run dev
```

You should see:
```
VITE v7.2.4  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Step 3: Test Registration

1. Navigate to `http://localhost:5173/register`
2. Fill in Step 1 - Personal Details:
   - Full Name: Test Student
   - Email: **teststudent@gnu.ac.in** (must be college email)
   - Phone: 9876543210
   - Password: Test@1234
   - Confirm Password: Test@1234
   - Date of Birth: 2000-01-01
   - Gender: Male/Female
3. Click "Continue"
4. Fill in Step 2 - College Details:
   - College Name: Gitam University
   - Student ID: 12345678
   - Branch/Department: Computer Science
   - Year of Study: 3
   - Expected Graduation: 2026
5. Click "Continue"
6. Upload documents (Step 3):
   - Upload Student ID Card (image file, max 5MB)
   - Upload College ID Card (optional)
   - Check "I agree to terms and conditions"
7. Click "Complete Registration"

**Expected Result:**
- Success alert: "Registration successful! Please check your college email..."
- Redirect to login page
- Check MongoDB database - new user with `accountStatus: 'pending_email_verification'`

### Step 4: Test Login (Before Email Verification)

1. Try logging in with the email/password you just registered
2. **Expected Result:** Error message saying "Please verify your email first..."

### Step 5: Verify Email (Manual Step)

Since we haven't implemented email sending yet, you can manually verify the user:

```powershell
# Connect to MongoDB and update user status
# Or use MongoDB Compass/Atlas UI to change accountStatus to 'pending_admin_approval'
```

Or use this script:
```javascript
// In MongoDB shell or Compass
db.users.updateOne(
  { email: "teststudent@gnu.ac.in" },
  { $set: { 
      accountStatus: "verified",
      emailVerified: true,
      emailVerificationToken: null 
  }}
)
```

### Step 6: Test Login (After Verification)

1. Login again with same credentials
2. **Expected Result:** 
   - Success alert: "Welcome back, Test Student!"
   - Redirect to `/feed` page
   - JWT token stored in localStorage
   - User data stored in localStorage

---

## 📊 Database Records

After registration, check MongoDB to see:

```javascript
{
  "_id": ObjectId("..."),
  "fullName": "Test Student",
  "email": "teststudent@gnu.ac.in",
  "phone": "9876543210",
  "password": "$2a$10$..." // bcrypt hashed
  "dateOfBirth": ISODate("2000-01-01T00:00:00.000Z"),
  "gender": "Male",
  "role": "student",
  "collegeName": "Gitam University",
  "studentId": "12345678",
  "department": "Computer Science",
  "yearOfStudy": 3,
  "enrollmentYear": 2026,
  "studentIdCardUrl": "uploads/studentIdCard-1738886400000-123456789.jpg",
  "collegeIdCardUrl": "uploads/collegeIdCard-1738886400000-987654321.jpg",
  "accountStatus": "pending_email_verification",
  "emailVerified": false,
  "emailVerificationToken": "abc123...",
  "createdAt": ISODate("2026-02-06T..."),
  "updatedAt": ISODate("2026-02-06T...")
}
```

---

## 🔐 Authentication Flow

```
┌─────────────┐
│   Register  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│ accountStatus:              │
│ 'pending_email_verification'│
└──────┬──────────────────────┘
       │
       │ (Click email link)
       ▼
┌─────────────────────────────┐
│ accountStatus:              │
│ 'pending_admin_approval'    │
└──────┬──────────────────────┘
       │
       │ (Admin approves)
       ▼
┌─────────────────────────────┐
│ accountStatus: 'verified'   │
│ ✅ Can login and use app    │
└─────────────────────────────┘
```

---

## 🛠️ Technical Details

### Frontend Changes Made

1. **src/services/api.js**
   - Added `authAPI` object with all authentication methods
   - FormData support for file uploads
   - Automatic Content-Type handling (JSON vs FormData)
   - Token management in localStorage

2. **src/pages/Register.jsx**
   - Added `authAPI` import
   - Added `loading` and `apiError` states
   - Updated `handleSubmit` to call `authAPI.register()` with FormData
   - Field name mapping (frontend → backend):
     - `phoneNumber` → `phone`
     - `branch` → `department`
     - `graduationYear` → `enrollmentYear`
   - Added error display for API errors
   - Disabled submit button during loading

3. **src/pages/Login.jsx**
   - Added `authAPI` import
   - Replaced mock login with real `authAPI.login()` call
   - Added account status checking with specific error messages
   - Removed duplicate/old code
   - Token and user data stored in localStorage on success

4. **Frontend/.env & .env.example**
   - Added `VITE_API_URL=http://localhost:5000/api`
   - Used in api.js as base URL

### Backend (Already Configured)

- **Routes:** `/api/auth/register`, `/api/auth/login`, `/api/auth/verify-email/:token`, etc.
- **Middleware:** JWT verification, file upload (multer), role authorization
- **File Storage:** `Backend/uploads/` directory for uploaded ID cards
- **MongoDB:** User documents with full schema including verification fields

---

## 🧪 API Testing with Postman/Thunder Client

### Test Registration Endpoint

```http
POST http://localhost:5000/api/auth/register
Content-Type: multipart/form-data

Body (form-data):
- fullName: Test Student
- email: teststudent@gnu.ac.in
- phone: 9876543210
- password: Test@1234
- dateOfBirth: 2000-01-01
- gender: Male
- collegeName: Gitam University
- studentId: 12345678
- department: Computer Science
- yearOfStudy: 3
- enrollmentYear: 2026
- studentIdCard: [upload file]
- collegeIdCard: [upload file]
```

### Test Login Endpoint

```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "teststudent@gnu.ac.in",
  "password": "Test@1234"
}
```

---

## ⚠️ Known Limitations & Next Steps

### Current Limitations

1. **Email Sending Not Implemented**
   - Email verification tokens are generated but not sent
   - Need to integrate nodemailer or similar service
   - Manual DB update required for testing

2. **Admin Dashboard Not Built**
   - No UI to approve/reject pending students
   - Admin needs to update MongoDB directly

3. **Password Reset Flow Incomplete**
   - Backend endpoints exist but frontend pages not created
   - Need to build forgot-password and reset-password pages

### Next Steps to Complete

1. **Implement Email Service**
   ```bash
   cd Backend
   npm install nodemailer
   ```
   - Configure SMTP settings in .env
   - Update authController to send emails

2. **Build Admin Dashboard**
   - Create `/admin` page to view pending students
   - Add approve/reject buttons
   - Call backend API to update user status

3. **Add Forgot Password Pages**
   - Create `ForgotPassword.jsx` component
   - Create `ResetPassword.jsx` component
   - Connect to backend endpoints

4. **Build Post & Event Features**
   - Connect Feed.jsx to posts API
   - Connect Events.jsx to events API
   - Implement create/like/comment functionality

5. **Add Profile Editing**
   - Allow users to update their profile
   - Change password functionality
   - Update profile picture

---

## 📝 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://sunocampus:Sunocampus2026@cluster0.sbyamkk.mongodb.net/sunocampus
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## ✅ Success Checklist

- [x] Backend authentication endpoints created
- [x] Frontend registration form connected to API
- [x] Frontend login form connected to API
- [x] File upload working (multer)
- [x] JWT token generation and storage
- [x] Password hashing (bcrypt)
- [x] Account status workflow implemented
- [x] Error handling on frontend and backend
- [x] MongoDB database connected
- [ ] Email verification emails sent (manual step)
- [ ] Admin approval UI
- [ ] Post/Event APIs integrated
- [ ] Profile editing

---

## 🎉 You're All Set!

Your authentication system is now fully integrated! Students can:
1. Register with college email and ID card upload
2. Receive verification tokens (stored in DB)
3. Login after verification
4. Get proper error messages for each account status

The foundation is solid - now you can build on top with posts, events, and more features!

## 🆘 Troubleshooting

### CORS Errors
- Check backend has CORS enabled: `app.use(cors())`
- Verify frontend URL in VITE_API_URL

### 404 Not Found
- Ensure backend is running on port 5000
- Check route paths match: `/api/auth/...`

### File Upload Fails
- Check file size < 5MB
- Verify multer middleware is applied
- Ensure `uploads/` directory exists

### MongoDB Connection Failed
- Verify MONGODB_URI in backend .env
- Check MongoDB Atlas allows your IP
- Test credentials: sunocampus / Sunocampus2026
