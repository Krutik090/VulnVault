// =======================================================================
// FILE: src/components/ImageViewerModal.jsx (NEW FILE)
// PURPOSE: A modal specifically for displaying a larger version of an image.
// =======================================================================
import { useEffect } from 'react';

const ImageViewerModal = ({ imageUrl, onClose }) => {
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!imageUrl) return null;

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" 
        onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
        <img src={imageUrl} alt="Enlarged vulnerability evidence" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
        <button 
            onClick={onClose} 
            className="absolute -top-4 -right-4 bg-white text-gray-800 rounded-full p-2 shadow-lg hover:bg-gray-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
    </div>
  );
};

export default ImageViewerModal;