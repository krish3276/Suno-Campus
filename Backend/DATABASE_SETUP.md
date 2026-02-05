# MongoDB Setup Guide for SunoCampus

## Why MongoDB?
✅ Already in your dependencies (Mongoose v9.1.4)
✅ Perfect for your data structure (students, posts, events)
✅ Flexible schema for evolving requirements
✅ Great performance for social features
✅ Easy to scale

---

## 🚀 Quick Setup (Choose One Option)

### Option 1: Local MongoDB (Development)

#### Install MongoDB:

**Windows:**
1. Download MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Run installer (choose "Complete" installation)
3. Install as Windows Service
4. MongoDB Compass (GUI) will be installed automatically

**Verify Installation:**
```bash
mongod --version
```

**Start MongoDB:**
- It should auto-start as Windows Service
- Or manually: `net start MongoDB`

#### Create Database:
MongoDB will create the database automatically when you first connect.

---

### Option 2: MongoDB Atlas (Cloud - FREE)

**Best for production and team collaboration**

1. **Sign up:** https://www.mongodb.com/cloud/atlas/register
2. **Create Free Cluster:**
   - Choose AWS/Google Cloud/Azure
   - Select nearest region
   - M0 Sandbox (FREE forever)
3. **Database Access:**
   - Create database user (username + password)
   - Save these credentials
4. **Network Access:**
   - Click "Add IP Address"
   - Choose "Allow Access from Anywhere" (0.0.0.0/0) for development
5. **Get Connection String:**
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password

---

## 📝 Configuration Steps

### 1. Create `.env` file in Backend folder:

```bash
cd Backend
```

Create `.env` file (copy from `.env.example`):

**For Local MongoDB:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/sunocampus
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

**For MongoDB Atlas:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/sunocampus?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

### 2. Start Backend Server:

```bash
cd Backend
npm start
```

**You should see:**
```
Server running on port 5000
Environment: development
MongoDB Connected: localhost (or Atlas cluster)
Database Name: sunocampus
```

---

## 📊 Database Structure Created

### Collections:

#### 1. **users** - All user types (students, contributors, admins)
```javascript
{
  fullName: "Krishna Sirsath",
  email: "krishsirsath21@gnu.ac.in",
  password: "hashed_password",
  role: "student",
  collegeName: "Gitam University",
  studentId: "2021BCS001",
  accountStatus: "verified",
  // ... more fields
}
```

#### 2. **posts** - Social feed posts
```javascript
{
  content: "Great workshop today!",
  author: ObjectId(userId),
  visibility: "campus",
  likes: [userId1, userId2],
  comments: [...],
  // ... more fields
}
```

#### 3. **events** - Campus events
```javascript
{
  title: "Tech Fest 2026",
  organizer: ObjectId(userId),
  startDate: "2026-03-15",
  participants: [...],
  // ... more fields
}
```

---

## 🔍 Verify Connection

### Using MongoDB Compass (GUI):
1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017` (local) or paste Atlas URI
3. You should see `sunocampus` database

### Using Code:
Visit: http://localhost:5000/api/health

Should return:
```json
{
  "success": true,
  "status": "healthy",
  "database": "connected"
}
```

---

## 📋 What's Created

✅ **Database Config:** [config/db.js](Backend/config/db.js)
✅ **User Model:** [models/User.js](Backend/models/User.js) - Students, Contributors, Admins
✅ **Post Model:** [models/Post.js](Backend/models/Post.js) - Social posts
✅ **Event Model:** [models/Event.js](Backend/models/Event.js) - Campus events
✅ **Updated Server:** [index.js](Backend/index.js) - MongoDB connection
✅ **Environment Example:** [.env.example](Backend/.env.example)

---

## 🎯 User Model Features

### Student Fields:
- Personal: name, email, phone, DOB, gender
- College: name, studentId, branch, year, graduation year
- Verification: email verified, documents, status
- Role: student (can view, can't create posts/events)

### Account Statuses:
- `pending_email_verification` - Just registered
- `pending_admin_approval` - Email verified, waiting for admin
- `verified` - Fully approved
- `rejected` - Not approved with reason
- `suspended` - Temporarily blocked

### Built-in Methods:
```javascript
user.comparePassword(password) // Check password
user.generateAuthToken() // Create JWT
user.toPublicJSON() // Safe user data for frontend
```

---

## 🔐 Security Features

✅ Password hashing (bcrypt)
✅ JWT token generation
✅ Email/phone uniqueness
✅ Student ID uniqueness
✅ Duplicate ID card prevention (hash)
✅ Input validation
✅ Secure password storage (never returned in queries)

---

## 📈 Next Steps

1. ✅ Setup MongoDB (local or Atlas)
2. ✅ Create `.env` file
3. ✅ Start backend server
4. 📝 Create authentication routes (register, login)
5. 📝 Create post/event CRUD routes
6. 📝 Add file upload for images
7. 📝 Connect frontend to backend

---

## 🆘 Troubleshooting

**"Cannot connect to MongoDB":**
- Check if MongoDB service is running
- Verify MONGODB_URI in `.env`
- Check network access (Atlas)
- Verify credentials

**"Port 5000 already in use":**
- Change PORT in `.env` to 5001
- Or stop other service using port 5000

**"Module not found":**
```bash
npm install
```

---

## 💡 Recommended: Use MongoDB Atlas

**Why?**
- ✅ No local installation needed
- ✅ Free tier (512MB storage)
- ✅ Automatic backups
- ✅ Built-in monitoring
- ✅ Easy team collaboration
- ✅ Production-ready

---

Ready to start! Just create your `.env` file and run `npm start` in the Backend folder.
