import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ApplyContributorModal from '../components/ApplyContributorModal';
import EditProfileModal from '../components/EditProfileModal';
import ChangePasswordModal from '../components/ChangePasswordModal';
import { contributorAPI, profileAPI } from '../services/api';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [application, setApplication] = useState(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUserProfile();
    checkApplication();
  }, []);

  // Fetch user profile from backend (secure)
  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      const response = await profileAPI.getProfile();
      if (response.success) {
        setUser(response.data);
        // Update localStorage for consistency
        localStorage.setItem('user', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setError(error.message);
      // If token is invalid, redirect to login
      if (error.message.includes('Not authorized') || error.message.includes('Invalid token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } finally {
      setIsLoading(false);
    }
  };

  const checkApplication = async () => {
    try {
      setIsLoading(true);
      const response = await contributorAPI.getMyApplication();
      if (response.success) {
        setApplication(response.application);
      }
    } catch (error) {
      // No application found - this is okay
      if (!error.message.includes('No application found')) {
        console.error('Error checking application:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitApplication = async (formData) => {
    try {
      setError(null);
      const response = await contributorAPI.submitApplication(formData);
      
      if (response.success) {
        setApplication(response.application);
        alert('Application submitted successfully! Please wait for admin approval.');
      }
    } catch (error) {
      setError(error.message);
      alert(error.message || 'Failed to submit application');
      throw error;
    }
  };

  const handleUpdateProfile = async (formData) => {
    try {
      setError(null);
      const response = await profileAPI.updateProfile(formData);
      
      if (response.success) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
        alert('Profile updated successfully!');
      }
    } catch (error) {
      setError(error.message);
      alert(error.message || 'Failed to update profile');
      throw error;
    }
  };

  const handleChangePassword = async (currentPassword, newPassword) => {
    try {
      const response = await profileAPI.changePassword(currentPassword, newPassword);
      
      if (response.success) {
        alert('Password changed successfully!');
      }
    } catch (error) {
      throw new Error(error.message || 'Failed to change password');
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only JPEG, PNG, and GIF images are allowed');
      return;
    }

    try {
      const response = await profileAPI.uploadAvatar(file);
      if (response.success) {
        // Reload profile to get updated avatar
        loadUserProfile();
        alert('Avatar uploaded successfully!');
      }
    } catch (error) {
      alert(error.message || 'Failed to upload avatar');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      approved: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300',
    };

    const labels = {
      pending: 'Pending Review',
      approved: 'Approved',
      rejected: 'Rejected',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const canApply = user?.role === 'student' && !application;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-4">Loading profile...</p>
            </div>
          ) : (
            <>
              {/* Profile Header */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="relative group">
                      {user?.avatar ? (
                        <img
                          src={`http://localhost:5000/${user.avatar}`}
                          alt={user.fullName}
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                          {user?.fullName?.charAt(0) || 'U'}
                        </div>
                      )}
                      <label
                        htmlFor="avatar-upload"
                        className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </label>
                      <input
                        type="file"
                        id="avatar-upload"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">{user?.fullName || 'User'}</h1>
                      <p className="text-gray-600">{user?.email}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize">
                          {user?.role || 'student'}
                        </span>
                        {user?.emailVerified && (
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Profile
                    </button>
                    <button
                      onClick={() => setIsPasswordModalOpen(true)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Change Password
                    </button>
                  </div>
                </div>

                {/* Bio */}
                {user?.bio && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-700">{user.bio}</p>
                  </div>
                )}
              </div>

              {/* User Details */}
              {user?.collegeName && (
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">College Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">College</p>
                      <p className="font-medium text-gray-900">{user.collegeName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Student ID</p>
                      <p className="font-medium text-gray-900">{user.studentId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Branch</p>
                      <p className="font-medium text-gray-900">{user.branch}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Year of Study</p>
                      <p className="font-medium text-gray-900">Year {user.yearOfStudy}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Contributor Application Section - Only for Students */}
              {user?.role === 'student' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Become a Contributor</h2>
                      <p className="text-gray-600 mt-1">
                        Apply to manage events and create posts for your campus
                      </p>
                    </div>
                {canApply && (
                  <button
                    onClick={() => setIsApplyModalOpen(true)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Apply Now
                  </button>
                )}
              </div>

              {isLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="text-gray-600 mt-2">Loading...</p>
                </div>
              ) : application ? (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">Application Status</h3>
                      <p className="text-sm text-gray-600">
                        Submitted on {new Date(application.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {getStatusBadge(application.status)}
                  </div>

                  {application.status === 'pending' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <div className="flex gap-2">
                        <svg className="w-5 h-5 text-yellow-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm text-yellow-800">
                          Your application is under review. You will be notified once it's processed.
                        </p>
                      </div>
                    </div>
                  )}

                  {application.status === 'approved' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <div className="flex gap-2">
                        <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm text-green-800">
                          Congratulations! Your application has been approved. Your role will be updated shortly.
                        </p>
                      </div>
                    </div>
                  )}

                  {application.status === 'rejected' && application.rejectionReason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <div className="flex gap-2">
                        <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                          <p className="text-sm text-red-700">{application.rejectionReason}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Reason for Applying</p>
                      <p className="text-sm text-gray-600">{application.reasonForApplying}</p>
                    </div>

                    {application.experience && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Experience</p>
                        <p className="text-sm text-gray-600">{application.experience}</p>
                      </div>
                    )}

                    {application.reviewedBy && (
                      <div className="pt-4 border-t mt-4">
                        <p className="text-xs text-gray-500">
                          Reviewed on {new Date(application.reviewedAt).toLocaleDateString()}
                        </p>
                        {application.adminComments && (
                          <p className="text-sm text-gray-600 mt-1">
                            <strong>Admin Comments:</strong> {application.adminComments}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 border border-gray-200 rounded-lg">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-600 mb-4">No application submitted yet</p>
                  <p className="text-sm text-gray-500 max-w-md mx-auto">
                    Submit an application to become a contributor for your college.
                    Contributors can create and manage events, create posts, and engage with the campus community.
                  </p>
                </div>
              )}

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
                </div>
              )}

              {/* Contributor/Admin Info */}
              {(user?.role === 'contributor' || user?.role === 'admin') && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {user?.role === 'admin' ? 'Administrator Account' : 'Contributor Account'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {user?.role === 'admin' 
                          ? 'You have full access to manage the platform, users, and applications.'
                          : 'You can create and manage events and posts for your campus.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <ApplyContributorModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSubmit={handleSubmitApplication}
      />

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onSubmit={handleUpdateProfile}
      />

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmit={handleChangePassword}
      />
    </>
  );
}

