# Suno-Campus 🎓

A comprehensive campus social networking platform built with **React** and **Node.js** that connects students, enables event management, and fosters campus community engagement.

## ✨ Features

### 🔐 Authentication System (✅ Fully Integrated)
- **Multi-step Student Registration** (3-step process)
- **College Email Verification** (only verified college domains allowed)
- **Auto-verification** on registration with valid college email
- **JWT-based Authentication** with secure password hashing

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

## 🧪 Testing the Application

### 1. Register a Student

Navigate to `http://localhost:5173/register` and:
- **Step 1**: Enter personal details (name, email, password, phone, DOB, gender)
- **Step 2**: Enter college details (college name, student ID, branch, year)
- **Step 3**: Accept terms and conditions
- Use a verified college email domain (e.g., `test@gnu.ac.in`)

### 2. Login

After registration, you can immediately login!
- Visit `http://localhost:5173/login` 
- Use your email and password
- Account is auto-verified for immediate access

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
- **CORS** for cross-origin requests

## 📁 Project Structure

```
Suno-Campus/
├── Backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Request handlers
│   ├── middlewares/     # Auth middleware
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
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
Registration → verified ✅ (auto-verified, can login immediately)
```

## 🎯 Current Status

### ✅ Completed
- [x] Complete UI/UX design
- [x] MongoDB database setup
- [x] User authentication APIs
- [x] Frontend-Backend integration
- [x] Multi-step registration
- [x] JWT token management
- [x] Role-based access control
- [x] Auto-verification system

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
