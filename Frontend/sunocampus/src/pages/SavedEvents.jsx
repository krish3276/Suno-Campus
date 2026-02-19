import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { eventsAPI } from '../services/api';

export default function SavedEvents() {
  const navigate = useNavigate();
  const [savedEvents, setSavedEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSavedEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [searchQuery, savedEvents]);

  const fetchSavedEvents = async () => {
    try {
      setIsLoading(true);
      const response = await eventsAPI.getSavedEvents();
      if (response.success) {
        setSavedEvents(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching saved events:', err);
      setError(err.message);
      // Use mock data for demo
      setSavedEvents(getMockSavedEvents());
    } finally {
      setIsLoading(false);
    }
  };

  const filterEvents = () => {
    if (!searchQuery.trim()) {
      setFilteredEvents(savedEvents);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = savedEvents.filter(event =>
      event.title.toLowerCase().includes(query) ||
      event.collegeName.toLowerCase().includes(query) ||
      event.eventType.toLowerCase().includes(query)
    );
    setFilteredEvents(filtered);
  };

  const handleRemove = async (eventId) => {
    if (!confirm('Remove this event from your saved list?')) return;

    try {
      await eventsAPI.unsaveEvent(eventId);
      setSavedEvents(savedEvents.filter(event => event._id !== eventId));
      alert('Event removed from saved list');
    } catch (err) {
      alert('Failed to remove event');
    }
  };

  const handleEnroll = async (eventId) => {
    try {
      await eventsAPI.registerForEvent(eventId);
      alert('Successfully enrolled in event!');
      fetchSavedEvents(); // Refresh to update status
    } catch (err) {
      alert(err.message || 'Failed to enroll in event');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysUntilDeadline = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDeadlineWarning = (event) => {
    const daysLeft = getDaysUntilDeadline(event.registrationDeadline);
    
    if (daysLeft < 0) {
      return {
        text: 'Registration closed',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-700',
        borderColor: 'border-l-gray-400',
        icon: '🔒',
      };
    } else if (daysLeft <= 2) {
      return {
        text: `Only ${daysLeft} day${daysLeft === 1 ? '' : 's'} left!`,
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        borderColor: 'border-l-red-400',
        icon: '⚠️',
      };
    } else if (daysLeft <= 5) {
      return {
        text: `Registration closes in ${daysLeft} days`,
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-700',
        borderColor: 'border-l-yellow-400',
        icon: '⏰',
      };
    } else {
      return {
        text: `${daysLeft} days left to register`,
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        borderColor: 'border-l-green-400',
        icon: '✓',
      };
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      workshop: 'bg-red-500 text-white',
      seminar: 'bg-indigo-500 text-white',
      hackathon: 'bg-red-500 text-white',
      competition: 'bg-red-500 text-white',
      cultural: 'bg-pink-500 text-white',
      sports: 'bg-yellow-500 text-white',
      fest: 'bg-teal-500 text-white',
      webinar: 'bg-cyan-500 text-white',
      other: 'bg-gray-500 text-white',
    };
    return colors[category] || colors.other;
  };

  const getGradient = (title) => {
    const gradients = [
      'from-blue-400 via-purple-400 to-red-400',
      'from-pink-400 via-orange-300 to-yellow-300',
      'from-cyan-400 via-blue-400 to-indigo-500',
    ];
    const idx = title.length % gradients.length;
    return gradients[idx];
  };

  const getMockSavedEvents = () => {
    return [
      {
        _id: '1',
        title: 'AI/ML Workshop',
        collegeName: 'NIT Trichy',
        eventType: 'workshop',
        startDate: new Date('2026-03-20'),
        registrationDeadline: new Date('2026-02-19'),
        eventImage: null,
      },
      {
        _id: '2',
        title: 'Photography Contest',
        collegeName: 'Delhi University',
        eventType: 'competition',
        startDate: new Date('2026-03-25'),
        registrationDeadline: new Date('2026-02-24'),
        eventImage: null,
      },
      {
        _id: '3',
        title: 'Startup Pitch Competition',
        collegeName: 'IIM Ahmedabad',
        eventType: 'competition',
        startDate: new Date('2026-04-05'),
        registrationDeadline: new Date('2026-02-16'),
        eventImage: null,
      },
    ];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-wide">SAVED EVENTS</h1>
            <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              WISHLIST
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search saved events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Your Saved Events</h2>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
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

        {/* Empty State */}
        {!isLoading && filteredEvents.length === 0 && (
          <div className="text-center py-16">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Saved Events</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery ? 'No events match your search' : 'Start saving events to see them here'}
            </p>
            <button
              onClick={() => navigate('/events')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Explore Events
            </button>
          </div>
        )}

        {/* Events Grid */}
        {!isLoading && filteredEvents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const warning = getDeadlineWarning(event);
              const isDeadlinePassed = getDaysUntilDeadline(event.registrationDeadline) < 0;

              return (
                <div key={event._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden border border-gray-200">
                  {/* Event Image/Banner */}
                  <div className={`h-48 bg-gradient-to-br ${getGradient(event.title)} flex items-center justify-center`}>
                    {event.eventImage ? (
                      <img
                        src={event.eventImage}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-white text-center">
                        <span className="text-5xl opacity-75">[EVENT IMAGE]</span>
                      </div>
                    )}
                  </div>

                  {/* Event Details */}
                  <div className="p-5">
                    {/* Title */}
                    <h3 className="text-xl font-bold text-red-500 mb-2">{event.title}</h3>

                    {/* College Name */}
                    <p className="text-gray-700 mb-3">{event.collegeName}</p>

                    {/* Category and Date */}
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${getCategoryColor(event.eventType)}`}>
                        {event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)}
                      </span>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-1 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        {formatDate(event.startDate)}
                      </div>
                    </div>

                    {/* Deadline Warning */}
                    <div className={`${warning.bgColor} ${warning.textColor} border-l-4 ${warning.borderColor} p-3 rounded mb-4`}>
                      <p className="text-sm font-medium flex items-center">
                        <span className="mr-2">{warning.icon}</span>
                        {warning.text}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEnroll(event._id)}
                        disabled={isDeadlinePassed}
                        className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                          isDeadlinePassed
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                      >
                        {isDeadlinePassed ? 'Registration Closed' : 'Enroll Now'}
                      </button>
                      <button
                        onClick={() => handleRemove(event._id)}
                        className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
