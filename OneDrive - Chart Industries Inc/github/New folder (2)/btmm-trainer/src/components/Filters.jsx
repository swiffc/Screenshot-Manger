import React from 'react';
import { Search } from 'lucide-react';

export default function Filters({
  sessions,
  patternTypes,
  selectedDate,
  setSelectedDate,
  selectedSession,
  setSelectedSession,
  selectedPattern,
  setSelectedPattern,
  searchInput,
  setSearchInput,
  sortBy,
  setSortBy,
  sortDir,
  setSortDir,
  onClearFilters,
  searchInputRef,
}) {
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-yellow-500/30">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        <div>
          <label className="block text-sm font-medium text-yellow-400 mb-2">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-yellow-400" />
            <input
              type="text"
              placeholder="Search trades..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              ref={searchInputRef}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-yellow-500/30 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-400 placeholder-gray-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-yellow-400 mb-2">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-yellow-500/30 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-yellow-400 mb-2">Session</label>
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-yellow-500/30 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-400"
          >
            <option value="" className="bg-gray-800 text-white">All Sessions</option>
            {sessions.map((session) => (
              <option key={session} value={session} className="bg-gray-800 text-white">{session}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-yellow-400 mb-2">Pattern</label>
          <select
            value={selectedPattern}
            onChange={(e) => setSelectedPattern(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-yellow-500/30 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-400"
          >
            <option value="" className="bg-gray-800 text-white">All Patterns</option>
            {patternTypes.map((pattern) => (
              <option key={pattern} value={pattern} className="bg-gray-800 text-white">{pattern}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={onClearFilters}
            className="w-full px-4 py-2 bg-gradient-to-r from-yellow-600 to-amber-700 text-black rounded-lg hover:from-yellow-500 hover:to-amber-600 transition-all duration-200 font-semibold shadow-lg"
          >
            Clear Filters
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-yellow-400 mb-2">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-yellow-500/30 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-400"
          >
            <option value="timestamp" className="bg-gray-800 text-white">Recently Added</option>
            <option value="date" className="bg-gray-800 text-white">Date</option>
            <option value="pips" className="bg-gray-800 text-white">Pips</option>
            <option value="patternType" className="bg-gray-800 text-white">Pattern</option>
            <option value="session" className="bg-gray-800 text-white">Session</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-yellow-400 mb-2">Direction</label>
          <select
            value={sortDir}
            onChange={(e) => setSortDir(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-yellow-500/30 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-400"
          >
            <option value="desc" className="bg-gray-800 text-white">Descending</option>
            <option value="asc" className="bg-gray-800 text-white">Ascending</option>
          </select>
        </div>
      </div>
    </div>
  );
}


