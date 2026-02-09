// Quick Email Test Script
// Run this to test if your email configuration is working
// Usage: node test-email.js

require("dotenv").config();
const { sendOTPEmail } = require("./services/emailService");

async function testEmail() {
  console.log("🧪 Testing Email Configuration...\n");
  
  console.log("Configuration:");
  console.log(`  EMAIL_USER: ${process.env.EMAIL_USER}`);
  console.log(`  EMAIL_HOST: ${process.env.EMAIL_HOST}`);
  console.log(`  EMAIL_PORT: ${process.env.EMAIL_PORT}`);
  console.log(`  PASSWORD SET: ${process.env.EMAIL_PASSWORD ? "✅ Yes" : "❌ No"}\n`);

  // Test email
  const testOTP = "123456";
  const testEmail = process.env.EMAIL_USER; // Send to yourself for testing
  const testName = "Test User";

  console.log(`Sending test OTP to: ${testEmail}\n`);

  try {
    const result = await sendOTPEmail(testEmail, testOTP, testName);
    
    if (result.success) {
      console.log("\n✅ SUCCESS! Email sent successfully!");
      if (result.mode === "development") {
        console.log("📝 Running in development mode - Check console above for OTP");
      } else {
        console.log(`📧 Check your inbox: ${testEmail}`);
        console.log(`   Message ID: ${result.messageId}`);
      }
    } else {
      console.log("\n❌ Email sending failed (but no error thrown)");
    }
  } catch (error) {
    console.log("\n❌ EMAIL SENDING FAILED\n");
    console.error("Error:", error.message);
    
    if (error.message.includes("Invalid login")) {
      console.log("\n🔧 SOLUTION:");
      console.log("   Gmail requires an 'App Password' if 2FA is enabled.");
      console.log("   Steps to fix:");
      console.log("   1. Go to: https://myaccount.google.com/apppasswords");
      console.log("   2. Sign in to your Google Account");
      console.log("   3. Select 'Mail' and 'Other (Custom name)'");
      console.log("   4. Generate an App Password");
      console.log("   5. Update EMAIL_PASSWORD in .env with the 16-character app password\n");
    }
  }
}

testEmail();
