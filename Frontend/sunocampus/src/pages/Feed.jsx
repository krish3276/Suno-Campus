import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PostCard from "../components/PostCard";
import CreatePostModal from "../components/CreatePostModal";
import { postsAPI, eventsAPI } from "../services/api";

export default function Feed() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [scope, setScope] = useState('campus'); // 'campus' or 'global'
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [trendingEvents, setTrendingEvents] = useState([
    {
      title: 'Hackathon 2026',
      date: 'Tomorrow',
      location: 'IIT Delhi',
      enrolled: '500'
    },
    {
      title: 'Cultural Fest',
      date: 'in 3 days',
      location: 'VIT Chennai',
      enrolled: '1200'
    }
  ]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([
    {
      title: 'Tech Workshop',
      deadline: 'Registration closes in 6 hours'
    },
    {
      title: 'Sports Meet',
      deadline: 'Registration closes today!'
    }
  ]);
  const [error, setError] = useState(null);

  console.log('[Feed] Component rendered - Posts:', posts.length, 'Loading:', isLoading);

  // Get user from auth context
  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const userData = JSON.parse(stored);
        setCurrentUser(userData);
      }
    } catch {
      setCurrentUser(null);
    }
  }, []);

  // Fetch trending events and deadlines on mount
  useEffect(() => {
    fetchTrendingEvents();
    fetchUpcomingDeadlines();
  }, []);

  // Fetch posts when scope changes
  useEffect(() => {
    fetchPosts();
  }, [scope]);

  // Filter posts when search query changes
  useEffect(() => {
    filterPosts();
  }, [searchQuery, posts]);

  const fetchPosts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Try to fetch from API
      const data = await postsAPI.getPosts(scope);
      setPosts(data.posts || data);
      setFilteredPosts(data.posts || data);
    } catch (error) {
      const mockPosts = generateMockPosts(scope);
      setPosts(mockPosts);
      setFilteredPosts(mockPosts);
      setError('Using demo data - Backend not connected');
    } finally {
      setIsLoading(false);
    }
  };

  const filterPosts = () => {
    if (!searchQuery.trim()) {
      setFilteredPosts(posts);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = posts.filter(post => 
      post.content.toLowerCase().includes(query) ||
      post.author?.name?.toLowerCase().includes(query) ||
      post.author?.college?.toLowerCase().includes(query)
    );
    setFilteredPosts(filtered);
  };

  const fetchTrendingEvents = async () => {
    try {
      const response = await eventsAPI.getTrendingEvents();
      if (response.success) {
        setTrendingEvents(response.data || []);
      }
    } catch (err) {
      // Use mock data for demo
      setTrendingEvents(getMockTrendingEvents());
    }
  };

  const fetchUpcomingDeadlines = async () => {
    try {
      const response = await eventsAPI.getUpcomingDeadlines();
      if (response.success) {
        setUpcomingDeadlines(response.data || []);
      }
    } catch (err) {
      // Use mock data for demo
      setUpcomingDeadlines(getMockUpcomingDeadlines());
    }
  };

  const handleCreatePost = async (postData) => {
    try {
      // If image exists, upload it first
      let imageUrl = null;
      if (postData.image) {
        const uploadResponse = await postsAPI.uploadImage(postData.image);
        imageUrl = uploadResponse.url;
      }

      // Create post
      const newPost = await postsAPI.createPost({
        content: postData.content,
        visibility: postData.visibility,
        image: imageUrl,
      });

      // Add to local state
      setPosts([newPost, ...posts]);
      
      // Show success message
      alert('Post created successfully!');
    } catch (error) {
      const mockPost = {
        _id: Date.now().toString(),
        content: postData.content,
        visibility: postData.visibility,
        image: postData.image ? URL.createObjectURL(postData.image) : null,
        author: {
          name: currentUser?.name || 'You',
          college: currentUser?.college || 'Your College',
        },
        likes: 0,
        comments: 0,
        createdAt: new Date().toISOString(),
        isLikedByCurrentUser: false,
      };
      setPosts([mockPost, ...posts]);
      alert('Post created (demo mode)!');
    }
  };

  const handleLikePost = async (postId, shouldLike) => {
    try {
      if (shouldLike) {
        await postsAPI.likePost(postId);
      } else {
        await postsAPI.unlikePost(postId);
      }
    } catch (error) {
      throw error;
    }
  };

  const handleCommentClick = (post) => {
    // For now, just show an alert - can be replaced with comment modal
    alert(`Comments feature coming soon!\nPost: ${post.content.substring(0, 50)}...`);
  };

  const handleReportPost = (postId) => {
    alert('Report functionality coming soon!');
  };

  const canCreatePost = currentUser && ['contributor', 'admin'].includes(currentUser.role?.toLowerCase());

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/30 to-white">
      {/* Shared Navbar */}
      <Navbar />

      {/* Search Bar */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search posts, events, colleges..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout - Three Column */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Navigation */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-4 sticky top-24 border border-gray-100">
              <nav className="space-y-2">
                <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium shadow-sm">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                  Home
                </Link>
                <Link to="/events" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 text-gray-700 font-medium transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Events
                </Link>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 text-gray-700 font-medium transition-colors text-left">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Saved Events
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 text-gray-700 font-medium transition-colors text-left">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  My Enrollments
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 text-gray-700 font-medium transition-colors text-left">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Student Spotlight
                </button>
                {canCreatePost && (
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium shadow-sm hover:from-blue-700 hover:to-purple-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Post
                  </button>
                )}
              </nav>
            </div>
          </div>

          {/* Main Content - Posts Feed */}
          <div className="lg:col-span-6">
            {/* Campus Toggle */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-4 border border-gray-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setScope('campus')}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                    scope === 'campus'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  My Campus
                </button>
                <button
                  onClick={() => setScope('global')}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                    scope === 'global'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All Campuses
                </button>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                <p className="text-gray-500">Loading posts...</p>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredPosts.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                <svg className="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No posts found</h3>
                <p className="text-gray-500">
                  {searchQuery
                    ? 'Try adjusting your search terms'
                    : scope === 'campus'
                    ? 'No posts in your campus yet'
                    : 'No posts available yet'}
                </p>
              </div>
            )}

            {/* Posts Feed */}
            {!isLoading && filteredPosts.length > 0 && (
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onLike={handleLikePost}
                    onComment={handleCommentClick}
                    onReport={handleReportPost}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar - Trending Events & Deadlines */}
          <div className="lg:col-span-3">
            <div className="sticky top-24 space-y-4">
              {/* Trending Events */}
              <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    TRENDING EVENTS
                  </div>
                </div>
                <div className="space-y-3">
                  {trendingEvents.map((event, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-3 hover:border-purple-400 hover:bg-purple-50/30 transition-colors cursor-pointer">
                      <h4 className="font-semibold text-gray-800 text-sm mb-1">{event.title}</h4>
                      <p className="text-xs text-gray-500 mb-2">{event.date} • {event.location}</p>
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-semibold px-2 py-1 rounded-full inline-block">
                        {event.enrolled} enrolled
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Deadlines */}
              <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    UPCOMING DEADLINES
                  </div>
                </div>
                <div className="space-y-3">
                  {upcomingDeadlines.map((deadline, idx) => (
                    <div key={idx} className="bg-blue-50/50 border border-blue-200 rounded-lg p-3">
                      <h4 className="font-semibold text-gray-800 text-sm mb-1">{deadline.title}</h4>
                      <p className="text-xs text-purple-600 font-medium">{deadline.deadline}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Modal - Only for Contributors/Admins */}
      {canCreatePost && (
        <CreatePostModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreatePost}
        />
      )}
    </div>
  );
}

// Mock data generator for development/demo
function generateMockPosts(scope) {
  const colleges = ['MIT', 'Stanford', 'Harvard', 'Berkeley', 'Princeton'];
  const names = ['Alice Johnson', 'Bob Smith', 'Carol White', 'David Brown', 'Eve Davis'];
  const contents = [
    'Just finished my final exams! Time to relax 🎉',
    'Looking for study partners for the upcoming Data Structures exam. Anyone interested?',
    'The new library is amazing! Perfect place for late-night study sessions.',
    'Reminder: Tech fest registration closes tomorrow. Don\'t miss out!',
    'Great seminar on AI and Machine Learning today. Learned so much!',
    'Campus cafeteria has new vegan options. Finally! 🌱',
    'Anyone going to the basketball game this weekend?',
    'Just published my first research paper! Dreams do come true 📚',
  ];

  return Array.from({ length: 8 }, (_, i) => ({
    _id: `mock-${i}`,
    content: contents[i % contents.length],
    author: {
      name: names[i % names.length],
      college: scope === 'campus' ? 'MIT' : colleges[i % colleges.length],
      verified: i % 3 === 0,
    },
    visibility: scope === 'campus' ? 'campus' : i % 2 === 0 ? 'global' : 'campus',
    likes: Math.floor(Math.random() * 50),
    comments: Math.floor(Math.random() * 20),
    createdAt: new Date(Date.now() - i * 3600000).toISOString(),
    isLikedByCurrentUser: i % 4 === 0,
  }));
}

function getMockTrendingEvents() {
  return [
    {
      title: 'Hackathon 2026',
      date: 'Tomorrow',
      location: 'IIT Delhi',
      enrolled: '500'
    },
    {
      title: 'Cultural Fest',
      date: 'in 3 days',
      location: 'VIT Chennai',
      enrolled: '1200'
    }
  ];
}

function getMockUpcomingDeadlines() {
  return [
    {
      title: 'Tech Workshop',
      deadline: 'Registration closes in 6 hours'
    },
    {
      title: 'Sports Meet',
      deadline: 'Registration closes today!'
    }
  ];
}
