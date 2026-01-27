import React, { useState, useEffect } from 'react';
import Navbar from "../components/Navbar";
import PostCard from "../components/PostCard";
import CreatePostModal from "../components/CreatePostModal";
import { postsAPI } from "../services/api";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [scope, setScope] = useState('campus'); // 'campus' or 'global'
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);

  // Mock user data - Replace with actual auth context/API call
  useEffect(() => {
    // Simulating user data - in real app, get from auth context or localStorage
    const mockUser = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      college: 'MIT',
      role: 'Contributor', // Can be: 'Student', 'Contributor', 'Admin'
    };
    setCurrentUser(mockUser);
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
      console.error('Failed to fetch posts:', error);
      
      // Fallback to mock data for development
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
      console.error('Failed to create post:', error);
      
      // Fallback: Add to local state with mock data
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
      console.error('Failed to like post:', error);
      throw error; // Let PostCard handle the error
    }
  };

  const handleCommentClick = (post) => {
    // For now, just show an alert - can be replaced with comment modal
    alert(`Comments feature coming soon!\nPost: ${post.content.substring(0, 50)}...`);
  };

  const canCreatePost = currentUser && ['Contributor', 'Admin'].includes(currentUser.role);

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SunoCampus
              </span>
            </h1>

            {/* Error Message */}
            {/* {error && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-lg mb-4 text-sm">
                ℹ️ {error}
              </div>
            )} */}

            {/* Controls Row */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              {/* Toggle Switch */}
              <div className="flex items-center gap-3 bg-gray-100 rounded-full p-1">
                <button
                  onClick={() => setScope('campus')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    scope === 'campus'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  🏫 Only My Campus
                </button>
                <button
                  onClick={() => setScope('global')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    scope === 'global'
                      ? 'bg-white text-green-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  🌍 All Campuses
                </button>
              </div>

              {/* Search Input */}
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder="Search posts or colleges..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Create Post Button */}
            {canCreatePost && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-4 w-full md:w-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Post
              </button>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-500">Loading posts...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredPosts.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <svg
                className="w-20 h-20 mx-auto mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No posts found</h3>
              <p className="text-gray-500">
                {searchQuery
                  ? 'Try adjusting your search terms'
                  : scope === 'campus'
                  ? 'Be the first to post in your campus!'
                  : 'No posts available yet'}
              </p>
            </div>
          )}

          {/* Posts Feed */}
          {!isLoading && filteredPosts.length > 0 && (
            <div>
              {filteredPosts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onLike={handleLikePost}
                  onComment={handleCommentClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePost}
      />
    </>
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
    },
    visibility: scope === 'campus' ? 'campus' : i % 2 === 0 ? 'global' : 'campus',
    // image: i % 3 === 0 ? `https://picsum.photos/600/400?random=${i}` : null,
    likes: Math.floor(Math.random() * 50),
    comments: Math.floor(Math.random() * 20),
    createdAt: new Date(Date.now() - i * 3600000).toISOString(),
    isLikedByCurrentUser: i % 4 === 0,
  }));
}
