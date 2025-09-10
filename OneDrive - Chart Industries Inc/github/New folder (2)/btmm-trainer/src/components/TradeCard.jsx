import React, { useState, useMemo } from 'react';
import { Calendar, Clock, TrendingUp, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import ImageLightbox from './ImageLightbox.jsx';

function getPatternColor(pattern) {
  switch (pattern) {
    case 'Type 1': return 'bg-purple-100 text-purple-800';
    case 'Type 2': return 'bg-blue-100 text-blue-800';
    case 'Type 3': return 'bg-green-100 text-green-800';
    case 'Type 4': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function createThumbnailUrl(imageUrl) {
  // Use the same image for now; could be replaced by stored thumbnail URL
  return imageUrl;
}

export default function TradeCard({ trade, isExpanded, onToggleExpand, onEdit, onDelete }) {
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const thumbUrl = useMemo(() => createThumbnailUrl(trade.imageUrl), [trade.imageUrl]);
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl overflow-hidden border border-yellow-500/30">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPatternColor(trade.patternType)}`}>
              {trade.patternType}
            </span>
            <span className="text-lg font-bold text-white">{trade.pair}</span>
            <span className="text-sm text-gray-300">{trade.session} Session</span>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-500/20 text-yellow-400 flex items-center space-x-1 border border-yellow-500/30">
              <TrendingUp className="h-3 w-3" />
              <span>Winner {trade.pips && `(${trade.pips} pips)`}</span>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onToggleExpand}
              className="p-2 text-gray-300 hover:text-yellow-400 transition-colors"
            >
              {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <button
              onClick={onEdit}
              className="p-2 text-gray-300 hover:text-yellow-400 transition-colors"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-gray-300 hover:text-yellow-400 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-sm text-yellow-400 mb-4">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{trade.date}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{new Date(trade.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>

        <div className="space-y-6">
          {/* Legacy single image support */}
          {trade.imageUrl && !trade.images?.length && (
            <div className="space-y-2">
              <h4 className="font-medium text-white">Chart Screenshot</h4>
              <img
                src={thumbUrl}
                alt="Trade screenshot"
                className="w-full h-64 object-cover rounded-lg border cursor-zoom-in"
                loading="lazy"
                onClick={() => setLightboxUrl(trade.imageUrl)}
              />
            </div>
          )}
          
          {/* Multiple timeframe images */}
          {trade.images?.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-white">Multi-Timeframe Chart Analysis</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {trade.images.map((image) => (
                  <div key={image.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-yellow-400">{image.timeframe}</span>
                    </div>
                    <img
                      src={image.url}
                      alt={`${image.timeframe} chart analysis`}
                      className="w-full h-48 object-cover rounded-lg border border-yellow-500/30 cursor-zoom-in hover:border-yellow-400 transition-colors"
                      loading="lazy"
                      onClick={() => setLightboxUrl(image.url)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-white mb-2">Analysis</h4>
              <p className="text-gray-300 leading-relaxed">{trade.description}</p>
            </div>

            {isExpanded && (
              <div className="space-y-4 pt-4 border-t">
                <div>
                  <h4 className="font-medium text-white mb-2">Selected Confluences</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(trade.confluences).filter(([_, selected]) => selected).map(([confluence, _]) => (
                      <span key={confluence} className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                        {confluence}
                      </span>
                    ))}
                  </div>
                </div>

                {trade.notes && (
                  <div>
                    <h4 className="font-medium text-white mb-2">Notes</h4>
                    <p className="text-gray-300">{trade.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <ImageLightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
    </div>
  );
}


