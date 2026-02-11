# Contributor Application Feature Documentation

## Overview
The Contributor Application feature allows students to apply to become contributors for their college. Each college can have only one contributor. Administrators review and approve/reject applications.

## Features Implemented

### 1. Backend Components

#### Models
- **ContributorApplication** (`Backend/models/ContributorApplication.js`)
  - Stores application details, status, and documents
  - Validates one contributor per college
  - Tracks review history

#### Controllers
- **contributorController** (`Backend/controllers/contributorController.js`)
  - `submitApplication` - Student submits application with documents
  - `getMyApplication` - Student checks their application status
  - `getAllApplications` - Admin views all applications
  - `getApplicationById` - Admin views application details
  - `approveApplication` - Admin approves and upgrades user role
  - `rejectApplication` - Admin rejects with reason
  - `deleteApplication` - Admin deletes application

#### Routes
- **contributorRoutes** (`Backend/routes/contributorRoutes.js`)
  - `POST /api/contributor/apply` - Submit application (Student)
  - `GET /api/contributor/my-application` - Get my application (Student)
  - `GET /api/contributor/applications` - Get all applications (Admin)
  - `GET /api/contributor/applications/:id` - Get application details (Admin)
  - `PUT /api/contributor/applications/:id/approve` - Approve application (Admin)
  - `PUT /api/contributor/applications/:id/reject` - Reject application (Admin)
  - `DELETE /api/contributor/applications/:id` - Delete application (Admin)

### 2. Frontend Components

#### Pages
- **Profile** (`Frontend/sunocampus/src/pages/Profile.jsx`)
  - Displays user profile information
  - Shows "Become a Contributor" section for students
  - Displays application status (pending/approved/rejected)
  - Shows rejection reason if applicable
  - "Apply Now" button for eligible students

- **Admin** (`Frontend/sunocampus/src/pages/Admin.jsx`)
  - Admin dashboard with application statistics
  - Filter applications by status (all/pending/approved/rejected)
  - View application details
  - Approve/Reject applications
  - Add admin comments
  - Delete applications

#### Components
- **ApplyContributorModal** (`Frontend/sunocampus/src/components/ApplyContributorModal.jsx`)
  - Application form modal
  - Validates form inputs
  - Handles file uploads (College ID, Authority Letter)
  - File type validation (JPEG, PNG, PDF)
  - File size validation (5MB max)

#### Services
- **contributorAPI** (`Frontend/sunocampus/src/services/api.js`)
  - API integration for all contributor application endpoints
  - Handles FormData for file uploads
  - Error handling and token management

## User Flow

### Student Journey
1. **Student logs in** → Views Profile page
2. **Sees "Become a Contributor" section** → Clicks "Apply Now"
3. **Fills application form**:
   - Reason for applying (required, max 1000 chars)
   - Relevant experience (optional, max 1000 chars)
   - Upload College ID Card (required, JPEG/PNG/PDF, max 5MB)
   - Upload Authority Letter (required, JPEG/PNG/PDF, max 5MB)
4. **Submits application** → Status changes to "Pending"
5. **Waits for admin review**
6. **Receives notification** → Status changes to "Approved" or "Rejected"
7. **If approved** → User role upgraded to "contributor"

### Admin Journey
1. **Admin logs in** → Views Admin Dashboard
2. **Sees application statistics**:
   - Total applications
   - Pending count
   - Approved count
   - Rejected count
3. **Filters applications** by status
4. **Clicks on application** → Views detailed information
5. **Reviews application**:
   - Checks student details
   - Reads reason and experience
   - Downloads and views documents
6. **Makes decision**:
   - **Approve**: Adds optional comments → User becomes contributor
   - **Reject**: Enters rejection reason → Student notified
7. **Can delete** previously reviewed applications

## Validations & Business Rules

### Application Submission
- ✅ Only students can apply
- ✅ One application per student
- ✅ College must not have existing contributor
- ✅ Both documents required
- ✅ File size limit: 5MB
- ✅ File types: JPEG, JPG, PNG, PDF

### Application Approval
- ✅ Only pending applications can be approved/rejected
- ✅ College must not have existing contributor (double-checked)
- ✅ User role automatically upgraded to "contributor"
- ✅ Account status set to "verified"
- ✅ Rejection requires reason

### One Contributor Per College
- ✅ Validated during application submission
- ✅ Validated during approval
- ✅ Database model enforces constraint

## File Structure

```
Backend/
├── models/
│   └── ContributorApplication.js       # Application data model
├── controllers/
│   └── contributorController.js        # Business logic
├── routes/
│   └── contributorRoutes.js            # API endpoints
├── uploads/
│   └── contributor-applications/       # Uploaded documents
└── index.js                            # Route registration

Frontend/sunocampus/src/
├── components/
│   └── ApplyContributorModal.jsx       # Application form modal
├── pages/
│   ├── Profile.jsx                     # Student profile & application
│   └── Admin.jsx                       # Admin dashboard
└── services/
    └── api.js                          # API integration
```

## API Endpoints

### Student Endpoints
```
POST   /api/contributor/apply
GET    /api/contributor/my-application
```

### Admin Endpoints
```
GET    /api/contributor/applications
GET    /api/contributor/applications/:id
PUT    /api/contributor/applications/:id/approve
PUT    /api/contributor/applications/:id/reject
DELETE /api/contributor/applications/:id
```

## Database Schema

### ContributorApplication Collection
```javascript
{
  userId: ObjectId (ref: User, unique),
  fullName: String,
  email: String,
  phoneNumber: String,
  collegeName: String,
  studentId: String,
  branch: String,
  yearOfStudy: Number,
  reasonForApplying: String (max 1000),
  experience: String (max 1000),
  collegeIdCard: String (file path),
  authorityLetter: String (file path),
  status: String (pending/approved/rejected),
  reviewedBy: ObjectId (ref: User),
  reviewedAt: Date,
  adminComments: String (max 500),
  rejectionReason: String (max 500),
  createdAt: Date,
  updatedAt: Date
}
```

## Security & Permissions

### Authentication Required
- All endpoints require valid JWT token

### Role-Based Access
- **Students**: Can apply and view own application
- **Admin**: Can view, approve, reject, and delete all applications
- **Contributors**: No special access (same as students)

### File Upload Security
- Multer middleware validates file types
- File size limited to 5MB
- Files stored in `uploads/contributor-applications/`
- Unique filenames generated with timestamp

## UI/UX Features

### Profile Page (Students)
- ✅ Clean application status display
- ✅ Color-coded status badges
- ✅ Application submission form
- ✅ Rejection reason visibility
- ✅ Admin comments display
- ✅ Document upload with drag & drop
- ✅ Character count for text areas
- ✅ Real-time validation

### Admin Dashboard
- ✅ Statistics cards with counts
- ✅ Filter by status
- ✅ Grid layout for applications
- ✅ Click to view details modal
- ✅ Document download links
- ✅ Approve/Reject actions
- ✅ Confirmation dialogs
- ✅ Loading states
- ✅ Error handling

## Error Handling

### Backend Errors
- Invalid file type
- File too large
- User not found
- Application already exists
- College already has contributor
- Application not found
- Invalid status transition

### Frontend Errors
- Network errors
- Validation errors
- File upload errors
- API errors with user-friendly messages

## Testing Checklist

### Student Flow
- [ ] Student can see "Apply Now" button
- [ ] Application form validation works
- [ ] File upload validation (type, size)
- [ ] Successful submission
- [ ] Cannot submit duplicate application
- [ ] Application status displayed correctly
- [ ] Rejection reason visible

### Admin Flow
- [ ] Dashboard statistics accurate
- [ ] Filter by status works
- [ ] Application details modal
- [ ] Can view documents
- [ ] Approve application works
- [ ] User role upgraded after approval
- [ ] Reject application works
- [ ] Cannot approve if college has contributor
- [ ] Delete application works

### Edge Cases
- [ ] Multiple students from same college
- [ ] First applicant approved → Second blocked
- [ ] Invalid file uploads rejected
- [ ] Network failure handling
- [ ] Token expiration handling

## Future Enhancements

### Potential Improvements
1. **Email notifications** when application status changes
2. **Contributor term limits** (e.g., 1 year)
3. **Re-application** after rejection (with cooldown period)
4. **Application analytics** for admins
5. **Bulk actions** for admins
6. **Search and sort** applications
7. **Export applications** to CSV/PDF
8. **Application history** tracking
9. **Contributor handover** process
10. **Performance reviews** for contributors

## Troubleshooting

### Common Issues

**Issue**: Files not uploading
- Check `uploads/contributor-applications/` directory exists
- Verify multer configuration in routes
- Check file size and type validations

**Issue**: "College already has contributor" error
- Query User collection for existing contributor
- Check user role and accountStatus
- Verify college name matches exactly

**Issue**: Application not showing in admin panel
- Check token has admin role
- Verify API endpoint called correctly
- Check filter status settings

## Deployment Notes

### Environment Variables
- Ensure `JWT_SECRET` is set
- Configure `PORT` if needed
- Set `NODE_ENV` for production

### File Storage
- Create `uploads/contributor-applications/` directory
- Set proper permissions (755)
- For production: Consider cloud storage (AWS S3, Cloudinary)

### Database Migration
- No migration needed (new collection)
- Existing users unaffected
- Indexes created automatically

---

**Created**: February 11, 2026
**Last Updated**: February 11, 2026
**Version**: 1.0.0
