import React from 'react';

const EventFilters = ({ filters, onFilterChange, onClearFilters }) => {
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'workshop', label: '🎓 Workshop' },
    { value: 'seminar', label: '📊 Seminar' },
    { value: 'hackathon', label: '💻 Hackathon' },
    { value: 'competition', label: '🏆 Competition' },
    { value: 'cultural', label: '🎭 Cultural' },
    { value: 'sports', label: '⚽ Sports' },
    { value: 'fest', label: '🎉 Fest' },
    { value: 'webinar', label: '🎤 Webinar' },
    { value: 'other', label: '📅 Other' },
  ];

  const modes = [
    { value: 'all', label: 'All Modes' },
    { value: 'online', label: '🌐 Online' },
    { value: 'offline', label: '📍 Offline' },
  ];

  const scopes = [
    { value: 'all', label: 'All Campuses' },
    { value: 'campus', label: 'My Campus' },
    { value: 'global', label: 'Global Events' },
  ];

  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = () => {
    return (
      filters.category !== 'all' ||
      filters.mode !== 'all' ||
      filters.scope !== 'all'
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
        </h3>
        {hasActiveFilters() && (
          <button
            onClick={onClearFilters}
            className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={filters.category || 'all'}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Mode Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Mode
          </label>
          <select
            value={filters.mode || 'all'}
            onChange={(e) => handleChange('mode', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {modes.map((mode) => (
              <option key={mode.value} value={mode.value}>
                {mode.label}
              </option>
            ))}
          </select>
        </div>

        {/* Scope Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Visibility
          </label>
          <select
            value={filters.scope || 'all'}
            onChange={(e) => handleChange('scope', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {scopes.map((scope) => (
              <option key={scope.value} value={scope.value}>
                {scope.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters() && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-600">Active filters:</span>
          {filters.category !== 'all' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
              {categories.find(c => c.value === filters.category)?.label}
              <button
                onClick={() => handleChange('category', 'all')}
                className="ml-2 hover:text-blue-900"
              >
                ×
              </button>
            </span>
          )}
          {filters.mode !== 'all' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
              {modes.find(m => m.value === filters.mode)?.label}
              <button
                onClick={() => handleChange('mode', 'all')}
                className="ml-2 hover:text-green-900"
              >
                ×
              </button>
            </span>
          )}
          {filters.scope !== 'all' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-700">
              {scopes.find(s => s.value === filters.scope)?.label}
              <button
                onClick={() => handleChange('scope', 'all')}
                className="ml-2 hover:text-purple-900"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default EventFilters;
