import React from 'react';
import { Upload } from 'lucide-react';

export default function CaseStudyModal({
  isOpen,
  onClose,
  onSubmit,
  sessions,
  patternTypes,
  formData,
  setFormData,
  fileInputRef,
  handleImageUpload,
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl w-full max-w-sm sm:max-w-2xl border border-yellow-500/30">
        <div className="p-4 sm:p-6 border-b border-yellow-500/30">
          <h2 className="text-lg sm:text-xl font-bold text-white">Add Case Study Lesson</h2>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">Create a lesson with one image and key notes</p>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-yellow-500/30 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-2">Session</label>
              <select
                value={formData.session}
                onChange={(e) => setFormData(prev => ({ ...prev, session: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-yellow-500/30 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-400"
              >
                {sessions.map(s => (<option key={s} value={s} className="bg-gray-800 text-white">{s}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-2">Pattern Type</label>
              <select
                value={formData.patternType}
                onChange={(e) => setFormData(prev => ({ ...prev, patternType: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-yellow-500/30 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-400"
              >
                {patternTypes.map(p => (<option key={p} value={p} className="bg-gray-800 text-white">{p}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-2">Tags (comma separated)</label>
              <input
                type="text"
                placeholder="e.g., HOD sweep, Type1"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-yellow-500/30 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-yellow-400 mb-2">Image</label>
            <div className="border-2 border-dashed border-yellow-500/30 bg-gray-800/50 rounded-lg p-6 text-center hover:border-yellow-400/50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              {formData.imageUrl ? (
                <img src={formData.imageUrl} alt="Preview" className="w-full h-48 object-cover rounded-lg mx-auto" loading="lazy" />
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 text-yellow-400 mx-auto" />
                  <p className="text-sm text-gray-300">Upload lesson image</p>
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} className="hidden" />
          </div>

          <div>
            <label className="block text-sm font-medium text-yellow-400 mb-2">Notes</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-800 border border-yellow-500/30 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-400"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-yellow-500/30">
            <button onClick={onClose} className="px-4 py-2 bg-gray-800 border border-yellow-500/30 text-white rounded-lg hover:bg-gray-700 text-sm">Cancel</button>
            <button onClick={onSubmit} className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-black rounded-lg hover:from-yellow-400 hover:to-amber-500 text-sm font-semibold">Save Lesson</button>
          </div>
        </div>
      </div>
    </div>
  );
}


