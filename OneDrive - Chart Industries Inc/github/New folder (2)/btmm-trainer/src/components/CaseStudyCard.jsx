import React, { useState } from 'react';
import ImageLightbox from './ImageLightbox.jsx';

export default function CaseStudyCard({ lesson, onDelete, onEdit }) {
  const [lightbox, setLightbox] = useState(null);
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl overflow-hidden border border-yellow-500/30">
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-white truncate">{lesson.title}</h3>
          <div className="text-xs text-yellow-300">{lesson.session} • {lesson.patternType}</div>
        </div>
        {lesson.imageUrl && (
          <img src={lesson.imageUrl} alt="Lesson" onClick={() => setLightbox(lesson.imageUrl)} className="w-full h-48 object-cover rounded-lg border cursor-zoom-in mb-3" />
        )}
        {lesson.tags && (
          <div className="flex flex-wrap gap-2 mb-3">
            {lesson.tags.split(',').map((t) => (
              <span key={t} className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 text-xs">{t.trim()}</span>
            ))}
          </div>
        )}
        {lesson.notes && <p className="text-gray-300 text-sm leading-relaxed">{lesson.notes}</p>}
      </div>
      <ImageLightbox url={lightbox} onClose={() => setLightbox(null)} />
    </div>
  );
}


