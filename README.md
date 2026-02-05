# Suno-Campus 🎓

A comprehensive campus social networking platform built with **React** and **Node.js** that connects students, enables event management, and fosters campus community engagement.

## ✨ Features

### 🔐 Authentication System (✅ Fully Integrated)
- **Multi-step Student Registration** with document verification
- **College Email Verification** (only verified college domains allowed)
- **Student ID Card Upload** for identity verification
- **JWT-based Authentication** with secure password hashing
- **Multi-layer Verification Process**:
  1. Email verification
  2. Admin approval
  3. Document validation

### 👥 User Roles
- **Students**: View posts/events, participate in discussions
- **Contributors**: Create posts and events, manage content
- **Admins**: Approve students, moderate content, manage platform

### 📱 Core Features
- **Social Feed**: Campus-wide and global posts with likes and comments
- **Event Management**: Create, discover, and register for campus events
- **Profile Management**: Customizable student profiles
- **Real-time Notifications**: Stay updated with campus activities

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ and npm
- MongoDB Atlas account (or local MongoDB)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/krish3276/Suno-Campus.git
   cd Suno-Campus
   ```

2. **Quick Start (Windows)**
   ```powershell
   # Run this script to start both servers
   .\start.ps1
   ```

3. **Manual Setup**

   **Backend:**
   ```bash
   cd Backend
   npm install
   npm start
   ```

   **Frontend:**
   ```bash
   cd Frontend/sunocampus
   npm install
   npm run dev
   ```

### Environment Setup

**Backend** (`Backend/.env`):
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
```

**Frontend** (`Frontend/sunocampus/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

## 📖 Documentation

- **[Frontend-Backend Integration Guide](FRONTEND_BACKEND_INTEGRATION.md)** - Complete testing and integration guide
- **[API Documentation](Backend/API_DOCUMENTATION.md)** - All API endpoints with examples
- **[Database Setup](Backend/DATABASE_SETUP.md)** - MongoDB configuration guide
- **[Student Verification Strategy](Backend/STUDENT_VERIFICATION_GUIDE.md)** - Verification workflow

## 🧪 Testing the Application

### 1. Register a Test Student

Navigate to `http://localhost:5173/register` and fill in:
- **Email**: Use a college email domain (e.g., `test@gnu.ac.in`)
- **Upload**: Student ID card and College ID card
- Complete all 3 steps

### 2. Verify Test User

Since email sending isn't implemented yet, manually verify users:

```bash
cd Backend
node verify-test-user.js teststudent@gnu.ac.in
```

### 3. Login

Visit `http://localhost:5173/login` and use your credentials!

## 🏗️ Tech Stack

### Frontend
- **React 19.2.0** - UI framework
- **Vite 7.2.4** - Build tool
- **React Router DOM 7.12.0** - Routing
- **Tailwind CSS 3.4.19** - Styling

### Backend
- **Node.js** with **Express 5.2.1**
- **MongoDB** with **Mongoose 9.1.4**
- **JWT** for authentication
- **bcryptjs** for password hashing
- **multer** for file uploads

## 📁 Project Structure

```
Suno-Campus/
├── Backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Request handlers
│   ├── middlewares/     # Auth, upload, etc.
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── uploads/         # Uploaded files
│   └── index.js         # Entry point
├── Frontend/
│   └── sunocampus/
│       ├── src/
│       │   ├── components/  # React components
│       │   ├── pages/       # Page components
│       │   ├── services/    # API service layer
│       │   └── App.jsx      # Main app
│       └── package.json
└── README.md
```

## 🔄 Account Status Flow

```
Registration
    ↓
pending_email_verification
    ↓ (email verified)
pending_admin_approval
    ↓ (admin approves)
verified ✅ (can login)
```

## 🎯 Current Status

### ✅ Completed
- [x] Complete UI/UX design
- [x] MongoDB database setup
- [x] User authentication APIs
- [x] Frontend-Backend integration
- [x] File upload system
- [x] Multi-step registration
- [x] JWT token management
- [x] Role-based access control

### 🚧 In Progress
- [ ] Email service integration
- [ ] Admin dashboard
- [ ] Post CRUD operations
- [ ] Event management
- [ ] Comment system

### 📅 Planned Features
- [ ] Real-time chat
- [ ] Push notifications
- [ ] Mobile responsive design improvements
- [ ] Advanced search and filters
- [ ] Analytics dashboard

## 🛠️ Helper Scripts

- **`start.ps1`** - Start both frontend and backend servers
- **`test-user-helper.ps1`** - Interactive test user creation guide
- **`Backend/verify-test-user.js`** - Quickly verify test users

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Contact

**Project Link**: [https://github.com/krish3276/Suno-Campus](https://github.com/krish3276/Suno-Campus)

## 📄 License

This project is currently unlicensed. All rights reserved.

---

**Made with ❤️ for college communities**
