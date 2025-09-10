import React from 'react';

export default function ImageLightbox({ url, onClose }) {
  if (!url) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-2 sm:p-4" onClick={onClose}>
      <img src={url} alt="Full size" className="max-w-full max-h-full rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
      <button
        onClick={onClose}
        className="absolute top-4 right-4 bg-white/10 text-white px-3 py-1 rounded hover:bg-white/20"
        aria-label="Close image"
      >
        Close
      </button>
    </div>
  );
}



