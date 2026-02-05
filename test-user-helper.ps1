# Test User Creation & Verification Helper
# This script helps you create a test user and verify it manually

Write-Host "🧪 Suno-Campus Test User Helper" -ForegroundColor Cyan
Write-Host ""

$choice = Read-Host "What would you like to do?
1. Create test user via API
2. Get MongoDB update command to verify user
3. Both
Enter choice (1/2/3)"

if ($choice -eq "1" -or $choice -eq "3") {
    Write-Host ""
    Write-Host "📝 Test User Details:" -ForegroundColor Yellow
    Write-Host "   Email: teststudent@gnu.ac.in"
    Write-Host "   Password: Test@1234"
    Write-Host "   Name: Test Student"
    Write-Host "   College: Gitam University"
    Write-Host ""
    
    $confirm = Read-Host "Create this user via API? (y/n)"
    
    if ($confirm -eq "y") {
        Write-Host ""
        Write-Host "⚠️  Note: You'll need to manually upload student ID card images" -ForegroundColor Yellow
        Write-Host "For testing, you can use any image file (JPG/PNG)" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Use Postman, Thunder Client, or curl to make this request:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "POST http://localhost:5000/api/auth/register" -ForegroundColor White
        Write-Host "Content-Type: multipart/form-data" -ForegroundColor White
        Write-Host ""
        Write-Host "Body (form-data):" -ForegroundColor White
        Write-Host "  fullName: Test Student"
        Write-Host "  email: teststudent@gnu.ac.in"
        Write-Host "  phone: 9876543210"
        Write-Host "  password: Test@1234"
        Write-Host "  dateOfBirth: 2000-01-01"
        Write-Host "  gender: Male"
        Write-Host "  collegeName: Gitam University"
        Write-Host "  studentId: 12345678"
        Write-Host "  department: Computer Science"
        Write-Host "  yearOfStudy: 3"
        Write-Host "  enrollmentYear: 2026"
        Write-Host "  studentIdCard: [upload any image file]"
        Write-Host "  collegeIdCard: [upload any image file]"
        Write-Host ""
    }
}

if ($choice -eq "2" -or $choice -eq "3") {
    Write-Host ""
    Write-Host "📊 MongoDB Update Command:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To manually verify a user after registration, use MongoDB Compass or Atlas UI:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Option 1: MongoDB Compass/Atlas (GUI)" -ForegroundColor Green
    Write-Host "1. Connect to: mongodb+srv://sunocampus:Sunocampus2026@cluster0.sbyamkk.mongodb.net/sunocampus"
    Write-Host "2. Navigate to: sunocampus → users collection"
    Write-Host "3. Find user with email: teststudent@gnu.ac.in"
    Write-Host "4. Edit the document and update these fields:"
    Write-Host "   - accountStatus: 'verified'"
    Write-Host "   - emailVerified: true"
    Write-Host "   - emailVerificationToken: null"
    Write-Host ""
    Write-Host "Option 2: MongoDB Shell" -ForegroundColor Green
    Write-Host ""
    Write-Host "db.users.updateOne(" -ForegroundColor White
    Write-Host "  { email: 'teststudent@gnu.ac.in' }," -ForegroundColor White
    Write-Host "  {" -ForegroundColor White
    Write-Host "    `$set: {" -ForegroundColor White
    Write-Host "      accountStatus: 'verified'," -ForegroundColor White
    Write-Host "      emailVerified: true," -ForegroundColor White
    Write-Host "      emailVerificationToken: null" -ForegroundColor White
    Write-Host "    }" -ForegroundColor White
    Write-Host "  }" -ForegroundColor White
    Write-Host ")" -ForegroundColor White
    Write-Host ""
    Write-Host "Option 3: Node.js Script" -ForegroundColor Green
    Write-Host ""
    Write-Host "// Save as verify-user.js in Backend folder" -ForegroundColor Gray
    Write-Host "const mongoose = require('mongoose');" -ForegroundColor White
    Write-Host "require('dotenv').config();" -ForegroundColor White
    Write-Host ""
    Write-Host "async function verifyUser() {" -ForegroundColor White
    Write-Host "  await mongoose.connect(process.env.MONGODB_URI);" -ForegroundColor White
    Write-Host "  const User = require('./models/User');" -ForegroundColor White
    Write-Host "  " -ForegroundColor White
    Write-Host "  const result = await User.updateOne(" -ForegroundColor White
    Write-Host "    { email: 'teststudent@gnu.ac.in' }," -ForegroundColor White
    Write-Host "    {" -ForegroundColor White
    Write-Host "      accountStatus: 'verified'," -ForegroundColor White
    Write-Host "      emailVerified: true," -ForegroundColor White
    Write-Host "      emailVerificationToken: null" -ForegroundColor White
    Write-Host "    }" -ForegroundColor White
    Write-Host "  );" -ForegroundColor White
    Write-Host "  " -ForegroundColor White
    Write-Host "  console.log('User verified:', result);" -ForegroundColor White
    Write-Host "  process.exit(0);" -ForegroundColor White
    Write-Host "}" -ForegroundColor White
    Write-Host ""
    Write-Host "verifyUser();" -ForegroundColor White
    Write-Host ""
    Write-Host "// Run with: node verify-user.js" -ForegroundColor Gray
    Write-Host ""
}

Write-Host ""
Write-Host "✅ Account Status Values:" -ForegroundColor Yellow
Write-Host "   pending_email_verification - Just registered, needs email verification"
Write-Host "   pending_admin_approval - Email verified, waiting for admin"
Write-Host "   verified - Fully verified, can login"
Write-Host "   rejected - Application rejected"
Write-Host "   suspended - Account suspended"
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
