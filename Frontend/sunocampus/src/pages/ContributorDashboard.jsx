import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CreatePostModal from '../components/CreatePostModal';
import CreateEventModal from '../components/CreateEventModal';
import PostCard from '../components/PostCard';
import EventCard from '../components/EventCard';
import { postsAPI, eventsAPI, profileAPI } from '../services/api';

const ContributorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, posts, events
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  
  // Stats
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalEvents: 0,
    totalLikes: 0,
    totalRegistrations: 0,
  });

  // My content
  const [myPosts, setMyPosts] = useState([]);
  const [myEvents, setMyEvents] = useState([]);

  useEffect(() => {
    fetchUserData();
    fetchMyContent();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await profileAPI.getProfile();
      if (response.success) {
        const userData = response.data;
        
        // Check if user is contributor or admin
        if (userData.role !== 'contributor' && userData.role !== 'admin') {
          alert('Access denied. This page is only for contributors and admins.');
          navigate('/');
          return;
        }
        
        setUser(userData);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      if (error.message.includes('token') || error.message.includes('auth')) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMyContent = async () => {
    try {
      // TODO: Replace with actual API calls when backend is ready
      // For now using mock data
      
      // Mock posts
      setMyPosts([
        {
          id: 1,
          content: 'Just organized an amazing AI workshop! 🚀',
          visibility: 'campus',
          likesCount: 45,
          commentsCount: 12,
          createdAt: '2026-02-10T10:00:00Z',
        },
        {
          id: 2,
          content: 'Excited to announce our upcoming hackathon! Register now 💻',
          visibility: 'global',
          likesCount: 89,
          commentsCount: 23,
          createdAt: '2026-02-08T15:30:00Z',
        },
      ]);

      // Mock events
      setMyEvents([
        {
          id: 1,
          title: 'AI & Machine Learning Workshop',
          category: 'Workshop',
          eventType: 'Hybrid',
          eventDate: '2026-02-20T00:00:00Z',
          registeredCount: 45,
          maxParticipants: 100,
        },
        {
          id: 2,
          title: 'Annual Tech Hackathon 2026',
          category: 'Competition',
          eventType: 'Offline',
          eventDate: '2026-03-05T00:00:00Z',
          registeredCount: 150,
          maxParticipants: 200,
        },
      ]);

      // Calculate stats
      setStats({
        totalPosts: 2,
        totalEvents: 2,
        totalLikes: 134,
        totalRegistrations: 195,
      });
    } catch (error) {
      console.error('Error fetching content:', error);
    }
  };

  const handleCreatePost = async (postData) => {
    try {
      // TODO: Implement actual API call when backend is ready
      console.log('Creating post:', postData);
      
      // Mock success
      alert('Post created successfully!');
      fetchMyContent(); // Refresh content
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  };

  const handleCreateEvent = async (eventData) => {
    try {
      const response = await eventsAPI.createEvent(eventData);
      
      if (response.success) {
        alert('Event created successfully!');
        setIsCreateEventModalOpen(false);
        fetchMyContent(); // Refresh content
      }
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Contributor Dashboard</h1>
              <p className="mt-2 text-blue-100">
                Welcome back, {user?.fullName || 'Contributor'}! 👋
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsCreatePostModalOpen(true)}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center gap-2"
              >
                <span className="text-lg">📝</span>
                Create Post
              </button>
              <button
                onClick={() => setIsCreateEventModalOpen(true)}
                className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors flex items-center gap-2"
              >
                <span className="text-lg">📅</span>
                Create Event
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contributor Profile Card */}
      {user && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.fullName}
                    className="w-20 h-20 rounded-full object-cover border-4 border-purple-200"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-purple-200">
                    {user.fullName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-xl font-bold text-gray-900">{user.fullName}</h2>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                    ✦ Contributor
                  </span>
                </div>
                <p className="text-gray-500 text-sm mt-1">{user.email}</p>

                <div className="flex flex-wrap items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="font-medium">{user.collegeName}</span>
                  </div>
                  {user.branch && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span>{user.branch}</span>
                    </div>
                  )}
                  {user.yearOfStudy && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Year {user.yearOfStudy}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-medium">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Official Campus Contributor
                  </div>
                  <div className="text-xs text-gray-400">Only 1 contributor per college</div>
                </div>
              </div>

              {/* Quick Profile Link */}
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Posts</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalPosts}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <span className="text-3xl">📝</span>
              </div>
            </div>
            <p className="text-sm text-green-600 mt-4">↑ Content shared</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Events</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalEvents}</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <span className="text-3xl">📅</span>
              </div>
            </div>
            <p className="text-sm text-green-600 mt-4">↑ Events organized</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Likes</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalLikes}</p>
              </div>
              <div className="bg-pink-100 rounded-full p-3">
                <span className="text-3xl">❤️</span>
              </div>
            </div>
            <p className="text-sm text-green-600 mt-4">↑ Engagement</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Registrations</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalRegistrations}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <span className="text-3xl">✅</span>
              </div>
            </div>
            <p className="text-sm text-green-600 mt-4">↑ Event participation</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white rounded-xl shadow-md">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('posts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'posts'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Posts ({stats.totalPosts})
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'events'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Events ({stats.totalEvents})
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => setIsCreatePostModalOpen(true)}
                      className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-100 group-hover:bg-blue-200 rounded-full p-4">
                          <span className="text-3xl">📝</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">Create New Post</h4>
                          <p className="text-sm text-gray-500">Share updates with your campus community</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setIsCreateEventModalOpen(true)}
                      className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-left group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-purple-100 group-hover:bg-purple-200 rounded-full p-4">
                          <span className="text-3xl">📅</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">Create New Event</h4>
                          <p className="text-sm text-gray-500">Organize workshops, seminars, and more</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h3>
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <p className="text-gray-500">Your recent posts and events will appear here</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'posts' && (
              <div className="space-y-4">
                {myPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-6xl">📝</span>
                    <p className="mt-4 text-gray-500 text-lg">No posts yet</p>
                    <button
                      onClick={() => setIsCreatePostModalOpen(true)}
                      className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create Your First Post
                    </button>
                  </div>
                ) : (
                  myPosts.map(post => (
                    <PostCard
                      key={post.id}
                      post={{
                        ...post,
                        author: {
                          name: user?.fullName,
                          college: user?.collegeName,
                          role: user?.role,
                          avatar: user?.avatar,
                        },
                      }}
                    />
                  ))
                )}
              </div>
            )}

            {activeTab === 'events' && (
              <div className="space-y-4">
                {myEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-6xl">📅</span>
                    <p className="mt-4 text-gray-500 text-lg">No events yet</p>
                    <button
                      onClick={() => setIsCreateEventModalOpen(true)}
                      className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Create Your First Event
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {myEvents.map(event => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
        onSubmit={handleCreatePost}
      />

      <CreateEventModal
        isOpen={isCreateEventModalOpen}
        onClose={() => setIsCreateEventModalOpen(false)}
        onSubmit={handleCreateEvent}
      />
    </div>
  );
};

export default ContributorDashboard;
