import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { contributorAPI } from '../services/api';

export default function Admin() {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminComments, setAdminComments] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadApplications();
  }, [filterStatus]);

  const loadApplications = async () => {
    try {
      setIsLoading(true);
      const params = filterStatus !== 'all' ? { status: filterStatus } : {};
      const response = await contributorAPI.getAllApplications(params);
      
      if (response.success) {
        setApplications(response.applications);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (applicationId) => {
    if (!confirm('Are you sure you want to approve this application? This will change the user\'s role to contributor.')) {
      return;
    }

    try {
      const response = await contributorAPI.approveApplication(applicationId, adminComments);
      
      if (response.success) {
        alert('Application approved successfully!');
        loadApplications();
        setSelectedApplication(null);
        setAdminComments('');
      }
    } catch (error) {
      alert(error.message || 'Failed to approve application');
    }
  };

  const handleReject = async (applicationId) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      const response = await contributorAPI.rejectApplication(
        applicationId,
        rejectionReason,
        adminComments
      );
      
      if (response.success) {
        alert('Application rejected');
        loadApplications();
        setSelectedApplication(null);
        setShowRejectModal(null);
        setRejectionReason('');
        setAdminComments('');
      }
    } catch (error) {
      alert(error.message || 'Failed to reject application');
    }
  };

  const handleDelete = async (applicationId) => {
    if (!confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await contributorAPI.deleteApplication(applicationId);
      
      if (response.success) {
        alert('Application deleted successfully');
        loadApplications();
        setSelectedApplication(null);
      }
    } catch (error) {
      alert(error.message || 'Failed to delete application');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const ApplicationCard = ({ application }) => (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => setSelectedApplication(application)}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{application.fullName}</h3>
          <p className="text-sm text-gray-600">{application.email}</p>
        </div>
        {getStatusBadge(application.status)}
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div>
          <p className="text-gray-500">College:</p>
          <p className="font-medium text-gray-900">{application.collegeName}</p>
        </div>
        <div>
          <p className="text-gray-500">Branch:</p>
          <p className="font-medium text-gray-900">{application.branch}</p>
        </div>
      </div>

      <p className="text-sm text-gray-600 line-clamp-2">{application.reasonForApplying}</p>

      <div className="mt-3 pt-3 border-t text-xs text-gray-500">
        Submitted: {new Date(application.createdAt).toLocaleDateString()}
      </div>
    </div>
  );

  const ApplicationDetailModal = ({ application, onClose }) => {
    if (!application) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div className="bg-white rounded-lg max-w-3xl w-full my-8">
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{application.fullName}</h2>
                <p className="text-gray-600">{application.email}</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Status */}
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                {getStatusBadge(application.status)}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Phone Number</p>
                  <p className="text-gray-900">{application.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Student ID</p>
                  <p className="text-gray-900">{application.studentId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">College</p>
                  <p className="text-gray-900">{application.collegeName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Branch</p>
                  <p className="text-gray-900">{application.branch}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Year of Study</p>
                  <p className="text-gray-900">Year {application.yearOfStudy}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Submitted On</p>
                  <p className="text-gray-900">{new Date(application.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Reason for Applying</p>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{application.reasonForApplying}</p>
              </div>

              {application.experience && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Experience</p>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{application.experience}</p>
                </div>
              )}

              {/* Documents */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Documents</p>
                <div className="flex gap-3">
                  <a
                    href={`http://localhost:5000/${application.collegeIdCard}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    College ID Card
                  </a>
                  <a
                    href={`http://localhost:5000/${application.authorityLetter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Authority Letter
                  </a>
                </div>
              </div>

              {/* Review Info */}
              {application.reviewedBy && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-700">Review Information</p>
                  <p className="text-sm text-gray-600">
                    Reviewed on {new Date(application.reviewedAt).toLocaleDateString()}
                  </p>
                  {application.adminComments && (
                    <p className="text-sm text-gray-900 mt-2">
                      <strong>Admin Comments:</strong> {application.adminComments}
                    </p>
                  )}
                  {application.rejectionReason && (
                    <p className="text-sm text-red-800 mt-2 bg-red-50 p-2 rounded">
                      <strong>Rejection Reason:</strong> {application.rejectionReason}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Admin Comments Input (for pending applications) */}
            {application.status === 'pending' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Comments (Optional)
                </label>
                <textarea
                  value={adminComments}
                  onChange={(e) => setAdminComments(e.target.value)}
                  rows={3}
                  placeholder="Add any comments for the applicant..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Action Buttons */}
            {application.status === 'pending' && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleApprove(application._id)}
                  className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Approve Application
                </button>
                <button
                  onClick={() => setShowRejectModal(application._id)}
                  className="flex-1 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Reject Application
                </button>
              </div>
            )}

            {application.status !== 'pending' && (
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => handleDelete(application._id)}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Reject Reason Modal */}
        {showRejectModal === application._id && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-60">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Rejection Reason</h3>
              <p className="text-sm text-gray-600 mb-4">
                Please provide a reason for rejecting this application. This will be shown to the applicant.
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                placeholder="Explain why this application is being rejected..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(null);
                    setRejectionReason('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(application._id)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage contributor applications</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {applications.filter(a => a.status === 'pending').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {applications.filter(a => a.status === 'approved').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {applications.filter(a => a.status === 'rejected').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex gap-2">
              {['all', 'pending', 'approved', 'rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterStatus === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Applications List */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-4">Loading applications...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-800">{error}</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-600">No applications found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {applications.map((application) => (
                <ApplicationCard key={application._id} application={application} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Application Detail Modal */}
      <ApplicationDetailModal
        application={selectedApplication}
        onClose={() => {
          setSelectedApplication(null);
          setAdminComments('');
        }}
      />
    </>
  );
}
