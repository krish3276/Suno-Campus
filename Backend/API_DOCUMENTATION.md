# Authentication API Documentation

## Base URL
```
http://localhost:5000/api/auth
```

---

## 📝 **Available Endpoints**

### **1. Register Student**
**POST** `/api/auth/register`

**Description:** Register a new student and send OTP to college email for verification.

**Content-Type:** `application/json`

**Body:**
```javascript
{
  // Personal Information
  fullName: "Krishna Sirsath",
  email: "krishsirsath21@gnu.ac.in",
  password: "SecurePass123",
  phoneNumber: "9876543210",
  dateOfBirth: "2003-05-15",
  gender: "Male",
  
  // College Details
  collegeName: "Gitam University",
  studentId: "2021BCS001",
  branch: "Computer Science",
  yearOfStudy: 3,
  graduationYear: 2025
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Registration successful! Please check your college email for the OTP to verify your account.",
  "data": {
    "userId": "64a7f8b2c3d4e5f6g7h8i9j0",
    "email": "krishsirsath21@gnu.ac.in",
    "fullName": "Krishna Sirsath",
    "otpSent": true,
    "expiresIn": "10 minutes"
  }
}
```

**Error Responses:**
- `400` - Missing required fields, email already registered, invalid college domain
- `500` - Server error

**Notes:**
- OTP will be sent to the provided college email
- User status: `pending_email_verification`
- User cannot login until OTP is verified

---

### **2. Verify OTP**
**POST** `/api/auth/verify-otp`

**Description:** Verify the OTP sent to college email and activate the account.

**Body:**
```json
{
  "email": "krishsirsath21@gnu.ac.in",
  "otp": "123456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully! You can now login.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "...",
      "fullName": "Krishna Sirsath",
      "email": "krishsirsath21@gnu.ac.in",
      "role": "student",
      "collegeName": "Gitam University",
      "accountStatus": "verified",
      "emailVerified": true
    }
  }
}
```

**Error Responses:**
- `400` - Invalid or expired OTP, email already verified
- `404` - User not found
- `500` - Server error

**Notes:**
- OTP is valid for 10 minutes
- After verification, user is automatically logged in with a token
- User status changes to `verified`

---

### **3. Resend OTP**
**POST** `/api/auth/resend-otp`

**Description:** Resend OTP to the college email if expired or not received.

**Body:**
```json
{
  "email": "krishsirsath21@gnu.ac.in"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "OTP has been resent to your email",
  "data": {
    "email": "krishsirsath21@gnu.ac.in",
    "expiresIn": "10 minutes"
  }
}
```

**Error Responses:**
- `400` - Email already verified
- `404` - User not found
- `500` - Failed to send OTP email

---

### **4. Login**
**POST** `/api/auth/login`

**Body:**
```json
{
  "email": "krishsirsath21@gnu.ac.in",
  "password": "SecurePass123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "...",
      "fullName": "Krishna Sirsath",
      "email": "krishsirsath21@gnu.ac.in",
      "role": "student",
      "collegeName": "Gitam University",
      "accountStatus": "verified"
    }
  }
}
```

**Error Responses:**
- `401` - Invalid email or password
- `403` - Email not verified or account pending approval

---

### **3. Verify Email**
**GET** `/api/auth/verify-email/:token`

**Example:**
```
GET http://localhost:5000/api/auth/verify-email/abc123token456
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully! Your account will be reviewed by our team.",
  "data": {
    "accountStatus": "pending_admin_approval"
  }
}
```

---

### **4. Get Current User**
**GET** `/api/auth/me`

**Headers:**
```
Authorization: Bearer <your_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "fullName": "Krishna Sirsath",
    "email": "krishsirsath21@gnu.ac.in",
    "role": "student",
    "collegeName": "Gitam University",
    "branch": "Computer Science",
    "yearOfStudy": 3,
    "accountStatus": "verified",
    "emailVerified": true
  }
}
```

---

### **5. Forgot Password**
**POST** `/api/auth/forgot-password`

**Body:**
```json
{
  "email": "krishsirsath21@gnu.ac.in"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset email sent",
  "resetToken": "..."
}
```

---

### **6. Reset Password**
**PUT** `/api/auth/reset-password/:token`

**Body:**
```json
{
  "password": "NewSecurePass456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

### **7. Logout**
**POST** `/api/auth/logout`

**Headers:**
```
Authorization: Bearer <your_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 🧪 **Testing with Postman/Thunder Client**

### **Test Registration with OTP:**

1. **Register:**
   - Create POST request to: `http://localhost:5000/api/auth/register`
   - Select Body → raw → JSON
   - Add registration data with college email
   - Send request
   - Save the `userId` and check console/email for OTP

2. **Verify OTP:**
   - Create POST request to: `http://localhost:5000/api/auth/verify-otp`
   - Body:
   ```json
   {
     "email": "krishsirsath21@gnu.ac.in",
     "otp": "123456"
   }
   ```
   - Send request
   - Copy the `token` from response

3. **Resend OTP (if needed):**
   - Create POST request to: `http://localhost:5000/api/auth/resend-otp`
   - Body:
   ```json
   {
     "email": "krishsirsath21@gnu.ac.in"
   }
   ```
   - Check console/email for new OTP

### **Test Login:**

1. Create new POST request to: `http://localhost:5000/api/auth/login`
2. Select Body → raw → JSON
3. Add:
   ```json
   {
     "email": "krishsirsath21@gnu.ac.in",
     "password": "SecurePass123"
   }
   ```
4. Send request
5. Copy the `token` from response

### **Test Protected Routes:**

1. Create new GET request to: `http://localhost:5000/api/auth/me`
2. Go to Headers tab
3. Add: `Authorization: Bearer <paste_your_token_here>`
4. Send request

---

## 🔐 **Account Status Flow**

```
Registration (with college email)
    ↓
pending_email_verification (OTP sent)
    ↓
[User enters OTP]
    ↓
verified (can login and use platform)
```

**Updated Flow:**
1. User registers with college email → OTP sent to email
2. User receives 6-digit OTP (valid for 10 minutes)
3. User verifies OTP → Account activated
4. User can immediately login (token provided after verification)

---

## ✅ **What Works Now:**

- ✅ Student registration with OTP verification
- ✅ Email validation (college domain check)
- ✅ OTP generation and sending (6-digit, 10-minute validity)
- ✅ Email OTP verification
- ✅ Resend OTP functionality
- ✅ Duplicate checking (email, phone, studentId)
- ✅ Password hashing (bcrypt)
- ✅ JWT token generation
- ✅ Login with token
- ✅ Protected routes
- ✅ Password reset flow
- ✅ Account status management

---

## 📝 **Next Steps:**

1. Update Frontend API service to call these endpoints
2. Test registration from React form
3. Add email sending service
4. Create admin dashboard for approvals
5. Add posts and events APIs

---

## 🐛 **Common Errors:**

**400 Bad Request** - Missing required fields or invalid data
**401 Unauthorized** - Invalid credentials or missing token
**403 Forbidden** - Account not verified or insufficient permissions
**404 Not Found** - User/resource not found
**500 Server Error** - Database or server issue

---

Server is running on: **http://localhost:5000** 🚀
