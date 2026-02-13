/**
 * Seed Admin User Script
 * Run: node seed-admin.js
 * 
 * Creates the ONE developer admin for the entire platform.
 * There is no college-wise admin — only a single platform admin exists.
 * You can customize the admin credentials below.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const connectDB = require("./config/db");

const ADMIN_DATA = {
  fullName: "Admin",
  email: "admin@gnu.ac.in",         // Change to your email
  password: "Admin@123",             // Change this!
  phoneNumber: "9999999999",
  studentId: "ADMIN001",
  collegeName: "Platform Admin",
  branch: "Administration",
  yearOfStudy: 4,
  dateOfBirth: new Date("2000-01-01"),
  gender: "Male",
  role: "admin",
  accountStatus: "verified",
  emailVerified: true,
  isActive: true,
};

async function seedAdmin() {
  try {
    await connectDB();
    console.log("\n🔧 Admin Seeder\n");

    // Check if an admin already exists
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("✅ Admin already exists:");
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name:  ${existingAdmin.fullName}`);
      console.log("\n   Use these credentials to log in.");
      process.exit(0);
    }

    // Check if email is taken by a non-admin
    const emailTaken = await User.findOne({ email: ADMIN_DATA.email });
    if (emailTaken) {
      console.log(`⚠️  Email ${ADMIN_DATA.email} is already used by a ${emailTaken.role} account.`);
      console.log("   Upgrading that user to admin...");
      emailTaken.role = "admin";
      emailTaken.accountStatus = "verified";
      emailTaken.emailVerified = true;
      await emailTaken.save();
      console.log(`✅ User "${emailTaken.fullName}" is now an admin!`);
      process.exit(0);
    }

    // Create new admin
    const admin = await User.create(ADMIN_DATA);
    console.log("✅ Admin user created successfully!\n");
    console.log("   ┌──────────────────────────────────┐");
    console.log(`   │  Email:    ${ADMIN_DATA.email}`);
    console.log(`   │  Password: ${ADMIN_DATA.password}`);
    console.log("   └──────────────────────────────────┘");
    console.log("\n   Use these credentials to log in at /login\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

seedAdmin();
