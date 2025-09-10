import React from 'react';
import { BarChart3, Upload, Download, Plus } from 'lucide-react';

export default function HeaderBar({
  isSupabaseConnected,
  onOpenSupabase,
  user,
  onSignOut,
  onOpenAuth,
  onExport,
  onOpenImport,
  importInputRef,
  onAddNew,
  onImportFileChange,
  onAddLesson,
}) {
  return (
    <div className="bg-gradient-to-br from-black via-yellow-900/20 to-black text-white relative overflow-hidden border-b border-yellow-500/30">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/10 to-amber-500/10"></div>
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255, 215, 0, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255, 193, 7, 0.1) 0%, transparent 50%)' }}></div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-12 relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-6 w-full sm:w-auto">
            <div className="bg-gradient-to-br from-yellow-500 to-amber-600 p-3 sm:p-4 rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300 border border-yellow-400/30 flex-shrink-0">
              <BarChart3 className="h-8 w-8 sm:h-10 sm:w-10 text-black" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent drop-shadow-lg leading-tight">
                BTMM Pattern Recognition Trainer
              </h1>
              <p className="text-gray-200 mt-1 sm:mt-2 text-sm sm:text-base lg:text-lg font-medium">Building institutional-level trading expertise through proven setups</p>
              <div className="flex items-center space-x-2 sm:space-x-4 mt-2 sm:mt-3">
                <div className="flex items-center space-x-2 text-yellow-400">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/50"></div>
                  <span className="text-xs sm:text-sm font-medium text-white">Winners Only - Record your profit</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            <button
              onClick={onOpenSupabase}
              className="px-3 sm:px-4 py-2 sm:py-2.5 bg-black/70 backdrop-blur-sm border border-yellow-500/30 text-white rounded-xl hover:bg-yellow-900/20 hover:border-yellow-400/50 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-black/50 text-sm sm:text-base"
            >
              <div className={`w-2 h-2 rounded-full ${isSupabaseConnected ? 'bg-yellow-400 shadow-lg shadow-yellow-400/50' : 'bg-gray-400'}`}></div>
              <span>{isSupabaseConnected ? 'Connected' : 'Connect'}</span>
            </button>
            {isSupabaseConnected && (
              user ? (
                <button
                  onClick={onSignOut}
                  className="px-3 sm:px-4 py-2 sm:py-2.5 bg-black/70 backdrop-blur-sm border border-yellow-500/30 text-white rounded-xl hover:bg-yellow-900/20 hover:border-yellow-400/50 transition-all duration-200 shadow-lg shadow-black/50 text-sm sm:text-base"
                >
                  Sign out
                </button>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="px-3 sm:px-4 py-2 sm:py-2.5 bg-black/70 backdrop-blur-sm border border-yellow-500/30 text-white rounded-xl hover:bg-yellow-900/20 hover:border-yellow-400/50 transition-all duration-200 shadow-lg shadow-black/50 text-sm sm:text-base"
                >
                  Sign in
                </button>
              )
            )}
            <button
              onClick={onExport}
              className="px-3 sm:px-4 py-2 sm:py-2.5 bg-black/70 backdrop-blur-sm border border-yellow-500/30 text-white rounded-xl hover:bg-yellow-900/20 hover:border-yellow-400/50 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-black/50 text-sm sm:text-base"
              title="Export JSON"
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={onOpenImport}
              className="px-3 sm:px-4 py-2 sm:py-2.5 bg-black/70 backdrop-blur-sm border border-yellow-500/30 text-white rounded-xl hover:bg-yellow-900/20 hover:border-yellow-400/50 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-black/50 text-sm sm:text-base"
              title="Import JSON"
            >
              <Upload className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />
              <span className="hidden sm:inline">Import</span>
            </button>
            <input type="file" accept="application/json" ref={importInputRef} onChange={onImportFileChange} className="hidden" />
            <button aria-label="Add winning trade"
              onClick={onAddNew}
              className="bg-gradient-to-r from-yellow-500 to-amber-600 text-black px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:from-yellow-400 hover:to-amber-500 transition-all duration-300 flex items-center justify-center space-x-2 shadow-2xl transform hover:scale-105 hover:shadow-yellow-500/25 border border-yellow-400/50 font-bold text-sm sm:text-base"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="font-semibold">Add Winning Trade</span>
            </button>
            <button aria-label="Add lesson"
              onClick={onAddLesson}
              className="px-4 sm:px-5 py-2 sm:py-2.5 bg-black/70 backdrop-blur-sm border border-yellow-500/30 text-white rounded-xl hover:bg-yellow-900/20 hover:border-yellow-400/50 transition-all duration-200 shadow-lg shadow-black/50 text-sm sm:text-base"
            >
              Add Lesson
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


