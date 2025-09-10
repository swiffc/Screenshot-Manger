import React from 'react';

export default function AuthModal({
  isOpen,
  authEmail,
  setAuthEmail,
  magicSent,
  onClose,
  onSendLink,
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl w-full max-w-sm sm:max-w-md border border-yellow-500/30">
        <div className="p-4 sm:p-6 border-b border-yellow-500/30">
          <h2 className="text-lg sm:text-xl font-bold text-white">Sign in</h2>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">Enter your email to receive a magic link</p>
        </div>
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          <div>
            <label className="block text-sm font-medium text-yellow-400 mb-2">Email</label>
            <input
              type="email"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-yellow-500/30 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-400 text-sm"
              placeholder="you@example.com"
            />
            {magicSent && <p className="text-xs text-yellow-400 mt-1">Check your inbox for the magic link.</p>}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 p-4 sm:p-6 border-t border-yellow-500/30">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-gray-800 border border-yellow-500/30 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
          >
            Close
          </button>
          <button
            onClick={onSendLink}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-black rounded-lg hover:from-yellow-400 hover:to-amber-500 transition-all duration-200 font-semibold text-sm sm:text-base"
          >
            Send Link
          </button>
        </div>
      </div>
    </div>
  );
}


