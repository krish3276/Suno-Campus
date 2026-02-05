// Quick script to verify a test user
// Usage: node verify-test-user.js <email>
// Example: node verify-test-user.js teststudent@gnu.ac.in

const mongoose = require('mongoose');
require('dotenv').config();

const userEmail = process.argv[2];

if (!userEmail) {
  console.log('❌ Please provide an email address');
  console.log('Usage: node verify-test-user.js <email>');
  console.log('Example: node verify-test-user.js teststudent@gnu.ac.in');
  process.exit(1);
}

async function verifyUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Import User model
    const User = require('./models/User');

    // Find user
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      console.log(`❌ No user found with email: ${userEmail}`);
      process.exit(1);
    }

    console.log(`\n📝 Current user status:`);
    console.log(`   Name: ${user.fullName}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Account Status: ${user.accountStatus}`);
    console.log(`   Email Verified: ${user.emailVerified}`);

    // Update user to verified status
    const result = await User.updateOne(
      { email: userEmail },
      {
        accountStatus: 'verified',
        emailVerified: true,
        emailVerificationToken: null,
        emailVerifiedAt: new Date()
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`\n✅ User verified successfully!`);
      console.log(`   Email: ${userEmail}`);
      console.log(`   Status: verified`);
      console.log(`   Can now login to the application`);
    } else {
      console.log(`\n⚠️  No changes made (user may already be verified)`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyUser();
