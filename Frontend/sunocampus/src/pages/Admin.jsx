import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { adminAPI, contributorAPI } from '../services/api';

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Dashboard state
  const [stats, setStats] = useState(null);

  // Users state
  const [users, setUsers] = useState([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);

  // Applications state
  const [applications, setApplications] = useState([]);
  const [appFilterStatus, setAppFilterStatus] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminComments, setAdminComments] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(null);

  // Events state
  const [events, setEvents] = useState([]);
  const [eventsTotal, setEventsTotal] = useState(0);
  const [eventsPage, setEventsPage] = useState(1);
  const [eventSearch, setEventSearch] = useState('');

  // Posts state
  const [posts, setPosts] = useState([]);
  const [postsTotal, setPostsTotal] = useState(0);
  const [postsPage, setPostsPage] = useState(1);
  const [postFilter, setPostFilter] = useState('all');

  // Toast notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    setCurrentUser(user);
    loadDashboard();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'applications') loadApplications();
    if (activeTab === 'events') loadEvents();
    if (activeTab === 'posts') loadPosts();
  }, [activeTab, usersPage, userRoleFilter, userStatusFilter, appFilterStatus, eventsPage, postsPage, postFilter]);

  // ─── Loaders ───
  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      const response = await adminAPI.getDashboardStats();
      if (response.success) setStats(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const params = { page: usersPage, limit: 15 };
      if (userRoleFilter !== 'all') params.role = userRoleFilter;
      if (userStatusFilter !== 'all') params.accountStatus = userStatusFilter;
      if (userSearch) params.search = userSearch;
      const response = await adminAPI.getUsers(params);
      if (response.success) {
        setUsers(response.data);
        setUsersTotal(response.total);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadApplications = async () => {
    try {
      setIsLoading(true);
      const params = appFilterStatus !== 'all' ? { status: appFilterStatus } : {};
      const response = await contributorAPI.getAllApplications(params);
      if (response.success) setApplications(response.applications);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const params = { page: eventsPage, limit: 15 };
      if (eventSearch) params.search = eventSearch;
      const response = await adminAPI.getEvents(params);
      if (response.success) {
        setEvents(response.data);
        setEventsTotal(response.total);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const params = { page: postsPage, limit: 15 };
      if (postFilter === 'reported') params.reported = 'true';
      if (postFilter === 'hidden') params.isActive = 'false';
      const response = await adminAPI.getPosts(params);
      if (response.success) {
        setPosts(response.data);
        setPostsTotal(response.total);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── User Actions ───
  const handleVerifyUser = async (userId) => {
    try {
      await adminAPI.verifyUser(userId);
      showToast('User verified successfully');
      loadUsers();
      loadDashboard();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSuspendUser = async (userId) => {
    if (!confirm('Are you sure you want to suspend this user?')) return;
    try {
      await adminAPI.suspendUser(userId);
      showToast('User suspended');
      loadUsers();
      loadDashboard();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleUpdateUserRole = async (userId, role) => {
    try {
      await adminAPI.updateUser(userId, { role });
      showToast(`Role updated to ${role}`);
      loadUsers();
      loadDashboard();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure? This will delete the user and ALL their posts, events, and applications permanently.')) return;
    try {
      await adminAPI.deleteUser(userId);
      showToast('User deleted');
      loadUsers();
      setSelectedUser(null);
      loadDashboard();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // ─── Application Actions ───
  const handleApprove = async (applicationId) => {
    if (!confirm('Approve this application? User role will be upgraded to contributor.')) return;
    try {
      await contributorAPI.approveApplication(applicationId, adminComments);
      showToast('Application approved! User is now a contributor.');
      loadApplications();
      setSelectedApplication(null);
      setAdminComments('');
      loadDashboard();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleReject = async (applicationId) => {
    if (!rejectionReason.trim()) {
      showToast('Please provide a rejection reason', 'error');
      return;
    }
    try {
      await contributorAPI.rejectApplication(applicationId, rejectionReason, adminComments);
      showToast('Application rejected');
      loadApplications();
      setSelectedApplication(null);
      setShowRejectModal(null);
      setRejectionReason('');
      setAdminComments('');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteApplication = async (applicationId) => {
    if (!confirm('Delete this application permanently?')) return;
    try {
      await contributorAPI.deleteApplication(applicationId);
      showToast('Application deleted');
      loadApplications();
      setSelectedApplication(null);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // ─── Event Actions ───
  const handleToggleEvent = async (eventId) => {
    try {
      const res = await adminAPI.toggleEvent(eventId);
      showToast(res.message);
      loadEvents();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!confirm('Delete this event permanently?')) return;
    try {
      await adminAPI.deleteEvent(eventId);
      showToast('Event deleted');
      loadEvents();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // ─── Post Actions ───
  const handleTogglePost = async (postId) => {
    try {
      const res = await adminAPI.togglePost(postId);
      showToast(res.message);
      loadPosts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Delete this post permanently?')) return;
    try {
      await adminAPI.deletePost(postId);
      showToast('Post deleted');
      loadPosts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDismissReports = async (postId) => {
    try {
      await adminAPI.dismissReports(postId);
      showToast('Reports dismissed');
      loadPosts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // ─── Helpers ───
  const getStatusBadge = (status) => {
    const styles = {
      verified: 'bg-green-100 text-green-800',
      pending_email_verification: 'bg-yellow-100 text-yellow-800',
      pending_admin_approval: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800',
      suspended: 'bg-gray-100 text-gray-800',
    };
    const labels = {
      verified: 'Verified',
      pending_email_verification: 'Pending Email',
      pending_admin_approval: 'Pending Approval',
      rejected: 'Rejected',
      suspended: 'Suspended',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const styles = {
      student: 'bg-blue-100 text-blue-800',
      contributor: 'bg-purple-100 text-purple-800',
      admin: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[role]}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  const getAppStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'applications', label: 'Applications', icon: '📋' },
    { id: 'events', label: 'Events', icon: '📅' },
    { id: 'posts', label: 'Posts', icon: '📝' },
  ];

  // ═══════════════════════════════════════
  //  OVERVIEW TAB
  // ═══════════════════════════════════════
  const OverviewTab = () => {
    if (!stats) return null;
    const { users: u, events: e, posts: p, applications: a, recentActivity: r } = stats;

    return (
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
          <h2 className="text-2xl font-bold">Welcome back, Admin</h2>
          <p className="mt-1 text-indigo-100">Here's what's happening on your campus platform.</p>
          <div className="mt-4 flex gap-4 flex-wrap text-sm">
            <span className="bg-white/20 px-3 py-1 rounded-full">{r.newUsers} new users this week</span>
            <span className="bg-white/20 px-3 py-1 rounded-full">{r.newEvents} new events this week</span>
            <span className="bg-white/20 px-3 py-1 rounded-full">{r.newPosts} new posts this week</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Total Users" value={u.total} icon="👥" color="blue" sub={`${u.students} students, ${u.contributors} contributors`} />
          <StatCard title="Pending Apps" value={a.pending} icon="📋" color="yellow" sub={`${a.total} total applications`} onClick={() => setActiveTab('applications')} />
          <StatCard title="Active Events" value={e.active} icon="📅" color="green" sub={`${e.upcoming} upcoming, ${e.ongoing} ongoing`} />
          <StatCard title="Total Posts" value={p.total} icon="📝" color="purple" sub={p.reported > 0 ? `${p.reported} reported` : 'No reported posts'} />
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Breakdown</h3>
            <div className="space-y-3">
              <BarItem label="Students" count={u.students} total={u.total} color="bg-blue-500" />
              <BarItem label="Contributors" count={u.contributors} total={u.total} color="bg-purple-500" />
              <BarItem label="Admins" count={u.admins} total={u.total} color="bg-red-500" />
            </div>
            <div className="mt-4 pt-4 border-t grid grid-cols-3 text-center text-sm">
              <div>
                <p className="text-green-600 font-semibold">{u.verified}</p>
                <p className="text-gray-500">Verified</p>
              </div>
              <div>
                <p className="text-yellow-600 font-semibold">{u.pending}</p>
                <p className="text-gray-500">Pending</p>
              </div>
              <div>
                <p className="text-gray-600 font-semibold">{u.suspended}</p>
                <p className="text-gray-500">Suspended</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contributor Applications</h3>
            <div className="space-y-3">
              <BarItem label="Pending" count={a.pending} total={a.total || 1} color="bg-yellow-500" />
              <BarItem label="Approved" count={a.approved} total={a.total || 1} color="bg-green-500" />
              <BarItem label="Rejected" count={a.rejected} total={a.total || 1} color="bg-red-500" />
            </div>
            {a.pending > 0 && (
              <button
                onClick={() => setActiveTab('applications')}
                className="mt-4 w-full py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition text-sm font-medium"
              >
                Review {a.pending} pending application{a.pending > 1 ? 's' : ''}
              </button>
            )}
          </div>
        </div>

        {/* Action Required */}
        {(a.pending > 0 || p.reported > 0 || u.pending > 0) && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Action Required</h3>
            <div className="space-y-3">
              {a.pending > 0 && (
                <AlertRow icon="📋" text={`${a.pending} contributor application${a.pending > 1 ? 's' : ''} awaiting review`} action="Review" onClick={() => setActiveTab('applications')} />
              )}
              {p.reported > 0 && (
                <AlertRow icon="🚩" text={`${p.reported} post${p.reported > 1 ? 's' : ''} have been reported`} action="View" onClick={() => { setPostFilter('reported'); setActiveTab('posts'); }} />
              )}
              {u.pending > 0 && (
                <AlertRow icon="⏳" text={`${u.pending} user${u.pending > 1 ? 's' : ''} pending email verification`} action="Manage" onClick={() => { setUserStatusFilter('pending_email_verification'); setActiveTab('users'); }} />
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ═══════════════════════════════════════
  //  USERS TAB
  // ═══════════════════════════════════════
  const UsersTab = () => (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, email, student ID..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <select
            value={userRoleFilter}
            onChange={(e) => { setUserRoleFilter(e.target.value); setUsersPage(1); }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="contributor">Contributors</option>
            <option value="admin">Admins</option>
          </select>
          <select
            value={userStatusFilter}
            onChange={(e) => { setUserStatusFilter(e.target.value); setUsersPage(1); }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="verified">Verified</option>
            <option value="pending_email_verification">Pending Email</option>
            <option value="suspended">Suspended</option>
          </select>
          <button
            onClick={loadUsers}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Search
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">College</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold text-sm">
                        {user.fullName?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{user.fullName}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.collegeName || '—'}</td>
                  <td className="px-4 py-3">{getRoleBadge(user.role)}</td>
                  <td className="px-4 py-3">{getStatusBadge(user.accountStatus)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {user.accountStatus !== 'verified' && user.accountStatus !== 'suspended' && (
                        <button onClick={() => handleVerifyUser(user._id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition" title="Verify User">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </button>
                      )}
                      {user.accountStatus !== 'suspended' && user.role !== 'admin' && (
                        <button onClick={() => handleSuspendUser(user._id)} className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition" title="Suspend User">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                        </button>
                      )}
                      {user.accountStatus === 'suspended' && (
                        <button onClick={() => handleVerifyUser(user._id)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Reactivate User">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        </button>
                      )}
                      <button onClick={() => setSelectedUser(user)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition" title="View Details">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </button>
                      {user.role !== 'admin' && (
                        <button onClick={() => handleDeleteUser(user._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition" title="Delete User">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500">No users found</div>
        )}
        {usersTotal > 15 && (
          <div className="flex justify-between items-center px-4 py-3 border-t bg-gray-50">
            <span className="text-sm text-gray-600">Showing {users.length} of {usersTotal} users</span>
            <div className="flex gap-2">
              <button disabled={usersPage === 1} onClick={() => setUsersPage(usersPage - 1)} className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 hover:bg-white transition">Previous</button>
              <button disabled={usersPage * 15 >= usersTotal} onClick={() => setUsersPage(usersPage + 1)} className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 hover:bg-white transition">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ═══════════════════════════════════════
  //  APPLICATIONS TAB
  // ═══════════════════════════════════════
  const ApplicationsTab = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setAppFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                appFilterStatus === status
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {applications.length === 0 && !isLoading ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center text-gray-500">
          No applications found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {applications.map((app) => (
            <div
              key={app._id}
              className="bg-white rounded-xl border shadow-sm p-4 hover:shadow-md transition cursor-pointer"
              onClick={() => setSelectedApplication(app)}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{app.fullName}</h3>
                  <p className="text-xs text-gray-500">{app.email}</p>
                </div>
                {getAppStatusBadge(app.status)}
              </div>
              <div className="grid grid-cols-2 text-sm gap-2 mb-3">
                <div><span className="text-gray-400">College:</span> <span className="font-medium">{app.collegeName}</span></div>
                <div><span className="text-gray-400">Branch:</span> <span className="font-medium">{app.branch}</span></div>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{app.reasonForApplying}</p>
              <div className="mt-3 pt-3 border-t text-xs text-gray-400">{formatDate(app.createdAt)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ═══════════════════════════════════════
  //  EVENTS TAB
  // ═══════════════════════════════════════
  const EventsTab = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search events..."
            value={eventSearch}
            onChange={(e) => setEventSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadEvents()}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button onClick={loadEvents} className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">Search</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Organizer</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Participants</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.map((event) => {
                const now = new Date();
                let status = 'upcoming';
                if (now >= new Date(event.startDate) && now <= new Date(event.endDate)) status = 'ongoing';
                else if (now > new Date(event.endDate)) status = 'completed';
                return (
                  <tr key={event._id} className={`hover:bg-gray-50 transition ${!event.isActive ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 text-sm">{event.title}</p>
                      <p className="text-xs text-gray-500">{event.collegeName}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{event.organizer?.fullName || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs">{event.eventType}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(event.startDate)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{event.currentParticipants}{event.maxParticipants ? `/${event.maxParticipants}` : ''}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                        status === 'ongoing' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {status}{!event.isActive ? ' (Hidden)' : ''}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleEvent(event._id)}
                          className={`p-1.5 rounded-lg transition ${event.isActive ? 'text-yellow-600 hover:bg-yellow-50' : 'text-green-600 hover:bg-green-50'}`}
                          title={event.isActive ? 'Hide Event' : 'Show Event'}
                        >
                          {event.isActive ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878l4.242 4.242M21 21l-4.35-4.35" /></svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          )}
                        </button>
                        <button onClick={() => handleDeleteEvent(event._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition" title="Delete Event">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {events.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500">No events found</div>
        )}
        {eventsTotal > 15 && (
          <div className="flex justify-between items-center px-4 py-3 border-t bg-gray-50">
            <span className="text-sm text-gray-600">Showing {events.length} of {eventsTotal}</span>
            <div className="flex gap-2">
              <button disabled={eventsPage === 1} onClick={() => setEventsPage(eventsPage - 1)} className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 hover:bg-white transition">Previous</button>
              <button disabled={eventsPage * 15 >= eventsTotal} onClick={() => setEventsPage(eventsPage + 1)} className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 hover:bg-white transition">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ═══════════════════════════════════════
  //  POSTS TAB
  // ═══════════════════════════════════════
  const PostsTab = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'all', label: 'All Posts' },
            { id: 'reported', label: 'Reported' },
            { id: 'hidden', label: 'Hidden' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => { setPostFilter(f.id); setPostsPage(1); }}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                postFilter === f.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {posts.length === 0 && !isLoading ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center text-gray-500">
            No posts found
          </div>
        ) : (
          posts.map((post) => (
            <div key={post._id} className={`bg-white rounded-xl shadow-sm border p-4 ${!post.isActive ? 'opacity-60 border-red-200' : ''}`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-medium">
                    {post.author?.fullName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{post.author?.fullName || 'Unknown'}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {getRoleBadge(post.author?.role || 'student')}
                      <span>{post.author?.collegeName}</span>
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {!post.isActive && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Hidden</span>}
                  {post.reportedBy?.length > 0 && (
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                      {post.reportedBy.length} report{post.reportedBy.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-gray-800 text-sm mb-3 whitespace-pre-wrap">{post.content?.substring(0, 300)}{post.content?.length > 300 ? '...' : ''}</p>

              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{post.likesCount || 0} likes</span>
                  <span>{post.commentsCount || 0} comments</span>
                  <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">{post.visibility}</span>
                </div>
                <div className="flex items-center gap-1">
                  {post.reportedBy?.length > 0 && (
                    <button
                      onClick={() => handleDismissReports(post._id)}
                      className="px-3 py-1.5 text-xs bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition"
                    >
                      Dismiss Reports
                    </button>
                  )}
                  <button
                    onClick={() => handleTogglePost(post._id)}
                    className={`px-3 py-1.5 text-xs rounded-lg transition ${post.isActive ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                  >
                    {post.isActive ? 'Hide' : 'Unhide'}
                  </button>
                  <button
                    onClick={() => handleDeletePost(post._id)}
                    className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {postsTotal > 15 && (
        <div className="flex justify-between items-center px-4 py-3 bg-white border rounded-xl">
          <span className="text-sm text-gray-600">Showing {posts.length} of {postsTotal}</span>
          <div className="flex gap-2">
            <button disabled={postsPage === 1} onClick={() => setPostsPage(postsPage - 1)} className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50 transition">Previous</button>
            <button disabled={postsPage * 15 >= postsTotal} onClick={() => setPostsPage(postsPage + 1)} className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50 transition">Next</button>
          </div>
        </div>
      )}
    </div>
  );

  // ═══════════════════════════════════════
  //  MODALS
  // ═══════════════════════════════════════

  const UserDetailModal = () => {
    if (!selectedUser) return null;
    const u = selectedUser;
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl">
                  {u.fullName?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{u.fullName}</h2>
                  <p className="text-sm text-gray-500">{u.email}</p>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex gap-2 mb-4">{getRoleBadge(u.role)} {getStatusBadge(u.accountStatus)}</div>

            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
              <InfoItem label="Phone" value={u.phoneNumber} />
              <InfoItem label="Student ID" value={u.studentId} />
              <InfoItem label="College" value={u.collegeName} />
              <InfoItem label="Branch" value={u.branch} />
              <InfoItem label="Year" value={u.yearOfStudy ? `Year ${u.yearOfStudy}` : '—'} />
              <InfoItem label="Gender" value={u.gender} />
              <InfoItem label="Joined" value={formatDate(u.createdAt)} />
              <InfoItem label="Last Login" value={u.lastLogin ? formatDate(u.lastLogin) : 'Never'} />
            </div>

            {u.bio && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">Bio</p>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{u.bio}</p>
              </div>
            )}

            {u.role !== 'admin' && (
              <div className="border-t pt-4 mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Change Role</p>
                <div className="flex gap-2">
                  {['student', 'contributor'].filter(r => r !== u.role).map(role => (
                    <button key={role} onClick={() => { handleUpdateUserRole(u._id, role); setSelectedUser(null); }} className="px-4 py-2 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition">
                      Set as {role.charAt(0).toUpperCase() + role.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-4 pt-4 border-t">
              <button onClick={() => setSelectedUser(null)} className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition">Close</button>
              {u.role !== 'admin' && (
                <button onClick={() => handleDeleteUser(u._id)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Delete User</button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ApplicationDetailModal = () => {
    const app = selectedApplication;
    if (!app) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div className="bg-white rounded-xl max-w-3xl w-full my-8">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{app.fullName}</h2>
                <p className="text-gray-500">{app.email}</p>
              </div>
              <button onClick={() => { setSelectedApplication(null); setAdminComments(''); }} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="mb-4">{getAppStatusBadge(app.status)}</div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <InfoItem label="Phone" value={app.phoneNumber} />
              <InfoItem label="Student ID" value={app.studentId} />
              <InfoItem label="College" value={app.collegeName} />
              <InfoItem label="Branch" value={app.branch} />
              <InfoItem label="Year" value={`Year ${app.yearOfStudy}`} />
              <InfoItem label="Submitted" value={formatDate(app.createdAt)} />
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Reason for Applying</p>
              <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg">{app.reasonForApplying}</p>
            </div>

            {app.experience && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Experience</p>
                <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg">{app.experience}</p>
              </div>
            )}

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Documents</p>
              <div className="flex gap-3">
                <a href={`http://localhost:5000/${app.collegeIdCard}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm transition">
                  📄 College ID Card
                </a>
                <a href={`http://localhost:5000/${app.authorityLetter}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm transition">
                  📄 Authority Letter
                </a>
              </div>
            </div>

            {app.reviewedAt && (
              <div className="mb-4 p-3 border rounded-lg bg-gray-50">
                <p className="text-sm text-gray-500">Reviewed on {formatDate(app.reviewedAt)}</p>
                {app.adminComments && <p className="text-sm mt-1"><strong>Comments:</strong> {app.adminComments}</p>}
                {app.rejectionReason && <p className="text-sm mt-1 text-red-700"><strong>Rejection Reason:</strong> {app.rejectionReason}</p>}
              </div>
            )}

            {app.status === 'pending' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Comments (Optional)</label>
                <textarea
                  value={adminComments}
                  onChange={(e) => setAdminComments(e.target.value)}
                  rows={3}
                  placeholder="Add comments for the applicant..."
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            )}

            {app.status === 'pending' ? (
              <div className="flex gap-3">
                <button onClick={() => handleApprove(app._id)} className="flex-1 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition">
                  Approve
                </button>
                <button onClick={() => setShowRejectModal(app._id)} className="flex-1 px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition">
                  Reject
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button onClick={() => { setSelectedApplication(null); setAdminComments(''); }} className="flex-1 px-6 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition">Close</button>
                <button onClick={() => handleDeleteApplication(app._id)} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Delete</button>
              </div>
            )}
          </div>
        </div>

        {showRejectModal === app._id && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[60]">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Rejection Reason</h3>
              <p className="text-sm text-gray-500 mb-4">This will be shown to the applicant.</p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                placeholder="Explain why this application is being rejected..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-4"
              />
              <div className="flex gap-3">
                <button onClick={() => { setShowRejectModal(null); setRejectionReason(''); }} className="flex-1 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition">Cancel</button>
                <button onClick={() => handleReject(app._id)} className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Confirm Reject</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ═══════════════════════════════════════
  //  MAIN RENDER
  // ═══════════════════════════════════════
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        {/* Header + Tabs */}
        <div className="bg-white border-b sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Manage users, content, and contributor applications</p>
              </div>
              <button
                onClick={() => {
                  loadDashboard();
                  if (activeTab === 'users') loadUsers();
                  if (activeTab === 'applications') loadApplications();
                  if (activeTab === 'events') loadEvents();
                  if (activeTab === 'posts') loadPosts();
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm flex items-center gap-2 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Refresh
              </button>
            </div>

            <div className="flex gap-1 mt-4 -mb-px overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-1.5">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          {isLoading && activeTab === 'overview' && !stats ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : error && !stats ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-800">{error}</div>
          ) : (
            <>
              {activeTab === 'overview' && <OverviewTab />}
              {activeTab === 'users' && <UsersTab />}
              {activeTab === 'applications' && <ApplicationsTab />}
              {activeTab === 'events' && <EventsTab />}
              {activeTab === 'posts' && <PostsTab />}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <UserDetailModal />
      <ApplicationDetailModal />

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[70] px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium animate-bounce-in ${
          toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'
        }`}>
          {toast.message}
        </div>
      )}
    </>
  );
}

// ─── Shared UI Components ───

function StatCard({ title, value, icon, color, sub, onClick }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    red: 'bg-red-50 text-red-600 border-red-100',
  };
  return (
    <div className={`bg-white rounded-xl shadow-sm border p-5 ${onClick ? 'cursor-pointer hover:shadow-md' : ''} transition`} onClick={onClick}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${colors[color]}`}>{icon}</div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{title}</p>
        </div>
      </div>
      {sub && <p className="text-xs text-gray-400 mt-2">{sub}</p>}
    </div>
  );
}

function BarItem({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">{count} ({pct}%)</span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-2 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }}></div>
      </div>
    </div>
  );
}

function AlertRow({ icon, text, action, onClick }) {
  return (
    <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-100 rounded-lg">
      <div className="flex items-center gap-3">
        <span className="text-lg">{icon}</span>
        <p className="text-sm text-gray-800">{text}</p>
      </div>
      <button onClick={onClick} className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition">{action}</button>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-medium text-gray-800">{value || '—'}</p>
    </div>
  );
}
