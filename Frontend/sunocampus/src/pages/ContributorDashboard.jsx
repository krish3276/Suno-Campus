import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Contributor Dashboard</h1>
              <p className="mt-2 text-blue-100">
                Welcome back, {user?.name || 'Contributor'}! 👋
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

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
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
                          name: user?.name,
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
