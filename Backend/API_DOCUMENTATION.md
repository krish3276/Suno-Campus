# Authentication API Documentation

## Base URL
```
http://localhost:5000/api/auth
```

---

## 📝 **Available Endpoints**

### **1. Register Student**
**POST** `/api/auth/register`

**Content-Type:** `multipart/form-data`

**Body (Form Data):**
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
  graduationYear: 2025,
  
  // Files
  studentIdCard: <file>,  // Image file
  collegeIdCard: <file>   // Image file (optional)
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Registration successful! Please check your email to verify your account.",
  "data": {
    "user": {
      "id": "...",
      "fullName": "Krishna Sirsath",
      "email": "krishsirsath21@gnu.ac.in",
      "role": "student",
      "accountStatus": "pending_email_verification"
    },
    "verificationToken": "..."
  }
}
```

---

### **2. Login**
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

### **Test Registration:**

1. Create new POST request to: `http://localhost:5000/api/auth/register`
2. Select Body → form-data
3. Add all text fields (fullName, email, password, etc.)
4. Add file fields:
   - Key: `studentIdCard`, Type: File, Value: Select an image
   - Key: `collegeIdCard`, Type: File, Value: Select an image
5. Send request

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
Registration
    ↓
pending_email_verification (can't login)
    ↓
[Click email verification link]
    ↓
pending_admin_approval (limited access)
    ↓
[Admin approves]
    ↓
verified (full access)
```

---

## ✅ **What Works Now:**

- ✅ Student registration with file upload
- ✅ Email validation (college domain check)
- ✅ Duplicate checking (email, phone, studentId)
- ✅ Password hashing (bcrypt)
- ✅ JWT token generation
- ✅ Login with token
- ✅ Protected routes
- ✅ Email verification (manual token for now)
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
