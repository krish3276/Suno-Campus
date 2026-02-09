import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EventCard = ({ event, onSave }) => {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(event.isSaved || false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e) => {
    e.stopPropagation();
    if (isSaving) return;

    setIsSaving(true);
    const newSavedState = !isSaved;
    setIsSaved(newSavedState);

    try {
      if (onSave) {
        await onSave(event._id, newSavedState);
      }
    } catch (error) {
      setIsSaved(!newSavedState); // Revert on error
    } finally {
      setIsSaving(false);
    }
  };

  const handleCardClick = () => {
    navigate(`/events/${event._id}`);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ongoing':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'upcoming':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'completed':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      workshop: 'bg-purple-100 text-purple-700',
      seminar: 'bg-indigo-100 text-indigo-700',
      hackathon: 'bg-red-100 text-red-700',
      competition: 'bg-orange-100 text-orange-700',
      cultural: 'bg-pink-100 text-pink-700',
      sports: 'bg-yellow-100 text-yellow-700',
      fest: 'bg-teal-100 text-teal-700',
      webinar: 'bg-cyan-100 text-cyan-700',
      other: 'bg-gray-100 text-gray-700',
    };
    return colors[category] || colors.other;
  };

  const getGradient = (index) => {
    const gradients = [
      'from-blue-500 to-purple-600',
      'from-pink-500 to-rose-600',
      'from-green-500 to-teal-600',
      'from-orange-500 to-red-600',
      'from-indigo-500 to-blue-600',
      'from-purple-500 to-pink-600',
    ];
    const idx = event.title.length % gradients.length;
    return gradients[idx];
  };

  const enrollmentPercentage = event.maxParticipants
    ? (event.currentParticipants / event.maxParticipants) * 100
    : 0;

  return (
    <div
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group"
      onClick={handleCardClick}
    >
      {/* Event Banner */}
      <div className={`h-48 bg-gradient-to-br ${getGradient()} flex items-center justify-center relative overflow-hidden`}>
        {event.eventImage ? (
          <img
            src={event.eventImage}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-white text-center p-6">
            <div className="text-6xl mb-2">
              {event.eventType === 'workshop' && '🎓'}
              {event.eventType === 'seminar' && '📊'}
              {event.eventType === 'hackathon' && '💻'}
              {event.eventType === 'competition' && '🏆'}
              {event.eventType === 'cultural' && '🎭'}
              {event.eventType === 'sports' && '⚽'}
              {event.eventType === 'fest' && '🎉'}
              {event.eventType === 'webinar' && '🎤'}
              {!['workshop', 'seminar', 'hackathon', 'competition', 'cultural', 'sports', 'fest', 'webinar'].includes(event.eventType) && '📅'}
            </div>
          </div>
        )}
        
        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="absolute top-3 right-3 bg-white bg-opacity-90 backdrop-blur-sm p-2 rounded-full hover:bg-opacity-100 transition-all transform hover:scale-110"
        >
          {isSaved ? (
            <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )}
        </button>

        {/* Status Badge */}
        <div className={`absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(event.status)}`}>
          {event.status === 'ongoing' && '🔴 Ongoing'}
          {event.status === 'upcoming' && '🟢 Upcoming'}
          {event.status === 'completed' && '⚫ Completed'}
        </div>
      </div>

      {/* Event Details */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {event.title}
        </h3>

        {/* College Name */}
        <p className="text-sm text-gray-600 mb-3 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
          </svg>
          {event.collegeName}
        </p>

        {/* Category Badge */}
        <div className="mb-3">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(event.eventType)}`}>
            {event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)}
          </span>
        </div>

        {/* Date & Time */}
        <div className="flex items-center text-sm text-gray-700 mb-2">
          <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{formatDate(event.startDate)} • {formatTime(event.startDate)}</span>
        </div>

        {/* Location */}
        <div className="flex items-center text-sm text-gray-700 mb-4">
          {event.isOnline ? (
            <>
              <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <span>Online Event</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="line-clamp-1">{event.venue}</span>
            </>
          )}
        </div>

        {/* Enrollment Progress */}
        {event.maxParticipants && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">
                {event.currentParticipants}/{event.maxParticipants} enrolled
              </span>
              <span className={`font-semibold ${event.isFull ? 'text-red-600' : 'text-green-600'}`}>
                {event.isFull ? 'Full' : `${Math.round(enrollmentPercentage)}%`}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  enrollmentPercentage >= 90 ? 'bg-red-500' :
                  enrollmentPercentage >= 70 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(enrollmentPercentage, 100)}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
