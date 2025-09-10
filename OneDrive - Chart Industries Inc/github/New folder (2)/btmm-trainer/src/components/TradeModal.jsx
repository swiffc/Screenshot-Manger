import React from 'react';
import { Upload, TrendingUp } from 'lucide-react';

export default function TradeModal({
  isOpen,
  onClose,
  onSubmit,
  editingTrade,
  sessions,
  patternTypes,
  pairs,
  formData,
  setFormData,
  fileInputRef,
  handleImageUpload,
  confluenceOptions,
  handleConfluenceChange,
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50" role="dialog" aria-modal="true" aria-labelledby="trade-modal-title">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl w-full max-w-sm sm:max-w-2xl lg:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-yellow-500/30">
        <div className="p-4 sm:p-6 border-b border-yellow-500/30">
          <h2 id="trade-modal-title" className="text-lg sm:text-xl font-bold text-white">
            {editingTrade ? 'Edit Winning Trade' : 'Add Winning Trade'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">Building your pattern recognition library with proven setups</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-2">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-yellow-500/30 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-2">Session</label>
              <select
                value={formData.session}
                onChange={(e) => setFormData(prev => ({ ...prev, session: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-yellow-500/30 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-400"
              >
                {sessions.map(session => (
                  <option key={session} value={session} className="bg-gray-800 text-white">{session}</option>
                ))}
              </select>
            </div>

            {/* Bias-first fields */}
            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-2">Bias Level (1-3)</label>
              <select
                value={formData.biasLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, biasLevel: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-yellow-500/30 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-400"
              >
                {['1','2','3'].map(l => (<option key={l} value={l} className="bg-gray-800 text-white">{l}</option>))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-yellow-400 mb-2">EMA Crossovers (check observed)</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {['5/13','13/50','50/200','200/800','50/800'].map((opt) => (
                  <label key={opt} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={!!formData.emaCrosses?.[opt]}
                      onChange={(e) => setFormData(prev => ({ ...prev, emaCrosses: { ...(prev.emaCrosses||{}), [opt]: e.target.checked } }))}
                      className="rounded border-yellow-500/30 text-yellow-500 focus:ring-yellow-500 bg-gray-700"
                    />
                    <span className="text-gray-300">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-2">ADR(5) pips</label>
              <input
                type="text"
                placeholder="e.g., 90"
                value={formData.adr5}
                onChange={(e) => setFormData(prev => ({ ...prev, adr5: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-yellow-500/30 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-2">Today Range pips</label>
              <input
                type="text"
                placeholder="e.g., 135"
                value={formData.todayRange}
                onChange={(e) => setFormData(prev => ({ ...prev, todayRange: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-yellow-500/30 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-2">Pattern Type</label>
              <select
                value={formData.patternType}
                onChange={(e) => setFormData(prev => ({ ...prev, patternType: e.target.value, confluences: {} }))}
                className="w-full px-3 py-2 bg-gray-800 border border-yellow-500/30 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-400"
              >
                {patternTypes.map(pattern => (
                  <option key={pattern} value={pattern} className="bg-gray-800 text-white">{pattern}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-2">Currency Pair</label>
              <select
                value={formData.pair}
                onChange={(e) => setFormData(prev => ({ ...prev, pair: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-yellow-500/30 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-400"
              >
                {pairs.map(pair => (
                  <option key={pair} value={pair} className="bg-gray-800 text-white">{pair}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-2">Profit (Pips)</label>
              <input
                type="text"
                placeholder="e.g., +45, +67.5"
                value={formData.pips}
                onChange={(e) => setFormData(prev => ({ ...prev, pips: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-yellow-500/30 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-400"
                required
              />
              <p className="text-xs text-yellow-400 mt-1">Winners only - record your profit</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-yellow-400 mb-2">Chart Screenshot</label>
            <div className="space-y-4">
              <div
                className="relative border-2 border-dashed border-yellow-500/30 bg-gray-800/50 rounded-lg p-6 text-center hover:border-yellow-400/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {formData.imageUrl ? (
                  <div className="space-y-2">
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-48 object-cover rounded-lg mx-auto" loading="lazy" />
                    <p className="text-sm text-gray-300">Click to upload winning trade screenshot or paste (Ctrl/Cmd + V)</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 text-yellow-400 mx-auto" />
                    <p className="text-sm text-gray-300">Upload winning trade screenshot or paste (Ctrl/Cmd + V)</p>
                  </div>
                )}
                {/* Right-click paste support: a transparent contenteditable overlay */}
                <div
                  contentEditable
                  role="textbox"
                  aria-label="Paste image here"
                  className="absolute inset-0 opacity-0 outline-none"
                  suppressContentEditableWarning={true}
                />
              </div>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                capture="environment"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-yellow-400 mb-4">
              Pattern Confluences 
              <span className="text-yellow-400 font-medium ml-2">✓ Proven Winner</span>
            </label>
            <div className="max-h-64 sm:max-h-80 lg:max-h-96 overflow-y-auto space-y-3 sm:space-y-4 pr-1 sm:pr-2">
              {Object.entries(confluenceOptions[formData.patternType] || {}).map(([category, options]) => (
                <div key={category} className="bg-gray-800 border border-yellow-500/30 p-3 sm:p-4 rounded-lg">
                  <h4 className="font-medium text-white mb-2 sm:mb-3 text-sm sm:text-base">{category}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2">
                    {options.map((option) => (
                      <div key={option} className="flex items-start space-x-2 text-xs sm:text-sm">
                        <input
                          type="checkbox"
                          id={`confluence-${option.replace(/[^a-zA-Z0-9]/g, '-')}`}
                          checked={formData.confluences[option] || false}
                          onChange={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleConfluenceChange(option, e.target.checked);
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          className="rounded border-yellow-500/30 text-yellow-500 focus:ring-yellow-500 bg-gray-700 mt-0.5 flex-shrink-0 cursor-pointer"
                        />
                        <label 
                          htmlFor={`confluence-${option.replace(/[^a-zA-Z0-9]/g, '-')}`}
                          className="text-gray-300 leading-tight cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {Object.values(formData.confluences).some(Boolean) && (
            <div className="bg-gray-800 border border-yellow-500/30 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-400 mb-2 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Winning Pattern Analysis
              </h4>
              <p className="text-yellow-400 text-sm leading-relaxed">
                {/* Description is generated in parent and previewed there if needed */}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-yellow-400 mb-2">Key Observations & Learning Notes</label>
            <textarea
              rows={3}
              placeholder="What made this pattern stand out? Key visual cues that confirmed the setup..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-800 border border-yellow-500/30 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-400"
            />
            <p className="text-xs text-gray-300 mt-1">Document what made this a winning setup for future pattern recognition</p>
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6 border-t border-yellow-500/30">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-gray-800 border border-yellow-500/30 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-black rounded-lg hover:from-yellow-400 hover:to-amber-500 transition-all duration-200 flex items-center justify-center space-x-2 font-semibold text-sm sm:text-base"
            >
              <TrendingUp className="h-4 w-4" />
              <span>{editingTrade ? 'Update Winner' : 'Save Winner'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


