import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import EventCard from '../components/EventCard';
import EventFilters from '../components/EventFilters';
import { eventsAPI } from '../services/api';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [trendingEvents, setTrendingEvents] = useState([]);
  const [stats, setStats] = useState({ totalEvents: 0, eventsToday: 0, upcomingEvents: 0 });
  const [filters, setFilters] = useState({
    category: 'all',
    mode: 'all',
    scope: 'all',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('starting-soon');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch events
  useEffect(() => {
    fetchEvents();
  }, [filters, searchQuery, sortBy, currentPage]);

  // Fetch trending events and stats on mount
  useEffect(() => {
    fetchTrendingEvents();
    fetchStats();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await eventsAPI.getEvents({
        ...filters,
        search: searchQuery,
        sort: sortBy,
        page: currentPage,
        limit: 9,
      });

      if (response.success) {
        setEvents(response.data || []);
        setTotalPages(response.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.message || 'Failed to load events');
      // Use mock data for demo
      setEvents(getMockEvents());
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTrendingEvents = async () => {
    try {
      const response = await eventsAPI.getTrendingEvents();
      if (response.success) {
        setTrendingEvents(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching trending events:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await eventsAPI.getEventStats();
      if (response.success) {
        setStats(response.data || { totalEvents: 0, eventsToday: 0, upcomingEvents: 0 });
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page
  };

  const handleClearFilters = () => {
    setFilters({
      category: 'all',
      mode: 'all',
      scope: 'all',
    });
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleSaveEvent = async (eventId, isSaved) => {
    // TODO: Implement save/unsave event API
    console.log(`Event ${eventId} ${isSaved ? 'saved' : 'unsaved'}`);
  };

  const getMockEvents = () => {
    return [
      {
        _id: '1',
        title: 'Annual Hackathon 2026',
        description: 'Join the biggest coding event of the year',
        collegeName: 'IIT Bombay',
        eventType: 'hackathon',
        status: 'upcoming',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
        venue: 'Main Auditorium',
        isOnline: false,
        currentParticipants: 450,
        maxParticipants: 500,
        visibility: 'global',
      },
      {
        _id: '2',
        title: 'Cultural Fest 2026',
        description: 'Celebrate diversity and culture',
        collegeName: 'VIT Vellore',
        eventType: 'cultural',
        status: 'ongoing',
        startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        venue: 'Campus Grounds',
        isOnline: false,
        currentParticipants: 1200,
        maxParticipants: null,
        visibility: 'global',
      },
      {
        _id: '3',
        title: 'AI/ML Workshop',
        description: 'Learn cutting-edge machine learning techniques',
        collegeName: 'NIT Trichy',
        eventType: 'workshop',
        status: 'upcoming',
        startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        venue: 'Online',
        isOnline: true,
        currentParticipants: 85,
        maxParticipants: 100,
        visibility: 'global',
      },
      {
        _id: '4',
        title: 'Inter-College Sports Meet',
        description: 'Compete in various sports disciplines',
        collegeName: 'Delhi University',
        eventType: 'sports',
        status: 'upcoming',
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
        venue: 'Sports Complex',
        isOnline: false,
        currentParticipants: 300,
        maxParticipants: 500,
        visibility: 'global',
      },
      {
        _id: '5',
        title: 'Startup Pitch Competition',
        description: 'Present your startup idea to investors',
        collegeName: 'IIM Ahmedabad',
        eventType: 'competition',
        status: 'upcoming',
        startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        venue: 'Auditorium',
        isOnline: false,
        currentParticipants: 45,
        maxParticipants: 50,
        visibility: 'global',
      },
      {
        _id: '6',
        title: 'Tech Seminar: Future of Web3',
        description: 'Explore blockchain and decentralized technologies',
        collegeName: 'BITS Pilani',
        eventType: 'seminar',
        status: 'upcoming',
        startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        venue: 'Online',
        isOnline: true,
        currentParticipants: 200,
        maxParticipants: 300,
        visibility: 'global',
      },
    ];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Campus Events</h1>
          <p className="text-gray-600">Discover and participate in exciting events happening across campuses</p>
        </div>

        {/* Search and Sort Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search events by title, college, or tags..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg
                  className="absolute left-4 top-3.5 w-5 h-5 text-gray-400"
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

            {/* Sort Dropdown */}
            <div className="md:w-64">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="starting-soon">🔜 Starting Soon</option>
                <option value="newest">🆕 Newest First</option>
                <option value="popular">🔥 Most Popular</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filters */}
        <EventFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content - Event Grid */}
          <div className="lg:col-span-3">
            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-300"></div>
                    <div className="p-5">
                      <div className="h-6 bg-gray-300 rounded mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <svg className="w-16 h-16 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-yellow-800 text-lg font-semibold">Using Demo Data</p>
                <p className="text-yellow-600 mt-2">Backend not connected. Showing sample events.</p>
              </div>
            )}

            {/* Events Grid */}
            {!isLoading && events.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <EventCard key={event._id} event={event} onSave={handleSaveEvent} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`px-4 py-2 rounded-lg ${
                          currentPage === index + 1
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Empty State */}
            {!isLoading && events.length === 0 && (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Events Found</h3>
                <p className="text-gray-500 mb-6">
                  Try adjusting your filters or search query to find events
                </p>
                <button
                  onClick={handleClearFilters}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-gray-700">Total Events</span>
                  <span className="text-2xl font-bold text-blue-600">{stats.totalEvents || events.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm text-gray-700">Today</span>
                  <span className="text-2xl font-bold text-green-600">{stats.eventsToday || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm text-gray-700">Upcoming</span>
                  <span className="text-2xl font-bold text-purple-600">{stats.upcomingEvents || events.filter(e => e.status === 'upcoming').length}</span>
                </div>
              </div>
            </div>

            {/* Trending Events */}
            {trendingEvents.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                  </svg>
                  Trending Events
                </h3>
                <div className="space-y-3">
                  {trendingEvents.slice(0, 5).map((event) => (
                    <div key={event._id} className="border-l-4 border-red-500 pl-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors">
                      <h4 className="font-semibold text-sm text-gray-800 line-clamp-1">{event.title}</h4>
                      <p className="text-xs text-gray-600">{event.collegeName}</p>
                      <p className="text-xs text-blue-600 mt-1">{event.currentParticipants} enrolled</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Deadlines */}
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Upcoming Deadlines
              </h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p>⚠️ Stay tuned for registration deadlines!</p>
                <p className="text-xs text-gray-600">We'll notify you when events are about to close registration.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
